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
import './styles/ari-intake.css';

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
import '../core/components/geozone/Geozone';
import '../core/components/api/ApiLayer';
import { generalErrorFactory } from '../core/components/api/ApiLayer';
import '../core/components/user/UserManager';
import '../core/components/user/SessionManager';
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
import '../core/components/email/EmailsManager';
import '../core/components/dispute-flags/DisputeFlagManager';
import { loadAndCheckMaintenance } from '../core/components/maintenance/MaintenanceChecker';
import '../core/components/custom-data-objs/CustomDataObjManager';

import AppRouter from './routers/app_router';
import { IntakeAriRouter, IntakePfrRouter } from './routers/intake_ari_router';
import QuestionModel from '../core/components/question/Question_model';
import QuestionCollection from '../core/components/question/Question_collection';
import RootLayout from '../core/components/root-layout/RootLayout';
import AriDisputeListPageView from './pages/dispute-list/AriDisputeListPage';
import LoginView from './pages/login/Login';
import IntakeAriView from './pages/intake/IntakeAri';
import IntakePfrView from './pages/intake/IntakePfr';
import { ApplicationBaseModelMixin } from '../core/components/app/ApplicationBase';
import AnalyticsUtil from '../core/utilities/AnalyticsUtil';

// Add site name
var g = window || global;
g['_DMS_SITE_NAME'] = 'AdditionalLandlordIntake';

const _hotReloadDependencies = [
  './pages/intake/IntakeAri',
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

const config_paths = [
  // Deployment site variables
  IS_WEBPACK_DEV_SERVER ? require('../siteconfig/ui-configuration-local.json') : '../siteconfig/ui-configuration.json',

  require('../core/config/config.json'),
  require('../core/config/constants.json'),
  require('../core/config/config_issues_evidence.json'),
  require('./components/config/required_ari_intake_questions.json'),
  require('../core/config/config_status_rules.json'),
  require('../core/config/config_flags.json'),
];

const HEADER_TITLE_TEXT = `<span class="mobile-sub-banner">Residential Tenancies -&nbsp;</span>Additional Landlord Intake`;

/**
 * The underlying Backbone Model for the application.  Used for global data holding, and initializing system data.
 * @class AppModel

 */
const AppModel = Backbone.Model.extend({
  defaults: {
    config: null,
    disputes: null,
    scrollFn: null,

    // Tracks the overall application's progress
    progress: 0,
    // Denotes which page was just actioned on
    recentProgress: 0
  },

  initialize() {
    // Setup any expected loader data:
    __loaderData = __loaderData || {};
    this.setupChannels();
    apiChannel.request('restrict:collisions');
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
    applicationChannel.reply('check:progress:step', this.validateStep, this);
    applicationChannel.reply('check:progress:step:incomplete', this.validateIncompleteStep, this);
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
    const geozoneChannel = Radio.channel('geozone');
    const dfd = $.Deferred();

    // Setup login and logout listeners - they will be triggered when `mixin_checkSiteVersionAndLogin` runs
    this.listenTo(sessionChannel, 'login:complete', (options={}) => {
      sessionChannel.request('clear:timers');
      sessionChannel.request('create:timers');
      if (!options?.skip_routing) {
        loaderChannel.trigger('page:load');
        Backbone.history.navigate('list', { trigger: true });
      };
    });
    this.listenTo(sessionChannel, 'logout:complete', () => {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('_dmsPaymentToken');
      sessionChannel.request('clear:timers');
      applicationChannel.request('clear');
    });

    $.when(
      this.loadConfigs()
        .then(geozoneChannel.request.bind(geozoneChannel, 'load'), () => sessionChannel.trigger('redirect:config:error'))
        .then(_.bind(this.mixin_checkSiteVersionAndLogin, this)),
      this.minimumLoadTimePromise()
    ).done(function() {
        const intakeSystemId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_INTAKE');
        loadAndCheckMaintenance(intakeSystemId).done(function() {
          dfd.resolve();
        }).fail(function() {
          // An ongoing maintenance record existed, start timeout timer
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
    const dfd = $.Deferred();
    Promise.all(_.map(config_paths, function(path) { return ConfigManager.loadConfig(path); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  /**
   * Loads a dispute object, and no other data like claims, files, etc.
   * @param {string} dispute_guid - The dispute guid to load.
   * @returns {Promise} - The promise for loading the dispute
   */
  loadDisputeMinimal(dispute_guid) {
    this.loadDispute(dispute_guid).done(function() {
      applicationChannel.trigger('dispute:loaded', disputeChannel.request('get'));
    }).fail(
      generalErrorFactory.createHandler('DISPUTE.LOAD.MINIMAL', () => {
        Backbone.history.navigate('list', { trigger: true });
      }, 'You will be redirected to your list of disputes.')
    );
  },

  /**
   * Creates an IntakeQuestionModel from intake question data and associates it to the active dispute.
   * @param {Object} intakeQuestionsResponse - The intake question data returned from the server.
   */
  _parseAndSaveIntakeQuestionsApiResponse(intakeQuestionsResponse) {
    const dispute = disputeChannel.request('get');
    // Get a list of question models from API
    dispute.set('questionCollection', new QuestionCollection(_.map(intakeQuestionsResponse, function(question) {
        return _.extend(question, { apiToUse: 'question' });
      })));
  },


  /**
   * Loads all major information from multiple APIs for a given dispute, without any application triggers
   * @param {string} dispute_guid - The dispute guid of the dispute to fully load.
   * @returns {Promise} - The promise for loading the full dispute
   */
  loadDisputeFullPromise(dispute_guid) {
    // First, clear any existing internal model data
    this.clearLoadedInfo();

    const dfd = $.Deferred(),
      self = this;

    $.whenAll(
      this.loadDispute(dispute_guid),
      this.loadIntakeQuestions(dispute_guid),
      this.loadClaimGroupParticipants(dispute_guid),
      this.loadDisputeFiles(dispute_guid),
      this.loadPayments(dispute_guid),
      this.loadCustomDataObjs(dispute_guid)
    )
    .done(function() {
      $.whenAll(self.loadClaimsInformation(dispute_guid), self.checkAndCreateRequiredIntakeQuestions()).done(function() {
        dfd.resolve(disputeChannel.request('get'))
      }).fail(dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  /**
   * Loads all major information from multiple APIs for a given dispute, and then triggers lifecycle events
   * @param {string} dispute_guid - The dispute guid of the dispute to fully load.
   */
  loadDisputeFull(dispute_guid) {
    this.loadDisputeFullPromise(dispute_guid).done(dispute => {
      this.refreshSessionProgress();
      applicationChannel.trigger('dispute:loaded:full', dispute);
    }).fail(
      generalErrorFactory.createHandler('DISPUTE.LOAD.FULL', () => {
        Backbone.history.navigate('list', { trigger: true });
      }, 'You will be redirected to your list of disputes.')
    );
  },

  getProgress() {
    return this.get('progress');
  },

  getRecentProgress() {
    return this.get('recentProgress');
  },

  refreshSessionProgress() {
    // Force Next button to be used
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

  // Used to determine whether a step is not valid
  validateIncompleteStep(step_number) {
    step_number = parseInt(step_number);
    const progressCheckFns = {
      3: this.isStepThreeIncomplete,
    };

    if (step_number && _.has(progressCheckFns, step_number)) {
      return _.bind(progressCheckFns[step_number], this)();
    }

    // If no validation function defined, then return incomplete = falsy
  },

  isStepThreeIncomplete() {
    // Step three is definitely incomplete if no applicants were added
    return !participantsChannel.request('get:applicants').length;
  },

  isStepFiveIncomplete() {
    // Step five is definitely incomplete if no respondents were added
    return !participantsChannel.request('get:respondents').length;
  },

  isStepSixIncomplete() {
    // Step six is definitely incomplete if no claims were added
    return !claimsChannel.request('get:full').length;
  },


  // Returns if a step is valid
  validateStep(step_number) {
    step_number = parseInt(step_number);

    const progressCheckFns = {
      1: this.isStepOneComplete,
      2: this.isStepTwoComplete,
      3: this.isStepThreeComplete,
      4: this.isStepFourComplete,
      5: this.isStepFiveComplete,
      6: this.isStepSixComplete
    };

    if (step_number && _.has(progressCheckFns, step_number)) {
      return _.bind(progressCheckFns[step_number], this)();
    } else {
      // If no validation function defined, just say it's valid
      return true;
    }
  },

  _getQuestionsForStep(step_number) {
    const dispute = disputeChannel.request('get'),
      questions = dispute ? dispute.get('questionCollection') : null,
      group_id = step_number - 1;

    return questions ? questions.filter(function(q) { return q.get('group_id') === group_id; }) : [];
  },

  _hasCompletedQuestionsOnStep(step_number) {
    const questions = this._getQuestionsForStep(step_number);
    return _.any(questions, function(q) {
      return q.get('question_answer') !== null;
    });
  },

  _hasYesQuestionsOnStep(step_number) {
    const questions = this._getQuestionsForStep(step_number);
    return _.any(questions, function(q) {
      return q.get('question_answer') === "1";
    });
  },

  isStepOneComplete() {
    return this._hasCompletedQuestionsOnStep(2) || participantsChannel.request('get:applicants').length;
  },

  isStepTwoComplete() {
    const applicants = participantsChannel.request('get:applicants');
    return this._hasCompletedQuestionsOnStep(3) ||
      participantsChannel.request('get:primaryApplicant:id') ||
      (applicants && applicants.all(function(p) { return !p.isNew(); }));
  },

  isStepThreeComplete() {
    // For Applicant Options to be complete, there must be a primary applicant
    return participantsChannel.request('get:primaryApplicant:id');
  },

  isStepFourComplete() {
    const respondents = participantsChannel.request('get:respondents');
    return claimsChannel.request('get:full').length ||
      (respondents.length && respondents.all(function(p) { return !p.isNew(); }));
  },

  isStepFiveComplete() {
    // See if any of the issues questions are saved to the API
    return this._hasYesQuestionsOnStep(6) && claimsChannel.request('get:full').length;
  },

  isStepSixComplete() {
    const full_claims = claimsChannel.request('get:full');
    return full_claims.length && full_claims.all(function(claim) {
      const evidences = claim.get('dispute_evidences');
      return claim.isValid() && evidences && evidences.length && evidences.isValid();
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
      Backbone.history.navigate('list', { trigger: true });
    });
  },


  /**
   * Loads the basic dispute info for a dispute.
   * @param {string} dispute_guid - The dispute guid of the dispute to load.
   * @returns {Promise} - The promise object for the dispute API load.
   */
  loadDispute(dispute_guid) {
    return disputeChannel.request('load', dispute_guid);
  },

  /**
   * Loads all the files data for a dispute.
   * @param {string} dispute_guid - The dispute guid of the dispute to load files data for.
   * @returns {Promise} - The promise object for the files API load.
   */
  loadDisputeFiles(dispute_guid) {
    // NOTE: File Manager will automatically call all file APIs needed
    return filesChannel.request('load', dispute_guid);
  },

  /**
   * Loads all the participants data for a dispute.
   * If no claim exists, it creates one
   * @param {string} dispute_guid - The dispute guid of the dispute to load participants data for.
   * @returns {Promise} - The promise object for the participants API load.
   */
  loadClaimGroupParticipants(dispute_guid) {
    const dfd = $.Deferred();

    participantsChannel.request('load', dispute_guid).then(([claimGroupParticipantsResponse]) => {
      if (!claimGroupParticipantsResponse || !claimGroupParticipantsResponse.length) {
        console.log("[Info] Creating claim group");
        this.checkAndCreateClaimGroup()
          .done(function(response) { dfd.resolve(response); })
          .fail(function(err) { dfd.reject(err); });
      } else {
        dfd.resolve();
      }
    }, dfd.reject);

    return dfd.promise();
  },

  /**
   * Loads all the claims data for a dispute.
   * @param {string} dispute_guid - The dispute guid of the dispute to load claims for.
   * @returns {Promise} - The promise object for the claims API load.
   */
  loadClaimsInformation(dispute_guid) {
    return claimsChannel.request('load', dispute_guid, {
      claim_source: configChannel.request('get', 'CLAIM_SOURCE_INTAKE'),
      remedy_source: configChannel.request('get', 'REMEDY_SOURCE_INTAKE')
    });
  },

  loadPayments(dispute_guid) {
    return paymentsChannel.request('load', dispute_guid);
  },

  loadCustomDataObjs(dispute_guid) {
    return customDataObjsChannel.request('load', dispute_guid);
  },

  /**
   * Loads all the required intake questions for a dispute.
   * @param {string} dispute_guid - The dispute guid of the dispute to load questions for.
   * @returns {Promise} - The promise for loading the intake questions.
   */
  loadIntakeQuestions(dispute_guid) {
    const dfd = $.Deferred(),
      self = this;

    apiChannel.request('call', {
      type: 'GET',
      url: configChannel.request('get', 'API_ROOT_URL') + 'dispute/intakequestions/' + dispute_guid
    }).done(function(response) {
      self._parseAndSaveIntakeQuestionsApiResponse(response);
      dfd.resolve(response);
    }).fail(dfd.reject);

    return dfd.promise();
  },


  /**
   * Creates a new QuestionModel and associates it to the active dispute.
   * @param {Object} intake_question_config - the data representing a QuestionModel to be created.
   * @returns {QuestionModel} - the QuestionModel object that was created.
   */
  _createQuestionFromConfigOnActiveDispute(intake_question_config) {
    const dispute = disputeChannel.request('get'),
      newQuestion = new QuestionModel(_.extend({}, intake_question_config, {
        // Add required API fields and other fields to explicitly say to save using question API
        apiToUse: 'question'
      }));
    if (!dispute) {
      console.log(`[Error] Need an active dispute in order to create intake questions`);
      return newQuestion;
    }

    newQuestion.set('dispute_guid', dispute.get('dispute_guid'), {silent: true});
    this.listenToOnce(newQuestion, 'sync', this._addQuestionModelToActiveDispute);
    return newQuestion;
  },

  /**
   * Adds a given question model to the active dispute in the application
   * @param {QuestionModel} questionModel - The model to be added to the active  DisputeModel
   */
  _addQuestionModelToActiveDispute(questionModel) {
    console.log(questionModel);
    const dispute = disputeChannel.request('get'),
      questionCollection = dispute.get('questionCollection');
    if (!questionCollection.findWhere({ question_id: questionModel.question_id })) {
      questionCollection.push(questionModel);
    }
  },

  /**
   * Checks if a claim group exists for the dispute. If not, creates it.
   * @returns {Promise} - Promise object for creating the claim group. Will return immediately if no action required.
   */
  checkAndCreateClaimGroup() {
    if (claimGroupsChannel.request('get')) {
      const dfd = $.Deferred();
      dfd.resolve();
      return dfd.promise();
    }
    return claimGroupsChannel.request('create');
  },

  /**
   * Creates required intake questions based on the data in config file "required_intake_questions.json".
   * @returns {Promise} - Promise object for creating ALL required question
   */
  checkAndCreateRequiredIntakeQuestions() {
    const dispute = disputeChannel.request('get');
    const required_questions = configChannel.request('get', dispute && dispute.isCreatedPfr() ? 'pfr_intake_questions' : 'ari_intake_questions');
    
    const createdQuestions = dispute.get('questionCollection');
    const dfd = $.Deferred();
    const self = this;

    // Don't create any required questions that have been created already.
    _.each(required_questions, function(required_question_config) {
      const matchingQuestion = createdQuestions.findWhere({ question_name: required_question_config.question_name });
      if (!matchingQuestion) {
        const createdQuestionModel = this._createQuestionFromConfigOnActiveDispute(required_question_config);
        createdQuestions.add(createdQuestionModel);
      }
    }, this);

    createdQuestions.saveNew()
      .done(function() {
        // When all questions are created, do a full fetch again to refresh the data
        self.loadIntakeQuestions(dispute.get('dispute_guid'))
          .done(dfd.resolve)
          .fail(dfd.reject);
      })
      .fail(dfd.reject);

    return dfd.promise();
  }
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

  initializeSiteDependentData() {
    paymentsChannel.request('set:transaction:site:source', configChannel.request('get', 'PAYMENT_TRANSACTION_SITE_SOURCE_INTAKE'));
  },

  initializeEventsAndAnimations() {
    $.initializeCustomAnimations({
      scrollableContainerSelector: '#intake-content'
    });
    $.initializeDatepickerScroll();
  },

  onStart() {
    this.initializeErrorReporting();
    this.initializeSiteDependentData();
    this.initializeEventsAndAnimations();
    this.initializeViews(IntakeAriView);
    this.initializeRoutersAndRouteListeners();
    AnalyticsUtil.initializeAnalyticsTracking();
  },

  initializeErrorReporting() {
    apiChannel.request('create:errorHandler', {
      error_site: configChannel.request('get', 'ERROR_SITE_ADDITIONAL_INTAKE')
    });
  },

  initializeViews(intakeViewClass) {
    this.showView(new RootLayout({ model: this, showHeader: true, showFooter: true, headerText: HEADER_TITLE_TEXT, showHeaderProblemButton: true }));
    this.intakeView = new intakeViewClass({ parent: this });

    // Once the views have been initialized, setup the modal container
    modalChannel.request('render:root');
  },

  showDefaultView() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('list', { trigger: true });
  },

  initializeRoutersAndRouteListeners() {
    new AppRouter({ controller: this });

    this.intakeViewRouter = new IntakeAriRouter({ controller: this.intakeView });

    // Go to correct page on load
    this.listenTo(applicationChannel, 'dispute:loaded:full', function(disputeModel) {
      // Always re-set the progress
      this.model.resetProgress();

      const isCreatedPfr = disputeModel && disputeModel.isCreatedPfr();

      if (isCreatedPfr) {
        this.initializeViews(IntakePfrView);
        this.intakeViewRouter = new IntakePfrRouter({ controller: this.intakeView });
      } else {
        this.initializeViews(IntakeAriView);
        this.intakeViewRouter = new IntakeAriRouter({ controller: this.intakeView });
      }

      // Always re-set the menu model
      if (this.intakeView) {
        this.intakeView.createDisputeMenu();

        if (disputeModel.isPaymentState()) {
          this.intakeView.routeToPaymentPage();
          //Backbone.history.navigate('#page/8', {trigger: true});
        } else {
          Backbone.history.navigate('#page/1', {trigger: true});
        }
      }

      
    }, this);

    Backbone.history.start();
  },

  // Routing controller actions
  renderMainContent(childView) {
    loaderChannel.trigger('page:load:complete');
    const view = this.getView();
    view.getRegion( this.main_content_region ).detachView();
    view.showChildView( this.main_content_region , childView);
  },

  showListView() {
    loaderChannel.trigger('page:load');
    menuChannel.trigger('disable:mobile');
    // Clear any existing dispute
    applicationChannel.request('clear');

    const fullCount = 999990;
    // Load ARI-C/PFR disputes in parallel and show list page
    Promise.all([
      disputeChannel.request('load:disputes', { count: fullCount, creationMethod: configChannel.request('get', 'DISPUTE_CREATION_METHOD_ARI_C') }),
      disputeChannel.request('load:disputes', { count: fullCount, creationMethod: configChannel.request('get', 'DISPUTE_CREATION_METHOD_PFR') })
    ]).then((disputeCollections=[]) => {
      const ariCDisputes = disputeCollections[0];
      const pfrDisputes = disputeCollections[1];
      // Add all disputes into first collection since list pages takes one collection only
      // They will be appropriately filtered by creation method in the page
      ariCDisputes.add(pfrDisputes.models);
      loaderChannel.trigger('page:load:complete');
      this.renderMainContent(new AriDisputeListPageView({ collection: ariCDisputes }) );
    }, () => {
      console.debug(`[Error] Couldn't load disputeList`);
      Backbone.history.navigate('logout', { trigger: true });
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
    sessionChannel.trigger('logout:start');
  },

  showLoginView() {
    menuChannel.trigger('disable:mobile');
    this.renderMainContent(new LoginView());
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
  module.hot.accept('./pages/intake/IntakeAri', () => {
    console.log(`[DMS_HMR] Re-loading intake view..`);

    // Re-initialize IntakeView with the newly imported intake view
    if (app.intakeView instanceof IntakePfrView) {
      app.initializeViews(IntakePfrView);
    } else {
      app.initializeViews(IntakeAriView);
    }

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