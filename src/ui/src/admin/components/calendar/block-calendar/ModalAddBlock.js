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

const DATE_START_AFTER_END_TIME_ERROR = 'End date must be after start date';
const DATE_START_AFTER_NOW_TIME_ERROR = 'Start date must be after current time';
const WORKING_BLOCK_DAY_ERROR = 'Working blocks cannot exceed one working day';
const BLOCK_COLLISION_ERROR = `This timeframe already contains blocks of time for this user - overlapping blocks of time are not allowed`;

const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const schedulingChannel = Radio.channel('scheduling');
const Formatter = Radio.channel('formatter').request('get');

const ModalAddBlock = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['blockOwner', 'periodModel', 'blockModel', 'desiredBlockType', 'desiredBlockStart', 'desiredBlockEnd', 'hideControls']);
    
    this.isEditMode = !!this.blockModel;
    this.saveDates = this.isEditMode ? Moment(this.blockModel.get('block_start')).isAfter(Moment(), 'minute') : true;

    this.showStepTwo = !!(this.blockModel && this.blockModel.get('block_start') && this.blockModel.get('block_type'));
    this.duration = null;
    this.startDateError = null;
    this.endDateError = null;
    this.stepOneRegions = ['blockOwnerRegion', 'blockTypeRegion', 'blockDescriptionRegion', 'blockStartDateRegion', 'blockStartTimeRegion'];
    this.editModeRegions = ['blockOwnerRegion', 'blockTypeRegion', 'blockDescriptionRegion', ...(this.saveDates ?
        ['blockStartDateRegion', 'blockStartTimeRegion', 'blockEndDateRegion', 'blockEndTimeRegion'] : [])];

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

    this.createSubModels();
    this.setupListeners();

    if (this.blockModel && this.blockModel.get('block_start') && this.blockModel.get('block_end')) {
      this.setDuration();
    }
  },

  createSubModels() {
    const isDailyBlock = this.blockModel?.isTypeDaily();
    const blockStartDate = this.blockModel ? Moment.tz(this.blockModel.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING) : null;
    const blockEndDate = this.blockModel ? Moment.tz(this.blockModel.get('block_end'), this.RTB_OFFICE_TIMEZONE_STRING) : null;
    const maxStartTime = Moment(this.HEARING_MAX_BOOKING_TIME, InputModel.getTimeFormat()).subtract(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');
    const minEndTime = Moment(this.HEARING_MIN_BOOKING_TIME, InputModel.getTimeFormat()).add(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');
    
    if (this.blockModel?.isNew() && this.blockModel?.isTypeWorking()) {
      if (blockStartDate.hour() === 9 && blockStartDate.minutes() === 0) {
        blockStartDate.hours(8);
        blockStartDate.minutes(30);
        this.blockModel.set('block_start', blockStartDate.toISOString(), { silent: true });
      }
      if (blockEndDate.hour() === 18 && blockEndDate.minutes() === 0) {
        blockEndDate.hours(16);
        blockEndDate.minutes(30);
        this.blockModel.set('block_end', blockEndDate.toISOString(), { silent: true });
      }
    }

    const getBlockTypeOptionData = () => ([
      { value: String(this.SCHED_BLOCK_TYPE_HEARING), text: 'Working/Hearing Time', _descriptionEnabled: false, _sameDay: true },
      this.blockOwner.isDutyScheduler() ? { value: String(this.SCHED_BLOCK_TYPE_DUTY), text: 'Duty Time', _descriptionEnabled: false, _sameDay: true } : null,
      { value: String(this.SCHED_BLOCK_TYPE_WRITING), text: 'Writing Time', _descriptionEnabled: false, _sameDay: true },
      { value: String(this.SCHED_BLOCK_TYPE_OTHER_WORKING), text: 'Other Working Time', _descriptionEnabled: true, _sameDay: true },
      isDailyBlock ? null : { value: String(this.SCHED_BLOCK_TYPE_VACATION), text: 'Vacation Time Off', _descriptionEnabled: false, _sameDay: false },
      isDailyBlock ? null : { value: String(this.SCHED_BLOCK_TYPE_OTHER_NON_WORKING), text: 'Other Time Off', _descriptionEnabled: true, _sameDay: false },
    ].filter(opt => opt));

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
      if (this.isTypeWorkingSelected() && this.blockStartTimeModel.get('value') === null) {
        this.blockStartTimeModel.set('value', this.HEARING_DEFAULT_START_TIME, { silent: true });
      }
      refreshFn();
    });
  },

  isTypeWorkingSelected() {
    return [this.SCHED_BLOCK_TYPE_HEARING, this.SCHED_BLOCK_TYPE_DUTY].find(code => code && String(code) === String(this.blockTypeDropdown.getData()));
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

    if (this.saveDates) {
      if (startDate.isBefore(Moment())) {
        isValid = false;
        this.startDateError = DATE_START_AFTER_NOW_TIME_ERROR;
        this.render();
      }

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
      }
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
      block_description: this.blockDescriptionModel.getData() || null,
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

    if (this.isTypeWorkingSelected()) this.blockEndTimeModel.set('value', this.HEARING_DEFAULT_END_TIME, { silent: true });    
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

  onBeforeRender() {
    const selectedBlockTypeOpt = (this.blockTypeDropdown.getSelectedOption() || {});
    const isSameDaySelected = selectedBlockTypeOpt._sameDay;
    const descriptionEnabled = selectedBlockTypeOpt._descriptionEnabled === true;
    const startDateDisabled = !this.saveDates || (!this.isEditMode && this.showStepTwo);
    const startTimeDisabled = !this.saveDates || (!this.isEditMode && this.showStepTwo);
    const endDateDisabled = !this.saveDates || (this.showStepTwo && !this.isEditMode && isSameDaySelected);
    const endTimeDisabled = !this.saveDates;

    this.blockStartDateModel.set('disabled', startDateDisabled);
    this.blockStartTimeModel.set('disabled', startTimeDisabled);
    this.blockEndDateModel.set('disabled', endDateDisabled);
    this.blockEndTimeModel.set('disabled', endTimeDisabled);
    
    this.blockTypeDropdown.set('disabled', !this.isEditMode && this.showStepTwo);
    this.blockDescriptionModel.set({
      disabled: (this.showStepTwo && !this.isEditMode) || !descriptionEnabled,
      required: descriptionEnabled,
    });
  },

  onRender() {
    this.showChildView('blockOwnerRegion', new DropdownView({ model: this.blockOwnerDropdown }));
    this.showChildView('blockTypeRegion', new DropdownView({ model: this.blockTypeDropdown }));
    this.showChildView('blockStartDateRegion', new InputView({ model: this.blockStartDateModel }));
    this.showChildView('blockStartTimeRegion', new InputView({ model: this.blockStartTimeModel }));
    this.showChildView('blockEndDateRegion', new InputView({ model: this.blockEndDateModel }));
    this.showChildView('blockEndTimeRegion', new InputView({ model: this.blockEndTimeModel }));
    this.showChildView('blockDescriptionRegion', new InputView({ model: this.blockDescriptionModel }));
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
  },

  template() {
    const modalTitle = this.isEditMode && !this.blockModel.isNew() ? 'Edit Schedule Block' : 'Add Schedule Block';
    
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">{modalTitle}</h4>
            {!this.hideControls ? <div className="modal-close-icon-lg close-x"></div> : null}
          </div>
          <div className="modal-body clearfix">
            <div>
              <div className="">
                {this.periodModel ? <>
                  {/* <label className="general-modal-label">Target Period:</label>&nbsp;<span className="general-modal-value">{Formatter.toPeriodFullDateDisplay(this.periodModel)}</span> */}
                </> : null}
                {this.blockModel && !this.blockModel.isNew() ? <div className="modalAddScheduleBlock__block-id">
                  <label className="general-modal-label">Block ID:</label>&nbsp;<span className="general-modal-value">{this.blockModel.id}</span>
                </div> : null}
              </div>
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
    const selectedTypeOption = this.blockTypeDropdown.getSelectedOption();
    const showDescription = selectedTypeOption?._descriptionEnabled;
    
    return <>
      <div className="modalAddScheduleBlock__row">
        <div className="modalAddScheduleBlock__owner"></div>
        <div className="modalAddScheduleBlock__type"></div>
        <div className={`modalAddScheduleBlock__description ${showDescription?'':'hidden'}`}></div>
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
      {!this.hideControls && this.isEditMode && !this.blockModel.isNew() ? (
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
