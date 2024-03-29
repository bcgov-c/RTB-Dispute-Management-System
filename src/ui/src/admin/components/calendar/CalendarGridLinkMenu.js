/**
 * @fileoverview - View that displays clickable menu attached to hearing items (CalendarGridEvent). Used to display menu options for linked hearings.
 */
import Marionette from 'backbone.marionette';

import template from './CalendarGridLinkMenu_template.tpl';

export default Marionette.View.extend({
  template,

  events: {
    'click .calendar-grid-link-menu-item.clickable': 'clickFloatingMenu'
  },

  clickFloatingMenu(ev) {
    const menuEle = $(ev.currentTarget);
    const linkMenuOptionIndex = menuEle.data('index');
    const currentMenuOption = this.linkMenuOptions[linkMenuOptionIndex];
    this.trigger(currentMenuOption.event, currentMenuOption.disputeHearing);
  },

  /**
   * @param {Array} linkMenuOptions
   */
  initialize(options) {
    this.mergeOptions(options, ['linkMenuOptions']);
  },

  templateContext() {
    return {
      linkMenuOptions: this.linkMenuOptions
    };
  }
});
