/**
 * @fileoverview - Modal for adding new schedule blocks and editing existing schedule blocks.
 */
import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import './ModalAddBlock.scss'
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import ScheduleBlock_model from '../../scheduling/schedule-blocks/ScheduleBlock_model';

const DATE_START_AFTER_END_TIME_ERROR = 'End date must be after start date';
const WORKING_BLOCK_DAY_ERROR = 'Working blocks cannot exceed one working day';
const BLOCK_COLLISION_ERROR = `This timeframe already contains blocks of time for this user - overlapping blocks of time are not allowed`;

const MAX_BLOCK_DAYS = 45;

const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const schedulingChannel = Radio.channel('scheduling');
const Formatter = Radio.channel('formatter').request('get');

const ModalAddBlock = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['blockOwner', 'periodModel', 'blockModel', 'loadedUserBlocks', 'hideControls']);
    
    this.loadedUserBlocks = this.loadedUserBlocks || [];
    this.isEditMode = !!this.blockModel;

    this.showStepTwo = !!(this.blockModel && this.blockModel.get('block_start') && this.blockModel.get('block_type'));
    this.duration = null;
    this.startDateError = null;
    this.endDateError = null;
    this.stepOneRegions = ['blockOwnerRegion', 'blockTypeRegion', 'blockTypeTimeOffRegion','blockDescriptionRegion', 'blockStartDateRegion', 'blockStartTimeRegion'];
    this.editModeRegions = ['blockOwnerRegion', 'blockTypeRegion', 'blockTypeTimeOffRegion', 'blockDescriptionRegion', 'blockStartDateRegion', 'blockStartTimeRegion', 'blockEndDateRegion', 'blockEndTimeRegion'];

    this.SCHED_BLOCK_MIN_DURATION_HOURS = configChannel.request('get', 'SCHED_BLOCK_MIN_DURATION_HOURS') || 0;
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    this.HEARING_DEFAULT_START_TIME = configChannel.request('get', 'HEARING_DEFAULT_START_TIME');
    this.HEARING_DEFAULT_END_TIME = configChannel.request('get', 'HEARING_DEFAULT_END_TIME');
    this.SCHED_BLOCK_TYPE_HEARING = configChannel.request('get', 'SCHED_BLOCK_TYPE_HEARING');
    this.SCHED_BLOCK_TYPE_DUTY = configChannel.request('get', 'SCHED_BLOCK_TYPE_DUTY');
    this.SCHED_BLOCK_TYPE_WRITING = configChannel.request('get', 'SCHED_BLOCK_TYPE_WRITING');
    this.SCHED_BLOCK_TYPE_VACATION = configChannel.request('get', 'SCHED_BLOCK_TYPE_VACATION');
    this.SCHED_BLOCK_TYPE_OTHER_WORKING = configChannel.request('get', 'SCHED_BLOCK_TYPE_OTHER_WORKING');
    this.SCHED_BLOCK_TYPE_OTHER_NON_WORKING = configChannel.request('get', 'SCHED_BLOCK_TYPE_OTHER_NON_WORKING');
    this.SCHEDULE_BLOCK_TIME_OFF_TYPES = configChannel.request('get', 'SCHEDULE_BLOCK_TIME_OFF_TYPES') || {};
    this.SCHEDULE_BLOCK_TIME_OFF_TYPE_OTHER = configChannel.request('get', 'SCHEDULE_BLOCK_TIME_OFF_TYPE_OTHER');

    this.setDefaultBlockTimes();
    this.createSubModels();
    this.setupListeners();

    if (this.blockModel && this.blockModel.get('block_start') && this.blockModel.get('block_end')) {
      this.setDuration();
    }
  },

  createSubModels() {
    const blockStartDate = this.blockModel ? Moment.tz(this.blockModel.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING) : null;
    const blockEndDate = this.blockModel ? Moment.tz(this.blockModel.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING) : null;
    const maxStartTime = Moment(this.HEARING_MAX_BOOKING_TIME, InputModel.getTimeFormat()).subtract(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');
    const minEndTime = Moment(this.HEARING_MIN_BOOKING_TIME, InputModel.getTimeFormat()).add(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');

    const getBlockTypeOptionData = () => {
      return [
        { value: String(this.SCHED_BLOCK_TYPE_HEARING), text: 'Working/Hearing Time', _descriptionEnabled: false, _sameDay: true, _typeDropdownEnabled: false },
        this.blockOwner.isDutyScheduler() ? { value: String(this.SCHED_BLOCK_TYPE_DUTY), text: 'Duty Time', _descriptionEnabled: false, _sameDay: true, _typeDropdownEnabled: false } : null,
        { value: String(this.SCHED_BLOCK_TYPE_WRITING), text: 'Writing Time', _descriptionEnabled: false, _sameDay: true, _typeDropdownEnabled: false },
        { value: String(this.SCHED_BLOCK_TYPE_OTHER_WORKING), text: 'Other Working Time', _descriptionEnabled: true, _sameDay: true, _typeDropdownEnabled: false },
        { value: String(this.SCHED_BLOCK_TYPE_VACATION), text: 'Vacation Time Off', _descriptionEnabled: false, _sameDay: false, _typeDropdownEnabled: false },
        { value: String(this.SCHED_BLOCK_TYPE_OTHER_NON_WORKING), text: 'Other Time Off', _descriptionEnabled: false, _sameDay: false, _typeDropdownEnabled: true },
      ].filter(opt => opt);
    };

    this.blockOwnerDropdown = new DropdownModel({
      labelText: 'Block Associated To',
      optionData: [{ value: this.blockOwner.id, text: this.blockOwner.getDisplayName() }],
      disabled: true,
      required: true,
      value: this.blockOwner.id
    });
  
    this.blockTypeDropdown = new DropdownModel({
      api_mapping: 'block_type',
      labelText: 'Block Type',
      optionData: getBlockTypeOptionData(),
      defaultBlank: true,
      disabled: false,
      required: true,
      value: this.blockModel && this.blockModel.get('block_type') ? String(this.blockModel.get('block_type')) : null,
    });

    const savedDescription = this.blockModel?.get('block_description');
    this.blockTypeTimeOffDropdown = new DropdownModel({
      labelText: 'Time Off Type',
      optionData: Object.entries(this.SCHEDULE_BLOCK_TIME_OFF_TYPES).map(([value, text]) => ({ value, text })),
      defaultBlank: true,
      disabled: false,
      required: false,
      value: savedDescription ? Object.entries(this.SCHEDULE_BLOCK_TIME_OFF_TYPES).filter(([key, value]) => value === savedDescription)?.[0]?.[0] || this.SCHEDULE_BLOCK_TIME_OFF_TYPE_OTHER : null
    });

    this.blockDescriptionModel = new InputModel({
      api_mapping: 'block_description',
      labelText: 'Other Short Description',
      errorMessage: 'Description is required',
      disabled: true,
      required: false,
      maxLength: configChannel.request('get', 'SCHED_BLOCK_DESCRIPTION_MAX_LENGTH'),
      value: this.blockModel && this.blockModel.get('block_description') ? String(this.blockModel.get('block_description')) : null,
    });

    this.blockStartDateModel = new InputModel({
      labelText: 'Block Start',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
      minDate: null,
      maxDate: null,
      value: blockStartDate ? blockStartDate.format(InputModel.getDateFormat()) : null,
    });

    this.blockStartTimeModel = new InputModel({
      labelText: ' ',
      errorMessage: 'Enter start time',
      inputType: 'time',
      required: true,
      minTime: this.HEARING_MIN_BOOKING_TIME,
      maxTime: maxStartTime,
      value: blockStartDate ? blockStartDate.format(InputModel.getTimeFormat()) : null,
    });

    this.blockEndDateModel = new InputModel({
      labelText: 'Block End',
      inputType: 'date',
      allowFutureDate: true,
      minDate: null,
      maxDate: null,
      required: true,
      value: blockEndDate ? blockEndDate.format(InputModel.getDateFormat()) : null,
    });

    this.blockEndTimeModel = new InputModel({
      labelText: ' ',
      errorMessage: 'Enter end time',
      inputType: 'time',
      minTime: minEndTime,
      maxTime: this.HEARING_MAX_BOOKING_TIME,
      required: true,
      value: blockEndDate ? blockEndDate.format(InputModel.getTimeFormat()) : null,
    });
  },

  setDefaultBlockTimes() {
    // Setting block time defaults is only done when creating a new block
    if (!this.blockModel?.isNew()) return;

    let blockStartDate = this.blockModel ? Moment.tz(this.blockModel.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING) : null;
    let blockEndDate = this.blockModel ? Moment.tz(this.blockModel.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING) : null;
    
    
    this.loadedUserBlocks?.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(a.get('block_start')) - new Date(b.get('block_start'));
    });
    const userBlocksToday = this.loadedUserBlocks.filter(b => (
      b.get('system_user_id') === this.blockOwner.id &&
      Moment.tz(b.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING).isSame(blockStartDate, 'day')
    ));

    // Set start/end time defaults for working blocks
    if (this.blockModel?.canAutoSetDefaultTimes(blockStartDate, blockEndDate)) {
      if (blockStartDate.hour() === 9 && blockStartDate.minutes() === 0) {
        blockStartDate.hours(8);
        blockStartDate.minutes(30);
      }
      if (blockEndDate.hour() === 18 && blockEndDate.minutes() === 0) {
        blockEndDate.hours(16);
        blockEndDate.minutes(30);
      }
    }

    // Perform general block collision correction on the start/end times if any existing blocks
    const maxLoops = 10;
    let loopCount = 0;
    let startCollidingBlocks = [];
    do {
      startCollidingBlocks = userBlocksToday.filter(b => {
        return Moment(b.get('block_start')).isSameOrBefore(blockStartDate, 'minute') && Moment(b.get('block_end')).isAfter(blockStartDate, 'minutes')
      });
      if (startCollidingBlocks.length) {
        blockStartDate = Moment(startCollidingBlocks[0].get('block_end'));
      }
      loopCount++;
    } while (loopCount < maxLoops && startCollidingBlocks?.length);

    loopCount = 0;
    let endCollidingBlocks = [];
    do {
      endCollidingBlocks = userBlocksToday.filter(b => {
        return Moment(b.get('block_start')).isBefore(blockEndDate, 'minute') && Moment(b.get('block_end')).isAfter(blockEndDate, 'minutes')
      });
      if (endCollidingBlocks.length) {
        blockEndDate = Moment(endCollidingBlocks[0].get('block_start'));
      }
      loopCount++;
    } while (loopCount < maxLoops && endCollidingBlocks?.length);
    
    this.blockModel.set({
      block_start: blockStartDate.toISOString(),
      block_end: blockEndDate.toISOString()
    }, { silent: true });
  },

  setupListeners() {
    const refreshFn = () => {
      this.setDuration();
      this.startDateError = false;
      this.endDateError = false;
      setTimeout(() => this.render(), 25);
    }

    this.listenTo(this.blockStartDateModel, 'change:value', () => {
      refreshFn();
    });
    this.listenTo(this.blockStartTimeModel, 'change:value', () => {
      refreshFn();
    });
    this.listenTo(this.blockEndDateModel, 'change:value', () => {
      refreshFn();
    });
    this.listenTo(this.blockEndTimeModel, 'change:value', () => {
      refreshFn();
    });

    this.listenTo(this.blockTypeDropdown, 'change:value', () => {
      if (this.canAutoSetDefaultTimes() && !this.blockStartTimeModel.get('value')) {
        this.blockStartTimeModel.set('value', this.HEARING_DEFAULT_START_TIME, { silent: true });
      }
      refreshFn();
    });

    this.listenTo(this.blockTypeTimeOffDropdown, 'change:value', (model, value) => {
      const newDescription = value !== this.SCHEDULE_BLOCK_TIME_OFF_TYPE_OTHER ? model.getSelectedOption()?.text : '';
      this.blockDescriptionModel.set('value', newDescription, { silent: true });
      this.render();
    });
  },

  canAutoSetDefaultTimes() {
    const tempModel = new ScheduleBlock_model({
      block_type: Number(this.blockTypeDropdown.getData()),
    });
    return tempModel.canAutoSetDefaultTimes(this.blockStartTimeModel.getData(), this.blockEndDateModel.getData());
  },

  setDuration() {
    const startDate = Moment(`${this.blockStartDateModel.getData({ format: 'date' })}T${this.blockStartTimeModel.getData({ iso: true })}`).toISOString();
    const endDate = Moment(`${this.blockEndDateModel.getData({ format: 'date' })}T${this.blockEndTimeModel.getData({ iso: true })}`).toISOString();
    const duration = startDate && endDate ? Formatter.toDurationFromSecs(Moment(endDate).diff(Moment(startDate), 'seconds')) : '-';
    this.duration = duration;
  },

  validateAndShowErrors() {
    let isValid = true;
    const regionsToValidate = this.isEditMode ? this.editModeRegions :
      this.showStepTwo ? Object.keys(this.regions) :
      this.stepOneRegions;
    const startDate = Moment(`${this.blockStartDateModel.getData({ format: 'date' })}T${this.blockStartTimeModel.getData({ iso: true })}`);
    const endDate = Moment(`${this.blockEndDateModel.getData({ format: 'date' })}T${this.blockEndTimeModel.getData({ iso: true })}`);
    this.startDateError = false;
    this.endDateError = false;

    const isSameDaySelected = (this.blockTypeDropdown.getSelectedOption() || {})?._sameDay;
    if (this.showStepTwo && !startDate.isBefore(endDate)) {
      isValid = false;
      this.endDateError = DATE_START_AFTER_END_TIME_ERROR;
      this.render();
    } else if (this.showStepTwo && isSameDaySelected && startDate.day() !== endDate.day()) {
      isValid = false;
      this.endDateError = WORKING_BLOCK_DAY_ERROR;
      this.render();
    } else if (this.showStepTwo && endDate.diff(startDate, 'minutes') < (this.SCHED_BLOCK_MIN_DURATION_HOURS*60) ) {
      isValid = false;
      this.endDateError = `Schedule blocks must be at least ${this.SCHED_BLOCK_MIN_DURATION_HOURS} hour${this.SCHED_BLOCK_MIN_DURATION_HOURS===1?'':'s'} in duration`;
      this.render();
    } else if (Moment(endDate).add(1, 'day').diff(Moment(startDate), 'days') >= MAX_BLOCK_DAYS) {
      isValid = false;
      this.endDateError = `The maximum block generation duration is ${MAX_BLOCK_DAYS} days`;
      this.render();
    }
    
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    return isValid;
  },

  clickSave() {
    if (!this.validateAndShowErrors()) return;
    const startDate = Moment(`${this.blockStartDateModel.getData({ format: 'date' })}T${this.blockStartTimeModel.getData({ iso: true })}`);
    const endDate = Moment(`${this.blockEndDateModel.getData({ format: 'date' })}T${this.blockEndTimeModel.getData({ iso: true })}`);
    let blocksToCreate = [];

    // Dates will be set automatically
    const attrsToSet = Object.assign({
      block_type: this.blockTypeDropdown.getData({ parse: true }),
      block_description: this.isTypeTimeOffDropdownEnabled() || this.isDescriptionEnabled() ? this.blockDescriptionModel.getData() || null : null,
      system_user_id: this.blockOwner.id,
    });

    loaderChannel.trigger('page:load');
    schedulingChannel.request('load:block:collisions:range', startDate, endDate, this.blockOwner.id, this.blockModel)
      .then((conflictingBlocks=[]) => {
        if (conflictingBlocks?.length) {
          this.endDateError = BLOCK_COLLISION_ERROR;
          this.render();
          loaderChannel.trigger('page:load:complete');
          return;
        }

        let periodError = false;
        schedulingChannel.request('create:periods:until', endDate)
          .catch(err => {
            periodError = true;
            throw err;
          })
          .then(() => {
            return schedulingChannel.request('create:blocks:range', startDate, endDate, attrsToSet, this.blockModel)
              .then((_blocksToCreate=[]) => {
                blocksToCreate = _blocksToCreate;
                return Promise.resolve();
              }, (err) => {
                if (err?.blocksToCreate) blocksToCreate = err.blocksToCreate;
                return Promise.reject(err?.error || err);
              });
          })
          .then(() => {
            this.model.trigger('addBlock:complete', true);
            this.close();
          })
          .catch(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler(periodError ? 'SCHEDULE.PERIODS.CREATE' : 'SCHEDULE.BLOCK.CREATE', () => {
              this.model.trigger('addBlock:complete', false);
              this.close();
            });
            handler(err);
          }).finally(() => {
            this.model.trigger('addBlock:blocksCreated', blocksToCreate);
          })
      });
  },

  clickDelete() {
    this.$el.hide();
    let isDeleting = false;
    const modalView = modalChannel.request('show:standard', {
      title: 'Delete Working Block?',
      bodyHtml: `<p>Are you sure you want to delete this working block?</p>`,
      primaryButtonText: 'Delete',
      onContinue: (modalView) => {
        isDeleting = true;
        loaderChannel.trigger('page:load');
        modalView.close();
        this.blockModel.destroy().done(() => {
          this.model.trigger('addBlock:complete', true);
          this.close();
        }).fail(generalErrorFactory.createHandler('SCHEDULE.BLOCK.DELETE'));
      }
    });

    this.listenTo(modalView, 'removed:modal', () => {
      if (!isDeleting) this.$el.show();
    });
  },

  clickStepOneAccept() {
    if (this.showStepTwo) return;
    if (!this.validateAndShowErrors()) return;

    if (this.canAutoSetDefaultTimes()) this.blockEndTimeModel.set('value', this.HEARING_DEFAULT_END_TIME, { silent: true });    
    const isSameDaySelected = (this.blockTypeDropdown.getSelectedOption() || {})?._sameDay;
    if (!this.isEditMode && isSameDaySelected && !this.blockEndDateModel.getData()) {
      this.blockEndDateModel.set({ value: Moment(this.blockStartDateModel.getData({ format: 'date' })).format(InputModel.getDateFormat()) }, { silent: true });
    }

    this.showStepTwo = true;
    this.render();
  },

  clickStepOneModify() {
    this.showStepTwo = false;
    this.blockEndDateModel.set('value', null, { silent: true });
    this.blockEndTimeModel.set('value', null, { silent: true });
    this.render();
  },

  clickCancel() {
    this.model.trigger('addBlock:cancel');
    this.model.trigger('addBlock:complete', false);
    this.close();
  },

  isTypeTimeOffDropdownEnabled() {
    return this.blockTypeDropdown.getSelectedOption()?._typeDropdownEnabled;
  },

  isDescriptionEnabled() {
    return this.blockTypeDropdown.getSelectedOption()?._descriptionEnabled ||
      (this.isTypeTimeOffDropdownEnabled() && this.blockTypeTimeOffDropdown.getData() === this.SCHEDULE_BLOCK_TIME_OFF_TYPE_OTHER);
  },

  onBeforeRender() {
    const selectedBlockTypeOpt = (this.blockTypeDropdown.getSelectedOption() || {});
    const isSameDaySelected = selectedBlockTypeOpt._sameDay;
    const descriptionEnabled = this.isDescriptionEnabled();
    const isTypeTimeOffDropdownEnabled = this.isTypeTimeOffDropdownEnabled();
    const startDateDisabled = !this.isEditMode && this.showStepTwo;
    const startTimeDisabled = !this.isEditMode && this.showStepTwo;
    const endDateDisabled = this.showStepTwo && !this.isEditMode && isSameDaySelected;
    const endTimeDisabled = false;
    const blockTypeDisabled = (!this.isEditMode && this.showStepTwo);

    this.blockStartDateModel.set('disabled', startDateDisabled);
    this.blockStartTimeModel.set('disabled', startTimeDisabled);
    this.blockEndDateModel.set('disabled', endDateDisabled);
    this.blockEndTimeModel.set('disabled', endTimeDisabled);
    
    this.blockTypeDropdown.set('disabled', blockTypeDisabled);
    this.blockDescriptionModel.set({
      disabled: (this.showStepTwo && !this.isEditMode) || !descriptionEnabled,
      required: descriptionEnabled,
    });
    this.blockTypeTimeOffDropdown.set({
      disabled: (this.showStepTwo && !this.isEditMode) || !isTypeTimeOffDropdownEnabled,
      required: isTypeTimeOffDropdownEnabled,
    });
  },

  onRender() {
    this.showChildView('blockOwnerRegion', new DropdownView({ model: this.blockOwnerDropdown }));
    this.showChildView('blockTypeRegion', new DropdownView({ model: this.blockTypeDropdown }));
    this.showChildView('blockStartDateRegion', new InputView({ model: this.blockStartDateModel }));
    this.showChildView('blockStartTimeRegion', new InputView({ model: this.blockStartTimeModel }));
    this.showChildView('blockEndDateRegion', new InputView({ model: this.blockEndDateModel }));
    this.showChildView('blockEndTimeRegion', new InputView({ model: this.blockEndTimeModel }));

    if (this.isTypeTimeOffDropdownEnabled()) this.showChildView('blockTypeTimeOffRegion', new DropdownView({ model: this.blockTypeTimeOffDropdown }));
    if (this.isDescriptionEnabled()) this.showChildView('blockDescriptionRegion', new InputView({ model: this.blockDescriptionModel }));
  },

  id: 'modalAddScheduleBlock',

  regions: {
    blockOwnerRegion: '.modalAddScheduleBlock__owner',
    blockTypeRegion: '.modalAddScheduleBlock__type',
    blockStartDateRegion: '.modalAddScheduleBlock__start-date',
    blockStartTimeRegion: '.modalAddScheduleBlock__start-time',
    blockEndDateRegion: '.modalAddScheduleBlock__end-date',
    blockEndTimeRegion: '.modalAddScheduleBlock__end-time',
    blockDescriptionRegion: '.modalAddScheduleBlock__description',
    blockTypeTimeOffRegion: '.modalAddScheduleBlock__type-time-off',
  },

  template() {
    const modalTitle = this.isEditMode && !this.blockModel.isNew() ? 'Edit Schedule Block' : 'Add Schedule Block';
    const isLargeModal = this.isDescriptionEnabled() || this.isTypeTimeOffDropdownEnabled();
    return (
      <div className={`modal-dialog ${isLargeModal ? 'modal-dialog--lrg' : ''}`}>
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">{modalTitle}</h4>
            {!this.hideControls ? <div className="modal-close-icon-lg close-x"></div> : null}
          </div>
          <div className="modal-body clearfix">
            <div className="">
              {this.blockModel && !this.blockModel.isNew() ? <div className="modalAddScheduleBlock__block-info">
                <div>
                  <label className="general-modal-label">Block ID:</label>&nbsp;<span className="general-modal-value">{this.blockModel.id}</span>
                </div>
                <div>
                  <label className="general-modal-label">Created:</label>&nbsp;<span className="general-modal-value">{Formatter.toDateAndTimeDisplay(this.blockModel.get('created_date'))} - {Formatter.toUserDisplay(this.blockModel.get('created_by'))}</span>
                </div>
                <div>
                  <label className="general-modal-label">Modified:</label>&nbsp;<span className="general-modal-value">{Formatter.toDateAndTimeDisplay(this.blockModel.get('modified_date'))} - {Formatter.toUserDisplay(this.blockModel.get('modified_by'))}</span>
                </div>
              </div> : null}
            </div>
            {this.renderJsxStepOneControls()}
            {this.renderJsxStepTwoControls()}
          </div>
        </div>
      </div>
    );
  },

  renderJsxStepOneControls() {
    const renderStepOneButtons = () => {
      if (this.isEditMode) return;
      return <>
        <div className={`btn btn-lg btn-default modalAddScheduleBlock__step-one-accept ${this.showStepTwo ? 'disabled' : ''}`}
          disabled={this.showStepTwo}
          onClick={() => this.clickStepOneAccept()}>Continue</div>
        <div className={`btn btn-lg btn-default modalAddScheduleBlock__step-one-modify ${this.showStepTwo ? '' : 'hidden'}`}
          onClick={() => this.clickStepOneModify()}>Modify</div>
      </>;
    };
    const renderDateError = () => {
      if (!this.startDateError) return;
      return <div className="modalAddScheduleBlock__row">
        <p className="error-block">{this.startDateError}</p>
      </div>
    };
    return <>
      <div className="modalAddScheduleBlock__row">
        <div className="modalAddScheduleBlock__owner"></div>
        <div className="modalAddScheduleBlock__type"></div>
        <div className="modalAddScheduleBlock__description-container">
          {this.isTypeTimeOffDropdownEnabled() ? <div className="modalAddScheduleBlock__type-time-off"></div> : null}
          {this.isDescriptionEnabled() ? <div className="modalAddScheduleBlock__description"></div> : null}
        </div>
      </div>
      <div className="modalAddScheduleBlock__row">
        <div className="modalAddScheduleBlock__start-date"></div>
        <div className="modalAddScheduleBlock__start-time"></div>

        {renderStepOneButtons()}
      </div>
      {renderDateError()}
      
    </>;
  },

  renderJsxStepTwoControls() {
    const renderDateError = () => {
      if (!this.endDateError) return;
      return <div className="modalAddScheduleBlock__row">
        <p className="error-block">{this.endDateError}</p>
      </div>
    };
    const renderCancelAndDeleteButtons = () => <>
      <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button" onClick={() => this.clickCancel()}>Cancel</button>
      {!this.hideControls && this.isEditMode && !this.blockModel.isNew() && !this.blockModel.get('associated_hearings') ? (
        <button type="button" className="btn btn-lg btn-default btn-continue" onClick={() => this.clickDelete()}>Delete Block</button>
      ) : null}
    </>;
    const renderModalButtons = () => {
      const saveButtonText = this.isEditMode && !this.blockModel.isNew() ? `Save` : `Add Block(s)`;
      return <div className="modal-button-container">
        {renderCancelAndDeleteButtons()}
        <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.clickSave()}>{saveButtonText}</button>
      </div>;
    };

    return <div className={!this.showStepTwo ? 'hidden' : ''}>
      <div className="modalAddScheduleBlock__row">
        <div className="modalAddScheduleBlock__end-date"></div>
        <div className="modalAddScheduleBlock__end-time"></div>
        {/* <div className="modalAddScheduleBlock__duration">
          <label className="review-label">Duration:</label>&nbsp;
          <span>{this.duration}</span>
        </div> */}
      </div>
      {renderDateError()}
      {renderModalButtons()}
    </div>;
  },

});

_.extend(ModalAddBlock.prototype, ViewJSXMixin);

export default ModalAddBlock;
