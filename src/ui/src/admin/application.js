/**
 * @namespace admin.application
 * @memberof admin
*/

// Import files that need to be loaded immediately
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'bootstrap/dist/js/bootstrap';
import 'cropperjs/dist/cropper'
import 'cropperjs/dist/cropper.min.css'
import "jquery-ui/ui/widgets/datepicker";
import 'jquery-whenall';
import 'blueimp-file-upload';
import 'jquery-ui/ui/widgets/progressbar';
import 'filesize';
import 'moment-timezone';
import 'jquery-timepickerjs';
import 'colresizablejs';
import 'trumbowyg';
import 'trumbowyg/colors';
import 'trumbowyg/table';
import 'cleave.js';
import 'cleave-addons/phone-formatter';

// Import styles

// Third party components
import 'normalize.css';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/datepicker.css';
import 'jquery-timepicker/jquery.timepicker.css';
import 'trumbowyg/dist/ui/trumbowyg.css';
import 'trumbowyg/dist/plugins/table/ui/trumbowyg.table.css';
import 'trumbowyg/dist/plugins/colors/ui/trumbowyg.colors.css';
import 'trumbowyg/dist/plugins/history/trumbowyg.history.min.js';

// App styles
import '../core/styles/index.css';
import './styles/admin.css';
import './styles/usermanagement.css';
import './styles/disputeview.css';
import './styles/hearing.css';
import './styles/communication.css';
import './styles/tasks.css';
import './styles/history.css';
import './styles/notice.css';
import './styles/payments.css';
import './styles/search.css';
import './styles/documents.css';
import './styles/dashboarddisputes.css';
import './styles/composer.css';
import './styles/cms-archive-page.css';
import './styles/myhearings.css';
import './styles/calendar.css';
import './styles/schedule.css';
import './styles/evidence.css';
import './styles/dms-editor.css'
import './styles/upload-table.scss';

// Print styles
import '../core/styles/index-print.css';
import './styles/admin-print.css';



// Add this line in order to have "$" variable accessible on the developer console
window.$ = window.jQuery = require('jquery');

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

// Import and initialize the global channels
import ConfigManager from '../core/components/config/ConfigManager';
import '../core/components/web-link/WebLink';
import '../core/components/api/ApiLayer';
import { generalErrorFactory } from '../core/components/api/ApiLayer';
import '../core/components/user/UserManager';
import '../core/components/animations/AnimationManager';
import '../core/components/loaders/PageLoader';
import '../core/components/modals/ModalManager';
import '../core/components/formatter/Formatter';
import '../core/components/dispute/DisputeManager';
import './components/dispute-history/DisputeHistory';
import '../core/components/dispute/ClaimGroupsManager';
import '../core/components/participant/ParticipantsManager';
import '../core/components/claim/ClaimsManager';
import '../core/components/files/FilesManager';
import '../core/components/hearing/HearingsManager';
import '../core/components/timers/TimerManager';
import './components/note/NotesManager';
import '../core/components/email/EmailsManager';
import './components/search/SearchManager';
import './components/reports/ReportsManager';
import '../core/components/user/SessionManager';
import '../core/components/tasks/TaskManager';
import '../core/components/status/StatusManager';
import '../core/components/notice/NoticeManager';
import '../core/components/documents/DocumentsManager';
import '../core/components/payments/PaymentManager';
import './components/amendments/AmendmentsManager';
import './components/audit/AuditManager';
import './components/hearing/hearing-import/HearingImportManager';
import './components/cms/CMSManager';
import '../core/components/custom-data-objs/CustomDataObjManager';
import './components/scheduling/SchedulingManager';
import '../core/components/dispute-flags/DisputeFlagManager';
import '../core/components/trials/TrialsManager';

import { refreshMenuConfig } from './components/menu/MenuConfig';

import AppRouter from './routers/admin_router';
import { MainViewRouter, routeParse } from './routers/mainview_router';
import RootLayout from './components/root-layout/RootLayout';
import MainView from './pages/main/Main';
import LoginView from './pages/login/Login';
import { loadAndCheckMaintenance } from '../core/components/maintenance/MaintenanceChecker';
import { ApplicationBaseModelMixin } from '../core/components/app/ApplicationBase';

import ModalBaseView from '../core/components/modals/ModalBase';
import InputView from '../core/components/input/Input';
import InputModel from '../core/components/input/Input_model';

import LoaderSvg from '../core/static/loader.svg';
import LoaderGif from '../core/static/DMSLoader_SML.gif';
import AnalyticsUtil from '../core/utilities/AnalyticsUtil';

// Add site name
var g = window || global;
g['_DMS_SITE_NAME'] = 'Admin';

const _hotReloadDependencies = [
  '../core/components/config/ConfigManager',
  '../core/components/web-link/WebLink',
  '../core/components/api/ApiLayer',
  '../core/components/user/UserManager',
  '../core/components/animations/AnimationManager',
  '../core/components/loaders/PageLoader',
  '../core/components/modals/ModalManager',
  '../core/components/formatter/Formatter',
  '../core/components/dispute/DisputeManager',
  './components/dispute-history/DisputeHistory',
  '../core/components/dispute/ClaimGroupsManager',
  '../core/components/participant/ParticipantsManager',
  '../core/components/claim/ClaimsManager',
  '../core/components/files/FilesManager',
  '../core/components/hearing/HearingsManager',
  '../core/components/timers/TimerManager',
  './components/note/NotesManager',
  '../core/components/email/EmailsManager',
  './components/search/SearchManager',
  '../core/components/user/SessionManager',
  '../core/components/tasks/TaskManager',
  '../core/components/status/StatusManager',
  '../core/components/notice/NoticeManager',
  './components/amendments/AmendmentsManager',
  './components/documents/DocumentsManager',
  '../core/components/payments/PaymentManager',
  './components/audit/AuditManager',
  './components/hearing/hearing-import/HearingImportManager',
  './components/cms/CMSManager',
  './components/menu/MenuConfig',
  './routers/admin_router',
  './routers/mainview_router',
  './components/root-layout/RootLayout',
  './pages/login/Login',
  '../core/components/maintenance/MaintenanceChecker',
  '../core/components/app/ApplicationBase',
];

const disputeChannel = Radio.channel('dispute');
const apiChannel = Radio.channel('api');
const participantsChannel = Radio.channel('participants');
const claimGroupsChannel = Radio.channel('claimGroups');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const disputeHistoryChannel = Radio.channel('disputeHistory');
const notesChannel = Radio.channel('notes');
const modalChannel = Radio.channel('modals');
const emailsChannel = Radio.channel('emails');
const hearingChannel = Radio.channel('hearings');
const sessionChannel = Radio.channel('session');
const taskChannel = Radio.channel('tasks');
const statusChannel = Radio.channel('status');
const noticeChannel = Radio.channel('notice');
const amendmentsChannel = Radio.channel('amendments');
const paymentsChannel = Radio.channel('payments');
const documentsChannel = Radio.channel('documents');
const userChannel = Radio.channel('users');
const applicationChannel = Radio.channel('application');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const flagsChannel = Radio.channel('flags');
const trialsChannel = Radio.channel('trials');

const config_paths = [
  // Deployment site variables
  IS_WEBPACK_DEV_SERVER ? require('../siteconfig/ui-configuration-local.json') : '../siteconfig/ui-configuration.json',

  require('../core/config/config.json'),
  require('../core/config/constants.json'),
  require('../core/config/config_issues_evidence.json'),
  require('../core/config/required_intake_questions.json'),
  require('../core/config/config_status_rules.json'),
  require('../core/config/config_outcome_docs.json'),
  require('../core/config/config_tasks.json'),
  require('../core/config/config_schedule.json'),
  require('../core/config/config_flags.json'),
  require('../core/config/config_subservice.json'),
  
  // CEU configs
  require('../core/config/config_ceu.json'),
  require('../core/config/config_ceu_issues_evidence.json'),
  
  // Admin-only configs
  require('../core/config/config_amendments.json'),
  require('../core/config/config_email_templates.json'),
  require('../core/config/config_reports.json'),
];

const HEADER_TITLE_TEXT = 'DMS Case - Residential Tenancies';

const AppModel = Backbone.Model.extend({
  defaults: {
    splitView: false
  },

  initialize() {
    // Setup any expected loader data:
    __loaderData = __loaderData || {};
    this.setupChannels();
    this.clearSessionCookies();
  },

  /**
   * Creates the applicationChannel request and event handlers/
   */
  setupChannels() {
    // Store the active dispute in activeDispute still
    applicationChannel.reply('load:dispute:full', this.loadDisputeFull, this);
    applicationChannel.reply('load:dispute:core', this.loadDisputeCore, this);    
    applicationChannel.reply('clear', () => {
      notesChannel.request('clear:drafts');
      this.clearLoadedInfo();
    }, this);

    applicationChannel.reply('cache:full', this.cacheAllData, this);
    applicationChannel.reply('cache:load:full', this.loadAllDataFromCache, this);
  },

  /**
   * Calling the cache function of all data managers to cache all data for the current dispute.
   * The order they are called in does not matter.
   */
  cacheAllData() {
    participantsChannel.request('cache:current');
    claimGroupsChannel.request('cache:current');
    claimsChannel.request('cache:current');
    filesChannel.request('cache:current');
    notesChannel.request('cache:current');
    emailsChannel.request('cache:current');
    hearingChannel.request('cache:current');
    taskChannel.request('cache:current');
    statusChannel.request('cache:current');
    noticeChannel.request('cache:current');
    paymentsChannel.request('cache:current');
    amendmentsChannel.request('cache:current');
    documentsChannel.request('cache:current');
    userChannel.request('cache:current');
    customDataObjsChannel.request('cache:current');
    flagsChannel.request('cache:current');
    trialsChannel.request('cache:current');
  },

  /**
   * Tries to get all cached data for a given dispute.  Calls the "load from cache" functions from all data mangers.
   * The order they are called in actually does matter, because we need to load the ClaimGroupId first before loading
   * Participants and Claims since they are dependent.
   * @param {string} disputeGuid - The dispute guid to load cache values from.
   */
  loadAllDataFromCache(disputeGuid) {
    // NOTE: claimGroups channel must be loaded first to set the correct claim groups
    claimGroupsChannel.request('cache:load', disputeGuid);
    participantsChannel.request('cache:load', disputeGuid);
    claimsChannel.request('cache:load', disputeGuid);
    filesChannel.request('cache:load', disputeGuid);
    notesChannel.request('cache:load', disputeGuid);
    emailsChannel.request('cache:load', disputeGuid);
    hearingChannel.request('cache:load', disputeGuid);
    taskChannel.request('cache:load', disputeGuid);
    statusChannel.request('cache:load', disputeGuid);
    noticeChannel.request('cache:load', disputeGuid);
    paymentsChannel.request('cache:load', disputeGuid);
    amendmentsChannel.request('cache:load', disputeGuid);
    documentsChannel.request('cache:load', disputeGuid);
    userChannel.request('cache:load', disputeGuid);
    customDataObjsChannel.request('cache:load', disputeGuid);
    flagsChannel.request('cache:load', disputeGuid);
    trialsChannel.request('cache:load', disputeGuid);
  },

  /**
   * Tries to remove all loaded data which may have been loaded as part of full dispute load.
   */
  clearLoadedInfo() {
    participantsChannel.request('clear');
    claimGroupsChannel.request('clear');
    claimsChannel.request('clear');
    filesChannel.request('clear');
    notesChannel.request('clear');
    emailsChannel.request('clear');
    hearingChannel.request('clear');
    taskChannel.request('clear');
    statusChannel.request('clear');
    noticeChannel.request('clear');
    paymentsChannel.request('clear');
    amendmentsChannel.request('clear');
    documentsChannel.request('clear');
    userChannel.request('clear');
    disputeChannel.request('clear');
    customDataObjsChannel.request('clear');
    flagsChannel.request('clear');
    trialsChannel.request('clear');
  },

  clearLoadedInfoForDispute(disputeGuid) {
    disputeChannel.request('clear');
    participantsChannel.request('clear:dispute', disputeGuid);
    claimGroupsChannel.request('clear:dispute', disputeGuid);
    claimsChannel.request('clear:dispute', disputeGuid);
    filesChannel.request('clear:dispute', disputeGuid);
    notesChannel.request('clear:dispute', disputeGuid);
    emailsChannel.request('clear:dispute', disputeGuid);
    hearingChannel.request('clear:dispute', disputeGuid);
    taskChannel.request('clear:dispute', disputeGuid);
    statusChannel.request('clear:dispute', disputeGuid);
    noticeChannel.request('clear:dispute', disputeGuid);
    paymentsChannel.request('clear:dispute', disputeGuid);
    amendmentsChannel.request('clear:dispute', disputeGuid);
    documentsChannel.request('clear:dispute', disputeGuid);
    userChannel.request('clear:dispute', disputeGuid);
    customDataObjsChannel.request('clear:dispute', disputeGuid);
    flagsChannel.request('clear:dispute', disputeGuid);
    trialsChannel.request('clear:dispute', disputeGuid);
  },

  clearSessionCookies() {
    _.each(['calendarPickedYearCookie', 'calendarPickedMonthCookie', 'latestSchedulePageRoute'], function(cookieName) {
      localStorage.removeItem(cookieName);
    });
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
    const afterLoginPromises = [() => hearingChannel.request('load:conferencebridges'),
      () => userChannel.request('load:users'),
      () => filesChannel.request('load:commonfiles'),
    ];

    // Setup login and logout listeners - they will be triggered when `mixin_checkSiteVersionAndLogin` runs
    // NOTE: The login:complete handler will fire an extra even to enable routing from the App after login
    this.listenTo(sessionChannel, 'logout:complete', () => {
      localStorage.removeItem('authToken');
      this.clearSessionCookies();
      sessionChannel.request('clear:timers');
      applicationChannel.request('clear');
      disputeHistoryChannel.request('clear');
    });

    this.listenTo(sessionChannel, 'login:complete', (options={}) => {
      this.processSessionCookies();
      this.clearSessionCookies();

      const user = sessionChannel.request('get:user');
      if (user && !user.isSystemUser()) {
        console.log(`[Warning] Login success, but user is not a Staff user. Logging out.`);
        Backbone.history.navigate('logout', { trigger: true });
        return;
      }
      sessionChannel.request('clear:timers');
      sessionChannel.request('create:timers');
      this.trigger('perform:routingActions', options);
    });

    $.whenAll(
      this.loadConfigs().then(() => {
        return this.mixin_checkSiteVersionAndLogin(afterLoginPromises);
      }, () => sessionChannel.trigger('redirect:config:error')),
      this.minimumLoadTimePromise()
    ).done(function() {
      const system_id = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_ADMIN');
      loadAndCheckMaintenance(system_id).done(function() {
        dfd.resolve();
      }).fail(function() {
        // An ongoing maintenance record existed, start timout timer
        setTimeout(function() {
          Backbone.history.navigate('logout', { trigger: true }); 
        }, 6*1000);
        dfd.resolve();
      });
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

    const dfd = $.Deferred();
    // Then load config values from files.  This may use async calls because the other configs might be in external js/json files.
    Promise.all(_.map(config_paths, function(path) { return ConfigManager.loadConfig(path); }))
      .then(function() {
        // Apply dynamic overrides for UAT toggling
        const configValues = ConfigManager.config_values || {};
        const SHOW_SCHEDULE_MANAGEMENT = (configValues.UAT_TOGGLING || {}).SHOW_SCHEDULE_MANAGEMENT;
        if (SHOW_SCHEDULE_MANAGEMENT) {
          if (configValues.HEARING_MIN_BOOKING_TIME) configValues.HEARING_MIN_BOOKING_TIME = '06:00AM';
          if (configValues.HEARING_MAX_BOOKING_TIME) configValues.HEARING_MAX_BOOKING_TIME = '09:00PM';
        }

        // Run in order to ensure dynamic configs are in a good state once loaded
        refreshMenuConfig();
        dfd.resolve();
      }, dfd.reject);
    return dfd.promise();
  },

  /**
   * If "splitView" cookie was active during login, stash it in the App model for later use
   */
  processSessionCookies() {
    if (localStorage.getItem('splitView')) {
      this.set('splitView', true);
      localStorage.removeItem('splitView');
    }
  },


  // extraPromiseFns is an array of functions returning promises which can be passed to load more data
  loadDisputeCore(disputeGuid, extraPromiseFns) {
    if (!extraPromiseFns) {
      extraPromiseFns = [];
    } else if (!_.isArray(extraPromiseFns)) {
      extraPromiseFns = [extraPromiseFns];
    }

    const dfd = $.Deferred();
    const disputeLoadFinishedFn = () => {
      // On sucessfull load, cache all data
      this.cacheAllData();
      const active_dispute = disputeChannel.request('get');
      dfd.resolve(active_dispute);
    };

    // Core elements:
    // Dispute
    // Dispute Users
    // CPG and Parties
    // Files
    // Notices
    // Hearings
    // Claim Information
    // Notes
    // Custom Data Objects (ARI-C/PFR)
    // Dispute Flags

    $.whenAll(
      this.loadDispute(disputeGuid),
      this.loadDisputeUsers(disputeGuid),
      this.loadClaimGroupParticipants(disputeGuid),
      this.loadDisputeNotes(disputeGuid),
      this.loadCustomDataObjs(disputeGuid),
      this.loadDisputeFlags(disputeGuid),
      this.loadTrialsInfo(disputeGuid),
    ).done(() => {
      // Claim information needs the ClaimGroup set first, so we have to run it second
      // Hearing needs participant lookups as well
      // File packages need participants loaded for filtering service records belonging to removed parties
      Promise.all([
        this.loadDisputeFiles(disputeGuid),
        this.loadDisputeNotices(disputeGuid),
        this.loadDisputeHearings(disputeGuid),
        this.loadClaimsInformation(disputeGuid),
        this.loadOutcomeDocRequests(disputeGuid),
        ...extraPromiseFns.map(promiseFn => promiseFn())
      ])
        .then(disputeLoadFinishedFn, err => dfd.reject(err))
    }).fail(err2 => dfd.reject(err2));

    return dfd.promise();
  },


  loadDisputeFull(disputeGuid, options) {
    options = options || {};
    // Clear any internal model data

    if (!options.no_reset) {
      this.clearLoadedInfo();
    }

    const disputeLoadFinishedFn = _.bind(function() {
      // On sucessfull load, cache all data
      this.cacheAllData();

      const active_dispute = disputeChannel.request('get');
      applicationChannel.trigger('dispute:loaded:full', active_dispute);
    }, this);

    $.whenAll(
      this.loadDispute(disputeGuid),
      this.loadIntakeQuestions(disputeGuid),
      this.loadClaimGroupParticipants(disputeGuid),
      this.loadDisputeNotes(disputeGuid),
      this.loadDisputeUsers(disputeGuid),
      this.loadCustomDataObjs(disputeGuid),
      this.loadDisputeFlags(disputeGuid),
      this.loadTrialsInfo(disputeGuid),
      this.loadDisputeFees(disputeGuid),
      this.loadDisputeTasks(disputeGuid)
    ).done(() => {
      // Claim information needs the ClaimGroup set first, so we have to run it second
      // Hearing needs participant lookups as well
      // File packages need participants loaded for filtering service records belonging to removed parties
      $.whenAll(
        this.loadDisputeFiles(disputeGuid),
        this.loadDisputeNotices(disputeGuid),
        this.loadDisputeSubServices(disputeGuid),
        this.loadDisputeHearings(disputeGuid),
        this.loadClaimsInformation(disputeGuid),
        this.loadOutcomeDocuments(disputeGuid),
        this.loadOutcomeDocRequests(disputeGuid)
      ).done(disputeLoadFinishedFn)
        .fail(
          generalErrorFactory.createHandler('DISPUTE.LOAD.FULL.2', () => {
            Backbone.history.navigate(routeParse('landing_item'), { trigger: true });
          }, 'You will be redirected to the landing page.')
        );
    }).fail(
      generalErrorFactory.createHandler('DISPUTE.LOAD.FULL.1', () => {
        Backbone.history.navigate(routeParse('landing_item'), { trigger: true });
      }, 'You will be redirected to the landing page.')
    );
  },

  loadDispute(disputeGuid) {
    const dfd = $.Deferred();
    disputeChannel.request('load', disputeGuid).done(function() {
      const dispute = disputeChannel.request('get');
      const currentUser = sessionChannel.request('get:user');
      const existingDispute = disputeHistoryChannel.request('get', disputeGuid);

      if (currentUser.isArbitrator() && !currentUser.isAdjudicator() && !existingDispute) {
        dispute.set({ sessionSettings: {
          ...dispute.get('sessionSettings'),
          hearingToolsEnabled: true
        }});
      }
      disputeHistoryChannel.request('add', dispute);
      dfd.resolve(dispute);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadIntakeQuestions(disputeGuid) {
    const dfd = $.Deferred(),
      emptyResult = [[]];
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}dispute/intakequestions/${disputeGuid}`,
    }).done(dfd.resolve).fail(function(jqXHR) {
      // If no intake questions exist, a 404 will be shown
      if (jqXHR.status === 404) {
        dfd.resolve(emptyResult);
      } else {
        dfd.reject(jqXHR);
      }
    });
    return dfd.promise();
  },

  loadDisputeNotes(disputeGuid) {
    return notesChannel.request('load', disputeGuid);
  },

  loadDisputeNotices(disputeGuid) {
    return noticeChannel.request('load', disputeGuid);
  },

  loadDisputeSubServices(disputeGuid) {
    return noticeChannel.request('load:subservices', disputeGuid);
  },

  loadDisputeHearings(disputeGuid) {
    return hearingChannel.request('load', disputeGuid);
  },

  loadEmails(disputeGuid) {
    return emailsChannel.request('load', disputeGuid);
  },

  loadDisputeTasks(disputeGuid) {
    return taskChannel.request('load', disputeGuid);
  },

  loadDisputeFiles(disputeGuid) {
    // NOTE: File Manager will automatically call all file APIs needed
    return filesChannel.request('load', disputeGuid);
  },

  loadClaimGroupParticipants(disputeGuid) {
    return participantsChannel.request('load', disputeGuid);
  },

  loadClaimsInformation(disputeGuid) {
    return claimsChannel.request('load', disputeGuid, {
      claim_source: configChannel.request('get', 'CLAIM_SOURCE_AMENDMENT'),
      remedy_source: configChannel.request('get', 'REMEDY_SOURCE_AMENDMENT')
    });
  },

  loadDisputeUsers(disputeGuid) {
    return userChannel.request('load:dispute:users', disputeGuid);
  },

  loadCustomDataObjs(disputeGuid) {
    return customDataObjsChannel.request('load', disputeGuid);
  },
  loadDisputeFlags(disputeGuid) {
    return flagsChannel.request('load', disputeGuid);
  },
  loadTrialsInfo(disputeGuid) {
    return trialsChannel.request('load').then(() => trialsChannel.request('load:dispute', disputeGuid));
  },
  loadDisputeFlags(disputeGuid) {
    return flagsChannel.request('load', disputeGuid);
  },
  loadDisputeFees(disputeGuid) {
    return paymentsChannel.request('load', disputeGuid);
  },
  loadOutcomeDocuments(disputeGuid) {
    return documentsChannel.request('load', disputeGuid);
  },
  loadOutcomeDocRequests(disputeGuid) {
    return documentsChannel.request('load:requests', disputeGuid);
  }
});

_.extend(AppModel.prototype, ApplicationBaseModelMixin);


// IDEA: Keep "instance" (aka "view-type") data on the App instance, but more permanent application data on the AppModel model
const App = Marionette.Application.extend({
  region: {
    el: '#root',
    replaceElement: true
  },
  main_content_region: 'mainRegion',

  initialize(options) {
    this.mergeOptions(options, ['model']);

    this.mainViewRouter = null;
  },

  onBeforeStart() {
    $('body').css({
      'backgroundColor': '#fff',
    });
  },

  initializeEventsAndAnimations() {
    $.initializeCustomAnimations({
      scrollableContainerSelector: '.page-view'
    });
    $.initializeDatepickerScroll();
  },

  initializeSiteDependentData() {
    paymentsChannel.request('set:transaction:site:source', configChannel.request('get', 'PAYMENT_TRANSACTION_SITE_SOURCE_ADMIN'));

    // Preload core loaders
    [LoaderSvg, LoaderGif].forEach(url => new Image().src = url);
  },

  onStart() {
    this.initializeErrorReporting();
    this.initializeSiteDependentData();
    this.initializeEventsAndAnimations();
    this.initializeViews(MainView);
    this.initializeRoutersAndRouteListeners();
    this.model.mixin_checkClientTimeSyncAndLogout();
    AnalyticsUtil.initializeAnalyticsTracking();
  },

  initializeErrorReporting() {
    apiChannel.request('create:errorHandler', {
      error_site: configChannel.request('get', 'ERROR_SITE_ADMIN')
    });
  },

  initializeViews(mainViewClass) {
    this.showView(new RootLayout({ model: this, showHeader: true, headerText: HEADER_TITLE_TEXT, showLogout: true }));
    this.mainView = new mainViewClass({ parent: this });
    modalChannel.request('render:root');
  },

  _checkAndShowLoginOverrides() {
    const user = sessionChannel.request('get:user');
    const userCheck = user ? btoa(`${user.id}${user.getUsername().toLowerCase()}`) : null;
    
    if (!userCheck || !_.contains(configChannel.request('get', 'SYSTEM_LOGIN_OVERRIDE_CODES'), userCheck)) {
      // User not eligible for override
      return false;
    }

    // Make sure we are still restricting 401 urls, in case the setting was messed up in an error case
    apiChannel.request('restrict:unauthorized');

    const self = this;
    const loginOverrideModal = new (ModalBaseView.extend({
      template: _.template(`
        <style>#loginOverride_modal { background-color: #fff; }</style>
        <div class="login-page">
          <h3>H1 Dev Login</h3>
          <h4>Use a different account instead of <%= currentUsername %>?</h4>
          <form novalidate>
            <div id="login-username"></div>
            <div id="login-password"></div>
            <div class="" style="float:right;">
              <button type="button" class="btn btn-cancel btn-use-siteminder"
                style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;max-width: 300px;"
              >
                No, continue as <%= currentUsername %>
              </button>
              <button type="button" class="btn btn-standard btn-primary">Login</button>
            </div>
          </form>
        </div>`
      ),
      id: 'loginOverride_modal',
      regions: {
        usernameRegion: '#login-username',
        passwordRegion: '#login-password'
      },
      events() {
        return Object.assign({}, ModalBaseView.prototype.events, {
          'click .btn-cancel': () => console.log('ignore btn-cancel event'),
          'click .btn-use-siteminder': 'useExistingToken',
          'click .btn-primary': 'getNewToken'
        });
      },

      onChildviewInputEnter() {
        this.getNewToken();
      },

      useExistingToken() {
        const token = sessionChannel.request('token');
        user.set('_loginOverrideTokenUsed', token);

        sessionChannel.request('create:timers');
        self.performRoutingActionOnLoginComplete();
        this.close();
      },

      getNewToken() {
        loaderChannel.trigger('page:load');
        apiChannel.request('allow:unauthorized');
        const modal = this;
        sessionChannel.request('authorize', 
          this.getChildView('usernameRegion').model.getData(),
          this.getChildView('passwordRegion').model.getData()
        ).done(token => {
            user.set('_loginOverrideTokenUsed', token);
            localStorage.setItem('authToken', token); // Update the saved siteminder token
            
            sessionChannel.request('create:timers');
            self.performRoutingActionOnLoginComplete();
            modal.close();
          })
          .fail(err => {
            const handler = generalErrorFactory.createHandler('ADMIN.LOGIN.OVERRIDE', () => modal.close());
            handler(err);
            
            // Yield to give global ajax 401 handler time to complete before we allow unauthorized again
            setTimeout(() => apiChannel.request('restrict:unauthorized'), 50);
          }).always(() => loaderChannel.trigger('page:load:complete'));
      },

      onRender() {
        this.showChildView('usernameRegion', new InputView({
          model: new InputModel({
            autofocus: true,
            labelText: 'Name',
            required: true,
            errorMessage: 'Enter your username',
            value: null,
          })
        }));
        this.showChildView('passwordRegion', new InputView({
          model: new InputModel({
            labelText: 'Password',
            required: true,
            errorMessage: 'Enter your password',
            inputType: 'password',
            value: null,
          })
        }));
      },

      templateContext() {
        return {
          currentUsername: (user && user.getUsername()) || 'current user'
        };
      }
    }));
    
    loaderChannel.trigger('page:load:complete');
    modalChannel.request('add', loginOverrideModal);

    return true;
  },

  /**
   * options.disableNav - If true, page will not perform any navigates upon load
   */
  performRoutingActionOnLoginComplete(options={}) {
    const navigationFn = () => {
      if (options?.disableNav) return;
      Backbone.history.navigate(routeParse('landing_item'), { trigger: true });
    };

    if (this.mainView &&_.isFunction(this.mainView.withMenuLoadUpdate)) {
      if (_.isFunction(this.mainView.clearRoutingData)) this.mainView.clearRoutingData();
      if (_.isFunction(this.mainView.checkAndUpdateMenuBasedOnLoginStatus)) this.mainView.checkAndUpdateMenuBasedOnLoginStatus();
      this.mainView.withMenuLoadUpdate(() => navigationFn());
    } else {
      navigationFn();
    }
  },

  initializeAppRouter() {
    new AppRouter({ controller: this });
  },

  initializeRoutersAndRouteListeners() {
    this.initializeAppRouter();
    this.mainViewRouter = new MainViewRouter({ controller: this.mainView });

    // Attach extra view actions to the end of the login complete handler - including login role override
    this.listenTo(this.model, 'perform:routingActions', (options={}) => {
      const user = sessionChannel.request('get:user');
      const currentToken = sessionChannel.request('token');
      const userTokenWasAlreadyUsedInOverride = user && currentToken && user.get('_loginOverrideTokenUsed') === currentToken;
      const isDevOrStaging = _.contains(['development', 'staging'], configChannel.request('get', 'RUN_MODE'));
      if (isDevOrStaging && sessionChannel.request('is:login:siteminder') && !userTokenWasAlreadyUsedInOverride && this._checkAndShowLoginOverrides()) {
        return;
      }
      // We didn't do a login override by this point, so clear token
      user?.set('_loginOverrideTokenUsed', null);

      this.performRoutingActionOnLoginComplete(options);
    });
    
    this.listenTo(menuChannel, 'close:dispute', (disputeGuid) => {
      // When a dispute is removed from the left menu, make sure to remove it from history / cache
      this.model.clearLoadedInfoForDispute(disputeGuid);
      disputeHistoryChannel.request('clear:dispute', disputeGuid);
    });

    Backbone.history.start();
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
    // Keep MainView around since it is the controller for the router
    // Render it each time
    this.renderMainContent(this.mainView.render());

    localStorage.removeItem('splitView');
    if (this.model.get('splitView')) {
      this.model.set('splitView', false);
      modalChannel.request('show:standard', {
        title: `DMS Split View Window`,
        bodyHtml: `
        <p>This new browser window was opened for you so that you can use your operating system to put DMS windows side by side and do data entry while viewing evidence, forms or other items in DMS modals.  
        The previous view that you opened this browser from is still open.</p>` + 
        `<p>When you are done working with the two DMS browser windows, make sure you close the extra DMS windows to avoid errors that can occur when you have multiple DMS windows open.</p>`,
        hideCancelButton: true,
        primaryButtonText: 'Continue',
        onContinueFn: (modalView) => modalView.close()
      });
    }
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
    sessionChannel.trigger('logout:start');
  },

  showLoginView() {
    if (sessionChannel.request('is:login:siteminder')) {
      // Never show the login view when we are in siteminder mode
      return;
    }

    menuChannel.trigger('disable:mobile');
    this.renderMainContent(new LoginView());
  },

  showLogoutView() {
    Backbone.history.navigate('login-page', { trigger: true, replace: true });
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
  module.hot.accept('./pages/main/Main', () => {
    console.log(`[DMS_HMR] Re-loading main view..`);

    // Re-initialize MainView with the newly imported main view
    app.initializeViews(MainView);
    if (app.mainViewRouter) {
      app.mainViewRouter.controller = app.mainView;
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
    setTimeout(() => {
      // Now trigger a page refresh
      const currentRoute = Backbone.history.getFragment();
      // Add a query param to always force a route trigger
      Backbone.history.navigate(`${currentRoute}?`, { trigger: false, replace: false });
      Backbone.history.navigate(`${currentRoute}`, { trigger: true, replace: true });
    }, 25);
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