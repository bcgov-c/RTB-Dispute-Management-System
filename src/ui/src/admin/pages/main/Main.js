import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import StatefulMenuModel from '../../components/menu/StatefulMenu_model';
import StatefulMenuView from '../../components/menu/StatefulMenu';
import { routeParse } from '../../routers/mainview_router';
import DisputeOverview from '../dispute-overview/DisputeOverview';
import HearingPage from '../hearing/HearingPage';
import CommunicationsPage from '../communication/CommunicationsPage';
import UserManagementPage from '../users/UserManagementPage';
import TasksPage from '../tasks/TasksPage'; 
import MyTasksPage from '../my-tasks/MyTasksPage';
import HistoryPage from '../history/HistoryPage';
import DocumentsPage from '../documents/DocumentsPage';
import NoticePage from '../notice/NoticePage';
import PaymentsPage from '../payments/PaymentsPage';
import LandingPage from '../landing/LandingPage';
import SearchInstance from '../search/SearchInstance';
import DashboardDisputePage from '../dashboard-disputes/DashboardDisputePage';
import { MySchedulePage } from '../my-schedule/MySchedulePage';
import CMSArchivePage from '../cms/CMSArchivePage';
import ComposerInstancePage from '../composer/ComposerInstancePage';
import ScheduledHearingsPage from '../scheduled-hearings/ScheduledHearingsPage';
import EvidencePage from '../evidence-page/EvidencePage';
import TestCreateUsersPage from '../_test-create-users/TestCreateUsersPage';
import DisputeModel from '../../../core/components/dispute/Dispute_model';
import CommonFilesPage from '../common-files/CommonFilesPage';
import OperationalReportsPage from '../operational-reports/OperationalReportsPage';
import ScheduleManagerPage from '../schedule-manager/ScheduleManagerPage';
import MyActivitiesPage from '../my-activities/MyActivitiesPage';
import CEUComplaintsPage from '../ceu-complaints/CEUComplaintsPage';
import template from './Main_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import AdminSessionSettingsModel from './AdminSessionSettings_model';


const MIGRATED_CLASS = 'is-migrated-dispute';
const DMS_MENU_COLLAPSE_CLASS = 'dms-menu-collapse';

const menuChannel = Radio.channel('menu');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const taskChannel = Radio.channel('tasks');
const disputeHistoryChannel = Radio.channel('disputeHistory');
const searchChannel = Radio.channel('searches');
const documentsChannel = Radio.channel('documents');
const sessionChannel = Radio.channel('session');
const cmsChannel = Radio.channel('cms');
const userChannel = Radio.channel('users');
const statusChannel = Radio.channel('status');
const schedulingChannel = Radio.channel('scheduling');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const noticeChannel = Radio.channel('notice');

export default Marionette.View.extend({
  template,
  id: "mainview-content-container",

  ui: {
    main: '#mainview-content',
    menuCollapse: '#menu-collapse-area',
    menuCollapseTarget: '#menu-collapse-area > b',
  },

  regions: {
    menuRegion: {
      el: '#menu-region',
      replaceElement: true
    },
    mainRegion: '@ui.main',
  },

  events: {
    'click @ui.menuCollapseTarget': 'toggleMenuCollapse',
  },

  toggleMenuCollapse(ev) {
    ev.preventDefault();
    const shouldMenuBeCollapsed = !this.adminSessionSettings.get('menu')?.isCollapsed;
    this.adminSessionSettings.set({
      menu: {
        ...this.adminSessionSettings.get('menu'),
        isCollapsed: shouldMenuBeCollapsed
      }
    });

    const collapseWidth = 200;
    const menuLeft = 211;
    const mainLeftWithGutter = menuLeft + 10;
    const animateData = {
      menuCollapse: { left: menuLeft - (shouldMenuBeCollapsed?collapseWidth:0) },
      menu: { left: 0 - (shouldMenuBeCollapsed?collapseWidth:0) },
      main: { left: mainLeftWithGutter - (shouldMenuBeCollapsed?collapseWidth:0) },
    };
    const animateOptions = { duration: 350 };

    setTimeout(() => {
      $('#menu').animate(animateData.menu, animateOptions);
      this.getUI('menuCollapse').animate(animateData.menuCollapse, animateOptions);
      this.getUI('main').animate(animateData.main, Object.assign({}, animateOptions, {
        complete: () => setTimeout(() => {
          this.$el.toggleClass(DMS_MENU_COLLAPSE_CLASS);
          menuChannel.trigger('animation:complete');
        }, 5)
      }));
    }, 100);

    return false;
  },

  initialize(options) {
    this.mergeOptions(options, ['parent']);
    if (!this.parent) {
      console.debug('[Warning] MainView needs parent reference');
    }
    // Used for holding internal data used bewtween pages, instead of passing all data in URLs
    this.adminSessionSettings = new AdminSessionSettingsModel();

    this.menu = new StatefulMenuModel({ sessionSettings: this.adminSessionSettings });
    this.savedMenuScrollPosition = null;
    this.checkAndUpdateMenuBasedOnLoginStatus();

    this.listenTo(this.menu, 'load:counts', this.loadAndUpdateUserMenuCounts, this);
  },

  clearRoutingData() {
    this.adminSessionSettings.clear();
  },

  checkAndUpdateMenuBasedOnLoginStatus() {
    const currentUser = sessionChannel.request('get:user');
    if (!currentUser || !currentUser.id) return;
    const currentUserIsDual = currentUser.get('dashboard_access');
    const activeDashboardGroup = this.adminSessionSettings.get('menu')?.activeDashboardGroup || (currentUser.isArbitrator() ? 'arb_dashboard' : 'io_dashboard');
    const addActiveRoleDashboard = (dashboardName) => {
      if (dashboardName !== activeDashboardGroup) return;
      this.menu.addDashboard(dashboardName, { enable_dashboard_toggle: currentUserIsDual });
    };
    
    this.adminSessionSettings.set({
      menu: {
        ...this.adminSessionSettings.get('menu'),
        activeDashboardGroup
      }
    })

    // Always have the search and landing pages in the menu
    this.menu.addDashboard('general_dashboard');
    this.menu.addDashboard('search_dashboard');
    
    if (sessionChannel.request('is:active:admin')) {
      this.menu.addDashboard('admin_dashboard');
    }

    if (currentUser.isCeuUser()) {
      this.menu.addDashboard('ceu_complaints_dashboard');
    }

    if (currentUser.isSuperUser() || currentUser.isManagement() || currentUser.isArbitratorLead() || currentUser.isInformationOfficerSupervisor()) {
      this.menu.addDashboard('report_viewer_dashboard');
    }

    if (currentUser.isScheduleManager() && (configChannel.request('get', 'UAT_TOGGLING') || {}).SHOW_SCHEDULE_MANAGEMENT) {
      this.menu.addDashboard('schedule_manager_dashboard');
    }

    if (currentUser.isScheduler()) {
      this.menu.addDashboard('scheduler_dashboard');
    }
    if (currentUser.isArbitrator() || currentUserIsDual) {
      addActiveRoleDashboard('arb_dashboard');
    }
    if ((currentUser.isInformationOfficer() || currentUser.isAdminRole()) || currentUserIsDual) {
      addActiveRoleDashboard('io_dashboard');
    }
  },

  createMenuViewAndListeners() {
    const menuView = new StatefulMenuView({ model: this.menu });
    // Setup menu position listener
    const self = this;
    menuView.$el.off('scroll.rtb-admin');
    menuView.$el.on('scroll.rtb-admin', function() { self.savedMenuScrollPosition = $(this).scrollTop(); });

    this.stopListening(menuView, 'dom:refresh');
    this.listenTo(menuView, 'dom:refresh', function() {
      if (this.savedMenuScrollPosition) {
        menuView.$el.scrollTop(this.savedMenuScrollPosition);
      }
    }, this);
    return menuView;
  },

  onRender() {
    const menuView = this.createMenuViewAndListeners();
    this.checkAndUpdateMenuBasedOnLoginStatus();
    this.showChildView('menuRegion', menuView);
  },

  templateContext() {
    return {
      isCollapsed: this.adminSessionSettings.get('menu')?.isCollapsed
    };
  },

  // Always call this to render content in the main view
  _showPageViewGeneral(pageViewClass, viewOptions) {
    viewOptions = viewOptions || {};    

    // Show the parent container
    this.parent.showMainView();
    const mainRegion = this.showChildView('mainRegion', new pageViewClass(viewOptions));
    
    if (mainRegion && mainRegion.currentView) {
      if (viewOptions.model instanceof DisputeModel && viewOptions.model.isMigrated()) {
        mainRegion.currentView.$el.addClass(MIGRATED_CLASS);
      } else {
        //mainRegion.currentView.$el.removeClass(MIGRATED_CLASS);
      }
    }
      
    // Clear any running animations on the page, as we are switching
    animationChannel.request('clear');

    // Now trigger a menu update
    this.menu.trigger('route:render:complete');
  },

  showPageViewGeneralWithMenuLoadUpdate(pageViewClass, viewOptions) {
    this.withMenuLoadUpdate(() => this._showPageViewGeneral(pageViewClass, viewOptions));
  },

  withMenuLoadUpdate(onDoneFn) {
    this.loadAndUpdateUserMenuCounts(onDoneFn.bind(this));
  },

  /*** Required router functions, called by MainViewRouter ***/

  // General routing method that primes the menu to be updated and then runs the real controller route fn
  performRoute(fn_name, route, params=null) {
    this.menu.off('route:render:complete');

    if (!_.isArray(params)) {
      params = params ? [params] : [];
    }
    params = _.filter(params, function(param) { return param; });

    this.menu.once('route:render:complete', function() {
      this.update(route, params);
      this.trigger('scroll:to:active');
    });

    // Make sure to scroll page to the top every time
    $.scrollPageToTop();

    // Clear any saved disputes on each route - they will be added again next load
    disputeChannel.request('clear');
    this[fn_name](...params);
  },

  // Targeted by router to skip initial routing
  _skipInitialRouting() {},

  withPageLoader(bound_fn) {
    // Start the loader and give Marionette a minimum time to render it before running next routing / rending function
    loaderChannel.trigger('page:load');
    setTimeout(bound_fn, 50);
  },

  checkAndShowDisputeStatusModals(disputeModel, onDoneFn) {
    let statusPassed = true;
    if (!disputeModel) {
      onDoneFn(disputeModel);
      return statusPassed;
    }

    const fileNumber = disputeModel.get('file_number');

    if (disputeModel.isBlockedStageStatus()) {
      statusPassed = false;
      const modalView = this.showDisputeStatusBlockedModal(fileNumber);
      this.listenTo(modalView, 'removed:modal', () => {
        // If a dispute was blocked, erase the url, but don't re-route
        Backbone.history.navigate('#', { trigger: false, replace: true });
      });
    } else if (disputeModel.isViewOnlyStageStatus()) {
      const modalView = this.showDisputeStatusWarningModal(fileNumber);
      this.listenTo(modalView, 'removed:modal', () => {
        this.withPageLoader(onDoneFn.bind(this, disputeModel));
      });
    } else {
      onDoneFn(disputeModel);
    }

    return statusPassed;
  },

  showDisputeStatusBlockedModal(fileNumber) {
    loaderChannel.trigger('page:load:complete');
    return modalChannel.request('show:standard', {
      title: `${fileNumber ? `File ${fileNumber}` : 'This file'} is not accessible`,
      bodyHtml: `<p>The file you are trying to access is in a stage where it is incomplete or deleted.</p>`
        + `<div><p><ul>`
        + `<li>Saved not submitted: the applicant must complete and submit this file through the Intake site.</li>`
        + `<li>Incomplete paper applications: the application must be completed through the Office Submission site.</li>`
        + `<li>Deleted and abandoned files: these files cannot be recovered and must be resubmitted.</li>`
        + `</ul></p></div>`
        + `<span>Press OK to exit.</span>`,
      hideCancelButton: true,
      primaryButtonText: 'OK',
      modalCssClasses: 'statusWarningBlockModal',
      onContinueFn: (modalView) => modalView.close()
    });
  },

  showDisputeStatusWarningModal(fileNumber) {
    loaderChannel.trigger('page:load:complete');
    return modalChannel.request('show:standard', {
      title: `${fileNumber ? `File ${fileNumber}` : 'This file'} is in View-Only Status`,
      bodyHtml: `<div><p><ul>`
        + `<li>This file is in a view-only status waiting for the applicant to complete or update the application.</li>`
        + `<li>This file should be updated through the same site it was submitted: Intake or Office Submission.</li>`
        + `<li>This file can be viewed but should only be edited if you are sure it has not been modified since it was put into the 'update required' state.</li>`
        + `</ul></p></div>`,
      hideCancelButton: true,
      primaryButtonText: 'OK',
      modalCssClasses: 'statusWarningBlockModal',
      onContinueFn: (modalView) => modalView.close()
    });
  },

  loadMinimalDisputePromise(existingDispute) {
    if (!existingDispute) return Promise.reject();
    const disputeGuid = existingDispute.id;
    return new Promise(res => {
      disputeHistoryChannel.request('load', disputeGuid)
        .always(() => {
          return Promise.all([
            existingDispute.fetch(),
            noticeChannel.request('load', disputeGuid),
            hearingChannel.request('load', disputeGuid),
          ]).finally(() => res(existingDispute));
        });
    });
  },

  _withDisputeLoadAndStatusCheck(disputeGuid, onDoneFn, apiLoadFn, errorHandlerCode) {
    const existingDispute = disputeHistoryChannel.request('get', disputeGuid);
    const disputeAlreadyOpenAndValid = existingDispute && !existingDispute.isBlockedStageStatus();
    const shouldDoLightLoad = existingDispute?.isUnitType() && existingDispute?.get('wasLoaded');
    const loadingPromise = shouldDoLightLoad ? () => this.loadMinimalDisputePromise(existingDispute) : () => apiLoadFn();

    loadingPromise()
      .then(newDisputeModel => {
        newDisputeModel.set(Object.assign({ wasLoaded: true }, existingDispute && newDisputeModel ? {
          sessionSettings: existingDispute.get('sessionSettings'),
        } : null));

        if (disputeAlreadyOpenAndValid) {
          onDoneFn(newDisputeModel);
        } else if (this.checkAndShowDisputeStatusModals(newDisputeModel, onDoneFn)) {
          disputeHistoryChannel.request('add', newDisputeModel);
        } else {
          disputeHistoryChannel.request('clear:dispute', newDisputeModel.id);
        }
      }, err => {
        loaderChannel.trigger('page:load:complete')
        const handler = generalErrorFactory.createHandler(errorHandlerCode);
        handler(err);
      });
  },

  withFullDisputeLoadAndStatusCheck(dispute_guid, onDoneFn) {
    const apiLoadFn = () => new Promise(res => {
      this.listenToOnce(applicationChannel, 'dispute:loaded:full', newDisputeModel => res(newDisputeModel));
      applicationChannel.request('load:dispute:full', dispute_guid);
    });
    this._withDisputeLoadAndStatusCheck(dispute_guid, onDoneFn, apiLoadFn, 'DISPUTE.LOAD.FULL');
  },

  withCoreDisputeLoadAndStatusCheck(dispute_guid, onDoneFn) {
    this._withDisputeLoadAndStatusCheck(dispute_guid, onDoneFn, () => applicationChannel.request('load:dispute:core', dispute_guid), 'DISPUTE.LOAD.CORE');
  },

  loadAndUpdateUserMenuCounts(onDoneFn) {
    const defaultSearchParams = { index: 0, count: 1 };
    const taskSearchParams = Object.assign({}, defaultSearchParams, {
      RestrictTaskStatus: configChannel.request('get', 'TASK_STATUS_INCOMPLETE')
    });
    const currentUser = sessionChannel.request('get:user');
    const currentUserId = currentUser ? currentUser.id : null;

    const dashboardGroup = this.adminSessionSettings.get('menu')?.activeDashboardGroup;
    const dashboardGroupIsArb = dashboardGroup === 'arb_dashboard';
    const dashboardGroupIsIO = dashboardGroup === 'io_dashboard';
    const currentUserIsArb = currentUser && currentUser.isArbitrator();
    const currentUserIsInformationOfficer = currentUser && currentUser.isInformationOfficer();
    const currentUserIsScheduleManager = currentUser && currentUser.isScheduleManager();

    // Only run menu check if the logged in user is an IO or Arb, or is seeing an arb/io dashboard
    if (!currentUserIsArb && !currentUserIsInformationOfficer && !dashboardGroupIsArb && !dashboardGroupIsIO) {
      // Skip check
      onDoneFn();
      return;
    }
    
    const roleGroupToUse = dashboardGroupIsArb ? configChannel.request('get', 'USER_ROLE_GROUP_ARB')
      : dashboardGroupIsIO ? configChannel.request('get', 'USER_ROLE_GROUP_IO')
      : currentUserIsArb ? configChannel.request('get', 'USER_ROLE_GROUP_ARB')
      : currentUserIsInformationOfficer ? configChannel.request('get', 'USER_ROLE_GROUP_IO')
      : null;
    
    const stage_status_list = roleGroupToUse ? statusChannel.request('get:role:type:status:config', roleGroupToUse) : [];
    const StageList = [];
    const StatusList = [];
    const stageStatusListToUse = stage_status_list;

    (stageStatusListToUse || []).forEach(stageStatus => {
      StageList.push(stageStatus.stage);
      
      stageStatus.status_process.forEach(statusProcess => {
        StatusList.push(statusProcess.status);
      });
    });

    // Make sure all list items are unique, since the lists are flat
    const disputeSearchParams = Object.assign({},
      defaultSearchParams,
      StageList.length ? { StageList: [...new Set(StageList)].join(',') } : {},
      StatusList.length ? { StatusList: [...new Set(StatusList)].join(',') } : {}
    );

    const fullCount = 999990;
    const scheduleRequestParams = { index: 0, count: fullCount, StatusIn: [configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED'), configChannel.request('get', 'SCHED_REQ_STATUS_APPROVED_NOT_IMPLEMENTED')] };
    
    $.whenAll(
      taskChannel.request('load:by:owner', currentUserId, taskSearchParams),
      searchChannel.request('search:user:disputes', currentUserId, disputeSearchParams),
      currentUserIsScheduleManager ? schedulingChannel.request('load:requests', scheduleRequestParams) : null
    ).done((taskCollection, disputeCollection, scheduleRequestCollection) => {
      const taskCountToUse = taskCollection && _.isNumber(taskCollection.totalAvailable) ? taskCollection.totalAvailable : null;
      const disputeCountToUse = disputeCollection && _.isNumber(disputeCollection.totalAvailable) ? disputeCollection.totalAvailable : null;
      const requestsCountToUse = scheduleRequestCollection ? 
        scheduleRequestCollection.getActiveRequestsCount()
        : null;

      // Update menu items
      menuChannel.trigger('update:item:count', ['my_tasks_item_io', 'my_tasks_item'], taskCountToUse);
      menuChannel.trigger('update:item:count', ['my_disputes_arb_item', 'my_disputes_io_item'], disputeCountToUse);
      menuChannel.trigger('update:item:count', ['schedule_manager_item'], requestsCountToUse);
    }).always(() => onDoneFn());
  },
 
  // View routing methods
  routingShowDispute(dispute_guid) {
    this.withFullDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(DisputeOverview, { model: disputeModel })
    );
  },

  routingShowEvidence(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(EvidencePage, { model: disputeModel })
    );
  },
  
  routingShowCommunication(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(CommunicationsPage, { model: disputeModel })
    );
  },

  routingShowHearing(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(HearingPage, { model: disputeModel })
    );
  },

  routingShowDisputeTasks(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      (disputeModel) => {
        this.showPageViewGeneralWithMenuLoadUpdate(TasksPage, { model: disputeModel });
      }
    );
  },  

  routingShowHistory(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(HistoryPage, { model: disputeModel })
    );
  },

  routingShowDocuments(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(DocumentsPage, { model: disputeModel })
    );
  },  

  routingShowNotice(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(NoticePage, { model: disputeModel })
    );
  },

  routingShowPayments(dispute_guid) {
    this.withCoreDisputeLoadAndStatusCheck(dispute_guid,
      disputeModel => this.showPageViewGeneralWithMenuLoadUpdate(PaymentsPage, { model: disputeModel })
    );
  },

  routingShowMyTasks(dispute_guid) {
    this.showPageViewGeneralWithMenuLoadUpdate(MyTasksPage, { model: this.adminSessionSettings, dispute_guid } );
  },

  routingShowMyActivities() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(MyActivitiesPage, { model: this.adminSessionSettings }));
  },

  routingShowInternalUsers() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(UserManagementPage, { model: this.adminSessionSettings }));
  },

  routingShowCommonFiles() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(CommonFilesPage, { model: this.adminSessionSettings }));
  },

  routingShowOperationalReports() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(OperationalReportsPage, { model: this.adminSessionSettings }));
  },

  routingShowScheduleManager() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(ScheduleManagerPage, { model: this.adminSessionSettings }));
  },

  routingShowScheduleManagerPeriods() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(ScheduleManagerPage, {
      model: this.adminSessionSettings,
      periods: true,
    }));
  },

  routingShowScheduleManagerWorkingSchedule(param) {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(ScheduleManagerPage, {
      model: this.adminSessionSettings,
      working: true,
      initialPeriodId: param,
    }));
  },

  routingShowCEUComplaints() {
    this.withPageLoader(() => this.showPageViewGeneralWithMenuLoadUpdate(CEUComplaintsPage, { model: new Backbone.Model() }));
  },

  routingShowComposer(dispute_guid, composer_id) {
    const self = this;
    // Load dispute first, then continue with check for doc composer
    disputeHistoryChannel.request('load', dispute_guid).done(function() {
      const composerInstanceModel = documentsChannel.request('get:composer', composer_id);
      if (!composerInstanceModel) {
        console.log("[Error] Composer model doesn't exist - re-routing to landing page");
        Backbone.history.navigate(routeParse('landing_item'), {trigger: true, replace: true});
        return;
      }
      self.withPageLoader(_.bind(self.showPageViewGeneralWithMenuLoadUpdate, self, ComposerInstancePage, { model: composerInstanceModel }));
    });
  },

  routingShowAdvancedSearch(search_id) {
    const searchInstanceModel = searchChannel.request('get:search', search_id);
    if (!searchInstanceModel) {
      console.log("[Error] Search model doesn't exist - re-routing to landing page");
      Backbone.history.navigate(routeParse('landing_item'), {trigger: true, replace: true});
      return;
    }
    this.withPageLoader(_.bind(this.showPageViewGeneralWithMenuLoadUpdate, this, SearchInstance, { model: searchInstanceModel }));
  },

  // Routing Unassigned Dashboards
  routingShowIOUnassignedDisputes(param) {
    this.showPageViewGeneralWithMenuLoadUpdate(DashboardDisputePage, {
      model: this.adminSessionSettings,
      enableTaskView: true,
      enableDocumentView: true,
      taskSubType: configChannel.request('get', 'TASK_SUB_TYPE_IO'),
      stage_status_list: statusChannel.request('get:role:type:status:config', configChannel.request('get', 'USER_ROLE_GROUP_IO'), true),
      users: [],
      title: 'Unassigned',

      // Used for URL sub-routing
      initialRadioSelection: $.trim(param) || null,
      subRoutingRouteName: 'unassigned_io_param_item',

      initialDisputeSortSelection: configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_PAY_DATE')
    });
  },
  routingShowArbUnassignedDisputes(param) {
    // Manually add 6:61:2 to unassigned arb dashboard
    const initialStagesData = [{ stage: 6, status_process: [{ status: 61, process: 2}] }];
    const arbStageStatusList = statusChannel.request('get:role:type:status:config', configChannel.request('get', 'USER_ROLE_GROUP_ARB'), true, initialStagesData);

    this.showPageViewGeneralWithMenuLoadUpdate(DashboardDisputePage, {
      model: this.adminSessionSettings,
      enableTaskView: true,
      enableDocumentView: false,
      viewAllDisputesTitle: 'All Arb Statuses',
      taskSubType: configChannel.request('get', 'TASK_SUB_TYPE_ARB'),
      stage_status_list: arbStageStatusList,
      nonParticipatoryStageStatusList: null,
      users: [],
      title: 'Unassigned',

      // Used for URL sub-routing
      initialRadioSelection: $.trim(param) || null,
      subRoutingRouteName: 'unassigned_arb_param_item',
    });
  },

  // Routing My Disputes Dashboards
  routingShowIOMyDisputes() {
    const logged_in_user = sessionChannel.request('get:user');
    this.showPageViewGeneralWithMenuLoadUpdate(DashboardDisputePage, {
      model: this.adminSessionSettings,
      stage_status_list: statusChannel.request('get:role:type:status:config', configChannel.request('get', 'USER_ROLE_GROUP_IO')),
      users: logged_in_user.isInformationOfficerLead() || logged_in_user.get('dashboard_access') ? userChannel.request('get:ios') : [logged_in_user],

      initialDisputeSortSelection: configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_PAY_DATE'),
    });
  },
  routingShowArbMyDisputes() {
    const logged_in_user = sessionChannel.request('get:user');
    this.showPageViewGeneralWithMenuLoadUpdate(DashboardDisputePage, {
      model: this.adminSessionSettings,
      stage_status_list: statusChannel.request('get:role:type:status:config', configChannel.request('get', 'USER_ROLE_GROUP_ARB')),
      users: logged_in_user.isArbitratorLead() || logged_in_user.get('dashboard_access') ? userChannel.request('get:arbs') : [logged_in_user],
    });
  },

  routingShowArbMyHearings() {
    this.showPageViewGeneralWithMenuLoadUpdate(MySchedulePage, { model: this.adminSessionSettings });
  },

  routingShowScheduleRequests() {
    this.showPageViewGeneralWithMenuLoadUpdate(MySchedulePage, { model: this.adminSessionSettings, personal: true, });
  },

  routingShowSchedule() {
    const latestSchedulePageRoute = localStorage.getItem('latestSchedulePageRoute');
    if (latestSchedulePageRoute) {
      Backbone.history.navigate(latestSchedulePageRoute, {trigger: true, replace: false });
    } else {
      this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, { model: this.adminSessionSettings });
    }
  },

  routingShowScheduleDaily(param) {
    this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, { model: this.adminSessionSettings, daily: true, initialDate: param && $.trim(param).match(/\d{4}-\d{2}-\d{2}/) ? param : null });
  },

  routingShowSchedulePersonal(param) {
    this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, { model: this.adminSessionSettings, personal: true, initialOwner: $.trim(param).match(/\d+/) ? param : null });
  },

  routingShowScheduleMonthly(param) {
    this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, { model: this.adminSessionSettings, monthly: true, initialDate: param && $.trim(param).match(/\d{4}-\d{2}/) ? param : null });
  },

  routingShowScheduleYearly() {
    this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, { model: this.adminSessionSettings, yearly: true });
  },

  routingShowScheduleHistoryDispute(param) {
    this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, {
      model: this.adminSessionSettings,
      history: true,
      initialHearingId: null,
      initialFileNumber: param || null,
    });
  },

  routingShowScheduleHistory(param) {
    this.showPageViewGeneralWithMenuLoadUpdate(ScheduledHearingsPage, {
      model: this.adminSessionSettings,
      history: true,
      initialHearingId: param && param.match(/^\d+$/) ? param : null,
      initialFileNumber: null,
    });
  },

  routingShowCMSPage(cms_file_number) {
    const self = this;
    // Load CMS first, then continue
    cmsChannel.request('load:filenumber', cms_file_number).done(function(model) {
      if (!model) {
        // Throw an unknown application error
        generalErrorFactory.createHandler('ADMIN.CMS.LOAD', () => {
          Backbone.history.navigate(routeParse('landing_item'), { trigger: true, replace: true });
          return;
        })({ status: 400 });
      }
      
      Radio.channel('menu').trigger('add:title:item', {
        title: `CMS F#${cms_file_number}`,
        group: 'cms_dashboard',
        sub_group: cms_file_number,
        enable_cms_buttons: true
      });
      Radio.channel('menu').trigger('add:group:item', model.getMenuItem());
      self.withPageLoader(_.bind(self.showPageViewGeneralWithMenuLoadUpdate, self, CMSArchivePage, { model }));
    }).fail(
      generalErrorFactory.createHandler('ADMIN.CMS.LOAD', () => {
        Backbone.history.navigate(routeParse('landing_item'), { trigger: true, replace: true });
      })
    );
  },

  routingShowLanding() {
    this.showPageViewGeneralWithMenuLoadUpdate(LandingPage);
  },

  // Test User Creation
  routingShowTestCreateUsers() {
    this._showPageViewGeneral(TestCreateUsersPage);
  }

});
