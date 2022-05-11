import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeFlagCollection from './DisputeFlag_collection';
import DisputeFlagModel from './DisputeFlag_model';
import ModalReviewNotification from './modal-review-notification/ModalReviewNotification';
 
const api_load_name = 'linkeddisputeflags';

const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');

const DisputeFlagManager = Marionette.Object.extend({
  channelName: 'flags',

  radioRequests: {
    load: 'loadFlags',
    get: 'getFlags',

    'create:adjournment': 'createAdjournmentFlag',
    'create:clarification': 'createClarificationFlag',
    'create:review': 'createReviewFlag',
    'create:review:late': 'createReviewLateFlag',
    'create:amendment': 'createAmendmentFlag',
    'create:subservice:requested': 'createSubServiceRequestedFlag',
    'create:subservice:approved': 'createSubServiceApprovedFlag',
    'create:correction': 'createCorrectionFlag',
    'create:prelim': 'createPrelimHearingFlag',
    'create:review:hearing': 'createReviewHearingFlag',
    
    'close:adjournments': 'closeAdjournmentFlagsOnDispute',
    'close:ccr': 'closeCcrFlag',
    'close:subservice:approved': 'closeSubServiceApprovedFlag',
    'close:subservice:requested': 'closeSubServiceRequestedFlag',
    'close:prelim': 'closePrelimFlags',

    'show:review:notification': 'showReviewNotifications',

    'load:disputeaccess': 'loadFlagsDisputeAccess',
    clear: 'clearInternalData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current notes data into internal memory.  Can be retreived with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this NotesManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.linkedDisputeFlags = cache_data.linkedDisputeFlags;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      linkedDisputeFlags: new DisputeFlagCollection(this.linkedDisputeFlags.models),
    };
  },

  

  initialize() {
    this.cached_data = {};
    this.linkedDisputeFlags = new DisputeFlagCollection();

    this.listenTo(this.linkedDisputeFlags, 'update', () => this.getChannel(this.channelName).trigger('update:flags'));
  },

  /**
   * Clears the current notes in memory.
   * Does not flush any cached data.
   */
   clearInternalData() {
    this.linkedDisputeFlags.reset([]);
  },

  initializeInternalModels() {
    
  },

  getFlags() {
    return this.linkedDisputeFlags;
  },

  loadFlags(dispute_guid) {
    if (!dispute_guid) {
      console.log("[Error] No dispute guid provided, can't get flags");
      return Promise.reject();
    }
    
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_name}/${dispute_guid}`
      }).done(response => {
        this.linkedDisputeFlags.reset(response, { silent: true });
        res(this.linkedDisputeFlags);
      }).fail(rej);
    });
  },

  loadFlagsDisputeAccess(flagsResponse=[]) {
    const activeStatus = configChannel.request('get', 'DISPUTE_FLAG_STATUS_ACTIVE');
    this.linkedDisputeFlags.reset(flagsResponse.filter(flagData => flagData.flag_status === activeStatus), { silent: true });
  },

  getFlagConfig(flagConfigId) {
    const flagConfigs = configChannel.request('get', 'dispute_flags') || {};
    return flagConfigs[flagConfigId] || null;
  },

  createFlag(flagConfig, attrs) {
    if (!flagConfig) {
      console.log(`[Error] No config found to create flag`);
      return;
    }
    
    const flag = new DisputeFlagModel(Object.assign({
      flag_start_date: Moment().toISOString()
    }, flagConfig, attrs));
    this.linkedDisputeFlags.add(flag);

    return flag;
  },

  createAdjournmentFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_ADJOURNED'));
    return this.createFlag(flagConfig, attrs);
  },

  closeAdjournmentFlagsOnDispute() {
    const disputeGuid = disputeChannel.request('get:id');
    const FLAG_ID_ADJOURNED = configChannel.request('get', 'FLAG_ID_ADJOURNED');
    const openAdjournmentFlags = this.linkedDisputeFlags.filter(flag => flag.get('dispute_guid') === disputeGuid
      && flag.getFlagId() === FLAG_ID_ADJOURNED
      && !flag.get('flag_end_date')
      && flag.isActive()
    );
    return this.closeFlags(openAdjournmentFlags);
  },

  createCorrectionFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_CORRECTION'));
    return this.createFlag(flagConfig, attrs);
  },

  createClarificationFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_CLARIFICATION'));
    return this.createFlag(flagConfig, attrs);
  },

  createReviewFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_REVIEW'));
    return this.createFlag(flagConfig, attrs);
  },

  createReviewLateFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_REVIEW_LATE'));
    return this.createFlag(flagConfig, attrs);
  },

  createAmendmentFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_AMENDMENT'));
    return this.createFlag(flagConfig, attrs);
  },

  createSubServiceRequestedFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_SUB_SERVICE_REQUESTED'));
    return this.createFlag(flagConfig, attrs);
  },

  createSubServiceApprovedFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_SUB_SERVICE_APPROVED'));
    return this.createFlag(flagConfig, attrs);
  },

  createPrelimHearingFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_PRELIM_HEARING'));
    return this.createFlag(flagConfig, attrs);
  },

  createReviewHearingFlag(attrs) {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_REVIEW_HEARING'));
    return this.createFlag(flagConfig, attrs);
  },

  closeCcrFlag(outcomeDocRequestId) {
    if (!outcomeDocRequestId) {
      console.log(`[Error] No config or outcomeDocRequestId found to close the flag`);
      return Promise.resolve();
    }

    const flag = this.linkedDisputeFlags.findWhere({ related_object_id: outcomeDocRequestId });
    if (!flag) {
      console.log(`[Error] No flag that can be closed found`);
      return Promise.resolve();
    }

    return this.closeFlags([flag]);
  },

  closeSubServiceRequestedFlag(subServId) {
    if (!subServId) {
      console.log(`[Error] No config or outcomeDocRequestId found to close the flag`);
      return Promise.resolve();
    }

    const flag = this.linkedDisputeFlags.findWhere({ related_object_id: subServId });
    if (!flag) {
      console.log(`[Error] No flag that can be closed found`);
      return Promise.resolve();
    }
    return this.closeFlags([flag]);
  },

  closeSubServiceApprovedFlag() {
    const subServeConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_SUB_SERVICE_APPROVED'));
    const disputeGuid = disputeChannel.request('get:id');
    const approvedSubServeFlags = this.linkedDisputeFlags.filter(flag => flag.get('dispute_guid') === disputeGuid
      && flag.get('flag_type') === subServeConfig.flag_type
      && flag.get('flag_subtype') === subServeConfig.flag_subtype 
      && !flag.get('flag_end_date')
      && flag.isActive()
    );

    return this.closeFlags(approvedSubServeFlags);
  },

  closePrelimFlags() {
    const flagConfig = this.getFlagConfig(configChannel.request('get', 'FLAG_ID_PRELIM_HEARING'));
    const disputeGuid = disputeChannel.request('get:id');
    const activeFlags = this.linkedDisputeFlags.filter(flag => flag.get('dispute_guid') === disputeGuid
      && flag.get('flag_type') === flagConfig.flag_type
      && flag.get('flag_subtype') === flagConfig.flag_subtype 
      && !flag.get('flag_end_date')
      && flag.isActive()
    );
    return this.closeFlags(activeFlags);
  },

  closeFlags(flagList=[]) {
    const closeDateStr = Moment().toISOString();
    flagList.forEach(flag => flag.set({
      flag_status: configChannel.request('get', 'DISPUTE_FLAG_STATUS_INACTIVE'),
      flag_end_date: closeDateStr
    }));
    
    return Promise.all(flagList.map(flag => flag.save(flag.getApiChangesOnly()))).finally(() => this.getChannel(this.channelName).trigger('update:flags'));
  },

  showReviewNotifications(reviewFlags, disputeParticipants, hearingLinkType=null, dispute) {
    const showFlagNotificationModal = (flag) => new Promise(res => {
      const participant = disputeParticipants.find(p => p.id === flag.get('flag_participant_id'));
      const modalView = new ModalReviewNotification({
        reviewFlag: flag,
        dispute,
        participant,
        hearingLinkType,
      });
      this.listenTo(modalView, 'removed:modal', () => res());
      modalChannel.request('add', modalView);
    });
    reviewFlags.reduce( (accumulatorPromise, flag) => (
      accumulatorPromise.then(() => showFlagNotificationModal(flag))
    ), Promise.resolve());
  },
});


const managerInstance = new DisputeFlagManager();
export default managerInstance;
