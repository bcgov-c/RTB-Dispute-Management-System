import Marionette from 'backbone.marionette';

import template from './ScheduleYearlyStatistic_template.tpl';

export default Marionette.View.extend({
  template,

  getUnusedSchedule(yearlyEvents) {
    const currentMonth = Moment().format('M');
    const scheduleAvailability = _.reduce(yearlyEvents, function(sum, item) {
      const hearingMonthYear = Moment(item.month, 'MM-YYYY').format('M');
      const isHearingInPast = currentMonth > hearingMonthYear;

      if (isHearingInPast) {
        return Number(item.month_unassigned) + sum;
      }
      return 0;
    }, 0);

    return scheduleAvailability;
  },

  getAvailableSchedule(yearlyEvents) {
    const currentMonth = Moment().format('M');
    const scheduleAvailability = _.reduce(yearlyEvents, function(sum, item) {
      const hearingMonthYear = Moment(item.month, 'MM-YYYY').format('M');
      const isHearingInFuture = currentMonth < hearingMonthYear;

      if (isHearingInFuture) {
        return Number(item.month_unassigned) + sum;
      }
      return 0;
    }, 0);

    return scheduleAvailability;
  },

  initialize() {
    // const self = this;
    const yearlyEvents = this.model.get('events');

    if (!_.isEmpty(yearlyEvents)) {
      _.each(yearlyEvents, function(event) {
        this.yearlyEvents = event.month_breakdown;
        this.yearAssigned = event.year_assigned;
        this.yearUnassigned = event.year_unassigned;
        this.yearHearings = event.year_hearings;
        this.yearUnused = this.getUnusedSchedule(this.yearlyEvents);
        this.yearAvailability = this.getAvailableSchedule(this.yearlyEvents);
      }, this);
    }
  },

  templateContext() {
    return {
      yearHearings: this.yearHearings,
      yearAssigned: this.yearAssigned,
      yearUnassigned: this.yearUnassigned,
      yearUnused: this.yearUnused,
      yearAvailability: this.yearAvailability
    };
  }

});
