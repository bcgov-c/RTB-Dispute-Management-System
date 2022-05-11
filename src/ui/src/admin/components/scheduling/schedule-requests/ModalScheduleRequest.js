import Backbone from 'backbone';
import React from 'react';
import Radio from 'backbone.radio';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import SchedulingAutoActions from '../../../../core/components/auto-actions/SchedulingAutoActions';
import AutoInsertIcon from '../../../static/Icon_WS_AutoInsert.png';
import './ModalScheduleRequest.scss';

const AUTO_INSERT_ERROR_MSG = `Auto Insert not available`;

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const userChannel = Radio.channel('users');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const schedulingChannel = Radio.channel('scheduling');

const ManageScheduleRequestModal = ModalBaseView.extend({
  id: 'managerScheduleRequest_modal',

  initialize() {
    this.template = this.template.bind(this);
    this.userList = userChannel.request('get:all:users');
    this.currentUser = sessionChannel.request('get:user');
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.requestProcessedByModel = new DropdownModel({
      labelText: 'Being processed by',
      optionData: this._getProcessedByList(),
      value: this.model.get('request_owner') ? String(this.model.get('request_owner')) : null,
      errorMessage: 'User must be selected',
      required: true,
      defaultBlank: true,
      apiMapping: 'request_owner',
      customLink: 'Assign to me',
      customLinkFn: () => {
        this.requestProcessedByModel.set({ value: String(this.currentUser.id) })
          .trigger('render');
      }
    });

    this.requestStatusModel = new DropdownModel({
      labelText: 'Status',
      optionData: this._getScheduleRequestStatuses(),
      value: this.model.get('request_status') ? String(this.model.get('request_status')) : null,
      required: true,
      apiMapping: 'request_status'
    });

    this.requestProcessingNoteModel = new TextareaModel({
      labelText: 'Processing Note',
      max: 500,
      countdown: true,
      required: false,
      cssClass: 'optional-input',
      value: this.model.get('request_note') ? this.model.get('request_note') : null,
      apiMapping: 'request_note',
    });
  },

  setupListeners() {
    [this.requestProcessedByModel, this.requestStatusModel].forEach(model => {
      this.listenTo(model, 'change:value', () => {
        this.autoInsertError = false;
        this.render();
      });
    })
  },

  validateAndShowErrors() {
    let isValid = true;
    const regionsToValidate = ['processedByRegion', 'statusRegion'];

    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    return isValid;
  },

  saveRequest() {
    if (!this.validateAndShowErrors()) return;

    loaderChannel.trigger('page:load');
    this.model.set({
      request_status: this.requestStatusModel.getData(),
      request_owner: this.requestProcessedByModel.getData(),
      request_note: this.requestProcessingNoteModel.getData()
    })

    this.model.save(this.model.getApiChangesOnly())
      .done(() => this.model.trigger('save:complete'))
      .fail(generalErrorFactory.createHandler('SCHEDULE.REQUEST.SAVE'))
      .always(() => this.close())
  },

  _getScheduleRequestStatuses() {
    return Object.entries(configChannel.request('get', 'SCHEDULE_REQUEST_STATUS_DISPLAY'))
    .map(([key, value]) => ({ value: String(key), text: value}) )
    .filter((configVal) => {
      if (Moment(this.model.get('request_start')).isBefore(Moment()) && Number(configVal.value) === configChannel.request('get', 'SCHED_REQ_STATUS_RETURNED_FOR_CLARIFICATION')) return false;
      return true;
    });
  },

  _getProcessedByList() {
    const userScheduleManagerList = this.userList.filter(user => user.get('schedule_manager')).map(obj => {
      return { text: obj.get('name'), value: String(obj.get('user_id')) }
    });

    return [...userScheduleManagerList];
  },

  canViewAutoInsertRequest() {
    const hasCorrectType = !!this.model.getScheduleBlockType();
    const hasCorrectStatus = this.model.isStatusRequiringAction();
    const hasCorrectDates = Moment(this.model.get('request_end')).isAfter(Moment());
    return hasCorrectType && hasCorrectStatus && hasCorrectDates;
  },

  goToPeriod(periodId) {
    Backbone.history.navigate(`schedule-manager/working/${periodId}`, { trigger: true});
    this.close();
  },

  getAssociatedPeriodsHtml() {
    const periods = schedulingChannel.request('get:periods');
    const requestStart = Moment(this.model.get('request_start'));
    const requestEnd = Moment(this.model.get('request_end'));
    const associatedPeriods = periods.getPeriodsInDateRange(requestStart, requestEnd);
    const associatedPeriodHtml = associatedPeriods.map((period, index) => <span className="general-link" onClick={() => this.goToPeriod(period.get('schedule_period_id'))}>{Formatter.toDateDisplay(period.get('period_start'))}{associatedPeriods.length-1 > index ? ', ' : ''}</span>);
    return associatedPeriods.length ? associatedPeriodHtml : <span>-</span>;
  },

  autoInsert() {
    this.autoInsertError = null;
    SchedulingAutoActions.checkAutoActionSchedulingConflicts(this.model)
      .then(() => {
        // Hide the modal so the generate progress modal can be shown
        this.$el.hide();
        return SchedulingAutoActions.startAutoApproveAndScheduleRequest(this.model)
      }, extraErrorText => {
        this.autoInsertError = `${AUTO_INSERT_ERROR_MSG}${extraErrorText ? `: ${extraErrorText}` : ''}`;
      })
      .then(() => {
        if (this.autoInsertError) {
          this.render();
        } else {
          this.$el.show();
          this.close();
        }
      }, err => {
        console.log(err);
        this.$el.show();
        this.close();
      });
  },

  onRender() {
    this.showChildView('processedByRegion', new DropdownView({ model: this.requestProcessedByModel }))
    this.showChildView('statusRegion', new DropdownView({ model: this.requestStatusModel }))
    this.showChildView('processingNoteRegion', new TextareaView({ model: this.requestProcessingNoteModel }))
  },

  regions: {
    processedByRegion: '.sm-request-modal__processed-by',
    statusRegion: '.sm-request-modal__status',
    processingNoteRegion: '.sm-request-modal__processing-note',
  },

  template() {
    const requestType = this.model.get('request_type') ? configChannel.request('get', 'SCHEDULE_REQUEST_TYPE_DISPLAY')[this.model.get('request_type')] : '-';
    const requesterName = this.model.get('request_submitter') ? userChannel.request('get:user:name', this.model.get('request_submitter')) : sessionChannel.request('name');
    const createdDate = this.model.get('created_date') ? Formatter.toDateAndTimeDisplay(this.model.get('created_date')) : '-';
    const modifiedDate = this.model.get('modified_date') ? Formatter.toDateAndTimeDisplay(this.model.get('modified_date')) : '-';
    const modifiedBy = this.model.get('modified_by') ? userChannel.request('get:user:name', this.model.get('modified_by')) : '-';
    const requestStartDate = this.model.get('request_start') ? Formatter.toDateAndTimeDisplay(this.model.get('request_start')) : '-';
    const requestEndDate = this.model.get('request_end') ? Formatter.toDateAndTimeDisplay(this.model.get('request_end')) : '-';
    const duration = this.model.get('request_start') &&  this.model.get('request_end') ? Formatter.toDurationFromSecs(Moment(this.model.get('request_end')).diff(Moment(this.model.get('request_start')), 'seconds')) : '-';
    const requestDescription = this.model.get('request_description') ? this.model.get('request_description') : '-';

    return (
      <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
            <h4 className="modal-title">Manage Schedule Requests</h4>
            <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
        </div>
        <div className="modal-body">
          <div className="sm-request-modal__top-wrapper">
            <div className="sm-request-modal__top-wrapper__left-data">
              <div>
                <label className="review-label">Type:</label>&nbsp;
                <span><b>{requestType}</b></span>
              </div>

              <div>
                <label className="review-label">Requester:</label>&nbsp;
                <span><b>{requesterName}</b></span>
              </div>
            </div>

            <div className="sm-request-modal__top-wrapper__dates">
              <div>
                <label className="review-label">Created:</label>&nbsp;
                <span>{createdDate} {createdDate !== '-' ? `- ${requesterName}` : null}</span>
              </div>
              <div>
                <label className="review-label">Modified:</label>&nbsp;
                <span>{modifiedDate} {modifiedDate !== '-' ? `- ${modifiedBy}` : null}</span>
              </div>
            </div>
          </div>

          <div className="manager-request-modal__request-timeframe">
            <label className="review-label">Request Timeframe:</label>&nbsp;
            <span>{requestStartDate} - {requestEndDate}{/*duration*/}</span>
          </div>

          {/* <div className="">
            <label className="review-label">Associated Periods:</label>&nbsp;
            <span>{this.getAssociatedPeriodsHtml()}</span>
          </div> */}

          <div className="manager-request-modal__request-description">
            <label className="review-label">Request description:</label>&nbsp;
            <span>{requestDescription}</span>
          </div>

          <div className="sm-request-modal__processed-by"></div>
          <div className="sm-request-modal__status"></div>
          <div className="sm-request-modal__processing-note"></div>
          <div className="button-row">
            <div className="sm-request-modal__buttons float-right">
              {this.renderJsxAutoInsert()}
              <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Cancel</span></button>
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.saveRequest()}>Save Request</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  },

  renderJsxAutoInsert() {
    if (!this.canViewAutoInsertRequest()) return;
    return <div className="sm-request-modal__auto-insert">
      {this.autoInsertError ? <span className="error-red">{this.autoInsertError}</span> : null}
      <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.autoInsert()}>
        <img src={AutoInsertIcon} />
        Approve and Auto Insert
      </button>
    </div>;
  },
})

_.extend(ManageScheduleRequestModal.prototype, ViewJSXMixin);
export default ManageScheduleRequestModal;