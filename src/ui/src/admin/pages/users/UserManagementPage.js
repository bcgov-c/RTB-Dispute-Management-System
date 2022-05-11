import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import UserListView from './UserManagementList';
import template from './UserManagementPage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className() {
    return `${PageView.prototype.className} user-management-page`;
  },

  regions: {
    userTypeFilter: '#user-management-type-filters',
    userSortByFilter: '#user-management-sort-by-filters',
    userList: '#usr-management-list'
  },

  ui: {
    refresh: '.header-refresh-icon'
  },

  events: {
    'click @ui.refresh': 'clickRefresh',
  },

  clickRefresh() {
    this.loadUsers();
  },

  loadUsers() {
    loaderChannel.trigger('page:load');
    userChannel.request('load:users')
      .done(() => {
        this.render();
      }).fail(generalErrorFactory.createHandler('ADMIN.USERS.LOAD', () => this.render()))
      .always(() => loaderChannel.trigger('page:load:complete'))
  },

  _onRefreshUsers(updatedUserModel) {
    this.all_users.set(updatedUserModel, { remove: false });
    this.render();
  },

  initialize() {
    this.createSubModels();
    this.listenTo(this.userSortByFiltersModel, 'change:value', this.updateSortComparator, this);
    
    this.all_users = userChannel.request('get:all:users');
    this.listenTo(this.all_users, 'refresh:users', this._onRefreshUsers, this);
    this.listenTo(this.all_users, 'refresh:page', this.clickRefresh, this);
    this.listenTo(this.userSortByFiltersModel, 'change:value', this.cacheFilterState, this);
    this.listenTo(this.userTypeFiltersModel, 'change:value', this.cacheFilterState);
    this.updateSortComparator();
  },

  createSubModels() {
    const filters = this.model.get('userManagement');
    this.userTypeFiltersModel = new RadioModel({
      optionData: this._getTypeFilterOptions(),
      value: filters?.filter_userType || filters?.filter_userType === 0 ? filters.filter_userType : 'all'
    });

    this.userSortByFiltersModel = new RadioModel({
      optionData: this._getSortByFilterOptions(),
      value: filters?.sort_userAttr ? filters?.sort_userAttr : 2
    });    
  },

  cacheFilterState() {
      this.model.set({
        userManagement : {
          sort_userAttr: this.userSortByFiltersModel.getData(),
          filter_userType: this.userTypeFiltersModel.getData()
        }
      })
  },

  _getTypeFilterOptions() {
    const options = {
      "All Users": "all",
      "Active Only": 1,
      "Inactive Only": 0
    }

    return Object.entries(options).map(([key, value]) => {
      return {
        text: key,
        value: value
      }
    });
  },  

  _getSortByFilterOptions() {
    const options = {
      "Name": 1,
      "Username": 2,
      "Date Created": 3,
      "Role": 4
    }
    return Object.entries(options).map(([key, value]) => {
      return {
        text: key,
        value: value
      }
    });
  },

  onRender() {
    this.showChildView('userList', new UserListView({
      collection: this.all_users,
      typeFilter: this.userTypeFiltersModel,
      sortByFilter: this.userSortByFiltersModel
    }));
    this.showChildView('userTypeFilter', new RadioView({ model: this.userTypeFiltersModel }));
    this.showChildView('userSortByFilter', new RadioView({ model: this.userSortByFiltersModel,  displayTitle: 'Sort by:' }));    
    loaderChannel.trigger('page:load:complete');
  },

  updateSortComparator() {
    if (this.userSortByFiltersModel.get('value') === 1) {
      const comparator = function(n) { return $.trim(n.get('name')); };
      this.all_users.comparator = comparator;
      this.all_users.sort(comparator);
    } else if (this.userSortByFiltersModel.get('value') === 2) {
      const comparator = function(n) { return $.trim(n.get('user_name')); };
      this.all_users.comparator = comparator;
      this.all_users.sort(comparator);
    } else if (this.userSortByFiltersModel.get('value') === 3) {
      const comparator = function(n) { return $.trim(n.get('created_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); };
      this.all_users.comparator = comparator;
      this.all_users.sort(comparator);
    } else if (this.userSortByFiltersModel.get('value') === 4) {
      const comparator = function(user) {
        const roleDisplay = $.trim(user.getRoleDisplay()),
          roleSubtypeDisplay = $.trim(user.getRoleSubtypeDisplay());
        return roleDisplay ? `${roleDisplay}:${roleSubtypeDisplay ? roleSubtypeDisplay : 'zzz'}` : 'zzz'; // If it's null or empty, put it at the end
      };
      this.all_users.comparator = comparator;
      this.all_users.sort(comparator);
    }

    this.onRender();
  },

  templateContext() {
    return {
      Formatter,
      lastRefreshTime: Moment()
    };
  }

});
