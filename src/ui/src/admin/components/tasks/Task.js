import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import RadioIconView from '../../../core/components/radio/RadioIcon';
import RadioModel from '../../../core/components/radio/Radio_model';
import template from './Task_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const DROPDOWN_ASSIGNED_CODE = '1';
const DROPDOWN_UNASSIGNED_CODE = '2';

const menuChannel = Radio.channel('menu');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');
const taskChannel = Radio.channel('tasks');

export default Marionette.View.extend({
  template,
  className: 'tasks-edit-page',

  ui: {
    add: '.btn-add',
    cancel: '.btn-cancel',
    edoLink: '.eod-link',
    oneDayLink: '.one-day-link',
    threeDayLink: '.three-day-link',
    oneWeekLink: '.one-week-link',
  },

  regions: {
    descriptionRegion: '.task-description-region',
    typeRegion: '.task-type-region',
    subTypeRegion: '.task-sub-type-region',
    ownerRegion: '.task-owner-region',
    usernameRegion: '.task-username-region',
    dateRegion: '.task-date-region',
    timeRegion: '.task-time-region',
    priorityRegion: '.priority-region',
    activityTypeFilterRegion: '.add-tasks-activity-types-filter',
  },

  events: {
    'click @ui.cancel': 'cancelTask',
    'click @ui.add': 'addTask',
    'click @ui.edoLink' : 'handleEodClick',
    'click @ui.oneDayLink' : 'handle1DClick',
    'click @ui.threeDayLink' : 'handle3DClick',
    'click @ui.oneWeekLink' : 'handle1WClick'
  },

  _handleLinkClick(e, date) {
    e.preventDefault();
    date.setHours(16);
    date.setMinutes(0);
    this.renderCompletionDateFromDate(date);
  },

  handleEodClick(e) {
    this._handleLinkClick(e, new Date());
  },

  handle1DClick(e) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    this._handleLinkClick(e, date);
  },

  handle3DClick(e) {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    this._handleLinkClick(e, date);
  },


  handle1WClick(e) {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    this._handleLinkClick(e, date);
  },

  validateAndShowErrors() {
    let is_valid = true;
    
    // Only validate the completion date if the task is still open
    _.each( _.union(this.defaultValidateGroup, this.model.isComplete() ? [] : this.timeValidateGroup ), function(componentName) {
      const component = this.getChildView(componentName);
      if (component) {
        is_valid = component.validateAndShowErrors() && is_valid;
      }
    }, this);

    return is_valid;
  },

  addTask() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    // Add completion due date and task priority
    const dueDate = Moment(`${this.dateModel.getData({ format: 'date' })}T${this.timeModel.getData({ iso: true })}`).toISOString();
    const addTaskModels = [ this.textareaModel, this.usernameDropDownModel, this.activityTypeFilterModel, this.typeModel.getData() === DROPDOWN_ASSIGNED_CODE ? this.ownerDropDownModel : this.subTypeModel];
    
    _.each(addTaskModels, function(model) {
      this.model.set(model.getPageApiDataAttrs(), { silent: true });
    }, this);

    this.model.set(_.extend({
        task_due_date: dueDate,
      },
      this.priorityModel.getPageApiDataAttrs()
     ), { silent: true });

    this.model.set({ task_type: configChannel.request('get', 'TASK_TYPE_STANDARD') }, { silent: true });

    const loggedInUserId = this.currentUser && this.currentUser.id;
    const wasAssignedToCurrentUserNowUnassiged = loggedInUserId
      && loggedInUserId === this.model.getApiSavedAttr('task_owner_id')
      && loggedInUserId !== this.model.get('task_owner_id');
    
    const isNowAssignedToCurrentUser = loggedInUserId
      && loggedInUserId !== this.model.getApiSavedAttr('task_owner_id')
      && loggedInUserId === this.model.get('task_owner_id');
    
    const wasCompleted = this.model.getApiSavedAttr('task_status') === configChannel.request('get', 'TASK_STATUS_COMPLETE');
    const isNowIncomplete = !this.model.isComplete();

    const tasksMenuItems = ['my_tasks_item_io', 'my_tasks_item'];
    loaderChannel.trigger('page:load');
    
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        // Add task count when assigning, but only if we were complete and now incomplete, or we were assigned to someone else and now current user
        if (loggedInUserId === this.model.get('task_owner_id') && (isNowAssignedToCurrentUser || wasCompleted) && isNowIncomplete) {
          menuChannel.trigger('add:to:item:count', tasksMenuItems, 1);
        } else if (wasAssignedToCurrentUserNowUnassiged || (!wasCompleted && !isNowIncomplete)) {
          menuChannel.trigger('add:to:item:count', tasksMenuItems, -1);
        }
        
        this.model.trigger('save:complete');
      })
      .fail(generalErrorFactory.createHandler('ADMIN.TASK.SAVE'))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  cancelTask() {
    this.model.trigger('task:cancel');
  },

  assignToMeCallBackHandler() {
    if (!this.currentUser) {
      return;
    }
    this.ownerDropDownModel.set('value', this.currentUser.getRoleId());
  
    const filteredUsers = userChannel.request('get:users:by:role', this.currentUser.getRoleId());
    this.usernameDropDownModel.set({
      value: this.currentUser.id,
      disabled: (!filteredUsers || !filteredUsers.length),
      optionData: filteredUsers && filteredUsers.length ? this._toUserOptions(filteredUsers) : []
    });

    this.getChildView('usernameRegion').render();
    this.getChildView('ownerRegion').render();
  },

  initialize(options) {
    this.mergeOptions(options, ['currentUser', 'addText']);

    this.currentUser = sessionChannel.request('get:user');
    this.TASK_PRIORITY_UNSET = configChannel.request('get', 'TASK_PRIORITY_UNSET');
    this.TASK_PRIORITY_LOW = configChannel.request('get', 'TASK_PRIORITY_LOW');
    this.TASK_PRIORITY_NORMAL = configChannel.request('get', 'TASK_PRIORITY_NORMAL');
    this.TASK_PRIORITY_HIGH = configChannel.request('get', 'TASK_PRIORITY_HIGH');
    this.TASK_SUB_TYPE_IO = configChannel.request('get', 'TASK_SUB_TYPE_IO');
    this.TASK_SUB_TYPE_ARB = configChannel.request('get', 'TASK_SUB_TYPE_ARB');
    this.TASK_SUB_TYPE_ADMIN = configChannel.request('get', 'TASK_SUB_TYPE_ADMIN');
    
    this.defaultValidateGroup = ['descriptionRegion', 'typeRegion', 'subTypeRegion', 'ownerRegion', 'usernameRegion'];
    this.timeValidateGroup = ['dateRegion', 'timeRegion'];
    
    this.createSubModels();
    this.setupListeners();
  },

  _isTaskTypeAssignedSelected() {
    return String(this.typeModel.getData()) === DROPDOWN_ASSIGNED_CODE;
  },

  _isTaskTypeUnassignedSelected() {
    return String(this.typeModel.getData()) === DROPDOWN_UNASSIGNED_CODE;
  },

  _getPriorityIcons() {
    return [
      { iconClass: 'task-priority-none', value: this.TASK_PRIORITY_UNSET },
      { iconClass: 'task-priority-low', value: this.TASK_PRIORITY_LOW },
      { iconClass: 'task-priority-medium', value: this.TASK_PRIORITY_NORMAL },
      { iconClass: 'task-priority-high', value: this.TASK_PRIORITY_HIGH }];
  },

  _getActivityTypes() {
    return taskChannel.request('task:optionData');
  },

  _getSubTypeOptions() {
    const USER_ROLE_GROUP_TASK_MAPPINGS = configChannel.request('get', 'USER_ROLE_GROUP_TASK_MAPPINGS') || {};
    return Object.entries(USER_ROLE_GROUP_TASK_MAPPINGS).map( ([value, text]) => ({ value, text }) );
  },

  createSubModels() {
    this.textareaModel = new TextareaModel({
      labelText: 'Description',
      required: true,
      errorMessage: 'Enter the description',
      countdown: true,
      min: configChannel.request('get', 'TASK_DESCRIPTION_MIN_LENGTH'),
      max: configChannel.request('get', 'TASK_DESCRIPTION_MAX_LENGTH'),
      value: this.model.get('task_text'),
      apiMapping: 'task_text'
    });

    this.typeModel = new DropdownModel({
      optionData: [{ value: DROPDOWN_ASSIGNED_CODE, text: 'Assigned' }, { value: DROPDOWN_UNASSIGNED_CODE, text: 'Unassigned' }],
      labelText: 'Assignment',
      defaultBlank: true,
      errorMessage: 'Required',
      required: true,
      value: this.model.get('task_owner_id') ? DROPDOWN_ASSIGNED_CODE :
        this.model.get('task_sub_type') ? DROPDOWN_UNASSIGNED_CODE : null,
    });

    this.subTypeModel = new DropdownModel({
      optionData: this._getSubTypeOptions(),
      labelText: 'Sub Type',
      defaultBlank: true,
      required: this._isTaskTypeUnassignedSelected(),
      value: this.model.get('task_sub_type') ? String(this.model.get('task_sub_type')) : null,
      apiMapping: 'task_sub_type'
    });

    const isTaskTypeAssignedSelected = this._isTaskTypeAssignedSelected();
    const ownerUserModel = this.model.get('task_owner_id') && userChannel.request('get:user', this.model.get('task_owner_id'));
    this.ownerDropDownModel = new DropdownModel({
      labelText: 'Owner Group',
      errorMessage: 'Enter an owner',
      required: isTaskTypeAssignedSelected,
      optionData: this._getSubTypeOptions(),
      value: ownerUserModel ? String(ownerUserModel.getRoleId()) : null,
      defaultBlank: true,
      apiMapping: 'task_sub_type'
    });

    const userOptions = this._getUserOptionsFromAvailableRoleTypes();
    this.usernameDropDownModel = new DropdownModel({
      labelText: 'Owner',
      errorMessage: 'Enter an owner',
      defaultBlank: true,
      required: isTaskTypeAssignedSelected,
      optionData: userOptions,
      disabled: this.currentUser ? false : true,
      value: this.model.get('task_owner_id'),
      apiMapping: 'task_owner_id',
      customLink: this.currentUser && _.find(this._getUserOptionsFromAvailableRoleTypes(true), option => String(option.value) === String(this.currentUser.id)) ? 'Assign to me' : null,
      customLinkFn: this.assignToMeCallBackHandler.bind(this),
    });

    this.dateModel = new InputModel({
      inputType: 'date',
      labelText: 'Due Date',
      required: true,
      errorMessage: 'Enter a date',
      allowFutureDate: true,
      minDate: Moment()
    });

    this.timeModel = new InputModel({
      inputType: 'time',
      labelText: ' ',
      errorMessage: 'Enter a time',
      required: true
    });

    const priorityIcons = this._getPriorityIcons();
    this.priorityModel = new RadioModel({
      label: 'Owner Group',
      optionData: priorityIcons,
      value: _.find(priorityIcons, option => option.value === this.model.get('task_priority')) ? this.model.get('task_priority') : this.TASK_PRIORITY_UNSET,
      apiMapping: 'task_priority'
    })

    this.activityTypeFilterModel = new DropdownModel({
      optionData: this._getActivityTypes(),
      defaultBlank: true,
      value: this.model.get('task_activity_type') ? String(this.model.get('task_activity_type')) : null,
      labelText: 'Activity Type',
      cssClass: 'optional-input',
      apiMapping: 'task_activity_type'
    });
  },

  _toUserOptions(users) {
    return _.sortBy(
      _.map(users, user => ({ value: user.get('user_id'), text: user.getDisplayName() })),
      userOption => $.trim(userOption.text).toLowerCase()
    );
  },

  _getUserOptionsFromAvailableRoleTypes(searchAllRoles=false) {
    const selectedRoleType = this.ownerDropDownModel.getData();
    const roleTypes = selectedRoleType && !searchAllRoles ? [selectedRoleType] : _.pluck(this.ownerDropDownModel.get('optionData') || [], 'value');

    let userOptions = [];
    (roleTypes || []).forEach(roleType => {
      const options = {queue_users: true};
      const users = userChannel.request('get:users:by:role', roleType, options) || [];
      userOptions = [...userOptions, ...this._toUserOptions(users)];
    });

    return userOptions;
  },

  setupListeners() {
    this.listenTo(this.typeModel, 'change:value', function(model, value) {
      const isAssigned = value === DROPDOWN_ASSIGNED_CODE;
      const setOptions = { silent: true };

      this.ownerDropDownModel.set(_.extend({
          required: isAssigned,
        }, isAssigned ? {} : { value: null }
      ), setOptions);
      
      const optionData = this._getUserOptionsFromAvailableRoleTypes();
      this.usernameDropDownModel.set(_.extend({
          required: isAssigned,
          optionData
        }, isAssigned ? {} : { value: null }
      ), setOptions);

      this.subTypeModel.set(_.extend({
          required: !isAssigned,
        }, isAssigned ? { value: null } : {}
      ), setOptions);

      this.render();
    }, this);


    this.listenTo(this.ownerDropDownModel, 'change:value', function() {
      const optionData = this._getUserOptionsFromAvailableRoleTypes();
      this.usernameDropDownModel.set({
        value: (optionData && optionData.length === 1) ? optionData[0].value : null,
        disabled: (!optionData || !optionData.length),
        optionData,
        customLink: this.currentUser && _.find(this._getUserOptionsFromAvailableRoleTypes(true), option => String(option.value) === String(this.currentUser.id)) ? 'Assign to me' : null
      });
      this.getChildView('usernameRegion').render();
    }, this);
   },

  onRender() {
    this.showChildView('descriptionRegion', new TextareaView({ model: this.textareaModel }));
    this.showChildView('typeRegion', new DropdownView({ model: this.typeModel }));
    this.showChildView('subTypeRegion', new DropdownView({ model: this.subTypeModel }));
    this.showChildView('ownerRegion', new DropdownView({ model: this.ownerDropDownModel }));
    this.showChildView('usernameRegion', new DropdownView({ model: this.usernameDropDownModel }));
    this.showChildView('activityTypeFilterRegion', new DropdownView({ model: this.activityTypeFilterModel }));

    this.renderCompletionDateFromDate(this.model.get('task_due_date') ? this.model.get('task_due_date') : null);


    this.showChildView('priorityRegion', new RadioIconView({ isSingleViewMode: true, model: this.priorityModel }));
  },

  renderCompletionDateFromDate(date) {
    date = date ? Moment(date) : null;

    if (date && date.isValid()) {
      this.dateModel.set('value', Moment(date).format(InputModel.getDateFormat()));
      this.timeModel.set('value', Moment(date).format(InputModel.getTimeFormat()));
    }

    this.showChildView('dateRegion', new InputView({ model: this.dateModel }));
    this.showChildView('timeRegion', new InputView({ model: this.timeModel }));
  },

  templateContext() {
    return {
      isAssigned: this._isTaskTypeAssignedSelected(),
      isUnassigned: this._isTaskTypeUnassignedSelected(),
      addText: this.addText ? this.addText : null
    };
  }

});
