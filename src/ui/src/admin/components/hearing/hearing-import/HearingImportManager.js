/**
 * @fileoverview - Manager that handles all functionality around hearing imports
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import HearingImportCollection from './HearingImport_collection';

const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');

const HearingImportManager = Marionette.Object.extend({
  channelName: 'schedule',

  radioRequests: {
    load: 'loadHearingImportsPromise',
    import: 'startImportPromise',
    get: 'getHearingImports',
    'get:import': 'getHearingImportPromise',    
    clear: 'clearData'
  },

  clearData() {
    this.initializeModels();
  },

  initialize() {
    this.initializeModels();  
  },

  initializeModels() {
    this.hearingImports = new HearingImportCollection();
  },

  getHearingImports() {
    return this.hearingImports;    
  },

  loadHearingImportsPromise() {
    const dfd = $.Deferred();
    
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}importhistoryrecords`
    }).done(response => {
      this.hearingImports = new HearingImportCollection(response);
      dfd.resolve(this.hearingImports);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  startImportPromise(hearing_import_model) {
    const dfd = $.Deferred();
    
    apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}importschedule`,
      data: JSON.stringify( hearing_import_model.pickWhitelistedAttrs(hearing_import_model.toJSON()) ),
      headers: {
        'Content-Type': 'application/json'
      },
      contentType: "application/json",
    }).done(response => {
      hearing_import_model.set(response);
      this.hearingImports.add(hearing_import_model);
      dfd.resolve(hearing_import_model);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  getHearingImportPromise(hearing_import_model) {
    const dfd = $.Deferred();
    
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}importhistoryrecord/${hearing_import_model.id}`
    }).done(response => {
      hearing_import_model.set(response);
      dfd.resolve(hearing_import_model);
    }).fail(dfd.reject);

    return dfd.promise();
  }

});

const hearingImportManagerInstance = new HearingImportManager();
export default hearingImportManagerInstance;
