/**
 * @fileoverview - Manager that offers functionality relating to DMS users and external users. 
 * @namespace core.components.user.UserManager
 * @memberof core.components.user
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UserCollection from './User_collection'
import InternalUserProfileCollection from './InternalUserProfile_collection';
import DisputeUserCollection from '../dispute-user/DisputeUser_collection';
import UserModel from './User_model';

const SYSTEM_ARB_NAME = 'SystemArbitrator';
const SYSTEM_USER_NAMES = [
  'SystemAdmin',
  'SystemArbitrator',
  'admin',
  'ETLAdmin',
  'SeniorIOQueue',
  'ArbManagerQueue',
];
const QUEUE_USER_NAMES = [
  'SeniorIOQueue',
  'ArbManagerQueue',
];

const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');
const disputeChannel = Radio.channel('dispute');

const api_name_load_internal_user_profile = 'internaluserprofile';
const api_name_load_internal_users = 'users/internaluserslist';
const api_name_update_user = 'userlogin/update';
const api_name_create_user = 'userlogin/create';
const api_name_update_user_status = 'users/internaluserstatus';
const api_dispute_users = 'dispute/disputeusers';

const _UserManager = Marionette.Object.extend({
  /**
   * @class core.components.user.UserManagerClass
   * @memberof core.components.user
   * @augments Marionette.Object
   */
  channelName: 'users',

  radioRequests: {
    'get:user:name': 'getNameFromUserId',
    'get:user': 'getUserFromUserId',
    'get:system:arb:id': 'getSystemArbId',

    // Below methods should only be used if only a user_id is avail
    // If the caller has a userModel, then should call correct method on userModel
    'get:user:role': 'getRoleIdFromUserId',
    'get:role:display': 'getRoleDisplayFromRoleGroupId',
    'get:roletype:display': 'getRoleSubTypeDisplayFromRoleGroupId',
    'get:user:role:display': 'getRoleDisplayFromUserId',
    'get:roletypes': 'getAllRoleSubTypes',
    'get:roletypes:by:role': 'getRoleSubTypesByRole',
    
    'get:all:users' : 'getInternalUsers',
    'get:dispute:users': 'getDisputeUsers',
    'get:users:by:role' : 'getUsersByRoles',
    'get:arbs': 'getArbitratorUsers',
    'get:ios': 'getIOUsers',
    'get:schedulers': 'getSchedulerUsers',
    'get:profiles' : 'getInternalUserProfiles',
    'load:users' : 'loadInternalUsersPromise',
    'load:dispute:users': 'loadDisputeUsers',

    'set:active' : 'setUserActiveStatus',
    'update:user' : 'updateUser',
    'create:user': 'createUser',

    clear: 'clearInternalData',
    
    'cache:current': 'cacheCurrentData',
    'clear:dispute': 'clearDisputeData',
    'cache:load': 'loadCachedFor',
  },

  internal_users_collection: null,

  /**
   * Saves current amendment data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },
  
  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this UserManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.disputeUsers = cache_data.disputeUsers;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      disputeUsers: this.disputeUsers
    };
  },

  /**
   * Clears the current documents in memory.
   * Does not flush any cached data.
   */
  clearInternalData() {
    this.disputeUsers = new DisputeUserCollection();
  },

  initialize() {
    this.cached_data = {};
    this.internal_users_collection = new UserCollection();
    this.disputeUsers = new DisputeUserCollection();
    this.userProfiles = new InternalUserProfileCollection();
  },

  userLoginStatusChange(model, value) {//TODO: duplicate from SessionManager, remove?
    const channel = this.getChannel();
    if (model.previous('token') === null && value !== null) {
      channel.trigger('login:complete');
    } else if (model.previous('token') !== null && value === null) {
      channel.trigger('logout:complete');
    }
  },
  
  _withInactiveFilter(userModels) {
    return _.filter(userModels, function(userModel) {
      return userModel.isActive();
    });
  },

  // Returns any internal user models that match the role group id, or array of role group ids passed in
  getUsersByRoles(role_group_id_list, options={}) {
    role_group_id_list = _.isArray(role_group_id_list) ? role_group_id_list : [role_group_id_list];
    let systemUserNames = SYSTEM_USER_NAMES;
    if (options.queue_users) systemUserNames = systemUserNames.filter(username => !QUEUE_USER_NAMES.includes(username))

    const userModels = this.internal_users_collection.filter(userModel => (
      !systemUserNames.includes(userModel.get('user_name')) &&
      _.any(role_group_id_list, (groupId) => Number(userModel.getRoleId()) === Number(groupId))
    ));

    return options.all ? userModels : this._withInactiveFilter(userModels);
  },

  getArbitratorUsers(options) {
    return this.getUsersByRoles(configChannel.request('get', 'USER_ROLE_GROUP_ARB'), options);
  },

  getIOUsers(options) {
    return this.getUsersByRoles(configChannel.request('get', 'USER_ROLE_GROUP_IO'), options);
  },

  getSchedulerUsers(options) {
    const systemArbId = this.getSystemArbId() || -1;
    const schedulerUserModels = this.internal_users_collection.filter(userModel => userModel.id !== systemArbId  && userModel.isScheduler());
    return options.all ? schedulerUserModels : this._withInactiveFilter(schedulerUserModels);
  },

  getSystemArbId() {
    const systemArb = this.internal_users_collection.findWhere({ user_name: SYSTEM_ARB_NAME });
    return systemArb ? systemArb.id : null;
  },

  getUserFromUserId(user_id) {
    if (!user_id) return user_id;
    const internalUser = this.internal_users_collection.findWhere({ user_id });
    const externalDisputeUser = this.disputeUsers.findWhere({ system_user_id: user_id });
    
    if (internalUser) {
      return internalUser;
    } else if (externalDisputeUser) {
      const userModel = new UserModel(externalDisputeUser.attributes);
      userModel.set({ 
        name: externalDisputeUser.get('full_name'),
        user_id: externalDisputeUser.get('system_user_id'),
        role_id: externalDisputeUser.get('system_user_role_id') ,
      });

      return userModel;
    } else {
      return null;
    }
  },

  getNameFromUserId(user_id) {
    if (user_id === configChannel.request('get', 'SYSTEM_USER_ID')) {
      return configChannel.request('get', 'SYSTEM_USER_NAME');
    }

    const matching_user = this.getUserFromUserId(user_id);
    return matching_user ? matching_user.getDisplayName() : configChannel.request('get', 'SYSTEM_USER_NAME');
  },

  getRoleIdFromUserId(user_id) {
    const matching_user = this.getUserFromUserId(user_id);
    if (!matching_user) return;
    return matching_user.getRoleId();
  },

  getRoleDisplayFromUserId(user_id) {
    const matching_user = this.getUserFromUserId(user_id);
    return matching_user.getRoleDisplay();
  },

  getRoleDisplayFromRoleGroupId(role_group_id) {
    const USER_ROLE_GROUP_MAPPINGS = configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS');
    if (!_.has(USER_ROLE_GROUP_MAPPINGS, role_group_id)) {
      return null;
    }
    return USER_ROLE_GROUP_MAPPINGS[role_group_id];
  },

  getRoleSubTypeDisplayFromRoleGroupId(role_group_subtype_id) {
    const USER_ROLE_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY');
    if (!_.has(USER_ROLE_TYPE_DISPLAY, role_group_subtype_id)) {
      return null;
    }
    return USER_ROLE_TYPE_DISPLAY[role_group_subtype_id];
  },

  _getRoleSubTypes() {
    return configChannel.request('get', 'ROLE_GROUP_TO_SUB_GROUP_MAPPINGS');
  },

  getAllRoleSubTypes() {
    return _.flatten(_.values(this._getRoleSubTypes()));
  },

  getRoleSubTypesByRole(role_group_id) {
    const ROLE_GROUP_TO_SUB_GROUP_MAPPINGS = this._getRoleSubTypes();
    if (!_.has(ROLE_GROUP_TO_SUB_GROUP_MAPPINGS, role_group_id)) {
      //console.log(`[Warning] Couldn't find a display role group subtype id: ${role_group_id}`);
      return null;
    }
    return ROLE_GROUP_TO_SUB_GROUP_MAPPINGS[role_group_id];
  },

  getInternalUsers() {
    return this.internal_users_collection;
  },

  getInternalUserProfiles() {
    return this.userProfiles;
  },

  loadInternalUsersPromise(token) {
    return apiChannel.request('call', {
      method: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name_load_internal_user_profile}`
    }, token)
    .then(userProfiles => {
      this.userProfiles.reset(userProfiles);
      return apiChannel.request('call', {
        method: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name_load_internal_users}`,
      }, token)
    }).then(userResponse => {
      this.internal_users_collection.reset(userResponse);
      this.internal_users_collection.forEach(user => {
        const matchingProfile = this.userProfiles.findWhere({ internal_user_id: user.id });
        user.set('profile', matchingProfile || null);
      });
    });
  },

  loadDisputeUsers(disputeGuid) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_dispute_users}/${disputeGuid}`
      }).done(response => {
        this.disputeUsers.reset(response);
        res(this.disputeUsers);
      }).fail(rej);
    });
  },

  getDisputeUsers() {
    return this.disputeUsers;
  },

  setUserActiveStatus(userModel) {
    return apiChannel.request('patch', {
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name_update_user_status}/${userModel.get('user_id')}`,
      _patch_data: userModel.getActiveStatusApiData()
    });
  },

  updateUser(userModel) {
    const updateUserPromise = apiChannel.request('patch', {
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name_update_user}/${userModel.get('user_id')}`,
      _patch_data: userModel.getUpdateApiData()
    }); 
    // NOTE: Performs an API call every time, doesn't check if needed
    return $.whenAll(
      updateUserPromise, 
      userModel.getRole().save(userModel.getRole().getApiChangesOnly())
    );
  },


  createUser(userModel) {
    const dfd = $.Deferred();
    apiChannel.request('call', {
      method: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name_create_user}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(userModel.getCreateApiData())
    }).done(function(response) {
      // Different field names in the create API; have to merge back into model
      response = response || {};
      userModel.set('user_id', response.system_user_id);
      dfd.resolve(userModel);
    }).fail(dfd.reject);
    return dfd.promise();
  }

});

export const UserManager = new _UserManager();
export { SYSTEM_USER_NAMES };
export { QUEUE_USER_NAMES };
