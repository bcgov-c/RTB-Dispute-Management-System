import Backbone from 'backbone';
import ComposerInstanceModel from './ComposerInstance_model';

export default Backbone.Collection.extend({
  model: ComposerInstanceModel
});