import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';

const api_name = 'emailattachment';
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');

export default CMModel.extend({
  idAttribute: 'email_attachment_id',

  defaults: { 
    email_attachment_id: null,
    email_id: null,
    attachment_type: null,
    file_id: null,
    common_file_id: null,
    send_date: null,
    received_date: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'attachment_type',
    'file_id',
    'common_file_id'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('email_id')}` : '');
  },

  isTypeCommonFile() {
    return this.get('attachment_type') === configChannel.request('get', 'EMAIL_ATTACHMENT_TYPE_COMMONFILE');
  },

  getFileModel() {
    return this.isTypeCommonFile() ? filesChannel.request('get:commonfile', this.get('common_file_id')) :
      filesChannel.request('get:file', this.get('file_id'));
  },

});
