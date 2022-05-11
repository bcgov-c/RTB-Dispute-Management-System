import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const api_name = 'outcomedocdelivery';
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'outcome_doc_delivery_id',
  defaults: {
    outcome_doc_delivery_id: null,
    dispute_guid: null,
    outcome_doc_file_id: null,
    participant_id: null,
    
    delivery_method: null,
    delivery_comment: null,
    delivery_priority: null,
    is_delivered: false,
    delivery_date: null,
    confirmed_received: null,
    received_date: null,
    ready_for_delivery: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_POST_ONLY_ATTRS: [
    'dispute_guid',
    'outcome_doc_file_id',
    'participant_id'
  ],

  API_SAVE_ATTRS: [
    'delivery_method',
    'delivery_comment',
    'delivery_priority',
    'is_delivered',
    'delivery_date',
    'confirmed_received',
    'received_date',
    'ready_for_delivery'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('outcome_doc_file_id')}` : '');
  },

  isOtherDeliveryMethod() {
    return this.get('delivery_method') === configChannel.request('get', 'SEND_METHOD_OTHER');
  },

  isNonParticipant() {
    return !this.get('participant_id');
  },
});