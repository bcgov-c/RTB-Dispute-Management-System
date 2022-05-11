import Marionette from 'backbone.marionette';

import ParticipantOutcomeDeliveryView from './ParticipantOutcomeDelivery';

const EmptyParticipantOutcomeDeliveryView = Marionette.View.extend({
  template: _.template(`No outcome deliveries`),
  className: 'standard-list-empty'
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  emptyView: EmptyParticipantOutcomeDeliveryView,
  childView: ParticipantOutcomeDeliveryView,

  resetModelValues() {
    this.children.each(function(child) {
      child.resetModelValues();
    });
  },

  saveInternalDataToModel() {
    this.children.each(function(child) {
      child.saveInternalDataToModel();
    });
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(child) {
      is_valid = is_valid & child.validateAndShowErrors();
    });
    return is_valid;
  }
 
});
