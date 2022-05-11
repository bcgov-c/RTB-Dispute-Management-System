import CMModel from '../../../../core/components/model/CM_model';
import Radio from 'backbone.radio';

const apiName = 'schedulemanager/scheduledblock';

// Provided here top level for imports
const blockTypeColorClass = {
  1: "hear",
  2: "duty",
  3: "writ",
  4: "blk",
  100: "vac",
  102: "other",
};
const blockTypesDaily = [1,2,3,4];

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'schedule_block_id',

  defaults: {
    associated_hearings: null,
    
    schedule_block_id: null,
    schedule_period_id: null,
    system_user_id: null,

    block_start: null,
    block_end: null,
    
    block_type: null,
    block_status: null,
    block_sub_status: null,
    block_description: null,
    block_note: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_POST_ONLY_ATTRS: [
    'system_user_id',
  ],

  API_SAVE_ATTRS: [
    'block_start',
    'block_end',
    'block_type',
    'block_status',
    'block_sub_status',
    'block_description',
    'block_note',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}` + (this.isNew() ? `/${this.get('schedule_period_id')}` : '');
  },

  getTypeDisplayClass() {
    return blockTypeColorClass[this.get('block_type')] || '';
  },

  isTypeDaily() {
    return (blockTypesDaily||[])?.includes(this.get('block_type'));
  },

  isTypeDuty() {
    return this.get('block_type') && this.get('block_type') === configChannel.request('get', 'SCHED_BLOCK_TYPE_DUTY');
  },

  isTypeHearing() {
    return this.get('block_type') && this.get('block_type') === configChannel.request('get', 'SCHED_BLOCK_TYPE_HEARING');
  },

  isTypeWorking() {
    return this.isTypeHearing() || this.isTypeDuty();
  },

  getBlockDuration() {
    if (this.get('_blockDuration')) return this.get('_blockDuration');

    const blockDuration = Moment(this.get('block_end')).diff(Moment(this.get('block_start')));
    if (blockDuration) this.set('_blockDuration', blockDuration);
    return blockDuration || 0;
  },
  
}, {
  blockTypesDaily
});
