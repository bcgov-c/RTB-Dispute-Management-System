import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import { routeParse } from '../../../routers/mainview_router';
import template from './CalendarYearlyReport_template.tpl';

const CALENDAR_YEAR_ROW = 3;

export default Marionette.View.extend({
  template,
  className: 'yearly-schedule-container',

  ui: {
    headerBanner: '.schedule-yearly-calendar-header'
  },

  events: {
    'click @ui.headerBanner': 'clickMonthHeader'
  },

  clickMonthHeader(ev) {
    const ele = $(ev.currentTarget);
    const month = ele.data('month');
    const year = this.model.get('currentYear');

    Backbone.history.navigate(routeParse('scheduled_hearings_monthly_param_item', null, Moment(`${year}-${month}`, 'YYYY-M').format('YYYY-MM')), { trigger: true });
  },

  extractAllMonthsOfYear() {
    const months = Moment.months();
    return months;
  },

  initialize() {
    this.currentPickedYear = this.model.get('currentYear');
    
    const yearlyEvents = this.model.get('events');
    if (yearlyEvents && !_.isEmpty(yearlyEvents)) {
      this.monthBreakDownData = yearlyEvents[0].month_breakdown;
    }
  },

  onDestroy() {
    $(window).off('resize');
  },

  templateContext() {
    const currentYear = Moment().year();
    const currentMonth = Moment().month() + 1;

    return {
      isOnFutureYear: this.currentPickedYear > currentYear,
      isOnCurrentYear: this.currentPickedYear === currentYear,
      numberOfColumn: 4,
      numberOfYearRow: CALENDAR_YEAR_ROW,
      currentMonth: currentMonth,
      currentYear: currentYear,
      currentPickedYear: this.currentPickedYear,
      headerLabel: this.extractAllMonthsOfYear(),
      monthBreakDownData: this.monthBreakDownData
    };
  }

});
