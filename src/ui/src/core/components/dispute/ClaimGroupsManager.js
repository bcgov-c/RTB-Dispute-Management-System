/**
 * @namespace core.components.dispute.ClaimGroupsManager
 * @memberof core.components.dispute
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ClaimGroupModel from '../dispute/ClaimGroup_model';

const disputeChannel = Radio.channel('dispute');

const ClaimGroupsManager = Marionette.Object.extend({
  /**
   * @class core.components.dispute.ClaimGroupsManagerClass
   * @augments Marionette.Object
   */

  initialize() {
    this.cached_data = {};
    this.initializeInternalModels();
  },

  initializeInternalModels() {
    this.claim_groups = [];
    this.mainClaimGroupModel = null;
  },

  channelName: 'claimGroups',

  radioRequests: {
    'get': 'getClaimGroup',
    'get:id': 'getClaimGroupId',
    'create': 'createMainClaimGroupPromise',
    'load': 'loadMainClaimGroup',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',

    'clear': 'initializeInternalModels',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current claim groups data into internal memory.  Can be retreived with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this ClaimGroupsManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached claim groups data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.mainClaimGroupModel = cache_data.mainClaimGroupModel;
    this.claim_groups = cache_data.claim_groups;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      mainClaimGroupModel: this.mainClaimGroupModel,
      claim_groups: this.claim_groups
    };
  },


  loadMainClaimGroup(claim_group_id) {
    if (claim_group_id) {
      this.mainClaimGroupModel = new ClaimGroupModel({ claim_group_id });
    } else {
      this.mainClaimGroupModel = null;
      console.log(`[Warning] No claim group id passed to loading function.  GET not supported on claimGroup endpoint`);
    }
    return this.mainClaimGroupModel;
  },

  loadFromDisputeAccessResponse(response_data_claim_groups) {
    response_data_claim_groups = response_data_claim_groups || [];

    if (response_data_claim_groups.length && response_data_claim_groups[0].claim_group_id) {
      this.mainClaimGroupModel = new ClaimGroupModel({ claim_group_id: response_data_claim_groups[0].claim_group_id });
    } else {
      this.mainClaimGroupModel = null;
      console.log(`[Warning] No claim group id passed to loading function.  GET not supported on claimGroup endpoint`);
    }
    return this.mainClaimGroupModel;
  },

  // Creates a new ClaimGroup for the dispute
  createMainClaimGroupPromise() {
    this.mainClaimGroupModel = new ClaimGroupModel();
    return this.mainClaimGroupModel.save();
  },

  getClaimGroup() {
    return this.mainClaimGroupModel;
  },

  getClaimGroupId() {
    return this.mainClaimGroupModel.get('claim_group_id');
  }

});

const claimGroupsManagerInstance = new ClaimGroupsManager();

export default claimGroupsManagerInstance;
