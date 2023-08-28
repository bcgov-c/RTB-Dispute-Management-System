
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
import 'jquery-timepickerjs';

// Import styles

// Third party components
import 'normalize.css';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/datepicker.css';
import 'jquery-timepicker/jquery.timepicker.css';

// App styles
import '../core/styles/index.css';
import './styles/office.css';

// File temporarily taken from DA.  Should be removed once Office style sweep
import './styles/upload.css';

// Print styles
import '../core/styles/index-print.css';
import './styles/office-print.css';

// Add this line in order to have "$" variable accessible on the developer console
window.$ = window.jQuery = require('jquery');

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

// Import and initialize the global channels
import ConfigManager from '../core/components/config/ConfigManager';
import '../core/components/api/ApiLayer';
import '../core/components/geozone/Geozone';

import '../core/components/animations/AnimationManager';
import '../core/components/timers/TimerManager';
import '../core/components/loaders/PageLoader';
import '../core/components/formatter/Formatter';
import ModalManager from '../core/components/modals/ModalManager';

import '../core/components/user/SessionManager';
import '../core/components/user/UserManager';
import '../core/components/dispute/DisputeManager';
import '../core/components/dispute/ClaimGroupsManager';
import '../core/components/hearing/HearingsManager';
import '../core/components/participant/ParticipantsManager';
import '../core/components/claim/ClaimsManager';
import '../core/components/status/StatusManager';
import '../core/components/notice/NoticeManager';
import '../core/components/payments/PaymentManager';
import '../core/components/files/FilesManager';
import '../core/components/documents/DocumentsManager';
import '../core/components/tasks/TaskManager';
import '../core/components/access/AccessManager';
import '../core/components/dispute-flags/DisputeFlagManager';
import '../core/components/email/EmailsManager';
import '../core/utilities/UtilityMixin';

import { AppRouter } from './routers/office_router';
import DisputeModel from '../core/components/dispute/Dispute_model';
import OfficeTopSearchModel from './pages/office-main/OfficeTopSearch_model';
import RootLayout from '../core/components/root-layout/FloatingRootLayout';

import LoginPageView from './pages/login/LoginPage';
import OfficeMainPageView from './pages/office-main/OfficeMainPage';
import LogoutPageView from './pages/logout/LogoutPage';
import OfficePaymentPageView from './pages/office-payment/OfficePaymentPage';
import OfficeFeeWaiverPageView from './pages/office-payment/OfficeFeeWaiverPage';
import NewDisputePageView from './pages/new-dispute/NewDisputePage';
import NewDisputeUploadsPageView from './pages/new-dispute/NewDisputeUploadsPage';
import NewDisputePaymentsPageView from './pages/new-dispute/NewDisputePaymentsPage';
import NewDisputeReceiptPageView from './pages/new-dispute/NewDisputeReceipt';
import ClarificationPageView from './pages/clarification/OfficeClarificationPage';
import CorrectionPageView from './pages/correction/OfficeCorrectionPage';
import OfficeReviewPageView from './pages/review/OfficeReviewPage';
import OfficeRequestReceiptPageView from './pages/office-request/OfficeRequestReceiptPage';
import OfficeAmendmentPageView from './pages/amendment/OfficeAmendmentPage';
import OfficeSubstitutedServicePageView from './pages/substituted-service/OfficeSubstitutedServicePage';
import OfficePickupPageView from './pages/pickup/OfficePickupPage';
import { withSiteHeaders } from './components/header/Header';
import { loadAndCheckMaintenance } from '../core/components/maintenance/MaintenanceChecker';
import { ApplicationBaseModelMixin } from '../core/components/app/ApplicationBase';
import OfficePickupReceiptPage from './pages/pickup/OfficePickupReceiptPage';
import { generalErrorFactory } from '../core/components/api/ApiLayer';
import AnalyticsUtil from '../core/utilities/AnalyticsUtil';

// Add site name
var g = window || global;
g['_DMS_SITE_NAME'] = 'OfficeSubmission';

const apiDisputeSearchName = 'externalupdate/disputedetails';

const config_paths = [
  // Deployment site variables
  IS_WEBPACK_DEV_SERVER ? require('../siteconfig/ui-configuration-local.json') : '../siteconfig/ui-configuration.json',

  require('../core/config/config.json'),
  require('../core/config/constants.json'),
  require('../core/config/config_issues_evidence.json'),
  require('../core/config/config_status_rules.json'),
  require('../core/config/config_tasks.json'),
  require('../core/config/config_outcome_docs.json'),
  require('../core/config/config_flags.json'),
  require('../core/config/config_subservice.json'),
];

const sessionChannel = Radio.channel('session');
const apiChannel = Radio.channel('api');
const applicationChannel = Radio.channel('application');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const claimGroupsChannel = Radio.channel('claimGroups');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const paymentsChannel = Radio.channel('payments');
const hearingChannel = Radio.channel('hearings');
const noticeChannel = Radio.channel('notice');
const documentsChannel = Radio.channel('documents');
const flagsChannel = Radio.channel('flags');
const emailsChannel = Radio.channel('emails');

const HEADER_TITLE_TEXT = 'Residential Tenancies - Office Submissions';

const AppModel = Backbone.Model.extend({
  defaults: {
    receiptData: null,
  },

  initialize() {
    // Setup any expected loader data:
    __loaderData = __loaderData || {};
    this.setupChannels();
  },

  setupChannels() {
    applicationChannel.reply('clear', this.clearLoadedInfo, this);
    applicationChannel.reply('clear:dispute', function() { this.clearLoadedInfo(true) }, this);
  },

  clearReceiptData() {
    this.set('receiptData', null);
  },

  setReceiptData(receiptData) {
    this.set('receiptData', receiptData);
  },

  getReceiptData() {
    return this.get('receiptData');
  },

  clearLoadedInfo(clearDisputeDataOnly) {
    if (!clearDisputeDataOnly) {
      const topSearchModel = this.get('topSearchModel');
      if (topSearchModel) {
        topSearchModel.clearWithDefaults(this);
      }
    }

    this.set({
      officePayorName: null,
      officePaymentMethod: null,
      receiptData: null,
    });

    // Clears all dispute and login info
    disputeChannel.request('clear');
    participantsChannel.request('clear');
    claimGroupsChannel.request('clear');
    claimsChannel.request('clear');
    filesChannel.request('clear');
    sessionChannel.request('clear');
    paymentsChannel.request('clear');
    noticeChannel.request('clear');
    hearingChannel.request('clear');
    documentsChannel.request('clear');
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

  getFormCodeUsedFromLoadedDispute() {
    const dispute = disputeChannel.request('get');
    const isLandlord = dispute.isLandlord();
    const isTenant = dispute.isTenant();
    const isPastTenancy = dispute.isPastTenancy();
    const isDirectRequest = dispute.isNonParticipatory();
    const isEmergency = dispute.isUrgent();
    const isPaperRentIncrease = dispute.isCreatedAriE();

    let formCode;
    if (isTenant) {
      if (isDirectRequest) {
        formCode = 98;
      } else if (isPastTenancy) {
        formCode = 94;
      } else if (isEmergency) {
        formCode = 77;
      } else {
        formCode = 93;
      }
    } else if (isLandlord) {
      if (isDirectRequest) {
        formCode = 96;
      } else if (isPastTenancy) {
        formCode = 97;
      } else if (isEmergency) {
        formCode = 76;
      } else if (isPaperRentIncrease) {
        formCode = 79;
      } else {
        formCode = 95;
      }
    }
    return formCode;
  },

  getApiErrorMessageInvalidParticipantCode() {
    const API_ERROR_MESSAGE_CODE_NOT_FOUND = "Participant access code not provided or invalid";
    return API_ERROR_MESSAGE_CODE_NOT_FOUND;
  },

  getOfficeTopSearchModel() {
    return this.get('topSearchModel');
  },

  performFileNumberSearch(fileNumber) {
    if (!fileNumber) {
      return $.Deferred().reject().promise();
    }

    return this._performOfficeDisputeSearch({
      SearchMethod: configChannel.request('get', 'OFFICE_DISPUTE_DETAILS_SEARCH_METHOD_FILENUMBER'),
      FileNumber: fileNumber
    });
  },

  performAccessCodeSearch(accessCode, options) {
    options = options || {};

    if (!accessCode || accessCode === configChannel.request('get', 'ETL_GENERIC_ACCESS_CODE')) {
      // Reject and spoof the mid-tier "not found" response
      return $.Deferred().reject({ status: 400, responseText: this.getApiErrorMessageInvalidParticipantCode()}).promise();
    }

    const searchData = {
      SearchMethod: configChannel.request('get', 'OFFICE_DISPUTE_DETAILS_SEARCH_METHOD_ACCESSCODE'),
      AccessCode: accessCode
    };

    return options.minimal ? this.disputeSearchPromise(searchData) : this._performOfficeDisputeSearch(searchData);
  },

  _performOfficeDisputeSearch(searchData) {
    return this.disputeSearchPromise(searchData)
      .then(response => {
        const disputeModel = this.initializeDisputeAccessDispute(response, searchData.AccessCode);
        return disputeModel;
      });
  },

  disputeSearchPromise(searchData) {
    const searchParams = $.param(searchData);
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${apiDisputeSearchName}?${searchParams}`
    });
  },

  load() {
    const geozoneChannel = Radio.channel('geozone');
    const dfd = $.Deferred();

    // Setup login and logout listeners - they will be triggered when `mixin_checkSiteVersionAndLogin` runs
    this.listenTo(sessionChannel, 'login:complete', (options={}) => {
      sessionChannel.request('clear:timers');
      sessionChannel.request('create:timers', options);
      const currentUser = sessionChannel.request('get:user');
      if (!currentUser.isOfficeUser() && !currentUser.isSystemUser()) {
        console.log(`[Warning] Login success, but user is not an Office user or Staff user. Logging out.`);
        Backbone.history.navigate('logout', { trigger: true });
        return;
      } else {
        Backbone.history.navigate('main', { trigger: true });
      }
    });
    this.listenTo(sessionChannel, 'logout:complete', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('_dmsDaAuthToken');
      applicationChannel.request('clear');
      sessionChannel.request('clear:timers');
    });

    $.when(
      this.loadConfigs()
        .then(geozoneChannel.request.bind(geozoneChannel, 'load'), () => sessionChannel.trigger('redirect:config:error'))
        .then(_.bind(this.mixin_checkSiteVersionAndLogin, this)),
      this.minimumLoadTimePromise()
    ).done(function() {
        const system_id = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_OFFICE');
        loadAndCheckMaintenance(system_id).done(function() {
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

  loadConfigs() {
    // Load any internal config values
    ConfigManager.loadInternalConfig();

    // Then load config values from files
    const dfd = $.Deferred();
    Promise.all(_.map(config_paths, function(path) { return ConfigManager.loadConfig(path); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  initializeNewDispute() {
    const newDispute = new DisputeModel();
    disputeChannel.request('set:active', newDispute);
  },

  initializeDisputeAccessDispute(dispute_data, access_code) {
    applicationChannel.request('clear:dispute');

    const new_dispute = new DisputeModel();
    const filtered_keys = _.pick(dispute_data, function(val, key) {
      return _.contains(_.keys(new_dispute.attributes), key);
    });
    // Add dispute_process or process manually, it is custom for disputeaccess return
    const status = _.pick(dispute_data, [...new_dispute.API_STATUS_ATTRS, 'dispute_process', 'process']);
    filtered_keys.status = _.extend(status, { process: status.dispute_process });
    
    // Also store some disputeaccess specific info here
    filtered_keys.accessCode = access_code;
    filtered_keys._routingAccessCode = access_code;
    filtered_keys.tokenParticipantId = dispute_data.token_participant_id;
    filtered_keys.hearingStartDate = dispute_data.hearing_start_datetime;
    filtered_keys.currentNoticeId = dispute_data.current_notice_id;

    // If the hearing was before now, clear it so we don't display anything.
    if (filtered_keys.hearingStartDate && Moment(filtered_keys.hearingStartDate).isBefore(Moment(), 'days')) {
      filtered_keys.hearingStartDate = null;
    }

    new_dispute.set(filtered_keys);

    disputeChannel.request('set:active', new_dispute);

    if (filtered_keys.tokenParticipantId) {
      sessionChannel.request('set:active:participant:id', filtered_keys.tokenParticipantId);
    }

    // Load key participant/files data first, it's used by later manager loads
    emailsChannel.request('load:disputeaccess', dispute_data.pickup_messages);
    claimGroupsChannel.request('load:disputeaccess', dispute_data.claim_groups);
    participantsChannel.request('load:disputeaccess', dispute_data.claim_groups);
    filesChannel.request('load:disputeaccess', dispute_data.claims);
    claimsChannel.request('load:disputeaccess', dispute_data.claims);
    
    flagsChannel.request('load:disputeaccess', dispute_data.linked_dispute_flags);
    hearingChannel.request('load:disputeaccess', dispute_data);
    paymentsChannel.request('load:disputeaccess', dispute_data.dispute_fees);
    documentsChannel.request('load:disputeaccess', dispute_data);
    noticeChannel.request('load:disputeaccess', dispute_data.notice_services, dispute_data.notice_associated_to);

    return new_dispute;
  }
});

_.extend(AppModel.prototype, ApplicationBaseModelMixin);


// IDEA: Keep "instance" (aka "view-type") data on the App instance, but more permanent application data on the AppModel model
const App = Marionette.Application.extend({
  region: {
    el: '#root',
    replaceElement: true
  },

  initialize() {
    this.model = this.options.model;
    this.modalManager = ModalManager;
  },

  onBeforeStart() {
    $('body').css({
      backgroundColor: '#fff',
    });
    this.model.set('topSearchModel', new OfficeTopSearchModel({ appModel: this.model }));
  },

  initializeEventsAndAnimations() {
    $.initializeCustomAnimations({
      scrollableContainerSelector: '.page-view'
    });
    $.initializeDatepickerScroll();
  },

  initializeSiteDependentData() {
    paymentsChannel.request('set:transaction:site:source', configChannel.request('get', 'PAYMENT_TRANSACTION_SITE_SOURCE_OFFICE'));
  },

  onStart() {
    this.initializeErrorReporting();
    this.initializeSiteDependentData();
    this.initializeEventsAndAnimations();
    this.initializeViews();
    this.initializeRoutersAndRouteListeners();
    this.model.mixin_checkClientTimeSyncAndLogout();
    AnalyticsUtil.initializeAnalyticsTracking();
  },

  initializeErrorReporting() {
    apiChannel.request('create:errorHandler', {
      error_site: configChannel.request('get', 'ERROR_SITE_OFFICE')
    });
  },

  clearReceiptData() {
    this.model.clearReceiptData();
  },

  initializeViews() {
    this.showView(new RootLayout({ model: this, headerText: HEADER_TITLE_TEXT ,showProblemButton: true, hideHeaderInner: true }));

    // Once the views have been initialized, setup the modal container
    modalChannel.request('render:root');
  },

  initializeAppRouter() {
    new AppRouter({ controller: this });
  },

  showDefaultView() {
    const currentUser = sessionChannel.request('get:user');
    
    if (!currentUser.isOfficeUser() && !currentUser.isSystemUser()) {
      console.log(`[Warning] Login success, but user is not an Office user or Staff user. Logging out.`);
      Backbone.history.navigate('logout', { trigger: true });
      return;
    }

    Backbone.history.navigate('main', { trigger: true });
  },

  initializeRoutersAndRouteListeners() {
    this.initializeAppRouter();

    Backbone.history.start();
  },

  _renderMainView(newView, options) {
    options = options || {};

    const rootLayoutView = this.getView();
    const mainRegion = rootLayoutView.getMainContentRegion();
    const floatingRegion = rootLayoutView.getFloatingContentRegion();

    const previousMainView = mainRegion.detachView();
    floatingRegion.detachView();
    rootLayoutView.setOptions(options || {}).render();

    mainRegion.show(newView);
    rootLayoutView.showMainContent();

    if (!options.no_loader) {
      loaderChannel.trigger('page:load:complete');
    }

    if (previousMainView) {
      try {
        previousMainView.destroy();
      } catch (err) {
        console.log(`[Warning] Couldn't clean up previous main view`, err, previousMainView);
      }
    }
  },

  _renderFloatingView(newView, options) {
    setTimeout(() => loaderChannel.trigger('page:load:complete'), 50);

    const rootLayoutView = this.getView();
    const mainRegion = rootLayoutView.getMainContentRegion();
    const floatingRegion = rootLayoutView.getFloatingContentRegion();

    mainRegion.detachView();
    floatingRegion.detachView();
    rootLayoutView.setOptions(options || {}).render();

    floatingRegion.show(newView);
    rootLayoutView.showFloatingContent();
  },

  // Routing controller actions
  renderMainContent(view, options) {
    const mainViewOptions = _.extend({ hideHeader: false, hideFooter: false }, options);
    this._renderMainView(view, mainViewOptions);

    // Always scroll the page to the top on new page rendering
    $.scrollPageToTop();
  },

  showOfficeMainView() {
    this.renderMainContent(new OfficeMainPageView({ model: this.model }), { no_loader: true });
  },

  showOfficePayment(disputeFeeId) {
    this.renderMainContent(new OfficePaymentPageView({ model: this.model, disputeFeeId }));
  },

  showOfficeFeeWaiver(disputeFeeId) {
    this.renderMainContent(new OfficeFeeWaiverPageView({ model: this.model, disputeFeeId }));
  },

  showNewDisputePage() {
    this.renderMainContent(new NewDisputePageView({ model: this.model }));
  },

  showNewDisputeUploadsPage() {
    this.renderMainContent(new NewDisputeUploadsPageView({ model: this.model }));
  },

  showNewDisputePaymentsPage() {
    this.renderMainContent(new NewDisputePaymentsPageView({ model: this.model }));
  },

  showNewDisputeReceiptPage() {
    this.renderMainContent(new NewDisputeReceiptPageView({ 
      model: this.model, 
    }));
  },

  showClarificationPage() {
    this.renderMainContent(new ClarificationPageView({ model: this.model }));
  },

  showClarificationReceiptPage() {
    this.renderMainContent(new OfficeRequestReceiptPageView({
      model: this.model,
      submissionReceiptData: {
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_CLARIFICATION'),
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_CLARIFICATION')
      }
    }));
  },

  showCorrectionPage() {
    this.renderMainContent(new CorrectionPageView({ model: this.model }));
  },

  showCorrectionReceiptPage() {
    this.renderMainContent(new OfficeRequestReceiptPageView({
      model: this.model,
      submissionReceiptData: {        
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_CORRECTION'),
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_CORRECTION')
      }
    }));
  },

  showReviewPage() {
    this.renderMainContent(new OfficeReviewPageView({ model: this.model }));
  },

  showReviewReceiptPage() {
    this.renderMainContent(new OfficeRequestReceiptPageView({
      receiptTitle: 'Application for Review Consideration',
      model: this.model,
      submissionReceiptData: {        
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_REVIEW'),
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_REVIEW')
      }
    }));
  },

  showAmendmentPage() {
    this.renderMainContent(new OfficeAmendmentPageView({ model: this.model }));
  },

  showAmendmentReceiptPage() {
    this.renderMainContent(new OfficeRequestReceiptPageView({
      model: this.model,
      isAmendment: true,
      submissionReceiptData: {
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_AMENDMENT'),
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_AMENDMENT')
      }
    }));
  },

  showSubstitutedServicePage() {
    this.renderMainContent(new OfficeSubstitutedServicePageView({ model: this.model }));
  },

  showSubstitutedServiceReceiptPage() {
    this.renderMainContent(new OfficeRequestReceiptPageView({
      model: this.model,
      submissionReceiptData: {
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_SUB_SERVICE'),
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_SUB_SERVICE')
      }
    }));
  },

  showPickupPage() {
    loaderChannel.trigger('page:load');
    emailsChannel.request('load:pickups').then(() => {
      this.renderMainContent(new OfficePickupPageView({ model: this.model }));
      loaderChannel.trigger('page:load:complete');
    }).catch(generalErrorFactory.createHandler('PICKUP.MESSAGE.LOAD'))
  },

  showPickupReceiptPage() {
    this.renderMainContent(new OfficePickupReceiptPage({ model: this.model }));
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

  renderLoginLogoutContent(view) {
    const loginLogoutViewOptions = { hideHeader: true, hideFooter: true };
    this._renderFloatingView(withSiteHeaders(view), loginLogoutViewOptions);
  },

  showLoginView() {
    applicationChannel.request('clear');
    this.renderLoginLogoutContent(new LoginPageView({ model: this.model }));
  },

  showLogoutView() {
    applicationChannel.request('clear');
    this.renderLoginLogoutContent(new LogoutPageView({ model: this.model }));
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

  // If no other hmr handler matches, perform no refresh by default
  module.hot.accept();
};
const loadAndStartApplication = () => {
  appModel.mixin_loadAndStartApplicationWithBrowserCheck(app);
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
