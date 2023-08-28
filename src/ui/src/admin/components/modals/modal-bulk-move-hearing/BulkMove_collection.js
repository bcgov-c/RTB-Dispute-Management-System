import Backbone from 'backbone';
import BulkMoveModel from './BulkMove_model';

export default Backbone.Collection.extend({
  model: BulkMoveModel,

  comparator(hearing) {
    return Number(Moment(hearing.get('local_start_datetime')));
  },
})