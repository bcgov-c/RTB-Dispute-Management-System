import Backbone from "backbone";

export default Backbone.Model.extend({
  defaults: {
    showInactiveUsers: false,
    menu: {
      dashboardPageUser: null,
      activeDashboardGroup: null,
      isCollapsed: false,
    },
    userManagement: {
      filter_userType: null,
      sort_userAttr: null
    },
    commonFiles: {
      thumbnailsEnabled_help: null,
      thumbnailsEnabled_forms: null,
      thumbnailsEnabled_signatures: null,
      thumbnailsEnabled_excel: null,
      showArchivedHelp: null,
      showArchivedForms: null,
    },
    mySchedulePage: {
      filter_scheduleType: null,
      filter_selectedArb: null,
      filter_scheduleRequestAfter: null,
      filter_scheduleRequestFilter: null,
    },
    myDisputes: {
      filter_user: null,
      filter_viewType: null,
      filter_sourceFilter: null,
      filter_urgencyFilter: null,
      sort_disputeDate: null,
      filter_stageStatus: null,
    },
    myTasks: {
      filter_taskOwner: null,
      filter_taskType: null,
      sortBy: null,
      filter_afterDate: null,
      filter_activityType: null,
    },
    unassignedDisputes: {
      filter_viewType: null,
      filter_source: null,
      filter_urgency: null,
      sort_disputeDate: null,
      filter_taskCreatedAfter: null,
      filter_taskCreatedBefore: null,
      filter_taskActivityTypes: null,
      filter_taskSortBy: null,
      filter_deliveryBy: null,
      filter_docMethod: null,
      sort_docPriority: null,
      filter_stageStatus: null,
    },
    myRecentActivity: {
      filter_activityOwner: null,
      filter_activityType: null,
      filter_activity: null,
      filter_dateRange: null,
      filter_dateFirst: null,
      filter_dateSecond: null,
      filter_resultsCount: null,
    },
  }
});