/**
 * @fileoverview - View that displays clickable menu attached to hearing items (CalendarGridEvent)
 */
import Marionette from 'backbone.marionette';
import template from './CalendarGridEventMenu_template.tpl';

export default Marionette.View.extend({
  template,

  events: {
    'click .calendar-grid-event-floating-menu > div': 'clickFloatingMenu',
  },

  clickFloatingMenu(ev) {
    const menuEle = $(ev.currentTarget);
    // Trigger an event on the view
    this.trigger(this.genericEventName, menuEle.data('event'));
  },

  /**
   * @param {String} genericEventName - Event name to tie menu to
   * @param {Array} menuOptions - Array of menu option objects
   */
  initialize(options) {
    this.mergeOptions(options, ['genericEventName', 'menuOptions']);
  },

  templateContext() {
    return {
      menuOptions: this.menuOptions
    };
  }
});
