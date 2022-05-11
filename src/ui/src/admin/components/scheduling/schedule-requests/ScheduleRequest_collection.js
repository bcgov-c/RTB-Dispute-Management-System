import Backbone from 'backbone';
import ScheduleRequestModel from './ScheduleRequest_model';

export default Backbone.Collection.extend({
  model: ScheduleRequestModel,

  getActiveRequests() {
    return this.filter(request => Moment(request.get('request_end')).isAfter(Moment()) && (request.isStatusRequiringAction()));
  },

  getActiveRequestsCount() {
    return this.getActiveRequests().length;
  },

  getPastActiveRequestsCount() {
    return this.filter(request => Moment(request.get('request_end')).isBefore(Moment()) && (request.isStatusRequiringAction())).length;
  }
});