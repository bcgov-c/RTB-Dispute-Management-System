import Marionette from 'backbone.marionette';
import CeuApplicant from './CeuApplicant';

export default Marionette.CollectionView.extend({
  template: _.noop,
  tagName: 'div',
  className: 'intake-participants-component',

  childView: CeuApplicant,
  childViewOptions() {
    return {
      baseName: this.getOption('baseName'),
      contactInfoName: this.getOption('contactInfoName'),
      participantTypes: this.getOption('participantTypes'),
      enableBirthday: this.getOption('enableBirthday'),
      enableDelete: this.getOption('enableDelete'),
      enableCountrySelection: this.getOption('enableCountrySelection'),
      showNameWarning: this.getOption('showNameWarning'),
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
      is_valid = childView.validateAndShowErrors() && is_valid;
    });
    return is_valid;
  },

  saveInternalDataToModel(options={}) {
    const returnData = [];
    this.children.forEach(childView => {
      if (typeof childView.saveInternalDataToModel === "function") {
        const saveData = childView.saveInternalDataToModel(options);
        if (options.returnOnly) {
          returnData.push(saveData);
        }
      }
    });
    return returnData;
  },

});
