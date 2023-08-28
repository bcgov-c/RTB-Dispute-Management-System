/**
 * @fileoverview - Manager that handles all creation, loading, and retrieval of data related to the Work Schedule feature. This includes: schedule blocks, schedule requests, and schedule periods.
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ScheduleRequest_collection from './schedule-requests/ScheduleRequest_collection';
import SchedulePeriod_collection from './schedule-periods/SchedulePeriod_collection';
import InputModel from '../../../core/components/input/Input_model';
import SchedulePeriod_model from './schedule-periods/SchedulePeriod_model';
import ScheduleBlock_model from './schedule-blocks/ScheduleBlock_model';

const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');

const apiNames = {
  blocks: 'schedulemanager/scheduledblocks',
  requests: 'schedulemanager/schedulerequest',
  periods: 'schedulemanager/scheduleperiod',
};

const SchedulingManager = Marionette.Object.extend({
  channelName: 'scheduling',

  radioRequests: {
    'load:blocks:all': 'loadAllScheduleBlocks',
    'load:blocks:period': 'loadScheduleBlocksForPeriod',
    'load:requests': 'loadScheduleRequests',
    'load:periods': 'loadSchedulePeriods',

    'create:period': 'createPeriod',
    'create:periods:until': 'createPeriodsUntilEndDate',
    'create:blocks:range': 'createBlocksForDateRange',
    'load:block:collisions:range': 'loadCollidingBlocksForDateRange',
    
    'get:requests': 'getScheduleRequests',
    'get:periods': 'getSchedulePeriods',
    'get:current:period': 'getCurrentPeriod',
  },

  initialize() {
    this.scheduleRequests = new ScheduleRequest_collection();
    this.schedulePeriods = new SchedulePeriod_collection();
  },

  /**
   * @param searchParams:
   * BlockStartingAfter
   * BlockStartingBefore
   * SystemUserId
   * count
   * index
   */
  loadAllScheduleBlocks(searchParams={
    BlockStartingAfter: '2020-01-01',
    BlockStartingBefore: '2022-01-01'
  }) {
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${apiNames.blocks}?${$.param(searchParams)}`
    });
  },


  loadScheduleBlocksForPeriod(periodId) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${apiNames.blocks}/${periodId}`
      }).done(response => {
        res(response);
      }).fail(rej);
    });
  },


  /**
   * @param searchParams:
   * RequestType
   * StatusIn
   * RequestStartAfter
   * RequestEndBefore
   * RequestSubmitters
   * RequestOwners
   * count
   * index
   */
  loadScheduleRequests(searchParams={}, options={}) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${apiNames.requests}?${$.param(searchParams, true)}`
      }).done((response={}) => {
        if (options.no_cache) {
          const newScheduleRequestCollection = new ScheduleRequest_collection(response.schedule_requests || []);
          newScheduleRequestCollection.totalAvailable = response.total_available_records;
          res(newScheduleRequestCollection);
          return;
        }

        this.scheduleRequests.reset(response.schedule_requests || []);
        this.scheduleRequests.totalAvailable = response.total_available_records;
        res(this.scheduleRequests);
      }).fail(rej);
    });
  },


  /**
   * @param searchParams:
   * BetweenSchedulePeriodId
   * AfterPeriodEndingDate
   * BeforePeriodEndingDate
   * InPeriodTimeZone
   * ContainsPeriodStatuses
   * count
   * index
   */
  loadSchedulePeriods(searchParams={}) {
    searchParams = Object.assign({
      index: 0, count: 999990
    }, searchParams);

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${apiNames.periods}?${$.param(searchParams, true)}`
      }).done((response={}) => {
        this.schedulePeriods.reset(response.periods || []);
        this.schedulePeriods.totalAvailable = response.total_available_records;
        res(this.schedulePeriods);
      }).fail(rej);
    });
  },

  getScheduleRequests() {
    return this.scheduleRequests;
  },

  getSchedulePeriods() {
    return this.schedulePeriods;
  },
 
  createPeriod(periodAttrs={}) {
    const SCHED_PERIOD_RTB_TIME_ZONE = configChannel.request('get', 'SCHED_PERIOD_RTB_TIME_ZONE');
    const schedulePeriod = new SchedulePeriod_model(Object.assign({ period_time_zone: SCHED_PERIOD_RTB_TIME_ZONE }, periodAttrs));
    return new Promise((res, rej) => {
      schedulePeriod.save()
        .done(() => {
          this.getSchedulePeriods().add(schedulePeriod);
          schedulePeriod.save({ period_status: configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_PREP') })
            .done(() => res(schedulePeriod)).fail(rej);
        }).fail(rej);
    });
  },

  // Periods are a continuous range. To create periods up to an end date, we must always ensure there are periods until then
  createPeriodsUntilEndDate(endDate) {
    endDate = Moment(endDate);
    const checkAndCreatePeriodsForRange = () => {
      const lastPeriod = this.getSchedulePeriods().at(-1);
      if (Moment(lastPeriod?.get('period_end')).isSameOrBefore(endDate)) {
        return this.createPeriod().then(checkAndCreatePeriodsForRange, Promise.reject);
      } else {
        return Promise.resolve();
      }
    };
    
    return checkAndCreatePeriodsForRange();
  },

  createBlocksForDateRange(startDate, endDate, blockCreationAttrs={}, editBlock=null) {
    const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    const HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');

    const periodsInRange = this.getSchedulePeriods().getPeriodsInDateRange(startDate, endDate);
    // Need all periods to be editable, and at least one period to add blocks
    if (!periodsInRange.length || periodsInRange.find(p => !p.areEditsAllowed())) return Promise.reject();
    
    let currentPeriod = periodsInRange.at(0);
    let currentPeriodEndDate = Moment(currentPeriod.get('period_end'));
    const dateCursor = Moment(startDate);
    const blocksToCreate = [];

    const createAndAddBlock = (options={}) => {
      // Add a correction 6 hours to force the start/end day selection to be correct
      const startDateToSet = Moment.tz(`${Moment(currentPeriod.get('period_start')).add(6, 'hours').format('YYYY-MM-DD')}T${Moment(HEARING_MIN_BOOKING_TIME, InputModel.getTimeFormat()).format(InputModel.getTimeISOFormat())}`, RTB_OFFICE_TIMEZONE_STRING);
      const endDateToSet = Moment.tz(`${Moment(currentPeriod.get('period_end')).subtract(6, 'hours').format('YYYY-MM-DD')}T${Moment(HEARING_MAX_BOOKING_TIME, InputModel.getTimeFormat()).format(InputModel.getTimeISOFormat())}`, RTB_OFFICE_TIMEZONE_STRING);
      if (startDateToSet.isSame(endDateToSet, 'minutes')) return;
      
      const newBlock = new ScheduleBlock_model(Object.assign({
        schedule_period_id: currentPeriod.id,
        block_start: blocksToCreate.length ? startDateToSet.toISOString() : Moment(startDate).toISOString(),
        block_end: options.isFinalBlock && Moment(endDate).isBefore(endDateToSet) ? Moment(endDate).toISOString() : endDateToSet.toISOString(),
      }, blockCreationAttrs));
      blocksToCreate.push(newBlock);
    };

    while (dateCursor.isBefore(endDate)) {
      if (dateCursor.isAfter(currentPeriodEndDate)) {
        createAndAddBlock();
        currentPeriod = periodsInRange.find(p => p.id === (currentPeriod.id+1));
        if (currentPeriod) currentPeriodEndDate = Moment(currentPeriod.get('period_end'));
      }
      dateCursor.add(1, 'day');
    }
    createAndAddBlock({ isFinalBlock: true });

    // If we are in edit mode, the first block to change should be the saved block
    if (blocksToCreate.length && editBlock) {
      blocksToCreate[0].set({
        [blocksToCreate[0].idAttribute]: editBlock?.id,
        _originalData: editBlock?.get('_originalData'),
      });
    }

    return new Promise((res, rej) => Promise.allSettled(blocksToCreate.map(b => b.save(b.getApiChangesOnly())))
      .then((results=[]) => {
        const errorResult = results.find(r => r.status === 'rejected');
        if (errorResult) {
          rej(Object.assign({}, { error: errorResult.reason }, { blocksToCreate }));
        } else {
          res(blocksToCreate);
        }
      }));
  },

  loadCollidingBlocksForDateRange(startDate, endDate, blockOwnerId, blockModelToIgnore=null) {
    const startDateIso = Moment(startDate).toISOString();
    const endDateIso = Moment(endDate).toISOString();
    const searchParams = {
      StartDate: startDateIso,
      EndDate: endDateIso,
    };
    return new Promise(res => {
      hearingChannel.request('get:by:owner', blockOwnerId, searchParams)
        .done((response={}) => {
          // Some blocks are returned that are not actually conflicts: if they begin or end on the boundary, or if we are editing the block
          const conflictingBlocks = response?.schedule_blocks?.filter(b => (
            (startDateIso !== Moment(b.block_end).toISOString()) &&
            (endDateIso !== Moment(b.block_start).toISOString()) &&
            (blockModelToIgnore?.id ? blockModelToIgnore.id !== b.schedule_block_id : true)
          ));
          res(conflictingBlocks);
         })
        .fail(() => res([]));
    });
  },

});

const schedulingManagerInstance = new SchedulingManager();


export default schedulingManagerInstance;
