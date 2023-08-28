import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';

const hearing_participation_api_url = 'hearingParticipation';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'hearing_participation_id',

  defaults: {
    hearing_participation_id: null,
    participant_id: null,
    dispute_guid: null,
    name_abbreviation: null,
    other_participant_name: null,
    other_participant_title: null,
    other_participant_association: null,
    participation_status: null,
    participation_comment: null,
    hearing_id: null,

    // UI-only fields
    participant_model: null, // The nested info for the participant
    landlordOrTenant: null,

    // System created fields
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'participant_id',
    'dispute_guid',
    'other_participant_name',
    'other_participant_title',
    'other_participant_association',
    'participation_status',
    'participation_comment'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${hearing_participation_api_url}${this.isNew() ? '/'+this.get('hearing_id') : ''}`;
  },

  isOther() {
    return !this.get('participant_id');
  },

  isApplicant() {
    return !this.isOther() && this.get('participant_model') ? this.get('participant_model').isApplicant() :
        this.get('other_participant_association') === configChannel.request('get', 'HEARING_PARTICIPATION_ASSOCIATION_APPLICANT');
  },

  isRespondent() {
    return !this.isOther() && this.get('participant_model') ? this.get('participant_model').isRespondent() :
        this.get('other_participant_association') === configChannel.request('get', 'HEARING_PARTICIPATION_ASSOCIATION_RESPONDENT');
  },

  didAttend() {
    return !!this.get('participation_status');
  },

  isAttendStatusUnknown() {
    return this.get('participation_status') === null || this.get('participation_status') === undefined;
  },

  getInitialsDisplay() {
    return `${(this.get('name_abbreviation')||'').trim()}` || this.get('participant_model')?.getInitialsDisplay();
  },

  getDisplayName() {
    return this.isOther() ? this.get('other_participant_name') : this.get('participant_model')?.getDisplayName();
  },

  setToUnattended() {
    this.set({
      other_participant_name: null,
      other_participant_title: null,
      other_participant_association: null,
      participation_status: null,
      participation_comment: null,
    });
  },

});
