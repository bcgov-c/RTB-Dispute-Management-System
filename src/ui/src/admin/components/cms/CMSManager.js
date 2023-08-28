/**
 * @fileoverview - Manager for handling CMS functionality such as searching CMS file numbers and advanced CMS searches
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CMSArchiveModel from './CMSArchive_model';

const api_load_file_number_name = 'cmsarchive/cmsrecord';
const api_create_note_name = 'cmsarchive/cmsrecordnote';
const api_search_name = 'cmsarchive';
const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');

const CMSManager = Marionette.Object.extend({
  channelName: 'cms',

  radioRequests: {
    'load:filenumber': 'loadCMSArchiveWithFileNumber',
    'create:note': 'createNote',
    'add:dms:filenumber': 'addDmsFileNumber',
    'search': 'search'
  },

  createNote(file_number, note, created_by) {
    const dfd = $.Deferred();
    const params = $.param(_.extend({
      CMS_Note: note,
      Created_By: created_by
    }));

    apiChannel.request('call', {
      method: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_create_note_name}/${file_number}?${params}`,
    })
    .done(dfd.resolve)
    .fail(dfd.reject);

    return dfd.promise();
  },

  loadCMSArchiveWithFileNumber(file_number) {
    const dfd = $.Deferred();

    if (!file_number) {
      console.log(`[Error] Need a file_number to load CMS Archive.`);
      return dfd.resolve().promise();
    }

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_file_number_name}/${file_number}`,
    }).done(response => {
      response = response || {};
      response.cms_records = _.sortBy(response.cms_records, record => Moment(record.created_date).unix());
      dfd.resolve(new CMSArchiveModel(response));
    }).fail(dfd.reject);

    return dfd.promise();
  },

  addDmsFileNumber(file_number, data) {
    return apiChannel.request('patch', {
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_file_number_name}/${file_number}`,
      _patch_data: data
    });
  },

  search(request_params) {
    if (!request_params) {
      console.log(`[Error] - Please provide paramaters for searching CMS.`);
    }

    const dfd = $.Deferred();
    const params = $.param(_.extend(request_params));

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_search_name}?${params}`,
    }).done(function(response) {
      response = response || {};
      dfd.resolve(response.cms_archive_search_results || []);
    }).fail(dfd.reject);

    return dfd.promise();
  }

});

const cmsManagerInstance = new CMSManager();
export default cmsManagerInstance;
