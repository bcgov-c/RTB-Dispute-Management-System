import Marionette from 'backbone.marionette';

import UnitRentIncreaseView from './UnitRentIncrease';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: UnitRentIncreaseView,

  initialize(options) {
    this.unitCollection = (options || {}).unitCollection;
    this.capitalCostsData = (options || {}).capitalCostsData;
  },

  getTotalSelectedUnits() {
    let amount = 0;
    this.children.each(childView => {
      if (childView && childView.isRendered() && _.isFunction(childView.isChecked)) {
        if (childView.isChecked()) {
          amount++;
        }
      }
    });
    return amount;
  },

  getTotalSelectedTenants() {
    let amount = 0;
    this.children.each(childView => {
      if (childView && childView.isRendered() && _.isFunction(childView.getSelectedTenants)) {
        amount += Number(childView.getSelectedTenants());
      }
    });
    return amount;
  },

  validateAndShowErrors() {
    let isValid = true;
    this.children.each(function(childView) {
      if (childView && childView.isRendered() && _.isFunction(childView.validateAndShowErrors)) {
        isValid = childView.validateAndShowErrors() && isValid;
      }
    });
    return isValid;
  },

  saveInternalDataToModel() {
    this.children.each(function(childView) {
      if (childView && childView.isRendered() && _.isFunction(childView.saveInternalDataToModel)) {
        childView.saveInternalDataToModel();
      }
    });
  }
  
});