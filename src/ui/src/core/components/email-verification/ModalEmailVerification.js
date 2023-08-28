/**
 * @fileoverview - Modal that guides an external user through email verification process. Contains ability to verify email, change email on file, skip verification process.
 */
import Radio from 'backbone.radio';
import React from 'react';
import InputView from '../input/Input';
import InputModel from '../input/Input_model';
import ModalBaseView from '../modals/ModalBase';
import IconVerified from '../../static/Icon_FeedbackOK.png';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import './ModalEmailVerification.scss';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const NO_MATCHING_EMAILS_ERROR = 'Email address does not match.';

const ModalEmailVerification = ModalBaseView.extend({  
    /**
   * 
   * @param {ParticipantModel} participantSaveModel - Type of model to use for saving participant: ParticipantModel|ExternalParticipantModel
   * @param {ParticipantModel} participant - Model of participant to save
   * @param {Boolean} [fetchParticipantAfterVerification] - Does GET call to participant api
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['participantSaveModel', 'participant', 'fetchParticipantAfterVerification']);
    this.showResendVerificationCode = false;
    this.showSkipProcess = false;
    this.showUpdateEmail = false;
    this.showVerified = false;

    this.createSubModels();
    loaderChannel.trigger('page:load');
    this.sendEmailVerificationCode()
    .catch(generalErrorFactory.createHandler('EMAIL.VERIFICATION.MESSAGE'))
    .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  createSubModels() {
    this.verificationModel = new InputModel({
      labelText: "Confirmation Code",
      required: true,
      apiMapping: '',
      maxLength: 4
    });

    this.emailAddressModel = new InputModel({
      inputType: 'email',
      labelText: "Email Address",
      required: true,
      apiMapping: '',
    });

    this.emailAddressConfirmModel = new InputModel({
      inputType: 'email',
      labelText: "Enter Email Address Again",
      required: true,
      apiMapping: '',
    });
  },

  clickVerifyEmail() {
    if(!this.validateAndShowErrors()) return;
    loaderChannel.trigger('page:load');
    emailsChannel.request('verify:contact:email', this.participant.id, this.verificationModel.getData())
    .then(() => {
      this.showVerified = true;
      this.render();
      if (this.fetchParticipantAfterVerification) return this.participant.fetch()
    })
    .catch((res) => {
      //show 400 error text as this can be "wrong code"
      if (res.status === 400 && res?.responseJSON?.length && typeof res?.responseJSON === "string") {
        const verificationView = this?.getChildView('verificationRegion');
        verificationView?.showErrorMessage("The provided confirmation code does not match");
      } else {
        const handler = generalErrorFactory.createHandler('EMAIL.CONTACT.VERIFICATION.SAVE');
        handler();
      }
    })
    .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  clickResendCode() {
    this.showResendVerificationCode = true;
    loaderChannel.trigger('page:load');
    this.sendEmailVerificationCode()
    .then(() => {
      this.render();
    })
    .catch(generalErrorFactory.createHandler('EMAIL.VERIFICATION.MESSAGE'))
    .finally(() => loaderChannel.trigger('page:load:complete'))
  },

  toggleSkipProcess() {
    this.showSkipProcess = !this.showSkipProcess;
    this.render();
  },

  toggleUpdateEmail() {
    this.showUpdateEmail = !this.showUpdateEmail;
    this.render();
  },

  sendEmailVerificationCode() {
    return emailsChannel.request('send:email:verification', this.participant.id);
  },

  updateEmail() {
    const validateEmailAndShowErrors = () => {
      const regionsToValidate = ['updateEmailRegion','updateEmailConfirmRegion'];
      let isValid = true;
      (regionsToValidate || []).forEach(regionName => {
        const view = this.getChildView(regionName);
        if (view) {
          isValid = view.validateAndShowErrors() && isValid;
        }
      });

      if (this.emailAddressModel.getData() !== this.emailAddressConfirmModel.getData()) {
        isValid = false;
        this.getChildView('updateEmailConfirmRegion').showErrorMessage(NO_MATCHING_EMAILS_ERROR);
      }
  
      return isValid;
    }

    if (!validateEmailAndShowErrors()) return;
    const saveAttr = { email: this.emailAddressModel.getData() }
    const participantSaveModel = new this.participantSaveModel(this.participant.toJSON())
    loaderChannel.trigger('page:load');
    participantSaveModel.save(saveAttr).done(() => {
      this.participant.set(participantSaveModel.toJSON(), { silent: true });
      this.showUpdateEmail = false;
      this.clickResendCode();
    }).fail(generalErrorFactory.createHandler('DA.PARTICIPANT.SAVE'))
    .always(() => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    })
  },

  validateAndShowErrors() {
    const verificationView = this.getChildView('verificationRegion');
    
    return verificationView.validateAndShowErrors();
  },

  regions: {
    verificationRegion: '.email-verification__verification-code',
    updateEmailRegion: '.email-verification__update-email',
    updateEmailConfirmRegion: '.email-verification__confirm-update-email'
  },

  onRender() {
    if (!this.showSkipProcess && !this.showUpdateEmail && !this.showVerified) this.showChildView('verificationRegion', new InputView({ model: this.verificationModel }));
    if (this.showUpdateEmail) {
      this.showChildView('updateEmailRegion', new InputView({ model: this.emailAddressModel }));
      this.showChildView('updateEmailConfirmRegion', new InputView({ model: this.emailAddressConfirmModel }));
    }
  },
  
  template() {
    return (
      <div className="modal-dialog email-verification">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">{this.showSkipProcess ? 'Skip This Process' : 'Confirm Your Email'}</h4>
          </div>
          <div className="modal-body clearfix">
            <div className="email-verification__wrapper">
              { this.renderJsxHeader() }
              <div className="email-verification__verification-code"></div>
              <div className="email-verification__update-email"></div>
              <div className="email-verification__confirm-update-email"></div>
              { this.renderJsxFooter() }
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderJsxVerificationCodeSentText() {
    const renderSentText = () => {
      if (this.showResendVerificationCode) return <span className="email-verification__verification-code__resend">We just re-sent the verification code email to <b>{this.participant.get('email')}</b>.&nbsp;</span>;
      else return <span>We just sent a confirmation code email to <b>{this.participant.get('email')}</b>.&nbsp;</span>;
    }

    return (
      <>
        {renderSentText()}
        <span>Please check your inbox (and spam and junk folders) and enter the 4-digit code from this email:</span>
      </>
    )
  },

  renderJsxHeader() {
    if (this.showSkipProcess) {
      return (
        <>
          <span>
            If you do not confirm your email address, it could mean that you won't receive important emails about your dispute file from the Residential Tenancy Branch. 
          </span>
        </>
      )
    } else if (this.showUpdateEmail) {
      return <span>Please enter the email address that you want to replace {<b>{this.participant.get('email')}</b>} with below:</span>;
    } else if (this.showVerified) {
      return (
        <>
          <p>Thank you for confirming your email address</p>
          <p><img src={IconVerified} alt=""/>&nbsp;{this.participant.get('email')}</p>
          <p>If you received your confirmation code email in a junk or spam folder, make sure you mark it as not spam or not junk so future emails about your dispute are displayed in your inbox.</p>
        </>
      )
    } else {
      return this.renderJsxVerificationCodeSentText();
    }
  },

  renderJsxFooter() {
    if (this.showSkipProcess) {
      return (
        <div className="button-row">
          <div className="pull-right">
            <button type="button" className="btn btn-lg btn-default email-verification__go-back" onClick={() => this.toggleSkipProcess()}><span></span></button>
            <button type="button" className="email-verification__exit btn btn-lg btn-primary btn-continue" onClick={() => this.close()}>I accept</button>
          </div>
        </div>
      ) 
    } else if (this.showUpdateEmail) {
      return (
        <div className="button-row">
          <div className="pull-right">
            <button type="button" className="btn btn-lg btn-default" onClick={() => this.toggleUpdateEmail()}><span>Cancel</span></button>
            <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.updateEmail()}>Update Email</button>
          </div>
        </div>
      )
    } else if (this.showVerified) {
      return (
        <>
          <div className="button-row">
            <div className="pull-right">
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.close()}><span>Close</span></button>
            </div>
          </div>
        </>
      )
    } else {
      const displayUpdateEmail = () => {
        if (this.participant.get('email_hint')) return;
        return <>
          <span>If the above email address is not correct you can <span className="general-link" onClick={() => this.toggleUpdateEmail()}>update your email address</span>.</span>
          &nbsp;
        </>
      }
      return (
        <>
          <div>Can't find this email? Check that your email address above is correct and try <span className="general-link" onClick={() => this.clickResendCode()}>resending the code</span>.</div>
          <br/>
          <div>
            {displayUpdateEmail()}Although we do not recommend that you continue without a confirmed email address, you can also&nbsp;<span className="general-link" onClick={() => this.toggleSkipProcess()}>skip this process</span> and complete it later.
          </div>
          <div className="button-row">
            <div className="pull-right">
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.clickVerifyEmail()}>Confirm Email</button>
            </div>
          </div>
        </>
      )
    }
  }
});

_.extend(ModalEmailVerification.prototype, ViewJSXMixin);
export default ModalEmailVerification;