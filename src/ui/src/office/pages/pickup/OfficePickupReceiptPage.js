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
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');

const OfficePickupReceiptPage = PageView.extend({
  className: `${PageView.prototype.className} office-page-receipt`,

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);

    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.receiptData = this.model.getReceiptData();
    this.submissionReceiptData = {
      receipt_subtype: null,
      messageSubType: null
    }

    emailsChannel.request('save:receipt', Object.assign({} , this.submissionReceiptData, {
      participant_id: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      receipt_body: renderToString(this.receiptPageHtml()),
      receipt_title: `Documents Provided`,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_OFFICE_SUBMISSION'),
    }));
  },

  onRender() {
    const currentUser = sessionChannel.request('get:user');
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: Pickup Receipt`,
      containerTitle: `Pickup of documents`,
      emailUpdateParticipantId: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      autoSendEmail: true,
      participantSaveModel: currentUser && currentUser.isOfficeUser() ? ExternalParticipantModel : ParticipantModel,
    }));
    loaderChannel.trigger('page:load:complete');
  },

  clickMainMenu() {
    Backbone.history.navigate('main', { trigger: true, replace: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  toParticipantDisplay(participant) {
    if (!participant) {
      return;
    }
    return `${participant.isTenant() ? 'Tenant' : 'Landlord'} - Initials ${participant.getInitialsDisplay()} (${participant.isRespondent() ? 'Respondent' : 'Applicant'})`;
  },

  receiptPageHtml() {
    const accessCode = this.dispute ? this.dispute.get('accessCode') : '';
    const pickupUserDisplay = this.loggedInParticipant ? `${this.toParticipantDisplay(this.loggedInParticipant)}` : '-';
    const { pickupTitle, associatedDocumentsCount } = this.receiptData;

    return (<>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: Pickup of documents</h4>

      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	    </p>

      <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '0px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Pickup Information</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>File number: </span> <b>{this.dispute.get('file_number')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Access code: </span> {accessCode}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Picked up by: </span> {pickupUserDisplay}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Pickup date: </span> {Formatter.toDateDisplay(Moment())}</p>

      <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '0px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Associated documents</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Pickup title: </span> {pickupTitle}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Associated Documents: </span> {associatedDocumentsCount}</p>
    </>)
  },

  regions: {
    receiptContainerRegion: '.office-request-receipt'
  },

  template() {
    return (
      <>
        <div class="da-page-header-title hidden-print">
          <span class="da-page-header-icon da-access-menu-icon"></span>
          <span class="da-page-header-title-text">Documents provided</span>
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
});

_.extend(OfficePickupReceiptPage.prototype, ViewJSXMixin);
export default OfficePickupReceiptPage