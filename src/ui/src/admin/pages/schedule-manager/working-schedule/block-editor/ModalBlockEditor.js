import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import Input from '../../../../../core/components/input/Input';
import Input_model from '../../../../../core/components/input/Input_model';
import { toUserLevelAndNameDisplay } from '../../../../components/user-level/UserLevel';
import WorkingScheduleDayLegendView from '../WorkingScheduleDayLegend';
import { EDIT_TOOL_COLOUR_CLASSES, EDIT_TOOL_CONFIGS, WorkingScheduleEditToolsView } from '../WorkingScheduleEditTools';
import ScheduleBlock_model from '../../../../components/scheduling/schedule-blocks/ScheduleBlock_model';
import BlockCalendarView from '../../../../components/calendar/block-calendar/BlockCalendar';
import UndoHandler from '../UndoHandler';
import ModalAddBlock from '../../../../components/calendar/block-calendar/ModalAddBlock';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import './ModalBlockEditor.scss';

const modalChannel = Radio.channel('modals');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get')

const ModalBlockEditor = ModalBaseView.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['periodModel', 'userModel', 'selectedBlock', 'calendarModel']);

    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    this.HEARING_DEFAULT_START_TIME = configChannel.request('get', 'HEARING_DEFAULT_START_TIME');
    this.HEARING_DEFAULT_END_TIME = configChannel.request('get', 'HEARING_DEFAULT_END_TIME');
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.SCHED_BLOCK_MIN_DURATION_HOURS = configChannel.request('get', 'SCHED_BLOCK_MIN_DURATION_HOURS') || 0;
    this.SCHEDULE_BLOCK_TYPE_DISPLAY = configChannel.request('get', 'SCHEDULE_BLOCK_TYPE_DISPLAY');

    // TODO: This should be inside something related to the edit component?
    const paintTools = [
      EDIT_TOOL_CONFIGS.HEAR,
      EDIT_TOOL_CONFIGS.DUTY,
      EDIT_TOOL_CONFIGS.WRIT,
      EDIT_TOOL_CONFIGS.VAC,
      EDIT_TOOL_CONFIGS.BLK,
      EDIT_TOOL_CONFIGS.OTH,
    ];
    
    this.isPaintBlockSelectedFn = (blockType) => paintTools.includes(blockType);
    this.isBlockTypeDailyFn = (blockType) => ScheduleBlock_model.blockTypesDaily.includes(blockType);
    this.isRemoveBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.REMOVE;
    this.isEditBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.EDIT;
    this.isDutyBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.DUTY;
    this.isPowerEditBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.POWER_EDIT;
    
    loaderChannel.trigger('page:load');
    this.calendarModel.get('scheduleBlocksCollection').comparator = (a,b) => Moment(a.get('block_start')).unix() - Moment(b.get('block_start')).unix();
    this.model.set('_selectedEditToolId', EDIT_TOOL_CONFIGS.POWER_EDIT, { silent: true });
    this.isLoading = true;
    
    this.createSubModels();
    this.createListeners();
  },

  createSubModels() {
    this.undoHandler = new UndoHandler();
    
    this.blockStartDateModel = new Input_model({
      labelText: 'Block Start',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
    });

    this.blockStartTimeModel = new Input_model({
      labelText: ' ',
      errorMessage: 'Enter start time',
      inputType: 'time',
      required: true,
    });

    this.blockEndDateModel = new Input_model({
      labelText: 'Block End',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
    });

    this.blockEndTimeModel = new Input_model({
      labelText: ' ',
      errorMessage: 'Enter end time',
      inputType: 'time',
      required: true,
    });
  },
  

  createListeners() {
    this.listenTo(this.model, 'change:_selectedEditToolId', (model, toolId) => {
      if (!this.isPowerEditBlockSelectedFn(toolId)) this.resetSelectedBlock();
      this.render();
    });
    this.listenTo(this.calendarModel, 'click:block', this.handleBlockClick, this);
    this.listenTo(this.calendarModel, 'paint:block', this.handlePaintBlockComplete, this);
    this.listenTo(this.calendarModel, 'addBlock:blocksCreated', (blocks=[]) => {
      if (blocks?.length) {
        const blockCollection = this.calendarModel.get('scheduleBlocksCollection');
        blockCollection.add(blocks, { merge: true });
        this.calendarModel.parseBlocksFromApi(blockCollection);
        this.render();
      }
    });

    this.listenTo(this.blockStartDateModel, 'change:value', (m) => {
      if (m.isValid()) this.setStartDateTimeMinMaxes();
    });
    this.listenTo(this.blockEndDateModel, 'change:value', (m) => {
      if (m.isValid()) this.setEndDateTimeMinMaxes();
    });
    
  },

  resetSelectedBlock(blockModel=null) {
    // Always reset hearings - they will be manually loaded
    this.loadedHearingsForBlock = [];
    this.selectedBlock = blockModel || null;
    this.calendarModel.set('selectedBlockId', blockModel?.id);
  },

  async loadHearingsForBlockAndRender(blockModel) {
    this.isLoading = true;
    this.loadedHearingsForBlock = [];
    const start = Moment(blockModel.get('block_start'));
    const end = Moment(blockModel.get('block_end'));
    
    if (blockModel) {
      loaderChannel.trigger('page:load');

      // NOTE: Start/End dates in request must be in PST, mid-tier requires this currently
      const searchParams = {
        StartDate: Moment.tz(start, this.RTB_OFFICE_TIMEZONE_STRING).format('YYYY-MM-DDTHH:mm:SS'),
        EndDate: Moment.tz(end, this.RTB_OFFICE_TIMEZONE_STRING).subtract(1, 'minute').format('YYYY-MM-DDTHH:mm:SS'),
      };
      const hearingResponse = await hearingChannel.request('get:by:owner', this.userModel.id, searchParams);
      (hearingResponse?.daily_hearings||[]).forEach(hearingData => {
        hearingData?.hearings?.forEach(hearing => {
          if (Moment(hearing.hearing_end_datetime).isSameOrBefore(start) || Moment(hearing.hearing_start_datetime).isSameOrAfter(end)) {
            return;
          }
          this.loadedHearingsForBlock.push(hearing);
        });
        
      });
    
      this.loadedHearingsForBlock.sort((a, b) => Moment(a.hearing_start_datetime).unix() - Moment(b.hearing_end_datetime).unix());
    }
    
    this.isLoading = false;
    this.render();
  },

  showDutySchedulerUserWarningModal() {
    modalChannel.request('show:standard', {
      title: 'Scheduler Permissions - Duty Required',
      bodyHtml: 'This user must have duty scheduler access in order to add duty blocks.',
      cancelButtonText: 'Close',
      hideContinueButton: true,
    });
  },

  handleBlockClick(blockModel) {
    const toolId = this.model.get('_selectedEditToolId');
    const isPaintTool = this.isPaintBlockSelectedFn(toolId);
    const isEditTool = this.isEditBlockSelectedFn(toolId);
    const isRemoveTool = this.isRemoveBlockSelectedFn(toolId);
    const isPowerEditTool = this.isPowerEditBlockSelectedFn(toolId);
    
    if (isPaintTool) {
      // Some block types need a description - open to edit mode, with the paint tool used as the block type
      if (!blockModel.get('block_description') && (toolId === EDIT_TOOL_CONFIGS.BLK || toolId === EDIT_TOOL_CONFIGS.OTH)) {
        blockModel.set('block_type', toolId);
        return this.openModalAddBlock(blockModel);
      }
      return this.handlePaintToolClick(blockModel, toolId);
    } else if (isEditTool) {
      if (this.canAccessPowerEdit(blockModel)) {
        this.model.set('_selectedEditToolId', EDIT_TOOL_CONFIGS.POWER_EDIT, { silent: true });
        return this.handlePowerEditToolClick(blockModel);
      }
      else return this.openModalAddBlock(blockModel);
    } else if (isRemoveTool) {
      return this.handleRemoveToolClick(blockModel);
    } else if (isPowerEditTool) {
      return this.handlePowerEditToolClick(blockModel);
    }
  },

  handlePaintToolClick(blockModel, toolId) {
    if (toolId === blockModel.get('block_type')) return;

    // Handle duty user changes
    const blockOwner = userChannel.request('get:user', blockModel.get('system_user_id'));
    if (this.isDutyBlockSelectedFn(toolId) && (!blockOwner || !blockOwner.isDutyScheduler())) {
      return this.showDutySchedulerUserWarningModal();
    }
    
    const promiseChangeBlockType = (block_type, block_description) => new Promise((res, rej) => blockModel.save({ block_type, block_description })
        .done(res).fail(generalErrorFactory.createHandler('SCHEDULE.BLOCK.UPDATE', rej)));
    loaderChannel.trigger('page:load');
    // Clear block description on paint if the block type does not require a description
    const blockDescriptionToSet = toolId === EDIT_TOOL_CONFIGS.BLK || toolId === EDIT_TOOL_CONFIGS.OTH ? blockModel.get('block_description') : null;
    return promiseChangeBlockType(toolId, blockDescriptionToSet)
      .finally(() => {
      // Re-parse own collection to update cssClass etc for created blocks
      this.calendarModel.parseBlocksFromApi(this.calendarModel.get('scheduleBlocksCollection'));
      this.render();
    });
  },

  handlePaintBlockComplete(blockModel) {
    const blockOwner = userChannel.request('get:user', blockModel.get('system_user_id'));
    if (blockModel.get('block_type') === EDIT_TOOL_CONFIGS.DUTY && (!blockOwner || !blockOwner.isDutyScheduler())) {
      this.calendarModel.trigger('clear:dragSelects');
      this.showDutySchedulerUserWarningModal();
    } else {
      this.openModalAddBlock(blockModel, blockOwner);
    }
  },

  handleRemoveToolClick(blockModel) {
    if (blockModel.get('associated_hearings')) {
      return modalChannel.request('show:standard', {
        title: 'Delete Schedule Time',
        bodyHtml: `<p>You cannot delete schedule time that has empty or booking hearings in the block you are trying to delete.</p>`,
        cancelButtonText: 'Close',
        hideContinueButton: true,
      });
    }
    
    const promiseDeleteBlock = () => new Promise((res, rej) => blockModel.destroy()
      .done(res).fail(generalErrorFactory.createHandler('SCHEDULE.BLOCK.DELETE', rej)));

    loaderChannel.trigger('page:load');
    return promiseDeleteBlock().then(() => {
      // Re-parse own collection to update deleted block
      this.calendarModel.parseBlocksFromApi(this.calendarModel.get('scheduleBlocksCollection'));
    }).finally(() => {
      this.render();
    });
  },

  async handlePowerEditToolClick(blockModel) {
    this.resetSelectedBlock(blockModel);
    this.loadHearingsForBlockAndRender(blockModel);
  },

  canAccessPowerEdit(blockModel) {
    return blockModel?.get('assocaited_booked_hearings')
  },

  openModalAddBlock(blockModel, newBlockOwner=null) {
    const blockOwner = newBlockOwner || userChannel.request('get:user', blockModel.get('system_user_id'));
    const modalView = new ModalAddBlock({
      blockOwner,
      periodModel: this.calendarModel.get('periodModel'),
      model: this.calendarModel,
      blockModel,
      loadedUserBlocks: this.calendarModel.get('scheduleBlocksCollection').filter(b => b.get('system_user_id') === blockOwner?.id),
    });

    this.listenToOnce(modalView, 'removed:modal', () => {
      this.calendarModel.trigger('clear:dragSelects');
    });
    modalChannel.request('add', modalView);
  },


  async splitSelectedBlock(blockModel, splitDate) {
    const copySelectedBlock = () => {
      return new ScheduleBlock_model({
        schedule_period_id: this.periodModel.id,
        system_user_id: this.userModel.id,
        block_start: blockModel.get('block_start'),
        block_end: blockModel.get('block_end'),
        block_type: blockModel.get('block_type'),
        block_status: blockModel.get('block_status'),
        block_sub_status: blockModel.get('block_sub_status'),
        block_description: blockModel.get('block_description'),
        block_note: blockModel.get('block_note'),
      });
    }
    const blockA = copySelectedBlock();
    const blockB = copySelectedBlock();
    blockA.set('block_end', splitDate.toISOString());
    blockB.set('block_start', splitDate.toISOString());

    const schedBlockMinDurationMiliseconds = this.SCHED_BLOCK_MIN_DURATION_HOURS * 60 * 60 * 1000;
    if ([blockA, blockB].filter(b => b.getBlockDuration() < schedBlockMinDurationMiliseconds).length) {
      modalChannel.request('show:standard', {
        title: 'Split Error - Block Too Short',
        bodyHtml: `<p>
          Splitting the block here would create a schedule block less than ${this.SCHED_BLOCK_MIN_DURATION_HOURS} hour${this.SCHED_BLOCK_MIN_DURATION_HOURS===1?'':'s'} in duration. 
          Schedule blocks must be at least ${this.SCHED_BLOCK_MIN_DURATION_HOURS} hour${this.SCHED_BLOCK_MIN_DURATION_HOURS===1?'':'s'} long.
        </p>`,
        hideContinueButton: true,
        cancelButtonText: 'Close',
      });
      return;
    }

    loaderChannel.trigger('page:load');
    try {
      await blockModel.destroy().catch(err => {
        generalErrorFactory.createHandler('SCHEDULE.BLOCK.DELETE', () => this.render())(err);
        throw new Error();
      });
      await Promise.all([blockA.save(), blockB.save()]).catch(err => {
        generalErrorFactory.createHandler('SCHEDULE.BLOCK.CREATE', () => this.render())(err);
        throw new Error();
      });
      const blockCollection = this.calendarModel.get('scheduleBlocksCollection');
      blockCollection.remove(blockModel, { silent: true });
      blockCollection.add([blockA, blockB], { merge: true, silent: true });
      this.calendarModel.parseBlocksFromApi(blockCollection);
      this.resetSelectedBlock(blockA);
      this.loadHearingsForBlockAndRender(blockA);
    } catch (err) {
      // Errors are handled on the calls themselves
    }    
  },

  showHideSection(uiShow=[], uiHide=[]) {
    if (uiShow && !Array.isArray(uiShow)) uiShow = [uiShow];
    if (uiHide && !Array.isArray(uiHide)) uiHide = [uiHide];

    uiShow.forEach(ui => this.getUI(ui).removeClass('hidden'));
    uiHide.forEach(ui => this.getUI(ui).addClass('hidden'));
  },

  validateAndShowErrors(regions=[]) {
    let isValid = true;
    regions.forEach(regionName => {
      const view = this.getChildView(regionName);
      isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  async saveBlock(blockData={}) {
    loaderChannel.trigger('page:load');
    this.selectedBlock.set(blockData);
    try {
      await this.selectedBlock.save(this.selectedBlock.getApiChangesOnly()).catch(err => {
        generalErrorFactory.createHandler('SCHEDULE.BLOCK.UPDATE')(err);
        throw new Error();
      });
      this.calendarModel.get('scheduleBlocksCollection').add(this.selectedBlock, { merge: true, silent: true })
      this.calendarModel.parseBlocksFromApi(this.calendarModel.get('scheduleBlocksCollection'));
      this.resetSelectedBlock(this.selectedBlock);
      this.loadHearingsForBlockAndRender(this.selectedBlock);
    } catch {
      this.close();
    }
  },

  async saveStartDate() {
    if (!this.validateAndShowErrors(['blockStartDateRegion', 'blockStartTimeRegion'])) return;
    const startDate = Moment(`${this.blockStartDateModel.getData({ format: 'date' })}T${this.blockStartTimeModel.getData({ iso: true })}`).toISOString();
    await this.saveBlock({ block_start: startDate, });
    this.showHideSection(['startView', 'editBtns'], 'startEdit');
  },

  async saveEndDate() {
    if (!this.validateAndShowErrors(['blockEndDateRegion', 'blockEndTimeRegion'])) return;
    const endDate = Moment(`${this.blockEndDateModel.getData({ format: 'date' })}T${this.blockEndTimeModel.getData({ iso: true })}`).toISOString();
    await this.saveBlock({ block_end: endDate, });
    this.showHideSection(['endView', 'editBtns'], 'endEdit');
  },

  showStartDate() {
    this.setStartDateTimeMinMaxes();
    this.showHideSection('startEdit', ['startView', 'editBtns']);
  },

  showEndDate() {
    this.setEndDateTimeMinMaxes();
    this.showHideSection('endEdit', ['endView', 'editBtns'])
  },

  cancelStartDate() {
    this.showHideSection(['startView', 'editBtns'], 'startEdit');
    this.render();
  },

  cancelEndDate() {
    this.showHideSection(['endView', 'editBtns'], 'endEdit');
    this.render();
  },

  setStartDateTimeMinMaxes() {
    if (!this.selectedBlock) return;
    
    // Set the correct start/end datetime values/min/maxes
    const blocks = this.calendarModel.get('scheduleBlocksCollection');
    blocks.sort();
    const currIndex = blocks.indexOf(this.selectedBlock);
    const prevBlock = currIndex ? blocks.at(currIndex-1) : null;
    const selectedDate = Moment.tz(this.blockStartDateModel.getData(), this.RTB_OFFICE_TIMEZONE_STRING);
    const isBlockDaily = this.selectedBlock.isTypeDaily();
    const hearingsOnSelectedDay = this.loadedHearingsForBlock?.filter(h => Moment.tz(h.hearing_start_datetime, this.RTB_OFFICE_TIMEZONE_STRING).isSame(selectedDate, 'day'));
    const firstHearingInBlock = this.loadedHearingsForBlock?.[0];
    const firstHearingToday = hearingsOnSelectedDay?.[0];
    const momentSelectedDayStart = Moment.tz(Moment(`${selectedDate.format('YYYY-MM-DD')}T${this.HEARING_MIN_BOOKING_TIME}`, `YYYY-MM-DDT${Input_model.getTimeFormat()}`), this.RTB_OFFICE_TIMEZONE_STRING);
    const momentSelectedDayEnd = Moment.tz(Moment(`${selectedDate.format('YYYY-MM-DD')}T${this.HEARING_MAX_BOOKING_TIME}`, `YYYY-MM-DDT${Input_model.getTimeFormat()}`), this.RTB_OFFICE_TIMEZONE_STRING);

    const minStartDateMoment = isBlockDaily ? selectedDate :
        (prevBlock ? Moment.tz(prevBlock.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING) : Moment(this.periodModel.get('period_start')));
    const maxStartDateMoment = isBlockDaily ? selectedDate :
      (firstHearingInBlock ? Moment.tz(firstHearingInBlock.hearing_start_datetime, this.RTB_OFFICE_TIMEZONE_STRING) : Moment.tz(this.selectedBlock.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING));
    const minStartTimeMoment = prevBlock && Moment(prevBlock.get('block_end')).isAfter(momentSelectedDayStart) ? Moment(prevBlock.get('block_end')) : momentSelectedDayStart;
    const maxStartTimeMoment = firstHearingToday ? Moment.tz(firstHearingToday.hearing_start_datetime, this.RTB_OFFICE_TIMEZONE_STRING)
      : Moment(momentSelectedDayEnd).subtract(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');

    // Check if there are valid times on the start date - otherwise, remove it
    if (prevBlock && minStartDateMoment.isSame(prevBlock.get('block_end'), 'day') && Moment(prevBlock.get('block_end')).format(Input_model.getTimeFormat()) === this.HEARING_MAX_BOOKING_TIME) {
      minStartDateMoment.add(1, 'day');
    }

    this.blockStartDateModel.set({
      minDate: minStartDateMoment.format(Input_model.getDateFormat()),
      maxDate: maxStartDateMoment.format(Input_model.getDateFormat()),
    }).trigger('render');

    this.blockStartTimeModel.set({
      minTime: minStartTimeMoment.format(Input_model.getTimeFormat()),
      maxTime: maxStartTimeMoment.format(Input_model.getTimeFormat()),
    }).trigger('render');
  },

  setEndDateTimeMinMaxes() {
    if (!this.selectedBlock) return;

    // Set the correct start/end datetime values/min/maxes
    const blocks = this.calendarModel.get('scheduleBlocksCollection');
    blocks.sort();
    const currIndex = blocks.indexOf(this.selectedBlock);
    const nextBlock = currIndex < blocks.length ? blocks.at(currIndex+1) : null;
    const selectedDate = Moment.tz(this.blockEndDateModel.getData(), this.RTB_OFFICE_TIMEZONE_STRING);
    const isBlockDaily = this.selectedBlock.isTypeDaily();
    const hearingsOnSelectedDay = this.loadedHearingsForBlock?.filter(h => Moment.tz(h.hearing_start_datetime, this.RTB_OFFICE_TIMEZONE_STRING).isSame(selectedDate, 'day'));
    const lastHearingInBlock = this.loadedHearingsForBlock?.slice(-1)?.[0];
    const lastHearingToday = hearingsOnSelectedDay?.slice(-1)?.[0];
    const momentSelectedDayStart = Moment.tz(Moment(`${selectedDate.format('YYYY-MM-DD')}T${this.HEARING_MIN_BOOKING_TIME}`, `YYYY-MM-DDT${Input_model.getTimeFormat()}`), this.RTB_OFFICE_TIMEZONE_STRING);
    const momentSelectedDayEnd = Moment.tz(Moment(`${selectedDate.format('YYYY-MM-DD')}T${this.HEARING_MAX_BOOKING_TIME}`, `YYYY-MM-DDT${Input_model.getTimeFormat()}`), this.RTB_OFFICE_TIMEZONE_STRING);

    const minEndDateMoment = isBlockDaily ? selectedDate :
      (lastHearingInBlock ? Moment.tz(lastHearingInBlock.hearing_end_datetime, this.RTB_OFFICE_TIMEZONE_STRING) : Moment.tz(this.selectedBlock.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING));
    const maxEndDateMoment = isBlockDaily ? selectedDate :
      (nextBlock ? Moment.tz(nextBlock.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING) : Moment(this.periodModel.get('period_end')).subtract(6,' hours')); // Add correction for period midnight
    const minEndTimeMoment = lastHearingToday ? Moment.tz(lastHearingToday.hearing_end_datetime, this.RTB_OFFICE_TIMEZONE_STRING) : Moment.max(Moment(momentSelectedDayStart).add(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours'), Moment(this.selectedBlock.get('block_start')).add(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours'));
    const maxEndTimeMoment = nextBlock && Moment(nextBlock.get('block_start')).isBefore(momentSelectedDayEnd) ? Moment(nextBlock.get('block_start')) : momentSelectedDayEnd;
    
    // Check if there are valid times on the end date - otherwise, remove it
    if (nextBlock && maxEndDateMoment.isSame(nextBlock.get('block_start'), 'day') && Moment(nextBlock.get('block_start')).format(Input_model.getTimeFormat()) === this.HEARING_MIN_BOOKING_TIME) {
      maxEndDateMoment.subtract(1, 'day');
    }
    
    this.blockEndDateModel.set({
      minDate: minEndDateMoment.format(Input_model.getDateFormat()),
      maxDate: maxEndDateMoment.format(Input_model.getDateFormat()),
    }).trigger('render');

    this.blockEndTimeModel.set({
      minTime: minEndTimeMoment.format(Input_model.getTimeFormat()),
      maxTime: maxEndTimeMoment.format(Input_model.getTimeFormat()),
    }).trigger('render');
  },

  onBeforeRender() {
    if (!this.selectedBlock) return;

    this.blockStartDateModel.set({
      value: Moment(this.selectedBlock.get('block_start')).format(Input_model.getDateFormat()),
    }, { silent: true });

    this.blockStartTimeModel.set({
      value: Moment(this.selectedBlock.get('block_start')).format(Input_model.getTimeFormat()),
    }, { silent: true });

    this.blockEndDateModel.set({
      value: Moment(this.selectedBlock.get('block_end')).format(Input_model.getDateFormat()),
    }, { silent: true });

    this.blockEndTimeModel.set({
      value: Moment(this.selectedBlock.get('block_end')).format(Input_model.getTimeFormat()),
    }, { silent: true });
  },

  onRender() {
    if (this.isLoading) return;
    if (!this.periodModel?.areEditsAllowed()) return this.close();

    this.prepareCalendar();

    this.showChildView('dayLegendRegion', new WorkingScheduleDayLegendView());
    this.showChildView('toolsRegion', new WorkingScheduleEditToolsView({
      selectedItemId: this.model.get('_selectedEditToolId'),
      model: this.model,
      undoHandler: this.undoHandler,
      enablePowerEdit: true,
    }));

    this.showChildView('calendarRegion', new BlockCalendarView({ model: this.calendarModel }));
    

    if (this.selectedBlock) {
      this.showChildView('blockStartDateRegion', new Input({ model: this.blockStartDateModel }));
      this.showChildView('blockStartTimeRegion', new Input({ model: this.blockStartTimeModel }));
      this.showChildView('blockEndDateRegion', new Input({ model: this.blockEndDateModel }));
      this.showChildView('blockEndTimeRegion', new Input({ model: this.blockEndTimeModel }));

      // Always hide any active edits
      this.showHideSection(['startView', 'editBtns'], 'startEdit');
      this.showHideSection(['endView', 'editBtns'], 'endEdit');
    }

    loaderChannel.trigger('page:load:complete');
  },

  prepareCalendar() {
    const toolId = this.model.get('_selectedEditToolId');
    const isPaintTool = this.isPaintBlockSelectedFn(toolId);
    const toolIsDailyBlock = this.isBlockTypeDailyFn(toolId);
    const calendarModelData = Object.assign({
      disabled: !this.periodModel || !this.periodModel.areEditsAllowed(),
      disableSelection: !isPaintTool,
      dailySelectionOnly: isPaintTool && toolIsDailyBlock,
    }, isPaintTool ? {
      blockCreationData: {
        blockType: toolId
      },
    } : {});
    this.calendarModel.set(calendarModelData, { silent: true });
    
    this.getUI('calendar')
      .removeClass(Object.values(EDIT_TOOL_COLOUR_CLASSES))
      .addClass(EDIT_TOOL_COLOUR_CLASSES[toolId]);
    
    if (this.calendarModel.get('disabled')) this.getUI('calendar').addClass('disabled');
    else this.getUI('calendar').removeClass('disabled');
  },

  id: 'blockEditor-modal',
  className() {
    return `block-edit ${ModalBaseView.prototype.className}`;
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      calendar: '.working-sched__calendar',

      startView: '.block-edit__date-view-start',
      startEdit: '.block-edit__date-edit-start',
      endView: '.block-edit__date-view-end',
      endEdit: '.block-edit__date-edit-end',

      editBtns: '.block-edit__date-edit-btn',
    });
  },

  regions: {
    dayLegendRegion: '.working-sched__legend',
    calendarRegion: '.working-sched__calendar',
    toolsRegion: '.block-edit__tools',

    blockStartDateRegion: '.block-edit__block-start-date',
    blockStartTimeRegion: '.block-edit__block-start-time',
    blockEndDateRegion: '.block-edit__block-end-date',
    blockEndTimeRegion: '.block-edit__block-end-time',
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      
    });
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">Advanced Block Editor</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">
            {this.renderJsxTopRow()}
            {this.renderJsxCalendar()}
            {this.renderJsxHearingDetails()}
          </div>
        </div>
      </div>
    );
  },

  renderJsxTopRow() {
    return <div className="block-edit__info-row">
      <div>
        <div className=""><label className="general-modal-label">Period:</label>&nbsp;<span className="general-modal-value">{Formatter.toPeriodFullDateDisplay(this.periodModel)}</span></div>
        <div className=""><span className="general-modal-value" dangerouslySetInnerHTML={{ __html: toUserLevelAndNameDisplay(this.userModel, { displaySchedulerType: true, displayUserLevelIcon: true })}}></span></div>
      </div>
      <div className="working-sched__legend"></div>
      <div className="block-edit__tools"></div>
    </div>
  },

  renderJsxCalendar() {
    return <div className="block-edit__calendar-row">
      <div className="working-sched__calendar"></div>
    </div>;
  },

  renderJsxHearingDetails() {
    const renderBlockInfo = (blockModel) => {
      return <div className="block-edit__block-info">
        <div className="">
          <label className="general-modal-label">Block Type:</label>&nbsp;
          <span className={`general-modal-value ${blockModel.getTypeDisplayClass()}`}>{this.SCHEDULE_BLOCK_TYPE_DISPLAY[blockModel.get('block_type')] || '-'}</span>
          {blockModel.get('block_description') ? <span> - {blockModel.get('block_description')}</span> : null}
        </div>
        <div>
          <label className="general-modal-label">Created:</label>&nbsp;<span className="">{Formatter.toDateAndTimeDisplay(blockModel.get('created_date'))} - {Formatter.toUserDisplay(blockModel.get('created_by'))}</span>
        </div>
        <div>
          <label className="general-modal-label">Modified:</label>&nbsp;<span className="">{Formatter.toDateAndTimeDisplay(blockModel.get('modified_date'))} - {Formatter.toUserDisplay(blockModel.get('modified_by'))}</span>
        </div>
        <br/>
        <div>
          <div className="block-edit__date-view-start">
            <label className="general-modal-label">Start:</label>&nbsp;<span className="general-modal-value">{Formatter.toDateAndTimeDisplay(blockModel.get('block_start'))}</span>
            &nbsp;<span className="block-edit__date-edit-btn general-link" onClick={() => this.showStartDate()}>edit start</span>
          </div>
          <div className="block-edit__date-edit block-edit__date-edit-start hidden">
            <div className="block-edit__block-start-date"></div>
            <div className="block-edit__block-start-time"></div>
            <div className="block-edit__block-time-controls">
            <div className="block-edit__block-time-controls__cancel component-email-buttons-cancel" onClick={() => this.cancelStartDate()}></div>
              <div className="block-edit__block-time-controls__save component-email-buttons-ok" onClick={() => this.saveStartDate()}></div>
            </div>
          </div>
        </div>
        <div>
          <div className="block-edit__date-view-end">
            <label className="general-modal-label">End:</label>&nbsp;<span className="general-modal-value">{Formatter.toDateAndTimeDisplay(blockModel.get('block_end'))}</span>
            &nbsp;<span className="block-edit__date-edit-btn general-link" onClick={() => this.showEndDate()}>edit end</span>
          </div>
          <div className="block-edit__date-edit block-edit__date-edit-end hidden">
            <div className="block-edit__block-end-date"></div>
            <div className="block-edit__block-end-time"></div>
            <div className="block-edit__block-time-controls">
              <div className="block-edit__block-time-controls__cancel component-email-buttons-cancel" onClick={() => this.cancelEndDate()}></div>
              <div className="block-edit__block-time-controls__save component-email-buttons-ok" onClick={() => this.saveEndDate()}></div>
            </div>
          </div>
        </div>
      </div>
    };
    const renderBlockHearings = (blockModel) => {
      if (!blockModel) return <i>No block selected with power edit tool</i>;
      if (!this.loadedHearingsForBlock?.length) return <i>No associated hearings in block</i>;
      const hasMultipleHearings = this.loadedHearingsForBlock.length > 1;
      const doesBlockSpanMultipleDays = Moment.tz(this.selectedBlock.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING).format('YYYY-MM-DD') !== Moment.tz(this.selectedBlock.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING).format('YYYY-MM-DD');
      return <>
        {this.loadedHearingsForBlock.map((hearing, index) => {
          let timeDiff, splitDate;
          if (hasMultipleHearings && index) {
            timeDiff = Moment(hearing.hearing_start_datetime).diff(Moment(this.loadedHearingsForBlock[index-1].hearing_end_datetime), 'minutes') || 0;
            splitDate = Moment(hearing.hearing_start_datetime).subtract(timeDiff/2, 'minutes');
          }
          return <>
            {splitDate ? <span className="general-link block-edit__split" onClick={() => this.splitSelectedBlock(blockModel, splitDate)}>
              <b className="glyphicon glyphicon-scissors"></b>
              Split at {Formatter.toTimeDisplay(splitDate)}
              {doesBlockSpanMultipleDays ? <>, {splitDate.format('MMMM Do')}</> : null}
            </span> : null}
            <div className="">
              <label className="general-modal-label">Hearing {index+1}:</label>&nbsp;
              <span className="general-modal-value">
                {Formatter.toTimeDisplay(hearing.hearing_start_datetime)}-{Formatter.toTimeDisplay(hearing.hearing_end_datetime)}
                {doesBlockSpanMultipleDays ? <>&nbsp;({Moment(hearing.hearing_start_datetime).format('MMM D')})</> : null}
              </span>
            </div>
          </>
        })}
      </>
    };
    return <div className="block-edit__hearings-row">
      <div className="block-edit__hearings-label">Selected block</div>
      {this.selectedBlock ? renderBlockInfo(this.selectedBlock) : null}
      {renderBlockHearings(this.selectedBlock)}
    </div>
  },

});

_.extend(ModalBlockEditor.prototype, ViewJSXMixin)

export { ModalBlockEditor }

