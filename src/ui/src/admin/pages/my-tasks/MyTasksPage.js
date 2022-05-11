import Radio from 'backbone.radio';
import RadioView from '../../../core/components/radio/Radio';
import TaskListView from '../../components/tasks/TaskList';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import template from './MyTasksPage_template.tpl';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TasksDisplayBaseView from '../tasks/TasksDisplayBase';
import PageView from '../../../core/components/page/Page';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { QUEUE_USER_NAMES } from '../../../core/components/user/UserManager';

const loaderChannel = Radio.channel('loader');
const taskChannel = Radio.channel('tasks');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');

export default TasksDisplayBaseView.extend({
  template,
  className: `${PageView.prototype.className} tasks-page my-tasks-page`,

  regions() {
    return Object.assign({}, TasksDisplayBaseView.prototype.regions, {
      taskOwnerRegion: '.my-tasks-page-owner',
      filterDateRegion: '.calendar-filter-region',
      activityTypeFilterRegion: '.tasks-activity-types-filter'
    });
  },

  clickRefresh() {
    this.loadTasksWithLoader({
      index: 0,
      count: this.tasks.lastUsedFetchCount || 20
    });
  },

  clickShowMoreTasks() {
    const existingTaskCount = this.tasks.length;
    this.loadTasksWithLoader({
      index: 0,
      count: this.tasks.lastUsedFetchCount + existingTaskCount
    }, () => {
      this.render();
    });
  },

  cacheTaskData() {
    this.model.set({
      myTasks : {
        filter_taskOwner: this.taskOwnerModel.getData(),
        filter_taskType: this.taskTypeFiltersModel.getData(),
        sortBy: this.taskSortByFiltersModel.getData(),
        filter_afterDate: this.afterDateFilterModel.getData(),
        filter_activityType: this.activityTypeFilterModel.getData()
      }
    })
  },

  loadTasksWithLoader() {
    loaderChannel.trigger('page:load');
    return this.loadTasks(...arguments);
  },

  loadTasks(searchParams, onCompleteFn) {
    const userId = this.taskOwnerModel.getData();
    searchParams = this.mixin_parseSearchParamsFromPage(searchParams);
    this.tasks_loaded = false;
    taskChannel.request('load:by:owner', userId, searchParams)
      .done(taskCollection => {
        this.tasks = taskCollection;
        this.tasks_loaded = true;
        
        if (_.isFunction(onCompleteFn)) {
          onCompleteFn();
        } else {
          this.render();
        } 
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.MYTASKS.LOAD', () => {
          if (_.isFunction(onCompleteFn)) {
            onCompleteFn();
          } else {
            this.render();
          }
        });
        handler(err);
      });
  },

  initialize(options) {
    this.mixin_initializeTaskDisplayData(options);
    this.mixin_createSubModels({ no_owner_sort: true });
    this.mixin_setCachedTaskData({ sortBy: this.model.get('myTasks')?.sortBy, filter_taskType: this.model.get('myTasks')?.filter_taskType });
    this.mixin_setupListeners();

    const currentUser = sessionChannel.request('get:user') || null;
    const cachedUser = this.model.get('myTasks')?.filter_taskOwner;

    this.currentUserId = cachedUser ? cachedUser : currentUser && currentUser.id; 
    this.users = [];

    // Dual dashboard users see Arb + IO users in the list, since task page is agnostic to user
    if (currentUser && (currentUser.isArbitratorLead() || currentUser.get('dashboard_access'))) {
      this.users = [...this.users, ...userChannel.request('get:arbs', {queue_users: true})];
    }
    if (currentUser && (currentUser.isInformationOfficerLead() || currentUser.get('dashboard_access'))) {
      this.users = [...this.users, ...userChannel.request('get:ios', {queue_users: true})];
    }
    
    // Ensure queue users are at the top of the list
    const queueUsers = [];
    const nonQueueUsers = [];
    this.users.forEach(user => {
      if ((QUEUE_USER_NAMES || []).includes(user.getUsername())) queueUsers.push(user);
      else nonQueueUsers.push(user);
    });
    this.users = [...queueUsers, ...nonQueueUsers]

    if (!this.users.length && currentUser) this.users = [currentUser];
    
    this.createSubModels();
    this.setupListeners();
    this.mixin_performInitialTasksLoad();
  },

  setupListeners() {
    const validateWithOptionalVal = (model, value) => ($.trim(value) === "" || model.isValid());
    const validateWithRequiredVal = (model, value) => (value && model.isValid());
    const createValidateAndLoadFn = (validateFn) => {
      return (model, value) => {
        if (!validateFn(model, value)) return;
        this.loadTasksWithLoader({
          index: this.tasks.lastUsedFetchIndex || 0,
          count: this.tasks.lastUsedFetchCount || this.tasks.DEFAULT_API_COUNT || 20
        });
      };
    };

    this.listenTo(this.taskOwnerModel, 'change:value', createValidateAndLoadFn(validateWithRequiredVal));
    this.listenTo(this.taskOwnerModel, 'change:value', () => this.cacheTaskData());
    if (this.afterDateFilterModel) {
      this.listenTo(this.afterDateFilterModel, 'change:value', createValidateAndLoadFn(validateWithOptionalVal));
      this.listenTo(this.afterDateFilterModel, 'change:value', () => this.cacheTaskData());
    }
    if (this.activityTypeFilterModel) {
      this.listenTo(this.activityTypeFilterModel, 'change:value', createValidateAndLoadFn(validateWithOptionalVal));
      this.listenTo(this.activityTypeFilterModel, 'change:value', () => this.cacheTaskData());
    }
  },

  _getActivityTypes() {
    return taskChannel.request('task:optionData', { filtered: true, ui_filters: true });
  },

  createSubModels() {
    const cachedData = this.model.get('myTasks');

    const taskOwnerOptions = (this.users || []).map(user => ({ value: String(user.get('user_id')), text: user.getDisplayName() }) );
    this.taskOwnerModel = new DropdownModel({
      optionData: taskOwnerOptions,
      defaultBlank: false,
      required: true,
      value: this.currentUserId && _.findWhere(taskOwnerOptions, option => String(option.value) === String(this.currentUserId)) ?
        String(this.currentUserId) : null,
      disabled: this.users.length === 1 ? true : false
    });

    this.afterDateFilterModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: cachedData?.filter_afterDate ? Moment(cachedData?.filter_afterDate).format(InputModel.getDateFormat()) : null,
      required: false,
    });

    this.activityTypeFilterModel = new DropdownModel({
      optionData: this._getActivityTypes(),
      value: cachedData?.filter_activityType ? cachedData?.filter_activityType : null,
    });
  },

  // Add listeners for tasks to refresh
  onBeforeRender() {
    this.stopListening(this.tasks, 'change:task_status');
    this.listenTo(this.tasks, 'change:task_status', this.render, this);

    this.stopListening(this.tasks, 'assigned');
    this.listenTo(this.tasks, 'assigned', () => {
      this.loadTasksWithLoader({
        index: this.tasks.lastUsedFetchIndex || 0,
        count: this.tasks.lastUsedFetchCount || this.tasks.DEFAULT_API_COUNT || 20
      });
    });
  },

  onRender() {
    if (!this.tasks_loaded) {
      return;
    }

    this.renderTaskFilters();
    this.renderTasks();
    loaderChannel.trigger('page:load:complete');
  },

  renderTaskFilters() {
    this.showChildView('taskTypeFilter', new RadioView({ model: this.taskTypeFiltersModel }));
    this.showChildView('taskSortByFilter', new RadioView({ model: this.taskSortByFiltersModel, displayTitle: 'Sort by:' }));
    this.showChildView('taskOwnerRegion', new DropdownView({ model: this.taskOwnerModel }));
    this.showChildView('filterDateRegion', new InputView({ model: this.afterDateFilterModel }));
    this.showChildView('activityTypeFilterRegion', new DropdownView({ model: this.activityTypeFilterModel }));
  },

  renderTasks() {
    this.showChildView('taskList', new (TaskListView.extend({
      className: `${TaskListView.prototype.className} my-task-list-item`,
    }))({
      collection: this.tasks,
      filter: this.mixin_frontendTaskFilterFn.bind(this),
      showReassign: true,
      showFileNumber: true
    }));
  },

  templateContext() {
    return this.mixin_templateContext();
  }

});
