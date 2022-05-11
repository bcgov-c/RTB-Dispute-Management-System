import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const apiName = 'trialoutcome';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'trial_outcome_guid',

  defaults: {
    trial_outcome_guid: null,
    trial_guid: null,
    trial_intervention_guid: null,
    trial_dispute_guid: null,
    trial_participant_guid: null,
    outcome_by: null,
    outcome_subtype: null,
    outcome_status: null,
    outcome_title: null,
    outcome_value1: null,
    outcome_value2: null,
    outcome_value3: null,
    outcome_value4: null,
    outcome_string1: null,
    outcome_string2: null,
    outcome_string3: null,
    outcome_type: null,
    outcome_json: null,
    outcome_comment: null,
    start_date: null,
    end_date: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'outcome_by',
    'outcome_subtype',
    'outcome_status',
    'outcome_title',
    'outcome_value1',
    'outcome_value2',
    'outcome_value3',
    'outcome_value4',
    'outcome_string1',
    'outcome_string2',
    'outcome_string3',
    'outcome_json',
    'outcome_comment',
    'start_date',
    'end_date,'
  ],

  API_POST_ONLY_ATTRS: [
    'outcome_type',
    'trial_intervention_guid',
    'trial_dispute_guid',
    'trial_participant_guid'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}${this.isNew() ? `/${this.get('trial_guid')}` : ''}`;
  },

});
