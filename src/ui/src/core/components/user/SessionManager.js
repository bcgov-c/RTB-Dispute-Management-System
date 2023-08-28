/**
 * @namespace core.components.user.SessionManager
 * @memberof core.components.user
 * @fileoverview - Manager that handles application authorization, token management, internal site re-directs, and general session management
 */

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UserModel from './User_model';
import ModalTimeout from '../modals/modal-timeout/ModalTimeout';
import UtilityMixin from '../../utilities/UtilityMixin';

const TIMEOUT_INTERNAL_PADDING_TIME_MS = 10000;
const api_name = 'users';
const api_access_code_recovery = 'accesscoderecovery';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const apiChannel = Radio.channel('api');
const userChannel = Radio.channel('users');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const timerChannel = Radio.channel('timers');

// Old(ish) IE compatible method of adding and removing event listeners
let addListener, removeListener;
if (document.addEventListener) {
  addListener = function (el, evt, f) { return el.addEventListener(evt, f, false); };
  removeListener = function (el, evt, f) { return el.removeEventListener(evt, f, false); };
} else {
  addListener = function (el, evt, f) { return el.attachEvent('on' + evt, f); };
  removeListener = function (el, evt, f) { return el.detachEvent('on' + evt, f); };
}

const SessionManager = Marionette.Object.extend({
  /**
   * @class core.components.user.UserManagerClass
   * @memberof core.components.user
   * @augments Marionette.Object
   */
  channelName: 'session',

  radioRequests: {
    authorize: 'authorizeUser',
    'authorize:token': 'authorizeUserToken',
    'authenticate:promise': 'authorizeAndReturnToken',
    token: 'getToken',
    'get:refresh:token': 'getRefreshToken',
    name: 'getName',
    'is:authorized': 'isUserAuthorized',
    'is:admin': 'isUserAnAdmin',
    'is:scheduler': 'isUserAScheduler',
    'is:active:admin': 'isUserActiveAdmin',
    'get:user': 'getCurrentUser',
    'get:user:id': 'getCurrentUserId',
    'get:active:participant:id': 'getActiveParticipantId',
    'get:active:api': 'getActiveApiCalls',
    'add:active:api': 'addActiveApiCall',
    'remove:active:api': 'removeActiveApiCall',
    'set:user:name': 'setUserName',
    'set:active:participant:id': 'setActiveParticipantId',
    'set:login:type': 'setLoginType',
    'set:login:external': 'setLoginToExternal',
    'load:user:details': 'loadUserDetails',
    'is:login:siteminder': 'isLoginSiteminder',
    'is:login:external': 'isLoginExternal',
    'is:mobile': 'isMobile',
    'check:token': 'checkToken',
    'clear:token': 'clearToken',
    'refresh:session': 'refreshSessionTime',
    'create:timers': 'createLogoutTimers',
    'clear:timers': 'clearLogoutTimers',
    'recover:accesscode': 'accessCodeRecovery'
  },

  radioEvents: {
    'logout:start': 'logoutWithRedirect',
    'redirect:login': 'redirectToLogin',
    'redirect:logout': 'redirectToLogout',
    'redirect:server:error': 'redirectToServerErrorPage',
    'redirect:config:error': 'redirectToConfigErrorPage',
    'redirect:disputeAccess': 'redirectToDisputeAccess',
  },

  isMobile() {
    return sessionStorage.mobile || navigator.userAgent.toLowerCase().indexOf('mobi') > -1;
  },

  initialize() {
    this.initializeDefaultData();
    
    this.listenTo(this.getChannel(), 'logout:complete', function() {
      modalChannel.request('remove:all');

      timerChannel.request('stop:timer', 'logoutWarningTimer');
      timerChannel.request('stop:timer', 'logoutTimer');
      this.initializeDefaultData();
    }, this);
  },

  initializeDefaultData() {
    this.isExternalToken = false;
    this.user = new UserModel();
    this.user.on('change:token', this.userLoginStatusChange, this);
    this.activeApiCalls = [];
  },

  getCurrentUser() {
    // Try to return the user model loaded in internal users list first
    const user_model = userChannel.request('get:user', this.user.get('user_id'));
    if (user_model) {
      user_model.set('token', this.user.get('token'), { silent: true });
    }
    return user_model ? user_model : this.user;
  },

  getCurrentUserId() {
    return this.user.get('user_id');
  },

  userLoginStatusChange(model, value) {
    // If the token has been invalidated, trigger logout event.
    // In that case, or if initially logging in, reset last active timeout time
    if (model.previous('token') !== null && value === null) {
      sessionStorage.setItem('lastActiveTime', null);
      this.getChannel().trigger('logout:complete');
    } else if (!model.previous('token')) {
      sessionStorage.setItem('lastActiveTime', null);
    }
  },

  refreshSessionTime() {
    const dfd = $.Deferred();
    this.extendSession().done(function(response) {
      response = response || {};

      const test_timeout_ms = configChannel.request('get', 'TEST_TIMEOUT_INTERVAL_MS')
      if (_.isNumber(test_timeout_ms) && test_timeout_ms > 0) {
        response.session_time_remaining = test_timeout_ms / 1000;
      }

      // If no session time is remaining, return 0 seconds left
      dfd.resolve(response.session_time_remaining || 0);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  checkToken(token) {
    const options = { headers: { Token: token } };
    return this.extendSession(options);
  },

  authorizeUserToken(loginToken, options) {
    this.user.set('token', loginToken);
    this._loginComplete(options);
  },

  loadUserDetails(token) {
    // For example, only show authenticated=true when internal users and currentInfo is success?
    this.user.set({
      token,
      authenticated: true
    });

    const dfd = $.Deferred();
    const self = this;
    this.currentInfoPromise(token).done(function(current_user_response) {
      self.user.set(self.user.parse(
        _.extend(current_user_response, { authenticated: true },
          // Only set the name if it exists
          current_user_response && current_user_response[0] && current_user_response[0].name ?
            { username: current_user_response[0].name } : {}
        )
      ));
      
      dfd.resolve();
    }).fail(function(err) {
      console.log(`[Warning] Couldn't retrieve detailed info about current user`);
      self._loginComplete();
      dfd.reject(err);
    });

    return dfd.promise();
  },

  authorizeUser(loginUsername, password, accountType) {
    this.getChannel().trigger('login:start');
    
    const dfd = $.Deferred();
    const self = this;

    this.user.set({
      authenticated: false,
      username: loginUsername
    });
    this.authorizePromise(loginUsername, password, accountType)
      .done(function(authData, authTextStatus, authRequest) {
        // If user is authorized, make another request to get all user info
        const token = authRequest.getResponseHeader('Token');
        self.loadUserDetails(token).done(dfd.resolve).fail(dfd.reject);
      })
      .fail(dfd.reject);

    return dfd.promise();
  },

  _loginComplete(options) {
    this.getChannel().trigger('login:complete', options);
  },

  setActiveParticipantId(participant_id) {
    if (!this.user) {
      return;
    }
    this.user.set('active_participant_id', participant_id);
  },

  getActiveParticipantId() {
    const saved_active_id = this.user && this.user.get('active_participant_id');
    // If not active ID has been saved on the user, try returning the primary applicant's ID
    return saved_active_id ? saved_active_id : participantsChannel.request('get:primaryApplicant:id');
  },

  setLoginType(type) {
    this.loginType = type;
  },

  setLoginToExternal() {
    this.isExternalToken = true;
  },

  isLoginSiteminder() {
    return this.loginType === configChannel.request('get', 'SYSTEM_LOGIN_TYPE_SITEMINDER');
  },

  isLoginExternal() {
    return this.isExternalToken;
  },

  getToken() {
    return this.user.get('token');
  },

  getRefreshToken() {
    this.user.get('refresh_token');
  },

  clearToken() {
    this.user.set('token', null);
    this.user.set('refresh_token');
  },

  getName() {
    return this.user.getUsername();
  },

  setUserName(username) {
    this.user.set('username', username);
  },

  isUserAuthorized() {
    return this.user.get('token') !== null;
  },

  isActive() {
    return this.user.get('is_active');
  },

  isUserActiveAdmin() {
    return this.isUserAnAdmin() && this.isActive();
  },

  isUserAnAdmin() {
    return this.user.isSuperUser();
  },

  isUserAScheduler() {
    return this.user.isScheduler();
  },

  _createEncodedLoginCredentials(username, password) {
    return btoa(username + ':' + password);
  },

  authorizeAndReturnToken(loginUsername, password, accountType) {
    const dfd = $.Deferred();
    this.authorizePromise(loginUsername, password, accountType)
      .done(function(authData, authTextStatus, authRequest) {
        // If user is authorized, make another request to get all user info
        const token = authRequest.getResponseHeader('Token');
        dfd.resolve(token);
      }).fail(dfd.reject);
    
    return dfd.promise();
  },


  authorizePromise(username, password) {
    return apiChannel.request('call', {
      method: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/authenticate`,
      headers: {
        'Authorization': 'Basic ' + this._createEncodedLoginCredentials(username, password)
      }
    });
  },

  currentInfoPromise(token) {
    // Pass in a token here so that we don't have to have token set (and cause the handlers to run)
    return apiChannel.request('call', {
      method: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/currentuserinfo`
    }, token);
  },

  extendSession(apiRequestOptions) {
    return apiChannel.request('call', Object.assign({
        method: 'POST',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/extendsession`
      }, apiRequestOptions));
  },

  updateLastActiveTime() {
    // Only update the session activity if we are logged in (i.e. there is a token)
    if (!this.getToken()) {
      return;
    }

    const modal = this.logoutWarningModal;
    const lastActiveTime = new Date(sessionStorage.getItem('lastActiveTime')).getTime();
    const logoutTimer = timerChannel.request('get:timer', 'logoutTimer');
    const currentTime = Date.now();
    const isSessionExpired = logoutTimer && lastActiveTime ? currentTime - lastActiveTime > logoutTimer.timeout_ms + configChannel.request('get', 'TIMEOUT_WARNING_OFFSET_MS') : false;

    if (isSessionExpired) {
      sessionStorage.setItem('lastActiveTime', new Date().toISOString());
      return this.logoutWithRedirect();
    }
    
    // Don't count activity time while the warning modal is displayed.
    // Note: use the data on bs.modal, isRendered will always display true if the modal has
    // previously been shown - this is known behavior
    let modalIsDisplayed = false;
    if (modal && typeof modal === 'object') {
      // Modal may exist but hasn't been initialized as its data doesn't exist
      if (typeof modal.$el.data('bs.modal') === 'object' && modal.$el.data('bs.modal').isShown === true) {
        modalIsDisplayed = true;
      }
    }

    if (modalIsDisplayed === false) {
      sessionStorage.setItem('lastActiveTime', new Date().toISOString());
    }
  },

  createMousemoveListener() {
    addListener(document, 'mousemove', this.updateLastActiveTime.bind(this));
  },

  removeMousemoveListener() {
    removeListener(document, 'mousemove', this.updateLastActiveTime.bind(this));
  },

  getActiveApiCalls() {
    return this.activeApiCalls.map(c => c);
  },

  addActiveApiCall(apiCallAttrs={}, customDescription='') {
    const generatedId = UtilityMixin.util_generateUUIDv4();
    const callItem = Object.assign({
      id: generatedId,
      data: apiCallAttrs,
    }, customDescription ? { description: customDescription } : null);
    this.activeApiCalls.push(callItem);
    return generatedId;
  },

  removeActiveApiCall(activeApiCallId=null) {
    this.activeApiCalls = this.activeApiCalls.filter(call => call.id !== activeApiCallId);
  },

  clearLogoutTimers() {
    timerChannel.request('stop:timer', 'logoutTimer');
    timerChannel.request('stop:timer', 'logoutWarningTimer');
  },

  createLogoutTimers(options) {
    options = options || {};

    const getTimeoutValues = new Promise((resolve, reject) => {
      const timeouts = {
        // Not sure how to pull those default configs in
        test_timeout_ms: configChannel.request('get', 'TEST_TIMEOUT_INTERVAL_MS'),
        logout_timeout_ms: configChannel.request('get', 'DEFAULT_TIMEOUT_INTERVAL_MS'),
        warning_offset_ms: configChannel.request('get', 'TIMEOUT_WARNING_OFFSET_MS')
      };

      (options.skip_api_refresh ? $.Deferred().resolve().promise() : this.extendSession())
        .done(response => {
          response = response || {};
          timeouts.logout_timeout_ms = (timeouts.test_timeout_ms > 0) ? timeouts.test_timeout_ms : response.session_time_remaining * 1000;
          resolve(timeouts);
        }).fail(() => {
          reject();
        });
    });

    getTimeoutValues.then((timeouts) => {
      // createLogoutTimer and createLogoutWarningTimer must be run first or this.logoutWarningModal won't exist
      const logoutTimer = this.createLogoutTimer(timeouts.logout_timeout_ms);
      this.createLogoutWarningTimer(logoutTimer, timeouts.logout_timeout_ms, timeouts.warning_offset_ms);
      
      // Reset lastActiveTime as we are re-initializing our login timers etc
      this.createMousemoveListener();
    })
    .catch(() => {});
  },

  /**
   * Creates the actual logout timer.
   * @param logout_timeout_ms
   */
  createLogoutTimer(logout_timeout_ms) {
    const logoutTimer = timerChannel.request('create', {
      name: 'logoutTimer',
      expiration_fn: () => {
        timerChannel.request('stop:timer', 'logoutTimer');
        this.logoutWithRedirect();
      },
      timeout_ms: logout_timeout_ms
    });

    return logoutTimer;
  },

  /**
   * Initiates access code recovery and emails the user their access code
   * @param {number} filenumber
   * @param {email} email 
   */
  accessCodeRecovery(requestData) {

    return apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_access_code_recovery}?${$.param(requestData)}`
    });
  },

  /**
   * Creates the logout warning modal and attaches it to a timer. If user chooses to stay logged in,
   * extend the session.
   *
   * @param logoutTimer
   * @param logout_timeout_ms
   * @param warning_offset_ms
   */
  createLogoutWarningTimer(logoutTimer, logout_timeout_ms, warning_offset_ms) {
    const warning_timeout_ms = logout_timeout_ms - (warning_offset_ms ? warning_offset_ms : logout_timeout_ms);

    if (!warning_offset_ms || !warning_timeout_ms) {
      return;
    }

    if (!logoutTimer) {
      console.log('[Error] Attempted to create a logout warning timer without supplying a timer instance');
      return;
    }

    
    let modalTimeout;
    const onRefreshSessionTime = (autoExtendSession, seconds_remaining) => {
      // Apply the warning offset again based on the returned session time
      let ms_remaining = seconds_remaining * 1000;

      // Add a small padding amount to warning timer so that the countdown modal shows a bit earlier
      // This is to allow the buttons on the modal to not run up against an auto-timeout as the timer counts towards 1 or 2 seconds left
      const warning_ms_remaining = ms_remaining > (warning_offset_ms - TIMEOUT_INTERNAL_PADDING_TIME_MS) ? ms_remaining - warning_offset_ms - TIMEOUT_INTERNAL_PADDING_TIME_MS : 0;

      // If there is no time remaining for the warning, expire the timer automatically
      if (!warning_ms_remaining) {
        ms_remaining = 0;
      }
      timerChannel.request('refresh:timer', 'logoutTimer', ms_remaining);

      // Neither modalTimeout or logoutWarningTimer will exist if autoExtendSession is true
      if (!autoExtendSession) {
        timerChannel.request('refresh:timer', 'logoutWarningTimer', warning_ms_remaining);
        try { modalChannel.request('remove', modalTimeout); } catch (e) {}
      }
    }

    const logoutWarningTimer = timerChannel.request('create', {
      name: 'logoutWarningTimer',
      expiration_fn: () => {
        // Check to see if activity occurred - if so, automatically extend the session
        let autoExtendSession = false;
        const lastActiveTime = new Date(sessionStorage.getItem('lastActiveTime')).getTime();
        let sessionStartTime = null;

        if (lastActiveTime) {
          // Use the last active timestamp on the timer (1s poll rate)
          sessionStartTime = new Date(logoutTimer._last_active_timestamp).getTime();

          // Add a bit of padding to the session start time in this comparison to create a small "dead zone".
          // This is to prevent the user activty that causes API calls to be counted towards activity in that next timeout window that is started after that API call returns
          if (lastActiveTime > (sessionStartTime + TIMEOUT_INTERNAL_PADDING_TIME_MS)) {
            // User has activated the mouse
            autoExtendSession = true;
          }
        }

        // If there are active api calls automatically extend the session
        if (this.getActiveApiCalls()?.length) {
          autoExtendSession = true;
        }

        if (autoExtendSession) {
          console.log('[Info] Activity detected - auto-extend session');
          this.refreshSessionTime().done( onRefreshSessionTime.bind(this, autoExtendSession) )
          .fail(() => {
            console.log(`[Error] Couldn't keep user session active`);
            this.logoutWithRedirect();
          });
        } else {
          // Display modal
          modalTimeout = new ModalTimeout();
          this.listenTo(modalTimeout, 'login', () => {
            loaderChannel.trigger('page:load');
            this.refreshSessionTime().done(seconds_remaining => {
              loaderChannel.trigger('page:load:complete');

              onRefreshSessionTime(autoExtendSession, seconds_remaining);
            }).fail(() => {
              loaderChannel.trigger('page:load:complete');
              console.log(`[Error] Couldn't keep user session active`);
              this.logoutWithRedirect();
            });
          }, this);

          this.listenTo(modalTimeout, 'logout', () => {
            this.logoutWithRedirect();
          }, this);

          modalChannel.request('add', modalTimeout);
        }
      },

      // Add a small padding amount to warning timer so that the countdown modal shows a bit earlier
      // This is to allow the buttons on the modal to not run up against an auto-timeout as the timer counts towards 1 or 2 seconds left
      timeout_ms: (warning_timeout_ms - TIMEOUT_INTERNAL_PADDING_TIME_MS) > 0 ? warning_timeout_ms - TIMEOUT_INTERNAL_PADDING_TIME_MS : 0
    });

    this.logoutWarningModal = modalTimeout;
    return logoutWarningTimer;
  },

  logoutWithRedirect(options={}) {
    this.listenToOnce(this.getChannel(), 'logout:complete', options.login ? this.redirectToLogin : this.redirectToLogout, this);
    this.logout();
  },

  logout() {
    if (!this.getToken()) {
      // If already logged out, just trigger an extra logout event
      this.getChannel().trigger('logout:complete');
      return;
    }

    loaderChannel.trigger('page:load');
    apiChannel.request('call', {
      method: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/logout`
    }).always(() => {
      modalChannel.request('remove:all');
      this.clearToken();
      this.removeMousemoveListener();
    });
  },

  _redirectWithSiteminderCheck(url, nonSiteminderUrl) {
    const SITEMINDER_LOGOUT_URL = configChannel.request('get', 'SITEMINDER_LOGOUT_URL');
    let redirectUrl = this.isLoginSiteminder() ? `${SITEMINDER_LOGOUT_URL}&returl=${url}` : null;

    if (!redirectUrl) {
      if (nonSiteminderUrl) {
        Backbone.history.navigate(nonSiteminderUrl, { trigger: true, replace: true });
        return;
      }

      redirectUrl = url;
    }

    window.location.assign(redirectUrl);
  },

  redirectToLogin() {
    // Add site name param to logout
    var g = window || global;
    this._redirectWithSiteminderCheck(`${configChannel.request('get', 'EXTERNAL_LOGOUT_URL')}?returnsite=${g['_DMS_SITE_NAME']}`, 'login');
  },

  redirectToLogout() {
    // Add site name paran to logout
    var g = window || global;
    this._redirectWithSiteminderCheck(`${configChannel.request('get', 'EXTERNAL_LOGOUT_URL')}?returnsite=${g['_DMS_SITE_NAME']}`, 'logout-page');
  },

  redirectToServerErrorPage() {
    var g = window || global;
    // Log out of siteminder (if applicable), then go to the 500 error page
    this._redirectWithSiteminderCheck(`${configChannel.request('get', 'SERVER_ERROR_URL')}?returnsite=${g['_DMS_SITE_NAME']}`);
  },

  redirectToConfigErrorPage() {
    var g = window || global;
    // Log out of siteminder (if applicable), then go to the config error page
    const configErrorUrl = configChannel.request('get', 'CONFIG_ERROR_URL');

    // BUG: If a config error happens, we might not have loadedd the CONFIG_ERROR_URL from ui-siteconfiguration file!
    this._redirectWithSiteminderCheck(`${configErrorUrl}?returnsite=${g['_DMS_SITE_NAME']}`);
  },

  redirectToDisputeAccess(accessCode, daActionId, extSiteId, name) {
    const routingTimeAllowedMs = 60000;
    const daLoadingRoute = 'loadExt';
    
    const createRoutingToken = () => {
      // Validate and route to dispute access site
      const submitterName = name ? name : '';
      const loginTokenObj = {
        t: btoa(`${accessCode}:${submitterName}`),
        exp: (new Date).getTime() + routingTimeAllowedMs,
        s: extSiteId,
        a: daActionId,
        ac: btoa(UtilityMixin.util_hash(accessCode)),
      };
      localStorage.setItem('_dmsDaAuthToken', JSON.stringify(loginTokenObj));
    };
    const createDaUrl = () => {
      // Manually apply the user key for maintenance window overrides
      const userkey = UtilityMixin.util_getParameterByName('userkey');
      const cleanedUrl = (configChannel.request('get', 'DISPUTE_ACCESS_URL')||'').replace(/\/$/, '');
      return `${cleanedUrl}/#${daLoadingRoute}${userkey ? `?userkey=${userkey}` : ''}`;
    };

    createRoutingToken();
    window.open(createDaUrl());
  }

});

export default new SessionManager();
