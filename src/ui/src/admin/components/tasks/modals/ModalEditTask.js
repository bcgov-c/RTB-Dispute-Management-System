import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import TaskView from '../Task';
import template from './ModalEditTask_template.tpl';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users'); 
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'editTask-modal',

  regions : {
    taskEditRegion: '.task-edit-container'    
  },

  initialize() {
    this.listenTo(this.model, 'task:cancel', this.close, this);
    this.listenTo(this.model, 'save:complete', this.close, this);
  },
  
  onRender() {
    this.showChildView('taskEditRegion', new TaskView({
      model: this.model,
      currentUser: userChannel.request('get:user', this.model.get('task_owner_id')),
      addText: 'Update Task'
    }));
  },

  templateContext() {
    const TASK_STATUS_DISPLAY = configChannel.request('get', 'TASK_STATUS_DISPLAY');
    const TASK_TYPE_DISPLAY = configChannel.request('get', 'TASK_TYPE_DISPLAY');
    const task_type = this.model.get('task_type');
    const task_status = this.model.get('task_status');

    return {
      Formatter,
      taskTypeDisplay: _.has(TASK_TYPE_DISPLAY, task_type) ? TASK_TYPE_DISPLAY[task_type] : task_type,
      taskStatusDisplay: _.has(TASK_STATUS_DISPLAY, task_status) ? TASK_STATUS_DISPLAY[task_status] : task_status,
      createdBy: userChannel.request('get:user:name', this.model.get('created_by')),
      modifiedBy: userChannel.request('get:user:name', this.model.get('modified_by'))
    };
  }
});
