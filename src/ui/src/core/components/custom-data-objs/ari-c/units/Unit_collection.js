import Backbone from 'backbone';
import UnitModel from './Unit_model';

export default Backbone.Collection.extend({
  model: UnitModel,

  setTo(count, attrsToSet=null, options) {
    if (!count) {
      return;
    }
    options = options || {};
    attrsToSet = attrsToSet || {};
    const difference = count - this.length;
    const scopedFnToUse = difference >= 0 ? this.add.bind(this, attrsToSet || {}, options) : this.pop.bind(this, options);
    
    _.times(difference < 0 ? difference*-1 : difference, scopedFnToUse, this);
  },

  saveInternalDataToModel() {
    this.each(model => model.saveInternalDataToModel());
  }
});
