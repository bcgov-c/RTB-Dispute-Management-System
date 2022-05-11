import Backbone from 'backbone';
import DocRequestItemModel from './DocRequestItem_model';

export default Backbone.Collection.extend({
  model: DocRequestItemModel,

  initialize() {
    this.on('submit:clicked', () => this.forEach(model => model.trigger('validate:view')));
  }
});
