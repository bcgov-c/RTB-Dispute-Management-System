import React from 'react';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import ScheduleRequestModel from '../../components/scheduling/schedule-requests/ScheduleRequest_model';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './MyScheduleRequestModal.scss';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');
const loaderChannel = Radio.channel('loader');
const userChannel = Radio.channel('users');
const schedulingChannel = Radio.channel('scheduling');

const DATE_START_AFTER_END_TIME_ERROR = 'Start date and time must be before end date and time';
const DATE_START_AFTER_NOW_TIME_ERROR = 'Start date and time must be after current date and time';
const DATE_ALREADY_REQUESTED_ERROR = 'You already have an open request that overlaps with request timeframe. Please set this request to not overlap with an existing request or edit your previous request';
const WORKING_BLOCK_DAY_ERROR = 'Working blocks cannot exceed one working day';

const MyScheduleRequestModal = ModalBaseView.extend({
  id: 'myScheduleRequest_modal',

  initialize(options) {
    this.mergeOptions(options, ['viewMode', 'isManagerRequest']);
    this.template = this.template.bind(this);
    this.setupVars();
    this.createSubModels();
    this.setupListeners();
    this.setDuration();

    loaderChannel.trigger('page:load');
    this.loadAllUserScheduleRequests().then((requests) => {
      this.allUserRequests = requests;
    }).finally(() => loaderChannel.trigger('page:load:complete'));
  },

  setupVars() {
    this.SCHED_BLOCK_MIN_DURATION_HOURS = configChannel.request('get', 'SCHED_BLOCK_MIN_DURATION_HOURS');
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    this.currentUser = sessionChannel.request('get:user');
    this.duration = null;
    this.displayDateError = false;
    this.dateErrorText = DATE_START_AFTER_END_TIME_ERROR;
    this.model = this.model || new ScheduleRequestModel({});
    this.viewMode = this.viewMode || 'edit';
  },

  createSubModels() {
    const loggedInUserId = String(this.currentUser.id);
    const requesterOptionData = this._getScheduleRequesterOptions();
    const isUserIdInOptionData = requesterOptionData.some(arb => arb.value === loggedInUserId);
    const maxStartTime = Moment(this.HEARING_MAX_BOOKING_TIME, InputModel.getTimeFormat()).subtract(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');
    const minEndTime = Moment(this.HEARING_MIN_BOOKING_TIME, InputModel.getTimeFormat()).add(this.SCHED_BLOCK_MIN_DURATION_HOURS, 'hours');
    
    this.scheduleRequesterModel = new DropdownModel({
      labelText: 'Request By',
      optionData: requesterOptionData,
      value: isUserIdInOptionData ? loggedInUserId : null,
      required: this.isManagerRequest || false,
      defaultBlank: true,
      apiMapping: 'request_submitter'
    });

    this.requestTypeModel = new DropdownModel({
      labelText: 'Request Type',
      optionData: this._getScheduleRequestTypes(),
      value: this.model.get('request_type') ? String(this.model.get('request_type')) : null,
      required: true,
      apiMapping: 'request_type'
    });

    this.requestStartDateModel = new InputModel({
      labelText: 'Start of Request Period',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
      value: null,
      minDate: Moment(),
    });

    this.requestStartTimeModel = new InputModel({
      labelText:' ',
      errorMessage: 'Enter start time',
      inputType: 'time',
      required: true,
      minTime: this.HEARING_MIN_BOOKING_TIME,
      maxTime: maxStartTime,
      value: null
    });

    this.requestEndDateModel = new InputModel({
      labelText: 'End of Request Period',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
      value: null,
      minDate: Moment(),
    });

    this.requestEndTimeModel = new InputModel({
      labelText: ' ',
      errorMessage: 'Enter end time',
      inputType: 'time',
      minTime: minEndTime,
      maxTime: this.HEARING_MAX_BOOKING_TIME,
      value: null,
      required: true,
    });

    this.requestDescriptionModel = new TextareaModel({
      labelText: 'Description of Request',
      errorMessage: 'Description is required',
      max: 500,
      countdown: true,
      required: true,
      value: this.model.get('request_description') ? this.model.get('request_description') : null,
      apiMapping: 'request_description',
    })
  },

  setupListeners() {
    const refreshFn = () => {
      if (this.validateDateAndTime()) this.setDuration();
      this.displayDateError = false;
      this.render();
    }

    this.listenTo(this.requestTypeModel, 'change:value', (model, value) => {
      const requesterOptions = this._getScheduleRequesterOptions({ arbLeadOnly: Number(value) === configChannel.request('get', 'SCHED_REQ_TYPE_SCHEDULE_ADJUSTMENT') });
      this.scheduleRequesterModel.set({ optionData: requesterOptions }, { silent: true });
      refreshFn();
    });

    this.listenTo(this.requestStartDateModel, 'change:value', () => {
      refreshFn()
    });
    this.listenTo(this.requestStartTimeModel, 'change:value', () => {
      refreshFn()
    });
    this.listenTo(this.requestEndDateModel, 'change:value', () => {
      refreshFn()
    });
    this.listenTo(this.requestEndTimeModel, 'change:value', () => {
      refreshFn()
    });
  },

  loadAllUserScheduleRequests() {
    const fullCount = 999990;
    const scheduleRequestParams = { index: 0, count: fullCount }
    if (!this.isManagerRequest) Object.assign(scheduleRequestParams, { RequestSubmitters: this.getSelectedRequesterId() })
    return schedulingChannel.request('load:requests', scheduleRequestParams)
  },

  hasOverlappingRequests() {
    const startDate = this.model.isNew() ? Moment.tz(`${this.requestStartDateModel.getData({ format: 'date' })}T${this.requestStartTimeModel.getData({ iso: true })}`, this.RTB_OFFICE_TIMEZONE_STRING) : Moment(this.model.get('request_start'));
    const endDate = this.model.isNew() ? Moment.tz(`${this.requestEndDateModel.getData({ format: 'date' })}T${this.requestEndTimeModel.getData({ iso: true })}`, this.RTB_OFFICE_TIMEZONE_STRING) : Moment(this.model.get('request_end'));
    const overlappingRequests = this.allUserRequests.filter(request => (
      (
        (startDate.isSameOrAfter(Moment(request.get('request_start'))) && startDate.isBefore(Moment(request.get('request_end'))))
        || (endDate.isAfter(Moment(request.get('request_start'))) && endDate.isSameOrBefore(Moment(request.get('request_end'))))
        || (startDate.isSameOrBefore(Moment(request.get('request_start'))) && endDate.isSameOrAfter(Moment(request.get('request_end'))))
      )
      && (request.isStatusRequiringAction() || request.isReturnedForClarification())
      && (request.get('request_submitter') && request.get('request_submitter') === this.getSelectedRequesterId())
      && !request.isTypeScheduleAdjustment()
    ));
    return !!overlappingRequests.length;
  },

  validateDateAndTime() {
    let isValid = true;
    const timeAndDateRegions = ['scheduleRequestStartDateRegion', 'scheduleRequestStartTimeRegion', 'scheduleRequestEndDateRegion', 'scheduleRequestEndTimeRegion'];
    (timeAndDateRegions || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
        view.removeErrorStyles();
      }
    });
    return isValid;
  },

  validateAndShowErrors() {
    let isValid = true;
    this.displayDateError = false;
    const regionsToValidate = ['scheduleRequestRequesterRegion', 'scheduleRequestTypeRegion', 'scheduleRequestStartDateRegion', 'scheduleRequestStartTimeRegion', 'scheduleRequestEndDateRegion', 'scheduleRequestEndTimeRegion', 'scheduleRequestDescriptionRegion']; 

    const startDate = Moment(`${this.requestStartDateModel.getData({ format: 'date' })}T${this.requestStartTimeModel.getData({ iso: true })}`);
    const endDate = Moment(`${this.requestEndDateModel.getData({ format: 'date' })}T${this.requestEndTimeModel.getData({ iso: true })}`);
    const isOverlapping = this.model.isNew() ? this.hasOverlappingRequests(startDate, endDate) : false;
    const isDailySelected = (configChannel.request('get', 'SCHED_REQ_TYPE_DAILY_CODES') || []).includes(this.requestTypeModel.getData({ parse: true }));
    const hasValidDates = startDate.isValid() && endDate.isValid();
    const requestType = this.requestTypeModel.getData();

    if (isOverlapping && Number(requestType) !== configChannel.request('get', 'SCHED_REQ_TYPE_SCHEDULE_ADJUSTMENT')) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = DATE_ALREADY_REQUESTED_ERROR;
      this.render();
    } else if (hasValidDates && !startDate.isBefore(endDate)) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = DATE_START_AFTER_END_TIME_ERROR;
      this.render();
    } else if (hasValidDates && startDate.isBefore(Moment())) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = DATE_START_AFTER_NOW_TIME_ERROR;
      this.render();
    } else if (hasValidDates && isDailySelected && startDate.day() !== endDate.day()) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = WORKING_BLOCK_DAY_ERROR;
      this.render();
    } else if (hasValidDates && endDate.diff(startDate, 'minutes') < (this.SCHED_BLOCK_MIN_DURATION_HOURS*60) ) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = `Requests must be at least ${this.SCHED_BLOCK_MIN_DURATION_HOURS} hour${this.SCHED_BLOCK_MIN_DURATION_HOURS===1?'':'s'} in duration`;;
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

  setDuration() {
    const startDate = Moment(`${this.requestStartDateModel.getData({ format: 'date' })}T${this.requestStartTimeModel.getData({ iso: true })}`).toISOString();
    const endDate = Moment(`${this.requestEndDateModel.getData({ format: 'date' })}T${this.requestEndTimeModel.getData({ iso: true })}`).toISOString();
    const duration = startDate && endDate ? Formatter.toDurationFromSecs(Moment(endDate).diff(Moment(startDate), 'seconds')) : '-';

    this.duration = duration;
  },

  getSelectedRequesterId() {
    return this.isManagerRequest ? this.scheduleRequesterModel.getData({ parse: true })
      : this.model.get('request_submitter') ? this.model.get('request_submitter')
      : this.currentUser.id;
  },

  _getScheduleRequesterOptions(options={ arbLeadOnly: false }) {
    const arbLeadOnly = options.arbLeadOnly; 
    const activeArbs = userChannel.request('get:arbs', { all: true }).filter(user => user.isActive() && (arbLeadOnly ? user.isArbitratorLead() : true));

    return _.sortBy(_.map(activeArbs, (arbitrator) => {
      return { text: `${Formatter.toUserLevelDisplay(arbitrator)}: ${arbitrator.getDisplayName()}`, value: String(arbitrator.id) };
    }), function(option) { return ((option.isActive && option.text) || 'zzzz').toLowerCase(); });
  },

  _getScheduleRequestTypes() {
    const SCHED_REQ_ARB_REQUEST_CODES = configChannel.request('get', 'SCHED_REQ_ARB_REQUEST_CODES') || [];
    const SCHED_REQ_MANAGER_REQUEST_CODES = configChannel.request('get', 'SCHED_REQ_MANAGER_REQUEST_CODES') || [];
    const SCHEDULE_REQUEST_TYPE_DISPLAY = configChannel.request('get', 'SCHEDULE_REQUEST_TYPE_DISPLAY') || {};
    return [
      ...SCHED_REQ_ARB_REQUEST_CODES.map(code => ({ value: String(code), text: SCHEDULE_REQUEST_TYPE_DISPLAY[code] })),
      ...(this.isManagerRequest ? SCHED_REQ_MANAGER_REQUEST_CODES.map(code => ({ value: String(code), text: SCHEDULE_REQUEST_TYPE_DISPLAY[code] })) : [])
    ];
  },

  submitRequest() {
    if (!this.validateAndShowErrors()) return;
    
    const startDate = Moment(`${this.requestStartDateModel.getData({ format: 'date' })}T${this.requestStartTimeModel.getData({ iso: true })}`).toISOString();
    const endDate = Moment(`${this.requestEndDateModel.getData({ format: 'date' })}T${this.requestEndTimeModel.getData({ iso: true })}`).toISOString();
    const submitterId = this.getSelectedRequesterId();
    const requestType = this.requestTypeModel.getData();
    const requestDescription = this.requestDescriptionModel.getData();
    const requestStatus = configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED');

    if (this.model.isNew()) {
      this.model.set({
        request_type: requestType,
        request_description: requestDescription,
        request_submitter: submitterId,
        request_start: startDate,
        request_end: endDate,
        request_status: requestStatus
      });
    } else {
      this.model.set({
        request_type: requestType,
        request_description: requestDescription,
        ...(this.model.get('request_status') === configChannel.request('get', 'SCHED_REQ_STATUS_RETURNED_FOR_CLARIFICATION')) && { request_status: configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED') },
      })
    }

    const scheduleRequestPromise = new Promise((res, rej) => this.model.save(this.model.getApiChangesOnly()).then(res, generalErrorFactory.createHandler(this.model.id ? 'SCHEDULE.REQUEST.SAVE':'SCHEDULE.REQUEST.SUBMIT', rej)));

    loaderChannel.trigger('page:load');
    scheduleRequestPromise.finally(() => {
      this.close();
      loaderChannel.trigger('page:load:complete')
    });
  },

  onRender() {
    if (this.isManagerRequest) {
      this.showChildView('scheduleRequestRequesterRegion', new DropdownView({ model: this.scheduleRequesterModel }))
    }
    this.showChildView('scheduleRequestTypeRegion', new EditableComponentView({
      state: this.viewMode,
      label: this.viewMode === 'edit' ? 'Request Type' : 'Type',
      view_value: configChannel.request('get', 'SCHEDULE_REQUEST_TYPE_DISPLAY')[this.requestTypeModel.getData()],
      subView: new DropdownView({ model: this.requestTypeModel })
    }));
    
    if (this.viewMode === 'edit' && this.model.isNew()) {
      this.showChildView('scheduleRequestStartDateRegion', new InputView({ model: this.requestStartDateModel }));
      this.showChildView('scheduleRequestStartTimeRegion', new InputView({ model: this.requestStartTimeModel }));
      this.showChildView('scheduleRequestEndDateRegion', new InputView({ model: this.requestEndDateModel }));
      this.showChildView('scheduleRequestEndTimeRegion', new InputView({ model: this.requestEndTimeModel }));
    }

    this.showChildView('scheduleRequestDescriptionRegion', new EditableComponentView({
      state: this.viewMode,
      label: 'Description of Request',
      view_value: this.requestDescriptionModel.getData(),
      subView: new TextareaView({ model: this.requestDescriptionModel })
    }));
  },

  regions: {
    scheduleRequestRequesterRegion: '.schedule-request-modal__requester',
    scheduleRequestTypeRegion: '.schedule-request-modal__type',
    scheduleRequestStartDateRegion: '.schedule-request-modal__start-date',
    scheduleRequestStartTimeRegion: '.schedule-request-modal__start-time',
    scheduleRequestEndDateRegion: '.schedule-request-modal__end-date',
    scheduleRequestEndTimeRegion: '.schedule-request-modal__end-time',
    scheduleRequestDescriptionRegion: '.schedule-request-modal__description',
  },

  template() {
    const requesterUser = userChannel.request('get:user', this.getSelectedRequesterId());
    const requesterName = requesterUser?.getDisplayName();
    const createdDate = this.model.get('created_date') ? Formatter.toDateAndTimeDisplay(this.model.get('created_date')) : '-';
    const modifiedDate = this.model.get('modified_date') ? Formatter.toDateAndTimeDisplay(this.model.get('modified_date')) : '-';
    const modifiedBy = this.model.get('modified_by') ? userChannel.request('get:user:name', this.model.get('modified_by')) : null;
    const requestProcessedBy = this.model.get('request_owner') ?  userChannel.request('get:user:name', this.model.get('request_owner')) : '-';
    const modalTitle = this.isManagerRequest ? 'Add Schedule Request' :
      this.model.isNew() ? 'Submit Schedule Request' :
      this.viewMode === 'edit' ? 'Resubmit Schedule Request' : 
      'View Schedule Request'
    const modalSubmitText = this.isManagerRequest ? 'Create Request' :
      this.model.isNew() ? 'Submit Request' : 
      'Resubmit Request'

    return (
      <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">{modalTitle}</h4>
          <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
        </div>
        <div className="modal-body">
          <div className="schedule-request-modal__top-wrapper">

            <div>
              {this.renderJsxRequester(requesterName)}
              <div className="schedule-request-modal__type"></div>
            </div>

            <div className="schedule-request-modal__top-wrapper__dates">
              <div className="">
                <label className="review-label">Created:</label>&nbsp;
                <span>{createdDate} {createdDate !== '-' ? `- ${requesterName}` : null}</span>
              </div>
              <div className="">
                <label className="review-label">Modified:</label>&nbsp;
                <span>{modifiedDate} {modifiedDate !== '-' ? `- ${modifiedBy}` : null}</span>
              </div>
            </div>

          </div>
          <div className="schedule-request-modal__request-time">
            {this.renderJsxRequestTime()}
          </div>
          {this.displayDateError ? <p className="error-block">{this.dateErrorText}</p> : null}
          <div className="schedule-request-modal__description"></div>

          <div className="">
            <label className="review-label">Being processed by:</label>&nbsp;
            <span>{requestProcessedBy}</span>
          </div>

          <div className="button-row">
            <div className="float-right">
              <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>{this.viewMode === 'edit' ? 'Cancel' : 'Close' }</span></button>
              {this.viewMode === 'edit' ? <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.submitRequest()}>{modalSubmitText}</button> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  },

  renderJsxRequester(requesterName) {
    if (this.isManagerRequest) return <div className="schedule-request-modal__requester"></div>
    return (
      <div className="">
        <label className="review-label">Requester:</label>&nbsp;
        <span><b>{requesterName}</b></span>
      </div>
    );
  },

  renderJsxRequestTime() {
    const requestStartDate = this.model.get('request_start') ? Formatter.toDateAndTimeDisplay(this.model.get('request_start')) : '-';
    const requestEndDate = this.model.get('request_end') ? Formatter.toDateAndTimeDisplay(this.model.get('request_end')) : '-';
    const requestStatus = this.model.get('request_status') ? Formatter.toScheduleRequestStatusDisplay(this.model.get('request_status')) : '-';
    const requestNote = this.model.get('request_note') ? this.model.get('request_note') : '-';
    const duration = this.model.get('request_start') &&  this.model.get('request_end') ? Formatter.toDurationFromSecs(Moment(this.model.get('request_end')).diff(Moment(this.model.get('request_start')), 'seconds')) : '-';
    
    if (this.viewMode === 'edit' && this.model.isNew()) {
      return (
        <>
          <div className="schedule-request-modal__start-date"></div>
          <div className="schedule-request-modal__start-time"></div>
          <span className="schedule-request-modal__to">&nbsp;to&nbsp;</span>
          <div className="schedule-request-modal__end-date"></div>
          <div className="schedule-request-modal__end-time"></div>
          <div className="schedule-request-modal__duration">
            <label className="review-label">Duration:</label>&nbsp;
            <span>{this.duration}</span>
          </div>
        </>
      )
    } else {
      return (
        <div className="schedule-request-modal__edit-info">
          <div className="">
            <label className="review-label">Request Timeframe:</label>&nbsp;
            <span>{requestStartDate} - {requestEndDate} ({duration})</span>
          </div>
          <div className="">
            <label className="review-label">Status:</label>&nbsp;
            <span>{requestStatus}</span>
          </div>
          <div className="schedule-request-modal__processing-note">
            <label className="review-label">Processing note:</label>&nbsp;
            <span>{requestNote}</span>
          </div>
        </div>
      )
    }
  }
});

_.extend(MyScheduleRequestModal.prototype, ViewJSXMixin);
export default MyScheduleRequestModal;