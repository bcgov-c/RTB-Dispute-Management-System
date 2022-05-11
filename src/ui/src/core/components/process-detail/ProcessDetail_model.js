import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const api_name = 'dispute/processdetail';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default CMModel.extend({
  idAttribute: 'dispute_process_detail_id',
  defaults: {
    dispute_process_detail_id: null,
    associated_process: null,
    process_applicant1_id: null,
    process_applicant2_id: null,
    process_duration: null,
    process_complexity: null,
    process_method: null,
    process_outcome_code: null,
    process_outcome_title: null,
    process_outcome_description: null,
    process_outcome_note: null,
    process_reason_code: null,
    start_dispute_status_id: null,
    writing_duration: null,
    preparation_duration: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'process_applicant1_id',
    'process_applicant2_id',
    'process_duration',
    'process_complexity',
    'process_method',
    'process_outcome_code',
    'process_outcome_title',
    'process_outcome_description',
    'process_outcome_note',
    'process_reason_code',
    'writing_duration',
    'preparation_duration'
  ],  

  API_POST_ONLY_ATTRS: [
    'associated_process',
  ],

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  hasSavedData() {
    return !!(this.API_SAVE_ATTRS || []).some(attr => this.get(attr));
  },
});
