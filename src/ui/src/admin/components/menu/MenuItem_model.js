import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    item_id: null,
    title: null,
    group: null,
    sub_group: null,
    dynamic: false,
    active: false, // In most menus, only one menu item can be active at a time
    visited: true,
    disabled: false,
    is_title: false,
    enable_dispute_buttons: false,
    enable_cms_buttons: false,
    enable_dashboard_toggle: false,
    enable_count_display: false,
    count: 0,
    is_hidden: false,
    dispute_guid: null,
    navigate_on_click: true,
    navigation_link: null,
    created_date: null,
  },

  isActive() {
    return !!this.get('active');
  },
  
  isTitle() {
    return !!this.get('is_title');
  },

  isHidden() {
    return !!this.get('is_hidden');
  }
});