import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import { routeParse } from '../../../routers/mainview_router';
import template from './CalendarMonthlyReport_template.tpl';

export default Marionette.View.extend({
  template,
  className: 'monthly-schedule-container',

  ui: {
    day: '.schedule-calendar-grid-day-text'
  },

  events: {
    'click @ui.day': 'clickDay'
  },

  clickDay(ev) {
    const ele = $(ev.currentTarget);
    const day = ele.data('day');
    const month = this.model.get('currentMonth');
    const year = this.model.get('currentYear');

    Backbone.history.navigate(routeParse('scheduled_hearings_daily_param_item', null, Moment(`${year}-${month}-${day}`, 'YYYY-M-D').format('YYYY-MM-DD')), { trigger: true });
  },

  extractAllDayOfWeek() {
    const weekdays = Moment.weekdaysShort();
    weekdays.push(_.first(weekdays));
    weekdays.shift();

    return weekdays;
  },

  initialize() {
    this.currentDate = 0;
    const currentMonth = Moment().format('M');
    const currentYear = Moment().format('Y');
    this.currentPickedMonth = this.model.get('currentMonth');
    this.currentPickedYear = this.model.get('currentYear');
    this.isOnCurrentYear = this.currentPickedYear == currentYear;
    this.currentDate = 0;

    if (Number(currentMonth) === this.currentPickedMonth) {
      this.currentDate = Moment().format('D');
    }

    this.numOfDayInCurrentMonth = this.model.get('calendarData').numOfDayInCurrentMonth;
    this.weekNumberOfStartDay = this.model.get('calendarData').weekNumberOfStartDay;
    this.weekNumberOfEndDay = this.model.get('calendarData').weekNumberOfEndDay;
    this.numberOfMonthRow = this.model.get('numberOfMonthRow');
    this.monthlyEvents = this.model.get('events');

    /* Fix for when the month starts on a sunday */
    if (this.model.get('calendarData').weekNumberOfStartDay < 1) { 
      this.weekNumberOfStartDay = "7";
      this.numberOfMonthRow = 6;
    }

    if (this.monthlyEvents && !_.isEmpty(this.monthlyEvents)) {
      this.dayBreakDownData = this.monthlyEvents[0].day_breakdown;
    }
  },

  onDestroy() {
    $(window).off('resize');
  },

  templateContext() {
    return {
      currentDate: this.currentDate,
      isOnCurrentYear: this.isOnCurrentYear,
      numberOfMonthRow: this.numberOfMonthRow,
      numOfDayInCurrentMonth: this.numOfDayInCurrentMonth,
      weekNumberOfStartDay: this.weekNumberOfStartDay,
      weekNumberOfEndDay: this.weekNumberOfEndDay,
      headerLabel: this.extractAllDayOfWeek(),
      dayBreakDownData: this.dayBreakDownData
    };
  }

});
