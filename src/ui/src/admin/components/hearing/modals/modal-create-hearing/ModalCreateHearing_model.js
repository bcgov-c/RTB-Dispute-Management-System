import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputModel from '../../../../../core/components/input/Input_model';
import RadioModel from '../../../../../core/components/radio/Radio_model';
import TextareaModel from '../../../../../core/components/textarea/Textarea_model';
import HearingModel from '../../../../../core/components/hearing/Hearing_model';
import ScheduleBlock_collection from '../../../scheduling/schedule-blocks/ScheduleBlock_collection';
import { SYSTEM_USER_NAMES } from '../../../../../core/components/user/UserManager';

const HEARING_CONFERENCE_CODE = 1;
const HEARING_CUSTOM_CODE = 2;

const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const userChannel = Radio.channel('users');
const schedulingChannel = Radio.channel('scheduling');
const Formatter = Radio.channel('formatter').request('get');

export default Backbone.Model.extend({

  defaults: {
    initialDate: null,
    initialArbId: null,
    arbInfoMessage: null,
    availableStaff: null,
    availableBridges: null,
    arbScheduleBlocks: null,
    currentStep: 1
  },

  initialize() {
    this.hearingModel = new HearingModel();
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.hearingTypeModel = new DropdownModel({
      labelText: 'Hearing Type',
      errorMessage: 'Select the hearing type',
      required: true,
      optionData: this._getHearingTypeOptions(),
      value: this.hearingModel.get('hearing_type') ? String(this.hearingModel.get('hearing_type')) : null,
      apiMapping: 'hearing_type'
    });

    this.hearingPriorityModel = new DropdownModel({
      optionData: this._getPriorityOptions(),
      labelText: 'Hearing Priority',
      required: true,
      defaultBlank: true,
      value: this.hearingModel.get('hearing_priority') ? String(this.hearingModel.get('hearing_priority')) : null,
      apiMapping: 'hearing_priority'
    });

    this.hearingNoteModel = new InputModel({
      inputType: 'text',
      labelText: 'Schedule Note',
      cssClass: 'optional-input',
      required: false,
      value: this.hearingModel.get('hearing_note'),
      apiMapping: 'hearing_note'
    });


    const initialDate = this.get('initialDate') ? Moment(this.get('initialDate')) : null;    
    const startDatetime = this.hearingModel.get('local_start_datetime');
    const endDatetime = this.hearingModel.get('local_end_datetime');
    this.hearingDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Hearing Date',
      required: true,
      allowFutureDate: true,
      minDate: Moment(),
      value: startDatetime ? Moment(startDatetime).format(InputModel.getLongDateFormat()) :
      ( initialDate && !initialDate.isBefore(Moment(), 'days') ? initialDate.format(InputModel.getLongDateFormat()) : null)
    });

    const minBookingTime = this._getBookingStartTime(initialDate);
    const maxBookingTime = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    this.hearingStartTimeModel = new InputModel({
      inputType: 'time',
      labelText: 'Start Time',
      minTime: minBookingTime,
      maxTime: Moment(maxBookingTime, InputModel.getTimeFormat()).subtract(1, 'hour').format(InputModel.getTimeFormat()),
      required: true,
      value: startDatetime ? Moment(startDatetime).format(InputModel.getTimeFormat()) : null
    });
    

    this.hearingEndTimeModel = new InputModel({
      inputType: 'time',
      labelText: 'End Time',
      minTime: Moment(minBookingTime, InputModel.getTimeFormat()).add(1, 'hour').format(InputModel.getTimeFormat()),
      maxTime: maxBookingTime,
      required: true,
      value: endDatetime ? Moment(endDatetime).format(InputModel.getTimeFormat()) : null
    });


    this.availableArbsModel = new DropdownModel({
      labelText: 'Available Arbitrators',
      errorMessage: 'Select a staff member',
      required: true,
      optionData: [],
      defaultBlank: true,
      value: null,
      apiMapping: 'hearing_owner'
    });

    this.availableBridgesModel = new DropdownModel({
      labelText: 'Available Conference Bridges',
      errorMessage: 'Select a conference bridge',
      required: true,
      optionData: [],
      defaultBlank: true,
      value: null,
      apiMapping: 'conference_bridge_id'
    });

    this.hearingScheduleModel = new RadioModel({
      labelText: null,
      errorMessage: null,
      required: true,
      optionData: this._getHearingScheduleOptions(),
      value: this.hearingModel.get('use_custom_schedule') ? HEARING_CUSTOM_CODE : HEARING_CONFERENCE_CODE,
      valuesToDisable: this.isFaceToFace() ? [] : [HEARING_CUSTOM_CODE],
      apiMapping: 'use_custom_schedule'
    });

    this.hearingDetailsTextModel = new TextareaModel({
      labelText: null,
      required: false,
      disabled: true,
      value: this.hearingModel.get('hearing_details'),
      apiMapping: 'hearing_details'
    });


    this.otherLocationModel = new InputModel({
      labelText: 'Other location or method',
      errorMessage: "Enter the location or method",
      required: true,
      value: this.hearingModel.get('hearing_location'),
      apiMapping: 'hearing_location',
    });

    this.hearingInstructionsTextModel = new TextareaModel({
      labelText: 'Custom Instructions',
      errorMessage: 'Enter the custom instructions',
      required: true,
      value: this.hearingModel.get('special_instructions'),
      apiMapping: 'special_instructions'
    });

    this._createConferenceBridgeSubModels();
  },


  _createConferenceBridgeSubModels() {
    const selectedConferenceBridge = hearingChannel.request('get:conferencebridge', this.hearingModel.get('conference_bridge_id'));

    this.participantCodeModel = new InputModel({
      labelText: 'Participant Code',
      errorMessage: 'Enter the dial code',
      value: selectedConferenceBridge ? selectedConferenceBridge.get('participant_code') : null,
      disabled: true
    });

    this.moderatorCodeModel = new InputModel({
      labelText: 'Access Code',
      errorMessage: 'Enter the dial code',
      value: selectedConferenceBridge ? selectedConferenceBridge.get('moderator_code') : null,
      disabled: true
    });

    this.primaryDialInNumberModel = new InputModel({
      labelText: 'Primary Dial In',
      errorMessage: 'Enter the primary dial in number',
      inputType: 'phone',
      value: selectedConferenceBridge ? selectedConferenceBridge.get('dial_in_number1') : null,
      disabled: true
    });
    this.primaryDialInNumberModel.set('subLabel', null);

    this.primaryDialInTitleModel = new InputModel({
      labelText: 'Primary Title',
      errorMessage: 'Enter the primary title',
      value: selectedConferenceBridge ? selectedConferenceBridge.get('dial_in_description1') : null,
      disabled: true
    });

    this.secondaryDialInNumberModel = new InputModel({
      labelText: 'Secondary Dial In',
      errorMessage: 'Enter the moderator code',
      inputType: 'phone',
      value: selectedConferenceBridge ? selectedConferenceBridge.get('dial_in_number2') : null,
      disabled: true
    });
    this.secondaryDialInNumberModel.set('subLabel', null);

    this.secondaryDialInTitleModel = new InputModel({
      labelText: 'Secondary Title',
      errorMessage: 'Enter the title',
      value: selectedConferenceBridge ? selectedConferenceBridge.get('dial_in_description2') : null,
      disabled: true
    });
  },

  getMinutesToHalfHour() {
    //returns minutes to reach next half hour. E.G if current time is 3:46pm, it will return 14 minutes.
    return 30 - (Moment().minute() % 30);
  },

  _getBookingStartTime(initialStartDate) {
    if (!initialStartDate) return configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');

    if (initialStartDate.isAfter(Moment())) {
      return configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    } else {
      const remainder = this.getMinutesToHalfHour();
      //if current day is selected in date picker, return min date that is 30 minutes or less in the future
      const minBookingTime = Moment(configChannel.request('get', 'HEARING_MIN_BOOKING_TIME'), 'hh:mmA').isBefore(Moment()) 
      ? Moment().add(remainder, "minutes").format(InputModel.getTimeFormat()) : configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');

      return minBookingTime;
    }
  },

  _getHearingTypeOptions() {
    const hearingOptions = ['HEARING_TYPE_CONFERENCE', 'HEARING_TYPE_FACE_TO_FACE'];
    const hearingDisplay = configChannel.request('get', 'HEARING_TYPE_DISPLAY');

    return _.map(hearingOptions, function(hearingOption) {
      const hearingOptionIndex = configChannel.request('get', hearingOption);
      return { value: String(hearingOptionIndex), text: hearingDisplay[hearingOptionIndex] };
    });
  },

  _getPriorityOptions() {
    return _.map(['DISPUTE_URGENCY_EMERGENCY', 'DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED', 'DISPUTE_URGENCY_DUTY'],
      function(code) {
        const value = configChannel.request('get', code);
        return { value: String(value), text: Formatter.toUrgencyDisplay(value) };
      });
  },
  
  _getHearingScheduleOptions() {
    return [{ value: HEARING_CONFERENCE_CODE, text: 'Conference Call'},
        { value: HEARING_CUSTOM_CODE, text: 'Custom Hearing'}];
  },

  setupListeners() {
    this.listenTo(this.hearingTypeModel, 'change:value', () => {
      // If hearing type had a saved value already, force clear later steps if it is changed
      const silentOptions = { silent: true };
      if (this.get('currentStep') > 1) {
        this.set('currentStep', 1, silentOptions);
        this.clearArbData(silentOptions);
        this.clearConferenceBridgeData(silentOptions);
        //this.hearingScheduleModel.set('value', HEARING_CONFERENCE_CODE, silentOptions);
        this.trigger('update');
      }
    });

    this.listenTo(this.hearingDateModel, 'change:value', function(model, value) {
      if (!model.isValid() || !$.trim(model.getData())) {
        return;
      }
      model.set('value', Moment(value).format(InputModel.getLongDateFormat()), { silent: true });
      this.hearingDateModel.trigger('render');
    }, this);

    this.listenTo(this.hearingStartTimeModel, 'change:value', function(model, value) {
      this.timeChangeListener(model, value);
      
      const momentTime = Moment(value, InputModel.getTimeFormat()); 
      const momentEndTime = Moment(this.hearingEndTimeModel.getData(), InputModel.getTimeFormat());
      
      if (!momentTime.isValid() || !$.trim(value)) {
        return;
      }

      this.hearingEndTimeModel.set('minTime', value);

      // If the end time is empty or violates max time, then reset it to one hour past start time
      if (!this.hearingEndTimeModel.getData() || !momentEndTime.isValid() || !momentTime.isBefore(momentEndTime, 'minutes') ) {
        this.hearingEndTimeModel.trigger('update:input', momentTime.add(1, 'hour').format(InputModel.getTimeFormat()));
      }

      this.hearingEndTimeModel.trigger('render');
    }, this);

    this.listenTo(this.hearingEndTimeModel, 'change:value', this.timeChangeListener, this);

    this.listenTo(this.hearingScheduleModel, 'change:value', function() { this.trigger('update'); }, this);

    
    this.listenTo(this.availableBridgesModel, 'change:value', function() {
      this.hearingModel.set(_.extend(
        this.availableBridgesModel.getPageApiDataAttrs()
      ));
    }, this);

    this.listenTo(this.hearingModel, 'change:hearing_type', function(model, hearingType) {
      const availableValues = _.pick(this.hearingScheduleModel.get('optionData'), 'value');
      this.hearingScheduleModel.set(Object.assign({
        valuesToDisable: this.isFaceToFace() ? [] : [HEARING_CUSTOM_CODE],
      },
        _.contains(availableValues, hearingType) ? {} : { value: HEARING_CONFERENCE_CODE }
      ), { silent: true });
    }, this);


    this.listenTo(this.hearingModel, 'change:conference_bridge_id', function() {
      this._createConferenceBridgeSubModels();
      this.trigger('update');
    }, this);

    this.listenTo(this.availableArbsModel, 'change:value', function() { this.trigger('update'); }, this);
  },

  timeChangeListener(model, value) {
    const momentTime = Moment(value, InputModel.getTimeFormat());
    const momentMinTime = model.get('minTime') ? Moment(model.get('minTime'), InputModel.getTimeFormat()) : null;
    const momentMaxTime = model.get('maxTime') ? Moment(model.get('maxTime'), InputModel.getTimeFormat()) : null;
    
    if (momentTime.isBefore(momentMinTime, 'minutes')) {
      model.trigger('update:input', momentMinTime.format(InputModel.getTimeFormat()));//, { silent: true });
      return;
    }

    if (momentTime.isAfter(momentMaxTime, 'minutes')) {
      model.trigger('update:input', momentMaxTime.format(InputModel.getTimeFormat()), { silent: true });
      return;
    }
  },

  saveInternalDataToModel(stepNumber) {
    // Saves the values in inputs into the underlying models
    if (stepNumber === 1) {
      this.hearingModel.set(this.step1DataToHearingData());
      this.set({ arbScheduleBlocks: null });
    } else if (stepNumber === 2) {
      this.hearingModel.set(_.extend(
        this.availableArbsModel.getPageApiDataAttrs()
      ));
    }
  },

  step1DataToHearingData() {
    const start_date = Moment(this.hearingDateModel.getData({ format: 'date' }));
    const timezoneString = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const localStartDatetime = `${start_date.format('YYYY-MM-DDT')}${this.hearingStartTimeModel.getData({ iso: true })}`;
    const localEndDatetime = `${start_date.format('YYYY-MM-DDT')}${this.hearingEndTimeModel.getData({ iso: true })}`;
    return _.extend(
      this.hearingTypeModel.getPageApiDataAttrs(),
      this.hearingPriorityModel.getPageApiDataAttrs(),
      this.hearingNoteModel.getPageApiDataAttrs(),
      {
        local_start_datetime: localStartDatetime,
        local_end_datetime: localEndDatetime,
        hearing_start_datetime: Moment.tz(localStartDatetime, timezoneString),
        hearing_end_datetime: Moment.tz(localEndDatetime, timezoneString)
      }
    );
  },

  hasUnsavedStep1Changes() {
    const lastUpdatedData = this.hearingModel.toJSON();
    const currentData = this.step1DataToHearingData();
    
    const step1ApiFields = ['hearing_note', 'hearing_priority', 'local_end_datetime', 'local_start_datetime'];

    let hasUnsaved = false;
    _.each(step1ApiFields, field => {
      if (hasUnsaved) { return; }
      if (_.has(lastUpdatedData, field)) {
        if (!_.has(currentData, field) || currentData[field] !== lastUpdatedData[field]) {
          hasUnsaved = true;
        }
      } else if (_.has(currentData, field)) {
        hasUnsaved = true;
      }
    });

    return hasUnsaved;
  },

  getStep1Display() {
    const startDateVal = this.hearingModel.get('local_start_datetime');
    const endDateVal = this.hearingModel.get('local_end_datetime');
    const priorityVal = this.hearingModel.get('hearing_priority');
    const typeVal = this.hearingModel.get('hearing_type');

    if (!startDateVal || !endDateVal || !priorityVal || !typeVal) {
      return;
    }

    return `${Formatter.toUrgencyDisplay(priorityVal)} Hearing - ${Formatter.toHearingTypeDisplay(typeVal)}
      <br/>${Formatter.toWeekdayDateDisplay(startDateVal)}: ${Formatter.toTimeDisplay(startDateVal)} - `+
      `${Formatter.toTimeDisplay(endDateVal)} <span class="duration-display">(${Formatter.toDuration(startDateVal, endDateVal)})</span>`;
  },

  getStep2Display() {
    const hearingOwner = this.hearingModel.get('hearing_owner');
    if (!hearingOwner) {
      return;
    }
    return `Assigned to ${userChannel.request('get:user:name', hearingOwner)}`;
  },
  
  _getSameDayHearingsInfoFromData(data) {
    let hearingsMsg = '';

    if (data) {
      hearingsMsg = `${Moment(this.hearingModel.get('local_start_datetime')).format('MMM D, YYYY')} Hearings: `;
      if (_.isEmpty(data.same_day_hearings)) {
        hearingsMsg += 'None';
      } else {
        hearingsMsg += (_.map(_.sortBy(data.same_day_hearings, 'local_start_datetime'), function(hearing) {
          return `${Moment(hearing.local_start_datetime).format('h:mmA')} - ${Moment(hearing.local_end_datetime).format('hh:mmA')}`;
        })).join(', ');
      }
    }
    return hearingsMsg;
  },


  getArbInfoDisplay(userId) {
    return this._getSameDayHearingsInfoFromData(_.findWhere(this.get('availableStaff'), { user_id: userId }));
  },

  getConferenceBridgeInfoDisplay(conferenceBridgeId) {
    return this._getSameDayHearingsInfoFromData(_.findWhere(this.get('availableBridges'), { bridge_id: conferenceBridgeId }));
  },


  isCustomSelected() {
    return this.hearingScheduleModel.getData({ parse: true }) === HEARING_CUSTOM_CODE;
  },

  isFaceToFace() {
    return $.trim(this.hearingModel.get('hearing_type')) === String(configChannel.request('get', 'HEARING_TYPE_FACE_TO_FACE'));
  },

  /* Api functionality */
  _getDateParams() {
    const dateFormat = 'YYYY-MM-DDTHH:mm';
    return {
      LocalStartDatetime: Moment(this.hearingModel.get('local_start_datetime')).format(dateFormat),
      LocalEndDatetime: Moment(this.hearingModel.get('local_end_datetime')).format(dateFormat),
    };
  },

  clearArbData(options) {
    options = options || {};
    this.hearingModel.set('hearing_owner', null, options);
    this.set('availableStaff', null, options);
    this.availableArbsModel.set('value', null, options);
  },

  loadOwnerSchedule() {
    const currentData = this.step1DataToHearingData();
    return schedulingChannel.request('load:block:collisions:range', currentData.hearing_start_datetime.toISOString(),
        currentData.hearing_end_datetime.toISOString(), this.availableArbsModel.getData())
    .then((conflictingBlocks=[]) => {
      this.set({ arbScheduleBlocks: new ScheduleBlock_collection(conflictingBlocks) });
    });
  },

  hasDutyOrWorkingTime() {
    const currentData = this.step1DataToHearingData();
    const hearingStart = currentData.hearing_start_datetime.toISOString();
    const hearingEnd = currentData.hearing_end_datetime.toISOString();

    const arbScheduleBlocks = this.get('arbScheduleBlocks');
    if (!arbScheduleBlocks || !arbScheduleBlocks.length) return false;

    const blocks = arbScheduleBlocks.filter((blockModel) => {
      return blockModel.isTypeDuty() || blockModel.isTypeHearing();
    }).sort((a, b) => Moment(a.get('block_start')).diff(Moment(b.get('block_start'))))

    const startingBlock = blocks.filter(blockModel => {
      return Moment(blockModel.get('block_start')).isSameOrBefore(Moment(hearingStart)) && Moment(blockModel.get('block_end')).isSameOrAfter(Moment(hearingStart));
    })?.[0];

    if(!startingBlock) return false;

    for (let i=0; i < blocks.length; i++) {
      if (Moment(startingBlock.get('block_start')).isSameOrBefore(Moment(hearingStart)) && Moment(blocks[i].get('block_end')).isSameOrAfter(Moment(hearingEnd))) {
        return true;
      }

      const nextBlock = blocks[i+1];
      if (!nextBlock || !Moment(blocks[i].get('block_end')).isSame(Moment(nextBlock.get('block_start')))) break;
    }
  },

  loadAvailableArbs() {
    const dfd = $.Deferred();
    const params = _.extend({}, this._getDateParams(), {
      RoleGroup: configChannel.request('get', 'USER_ROLE_GROUP_ARB')
    });

    hearingChannel.request('get:available:staff', params)
      .done(response => {
        response = _.filter(response || [], userData => !(SYSTEM_USER_NAMES || []).includes(userData.user_name));
        this.set('availableStaff', response);
        
        const currentUserId = this.hearingModel.get('hearing_owner');
        const responseHasCurrentUserId = _.findWhere(response, { user_id: currentUserId });
        const responseHasInitialArbId = this.get('initialArbId') && _.findWhere(response, { user_id: this.get('initialArbId') });
        // Now update the dropdown
        this.availableArbsModel.set({
          optionData: _.sortBy(_.map(response, function(staff) {
            return { value: String(staff.user_id), text: staff.full_name };
          }), option => { return (option.text || 'zzzz').toLowerCase(); }),
          // Make sure value is set to what it was previously
          value: responseHasCurrentUserId ? String(currentUserId) :
            (responseHasInitialArbId ? String(this.get('initialArbId')) : null)
        }, { silent: true });

        if (!responseHasCurrentUserId) {
          // Un-set the hearing owner if the previous hearing owner was not returned in the new set of arguments
          this.hearingModel.set('hearing_owner', null);
        }
        
        dfd.resolve(response);
      })
      .fail(dfd.reject);
    return dfd.promise();
  },

  clearConferenceBridgeData(options) {
    options = options || {};
    this.hearingModel.set('conference_bridge_id', null, options);
    this.set('availableBridges', null, options);
    this.availableBridgesModel.set('value', null, options);
    this.participantCodeModel.set('value', null, options);
    this.moderatorCodeModel.set('value', null, options);
    this.primaryDialInNumberModel.set('value', null, options);
    this.primaryDialInTitleModel.set('value', null, options);
    this.secondaryDialInNumberModel.set('value', null, options);
    this.secondaryDialInTitleModel.set('value', null, options);
    this.otherLocationModel.set('value', null, options);
    this.hearingInstructionsTextModel.set('value', null, options);
  },

  loadAvailableConferenceBridges() {
    const dfd = $.Deferred();
    this.clearConferenceBridgeData();
    hearingChannel.request('get:available:conferencebridges', this._getDateParams())
      .done(response => {
        this.set('availableBridges', response);

        const currentBridgeId = this.hearingModel.get('conference_bridge_id');
        const responseHasCurrentBridgeId = _.findWhere(response, { bridge_id: currentBridgeId });
        let firstEmptyBridgeId;
        this.availableBridgesModel.set({
          optionData: _.map(response, function(bridge) {
            const bridge_id = String(bridge.bridge_id);
            if (!firstEmptyBridgeId && _.isArray(bridge.same_day_hearings) && bridge.same_day_hearings.length === 0) {
              firstEmptyBridgeId = bridge_id;
            }
            return { value: bridge_id, text: bridge_id };
          }),
          // Make sure value is set to what it was previously
          value: responseHasCurrentBridgeId ? String(currentBridgeId) : null
        }, { silent: true });

        if (firstEmptyBridgeId) {
          this.availableBridgesModel.set('value', firstEmptyBridgeId, { silent: false });
        }
        dfd.resolve(response);
      }).fail(dfd.reject);

    return dfd.promise();
  },



});