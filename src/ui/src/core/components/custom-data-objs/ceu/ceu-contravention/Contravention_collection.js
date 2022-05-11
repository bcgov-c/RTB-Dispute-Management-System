import Backbone from 'backbone';
import Contravenion_model from './Contravention_model';

export default Backbone.Collection.extend({
  model: Contravenion_model,

  /*
  saveInternalDataToModel() {
    this.each(model => model.saveInternalDataToModel());
  }
  */
});
