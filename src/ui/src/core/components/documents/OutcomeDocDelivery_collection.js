import Backbone from 'backbone';
import OutcomeDocDeliveryModel from './OutcomeDocDelivery_model';

export default Backbone.Collection.extend({
  model: OutcomeDocDeliveryModel,

  deleteAll() {
    const dfd = $.Deferred();
    Promise.all(this.map(function(delivery) { return delivery.destroy(); }))
      .then(dfd.resolve, dfd.fail);
    return dfd.promise();
  }
});