import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';

const api_name = 'dispute/status';
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default CMModel.extend({
  idAttribute: 'dispute_status_id',
  defaults: {
    dispute_status_id: null,
    dispute_guid: null,
    dispute_status: null,
    dispute_stage: null,
    process: null,
    owner: null,
    evidence_override: null,
    status_note: null,
    duration_seconds: null,
    status_start_date: null,
    status_set_by: null
  },

  API_SAVE_ATTRS: [
    'stage',
    'status'
  ],  

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  }

});
