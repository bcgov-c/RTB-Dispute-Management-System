/**
 * @class core.components.user.UserRole
 * @memberof core.components.user
 * @augments Backbone.Model
 */

import CMModel from '../../../core/components/model/CM_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');

const api_name = 'internaluserrole';

export default CMModel.extend({
  idAttribute: 'internal_user_role_id',

  defaults: {
    role_group_id: null,
    role_subtype_id: null,
    is_active: false, // This attribute is ignored in DMS since it is not using multiple roles
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
    engagement_type: null,
    managed_by_id: null,
    schedule_sub_status: null,
    access_sub_types: null,

    user_id: null // This needs to be passed in when creating the model
  },

  API_SAVE_ATTRS: [
    'role_group_id',
    'role_subtype_id',
    'engagement_type',
    'managed_by_id',
    'schedule_sub_status',
    'access_sub_types'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${ this.isNew() ? this.get('user_id') : '' }`;
  }
});
