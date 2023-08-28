/**
 * @fileoverview - A bi-weekly calendar View for the working schedule
 */
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DragSelect from 'dragselect';
import ScheduleBlock_model from '../../scheduling/schedule-blocks/ScheduleBlock_model';
import BaseCalendarGridView from '../BaseCalendarGrid';
import ModalAddBlock from './ModalAddBlock';
import ModalScheduleRequest from '../../scheduling/schedule-requests/ModalScheduleRequest';
import { routeParse } from '../../../routers/mainview_router';
import template from './BlockCalendarGrid_template.tpl';
import Formatter from '../../../../core/components/formatter/Formatter';

const MAX_REQUESTS_IN_POPOVER = 3;
const MAX_REQUEST_DESCRIPTION_IN_POPOVER = 100;

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const userChannel = Radio.channel('users');
const schedulingChannel = Radio.channel('scheduling');
const loaderChannel = Radio.channel('loader');

export default BaseCalendarGridView.extend({
  template,
  className: 'calendar-container block-calendar',

  ui: {
    addBlock: '.block-calendar__add-block',
    savedBlocks: '.block-calendar__saved-block',
    userRequests: '.block-calendar__user-requests',
    requestLink: '.block-calendar__request-link',
    headerLink: '.calendar-header-time-ul .general-link',
  },

  events: {
    'click @ui.addBlock': 'clickAddBlock',
    'click @ui.savedBlocks': 'clickSavedBlock',
    'click @ui.requestLink': 'clickRequestLink',
    'click @ui.headerLink': 'clickHeaderDate',
  },

  clickAddBlock(ev) {
    const periodModel = this.model.get('periodModel');
    if (!periodModel || !periodModel.areEditsAllowed()) return;
    
    const ele = $(ev.currentTarget);
    const positionId = ele.data('positionId');
    const arbModel = (this.model.get('arbPositionLookup') || {})[positionId];
    if (!arbModel) {
      alert('[Error] No arb could be found');
      return;
    }

    modalChannel.request('add', new ModalAddBlock({
      blockOwner: arbModel,
      periodModel: this.model.get('periodModel'),
      model: this.model,
      loadedUserBlocks: this.model.get('scheduleBlocksCollection').filter(b => b.get('system_user_id') === arbModel?.id),
    }));
  },

  clickSavedBlock(ev) {
    const periodModel = this.model.get('periodModel');
    if (!periodModel || !periodModel.areEditsAllowed()) return;

    const ele = $(ev.currentTarget);
    const blockId = ele.data('blockId');
    const blockModel = this.model.get('scheduleBlocksCollection').get(blockId);

    if (!blockModel) {
      alert('[Error] No block could be found');
      return;
    }
    this.model.trigger('click:block', blockModel);
  },

  clickRequestLink(ev) {
    const ele = $(ev.currentTarget);
    const requestIdArr = ele.attr('id')?.split(':')?.slice(1);
    const requestId = requestIdArr?.length ? Number(requestIdArr[0]) : null;
    const requestModel = requestId && schedulingChannel.request('get:requests').find(r => r.id === requestId);
    if (!requestModel) {
      alert('[Error] No saved request could be found');
      return;
    }
    modalChannel.request('add', new ModalScheduleRequest({ model: requestModel }));
    this.stopListening(requestModel, 'save:complete');
    this.listenToOnce(requestModel, 'save:complete', () => {
      // Re-parse loaded blocks to refresh request info
      this.model.parseBlocksFromApi(this.model.get('scheduleBlocksCollection'));
      this.model.trigger('request:saved');
      loaderChannel.trigger('page:load:complete');
    });
    this.listenToOnce(requestModel, 'autoAction:success', () => {
      Backbone.history.loadUrl(Backbone.history.fragment);
    });
  },

  clickHeaderDate(ev) {
    if (this.model.get('disableHeaderRouting')) return;
    const ele = $(ev.currentTarget);
    const date = ele.data('date');
    if (date) Backbone.history.navigate(routeParse('scheduled_hearings_daily_param_item', null, date), { trigger: true });
  },

  initialize(options) {
    BaseCalendarGridView.prototype.initialize.call(this, options);
    // Keep local UI variables for the drags
    this.dragSelects = [];
    this.selectedBlocks = [];

    this.headerLabelData = this.getParsedHeaderLabelData();
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');

    this.listenTo(this.model, 'clear:dragSelects', this.clearDragSelections, this);
    this.listenTo(this.model, 'render:dragSelects', this.renderDragSelectJs, this);
    this.listenTo(this.model, 'render:calendarEvents', this.renderCalendarEvents, this);
  },

  getParsedHeaderLabelData() {
    const periodModel = this.model.get('periodModel');
    const startDate = Moment.tz(periodModel.get('period_start'), this.RTB_OFFICE_TIMEZONE_STRING);
    const endDate = Moment.tz(periodModel.get('period_end'), this.RTB_OFFICE_TIMEZONE_STRING);

    let currDate = Moment(startDate);
    const headerLabels = [];

    while (!currDate.isSameOrAfter(endDate, 'day')) {
      const dateStr = currDate.format('YYYY-MM-DD');
      const blocksStartingOnDay = this.model.get('scheduleBlocksCollection').filter(b => Moment(b.get('block_start')).format('YYYY-MM-DD') === dateStr);
      const dutyBlocks = blocksStartingOnDay.filter(b => b.isTypeDuty());
      const allBlocks = [
        ...blocksStartingOnDay.filter(b => b.isTypeHearing()),
        ...dutyBlocks
      ];
      const fullBlocksDisplay = Formatter.getBlocksDurationDisplay(allBlocks);
      const employeeBlocksDisplay = Formatter.getBlocksDurationDisplay(allBlocks.filter(b => userChannel.request('get:user', b.get('system_user_id'))?.isEngagementTypeEmployee() ));
      const contractorBlocksDisplay = Formatter.getBlocksDurationDisplay(allBlocks.filter(b => userChannel.request('get:user', b.get('system_user_id'))?.isEngagementTypeContractor() ));
      const dutyBlocksDisplay = Formatter.getBlocksDurationDisplay(dutyBlocks);
      const dutyPercent = (Number(dutyBlocksDisplay) / Number(fullBlocksDisplay)) * 100;

      headerLabels.push({
        colReportDisplayHtml: `<div class="block-calendar__report-column__text">FTE: ${fullBlocksDisplay}</div>
          <div class="block-calendar__report-column__text">E:${employeeBlocksDisplay}, C:${contractorBlocksDisplay}</div>
          <div class="block-calendar__report-column__text-duty">D:${dutyBlocksDisplay} - ${Number.isNaN(dutyPercent) ? '0.0' : dutyPercent.toFixed(1) }%</div>`,
        dateDisplay: currDate.format('ddd DD'),
        startDate: dateStr,
        blockOneStartDate: `${dateStr}T06:00:00`,
        blockTwoStartDate: `${dateStr}T09:00:00`,
        blockThreeStartDate: `${dateStr}T12:00:00`,
        blockFourStartDate: `${dateStr}T15:00:00`,
        blockFiveStartDate: `${dateStr}T18:00:00`,
        blockFiveEndDate: `${dateStr}T21:00:00`,
      });
      currDate = startDate.add(1, 'day');
    }
    return headerLabels;
  },

  onDomAttach() {
    this.BaseCalendarGridView.prototype.onDomAttach.call(this);
    this.renderDragSelectJs();
  },

  onRender() {
    this.getUI('userRequests').popover({
      template: `<div class="popover block-calendar__popover" role="tooltip"><div class="arrow"></div>
        <h3 class="popover-title"></h3>
        <div class="popover-content"></div>
        <div class="popover-footer">
          <a class="general-link" href="#schedule-manager/requests">View All Requests</a>
        </div>
      </div>`,
      html: true,
      content() {
        const popoverEle = $(this);
        const requestIdsString = popoverEle.data('requestIds');
        const requestIds  = Number(requestIdsString) ? [Number(requestIdsString)] :
          requestIdsString ? requestIdsString?.split(',')?.map(id => Number(id)) :
          [];
        const requests = requestIds?.length && schedulingChannel.request('get:requests').filter(r => requestIds?.includes(r.id));
        if (!requests?.length) return;

        return `${requests.length > MAX_REQUESTS_IN_POPOVER ? `<p>Showing ${MAX_REQUESTS_IN_POPOVER} of ${requests.length} requests</p>` : ''}
          <ul>${requests.slice(0, MAX_REQUESTS_IN_POPOVER).map(r => {
            const description = Formatter.toTrimmedString(r.get('request_description').replaceAll(`"`, `'`), MAX_REQUEST_DESCRIPTION_IN_POPOVER);
            return `<li class="block-calendar__request-${r.id}">
              ${Formatter.toDateAndTimeDisplay(r.get('request_start'))} to ${Formatter.toDateAndTimeDisplay(r.get('request_end'))}: ${description}
              &nbsp;-&nbsp;<span id=block-calendar__request:${r.id} class="clickable block-calendar__request-link"><b>View</b></span>
            </li>`;
          }).join(``)}</ul>`
      },
    });

    this.renderDragSelectJs();
  },

  renderCalendarEvents() {
    const calendarEle = this.$('.block-calendar-content');
    const calendarEleAttrs = calendarEle.length ? calendarEle[0].getBoundingClientRect() : {};
    const self = this;
    const scheduleBlocksCollection = this.model.get('scheduleBlocksCollection');
    const minutesPerBlock = 3*60;
    this.getUI('savedBlocks').each(function() {
      const blockId  = $(this).data('blockId');
      const blockModel = scheduleBlocksCollection.get(blockId);
      
      if (!blockModel) {
        console.log(`[Warning] No block model found for block id ${blockId}`);
        return;
      }
      const blockStartDate = Moment.tz(blockModel.get('block_start'), self.RTB_OFFICE_TIMEZONE_STRING);
      const blockEndDate = Moment.tz(blockModel.get('block_end'), self.RTB_OFFICE_TIMEZONE_STRING);

      const ownerOffset = $(this).data('ownerOffset');
      const startHour =  blockStartDate.hour();
      const endHour =  blockEndDate.hour();

      const closestStartBlockId = startHour < 9 ? 6 :
        startHour < 12 ? 9 :
        startHour < 15 ? 12 :
        startHour < 18 ? 15 :
        18;
      const closestEndBlockId = endHour <= 9 ? 6 :
        endHour <= 12 ? 9 :
        endHour <= 15 ? 12 :
        endHour <= 18 ? 15 :
        18;

      const startDate = blockStartDate.format('YYYY-MM-DD');
      const endDate = blockEndDate.format('YYYY-MM-DD');
      const startCell = self.$(`.block-calendar__block[data-arb-position-id="${ownerOffset}"][data-start-datetime="${startDate}T${Formatter.toLeftPad(closestStartBlockId)}:00:00"]`);
      const endCell = self.$(`.block-calendar__block[data-arb-position-id="${ownerOffset}"][data-start-datetime="${endDate}T${Formatter.toLeftPad(closestEndBlockId)}:00:00"]`);

      if (!startCell.length || !endCell.length) {
        console.log(`[Warning] Can't find starting/ending cell for block ${$(this).data('blockId')}`);
        return;
      }

      // Correct for blocks that do not start / end directly on a 3-hour division block
      const cellWidth = startCell.width();
      const startMinutesOffset = startHour*60 + blockStartDate.minutes() - closestStartBlockId*60;
      const leftEdgeModifier = startMinutesOffset * (cellWidth/minutesPerBlock);
      const endMinutesOffset = endHour*60 + blockEndDate.minutes() - closestEndBlockId*60;
      const rightEdgeModifier = (minutesPerBlock - endMinutesOffset) * (cellWidth/minutesPerBlock);

      // Set positioning
      const startCellCoords = startCell[0].getBoundingClientRect();
      const endCellCoords = endCell[0].getBoundingClientRect();
      const leftEdge = startCellCoords.left - calendarEleAttrs.left + leftEdgeModifier;
      const rightEdge = endCellCoords.right - calendarEleAttrs.left - rightEdgeModifier;
      const coords = {
        top: `${startCellCoords.top - calendarEleAttrs.top - 1}px`,
        height: `${startCellCoords.height + 2}px`,
        left: `${leftEdge}px`,
        width: `${rightEdge - leftEdge}px`,
      };
    
      $(this).css(coords);
    });

  },

  clearDragSelections() {
    this.dragSelects.forEach(ds => {
      try { ds.clearSelection(); } catch (err) {}
    });
  },

  isElementInView(el) {
    el = typeof jQuery === "function" && el instanceof $ ? el[0] : el;
    const coords = el.getBoundingClientRect();
    return (
      coords.top >= 0 &&
      coords.bottom <= (window.innerHeight || $(window).height())
    );
  },

  renderDragSelectJs() {
    if (this.model.get('disableSelection') || this.model.get('disabled')) {
      this.dragSelects.forEach(ds => {
        try { ds.stop(); } catch (err) {}
      });
      return;
    }

    if (!this.dragSelects?.length) {
      this.createDragSelects();
    } else {
      // Refresh drag selects, filter based on which ones are in view for the user
      this.dragSelects.forEach(ds => {
        if (this.isElementInView(ds._parentEle)) {
          ds.setSelectables(ds._selectables);
          ds.start();
        } else {
          try { ds.stop(); } catch (err) {}
        }
      });
    }
  },

  createDragSelects() {
    this.dragSelects = [];
    const parentEleIterator = this.$('.calendar-grid-time-flex:not(.--disabled)');
    const self = this;
    parentEleIterator.each(function() {
      const ds = new DragSelect({
        selectables: $(this).find('.block-calendar__block').get(),
        area: this,
        multiSelectMode: false,
        draggability: false,
        immediateDrag: false,
      });
      ds._parentEle = $(this);
      ds._selectables = $(this).find('.block-calendar__block').get();
      self.dragSelects.push(ds);
    });
    this.dragSelects.forEach(ds => {
      this.attachDragSelectHandlerSelectionStart(ds);
      this.attachDragSelectHandlerSelectionComplete(ds);
    });
  },

  attachDragSelectHandlerSelectionStart(ds) {
    const dragSelects = this.dragSelects;
    ds.subscribe("dragstart", function() {
      dragSelects.forEach(function(_ds) {
        if (ds !== _ds) _ds.clearSelection();
      });
    });
  },

  attachDragSelectHandlerSelectionComplete(ds) {
    const scheduleBlocksCollection = this.model.get('scheduleBlocksCollection');
    const arbPositionLookup = this.model.get('arbPositionLookup') || {};
    const self = this;
    ds.subscribe("callback", function(callbackObj={}) {
      const dailySelectionOnly = self.model.get('dailySelectionOnly');
      const selected = callbackObj.items || [];
      // Sort list ascending by date (handles right-to-left selections)
      let firstSelect = selected.length ? selected[0] : null;
      let lastSelect = selected.length ? selected[selected.length-1] : null;
      if (!firstSelect || !lastSelect) return ds.clearSelection();
      const firstStartMoment = Moment.tz(firstSelect.dataset.startDatetime, self.RTB_OFFICE_TIMEZONE_STRING);
      const lastStartMoment = Moment.tz(lastSelect.dataset.startDatetime, self.RTB_OFFICE_TIMEZONE_STRING);
      if (!firstStartMoment.isValid() || !lastStartMoment.isValid()) return ds.clearSelection();
      if (firstStartMoment.isAfter(lastStartMoment, 'minutes')) {
        selected.reverse();
      }
      firstSelect = selected[0];
      lastSelect = selected[selected.length-1];
      
      const arbPositionId = firstSelect.dataset.arbPositionId;
      const blockOwner = arbPositionLookup[arbPositionId];
      const blocksForSameOwner = scheduleBlocksCollection.filter(block => block.get('system_user_id') === blockOwner.id);
      const validBlocks = [];
      
      let unselectAllNext = false;
      const selectablesToRemove = selected.filter(selectedItem => {
        if (unselectAllNext) return true;

        const itemStart = Moment.tz(selectedItem.dataset.startDatetime, self.RTB_OFFICE_TIMEZONE_STRING);
        
        // Check for conflicts with existing blocks for same user
        if (selected.length > 1 && blocksForSameOwner.find(block => (
          Moment.tz(block.get('block_start'), self.RTB_OFFICE_TIMEZONE_STRING).isSameOrBefore(itemStart, 'minutes')
          && Moment.tz(block.get('block_end'), self.RTB_OFFICE_TIMEZONE_STRING).isAfter(itemStart, 'minutes')
        ))) {
          unselectAllNext = true;
          return true;
        }

        validBlocks.push(selectedItem);
      });

      // Then, filter again to apply daily restrictions.  Two-stage filter results in more intuitive UX when user
      // selects multiple types of invalid blocks within one selection
      const selectionStartDay = validBlocks.length ? Moment.tz(validBlocks[0].dataset.startDatetime, self.RTB_OFFICE_TIMEZONE_STRING).day() : null;
      const validBlocksFinal = [];
      unselectAllNext = false;
      const dailySelectablesToRemove = validBlocks.filter(selectedItem => {
        if (unselectAllNext) return true;
        const itemStart = Moment(selectedItem.dataset.startDatetime);
        // Check for a daily block selecting the next day(s)
        if (dailySelectionOnly && Moment.tz(itemStart, self.RTB_OFFICE_TIMEZONE_STRING).day() !== selectionStartDay) {
          unselectAllNext = true;
          return true;
        }
        validBlocksFinal.push(selectedItem);
      });
      
      ds.removeSelection(selectablesToRemove.concat(dailySelectablesToRemove));
      self.createNewBlockFromSelection.bind(self)(validBlocksFinal, blockOwner);
    });
  },

  createNewBlockFromSelection(selected=[], blockOwner) {
    const periodModel = this.model.get('periodModel');
    const firstSelect = selected.length ? selected[0] : null;
    const lastSelect = selected.length ? selected[selected.length-1] : null;
    if (!firstSelect || !lastSelect) return;
    
    const startDate = `${firstSelect.dataset.startDatetime}`;
    const endDate = `${lastSelect.dataset.endDatetime}`;
    const blockCreationData = this.model.get('blockCreationData') || {};
    
    const blockModel = new ScheduleBlock_model({
      schedule_period_id: periodModel.id,
      block_type: blockCreationData.blockType,
      block_start: startDate,
      block_end: endDate,
      system_user_id: blockOwner.id,
    });

    this.model.trigger('paint:block', blockModel);
  },
  
});
