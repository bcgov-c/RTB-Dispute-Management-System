import Backbone from 'backbone';
import CeuUnit_model from './CeuUnit_model';

export default Backbone.Collection.extend({
  model: CeuUnit_model,

  setTo(count, attrsToSet=null, options={}) {
    if (!count || count < this.length) return;

    attrsToSet = attrsToSet || {};
    const difference = count - this.length;
    const scopedFnToUse = difference >= 0 ? this.add.bind(this, attrsToSet || {}, options) : this.pop.bind(this, options);
    _.times(difference < 0 ? difference*-1 : difference, scopedFnToUse, this);
  },

  saveInternalDataToModel(options={}) {
    const returnData = [];
    this.each(model => {
      const saveData = model.saveInternalDataToModel(options);
      if (options.returnOnly) returnData.push(saveData);
    });
    return returnData;
  }
});
