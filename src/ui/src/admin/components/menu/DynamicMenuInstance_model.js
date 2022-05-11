/*
 * Used as a model for holding general info about the menu
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';

const menuChannel = Radio.channel('menu');

export default Backbone.Model.extend({

  defaults: {
    // Dynamic generated attributes
    id: null,
    created_date: null,
    
    // Required attributes
    menu_config_name: null
  },

  initialize() {
    const menuItems = menuChannel.request('get:items');
    // Generate dynamic id
    if (!this.get('id')) {
      let proposedId = String(Math.random()).slice(2);
      while (this.collection && this.collection.get(proposedId) && menuItems.get(proposedId)) {
        proposedId++;
      }
      this.set('id', proposedId);
    }
    this.set('created_date', Moment());
  },

  /*
   * Creates and returns a menu item from menu configs
   */
  getMenuItem() {
    const menu_composer_item = menuChannel.request('get:config', this.get('menu_config_name'));
    // Use a unique ID for this item, and a navigation_link that will let us go to it on the router
    if (menu_composer_item) {
      menu_composer_item.item_id = this.id;
    }
    return menu_composer_item;
  },

  // Not an API model, so disable any API interactions
  sync() {
    // Pass
  }
});