/**
 * @fileoverview - View that displays hearings occuring today. Used on Personal and My Schedule view
 */
import BaseCalendarGridView from './BaseCalendarGrid';
import CalendarGridEventView from './CalendarGridEvent';
import template from './TodayCalendarGrid_template.tpl';

export default BaseCalendarGridView.extend({
  template,
  className: 'today-calendar-container',

  renderCalendarEvents() {
    const self = this;

    const gridCellWidth = this.$('.calendar-header-time-item').innerWidth();
    this.$('.today-calendar-grid-time-item').attr('style', `width: ${gridCellWidth}px`);

    this.$('.today-calendar-grid-event-container').each(function() {
      const hearingId = $(this).data('hearingId');
      const matchingHearingModel = self.model.get('hearingLookups')[hearingId];
      if (!matchingHearingModel) {
        console.log(`[Warning] Couldn't find a matching hearing model for event`, $(this)); 
        return;
      }
      const calendarEventView = new CalendarGridEventView({
        calendarModel: self.model,
        model: matchingHearingModel,
        gridCellWidth,
        isToday: $(this).data('today'),
      });
      self.calendarEventViews.push(calendarEventView);
      $(this).html(calendarEventView.render().$el);
    });
  }
});
