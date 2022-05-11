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
});