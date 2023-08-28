/**
 * Manages the claimsChannel.  Exports a singleton instance of {@link core.components.claim.ClaimsManagerClass|ClaimsManagerClass}.
 * @namespace core.components.claim.ClaimsManager
 * @memberof core.components.claim
 * @fileoverview - Manager that handles all claim/issues related functionality. 
 * This includes creation, deletion, and retrieval of issues and their supporting data, as well as helper functions related retrieving issues for the loaded dispute 
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import DisputeClaimCollection from './DisputeClaim_collection';
import DisputeClaimModel from './DisputeClaim_model';
import DisputeEvidenceCollection from './DisputeEvidence_collection';
import DisputeEvidenceModel from './DisputeEvidence_model';

const api_load_name = 'issues/disputeclaims';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const claimGroupsChannel = Radio.channel('claimGroups');
const filesChannel = Radio.channel('files');
const sessionChannel = Radio.channel('session');

const ClaimsManager = Marionette.Object.extend({
  /**
   * @class core.components.claim.ClaimsManagerClass
   * @augments Marionette.Object
   */

  channelName: 'claims',
  //TODO: refactor all instances of issues, claims, remedies, to a single word
  radioRequests: {
    'is:directRequest': 'claimsContainDirectRequest',

    'get': 'getMainClaimGroupClaims',
    'get:claim': 'getClaimById',
    'get:by:code': 'getMainClaimGroupClaimByClaimCode',
    'get:from:file': 'getClaimFromFile',
    'get:full': 'getMainClaimGroupClaimsAndFilesNoSupporting',
    'get:full:with:supporting': 'getMainClaimGroupClaimsAndFilesFullSupporting',
    'get:removed': 'getRemoved',
    'get:removed:full': 'getRemovedWithEvidence',
    'get:supporting': 'getSupportingDisputeClaim',
    'get:claim:options': 'getAvailableClaimOptions',
    'get:dispute:urgency': 'getDisputeUrgency',
    'create:supporting': 'createSupportingDisputeClaims',

    'create:supporting:mow': 'createSupportingMOW',
    'create:supporting:ta': 'createSupportingTA',

    'add:claim': 'addSavedDisputeClaim',
    'delete:full': 'deleteClaimAndEvidence',

    'remove:claim': 'removeClaim',
    'get:remedy': 'getRemedyById',

    'load': 'loadAllClaims',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',

    'clear': 'initializeInternalModels',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current claims data into internal memory.  Can be retreived with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this ClaimsManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached claims data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.disputeClaims = cache_data.disputeClaims;
    this.removed = cache_data.removed;
    this.mainGroupDisputeClaims = cache_data.mainGroupDisputeClaims;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      disputeClaims: this.disputeClaims,
      removed: this.removed,
      mainGroupDisputeClaims: this.mainGroupDisputeClaims
    };
  },

  /**
    * @property {DisputeClaimCollection} disputeClaims
    */
   disputeClaims: null,
  
   /**
    * @property {DisputeClaimCollection} removed
    */
   removed: null,
 
   initialize() {
     this.cached_data = {};
     this.initializeInternalModels();
   },
 
   initializeInternalModels() {
     this.disputeClaims = new DisputeClaimCollection();
     this.removed = new DisputeClaimCollection();
     this.mainGroupDisputeClaims = new DisputeClaimCollection();
   },


  claimsContainDirectRequest() {
    const disputeClaims = this.getMainClaimGroupClaims();
    return disputeClaims && disputeClaims.any(function(disputeClaim) { return disputeClaim.isDirectRequest(); });
  },

  /**
   * @param {*} options - Passed to the claim collection creation, also contains options for controlling loading
   */
  loadAllClaims(dispute_guid, options={}) {
    const dfd = $.Deferred();
    const self = this;

    if (!dispute_guid) {
      console.log("[Error] No dispute guid provided, can't get claim dispute participants");
      dfd.reject();
      return dfd.promise();
    }
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_name}/${dispute_guid}`
    }).done(function(response) {
      const disputeClaims = new DisputeClaimCollection(null, options);
      const removed = new DisputeClaimCollection(null, options);
      const mainGroupDisputeClaims = new DisputeClaimCollection(null, options);

      _.each(response, function(data) {
        const disputeClaimModel = new DisputeClaimModel(data);
        if (disputeClaimModel.isRemoved()) {
          removed.add(disputeClaimModel, {silent: true});
        } else {
          disputeClaims.add(disputeClaimModel, {silent: true});
        }
      });

      if (!options.no_cache) {
        self.disputeClaims = disputeClaims
        self.removed = removed;
        self.mainGroupDisputeClaims = mainGroupDisputeClaims;
      }
      dfd.resolve([disputeClaims, removed]);
    }).fail(dfd.reject);

    return dfd.promise();
  },


  loadFromDisputeAccessResponse(response_data_claims) {
    response_data_claims = response_data_claims || [];
    this.disputeClaims = new DisputeClaimCollection(null);
    this.removed = new DisputeClaimCollection(null);

    const isClaimRemovedFn = (claim_data) => claim_data.claim_status === configChannel.request('get', 'CLAIM_STATUS_REMOVED') ||
        claim_data.claim_status === configChannel.request('get', 'CLAIM_STATUS_DELETED');
      
    const isClaimHiddenFn = (claim_data) => {
      const issueConfig = configChannel.request('get:issue', claim_data.claim_code) || {};
      return !!issueConfig.hiddenExternal;
    }
    
    _.each(response_data_claims, function(claim_data) {
      // Don't add any externally hidden claims, like fee recovery (FFT/FFL) or special claims (CNOP / OLRD)
      if (isClaimHiddenFn(claim_data)) {
        return;
      }

      // Convert "claim_details" response field to "claimDetails" which is what the other load api returns
      claim_data.claimDetails = claim_data.claim_details;
      
      if (isClaimRemovedFn(claim_data)) {
        this.removed.add(claim_data, {silent: true});
      } else {
        this.disputeClaims.add(claim_data, {silent: true});
      }
    }, this);
  },

  getMainClaimGroupClaims() {
    // Returns claims associated to the main claim group
    const mainClaimGroupId = claimGroupsChannel.request('get:id');
    this.util_moveModelsTo(this.disputeClaims.where({ claim_group_id: mainClaimGroupId }), this.mainGroupDisputeClaims);
    
    const modelsToRemove = [];
    this.mainGroupDisputeClaims.each(model => {
      if (this.removed.find(model)){
        modelsToRemove.push(model);
      }
    });
    this.mainGroupDisputeClaims.remove(modelsToRemove, { silent: true });
    return this.mainGroupDisputeClaims;
  },

  getMainClaimGroupClaimByClaimCode(claim_code) {
    return this.getMainClaimGroupClaims().findWhere({ claim_code });
  },

  getClaimFromFile(fileModel, options={}) {
    const fileDescription = filesChannel.request('get:filedescription:from:file', fileModel, options);
    if (fileDescription) {
      const matchingClaim = this.disputeClaims.find(disputeClaim => disputeClaim.claim && disputeClaim.claim.id === fileDescription.get('claim_id'));
      if (!matchingClaim && options.include_removed) {
        return this.removed.find(disputeClaim => disputeClaim.claim && disputeClaim.claim.id === fileDescription.get('claim_id'));;
      } else {
        return matchingClaim;
      }
    }
    return null;
  },

  /**
   * @param {*} [options.skip_tenancy_agreement] - If true, does not return tenancy agreement with the supporting evidence
   */
  getMainClaimGroupClaimsAndFilesFullSupporting(options) {
    options = options || {};
    const claims = new DisputeClaimCollection(this._getMainClaimGroupClaimsAndFiles().clone().models);

    // Returns MOW and TA in "supporting evidence"
    const defaultSupportingClaim = this.getSupportingDisputeClaim(options);
    const disputeEvidences = defaultSupportingClaim.get('dispute_evidences');
    const extraSupportingEvidences = _.map(
      _.filter(filesChannel.request('get:filedescriptions:claimless'), function(fileDescription) {
        // Return evidence that is not already present in support claims
        return (
          !(fileDescription.isTenancyAgreement() && options.skip_tenancy_agreement) &&
          fileDescription.isEvidence() &&
          !disputeEvidences.find(function(disputeEvidence) {
            const _fileDescription = disputeEvidence.get('file_description');
            return _fileDescription && _fileDescription.id === fileDescription.id;
          })
        );
      }), function(fileDescription) {
        return { file_description: fileDescription };
      });
    
    if (defaultSupportingClaim && (disputeEvidences.length || extraSupportingEvidences.length)) {
      defaultSupportingClaim.set('claim_title', 'Other supporting information', { silent: true });
      // If any other non issue but custom evidences were added, include them here
      if (extraSupportingEvidences.length) {
        disputeEvidences.add(extraSupportingEvidences, { silent: true });
      }
      claims.add(defaultSupportingClaim, { silent: true });
    }
    return claims;
  },

  getMainClaimGroupClaimsAndFilesNoSupporting() {
    // Filter out the standalone evidence codes for Tenancy Agreement and Monetary Order Worksheet
    const skip_evidence_codes = [
      configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE'),
      configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')
    ];

    return this._getMainClaimGroupClaimsAndFiles({ skip_evidence_codes });
  },

  _getMainClaimGroupClaimsAndFiles(options) {
    options = options || {};
    const dispute_claims = this.getMainClaimGroupClaims();

    dispute_claims.each(function(dispute_claim) {
      const dispute_evidence_collection = new DisputeEvidenceCollection();
      dispute_evidence_collection.syncModelDataWithDisputeClaim(dispute_claim, options);
      dispute_evidence_collection.each(function(dispute_evidence) {
        const associated_files = filesChannel.request('get:filedescription:files', dispute_evidence.get('file_description'));
        dispute_evidence.set('files', associated_files);
      });
      dispute_claim.set('dispute_evidences', dispute_evidence_collection);
    });
    return dispute_claims;
  },

  getMainClaimsRequestedAmountTotal() {
    return this.getMainClaimGroupClaims().getTotalAmountClaimed();
  },

  getMainClaimsGrantedAmountTotal() {
    return this.getMainClaimGroupClaims().getTotalAmountClaimed();
  },

  getClaimById(claimId, options) {
    options = options || {};
    let matchingClaim = claimId && this.getMainClaimGroupClaims().find(disputeClaimModel => disputeClaimModel.claim && disputeClaimModel.claim.id === claimId);
    if (!matchingClaim && !options.no_removed) {
      matchingClaim = this.removed.findWhere({ claim_id: claimId });
    }
    return matchingClaim || null;
  },

  getRemoved() {
    return this.removed;
  },

  getRemovedWithEvidence() {
    const removed = this.removed.clone();

    removed.each(function(dispute_claim) {
      const fileDescriptions = _.map(filesChannel.request('get:filedescriptions:claim', dispute_claim.get('claim_id')), file_description => (
        { claim_id: file_description.get('claim_id'), remedy_id: file_description.get('remedy_id'), file_description }));

      const dispute_evidence_collection = new DisputeEvidenceCollection(fileDescriptions);
      dispute_evidence_collection.each(function(dispute_evidence) {
        const associated_files = filesChannel.request('get:filedescription:files', dispute_evidence.get('file_description'));
        dispute_evidence.set('files', associated_files);
      });
      dispute_claim.set('dispute_evidences', dispute_evidence_collection);
    });
    return removed;
  },


  _getSupportingTenancyAgreement() {
    const tenancy_agreement_config = configChannel.request('get:evidence', configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE'));
    const matching_tenancy_agreement = filesChannel.request('get:filedescription:code', tenancy_agreement_config.id)
    return matching_tenancy_agreement ? matching_tenancy_agreement : null;
  },

  _getSupportingMonetaryOrderWorksheet() {
    const full_claims = this.getMainClaimGroupClaimsAndFilesNoSupporting(),
      monetary_order_worksheet_config = configChannel.request('get:evidence', configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')),
      matching_monetary_order_worksheet = filesChannel.request('get:filedescription:code', monetary_order_worksheet_config.id),
      is_optional_monetary_order_worksheet = full_claims.all(function(disputeClaim) {
          return disputeClaim.hasConfigMonetaryOrderWorksheetEvidence() ?
              disputeClaim.hasAllOptionalConfigMonetaryOrderWorksheetEvidence() : true
      });

    if (matching_monetary_order_worksheet) {
      matching_monetary_order_worksheet.set('required', !is_optional_monetary_order_worksheet);
    }

    return matching_monetary_order_worksheet ? matching_monetary_order_worksheet : null;
  },

  createSupportingMOW() {
    const monetary_order_worksheet_config = configChannel.request('get:evidence', configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE'));
    const matching_monetary_order_worksheet = this._getSupportingMonetaryOrderWorksheet();
    
    return new DisputeEvidenceModel({
      claim_id: null,
      remedy_id: null,
      evidence_id: monetary_order_worksheet_config.id,
      category: monetary_order_worksheet_config.category,
      title: monetary_order_worksheet_config.title,
      description_by: sessionChannel.request('get:active:participant:id'),
      file_description: matching_monetary_order_worksheet ? matching_monetary_order_worksheet : null,
      files: filesChannel.request('get:filedescription:files', matching_monetary_order_worksheet)
    });
  },


  createSupportingTA() {
    const tenancy_agreement_config = configChannel.request('get:evidence', configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')),
      matching_tenancy_agreement = this._getSupportingTenancyAgreement();
    
    return new DisputeEvidenceModel({
      claim_id: null,
      remedy_id: null,
      evidence_id: tenancy_agreement_config.id,
      category: tenancy_agreement_config.category,
      title: tenancy_agreement_config.title,
      description_by: sessionChannel.request('get:active:participant:id'),
      required: true,
      file_description: matching_tenancy_agreement ? matching_tenancy_agreement : null,
      files: filesChannel.request('get:filedescription:files', matching_tenancy_agreement)
    });
  },

  /**
   * Looks up and returns any /existing/ supporting TA/MOW
   * @param {boolean} [options.skip_tenancy_agreement] - If true, will not return Tenancy Agreement evidence
   */
  getSupportingDisputeClaim(options) {
    options = options || {};
    const matching_tenancy_agreement = options.skip_tenancy_agreement ? null : this._getSupportingTenancyAgreement();
    const matching_monetary_order_worksheet = this._getSupportingMonetaryOrderWorksheet();

    return new DisputeClaimModel({
      dispute_evidences: new DisputeEvidenceCollection([
        ...(matching_monetary_order_worksheet ? [{
            required: matching_monetary_order_worksheet.get('required'),
            file_description: matching_monetary_order_worksheet,
            files: filesChannel.request('get:filedescription:files', matching_monetary_order_worksheet)
          }] : []),
        ...(matching_tenancy_agreement ? [{
            required: true,
            file_description: matching_tenancy_agreement,
            files: filesChannel.request('get:filedescription:files', matching_tenancy_agreement)
          }] : [])
      ])
    });
  },

  getAvailableClaimOptions(dropdownCollection, rta, landlord, currentTenant, currentClaimCode=null, noClaimCodeDisplay=false) {
    function getAvailableClaimConfigs(currentClaimCode=null) {
      const config_issues = configChannel.request('get:issues');
      const selectedClaimsLookup = dropdownCollection.map(dropdown => dropdown.getData())
        .reduce(function(result, item) {
          result[item] = true;
          return result;
        }, {});

      // If we pass a claim code, then don't consider that value as being already chosen
      if (currentClaimCode && _.has(selectedClaimsLookup, currentClaimCode)) {
        delete selectedClaimsLookup[currentClaimCode];
      }

      const filtered_configs = _.filter(config_issues, issue_config => {
        // Filter first that it passes visibility rules 
        const is_visible = (
          (issue_config.associatedToApplicantType === 'both' || issue_config.associatedToApplicantType === (landlord ? 'landlord' : 'tenant') )
            && (issue_config.associatedToTenancyStatus === 'both' || issue_config.associatedToTenancyStatus === (currentTenant ? 'current' : 'past') )
            && (issue_config.associatedToAct === 'both' || issue_config.associatedToAct === (rta ? 'rta' : 'mhpta') )
        );
  
        if (!is_visible) { return false }
  
        
        // Then validate that the issues have not already been chosen
        if (_.has(selectedClaimsLookup, issue_config.id)) { return false; }
  
        return true;
      });
  
      return filtered_configs;
    }

    const claimOptions = _.map(getAvailableClaimConfigs(currentClaimCode), claimConfig => {
      // Also add the code here in "_code" to be looked up later for display logic
      return { value: String(claimConfig.id), text: `${noClaimCodeDisplay ? '' : `${claimConfig.code} - `} ${claimConfig.issueTitle}`, _code: claimConfig.code };
    });
    return _.sortBy(claimOptions, function(issue) { return issue.text; });
  },

  getDisputeUrgency() {
    const claims = this.getMainClaimGroupClaims();
    const high_urgency_issue_codes = configChannel.request('get', 'high_urgency_issue_codes');
    const deferred_urgency_issue_codes = configChannel.request('get', 'deferred_urgency_issue_codes');
    
    let configCodeToUse = 'DISPUTE_URGENCY_REGULAR';
    if (claims.any(claim => _.contains(high_urgency_issue_codes, claim.get('claim_code')))) configCodeToUse = 'DISPUTE_URGENCY_EMERGENCY';
    else if (claims.all(claim => _.contains(deferred_urgency_issue_codes, claim.get('claim_code')))) configCodeToUse = 'DISPUTE_URGENCY_DEFERRED';
    
    return configChannel.request('get', configCodeToUse);
  },

  // Returns all supporting TA/MOW. Always creates the models and then points to any existing in API
  createSupportingDisputeClaims() {
    const all_claims = this.getMainClaimGroupClaims(),
      hasMonetaryOrderWorksheet = all_claims.any(function(disputeClaim) {
          return disputeClaim.hasConfigMonetaryOrderWorksheetEvidence();
        }),
      isMonetaryOrderWorksheetOptional = all_claims.all(function(disputeClaim) {
        return disputeClaim.hasConfigMonetaryOrderWorksheetEvidence() ?
          disputeClaim.hasAllOptionalConfigMonetaryOrderWorksheetEvidence() : true;
      });

    const tenancyAgreementModel = this.createSupportingTA();
    // Always create a tenancy agreement slot
    const supportingDisputeClaims = new DisputeClaimCollection([
      {
        claim_title: tenancyAgreementModel.getTitle(),
        dispute_evidences: new DisputeEvidenceCollection([tenancyAgreementModel])
      }
    ]);
    
    if (hasMonetaryOrderWorksheet) {
      const monetaryOrderWorksheetModel = this.createSupportingMOW();
      monetaryOrderWorksheetModel.set({
        required: !isMonetaryOrderWorksheetOptional
      }, { silent: true });

      supportingDisputeClaims.unshift({
        claim_title: monetaryOrderWorksheetModel.getTitle(),
        dispute_evidences: new DisputeEvidenceCollection([monetaryOrderWorksheetModel])
      });
    }

    return supportingDisputeClaims;
      
  },

  getRemedyById(remedyId) {
    let matchingRemedy = null;
    this.getMainClaimGroupClaims().forEach(disputeClaim => {
      if (matchingRemedy) { return; }
      matchingRemedy = disputeClaim.getAllRemedies().findWhere({ remedy_id: remedyId });
    });

    // Note: Should we also add a check for remedies from removed claims?
    return matchingRemedy;
  },

  removeClaim(disputeClaimModel) {
    // Removes a dispute claim model from its current collection to the "removed" list
    this.util_moveModelsTo([disputeClaimModel], this.removed, { silent: true });
  },


  addSavedDisputeClaim(disputeClaimModel) {
    // NOTE: Will only add a DisputeClaimModel with a saved claim
    const disputeClaims = this.getMainClaimGroupClaims();
    console.log(disputeClaims, disputeClaimModel);

    if (disputeClaimModel && disputeClaimModel.claim && disputeClaimModel.claim.id
        && !disputeClaims.findWhere({ claim_id: disputeClaimModel.claim.id })) {
      disputeClaims.add(disputeClaimModel);
    }
  },

  deleteClaimAndEvidence(disputeClaimModel) {
    const all_xhr = [ _.bind(disputeClaimModel.destroy, disputeClaimModel) ];
    const related_file_descriptions = filesChannel.request('get:filedescriptions:claim', disputeClaimModel && disputeClaimModel.claim.get('claim_id'));
    _.each(related_file_descriptions, function(file_description) {
      all_xhr.push( _.bind(filesChannel.request, filesChannel, 'delete:filedescription:full', file_description) );
    });

    const dfd = $.Deferred();
    Promise.all(_.map(all_xhr, function(xhr) { return xhr(); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  }
  
});
_.extend(ClaimsManager.prototype, UtilityMixin);

const claimsManagerInstance = new ClaimsManager();

export default claimsManagerInstance;
