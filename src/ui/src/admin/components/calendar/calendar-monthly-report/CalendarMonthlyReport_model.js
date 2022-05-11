import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    numberOfMonthRow: null,
    headerLabel: null,
    rowEvents: null
  },

  parseMonthlyFromApi(apiHearings) {
    const events = [];
    const currentYear = Moment(apiHearings.month, 'YYYY-MM').format('YYYY');

    this.set('rowEvents', null, { silent: true });
    events.push(apiHearings);
    this.set({
      events,
      currentYear
    });
  },

  generateCalendarData(year, month) {
    const currentYearMonth = Moment(`${year}-${month}`, 'YYYY-MM');
    const weekNumberOfStartDay = currentYearMonth.startOf('month').format('d');
    const weekNumberOfEndDay = currentYearMonth.endOf('month').format('d');
    const numOfDayInCurrentMonth = currentYearMonth.daysInMonth();
    const calendarData = {
      weekNumberOfStartDay,
      weekNumberOfEndDay,
      numOfDayInCurrentMonth
    };

    return calendarData;
  }

});
