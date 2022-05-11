
import Backbone from 'backbone';
import HearingModel from './Hearing_model';

export default Backbone.Collection.extend({
  model: HearingModel,

  comparator(hearing) {
    return -Number(Moment(hearing.get('local_start_datetime')));
  },

  getLatest() {
    return this.length ? this.at(0) : null;
  },
  
  getActive() {
    return this.find(function(hearing) { return hearing.isActive(); });
  },

  hasActive() {
  return !!this.getActive();
  }
});
