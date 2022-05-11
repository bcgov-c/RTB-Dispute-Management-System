import Backbone from 'backbone';
import TrialOutcomeModel from './TrialOutcome_model';

export default Backbone.Collection.extend({
  model: TrialOutcomeModel
});
