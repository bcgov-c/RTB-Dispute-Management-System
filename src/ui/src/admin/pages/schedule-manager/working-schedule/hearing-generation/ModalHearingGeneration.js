import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import AddIcon from '../../../../static/AddIcon_NoticeService.png';
import HearingCollection from '../../../../../core/components/hearing/Hearing_collection';
import HearingModel from '../../../../../core/components/hearing/Hearing_model';
import Checkboxes from '../../../../../core/components/checkbox/Checkboxes';
import CheckboxModel from '../../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../../core/components/checkbox/Checkbox';
import Checkbox_collection from '../../../../../core/components/checkbox/Checkbox_collection';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import HearingGenerationHearings from './HearingGenerationHearings';
import UserCollection from '../../../../../core/components/user/User_collection';
import ModalImportHearings from '../../../scheduled-hearings/modals/ModalImportHearings';
import HearingImportModel from '../../../../components/hearing/hearing-import/HearingImport_model';
import { HearingGenerationUploads } from './HearingGenerationUploads';
import { StaffSelect } from '../../../../components/staff-select/StaffSelect';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import './ModalHearingGeneration.scss';
import ScheduleBlockCollection from '../../../../components/scheduling/schedule-blocks/ScheduleBlock_collection';
import Backbone from 'backbone';

const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const animationChannel = Radio.channel('animations');
const modalChannel = Radio.channel('modals');
const schedulingChannel = Radio.channel('scheduling');
const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');

const MAX_HEARINGS_DAYS = 45;

const EMERGENCY_PER_DAY_SELECTOR = '.hearing-generation__daily-emergency .error-block';

const NO_MATCHING_BLOCKS_ERROR = 'no_hearings';
const API_ERROR = 'api_error';

const ERROR_TYPE_OVERLAPPING_HEARING = 1;
const ERROR_TYPE_EMERGENCY_HEARING = 2;

const ModalHearingGeneration = ModalBaseView.extend({
  id: 'hearingGenBlocks-modal',
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);

    this.HEARING_DEFAULT_REGION = configChannel.request('get', 'HEARING_DEFAULT_REGION');

    this.USER_SUBGROUP_LVL1 = configChannel.request('get', 'USER_SUBGROUP_LVL1');
    this.USER_SUBGROUP_LVL2 = configChannel.request('get', 'USER_SUBGROUP_LVL2');
    this.USER_SUBGROUP_ARB_LEAD = configChannel.request('get', 'USER_SUBGROUP_ARB_LEAD');
    this.USER_SUBGROUP_ADJUDICATOR = configChannel.request('get', 'USER_SUBGROUP_ADJUDICATOR');
    
    this.USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE');
    this.USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE');
    this.USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR');
    this.USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR = configChannel.request('get', 'USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR');
    
    this.ENGAGEMENT_TYPE_DISPLAY = configChannel.request('get', 'ENGAGEMENT_TYPE_DISPLAY');
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');

    this.dailyHearingTimes = new HearingCollection();
    this.hearingsToCreate = new HearingCollection();
    this.defaultUserRoles = [this.USER_SUBGROUP_LVL1, this.USER_SUBGROUP_LVL2];
    this.defaultEngagementTypes = [this.USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE];
    this.stepOneComplete = false;
    this.isUpload = false;
    this.users = new UserCollection();
    this.hearingDuration = null;
    this.hearingErrors = [];

    this.createSubModels();
    this.setupListeners();
    this.populateDefaultHearings();
  },

  createSubModels() {
    this.startDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Start Date',
      allowFutureDate: true,
      minDate: Moment().add(1, 'day'),
      required: true,
      disabled: false,
      value: null,
    });

    this.endDateModel = new InputModel({
      inputType: 'date',
      labelText: 'End Date',
      allowFutureDate: true,
      minDate: Moment().add(1, 'day'),
      required: true,
      disabled: false,
      value: null,
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

    this.emergencyCheckboxModel = new CheckboxModel({
      html: 'Generate Emergency',
      required: false,
      checked: false,
    });

    this.emergencyUserModel = new DropdownModel({
      optionData: [],
      labelText: 'Start Emergency Rotation With',
      reqired: false,
      disabled: true,
      defaultBlank: true,
      value: null,
    });

    this.dailyEmergencyModel = new InputModel({
      inputType: 'positive_integer',
      labelText: 'Emergency Per Day',
      errorMessage: 'Enter emergency per day',
      required: false,
      disabled: true,
      value: null,
    });

    this.emergencyStartingTimeModel = new DropdownModel({
      optionData: [],
      labelText: 'Emergency Hearing Slot',
      reqired: false,
      disabled: true,
      defaultBlank: true,
      value: null,
    });

    this.dutyCheckboxModel = new CheckboxModel({
      html: 'Generate Duty',
      required: false,
      checked: true,
      disabled: !configChannel.request('get', 'UAT_TOGGLING')?.HEARING_GEN_USER_DUTY_SELECTION
    });

    this.touModel = new CheckboxModel({
      html: 'I have carefully reviewed the above to ensure all settings are correct',
      required: true,
      checked: false,
    });
  },

  setupListeners() {
    this.listenTo(this.startDateModel, 'change:value', (model, value) => {
      this.setDuration();
      this.getUI('duration').text(this.hearingDuration);

      this.endDateModel.set({ minDate: Moment(value) });
      this.endDateModel.trigger('render');
    });

    this.listenTo(this.endDateModel, 'change:value', (model, value) => {
      this.setDuration();
      this.getUI('duration').text(this.hearingDuration);
      this.startDateModel.set({ maxDate: Moment(value) });
      this.startDateModel.trigger('render');
    });

    this.listenTo(this.dailyHearingTimes, 'change:start_time', () => this.getUI('hearingOverlapError').addClass('hidden'));
    this.listenTo(this.dailyHearingTimes, 'change:end_time', () => this.getUI('hearingOverlapError').addClass('hidden'));

    this.listenTo(this.emergencyCheckboxModel, 'change:checked', (model, isChecked) => {
      const dataToSet = Object.assign({
        required: isChecked,
        disabled: !isChecked,
      }, !isChecked ? { value: null } : null);
      this.dailyEmergencyModel.set(dataToSet);
      this.emergencyUserModel.set(dataToSet);
      this.emergencyStartingTimeModel.set({
        optionData: this.getEmergencyStartTimeOptions(),
        required: isChecked,
        disabled: !isChecked,
        value: !isChecked ? null : this.emergencyStartingTimeModel.getData()
      });
      this.render();
    });

    const dailyUpdateFn = (model, value) => {
      const btn = this.getUI('updateEmergencyBtn');
      if (!btn) return;
      
      if (value && btn.attr('disabled')) btn.removeAttr('disabled');
      else if (!value && !btn.attr('disabled')) btn.attr('disabled', 'disabled');
      this.getUI('updateEmergencyError').hide();
    };

    this.listenTo(this.dailyEmergencyModel, 'change:value', dailyUpdateFn);
    this.listenTo(this.emergencyUserModel, 'change:value', dailyUpdateFn);
    this.listenTo(this.emergencyStartingTimeModel, 'change:value', dailyUpdateFn);

    this.listenTo(this.hearingsToCreate, 'import:hearings', (importHearingsCsvFile) => {
      this.close();
      this.openImportHearingsModal(importHearingsCsvFile);
    });

    this.listenTo(this.hearingsToCreate, 'change:selection', () => {
      this.hearingsToCreate.reset();
      this.isUpload = false;
      this.hearingErrors = [];
      this.render();
    });

    this.listenTo(this.dailyHearingTimes, 're:render', () => this.render());
  },

  closeImportModal() {
    let cancelProcess = false;
    this.$el.hide();

    const modalView = modalChannel.request('show:standard', {
      title: 'Cancel Hearing Generation?',
      bodyHtml: 'If you cancel this process, no hearings will be imported and all information that you entered will be lost. Are you sure you want to Cancel?',
      cancelButtonText: 'Continue Process',
      primaryButtonText: 'Cancel Process',
      hideHeaderX: true,
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

  openImportHearingsModal(importHearingsCsvFile) {
    const hearingImportModel = new HearingImportModel();
    const importStartDate = this.startDateModel.getData();
    const importEndDate = this.endDateModel.getData();
    const importHearingsModal = new ModalImportHearings({ hearingImportModel, importHearingsFile: importHearingsCsvFile, startDate: importStartDate, endDate: importEndDate });
    importHearingsModal.once('removed:modal', () => Backbone.history.loadUrl(Backbone.history.fragment));
    modalChannel.request('add', importHearingsModal);
  },

  populateDefaultHearings() {
    const defaultHearing1 = new HearingModel({
      start_time: '09:30AM',
      end_time: '10:30AM',
      hearing_priority: configChannel.request('get', 'HEARING_PRIORITY_STANDARD'),
    });
    const defaultHearing2 = new HearingModel({
      start_time: '11:00AM',
      end_time: '12:00PM',
      hearing_priority: configChannel.request('get', 'HEARING_PRIORITY_STANDARD')
    });
    const defaultHearing3 = new HearingModel({
      start_time: '1:30PM',
      end_time: '2:30PM',
      hearing_priority: configChannel.request('get', 'HEARING_PRIORITY_DEFERRED')
    });
    const defaultHearing = [defaultHearing1, defaultHearing2, defaultHearing3];
    defaultHearing.forEach(hearing => this.dailyHearingTimes.add(hearing));
  },

  addHearing() {
    const newHearing = new HearingModel({

    });
    this.dailyHearingTimes.add(newHearing);
    this.render();
  },

  getEmergencyStartTimeOptions() {
    return this.dailyHearingTimes.map((hearing, index) => {
      const startTime = Moment(hearing.get('start_time'), "hh:mm").format('hh:mm a');
      const endTime = Moment(hearing.get('end_time'), "hh:mm").format('hh:mm a');
      return { value: String(index), text: `${startTime}-${endTime}`, startTime: hearing.get('start_time'), endTime: hearing.get('end_time')};
    });
  },

  submitStepOne() {
    this.dailyHearingTimes.trigger('validate');
    const startDate = Moment(this.startDateModel.getData());
    const endDate = Moment(this.endDateModel.getData());
    const hearingDurationDifference = Moment(endDate).diff(Moment(startDate), 'days');

    if (hearingDurationDifference >= MAX_HEARINGS_DAYS) {
      this.getUI('maxDateError').removeClass('hidden');
      return;
    } else {
      this.getUI('maxDateError').addClass('hidden');
    }

    const visibleErrorEles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
    
    if(!this.validateStepOne() || visibleErrorEles.length) {
      this.scrollToFirstVisibleError();
      return;
    }

    this.stepOneDisableInputs();
    this.stepOneComplete = true;

    this.emergencyCheckboxModel.set({ checked: false });
    this.emergencyStartingTimeModel.set({ value: null });
    const includedRoleTypes = this.userRoleCheckboxCollection.getData().map(c => c.get('value'));
    const includedEngagementTypes = this.engagementCheckboxCollection.getData().map(c => c.get('value'));
    this.users.reset(userChannel.request('get:arbs').filter(user => (
      includedRoleTypes.includes(user.getRoleSubtypeId()) && includedEngagementTypes.includes(user.getRoleEngagement())
    )).map(m => m.clone()));
    
    this.render();
  },

  scrollToFirstVisibleError() {
    const visibleErrorEles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (visibleErrorEles.length) {
      animationChannel.request('queue', $(visibleErrorEles[0]) , 'scrollPageTo', {
        is_page_item: true,
        scrollableContainerSelector: this.$el,
        force_scroll: true
      });
    }
  },

  clickEmergencyUpdate() {
    this.getUI('updateEmergencyError').hide();

    // Render all in order to get new stats on step3
    this.render();

    const selectedUsers = this.users.filter(user => !user.get('_excluded'));
    if (this.dailyEmergencyModel.getData() > selectedUsers.length) {
      $(EMERGENCY_PER_DAY_SELECTOR).text('emergencies per day must be less than the number of included staff');
    } else {
      this.getUI('updateEmergencyBtn').attr('disabled', 'disabled');
      $(EMERGENCY_PER_DAY_SELECTOR).text('');
    }
  },

  stepOneDisableInputs() {
    this.startDateModel.set({ disabled: true });
    this.endDateModel.set({ disabled: true });
    this.userRoleCheckboxCollection.forEach(m => m.set('disabled', true));
    this.engagementCheckboxCollection.forEach(m => m.set('disabled', true));
    this.dailyHearingTimes.trigger('disable:inputs');
  },

  resetStepOne() {
    this.startDateModel.set({ disabled: false });
    this.endDateModel.set({ disabled: false });
    this.userRoleCheckboxCollection.forEach(m => m.set('disabled', false));
    this.engagementCheckboxCollection.forEach(m => m.set('disabled', false));
    this.staffSelectModel.set('disabled', false);
    this.dailyHearingTimes.trigger('enable:inputs');
    this.stepOneComplete = false;
    this.stepTwoComplete = false;
    this.render();
  },

  submitStepTwo() {
    if (!this.validateStepTwo()) return;

    this.stepTwoComplete = true;
    this.staffSelectModel.set('disabled', true);
    
    const matchingUserOptions = this.users.filter(user => !user.get('_excluded') && user.isEmergencyScheduler()).map(user => {
      return { text: user.getDisplayName(), value: String(user.id), };
    });
    this.emergencyUserModel.set({
      optionData: matchingUserOptions,
      value: null
    });
    this.touModel.set('checked', false);
    this.render();
  },

  resetStepTwo() {
    this.stepTwoComplete = false;
    this.staffSelectModel.set('disabled', false);
    this.render();
  },

  validateStepOne() {
    const step1Regions = ['dateRangeStartRegion', 'dateRangeEndRegion', 'roleTypeRegion', 'engagementRegion'];
    let isValid = this.validateRegionsAndShowErrors(step1Regions);
    this.getUI('hearingOverlapError').addClass('hidden');

    const hasOverlappingHearings = (timeSegments) => {
      if (timeSegments.length === 1) return false;
    
      timeSegments = timeSegments.sort(([a,b], [c,d]) => {
        if (!a || !c) return;
        return a.localeCompare(c);
      });
    
      for (let i = 0; i < timeSegments.length - 1; i++) {
        const currentEndTime = timeSegments[i][1];
        const nextStartTime = timeSegments[i + 1][0];
    
        if (currentEndTime > nextStartTime) {
          return true;
        }
      }
    
      return false;
    };

    const dailyHearingTimeSegments = this.dailyHearingTimes.map(hearing => [hearing.get('start_time'), hearing.get('end_time')]);
    if (isValid) {
      isValid = !hasOverlappingHearings(dailyHearingTimeSegments);
      !isValid ? this.getUI('hearingOverlapError').removeClass('hidden') : null;
    }

    return isValid;
  },

  validateStepTwo() {
    const step2Regions = ['staffSelectRegion'];
    return this.validateRegionsAndShowErrors(step2Regions);
  },

  validateStepThree() {
    const step3Regions = ['userEmergencyRegion', 'emergencyUserRegion', 'dailyEmergencyRegion', 'emergencyStartRegion', 'touRegion' , 'selectDutyRegion'];
    let isValid = this.validateRegionsAndShowErrors(step3Regions);
    if (!this.getUI('updateEmergencyBtn').attr('disabled')) {
      isValid = false;
      this.getUI('updateEmergencyError').show();
    }

    return isValid;
  },

  displayErrorModal(errorType) {
    let errorText = '';

    if (errorType === NO_MATCHING_BLOCKS_ERROR) {
      errorText = `
        <p>The selections you have made do not result in any hearings being generated. Please validate that the selected hearing owners have the correct user permissions and that their schedules are available for hearings during this time.</p>
        <p>Would you like to change your selections and try again?</p>
      `;
    }

    if (errorType === API_ERROR) {
      errorText = `
        <p>Unable to retrieve hearing generation data</p>
        <p>Would you like to change your selections and try again?</p>
      `;
    }

    this.$el.hide();
    let cancelProcess = true;
    const modalView = modalChannel.request('show:standard', {
      title: 'No Hearings to Import',
      bodyHtml: errorText,
      cancelButtonText: 'Cancel Process',
      primaryButtonText: 'Change Selections',
      hideHeaderX: true,
      onContinueFn(_modalView) {
        cancelProcess = false;
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

  async initiateCreateHearingsLoads() {
    const selectedUsers = this.users.filter(user => !user.get('_excluded'));
    let blockPromiseList = [];
    let dailyHearingsPromiseList = [];
    let userBlockList = [];
    let dailyHearingsList = [];

    for (const user of selectedUsers) {
      const searchParams={
        BlockStartingAfter: Moment(`${Moment(this.startDateModel.getData()).format('YYYY-MM-DD')}T00:00:00.000`).tz(this.RTB_OFFICE_TIMEZONE_STRING).toISOString(),
        BlockStartingBefore: Moment(`${Moment(this.endDateModel.getData()).format('YYYY-MM-DD')}T23:59:59.000`).tz(this.RTB_OFFICE_TIMEZONE_STRING).toISOString(),
        SystemUserId: user.get('user_id'),
        Count: 999990
      }

      const blockPromise = () => new Promise((res, rej) => {
        return schedulingChannel.request('load:blocks:all', searchParams).then(userBlocks => {
        const blocks = new ScheduleBlockCollection(userBlocks?.schedule_blocks).filter(blocks => blocks.isTypeWorking());
        userBlockList.push({ userId: user.get('user_id'), blockList: blocks });
        res(blocks);
      }).catch((err) => rej(err));
    });

      blockPromiseList.push(blockPromise);
    }

    const startingDate = Moment(this.startDateModel.getData());
    const endDate = Moment(this.endDateModel.getData());
    const dateIterator = startingDate;
    while (dateIterator.isSameOrBefore(endDate)) {
      let dailyDate = Moment(dateIterator).format('YYYY-MM-DD');
      const dailyHearingsPromise = () => new Promise((res, rej) => {
        return hearingChannel.request('get:by:day', dailyDate).then(dailyHearing => {
          dailyHearingsList.push(dailyHearing);
          res(dailyHearing);
        }).catch((err) => rej(err));
      });

      dailyHearingsPromiseList.push(dailyHearingsPromise);
      dateIterator.add(1, 'days');
    }

    await Promise.all([...blockPromiseList, ...dailyHearingsPromiseList].map(p => p()))
      .catch(() => { throw new Error(API_ERROR) });
    
    const combinedDailyHearings = dailyHearingsList.map(dailyHearings => dailyHearings.owner_hearings).filter(dailyOwnerHearings => dailyOwnerHearings.length).flat();

    return { combinedDailyHearings, userBlockList };
    
  },

  async clickGenerateHearings() {
    if (!this.validateStepThree()) return;
    loaderChannel.trigger('page:load');
    let createHearingData = null;
    try {
      createHearingData = await this.initiateCreateHearingsLoads();
    } catch {
      loaderChannel.trigger('page:load:complete');
      this.displayErrorModal(API_ERROR);
      return;
    }
    
    this.setHearingsToImport(createHearingData.userBlockList);
    this.removeOverlappingHearings(createHearingData.combinedDailyHearings);
    this.generateEmergencyHearings();
    loaderChannel.trigger('page:load:complete');

    if (!this.hearingsToCreate.length) {
      this.displayErrorModal(NO_MATCHING_BLOCKS_ERROR);
    } else {
      this.isUpload = true;
      this.render();
    }
  },

  setHearingsToImport(userBlockList) {
    const startingDate = Moment(this.startDateModel.getData());
    const endDate = Moment(this.endDateModel.getData());
    const dateIterator = startingDate;
    const selectedUsers = this.users.filter(user => !user.get('_excluded'));
    

    while (dateIterator.isSameOrBefore(endDate)) {
      for (const user of selectedUsers) {
        const blocksAssociatedToSelectedUser = userBlockList.filter(userBlocks => userBlocks.userId === user.get('user_id'));
        this.dailyHearingTimes.forEach(hearing => {
          const hearingToCreate = new HearingModel();
          const priority = hearing.get('hearing_priority');
          const hearingStart = Moment.tz(`${dateIterator.format('YYYY-MM-DD')}T${hearing.get('start_time')}`, this.RTB_OFFICE_TIMEZONE_STRING);
          const hearingEnd = Moment.tz(`${dateIterator.format('YYYY-MM-DD')}T${hearing.get('end_time')}`, this.RTB_OFFICE_TIMEZONE_STRING);
          const blockIncludesHearingTime = blocksAssociatedToSelectedUser[0].blockList.filter(block => {
            const blockStart = Moment(block.get('block_start'));
            const blockEnd = Moment(block.get('block_end'));
            return (
              (blockStart.isSameOrBefore(hearingStart) && blockEnd.isSameOrAfter(hearingEnd)) ||
              (blockStart.isAfter(hearingStart) && blockStart.isBefore(hearingEnd)) ||
              (blockEnd.isAfter(hearingStart) && blockEnd.isBefore(hearingEnd))
            )
          });
          if (blockIncludesHearingTime.length) {
            const isDuty = blockIncludesHearingTime[0].isTypeDuty() && this.dutyCheckboxModel.getData();
            hearingToCreate.set({ hearing_start_datetime: hearingStart.toISOString(), hearing_end_datetime: hearingEnd.toISOString(), hearing_region: this.HEARING_DEFAULT_REGION, hearing_owner: user.id, hearing_priority: isDuty ? configChannel.request('get', 'DISPUTE_URGENCY_DUTY') : priority });
            this.hearingsToCreate.add(hearingToCreate);
          }
        });
      };

      dateIterator.add(1, 'days');
    }
  },

  removeOverlappingHearings(dailyHearingsList) {
    if (!this.hearingsToCreate.length) return;

    let hearingModelsToRemove = [];
    this.hearingsToCreate.forEach((hearing, index) => {
      const newHearingStart = hearing.get('hearing_start_datetime');
      const newHearingEnd = hearing.get('hearing_end_datetime');
      const dailyHearingsForUser = dailyHearingsList.filter(dailyHearingsList => dailyHearingsList.user_id === hearing.get('hearing_owner'))
        .map(userHearing => userHearing.hearings)
        .flat()
        .sort((a, b) => a.hearing_start_datetime.localeCompare(b.hearing_start_datetime));

      let existingHearing;
      for (let i=0; i < dailyHearingsForUser.length; i++) {
        existingHearing = dailyHearingsForUser[i];
        const existingHearingStart = existingHearing.hearing_start_datetime;
        const existingHearingEnd = existingHearing.hearing_end_datetime;

        // Stop checking for "hearing" overlaps if we are only looking at hearings taking place after
        if (Moment(existingHearing).isSameOrAfter(newHearingEnd)) {
          return;
        }

        if (
          (Moment(existingHearingStart).isSameOrBefore(Moment(newHearingStart)) && Moment(existingHearingEnd).isSameOrAfter(Moment(newHearingEnd))) ||
            (Moment(existingHearingStart).isAfter(newHearingStart) && Moment(existingHearingStart).isBefore(newHearingEnd)) ||
            (Moment(existingHearingEnd).isAfter(newHearingStart) && Moment(existingHearingEnd).isBefore(newHearingEnd))
        ) {
          hearingModelsToRemove.push(this.hearingsToCreate.at(index));
        }
      }
    });
    

    hearingModelsToRemove.forEach(hearingModel => {
      this.hearingErrors.push(`Overlapping hearing time for user id: ${hearingModel.get('hearing_owner')} --- start time: ${Moment(hearingModel.get('hearing_start_datetime')).format('MMM D YYYY h:mmA')} --- end time: ${Moment(hearingModel.get('hearing_end_datetime')).format('MMM D YYYY h:mmA')}`);
      this.hearingsToCreate.remove(hearingModel);
    });
  },

  generateEmergencyHearings() {
    if (!this.emergencyCheckboxModel.getData()) return;

    const convertableHearings = this.hearingsToCreate.filter(hearing => !hearing.isPriorityEmergency());

    const selectedUsers = this.users.filter(user => !user.get('_excluded'))
    const emergencyUsers = this.emergencyCheckboxModel.getData() ? selectedUsers.filter(m => m.isEmergencyScheduler()) : [];
    const emergenciesPerDay = Math.min(this.dailyEmergencyModel.getData(), emergencyUsers.length);
    const firstEmergencyUserId = this.emergencyUserModel.getData({ parse: true });
    const emergencyTimeSlot = this.emergencyStartingTimeModel.getSelectedOption();
    const emergencyStartTime = emergencyTimeSlot?.startTime;
    const emergencyEndTime = emergencyTimeSlot?.endTime;

    let indexToUse = emergencyUsers.map(user => user.id).indexOf(firstEmergencyUserId);
    let nextEmergencyUser = emergencyUsers[indexToUse];

    const findHearingItemForUser = (userId, items=[]) => (
      items.find(h => h.get('hearing_owner') === userId && emergencyStartTime === Moment.tz(h.get('hearing_start_datetime'), this.RTB_OFFICE_TIMEZONE_STRING).format("HH:mm") 
        && emergencyEndTime === Moment.tz(h.get('hearing_end_datetime'), this.RTB_OFFICE_TIMEZONE_STRING).format("HH:mm") && !h.isPriorityDuty())
      )

    const hearingsPerDay = {};

    convertableHearings.forEach(hearing => {
      const momentStart = Moment.tz(hearing.get('hearing_start_datetime'), this.RTB_OFFICE_TIMEZONE_STRING);
      const dateStr = momentStart.isValid() ? momentStart.format('YYYY-MM-DD') : null;

      if (!hearingsPerDay[dateStr]) hearingsPerDay[dateStr] = [];
      hearingsPerDay[dateStr].push(hearing);
    });

    const hearingItemsToConvert = [];
    Object.keys(hearingsPerDay).sort().forEach(key => {
      let dailyEmergenciesCreated = 0;
      const uploadItemsForDay = hearingsPerDay[key];
      let matchingHearing = null;
      let loopIndex = 0;

      while (dailyEmergenciesCreated < emergenciesPerDay && dailyEmergenciesCreated < uploadItemsForDay.length && loopIndex < emergencyUsers.length) {
        matchingHearing = findHearingItemForUser(nextEmergencyUser.id, uploadItemsForDay);
        if (matchingHearing) {
          dailyEmergenciesCreated++;
          hearingItemsToConvert.push(matchingHearing);
        } else {
          this.hearingErrors.push(`No convertible emergency hearings for user id: ${nextEmergencyUser.id} on ${Moment(uploadItemsForDay[0].get('hearing_start_datetime')).format('YYYY-MM-DD')}`);
        }

        indexToUse = (indexToUse + 1) % emergencyUsers.length;
        nextEmergencyUser = emergencyUsers[indexToUse];
        loopIndex++;
      }
    });
    
    hearingItemsToConvert.forEach(hearing => {
      hearing.set({ hearing_priority: configChannel.request('get', 'HEARING_PRIORITY_EMERGENCY') });
    });
  },

  setDuration() {
    const startDate = Moment(`${Moment(this.startDateModel.getData()).format('YYYY-MM-DD')}T00:00:00.000Z`);
    const endDate = Moment(`${Moment(this.endDateModel.getData()).format('YYYY-MM-DD')}T24:00:00.000Z`);
    const difference = Formatter.toDurationFromSecs(Moment(endDate).diff(Moment(startDate), 'seconds'));
    this.hearingDuration = startDate.isValid() && endDate.isValid() && difference ? difference : '';
  },

  onRender() {
    if (this.isUpload) {
      this.renderForUpload();
    } else {
      this.renderUserInputs();
    }
  },

  renderUserInputs() {
    this.showChildView('dateRangeStartRegion', new InputView({ model: this.startDateModel }));
    this.showChildView('dateRangeEndRegion', new InputView({ model: this.endDateModel }));
    this.showChildView('roleTypeRegion', new Checkboxes({ collection: this.userRoleCheckboxCollection }));
    this.showChildView('engagementRegion', new Checkboxes({ collection: this.engagementCheckboxCollection }));
    this.showChildView('addHearingsRegion', new HearingGenerationHearings({ collection: this.dailyHearingTimes, isDisabled: this.stepOneComplete }))
    
    if (this.stepOneComplete) {
      this.showChildView('staffSelectRegion', new StaffSelect({
        model: this.staffSelectModel,
        collection: this.users
      }));
    }

    if (this.stepOneComplete && this.stepTwoComplete) {
      this.showChildView('userEmergencyRegion', new CheckboxView({ model: this.emergencyCheckboxModel }));
      this.showChildView('emergencyUserRegion', new DropdownView({ model: this.emergencyUserModel }));
      this.showChildView('dailyEmergencyRegion', new InputView({ model: this.dailyEmergencyModel }));
      this.showChildView('emergencyStartRegion', new DropdownView({ model: this.emergencyStartingTimeModel }));
      this.showChildView('selectDutyRegion', new CheckboxView({ model: this.dutyCheckboxModel }))
      this.showChildView('touRegion', new CheckboxView({ model: this.touModel }))
    }
  },

  renderForUpload() {
    const startDate = Moment(this.startDateModel.getData());
    const endDate = Moment(this.endDateModel.getData());
    const hearingDurationDifference = Moment(endDate).add(1, "day").diff(Moment(startDate), 'days');
    const selectedUsers = this.users.filter(user => !user.get('_excluded'))
    const emergencyUsers = this.emergencyCheckboxModel.getData() ? selectedUsers.filter(m => m.isEmergencyScheduler()) : [];
    this.showChildView('uploadRegion', new HearingGenerationUploads({
      model: this.model,
      collection: this.hearingsToCreate,
      emergencyUsers,
      firstEmergencyUserId: this.emergencyUserModel.getData({ parse: true }),
      emergenciesPerDay: Math.min(this.dailyEmergencyModel.getData(), emergencyUsers.length),
      isDutySelected: this.dutyCheckboxModel.getData(),
      startDate: this.startDateModel.getData(),
      endDate: this.endDateModel.getData(),
      duration: hearingDurationDifference,
      dailyHearingTimes: this.dailyHearingTimes,
      hearingErrors: this.hearingErrors
    }));
  },

  regions: {
    dateRangeStartRegion: '.hearing-generation__start-date',
    dateRangeEndRegion: '.hearing-generation__end-date',
    roleTypeRegion: '.hearing-generation__role-type',
    engagementRegion: '.hearing-generation__engagement-type',
    addHearingsRegion: '.hearing-generation__add-hearings__area',
    staffSelectRegion: '.hearing-generation__staff-select',
    userEmergencyRegion: '.hearing-generation__user-emergency',
    emergencyUserRegion: '.hearing-generation__emergency-user',
    dailyEmergencyRegion: '.hearing-generation__daily-emergency',
    emergencyStartRegion: '.hearing-generation__emergency-start-time',
    selectDutyRegion: '.hearing-generation__duty-generation',
    touRegion: '.hearing-generation__tou',
    uploadRegion: '.hearing-generation__upload',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      updateEmergencyBtn: '.hearing-generation__emergency-update-btn',
      updateEmergencyError: '.hearing-generation__emergency-update-btn + .error-block',
      duration: '.hearing-generation__date-duration',
      maxDateError: '.hearing-generation__max-date-error',
      hearingOverlapError: '.hearing-generation__add-hearings__overlap-error'
    })
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.updateEmergencyBtn': 'clickEmergencyUpdate',
    });
  },

  template() {
    return (
      <div className="modal-dialog hearing-generation">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Generate Hearings</h4>
            <div className="modal-close-icon-lg hearing-generation__close" onClick={() => this.closeImportModal()}></div>
          </div>
          <div className="modal-body generate-hearings">
            
              {this.renderJsxStepOne()}
              {this.renderJsxStepTwo()}
              {this.renderJsxStepThree()}
              {this.renderJsxUpload()}
          </div>
        </div>
      </div>
    );
  },

  renderJsxStepOne() {
    return (
      <div className={`${this.isUpload ? 'hidden' : ''}`}>
        <div className="hearing-generation__schedule-period">
          <span>Select the date range for the generated hearings</span>
          <div className="hearing-generation__date-wrapper">
            <div className="hearing-generation__start-date"></div>
            <div className="hearing-generation__end-date"></div>
            <label className="hearing-generation__date-duration general-modal-label">{this.hearingDuration}</label>
          </div>
          <p className="hearing-generation__max-date-error error-block hidden">The maximum hearing generation duration is {MAX_HEARINGS_DAYS} days</p>
        </div>
        
        <div className="hearing-generation__add-hearings">
          <div>Set the daily hearings that you want added</div>
          <div className="hearing-generation__add-hearings__area"></div>
          <p className="hearing-generation__add-hearings__overlap-error error-block hidden">There are overlapping hearing times</p>
          { !this.stepOneComplete ?
          <div className="hearing-generation__add-hearings__add">
            <img className="hearing-generation__add-hearings__add__icon" src={AddIcon}></img>
            <span className="general-link" onClick={() => this.addHearing()}>Add another hearing time</span>
          </div> 
          : null }
        </div>

        <div className="hearing-generation__user-selects">
          <p>Select the staff Arbitrator role(s) that will have the above blocks added.</p>
          <div className="hearing-generation__role-type"></div>
          <p>Select the engagement type(s) that will have the above blocks added.</p>
          <div className="hearing-generation__engagement-type"></div>
        </div>

        <div className="modal-button-container">
          <button type="button" className={`btn btn-lg btn-default btn-primary btn-continue ${this.stepOneComplete ? 'disabled' : ''}`} onClick={() => this.submitStepOne()}>Continue</button>
          { this.stepOneComplete ? <button type="button" className="hearing-generation__change-selection btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.resetStepOne()}>Change Selections</button> : null }
        </div>
      </div>
    )
  },

  renderJsxStepTwo() {
    return (
      <>
        <div className={`hearing-generation__staff-select ${this.isUpload ? 'hidden' : ''}`}></div>
        <div className="modal-button-container">
          { this.stepOneComplete && !this.isUpload ? <button type="button" className={`btn btn-lg btn-default btn-primary btn-continue ${this.stepTwoComplete ? 'disabled' : ''}`} onClick={() => this.submitStepTwo()}>Continue</button> : null }
          { this.stepOneComplete && this.stepTwoComplete && !this.isUpload ? <button type="button" className="hearing-generation__change-selection btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.resetStepTwo()}>Change Selections</button> : null }
        </div>
      </>
    )
  },

  renderJsxStepThree() {
    return (
      <div className={`${this.stepOneComplete && this.stepTwoComplete && !this.isUpload ? '' : 'hidden'}`}>
        <div className="hearing-generation__duty-generation"></div>
        <div className={"hearing-generation__step-three"}>
          <div className="hearing-generation__user-emergency"></div>
          <div className="hearing-generation__emergency-user"></div>
          <div className="hearing-generation__daily-emergency"></div>
          <div className="hearing-generation__emergency-start-time"></div>
           <div className="hearing-generation__emergency-update-container">
            <button className="btn btn-standard btn-primary hearing-generation__emergency-update-btn" disabled="disabled">Update</button>
            <p className="error-block hidden-item">Accept changes to continue</p>
          </div>
        </div>
        <div className="hearing-generation__tou-row">
          <div className="hearing-generation__tou"></div>
        </div>
        <div className="modal-button-container hearing-generation__import-wrapper">
          <button type="button" className="btn btn-lg btn-default btn-cancel btn-cancel-bulk-add-blocks" onClick={() => this.closeImportModal()}>Cancel</button>
          <button type="button" className={"btn btn-lg btn-default btn-primary btn-continue hearing-generation__generate-import-button"}
              onClick={() => this.clickGenerateHearings()}>Generate Import File</button>
        </div>
      </div>
    )
  },

  renderJsxUpload() {
    return <div className="hearing-generation__upload"></div>
  },
});

_.extend(ModalHearingGeneration.prototype, ViewJSXMixin);
export { ModalHearingGeneration }