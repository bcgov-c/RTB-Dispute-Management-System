import Backbone from 'backbone';
import HearingParticipationModel from './HearingParticipation_model';

export default Backbone.Collection.extend({
  model: HearingParticipationModel,

  comparator(model) {
    const RESPONDENT_OFFSET = 100000000;
    let order = 0;
    if (model.isOther()) {
      // If it's "other", put to bottom asc by created time
      order = (model.get('created_date') ? Moment(model.get('created_date')) : Moment()).unix();
    } else {
      const participantModel = model.get('participant_model');
      // Show applicants then respondents
      order = (participantModel && participantModel.isRespondent() ? RESPONDENT_OFFSET : 0) + model.get('participant_id');
    }
    return order;
  },

  getApplicantParticipations() {
    return this.filter(function(participation) { return participation.isApplicant(); });
  },

  getRespondentParticipations() {
    return this.filter(function(participation) { return participation.isRespondent(); });
  },

  resetCollection() {
    // Resets the collection to a version where only saved API data is present
    const toRemove = [];
    this.each(function(model) {
      if (model.isNew()) {
        toRemove.push(model);
      } else {
        model.resetModel();
      }
    });
    this.remove(toRemove);
  }

});
