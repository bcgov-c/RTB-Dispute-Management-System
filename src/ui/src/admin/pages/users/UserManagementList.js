import Marionette from 'backbone.marionette';
import UserListItemView from './UserListItem';
import { SYSTEM_USER_NAMES } from '../../../core/components/user/UserManager';
import template from './UserManagementList_template.tpl';

const USER_FILTER_TYPE_ACTIVE_VALUE = 1;
const USER_FILTER_TYPE_INACTIVE_VALUE = 0;

const EmptyUserListItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No matching users</div>`)
});

const filterUsersFn = function(model) {
  if (_.contains(SYSTEM_USER_NAMES, model.get('user_name'))) return false;
  const type = this.typeFilter.get('value');
  return (type !== 'all' ? model.get('is_active') === (type === USER_FILTER_TYPE_ACTIVE_VALUE) : true);
};

const UserListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: UserListItemView,
  emptyView: EmptyUserListItemView,

  initialize(options)  {
    this.mergeOptions(options, ['typeFilter']);
  },

  filter: filterUsersFn
});

export default Marionette.View.extend({
  template,
  className: 'standard-list',

  regions: {
    userList: '.standard-list-items'
  },

  initialize(options) {
    _.extend(this.options, {}, options);
    this.mergeOptions(options, ['typeFilter']);
    this.listenTo(this.typeFilter, 'change:value', this.render, this);
  },

  onRender() {
    this.showChildView('userList', new UserListView(this.options));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.any(filterUsersFn, this)
    };
  }
})