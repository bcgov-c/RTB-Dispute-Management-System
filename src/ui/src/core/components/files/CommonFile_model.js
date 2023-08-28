import FileModel from './File_model';
import Radio from 'backbone.radio';

const apiCommonFiles = 'commonfiles';
const configChannel = Radio.channel('config');

export default FileModel.extend({
  idAttribute: 'common_file_id',
  defaults() {
    return _.extend(FileModel.prototype.defaults, {
      common_file_id: null,
      common_file_guid: null,
      file_description: null,
    });
  },

  API_SAVE_ATTRS: [
    'file_type',
    'file_name',
    'file_title',
    'file_status',
    'file_description',
    'file_date'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiCommonFiles}`;
  },

  isStatusArchived() {
    return this.get('file_status') && this.get('file_status') === configChannel.request('get', 'COMMONFILE_STATUS_ARCHIVED');
  },

  isTypeHelp() {
    return this.get('file_type') && this.get('file_type') === configChannel.request('get', 'COMMONFILE_TYPE_HELP_FILE');
  },

  isTypeForm() {
    return this.get('file_type') && this.get('file_type') === configChannel.request('get', 'COMMONFILE_TYPE_RTB_FORM');
  },

  isTypeDocument() {
    return this.get('file_type') && this.get('file_type') === configChannel.request('get', 'COMMONFILE_TYPE_DOCUMENT');
  },

  isTypeReport() {
    return this.get('file_type') && this.get('file_type') === configChannel.request('get', 'COMMONFILE_TYPE_REPORT');
  }
});