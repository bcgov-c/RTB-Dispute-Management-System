/**
 * Manages the participantsChannel.  Exports a singleton instance of {@link core.components.participant.ParticipantsManagerClass|ParticipantsManagerClass}.
 * @namespace core.components.participant.ParticipantManager
 * @memberof core.components.participant
 */

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import ClaimGroupParticipantModel from './ClaimGroupParticipant_model';
import ParticipantCollection from './Participant_collection';
import ParticipantModel from './Participant_model';
import IntakeAriDataParser from '../custom-data-objs/ari-c/IntakeAriDataParser';
import StringSimilarity from 'string-similarity';
import { generalErrorFactory } from '../api/ApiLayer';

const api_load_group_participants_name = 'parties/disputeclaimgroupparticipants';
const api_load_participants_name = 'parties/disputeparticipants';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const claimGroupsChannel = Radio.channel('claimGroups');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const filesChannel = Radio.channel('files');
const claimsChannel = Radio.channel('claims');
const paymentsChannel = Radio.channel('payments');
const modalChannel = Radio.channel('modals');
const documentsChannel = Radio.channel('documents');

const PAST_TENANT_DISPUTE_ADDRESS_MATCH_TYPE = 1;
const PAST_TENANT_LANDLORD_ADDRESS_MATCH_TYPE = 2;
const CURRENT_TENANT_LANDLORD_ADDRESS_MATCH_TYPE = 3;

const ParticipantsManager = Marionette.Object.extend({
  /**
   * @class core.components.participant.ParticipantsManagerClass
   * @augments Marionette.Object
   */

  initialize() {
    this.cached_data = {};
    this.initializeInternalModels();
  },

  initializeInternalModels() {
    this.applicants = new ParticipantCollection();
    this.respondents = new ParticipantCollection();
    this.removed = new ParticipantCollection();
    this.claimGroupParticipants = new (Backbone.Collection.extend({
      model: ClaimGroupParticipantModel
    }))();
  },

  channelName: 'participants',

  radioRequests: {
    'get:primaryApplicant': 'getPrimaryApplicant',
    'get:primaryApplicant:id': 'getPrimaryApplicantId',

    'check:id': 'doesParticipantIdExist',
    'check:participant:delete:modal': 'checkForSavedApplicantDataAndShowWarningModal',
    'get:dups:with:applicants': 'getParticipantApplicantDups',
    'get:address:similarity': 'getAddressSimilarity',

    'set:primaryApplicant': 'setPrimaryApplicantTo',
    'save:primaryApplicant': 'makePrimaryApplicantChange',
    'save:primaryApplicant:intakeData': 'updateAndSavePrimaryApplicantDependentData',

    'get:participant:name': 'getParticipantName',

    'get:removed': 'getRemoved',
    'get:all:participants': 'getAllParticipants',
    'get:applicants': 'getApplicants',
    'get:respondents': 'getRespondents',
    'get:applicants:claimGroupParticipants': 'getApplicantClaimGroupParticipants',
    'get:participant': 'getParticipant',
    'get:participant:by:accesscode': 'getParticipantByAccessCode',

    'create:applicant': 'createApplicant',
    'create:respondent': 'createRespondent',

    'add:participant': 'addApiParticipant',

    'remove:participant': 'removeParticipant',
    'delete:participant': 'deleteParticipant',

    'is:applicant': 'isApplicant',
    'is:respondent': 'isRespondent',
    'is:primary': 'isPrimary',
    'is:landlord': 'isLandlord',
    'is:tenant': 'isTenant',

    'load': 'loadFullParticipants',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',

    'get:dispute:units': 'getUnitsFromDispute',

    'clear': 'initializeInternalModels',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current participant data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this ParticipantManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.applicants = cache_data.applicants;
    this.respondents = cache_data.respondents;
    this.removed = cache_data.removed;
    this.claimGroupParticipants = cache_data.claimGroupParticipants;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      applicants: this.applicants,
      respondents: this.respondents,
      removed: this.removed,
      claimGroupParticipants: this.claimGroupParticipants
    };
  },

  loadClaimGroupParticipants(dispute_guid, options={}) {
    if (!dispute_guid) {
      console.log("[Error] No dispute guid provided, can't get claim dispute participants");
      return Promise.reject();
    }
    return new Promise((res,rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_group_participants_name}/${dispute_guid}`
      }).then(response => {
        if (!response || !response.length) return res([]);
        // Parse disputeParticipants response
        const claimGroup = response[0];
        if (!options.no_cache) {
          // Prime the claim group info retrieved from the system
          claimGroupsChannel.request('load', claimGroup.claimGroupId);
        }
        res(claimGroup.participants);
      }, rej);
    });
  },

  loadDisputeParticipants(dispute_guid) {
    if (!dispute_guid) {
      console.log("[Error] No dispute guid provided, can't get dispute participants");
      return Promise.reject();
    }
    return new Promise((res, rej) => (
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_participants_name}/${dispute_guid}`
      }).then(res, rej)
    ));
  },

  loadFullParticipants(dispute_guid, options={}) {
    if (!dispute_guid) {
      console.log("[Error] No dispute guid provided, can't get claim dispute participants");
      return Promise.reject();
    }


    const removed = new ParticipantCollection();
    const applicants = new ParticipantCollection();
    const respondents = new ParticipantCollection();
    if (!options.no_cache) {
      this.removed = removed;
      this.applicants = applicants;
      this.respondents = respondents;
    }

    const parseLoadedParticipantsFn = (loadedCgParticipants=[], loadedParticipants=[]) => {
      if (!options.no_cache) {
        this.claimGroupParticipants.add(loadedCgParticipants);
      }
      const loadedParticipantsLookup = {};
      loadedParticipants.forEach(p => loadedParticipantsLookup[p.participant_id] = p);

      const participants = new ParticipantCollection(
        (loadedCgParticipants || []).map(p => {
          const matchingParticipant = loadedParticipantsLookup[p.participant_id];
          if (!matchingParticipant) return null;

          return Object.assign({
            group_participant_role: p.group_participant_role ? p.group_participant_role : null,
            group_participant_id: p.group_participant_id ? p.group_participant_id : null,
            group_primary_contact_id: p.group_primary_contact_id ? p.group_primary_contact_id : null
          }, matchingParticipant);
        }).filter(p => p)
      );

      this.util_moveModelsTo(participants.filter(p => p.isRemoved()), removed);
      this.util_moveModelsTo(participants.where({ group_participant_role: configChannel.request('get', 'CLAIM_GROUP_ROLE_APPLICANT') }), applicants);
      this.util_moveModelsTo(participants.where({ group_participant_role: configChannel.request('get', 'CLAIM_GROUP_ROLE_RESPONDENT') }), respondents);
    };

    return new Promise((res, rej) => {
      Promise.all([this.loadClaimGroupParticipants(dispute_guid), this.loadDisputeParticipants(dispute_guid)])
        .then(promiseValues => {
          const loadedParticipants = promiseValues && promiseValues.length > 1 ? promiseValues[1] : {};
          const loadedCgParticipants = promiseValues && promiseValues.length ? promiseValues[0] : {};
          console.log(loadedParticipants, loadedCgParticipants);
          parseLoadedParticipantsFn(loadedCgParticipants, loadedParticipants);
          res([loadedCgParticipants, applicants, respondents, removed]);
        }, rej);
    });
  },

  loadFromDisputeAccessResponse(response_data_claim_groups) {
    response_data_claim_groups = response_data_claim_groups || {};
    if (!response_data_claim_groups.length || !response_data_claim_groups[0]) {
      return;
    }

    _.each(response_data_claim_groups[0].participants, function(participant_data) {
      this.claimGroupParticipants.add(participant_data);
      const participantModel = new ParticipantModel(participant_data);

      // For external loads, put the "hint" values into the main values
      participantModel.mergeHintsWithFields();

      // Make sure to add fields to the API stored field
      participantModel.mergeLocalAndApiData();

      if (participantModel.isRemoved()) {
        this.removed.add(participantModel);
      } else if (participant_data.group_participant_role === configChannel.request('get', 'CLAIM_GROUP_ROLE_APPLICANT')) {
        this.applicants.add(participantModel);
      } else if (participant_data.group_participant_role === configChannel.request('get', 'CLAIM_GROUP_ROLE_RESPONDENT')) {
        this.respondents.add(participantModel);
      }
    }, this);
  },

  doesParticipantIdExist(participant_id) {
    return participant_id &&
      (this.applicants.findWhere({ participant_id }) || this.respondents.findWhere({ participant_id }));
  },

  // Creates required API connections with the given participant Model
  // Automatically sets primary contact on applicant, if exists
  // Unless options = { no_tou: true }
  createApplicant(participantModel, options) {
    options = options || {};
    const primaryApplicant = this.getPrimaryApplicant();
    if (primaryApplicant) {
      participantModel.set(_.extend({
        group_primary_contact_id: primaryApplicant.get('participant_id')
      },  options.no_tou ? {} : {
        accepted_tou: primaryApplicant.get('accepted_tou'),
        accepted_tou_date: Moment()
      }), {silent: true});
    }
    return this._createParticipantAndLinkToMainClaimGroup(participantModel, false);
  },
  createRespondent(participantModel) {
    return this._createParticipantAndLinkToMainClaimGroup(participantModel, true);
  },

  _createParticipantAndLinkToMainClaimGroup(participantModel, isRespondent) {
    if (isRespondent === null || typeof isRespondent === 'undefined') {
      console.log(`[Warning] Can't determine if applicant or respondent.  Creating applicant...`);
    }

    const existing_group_primary_contact_id = participantModel.get('group_primary_contact_id');
    const dfd = $.Deferred();

    this._createParticipant(participantModel).done(response => {
      this._createClaimGroupParticipant({
        participant_id: response.participant_id,
        group_participant_role: isRespondent ? configChannel.request('get', 'CLAIM_GROUP_ROLE_RESPONDENT') :
            configChannel.request('get', 'CLAIM_GROUP_ROLE_APPLICANT'),
        group_primary_contact_id: existing_group_primary_contact_id ? existing_group_primary_contact_id : response.participant_id
        // NOTE: If a group contact was set on the participant model use that, otherwise use itself
      })
      .done(cgp_response => {
        participantModel.set({
          group_primary_contact_id: existing_group_primary_contact_id ? existing_group_primary_contact_id : response.participant_id,
          group_participant_id: cgp_response.group_participant_id
        });
        dfd.resolve(cgp_response);
      })
      .fail(dfd.reject);

    })
    .fail(dfd.reject);

    return dfd.promise();
  },

  _createParticipant(participantModel) {
    return participantModel.save();
  },

  _createClaimGroupParticipant(claim_group_participant_data) {
    const dfd = $.Deferred(),
      self = this;
    const claimGroupParticipant = new ClaimGroupParticipantModel(claim_group_participant_data);
    claimGroupParticipant.save()
    .done(function(response) {
      self.claimGroupParticipants.add(claimGroupParticipant);
      dfd.resolve(response);
    }).fail(dfd.reject);
    
    return dfd.promise();
  },

  isApplicant(participant_model) {
    return participant_model.get('group_participant_role') === configChannel.request('get', 'CLAIM_GROUP_ROLE_APPLICANT') ||
        !!this.applicants.findWhere({ participant_id: participant_model.get('participant_id') });
  },

  isRespondent(participant_model) {
    return participant_model.get('group_participant_role') === configChannel.request('get', 'CLAIM_GROUP_ROLE_RESPONDENT') ||
        !!this.respondents.findWhere({ participant_id: participant_model.get('participant_id') });
  },

  isPrimary(participant_model) {
    return this.isApplicant(participant_model) && participant_model.id === this.getPrimaryApplicantId();
  },

  isLandlord(participant_model) {
    const dispute = disputeChannel.request('get', 'dispute');
    return this.isApplicant(participant_model) ? dispute.isLandlord() : !dispute.isLandlord();
  },

  isTenant(participant_model) {
    const dispute = disputeChannel.request('get', 'dispute');
    return this.isApplicant(participant_model) ? dispute.isTenant() : !dispute.isTenant();
  },

  // Primary applicant is derived by checked all API applicants and seeing that their group_primary_contact_id,
  // set during loading from its linked ClaimGroupParticipant, is equal to the same id.
  // Then we check that id is present in the current applicants
  getPrimaryApplicant() {
    const applicants = this.getApplicants().filter(function(applicant) { return !applicant.isNew(); });
    if (!applicants || applicants.length === 0) {
      console.log(`[Warning] Can't get primary applicant, no applicants created`);
      return null;
    }

    const first_contact_id = applicants[0].get('group_primary_contact_id');

    if (_.all(applicants, function(applicant) { return applicant.get('group_primary_contact_id') && applicant.get('group_primary_contact_id') === first_contact_id; })) {
      const primaryApplicants = _.filter(applicants, function(applicant) { return applicant.get('participant_id') === first_contact_id; }),
        primaryApplicant = primaryApplicants && primaryApplicants.length ? primaryApplicants[0] : null;
      if (!primaryApplicant) {
        console.log(`[Warning] Primary applicant has been chosen, but does not exist in applicants.`);
        return null;
      }
      return primaryApplicant;
    }
  },

  getPrimaryApplicantId() {
    const primaryApplicant = this.getPrimaryApplicant();
    return primaryApplicant ? primaryApplicant.id : null;
  },

  getParticipantName(participant_id) {
    const participant = this.getParticipant(participant_id);
    return participant ? participant.getDisplayName() : null;
  },

  _getParticipantModels(options) {
    options = options || {};

    const applicants = this.getApplicants();
    const respondents = this.getRespondents();
    const removed = this.getRemoved();
    return _.union(
      applicants ? applicants.models : [],
      respondents ? respondents.models : [],
      options.include_removed && removed ? removed.models : []);
  },

  getParticipant(participantId) {
    const participants = this._getParticipantModels({ include_removed: true });
    const matchingParticipants = _.filter(participants, function(p) { return p.get('participant_id') === participantId; });
    if (_.isEmpty(matchingParticipants)) {
      console.log(`[Warning] No matching participant found for id=${participantId}`);
      return null;
    }
    return matchingParticipants[0];
  },

  getParticipantByAccessCode(accessCode, options) {
    options = options || {};
    const participants = this._getParticipantModels(_.extend({ include_removed: true }, options));
    const matchingParticipants = _.filter(participants, function(p) { return p.get('access_code') === accessCode; });
    if (_.isEmpty(matchingParticipants)) {
      return null;
    }
    return matchingParticipants[0];
  },

  getRemoved() {
    return this.removed;
  },

  getAllParticipants(options) {
    return this._getParticipantModels(_.extend({ include_removed: true }, options || {}));
  },

  getApplicants() {
    if (this.main_claim_group_id === null) {
      console.log(`[Warning] No claim group loaded`);
    }
    return this.applicants;
  },

  getRespondents() {
    if (this.main_claim_group_id === null) {
      console.log(`[Warning] No claim group loaded`);
    }
    return this.respondents;
  },


  getApplicantClaimGroupParticipants() {
    return this.claimGroupParticipants.filter(function(claimGroupParticipant) {
      return this.applicants.findWhere({ participant_id: claimGroupParticipant.get('participant_id') });
    }, this);
  },

  makePrimaryApplicantChange(primaryApplicantModel) {
    this.setPrimaryApplicantTo(primaryApplicantModel);

    const all_xhr = [],
      claim_group_participants = this.getApplicantClaimGroupParticipants(),
      applicants = this.getApplicants();

    _.each(_.union(claim_group_participants, applicants.models), function(model) {
      const changes = model.getApiChangesOnly();
      if (changes && !_.isEmpty(changes)) {
        all_xhr.push( _.bind(model.save, model, changes) );
      }
    });

    const dfd = $.Deferred();
    Promise.all(_.map(all_xhr, function(xhr) { return xhr(); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  updateAndSavePrimaryApplicantDependentData() {
    return new Promise((resolve, reject) => {
      const primaryApplicant = this.getPrimaryApplicant();
        if (!primaryApplicant || !primaryApplicant.id) resolve();
        // Returns the xhr request for changing the value - if applicable
        const getChangeXhr = (model, field='description_by') => (
          model && !this.doesParticipantIdExist(model.get(field)) ? (() => model.save({ [field]: primaryApplicant.id })) : null);
        
        const filePackagePromise = () => (new Promise((res, rej) => {
          const filePackages = filesChannel.request('get:filepackages');
          const allXhr = [];
          if (!filePackages) return res();
          filePackages.forEach(filePackage => {
            const packageApplicant = filePackage.getPackageCreatorParticipantModel();
            if (!packageApplicant || !this.doesParticipantIdExist(packageApplicant.id)) {
              filePackage.set({ created_by_id: primaryApplicant.id, created_by_access_code: primaryApplicant.get('access_code') })
              allXhr.push(() => filePackage.save(filePackage.getApiChangesOnly()));
            }
          });
          return Promise.all(allXhr.filter(xhr => xhr).map(xhr => xhr())).then(res, rej);
        }));

        const claimRemedyPromise = () => new Promise((res, rej) => {
          const claims = claimsChannel.request('get');
          const allXhr = [];
          claims.forEach(claim => {
            const claimDetail = claim.getApplicantsClaimDetail();
            allXhr.push(getChangeXhr(claimDetail));
            (claim.remedies || []).forEach(remedy => {
              (remedy.getRemedyDetails() || []).forEach(remedyDetail => allXhr.push(getChangeXhr(remedyDetail)));
            });
          });
          return Promise.all(allXhr.filter(xhr => xhr).map(xhr => xhr())).then(res, rej);
        });

        const evidenceFilesPromise = () => new Promise((res, rej) => {
          const fileDescriptions = filesChannel.request('get:filedescriptions');
          const files = filesChannel.request('get:files');
          const allXhr = [];
          if (fileDescriptions) fileDescriptions.forEach(fileD => allXhr.push(getChangeXhr(fileD)));
          if (files) files.forEach(file => allXhr.push(getChangeXhr(file, 'added_by')));
          return Promise.all(allXhr.filter(xhr => xhr).map(xhr => xhr())).then(res, rej);
        });

        const feesPromise = () => new Promise((res, rej) => {
          const disputeFees = paymentsChannel.request('get:fees');
          const allXhr = [];
          disputeFees.forEach(fee => allXhr.push(getChangeXhr(fee, 'payor_id')));
          return Promise.all(allXhr.filter(xhr => xhr).map(xhr => xhr())).then(res, rej);
        });

        return Promise.all([
          filePackagePromise(),
          claimRemedyPromise(),
          evidenceFilesPromise(),
          feesPromise(),
        ]).then(resolve, reject);   
      });
  },

  checkForSavedApplicantDataAndShowWarningModal(participant) {
    return new Promise((resolve, reject) => {
      if (!participant || !participant.id || !participant.isApplicant()) return resolve();

      const hasAssociatedFilePackages = filesChannel.request('get:filepackages').findWhere({ created_by_id: participant.id });
      const hasAssociatedFiles = filesChannel.request('get:files').findWhere({ added_by: participant.id });
      const hasAssociatedFileDescriptions = filesChannel.request('get:filedescriptions').findWhere({ description_by: participant.id });
      const hasAssociatedClaims = (() => {
        const claims = claimsChannel.request('get');
        return claims.any(claim => {
          const claimDetail = claim.getApplicantsClaimDetail();
          return claimDetail.get('description_by') === participant.id || 
            claim.remedies.any(remedy => {
              remedy.getRemedyDetails().findWhere({ description_by: participant.id });
            });
        });
      })();
      const hasAssociatedFees = paymentsChannel.request('get:fees').findWhere({ payor_id: participant.id });
      
      const participantData = {
        'File packages': hasAssociatedFilePackages,
        'Files (evidence or forms)': hasAssociatedFiles,
        'File details and descriptions': hasAssociatedFileDescriptions,
        'Issues and issue information': hasAssociatedClaims,
        'Dispute fees': hasAssociatedFees,
      };

      if (Object.values(participantData).some(val => val)) {
        modalChannel.request('show:standard', {
          title: 'Deletion Not Allowed',
          bodyHtml: `<p>
            The applicant you are trying to delete cannot be deleted because it is currently associated with dispute file information.
            The following items were identified to contain data associated to this participant.  If you need to delete this participant, contact the support team.
          </p>
          <ul>
            ${Object.entries(participantData).map(([label, hasAssociated]) => hasAssociated ? `<li>${label}</li>` : '').join('')}
          </ul>`,
          hideCancelButton: true,
          continueButtonText: 'Close',
          onContinueFn(_modalView) { _modalView.close(); },
        });
        return reject();
      }
      return resolve();
    });
  },

  /**
   * @param {IntakeParticipantCollection} intakeParticipants - collection to compare applicants against
   * @returns {Array} - Array of { label, name } objects representing duplicates
   */
  getParticipantApplicantDups(intakeParticipants=[]) {
    const businessNameLabel = 'Business name';
    const contactNameLabel = 'Contact name';
    const fieldsToMatch = [
      { label: 'Daytime phone', name: 'primary_phone' },
      { label: 'Secondary phone', name: 'secondary_phone' },
      { label: 'Fax', name: 'fax' },
      { label: 'Email', name: 'email' }
    ];
    const applicants = this.getApplicants();
    let fieldsWithDups = [];
    const addToDuplicates = (label, value) => {
      // Don't show duplicate label/value pairs as duplicates
      if (!fieldsWithDups.find(item => item.label === label && item.value === value)) fieldsWithDups = [...fieldsWithDups, { label, value }];
    };
    intakeParticipants.forEach((intakeRespondent) => {
      const respondent = intakeRespondent.get('participantModel').clone();
      // This is needed to set the page labels into respondents
      respondent.set(intakeRespondent.getUIDataAttrs(), { silent: true });
      
      applicants.forEach((applicant) => {
        fieldsToMatch.forEach(field => {
          if (!applicant.get(field.name) || !respondent.get(field.name)) return;
          const hasMatchingField = applicant.get(field.name).toUpperCase() === respondent.get(field.name).toUpperCase();
          if (hasMatchingField) addToDuplicates(field.label, respondent.get(field.name));
        });
        const respondentContactName = respondent.getContactName();
        const hasMatchingContactName = (applicant.getContactName() || '').toUpperCase() === (respondentContactName || '').toUpperCase();
        const hasMatchingBusinessName = applicant.isBusiness() && respondent.isBusiness() && applicant.get('bus_name') && (
          applicant.get('bus_name').toUpperCase() === (respondent.get('bus_name') || '').toUpperCase());
        
        if (hasMatchingContactName) addToDuplicates(contactNameLabel, respondentContactName);
        if (hasMatchingBusinessName) addToDuplicates(businessNameLabel, respondent.get('bus_name'));
      });
    });

    return fieldsWithDups;
  },

  getAddressSimilarity(intakeParticipants) {
    let fieldsWithAddressIssues = [];
    const MATCH_PERCENTAGE = configChannel.request('get', 'INTAKE_ADDRESS_STRING_COMPARE_MATCH_PERCENTAGE');
    const applicants = this.getApplicants();
    const dispute = disputeChannel.request('get');

    const addToDuplicates = (label, value) => {
      // Don't show duplicate label/value pairs as duplicates
      if (!fieldsWithAddressIssues.find(item => item.label === label && item.value === value)) fieldsWithAddressIssues = [...fieldsWithAddressIssues, { label, value }];
    };

    intakeParticipants.forEach((intakeRespondent) => {
      const respondent = intakeRespondent.get('participantModel').clone();
      respondent.set(intakeRespondent.getUIDataAttrs(), { silent: true });
      
      applicants.forEach((applicant) => {
        const tenant = applicant.isTenant() ? applicant : respondent;
        if (tenant.get('address')) {
          const tenantDisputeMatchingAddress = StringSimilarity.compareTwoStrings(String(tenant.get('address')).toUpperCase(), dispute.get('tenancy_address').toUpperCase()) > MATCH_PERCENTAGE;
          //If past tenancy and the tenant address matches the dispute address
          if (dispute.isPastTenancy() && tenantDisputeMatchingAddress && dispute.getCityCountryPostalString() === tenant.getCityCountryPostalString()) {
            addToDuplicates(PAST_TENANT_DISPUTE_ADDRESS_MATCH_TYPE, `The tenancy has ended but the dispute address and the tenant(s) address are the same: ${tenant.getAddressString()}`)
          }
        }

        if (applicant.get('address') && respondent.get('address')) {
          //If past tenancy and the tenant address matches the landlord address
          const tenantLandlordMatchingAddress = StringSimilarity.compareTwoStrings(String(applicant.get('address')).toUpperCase(), String(respondent.get('address')).toUpperCase()) > MATCH_PERCENTAGE;
          if (dispute.isPastTenancy() && tenantLandlordMatchingAddress && applicant.getAddressString() === respondent.getAddressString() ) {
            addToDuplicates(PAST_TENANT_LANDLORD_ADDRESS_MATCH_TYPE, `The tenancy has ended but the tenant and landlord addresses are the same: ${tenant.getAddressString()}`);
          }

          //If current tenancy, the tenant and landlord addresses match and "shared address" was set to No on both
          if (!dispute.isPastTenancy() && tenantLandlordMatchingAddress && !applicant.get('unit_type') && !respondent.get('unit_type') && applicant.getAddressString() === respondent.getAddressString()) {
            addToDuplicates(CURRENT_TENANT_LANDLORD_ADDRESS_MATCH_TYPE, `A landlord and tenant address is the same but there is no shared address identifier (for example: basement suite, upper, coach house): ${tenant.getAddressString()}`)
          }
        }
      });
    });

    return fieldsWithAddressIssues;
  },


  setPrimaryApplicantTo(primaryApplicantModel) {
    if (!primaryApplicantModel || primaryApplicantModel.isNew()) {
      console.log(`[Warning] Tried to set primary applicant to an invalid or unsaved model`, primaryApplicantModel);
      return;
    }
    this.applicants.each(function(applicant) {
      const matchingClaimGroupParticipant = this.claimGroupParticipants.findWhere({ participant_id: applicant.get('participant_id') }),
        primary_applicant_id = primaryApplicantModel.get('participant_id');

      applicant.set('group_primary_contact_id', primary_applicant_id);
      if (!matchingClaimGroupParticipant) {
        console.log(`[Warning] Couldn't find a matching claim group participant to update for `, applicant);
      } else {
        matchingClaimGroupParticipant.set('group_primary_contact_id', primary_applicant_id);
      }
    }, this);
  },

  /**
   * Sets correct "Delete" status on the participant and then saves the changes to API.  By default,
   * cascade deletes on hearingParticipation and notice service are removed as well.
   * @param {ParticipantModel} participantModel - The ParticipantModel to remove
   * @param {Object} options
   * @param {Boolean} options.amend - Whether to remove as an amendment or not
   */
  removeParticipant(participantModel, options) {
    options = options || {};

    if (options.amend) {
      participantModel.setAmendedRemoved();
    } else {
      participantModel.setDeleted();
    }

    const dfd = $.Deferred();
    const removeLinkFn = _.bind(function() {
      // Removes a participant model from its current collection to the "removed" list
      this.util_moveModelsTo([participantModel], this.removed);
      dfd.resolve();
    }, this);

    const participantId = participantModel.id;
    participantModel.save(participantModel.getApiChangesOnly())
      .done(() => (
        this._deleteUndeliveredDeliveries(participantId).then(() => removeLinkFn(), dfd.reject)
      ))
      .fail(dfd.reject);

    return dfd.promise();
  },

  deleteParticipant(participantModel) {
    const dfd = $.Deferred();
    const group_participant_id = participantModel.get('group_participant_id');

    if (!group_participant_id) {
      console.log(`[Error] No ClaimGroupParticipant link found to remove from participant:`, participantModel);
      dfd.reject();
      return;
    }

    const participantId = participantModel.id;
    // Delete the ParticipantGroup link first then the participant.  Because the link is what makes participant visible to the dispute
    this._removeLinkToMainClaimGroup(group_participant_id)
      .done(() => {
        participantModel.destroy()
          .done(() => this._deleteUndeliveredDeliveries(participantId).then(dfd.resolve, dfd.reject))
          .fail(dfd.reject);
      })
      .fail(dfd.reject);

    return dfd.promise();
  },

  _removeLinkToMainClaimGroup(claimGroupParticipantId) {
    const claimGroupParticipantToRemove = new ClaimGroupParticipantModel();
    claimGroupParticipantToRemove.set(claimGroupParticipantToRemove.idAttribute, claimGroupParticipantId, {silent: true});
    return claimGroupParticipantToRemove.destroy();
  },

  _deleteUndeliveredDeliveries(participantId) {
    const deliveries = documentsChannel.request('get:participant:deliveries', participantId);
    const unsentDeliveries = deliveries ? deliveries.filter(d => !d.get('is_delivered')) : [];
    return Promise.all(unsentDeliveries.map(d => d.destroy())).catch(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.REMOVE'));
  },

  getUnitsFromDispute() {
    IntakeAriDataParser.clear();

    const dispute = disputeChannel.request('get');
    const customDataEventSearch = dispute ?
      configChannel.request('get',
        dispute.isCreatedAriC() ? 'CUSTOM_DATA_OBJ_TYPE_ARI_C' :
        dispute.isCreatedPfr() ? 'CUSTOM_DATA_OBJ_TYPE_PFR' : null
      ) : null;
    const customDataObj = customDataEventSearch && customDataObjsChannel.request('get:type', customDataEventSearch);

    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();
    }

    return IntakeAriDataParser.toUnitCollection();
  },

  getAriCUnits() {
    
  }
});

_.extend(ParticipantsManager.prototype, UtilityMixin);

const participantsManagerInstance = new ParticipantsManager();

export default participantsManagerInstance;
