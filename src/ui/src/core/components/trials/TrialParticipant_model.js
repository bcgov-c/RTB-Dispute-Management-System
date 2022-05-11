import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const apiName = 'trialparticipant';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'trial_participant_guid',

  defaults: {
    trial_participant_guid: null,
    trial_guid: null,
    dispute_guid: null,
    participant_type: null,
    participant_id: null,
    system_user_id: null,
    participant_role: null,
    participant_status: null,
    participant_selection_method: null,
    participant_opted_in: null,
    other_participant_title: null,
    other_participant_description: null,
    start_date: null,
    end_date: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'participant_type',
    'participant_role',
    'participant_status',
    'participant_selection_method',
    'participant_opted_in',
    'other_participant_title',
    'other_participant_description',
    'start_date',
    'end_date,'
  ],

  API_POST_ONLY_ATTRS: [
    'dispute_guid',
    'participant_id',
    'system_user_id',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}${this.isNew() ? `/${this.get('trial_guid')}` : ''}`;
  },

});
