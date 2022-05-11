/**
 * Used to provide extra lookup functionality to the configChannel during CEU operation
*/
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import IntakeCeuDataParser from '../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import File_model from '../../../core/components/files/File_model';

const ceu_files_api_name = `externalfiles`;

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

const CeuFilesHelper = Marionette.Object.extend({ 
  channelName: 'files',

  radioRequests: {
    'get:pending:ceu': 'getPendingFiles',
    'add:pending:ceu': 'addPendingFile',
    'remove:pending:ceu': 'removePendingFile',
    'clear:pending:ceu': 'clearPendingFiles',

    'upload:pdf:ceu' : 'uploadPDF',

    // Override a core request
    'get:fileupload:url:ceu': 'getCeuFileUploadUrl'
  },

  initialize() {
    this.sessionFiles = {};
  },

  getPendingFiles() {
    return this.sessionFiles;
  },

  addPendingFile(evidenceData={}, fileModel) {
    const files = this.getPendingFiles();
    if (!fileModel.get('f_file_guid')) fileModel.set('f_file_guid', UtilityMixin.util_generateUUIDv4());
    files[fileModel.get('f_file_guid')] = {
      fileModel,
      evidenceData,
    };
  },

  removePendingFile(file) {
    const files = this.getPendingFiles();
    if (file && file.get('f_file_guid')) delete files[file.get('f_file_guid')];
  },

  clearPendingFiles() {
    return this.sessionFiles = {};
  },

  getCeuFileUploadUrl() {
    const withSessionToken = (url) => {
      if (sessionChannel.request('is:login:external')) return `${url}/externalsession/${sessionChannel.request('token')}`;
      else return url;
    };

    const endpointUrl = `${configChannel.request('get', 'API_ROOT_URL')}${ceu_files_api_name}/${IntakeCeuDataParser.getLoadedId()}`;
    return withSessionToken(endpointUrl);
  },

  uploadPDF(externalDataModel, pdfData={}) {
    const postData = _.extend({
      generation_template: 1,
      file_type: 1,
    }, pdfData);

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'POST',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${ceu_files_api_name}/PDFfromhtml/${externalDataModel.id}/externalsession/${sessionChannel.request('token')}`,
        data: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        },
        contentType: "application/json",
        crossDomain: true,
        dataType: 'json'
      })
      .done(response => {
        const fileModel = new File_model(response);
        res(fileModel);
      })
      .fail(rej);
    });
  }

});

 export default new CeuFilesHelper();
 