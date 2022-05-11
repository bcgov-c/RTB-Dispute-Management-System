
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import CustomDataObjCollection from './dispute/CustomDataObj_collection';
import ExternalCustomObjCollection from './external/ExternalCustomObj_collection';
import ExternalFile_collection from './external/ExternalFile_collection';
import IntakeAriDataParser from './ari-c/IntakeAriDataParser';

const apiLoadName = 'customobjects';
const apiExternalLoadName = 'externalcustomdataobjects';
const apiExternalFilesLoadName = 'externalfiles';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

const CustomDataObjManager = Marionette.Object.extend({
  channelName: 'custom-data-objs',

  radioRequests: {
    load: 'loadCustomDataObjsPromise',
    add: 'addCustomDataObj',
    'get:type': 'getCustomDataObjByType',
   
    // Add new APIs for external custom data objs
    'get:external': 'getAllExternalObjs',
    'load:external': 'loadExternalDataObjsPromise',
    'load:external:files': 'loadExternalFilesForCustomDataObj',
    'add:external': 'addExternalDataObj',

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
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.allCustomDataObjs = cache_data.allCustomDataObjs;
    this.allExternalDataObjs = cache_data.allExternalDataObjs;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      allCustomDataObjs: this.allCustomDataObjs,
      allExternalDataObjs: this.allExternalDataObjs,
    };
  },

  initialize() {
    this.cached_data = {};
    this.allCustomDataObjs = new CustomDataObjCollection();
    this.allExternalDataObjs = new ExternalCustomObjCollection();
  },

  /**
   * Clears the current notes in memory.
   * Does not flush any cached data.
   */
  clearInternalData() {
    this.allCustomDataObjs = new CustomDataObjCollection();
    this.allExternalDataObjs = new ExternalCustomObjCollection();

    IntakeAriDataParser.clear();
  },

  loadCustomDataObjsPromise(dispute_guid, searchParams) {
    const dfd = $.Deferred();

    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for load custom data objs notes`);
      return dfd.reject().promise();
    }
    const default_index = 0;
    const default_count = 999990;

    const params = $.param(_.extend({
      index: default_index,
      count: default_count
    }, searchParams));

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${apiLoadName}/${dispute_guid}?${params}`
    }).done(response => {
      this.allCustomDataObjs.reset(response);
      dfd.resolve(this.allCustomDataObjs);
    }).fail(dfd.reject);
    return dfd.promise();
  },
  
  getCustomDataObjByType(objectType) {
    return this.allCustomDataObjs.findWhere({ object_type: objectType });
  },

  addCustomDataObj(objectModel) {
    return this.allCustomDataObjs.push(objectModel, { merge: true });
  },

  getAllExternalObjs() {
    return this.allExternalDataObjs;
  },

  loadExternalDataObjsPromise(searchParams={}) {
    const params = $.param(Object.assign(({
      Index: 0,
      Count: 999990,
    }, searchParams)), true);
    
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${apiExternalLoadName}?${params}`
      }).done((response={}) => {
        this.allExternalDataObjs.reset(response?.external_custom_data_objects);
        this.allExternalDataObjs.totalAvailable = response?.total_available_records;
        res(this.allExternalDataObjs);
      }).fail(rej);
    });
  },

  loadExternalFilesForCustomDataObj(externalDataObjId) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${apiExternalFilesLoadName}/${externalDataObjId}`
      }).done(response => {
        res(new ExternalFile_collection(response));
      }).fail(rej)
    });
  },
  
  addExternalDataObj(objectModel) {
    return this.allExternalDataObjs.push(objectModel, { merge: true });
  },

});

_.extend(CustomDataObjManager.prototype, UtilityMixin);

const customDataObjManagerInstance = new CustomDataObjManager();

export default customDataObjManagerInstance;
