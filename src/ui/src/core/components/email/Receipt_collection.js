import Backbone from 'backbone';
import ReceiptModel from './Receipt_model';

export default Backbone.Collection.extend({
  model: ReceiptModel,
});
