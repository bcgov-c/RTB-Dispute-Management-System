import React from 'react';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import EmailModel from '../../../core/components/email/Email_model';
import EmailTemplateFormatter from '../email/EmailTemplateFormatter';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './ModalEmailReceipt.scss';
import EmailSuccessImage from '../../../admin/static/Icon_EmailSent.png';
import EmailFailureImage from '../../../admin/static/Icon_EmailNotSent.png';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const EMAIL_RECEIPT_STEP_ONE = 1;
const EMAIL_RECEIPT_STEP_TWO = 2;
const USE_EXISTING_EMAIL = 1;
const USE_NEW_EMAIL = 2;
const RADIO_YES_CODE = 1;
const RADIO_NO_CODE = 0;

const ModalEmailReceipt = ModalBaseView.extend({
  id: 'emailReceipt_modal',
  
  initialize(options) {
    this.mergeOptions(options, ['subject', 'htmlBody', 'emailUpdateParticipantId', 'participantSaveModel', 'messageSubType'])
    this.template = this.template.bind(this);
    
    this.participant = participantsChannel.request('get:participant', this.emailUpdateParticipantId) || '';
    this.savedEmail = this.participant ? this.participant.get('email') : null;
    
    // Always apply merge field email conversions
    this.htmlBody = EmailTemplateFormatter.applyConversionsTo(this.htmlBody);
    this.createViewVars();
    this.createSubModels();
    this.setupListeners();
  },

  createViewVars() {
    this.emailSentObj = {
      step: EMAIL_RECEIPT_STEP_ONE,
      success: false
    }

    this.newEmail = new EmailModel({
      email_from: configChannel.request('get', 'EMAIL_FROM_DEFAULT'),
      is_active: 1,
      subject: this.subject,
      html_body: this.htmlBody,
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_RECEIPT'),
      message_sub_type: this.messageSubType
    });

    this.displayEmailFields = !this.participant || !this.savedEmail;
  },

  createSubModels() {
    this.emailModel = new InputModel({
      inputType: 'email',
      labelText: 'Enter Email Address',
      errorMessage: 'Please enter email',
      required: true,
    });

    this.confirmEmailModel = new InputModel({
      inputType: 'email',
      labelText: 'Enter Email Address Again',
      errorMessage: 'Please re-enter email',
      required: true,
    });

    this.emailToChoiceModel = new RadioModel({
      optionData: [
        {value: USE_EXISTING_EMAIL, text: `Email address on file: ${this.savedEmail}`},
        {value: USE_NEW_EMAIL, text: 'A different email address'},
      ],
      value: this.savedEmail ? USE_EXISTING_EMAIL : USE_NEW_EMAIL,
    });

    this.updateContactEmailModel = new RadioModel({
      optionData: [
        {value: RADIO_YES_CODE, text: 'Yes'},
        {value: RADIO_NO_CODE, text: 'No'}
      ],
      required: true,
    })
  },

  setupListeners() {
    this.listenTo(this.emailToChoiceModel, 'change:value', (model, value) => {
      if (value === USE_NEW_EMAIL) {
        this.displayEmailFields = true;
      } else {
        this.displayEmailFields = false;
      }

      this.render();
    })
  },

  defaultOnEmailSendFn() {
    if (!this.subject || !this.htmlBody) {
      return;
    }
    
    const emailOptions = this.emailToChoiceModel.getData() === USE_NEW_EMAIL || !this.savedEmail ? 
    { email_to: this.emailModel.getData() } 
    : 
    { participant_id: this.participant.id, send_method: configChannel.request('get', 'EMAIL_SEND_METHOD_PARTICIPATION_ID') }

    this.newEmail.set(_.extend({}, emailOptions));
    loaderChannel.trigger('page:load');

    this.newEmail.save().done(() => {
      this.emailSentObj = {...this.emailSentObj, success: true }
    }).fail(() => {
      this.emailSentObj = {...this.emailSentObj, success: false }
    }).always(() => {
      this.emailSentObj = {...this.emailSentObj, step: EMAIL_RECEIPT_STEP_TWO }
      loaderChannel.trigger('page:load:complete');
      this.render();
    });
  },

  validateAndShowStepOneErrors() {
    const regionsToValidate = ['emailRegion', 'confirmEmailRegion'];
    this.showEmailMatchError = false;
    this.render();
    let isValid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    if(this.emailModel.getData() !== this.confirmEmailModel.getData() && isValid) {
      this.showEmailMatchError = true;
      isValid = false;
      this.render();
    }

    return isValid;
  },

  validateAndShowStepTwoErrors() {
    let isValid = true;
    const view = this.getChildView('updateContactEmailRegion');
    if (view) {
      isValid = view.validateAndShowErrors() && isValid;
    }

    return isValid;
  },

  emailReceipt() {
    if(this.validateAndShowStepOneErrors()) {
      this.defaultOnEmailSendFn();
    }
  },

  updateContact() {
    const modalView = this;

    if (this.updateContactEmailModel.getData() === RADIO_NO_CODE || !this.validateAndShowStepTwoErrors() || !this.participantSaveModel) {
      modalView.close();
      return;
    }

    const saveAttr = { email: this.emailModel.getData() }
    const participantSaveModel = new this.participantSaveModel(this.participant.toJSON())
    loaderChannel.trigger('page:load');
    participantSaveModel.save(saveAttr).done(() => {
      this.participant.set(participantSaveModel.toJSON(), { silent: true });
      modalView.close();
    }).fail(generalErrorFactory.createHandler('DA.PARTICIPANT.SAVE'))
    .always(() => {
      loaderChannel.trigger('page:load:complete');
    })
    
  },

  isEmailDifferentFromSaved() {
    if (this.emailToChoiceModel.getData() === USE_EXISTING_EMAIL) return false;

    const enteredEmail = this.emailModel.getData();
    const emailOnFile = this.savedEmail || "";
    return enteredEmail.substr(0,2).concat(enteredEmail.substr(enteredEmail.lastIndexOf('.') - 2, enteredEmail.length)) !== emailOnFile.substr(0,2).concat(emailOnFile.substr(emailOnFile.lastIndexOf('.') - 2, emailOnFile.length))
  },

  onRender() {
    if (this.emailSentObj.step === EMAIL_RECEIPT_STEP_ONE && !!this.participant && this.savedEmail) {
      this.showChildView('emailToChoiceRegion', new RadioView({ model: this.emailToChoiceModel }));
    }
    
    if (this.displayEmailFields && this.emailSentObj.step === EMAIL_RECEIPT_STEP_ONE) {
      const firstEmail = this.showChildView('emailRegion', new InputView({ model: this.emailModel }));
      const secondEmail = this.showChildView('confirmEmailRegion', new InputView({ model: this.confirmEmailModel }));

      // Attach "enter" key listeners for the emails
      if (firstEmail) this.listenTo(firstEmail.currentView, 'input:enter', () => this.emailReceipt());
      if (secondEmail) this.listenTo(secondEmail.currentView, 'input:enter', () => this.emailReceipt())

    }

    if (this.emailSentObj.step === EMAIL_RECEIPT_STEP_TWO && this.isEmailDifferentFromSaved() && this.participantSaveModel) {
      this.showChildView('updateContactEmailRegion', new RadioView({ model: this.updateContactEmailModel }));
    }
  },

  regions: {
    emailToChoiceRegion: '.email-to-choice',
    emailRegion: '.email',
    confirmEmailRegion: '.confirm-email',
    updateContactEmailRegion: '.email-update-contact'
  },

  template() {
    const renderStep = () => {
      if (this.emailSentObj.step === EMAIL_RECEIPT_STEP_ONE) return this.renderStepOneJsx();
      else if(this.emailSentObj.step === EMAIL_RECEIPT_STEP_TWO) return this.renderStepTwoJsx();
    }

    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Email Receipt</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            {renderStep()}
          </div>
        </div>
      </div>
    )
  },

  renderStepOneJsx() {
    const renderEmailToChoice = () => {
      if (!this.participant || !this.savedEmail) return;
      
      return (
        <>
          <span>What email would you like to send this receipt to?</span>
          <div className="email-to-choice"></div>
        </>
      )
    };

    const renderEmailInputs = () => {
      if(!this.displayEmailFields) return;

      return (
        <>
          <span>Please provide the email address that you would like to send this receipt to.</span>
          <div className="email"></div>
          <div className="confirm-email"></div>
          { this.showEmailMatchError ? <p className="error-block">Email fields must match</p> : null }
        </>
      )
    }
    
    return (
      <>
        <div>
          {renderEmailToChoice()}
          {renderEmailInputs()}
        </div>
        <div className="button-row">
          <div className="float-right">
            <button type="button" className="btn btn-lg btn-default btn-cancel"><span>Cancel</span></button>
            <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.emailReceipt()}>Send Receipt</button>
          </div>
        </div>
      </>
    )
  },

  renderStepTwoJsx() {
    const renderUpdateEmailJsx = () => {
      const enteredEmail = this.emailModel.getData();
      if (!this.isEmailDifferentFromSaved()) return;
      if (!this.participantSaveModel) {
        console.log('[Warning] - No participant save model was passed in. Cannot update contact');
        return;
      }
  
      return (
        <>
          <span>The email address {enteredEmail} is not stored in our systems as your email address for receiving information. Would you like {enteredEmail} to be the email address that we use to send receipts, notifications or information on your dispute file?</span>
          <div className="email-update-contact"></div>
        </>
      )
    }

    if (this.emailSentObj.success) {
      const emailDisplay = this.emailToChoiceModel.getData() === USE_EXISTING_EMAIL ? this.savedEmail : this.emailModel.getData();
      return (
        <>
          <div className="email-sent-wrapper">
            <img className="email-sent-wrapper-image" src={EmailSuccessImage} />
            <span>Your receipt has been emailed to <b>{emailDisplay}</b>. It may take a minute or two for you to receive this email.</span>
          </div>
          <div className={`email-update-wrapper ${this.isEmailDifferentFromSaved() ? '' : 'hidden'}`}>
            {renderUpdateEmailJsx()}
          </div>
          <div className="button-row">
            <div className="float-right">
              {this.isEmailDifferentFromSaved() && this.participantSaveModel ?
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.updateContact()}><span>Save and Close</span></button>
              :
              <button type="button" className="btn btn-lg btn-default btn-cancel"><span>Close</span></button>
              }
            </div>
          </div>
        </>
      )
    } else {
      return (
        <div>
          <div className="email-sent-wrapper">
            <img className="email-sent-wrapper-image" src={EmailFailureImage} />
            <span>We have encountered an error sending your receipt. You can close this modal and print the receipt or trying sending the email message again.</span>
          </div>
          <div className="button-row">
            <div className="float-right">
              <button type="button" className="btn btn-lg btn-default btn-cancel"><span>Close</span></button>
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.defaultOnEmailSendFn()}><span>Retry</span></button>
            </div>
          </div>
        </div>
        )
    }
  }
});

_.extend(ModalEmailReceipt.prototype, ViewJSXMixin);
export { ModalEmailReceipt }