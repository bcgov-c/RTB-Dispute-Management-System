/**
 * @class core.components.participant.IntakeParticipantCollection
 * @memberof core.components.participant
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import IntakeParticipantModel from './IntakeParticipant_model';
import ParticipantModel from './Participant_model';

export default Backbone.Collection.extend({
  model: IntakeParticipantModel,

  personBusinessModelOptions: {
    participantTypeUI: 1
  },

  assistantModelOptions: {
    participantTypeUI: 2
  },

  comparator(participantOne, participantTwo) {
    const participant_one_type_ui = participantOne.get('participantTypeUI'),
      participant_two_type_ui = participantTwo.get('participantTypeUI'),
      participant_one_id = participantOne.get(participantOne.get('participantModel').idAttribute),
      participant_two_id = participantTwo.get(participantTwo.get('participantModel').idAttribute);

    let return_val;
    if (participant_one_type_ui === participant_two_type_ui) {
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
      return_val = participant_one_type_ui - participant_two_type_ui;
    }
    return return_val;
  },


  initialize(models, options) {
    options = options || {};
    this.participantCollection = options.participantCollection;
    this.collectionOptions = options;

    if (!this.participantCollection) {
      console.log(`[Error] Need a participantCollection in the IntakeParticipantCollection`, this);
      return;
    }

    // Sync between the collection we're using
    this.on('add:intakeParticipant', function(addedIntakeModel) {
      const participantModel = addedIntakeModel.get('participantModel');
      if (!participantModel) {
        console.log(`[Error] Added an IntakeParticipant to collection without a valid participantModel`, addedIntakeModel, this);
      }
      if (participantModel && !this.participantCollection.get(participantModel)) {
        this.participantCollection.add(participantModel);
      }
    }, this);
    this.on('remove', function(intakeModel) {
      const participantModel = intakeModel.get('participantModel');
      if (participantModel && participantModel.isNew()) {
        this.participantCollection.remove(participantModel);
      }
    }, this);
  },

  getNumberOfAssistants() {
    return this.filter(function(participant) {
      return participant.isAssistant();
    }).length;
  },

  getNumberOfPersonsAndBusinesses() {
    return this.filter(function(participant) {
      return participant.isPersonOrBusiness();
    }).length;
  },

  removeLastPersonOrBusiness() {
    const lastPersonOrBusinessParticipantIndex = this.findLastIndex(function(p) { return p.isPersonOrBusiness(); });
    if (lastPersonOrBusinessParticipantIndex === -1) {
      console.log(`[Warning] No person or business to remove`);
      return;
    }
    this._removeIntakeParticipant(this.at(lastPersonOrBusinessParticipantIndex));
  },

  removeLastAssistant() {
    const lastAssistantParticipantIndex = this.findLastIndex(function(p) { return p.isAssistant(); });
    if (lastAssistantParticipantIndex === -1) {
      console.log(`[Warning] No assistant to remove`);
      return;
    }
    this._removeIntakeParticipant(this.at(lastAssistantParticipantIndex));
  },

  removeFromPersonsAndBusinesses(num_participants_to_remove) {
    _.times(num_participants_to_remove, this.removeLastPersonOrBusiness, this);
  },

  addToPersonsAndBusinesses(num_participants_to_add) {
    _.times(num_participants_to_add, function() {
      this._addIntakeParticipant(this.personBusinessModelOptions);
    }, this);
  },

  removeFromAssistants(num_participants_to_remove) {
    _.times(num_participants_to_remove, this.removeLastAssistant, this);
  },

  addToAssistants(num_participants_to_add) {
    _.times(num_participants_to_add, function() {
      this._addIntakeParticipant(this.assistantModelOptions);
    }, this);
  },

  removeAssistants() {
    const to_remove = [];
    this.each(function(p) {
      if (p.isAssistant()) {
        to_remove.push(p);
      }
    }, this);

    _.each(to_remove, function(p) {
      this._removeIntakeParticipant(p);
    }, this);
  },

  // This just removes the intake participant from the collection, without any API deletes
  // On page Next is when deletes happen, or changes can be undone if an API participant was removed
  _addIntakeParticipant(intakeParticipantOptions) {
    const intakeParticipant = new IntakeParticipantModel(_.extend({...intakeParticipantOptions, ...this.collectionOptions}, {
      participantModel: new ParticipantModel()
    }), { collection: this });
    this.add(intakeParticipant);
    this.trigger('add:intakeParticipant', intakeParticipant);
  },

  _removeIntakeParticipant(intakeParticipant) {
    this.remove(intakeParticipant);
    this.trigger('remove:intakeParticipant', intakeParticipant);
  },

  needsApiUpdate() {
    return this.any(function(m) { return m.isNew(); }) || this.any(function(m) {
      return typeof m.needsApiUpdate === 'function' ? m.needsApiUpdate() : false;
    });
  },

  resetCollection() {
    // Remove any non-API changes and non-API models
    const to_remove = [];
    this.each(function(m) {
      if (m.isNew()) {
        to_remove.push(m);
      } else if (typeof m.resetModel === 'function') {
        m.resetModel();
      }
    });
    this.remove(to_remove, { silent: true });
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
  ClassType: 'IntakeParticipantCollection'
});
