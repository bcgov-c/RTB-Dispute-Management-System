/**
 * @class core.components.participant.IntakeParticipantCollectionView
 * @memberof core.components.participant
 * @augments Marionette.CollectionView
 */
 
import Marionette from 'backbone.marionette';
import IntakeParticipantView from './IntakeParticipant';

export default Marionette.CollectionView.extend({
  template: _.noop,
  tagName: 'div',
  className: 'intake-participants-component',

  childView: IntakeParticipantView,
  childViewOptions() {
    return {
      baseName: this.getOption('baseName'),
      enableUnitType: this.getOption('enableUnitType'),
      enableKnownContact: this.getOption('enableKnownContact'),
    };
  },

  childViewTriggers: {
    'click:delete': 'click:delete'
  },

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
