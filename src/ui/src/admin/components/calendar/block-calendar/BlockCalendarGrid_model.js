/**
 * @fileoverview The data for a Calendar component.  Should be configured with:
 *  - the start and end hours for the X axis columns as 24-hour integers
 *  - a label for the header
 *  - a list of items (already separated by row) for the calendar to display
 */
import CalendarGridModel from '../CalendarGrid_model';
import Radio from 'backbone.radio';
import { toUserLevelAndNameDisplay } from '../../../components/user-level/UserLevel';
import ScheduleBlock_collection from '../../scheduling/schedule-blocks/ScheduleBlock_collection';

const BLOCK_DESCRIPTION_DISPLAY_MAX = 75;

const usersChannel = Radio.channel('users');
const schedulingChannel = Radio.channel('scheduling');
const Formatter = Radio.channel('formatter').request('get');

export default CalendarGridModel.extend({
  defaults() {
    return Object.assign({},
      CalendarGridModel.prototype.defaults, {
        // Override previous calendar value
        borderCol: 7,

        // Puts the calendar to daily block mode
        enableDailyBlocks: false,
        // Controls whether or not to restrict drag selects to one day only
        dailySelectionOnly: false,

        // The period to use for the display
        periodModel: null,

        // Used to filter users
        userFilterFn: null,
        showReporting: true,

        blockCreationData: {
          user: null,
          blockType: null,
        },

        // disabled selection means no DragSelects initialized
        disableSelection: false,
        // disabled calendar mans no drag selects and no ui interaction/clicks
        disabled: false,
        scheduleBlocksCollection: null,
        arbPositionLookup: null,
        
        selectedBlockId: null,
        disableHeaderRouting: false,
        // End Block mode data
    });
  },

  initialize() {
    CalendarGridModel.prototype.initialize.call(this, ...arguments);
    this.set('scheduleBlocksCollection', new ScheduleBlock_collection([]));
    this.set('arbPositionLookup', {});
  },

  parseBlocksFromApi(scheduleBlocksCollection) {
    this.resetEvents();    
    this.get('scheduleBlocksCollection').reset(scheduleBlocksCollection.models);

    const filteredUsers = usersChannel.request('get:arbs', { all: true }).filter(_.isFunction(this.get('userFilterFn')) ? this.get('userFilterFn') : ()=>true);
    const usersToDisplay = _.sortBy(filteredUsers, user => user.getDisplayName());
    
    const rowEvents = [];
    const arbPositionLookup = this.get('arbPositionLookup');
    _.each(usersToDisplay, function(arbModel, rowIndex) {
      arbPositionLookup[rowIndex] = arbModel;
      const arbBlocks = scheduleBlocksCollection.where({ system_user_id: arbModel.id });
      const events = [];
      _.each(arbBlocks, function(blockModel) {
        const hearingsCount = blockModel.get('associated_hearings');
        const hearingCountDisplay = hearingsCount && `${blockModel.get('assocaited_booked_hearings')||0}/${hearingsCount}`;
        events.push({
          ownerOffset: rowIndex,
          blockId: blockModel.id,
          cssClass: `${blockModel.getTypeDisplayClass()} ${hearingsCount ? 'has-hearings' : ''}`,
          description: Formatter.toTrimmedString(`${hearingCountDisplay || ''}${blockModel.get('block_description') ? `${hearingsCount?' (':''}${blockModel.get('block_description')}${hearingsCount?')':''}` : ''}`, BLOCK_DESCRIPTION_DISPLAY_MAX)
        });
      }, this);


      const rowEventItem = this.createRowEventItem(arbModel, arbBlocks, events);
      rowEvents.push(rowEventItem);
    }, this);

    this.set({ rowEvents });
  },

  createRowEventItem(arbModel, arbBlocks=[], events=[]) {
    const requests = schedulingChannel.request('get:requests').filter(r => (
      r.get('request_submitter') === arbModel.id && r.isStatusRequiringAction()
    ));
    const userLevel = toUserLevelAndNameDisplay(arbModel, { displaySchedulerType: true, displayUserLevelIcon: true, trimNameAtChar: requests.length ? 15: 17 });
    const hearingDayCount = Formatter.getBlocksDurationDisplay(arbBlocks.filter(b => b.isTypeHearing()));
    const dutyDayCount = Formatter.getBlocksDurationDisplay(arbBlocks.filter(b => b.isTypeDuty()));

    const rowEventItem = {
      label: `${userLevel}`,
      events: _.filter(events, function(data) { return !_.isEmpty(data); }),
      rowReportDisplayHtml: `<div class="block-calendar__report-column__text">${hearingDayCount}</div>
        <div class="block-calendar__report-column__text-duty">${dutyDayCount}</div>`,
      userRequest: requests.length ? {
          title: `${arbModel.getDisplayName()} - ${requests.length} unresolved request${requests.length===1?'':'s'}:`,
          ids: requests.map(r => r.id)
        } : null,
      disableEdits: !arbModel.isActive()
    };

    return rowEventItem;
  },

});
