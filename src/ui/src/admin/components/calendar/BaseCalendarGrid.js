/**
 * Defines some base functionality for the Calendar component UI
 *
 * Used by CalendarGrid and TodayCalendarGrid
 *
*/
import Marionette from 'backbone.marionette';

export default Marionette.View.extend({
  initialize() {
    this.headerLabel = this.model.get('headerLabel');
    this.initialHour = this.model.get('initialHour');
    this.finalHour = this.model.get('finalHour');
    this.currentPickedMonth = this.model.get('currentPickedMonth');
    this.currentPickedYear = this.model.get('currentPickedYear');
    this.todayIndicator = this.model.get('todayIndicator');
    this.rowEvents = this.model.get('rowEvents');
    this.headerLabelData = this.extractHeaderTimeLabel(this.initialHour, this.finalHour);
    this.resizeCalendarFn = _.bind(this._resizeCalendar, this);
    this.calendarEventViews = [];
  },

  extractHeaderTimeLabel(initialHour, finalHour) {
    const hourObject = [];
    for (var i = initialHour; i <= finalHour; i++) {
      hourObject.push(`${i}:00`);
    }
    return hourObject;
  },

  extractEventLabel(events) {
    const eventLabelObject = [];
    _.each(events, function(item) {
      eventLabelObject.push(Object.assign({ text: item.label, cssClass: item.cssClass }, item));
    });
    return eventLabelObject;
  },

  renderCalendarEvents() {
    console.log(`[Error] This method should be overridden by subclasses`);
  },

  _resizeCalendar() {
    if (this.$el && this.isRendered()) {
      this.renderCalendarEvents();
    }
  },

  switchToFilteredEvents() {
    if (_.isEqual(this.model.get('filteredRowEvents'), this.rowEvents)) {
      return;
    }
    this.rowEvents = this.model.get('filteredRowEvents');
    this.render();
  },

  switchToNormalEvents() {
    if (_.isEqual(this.model.get('rowEvents'), this.rowEvents)) {
      return;
    }
    this.rowEvents = this.model.get('rowEvents');
    this.render();
  },

  onDomRefresh() {
    this.renderCalendarEvents();
    $(window).off('resize', this.resizeCalendarFn);
    $(window).on('resize', this.resizeCalendarFn);
  },

  onDestroy() {
    $(window).off('resize', this.resizeCalendarFn);

    // Remove other calendar items
    _.each(this.calendarEventViews, function(calendarEventView) {
      calendarEventView.destroy();
    });
  },

  templateContext() {
    return {
      headerLabel: this.headerLabel,
      headerLabelData: this.headerLabelData,
      eventLabel: this.extractEventLabel(this.rowEvents),
      eventData: this.rowEvents,
      todayWeekday: Moment().format('D'),
      isCurrentMonth: this.currentPickedMonth && (Moment().format('M') === this.currentPickedMonth.toString()),
      isCurrentYear: this.currentPickedYear && (Moment().format('Y') === this.currentPickedYear.toString()),
      todayIndicator: this.todayIndicator,
      todayDate: Moment(),
      periodStartDate: Moment(this.model.get('periodModel')?.get('period_start')),
      printableColumns: this.model.get('printableColumns'),
    };
  }

});
