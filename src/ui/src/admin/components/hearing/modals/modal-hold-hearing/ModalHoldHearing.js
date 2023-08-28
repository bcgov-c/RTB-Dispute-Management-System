/**
 * @fileoverview - Modal that allows for a hearing to be put on a permanent or temporary hold, as well as holding it for a dispute
 */
import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import RadioView from '../../../../../core/components/radio/Radio';
import RadioModel from '../../../../../core/components/radio/Radio_model';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import './ModalHoldHearing.scss';

const Formatter = Radio.channel('formatter').request('get');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');
const searchChannel = Radio.channel('searches');
const configChannel = Radio.channel('config');

const PERMANENT_HOLD_RADIO_VALUE = 0;
const TEMPORARY_HOLD_RADIO_VALUE = 1;

const ModalHoldHearing = ModalBaseView.extend({
  id: 'addHearing_modal',
  /**
   * @param {HearingModel} model
   */
  initialize() {
    this.template = this.template.bind(this);
    this.selectedDisputeGuid = null;
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const minStartTime = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    const maxStartTime = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    
    this.holdTypeModel = new RadioModel({
      optionData: [
        { value: PERMANENT_HOLD_RADIO_VALUE, text: 'Permanent Hold' },
        { value: TEMPORARY_HOLD_RADIO_VALUE, text: 'Temporary Hold' },
      ],
      value: PERMANENT_HOLD_RADIO_VALUE
    });

    this.dmsInputModel = new InputModel({
      inputType: 'dispute_number',
      labelText: 'DMS File Number',
      errorMessage: 'Enter a DMS File Number',
      maxLength: 9,
      required: false,
      cssClass:'optional-input'
    });

    this.holdUntilDateModel = new InputModel({
      labelText: 'Hold Until Date',
      errorMessage: 'Enter hold date',
      inputType: 'date',
      allowFutureDate: true,
      required: false,
      minDate: Moment().add(1, 'day'),
      value: Moment().add(1, 'day')
    });

    this.holdUntilTimeModel = new InputModel({
      labelText: 'Hold Until Time',
      errorMessage: 'Enter hold time',
      inputType: 'time',
      required: false,
      minTime: minStartTime,
      maxTime: maxStartTime,
      value: null
    });
  },

  setupListeners() {
    this.listenTo(this.holdTypeModel, 'change:value', (model, value) => {
      this.holdUntilDateModel.set({ required: value === TEMPORARY_HOLD_RADIO_VALUE });
      this.holdUntilTimeModel.set({ required: value === TEMPORARY_HOLD_RADIO_VALUE });
      this.render();
    });
  },

  validateAndShowErrors() {
    let isValid = true;
    const regionsToValidate = ['dmsInputRegion','holdUntilDateRegion','holdUntilTimeRegion'];

    regionsToValidate.forEach((region) => {
      const component = this.getChildView(region);
      if (component) {
        isValid = isValid & component.validateAndShowErrors();
      }
    });
    
    return isValid;
  },

  clickSaveWithStateCheck() {
    const dmsInputView = this.getChildView('dmsInputRegion');
    const fileNumber = this.dmsInputModel.getData({ parse: true });
    const holdType = this.holdTypeModel.getData();
    if (!dmsInputView.validateAndShowErrors() || !this.validateAndShowErrors()) {
      return;
    }

    if (this.model.getDisputeHearings().findWhere({ hearing_id: fileNumber })) {
      dmsInputView.showErrorMessage("File already linked");
      return;
    }

    const showInvalidHearingStateModal = () => {
      hearingChannel.request('show:invalid:modal').finally(() => {
        this.model.trigger('hearings:refresh')
        this.close();
      });
    };
    const onStateCheckError = () => {
      this.model.trigger('hearings:refresh')
      this.close();
    };
    this.model.withStateCheck(
      () => this.holdHearing(fileNumber, holdType),
      showInvalidHearingStateModal.bind(this),
      onStateCheckError.bind(this)
    );
  },

  async holdHearing(fileNumber, holdType) {
    var params = {};
    if (fileNumber) {
      const validFileNumbers = await this.checkFileNumber(fileNumber);
      if (!validFileNumbers?.length) return;
      params.HearingReservedDisputeGuid = this.selectedDisputeGuid;
    }
    if (this.holdTypeModel.getData() === TEMPORARY_HOLD_RADIO_VALUE) {
      const timezoneStr = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
      const dateStr = Moment.tz(`${this.holdUntilDateModel.getData({ format: 'date' })}T${this.holdUntilTimeModel.getData({ iso: true })}`, timezoneStr).toISOString();
      params.HearingReservedUntil = dateStr
    }

    loaderChannel.trigger('page:load')
    return new Promise((res, rej) => hearingChannel.request('reserve:hearing', this.model.id, params).then(
      res, generalErrorFactory.createHandler('HEARING.RESERVATION', rej)))
    .finally(() => {
      this.model.trigger('hearings:refresh');
      this.close();
      loaderChannel.trigger('page:load:complete')
    });
  },

  async checkFileNumber(fileNumber) {
      return searchChannel.request('search:dispute', fileNumber).done(dispute => {
        if (!dispute?.[0]) {
          const dmsInputView = this.getChildView('dmsInputRegion');
          dmsInputView.showErrorMessage("Invalid DMS File Number");
        } else {
          this.selectedDisputeGuid = dispute[0].dispute_guid;
        }
      }).fail(err => {
        generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
      }).always(() => loaderChannel.trigger('page:load:complete'));
  },

  regions: {
    holdTypeRegion: '.hold-hearing__hold-type',
    dmsInputRegion: '.hold-hearing__dms-input',
    holdUntilDateRegion: '.hold-hearing__hold-hearing-date',
    holdUntilTimeRegion: '.hold-hearing__hold-hearing-time'
  },

  onRender() {
    this.showChildView('holdTypeRegion', new RadioView({ model: this.holdTypeModel }));
    this.showChildView('dmsInputRegion', new InputView({ model: this.dmsInputModel }));

    if (this.holdTypeModel.getData() === TEMPORARY_HOLD_RADIO_VALUE) {
      this.showChildView('holdUntilDateRegion', new InputView({ model: this.holdUntilDateModel }));
      this.showChildView('holdUntilTimeRegion', new InputView({ model: this.holdUntilTimeModel }));
    }
  },

  template() {
    const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const hearingDateTimeDisplay = `${Moment.tz(this.model.get('local_start_datetime'), RTB_OFFICE_TIMEZONE_STRING).format('ddd, MMM D, YYYY - h:mmA')} - ${
      Moment.tz(this.model.get('local_end_datetime'), RTB_OFFICE_TIMEZONE_STRING).format('h:mmA')}`;
    const hearingType = this.model.get('hearing_type');
    const hearingPriority = this.model.get('hearing_priority');
    const hearingOwner = this.model.get('hearing_owner');

    return (
      <div className="modal-dialog bulk-upload-documents">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Hold Hearing</h4>
             <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
          </div>
          <div className="modal-body clearfix hold-hearing">
            <div>
              <label className="review-label">Hearing:</label>&nbsp;<span>{hearingDateTimeDisplay}</span>
            </div>
            <div>
              <label className="review-label">Type:</label>&nbsp;<span>{Formatter.toHearingTypeDisplay(hearingType)}</span>
            </div>
            <div>
              <label className="review-label">Priority:</label>&nbsp;<span dangerouslySetInnerHTML={{ __html: Formatter.toUrgencyDisplay(hearingPriority, { urgencyColor: true }) }}></span>
            </div>
            <div>
              <label className="review-label">Assigned To:</label>&nbsp;<span>{hearingOwner ? Formatter.toUserDisplay(hearingOwner) : '-'}</span>
            </div>
            <p className="hold-hearing__description">
              Select the type of hold you want and add an optional dispute file number. A temporary hold will be released on
              the date and time you set. Held hearings with a field number will appear in the hearings view of the dispute file.
            </p>
            <div className="hold-hearing__hold-type"></div>
            <div className="hold-hearing__date-select-wrapper">
              <div className="hold-hearing__hold-hearing-date"></div>
              <div className="hold-hearing__hold-hearing-time"></div>
            </div>
            <div className="hold-hearing__dms-input"></div>
            <div className="button-row">
              <div className="pull-right">
                <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Cancel</span></button>
                <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.clickSaveWithStateCheck()}>Hold Hearing</button>
              </div>
            </div>
        </div>
        </div>
      </div>
    );
  }
});

_.extend(ModalHoldHearing.prototype, ViewJSXMixin);
export default ModalHoldHearing;