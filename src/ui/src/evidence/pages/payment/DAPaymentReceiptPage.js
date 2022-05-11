import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import PageView from '../../../core/components/page/Page';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import './DAPayment.scss';

const PAGE_TITLE = `Payment completed`;
const RECEIPT_TITLE = 'Payment';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');

const DAPaymentReceiptPage = PageView.extend({
  /**
   * 
   * @param {Backbone.Model} model - the application model
   */
  initialize() {
    this.template = this.template.bind(this);
    
    const fullReceiptData = this.model.getReceiptData() || {};
    this.hasUploadedFiles = !!fullReceiptData.hasUploadedFiles;
    this.receiptData = fullReceiptData.receiptData;
    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');

    emailsChannel.request('save:receipt', {
      participant_id: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      receipt_body: renderToString(this.receiptPageHtml()),
      receipt_title: RECEIPT_TITLE,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_DA_PAYMENT_OR_WAIVER'),
    });
  },

  onRender() {
    
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      emailUpdateParticipantId: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      autoSendEmail: false,
      participantSaveModel: ExternalParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_PAYMENT')
    }));
  },

  routeToMenu() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('access', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  /* Template Functions */
  className: `${PageView.prototype.className} da-receipt-page da-payment-page --receipt`,
  regions: {
    disputeRegion: '.da-payment-page__dispute-overview',
    receiptContainerRegion: '.da-payment-page__receipt'
  },

  template() {
    return <>
      <div className="da-payment-page__dispute-overview"></div>

      <div className="dac__page-header">
        <span className="dac__page-header__icon dac__icons__menu__payment"></span>
        <span className="dac__page-header__title">{PAGE_TITLE}</span>
      </div>
      <div className="da-payment-page__receipt"></div>

      <div className="hidden-print">
        <div className="spacer-block-30"></div>
        <div className="dac__page-buttons">
          <button className="btn btn-standard btn-lg da-receipt-main-menu-btn" onClick={() => this.routeToMenu()}>Main menu</button>
          <span className="receipt-logout-btn" onClick={() => this.clickLogout()}>Logout</span>
        </div>
        <div className="spacer-block-10"></div>
      </div>
    </>;
  },

  receiptPageHtml() {
    return (
      <>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {RECEIPT_TITLE}</h4>
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	    </p>
      {this.receiptData.map((receiptDataItem, index) => {
        return <p key={index} className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>{receiptDataItem.label}: </span>&nbsp; <span dangerouslySetInnerHTML={{__html: receiptDataItem.value}}></span></p>
      })}
      </>
    );
  }
});

_.extend(DAPaymentReceiptPage.prototype, ViewJSXMixin);
export default DAPaymentReceiptPage;
