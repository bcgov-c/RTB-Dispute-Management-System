import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const api_name = 'internaluserprofile'
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'profile_id',

  defaults: {
    internal_user_id: null,
    profile_id: null,
    internal_user_status: null,
    profile_picture_id: null,
    signature_file_id: null,
    profile_nickname: null,
    profile_title: null,
    profile_description: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'profile_picture_id',
    'signature_file_id',
    'profile_nickname',
    'profile_title',
    'profile_description'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}${this.isNew() ? `/${this.get('internal_user_id')}` : ''}`;
  },
})