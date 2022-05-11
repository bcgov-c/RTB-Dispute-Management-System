import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import SearchInstanceCollection from '../../pages/search/SearchInstance_collection';
import SearchResultItemCollection from './SearchResultItem_collection';
import TaskCollection from '../../../core/components/tasks/Task_collection';

const api_load_dispute_name = 'disputefilenumber';
const api_load_dispute_info = 'disputeInfo';
const api_load_access_number_name = 'accesscode';
const api_load_participant_name = 'participants';
const api_status_name = 'disputestatus';
const api_hearing_name = 'hearing';
const api_claims_name = 'claims';
const api_cross_app = 'crossapplication';
const api_assigned_disputes = 'assigneddisputes';
const api_unassigned_disputes = 'unassigneddisputes';
const api_unassigned_tasks = 'unassignedtasks';
const api_load_undelivered_docs = 'outcomedocdelivery/undelivered';
const api_load_dispute_status_owners = 'search/disputestatusowners';
const api_load_dispute_message_owners = 'search/disputemessageowners';
const api_load_dispute_note_owners = 'search/disputenoteowners';
const api_load_dispute_document_owners = 'search/disputedocumentowners';

const taskChannel = Radio.channel('tasks');
const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');

const SearchManager = Marionette.Object.extend({
  channelName: 'searches',

  radioRequests: {
    'search:dispute': 'loadDispute',
    'search:dispute:direct': 'loadDisputeDirect',
    'search:disputeInfo': 'loadFromDisputeInfo',
    'search:crossApp': 'loadCrossAppDisputes',
    'search:accessNumber': 'loadFromAccessNumber',
    'search:participantName': 'loadFromParticipantNameInfo',
    'search:status': 'loadFromStatusInfo',
    'search:hearing': 'loadFromHearingInfo',
    'search:claim': 'loadFromClaimInfo',
    'search:user:disputes': 'loadUserDisputes',
    'search:unassigned:disputes': 'loadUnassignedDisputes',
    'search:unassigned:tasks': 'loadUnassignedTasks',
    'search:undelivered:docs': 'loadUndeliveredDocs',
    'search:dispute:messageOwners': 'loadDisputeMessageOwners',
    'search:dispute:noteOwners': 'loadDisputeNoteOwners',
    'search:dispute:statusOwners': 'loadDisputeStatusOwners',
    'search:dispute:documentOwners': 'loadDisputeDocumentOwners',
    'create:search': 'createSearchInstance',
    'get:search': 'getSearchInstance',
    'delete:search': 'deleteSearchInstance',
    'clear:cache': 'clearSearchInstances'
  },

  // NOTE: Search has a different API than the other endpoints, without "api" in name
  _getSearchRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}search/`;
  },

  loadDispute(file_number, _params=null) {
    const dfd = $.Deferred();
    if (!file_number) {
      console.log(`[Error] Need a file number for search:dispute`);
      return dfd.reject().promise();
    }

    const params = $.param(_.extend({
      FileNumber: file_number,
      IncludeNotActive: true,
    }, _params ? _params : {}));

    apiChannel.request('call', {
      type: 'GET',
      url: `${this._getSearchRoot()}${api_load_dispute_name}?${params}`
    }).done(response => {
      response = response || {};
      response.results = response.results || [];
      dfd.resolve(response.results);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadDisputeDirect(file_number) {
    // If any results, returns the first result dispute_GUID.
    // Used when searching for a file number outside of a search page, with no need to display results
    const dfd = $.Deferred();
    this.loadDispute(file_number, { IncludeNotActive: true })
      .done(results => {
        // If no dispute found return null
        dfd.resolve( _.isArray(results) && !_.isEmpty(results) ? results[0].dispute_guid : null);
      }).fail(dfd.reject);
    return dfd.promise();
  },

  loadFromAccessNumber(accessNumber) {
    if (!accessNumber) {
      console.log(`[Error] Need an access number for search`);
      return $.Deferred().reject().promise();
    }

    const dfd = $.Deferred();
    const searchParams = {
      AccessCode: accessNumber
    };

    apiChannel.request('call', {
      type: 'GET',
      url: `${this._getSearchRoot()}${api_load_access_number_name}?${$.param(searchParams)}`
    }).done(response => {
      // Mid-tier workaround: if no result returned, then none were found
      if (!response) response = { total_available_records: 0, results: [] };
      
      const searchResults = new SearchResultItemCollection();
      this.parseSearchResultCollectionResponseFromApi(searchResults, searchParams, response);
      dfd.resolve(searchResults);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  baseLoadInfoFromSearch(apiLoadName, searchParams, shallowSerialization=false) {
    const default_index = 0;
    const default_count = 99999;
    searchParams = _.extend({
      index: default_index,
      count: default_count
    }, searchParams);
    const dfd = $.Deferred();

    const filteredSearchParams = Object.keys(searchParams)
      .filter(key => !String(key).startsWith('_'))
      .reduce((obj, key) => {
        obj[key] = searchParams[key];
        return obj;
      }, {});
    
    apiChannel.request('call', {
      type: 'GET',
      url: `${this._getSearchRoot()}${apiLoadName}?${$.param(filteredSearchParams, shallowSerialization)}`
    }).done(response => {
      const searchResults = new SearchResultItemCollection();
      this.parseSearchResultCollectionResponseFromApi(searchResults, searchParams, response);
      dfd.resolve(searchResults);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  baseLoadInfoFromSearchWithShallowSerialization(apiLoadName, searchParams) {
    return this.baseLoadInfoFromSearch(apiLoadName, searchParams, true);
  },

  loadFromDisputeInfo(searchParams) {
    return this.baseLoadInfoFromSearch(api_load_dispute_info, searchParams);
  },

  loadFromParticipantNameInfo(searchParams) {
    return this.baseLoadInfoFromSearch(api_load_participant_name, searchParams);
  },

  loadFromStatusInfo(searchParams) {
    return this.baseLoadInfoFromSearch(api_status_name, searchParams);
  },

  loadFromHearingInfo(searchParams) {
    return this.baseLoadInfoFromSearch(api_hearing_name, searchParams);
  },

  loadFromClaimInfo(searchParams) {
    return this.baseLoadInfoFromSearchWithShallowSerialization(api_claims_name, searchParams);
  },

  loadCrossAppDisputes(searchParams) {
    return this.baseLoadInfoFromSearch(api_cross_app, searchParams);
  },

  loadUnassignedTasks(searchParams={}) {    
    // Apply some default index/counts in case of errors
    const default_index = 0;
    const default_count = 999990;
    searchParams = _.extend({
      index: default_index,
      count: default_count
    }, searchParams);
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_unassigned_tasks}?${$.param(searchParams, true)}`
    })
    .done(response => {
      const taskCollection = new TaskCollection();
      taskChannel.request('parse:task:response', taskCollection, searchParams, response);
      dfd.resolve(taskCollection);
    })
    .fail(dfd.reject);
    return dfd.promise();
  },

  loadUndeliveredDocs(options) {
    options = options || {};
    const dfd = $.Deferred();
    let params = $.param(_.extend({ index: 0, count: 999990 }, options));

    // This endpoint doesn't support [] notation, so strip it out
    params = params.replace(new RegExp('%5B%5D', 'g'), '');
    
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_undelivered_docs}?${params}`
    })
    .done(dfd.resolve)
    .fail(dfd.reject);
    return dfd.promise();
  },

  loadDisputeStatusOwners(searchParams={}) {
    const params = $.param(Object.assign({ index: 0, count: 999990 }, searchParams), true);

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_dispute_status_owners}?${params}`
      }).done(response => {
        const searchResults = new SearchResultItemCollection();
        this.parseSearchResultCollectionResponseFromApi(searchResults, params, response);
        res(searchResults);
      }).fail(rej);
    });
  },

  loadDisputeMessageOwners(searchParams={}) {
    const params = $.param(Object.assign({ index: 0, count: 999990 }, searchParams), true);

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_dispute_message_owners}?${params}`
      }).done(response => {
        const searchResults = new SearchResultItemCollection();
        this.parseSearchResultCollectionResponseFromApi(searchResults, params, response);
        res(searchResults);
      }).fail(rej);
    });
  },

  loadDisputeNoteOwners(searchParams={}) {
    const params = $.param(Object.assign({ index: 0, count: 999990 }, searchParams), true);

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_dispute_note_owners}?${params}`
      }).done(response => {
        const searchResults = new SearchResultItemCollection();
        this.parseSearchResultCollectionResponseFromApi(searchResults, params, response);
        res(searchResults);
      }).fail(rej);
    });
  },

  loadDisputeDocumentOwners(searchParams={}) {
    const params = $.param(Object.assign({ index: 0, count: 999990, hasFileId: true }, searchParams), true);

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_dispute_document_owners}?${params}`
      }).done(response => {
        const searchResults = new SearchResultItemCollection();
        this.parseSearchResultCollectionResponseFromApi(searchResults, params, response);
        res(searchResults);
      }).fail(rej);
    });
  },

  loadUnassignedDisputes(searchParams={}) {
    // Apply some default index/counts in case of errors
    const default_index = 0;
    const default_count = 999990;
    searchParams = _.extend({
      index: default_index,
      count: default_count
    }, searchParams);
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_unassigned_disputes}?${$.param(searchParams)}`
    }).done(response => {
      const searchResults = new SearchResultItemCollection();
      this.parseSearchResultCollectionResponseFromApi(searchResults, searchParams, response);
      dfd.resolve(searchResults);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadUserDisputes(user_id, searchParams={}) {
    // Apply some default index/counts in case of errors
    const default_index = 0;
    const default_count = 999990;
    searchParams = _.extend({
      index: default_index,
      count: default_count
    }, searchParams);
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_assigned_disputes}/${user_id}?${$.param(searchParams)}`
    }).done(response => {
      const searchResults = new SearchResultItemCollection();
      this.parseSearchResultCollectionResponseFromApi(searchResults, searchParams, response);
      dfd.resolve(searchResults);
    }).fail(dfd.reject);
    return dfd.promise();
  },


  parseSearchResultCollectionResponseFromApi(searchResultCollection, searchParams, response) {
    response = response || {};
    searchResultCollection.lastUsedRequest = searchParams;
    searchResultCollection.lastUsedFetchIndex = searchParams.index;
    searchResultCollection.lastUsedFetchCount = searchParams.count;
    searchResultCollection.totalAvailable = response.total_available_records;
    searchResultCollection.reset(response.items || response.results || [], { silent: true });
  },

  

  initialize() {
    this.searchInstanceCollection = new SearchInstanceCollection();
  },

  createSearchInstance() {
    return this.searchInstanceCollection.create();
  },

  getSearchInstance(instanceId) {
    const searchInstance = this.searchInstanceCollection.get(instanceId);
    if (!searchInstance) {
      console.log(`[Warning] Couldn't find a search instance for id ${instanceId}`);
      return;
    }
    return searchInstance;
  },

  deleteSearchInstance(searchInstance) {
    if (!searchInstance || !this.searchInstanceCollection.get(searchInstance)) {
      console.log(`[Warning] Couldn't find search`, searchInstance, this.searchInstanceCollection);
    }
    this.searchInstanceCollection.remove(searchInstance);
  },

  clearSearchInstances() {
    this.searchInstanceCollection = new SearchInstanceCollection();
  }

});

_.extend(SearchManager.prototype, UtilityMixin);

const searchManagerInstance = new SearchManager();

export default searchManagerInstance;
