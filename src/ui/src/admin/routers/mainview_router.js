import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

const disputeChannel = Radio.channel('dispute');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');

// The keys are item_ids from the MenuConfig
const routes = {
  landing_item: 'landing',
  users_item: 'users',
  common_files_item: 'common-files',
  reports_item: 'reports',
  ceu_complaints_item: 'ceu-complaints',
  schedule_manager_item: 'schedule-manager',
  schedule_manager_periods_item: 'schedule-manager/periods',
  schedule_manager_requests_item: 'schedule-manager/requests',
  schedule_manager_working_item: 'schedule-manager/working',
  schedule_manager_working_param_item: 'schedule-manager/working/:param_id',
  overview_item: 'dispute/:dispute_guid',
  evidence_item: 'dispute/:dispute_guid/evidence',
  hearing_item: 'dispute/:dispute_guid/hearing',
  communication_item: 'dispute/:dispute_guid/communication',
  task_item: 'dispute/:dispute_guid/tasks',
  history_item: 'dispute/:dispute_guid/history',
  document_item: 'dispute/:dispute_guid/documents',
  my_tasks_item: 'my-tasks',
  my_tasks_item_io: 'my-tasks-io',
  my_activities_item: 'my-activities',
  my_activities_io_item: 'my-activities-io',
  notice_item: 'dispute/:dispute_guid/notice',
  payment_item: 'dispute/:dispute_guid/payments',
  search_item: 'search/:param_id',
  composer_item: 'dispute/:dispute_guid/composer/:param_id',
  my_disputes_io_item: 'io-disputes',
  my_disputes_arb_item: 'arb-disputes',
  my_hearings_arb_item: 'arb-my-hearings',
  cms_item: 'cms-archive/:param_id',

  unassigned_arb_item: 'arb-unassigned',
  unassigned_arb_param_item: 'arb-unassigned/:param_id',
  unassigned_io_item: 'io-unassigned',
  unassigned_io_param_item: 'io-unassigned/:param_id',
  
  scheduled_hearings_item: 'schedule',
  scheduled_hearings_daily_item: 'schedule/daily',
  scheduled_hearings_daily_param_item: 'schedule/daily/:param_id',
  scheduled_hearings_personal_item: 'schedule/personal',
  scheduled_hearings_personal_param_item: 'schedule/personal/:param_id',
  scheduled_hearings_monthly_item: 'schedule/monthly',
  scheduled_hearings_monthly_param_item: 'schedule/monthly/:param_id',
  scheduled_hearings_yearly_item: 'schedule/yearly',
  scheduled_hearings_history_item: 'schedule/history',
  scheduled_hearings_history_param_item: 'schedule/history/:param_id',
  scheduled_hearings_history_dispute_param_item: 'schedule/history/dispute/:param_id',
  scheduled_requests_item: 'schedule/requests',

  // Some routes just for testing
  test_create_users_item: 'test-create-users'
};

const routeParse = function(item_id, dispute_guid=null, param_id=null) {
  let route = routes[item_id];

  if (!route) {
    console.log(`[Warning] Can't routeParse from ${item_id}`);
    return route;
  }

  if (dispute_guid) {
    route = route.replace(':dispute_guid', dispute_guid);
  }
  if (param_id) {
    route = route.replace(':param_id', param_id);
  }
  return route;
};

export { routes, routeParse };
export const MainViewRouter = Marionette.AppRouter.extend({
  _appRoutes: {
    [routes.landing_item]: 'routingShowLanding',
    [routes.users_item]: 'routingShowInternalUsers',
    [routes.common_files_item]: 'routingShowCommonFiles',
    [routes.reports_item]: 'routingShowOperationalReports',
    [routes.ceu_complaints_item]: 'routingShowCEUComplaints',
    [routes.schedule_manager_item]: 'routingShowScheduleManager',
    [routes.schedule_manager_periods_item]: 'routingShowScheduleManagerPeriods',
    [routes.schedule_manager_requests_item]: 'routingShowScheduleManager',
    [routes.schedule_manager_working_item]: 'routingShowScheduleManagerWorkingSchedule',
    [routes.schedule_manager_working_param_item]: 'routingShowScheduleManagerWorkingSchedule',
    [routes.overview_item]: 'routingShowDispute',
    [routes.evidence_item]: 'routingShowEvidence',
    [routes.hearing_item]: 'routingShowHearing',
    [routes.communication_item]: 'routingShowCommunication',
    [routes.task_item]: 'routingShowDisputeTasks',
    [routes.history_item]: 'routingShowHistory',
    [routes.document_item]: 'routingShowDocuments',
    [routes.my_tasks_item]: 'routingShowMyTasks',
    [routes.my_tasks_item_io]: 'routingShowMyTasks',
    [routes.my_activities_item]: 'routingShowMyActivities',
    [routes.my_activities_io_item]: 'routingShowMyActivities',
    [routes.notice_item]: 'routingShowNotice',
    [routes.payment_item]: 'routingShowPayments',
    [routes.search_item]: 'routingShowAdvancedSearch',
    [routes.composer_item]: 'routingShowComposer',
    [routes.my_disputes_io_item]: 'routingShowIOMyDisputes',
    [routes.my_disputes_arb_item]: 'routingShowArbMyDisputes',
    [routes.my_hearings_arb_item]: 'routingShowArbMyHearings',
    [routes.cms_item]: 'routingShowCMSPage',

    // Dashboard routes
    [routes.unassigned_io_item]: 'routingShowIOUnassignedDisputes',
    [routes.unassigned_io_param_item]: 'routingShowIOUnassignedDisputes',
    [routes.unassigned_arb_item]: 'routingShowArbUnassignedDisputes',
    [routes.unassigned_arb_param_item]: 'routingShowArbUnassignedDisputes',
    
    // Schedule routes
    [routes.scheduled_hearings_item]: 'routingShowSchedule',
    [routes.scheduled_hearings_daily_item]: 'routingShowScheduleDaily',
    [routes.scheduled_hearings_daily_param_item]: 'routingShowScheduleDaily',
    [routes.scheduled_hearings_personal_item]: 'routingShowSchedulePersonal',
    [routes.scheduled_hearings_personal_param_item]: 'routingShowSchedulePersonal',
    [routes.scheduled_hearings_monthly_item]: 'routingShowScheduleMonthly',
    [routes.scheduled_hearings_monthly_param_item]: 'routingShowScheduleMonthly',
    [routes.scheduled_hearings_yearly_item]: 'routingShowScheduleYearly',
    [routes.scheduled_hearings_history_item]: 'routingShowScheduleHistory',
    [routes.scheduled_hearings_history_param_item]: 'routingShowScheduleHistory',
    [routes.scheduled_hearings_history_dispute_param_item]: 'routingShowScheduleHistoryDispute',
    [routes.scheduled_requests_item]: 'routingShowScheduleRequests',

    [routes.test_create_users_item]: 'routingShowTestCreateUsers'
  },

  initialize() {
    this._lastRouteFragmentUsed = null;
    this.processAppRoutes(this.controller,  _.mapObject(this._appRoutes, function() { return '_skipInitialRouting'; }));
  },

  after(path, args) {
    this._lastRouteFragmentUsed = Backbone.history.getFragment();
    const routingFn = _.bind(this.controller.performRoute, this.controller, this._appRoutes[path], path, args);
    setTimeout(routingFn, 50);
  },

  before(route, params) {
    // User needs auth on all of these internal pages
    if (!sessionChannel.request('is:authorized')) {
      console.debug(`[Warning] User is not authorized in mainview_router`);
      Backbone.history.navigate('login', { trigger: true });
      return false;
    }

    // Stash the used URL route
    const paramValue = _.isArray(params) && params.length ? params[0] : null;
    const stashedRoute = route.replace(':dispute_guid', paramValue).replace(':param_id', paramValue);

    const dispute = disputeChannel.request('get');
    if (dispute && dispute.get('editInProgress')) {
      dispute.showEditInProgressModalPromise(true)
        .then(isAccepted => {
          if (isAccepted) {
            dispute.stopEditInProgress();
            Backbone.history.loadUrl(stashedRoute);
            Backbone.history.navigate(stashedRoute, { trigger: false, replace: true });
          } else {
            // If we cancelled the route, reset the backbone url
            Backbone.history.navigate(this._lastRouteFragmentUsed, {trigger: false, replace: true});
          }
        });
      
      return false;
    } else {
      loaderChannel.trigger('page:load');
    }
    
  }
});
