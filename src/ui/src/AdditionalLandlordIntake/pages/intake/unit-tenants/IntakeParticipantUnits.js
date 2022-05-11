 import Marionette from 'backbone.marionette';
import IntakeParticipantUnitView from './IntakeParticipantUnit';

export default Marionette.CollectionView.extend({
  template: _.noop,
  tagName: 'div',
  childView: IntakeParticipantUnitView,

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      console.log(childView);
      is_valid = childView.validateAndShowErrors() && is_valid;
    });
    return is_valid;
  }
});
