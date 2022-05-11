import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import ModalViewEmail from '../../components/modals/modal-view-email/ModalViewEmail';
import ModalEditTask from './modals/ModalEditTask';
import ModalAssignTask from './modals/ModalAssignTask';
import { routeParse } from '../../routers/mainview_router';
import AdminTimeIcon from '../../static/Icon_AdminHistory_Pending.png';
import ErrorIcon from '../../static/Icon_Alert_SML.png'
import AdminLateTimeIcon from '../../static/Icon_TaskLate.png';
import template from './TaskListItem_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const NO_OWNER_TASK_COMPLETE_HTML = `Tasks can only be completed that have an owner.  Select the staff member that you want to assign this task to below.`;

const sessionChannel = Radio.channel('session');
const menuChannel = Radio.channel('menu');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const searchChannel = Radio.channel('searches');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');
const userChannel = Radio.channel('users');
const emailsChannel = Radio.channel('emails');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item',

  regions: {
    checkboxRegion: '.task-complete-checkbox'
  },

  ui: {
    fileNumber: '.task-file-number > span',
    assignLink: '.task-owner-column-assign-link',
    editTask: '.view-edit-task',
    viewEmail: '.task-view-email-link'
  },

  events: {
    'click @ui.fileNumber': 'clickSearchFileNumber',
    'click @ui.assignLink': 'clickAssign',
    'click @ui.editTask': 'clickEditTask',
    'click @ui.viewEmail': 'clickViewEmail'
  },

  clickEditTask(e) {
    e.preventDefault();
    const modalEditTask = new ModalEditTask({ model: this.model });
    this.listenTo(this.model, 'save:complete', this.render, this);
    modalChannel.request('add', modalEditTask);
  },

  clickAssign() {
    this._showAssignModal();
  },

  clickViewEmail() {
    const disputeGuid = this.model.get('dispute_guid');
    loaderChannel.trigger('page:load');
    emailsChannel.request('load', disputeGuid).done(() => {
      loaderChannel.trigger('page:load:complete');
      const email = emailsChannel.request('get:email:by:id', this.model.get('task_link_id'));
      const modalViewToAdd = new ModalViewEmail({ emailModel: email });
      modalChannel.request('add', modalViewToAdd);
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.EMAIL.LOAD');
      handler(err);
    });
  },

  clickSearchFileNumber() {
    loaderChannel.trigger('page:load');
    searchChannel.request('search:dispute:direct', this.model.get('file_number'))
      .done(disputeGuid => {
        if (!disputeGuid) {
          loaderChannel.trigger('page:load:complete');
          generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')({ status: 400 });
        } else {
          this.routeBasedOnTaskType(disputeGuid);
        }
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
      });
  },

  routeBasedOnTaskType(disputeGuid) {
    const ccrActivityTypes = configChannel.request('get','CCR_TASK_ACTIVITY_TYPES');

    if (ccrActivityTypes.includes(this.model.get('task_activity_type'))) {
      return Backbone.history.navigate(routeParse('document_item', disputeGuid), { trigger: true });
    } else if (configChannel.request('get','TASK_ACTIVITY_TYPE_OS_AMENDMENT') === this.model.get('task_activity_type')) {
      return Backbone.history.navigate(routeParse('notice_item', disputeGuid), { trigger: true });
    } else {
      return Backbone.history.navigate(routeParse('overview_item', disputeGuid), { trigger: true });
    }
  },

  _showAssignModal(topText, completeTask=false) {
    const modalAssignTask = new ModalAssignTask({
      topText,
      completeTask,
      model: this.model
    });

    this.listenTo(modalAssignTask, 'save:complete', function() {
      this.model.trigger('assigned');
      this.render();
    }, this);
    
    modalChannel.request('add', modalAssignTask);
  },

  _getCreatedByUser() {
    const userModel = userChannel.request('get:user', this.model.get('created_by'));
    return ` - ${!userModel || userModel.isOfficeUser() ? 'System' : Formatter.toUserDisplay(this.model.get('created_by'))}`;
  },

  _isIOLead() {
    const currentUser = sessionChannel.request('get:user') || null;
    return currentUser.isInformationOfficerLead()
  },

  showViewEmailLink() {
    const emailTaskLinkValue = configChannel.request('get', 'TASK_LINK_EMAIL');
    if (this.model.get('task_link_id') && this.model.get('task_linked_to') === emailTaskLinkValue) return true;

    return false;
  },

  _getPastDueDateTime() {
    const dueDate = this.model.get('task_due_date');
    const currentDate = Moment();
    if (!dueDate) return;

    const dateDifference = Moment(dueDate).diff(currentDate, 'seconds');
    const isLate = dateDifference < 0 ? true : false;
    const options = { no_minutes: true };
    
    const timeDifference = Formatter.toDurationFromSecs(Math.abs(dateDifference), options);

    return isLate ? `Late -${timeDifference}` :  `${timeDifference}`;
  },

  initialize(options) {
    this.mergeOptions(options, ['showTaskComplete', 'showReassign', 'showEditTask', 'showFileNumber']);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.checkboxModel = new CheckboxModel({ checked: this.model.isComplete() ? true : false });
  },

  setupListeners() {
    this.listenTo(this.checkboxModel, 'change:checked', function(checkboxModel, isChecked) {
      const wasComplete = this.model.isComplete();
      if (!this.model.isAssigned() && !wasComplete && isChecked) {
        // Cannot complete if it is unassigned
        // Show assign modal instead, THEN complete

        this._showAssignModal(NO_OWNER_TASK_COMPLETE_HTML, true);

        checkboxModel.set('checked', false, { silent: true });
        checkboxModel.trigger('render');
        return;
      }

      loaderChannel.trigger('page:load');
      this.model.save({ task_status: configChannel.request('get', wasComplete ? 'TASK_STATUS_INCOMPLETE' : 'TASK_STATUS_COMPLETE') })
        .done(() => {
          const tasksMenuItems = ['my_tasks_item_io', 'my_tasks_item'];
          if (sessionChannel.request('get:user:id') === this.model.get('task_owner_id')) {
            menuChannel.trigger('add:to:item:count', tasksMenuItems, wasComplete ? 1 : -1);
          }
        })
        .fail(generalErrorFactory.createHandler('ADMIN.TASK.SAVE'))
        .always(() => loaderChannel.trigger('page:load:complete'));
    }, this);
  },

  onRender() {
    if (this.showTaskComplete) return;
    this.showChildView('checkboxRegion',  new CheckboxView({ model: this.checkboxModel }));
  },

  templateContext() {
    const taskDueDate = this.model.get('task_due_date');
    const completedDate = this.model.get('date_task_completed');
    const creationDate = this.model.get('created_date') ? Formatter.toDateAndTimeDisplay(this.model.get('created_date')) : null;
    const createdBy = this._getCreatedByUser();
    const activityType = this.model.getActivityTypeDisplay() || '-';
    const previousOwner = Formatter.toUserDisplay(this.model.get('last_owner_id')) || '-'
    const timeInQueue = this.model.getTaskQueueTimeDisplay();
    const timeToComplete = this.model.getTimeToCompleteDisplay();
    const showViewEmailLink = this.showViewEmailLink();
    const pastDueDateTime = this._getPastDueDateTime();
    const isIOLead = this._isIOLead();
 
    let isPassedDate;
    if (!taskDueDate) {
      isPassedDate = false;
    } else if (completedDate) {
      isPassedDate = Moment(completedDate).isAfter(taskDueDate, 'minutes');
    } else {
      isPassedDate = Moment().isAfter(taskDueDate, 'minutes');
    }

    return {
      Formatter,
      isPassedDate,
      isUnassignedIO: this.model.isUnassignedIO(),
      isUnassignedArb: this.model.isUnassignedArb(),
      isUnassignedAdmin: this.model.isUnassignedAdmin(),
      isTaskOwnerIO: this.model.isTaskOwnerIO(),
      isTaskOwnerArb: this.model.isTaskOwnerArb(),
      isSubTypeArb: this.model.isSubTypeArb(),
      isComplete: this.model.isComplete(),
      isStandard: this.model.isStandard(),
      isCommunication: this.model.isCommunication(),
      isSystem: this.model.isSystem(),
      isPriorityLow: this.model.isPriorityLow(),
      isPriorityNormal: this.model.isPriorityNormal(),
      isPriorityHigh: this.model.isPriorityHigh(),
      taskTypeText: this.model.get('task_sub_type') ? configChannel.request('get', 'USER_ROLE_GROUP_TASK_MAPPINGS')[this.model.get('task_sub_type')] : null,
      isIOLead,
      showTaskComplete: this.showTaskComplete,
      showReassign: this.showReassign && !this.model.isComplete(),
      showEditTask: this.showEditTask,
      showFileNumber: this.showFileNumber,
      showSpacer: this.model.isComplete() ? null : `&nbsp;-&nbsp;`,
      creationDate,
      createdBy,
      previousOwner,
      activityType,
      timeInQueue,
      timeToComplete,
      showViewEmailLink,
      pastDueDateTime,
      AdminTimeIcon,
      ErrorIcon,
      AdminLateTimeIcon,
    };
  }
});