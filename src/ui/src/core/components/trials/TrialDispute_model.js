import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';
import TrialIntervention_collection from './TrialIntervention_collection';
import TrialIntervention_model from './TrialIntervention_model';
import TrialOutcome_collection from './TrialOutcome_collection';
import TrialOutcome_model from './TrialOutcome_model';
import TrialParticipant_collection from './TrialParticipant_collection';
import TrialParticipant_model from './TrialParticipant_model';

const apiName = 'trialdispute';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'trial_dispute_guid',

  defaults: {
    trial_dispute_guid: null,
    trial_guid: null,
    dispute_guid: null,
    dispute_role: null,
    dispute_type: null,
    dispute_trial_status: null,
    dispute_selection_method: null,
    dispute_opted_in: null,
    dispute_opted_in_by_participant_id: null,
    dispute_opted_in_by_staff_id: null,
    start_date: null,
    end_date: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,

    trial_participants: null,
    trial_interventions: null,
    trial_outcomes: null,
  },

  API_SAVE_ATTRS: [
    'dispute_role',
    'dispute_type',
    'dispute_trial_status',
    'dispute_selection_method',
    'dispute_opted_in',
    'dispute_opted_in_by_participant_id',
    'dispute_opted_in_by_staff_id',
    'start_date'
  ],

  API_POST_ONLY_ATTRS: [
    'dispute_guid',
  ],

  nested_collections_data() {
    return {
      trial_participants: TrialParticipant_collection,
      trial_interventions: TrialIntervention_collection,
      trial_outcomes: TrialOutcome_collection,
    };
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}${this.isNew() ? `/${this.get('trial_guid')}` : ''}`;
  },

  isTreatment() {
    return this.get('dispute_role') === configChannel.request('get', 'TRIAL_DISPUTE_ROLE_TREATMENT');
  },

  isOptedIn() {
    return this.isTreatment() || this.get('dispute_role') === configChannel.request('get', 'TRIAL_DISPUTE_ROLE_CONTROL');
  },

  isOptedOut() {
    return this.get('dispute_role') === configChannel.request('get', 'TRIAL_DISPUTE_ROLE_NOT_PARTICIPATING');
  },

  areOutcomesDisabled() {
    return this.get('dispute_trial_status') === configChannel.request('get', 'TRIAL_DISPUTE_STATUS_NO_OUTCOMES');
  },

  getPrimaryTrialParticipant() {
    const participant_id = participantsChannel.request('get:primaryApplicant:id');
    if (!participant_id) return null;
    return this.get('trial_participants').findWhere({ participant_id });
  },

  getOutcomeByType(outcomeType) {
    return this.get('trial_outcomes').findWhere({ outcome_type: outcomeType });
  },

  createTrialParticipantFromParticipant(participantModel, trialParticipantData={}) {
    return this._createTrialParticipant(Object.assign({
      participant_id: participantModel.id,
    }, trialParticipantData));
  },

  createTrialParticipantFromUser(userModel, trialParticipantData={}) {
    return this._createTrialParticipant(Object.assign({
      system_user_id: userModel.id,
    }, trialParticipantData));
  },

  _createTrialParticipant(trialParticipantData={}) {
    return new Promise((res, rej) => {
      const trialParticipant = new TrialParticipant_model(Object.assign({
        trial_guid: this.get('trial_guid'),
        dispute_guid: this.get('dispute_guid'),
        trial_dispute_guid: this.get('trial_dispute_guid'),
      }, trialParticipantData));
      trialParticipant.save().done(() => {
        this.get('trial_participants').add(trialParticipant, { merge: true });
        res(trialParticipant);
      }).fail(rej);
    });
  },

  createTrialIntervention(trialParticipant, trialInterventionData={}) {
    return new Promise((res, rej) => {
      const trialIntervention = new TrialIntervention_model(Object.assign({
        trial_guid: this.get('trial_guid'),
        dispute_guid: this.get('dispute_guid'),
        trial_dispute_guid: this.get('trial_dispute_guid'),
        trial_participant_guid: trialParticipant.id,
      }, trialInterventionData));
      trialIntervention.save().done(() => {
        this.get('trial_interventions').add(trialIntervention, { merge: true });
        res(trialIntervention);
      }).fail(rej);
    });
  },

  createTrialOutcome(trialParticipant, trialOutcomeData={}) {
    return new Promise((res, rej) => {
      const trialOutcome = new TrialOutcome_model(Object.assign({
        trial_guid: this.get('trial_guid'),
        dispute_guid: this.get('dispute_guid'),
        trial_dispute_guid: this.get('trial_dispute_guid'),
        trial_participant_guid: trialParticipant.id,
      }, trialOutcomeData));
      trialOutcome.save().done(() => {
        this.get('trial_outcomes').add(trialOutcome, { merge: true });
        res(trialOutcome);
      }).fail(rej);
    });
  },

});
