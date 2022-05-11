/**
 * @class core.components.dispute.DisputeStatusModel
 * @memberof core.components.dispute
 * @augments Backbone.Model
 */

import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';

const api_name = 'dispute/status';
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'dispute_status_id',
  defaults: {
    dispute_status_id: null,
    dispute_stage: null,
    dispute_status: null,
    dispute_status_id: null,
    duration_seconds: null,
    evidence_override: null,
    owner: null,
    process: null,
    status_note: null,
    status_set_by: null,
    status_start_date: null,

    // Passed in from creator, used duration save
    dispute_guid: null
  },

  API_SAVE_ATTRS: [
    'dispute_stage',
    'dispute_status',
    'evidence_override',
    'owner',
    'process',
    'status_note'
  ],

  initialize() {
    const by = this.get('status_set_by');
    const when = this.get('status_start_date');

    // Set the fields that are default on other models.  Only modified_by and modified_date are displayed here
    this.set({
      modified_by: by,
      modified_date: when
    });
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${this.get('dispute_guid')}`;
  }

});
