
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

// App styles
import '../core/styles/index.css';
import '../core/styles/index.scss';
import './styles/dac.scss';
import './styles/loginlogout.scss';
import './pages/update-contact/UpdateContact.scss';
import './pages/upload/Upload.scss';
import './pages/notice-service/NoticeService.scss';

// Print styles
import '../core/styles/index-print.css';
import './styles/dac-print.scss';

// Add this line in order to have "$" variable accessible on the developer console
window.$ = window.jQuery = require('jquery');

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

// Import and initialize the global channels
import ConfigManager from '../core/components/config/ConfigManager';
import '../core/components/api/ApiLayer';
import { generalErrorFactory } from '../core/components/api/ApiLayer';
import '../core/components/user/UserManager';
import '../core/components/animations/AnimationManager';
import '../core/components/loaders/PageLoader';
import ModalManager from '../core/components/modals/ModalManager';
import '../core/components/formatter/Formatter';
import '../core/components/dispute/DisputeManager';
import '../core/components/dispute/ClaimGroupsManager';
import '../core/components/hearing/HearingsManager';
import '../core/components/participant/ParticipantsManager';
import '../core/components/claim/ClaimsManager';
import '../core/components/files/FilesManager';
import '../core/components/documents/DocumentsManager';
import '../core/components/payments/PaymentManager';
import '../core/components/tasks/TaskManager';
import '../core/components/access/AccessManager';
import '../core/components/timers/TimerManager';
import '../core/components/email/EmailsManager';
import '../core/components/dispute-flags/DisputeFlagManager';
import '../core/components/user/SessionManager';
import '../core/components/status/StatusManager';
import '../core/components/notice/NoticeManager';
import { loadAndCheckMaintenance } from '../core/components/maintenance/MaintenanceChecker';
import '../core/components/trials/TrialsManager';

import AppRouter from './routers/access_router';
import DisputeModel from '../core/components/dispute/Dispute_model';
import FloatingRootLayout from '../core/components/root-layout/FloatingRootLayout';

import LoginPageView from './pages/login/LoginPage';
import AccessPageView from './pages/access/AccessPage';
import UpdateContactPageView from './pages/update-contact/UpdateContactPage';
import UpdateContactReceipt from './pages/update-contact/UpdateContactReceipt';
import NoticeServiceMenuPage from './pages/notice-service/NoticeServiceMenuPage';
import SubmitNoticeServicePage from './pages/notice-service/SubmitNoticeServicePage';
import SubmitNoticeServiceReceipt from './pages/notice-service/SubmitNoticeServiceReceipt';
import EvidenceSummaryPageView from './pages/upload/EvidenceSummaryPage';
import EvidenceUploadPageView from './pages/upload/DAUploadPage';
import { UploadReceiptPage } from './pages/upload/upload-receipt/UploadReceiptPage';
import LogoutPageView from './pages/logout/LogoutPage';
import DAPaymentPage from './pages/payment/DAPaymentPage';
import DAPaymentReceiptPage from './pages/payment/DAPaymentReceiptPage';
import ExternalDisputeStatus_model from './components/external-api/ExternalDisputeStatus_model';
import ExternalDisputeInfo_model from '../office/components/external-api/ExternalDisputeInfo_model';
import { CorrectionClarificationReceiptView } from './pages/correction-clarification/CorrectionClarificationReceiptPage';
import { CorrectionClarificationView } from './pages/correction-clarification/CorrectionClarificationPage';
import { ReviewPage } from './pages/review/ReviewPage';
import { ReviewPaymentPage } from './pages/review/ReviewPaymentPage';
import { SubstitutedServicePage } from './pages/subtituted-service/SubstitutedServicePage';
import { SubstitutedServiceReceiptPage } from './pages/subtituted-service/SubstitutedServiceReceiptPage';
import { AccessTokenRecoveryPage } from './pages/access-token-recovery/AccessTokenRecovery';
import { withSiteHeaders } from './components/header/Header';
import { ApplicationBaseModelMixin } from '../core/components/app/ApplicationBase';
import UtilityMixin from '../core/utilities/UtilityMixin';
import ModalExternalLogin from './pages/login/ModalExternalLogin';
import TrialLogic_BIGEvidence from '../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import ModalEvidenceReminder from '../core/components/trials/BIGEvidence/ModalEvidenceReminder';
import AmendmentPage from './pages/amendment/AmendmentPage';
import { AmendmentReceiptPage } from './pages/amendment/AmendmentReceiptPage';
import AnalyticsUtil from '../core/utilities/AnalyticsUtil';

const DA_MAIN_SITE_CLASSNAME = 'dac';
const DA_HEADER_TITLE_TEXT = 'Residential Tenancies - Dispute Access';
const DA_RECEIPT_FONT_SIZE_PX = 17;

// Add site name
var g = window || global;
g['_DMS_SITE_NAME'] = 'DisputeAccess';

const _hotReloadDependencies = [
  '../core/components/config/ConfigManager',
  '../core/components/api/ApiLayer',
  '../core/components/user/UserManager',
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
  '../core/components/dispute-flags/DisputeFlagManager',
  '../core/components/status/StatusManager',
  '../core/components/notice/NoticeManager',
  './components/amendments/AmendmentsManager',
  './routers/access_router',
  '../core/components/maintenance/MaintenanceChecker',
  '../core/components/app/ApplicationBase',
];

const paymentsChannel = Radio.channel('payments');
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
const noticeChannel = Radio.channel('notice');
const documentsChannel = Radio.channel('documents');
const taskChannel = Radio.channel('tasks');
const hearingChannel = Radio.channel('hearings');
const trialsChannel = Radio.channel('trials');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');

const config_paths = [
  // Deployment site variables
  IS_WEBPACK_DEV_SERVER ? require('../siteconfig/ui-configuration-local.json') : '../siteconfig/ui-configuration.json',

  require('../core/config/config.json'),
  require('../core/config/constants.json'),
  require('../core/config/config_issues_evidence.json'),
  require('../core/config/config_status_rules.json'),
  require('../core/config/config_outcome_docs.json'),
  require('../core/config/config_tasks.json'),
  require('../core/config/config_flags.json'),
  require('../core/config/config_subservice.json'),
];

const AppModel = Backbone.Model.extend({
  defaults: {
    activeDispute: null,
    accessCode: null,
    submitterName: null,
    receiptData: null,
    skipInitialLogin: false,
    reviewDataCache: null,
    reviewNotificationDisplayed: false,
    emailVerificationDisplayed: false,
    
    // For external routing
    extSiteId: null,
    extActionId: null,
  },

  initialize() {
    // Setup any expected loader data:
    __loaderData = __loaderData || {};
    this.setupChannels();
  },

  setupChannels() {
    applicationChannel.on('load:disputeaccess', this.loadDisputeAccess, this);
    applicationChannel.reply('clear', this.clearLoadedInfo, this);
  },

  clearReceiptData() {
    this.set('routingReceiptMode', false);
    this.set('receiptData', null);
  },

  setReceiptData(receiptData) {
    this.set('receiptData', receiptData);
  },

  getReceiptData() {
    return this.get('receiptData');
  },

  clearLoadedInfo() {
    this.set({
      accessCode: null,
      submitterName: null,
      receiptData: null,
      routingReceiptMode: false,
      extSiteId: null,
      extActionId: null,
    });
    sessionStorage.removeItem('_dmsPaymentToken');

    // Clears all dispute and login info
    disputeChannel.request('clear');
    participantsChannel.request('clear');
    claimGroupsChannel.request('clear');
    claimsChannel.request('clear');
    filesChannel.request('clear');
    sessionChannel.request('clear');
    noticeChannel.request('clear');
    hearingChannel.request('clear');
    documentsChannel.request('clear');
    paymentsChannel.request('clear');
    taskChannel.request('clear');
    trialsChannel.request('clear');
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
    // Setup login and logout listeners
    this.listenTo(sessionChannel, 'login:complete', (options={}) => {
      sessionChannel.request('clear:timers');
      sessionChannel.request('create:timers', options);
    });
    this.listenTo(sessionChannel, 'logout:complete', () => {
      this.set('skipInitialLogin', false);
      sessionStorage.removeItem('_dmsPaymentToken');
      localStorage.removeItem('_dmsDaAuthToken');
      applicationChannel.request('clear');
      sessionChannel.request('clear:timers');
    });

    const logoutFn = () => {
      const EXTERNAL_LOGOUT_URL = configChannel.request('get', 'EXTERNAL_LOGOUT_URL');
      if (EXTERNAL_LOGOUT_URL) {
        window.location.assign(EXTERNAL_LOGOUT_URL);
      } else {
        Backbone.history.navigate('logout', { trigger: true }); 
      }
    };

    const dfd = $.Deferred();
    $.whenAll(
      this.loadConfigs()
        .then(this.mixin_checkVersion.bind(this), () => sessionChannel.trigger('redirect:config:error')),
      this.minimumLoadTimePromise()
    ).done(function() {
        const disputeAccessSystemId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_DISPUTEACCESS');
        loadAndCheckMaintenance(disputeAccessSystemId, logoutFn).done(function() {
          dfd.resolve();
        }).fail(function() {
          // An ongoing maintenance record existed, start timout timer
          setTimeout(function() {
            logoutFn();
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

  loadDisputeAccess(accessCode, submitterName) {
    const api_disputeaccess_login = 'accesscodelogin';
    const API_ERROR_ACCESS_CODE_NOT_FOUND = "Provided Access Code is incorrect";
    
    if (accessCode === configChannel.request('get', 'ETL_GENERIC_ACCESS_CODE')) {
      // Don't perform any login when the ETL code is used
      applicationChannel.trigger('load:disputeaccess:fail');
      return;
    }

    // Save the submitter name and access code used
    this.set({ accessCode, submitterName });
    apiChannel.request('call', {
      method: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_disputeaccess_login}/${accessCode}`,
    }).done(response => {
      sessionChannel.request('set:user:name', submitterName);
      if (_.isObject(response) && !_.isString(response)) {
        this.initializeDisputeAccessClosed(accessCode, response);
      } else {
        this.initializeDisputeAccessOpen(accessCode, response);
      }
    }).fail(err => {
      err = err || {};
      let supressErrorModal = false;
      if (err.status === 400 && $.trim(err.responseText).indexOf(API_ERROR_ACCESS_CODE_NOT_FOUND) !== -1) {
        supressErrorModal = true;
      }

      if (supressErrorModal) {
        applicationChannel.trigger('load:disputeaccess:fail');
      } else {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('DA.DISPUTE.LOAD', () => {
          applicationChannel.trigger('load:disputeaccess:fail');
        })(err);
      }
    });

  },

  loadTrialsInfo(disputeGuid) {
    return trialsChannel.request('load').then(() => trialsChannel.request('load:dispute', disputeGuid));
  },

  initializeDisputeAccessOpen(access_code, response_token) {
    sessionChannel.request('authorize:token', response_token);
    this.loadDisputeAccessOpen()
      .done(response_data => {
        this.loadDisputeAccessOpenDataChannels(response_data, access_code);

        this.loadTrialsInfo(response_data.dispute_guid).finally(() => (
          applicationChannel.trigger('dispute:loaded:disputeaccess')
        ));
      })
      .fail( generalErrorFactory.createHandler('DA.DISPUTE.LOAD', () => applicationChannel.trigger('load:disputeaccess:fail')) );
  },

  loadDisputeAccessOpen() {
    const api_disputeaccess_load = 'accesscodefileinfo';
    return apiChannel.request('call', {
      method: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_disputeaccess_load}`
    });
  },

  loadDisputeAccessOpenDataChannels(responseData, accessCode=null) {
    // Fill dispute data
    const dispute = this.initializeDisputeAccessDispute(responseData, accessCode);
    dispute.set('disputeAccessOpen', true);
    // Now perform a full load of the dispute
    sessionChannel.request('set:active:participant:id', responseData.token_participant_id);

    hearingChannel.request('load:disputeaccess', responseData);
    noticeChannel.request('load:disputeaccess', responseData.notice_services, responseData.notice_associated_to);
    claimsChannel.request('load:disputeaccess', responseData.claims);
    filesChannel.request('load:disputeaccess', responseData.claims, responseData.unlinked_file_description);

    flagsChannel.request('load:disputeaccess', responseData.linked_dispute_flags);
    documentsChannel.request('load:disputeaccess', responseData);
    paymentsChannel.request('load:disputeaccess', responseData.dispute_fees);
  },

  initializeDisputeAccessClosed(access_code, response_data) {
    const dispute = this.initializeDisputeAccessDispute(response_data, access_code);

    // Set all the extra data on the dispute if is closed
    dispute.set(_.extend(response_data, {
      disputeAccessOpen: false
    }));
    
    if (_.isObject(response_data) && _.isArray(response_data.hearings) && response_data.hearings.length) {
      const activeHearing = response_data.hearings.slice(-1)[0];
      const activeHearingStartDate = activeHearing && activeHearing.hearing_start_date;
      const timezoneString = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
      const hearingEndWithTimezone = activeHearing && activeHearing.hearing_end_date && Moment.tz(activeHearing.hearing_end_date, timezoneString);

      if (activeHearingStartDate && (hearingEndWithTimezone && !hearingEndWithTimezone.isBefore(Moment(), 'days'))) {
        dispute.set('hearingStartDate', activeHearingStartDate);
      }
    }

    // Trigger handlers on login complete to start the logout timers even when no API login
    sessionChannel.trigger('login:complete', { skip_api_refresh: true });
    applicationChannel.trigger('dispute:loaded:disputeaccess');
  },

  initializeDisputeAccessDispute(dispute_data, access_code=null) {
    const new_dispute = new DisputeModel();
    const filtered_keys = _.pick(dispute_data, function(val, key) {
      return _.contains(_.keys(new_dispute.attributes), key);
    });
    // Add dispute_process manually, it is custom for disputeaccess return
    const status = _.pick(dispute_data, [...new_dispute.API_STATUS_ATTRS, 'dispute_process']);
    filtered_keys.status = _.extend(status, { process: status.dispute_process });
    
    // Also store some disputeaccess specific info here
    filtered_keys.accessCode = access_code;
    filtered_keys.tokenParticipantId = dispute_data.token_participant_id;
    filtered_keys.hearingStartDate = dispute_data.hearing_start_datetime;
    filtered_keys.currentNoticeId = dispute_data.current_notice_id;

    new_dispute.set(filtered_keys);

    disputeChannel.request('set:active', new_dispute);

    claimGroupsChannel.request('load:disputeaccess', dispute_data.claim_groups);
    participantsChannel.request('load:disputeaccess', dispute_data.claim_groups);

    return new_dispute;
  },

  // Used in Evidence site to stash the uploaded files
  clearSavedEvidence() {
    this.set('disputeEvidencesToUpload', {});
  },

  _getPendingUploadIndex(dispute_evidence_model) {
    return dispute_evidence_model.isNew() ? dispute_evidence_model.cid :
        dispute_evidence_model.get('file_description').get('file_description_id');
  },

  getPendingUploads() {
    return this.get('disputeEvidencesToUpload');
  },

  hasPendingUpload(disputeEvidenceModel) {
    const indexToUse = this._getPendingUploadIndex(disputeEvidenceModel);
    return !!(this.getPendingUploads()[indexToUse]);
  },

  addPendingUpload(dispute_evidence_model) {
    const disputeEvidencesToUpload = this.get('disputeEvidencesToUpload'),
      index_to_use = this._getPendingUploadIndex(dispute_evidence_model);

    if (!_.has(disputeEvidencesToUpload, index_to_use)) {
      disputeEvidencesToUpload[index_to_use] = dispute_evidence_model;
    }
  },

  removePendingUpload(dispute_evidence_model) {
    const disputeEvidencesToUpload = this.get('disputeEvidencesToUpload'),
      index_to_use = this._getPendingUploadIndex(dispute_evidence_model);

    if (_.has(disputeEvidencesToUpload, index_to_use)) {
      delete disputeEvidencesToUpload[index_to_use];
    }
  },

  clearPendingUploads() {
    const pending_uploads = this.getPendingUploads();

    // Iterate through API data and reset
    _.each(pending_uploads, function(dispute_evidence_model) {
      dispute_evidence_model.get('files').resetCollection();

      if (dispute_evidence_model.isNew()) {
        dispute_evidence_model.destroy();
      }
    });
    this.set('disputeEvidencesToUpload', {});
  },

  showEvidenceWarningPromise(claimModel) {
    return this.showEvidenceDisclaimerPromise(claimModel).then(() => this.showTrialEvidenceModalPromise());
  },

  showEvidenceDisclaimerPromise(claimModel) {
    const dispute = disputeChannel.request('get');
    const shouldShowWarning = dispute && dispute.isCreatedPfr();

    return new Promise((res, rej) => {
      if (!claimModel || !shouldShowWarning) return res();
      let isResolved = false;
      const modalView = modalChannel.request('show:standard', {
        title: 'Upload/Edit Evidence',
        bodyHtml: `<p>You are adding evidence to the following address. Make sure that you submit all important evidence to your correct unit address.</p>
        <p><b>${claimModel.getClaimTitle()}</b></p>
        <p>If this is not the correct address for the evidence you plan to upload, press Cancel and select the correct address. If you are sure this is the correct address for your evidence, press Continue.`,
        onContinueFn(_modalView) {
          isResolved = true;
          _modalView.close();
          res();
        }
      });

      this.listenTo(modalView, 'removed:modal', function() {
        if (!isResolved) {
          rej();
        }
      });
    });
  },

  showTrialEvidenceModalPromise() {
    const dispute = disputeChannel.request('get');
    const participant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    return new Promise(res => {
      if (!TrialLogic_BIGEvidence.canViewDisputeAccessEvidenceNudgeInterventions(dispute, participant)) return res();
      const trialModalView = new ModalEvidenceReminder();
      this.listenTo(trialModalView, 'continue', () => {
        trialModalView.close();
        // Save intervention, save trial participant
        TrialLogic_BIGEvidence.addDisputeAccessParticipantInterventionEvidence(participant)
          .finally(res);
      });
      modalChannel.request('add', trialModalView);
    });
  },

  isInitialRespondentLogin() {
    const dispute = disputeChannel.request('get');
    const participant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    return participant && !participant.get('accepted_tou') && participant.isRespondent();
  },

  getReceiptFontSizePx() {
    return DA_RECEIPT_FONT_SIZE_PX;
  },
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
  },

  initializeEventsAndAnimations() {
    $.initializeCustomAnimations({
      scrollableContainerSelector: '.page-view'
    });
    $.initializeDatepickerScroll();
  },

  initializeSiteDependentData() {
    paymentsChannel.request('set:transaction:site:source', configChannel.request('get', 'PAYMENT_TRANSACTION_SITE_SOURCE_DISPUTEACCESS'));
  },

  clearReceiptData() {
    this.model.clearReceiptData();
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
      error_site: configChannel.request('get', 'ERROR_SITE_DISPUTEACCESS')
    });
  },

  initializeViews() {
    this.showView(new FloatingRootLayout({
      mainContentClasses: DA_MAIN_SITE_CLASSNAME,
      headerText: DA_HEADER_TITLE_TEXT,
      showHeaderProblemButton: true,
      model: this,
    }));

    // Once the views have been initialized, setup the modal container
    modalChannel.request('render:root');
  },

  initializeRoutersAndRouteListeners() {
    new AppRouter({ controller: this });

    Backbone.history.start();
  },

  _renderMainView(newView, options) {
    loaderChannel.trigger('page:load:complete');
    const rootLayoutView = this.getView(),
      mainRegion = rootLayoutView.getMainContentRegion(),
      floatingRegion = rootLayoutView.getFloatingContentRegion();

    mainRegion.detachView();
    floatingRegion.detachView();
    rootLayoutView.setOptions(options || {}).render();

    mainRegion.show(newView);
    rootLayoutView.showMainContent();
  },

  _renderFloatingView(newView, options) {
    setTimeout(_.bind(loaderChannel.trigger, loaderChannel, 'page:load:complete'), 50);
    const rootLayoutView = this.getView(),
      mainRegion = rootLayoutView.getMainContentRegion(),
      floatingRegion = rootLayoutView.getFloatingContentRegion();

    mainRegion.detachView();
    floatingRegion.detachView();
    rootLayoutView.setOptions(options || {}).render();

    floatingRegion.show(newView);
    rootLayoutView.showFloatingContent();
  },

  // Routing controller actions
  renderMainContent(view) {
    const mainViewOptions = { hideHeader: false, hideFooter: false };
    this._renderMainView(view, mainViewOptions);
  },

  showAccessView() {
    const routingFromLogin = this.model.get('routingFromLogin');
    this.model.set('routingFromLogin', false);
    this.clearReceiptData();

    if (!routingFromLogin) {
      // Unless we are coming from the login page, do a refresh of the login data
      this.listenToOnce(applicationChannel, 'dispute:loaded:disputeaccess', this._checkAndRenderAccessView, this);
      loaderChannel.trigger('page:load');
      // Clear and re-load the DA data
      const accessCode = this.model.get('accessCode');
      const submitterName = this.model.get('submitterName');
      this.model.clearLoadedInfo();
      this.model.loadDisputeAccess(accessCode, submitterName);
      return;
    }

    this._checkAndRenderAccessView();
  },

  _checkAndRenderAccessView() {
    const dispute = disputeChannel.request('get');
    const isDisputeMigrated = dispute && dispute.isMigrated();
    const disputeIsOpen = dispute ? dispute.get('disputeAccessOpen') : false;

    if (disputeIsOpen && !isDisputeMigrated && this.model.isInitialRespondentLogin() && !this.model.get('skipInitialLogin')) {
      Backbone.history.navigate('update/contact', { trigger: true });
    } else {
      this.renderMainContent(new AccessPageView({ model: this.model }));
    }
  },

  showUpdateContactView() {
    this.renderMainContent(new UpdateContactPageView({ model: this.model }));
  },

  showUpdateContactReceiptView() {
    this.renderMainContent(new UpdateContactReceipt({ model: this.model }));
  },

  showNoticeServiceMenuView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new NoticeServiceMenuPage({ model: this.model }));
  },

  showSubmitNoticeServiceView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new SubmitNoticeServicePage({ model: this.model }));
  },

  showSubmitNoticeServiceReceiptView() {
    this.renderMainContent(new SubmitNoticeServiceReceipt({ model: this.model }));
  },

  
  showReinstateServiceListView() {
    this.model.clearPendingUploads();
    const notice = noticeChannel.request('get:active');
    
    // TODO: Add extra validation check here that notice is available for ARS mode??

    this.renderMainContent(new NoticeServiceMenuPage({
      model: this.model,
      pageTitle: `Request Reinstatement`,
      pageInstructionsHtml: `
        <div class="da-update-contact-service-info-header">
          Upload a proof of service RTB-55 for each respondent that you have served.
        </div>
        <div class="da-update-contact-service-info-desc">
          <p>To have your hearing reinstated, you must provide proof that you served at least one respondent.</p>
          <p>
            For privacy reasons, only the initials and access code are displayed for each respondent. The full names and access codes are listed in your Notice of Dispute document.
            If you did no serve any respondents prior to your deadline this dispute will be automatically withdrawn on ${Formatter.toFullDateAndTimeDisplay(notice?.get('second_service_deadline_date'))} and you may be able to file a new application as long as you are still eligible to do so.
            For more information on this reinstatement process or the ability to file a new application, visit our&nbsp;<a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies">web site</a>.
          <p>
        </div>`,
      disableProgressBar: true,
      serviceRoute: 'reinstate/service',
    }));
  },

  showReinstateServiceView() {
    this.model.clearPendingUploads();
    const notice = noticeChannel.request('get:active');
    this.renderMainContent(new SubmitNoticeServicePage({
      model: this.model,
      pageTitle: `Request Reinstatement`,
      formTypeText: 'RTB-55',
      noticeServiceDeadline: notice?.get('has_service_deadline') ? notice?.get('service_deadline_date') : null,
      serviceListRoute: 'reinstate/service/list',
      serviceReceiptRoute: 'reinstate/service/receipt',
      maxDeliveryDate: notice?.get('has_service_deadline') ? notice?.get('service_deadline_date') : null
    }));
  },

  showReinstateServiceReceiptView() {
    this.renderMainContent(new SubmitNoticeServiceReceipt({
      model: this.model,
      submissionTitle: `Hearing successfully re-instated`,
      submissionMessage: `Your request for reinstatement has been automatically approved. You can now continue with your service and submissions in preparation for your hearing.  Your original notice package and hearing information has not changed.`,
      serviceListRoute: `reinstate/service/list`
    }));
  },

  showEvidenceSummaryView() {
    this.renderMainContent(new EvidenceSummaryPageView({ model: this.model }));
  },

  showEvidenceUploadView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new EvidenceUploadPageView({ model: this.model }));
  },

  showEvidenceUploadReceiptView() {
    this.renderMainContent(new UploadReceiptPage({ model: this.model }));
  },

  showPaymentPageView(disputeFeeId) {
    this.clearReceiptData();
    this.renderMainContent(new DAPaymentPage({ model: this.model, disputeFeeId }));
  },

  showPaymentReceiptPageView() {
    this.renderMainContent(new DAPaymentReceiptPage({ model: this.model }));
  },

  loadPaymentReturnAndShowView() {
    loaderChannel.trigger('page:load');
    const dispute_guid = UtilityMixin.util_getParameterByName('Dispute');
    const transactionId = UtilityMixin.util_getParameterByName('TransactionId');

    if (!dispute_guid || !transactionId) {
      this._paymentReturnError();
      return;
    }

    const generateReceiptDataFn = (disputeFeeModel, paymentTransactionModel, participantModel) => {
      return {
        disputeFeeModel,
        paymentTransactionModel,
        hasUploadedFiles: false,
        receiptData: [
          { label: 'File number', value: disputeChannel.request('get:filenumber') },
          { label: 'Payment date', value: Formatter.toDateDisplay(Moment()) },
          { label: 'Payment ID', value: paymentTransactionModel.get('payment_transaction_id') },
          { label: 'Payment for', value: Formatter.toFeeTypeDisplay(disputeFeeModel.get('fee_type')) },
          { label: 'Payment by', value: participantModel ? participantModel.getInitialsDisplay() : '-' },
          { label: 'Payment amount', value: Formatter.toAmountDisplay(paymentTransactionModel.get('transaction_amount')) },
          { label: 'Payment method', value: Formatter.toPaymentMethodDisplay(paymentTransactionModel.get('transaction_method')) }
        ]
      };
    };
 
    this.model.loadDisputeAccessOpen().done(responseData => {
      this.model.loadDisputeAccessOpenDataChannels(responseData, this.model.get('accessCode'));

      const disputeFees = paymentsChannel.request('get:fees');
      let matchingDisputeFee = null;
      let matchingPayment = null;
      disputeFees.forEach(fee => {
        if (matchingDisputeFee) return;
        matchingPayment = fee.getPayments().findWhere({ payment_transaction_id: Number(transactionId) });
        if (matchingPayment) matchingDisputeFee = fee;
      });
      const activePayment = matchingDisputeFee ? matchingDisputeFee.getActivePayment() : null;

      // The transaction passed back must be the latest transaction for the dispute fee. Otherwise, can't update it.
      if (!matchingPayment || (activePayment && activePayment.id && matchingPayment.id !== activePayment.id)) {
        console.log(`[Warning] Payment return is for non-active payment`);
        this._paymentReturnError();
        return;
      }

      const dispute = disputeChannel.request('get');
      const matchingParticipant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
      if (matchingParticipant && !dispute.get('accessCode')) {
        const accessCode = matchingParticipant.get('access_code');
        dispute.set('accessCode', accessCode);
        this.model.set('accessCode', accessCode);
      }

      // When an Intake Fee is paid, the status should be updated
      const updateDisputeStatusPromise = () =>  {
        // Update status if intake fee
        const statusSaveModel = new ExternalDisputeStatus_model({ file_number: dispute.get('file_number'), dispute_stage: 2, dispute_status: 20 });
        return new Promise((res, rej) => statusSaveModel.save().done(response => {
          // Manually apply any status change to the loaded dispute, because we won't do another fresh load call before displaying page
          dispute.set({ status: response });
          _.extend(dispute.get('_originalData'), { status: response });
          res(response);
        }).fail(rej));
      };

      const updateDisputeInfoPromise = () => {
        const disputeSaveModel = new ExternalDisputeInfo_model( dispute.toJSON() );
        return new Promise((res, rej) => (
          disputeSaveModel.checkAndUpdateInitialPayment({
            initial_payment_by: dispute.get('tokenParticipantId'),
            initial_payment_method: configChannel.request('get', 'PAYMENT_METHOD_ONLINE'),
          }).done(res).fail(rej)
        ));
      };

      const navigateAfterPaymentApproved = () => {
        if (matchingDisputeFee.isReviewFee()) {
          Backbone.history.navigate(`#review/step1`, { trigger: true });
        } else {
          this.model.setReceiptData( generateReceiptDataFn(matchingDisputeFee, matchingPayment, matchingParticipant) );
          this.model.set('routingReceiptMode', true);
          Backbone.history.navigate('#payment/receipt', { trigger: true });
        }
      };
      const navigateAfterPaymentNotApproved = () => {
        if (matchingDisputeFee.isReviewFee()) Backbone.history.navigate(`#review-pay`, { trigger: true });
        else Backbone.history.navigate(`#pay/${matchingDisputeFee.id}`, { trigger: true });
      };

      matchingPayment.updateTransactionAfterBeanstream({ update_status_only: true, no_modal: true, no_cancel: true})
        .then(() => {
          if (dispute.checkStageStatus(0, [2,3,4,6]) && matchingDisputeFee.isIntakeFee() && matchingPayment.isApproved()) {
            return $.whenAll(updateDisputeStatusPromise(), updateDisputeInfoPromise());
          }
        }, this._paymentReturnError)
        .then(() => {
          if (!matchingPayment.isApproved()) navigateAfterPaymentNotApproved(matchingDisputeFee);
          else navigateAfterPaymentApproved(matchingDisputeFee);
        }, this._paymentReturnError);

      }).fail(this._paymentReturnError);
  },
  

  _paymentReturnError(errorResponse) {
    if (!errorResponse) {
      alert('There was an unexpected error updating payment info.  You will be redirected to your list of options.');
      Backbone.history.navigate('#access', { replace: true, trigger: true });
      return;
    } else {
      const errorHandlerFn = generalErrorFactory.createHandler('DA.PAYMENT.RETURN', () => {
        Backbone.history.navigate('#access', { replace: true, trigger: true });
      }, 'You will be redirected to your list of options.');
      errorHandlerFn(errorResponse);
    }
  },


  loadExternalReturnAndLogin() {
    const modalExternalLoginView = new ModalExternalLogin({ model: this.model });
    let isLogin = false;

    this.listenTo(modalExternalLoginView, 'continue', () => {
      loaderChannel.trigger('page:load');
      isLogin = true;

      if (this.model.get('extSiteId') === configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_OFFICE')) {
        this.model.set('staffLogin', true);
      }
      modalExternalLoginView.close();
      this.listenToOnce(applicationChannel, 'dispute:loaded:disputeaccess', () => {
        const extActionId = this.model.get('extActionId');
        let urlFragment = 'access';
        if (extActionId === configChannel.request('get', 'EXTERNAL_DA_ACTION_CONTACT')) urlFragment = 'update/contact';
        else if (extActionId === configChannel.request('get', 'EXTERNAL_DA_ACTION_EVIDENCE')) urlFragment = 'evidence';
        else if (extActionId === configChannel.request('get', 'EXTERNAL_DA_ACTION_NOTICE')) urlFragment = 'notice/service/list';
        else if (extActionId === configChannel.request('get', 'EXTERNAL_DA_ACTION_SUBSERV')) urlFragment = 'substituted-service';
        else if (extActionId === configChannel.request('get', 'EXTERNAL_DA_ACTION_REINSTATEMENT')) urlFragment = 'reinstate/service/list';

        Backbone.history.navigate(urlFragment, { trigger: true });
      });
      applicationChannel.trigger('load:disputeaccess', this.model.get('accessCode'), this.model.get('submitterName'));
    })
    this.listenTo(modalExternalLoginView, 'removed:modal', () => {
      if (!isLogin) sessionChannel.trigger('redirect:login');
    })
    
    modalChannel.request('add', modalExternalLoginView);
  },

  showAmendmentView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new AmendmentPage({ model: this.model }));
  },

  showAmendmentReceiptView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new AmendmentReceiptPage({ model: this.model }));
  },

  showCorrectionView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new CorrectionClarificationView({ model: this.model, isCorrection: true}));
  },

  showCorrectionClarificationReceiptView() {
    this.renderMainContent(new CorrectionClarificationReceiptView({ model: this.model }));
  },

  showClarificationView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new CorrectionClarificationView({ model: this.model, isCorrection: false }));
  },

  showReviewView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new ReviewPage({ model: this.model }));
  },

  showReviewPaymentView() {
    loaderChannel.trigger('page:load');
    this.listenToOnce(applicationChannel, 'dispute:loaded:disputeaccess', () => (
        this.renderMainContent(new ReviewPaymentPage({ model: this.model }))));
    
    // Clear and re-load the DA data
    const accessCode = this.model.get('accessCode');
    const submitterName = this.model.get('submitterName');
    this.clearReceiptData();
    this.model.clearLoadedInfo();
    this.model.loadDisputeAccess(accessCode, submitterName);
  },

  showSubstituteServiceView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new SubstitutedServicePage({ model: this.model }));
  },

  showSubstituteServiceReceiptView() {
    this.model.clearPendingUploads();
    this.renderMainContent(new SubstitutedServiceReceiptPage({ model: this.model }));
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

  renderFloatingContent(view) {
    sessionChannel.request('clear:token');
    const loginLogoutViewOptions = { hideHeader: true, hideFooter: true };
    this._renderFloatingView(withSiteHeaders(view), loginLogoutViewOptions);
  },

  showLoginView() {
    applicationChannel.request('clear');
    this.clearReceiptData();
    this.model.set({ reviewNotificationDisplayed: false, emailVerificationDisplayed: false });
    this.renderFloatingContent(new LoginPageView({ model: this.model }));
  },

  showLogoutView() {
    applicationChannel.request('clear');
    this.renderFloatingContent(new LogoutPageView({ model: this.model }));
  },

  showAccessCodeRecoveryView() {
    applicationChannel.request('clear');
    this.renderFloatingContent(new AccessTokenRecoveryPage({ model: this.model }));
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
  module.hot.accept([
    '../core/components/root-layout/FloatingRootLayout',
    './pages/login/LoginPage',
    './pages/access/AccessPage',
    './pages/update-contact/UpdateContactPage',
    './pages/update-contact/UpdateContactReceipt',
    './pages/upload/EvidenceSummaryPage',
    './pages/upload/DAUploadPage',
    './pages/upload/upload-receipt/UploadReceiptPage',
    './pages/logout/LogoutPage',
    './pages/payment/DAPaymentPage',
    './pages/payment/DAPaymentReceiptPage',
    './pages/correction-clarification/CorrectionClarificationPage',
    './components/ccrRequestItem/CcrRequestItem',
  ], () => {
    console.log(`[DMS_HMR] Re-loading evidence main view..`);
    Backbone.history.loadUrl(Backbone.history.fragment);
  });

  // Perform default hot swap behaviour (re-load "import"s) on all of application.js's dependencies
  module.hot.accept(_hotReloadDependencies);

  // If no other hmr handler matches, perform no refresh by default
  module.hot.accept();
};
const loadAndStartApplication = () => {
  appModel.load().then(function() {
    app.start();
  }, function(e) {
    console.debug(e);
    alert("Error loading initial application data");
  });
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