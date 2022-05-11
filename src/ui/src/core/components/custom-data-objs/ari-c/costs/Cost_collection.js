import Backbone from 'backbone';
import CostModel from './Cost_model';

export default Backbone.Collection.extend({
  model: CostModel
});