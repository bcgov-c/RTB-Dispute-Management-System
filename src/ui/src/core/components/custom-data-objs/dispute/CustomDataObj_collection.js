import Backbone from 'backbone';
import CustomDataObjModel from './CustomDataObj_model';

export default Backbone.Collection.extend({
  model: CustomDataObjModel,
  comparator(model) { return -model.id; }
});
