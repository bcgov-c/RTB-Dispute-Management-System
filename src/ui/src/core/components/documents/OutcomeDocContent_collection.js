import Backbone from 'backbone';
import OutcomeDocContentModel from './OutcomeDocContent_model';

export default Backbone.Collection.extend({
  model: OutcomeDocContentModel
});