import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const api_name = 'outcomedoccontent';
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'custom_content_id',
  defaults: {
    custom_content_id: null,
    outcome_doc_file_id: null,
    content_type: null,
    content_sub_type: null,
    content_status: null,
    stored_content: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_POST_ONLY_ATTRS: [
    'outcome_doc_file_id',
    'content_type'
  ],

  API_SAVE_ATTRS: [
    "content_sub_type",
    "content_status",
    "stored_content"
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('outcome_doc_file_id')}` : '');
  },

  getContent() {
    return this.get('stored_content');
  }

});