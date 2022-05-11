import Backbone from 'backbone';
import SchedulePeriod_model from './SchedulePeriod_model';

export default Backbone.Collection.extend({
  model: SchedulePeriod_model,
  comparator: 'schedule_period_id',

  getCurrentPeriod() {
    const todayMoment = Moment();
    return this.find(period => (
      Moment(period.get('period_start')).isSameOrBefore(todayMoment, 'minutes') &&
      Moment(period.get('period_end')).isAfter(todayMoment, 'minutes')
    ));
  },

  getPeriodsInDateRange(startDate, endDate=null) {
    // If no end date is passed, all future periods will be returned
    const startUnix = startDate.unix();
    const endUnix = endDate?.unix();
    return this.filter(p => {
      const pStart = Moment(p.get('period_start')).unix();
      const pEnd = Moment(p.get('period_end')).unix();
      return ((endUnix ? pStart <= endUnix : true) && pStart >= startUnix) ||
          (pStart <= startUnix && (endUnix ? startUnix <= pEnd : true));
    });
  },

});