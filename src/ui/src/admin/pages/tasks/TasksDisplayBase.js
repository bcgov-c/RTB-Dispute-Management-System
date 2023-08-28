import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioModel from '../../../core/components/radio/Radio_model';
import TaskCollection from '../../../core/components/tasks/Task_collection';

const TASK_SORT_BY_PRIORITY = 1;
const TASK_SORT_BY_DATE_DUE = 2;
const TASK_SORT_BY_DATE_CREATED = 3;
const TASK_SORT_BY_OWNER = 4;
const TASK_SORT_BY_COMPLETED = 5;

// Note: This is not a real code, just something for the page to detect when "all" is selected
const TASK_FILTER_TYPE_ALL = 42;

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({

  regions: {
    taskList: '#task-list',
    taskTypeFilter: '.tasks-type-filters',
    taskSortByFilter: '.tasks-sort-by-filters'
  },

  ui: {
    printHeader: '.print-header',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    print: '.header-print-icon',
    showMoreTasks: '.task-show-more'
  },

  events: {
    'click @ui.print': function() { window.print(); },
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose',
    'click @ui.showMoreTasks': 'clickShowMoreTasks'
  },


  mixin_isSortByEqualTo(value) {
    return this.taskSortByFiltersModel.getData() === value && (value || value === 0);
  },

  mixin_isSortByPriority() {
    return this.mixin_isSortByEqualTo(TASK_SORT_BY_PRIORITY);
  },

  mixin_isSortByDueDate() {
    return this.mixin_isSortByEqualTo(TASK_SORT_BY_DATE_DUE);
  },

  mixin_isSortByCreatedDate() {
    return this.mixin_isSortByEqualTo(TASK_SORT_BY_DATE_CREATED);
  },

  mixin_isSortByOwner() {
    return this.mixin_isSortByEqualTo(TASK_SORT_BY_OWNER);
  },

  mixin_isSortByCompleted() {
    return this.mixin_isSortByEqualTo(TASK_SORT_BY_COMPLETED);
  },

  mixin_isSortByActivityType() {

  },

  mixin_isTypeFilterEqualTo(value) {
    return this.taskTypeFiltersModel.getData() === value && (value || value === 0);
  },

  mixin_isFilterSetToAll() {
    return this.mixin_isTypeFilterEqualTo(TASK_FILTER_TYPE_ALL);
  },

  mixin_isFilterSetToOpen() {
    return this.mixin_isTypeFilterEqualTo(this.TASK_STATUS_OPEN);
  },

  mixin_isFilterSetToClosed() {
    return this.mixin_isTypeFilterEqualTo(this.TASK_STATUS_CLOSED);
  },

  mixin_frontendTaskFilterFn(model) {
    if (model.isComplete()) {
      if (this.mixin_isFilterSetToOpen()) {
        return false;
      }
    } else if (this.mixin_isFilterSetToClosed()) {
      return false;
    }
    return true;
  },

  mixin_initializeTaskDisplayData(options) {
    this.tasks = new TaskCollection();
    this.mixin_setupTasksListeners();
    this.SORT_DIRECTION_MAP = {
      TaskPriority: 'Desc',
      TaskDueDate: 'Asc',
      CreatedDate: 'Asc',
      TaskOwnerId: 'Desc',
      DateTaskCompleted: 'Desc',
    };
    this.TASK_STATUS_OPEN = configChannel.request('get', 'TASK_STATUS_INCOMPLETE');
    this.TASK_STATUS_CLOSED = configChannel.request('get', 'TASK_STATUS_COMPLETE');
  },

  mixin_performInitialTasksLoad() {
    // Perform initial load
    const defaultTaskCollectionCount = (this.tasks && this.tasks.DEFAULT_API_COUNT) || 20;
    console.log(defaultTaskCollectionCount);
    this.loadTasks({
      index: 0,
      count: defaultTaskCollectionCount,
    });
    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
  },

  mixin_getTaskTypeFiltersWithCount() {
    const totalAvailable = this.tasks?.totalAvailable || 0;
    const selectedValue = this.taskTypeFiltersModel?.getData();
    const addCount = ({ value, text }) => Number.isInteger(value) && selectedValue === value ? ({ value, text: `${text} (${totalAvailable})` }) : ({ value, text });
    return [
      addCount({ value: TASK_FILTER_TYPE_ALL, text: `View All` }),
      addCount({ value: this.TASK_STATUS_OPEN, text: `Open Only` }),
      addCount({ value: this.TASK_STATUS_CLOSED, text: `Closed Only` })
    ];
  },

  mixin_createSubModels(options={}) {
    this.enableCompletedDateSort = !options.no_completed_sort;
    
    this.taskTypeFiltersModel = new RadioModel({
      optionData: this.mixin_getTaskTypeFiltersWithCount(),
      value: this.TASK_STATUS_OPEN
    });
  
    this.taskSortByFiltersModel = new RadioModel({
      optionData: [
        { value: TASK_SORT_BY_PRIORITY, text: 'Priority' },
        { value: TASK_SORT_BY_DATE_DUE, text: 'Due' },
        { value: TASK_SORT_BY_DATE_CREATED, text: 'Created' },
        ...(options.no_owner_sort ? [] : [{ value: TASK_SORT_BY_OWNER, text: 'Owner' }]),
        ...(this.taskTypeFiltersModel.getData() === this.TASK_STATUS_OPEN || options.no_completed_sort ? [] : [{ value: TASK_SORT_BY_COMPLETED, text: 'Completed' }]),
      ],
      value: TASK_SORT_BY_DATE_CREATED
    });
  },

  mixin_updateTaskSortTypeFilterModel(updateValue) {
    if (this.enableCompletedDateSort) {
      // NOTE: This implementation assumes TaskCompletedDate is the last filter in the list
      const hasCompletedDateSortOption = this.taskSortByFiltersModel.get('optionData')?.find(opt => opt.value === TASK_SORT_BY_COMPLETED);
      if (updateValue === this.TASK_STATUS_CLOSED) {
        if (!hasCompletedDateSortOption) this.taskSortByFiltersModel.get('optionData').push({ value: TASK_SORT_BY_COMPLETED, text: 'Completed' });
        this.taskSortByFiltersModel.set('value', TASK_SORT_BY_COMPLETED, { silent: true });
      } else {
        if (hasCompletedDateSortOption) this.taskSortByFiltersModel.get('optionData').pop();
        if (this.taskSortByFiltersModel.getData() === TASK_SORT_BY_COMPLETED) this.taskSortByFiltersModel.set('value', TASK_SORT_BY_DATE_CREATED, { silent: true });
      }
    }
  },

  mixin_setupListeners() {
    this.listenTo(this.taskTypeFiltersModel, 'change:value', (model, value) => {
      this.mixin_updateTaskSortTypeFilterModel(value);
      this.cacheTaskData();
      
      this.loadTasksWithLoader({
        index: this.tasks.lastUsedFetchIndex || 0,
        count: this.tasks.lastUsedFetchCount || this.tasks.DEFAULT_API_COUNT || 20
      });
    });

    this.listenTo(this.taskSortByFiltersModel, 'change:value', () => {
      this.cacheTaskData();
      this.loadTasksWithLoader({
        index: this.tasks.lastUsedFetchIndex || 0,
        count: this.tasks.lastUsedFetchCount || this.tasks.DEFAULT_API_COUNT || 20
      });
    });
  },

  mixin_setupTasksListeners() {
    this.stopListening(this.tasks, 'sync');
    this.listenTo(this.tasks, 'sync', (changedTask) => {
      console.log(changedTask.id, changedTask);
      if (
        (changedTask.isComplete() && this.mixin_isFilterSetToOpen()) ||
        (!changedTask.isComplete() && this.mixin_isFilterSetToClosed())
      ) {
        this.tasks.totalAvailable = this.tasks.totalAvailable - 1;
        this.render();
      }
    });
  },

  mixin_setCachedTaskData(cachedData={filter_taskType: null, sortBy: null}) {
    console.log('cachedData: ', cachedData);
    if (cachedData?.filter_taskType) {
      this.taskTypeFiltersModel.set({ value: cachedData.filter_taskType });
      this.mixin_updateTaskSortTypeFilterModel(cachedData.filter_taskType);
    }
    if (cachedData?.sortBy) this.taskSortByFiltersModel.set({ value: cachedData.sortBy });
  },

  mixin_parseSearchParamsFromPage(searchParams) {
    searchParams = searchParams || {};
    const typeFilterValue = this.taskTypeFiltersModel.getData();
    const createdAfterDateFilterValue = this.afterDateFilterModel && this.afterDateFilterModel.getData();
    const createdBeforeDateFilterValue = this.beforeDateFilterModel && this.beforeDateFilterModel.getData();

    let activityTypeFilterValue = this.activityTypeFilterModel && this.activityTypeFilterModel.getData();
    if (this.activityTypeFilterModel && (this.activityTypeFilterModel.getSelectedOption() || {}).RestrictTaskActivityTypeList) {
      activityTypeFilterValue = this.activityTypeFilterModel.getSelectedOption().RestrictTaskActivityTypeList;
    }

    const sortByStringValue = this.mixin_isSortByPriority() ? 'TaskPriority' :
      this.mixin_isSortByDueDate() ? 'TaskDueDate' :
      this.mixin_isSortByCreatedDate() ? 'CreatedDate' :
      this.mixin_isSortByOwner() ? 'TaskOwnerId' :
      this.mixin_isSortByCompleted() ? 'DateTaskCompleted' :
      null;

    
    const sortDirectionStringValue = sortByStringValue && this.SORT_DIRECTION_MAP[sortByStringValue] ? this.SORT_DIRECTION_MAP[sortByStringValue] : null;

    return _.extend(
      // Apply optional filters
      typeFilterValue !== TASK_FILTER_TYPE_ALL ?  { RestrictTaskStatus: typeFilterValue } : {},
      createdAfterDateFilterValue && this.afterDateFilterModel.isValid() ? { TasksCreatedAfterDate: createdAfterDateFilterValue } : {},
      createdBeforeDateFilterValue && this.beforeDateFilterModel.isValid() ? { TasksCreatedBeforeDate: createdBeforeDateFilterValue } : {},
      activityTypeFilterValue && this.activityTypeFilterModel.isValid() ? { RestrictTaskActivityTypeList: activityTypeFilterValue } : {},
      // Apply optional sorting
      sortByStringValue ? { SortByField: sortByStringValue } : {},
      sortDirectionStringValue ? { SortDirection: sortDirectionStringValue } : {},
      // Finally, add searchParams last to allow for any custom overwrites.
      searchParams
    );
  },

  mixin_templateContext() {
    return {
      hasTasks: (this.tasks || {}).length,
      hasMoreTasks: (this.tasks || {hasMoreAvailable: ()=>{}}).hasMoreAvailable(),
      Formatter,
      isLoaded: this.tasks_loaded,
      lastRefreshTime: Moment(),
      printFilterText: this.taskTypeFiltersModel.getSelectedText(),
      printSortText: this.taskSortByFiltersModel.getSelectedText()
    };
  }

});