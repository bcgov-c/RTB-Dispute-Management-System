import CMModel from '../../../../core/components/model/CM_model';
import Radio from 'backbone.radio';

const postApiName = 'schedulemanager/newscheduleperiod';
const apiName = 'schedulemanager/scheduleperiod';

const SCHED_PERIOD_DEFAULT = 'Unknown';
const SCHED_PERIOD_DEFAULT_COLOR_CLASS = 'info-gray';

const periodStatusColorClass = {
  1: "success-green",
  100: "info-gray",
  101: "error-red",
  102: "warning-yellow",
  103: "warning-yellow",
};


const configChannel = Radio.channel('config');


export default CMModel.extend({
  idAttribute: 'schedule_period_id',

  defaults: {
    schedule_period_id: null,
    associated_schedule_blocks: null,
    associated_hearings: null,
    period_status: null,
    period_time_zone: null,

    period_start: null,
    period_end: null,
    local_period_start: null,
    local_period_end: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_POST_ONLY_ATTRS: [
    'period_time_zone',
  ],
  API_SAVE_ATTRS: [
    'period_status',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${this.isNew() ? postApiName : apiName}`;
  },

  areEditsAllowed() {
    return this.isStatusActive() || this.isLockedForPrep();
  },

  isStatusActive() {
    return this.get('period_status') && this.get('period_status') === configChannel.request('get', 'SCHED_PERIOD_STATUS_ACTIVE');
  },

  isStatusInactive() {
    return this.get('period_status') && this.get('period_status') === configChannel.request('get', 'SCHED_PERIOD_STATUS_INACTIVE');
  },

  isLockedForPrep() {
    return this.get('period_status') && this.get('period_status') === configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_PREP');
  },

  hasStarted() {
    return Moment(this.get('period_start')).isBefore(Moment());
  },

  hasEnded() {
    return Moment().isSameOrAfter(Moment(this.get('period_end')));
  },

  getStatusDisplay() {
    const periodStatus = this.get('period_status');
    const SCHEDULE_PERIODS_STATUS_DISPLAY = configChannel.request('get', 'SCHEDULE_PERIODS_STATUS_DISPLAY');
    return SCHEDULE_PERIODS_STATUS_DISPLAY[periodStatus] || SCHED_PERIOD_DEFAULT;
  },

  getStatusDisplayHtml() {
    const periodStatus = this.get('period_status');
    return `<div class=${periodStatusColorClass[periodStatus] || SCHED_PERIOD_DEFAULT_COLOR_CLASS}>${this.getStatusDisplay()}</div>`;
  },

  
});
