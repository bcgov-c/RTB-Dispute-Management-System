import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import HearingParticipantView from './HearingParticipant';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: HearingParticipantView,

  initialize(options) {
    this.mergeOptions(options, ['viewMode', 'unitCollection']);

    this.currentDisputeId = Radio.channel('dispute').request('get:id');
  },

  filter(model) {
    return model.get('dispute_guid') === this.currentDisputeId && this.currentDisputeId;
  },

  childViewOptions(child) {
    return {
      viewMode: this.viewMode,
      matchingUnit: !child.isNew() && !child.isOther() && this.unitCollection && this.unitCollection.find(unitModel => _.contains(unitModel.getParticipantIds(), child.get('participant_id')))
    };
  },

  saveInternalSaveDataToHearingModel() {
    this.children.each(function(childView) {
      if (childView) {
        childView.model.set(childView.getUIDataAttrs());
      }
    }, this);
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(childView) {
      if (childView) {
        is_valid = childView.validateAndShowErrors() & is_valid;
      }
    }, this);
    return is_valid;
  },

  onBeforeRender() {
    this.collection.sort();
  }
});
