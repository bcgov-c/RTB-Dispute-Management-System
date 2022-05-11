import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import { SYSTEM_USER_NAMES } from '../../../../core/components/user/UserManager';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import template from './ModalUpdateUser_template.tpl';
import NoThumbnailIcon from '../../../static/NoThumbnail.png';
import '../admin-update-user.css';

const DROPDOWN_YES_CODE = '1';
const DROPDOWN_NO_CODE = '0';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'editUser-modal',
  regions : {
    displayNameRegion : '.display-name-input',
    activeBoxRegion: '.account-active-drop-box',
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
    ceuAccessRegion: '.ceu-access'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-update',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave',
    });
  },

  clickSave() {
    let is_valid = true;
    _.each(this.views_to_validate, function(v) {
      is_valid = this.getChildView(v).validateAndShowErrors() && is_valid;
    }, this);

    if (is_valid) {
      _.each([this.displayNameModel, this.emailModel, this.cellphoneModel, this.accountActiveModel,
            this.roleTypeModel, this.roleSubgroupTypeModel, this.schedulerModel, this.engagementTypeModel, this.managerModel, this.scheduleManagerModel, this.schedulingRulesModel, this.dashboardAccessModel, this.ceuAccessModel], function(model) {
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
      return ((user.getRoleId() === Number(typeFilter) || !typeFilter) && (user.getRoleSubtypeId() === Number(subTypeFilter) || !subTypeFilter))
    })
    .map((user) => {
      return { value: user.get('user_id'), text: user.getUsername() };
    })
  },

  setDefaultManagerValue() {
    if (this.managerModel.getData()) return;

    const admin = configChannel.request('get', 'USER_ROLE_GROUP_ADMIN');
    const informationOfficer = configChannel.request('get', 'USER_ROLE_GROUP_IO');
    const supervisor = configChannel.request('get', 'USER_SUBGROUP_SUPERVISOR');
    const arb = configChannel.request('get', 'USER_ROLE_GROUP_ARB');
    const teamLead = configChannel.request('get', 'USER_SUBGROUP_ARB_LEAD');
    
    if (this.model.getRoleId() === admin || this.model.getRoleId() === informationOfficer) {//Defaults = Information Officer - Supervisor
      this.managerTypeModel.set({ value: informationOfficer });
      this.managerSubTypeModel.set({ value: supervisor });
      this.managerModel.set({ disabled: false });
      this.setAndReRenderManagerModel();
    } else if (this.model.getRoleId() === arb) {//Defaults = Arbitrator - Team Lead
      this.managerTypeModel.set({ value: arb });
      this.managerSubTypeModel.set({ value: teamLead });
      this.managerModel.set({ disabled: false });
      this.setAndReRenderManagerModel();
    }
  },

  setTypeAndSubTypeManagers() {
    const manager = userChannel.request('get:user', Number(this.managerModel.getData()));

    if (!manager) return;
    this.managerTypeModel.set({ value: manager.getRoleId() });
    this.managerTypeModel.trigger('render');
    
    const rolesSubGroupToDisplay = this._roleSubGroupsToDisplay(this._getSubGroupsFromRoleType(this.managerTypeModel.getData()));
    this.managerSubTypeModel.set({
      disabled: (!rolesSubGroupToDisplay || !rolesSubGroupToDisplay.length),
      optionData: rolesSubGroupToDisplay && rolesSubGroupToDisplay.length ? rolesSubGroupToDisplay : [{value:-1, text: 'foo'}],
      value: manager.getRoleSubtypeId() || null,
    });
    this.managerSubTypeModel.trigger('render');
  },

  createSubModels() {
    const rolesSubGroupToDisplay = this._roleSubGroupsToDisplay(this._getSubGroupsFromRoleType(this.model.getRole().get('role_group_id')));

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

    this.accountActiveModel = new DropdownModel({
      labelText: 'Account Active/Enabled',
      optionData: this._getActiveDropBoxOptions(),
      value: this.model.get('is_active') ? 1 : 0,
      defaultBlank: false,
      apiMapping: 'is_active'
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

    this.ceuAccessModel = new DropdownModel({
      optionData: [{value: DROPDOWN_NO_CODE, text: 'No'}, {value: DROPDOWN_YES_CODE, text: 'Yes'}],
      required: true,
      labelText: 'CEU Access',
      defaultBlank: false,
      value: this.model.getRoleAccessSubtype() ? DROPDOWN_YES_CODE : DROPDOWN_NO_CODE,
      apiMapping: 'access_sub_types'

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
    this.setDefaultManagerValue();
    this.setTypeAndSubTypeManagers();
    this.managerModel.set({ optionData: this._getManagers(this.managerTypeModel.getData(), this.managerSubTypeModel.getData()) });
  },

  onRender() {
    this.views_to_validate = ['activeBoxRegion', 'usernameRegion', 'roleGroupRegion', 'subRoleGroupRegion', 'displayNameRegion', 'engagementTypeRegion', 'managerTypeRegion', 'managerSubTypeRegion', 'managerRegion', 'scheduleManagerRegion', 'schedulingRulesRegion'];

    this.showChildView('emailAddressRegion',  new InputView({model: this.emailModel}));
    this.showChildView('mobilePhoneRegion', new InputView({model: this.cellphoneModel}));
    this.showChildView('displayNameRegion', new InputView({model: this.displayNameModel}));
    this.showChildView('activeBoxRegion', new DropdownView({model: this.accountActiveModel}));
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
    this.showChildView('ceuAccessRegion', new DropdownView({ model: this.ceuAccessModel }));
    
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
