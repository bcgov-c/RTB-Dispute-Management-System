import CMModel from '../../../../core/components/model/CM_model';
import Radio from 'backbone.radio';

const postApiName = 'schedulemanager/schedulerequest/newschedulerequest';
const apiName = 'schedulemanager/schedulerequest';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'schedule_request_id',

  defaults: {
    schedule_request_id: null,
    requestor_system_user_id: null,
    request_type: null,
    request_submitter: null,
    request_owner: null,
    request_start: null,
    request_end: null,

    request_status: null,
    request_substatus: null,
    request_description: null,
    request_note: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_POST_ONLY_ATTRS: [
    'request_submitter',
  ],
  API_SAVE_ATTRS: [
    'request_owner',
    'request_type',
    'request_status',
    'request_substatus',
    'request_description',
    'request_note',
    'request_start',
    'request_end',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${this.isNew() ? postApiName : apiName}`;
  },

  isUnprocessed() {
    return this.get('request_status') && this.get('request_status') === configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED');
  },

  isReturnedForClarification() {
    return this.get('request_status') && this.get('request_status') === configChannel.request('get', 'SCHED_REQ_STATUS_RETURNED_FOR_CLARIFICATION');
  },

  isApprovedNotImplemented() {
    return this.get('request_status') && this.get('request_status') === configChannel.request('get', 'SCHED_REQ_STATUS_APPROVED_NOT_IMPLEMENTED');
  },

  isStatusRequiringAction() {
    return this.isUnprocessed() || this.isApprovedNotImplemented();
  },

  isTypeVacation() {
    return this.get('request_type') && this.get('request_type') === configChannel.request('get', 'SCHED_REQ_TYPE_VACATION');
  },

  isTypeWriting() {
    return this.get('request_type') && this.get('request_type') === configChannel.request('get', 'SCHED_REQ_TYPE_WRITING');
  },

  isTypeOtherWorking() {
    return this.get('request_type') && this.get('request_type') === configChannel.request('get', 'SCHED_REQ_TYPE_OTHER_WORKING');
  },

  isTypeOtherTimeOff() {
    return this.get('request_type') && this.get('request_type') === configChannel.request('get', 'SCHED_REQ_TYPE_OTHER_OFF');
  },

  isTypeScheduleAdjustment() {
    return this.get('request_type') && this.get('request_type') === configChannel.request('get', 'SCHED_REQ_TYPE_SCHEDULE_ADJUSTMENT');
  },
  
  getScheduleBlockType() {
    if (this.isTypeVacation()) return configChannel.request('get', 'SCHED_BLOCK_TYPE_VACATION');
    else if (this.isTypeWriting()) return configChannel.request('get', 'SCHED_BLOCK_TYPE_WRITING');
    else if (this.isTypeOtherWorking()) return configChannel.request('get', 'SCHED_BLOCK_TYPE_OTHER_WORKING');
    else if (this.isTypeOtherTimeOff()) return configChannel.request('get', 'SCHED_BLOCK_TYPE_OTHER_NON_WORKING');
    return null;
  }

  
});
