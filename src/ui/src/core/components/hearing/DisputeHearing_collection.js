import Backbone from 'backbone';
import DisputeHearingModel from './DisputeHearing_model';

export default Backbone.Collection.extend({
  model: DisputeHearingModel,

  hasActiveHearings() {
    return this.any(function(model) {
      return model.isActive() && !model.get('is_deleted');
    });
  },

  getPrimary() {
    return this.find(function(model) { return model.isPrimary(); });
  },

  getSecondaries() {
    return this.filter(function(model) { return model.isSecondary(); });
  }
});
