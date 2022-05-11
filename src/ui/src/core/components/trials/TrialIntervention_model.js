import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const apiName = 'trialintervention';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'trial_intervention_guid',

  defaults: {
    trial_intervention_guid: null,
    trial_guid: null,
    trial_dispute_guid: null,
    trial_participant_guid: null,
    other_associated_id: null,
    intervention_selection_method: null,
    intervention_type: null,
    intervention_subtype: null,
    intervention_status: null,
    intervention_title: null,
    intervention_description: null,
    start_date: null,
    end_date: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'other_associated_id',
    'intervention_selection_method',
    'intervention_subtype',
    'intervention_status',
    'intervention_title',
    'intervention_description',
    'start_date',
    'end_date,'
  ],

  API_POST_ONLY_ATTRS: [
    'trial_dispute_guid',
    'trial_participant_guid',
    'intervention_type'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}${this.isNew() ? `/${this.get('trial_guid')}` : ''}`;
  },

});
