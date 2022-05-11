/**
 * @class core.components.participant.ParticipantCollection
 * @memberof core.components.participant
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ParticipantModel from './Participant_model';

const configChannel = Radio.channel('config');

export default Backbone.Collection.extend({
  model: ParticipantModel,

  // Individuals/Business go first, then Lawyer/Agent, then Advocate/Assistant
  comparator(participantOne, participantTwo) {
    const participant_one_type = participantOne.get('participant_type'),
      participant_two_type = participantTwo.get('participant_type'),
      participant_one_id = participantOne.id,
      participant_two_id = participantTwo.id;

    let return_val;
    if (_.all([participant_one_type, participant_two_type], function(type) { return _.contains([
          configChannel.request('get', 'PARTICIPANT_TYPE_PERSON'), configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS')
        ], type); })
    ) {
      if (participant_one_id === participant_two_id) {
        return_val = 0;
      } else if (!participant_one_id) {
        return_val = 1;
      } else if (!participant_two_id) {
        return_val = -1;
      } else {
        return_val = participant_one_id - participant_two_id;
      }
    } else {
      return_val = participant_one_type - participant_two_type;
    }
    return return_val;
  },

  getNumberOfPersonsAndBusinesses() {
    return this.filter(function(participant) {
      return participant.isPersonOrBusiness();
    }).length;
  },


  isValid() {
    return false;
  },

  validate() {
    var error_obj = {};
    this.each(function(participant, index) {
      const participant_validation_result = participant.validate();
      if (typeof participant_validation_result !== "undefined") {
        error_obj[index] = participant_validation_result;
      }
    });

    if (!_.isEmpty(error_obj)) {
      return error_obj;
    }
  }

}, {
  ClassType: 'ParticipantCollection'
});
