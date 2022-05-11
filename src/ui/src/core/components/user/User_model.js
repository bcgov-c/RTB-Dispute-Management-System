/**
 * @class core.components.user.UserModel
 * @memberof core.components.user
 * @augments Backbone.Model
 */

import Radio from 'backbone.radio';

import CMModel from '../model/CM_model';
import UserRoleCollection from './UserRole_collection';
import InternalUserProfile from './InternalUserProfile_model';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');

export default CMModel.extend({
  idAttribute: 'user_id',

  defaults: {
    token: null,
    refresh_token: null,
    authenticated: false,
    email: null,
    internal_user_roles: null,
    is_active: null,
    user_admin: null,
    user_id: null,
    user_name: null,
    name: null,
    role_id: null,
    mobile: null,
    scheduler: null,
    schedule_manager: null,
    dashboard_access: null,
    modified_date: null,
    created_date: null,
    created_by: null,
    modified_by: null,

    // The associated user profile. Will be added in UserManager load
    profile: null,
  },

  API_ACTIVE_STATUS_ATTRS: [
    'is_active'
  ],

  API_UPDATE_ATTRS: [
    'full_name',
    'account_email',
    'account_mobile',
    'is_active',
    'scheduler',
    'schedule_manager',
    'dashboard_access'
  ],

  API_CREATE_ATTRS: [
    'accepts_text_messages',
    'account_email',
    'account_mobile',
    'admin_access',
    'full_name',
    'is_active',
    'password',
    'system_user_role_id',
    'username',
    'schedule_manager',
    'dashboard_access'
  ],

  nested_collections_data() {
    return {
      internal_user_roles: UserRoleCollection.extend({
        user_id: this.id
      })
    };
  },

  isAdminRole() {
    return this.getRoleId() === configChannel.request('get', 'USER_ROLE_GROUP_ADMIN');
  },

  isManagement() {
    return this.getRoleId() === configChannel.request('get', 'USER_ROLE_GROUP_MANAGEMENT');
  },

  isInformationOfficer() {
    return this.getRoleId() === configChannel.request('get', 'USER_ROLE_GROUP_IO');
  },

  isArbitrator() {
    return this.getRoleId() === configChannel.request('get', 'USER_ROLE_GROUP_ARB');
  },

  isInformationOfficerLead() {
    return this.isInformationOfficer() && ([
      configChannel.request('get', 'USER_SUBGROUP_SUPERVISOR'), configChannel.request('get', 'USER_SUBGROUP_SENIOR')
    ].includes(this.getRoleSubtypeId()));
  },

  isInformationOfficerSupervisor() {
    return this.isInformationOfficer() && this.getRoleSubtypeId() === configChannel.request('get', 'USER_SUBGROUP_SUPERVISOR');
  },

  isArbitratorLead() {
    return this.isArbitrator() && this.getRoleSubtypeId() === configChannel.request('get', 'USER_SUBGROUP_ARB_LEAD');
  },

  isAdjudicator() {
    return this.isArbitrator() && this.getRoleSubtypeId() === configChannel.request('get', 'USER_SUBGROUP_ADJUDICATOR');
  },

  isSuperUser() {
    return this.get('user_admin');
  },

  isScheduleManager() {
    return this.get('schedule_manager');
  },

  isScheduler() {
    return this.get('scheduler');
  },

  isSystemUser() {
    return this.get('role_id') === configChannel.request('get', 'USER_ROLE_TYPE_INTERNAL');
  },

  isOfficeUser() {
    return this.get('role_id') === configChannel.request('get', 'USER_ROLE_TYPE_OFFICE');
  },

  isActive() {
    return this.get('is_active');
  },

  isSystemArbitrator() {
    return this.id && this.id === userChannel.request('get:system:arb:id');
  },

  isDutyScheduler() {
    const schedulerSubStatus = this.getScheduleSubStatus();
    return (configChannel.request('get', 'SCHEDULE_SUB_STATUS_DUTY_CODES') || []).includes(schedulerSubStatus);
  },

  isEmergencyScheduler() {
    const schedulerSubStatus = this.getScheduleSubStatus();
    return (configChannel.request('get', 'SCHEDULE_SUB_STATUS_EMERGENCY_CODES') || []).includes(schedulerSubStatus);
  },

  isCeuUser() {
    return this.getRoleAccessSubtype() === configChannel.request('get', 'USER_ROLE_ACCESS_SUB_GROUP_CEU');
  },

  getEmail() {
    return this.get('email');
  },

  getDisplayName() {
    // NOTE: internal users will use "name", while external users and role2 users use "full_name"
    return this.isDisputeUser() ? this.get('full_name') : (this.get('name') || this.get('full_name'));
  },

  getUsername() {
    // NOTE: internal users will use "user_name", and external users use "full_name"
    return this.isDisputeUser() ? this.get('full_name') : (this.get('user_name') || this.get('username'));
  },

  isDisputeUser() {
    return !this.isNew() && this.get('user_name') && `${this.get('user_name')}`.startsWith(this.id);
  },

  isEngagementTypeEmployee() {
    const roleEngagement = this.getRoleEngagement();
    return roleEngagement === configChannel.request('get', 'USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE') ||
      roleEngagement === configChannel.request('get', 'USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE');
  },

  isEngagementTypeContractor() {
    const roleEngagement = this.getRoleEngagement();
    return roleEngagement === configChannel.request('get', 'USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR') ||
      roleEngagement === configChannel.request('get', 'USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR');
  },

  getProfile() {
    if (!this.get('profile')) {
      this.set('profile', new InternalUserProfile({ internal_user_id : this.id }));
    }
    return this.get('profile');
  },

  getRole() {
    return this.get('internal_user_roles').getActive();
  },

  getManagedById() {
    const role = this.getRole();
    return role ? role.get('managed_by_id') : null;
  },

  getRoleId() {
    const role = this.getRole();
    return role ? role.get('role_group_id') : null;
  },

  getRoleSubtypeId() {
    const role = this.getRole();
    return role ? role.get('role_subtype_id') : null;
  },

  getScheduleSubStatus() {
    const role = this.getRole();
    return role ? role.get('schedule_sub_status') : null;
  },

  getRoleDisplay() {
    const USER_ROLE_GROUP_MAPPINGS = configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS'),
      role_group_id = this.getRoleId();
    return _.has(USER_ROLE_GROUP_MAPPINGS, role_group_id) ? USER_ROLE_GROUP_MAPPINGS[role_group_id] : null;
  },

  getRoleEngagement() {
    const role = this.getRole();
    return role ? role.get('engagement_type') : null;
  },

  getRoleSubtypeDisplay() {
    const USER_ROLE_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY'),
      role_sub_type_id = this.getRoleSubtypeId();
    return _.has(USER_ROLE_TYPE_DISPLAY, role_sub_type_id) ? USER_ROLE_TYPE_DISPLAY[role_sub_type_id] : null;
  },

  getRoleAccessSubtype() {
    const role = this.getRole();
    return role ? role.get('access_sub_types') : null;
  },

  getActiveStatusApiData() {
    return _.pick(this.toJSON(), this.API_ACTIVE_STATUS_ATTRS);
  },

  getUpdateApiData() {
    const renames = {
      name: 'full_name',
      email: 'account_email',
      mobile: 'account_mobile'
    };

    const data = this.toJSON();
    _.each(_.keys(data), function(key) {
      if (renames[key]) {
        data[renames[key]] = data[key];
      }
    });
    return _.pick(data, this.API_UPDATE_ATTRS);
  },

  getCreateApiData() {
     const renames = {
      email: 'account_email',
      mobile: 'account_mobile',
      user_admin: 'admin_access',
      name: 'full_name',
      user_name: 'username',
      role_id: 'system_user_role_id'

      // No renames needed for following, because they are same name (is_active),
      // or they don't exist normally on user model anywys so can use the same name (password, accepts_text_messages)
      /*
      'is_active',
      'password',
      'accepts_text_messages',
      */
    };

    const data = this.toJSON();
    _.each(_.keys(data), function(key) {
      if (renames[key]) {
        data[renames[key]] = data[key];
      }
    });
    return _.pick(data, this.API_CREATE_ATTRS);
  }
});
