
import Marionette from 'backbone.marionette';
import UnitCostAssociationView from './UnitCostAssociation';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: UnitCostAssociationView,

  initialize(options) {
    this.unitCollection = (options || {}).unitCollection;
    this.capitalCostsData = (options || {}).capitalCostsData;
  },

  childViewOptions(model, index) {
    return {
      childViewIndex: index+1,
      unitCollection: this.unitCollection,
      capitalCostsData: this.capitalCostsData
    };
  },

  toIntakeAriData() {
    return this.children.map(unitCostView => {
      return unitCostView && unitCostView.isRendered() && _.isFunction(unitCostView.toIntakeAriData) ?
        unitCostView.toIntakeAriData() : {};
    }).filter(data => !_.isEmpty(data));
  },

  validateAndShowErrors() {
    let isValid = true;
    this.children.each(function(childView) {
      if (childView && typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      isValid = childView.validateAndShowErrors() && isValid;
    });
    
    return isValid;
  }
});
