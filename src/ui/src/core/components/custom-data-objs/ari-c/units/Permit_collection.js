import Backbone from 'backbone';
import PermitModel from './Permit_model';

export default Backbone.Collection.extend({
  model: PermitModel,
});
