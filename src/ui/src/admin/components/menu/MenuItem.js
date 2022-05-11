import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { MenuConfig } from './MenuConfig';
import { routeParse } from '../../routers/mainview_router';

const menuChannel = Radio.channel('menu');

export default Marionette.View.extend({
  template: _.template(`
    <span class="menu-item-content">
      <span><%= title %></span>`
      + '<% if (enable_count_display && _.isNumber(count)) { %>'
        + '<span class="menu-item-count">[<div><%= count %></div>]</span>'
      + '<% } %>'
    + `</span>
    <% if (enable_dashboard_toggle) { %>
      <span class="menu-buttons">
      <span class="menu-button-toggle"></span>
    <% } %>
    <% if (enable_dispute_buttons) { %>
      <span class="menu-buttons">
        <% if (!isExpanded) { %>
          <span class="menu-button-expand"></span>
        <% } %>
        <% if (isExpanded) { %>
          <span class="menu-button-collapse"></span>
        <% } %>
        <span class="menu-button-spacer"></span>
        <span class="menu-button-close"></span>
      </span>
    <% } %>
    <% if (enable_cms_buttons) { %>
      <span class="menu-buttons">
        <span class="menu-button-close-cms"></span>
      </span>
    <% } %>
  `),
  tagName: 'div',
  className() {
    return `
    ${this.model.isTitle() ? 'title' : 'step'}
    ${this.model.isHidden() ? 'hidden' : ''} ${([
        this.model.get('active') ? 'active' : null,
        this.model.get('disabled') ? 'disabled' : null,
        this.model.get('visited') ? 'visited' : null
      ].join(' '))}`;
  },
  attributes() {
    return this.model.get('group') ? {
      'data-group': this.model.get('group')
    } : {};
  },

  ui: {
    close: '.menu-button-close',
    expand: '.menu-button-expand',
    collapse: '.menu-button-collapse',
    toggle: '.menu-button-toggle',
  },

  events: {
    'click': 'onClick',
    'click @ui.close': 'clickMenuClose',
    'click @ui.expand': 'clickMenuExpand',
    'click @ui.collapse': 'clickMenuCollapse',
    'click @ui.toggle': 'clickMenuDashboardToggle',

    // For CMS only.  Can be removed for non-RTB
    'click .menu-button-close-cms': function() {
      // Trigger a re-render on the menu
      const menuItems = this.model.collection;
      const activeMenuItem = menuChannel.request('get:active');
      // A matching subGroup means the tabs are associated to same CMS record, because the sub_group holds the cms record name
      const subGroup = this.model.get('sub_group');

      menuChannel.trigger('close:cms', subGroup);
      if (activeMenuItem && activeMenuItem.get('sub_group') === subGroup) {
        Backbone.history.navigate(routeParse('landing_item'), {trigger: true});
      } else if (menuItems) {
        menuItems.trigger('refresh:menu');
      }
    }
  },

  clickMenuClose() {
    const menuItems = this.model.collection;
    if (!menuItems) {
      console.log(`[Warning] Couldn't access menu items`);
      return;
    }
    const disputeGuid = this.model.get('dispute_guid');
    const disputeToCloseHasActiveTab =  menuItems.findWhere({ dispute_guid: disputeGuid, active: true });

    menuChannel.trigger('close:dispute', disputeGuid);
    if (disputeToCloseHasActiveTab) {
      Backbone.history.navigate(routeParse('landing_item'), {trigger: true});
    } else {
      // Trigger a re-render on the menu
      menuItems.trigger('refresh:menu');
    }
  },

  clickMenuExpand() {
    const disputeGuid = this.model.get('dispute_guid');
    _.each(MenuConfig.disputeMenuItems, function(menuName) {
      menuChannel.trigger('add:dispute:item', menuName, disputeGuid);
    });
    this.isExpanded = true;
    this.render();
  },

  clickMenuCollapse() {
    const disputeGuid = this.model.get('dispute_guid');
    const collection = this.model.collection;
    if (!collection) {
      console.log(`[Warning] Couldn't access menu items`);
      return;
    }
  
    const toRemove = [];
    _.each(MenuConfig.disputeMenuItems, function(menuName) {
      if (_.contains(MenuConfig.defaultDisputeMenuItems, menuName)) {
        return;
      }
      const toCollapse = collection.findWhere({ item_id: menuName, dispute_guid: disputeGuid });
      if (!toCollapse.isActive()) {
        toRemove.push(toCollapse);
      }
    });

    collection.remove(toRemove);
    this.isExpanded = false;
    this.render();
  },

  clickMenuDashboardToggle() {
    menuChannel.trigger('dashboard:toggle', this.model);
  },

  onClick() {
    if (this.model.isTitle() || this.model.get('active') || !this.model.get('visited') || this.model.get('disabled') || !this.model.get('navigate_on_click')) {
      return;
    }
    Backbone.history.navigate(this.model.get('navigation_link'), {trigger: true});
  },

  initialize() {
    const collection = this.model.collection;
    const disputeGuid = this.model.get('dispute_guid');
    
    this.isExpanded = collection && _.all(MenuConfig.disputeMenuItems, function(menuItemName) {
      return collection.findWhere({ item_id: menuItemName , dispute_guid: disputeGuid });
    });

    this.listenTo(this.model, 'render', this.render, this);
  },

  templateContext() {
    return {
      isExpanded: this.isExpanded
    };
  }
});