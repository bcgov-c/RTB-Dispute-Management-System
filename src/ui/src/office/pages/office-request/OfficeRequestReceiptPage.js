import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PageView from '../../../core/components/page/Page';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import ParticipantModel from '../../../core/components/participant/Participant_model';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const emailsChannel = Radio.channel('emails');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const sessionChannel = Radio.channel('session');

const OfficeRequestReceiptPage = PageView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['receiptTitle', 'submissionReceiptData']);
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.receiptData = this.model.getReceiptData();
    this.receiptTitle = this.receiptTitle || `${this.receiptData.requestName} Request`;

    emailsChannel.request('save:receipt', Object.assign({} , this.submissionReceiptData, {
      participant_id: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      receipt_body: renderToString(this.receiptPageHtml()),
      receipt_title: `${this.receiptTitle} Submission`,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_OFFICE_SUBMISSION'),
    }));
  },

  onRender() {
    const currentUser = sessionChannel.request('get:user');
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${this.receiptTitle} Submission Receipt`,
      containerTitle: `${this.receiptTitle} Submission`,
      emailUpdateParticipantId: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      autoSendEmail: true,
      participantSaveModel: currentUser && currentUser.isOfficeUser() ? ExternalParticipantModel : ParticipantModel,
      messageSubType: this.submissionReceiptData.messageSubType
    }));
    loaderChannel.trigger('page:load:complete');
  },

  className: `${PageView.prototype.className} office-page-receipt`,
  
  regions: {
    receiptContainerRegion: '.office-request-receipt'
  },

  clickMainMenu() {
    Backbone.history.navigate('main', { trigger: true, replace: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  template() {
    return (
      <>
        <div class="da-page-header-title hidden-print">
          <span class="da-page-header-icon da-access-menu-icon"></span>
          <span class="da-page-header-title-text">{this.receiptTitle} submitted</span>
        </div>
        <div className="office-request-receipt"></div>
        {!this.receiptData ? <i style="margin:40px 0;">There was an unexpected error saving this request.  Please contact RTB for the status of this request.</i> : null}
        <div class="office-sub-page-buttons">
          <button class="btn btn-lg btn-cancel" onClick={() => this.clickMainMenu()}>Main Menu</button>
          <span class="office-receipt-logout general-link" onClick={() => this.clickLogout()}>Logout</span>
        </div>
      </>
    )
  },

  renderLabelValuePairHelper(renderList) {
    return (
      <>
        { renderList.map((receiptLabelVal) => {
          if (!receiptLabelVal.label) return;
          return (
            <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>{receiptLabelVal.label}: </span>&nbsp; <span dangerouslySetInnerHTML={{__html: receiptLabelVal.value }}></span></p>
          )
        }) }
      </>
    )
  },

  receiptPageHtml() {
    return (
      <>
        <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {this.receiptTitle}</h4>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
          The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
        </p>
        { this.renderSubmissionInfoJsx() }
        { this.renderRequesterInfoJsx() }
        { this.renderSubServiceForJsx() }
        { this.renderApplicationFormJsx() }
        { this.renderBulkInfoJsx() }
        { this.renderPaymentInfoJsx() }
      </>
      
    )
  },

  renderSubmissionInfoJsx() {
    if (!this.receiptData) return;

    return (
      <>
        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '0px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Submission Information</p>
        { this.renderLabelValuePairHelper(this.receiptData.disputeInfo) }
      </>
    )
  },

  renderRequesterInfoJsx() {
    return (
      <>
        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Requester Information</p>
        { this.renderLabelValuePairHelper(this.receiptData.requesterInfo) }
      </>
    )
  },

  renderSubServiceForJsx() {
    if (!this.receiptData.substitutedServiceFor) return;

    return (
      <>
        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Substituted Service For</p>
        { this.renderLabelValuePairHelper(this.receiptData.substitutedServiceFor) }
      </>
    )
  },

  renderApplicationFormJsx() {
    return (
      <>
        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Application Form(s)</p>
        <p style={{ paddingTop: '4px' }}><strong>{ this.receiptData.formTitleDisplay }</strong></p>
        <p class="er-text" style={{ textAlign: 'left',  padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>{ this.receiptData.formDescriptionDisplay ? this.receiptData.formDescriptionDisplay : '-' }</p>
        { this.renderLabelValuePairHelper(this.receiptData.formInfo) }
      </>
    )
  },

  renderBulkInfoJsx() {
    if (!this.receiptData.bulkInfo) return;

    return (
      <>
        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Supporting Evidence</p>
        { this.renderLabelValuePairHelper(this.receiptData.bulkInfo) }
      </>
    )
  },

  renderPaymentInfoJsx() {
    if (!this.receiptData.paymentInfo) return;
    
    return (
      <>
        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Payment</p>
        { this.renderLabelValuePairHelper(this.receiptData.paymentInfo) }
      </>
    )
  }

});

_.extend(OfficeRequestReceiptPage.prototype, ViewJSXMixin);
export default OfficeRequestReceiptPage