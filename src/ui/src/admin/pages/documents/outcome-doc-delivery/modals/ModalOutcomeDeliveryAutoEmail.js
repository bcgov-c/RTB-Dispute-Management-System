import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import Dropdown_model from '../../../../../core/components/dropdown/Dropdown_model';
import Dropdown from '../../../../../core/components/dropdown/Dropdown';
import Formatter from '../../../../../core/components/formatter/Formatter';
import './ModalOutcomeDeliveryAutoEmail.scss';

const AUTOMATIC_DROPDOWN_CODE = '1';
const MANUAL_DROPDOWN_CODE = '2';
const TOMORROW_DROPDOWN_CODE = '1';
const IMMEDIATELY_DROPDOWN_CODE = '2';

const configChannel = Radio.channel('config');

const ModalOutcomeDeliveryAutoEmail = ModalBaseView.extend({
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['showEmailWarning']);
    this.createSubModels();
    this.setupListeners();
  },
  
  createSubModels() {
    this.methodModel = new Dropdown_model({
      optionData: [{ value: AUTOMATIC_DROPDOWN_CODE, text: 'Automatic Delivery' },
        { value: MANUAL_DROPDOWN_CODE, text: 'Manual Delivery' }
      ],
      labelText: 'Send Method',
      defaultBlank: false,
      required: true,
      value: AUTOMATIC_DROPDOWN_CODE,
    });
    this.timeModel = new Dropdown_model({
      optionData: [{ value: TOMORROW_DROPDOWN_CODE, text: `Tomorrow: ${Formatter.toDateAndTimeDisplay(this.getTomorrowEmailTime())}` },
        { value: IMMEDIATELY_DROPDOWN_CODE, text: `Immediately` }
      ],
      labelText: 'Send Time',
      defaultBlank: false,
      required: true,
      value: TOMORROW_DROPDOWN_CODE,
    });
  },

  setupListeners() {
    this.listenTo(this.methodModel, 'change:value', () => this.render());
  },

  getTomorrowEmailTime() {
    return Moment.tz(Moment(), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING')).add(1, 'day').hour(12).minute(0).second(0);
  },

  isManualDeliverySelected() {
    return this.methodModel.getData() === MANUAL_DROPDOWN_CODE;
  },

  isImmediateDeliverySelected() {
    return this.timeModel.getData() === IMMEDIATELY_DROPDOWN_CODE;
  },

  clickContinue() {
    const emailSendTime = this.isManualDeliverySelected() ? null
      : this.isImmediateDeliverySelected() ? Moment()
      : this.getTomorrowEmailTime();
    this.trigger('update:emailSendTime', emailSendTime);
    this.close();
  },

  onRender() {
    this.showChildView('methodRegion', new Dropdown({ model: this.methodModel, }));
    this.showChildView('timeRegion', new Dropdown({ model: this.timeModel, }));
  },

  className: `${ModalBaseView.prototype.className} deliveryAutoEmail_modal`,

  regions: {
    methodRegion: '.deliveryAutoEmail_modal__method',
    timeRegion: '.deliveryAutoEmail_modal__time'
  },

  template() {
    const isManualDeliverySelected = this.isManualDeliverySelected();
    const continueButtonText = isManualDeliverySelected ? 'Continue without Automatic Delivery' : 'Continue and Create Delivery Emails'
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Confirm Automated Email Delivery</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <p>Emailed documents were detected that can be automatically delivered in this set. By default, these emails will not be sent until <b>tomorrow, {Formatter.toDateAndTimeDisplay(this.getTomorrowEmailTime())}</b> to allow you to make last minute changes to this document set and ensure rule-based delays for decisions that should not be sent immediately are followed.
            </p>

            <p>If you want these documents sent immediately you can change the options below. If there is a Notice of Dispute Resolution or Notice of Review Hearing or other document that needs to be sent with the decision, you must choose Manual Delivery from the options below.
            </p>

            <div className="deliveryAutoEmail_modal__inputs">
              <div className="deliveryAutoEmail_modal__method"></div>
              <div className={`deliveryAutoEmail_modal__time ${isManualDeliverySelected ? 'hidden' : ''}`}></div>
            </div>

            <p>Press 'Cancel' to return to the document set without sending the documents to make changes.</p>

            {this.showEmailWarning ? <>
              <br/>
              <p><b>NOTE:</b>&nbsp;Some documents included in this set are indicated as being ready for delivery by email, but cannot be automatically sent because the documents do not have a matching delivery email template.</p>
            </> : null}

            <div className="modal-button-container">
              <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button">Cancel</button>
              <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.clickContinue()}>{continueButtonText}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

_.extend(ModalOutcomeDeliveryAutoEmail.prototype, ViewJSXMixin);
export default ModalOutcomeDeliveryAutoEmail;
