import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import ScheduleBlockCollection from '../../../../components/scheduling/schedule-blocks/ScheduleBlock_collection';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import Input from '../../../../../core/components/input/Input';
import Input_model from '../../../../../core/components/input/Input_model';
import Checkboxes from '../../../../../core/components/checkbox/Checkboxes';
import Checkbox_collection from '../../../../../core/components/checkbox/Checkbox_collection';
import User_collection from '../../../../../core/components/user/User_collection';
import Checkbox from '../../../../../core/components/checkbox/Checkbox';
import Checkbox_model from '../../../../../core/components/checkbox/Checkbox_model';
import { BulkAddBlocksDaySelect } from './BulkAddBlocksDaySelect';
import { BulkAddBlocksStaffSelect } from './BulkAddBlocksStaffSelect';
import { BulkAddBlocksUploads } from './BulkAddBlocksUploads';
import './ModalBulkAddBlocks.scss';

const MINIMUM_BLOCK_DURATION_MINUTES = 30;
const MINIMUM_DURATION_ERROR_TEXT = `The block end time must be at least ${MINIMUM_BLOCK_DURATION_MINUTES} minutes after the start time`;

const modalChannel = Radio.channel('modals');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get')

const ModalBulkAddBlocks = ModalBaseView.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['periodModel']);

    this.USER_SUBGROUP_LVL1 = configChannel.request('get', 'USER_SUBGROUP_LVL1');
    this.USER_SUBGROUP_LVL2 = configChannel.request('get', 'USER_SUBGROUP_LVL2');
    this.USER_SUBGROUP_ARB_LEAD = configChannel.request('get', 'USER_SUBGROUP_ARB_LEAD');
    this.USER_SUBGROUP_ADJUDICATOR = configChannel.request('get', 'USER_SUBGROUP_ADJUDICATOR');
    
    this.USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE');
    this.USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE');
    this.USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR');
    this.USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR');
    
    this.ENGAGEMENT_TYPE_DISPLAY = configChannel.request('get', 'ENGAGEMENT_TYPE_DISPLAY');
    this.SCHED_BLOCK_TYPE_WRITING = configChannel.request('get', 'SCHED_BLOCK_TYPE_WRITING');
    this.SCHED_BLOCK_TYPE_HEARING = configChannel.request('get', 'SCHED_BLOCK_TYPE_HEARING');
    this.SCHED_BLOCK_TYPE_DUTY = configChannel.request('get', 'SCHED_BLOCK_TYPE_DUTY');
    this.SCHED_BLOCK_TYPE_OTHER_WORKING = configChannel.request('get', 'SCHED_BLOCK_TYPE_OTHER_WORKING');

    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    this.HEARING_DEFAULT_START_TIME = configChannel.request('get', 'HEARING_DEFAULT_START_TIME');
    this.HEARING_DEFAULT_END_TIME = configChannel.request('get', 'HEARING_DEFAULT_END_TIME');
    this.HEARING_TIME_OFFSET_MINUTES = 30;


    this.defaultUserRoles = [this.USER_SUBGROUP_LVL1, this.USER_SUBGROUP_LVL2];
    this.defaultEngagementTypes = [this.USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE];

    this.stepOneComplete = false;
    this.stepTwoComplete = false;

    this.isUpload = false;

    this.blocksToCreate = new ScheduleBlockCollection();
    this.users = new User_collection();
    this.createSubModels();
    this.createListeners();
  },

  createSubModels() {
    this.startTimeModel = new Input_model({
      inputType: 'time',
      labelText: 'Daily Block Start',
      minTime: this.HEARING_MIN_BOOKING_TIME,
      maxTime: Moment(this.HEARING_MAX_BOOKING_TIME, Input_model.getTimeFormat()).subtract(this.HEARING_TIME_OFFSET_MINUTES, 'minutes').format(Input_model.getTimeFormat()),
      value: this.HEARING_DEFAULT_START_TIME,
      required: true,
    });

    this.endTimeModel = new Input_model({
      inputType: 'time',
      labelText: 'Daily Block End',
      minTime: Moment(this.HEARING_MIN_BOOKING_TIME, Input_model.getTimeFormat()).add(this.HEARING_TIME_OFFSET_MINUTES, 'minutes').format(Input_model.getTimeFormat()),
      maxTime: this.HEARING_MAX_BOOKING_TIME,
      value: this.HEARING_DEFAULT_END_TIME,
      required: true,
    });

    this.dayRadioModels = [];
    this.parsedDayData = [];
    this.daySelectModel = new Backbone.Model({
      disabled: false,
    });

    this.userRoleCheckboxCollection = new Checkbox_collection([
        this.USER_SUBGROUP_LVL1,
        this.USER_SUBGROUP_LVL2,
        this.USER_SUBGROUP_ARB_LEAD,
        this.USER_SUBGROUP_ADJUDICATOR,
      ].map(code => ({
        checked: this.defaultUserRoles.includes(code),
        html: userChannel.request('get:roletype:display', code),
        value: code
      }))
    );

    this.engagementCheckboxCollection = new Checkbox_collection([
        this.USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE,
        this.USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE,
        this.USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR,
        this.USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR,
      ].map(code => ({
        checked: this.defaultEngagementTypes.includes(code),
        html: this.ENGAGEMENT_TYPE_DISPLAY[code],
        value: code,
      }))
    );

    this.staffSelectModel = new Backbone.Model({
      disabled: false,
    });


    this.dutyCheckboxModel = new Checkbox_model({
      html: 'Generate Duty',
      required: false,
      checked: false,
    });

    this.dutyUserModel = new DropdownModel({
      optionData: [],
      labelText: 'Start Duty Rotation With',
      reqired: false,
      disabled: true,
      defaultBlank: true,
      value: null,
    });

    this.dailyDutyModel = new Input_model({
      inputType: 'positive_integer',
      labelText: 'Duty Per Day',
      errorMessage: 'Enter duty per day',
      required: false,
      disabled: true,
      value: null,
    });

    this.touModel = new Checkbox_model({
      html: 'I have carefully reviewed the above to ensure all settings are correct',
      required: true,
      checked: false,
    });
    
  },

  createListeners() {
    this.listenTo(this.dutyCheckboxModel, 'change:checked', (model, isChecked) => {
      const dataToSet = Object.assign({
        required: isChecked,
        disabled: !isChecked,
      }, !isChecked ? { value: null } : null);
      this.dailyDutyModel.set(dataToSet);
      this.dutyUserModel.set(dataToSet);
      this.render();
    });

    const dailyUpdateFn = (model, value) => {
      const btn = this.getUI('updateDutyBtn');
      if (!btn) return;
      
      if (value && btn.attr('disabled')) btn.removeAttr('disabled');
      else if (!value && !btn.attr('disabled')) btn.attr('disabled', 'disabled');
      this.getUI('updateDutyError').hide();
    };
    this.listenTo(this.dailyDutyModel, 'change:value', dailyUpdateFn);
    this.listenTo(this.dutyUserModel, 'change:value', dailyUpdateFn);

    this.listenTo(this.model, 'close', () => {
      ModalBaseView.prototype.close.call(this);
      Backbone.history.loadUrl(Backbone.history.fragment);
    });

    this.listenTo(this.startTimeModel, 'change:value', () => {
      this.setDuration();
      this.endTimeModel.trigger('render');
      this.getUI('duration').text(this.duration);
    });
    this.listenTo(this.endTimeModel, 'change:value', () => {
      this.setDuration();
      this.getUI('duration').text(this.duration);
    });
  },

  setDuration() {
    const startDate = Moment(this.startTimeModel.getData(), Input_model.getTimeFormat());
    const endDate = Moment(this.endTimeModel.getData(), Input_model.getTimeFormat());
    this.duration = startDate.isValid() && endDate.isValid() ? Formatter.toDurationFromSecs(Moment(endDate).diff(Moment(startDate), 'seconds')) : '-';
  },


  close() {
    let cancelProcess = false;
    this.$el.hide();
    const modalView = modalChannel.request('show:standard', {
      title: 'Cancel Bulk Add Blocks?',
      bodyHtml: 'If you cancel this process, no blocks will be created and all information that you entered will be lost. Are you sure you want to Cancel?',
      cancelButtonText: 'Continue Process',
      primaryButtonText: 'Cancel Process',
      onContinueFn(_modalView) {
        cancelProcess = true;
        _modalView.close();
      },
    });

    this.listenTo(modalView, 'removed:modal', () => {
      this.$el.show();
      if (cancelProcess) ModalBaseView.prototype.close.call(this);
    });
  },

  validateRegionsAndShowErrors(regionNames=[]) {
    let isValid = true;
    regionNames.forEach(regionName => {
      const childView = this.getChildView(regionName);
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      isValid = childView.validateAndShowErrors() && isValid;
    }, this);
    return isValid;
  },

  validateStep1() {
    const step1Regions = ['startTimeRegion', 'endTimeRegion', 'daySelectRegion', 'roleTypeRegion', 'engagementRegion'];
    let isValid = this.validateRegionsAndShowErrors(step1Regions);
    const timeFormat = Input_model.getTimeFormat();
    const startDate = Moment(this.startTimeModel.getData(), timeFormat)
    const endDate = Moment(this.endTimeModel.getData(), timeFormat);
    if (startDate.add(MINIMUM_BLOCK_DURATION_MINUTES, 'minutes').isAfter(endDate, 'minutes')) {
      isValid = false;
      this.getChildView('endTimeRegion').showErrorMessage(MINIMUM_DURATION_ERROR_TEXT);
    }

    return isValid;
  },

  validateStep2() {
    const step2Regions = ['staffSelectRegion'];
    return this.validateRegionsAndShowErrors(step2Regions);
  },

  validateStep3() {
    const step3Regions = ['useDutyRegion', 'dutyUserRegion', 'dailyDutyRegion', 'touRegion'];
    let isValid = this.validateRegionsAndShowErrors(step3Regions);
    if (!this.getUI('updateDutyBtn').attr('disabled')) {
      isValid = false;
      this.getUI('updateDutyError').show();      
    }
    return isValid;
  },

  clickSaveStep1() {
    const isValid = this.validateStep1();
    if (!isValid) return;
    
    loaderChannel.trigger('page:load');
    this.stepOneComplete = true;
    this.startTimeModel.set('disabled', true);
    this.endTimeModel.set('disabled', true);
    this.daySelectModel.set('disabled', true);
    this.userRoleCheckboxCollection.forEach(m => m.set('disabled', true));
    this.engagementCheckboxCollection.forEach(m => m.set('disabled', true));

    const daySelectData = this.getChildView('daySelectRegion').getPageApiDataAttrs();
    this.dayRadioModels = daySelectData.dayRadioModels;
    this.parsedDayData = daySelectData.parsedDayData;

    this.resetUsersFromStep1Selections();
    this.render();
  },

  clickSaveStep2() {
    const isValid = this.validateStep2();
    if (!isValid) return;
    
    loaderChannel.trigger('page:load');
    
    this.stepTwoComplete = true;
    this.staffSelectModel.set('disabled', true);    
    this.touModel.set('checked', false);

    const matchingUserOptions = this.users.filter(user => !user.get('_excluded') && user.isDutyScheduler()).map(user => {
      return { text: user.getDisplayName(), value: String(user.id), };
    });
    this.dutyUserModel.set({
      optionData: matchingUserOptions,
      value: null
    });

    this.render();
  },

  unsetStep1() {
    loaderChannel.trigger('page:load');
    this.stepOneComplete = false;
    this.startTimeModel.set('disabled', false);
    this.endTimeModel.set('disabled', false);
    this.daySelectModel.set('disabled', false);
    this.userRoleCheckboxCollection.forEach(m => m.set('disabled', false));
    this.engagementCheckboxCollection.forEach(m => m.set('disabled', false));

    this.resetUsersFromStep1Selections();

    this.stepTwoComplete = false;
    this.staffSelectModel.set('disabled', false);

    this.stepTwoComplete = false;
    this.staffSelectModel.set('disabled', false);

    this.render();
  },

  unsetStep2() {
    loaderChannel.trigger('page:load');
    this.stepTwoComplete = false;
    this.staffSelectModel.set('disabled', false);
    this.render();
  },

  resetUsersFromStep1Selections() {
    const includedRoleTypes = this.userRoleCheckboxCollection.getData().map(c => c.get('value'));
    const includedEngagementTypes = this.engagementCheckboxCollection.getData().map(c => c.get('value'));
    this.users.reset(userChannel.request('get:arbs').filter(user => (
      includedRoleTypes.includes(user.getRoleSubtypeId()) && includedEngagementTypes.includes(user.getRoleEngagement())
    )).map(m => m.clone()));
  },

  clickDutyUpdate() {
    this.getUI('updateDutyBtn').attr('disabled', 'disabled');
    this.getUI('updateDutyError').hide();

    // Render all in order to get new stats on step3
    this.render();
  },

  clickBulkAddBlocks() {
    if (!this.validateStep3()) return;

    this.setBlocksToCreate();
    if (!this.blocksToCreate.length) return alert("No blocks to be created. Change inputs and try again");
    
    this.isUpload = true;
    this.render();
    // Create blocks routine
  },

  setBlocksToCreate() {
    const dateFormat = Input_model.getDateFormat();
    const timeFormat = Input_model.getTimeFormat();
    const blockStart = this.startTimeModel.getData();
    const blockEnd = this.endTimeModel.getData();
    const selectedUsers = this.users.filter(user => !user.get('_excluded'));
    
    this.parsedDayData.forEach(dayData => {
      if (dayData.isNotIncluded || dayData.isNotSelectable) return;
      const blockDateStr = Moment(dayData.date).format(dateFormat);
      const blockStartDate = Moment(`${blockDateStr}${blockStart}`, `${dateFormat}${timeFormat}`).toISOString();
      const blockEndDate = Moment(`${blockDateStr}${blockEnd}`, `${dateFormat}${timeFormat}`).toISOString();
      
      selectedUsers.forEach(user => {
        this.blocksToCreate.add({
          schedule_period_id: this.periodModel.id,
          block_type: dayData.blockType,
          block_start: blockStartDate,
          block_end: blockEndDate,
          system_user_id: user.id,
        });
      });
    });
  },

  onBeforeRender() {
    this.setDuration();
  },

  onRender() {
    if (this.isUpload) {
      this.renderForUpload();
    } else {
      this.renderUserInputs();
    }

    loaderChannel.trigger('page:load:complete');
  },

  renderUserInputs() {    
    this.showChildView('startTimeRegion', new Input({ model: this.startTimeModel }));
    this.showChildView('endTimeRegion', new Input({ model: this.endTimeModel }));
    this.showChildView('daySelectRegion', new BulkAddBlocksDaySelect({
      model: this.daySelectModel,
      periodModel: this.periodModel,
      dayRadioModels: this.dayRadioModels,
    }));
    this.showChildView('roleTypeRegion', new Checkboxes({ collection: this.userRoleCheckboxCollection }));
    this.showChildView('engagementRegion', new Checkboxes({ collection: this.engagementCheckboxCollection }));

    
    if (this.stepOneComplete) {
      this.showChildView('staffSelectRegion', new BulkAddBlocksStaffSelect({
        model: this.staffSelectModel,
        collection: this.users
      }));
    }

    if (this.stepTwoComplete) {
      this.showChildView('useDutyRegion', new Checkbox({ model: this.dutyCheckboxModel }));
      this.showChildView('dutyUserRegion', new DropdownView({ model: this.dutyUserModel }));
      this.showChildView('dailyDutyRegion', new Input({ model: this.dailyDutyModel }));
      this.showChildView('touRegion', new Checkbox({ model: this.touModel }));
    }
  },

  renderForUpload() {
    const selectedUsers = this.users.filter(user => !user.get('_excluded'))
    const dutyUsers = this.dutyCheckboxModel.getData() ? selectedUsers.filter(m => m.isDutyScheduler()) : []
    this.showChildView('uploadRegion', new BulkAddBlocksUploads({
      model: this.model,
      collection: this.blocksToCreate,
      dutyUsers,
      firstDutyUserId: this.dutyUserModel.getData({ parse: true }),
      dutiesPerDay: Math.min(this.dailyDutyModel.getData(), dutyUsers.length),
    }));
  },

  id: 'bulkAddBlocks-modal',
  regions: {
    startTimeRegion: '.bulkAddBlocks-modal__start',
    endTimeRegion: '.bulkAddBlocks-modal__end',
    daySelectRegion: '.bulkAddBlocks-modal__day-select-region',
    roleTypeRegion: '.bulkAddBlocks-modal__user-role-type',
    engagementRegion: '.bulkAddBlocks-modal__user-engagement',

    staffSelectRegion: '.bulkAddBlocks-modal__staff-list',

    useDutyRegion: '.bulkAddBlocks-modal__duty-checkbox',
    dutyUserRegion: '.bulkAddBlocks-modal__duty-user',
    dailyDutyRegion: '.bulkAddBlocks-modal__duty-daily',

    touRegion: '.bulkAddBlocks-modal__tou',

    uploadRegion: '.bulkAddBlocks-modal__upload-region'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      updateDutyBtn: '.bulkAddBlocks-modal__duty-btn',
      updateDutyError: '.bulkAddBlocks-modal__duty-btn + .error-block',
      duration: '.bulkAddBlocks-modal__duration > span',
      cancel: '.btn-cancel-bulk-add-blocks',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.updateDutyBtn': 'clickDutyUpdate',
    });
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">Bulk Add Blocks</h4>
            {!this.isUpload ? <div className="modal-close-icon-lg close-x"></div> : null}
          </div>
          <div className="modal-body clearfix">

            <div className="">
              <label className="general-modal-label">Schedule Period:</label>&nbsp;<span className="general-modal-value">{Formatter.toPeriodFullDateDisplay(this.periodModel)}</span>
            </div>

            {!this.isUpload ? <>
              {this.renderJsxStep1()}
              {this.renderJsxStep2()}
              {this.renderJsxStep3()}
            </> : null}
            {this.renderJsxUpload()}
          </div>
        </div>
      </div>
    );
  },

  renderJsxStep1() {
    return <>
      <div className="bulkAddBlocks-modal__step-one">
        <div>Select the start and end time of the blocks you want to add to this period.</div>

        <div className="bulkAddBlocks-modal__dates">
          <div className="bulkAddBlocks-modal__start"></div>
          <div className="bulkAddBlocks-modal__end"></div>
          <div className="bulkAddBlocks-modal__duration">
            <label className="review-label">Duration:</label>&nbsp;
            <span>{this.duration}</span>
          </div>
        </div>
      </div>

      <div className="bulkAddBlocks-modal__day-select-container">
        <p>The default working schedule is prepopulated below. Click on a day icon to set the type of block you want added that day.</p>
        <div className="bulkAddBlocks-modal__day-select-region"></div>
      </div>

      <div className="bulkAddBlocks-modal__user-selects">
        <p>Select the staff Arbitrator role(s) that will have the above blocks added.</p>
        <div className="bulkAddBlocks-modal__user-role-type"></div>

        <p>Select the engagement type(s) that will have the above blocks added.</p>
        <div className="bulkAddBlocks-modal__user-engagement"></div>
      </div>

      <div className="modal-button-container">
        <button type="button" className={"btn btn-lg btn-default btn-primary btn-continue"} disabled={this.stepOneComplete}
            onClick={() => this.clickSaveStep1()}>Continue</button>
        {this.stepOneComplete ? <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.unsetStep1()}>Change Selections</button> : null}
      </div>
    </>;
  },

  renderJsxStep2() {
    return <div className={!this.stepOneComplete ? 'hidden' : ''}>
      <div className="bulkAddBlocks-modal__staff-list-container">
        <p>
          <span>Exclude any staff that you don't want hearings generated for</span>&nbsp;
          <span className="bulkAddBlocks-modal__staff-list-container__info">
            <span class="calendar-header-userinfo-emergency">*emergency</span>&nbsp;
            <span class="calendar-header-userinfo-duty">*duty</span>
          </span>
        </p>        

        <div className="bulkAddBlocks-modal__staff-list"></div>
      </div>
      <div className="modal-button-container">
        <button type="button" className={"btn btn-lg btn-default btn-primary btn-continue"} disabled={this.stepTwoComplete}
            onClick={() => this.clickSaveStep2()}>Continue</button>
        {this.stepTwoComplete ? <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.unsetStep2()}>Change Selections</button> : null}
      </div>
    </div>
  },

  renderJsxStep3() {
    const selectedUsers = this.users.filter(user => !user.get('_excluded'));
    const blockTimeDisplay = `${this.startTimeModel.getData()} - ${this.endTimeModel.getData()}`;
    const notIncludedDays = this.parsedDayData.filter(data => data.isNotIncluded).length;
    const numWritingDays = this.parsedDayData.filter(data => data.blockType === this.SCHED_BLOCK_TYPE_WRITING).length;
    const numWorkingDays = this.parsedDayData.filter(data => data.blockType === this.SCHED_BLOCK_TYPE_HEARING).length;
    const numOtherWorkingDays = this.parsedDayData.filter(data => data.blockType === this.SCHED_BLOCK_TYPE_OTHER_WORKING).length;
    const numWritingDayBlocks = selectedUsers.length * numWritingDays;
    const numWorkingDayBlocks = selectedUsers.length * numWorkingDays;
    const numOtherWorkingBlocks = selectedUsers.length * numOtherWorkingDays;
    const maxDutiesPerDay = Math.min(this.dailyDutyModel.getData(), this.dutyUserModel.get('optionData').length);
    const numDutyBlocks = this.dutyCheckboxModel.getData() ? numWorkingDays * maxDutiesPerDay : 0;
    const percentDutyBlocks = numWorkingDayBlocks ? (Number(numDutyBlocks) / numWorkingDayBlocks * 100).toFixed(2) : 0;
    const creationBlocksDisplay = `Blocks from ${blockTimeDisplay}, ${this.duration}, ${numWorkingDays} normal working day${numWorkingDays===1?'':'s'}, `
      + `${numOtherWorkingDays} other working day${numOtherWorkingDays===1?'':'s'}, ${numWritingDays} writing day${numWritingDays===1?'':'s'}, `
      + `${notIncludedDays} not included day${notIncludedDays===1?'':'s'}. `
      + `${numWorkingDayBlocks} normal working block${numWorkingDayBlocks===1?'':'s'} will be created, `
      + `${numOtherWorkingBlocks} other working block${numOtherWorkingBlocks===1?'':'s'} will be created, `
      + `${numWritingDayBlocks} writing block${numWritingDayBlocks===1?'':'s'} will be created, `
      + `${numDutyBlocks} (${percentDutyBlocks}%) duty block${numDutyBlocks===1?'':'s'} will be created.`;
    
    return <div className={!this.stepTwoComplete ? 'hidden' : ''}>
      <div className="bulkAddBlocks-modal__duty-row">
        <div className="bulkAddBlocks-modal__duty-checkbox"></div>
        <div className="bulkAddBlocks-modal__duty-user"></div>
        <div className="bulkAddBlocks-modal__duty-daily"></div>
        <div className="bulkAddBlocks-modal__duty-btn-container">
          <button className="btn btn-standard btn-primary bulkAddBlocks-modal__duty-btn" disabled="disabled">Update</button>
          <p className="error-block hidden-item">Accept changes to continue</p>
        </div>
      </div>
      <div className="bulkAddBlocks-modal__tou-row">
        <div className="bulkAddBlocks-modal__tou-row__title">Bulk add summary based on selections:</div>
        <div className="bulkAddBlocks-modal__">{creationBlocksDisplay}</div>
        <div className="bulkAddBlocks-modal__tou"></div>
      </div>
      <div className="modal-button-container">
        <button type="button" className="btn btn-lg btn-default btn-cancel btn-cancel-bulk-add-blocks">Cancel</button>
        <button type="button" className={"btn btn-lg btn-default btn-primary btn-continue"}
            onClick={() => this.clickBulkAddBlocks()}>Bulk Add Blocks</button>
      </div>
    </div>
  },


  renderJsxUpload() {
    return <div className="bulkAddBlocks-modal__upload-region"></div>;
  },

});

_.extend(ModalBulkAddBlocks.prototype, ViewJSXMixin)

export { ModalBulkAddBlocks }

