/**
 * @fileoverview Manages the disputeChannel.  Exports a singleton instance of {@link core.components.dispute.DisputeManagerClass|DisputeManagerClass}.
 * @namespace core.components.dispute.DisputeManager
 * @memberof core.components.dispute
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeModel from './Dispute_model';
import DisputeListCollection from './DisputeListItem_collection';
import ModalCompletenessCheck from '../../components/modals/modal-completeness-check/ModalCompletenessCheck';

const api_create_external_dispute = 'externalupdate/newdispute';
const api_dispute_list_name = 'dispute/disputelist';
const api_incomplete_items_name = 'WorkflowReports/incompletedisputeitems';
const MAX_RESPONDENTS_FOR_BASIC_COMPLEXITY = 10;

const apiFileNumberValidator = 'search/filenumbervalidation';

const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');
const applicationChannel = Radio.channel('application');
const claimsChannel = Radio.channel('claims');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const userChannel = Radio.channel('users');

const DisputeManager = Marionette.Object.extend({
  /**
   * @class core.components.dispute.DisputeManagerClass
   * @augments Marionette.Object
   */

  channelName: 'dispute',

  radioRequests: {
    get: 'getActiveDispute',
    'get:id': 'getActiveDisputeId',
    'get:filenumber': 'getActiveDisputeFileNumber',

    create: 'createDispute',
    'create:external': 'createDisputeFromExternal',
    'create:ari': 'createAriDispute',
    'create:pfr': 'createPfrDispute',
    'load': 'loadDisputePromise',
    'load:disputes': 'loadDisputeListPromise',

    'get:dispute:creator': 'getDisputeCreator',
    'check:issue:state': 'checkIssueStateAndGetDiscrepancies',
    'check:complexity': 'checkDisputeComplexity',
    'incomplete:dispute:check': 'loadIncompleteDisputeCheck',
    'check:filenumber': 'checkFileNumberValidator',
    'check:completeness': 'checkCompleteness',

    'set:active': 'setActiveDispute',
    clear: 'clearInternalDisputeInfo'
  },

  activeDispute: null,

  /**
   * Loads the dispute data from the server.  If dispute has already been loaded,
   * performs a fetch on the existing model, otherwise creates a new model.
   * Always sets the dispute model to be active.
   * @param {string} dispute_guid - The dispute guid to load
   * @param {Object} options - Params for the argument. "no_cache" cases no side effects
   * @returns {Promise} - The promise object for the load
   * @memberof core.components.dispute.DisputeManagerClass
   */
  loadDisputePromise(dispute_guid, options={}) {
    const activeDispute = this.getActiveDispute();
    const disputeModel = !options.no_cache && activeDispute?.get('dispute_guid') === dispute_guid ? activeDispute : new DisputeModel({ dispute_guid: dispute_guid });
    const dfd = $.Deferred();

    if (!options.no_cache) this.setActiveDispute(disputeModel);
    
    disputeModel.fetch().done(() => dfd.resolve(disputeModel)).fail(dfd.reject);
    return dfd.promise();
  },


  /**
   * Creates a blank dispute on the server, then does an immediate API load to get default values.
   * Dispute load() will set this newly-created dispute to be active.
   * @memberof core.components.dispute.DisputeManagerClass
   */
  _createDispute(disputePatchData) {
    disputePatchData = disputePatchData || {};
    const new_dispute = new DisputeModel();
    new_dispute.save().done(function() {
      if (!_.isEmpty(disputePatchData)) {
        new_dispute.save(disputePatchData)
        .done(() => applicationChannel.request('load:dispute:full', new_dispute.get('dispute_guid')) )
        .fail(() => console.log(`[Error] Couldn't update dispute creation method`) );
      } else {
        applicationChannel.request('load:dispute:full', new_dispute.get('dispute_guid'));
      }
    }).fail(function(error_response) {
      console.log(`[Error] Couldn't create dispute. Returning to login page`, error_response);
    });
  },

  
  createDispute() {
    this._createDispute({ creation_method: configChannel.request('get', 'DISPUTE_CREATION_METHOD_INTAKE') });
  },

  createAriDispute() {
    this._createDispute({
      creation_method: configChannel.request('get', 'DISPUTE_CREATION_METHOD_ARI_C'),
      dispute_sub_type: configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'),
      dispute_urgency: configChannel.request('get', 'DISPUTE_URGENCY_REGULAR'),
      tenancy_ended: 0
    });
  },

  createPfrDispute() {
    this._createDispute({
      creation_method: configChannel.request('get', 'DISPUTE_CREATION_METHOD_PFR'),
      dispute_sub_type: configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'),
      dispute_urgency: configChannel.request('get', 'DISPUTE_URGENCY_REGULAR'),
      tenancy_ended: 0
    });
  },

  createDisputeFromExternal(disputeData) {
    /* External dispute data looks like:
    {
      "dispute_type": 0,
      "dispute_sub_type": 0,
      "dispute_urgency": 0,
      "tenancy_address": "string",
      "tenancy_city": "string",
      "tenancy_country": "string",
      "tenancy_zip_postal": "string",
      "tenancy_ended": 0,
      "tenancy_end_date": "2019-03-28T22:34:47.337Z",
      "cross_app_file_number": 0,
      "submitted_date": "2019-03-28T22:34:47.337Z",
      "process": 0,
      "participant_type": 0,
      "participant_status": 0,
      "business_name": "string",
      "business_contact_first_name": "string",
      "business_contact_last_name": "string",
      "first_name": "string",
      "last_name": "string",
      "accepted_tou": true,
      "email": "string",
      "no_email": true,
      "primary_phone": "string",
      "primary_contact_method": 0,
      "package_delivery_method": 0
    }
    */

    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_create_external_dispute}`,
      data: JSON.stringify(disputeData),
      headers: {
        'Content-Type': 'application/json'
      },
      contentType: "application/json",
    }).done(function(response) {
      console.log('Response from newdispute', response);
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },


  /**
   * Loads all disputes for DisputeList
   * If any disputes are in a bad state, perform an update
   */
  loadDisputeListPromise(loadOptions={}) {
    const dfd = $.Deferred();
    const index = loadOptions.index || 0;
    const count = loadOptions.count || configChannel.request('get', 'APPLICATION_LIST_COUNT');

    const loadParams = $.param(Object.assign({}, loadOptions, { index, count }));
    const fetchDisputesFn = () => {
      return apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_dispute_list_name}?${loadParams}`
      });
    };

    try {
      fetchDisputesFn()
        .done(response => {
          response = response || {};
          const disputeListCollection = new DisputeListCollection(response.disputes);
          disputeListCollection.lastUsedFetchIndex = index;
          disputeListCollection.lastUsedFetchCount = count;
          disputeListCollection.totalAvailable = response.total_available_records;

          // Update disputes that should have been set to paid
          const disputesNeedingUpdate = disputeListCollection.filter(disputeListItem => disputeListItem.isUnpaidWhenShouldBePaid());
          const disputeUpdatesXhr = disputesNeedingUpdate.map(disputeListItem => {
            const dispute = new DisputeModel(disputeListItem.toJSON());
            const innerDfd = $.Deferred();
            dispute.saveStatus({ dispute_stage: 2, dispute_status: 20 })
              .done(statusResponse => {
                disputeListItem.set('status', statusResponse);
                disputeListItem.set(disputeListItem.getDisplayRules());
              }).always(innerDfd.resolve);
            return innerDfd.promise();
          });
          Promise.all(disputeUpdatesXhr).finally(() => {
            dfd.resolve(disputeListCollection);
          });
        }).fail(dfd.reject);
    } catch (err) {
      dfd.reject(err);
    }
    
    return dfd.promise();
  },

  getDisputeCreator() {
    const disputeCreatorId = this.getActiveDispute()?.get('created_by');
    return userChannel.request('get:dispute:users')?.find(dUser => dUser.get('system_user_id') === disputeCreatorId);
  },

  /**
   * Gets the active dispute, if it exists.
   * @returns {Object} The active dispute.
   * @memberof core.components.dispute.DisputeManagerClass
   */
  getActiveDispute() {
    return this.activeDispute;
  },

  _getActiveDisputeAttribute(attribute) {
    const dispute = this.getActiveDispute();
    if (!dispute || dispute.isNew()) {
      console.log(`[Warning] No active dispute from API ${dispute}`, dispute);
    }
    return dispute ? dispute.get(attribute) : null;
  },


  getActiveDisputeId() {
    return this._getActiveDisputeAttribute('dispute_guid');
  },

  getActiveDisputeFileNumber() {
    return this._getActiveDisputeAttribute('file_number');
  },


  /**
   * Sets a dispute to be active, and tracked internally.
   * @param {Object} dispute_model - The dispute to be set as active
   * @memberof core.components.dispute.DisputeManagerClass
   */
  setActiveDispute(dispute_model) {
    if (!dispute_model) {
      console.log(`[Warning] Setting an empty DisputeModel as active`, dispute_model);
    }
    this.activeDispute = dispute_model;
  },


  /**
   * Un-sets the internally tracked dispute object.
   * Does not perform any cleanup on the dispute model or any other Managers
   * @memberof core.components.dispute.DisputeManagerClass
   */
  clearInternalDisputeInfo() {
    // Un-set dispute info.  This will also remove the intakeQuestions that were associated to it
    this.activeDispute = null;
  },


  checkIssueStateAndGetDiscrepancies(previousDisputeData, newDisputeData, claims) {
    previousDisputeData = previousDisputeData || {};
    newDisputeData = newDisputeData || {};

    const issueDiscrepancies = {};
    const displayKeys = {
      rta: 'Invalid with RTA',
      mhpta: 'Invalid with MHPTA',
      current: 'Invalid with a current tenant',
      past: 'Invalid with past tenant',
      deposit: 'Invalid without either a security deposit or pet damage deposit',
      securityDeposit: 'Invalid without a security deposit',
      petDeposit: 'Invalid without a pet damage deposit',
      bothDeposit: 'Invalid without both a security and pet damage deposit',
    };
    const addToIssueDiscrepanciesFn = (displayKey, invalidClaim) => {
      if (!issueDiscrepancies[displayKey]) {
        issueDiscrepancies[displayKey] = [];
      }
      issueDiscrepancies[displayKey].push(invalidClaim);
    };
    const monetaryIssuesAddedToDiscrepencies = {};

    if (!claims || !claims.length) {
      return issueDiscrepancies;
    }

    // Check the dispute again to see what is being changed
    if (previousDisputeData.isMHPTA && !newDisputeData.isMHPTA) {
      _.each(claims.filter(claim => !claim.isValidWithRTA()), invalidClaim => {
        addToIssueDiscrepanciesFn(displayKeys.rta, invalidClaim);
      });
    }

    if (!previousDisputeData.isMHPTA && newDisputeData.isMHPTA) {
      _.each(claims.filter(claim => !claim.isValidWithMHPTA()), invalidClaim => {
        addToIssueDiscrepanciesFn(displayKeys.mhpta, invalidClaim);
      });
    }

    if (previousDisputeData.isPastTenancy && !newDisputeData.isPastTenancy) {
      _.each(claims.filter(claim => !claim.isValidWithCurrentTenancy()), invalidClaim => {
        addToIssueDiscrepanciesFn(displayKeys.current, invalidClaim);
      });
    }

    if (!previousDisputeData.isPastTenancy && newDisputeData.isPastTenancy) {
      _.each(claims.filter(claim => !claim.isValidWithPastTenancy()), invalidClaim => {
        addToIssueDiscrepanciesFn(displayKeys.past, invalidClaim);
      });
    }

    // Pet/Securit/Deposit handling
    if (previousDisputeData.hasPetDeposit && !newDisputeData.hasPetDeposit) {
      _.each(claims.filter(claim => !claim.isValidWithNoPetDeposit()), invalidClaim => {
        monetaryIssuesAddedToDiscrepencies[invalidClaim.id] = true;
        addToIssueDiscrepanciesFn( invalidClaim.isValidWithNoSecurityDeposit() ? displayKeys.petDeposit : displayKeys.bothDeposit, invalidClaim);
      });
    }

    if (previousDisputeData.hasSecurityDeposit && !newDisputeData.hasSecurityDeposit) {
      _.each(claims.filter(claim => !claim.isValidWithNoSecurityDeposit()), invalidClaim => {
        monetaryIssuesAddedToDiscrepencies[invalidClaim.id] = true;
        addToIssueDiscrepanciesFn( invalidClaim.isValidWithNoPetDeposit() ? displayKeys.securityDeposit : displayKeys.bothDeposit, invalidClaim);
      });
    }

    if (previousDisputeData.hasDeposit && !newDisputeData.hasDeposit) {
      // Show any issues that are not already marked above
      _.each(claims.filter(claim => !claim.isValidWithNoDeposit() && !monetaryIssuesAddedToDiscrepencies[claim.id]), invalidClaim => {
        monetaryIssuesAddedToDiscrepencies[invalidClaim.id] = true;
        addToIssueDiscrepanciesFn(displayKeys.deposit, invalidClaim);
      });
    }
    
    return issueDiscrepancies;
  },

  checkDisputeComplexity(disputeModel) {
    if (!disputeModel) return;
    
    const isBasicCreationMethod = disputeModel.isCreatedIntake() || disputeModel.isCreatedExternal();

    if (isBasicCreationMethod) {
      //Basic Rule 1
      const claims = claimsChannel.request('get');
      const basicIssueCodes = configChannel.request('get', 'basic_complexity_issue_codes');
      const includesBasicIssues = claims.some(c => basicIssueCodes.includes(c.get('claim_code')));
      const basicRespondentAmount = (participantsChannel.request('get:respondents') || {}).length < MAX_RESPONDENTS_FOR_BASIC_COMPLEXITY;
      const hasCNR = claims.some(c => c.isCNR());
      const hasCNC = claims.some(c => c.isCNC());
      const hasCNL = claims.some(c => c.isCNL());
      const hasOPR = claims.some(c => c.isOPR());
      const hasOPC = claims.some(c => c.isOPC());
      const hasOPL = claims.some(c => c.isOPL());
      const isBasicRule1Complexity = includesBasicIssues && basicRespondentAmount &&
        (hasCNR || hasCNC ? !hasCNL : true) && (hasOPR || hasOPC ? !hasOPL : true);
      
      //Basic Rule 2
      const onlyContainsTTNonParticipatoryDeposits = claims.every(c => c.get('claim_code') === 237 || c.get('claim_code') === 238 || c.get('claim_code') === 239 || c.isFeeRecovery());
      
      const isBasic = isBasicRule1Complexity || onlyContainsTTNonParticipatoryDeposits;
      return isBasic ? configChannel.request('get', 'COMPLEXITY_SIMPLE') : configChannel.request('get', 'COMPLEXITY_STANDARD');
    } else {
      return configChannel.request('get', 'COMPLEXITY_STANDARD');
    }
  },

  loadIncompleteDisputeCheck(disputeModel) {
    const dfd = $.Deferred();
    if (!disputeModel) {
      console.log(`[Warning] Setting an empty DisputeModel as active`, disputeModel);
      return dfd.resolve({}).promise();
    }

    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_incomplete_items_name}/${disputeModel.id}`
    });
  },

  checkFileNumberValidator(fileNumber) {
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${apiFileNumberValidator}/${fileNumber}`
    });
  },

  async checkCompleteness(disputeModel=null) {
    disputeModel = disputeModel || this.getActiveDispute();
    loaderChannel.trigger('page:load');
    const response = await this.loadIncompleteDisputeCheck(disputeModel)
    if (!response) return Promise.resolve();
    loaderChannel.trigger('page:load:complete');
    return new Promise((resolve, reject) => {
      const completenessModalView = new ModalCompletenessCheck({ model: disputeModel, incompleteItems: response, autoCloseIfAllComplete: true })
      this.listenTo(completenessModalView, 'removed:modal', () => reject());
      this.listenTo(completenessModalView, 'save:complete', () => resolve());
      modalChannel.request('add', completenessModalView);
    });
  },
});

const disputeManagerInstance = new DisputeManager();
export default disputeManagerInstance;
