import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');
const disputeChannel = Radio.channel('dispute');
const taskChannel = Radio.channel('tasks');
const apiBaseName = 'task';

export default CMModel.extend({
  idAttribute: 'task_id',

  defaults: {
    task_id: null,
    dispute_guid: null,
    task_linked_to: null,
    task_link_id: null,
    task_type: null,
    task_sub_type: null,
    task_text: null,
    task_priority: null,
    task_status: 0,
    date_task_completed: null,
    file_number: null,
    task_owner_id: null,
    task_due_date: null,
    created_date: null,
    created_by: null,
    last_owner_id: null,
    unassigned_duration_seconds: null,
    assigned_duration_seconds: null,
    modified_date: null,
    task_activity_type: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'task_owner_id',
    'task_linked_to',
    'task_link_id',
    'task_due_date',
    'task_priority',
    'task_text',
    'task_status',
    'task_type',
    'task_sub_type',
    'task_activity_type'
  ],

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiBaseName}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  isAssigned() {
    return this.get('task_owner_id');
  },

  _checkAttrributeAgainstConfig(attrName, configCode) {
    return this.get(attrName) === configChannel.request('get', configCode);
  },

  isUnassignedIO() {
    return !this.isAssigned() && this._checkAttrributeAgainstConfig('task_sub_type', 'TASK_SUB_TYPE_IO');
  },

  isUnassignedArb() {
    return !this.isAssigned() && this._checkAttrributeAgainstConfig('task_sub_type', 'TASK_SUB_TYPE_ARB');
  },

  isUnassignedAdmin() {
    return !this.isAssigned() && this._checkAttrributeAgainstConfig('task_sub_type', 'TASK_SUB_TYPE_ADMIN');
  },

  isSubTypeArb() {
    return this._checkAttrributeAgainstConfig('task_sub_type', 'TASK_SUB_TYPE_ARB');
  },

  isSubTypeIO() {
    return this._checkAttrributeAgainstConfig('task_sub_type', 'TASK_SUB_TYPE_IO');
  },

  isSubTypeAdmin() {
    return this._checkAttrributeAgainstConfig('task_sub_type', 'TASK_SUB_TYPE_ADMIN');
  },

  getSubTypeDisplay() {
    if (!this.get('task_sub_type')) return '-';
    return (configChannel.request('get', 'USER_ROLE_GROUP_TASK_MAPPINGS') || {})[this.get('task_sub_type')] || '-';
  },

  isComplete() {
    return this._checkAttrributeAgainstConfig('task_status', 'TASK_STATUS_COMPLETE');
  },

  isStandard() {
    return this._checkAttrributeAgainstConfig('task_type', 'TASK_TYPE_STANDARD');
  },

  isSystem() {
    return this._checkAttrributeAgainstConfig('task_type', 'TASK_TYPE_SYSTEM');
  },

  isCommunication() {
    return this._checkAttrributeAgainstConfig('task_type', 'TASK_TYPE_COMMUNICATION');
  },

  isPriorityLow() {
    return this._checkAttrributeAgainstConfig('task_priority', 'TASK_PRIORITY_LOW');
  },

  isPriorityNormal() {
    return this._checkAttrributeAgainstConfig('task_priority', 'TASK_PRIORITY_NORMAL');
  },

  isPriorityHigh() {
    return this._checkAttrributeAgainstConfig('task_priority', 'TASK_PRIORITY_HIGH');
  },

  getTaskQueueTimeDisplay() {
    if(!this.isComplete()) return '';
    return `, Time in Queue: ${Formatter.toDurationFromSecs(this.get('unassigned_duration_seconds')) || '-'}`;
  },

  getTimeToCompleteDisplay() {
    if (!this.get('date_task_completed') || !this.get('created_date') || !this.isComplete()) return '';

    const differenceInSeconds = Moment(this.get('date_task_completed')).diff(Moment(this.get('created_date')), 'seconds')
    return `, Time to Complete: ${Formatter.toDurationFromSecs(differenceInSeconds) || '-'}`;
  },

  getTaskOwnerRoleId() {
    const userRoleId = userChannel.request('get:user:role', this.get('task_owner_id'));
    return userRoleId;
  },

  isTaskOwnerIO() {
    const USER_ROLE_GROUP_IO = configChannel.request('get', 'USER_ROLE_GROUP_IO');
    return this.getTaskOwnerRoleId() === USER_ROLE_GROUP_IO
  },

  isTaskOwnerArb() {
    const USER_ROLE_GROUP_ARB = configChannel.request('get', 'USER_ROLE_GROUP_ARB');
    return this.getTaskOwnerRoleId() === USER_ROLE_GROUP_ARB;
  },

  getActivityTypeDisplay() {
    const taskActivityData = taskChannel.request('config:activityType', this.get('task_activity_type'));
    return taskActivityData ? taskActivityData.title : '-';
  },

});
