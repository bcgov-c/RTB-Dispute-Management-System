import Backbone from 'backbone';
import ConferenceBridgeModel from './ConferenceBridge_model';

export default Backbone.Collection.extend({
  model: ConferenceBridgeModel
});