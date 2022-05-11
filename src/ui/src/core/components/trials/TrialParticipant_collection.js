import Backbone from 'backbone';
import TrialParticipantModel from './TrialParticipant_model';

export default Backbone.Collection.extend({
  model: TrialParticipantModel
});
