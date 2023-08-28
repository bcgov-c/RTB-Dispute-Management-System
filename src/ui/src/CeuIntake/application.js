 /**
  * @namespace intake.application
  * @memberof intake
  */

// Import files that need to be loaded immediately
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'bootstrap/dist/js/bootstrap';
import "jquery-ui/ui/widgets/datepicker";
import 'jquery-whenall';
import 'blueimp-file-upload';
import 'jquery-ui/ui/widgets/progressbar';
import 'filesize';
import 'cleave.js';
import 'cleave-addons/phone-formatter';
import 'moment-timezone';

// Import styles

// Third party components
import 'normalize.css';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/datepicker.css';
import 'trumbowyg/dist/ui/trumbowyg.css';
import 'trumbowyg/dist/plugins/table/ui/trumbowyg.table.css';
import 'trumbowyg/dist/plugins/colors/ui/trumbowyg.colors.css';
import 'trumbowyg/dist/plugins/history/trumbowyg.history.min.js';

// App styles
import '../core/styles/index.css';
import './styles/intake.css';
import './styles/ceu-intake.scss';

// Print styles
import '../core/styles/index-print.css';
import './styles/intake-print.css';


// Add this line in order to have "$" variable accessible on the developer console
window.$ = window.jQuery = require('jquery');

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

// Import and initialize the global channels
import ConfigManager from '../core/components/config/ConfigManager';
import '../core/components/dispute/DisputeManager';
import '../core/components/claim/ClaimsManager';
import '../core/components/geozone/Geozone';
import '../core/components/api/ApiLayer';
import '../core/components/user/UserManager';
import '../core/components/user/SessionManager';
import '../core/components/animations/AnimationManager';
import '../core/components/loaders/PageLoader';
import '../core/components/modals/ModalManager';
import '../core/components/formatter/Formatter';
import '../core/components/timers/TimerManager';
import '../core/components/email/EmailsManager';
import { loadAndCheckMaintenance } from '../core/components/maintenance/MaintenanceChecker';
import '../core/components/custom-data-objs/CustomDataObjManager';
import '../core/components/files/FilesManager';
import AppRouter from './routers/app_router';
import IntakeCeuRouter from './routers/intake_ceu_router';
import RootLayout from '../core/components/root-layout/RootLayout';
import { ApplicationBaseModelMixin } from '../core/components/app/ApplicationBase';
import UtilityMixin from '../core/utilities/UtilityMixin';

// Imports specific to CEU
import IntakeCeu from './pages/intake/IntakeCeu';
import './components/data-channel-helpers/CeuConfigHelper';
import './components/data-channel-helpers/CeuFilesHelper';
import ExternalCustomObj_model from '../core/components/custom-data-objs/external/ExternalCustomObj_model';
import ModalTimeout from '../core/components/modals/modal-timeout/ModalTimeout';
import AnalyticsUtil from '../core/utilities/AnalyticsUtil';

// Add site name
var g = window || global;
g['_DMS_SITE_NAME'] = 'CeuIntake';

const _hotReloadDependencies = [
  './pages/intake/IntakeCeu',
  '../core/components/config/ConfigManager',
  '../core/components/geozone/Geozone',
  '../core/components/api/ApiLayer',
  '../core/components/user/UserManager',
  '../core/components/user/SessionManager',
  '../core/components/animations/AnimationManager',
  '../core/components/loaders/PageLoader',
  '../core/components/modals/ModalManager',
  '../core/components/formatter/Formatter',
  '../core/components/dispute/DisputeManager',
  '../core/components/dispute/ClaimGroupsManager',
  '../core/components/email/EmailsManager',
  '../core/components/participant/ParticipantsManager',
  '../core/components/claim/ClaimsManager',
  '../core/components/files/FilesManager',
  '../core/components/timers/TimerManager',
  '../core/components/status/StatusManager',
  '../core/components/payments/PaymentManager',
  '../core/components/maintenance/MaintenanceChecker',
  './routers/app_router',
  './routers/intake_ari_router',
  '../core/components/question/Question_model',
  '../core/components/question/Question_collection', 
  './components/root-layout/RootLayout',
  './pages/dispute-list/DisputeListPage',
  './pages/login/Login'
];

const disputeChannel = Radio.channel('dispute');
const apiChannel = Radio.channel('api');
const participantsChannel = Radio.channel('participants');
const claimGroupsChannel = Radio.channel('claimGroups');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const menuChannel = Radio.channel('menu');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const paymentsChannel = Radio.channel('payments');
const applicationChannel = Radio.channel('application');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const timerChannel = Radio.channel('timers');

const config_paths = [
  // Deployment site variables
  IS_WEBPACK_DEV_SERVER ? require('../siteconfig/ui-configuration-local.json') : '../siteconfig/ui-configuration.json',

  require('../core/config/config.json'),
  require('../core/config/constants.json'),
  
  require('../core/config/config_ceu.json'),
  require('../core/config/config_ceu_issues_evidence.json'),
];

const HEADER_TITLE_TEXT = `<span class="mobile-sub-banner">Residential Tenancies -&nbsp;</span>CEU Intake`;
const DEFAULT_TIMEOUT_MS = 30*60*1000; // Default timeout is 30 minutes, in case ceu timeout cannot be loaded

/**
 * The underlying Backbone Model for the application.  Used for global data holding, and initializing system data.
 * @class AppModel

 */
const AppModel = Backbone.Model.extend({
  defaults: {
    scrollFn: null,
    // Tracks the overall application's progress
    progress: 0,
    // Denotes which page was just actioned on
    recentProgress: 0,

    // Holds the active CEU model
    activeCeuModel: null,
  },

  initialize() {
    // Setup any expected loader data:
    __loaderData = __loaderData || {};
    this.setupChannels();
    apiChannel.request('allow:unauthorized');
  },

  /**
   * Creates the applicationChannel request and event handlers.  Also creates some progress event handling
   */
  setupChannels() {
    applicationChannel.reply('load:dispute:minimal', this.loadDisputeMinimal, this);
    applicationChannel.reply('load:dispute:full', this.loadDisputeFull, this);
    applicationChannel.reply('load:dispute:full:promise', this.loadDisputeFullPromise, this);
    applicationChannel.reply('clear', this.clearLoadedInfo, this);
    applicationChannel.reply('add:scroll', this.addOnScroll, this);
    applicationChannel.reply('remove:scroll', this.removeOnScroll, this);

    applicationChannel.on('progress:step:complete', this.setProgressStepComplete, this);
    applicationChannel.on('progress:step', this.setRecentProgress, this);
    applicationChannel.reply('get:progress', this.getProgress, this);
    applicationChannel.reply('get:progress:recent', this.getRecentProgress, this);
    applicationChannel.reply('refresh:progress', this.refreshSessionProgress, this);

    applicationChannel.reply('show:ari:json:error:modal', this.showAriJsonErrorModal, this);
  },

  /**
   * A utility method for adding a generic function to Window's onScroll.
   * We often just use one scroll function, so it saves the last-added scroll fn used internally.
   * @param {function} scroll_fn - A function to run automatically on window.scroll
   */
  addOnScroll(scroll_fn) {
    $(window).scroll(scroll_fn);
    this.set('scrollFn', scroll_fn);
  },

  /**
   * A utility method for removing a generic function to Window's onScroll.
   * @param {function} [scroll_fn] - A function to run automatically on window.scroll.
   * If not passed in, will try to remove scrollFn last added with addOnScroll()
   */
  removeOnScroll(scroll_fn) {
    $(window).off('scroll', scroll_fn ? scroll_fn : this.get('scrollFn'));
  },

  /**
   * Tries to remove all loaded data which may have been loaded as part of full dispute load.
   */
  clearLoadedInfo() {
    disputeChannel.request('clear');
    participantsChannel.request('clear');
    claimGroupsChannel.request('clear');
    claimsChannel.request('clear');
    filesChannel.request('clear');
    paymentsChannel.request('clear');
    customDataObjsChannel.request('clear');
    menuChannel.request('clear');
  },

  minimumLoadTimePromise() {
    const dfd = $.Deferred();
    let interval = null;
    const maxTimout = setTimeout(function() {
      dfd.resolve();
      clearInterval(interval);
    }, 15000);

    interval = setInterval(function() {
      if (!__loaderData.minimumTimerComplete) {
        return false;
      } else {
        clearInterval(interval);
        clearTimeout(maxTimout);
        dfd.resolve();
      }
    }, 500);
    return dfd.promise();
  },

  /**
   * Performs the initial loading of data in the application.
   * Will mostly be config values and dependant libraries.
   * @returns {Promise} - A promise for all dependent loads.
   */
  load() {
    const dfd = $.Deferred();

    $.when(
      this.loadConfigs(),
      this.minimumLoadTimePromise()
    ).done(function() {
      const ceuSystemId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_CEU');
      loadAndCheckMaintenance(ceuSystemId).done(function() {
        dfd.resolve();
      }).fail(function() {
        // An ongoing maintenance record existed, start timout timer
        setTimeout(function() {
          Backbone.history.navigate('logout', { trigger: true }); 
        }, 6*1000);
        dfd.resolve();
      })
    })
    .fail(() => {
      sessionChannel.trigger('redirect:server:error');
    });
    return dfd.promise();
  },


  /**
   * Loads all config files in the application.
   * @returns {Promise} - A promise for loading all config files required.
   */
  loadConfigs() {
    // Load any internal config value first
    ConfigManager.loadInternalConfig();

    // Then load config values from files.  This may use async calls because the other configs might be in external js/json files.
    return $.when.apply($, _.map(config_paths, function(path) { return ConfigManager.loadConfig(path); }));
  },

  parseTokenAndLogin() {
    const dfd = $.Deferred();
    this.mixin_checkVersion().done((response={}) => {
      sessionChannel.request('set:login:type', response.token_method);

      // Handle &refresh-token and ?refresh-token url styles
      window.history.pushState({}, null, window.location.href.replace('?refresh-token=', '&refresh-token='));

      const urlToken = UtilityMixin.util_getParameterByName('token');
      const urlRefreshToken = UtilityMixin.util_getParameterByName('refresh-token');
      const tokenToUse = urlToken ? urlToken : localStorage.getItem('authToken');;
      const refreshTokenToUse = urlRefreshToken ? urlRefreshToken : localStorage.getItem('refreshToken');

      if (urlToken) {
        // Always remove the tokens from the URL first
        const cleanedUrlFull = UtilityMixin.util_removeURLParameter(
          UtilityMixin.util_removeURLParameter(window.location.href, 'token'), 'refresh-token')

        window.history.pushState({}, null, cleanedUrlFull);
      }

      if (tokenToUse && refreshTokenToUse) {
        localStorage.setItem('authToken', tokenToUse);
        localStorage.setItem('refreshToken', refreshTokenToUse);
        sessionChannel.request('authorize:token', tokenToUse);
        
        this.createCeuTokenTimers();
        dfd.resolve();
      } else {
        // No cookie or url token - redirect to login page
        sessionChannel.trigger('logout:complete');
        sessionChannel.trigger('redirect:login');
        dfd.reject();
      }
    }).fail(dfd.reject);

    return dfd.promise();
  },

  createCeuTokenTimers() {
    const TIMEOUT_INTERNAL_PADDING_TIME_MS = 1000;
    const TIMEOUT_WARNING_OFFSET_MS = configChannel.request('get', 'TIMEOUT_WARNING_OFFSET_MS');
    const logoutTimerMs = configChannel.request('get', 'CEU_CONFIG')?.CEU_TIMEOUT_MS || DEFAULT_TIMEOUT_MS;
    const logoutWarningTimerMs = logoutTimerMs - TIMEOUT_WARNING_OFFSET_MS - TIMEOUT_INTERNAL_PADDING_TIME_MS;
    let modalTimeout;

    const saveLastActiveTime = function() {
      sessionStorage.setItem('lastActiveTime', new Date().toISOString());
    };
    
    document.removeEventListener('mousemove', saveLastActiveTime, false);
    document.addEventListener('mousemove', saveLastActiveTime, false);

    const logoutTimer = timerChannel.request('create', {
      name: 'logoutTimer',
      expiration_fn: () => {
        timerChannel.request('stop:timer', 'logoutTimer');
        // Log the user out immediately if the token has expired
        Backbone.history.navigate('logout', { trigger: true });
      },
      timeout_ms: logoutTimerMs
    });

    
    const refreshTokenAndUpdateTimers = (autoExtendSession=false) => new Promise(res => {
      this.refreshCeuToken().then(() => {
        // Re-apply the UI timeouts
        timerChannel.request('refresh:timer', 'logoutTimer', logoutTimerMs);

        // Neither modalTimeout or logoutWarningTimer will exist if autoExtendSession is true
        if (!autoExtendSession) {
          timerChannel.request('refresh:timer', 'logoutWarningTimer', logoutWarningTimerMs);
          // Try to silently remove the countdown modal
          try { modalChannel.request('remove', modalTimeout); } catch (e) {}
        }
        res();
      }).catch(err => {
        console.debug(err);
        Backbone.history.navigate('logout', { trigger: true });
      });
    });
    
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
        if (sessionChannel.request('get:active:api')?.length) {
          autoExtendSession = true;
        }

        if (autoExtendSession) {
          console.log('[Info] Activity detected - auto-extend session');
          refreshTokenAndUpdateTimers(autoExtendSession);
        } else {
          // Display countdown modal
          modalTimeout = new ModalTimeout();
          this.listenTo(modalTimeout, 'login', () => {
            loaderChannel.trigger('page:load');
            refreshTokenAndUpdateTimers(autoExtendSession)
              .then(() => {
                loaderChannel.trigger('page:load:complete');
              });
          }, this);
          this.listenTo(modalTimeout, 'logout', () => {
            Backbone.history.navigate('logout', { trigger: true });
          }, this);

          modalChannel.request('add', modalTimeout);
        }
      },
      timeout_ms: logoutWarningTimerMs
    });
  },

  refreshCeuToken() {
    const token = sessionChannel.request('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const urlParams = `token=${token}&refreshToken=${refreshToken}`;
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        method: 'POST',
        url: `${configChannel.request('get', 'API_ROOT_URL')}externalcustomdataobjects/refresh-token?${urlParams}`,
      })
      .done((response={}) => {
        const tokenToUse = response?.token?.result;
        localStorage.setItem('authToken', tokenToUse);
        localStorage.setItem('refreshToken', response?.refresh_token);
        sessionChannel.request('authorize:token', tokenToUse);
        timerChannel.request('refresh:timer', 'logoutTimer', configChannel.request('get', 'CEU_CONFIG')?.CEU_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
        res();
      })
      .fail(rej);
    });
  },

  getProgress() {
    return this.get('progress');
  },

  getRecentProgress() {
    return this.get('recentProgress');
  },

  refreshSessionProgress() {
    // Disable refreshing routing.  Force Next
    return;    
  },

  setRecentProgress(step) {
    this.set('recentProgress', step);
  },

  setProgressStepComplete(step) {
    if (step > this.get('progress')) {
      this.set('progress', step);
    }
  },

  resetProgress() {
    this.set({
      progress: 0,
      recentProgress: 0
    });
  },

  showAriJsonErrorModal() {
    loaderChannel.trigger('page:load:complete');
    const modalView = modalChannel.request('show:standard', {
      title: 'Error Loading Data',
      bodyHtml: `<p>
        There was an error retrieving previously-saved data for this exploration.  You will be returned to the file list.  If you encounter this issue again, you can contact the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>.
      </p>`,
      hideCancelButton: true,
      primaryButtonText: 'File List',
      onContinueFn(modalView) {
        modalView.close();
      }
    });

    this.listenToOnce(modalView, 'removed:modal', function() {
      loaderChannel.trigger('page:load');
      Backbone.history.navigate('login-page', { trigger: true });
    });
  },

});

_.extend(AppModel.prototype, ApplicationBaseModelMixin);


// IDEA: Keep "instance" (aka "view-type") data on the App instance, but more permanent application data on the AppModel model

/**
 * @class App
 */
const App = Marionette.Application.extend({
  region: {
    el: '#root',
    replaceElement: true
  },
  main_content_region: 'mainRegion',

  initialize() {
    this.model = this.options.model;
  },

  onBeforeStart() {
    $('body').css({
      'backgroundColor': '#fff',
    });
  },

  initializeEventsAndAnimations() {
    $.initializeCustomAnimations({
      scrollableContainerSelector: '#intake-content'
    });
    $.initializeDatepickerScroll();
  },

  initializeSiteDependentData() {
    sessionChannel.request('set:login:external');
  },

  onStart() {
    this.initializeErrorReporting();
    this.initializeSiteDependentData();
    this.initializeEventsAndAnimations();
    this.initializeViews();
    this.initializeRoutersAndRouteListeners();
    AnalyticsUtil.initializeAnalyticsTracking();
  },

  initializeErrorReporting() {
    apiChannel.request('create:errorHandler', {
      error_site: configChannel.request('get', 'ERROR_SITE_CEU')
    });
  },

  initializeViews() {
    this.showView(new RootLayout({ model: this, showHeader: true, showFooter: true, headerText: HEADER_TITLE_TEXT, showHeaderProblemButton: true }));
    this.intakeView = new IntakeCeu({ parent: this });

    // Once the views have been initialized, setup the modal container
    modalChannel.request('render:root');
  },

  initializeRoutersAndRouteListeners() {
    new AppRouter({ controller: this });

    this.intakeViewRouter = new IntakeCeuRouter({ controller: this.intakeView });

    this.listenTo(sessionChannel, 'logout:complete', function() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('_dmsPaymentToken');
      sessionChannel.request('clear:timers');
      applicationChannel.request('clear');
    });

    Backbone.history.start();
  },

  // Routing controller actions
  renderMainContent(childView) {
    loaderChannel.trigger('page:load:complete');
    const view = this.getView();
    view.getRegion( this.main_content_region ).detachView();
    view.showChildView( this.main_content_region , childView);
  },

  getActiveCeuModel() {
    return this.model.get('activeCeuModel'); 
  },

  createNewCeuDispute() {
    const ceuDataModel = new ExternalCustomObj_model({
      object_title: 'CEU Intake',
      object_type: configChannel.request('get', 'EXTERNAL_CUSTOM_DATA_OBJ_TYPE_CEU'),
      object_status: configChannel.request('get', 'CEU_STATUS_PENDING'),
      object_json: {},
    });
    return new Promise((res, rej) => {
      ceuDataModel.save().done(() => {
        this.model.set('activeCeuModel', ceuDataModel);
        res(ceuDataModel);
      }).fail(rej);
    });
  },

  handleRouterCeuIntake() {
    loaderChannel.trigger('page:load');
    this.model.parseTokenAndLogin().done(() => {
      // Create new application, and load page1
      this.createNewCeuDispute().then(ceuDataModel => {
        Backbone.history.navigate('#page/1', { trigger: true, replace: true });
      }, (err) => {
        Backbone.history.navigate('#logout', { trigger: true, replace: true });
      });
    }).fail(() => {
      Backbone.history.navigate('#logout', { trigger: true, replace: true });
    });
  },

  handleRouterLogin() {
    if (sessionChannel.request('is:login:siteminder')) {
      sessionChannel.trigger('redirect:login');
    } else {
      // If we are not in siteminder mode, remove any saved siteminder cookie
      localStorage.removeItem('authToken');
      Backbone.history.navigate('login-page', { trigger: true });
    }
  },

  handleRouterLogout() {
    this.showLogoutView();
  },

  showLoginView() {
    // Use external login/logout view:
    const ceuLogoutUrl = configChannel.request('get', 'CEU_CONFIG')?.LOGOUT_URL;
    if (ceuLogoutUrl) window.location.href = ceuLogoutUrl;
    
    //Internal login/logout handling
    //menuChannel.trigger('disable:mobile');
    //this.renderMainContent(new LoginView());
  },

  showLogoutView() {
    Backbone.history.navigate('login-page', { trigger: true, replace: true });
  },

  showIntakeView() {
    // Keep IntakeView around since it is the controller for the router
    // Render it each time
    this.renderMainContent( this.intakeView.render() );
  },

  /* Functions for the router to test the intake page for completeness and handle re-routing */
  getPageApiUpdates() {
    if (!this.intakeView || !this.intakeView.$el.is(':visible')) {
      return [];
    } else {
      return this.intakeView.getPageApiUpdates();
    }
  },

  getCurrentViewRoutingFragment() {
    return this.intakeView && typeof this.intakeView.getCurrentViewRoutingFragment === 'function' ? this.intakeView.getCurrentViewRoutingFragment() : null;
  },

  cleanupPageInProgress() {
    return this.intakeView && typeof this.intakeView.cleanupPageInProgress === 'function' && this.intakeView.cleanupPageInProgress();
  }

});

// Load the application only if there is no saved app or model from a hot reload
const appModel = module.hot && module.hot.data && module.hot.data.appModel ? module.hot.data.appModel : new AppModel();
const app = module.hot && module.hot.data && module.hot.data.app ? module.hot.data.app : new App({ model: appModel });
const _webpackHasExistingAppData = () => module.hot && module.hot.data && module.hot.data.appModel && module.hot.data.app;
const _webpackSetupHotModuleReloadHandlers = () => {
  module.hot.dispose(data => {
    data.appModel = appModel;
    data.app = app;
  });

  // If any view changes, re-render the current page to make sure we capture any updates
  module.hot.accept('./pages/intake/IntakeCeu', () => {
    console.log(`[DMS_HMR] Re-loading intake view..`);

    // Re-initialize IntakeView with the newly imported intake view

    app.initializeViews(IntakeCeu);

    if (app.intakeViewRouter) {
      app.intakeViewRouter.changeController(app.intakeView);
    }

    Backbone.history.loadUrl(Backbone.history.fragment);
  });

  // Perform default hot swap behaviour (re-load "import"s) on all of application.js's dependencies
  module.hot.accept(_hotReloadDependencies);

  // If no other hmr handler matches, perform no refresh by default
  module.hot.accept();
};
const loadAndStartApplication = () => {
  try {
    appModel.load().then(function() {
      app.start();
    }, function(e) {
      console.debug(e);
      alert("Error loading initial application data");
    });
  } catch (err) {
    console.trace(err);
    alert('[Error] There was an unexpected application error on the page.  Please refresh and try again.')
    loaderChannel.trigger('page:load:complete');
  }
};


if (module.hot) {
  _webpackSetupHotModuleReloadHandlers();

  if (_webpackHasExistingAppData()) {
    console.log(`[DMS_HMR] Hot module swap occurred.  No app reload.`);
  } else {
    loadAndStartApplication();
  }
} else {
  loadAndStartApplication();
}