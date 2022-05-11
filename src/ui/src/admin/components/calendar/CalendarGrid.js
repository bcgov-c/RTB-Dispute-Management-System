import BaseCalendarGridView from './BaseCalendarGrid';
import CalendarGridEventView from './CalendarGridEvent';
import template from './CalendarGrid_template.tpl'

export default BaseCalendarGridView.extend({
  template,
  className: 'calendar-container',

  initialize(options) {
   BaseCalendarGridView.prototype.initialize.call(this, ...arguments);
   this.mergeOptions(options, ['calendarOptionsFn']);
  },

  renderCalendarEvents(options={}) {
    const self = this;
    const gridCellWidth = options.gridCellWidth || this.$('.calendar-grid-time-item').innerWidth();
    this.$('.calendar-grid-event-container').each(function() {
      const hearingId = $(this).data('hearingId');
      const matchingHearingModel = self.model.get('hearingLookups')[hearingId];
      if (!matchingHearingModel) {
        console.log(`[Warning] Couldn't find a matching hearing model for event`, $(this))
        return;
      }

      const calendarEventView = new CalendarGridEventView({
        calendarModel: self.model,
        model: matchingHearingModel,
        gridCellWidth,
        calendarItemMenuFn: self.calendarOptionsFn
      });
      self.calendarEventViews.push(calendarEventView);
      $(this).html(calendarEventView.render().$el);
    });
  },

});