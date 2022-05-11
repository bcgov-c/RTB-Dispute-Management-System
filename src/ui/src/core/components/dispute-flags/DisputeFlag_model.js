import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const apiBaseName = 'disputeflag';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default CMModel.extend({
  idAttribute: 'dispute_flag_id',

  defaults: {
    dispute_flag_id: null,
    dispute_guid: null,
    file_number: null,
    flag_title: null,
    flag_status: null,
    flag_type: null,
    flag_subtype: null,
    flag_owner_id: null,
    flag_participant_id: null,
    related_object_id: null,
    flag_start_date: null,
    flag_end_date: null,
    is_public: false,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'flag_title',
    'flag_status',
    'flag_type',
    'flag_subtype',
    'flag_owner_id',
    'flag_participant_id',
    'related_object_id',
    'flag_start_date',
    'flag_end_date',
    'is_public',
  ],

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiBaseName}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  isActive() {
    return this.get('flag_status') === configChannel.request('get', 'DISPUTE_FLAG_STATUS_ACTIVE');
  },

  isLinked() {
    return this.get('dispute_guid') && (this.get('dispute_guid') !== disputeChannel.request('get:id'))
  },

  isAdjourned() {
    return this.getFlagId() === configChannel.request('get', 'FLAG_ID_ADJOURNED');
  },

  isSubServiceRequested() {
    return this.getFlagId() === configChannel.request('get', 'FLAG_ID_SUB_SERVICE_REQUESTED')
  },

  isSubServiceApproved() {
    return this.getFlagId() === configChannel.request('get', 'FLAG_ID_SUB_SERVICE_APPROVED')
  },

  isReviewHearing() {
    return this.getFlagId() === configChannel.request('get', 'FLAG_ID_REVIEW_HEARING')
  },

  isReview() {
    return this.getFlagId() === configChannel.request('get', 'FLAG_ID_REVIEW') || this.getFlagId() === configChannel.request('get', 'FLAG_ID_REVIEW_LATE');
  },

  isLateReview() {
    return this.getFlagId() === configChannel.request('get', 'FLAG_ID_REVIEW_LATE');
  },

  getFlagId() {
    // Gets derived flag id from flag_type and flag_subtype. This is the business logic lookup val used in configs
    return `${this.get('flag_type')}-${this.get('flag_subtype')}`;
  },
});
