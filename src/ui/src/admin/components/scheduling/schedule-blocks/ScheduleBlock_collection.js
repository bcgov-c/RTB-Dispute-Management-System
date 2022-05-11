import Backbone from 'backbone';
import ScheduleBlockModel from './ScheduleBlock_model';

export default Backbone.Collection.extend({
  model: ScheduleBlockModel,
});