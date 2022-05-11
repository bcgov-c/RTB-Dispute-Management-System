import Backbone from 'backbone';
import ServiceModel from './Service_model';

export default Backbone.Collection.extend({
  model: ServiceModel,

  areAllServed() {
    return this.all(model => model.isServed());
  },

  areAllAcknowledgedServed() {
    return this.all(model => model.isAcknowledgedServed());
  },

  areAllDeemedServed() {
    return this.all(model => model.isDeemedServed())    
  },

  areAllNotServed() {
    return this.all(model => !model.isServed());
  },

  isAnyServiceUnknown() {
    return this.any(model => model.isServiceUnkown());
  }
});