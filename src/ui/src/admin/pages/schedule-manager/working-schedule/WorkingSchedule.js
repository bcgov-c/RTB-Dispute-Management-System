import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import React from 'react';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { routeParse } from '../../../routers/mainview_router';
import ScheduleBlock_collection from '../../../components/scheduling/schedule-blocks/ScheduleBlock_collection';
import BlockCalendarView from '../../../components/calendar/block-calendar/BlockCalendar';
import BlockCalendarGridModel from '../../../components/calendar/block-calendar/BlockCalendarGrid_model';
import ScheduleBlockModel from '../../../components/scheduling/schedule-blocks/ScheduleBlock_model';
import InputModel from '../../../../core/components/input/Input_model';
import Input from '../../../../core/components/input/Input';
import WorkingScheduleDayLegendView from './WorkingScheduleDayLegend';
import { WorkingScheduleEditToolsView, EDIT_TOOL_CONFIGS, EDIT_TOOL_COLOUR_CLASSES } from './WorkingScheduleEditTools';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import './working-schedule.scss';
import prevIcon from '../../../static/Icon_Admin_Prev.png';
import nextIcon from '../../../static/Icon_Admin_Next.png'
import periodIcon from '../../../static/Icon_AdminBar_HearingAdd.png';
import ModalAddBlock from '../../../components/calendar/block-calendar/ModalAddBlock';
import { ModalEditPeriod } from '../ModalEditPeriod';
import UndoHandler from './UndoHandler';
import { ModalBulkAddBlocks } from './bulk-add-blocks/ModalBulkAddBlocks';
import { ModalHearingGeneration } from './hearing-generation/ModalHearingGeneration'
import { ModalBlockEditor } from './block-editor/ModalBlockEditor';

const CUSTOM_LINK_TEXT = 'This week';
const CALENDAR_SCROLL_DEBOUNCE_MS = 60;

const menuChannel = Radio.channel('menu');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const schedulingChannel = Radio.channel('scheduling');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const WorkingScheduleView = Marionette.View.extend({
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['showInactiveStaff', 'initialPeriodId', 'userFilterFn', 'addCalendarScrollFn']);

    this.SCHED_PERIOD_STATUS_LOCKED_PREP = configChannel.request('get', "SCHED_PERIOD_STATUS_LOCKED_PREP");
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');

    this.arbIds = userChannel.request('get:arbs').map(user => user.id);
    this.dayLegendView = null;
    this.periodCollection = null;
    this.currentPeriod = null;
    this.todayPeriod = null;
    this.loadedBlocks = null;
    this.isLoaded = false;

    const paintTools = [
      EDIT_TOOL_CONFIGS.HEAR,
      EDIT_TOOL_CONFIGS.DUTY,
      EDIT_TOOL_CONFIGS.WRIT,
      EDIT_TOOL_CONFIGS.VAC,
      EDIT_TOOL_CONFIGS.BLK,
      EDIT_TOOL_CONFIGS.OTH,
    ];

    this.isPaintBlockSelectedFn = (blockType) => paintTools.includes(blockType);
    this.isBlockTypeDailyFn = (blockType) => ScheduleBlockModel.blockTypesDaily.includes(blockType);
    this.isRemoveBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.REMOVE;
    this.isEditBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.EDIT;
    this.isDutyBlockSelectedFn = (blockType) => blockType === EDIT_TOOL_CONFIGS.DUTY;

    this.createSubModels();
    this.setupListeners();

    this.model.set('_selectedEditToolId', EDIT_TOOL_CONFIGS.EDIT, { silent: true });
    this.loadPeriods();
  },

  createSubModels() {
    this.undoHandler = new UndoHandler();
    this.calendarModel = new BlockCalendarGridModel({
      periodModel: this.currentPeriod,
      headerLabel: 'Staff Name',
      undoHandler: this.undoHandler,
      userFilterFn: this.userFilterFn,
      todayIndicator: true,
    });

    this.weekDateModel = new InputModel({
      value: null,
      inputType: 'date',
      labelText: 'Period start',
      disabled: true,
      allowFutureDate: true,
      customLink: null,
      customLinkFn: () => {
        loaderChannel.trigger('page:load');
        this.updateCurrentPeriodTo(this.todayPeriod);
        this.loadCurrentPeriodBlocksAndRender();
      },
      secondCustomLink: 'Pick day',
      secondCustomLinkFn: () => {
        this.weekDateModel.trigger('show:datepicker');
      },
    });
  },

  setupListeners() {
    this.stopListening(menuChannel, 'animation:complete');
    this.listenTo(menuChannel, 'animation:complete', () => this.calendarModel.trigger('render:calendarEvents'));

    const dateTimeFormat = `${InputModel.getDateFormat()}${InputModel.getTimeFormat()}`;
    this.listenTo(this.weekDateModel, 'change:value', (model, selectedDay) => {
      const undoChange = () => model.set('value', model.previous('value'), { silent: true });
      if (!model.isValid()) return undoChange();

      const startDate = Moment.tz(
        Moment(`${selectedDay}${this.HEARING_MIN_BOOKING_TIME}`, dateTimeFormat),
        this.RTB_OFFICE_TIMEZONE_STRING
      );
      const endDate = Moment.tz(
        Moment(`${selectedDay}${this.HEARING_MAX_BOOKING_TIME}`, dateTimeFormat),
        this.RTB_OFFICE_TIMEZONE_STRING
      );
      if (!startDate.isValid() || !endDate.isValid()) return undoChange();

      const associatedPeriods = this.periodCollection.getPeriodsInDateRange(startDate, endDate);
      if (!associatedPeriods.length) return undoChange();
      
      loaderChannel.trigger('page:load');
      this.updateCurrentPeriodTo(associatedPeriods[0]);
      this.loadCurrentPeriodBlocksAndRender();
    })

    this.listenTo(this.model, 'show:bulk', () => {
      if (this.currentPeriod && this.currentPeriod.isLockedForPrep() && this.currentPeriod.areEditsAllowed()) {
        this.showModalBulkAddBlocks();
      } else {
        modalChannel.request('show:standard', {
          title: 'Hearing Generation',
          bodyHtml: '<p>The Hearing Generation tool cannot be used when the period is not in the "Locked for Preparation" status, or when a schedule period contains any dates in the past.</p>',
          hideContinueButton: true,
          cancelButtonText: 'Close',
        });
      }
    });
    this.listenTo(this.model, 'show:hearingGeneration', () => {
      if (this.currentPeriod && this.currentPeriod.isLockedForPrep() && this.currentPeriod.areEditsAllowed()) {
        this.showModalHearingGeneration();
      } else {
        modalChannel.request('show:standard', {
          title: 'Hearing Generation',
          bodyHtml: '<p>The Bulk Add Blocks tool cannot be used when the period is not in the "Locked for Preparation" status, or when a schedule period contains any dates in the past.</p>',
          hideContinueButton: true,
          cancelButtonText: 'Close',
        });
      }
    })
    this.listenTo(this.calendarModel, 'click:block', this.handleBlockClick, this);
    this.listenTo(this.calendarModel, 'paint:block', this.handlePaintBlockComplete, this);
    this.listenTo(this.calendarModel, 'addBlock:complete', (result) => {
      if (result) {
        loaderChannel.trigger('page:load');
        this.loadCurrentPeriodBlocksAndRender();
      }
    });

    this.listenTo(this.calendarModel, 'create:undo:deleteBlock', (blockModel) => {
      this.undoHandler.addChangeItem({
        revertFn: () => new Promise((res, rej) => {
          blockModel.fetch()
          .then(() => Promise.all([blockModel.destroy()]))
          .then(() => {
            this.loadedBlocks.remove(blockModel);
            res();
          }, generalErrorFactory.createHandler('SCHEDULE.BLOCK.DELETE', rej))
        })
      })
    });

    this.listenTo(this.model, 'change:_selectedEditToolId', (model, toolId) => {
      const isPaintTool = this.isPaintBlockSelectedFn(toolId);
      const noCalendarRender = (isPaintTool && !this.calendarModel.get('disableSelection')) || (!isPaintTool && this.calendarModel.get('disableSelection'));
      // Show a short timer if a calendar render is needed, ensure the loader is shown
      if (!noCalendarRender) loaderChannel.trigger('page:load');
      setTimeout(() => this.prepareAndRenderCalendar({ noCalendarRender }), noCalendarRender ? 0 : 1);
    });

    this.listenTo(this.undoHandler, 'apply:latest', () => {
      loaderChannel.trigger('page:load');
      this.undoHandler.applyLatestUndo().finally(() => {
        // Always make sure latest loadedBlocks is applied
        this.calendarModel.parseBlocksFromApi(this.loadedBlocks);
        setTimeout(() => this.prepareAndRenderCalendar(), 5);
      });
    });
  },

  cacheWorkingScheduleData(cachePeriod) {
    this.model.set('_scheduleManagerPageData', { ...this.model.get('_scheduleManagerPageData'), ...{ period: cachePeriod } } );
  },

  showDutySchedulerUserWarningModal() {
    modalChannel.request('show:standard', {
      title: 'Scheduler Permissions - Duty Required',
      bodyHtml: 'This user must have duty scheduler access in order to add duty blocks.',
      cancelButtonText: 'Close',
      hideContinueButton: true,
    });
  },
  
  showModalBulkAddBlocks() {
    const bulkAddBlocksModal = new ModalBulkAddBlocks({
      model: this.model,
      periodModel: this.currentPeriod,
    });

    this.listenTo(bulkAddBlocksModal, 'removed:modal', this.render, this);
    modalChannel.request('add', bulkAddBlocksModal);
  },

  showModalHearingGeneration() {
    const hearingGenerationModal = new ModalHearingGeneration({
      model: this.model,
      periodModel: this.currentPeriod
    });

    this.listenTo(hearingGenerationModal, 'removed:modal', this.render, this);
    modalChannel.request('add', hearingGenerationModal);
  },

  handlePaintBlockComplete(blockModel) {
    const blockOwner = userChannel.request('get:user', blockModel.get('system_user_id'));
    if (blockModel.get('block_type') === EDIT_TOOL_CONFIGS.DUTY && (!blockOwner || !blockOwner.isDutyScheduler())) {
      this.calendarModel.trigger('clear:dragSelects');
      this.showDutySchedulerUserWarningModal();
    } else {
      this.openModalAddBlock(blockModel, { blockOwner });
    }
  },

  openModalAddBlock(blockModel, modalAddBlockOptions={}) {
    const blockOwner = modalAddBlockOptions.blockOwner || userChannel.request('get:user', blockModel.get('system_user_id'));
    const modalView = new ModalAddBlock(Object.assign({}, {
      blockOwner,
      periodModel: this.calendarModel.get('periodModel'),
      model: this.calendarModel,
      blockModel,
      loadedUserBlocks: this.calendarModel.get('scheduleBlocksCollection').filter(b => b.get('system_user_id') === blockOwner?.id),
    }, modalAddBlockOptions));

    this.listenToOnce(modalView, 'removed:modal', () => {
      this.calendarModel.trigger('clear:dragSelects');
    });
    modalChannel.request('add', modalView);
  },

  openModalBlockEditor(blockModel) {
    const blockUserID = blockModel.get('system_user_id');
    const powerEditCalendarModel = new BlockCalendarGridModel({
      periodModel: this.calendarModel.get('periodModel'),
      headerLabel: 'Staff Name',
      undoHandler: this.undoHandler,
      showReporting: false,
      disableHeaderRouting: true,
      // Only show current user
      userFilterFn: (user) => user.id === blockUserID,
      todayIndicator: true,
      selectedBlockId: blockModel.id,
    });
    const powerEditCollection = new ScheduleBlock_collection(this.calendarModel.get('scheduleBlocksCollection').filter(b => b.get('system_user_id') === blockUserID));
    powerEditCalendarModel.parseBlocksFromApi(powerEditCollection);

    const modalView = new ModalBlockEditor({
      userModel: userChannel.request('get:user', blockModel.get('system_user_id')),
      periodModel: this.calendarModel.get('periodModel'),
      selectedBlock: blockModel,
      calendarModel: powerEditCalendarModel,
      // Use a new model so that the selected tool doesn't change main page selections
      model: new Backbone.Model(),
    });

    this.listenToOnce(modalView, 'removed:modal', () => {
      // Merge changed data back into the parent calendar
      const blockCollection = this.calendarModel.get('scheduleBlocksCollection');
      blockCollection.add(powerEditCalendarModel.get('scheduleBlocksCollection')?.models, { merge: true });
      this.calendarModel.parseBlocksFromApi(blockCollection);
      this.prepareAndRenderCalendar();
    });
    this.listenToOnce(modalView, 'shown:modal', () => {
      modalView.loadHearingsForBlockAndRender(blockModel);
    });

    modalChannel.request('add', modalView);
  },

  handleBlockClick(blockModel) {
    const toolId = this.model.get('_selectedEditToolId');
    const isPaintTool = this.isPaintBlockSelectedFn(toolId);
    const isEditTool = this.isEditBlockSelectedFn(toolId);
    const isRemoveTool = this.isRemoveBlockSelectedFn(toolId);
    
    if (isPaintTool) {
      // Some block types need a description - open to edit mode, with the paint tool used as the block type
      if (!blockModel.get('block_description') && (toolId === EDIT_TOOL_CONFIGS.BLK || toolId === EDIT_TOOL_CONFIGS.OTH)) {
        blockModel.set('block_type', toolId);
        return this.openModalAddBlock(blockModel);
      }
      return this.handlePaintToolClick(blockModel, toolId);
    } else if (isEditTool) {
      if (this.canAccessPowerEdit(blockModel)) return this.openModalBlockEditor(blockModel);
      else return this.openModalAddBlock(blockModel);
    } else if (isRemoveTool) {
      return this.handleRemoveToolClick(blockModel);
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

    const originalBlockType = blockModel.get('block_type');
    const originalBlockDescription = blockModel.get('block_description');
    const promiseChangeBlockTypeUndo = () => new Promise((res, rej) => {
      blockModel.fetch()
        .then(() => Promise.all([blockModel.save({ block_type: originalBlockType, block_description: originalBlockDescription })]))
        .then(() => {
          res();
        }, generalErrorFactory.createHandler('SCHEDULE.BLOCK.UPDATE', rej))
    });
    
    loaderChannel.trigger('page:load');
    // Clear block description on paint if the block type does not require a description
    const blockDescriptionToSet = toolId === EDIT_TOOL_CONFIGS.BLK || toolId === EDIT_TOOL_CONFIGS.OTH ? blockModel.get('block_description') : null;
    return promiseChangeBlockType(toolId, blockDescriptionToSet)
      .then(() => {
        this.undoHandler.addChangeItem({
          title: 'Edit block type',
          revertFn: promiseChangeBlockTypeUndo
        });
      })
      .finally(() => {
        // Re-parse own collection to update cssClass etc for created blocks
        this.calendarModel.parseBlocksFromApi(this.calendarModel.get('scheduleBlocksCollection'));
        this.prepareAndRenderCalendar();
      });
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
    // Create blank block so it can be re-added
    const originalBlockData = blockModel.toJSON();
    delete originalBlockData[blockModel.idAttribute];
    const promiseDeleteBlockUndo = () => new Promise((res, rej) => {
      const newBlock = new ScheduleBlockModel(originalBlockData);
      return newBlock.save().done(() => {
        this.loadedBlocks.push(newBlock);
        res();
      }).fail(generalErrorFactory.createHandler('SCHEDULE.BLOCK.CREATE', rej));
    });
    loaderChannel.trigger('page:load');
    return promiseDeleteBlock().then(() => {
      // Re-parse own collection to update deleted block
      this.calendarModel.parseBlocksFromApi(this.loadedBlocks);
      this.undoHandler.addChangeItem({
        title: 'Delete block',
        revertFn: promiseDeleteBlockUndo
      });
    }).finally(() => this.prepareAndRenderCalendar());
  },

  canAccessPowerEdit(blockModel) {
    return blockModel?.get('assocaited_booked_hearings')
  },

  loadPeriods() {
    const updateCurrentPeriodAfterLoadFn = () => {
      if (this.currentPeriod) return;
      const newPeriodToUse = (this.initialPeriodId && this.periodCollection.get(this.initialPeriodId)) ? this.periodCollection.get(this.initialPeriodId)
        : this.todayPeriod ? this.todayPeriod
        : this.periodCollection.length ? this.periodCollection.at(this.periodCollection.length-1)
        : null;

      const defaultWorkingScheduleRoute = routeParse('schedule_manager_working_item');
      if (this.model.get('_scheduleManagerPageData')?.period && Backbone.history.getFragment() === defaultWorkingScheduleRoute) {
        const cachedPeriod = this.model.get('_scheduleManagerPageData')?.period;
        const cachedPeriodModel = this.periodCollection.findWhere({ schedule_period_id: cachedPeriod.get('schedule_period_id') });
        this.updateCurrentPeriodTo(cachedPeriodModel);
      } else if (newPeriodToUse) {
        this.updateCurrentPeriodTo(newPeriodToUse);
      }
    };

    this.isLoaded = false;
    schedulingChannel.request('load:periods')
      .then(periodCollection => {
        this.periodCollection = periodCollection;
        this.todayPeriod = this.periodCollection.getCurrentPeriod();
        updateCurrentPeriodAfterLoadFn();
      }, generalErrorFactory.createHandler('SCHEDULE.PERIODS.LOAD'))
      .then(() => this.loadCurrentPeriodBlocksAndRender());
    
  },

  loadCurrentPeriodBlocksAndRender() {
    if (!this.currentPeriod) return;
    this.isLoaded = false;
    const requestLoadParms = {
      StatusIn: [configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED'), configChannel.request('get', 'SCHED_REQ_STATUS_APPROVED_NOT_IMPLEMENTED')],
      RequestSubmitters: this.arbIds,
      index: 0,
      count: 999999,
    };
    const options = { no_cache: true };
    Promise.all([
      schedulingChannel.request('load:blocks:period', this.currentPeriod.id),
      schedulingChannel.request('load:requests', requestLoadParms, options),
    ]).then(([periodResponse={}]) => {
      this.loadedBlocks = new ScheduleBlock_collection(periodResponse.schedule_blocks);
      this.calendarModel.set('periodModel', this.currentPeriod);
      this.calendarModel.parseBlocksFromApi(this.loadedBlocks);
      this.isLoaded = true;
      this.render();
    }, err => {
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('SCHEDULE.PERIODS.LOAD')(err);
    });
  },

  updateCurrentPeriodTo(period) {
    this.currentPeriod = period;
    // Always clear the undos when changing period
    this.undoHandler.clear();

    if (!this.currentPeriod) return;

    const firstDayOfPeriod = Moment(this.currentPeriod.get('period_start')).format(InputModel.getDateFormat())
    this.cacheWorkingScheduleData(this.currentPeriod);
    
    const firstPeriodstart = this.periodCollection?.at(0)?.get('period_start');
    const finalPeriodEnd = this.periodCollection?.at(-1)?.get('period_end');
    this.weekDateModel.set({
      value: firstDayOfPeriod,
      // Add a correction 6 hours to force the start/end day selection to be correct
      minDate: firstPeriodstart && Moment(firstPeriodstart).isValid() ? Moment(firstPeriodstart).add(6, 'hours') : null,
      maxDate: finalPeriodEnd && Moment(finalPeriodEnd).isValid() ? Moment(finalPeriodEnd).subtract(6, 'hours') : null,
    }, { silent: true });
    this.weekDateModel.trigger('render');
  },


  navigatePeriods(forward=true) {
    loaderChannel.trigger('page:load');
    setTimeout(() => {
      const index = this.periodCollection.indexOf(this.currentPeriod);
      this.updateCurrentPeriodTo(this.periodCollection.at(index + (forward ? 1 : -1)));
      this.loadCurrentPeriodBlocksAndRender();
    }, 25);
  },

  clickAddPeriod() {
    loaderChannel.trigger('page:load');
    const isViewStale = this.currentPeriod !== this.periodCollection.at(-1);
    (isViewStale ? Promise.resolve() : schedulingChannel.request('create:period'))
      .then(() => this.render(), generalErrorFactory.createHandler('SCHEDULE.PERIODS.CREATE'))
      .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  clickNext() {
    this.navigatePeriods();
  },

  clickPrevious() {
    this.navigatePeriods(false);
  },

  editPeriodStatus() {
    const editPeriodModal = new ModalEditPeriod({
      model: this.currentPeriod
    });

    this.listenTo(editPeriodModal, 'removed:modal', this.render, this);
    modalChannel.request('add', editPeriodModal);
  },

  onBeforeRender() {
    // Only render the legend once since it never changes
    if (!this.dayLegendView) this.dayLegendView = new WorkingScheduleDayLegendView();
    else if (this.dayLegendView.isRendered()) this.detachChildView('dayLegendRegion');

    if (!this.calendarView) this.calendarView = new BlockCalendarView({ model: this.calendarModel });
    else if (this.calendarView.isRendered()) this.detachChildView('calendarRegion');

    // Update the today period link
    if (this.todayPeriod && this.todayPeriod !== this.currentPeriod) {
      this.weekDateModel.set('customLink', CUSTOM_LINK_TEXT);
    } else {
      this.weekDateModel.set('customLink', null);
    }

    // Show/Hide Add bulk button on parent page
    if (this.currentPeriod && !this.currentPeriod.hasStarted()) {
      this.model.trigger('enable:bulk');
    } else {
      this.model.trigger('disable:bulk');
    }

    if (this.currentPeriod) this.model.trigger('update:period', this.currentPeriod.id);
  },
  
  onRender() {
    if (!this.isLoaded) return;

    this.showChildView('weekRegion', new Input({ model: this.weekDateModel }));
    this.showChildView('dayLegendRegion', this.dayLegendView);
    this.showChildView('toolsRegion', new WorkingScheduleEditToolsView({
      selectedItemId: this.model.get('_selectedEditToolId'),
      model: this.model,
      undoHandler: this.undoHandler,
      disabled: this.currentPeriod && !this.currentPeriod.areEditsAllowed()
    }));

    if (_.isFunction(this.addCalendarScrollFn) && !$('.page-view').hasClass('floatingHeaderMode')) {
      this.addCalendarScrollFn(
        '.working-sched__inputs-row',
        '.calendar-container .calendar-header-container',
        () => this.calendarModel.trigger('render:dragSelects'),
        CALENDAR_SCROLL_DEBOUNCE_MS
      );
    }

    this.prepareAndRenderCalendar();
  },

  prepareAndRenderCalendar(options={}) {
    const toolId = this.model.get('_selectedEditToolId');
    const isPaintTool = this.isPaintBlockSelectedFn(toolId);
    const toolIsDailyBlock = this.isBlockTypeDailyFn(toolId);
    const calendarModelData = Object.assign({
      disabled: !this.currentPeriod || !this.currentPeriod.areEditsAllowed(),
      disableSelection: !isPaintTool,
      dailySelectionOnly: isPaintTool && toolIsDailyBlock,
    }, isPaintTool ? {
      blockCreationData: {
        blockType: toolId
      },
    } : {});
    this.calendarModel.set(calendarModelData, { silent: true });
    if (!options.noCalendarRender) this.calendarView.render();
    this.showChildView('calendarRegion', this.calendarView);
    
    this.getUI('calendar')
      .removeClass(Object.values(EDIT_TOOL_COLOUR_CLASSES))
      .addClass(EDIT_TOOL_COLOUR_CLASSES[toolId]);
    
    if (this.calendarModel.get('disabled')) this.getUI('calendar').addClass('disabled');
    else this.getUI('calendar').removeClass('disabled');
    
    // Always trigger a scroll on calendar render to ensure floating header is set if page is mid-scroll
    $('.page-view').trigger('scroll.rtb_calendar');
    loaderChannel.trigger('page:load:complete');
  },

  className: `working-sched`,

  ui: {
    calendar: '.working-sched__calendar'
  },

  regions: {
    weekRegion: '.working-sched__week-input',
    dayLegendRegion: '.working-sched__legend',
    toolsRegion: '.working-sched__tools',
    calendarRegion: '@ui.calendar',
  },

  template() {
    const hasPrevPeriod = this.currentPeriod && this.periodCollection.indexOf(this.currentPeriod) !== 0;
    return (
      <>
        <div className="working-sched__inputs-row">
          <div className="schedule-calendar-year-month-dropdown-container">
            <div className={`${!hasPrevPeriod?'not-visible':''} schedule-calendar-previous general-link`} onClick={() => this.clickPrevious()}>
              <span>Prev</span>
              <img src={prevIcon} className="schedule-calendar-prev-image" alt="Move Previous" />
            </div>
            <div className="working-sched__week-input"></div>
            {this.renderJsxNextButton()}
          </div>
          <div className="working-sched__legend-period-container">
            {this.renderJsxPeriodDisplay()}
            <div className="working-sched__legend"></div>
          </div>

          <div className="working-sched__tools"></div>
        </div>
        <div className={`working-sched__calendar`}></div>
      </>
    );
  },

  renderJsxPeriodDisplay() {
    const SHOW_SCHEDULE_PERIOD_EDITS = (configChannel.request('get', 'UAT_TOGGLING') || {})?.SHOW_SCHEDULE_PERIOD_EDITS;
    const showEditPeriod = SHOW_SCHEDULE_PERIOD_EDITS && this.currentPeriod && !this.currentPeriod.hasEnded();
    return <div className="working-sched__period-status">
      <div className="">
        <span>Period Status</span>:&nbsp;<span dangerouslySetInnerHTML={{__html: this.currentPeriod ? this.currentPeriod.getStatusDisplayHtml() : '-' }}></span>
      </div>
      {showEditPeriod ? <div className="">
        <span className="general-link" onClick={() => this.editPeriodStatus()}>Edit</span>
      </div> : null}
    </div>;
  },

  renderJsxNextButton() {
    if (!this.isLoaded) return;
    const hasNextPeriod = this.currentPeriod && this.periodCollection.indexOf(this.currentPeriod) !== this.periodCollection.length - 1;
    const buttonText = hasNextPeriod ? 'Next' : 'Add Period';
    const iconToUse = hasNextPeriod ? nextIcon : periodIcon;
    const onNextClick = () => hasNextPeriod ? this.clickNext() : this.clickAddPeriod();
    return <div className={`${!hasNextPeriod?'schedule-calendar-new-period':''} schedule-calendar-next general-link`} onClick={onNextClick}>
      <img src={iconToUse} className="schedule-calendar-next-image" alt="Move Next" />
      <span>{buttonText}</span>
    </div>;
  },
  
});

_.extend(WorkingScheduleView.prototype, ViewJSXMixin);
export default WorkingScheduleView;