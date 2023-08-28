/**
 * @fileoverview - Modal that guides internal user through the process of verifying an external user email. Has verification code sending, validation, and success screens
 */
import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../modals/ModalBase';
import InputView from '../input/Input';
import InputModel from '../input/Input_model';
import IconVerified from '../../static/Icon_FeedbackOK.png';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import './ModalEmailVerification.scss';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const ModalManualVerification = ModalBaseView.extend({  
      /**
   * @param {ParticipantModel} participant - Model of participant to provide email verification for
   */
  initialize(options) {
    this.mergeOptions(options, ['participant']);
    this.template = this.template.bind(this);

    this.createSubModels();
    this.showStepTwo = false;
    this.showVerified = false;
  },

  createSubModels() {
    this.verificationModel = new InputModel({
      labelText: "Confirmation Code",
      required: true,
      apiMapping: '',
      maxLength: 4
    });
  },

  validateAndShowErrors() {
    const verificationView = this.getChildView('verificationRegion');
    return verificationView.validateAndShowErrors();
  },

  clickSendVerificationEmail() {
    loaderChannel.trigger('page:load');
    emailsChannel.request('send:email:verification', this.participant.id).then(() => {
      this.showStepTwo = true;
    })
    .catch((generalErrorFactory.createHandler('EMAIL.VERIFICATION.MESSAGE')))
    .finally(() => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    });
  },

  clickVerifyEmail() {
    if(!this.validateAndShowErrors()) return;
    loaderChannel.trigger('page:load');
    emailsChannel.request('verify:contact:email', this.participant.id, this.verificationModel.getData())
    .then(() => {
      this.showVerified = true;
      this.showStepTwo = false;
      this.render();
    })
    .catch((res) => {
      if (res.status === 400 && res?.responseJSON?.length && typeof res?.responseJSON === "string") {
        const verificationView = this?.getChildView('verificationRegion');
        verificationView?.showErrorMessage(res.responseJSON);
      } else {
        const handler = generalErrorFactory.createHandler('EMAIL.CONTACT.VERIFICATION.SAVE');
        handler();
      }
    })
    .finally(() => {
      loaderChannel.trigger('page:load:complete');
    });
  },

  onRender() {
    if (this.showStepTwo) this.showChildView('verificationRegion', new InputView({ model: this.verificationModel }));
  },

  regions: {
    verificationRegion: '.email-verification__verification-code',
  },

  template() {
    const renderStep = () => {
      if (this.showStepTwo) return this.renderJsxStepTwo();
      else if (this.showVerified) return this.renderJsxVerified();
      else return this.renderJsxStepOne();
    }
    return (
      <div className="modal-dialog email-verification">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">Manual Email Confirmation</h4>
          </div>
          <div className="modal-body clearfix">
            {renderStep()}
            <div className="email-verification__verification-code"></div>
          </div>
        </div>
      </div>
    );
  },

  renderJsxStepOne() {
    return (
      <>
        <p>This process will send a 4-digit confirmation code to the email of {this.participant.getDisplayName()}, <b>{this.participant.get('email')}</b> that they will then need to provide to you over the phone so that you can confirm that they received the email.</p>
        <div className="button-row">
          <div className="pull-right">
            <button type="button" className="btn btn-lg btn-default" onClick={() => this.close()}><span>Cancel</span></button>
            <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.clickSendVerificationEmail()}>Send Confirmation Email</button>
          </div>
        </div>
      </>
    )
  },

  renderJsxStepTwo() {
    return (
      <>
        <p>
          We just sent a confirmation code email to <b>{this.participant.get('email')}</b>. Please inform the user that they should check their inbox (and spam and junk folders) and provide you the 4-digit code from this email. 
          If they do locate it in a junk or spam email folder, tell them to mark the message not spam or not junk so that future emails from the RTB will go to their inbox.
        </p>
        <div className="button-row">
            <div className="pull-right">
              <button type="button" className="btn btn-lg btn-default" onClick={() => this.close()}><span>Cancel</span></button>
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.clickVerifyEmail()}>Verify Email</button>
            </div>
          </div>
      </>
    )
  },

  renderJsxVerified() {
    return (
      <>
        <p>Thank you for confirming your email address</p>
        <p className="email-verification__verified"><img src={IconVerified} alt=""/>&nbsp;{this.participant.get('email')}</p>
        <p>If you received your confirmation code email in a junk or spam folder, make sure you mark it as not spam or not junk so future emails about your dispute are displayed in your inbox.</p>
        <div className="button-row">
            <div className="pull-right">
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.close()}>Close</button>
            </div>
          </div>
      </>
    )
  }
});

_.extend(ModalManualVerification.prototype, ViewJSXMixin);
export default ModalManualVerification;