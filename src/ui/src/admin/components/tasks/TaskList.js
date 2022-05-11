import Marionette from 'backbone.marionette';
import TaskListItemView from './TaskListItem';
import template from './TaskList_template.tpl';

const EmptyTaskItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">There are no tasks to display</div>`)
});

const TaskListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: TaskListItemView,
  emptyView: EmptyTaskItemView,
  childViewOptions() {
    return {
      showTaskComplete: this.options.showTaskComplete,
      showReassign: this.options.showReassign,
      showEditTask: this.options.showEditTask,
      showFileNumber: this.options.showFileNumber
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['showTaskComplete', 'showReassign', 'showEditTask', 'showFileNumber']);
  },
});

export default Marionette.View.extend({
  template,
  className: 'standard-list task-list-item',

  regions: {
    taskList: '.standard-list-items'
  },

  initialize(options) {
    this.mergeOptions(options, ['showTaskComplete', 'showReassign', 'showFileNumber']);
    this.options = _.extend({}, this.options, options);
  },

  checkForEmptyModels() {//fix for empty model creation on edit
    this.collection.forEach((model) => {
      if (model.isNew()) {
        this.collection.remove(model);
      }
    });
  },

  onRender() {
    this.checkForEmptyModels();
    this.showChildView('taskList', new TaskListView(_.extend({ collection: this.collection }, this.options)));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.length,
      showTaskComplete: this.showTaskComplete,
      showFileNumber: this.showFileNumber
    };
  }
});