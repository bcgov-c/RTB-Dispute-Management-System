import Backbone from 'backbone';
import RemedyModel from './Remedy_model';

export default Backbone.Collection.extend({
  model: RemedyModel
});