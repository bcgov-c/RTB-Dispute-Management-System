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
import 'jquery-ui/ui/widgets/progressbar';
import 'filesize';
import 'cleave.js';
import 'cleave-addons/phone-formatter';
import 'moment-timezone';

// Import styles

// Third party components
import 'normalize.css';
// import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/datepicker.css';

// App styles
import '../core/styles/index.css';

// Print styles
import '../core/styles/index-print.css';

// Add this line in order to have "$" variable accessible on the developer console
window.$ = window.jQuery = require('jquery');

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import RootLayout from '../core/components/root-layout/RootLayout';
import { ApplicationBaseModelMixin } from '../core/components/app/ApplicationBase';
import { PostedDecisions } from './pages/main/Main';
import { polyglot } from './assets/locales';
import './assets/styles/common.scss';

// Import and initialize the global channels
import ConfigManager from '../core/components/config/ConfigManager';
import '../core/components/geozone/Geozone';
import '../core/components/api/ApiLayer';
import '../core/components/user/UserManager';
import '../core/components/animations/AnimationManager';
import '../core/components/loaders/PageLoader';
import '../core/components/modals/ModalManager';
import '../core/components/formatter/Formatter';
import '../core/components/dispute/DisputeManager';
import '../core/components/dispute/ClaimGroupsManager';
import '../core/components/participant/ParticipantsManager';
import '../core/components/claim/ClaimsManager';
import '../core/components/files/FilesManager';
import '../core/components/timers/TimerManager';
import '../core/components/status/StatusManager';
import '../core/components/payments/PaymentManager';
import '../core/components/decisions/DecisionsManager';
import { loadAndCheckMaintenance } from '../core/components/maintenance/MaintenanceChecker';
import '../core/components/custom-data-objs/CustomDataObjManager';

// Add site name
var g = window || global;
g['_DMS_SITE_NAME'] = 'PostedDecisions';

const _hotReloadDependencies = [
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
  '../core/components/participant/ParticipantsManager',
  '../core/components/claim/ClaimsManager',
  '../core/components/files/FilesManager',
  '../core/components/timers/TimerManager',
  '../core/components/status/StatusManager',
  '../core/components/payments/PaymentManager',
  '../core/components/maintenance/MaintenanceChecker',
  './routers/app_router',
  '../core/components/question/Question_model',
  '../core/components/question/Question_collection', 
  '../core/components/root-layout/RootLayout',
  './pages/main/Main'
];

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

// Deployment site variables
const config_paths = [
  // Deployment site variables
  IS_WEBPACK_DEV_SERVER ? require('../siteconfig/ui-configuration-local.json') : '../siteconfig/ui-configuration.json',

  require('../core/config/config.json'),
  require('../core/config/constants.json'),
  require('../core/config/config_issues_evidence.json'),
  require('../core/config/required_intake_questions.json'),
  require('../core/config/config_status_rules.json'),

  // Admin-only configs
  require('../core/config/config_amendments.json'),
  require('../core/config/config_outcome_docs.json'),
];

const AppModel = Backbone.Model.extend({ 
    /**
   * Loads all config files in the application.
   * @returns {Promise} - A promise for loading all config files required.
   */
  loadConfigs() {
    // Load any internal config value first
    ConfigManager.loadInternalConfig();
    // Then load config values from files.  This may use async calls because the other configs might be in external js/json files.
    const dfd = $.Deferred();
    Promise.all(_.map(config_paths, function(path) { return ConfigManager.loadConfig(path); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
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

  load() {
    const dfd = $.Deferred();

    $.when(this.loadConfigs(), this.minimumLoadTimePromise()).done(function() {
      const system_id = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_ADMIN');
      loadAndCheckMaintenance(system_id).done(function() {
        dfd.resolve();
      }).fail(function() {
        // An ongoing maintenance record existed, start timout timer
        dfd.resolve();
        this.load()
      });
    })

    return dfd.promise();
  }
})

_.extend(AppModel.prototype, ApplicationBaseModelMixin);

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
    console.log('hello posted decisions!');
    this.model = this.options.model;
    this.model.load();
  },

  initializeCustomAnimations() {
    $.initializeCustomAnimations({
      scrollableContainerSelector: '#main-content'
    });
  },

  onBeforeStart() {
    $('body').css({
      'backgroundColor': '#fff',
    });
  },

  onStart() {
    this.initializeCustomAnimations()
    this.initializeViews(PostedDecisions);
    this.showMainView();
  },

  initializeViews(mainViewClass) {
    this.showView(new RootLayout({ model: this, showHeader: true, showFooter: false, headerText: polyglot.t('postedDecisions.appHeader') }));
    this.mainView = new mainViewClass({ parent: this, model: new Backbone.Model() });
    modalChannel.request('render:root');
  },

  onRender() {
    this.showChildView(this.main_content_region, this.mainView);
  },

  // Routing controller actions
  renderMainContent(childView) {
    const view = this.getView();
    // When main view is rendered, also re-render the header to get updated User name and Logout links
    view.renderHeader();
    view.getRegion(this.main_content_region).detachView();
    view.showChildView(this.main_content_region, childView);
  },

  showMainView() {
    this.renderMainContent( this.mainView.render() );
  },

});

// Load the application only if there is no saved app or model from a hot reload
const appModel =  module.hot && module.hot.data && module.hot.data.appModel ? module.hot.data.appModel : new AppModel();
const app = module.hot && module.hot.data && module.hot.data.app ? module.hot.data.app : new App({ model: appModel });
const _webpackHasExistingAppData = () => module.hot && module.hot.data && module.hot.data.appModel && module.hot.data.app;
const _webpackSetupHotModuleReloadHandlers = () => {
  module.hot.dispose(data => {
    data.appModel = appModel;
    data.app = app;
  });

  // If any view changes, re-render the current page to make sure we capture any updates
  module.hot.accept('./pages/main/Main', () => {
    console.log(`[DMS_HMR] Re-loading main view..`);

    // Re-initialize MainView with the newly imported main view
    app.initializeViews(PostedDecisions);
    if (app.mainViewRouter) {
      app.mainViewRouter.controller = app.mainView;
    }

  });

  // Perform default hot swap behaviour (re-load "import"s) on all of application.js's dependencies
  module.hot.accept(_hotReloadDependencies);

  // If no other hmr handler matches, perform no refresh by default
  module.hot.accept();
};
const loadAndStartApplication = () => {
  try {
    appModel.mixin_loadAndStartApplicationWithBrowserCheck(app);
  } catch (err) {
    console.trace(err);
    alert('[Error] There was an unexpected application error on the page.  Please refresh and try again.');
    /*
      const modalView = modalChannel.request('show:standard', {
        title: ,
        bodyHtml: '',
      })
    }, 25);
    */
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