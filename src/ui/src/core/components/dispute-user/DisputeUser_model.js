import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const apiBaseName = 'dispute/disputeUserActive';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'dispute_user_id',
  defaults: {
    created_by: null,
    created_date: null,
    dispute_guid: null,
    dispute_user_id: null,
    is_active: null,
    full_name: null,
    user_name: null,

    modified_by: null,
    modified_date: null,
    participant_id: null,
    system_user_id: null,
    system_user_role_id: null,
  },

  API_SAVE_ATTRS: [
    'is_active'
  ],

  isActive() {
    return !!this.get('is_active');
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiBaseName}`;
  },

  isSystemUser() {
    return this.get('system_user_role_id') === configChannel.request('get', 'USER_ROLE_TYPE_INTERNAL');
  },

  getUsername() {
    return this.get('user_name');
  },

  getDisplayName() {
    return this.get('full_name');
  },

  
  getRoleId() {
    return this.get('role_id');
  },


  getRoleDisplay() {
    const USER_ROLE_GROUP_MAPPINGS = configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS');
    const roleGroupId = this.getRoleId();
    return _.has(USER_ROLE_GROUP_MAPPINGS, roleGroupId) ? USER_ROLE_GROUP_MAPPINGS[roleGroupId] : null;
  }
})