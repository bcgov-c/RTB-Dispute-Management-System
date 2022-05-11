import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import ModalUpdateUser from '../../components/modals/modal-update-user/ModalUpdateUser';
import template from './UserListItem_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item user-list-item',

  regions: {
    checkboxRegion: '.user-is-active-checkbox'
  },

  ui: {
    'editEmail': '.view-edit-link'
  },

  events: {
    'click @ui.editEmail': 'clickEditUser'
  },

  initialize() {
    this.createSubModels();
    this.createActiveChangeStatusListeners();
  },

  clickEditUser(e) {
    e.preventDefault();
    const modalView = new ModalUpdateUser({ model: this.model });
    this.listenTo(modalView, 'user:updated', () => this.model.trigger('refresh:page'));
    modalChannel.request('add', modalView);
  },

  createSubModels() {
    const userRoles = this.model.get('internal_user_roles') || {};
    this.checkboxModel = new CheckboxModel({
      // Disable activating the user if the user is inactive and missing an internal user role
      disabled: !this.model.get('is_active') && (!userRoles || !userRoles.length),
      checked: !!this.model.get('is_active')
    });
  },

  createActiveChangeStatusListeners() {
    this.listenTo(this.checkboxModel, 'change:checked', function() {
      loaderChannel.trigger('page:load');
      this.model.set({ is_active: this.model.get('is_active') ? 0 : 1 });
      userChannel.request('set:active', this.model)
        .done(statusResponse => {
          // This response returns an empty internal_user_roles array for some reason, so simply delete it
          delete statusResponse.internal_user_roles;
          this.model.set(statusResponse);
          loaderChannel.trigger('page:load:complete');
          this.model.trigger('refresh:users', this.model);
        }).fail(
          generalErrorFactory.createHandler('ADMIN.USER.SAVE', () => {
            // Change back because of failure
            this.model.set({ is_active: this.model.get('is_active') ? 0 : 1 });
            this.model.trigger('refresh:users', this.model);
          })
        )
        .always(() => loaderChannel.trigger('page:load:complete'));
    }, this);
  },

  getSchedulingData() {
    const scheduler = this.model.get('scheduler');
    const scheduleManager = this.model.get('schedule_manager');

    if (scheduler && scheduleManager) return 'Full';
    else if (scheduler && !scheduleManager) return 'Standard';
    else return null;
  },

  onRender() {
    this.showChildView('checkboxRegion',  new CheckboxView({model: this.checkboxModel}));
  },

  templateContext() {
    const roleType = this.model.getRole(),
      ROLE_GROUP_DISPLAY = configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS'),
      ROLE_GROUP_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY'),
      USER_LIST = userChannel.request('get:all:users'),
      manager = USER_LIST.findWhere({user_id: roleType.get('managed_by_id') });

    return {
      Formatter,
      roleGroup: ROLE_GROUP_DISPLAY[roleType.get('role_group_id')] ? ROLE_GROUP_DISPLAY[roleType.get('role_group_id')] : '-' ,
      roletype:  ROLE_GROUP_TYPE_DISPLAY[roleType.get('role_subtype_id')] ? ROLE_GROUP_TYPE_DISPLAY[roleType.get('role_subtype_id')] : '-',
      managedBy: manager ? manager.get('name') : '-',
      scheduler: this.getSchedulingData(),
    }
  }
});
