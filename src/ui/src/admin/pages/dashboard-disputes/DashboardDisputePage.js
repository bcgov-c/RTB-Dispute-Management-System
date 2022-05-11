import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routes, routeParse } from '../../routers/mainview_router';
import PageView from '../../../core/components/page/Page';
import SearchResultItemCollection from '../../components/search/SearchResultItem_collection';
import TaskListView from '../../components/tasks/TaskList';
import DashboardDisputeListView from './DashboardDisputeList';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import DashboardDisputeFilters from './DashboardDisputeFilters';
import UndeliveredDocCollection from './undelivered-docs/UndeliveredDoc_collection';
import UndeliveredDocsView from './undelivered-docs/UndeliveredDocs';
import template from './DashboardDisputePage_template.tpl';
import TasksDisplayBaseView from '../tasks/TasksDisplayBase';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const RADIO_CODE_VIEW_ALL = 1;
const RADIO_CODE_TASKS = 2;
const RADIO_CODE_DOCUMENTS = 3;
// R1: Hard-code a non-participatory filter category.  In the future, it could be dynamic by process
const RADIO_CODE_DISPUTES_NON_PARTICIPATORY = 11;

const SUB_ROUTES_TO_RADIO_CODES = {
  all: 1,
  tasks: 2,
  documents: 3,
  'non-participatory': 11
};
const SUB_ROUTE_DEFAULT = 'all';

const DOC_FILTER_ALL = '-1';

const DROPDOWN_CODE_SOURCE_ALL = '-1';
const DROPDOWN_CODE_URGENCY_ALL = '-1';

const VIEW_ALL_DISPUTES_DEFAULT_TITLE = 'View All Disputes';
const NON_PARTICIPATORY_DISPUTES_TITLE = 'Non Participatory Queue';

const loaderChannel = Radio.channel('loader');
const searchChannel = Radio.channel('searches');
const sessionChannel = Radio.channel('session');
const statusChannel = Radio.channel('status');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const taskChannel = Radio.channel('tasks');
const documentsChannel = Radio.channel('documents');

export default TasksDisplayBaseView.extend({
  template,
  className: `${PageView.prototype.className} dashboard-disputes`,

  regions() {
    return Object.assign({}, TasksDisplayBaseView.prototype.regions, {
      viewTypeRegion: '.view-all-radio',
      disputeListRegion: '.dashboard-dispute-list',
      filterRegion: '.dashboard-dispute-filters-section',
      userDropdownRegion: '.dashboard-user-filter',

      afterDateFilterRegion: '.filter-after-date-region',
      beforeDateFilterRegion: '.filter-before-date-region',
      activityTypeFilterRegion: '.tasks-activity-types-filter',

      docsRegion: '.dashboard-docs-list',
      docsMethodFilterRegion: '.docs-sort-by-filters-method',
      docsPriorityFilterRegion: '.docs-sort-by-filters-priority',


      sourceFilterRegion: '.dashboard-source-filter',
      urgencyFilterRegion: '.dashboard-urgency-filter',
      disputeSortByRegion: '.dashboard-dispute-sort',

      undeliveredDocFilterRegion: '.undelivered-doc-filter',
    });
  },

  ui() {
    return Object.assign({}, TasksDisplayBaseView.prototype.ui, {
      refreshIcon: '.header-refresh-icon',
      loadMoreButton: '.dispute-show-more > .show-more-disputes',
      allResults: '.dispute-show-more > .all-disputes',
      print: '.header-print-icon'
    });
  },

  events() {
    return Object.assign({}, TasksDisplayBaseView.prototype.events, {
      'click @ui.refreshIcon': 'clickRefresh',
      'click @ui.loadMoreButton': 'clickLoadMoreDisputes',
      'click @ui.print': function() { window.print(); }
    });
  },

  clickRefresh() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  clickLoadMoreDisputes() {
    const existingDisputeCount = this.disputeCollection.length;

    this.loadDashboardDisputesWithLoader(Object.assign({
        index: 0,
        count: this.disputeCollection.lastUsedFetchCount + existingDisputeCount
      },
    ));
  },

  clickShowMoreTasks() {
    const existingTaskCount = this.tasks.length;
    this.loadTasksWithLoader({
      index: 0,
      count: this.tasks.lastUsedFetchCount + existingTaskCount
    });
  },

  handleDisputeAssign() {
    if (!this.isUnassignedPage) {
      this.model.set({
        menu: {
          ...this.model.get('menu'),
          dashboardPageUser: this.userDropdownModel.getData({ parse: true })
        }
      });
    }
    Backbone.history.loadUrl(Backbone.history.fragment);
  },


  loadPageApiData(options) {
    options = options || {};
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }
    this.loaded = false;

    let loadPromiseToUse = null;
    if (this.showTasks) {
      loadPromiseToUse = this.loadTasks({ index: options.taskIndex, count: options.taskCount });
    } else if (this.showDocs) {
      loadPromiseToUse = this.loadUndeliveredDocs({ no_loader: true });
    } else {
      loadPromiseToUse = this.loadDashboardDisputes({
        index: options.disputeIndex,
        count: options.disputeCount
      });
    }
        
    
    $.whenAll(loadPromiseToUse)
      .done(() => {
        this.loaded = true;
        this.createDisputeFilterModels();
        this.setupDisputeFilterModelListeners();
        this.render();
      });
  },

  loadUndeliveredDocs(options) {
    options = options || {};
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }
    this.loaded = false;

    const methodFilterValue = this.docsMethodFilterModel.getData();
    const priorityFilterValue = this.docsPriorityFilterModel.getData();
    const fileTypesList = documentsChannel.request('get:fileTypes:deliveredBy', this.undeliveredDocFilterModel.getData());
    const deliveryMethods = methodFilterValue === DOC_FILTER_ALL ?
          _.pluck(this.docsMethodFilterModel.get('optionData'), 'value').splice(1) : [methodFilterValue];
    const deliveryPriorities = priorityFilterValue === DOC_FILTER_ALL ? this.ALL_OUTCOME_DOC_DELIVERY_PRIORITIES : [priorityFilterValue];

    const searchOptions = {
      DeliveryMethod: [...new Set(deliveryMethods)].join(','),
      DeliveryPriority: [...new Set(deliveryPriorities)].join(','),
      FileType: [...new Set(fileTypesList)].join(','),
    };
    const dfd = $.Deferred();
    
    searchChannel.request('search:undelivered:docs', searchOptions)
      .done(response => {
        this.loaded = true;
        this.documentCollection.reset(response.outcome_doc_deliveries)
        dfd.resolve();
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.UNDELIVERED.LOAD', () => dfd.reject(err));
        handler(err);
      });
    return dfd.promise();
  },

  // This version of task loading will not be used with the other 2 api calls
  // So any time this is called with a loader, we know we are dealing with tasks only.  Therefore, we can safely render each time
  loadTasksWithLoader() {
    const dfd = $.Deferred();
    loaderChannel.trigger('page:load');
    this.loadTasks(...arguments).done(response => {
      this.render();
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadTasks(searchParams) {
    searchParams = _.extend({}, this.mixin_parseSearchParamsFromPage(searchParams),
      this.taskSubType ? { TaskSubType: this.taskSubType } : {}
    );
    this.loaded = false;

    const dfd = $.Deferred();
    searchChannel.request('search:unassigned:tasks', searchParams)
      .done(taskCollection => {
        this.loaded = true;
        this.tasks = taskCollection;
        dfd.resolve(this.tasks);
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.TASKS.UNASSIGNED.LOAD', () => dfd.reject(err));
        handler(err);
      });
    return dfd.promise();
  },


  // See comment on loadTasksWithLoader above
  loadDashboardDisputesWithLoader() {
    const dfd = $.Deferred();
    loaderChannel.trigger('page:load');
    this.loadDashboardDisputes(...arguments).done(response => {
      this.render();
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadDashboardDisputes(searchParams) {
    this.loaded = false;

    let processRestriction;
    let matchFound = false;

    if (!_.isEmpty(this.selected_stage_status)) {
      _.each(this.stage_status_list, stageStatusObj => {
        if (matchFound) { return; }
        if (this.selected_stage_status.stage === stageStatusObj.stage) {
          _.each(stageStatusObj.status_process, statusObj => {
            if (matchFound) { return; }
            if (this.selected_stage_status.status === statusObj.status) {
              matchFound = true;
              processRestriction = statusObj.process;
            }
          });
        }
      });
    }

    if (!processRestriction && this.showNonParticipatory) {
      processRestriction = this.PROCESS_WRITTEN_OR_DR;
    }

    const StageList = this.selected_stage_status ? [this.selected_stage_status.stage] : [];
    const StatusList = this.selected_stage_status ? [this.selected_stage_status.status] : [];
    const ProcessList = processRestriction ? [processRestriction] : [];
    
    const stageStatusListToUse = this.showNonParticipatory ? this.nonParticipatoryStageStatusList : this.allStageStatusList;
    
    // Fill stage and status list with all possible options if no specific option was selected
    if (!this.selected_stage_status) {
      (stageStatusListToUse || []).forEach(stageStatus => {
        StageList.push(stageStatus.stage);
        
        stageStatus.status_process.forEach(statusProcess => {
          StatusList.push(statusProcess.status);
        });
      });
    }

    const sourceFilterVal = this.sourceFilterModel.getData();
    const urgencyFilterVal = this.urgencyFilterModel.getData();
    const disputeSortVal = this.disputeSortModel.getData();

    // Make sure all list items are unique, since the lists are flat
    searchParams = Object.assign({},
      StageList.length ? { StageList: [...new Set(StageList)].join(',') } : {},
      StatusList.length ? { StatusList: [...new Set(StatusList)].join(',') } : {},
      ProcessList.length ? { ProcessList: [...new Set(ProcessList)].join(',') } : {},

      this.displaySourceFilter && sourceFilterVal !== DROPDOWN_CODE_SOURCE_ALL ? { CreationMethod: sourceFilterVal } : {},
      this.displayUrgencyFilter && urgencyFilterVal !== DROPDOWN_CODE_URGENCY_ALL ? { DisputeUrgency: urgencyFilterVal } : {},
      this.displayDisputeSort ? { SortByDateField: disputeSortVal } : {},

      searchParams
    );
    
    const userIdToUse = this.userDropdownModel.getData({ parse: true });
    
    let apiLoadPromise;
    let apiErrorCodeToUse;
    
    if (this.users.length) {
      apiLoadPromise = searchChannel.request('search:user:disputes', userIdToUse ? userIdToUse : sessionChannel.request('get:user:id'), searchParams);
      apiErrorCodeToUse = 'ADMIN.DISPUTES.ASSIGNED.LOAD';
    } else {
      apiLoadPromise = searchChannel.request('search:unassigned:disputes', searchParams);
      apiErrorCodeToUse = 'ADMIN.DISPUTES.UNASSIGNED.LOAD';
    }
    const dfd = $.Deferred();
    
    apiLoadPromise.done(searchResultCollection => {
      this.loaded = true;
      this.disputeCollection = searchResultCollection;

      this.stopListening(this.disputeCollection, 'assign:dispute', this.handleDisputeAssign, this);
      this.listenTo(this.disputeCollection, 'assign:dispute', this.handleDisputeAssign, this);
      dfd.resolve(this.disputeCollection);
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler(apiErrorCodeToUse, () => dfd.reject(err));
      handler(err);
    });

    return dfd.promise();
  },
 
  initialize(options) {
    this.mergeOptions(options, ['users', 'stage_status_list', 'viewAllDisputesTitle', 'title', 'enableTaskView', 'taskSubType',
        'enableDocumentView', 'initialRadioSelection', 'subRoutingRouteName',
        'initialDisputeSortSelection']);

    this.dashboardPageUserToLoad = this.model.get('menu')?.dashboardPageUser;
    this.model.set({
      menu: {
        ...this.model.get('menu'),
        dashboardPageUser: null
      }
    });
    
    this.DASHBOARD_DISPUTE_SORT_CREATED_DATE = configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_CREATED_DATE') || '1';
    this.DASHBOARD_DISPUTE_SORT_PAY_DATE = configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_PAY_DATE') || '2';
    this.DASHBOARD_DISPUTE_SORT_SUBMITTED_DATE = configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_SUBMITTED_DATE') || '3';
    this.DASHBOARD_DISPUTE_SORT_NOTICE_DATE = configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_NOTICE_DATE') || '4';
    this.DASHBOARD_DISPUTE_SORT_STATUS_DATE = configChannel.request('get', 'DASHBOARD_DISPUTE_SORT_STATUS_DATE') || '5';

    this.PROCESS_WRITTEN_OR_DR = configChannel.request('get', 'PROCESS_WRITTEN_OR_DR') || 2;

    this.isUnassignedPage = !this.users.length;

    this.viewAllDisputesTitle = this.viewAllDisputesTitle || VIEW_ALL_DISPUTES_DEFAULT_TITLE;
    this.allStageStatusList = [];
    this.nonParticipatoryStageStatusList = [];
    _.each(this.stage_status_list, stageObj => {
      const matchingAllStatusProcesses = _.filter((stageObj || []).status_process, statusProcessObj => statusProcessObj.process === null);
      const matchingNonParticipatoryStatusProcesses = _.filter((stageObj || []).status_process, statusProcessObj => statusProcessObj.process === 2);

      if (matchingAllStatusProcesses.length) {
        this.allStageStatusList.push(Object.assign({}, stageObj, { status_process: matchingAllStatusProcesses }));
      }

      if (matchingNonParticipatoryStatusProcesses.length) {
        this.nonParticipatoryStageStatusList.push(Object.assign({}, stageObj, { status_process: matchingNonParticipatoryStatusProcesses }));
      }
    });

    this.cachedFilterData = this.isUnassignedPage ? this.model.get('unassignedDisputes') : this.model.get('myDisputes');
    const cachedViewType = this.cachedFilterData?.filter_viewType;

    // Set initial selection state based on passed sub routing value, but check that it's a legal selection first
    if (!this.initialRadioSelection && !cachedViewType) {
      this.showTasks = false;
      this.showDocs = false;
      this.showNonParticipatory = false;
    } else if (this.enableTaskView && (SUB_ROUTES_TO_RADIO_CODES[this.initialRadioSelection] === RADIO_CODE_TASKS || cachedViewType === RADIO_CODE_TASKS)) {
      this.showTasks = true;
      this.showDocs = false;
      this.showNonParticipatory = false;
    } else if (this.enableDocumentView && (SUB_ROUTES_TO_RADIO_CODES[this.initialRadioSelection] === RADIO_CODE_DOCUMENTS || cachedViewType === RADIO_CODE_DOCUMENTS)) {
      this.showTasks = false;
      this.showDocs = true;
      this.showNonParticipatory = false;
    } else if (this.nonParticipatoryStageStatusList.length && (SUB_ROUTES_TO_RADIO_CODES[this.initialRadioSelection] === RADIO_CODE_DISPUTES_NON_PARTICIPATORY || cachedViewType === RADIO_CODE_DISPUTES_NON_PARTICIPATORY)) {
      this.showTasks = false;
      this.showDocs = false;
      this.showNonParticipatory = true;
    }

    this.updateDisputeFilterEnabling();

    this.ALL_OUTCOME_DOC_DELIVERY_PRIORITIES = ['OUTCOME_DOC_DELIVERY_PRIORITY_NOT_SET', 'OUTCOME_DOC_DELIVERY_PRIORITY_LOW', 'OUTCOME_DOC_DELIVERY_PRIORITY_NORMAL', 'OUTCOME_DOC_DELIVERY_PRIORITY_HIGH']
      .map(configCode => configChannel.request('get', configCode))
      
    this.OUTCOME_DOC_DELIVERY_PRIORITY_HIGH = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_HIGH');
    
    this.disputeCollection = new SearchResultItemCollection();
    this.documentCollection = new UndeliveredDocCollection();
    
    // Task initialization
    // Will create this.tasks
    this.mixin_initializeTaskDisplayData();
    this.mixin_createSubModels({ no_owner_sort: true, no_completed_sort: true });
    this.mixin_setCachedTaskData({sortBy: this.cachedFilterData?.filter_taskSortBy})
    this.mixin_setupListeners();

    this.createSubModels();
    this.setupListeners();
    
    this.selected_stage_status = this.viewTypeModel.getData() === RADIO_CODE_VIEW_ALL ? this.cachedFilterData?.filter_stageStatus : null;
    if (this.selected_stage_status) this.deSelectViewAll(); //this.handleFilterSelection(this.selected_stage_status.stage, this.selected_stage_status.value);
    const defaultTaskCollectionCount = (this.tasks && this.tasks.DEFAULT_API_COUNT) || 20;
    const defaultDisputeCollectionCount = (this.disputeCollection && this.disputeCollection.DEFAULT_API_COUNT) || 20;
    this.loadPageApiData({
      no_loader: true,
      taskIndex: 0,
      taskCount: defaultTaskCollectionCount,
      disputeIndex: 0,
      disputeCount: defaultDisputeCollectionCount
    });
  },

  getViewTypeOptionsWithCount() {
    return this.getViewTypeOptions(true);
  },

  getViewTypeOptions(withCounts) {
    const activeViewType = (withCounts && this.viewTypeModel) && this.viewTypeModel.getData();
    
    return [
      { text: `${this.viewAllDisputesTitle}${activeViewType && activeViewType === RADIO_CODE_VIEW_ALL ? ` (${this.disputeCollection.totalAvailable})`: ''}`, value: RADIO_CODE_VIEW_ALL },
      ...(this.nonParticipatoryStageStatusList.length ? [{
        text: `${NON_PARTICIPATORY_DISPUTES_TITLE}${activeViewType && activeViewType === RADIO_CODE_DISPUTES_NON_PARTICIPATORY ? ` (${this.disputeCollection.totalAvailable})`: ''}`, value: RADIO_CODE_DISPUTES_NON_PARTICIPATORY
      }] : []),
      ...(this.enableTaskView ? [{ text: `View All Tasks${ activeViewType && activeViewType === RADIO_CODE_TASKS && _.isNumber(this.tasks.totalAvailable) ? ` (${this.tasks.totalAvailable})`: ''}`, value: RADIO_CODE_TASKS }] : []),
      ...(this.enableDocumentView ? [{ text: `View Undelivered Documents${activeViewType && activeViewType === RADIO_CODE_DOCUMENTS && _.isNumber(this.documentCollection.length) ? ` (${this.documentCollection.length})`: ''}`, value: RADIO_CODE_DOCUMENTS }] : []),
    ];
  },

  _getDocMethodFilterOptions() {
    const OUTCOME_DOC_DELIVERY_METHOD_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_METHOD_DISPLAY') || [];
    return [[DOC_FILTER_ALL, 'All'], ...Object.entries(OUTCOME_DOC_DELIVERY_METHOD_DISPLAY) ].map( ([value, text]) => ({ value, text }) );
  },

  _getDocPriorityFilterOptions() {
    return [
      { value: DOC_FILTER_ALL, text: 'All' },
      { value: this.OUTCOME_DOC_DELIVERY_PRIORITY_HIGH, text: 'High' }
    ];
  },

  _getDisputePriorityFilterOptions() {
    return _.map(['DISPUTE_URGENCY_EMERGENCY', 'DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED', 'DISPUTE_URGENCY_DUTY'],
      function(code) {
        const value = configChannel.request('get', code);
        return { value: String(value), text: Formatter.toUrgencyDisplay(value) };
      });
  },

  _getUndeliveredDocFilterOptions() {
    const OUTCOME_DOC_DELIVERED_BY_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_DELIVERED_BY_DISPLAY') || [];
    return Object.entries(OUTCOME_DOC_DELIVERED_BY_DISPLAY).map( ([value, text]) => ({ value, text }) );
  },

  _getDisputeSourceFilterOptions() {
    return _.map([
      'DISPUTE_CREATION_METHOD_INTAKE',
      'DISPUTE_CREATION_METHOD_MANUAL',
      'DISPUTE_CREATION_METHOD_ETL_SP',
      'DISPUTE_CREATION_METHOD_ARI_C',
      'DISPUTE_CREATION_METHOD_ARI_E',
      'DISPUTE_CREATION_METHOD_PFR'
    ],
      function(code) {
        const value = configChannel.request('get', code);
        return { value: String(value), text: Formatter.toDisputeCreationMethodDisplay(value) };
      });
  },

  _getActivityTypes() {
    return taskChannel.request('task:optionData', { filtered: true, ui_filters: true });
  },

  createSubModels() {
    const cachedData = this.cachedFilterData;
    this.viewTypeModel = new RadioModel({
      cssClass: 'tasks-filter-style',
      optionData: this.getViewTypeOptions(),
      value: cachedData?.filter_viewType ? cachedData?.filter_viewType : 
        this.selected_stage_status ? null : (
        this.showTasks ? RADIO_CODE_TASKS :
        this.showDocs ? RADIO_CODE_DOCUMENTS :
        this.showNonParticipatory ? RADIO_CODE_DISPUTES_NON_PARTICIPATORY :
        RADIO_CODE_VIEW_ALL
      )
    });

    const userId = this.dashboardPageUserToLoad ? this.dashboardPageUserToLoad : sessionChannel.request('get:user:id') || null;
    this.userDropdownModel = new DropdownModel({
      optionData: (this.users || []).map(user => ({ value: String(user.get('user_id')), text: `${user.isArbitrator() ? `${Formatter.toUserLevelDisplay(user)}: ${user.getDisplayName()}` : user.getDisplayName() }` }) ),
      value: cachedData?.filter_user ? String(cachedData?.filter_user) : 
        userId ? String(userId) : null,
      disabled: this.users.length === 1 ? true : false
    });

    this.afterDateFilterModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: cachedData?.filter_taskCreatedAfter || null,
      required: false
    });

    this.beforeDateFilterModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: cachedData?.filter_taskCreatedBefore || null,
      required: false
    });

    this.activityTypeFilterModel = new DropdownModel({
      optionData: this._getActivityTypes(),
      value: cachedData?.filter_taskActivityTypes || null,
    });

    this.docsMethodFilterModel = new RadioModel({
      optionData: this._getDocMethodFilterOptions(),
      required: false,
      value:  cachedData?.filter_docMethod || DOC_FILTER_ALL
    });

    this.docsPriorityFilterModel = new RadioModel({
      optionData: this._getDocPriorityFilterOptions(),
      required: false,
      value:  cachedData?.sort_docPriority || DOC_FILTER_ALL
    });

    this.sourceFilterModel = new DropdownModel({
      optionData: [
        { value: DROPDOWN_CODE_SOURCE_ALL, text: 'All Types' },
        ...this._getDisputeSourceFilterOptions()
      ],
      defaultBlank: false,
      value: cachedData?.filter_source || DROPDOWN_CODE_SOURCE_ALL
    });

    this.urgencyFilterModel = new DropdownModel({
      optionData: [
        { value: DROPDOWN_CODE_URGENCY_ALL, text: 'All Priorities' },
        ...this._getDisputePriorityFilterOptions()
      ],
      defaultBlank: false,
      value: cachedData?.filter_urgency || DROPDOWN_CODE_URGENCY_ALL
    });

    this.disputeSortModel = new DropdownModel({
      optionData: [
        { value: this.DASHBOARD_DISPUTE_SORT_CREATED_DATE, text: 'Created Date' },
        { value: this.DASHBOARD_DISPUTE_SORT_PAY_DATE, text: 'Initial Pay Date' },
        { value: this.DASHBOARD_DISPUTE_SORT_SUBMITTED_DATE, text: 'Submitted Date' },
        { value: this.DASHBOARD_DISPUTE_SORT_NOTICE_DATE, text: 'Initial Notice Date' },
        { value: this.DASHBOARD_DISPUTE_SORT_STATUS_DATE, text: 'Last Status Date' },
      ],
      defaultBlank: false,
      value: cachedData?.sort_disputeDate ? cachedData?.sort_disputeDate : 
        this.initialDisputeSortSelection ? this.initialDisputeSortSelection : 
        this.DASHBOARD_DISPUTE_SORT_CREATED_DATE
    });

    this.undeliveredDocFilterModel = new DropdownModel({
      optionData: this._getUndeliveredDocFilterOptions(),
      defaultBlank: false,
      value: cachedData?.filter_deliveryBy || String(configChannel.request('get', 'OUTCOME_DOC_DELIVERED_BY_CODE_ADMIN'))
    })

    this.createDisputeFilterModels();
  },

  createDisputeFilterModels() {
    this.disputeFilterModels = [];

    const stageStatusListToUse = this.showNonParticipatory ? this.nonParticipatoryStageStatusList : this.allStageStatusList;
    _.each((stageStatusListToUse || []), function(stage_status_obj) {
      const stage = stage_status_obj.stage;

      const selectedStatus = this.selected_stage_status && this.selected_stage_status.stage === stage ? this.selected_stage_status.status : null;
      
      const filterModel = new RadioModel({
        optionData: (stage_status_obj.status_process || []).map(status_process => {
          return {
            value: status_process.status,
            text: $.trim(`
            ${statusChannel.request('get:status:display', status_process.status)}
            ${ selectedStatus === status_process.status ? `(${this.disputeCollection.totalAvailable})` : '' }`)
          };
        }, this),
        value: selectedStatus,
        stage
      });
      this.disputeFilterModels.push(filterModel);
    }, this);
  },

  updateDisputeFilterEnabling() {
    const showDisputeFilters = !this.showTasks && !this.showDocs;
    this.displaySourceFilter = showDisputeFilters;
    this.displayUrgencyFilter = showDisputeFilters;
    this.displayDisputeSort = showDisputeFilters;
  },

  cacheFilterData() {
    if (this.isUnassignedPage) {
      this.model.set({
        unassignedDisputes: {
          ...this.model.get('unassignedDisputes'),
          filter_viewType: this.viewTypeModel.getData(),
          filter_source: this.sourceFilterModel.getData(),
          filter_urgency: this.urgencyFilterModel.getData(),
          sort_disputeDate: this.disputeSortModel.getData(),
          filter_taskCreatedAfter: this.afterDateFilterModel.getData(),
          filter_taskCreatedBefore: this.beforeDateFilterModel.getData(),
          filter_taskActivityTypes: this.activityTypeFilterModel.getData(),
          filter_deliveryBy: this.undeliveredDocFilterModel.getData(),
          filter_docMethod: String(this.docsMethodFilterModel.getData()),
          sort_docPriority: this.docsPriorityFilterModel.getData(),
          filter_stageStatus: this.selected_stage_status
        }
      })
    } else {
      this.model.set({
        myDisputes: {
          filter_user: this.userDropdownModel.getData(),
          filter_viewType: this.viewTypeModel.getData(),
          filter_source: this.sourceFilterModel.getData(),
          filter_urgency: this.urgencyFilterModel.getData(),
          sort_disputeDate: this.disputeSortModel.getData(),
          filter_stageStatus: this.selected_stage_status
        }
      })
    }
  },

  cacheTaskData() {
    this.model.set({
      unassignedDisputes: {
        ...this.model.get('unassignedDisputes'),
        filter_taskSortBy: this.taskSortByFiltersModel.getData()
      }
    })
  },

  setupListeners() {
    this.stopListening(this.viewTypeModel, 'change:value');
    this.listenTo(this.viewTypeModel, 'change:value', function(model, value) {
      this.selected_stage_status = null;
      this.showTasks = value === RADIO_CODE_TASKS;
      this.showDocs = value === RADIO_CODE_DOCUMENTS;
      this.showNonParticipatory = value === RADIO_CODE_DISPUTES_NON_PARTICIPATORY;
      this.cacheFilterData();
      this.updateDisputeFilterEnabling();
      // Un-select other filters if we just picked View All disputes
      if (value === RADIO_CODE_VIEW_ALL) {
        (this.disputeFilterModels || []).forEach(model => model.set('value', null, { silent: true }));
      }
      
      this.loadPageApiData({
        taskIndex: 0,
        taskCount: this.tasks.lastUsedFetchCount || 20,
        disputeIndex: 0,
        disputeCount: this.disputeCollection.lastUsedFetchCount || 20
      });
    }, this);

    this.stopListening(this.userDropdownModel, 'change:value', this.handleUserFilterChange, this);
    this.listenTo(this.userDropdownModel, 'change:value', this.handleUserFilterChange, this);

    const filterValueCheckAndLoadFn = _.bind(function(model, value) {
      // Only re-render if value is cleared or if the date is a valid one
      this.cacheFilterData();
      if ($.trim(value) === "" || model.isValid()) {
        this.loadTasksWithLoader({
          index: this.tasks.lastUsedFetchIndex || 0,
          count: this.tasks.lastUsedFetchCount || this.tasks.DEFAULT_API_COUNT || 10
        });
      }
    }, this);

    this.stopListening(this.afterDateFilterModel , 'change:value');
    this.listenTo(this.afterDateFilterModel, 'change:value', filterValueCheckAndLoadFn, this);
    
    this.stopListening(this.beforeDateFilterModel , 'change:value');
    this.listenTo(this.beforeDateFilterModel, 'change:value', filterValueCheckAndLoadFn, this);

    this.listenTo(this.activityTypeFilterModel, 'change:value', filterValueCheckAndLoadFn, this)

    this.stopListening(this.docsMethodFilterModel, 'change:value');
    this.listenTo(this.docsMethodFilterModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadUndeliveredDocs().always(() => loaderChannel.trigger('page:load:complete'));
    });

    this.stopListening(this.docsPriorityFilterModel, 'change:value');
    this.listenTo(this.docsPriorityFilterModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadUndeliveredDocs().always(() => loaderChannel.trigger('page:load:complete'));
    });



    this.stopListening(this.sourceFilterModel, 'change:value');
    this.listenTo(this.sourceFilterModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadPageApiData({
        disputeIndex: 0,
        disputeCount: this.disputeCollection.lastUsedFetchCount || 20
      });
    });

    this.stopListening(this.urgencyFilterModel, 'change:value');
    this.listenTo(this.urgencyFilterModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadPageApiData({
        disputeIndex: 0,
        disputeCount: this.disputeCollection.lastUsedFetchCount || 20
      });
    });

    this.stopListening(this.disputeSortModel, 'change:value');
    this.listenTo(this.disputeSortModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadPageApiData({
        disputeIndex: 0,
        disputeCount: this.disputeCollection.lastUsedFetchCount || 20
      });
    });

    this.listenTo(this.undeliveredDocFilterModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadUndeliveredDocs().always(() => loaderChannel.trigger('page:load:complete'));
    })
  },

  setupDisputeFilterModelListeners() {
    // Add listeners to the dispute filter models
    _.each(this.disputeFilterModels, function(model) {
      this.stopListening(model, 'change:value', this.handleFilterSelection, this);
      this.listenTo(model, 'change:value', this.handleFilterSelection, this);
    }, this);
  },

  handleFilterSelection(current_model, val) {
    loaderChannel.trigger('page:load');
    this.deSelectViewAll();
    _.each(this.disputeFilterModels, function(model) {
      if (current_model !== model) {
        model.set('value', null, { silent: true })
      }
    });

    this.selected_stage_status = { stage: current_model.get('stage'), status: val };
    this.cacheFilterData();
    this.loadDashboardDisputes(Object.assign({
        index: 0,
        count: this.disputeCollection.lastUsedFetchCount || 20
      }, 
    )).always(() => {
      this.createDisputeFilterModels();
      this.setupDisputeFilterModelListeners();
      this.render();
    });
  },


  deSelectViewAll() {
    this.viewTypeModel.set('value', null, { silent: true });
    const view = this.getChildView('viewTypeRegion');
    if (view) {
      view.render();
    }
  },

  handleUserFilterChange(model, value) {
    // Do a re-search of disputes for the newly-selected user
    this.selected_stage_status = null;
    this.viewTypeModel.set('value', RADIO_CODE_VIEW_ALL, { silent: true });
    this.cacheFilterData();
    this.loadPageApiData({
      taskIndex: 0,
      taskCount: this.tasks.lastUsedFetchCount || 20,
      disputeIndex: 0,
      disputeCount: this.disputeCollection.lastUsedFetchCount || 20
    });
  },

  getSelectedDisputeFilterOption() {
    if (_.isEmpty(this.selected_stage_status)) {
      return null;
    }

    const disputeFilterModel = this.getSelectedDisputeFilterModel();
    
    if (!disputeFilterModel) {
      return;
    }

    const optionData = disputeFilterModel.get('optionData');
    let matchingOption;
    if (!_.isEmpty(optionData)) {
      matchingOption = _.find(optionData, option => option.value === this.selected_stage_status.status);
    }

    return matchingOption;
  },

  getSelectedDisputeFilterModel() {
    if (_.isEmpty(this.selected_stage_status)) {
      return null;
    }

    return _.find(this.disputeFilterModels, filterModel => filterModel.get('stage') === this.selected_stage_status.stage );
  },


  onBeforeRender() {
    // Any dependent UI state data that should be updated at render time?
    this.viewTypeModel.set('optionData', this.getViewTypeOptionsWithCount(), { silent: true });

    // This displays total available counts to users, which is complex to keep state of when applying additional UI filter
    // For dashboard tasks, perform another API call when a change is made to ensure fully updated count.
    this.stopListening(this.tasks, 'change:task_status assigned');
    this.listenTo(this.tasks, 'change:task_status assigned', this.clickRefresh, this);

    // if(this.isRendered()) {
    //   const region = this.getRegion('activityTypeFilterRegion');
    //   if(region.hasView()) {
    //     this.currentChildView = region.detachView();
    //   }
    // }
  },

  onRender() {
    if (!this.loaded) {
      return;
    }

    const selectedRadio = this.viewTypeModel.getData({ parse: true });
    if (this.subRoutingRouteName && selectedRadio) {
      const selectedUrlSubRoute = _.invert(SUB_ROUTES_TO_RADIO_CODES)[selectedRadio] || SUB_ROUTE_DEFAULT;
      
      // Replace the route if we have loaded the unassigned page with no route, and we are defaulting to all
      const currentFragment = $.trim(Backbone.history.getFragment()).split('?')[0];
      const isNoSubRouteSelected = currentFragment.endsWith(routes.unassigned_arb_item) || currentFragment.endsWith(routes.unassigned_io_item);
      const isRedirectingToDefaultSubFilter = selectedUrlSubRoute === SUB_ROUTE_DEFAULT;
      Backbone.history.navigate(routeParse(this.subRoutingRouteName, null, selectedUrlSubRoute), {
        trigger: false,
        replace: isNoSubRouteSelected && isRedirectingToDefaultSubFilter
      });
    }

    
    this.showChildView('viewTypeRegion', new RadioView({ model: this.viewTypeModel }));
    if (!this.isUnassignedPage) {
      this.showChildView('userDropdownRegion', new DropdownView({ model: this.userDropdownModel}));
    }
    
    if (this.showTasks) {
      this.renderTaskList();
    } else if (this.showDocs) {
      this.renderDocsList();
    } else {
      this.renderDisputeList();
    }
    loaderChannel.trigger('page:load:complete');
  },

  renderTaskList() {
    this.showChildView('taskSortByFilter', new RadioView({ model: this.taskSortByFiltersModel, displayTitle: 'Sort by:' }));
    this.showChildView('afterDateFilterRegion', new InputView({ model: this.afterDateFilterModel }));
    this.showChildView('beforeDateFilterRegion', new InputView({ model: this.beforeDateFilterModel }));
    this.showChildView('activityTypeFilterRegion', new DropdownView({ model: this.activityTypeFilterModel }));
    
    this.showChildView('taskList', new (TaskListView.extend({
      className: `${TaskListView.prototype.className} my-task-list-item`
    }))({
      collection: this.tasks,
      afterDateFilter: this.afterDateFilterModel,
      beforeDateFilter: this.beforeDateFilterModel,
      showTaskComplete: true,
      showReassign: this.users.length > 1,
      showFileNumber: true, 
      filter: (model) => {
        if (model.isAssigned()) {
          return false;
        }
        return this.mixin_frontendTaskFilterFn(model);
      }
    }));
  },

  renderDocsList() {
    this.showChildView('undeliveredDocFilterRegion', new DropdownView({ model: this.undeliveredDocFilterModel, displayTitle: 'Delivery By:' }));
    this.showChildView('docsMethodFilterRegion', new RadioView({ model: this.docsMethodFilterModel, displayTitle: 'Delivery Method:' }));
    this.showChildView('docsPriorityFilterRegion', new RadioView({ model: this.docsPriorityFilterModel, displayTitle: 'Priority:' }));
    this.showChildView('docsRegion', new UndeliveredDocsView({ collection: this.documentCollection }));
  },

  renderDisputeList() {
    this.showChildView('urgencyFilterRegion', new DropdownView({ model: this.urgencyFilterModel }));
    this.showChildView('sourceFilterRegion', new DropdownView({ model: this.sourceFilterModel }));
    this.showChildView('disputeSortByRegion', new DropdownView({ model: this.disputeSortModel, displayTitle: 'Sort by:' }));
    this.showChildView('filterRegion', new DashboardDisputeFilters({ filter_models: this.disputeFilterModels }));

    this.showChildView('disputeListRegion', new DashboardDisputeListView({
      collection: this.disputeCollection,
      showUnassignedOnly: this.isUnassignedPage,
      showReassignButtons: this.users.length > 1
    }));
  },

  templateContext() {
    return Object.assign({}, this.mixin_templateContext(), {
      showDocs: this.showDocs,
      showTasks: this.showTasks,
      displayUserDropdown: !this.isUnassignedPage,

      displaySourceFilter: this.displaySourceFilter,
      displayUrgencyFilter: this.displayUrgencyFilter,
      displayDisputeSort: this.displayDisputeSort,
      displayUndeliveredDocFilter: this.showDocs,
      
      title: this.title ? this.title : 'My Disputes',
      isLoaded: this.loaded,
      hasMoreDisputes: (this.disputeCollection || {hasMoreAvailable: ()=>{}}).hasMoreAvailable({ ignore_count_length_difference: true }),
      showPrint: this.showTasks
    });
  }

});
