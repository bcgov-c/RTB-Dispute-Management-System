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

  initialize(options) {
    this.mergeOptions(options, ['genericEventName', 'menuOptions']);
  },

  templateContext() {
    return {
      menuOptions: this.menuOptions
    };
  }
});
