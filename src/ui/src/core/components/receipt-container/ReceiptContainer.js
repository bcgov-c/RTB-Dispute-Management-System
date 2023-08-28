/**
 * @fileoverview Displays saved receipt html and allows for emailing/downloading of receipt. Uses iframe to get around print issue where multi page receipts were being cut off.
 */

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import React from 'react';
import Radio from 'backbone.radio';
import { renderToString } from 'react-dom/server'
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import PrintableIframe from '../printable-iframe/PrintableIframe.js';
import EmailModel from '../../../core/components/email/Email_model';
import BaseEmailTemplate from '../../../core/components/email/BaseEmail_template.tpl';
import { ModalEmailReceipt } from './ModalEmailReceipt.js'
import './ReceiptContainer.scss';
import EmailSentSuccessIcon from '../../../admin/static/Admin_Icon_DeliverReadyCheck.png';
import EmailFailIcon from '../../../admin/static/Icon_Admin_DeliverNotReadyX.png';

const RECEIPT_CONTAINER_CLASSNAME = `receipt-container`;
const DEFAULT_SUBMISSION_TITLE = `Thank you for your submission`;
const DEFAULT_SUBMISSION_MESSAGE = `Print or email a copy of this submission for your records - it is proof of the information submitted to the Residential Tenancy Branch.`;
const JUNK_MAIL_MESSAGE = 'You will be receiving e-mails directly from the Residential Tenancy Branch with important information and documents. It is important to check your Junk e-mail folders and add noreply.rtb@gov.bc.ca to your preferred contacts when possible.';
const EMAIL_SEND_SUCCESS = 'A copy of this receipt has been automatically emailed to';
const EMAIL_SEND_FAIL = 'Automatic sending of email failed, please try again';
const RECEIPT_FONT_SIZE_PX = 16;

const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const participantsChannel = Radio.channel('participants');

const ReceiptContainer = Marionette.View.extend({
  /**
   * @param {String|JSX} displayHtml - Contains the receipt html. Can be either a string or jsx.
   * @param {Boolean} [disableEmail] - Hides email button, disables autoEmail
   * @param {String} [enableLogout] - Adds a logout link
   * @param {Function} [logoutWarningFn] - Adds a warning when the logout triggers. Should return a Promise, which will trigger logout when resolved
   * @param {String} [containerTitle] - Used for the receipt container: "Receipt: <containerTitle>"  
   * @param {Boolean} [hideSubmissionText] - Custom string to use in the default submission text
   * @param {String} [submissionTitle] - Custom string to use instead of the default submission title
   * @param {String} [submissionMessage] - Custom string to use instead of the default submission text
   * @param {String} [emailSubject] - Used for email subject and print header
   * @param {String} [emailUpdateParticipantId] - Used for emailing to participant email on file.
   * @param {String} [participantSaveModel] - If passed in will trigger the "do you want to update email ui".
   * @param {String} [autoSendEmail] - Automatically emails receipt if participant has an email on file.
   * @param {Number} [messageSubType] - The email message sub type value to use on the sent email
   * @param {String} [customButtonText] - The title of the optional custom button
   * @param {Function} [customButtonFn] - The action function for the optional custom button
   */
  initialize(options) {
    this.mergeOptions(options, [
      'displayHtml', 'disableEmail', 'enableLogout', 'logoutWarningFn', 'containerTitle',
      'hideSubmissionText', 'submissionTitle', 'submissionMessage', 
      'emailSubject', 'emailUpdateParticipantId', 'participantSaveModel', 'autoSendEmail', 'messageSubType',
      'customButtonText', 'customButtonFn',
      'displayJunkMailMsg',
    ]);
    this.template = this.template.bind(this);
    this.displayHtml = this.prepareDisplayHtml(this.displayHtml);
    // Capitalize all words in the email subject
    this.emailSubject = (this.emailSubject || '').split(' ').map(s => Formatter.capitalize(s)).join(' ');
    this.containerTitle = this.containerTitle || '';
    this.submissionTitle = this.submissionTitle || '';
    this.submissionMessage = this.submissionMessage || '';
    this.emailSentSuccess = null;

    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.isPrintPopulated = false;
    if (this.autoSendEmail) this.autoEmailReceipt();
  },

  prepareDisplayHtml(displayHtml) {
    if (!displayHtml) return <div></div>;
    else if (typeof displayHtml === 'object') {
      return renderToString(displayHtml);//if react html object is passed in, convery to string
    } else if (typeof displayHtml === 'string') {
      return displayHtml//if string html is passed in, simply return
    } else return <div></div>;
  },

  autoEmailReceipt() {
    if (!this.emailUpdateParticipantId || this.disableEmail) return;
    
    const participant = participantsChannel.request('get:participant', this.emailUpdateParticipantId)
    if (!participant.get('email')) return;

    this.newEmail = new EmailModel({
      email_from: configChannel.request('get', 'EMAIL_FROM_DEFAULT'),
      is_active: 1,
      subject: this.emailSubject,
      html_body: BaseEmailTemplate({
        emailBody: this.displayHtml,
        COMMON_IMAGE_ROOT: this.COMMON_IMAGE_ROOT,
        FONT_SIZE_PX: RECEIPT_FONT_SIZE_PX,
      }),
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_RECEIPT'),
      message_sub_type: this.messageSubType,
      participant_id: this.emailUpdateParticipantId, 
      send_method: configChannel.request('get', 'EMAIL_SEND_METHOD_PARTICIPATION_ID')
    });
    loaderChannel.trigger('page:load');

    this.newEmail.save().done(() => {
      this.emailSentSuccess = true;
    }).fail(() => {
      this.emailSentSuccess = false;
    }).always(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    });
  },

  openEmailModal() {
    const emailReceiptModal = new ModalEmailReceipt({
      subject: this.emailSubject,
      htmlBody: BaseEmailTemplate({
        emailBody: this.displayHtml,
        COMMON_IMAGE_ROOT: this.COMMON_IMAGE_ROOT,
        FONT_SIZE_PX: RECEIPT_FONT_SIZE_PX,
      }),
      emailUpdateParticipantId: this.emailUpdateParticipantId,
      participantSaveModel: this.participantSaveModel,
      messageSubType: this.messageSubType
    });

    modalChannel.request('add', emailReceiptModal);
    this.trigger('close:communications:modal');
  },

  clickPrintIframe() {
    const printView = this.getChildView('printableIframe');
    printView ? printView.print() : null;
  },

  clickLogout() {
    const logoutFn = () => {
      loaderChannel.trigger('page:load');
      Backbone.history.navigate('logout', { trigger: true });
    };

    if (this.logoutWarningFn) this.logoutWarningFn().then(logoutFn);
    else logoutFn();
  },

  onRender() {
    this.showChildView('printableIframe', new PrintableIframe({ printPageTitle: this.emailSubject, printPageBody: this.displayHtml }))
  },

  className: RECEIPT_CONTAINER_CLASSNAME,

  regions: {
    printableIframe: '.printable-iframe'
  },

  template() {
    return <>
      <div className="hidden-print">
        {this.renderJsxSubmissionText()}
        <div className="receipt-container__content">
          <div className="receipt-container__content__title">
            <div ><b>Receipt:</b> {this.containerTitle}</div>
            <div className="receipt-container__content__buttons">
              {this.renderJsxCustomButton()}
              {this.enableLogout ?
                <span className="receipt-container__content__buttons__link general-link" onClick={() => this.clickLogout()}>Logout</span>
              : null}
              {!this.disableEmail ?
                <button className="receipt-container__content__buttons__button btn btn-standard btn-lg" onClick={() => this.openEmailModal()}>Email</button>
              : null}
              <button className="receipt-container__content__buttons__button--print btn btn-standard btn-lg hidden-xs" onClick={() => this.clickPrintIframe()}>Print</button>
            </div>
          </div>
          <div className="receipt-container__content__html" dangerouslySetInnerHTML={{__html: this.displayHtml }}></div>
        </div>
        <div className="printable-iframe"></div>
      </div>
      <div className="visible-print">Click Print</div>
    </>;
  },

  renderJsxSubmissionText() {
    if (this.hideSubmissionText) return;

    const participant = participantsChannel.request('get:participant', this.emailUpdateParticipantId) || '';
    const savedEmail = participant ? participant.get('email') : null;
    const emailedText = this.emailSentSuccess ? `${EMAIL_SEND_SUCCESS} ${savedEmail}` : this.emailSentSuccess === false ? `${EMAIL_SEND_FAIL}` : '';
      
    const renderJsxAutoEmailText = () => {
      if (!savedEmail || this.emailSentSuccess === null) return;
      return <>
        <p>
          <img className="receipt-container__img" src={this.emailSentSuccess ? EmailSentSuccessIcon : EmailFailIcon}/>&nbsp;{emailedText}
        </p>
      </>;
    };
    
    return <div className="receipt-container__thank-you">
      <div className="receipt-container__thank-you__title">{this.submissionTitle || DEFAULT_SUBMISSION_TITLE}</div>
      <p>{this.submissionMessage || DEFAULT_SUBMISSION_MESSAGE}</p>
      {this.displayJunkMailMsg ? <p>{JUNK_MAIL_MESSAGE}</p> : null }
      {renderJsxAutoEmailText()}
    </div>;
  },

  renderJsxCustomButton() {
    if (!this.customButtonText || !this.customButtonFn) return;
    return <button className="receipt-container__content__buttons__button--custom btn btn-standard btn-lg" onClick={() => this.customButtonFn()}>{this.customButtonText}</button>
  },
})

_.extend(ReceiptContainer.prototype, ViewJSXMixin);
export { ReceiptContainer, RECEIPT_CONTAINER_CLASSNAME }
