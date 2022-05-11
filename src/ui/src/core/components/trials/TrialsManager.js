import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Trial_collection from './Trial_collection';
import TrialDispute_collection from './TrialDispute_collection';

const trialsApiName = 'trials';
const trialInfoApiName = 'external/disputetrialsinfo';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');

const TrialsManager = Marionette.Object.extend({
  channelName: 'trials',

  radioRequests: {
    load: 'loadTrialsPromise',
    'load:dispute': 'loadTrialInfoPromise',
    'get': 'getTrials',
    'get:dispute': 'getDisputeTrials',
    'add:dispute:trial': 'addDisputeTrial',
    
    clear: 'clearData',
    'cache:current': 'cacheCurrentData',
    'clear:dispute': 'clearDisputeData',
    'cache:load': 'loadCachedFor',
  },

  clearData() {
    this.trials.reset([]);
    this.disputeTrials.reset([]);
  },

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

  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.trials = cache_data.trials;
    this.disputeTrials = cache_data.disputeTrials;
  },

  _toCacheData() {
    return {
      trials: this.trials,
      disputeTrials: this.disputeTrials
    };
  },

  initialize() {
    this.cached_data = {};
    this.trials = new Trial_collection();
    this.disputeTrials = new TrialDispute_collection();
  },

  getTrials() {
    return this.trials;
  },

  getDisputeTrials() {
    return this.disputeTrials;
  },

  addDisputeTrial(trialDispute) {
    this.disputeTrials.add(trialDispute, { merge: true });
  },

  loadTrialsPromise() {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${trialsApiName}`,
      }).done(response => {
        this.trials.reset(response);
        res(this.trials);
      }).fail(rej);
    });
  },

  loadTrialInfoPromise(disputeGuid) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${trialInfoApiName}/${disputeGuid}`
      }).done(response => {
        this.disputeTrials.reset(response);
        res(this.disputeTrials);
      }).fail(rej);
    });
  },

});

const trialsManagerInstance = new TrialsManager();
export default trialsManagerInstance;
