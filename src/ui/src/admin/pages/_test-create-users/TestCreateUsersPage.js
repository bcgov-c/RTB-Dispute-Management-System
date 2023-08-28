import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UserCollection from '../../../core/components/user/User_collection';
import PageView from '../../../core/components/page/Page';
import template from './TestCreateUsersPage_template.tpl';

const configChannel = Radio.channel('config'),
  userChannel = Radio.channel('users'),
  loaderChannel = Radio.channel('loader'),
  Formatter = Radio.channel('formatter').request('get');


const HARDCODED_USERS_DATA = [
{
  name: "IOAlexander Standard",
  user_name: "IOAlexander",
  password: "IOAlexander",
  email: "IOAlexander@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 11,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
}, 
{
  name: "IOAndrew Standard",
  user_name: "IOAndrew",
  password: "IOAndrew",
  email: "IOAndrew@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 11,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "IOAmeilia Standard",
  user_name: "IOAmeilia",
  password: "IOAmeilia",
  email: "IOAmeilia@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 11,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "IOAlbert Standard",
  user_name: "IOAlbert",
  password: "IOAlbert",
  email: "IOAlbert@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 11,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "IOAmanda Standard",
  user_name: "IOAmanda",
  password: "IOAmanda",
  email: "IOAmanda@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 11,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "IOBailey Senior",
  user_name: "IOBailey",
  password: "IOBailey",
  email: "IOBailey@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 12,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "IOCharlie Supervisor",
  user_name: "IOCharlie",
  password: "IOCharlie",
  email: "IOCharlie@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 1,
    role_subtype_id: 13,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "ArbDavid Level1",
  user_name: "ArbDavid",
  password: "ArbDavid",
  email: "ArbDavid@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 21,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "ArbDarcy Level1",
  user_name: "ArbDarcy",
  password: "ArbDarcy",
  email: "ArbDarcy@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 21,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "ArbDaniel Level2",
  user_name: "ArbDaniel",
  password: "ArbDaniel",
  email: "ArbDaniel@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 22,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "ArbDouglas Level2",
  user_name: "ArbDouglas",
  password: "ArbDouglas",
  email: "ArbDouglas@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 22,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "ArbDallas Level2",
  user_name: "ArbDallas",
  password: "ArbDallas",
  email: "ArbDallas@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 22,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "ArbEdward TeamLead",
  user_name: "ArbEdward",
  password: "ArbEdward",
  email: "ArbEdward@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 23,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "AdjFlorence Adjudicator",
  user_name: "AdjFlorence",
  password: "AdjFlorence",
  email: "AdjFlorence@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    role_subtype_id: 24,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "Office Admin",
  user_name: "OfficeAdmin",
  password: "OfficeAdmin",
  email: "OfficeAdmin@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 4,
    role_subtype_id: 41,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "Office Manager",
  user_name: "OfficeManager",
  password: "OfficeManager",
  email: "OfficeManager@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 5,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},
{
  name: "SystemAdmin",
  user_name: "SystemAdmin",
  password: "SystemAdmin",
  email: "OtherUser@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 9,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  is_active: 1,
  user_admin: 1,
  mobile: 1,
  accepts_text_messages: 1,
},

{
  name: "SystemArbitrator",
  user_name: "SystemArbitrator",
  password: "SystemArbitrator",
  email: "SystemArbitrator@hive1-cs.com",
  internal_user_roles: [{
    role_group_id: 2,
    is_active: true  
  }],
  user_id: null,
  role_id: 1,
  scheduler: 0,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},

{
  name: "Office User",
  user_name: "OfficeUser",
  password: "OfficeUser",
  email: "OfficeUser@hive1-cs.com",
  internal_user_roles: [],
  user_id: null,
  role_id: 5,
  is_active: 1,
  user_admin: 0,
  mobile: 1,
  accepts_text_messages: 1,
},

{
  role_id: 2,
  name: "External User1",
  user_name: "extuser01",
  password: "extuser01",
  email: "extuser01@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User2",
  user_name: "extuser02",
  password: "extuser02",
  email: "extuser02@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User3",
  user_name: "extuser03",
  password: "extuser03",
  email: "extuser03@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User4",
  user_name: "extuser04",
  password: "extuser04",
  email: "extuser04@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User5",
  user_name: "extuser05",
  password: "extuser05",
  email: "extuser05@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User6",
  user_name: "extuser06",
  password: "extuser06",
  email: "extuser06@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User7",
  user_name: "extuser07",
  password: "extuser07",
  email: "extuser07@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User8",
  user_name: "extuser08",
  password: "extuser08",
  email: "extuser08@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User9",
  user_name: "extuser09",
  password: "extuser09",
  email: "extuser09@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},

{
  role_id: 2,
  name: "External User10",
  user_name: "extuser10",
  password: "extuser10",
  email: "extuser10@Hive1-cs.com",
  account_mobile: "111-111-1111",
  accepts_text_messages: true,
  user_admin: false,
  is_active: true,
  mobile: 1,
},
];

const CreateUserView = Marionette.View.extend({
  template: _.template(`
<div class="created-date-column <%= created_date ? 'success-green' : 'warning-yellow'%>">
  <%= role_id === 2 || role_id === 5 ? '-' : created_date ? Formatter.toDateAndTimeDisplay(created_date) : 'No' %>
</div>
<div class="user-active-column">
  <% if (is_active) { %>
    <span class="">Yes</span>
  <% } else { %>
    No
  <% } %>
</div>
<div class="name-column"><%= name %></div>
<div class="username-column"><%= user_name %></div>
<div class="email-column"><%= email %></div>
<div class="mobile-column"><%= mobile %></div>
<div class="user-admin-column text-center">
  <% if (user_admin) { %>
    <span>Yes</span>
  <% } else { %>
    No
  <% } %>
</div>
<div class="rolegroup-column"><%= roleGroup %></div>
<div class="roletype-column"><%= roletype %></div>
`),

  className: 'standard-list-item user-list-item',

  templateContext() {
    const roleType = this.model.getRole(),
      ROLE_GROUP_DISPLAY = configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS'),
      ROLE_GROUP_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY'); 

    return {
      Formatter, 
      roleGroup: ROLE_GROUP_DISPLAY[roleType.get('role_group_id')] ? ROLE_GROUP_DISPLAY[roleType.get('role_group_id')] : '-' ,
      roletype:  ROLE_GROUP_TYPE_DISPLAY[roleType.get('role_subtype_id')] ? ROLE_GROUP_TYPE_DISPLAY[roleType.get('role_subtype_id')] : '-'
    };
  }
});

export default PageView.extend({
  template,
  className: 'test-create-users-page',

  regions: {
    usersList: '.standard-list-items'
  },

  events: {
    'click .save-all': 'clickSaveAll'
  },

  clickSaveAll() {

    loaderChannel.trigger('page:load');
    const create_users_xhr = _.map(this.hardcodedUsers.filter(function(userModel) {
      return userModel.isNew();
    }), function(userModel) {
      return _.bind(userChannel.request, userChannel, 'create:user', userModel);
    });

    console.log("Trying to create", create_users_xhr);
    const self = this;    
    Promise.all(_.map(create_users_xhr, function(xhr) { return xhr(); }))
      .finally(function() {
        userChannel.request('load:users')
          .always(function() {
            self.mergeApiUsers();
            Promise.all(self.hardcodedUsers.map(function(user) { return userChannel.request('update:user', user); }))
              .finally(function() {
                userChannel.request('load:users')
                  .always(function() {
                    loaderChannel.trigger('page:load:complete');
                    self.render();
                  });
              });
          });
      });
  },

  initialize() {
    this.hardcodedUsers = new UserCollection(HARDCODED_USERS_DATA);
    this.mergeApiUsers();
  },

  mergeApiUsers() {
    const systemUsers = userChannel.request('get:all:users');
    this.hardcodedUsers.each(function(userModel) {
      // Performa a case-insensitive match on email, and on role_id
      const matchingSystemUsers = systemUsers.filter(function(user) {
          return $.trim(userModel.get('email')) && $.trim(user.get('email')).toLowerCase() === $.trim(userModel.get('email')).toLowerCase()
            && userModel.get('role_id') === user.get('role_id');
        }),
        matchingSystemUser = matchingSystemUsers.length ? matchingSystemUsers[0] : null;
      if (matchingSystemUser) {
        userModel.set(_.omit(matchingSystemUser.toJSON(), 'internal_user_roles'));
        userModel.getRole().set(_.extend(userModel.getRole().toJSON(), { user_id: matchingSystemUser.get('user_id') }));
      }
    });
  },

  onRender() {
    this.showChildView('usersList', new Marionette.CollectionView({
      childView: CreateUserView,
      collection: this.hardcodedUsers
    }));
    loaderChannel.trigger('page:load:complete');
  }

});