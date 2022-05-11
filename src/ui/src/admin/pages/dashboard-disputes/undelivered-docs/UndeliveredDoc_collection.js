import Backbone from 'backbone';
import UndeliveredDocModel from './UndeliveredDoc_model';

export default Backbone.Collection.extend({
  model: UndeliveredDocModel,
  comparator: 'delivery_creation'
});
