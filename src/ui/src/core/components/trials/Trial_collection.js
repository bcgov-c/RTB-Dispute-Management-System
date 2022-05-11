import Backbone from 'backbone';
import TrialModel from './Trial_model';

export default Backbone.Collection.extend({
  model: TrialModel
});
