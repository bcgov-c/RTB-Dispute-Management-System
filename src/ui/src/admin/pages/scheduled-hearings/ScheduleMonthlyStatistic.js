import Marionette from 'backbone.marionette';

import template from './ScheduleMonthlyStatistic_template.tpl';

export default Marionette.View.extend({
  template,

  getAvailableSchedule(monthlyEvents) {
    const today = Moment(new Date(), 'MM-DD-YYYY').utc();
    const scheduleAvailability = _.reduce(monthlyEvents, function(sum, item) {
      const hearingDate = Moment(item.date, 'MM-DD-YYYY').utc();
      const isFuture = today.diff(hearingDate, 'days') > 0;

      if (isFuture) {
        return Number(item.day_unassigned) + sum;
      }
      return 0;
    }, 0);

    return scheduleAvailability;
  },

  initialize() {
    const self = this;
    const monthlyEvents = this.model.get('events');

    if (!_.isEmpty(monthlyEvents)) {
      _.each(monthlyEvents, function(event) {
        self.monthlyEvents = event.day_breakdown;
        self.monthAssigned = event.month_assigned;
        self.monthUnassigned = event.month_unassigned;
        self.monthHearings = event.month_hearings;
        self.monthAvailability = self.getAvailableSchedule(self.monthlyEvents)
      });
    }
  },

  templateContext() {
    return {
      monthHearings: this.monthHearings,
      monthAssigned: this.monthAssigned,
      monthUnassigned: this.monthUnassigned,
      monthAvailability: this.monthAvailability
    };
  }

});
