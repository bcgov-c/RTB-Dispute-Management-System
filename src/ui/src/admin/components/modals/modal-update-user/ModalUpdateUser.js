import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import TextareaView from '../../../../core/components/textarea/Textarea';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import ModalReportViewer from '../../reports/ModalReportViewer';
import NoThumbnailIcon from '../../../static/NoThumbnail.png';
import { SYSTEM_USER_NAMES } from '../../../../core/components/user/UserManager';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import template from './ModalUpdateUser_template.tpl';
import '../admin-update-user.css';

const DROPDOWN_YES_CODE = '1';
const DROPDOWN_NO_CODE = '0';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');
const reportsChannel = Radio.channel('reports');

export default ModalBaseView.extend({
  template,
  id: 'editUser-modal',
  regions : {
    userActiveRegion: '.user-is-active-checkbox',
    displayNameRegion : '.display-name-input',
    usernameRegion: '.username-input',
    roleGroupRegion: '.role-group',
    subRoleGroupRegion: '.role-sub-group',
    emailAddressRegion: '.email-address',
    mobilePhoneRegion: '.mobile-phone',
    adminAccessRegion: '.admin-access',
    schedulerRegion: '.user-update-modal-scheduler',
    engagementTypeRegion: '.engagement-type',
    managerTypeRegion: '.manager-type',
    managerSubTypeRegion: '.manager-sub-type',
    managerRegion: '.manager',
    scheduleManagerRegion: '.schedule-manager',
    schedulingRulesRegion:'.scheduling-rules',
    dashboardAccessRegion: '.dashboard-access',
    specialAccessRegion: '.ceu-access',
    adminNoteRegion: '.admin-note'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-update',
      activeToggle: '.user-is-active-checkbox'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave',
      'click @ui.activeToggle': 'openSearchModel'
    });
  },

  clickSave() {
    let is_valid = true;
    _.each(this.views_to_validate, function(v) {
      is_valid = this.getChildView(v).validateAndShowErrors() && is_valid;
    }, this);

    if (is_valid) {
      _.each([this.displayNameModel, this.emailModel, this.cellphoneModel,
            this.roleTypeModel, this.roleSubgroupTypeModel, this.schedulerModel, this.engagementTypeModel, this.managerModel, this.scheduleManagerModel, this.schedulingRulesModel, this.dashboardAccessModel, this.specialAccessModel, this.userAdminNoteModel], function(model) {
        const changed_attrs = model.getPageApiDataAttrs();
        this.model.set(changed_attrs, {silent: true});
        this.model.getRole().set(changed_attrs, {silent: true});
      }, this);

      loaderChannel.trigger('page:load');
      userChannel.request('update:user', this.model)
        .done(() => {
          this.trigger('user:updated', this.model);
          this.close();
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.USER.UPDATE', () => this.close());
          handler(err);
        });
    }
  },

  async openSearchModel() {
    // NOTE: Load all report metadata when opening CEU search
    const modalDescription = `The User ${this.model.get('user_name')} cannot be set to inactive due to the following DMS items that are still associated to his user account. 
    You must remove all items from this user in order to set this account inactive.`;
    loaderChannel.trigger('page:load');
    await reportsChannel.request('load');
    loaderChannel.trigger('page:load:complete');
    const reports = reportsChannel.request('get');
    const userWorkReportTitles = configChannel.request('get', 'USER_WORK_REPORT__SEARCH')?.map(data => data.reportTitle) || [];
    const userWorkReports = userWorkReportTitles.map(reportTitle => {
      return reports.find(r => r.get('title') === reportTitle);
    });
    const reportContents = await userWorkReports?.[0]?.load([this.model.id])
    if (reportContents?.length) {
      modalChannel.request('add', new ModalReportViewer({ availableReports: userWorkReports, reportContents, modalDescription, useFormBuilder: false }));
    } else {
      this.userActiveModel.set({ checked: !this.userActiveModel.getData() });
      this.getChildView('userActiveRegion').render();
    }
  },

  _getRoleTypeOptions() {
   return Object.entries(configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS')).map(([key, value]) => ({ text: value, value: Number(key) }) );
  },  

  _getActiveDropBoxOptions() {
    return [{ text: 'No', value: 0 }, { text: 'Yes', value: 1 }];
  },

  _getSubGroupsFromRoleType(roleType) {
    return userChannel.request('get:roletypes:by:role', roleType);
  },

  _roleSubGroupsToDisplay(subGroupIds) {
    const userRoleTypes = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY');
    if(!subGroupIds) return;
     return Object.entries(subGroupIds).map(([key, value]) =>  {
      return {
        text: userRoleTypes[value],
        value: value
      };
    });
  },

  _getEngagementType() {
    return Object.entries(configChannel.request('get', 'ENGAGEMENT_TYPE_DISPLAY')).map(([key, value]) => ({ value: Number(key), text: value}) );
  },

  _getSchedulingRules() {
    return Object.entries(configChannel.request('get', 'SCHEDULE_SUB_STATUS_DISPLAY')).map(([key, value]) => ({ value: Number(key), text: value}) );
  },

  _getManagerSubTypes() {
    return Object.entries(configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY')).map(([key, value]) => ({ value: Number(key), text: value}) );
  },

  _getManagers(typeFilter, subTypeFilter) {
    return this.userList.filter((user) => {
      return ((user.getRoleId() === Number(typeFilter) || !typeFilter) && (user.getRoleSubtypeId() === Number(subTypeFilter) || !subTypeFilter) && (user.isActive() || (!user.isActive() && user.id === this.model.getManagedById())))
    })
    .map((user) => {
      return { value: user.get('user_id'), text: user.getUsername() };
    })
  },

  setTypeAndSubTypeManagers() {
    const manager = userChannel.request('get:user', Number(this.managerModel.getData()));

    if (manager) {
      this.managerTypeModel.set({ value: manager.getRoleId() });
      this.managerTypeModel.trigger('render');
    }

    const rolesSubGroupToDisplay = this._roleSubGroupsToDisplay(this._getSubGroupsFromRoleType(this.managerTypeModel.getData()));
    this.managerSubTypeModel.set({
      disabled: (!rolesSubGroupToDisplay || !rolesSubGroupToDisplay.length),
      optionData: rolesSubGroupToDisplay && rolesSubGroupToDisplay.length ? rolesSubGroupToDisplay : [{value:-1, text: 'foo'}],
      value: manager ? manager.getRoleSubtypeId() : null,
    });
    this.managerSubTypeModel.trigger('render');
  },

  createActiveChangeStatusListeners() {
    this.listenTo(this.userActiveModel,'change:checked', (model, value) => {
      this.model.set({ is_active: value ? 1 : 0 });
    })
  },

  createSubModels() {
    const rolesSubGroupToDisplay = this._roleSubGroupsToDisplay(this._getSubGroupsFromRoleType(this.model.getRole().get('role_group_id')));
    const userRoles = this.model.get('internal_user_roles') || {};

    this.userActiveModel = new CheckboxModel({
      html: `<span>Active DMS User?</span>`,
      disabled: true,
      checked: !!this.model.get('is_active'),
      apiMapping: 'is_active'
    });

    this.usernameModel = new InputModel({
      labelText: 'User Name (Login)',
      required: true,
      value: this.model.get('user_name'),
      disabled: true
    });

    this.displayNameModel = new InputModel({
      labelText: 'Display Name',
      required: true,
      errorMessage: "Enter a Display Name",
      value: this.model.get('name'),
      apiMapping: 'name'
    });      

    this.emailModel = new InputModel({
      labelText: 'Email Address',
      inputType: 'email',
      errorMessage: "Enter an email",
      value: this.model.get('email'),
      apiMapping: 'email'
    });        

    this.cellphoneModel = new InputModel({
      labelText: 'Mobile Phone',
      inputType: 'phone',
      errorMessage: "Enter a phone number",
      value: this.model.get('mobile'),
      apiMapping: 'mobile'
    });   

    this.roleTypeModel = new DropdownModel({
      labelText: 'Role Group',
      optionData: this._getRoleTypeOptions(),
      defaultBlank: true,
      errorMessage: 'Enter the role',
      required: true,
      value: this.model.getRoleId(),
      apiMapping: 'role_group_id'
    });

    this.roleSubgroupTypeModel = new DropdownModel({
      labelText: 'Role Sub Group',
      optionData: rolesSubGroupToDisplay && rolesSubGroupToDisplay.length ? rolesSubGroupToDisplay : [],
      defaultBlank: true,
      errorMessage: 'Enter the role sub group',
      disabled: !rolesSubGroupToDisplay?.length,
      required: rolesSubGroupToDisplay?.length,
      value: this.model.getRoleSubtypeId() ? this.model.getRoleSubtypeId() : (rolesSubGroupToDisplay?.length ? rolesSubGroupToDisplay[0].value : null),
      apiMapping: 'role_subtype_id'
    });

    this.adminAccessModel = new DropdownModel({
      optionData: this._getActiveDropBoxOptions(),
      value: this.model.get('user_admin'),
      disabled: true,
      defaultBlank: false,
    });

    this.schedulerModel = new DropdownModel({
      labelText: 'Scheduler',
      optionData: [{ value: DROPDOWN_NO_CODE, text: 'No' }, { value: DROPDOWN_YES_CODE, text: 'Yes' }],
      disabled: !this.model.get('is_active'),
      value: this.model.get('scheduler') ? DROPDOWN_YES_CODE : DROPDOWN_NO_CODE,
      apiMapping: 'scheduler'
    });

    this.engagementTypeModel = new DropdownModel({
      labelText: 'Engagement Type',
      defaultBlank: true,
      optionData: this._getEngagementType(),
      value: this.model.getRoleEngagement(),
      apiMapping: 'engagement_type',
      errorMessage: 'Enter engagement type',
      required: true,
    });

    this.managerTypeModel = new DropdownModel({
      optionData: this._getRoleTypeOptions(),
      disabled: false,
      value: null,
      labelText: 'Manager Type',
      defaultBlank: true,
    });

    this.managerSubTypeModel = new DropdownModel({
      optionData: this._getManagerSubTypes(),
      disabled: false,
      value: null,
      labelText: 'Manager Sub-Type',
      defaultBlank: true,
    });

    this.managerModel = new DropdownModel({
      optionData: this._getManagers(),
      disabled: this.managerTypeModel.getData() ? false : true,
      value: this.model.getManagedById(),
      labelText: 'Manager',
      apiMapping: 'managed_by_id',
      defaultBlank: true,
      required: false
    });

    this.scheduleManagerModel = new DropdownModel({
      optionData: [{value: DROPDOWN_NO_CODE, text: 'No'}, {value: DROPDOWN_YES_CODE, text: 'Yes'}],
      disabled: false,
      required: true,
      value: this.model.get('schedule_manager') ? DROPDOWN_YES_CODE : DROPDOWN_NO_CODE,
      labelText: 'Schedule Manager',
      apiMapping: 'schedule_manager'
    });

    this.schedulingRulesModel = new DropdownModel({
      optionData: this._getSchedulingRules(),
      disabled: false,
      required: false,
      value: this.model.getScheduleSubStatus(),
      labelText: 'Scheduling Rules',
      defaultBlank: true,
      apiMapping: 'schedule_sub_status'
    });

    this.dashboardAccessModel = new DropdownModel({ 
      optionData: [{value: false, text: 'No'}, {value: true, text: 'Yes'}],
      required: true,
      labelText: 'User Dashboards Access',
      defaultBlank: false,
      value: this.model.get('dashboard_access'),
      apiMapping: 'dashboard_access'
    });

    const USER_ROLE_SUB_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_SUB_TYPE_DISPLAY');
    this.specialAccessModel = new DropdownModel({
      optionData: Object.keys(USER_ROLE_SUB_TYPE_DISPLAY).map(value => ({ value: String(value), text: USER_ROLE_SUB_TYPE_DISPLAY[value] })),
      required: true,
      labelText: 'Special Access Rules',
      defaultBlank: true,
      value: this.model.getRoleAccessSubtype() ? String(this.model.getRoleAccessSubtype()) : null,
      apiMapping: 'access_sub_types'
    });

    this.userAdminNoteModel = new TextareaModel({
      labelText: 'User Administration Note',
      value: this.model.getRoleNote(),
      apiMapping: 'role_note',
      max: configChannel.request('get', 'USER_ROLE_NOTE_MAX'),
      countdown: true
    })
  },

  setAndReRenderManagerModel() {
    this.managerModel.set({ optionData: this._getManagers(this.managerTypeModel.getData(), this.managerSubTypeModel.getData()) });
    this.managerModel.trigger('render');
  },

  setupListeners() {
    this.listenTo(this.roleTypeModel, 'change:value', function(model, value) {
      const rolesToDisplay = this._roleSubGroupsToDisplay(this._getSubGroupsFromRoleType(value));
      this.roleSubgroupTypeModel.set({
        value: (rolesToDisplay && rolesToDisplay.length === 1) ? rolesToDisplay[0].value : null,
        disabled: (!rolesToDisplay || !rolesToDisplay.length),
        required: rolesToDisplay && rolesToDisplay.length >= 1,
        optionData: rolesToDisplay && rolesToDisplay.length ? rolesToDisplay : [{value:-1, text: 'foo'}] // NOTE: List is disabled, this shouldn't be visible
      });
      this.roleSubgroupTypeModel.trigger('render');
    }, this);

    this.listenTo(this.managerTypeModel, 'change:value', (model, value) => {
      const rolesToDisplay = this._roleSubGroupsToDisplay(this._getSubGroupsFromRoleType(value));
      this.managerSubTypeModel.set({
        disabled: (!rolesToDisplay || !rolesToDisplay.length),
        optionData: rolesToDisplay && rolesToDisplay.length ? rolesToDisplay : [{value:-1, text: 'foo'}],
        value: (rolesToDisplay && rolesToDisplay.length === 1) ? rolesToDisplay[0].value : null
      });
      this.managerSubTypeModel.trigger('render');

      if (!this.managerTypeModel.getData() || !this.managerSubTypeModel.getData()) this.managerModel.set({ disabled: true, value: null });
      else this.managerModel.set({ disabled: false, value: null });

      this.setAndReRenderManagerModel();
    });

    this.listenTo(this.managerSubTypeModel, 'change:value', () => {
      if (!this.managerSubTypeModel.getData()) this.managerModel.set({ disabled: true });
      else this.managerModel.set({ disabled: false });
      this.setAndReRenderManagerModel();
    });
   },

   initialize() {
    this.userList = userChannel.request('get:all:users').filter(user => !(SYSTEM_USER_NAMES || []).includes(user.get('user_name')) );
    this.createSubModels();
    this.setTypeAndSubTypeManagers();
    this.createActiveChangeStatusListeners();
    this.managerModel.set({ optionData: this._getManagers(this.managerTypeModel.getData(), this.managerSubTypeModel.getData()) });
  },

  onRender() {
    this.views_to_validate = ['usernameRegion', 'roleGroupRegion', 'subRoleGroupRegion', 'displayNameRegion', 'engagementTypeRegion', 'managerTypeRegion', 'managerSubTypeRegion', 'managerRegion', 'scheduleManagerRegion', 'schedulingRulesRegion'];

    this.showChildView('userActiveRegion', new CheckboxView({model: this.userActiveModel}))
    this.showChildView('emailAddressRegion',  new InputView({model: this.emailModel}));
    this.showChildView('mobilePhoneRegion', new InputView({model: this.cellphoneModel}));
    this.showChildView('displayNameRegion', new InputView({model: this.displayNameModel}));
    this.showChildView('usernameRegion', new InputView({model: this.usernameModel}));
    this.showChildView('roleGroupRegion', new DropdownView({model: this.roleTypeModel}));
    this.showChildView('adminAccessRegion', new DropdownView({model: this.adminAccessModel}));
    this.showChildView('subRoleGroupRegion', new DropdownView({model: this.roleSubgroupTypeModel}));
    this.showChildView('schedulerRegion', new DropdownView({model: this.schedulerModel}));
    this.showChildView('engagementTypeRegion', new DropdownView({model: this.engagementTypeModel}));
    this.showChildView('managerTypeRegion', new DropdownView({ model: this.managerTypeModel }));
    this.showChildView('managerSubTypeRegion', new DropdownView({ model: this.managerSubTypeModel }));
    this.showChildView('managerRegion', new DropdownView({ model: this.managerModel }));
    this.showChildView('scheduleManagerRegion', new DropdownView({ model: this.scheduleManagerModel }));
    this.showChildView('schedulingRulesRegion', new DropdownView({ model: this.schedulingRulesModel }));
    this.showChildView('dashboardAccessRegion', new DropdownView({ model: this.dashboardAccessModel }));
    this.showChildView('specialAccessRegion', new DropdownView({ model: this.specialAccessModel }));
    this.showChildView('adminNoteRegion', new TextareaView({ model: this.userAdminNoteModel }));
    
    this.setupListeners();
  },

  templateContext() {
    const signatureFile = filesChannel.request('get:commonfile', this.model.getProfile().get('signature_file_id'));
    const thumbnailUrl = signatureFile ? signatureFile.getDisplayURL() : NoThumbnailIcon;

    return {
      Formatter,
      createdByModel: userChannel.request('get:user', this.model.get('created_by')),
      modifiedBy: Formatter.toUserDisplay(this.model.get('modified_by')),
      thumbnailUrl
    };
  },
});
