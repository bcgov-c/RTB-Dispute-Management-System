import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import TasksDisplayBaseView from './TasksDisplayBase';
import RadioView from '../../../core/components/radio/Radio';
import TaskModel from '../../../core/components/tasks/Task_model';
import TaskListView from '../../components/tasks/TaskList';
import TaskView from '../../components/tasks/Task';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './TasksPage_template.tpl';

const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const taskChannel = Radio.channel('tasks');
const menuChannel = Radio.channel('menu');

export default TasksDisplayBaseView.extend({
  template,
  className: `${PageView.prototype.className} tasks-page`,

  ui() {
    return Object.assign({ 
      completenessCheck: '.header-completeness-icon',
      quickAccess: '.header-quickaccess-icon'
    }, TasksDisplayBaseView.prototype.ui);
  },

  events() {
    return Object.assign({
      'click @ui.completenessCheck': 'completenessCheck',
      'click @ui.quickAccess': 'clickQuickAccess'
    }, TasksDisplayBaseView.prototype.events);
  },

  regions() {
    return Object.assign({}, TasksDisplayBaseView.prototype.regions, {
      disputeFlags: '.dispute-flags',
      taskEditRegion: '.task-edit-container'
    });
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickRefresh() {
    this.model.triggerPageRefresh();
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), {trigger: true});
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
    this.model.set({ sessionSettings: { 
      ...this.model.get('sessionSettings'), 
      taskPage: {
        filter_taskType: this.taskTypeFiltersModel.getData(),
        sortBy: this.taskSortByFiltersModel.getData(),
      } 
    }});
  },

  addNewTask() {
    this.tasks.add(this.newTaskModel);
    this.initializeNewTaskModel();
    this.render();
  },

  cancelTask() {
    this.initializeNewTaskModel();
    this.render();
  },

  initializeNewTaskModel() {
    this.newTaskModel = new TaskModel();
    this.listenTo(this.newTaskModel, 'task:cancel', this.cancelTask, this);
    this.listenTo(this.newTaskModel, 'save:complete', this.addNewTask, this);
  },

  initialize() {
    this.mixin_initializeTaskDisplayData();
    this.mixin_createSubModels();
    this.mixin_setCachedTaskData({filter_taskType: this.model.get('sessionSettings')?.taskPage?.filter_taskType, sortBy: this.model.get('sessionSettings')?.taskPage?.sortBy});
    this.mixin_setupListeners();

    this.initializeNewTaskModel();
    
    this.mixin_performInitialTasksLoad();

    this.loadTasksWithLoader({
      index: 0,
      count: this.tasks.lastUsedFetchCount || 20
    });
  },

  loadTasksWithLoader() {
    loaderChannel.trigger('page:load');
    return this.loadTasks(...arguments);
  },

  loadTasks(searchParams, onCompleteFn) {
    const dispute_guid = disputeChannel.request('get:id');
    
    searchParams = this.mixin_parseSearchParamsFromPage(searchParams);
    this.tasks_loaded = false;

    taskChannel.request('load', dispute_guid, searchParams)
      .done(disputeTasksCollection => {
        loaderChannel.trigger('page:load:complete');
        this.tasks = disputeTasksCollection;
        this.tasks_loaded = true;

        if (_.isFunction(onCompleteFn)) {
          onCompleteFn();
        } else {
          // If no special action, just re-render
          this.render();
        }
      }).fail(generalErrorFactory.createHandler('ADMIN.TASKS.LOAD', () => {
        if (_.isFunction(onCompleteFn)) {
          onCompleteFn();
        } else {
          // If no special action, just re-render
          this.render();
        }
      }))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  onBeforeRender() {
    // Don't perform an API reload here, just toggle UI elements
    this.stopListening(this.tasks, 'change:task_status');
    this.listenTo(this.tasks, 'change:task_status', this.render, this);
  },

  onRender() {
    if (!this.tasks_loaded) {
      return;
    }
    const dispute = disputeChannel.request('get');
    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${dispute.get('file_number')}: Task Page`
    }));
    this.showChildView('disputeFlags', new DisputeFlags());
    
    this.renderTaskFilters();
    this.renderTasks();
    loaderChannel.trigger('page:load:complete');
  },

  renderTaskFilters() {
    this.showChildView('taskTypeFilter', new RadioView({ model: this.taskTypeFiltersModel }));
    this.showChildView('taskSortByFilter', new RadioView({ model: this.taskSortByFiltersModel, displayTitle: 'Sort by:' }));
    this.showChildView('taskEditRegion', new TaskView({ model: this.newTaskModel }));
  },

  renderTasks() {
    this.showChildView('taskList', new TaskListView({
      collection: this.tasks,
      filter: this.mixin_frontendTaskFilterFn.bind(this),
      showEditTask: true,
      showFileNumber: false,
      showReassign: true,
    }));
  },

  templateContext() {
    return Object.assign({ enableQuickAccess: isQuickAccessEnabled(this.model) }, this.mixin_templateContext());
  }
});
