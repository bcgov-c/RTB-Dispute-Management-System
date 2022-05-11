import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import RadioIconView from '../../../../core/components/radio/RadioIcon';
import RadioModel from '../../../../core/components/radio/Radio_model';
import template from './ModalAssignTask_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const DEFAULT_TOP_TEXT = `Select the staff member that you want to assign this task to below.`;

const menuChannel = Radio.channel('menu');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');

export default ModalBaseView.extend({
  template,
  id: 'assignUser-modal',
  
  regions : {
    ownerGroupRegion: '.task-owner-region',
    usernameRegion: '.task-username-region',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-save',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'assignTaskWithStateCheck'
    });
  },

  assignTaskWithStateCheck() {
    // If no username change, just close the dropdown with no events triggered - no refresh needed
    if (this.usernameDropDownModel.getData({ parse: true }) === this.model.get('task_owner_id') && this.groupModel.getData({ parse: true }) === this.model.get('task_sub_type')) {
      this.close()
      return;
    }

    loaderChannel.trigger('page:load');
    const existingOwner = this.model.get('task_owner_id');
    this.model.fetch().done(() => {
      const taskOwner = this.model.get('task_owner_id');
      const hasOwnerChanged = taskOwner !== existingOwner;

      if (hasOwnerChanged) {
        this.showAlreadyAssignedMsg();
      } else {
        this.assignTask();
      }
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.TASK.LOAD', () => {
        this.trigger('save:complete');
        this.close();
      });
      handler(err);
    });
  },

  assignTask() {
    const previousOwnerId = this.model.get('task_owner_id');
    const selectedOwnerId = this.usernameDropDownModel.getData({ parse: true });
    this.model.set(Object.assign({
        task_owner_id: selectedOwnerId,
        task_sub_type: this.groupModel.getData()
      },
      this.completeTask ? { task_status: configChannel.request('get', 'TASK_STATUS_COMPLETE') } : {}
    ));

    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        if (!this.model.isComplete()) {
          if (previousOwnerId === this.currentUser.id) {
            menuChannel.trigger('add:to:item:count', ['my_tasks_item_io', 'my_tasks_item'], -1);
          } else if (selectedOwnerId === this.currentUser.id) {
            menuChannel.trigger('add:to:item:count', ['my_tasks_item_io', 'my_tasks_item'], 1);
          }
        }
        if (this.assignedToCurrentUser) {
          loaderChannel.trigger('page:load')
          Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), { trigger: true })
        }
        this.trigger('save:complete');
        this.close();
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.TASK.SAVE', () => {
          this.trigger('save:complete');
          this.close();
        })
      )
      .always(() => {
        if (!this.assignedToCurrentUser) loaderChannel.trigger('page:load:complete');
      });
  },

  showAlreadyAssignedMsg() {
    this.$el.hide();
    loaderChannel.trigger('page:load:complete');
    
    const modalView = modalChannel.request('show:standard', {
      title: 'Task Owner Updated',
      bodyHtml: `<p>This task has already been assigned to:</p>
      <p><ul><li>${userChannel.request('get:user:name', this.model.get('task_owner_id'))}</li></ul></p>
      <p>Press Continue to be returned to the previous view.  The view will be refreshed to display the updated values.</p>`,
      primaryButtonText: 'Continue',
      hideCancelButton: true,
      onContinueFn: _modalView => _modalView.close()
    });

    this.listenTo(modalView, 'removed:modal', () => {
      this.trigger('save:complete');
      this.close();
    });
  },

  initialize(options) {
    ModalBaseView.prototype.initialize.call(this, options);
    this.mergeOptions(options, ['topText', 'completeTask']);

    this.assignedToCurrentUser = false;
    this.currentUser = sessionChannel.request('get:user');
    this.USER_ROLE_GROUP_IO = configChannel.request('get', 'USER_ROLE_GROUP_IO');
    this.USER_ROLE_GROUP_ARB = configChannel.request('get', 'USER_ROLE_GROUP_ARB');

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    let configValueToUse = this.model.isUnassignedIO() ? 'USER_ROLE_GROUP_IO' : this.model.isUnassignedArb() ? 'USER_ROLE_GROUP_ARB' : null;
    if (!configValueToUse) {
      configValueToUse = this.model.getTaskOwnerRoleId() === this.USER_ROLE_GROUP_IO ? 'USER_ROLE_GROUP_IO' 
      : this.model.getTaskOwnerRoleId() === this.USER_ROLE_GROUP_ARB ? 'USER_ROLE_GROUP_ARB'
      : 'USER_ROLE_GROUP_ADMIN';
    }
    if (!configValueToUse) {
      console.log(`[Error] Invalid task passed to unassign modal.  Must be an unassigned task with sub-type IO or Arb.`);
      return;
    }

    const roleId = configValueToUse ? configChannel.request('get', configValueToUse) : null;
    const filteredUsers = userChannel.request('get:users:by:role', roleId);

    const isCurrentUser = this.currentUser.id === this.model.get('task_owner_id');

    this.groupModel = new RadioModel({
      optionData: this._getOwnerGroupIcons(),
      value: _.find(this._getOwnerGroupIcons(), option => option.value === this.model.get('task_sub_type')) ? this.model.get('task_sub_type') : configChannel.request('get', 'TASK_SUB_TYPE_IO'),
      apiMapping: 'task_sub_type'
    });

    const usernameOptionData = !_.isEmpty(filteredUsers) ? this._getUserOptionsFromAvailableRoleTypes() : [{value:-1, text: 'foo'}];
    this.usernameDropDownModel = new DropdownModel({
      labelText: 'Owner',
      errorMessage: 'Enter an owner',
      defaultBlank: true,
      required: true,
      optionData: usernameOptionData,
      value: this.model.get('task_owner_id') ? String(this.model.get('task_owner_id')) : null,
      apiMapping: 'task_owner_id',

      customLink: !isCurrentUser && _.find(this._getUserOptionsFromAvailableRoleTypes(true), option => String(option.value) === String(this.currentUser.id)) ? 'Assign to me' : null,
      customLinkFn: this.assignToMeCallBackHandler.bind(this),
    });
  },

  setupListeners() {
    this.listenTo(this.groupModel, 'change:value', function() {
      const optionData = this._getUserOptionsFromAvailableRoleTypes();
      this.usernameDropDownModel.set({
        value: (optionData && optionData.length === 1) ? optionData[0].value : null,
        disabled: (!optionData || !optionData.length),
        optionData,
        customLink: _.find(this._getUserOptionsFromAvailableRoleTypes(true), option => String(option.value) === String(this.currentUser.id)) ? 'Assign to me' : null
      });
      this.usernameDropDownModel.trigger('render');
    }, this);

    this.listenTo(this.usernameDropDownModel, 'change:value', (model, value) => {
      if (value === String(this.currentUser.id) && !this.model.isAssigned()) {
        this.usernameDropDownModel.set({ 
          customLink: null,
        })
        this.assignedToCurrentUser = true;
      } else {
        this.usernameDropDownModel.set({ 
          customLink: value !== String(this.currentUser.id) && _.find(this._getUserOptionsFromAvailableRoleTypes(true), option => String(option.value) === String(this.currentUser.id)) ? 'Assign to me' : null,
        })
        this.assignedToCurrentUser = false;
      }
      
      this.render();
    })
  },

  _getUserOptionsFromAvailableRoleTypes(searchAllRoles=false) {
    const selectedRoleType = this.groupModel.getData();
    const roleTypes = selectedRoleType && !searchAllRoles ? [selectedRoleType] : _.pluck(this.groupModel.get('optionData') || [], 'value');
    
    let userOptions = [];
    (roleTypes || []).forEach(roleType => {
      const options = {queue_users: true};
      const users = userChannel.request('get:users:by:role', roleType, options) || [];
      userOptions = [...userOptions, ...this._toUserOptions(users)];
    });

    return userOptions;
  },

  _getOwnerGroupIcons() {
    return [
      { iconClass: 'task-type-io', value: configChannel.request('get', 'TASK_SUB_TYPE_IO') },
      { iconClass: 'task-type-arb', value: configChannel.request('get', 'TASK_SUB_TYPE_ARB') },
      { iconClass: 'task-type-admin', value: configChannel.request('get', 'TASK_SUB_TYPE_ADMIN') },
    ];
  },

  assignToMeCallBackHandler() {
    if (!this.currentUser) return;
    
    this.groupModel.set({ value: this.currentUser.getRoleId() });

    const filteredUsers = userChannel.request('get:users:by:role', this.currentUser.getRoleId());
    this.usernameDropDownModel.set({
      value: String(this.currentUser.id),
      disabled: (!filteredUsers || !filteredUsers.length),
      optionData: filteredUsers && filteredUsers.length ? this._toUserOptions(filteredUsers) : []
    });

    this.assignedToCurrentUser = true;

    this.usernameDropDownModel.trigger('render');
    this.getChildView('ownerGroupRegion').render();
  },

  _toUserOptions(users) {
    return _.sortBy(
      _.map(users, user => ({ value: String(user.get('user_id')), text: user.getDisplayName() })),
      userOption => $.trim(userOption.text).toLowerCase()
    );
  },

  onRender() {
    this.showChildView('ownerGroupRegion', new RadioIconView({ isSingleViewMode: true, model: this.groupModel }));
    this.showChildView('usernameRegion', new DropdownView({ model: this.usernameDropDownModel }));
  },

  templateContext() {
    const TASK_TYPE_DISPLAY = configChannel.request('get', 'TASK_TYPE_DISPLAY');
    const taskType = this.model.get('task_type');
    return {
      topText: this.topText || DEFAULT_TOP_TEXT,
      typeDisplay: _.has(TASK_TYPE_DISPLAY, taskType) ? TASK_TYPE_DISPLAY[taskType] : '-',
      subTypeDisplay: this.model.getSubTypeDisplay(),
      isSubTypeArb: this.model.isSubTypeArb(),
      assignToMeClicked: this.assignedToCurrentUser
    };
  }
});
