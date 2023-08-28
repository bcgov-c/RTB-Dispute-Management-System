import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageView from '../../../../core/components/page/Page';
import { ReceiptContainer } from '../../../../core/components/receipt-container/ReceiptContainer';
import ParticipantModel from '../../../../core/components/participant/Participant_model';

const PAGE_TITLE = `Application submission receipt`;
const RECEIPT_TITLE = `Application Submission`;

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');
const Formatter = Radio.channel('formatter').request('get');
const emailsChannel = Radio.channel('emails');

const IntakeAriPagePaymentReceipt = PageView.extend({
  initialize() {
    PageView.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);
    this.pageLoading = false;
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    applicationChannel.trigger('progress:step', 9);

    const activePayment = paymentsChannel.request('get:payment:intake');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    if (!activePayment) return;
    
    if (activePayment.isApproved()) {
      emailsChannel.request('save:receipt', {
        participant_id: primaryApplicant ? primaryApplicant.id : null,
        receipt_body: renderToString(this.receiptPageHtml()),
        receipt_title: 'Application Submission',
        receipt_type: configChannel.request('get', 'RECEIPT_TYPE_INTAKE_SUBMISSION'),
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_ARIC_PFR_INTAKE'),
      });
    }
  },

  getRoutingFragment() {
    return 'page/9';
  },

  regions: {
    receiptContainerRegion: '.payment-page-receipt-container',
  },

  onRender() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const dispute = disputeChannel.request('get');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    
    if (!activePayment) {
      console.log(`[Error] No active payment for payment receipt page`);
      Backbone.history.navigate('#list', {trigger: true, replace: true});
      return this;
    }
    
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      emailSubject: `File number ${dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      displayHtml: this.receiptPageHtml(),
      hideSubmissionText: false,
      emailUpdateParticipantId: primaryApplicant ? primaryApplicant.id : null,
      autoSendEmail: false,
      participantSaveModel: ParticipantModel,
      messageSubType: configChannel.request('get', activePayment.isApproved() ? 'EMAIL_MESSAGE_SUB_TYPE_INTAKE_PAID' : 'EMAIL_MESSAGE_SUB_TYPE_INTAKE_UNPAID'),
      displayJunkMailMsg: true,
    }));
  },

  clickMenu() {
    Backbone.history.navigate('#list', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },
  

  template() {
    return <>
      <div className="step payment-type-description hidden-print">
        <div className="payment-page-title hidden-print">{PAGE_TITLE}</div>
        
        <div className="payment-page-receipt-container"></div>

      </div>
      <div className="page-navigation-button-container hidden-print">
        <div className="intake-receipt-footer">
          <div className="menu-button-container">
            <button className="btn btn-standard btn-lg da-receipt-main-menu-btn intake-file-list-btn" onClick={() => this.clickMenu()}>File List</button>
          </div>
          <div className="footer-logout-container">
            <span className="receipt-logout-btn intake-logout-btn" onClick={() => this.clickLogout()}>Logout</span>
          </div>
        </div>
      </div>
    </>
  },

  receiptPageHtml() {
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    let packageProvidedText = '-';
    if (primaryApplicant && primaryApplicant.get('package_delivery_method') === configChannel.request('get', 'SEND_METHOD_PICKUP')) {
      packageProvidedText = 'At the Residential Tenancy Branch or a Service BC location';
    } else if (primaryApplicant && primaryApplicant.get('package_delivery_method') === configChannel.request('get', 'SEND_METHOD_EMAIL')) {
      packageProvidedText = 'By Email';
    }
    const dispute = disputeChannel.request('get');
    const payment = paymentsChannel.request('get:payment:intake');
    const renderJsxPaymentAmountDisplay = () => {
      return payment.isFeeWaiver() ? `$0.00` : !payment.get('transaction_amount') ?
        <strong>{payment.isApproved() ? 'Paid' : 'Not paid' }</strong> :
        Formatter.toAmountDisplay(payment.get('transaction_amount'))
    };
    const paymentSubmittedDisplay = dispute.get('initial_payment_date') ? Formatter.toDateDisplay(dispute.get('initial_payment_date')) :
      (payment.isOffice() && payment.isPending()) ? 'Waiting for payment' :
      (payment.isFeeWaiver() && payment.isPending()) ? 'Waiting for Proof of Income' : '-';
    const paymentMethodDisplay = payment.isOnline() ? 'Online' : payment.isOffice() ? 'In person at RTB or Service BC' : payment.isFeeWaiver() ? 'Fee waiver' : '';

    return <>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {RECEIPT_TITLE}</h4>
      
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following is your application receipt and payment receipt, if applicable, file number and dispute access code. Make sure that you keep this information for your records. You will be contacted by the Residential Tenancy Branch when your application has been processed. Keep your BCeID login information in a safe place so that you can return to this application and make changes if requested by the Residential Tenancy Branch.
	    </p>
      <div className="spacer-block-20"></div>

      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>File number: </span>&nbsp; <b>{dispute.get('file_number')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Dispute access code: </span><b>&nbsp; {primaryApplicant ? primaryApplicant.get('access_code') : '-'}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Act: </span>&nbsp; {dispute.isMHPTA() ? 'MHPTA (Manufactured home or trailer)' : 'RTA (Residential)'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Application type: </span>&nbsp; {Formatter.toDisputeCreationMethodDisplay(dispute.get('creation_method'))}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Applicant type: </span>&nbsp; {dispute.isLandlord() ? 'Landlord' : 'Tenant'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Primary applicant: </span>&nbsp; {primaryApplicant ? primaryApplicant.getContactName() : '-'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Package provided: </span>&nbsp; {packageProvidedText}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date submitted: </span>&nbsp; {dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : '-'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Payment submitted: </span>&nbsp; {paymentSubmittedDisplay}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Payment amount: </span>&nbsp; {renderJsxPaymentAmountDisplay()}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Payment method: </span>&nbsp; {paymentMethodDisplay}</p>

      {!payment.isApproved() ? (
        <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}><tbody>
          <tr>
            <td className="er-nesttable-wrapper-td" style={{ padding: '15px 0px 10px 0px' }}>
              <table cellPadding="0" cellSpacing="0" width="100%" className="er-alert-table" style={{ margin:' 0px', padding: '0px', borderCollapse: 'collapse' }}><tbody>
                <tr><td className="er-warning-image" style={{ width: '55px', padding: '5px', verticalAlign: 'middle' }}>
                  <img src={`${this.COMMON_IMAGE_ROOT}Icon_Reminder_email.png`} className="er-warning-icon" style={{ width: '55px', height: '42px'}} />
                </td>
                <td className="er-warning-text" style={{ color: '#de2f3c', padding: '5px' }}>You must {!payment.isFeeWaiver() ? 'complete payment' : 'submit proof of income to support your request to waive filing fee'} within three days of this application being submitted or it will be marked as abandoned and you will have to file a new application again.</td>
              </tr>
            </tbody></table>
          </td>
        </tr>
      </tbody></table>) : null}

      
    </>
  },

});

_.extend(IntakeAriPagePaymentReceipt.prototype, ViewJSXMixin);
export default IntakeAriPagePaymentReceipt;
