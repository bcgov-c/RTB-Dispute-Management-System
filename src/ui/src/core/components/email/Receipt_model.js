import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';

const api_name = 'submissionreceipt';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default CMModel.extend({
  idAttribute: 'submission_receipt_id',

  defaults: {
    submission_receipt_id: null,
    participant_id: null,
    receipt_type: null,
    receipt_subtype: null,
    receipt_title: null,
    receipt_body: null,
    receipt_date: null,
    receipt_printed: null,
    receipt_emailed: null,
  },

  API_SAVE_ATTRS: [
    "participant_id",
    "receipt_type",
    "receipt_subtype",
    "receipt_title",
    "receipt_body",
    "receipt_date",
    "receipt_printed",
    "receipt_emailed",
  ],

  initialize() {
    if (this.get('receipt_title')) this.set({ receipt_title: this.get('receipt_title').replace(/Receipt:/g, "") })
  },

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  getSiteTypeDisplay() {
    if (!this.get('receipt_type')) return '-';
    return configChannel.request('get', 'EMAIL_RECEIPT_SITE_CODES')[this.get('receipt_type')]
  },
});
