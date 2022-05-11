/**
 * @fileoverview The data for a Calendar component.  Should be configured with:
 *  - the start and end hours for the X axis columns as 24-hour integers
 *  - a label for the header
 *  - a list of items (already separated by row) for the calendar to display
 */
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import HearingModel from '../../../core/components/hearing/Hearing_model';
import ScheduleBlock_collection from '../scheduling/schedule-blocks/ScheduleBlock_collection';
import { toUserLevelAndNameDisplay } from '../user-level/UserLevel';

const configChannel = Radio.channel('config');
const usersChannel = Radio.channel('users');

export default Backbone.Model.extend({
  defaults: {
    initialHour: null,
    finalHour: null,
    numberOfMonthRow: null,
    headerLabel: null,
    rowEvents: null,
    filteredRowEvents: null,

    hearingLookups: null,
    positionToBlockLookup: {},

    borderCol: 6,
    numLowerRows: 6,
    printableColumns: [2,3,4,5,6,7,8,9,10],
    /**
     * Row data item has the format: {
     *   label: null, // The label to be used on the left-most column
     *   events: [{
     *     hearingId: <the hearing id, from which a HearingModel can be looked up>
     *     positionId: <string of coordinates "XY" of where to place the event...>
     *     ...
     *   }]
     * }
     *
     */
  },

  initialize() {
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.set({
      hearingLookups: {},
      positionToBlockLookup: {},
    });
  },

  resetEvents() {
    this.set({
      rowEvents: null,
      filteredRowEvents: null
    }, { silent: true });
  },

  _extractHourFromDateTime(dateString) {
    return Moment.tz(dateString, this.RTB_OFFICE_TIMEZONE_STRING).hours();
  },
  _getDifferenceOfTimeAndInitialHour(dateString) {
    const hour = this._extractHourFromDateTime(dateString);
    return hour - this.get('initialHour');
  },
  _convertDateToDecimalHourStart(dateString) {
    return Moment(dateString).hour() + Number(Moment(dateString).minute() / 60);
  },

  _calendarEventsLookupData(hearingData) {
    const data =  _.object(_.map(hearingData.daily_hearings, function(hearingsData) {
      return [hearingsData.date, hearingsData.hearings];
    }));

    return data;
  },

  _getColPositionFromTime(dateString) {
    return this._getDifferenceOfTimeAndInitialHour(dateString) + 1;
  },

  _hearingApiDataToCalendarEventData(hearingData, rowIndex) {
    if (_.isEmpty(hearingData)) return;

    return {
      positionId: `${this._getColPositionFromTime(hearingData.local_start_datetime)}${rowIndex}`,
      hearingId: hearingData.hearing_id,
    };
  },

  _addHearingToLookup(hearingData) {
    if (_.isEmpty(hearingData)) return;

    const hearingLookups = this.get('hearingLookups');
    const hearingModel = new HearingModel(hearingData);
    const hearingId = hearingModel.id;

    // Don't check for duplicates, always overwrite saved hearing data with the most recent data
    hearingLookups[hearingId] = hearingModel;
  },

  _getNumColumns() {
    return this.get('finalHour') - this.get('initialHour') + 1;
  },

  addScheduleBlocksToLookupForOwner(workingBlocksList, rowIndex, calendarStartDay) {
    const positionToBlockLookup = this.get('positionToBlockLookup');
    const userBlocks = new ScheduleBlock_collection(workingBlocksList);
    const calendarLocalStartDay = calendarStartDay.dayOfYear();
    const getColPositionFromTimeWithMultiDayOffset = (blockDate) => {
      const localBlockDay = blockDate.dayOfYear();
      const colPosition = this._getColPositionFromTime(blockDate);
      // Block may be on a different day, so we have to add or subtract hours accordingly to get the "real" offset of hours
      const multiDayPositionOffsetHours = (localBlockDay-calendarLocalStartDay)*24;
      return colPosition + multiDayPositionOffsetHours;
    };

    const userBlockPositions = _.sortBy(userBlocks.map(b => {
      const localBlockStart = Moment.tz(b.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING);
      const localBlockEnd = Moment.tz(b.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING);
      
      return {
        blockModel: b,
        startPos: getColPositionFromTimeWithMultiDayOffset(localBlockStart),
        endPos: getColPositionFromTimeWithMultiDayOffset(localBlockEnd),
        
        _startMinutes: localBlockStart.minutes(),
        _endMinutes: localBlockEnd.minutes(),
      };
    }), 'startPos');

    // Create a lookup from calendar
    positionToBlockLookup[rowIndex] = {};
    const blocksUsed = {};
    Array(this._getNumColumns()).fill(0).map((_, i) => i).forEach(pos => {
      const matchingBlock = userBlockPositions.find(b => {
        const blockStartsBefore = b.startPos <= pos;
        const blockEndsAfter = pos < b.endPos;
        const blockEndsOnWithMinutes = (pos === b.endPos && b._endMinutes);
        return blockStartsBefore && (blockEndsAfter || blockEndsOnWithMinutes);
      });
      const lookupData = Object.assign({}, matchingBlock);
      if (matchingBlock) {
        if (!blocksUsed[matchingBlock?.blockModel?.id]) lookupData.startMinutes = matchingBlock._startMinutes;
        // Always add last known used position to block
        blocksUsed[matchingBlock?.blockModel?.id] = pos;
      }
      positionToBlockLookup[rowIndex][pos] = lookupData;
    });

    Object.keys(blocksUsed).forEach(key => {
      const lastUsedPos = blocksUsed[key];
      const data = positionToBlockLookup?.[rowIndex]?.[lastUsedPos];
      if (data._endMinutes) data.endMinutes = data._endMinutes;
    });    
  },

  parseDailyFromApi(apiResponse={}) {
    this.resetEvents();
    const apiHearings = apiResponse.owner_hearings || [];
    const allArbs = _.sortBy(usersChannel.request('get:arbs', { all: true }), arbModel => arbModel.getDisplayName());
    const activeArbs = _.filter(allArbs, arb => arb.isActive());
    const rowEvents = [];
    const filteredRowEvents = [];
    
    _.each(allArbs, function(arbModel, rowIndex) {
      const userHearingData = _.find(apiHearings, apiHearing => apiHearing.user_id === arbModel.id) || {};
      userHearingData.hearings = userHearingData.hearings || [];
      const events = [];
      const userBlocksData = apiResponse?.schedule_blocks?.filter(b=>b.system_user_id === arbModel.id);
      
      this.addScheduleBlocksToLookupForOwner(userBlocksData, arbModel.id, Moment.tz(apiResponse.date, this.RTB_OFFICE_TIMEZONE_STRING));
      
      _.each(userHearingData.hearings, function(hearingData) {
        hearingData = hearingData || {};
        if (!('hearing_owner' in hearingData)) hearingData.hearing_owner = arbModel.id;
        this._addHearingToLookup(hearingData);
        events.push(this._hearingApiDataToCalendarEventData(hearingData, rowIndex));
      }, this);

      const userLevel = toUserLevelAndNameDisplay(arbModel, { displaySchedulerType: true, displayUserLevelIcon: true });
      const rowEventItem = {
        label: `${userLevel}`,
        events: _.filter(events, function(data) { return !_.isEmpty(data); }),
        getBlockData: (positionId) => {
          const blockData = this.get('positionToBlockLookup')[arbModel.id]?.[positionId];
          return {
            class: blockData?.blockModel?.getTypeDisplayClass(),
            startMinutes: blockData?.startMinutes,
            endMinutes: blockData?.endMinutes,
          };
        }
      };

      rowEvents.push(rowEventItem);
    }, this);


    // Now fill the hard-coded "active arb only" set of filtered events
    // These will have different position values, than above so they need to be calculated in a new loop
    _.each(activeArbs, function(arbModel, rowIndex) {
      const userHearingData = _.find(apiHearings, function(apiHearing) { return apiHearing.user_id === arbModel.get('user_id') }) || {};
      userHearingData.hearings = userHearingData.hearings || [];
      const events = [];
      
      _.each(userHearingData.hearings, function(hearingData) {
        events.push(this._hearingApiDataToCalendarEventData(hearingData, rowIndex));
      }, this);

      const rowEventItem = {
        label: `${toUserLevelAndNameDisplay(arbModel, { displaySchedulerType: true, displayUserLevelIcon: true })}`,
        events: _.filter(events, function(data) { return !_.isEmpty(data); }),
        getBlockData: (positionId) => {
          const blockData = this.get('positionToBlockLookup')[arbModel.id]?.[positionId];
          return {
            class: blockData?.blockModel?.getTypeDisplayClass(),
            startMinutes: blockData?.startMinutes,
            endMinutes: blockData?.endMinutes,
          };
        },
      };

      filteredRowEvents.push(rowEventItem);
    }, this);

    this.set({ rowEvents, filteredRowEvents });
  },

  parseMyTodayHearingFromApi(apiResponse={}) {
    this.resetEvents();

    if (_.isEmpty(apiResponse)) return;

    const todayRowEvents = [];
    const todayDate = Moment(new Date()).format('YYYY-MM-DD');
    const userBlocksData = apiResponse?.schedule_blocks?.filter(b=>b.system_user_id === apiResponse.user_id);
    const getBlockData = (positionId) => {
      const blockData = this.get('positionToBlockLookup')[apiResponse.user_id]?.[positionId];
      return {
        class: blockData?.blockModel?.getTypeDisplayClass(),
        startMinutes: blockData?.startMinutes,
        endMinutes: blockData?.endMinutes,
      };
    }

    this.addScheduleBlocksToLookupForOwner(userBlocksData, apiResponse.user_id, Moment.tz(todayDate, this.RTB_OFFICE_TIMEZONE_STRING));

    _.each(apiResponse.daily_hearings, function(apiHearingData) {
      apiHearingData.hearings = apiHearingData.hearings || [];
      const hearingDate = Moment(apiHearingData.date, 'YYYY-MM-DD').utc();

      const events = [];
      if (hearingDate.isSame(todayDate)) {
        _.each(apiHearingData.hearings, function(hearingData) {
          this._addHearingToLookup(hearingData);
          events.push(this._hearingApiDataToCalendarEventData(hearingData, 0));
        }, this);

        todayRowEvents.push({
          label: hearingDate,
          events,
          getBlockData,
        });
      }
    }, this);

    this.set({ rowEvents: todayRowEvents, getBlockData });
  },

  parseOwnerFromApi(apiResponse={}, selectedStartDate) {
    this.resetEvents();
    
    if (_.isEmpty(apiResponse)) return;

    const rowEvents = [];
    const dateCursor = Moment.tz(selectedStartDate, this.RTB_OFFICE_TIMEZONE_STRING);
    const selectedEndDate = Moment(selectedStartDate).add(1, 'month');
    const calendarEventsLookupData = _.object(_.map(apiResponse.daily_hearings, hearingsData => ([ Moment(hearingsData.date).utc().format('YYYY-MM-DD'), hearingsData.hearings ])));
    const userBlocksData = apiResponse?.schedule_blocks?.filter(b=> b.system_user_id === apiResponse.user_id);

    let rowIndex = 0;
    const hearingDataToCalendarEventDataFn = (hearingData) => {
      if (hearingData) {
        this._addHearingToLookup(hearingData);
      }
      return this._hearingApiDataToCalendarEventData(hearingData, rowIndex);
    };

    while (dateCursor.isBefore(selectedEndDate)) {
      this.addScheduleBlocksToLookupForOwner(userBlocksData, rowIndex, Moment.tz(dateCursor, this.RTB_OFFICE_TIMEZONE_STRING));

      rowEvents.push({
        label: dateCursor.format('DD - ddd'),
        events: _.filter(
          _.map(calendarEventsLookupData[dateCursor.format('YYYY-MM-DD')], hearingDataToCalendarEventDataFn),
          function (data) {
            return !_.isEmpty(data);
          }),
        getBlockData: (positionId, dayOffset) => {
          const blockData = this.get('positionToBlockLookup')[dayOffset]?.[positionId];
          return {
            class: blockData?.blockModel?.getTypeDisplayClass(),
            startMinutes: blockData?.startMinutes,
            endMinutes: blockData?.endMinutes,
          };          
        }
      });

      dateCursor.add(1, 'day');
      rowIndex++;
    }

    this.set({ rowEvents });
  },

});
