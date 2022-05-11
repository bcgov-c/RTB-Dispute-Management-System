import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageView from '../../../../core/components/page/Page';
import QuestionModel from '../../../../core/components/question/Question_model';
import QuestionView from '../../../../core/components/question/Question'; 
import { ReceiptContainer } from '../../../../core/components/receipt-container/ReceiptContainer';
import ParticipantModel from '../../../../core/components/participant/Participant_model';
import IntakeReviewReceipt from '../review/IntakeReviewReceipt';

import TrialLogic_BIGEvidence from '../../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import ModalIntakeRating from '../../../../core/components/trials/BIGEvidence/ModalIntakeRating';
import PageItemView from '../../../../core/components/page/PageItem';

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
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');

const YES_BUTTON_VALUE = 1;
const NO_BUTTON_VALUE = 0;

const IntakePagePaymentReceiptView = PageView.extend({
  initialize() {
    PageView.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);
    this.createSubModels();
    this.pageLoading = false;
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    applicationChannel.trigger('progress:step', 9);

    const activePayment = paymentsChannel.request('get:payment:intake');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    this.respondents = participantsChannel.request('get:respondents');
    this.showSubServeRouting = activePayment && activePayment.isApproved() && this.respondents.filter(p => !p.hasContactAddress() && p.get('known_contact_fields')).length;
    const dispute = disputeChannel.request('get');

    if (TrialLogic_BIGEvidence.canViewIntakeOutcome(dispute)) {
      const modalView = new ModalIntakeRating();
      this.listenTo(modalView, 'continue', (outcomeData) => {
        loaderChannel.trigger('page:load');
        modalView.close();
        TrialLogic_BIGEvidence.addIntakeRatingOutcome(primaryApplicant, outcomeData).finally(() => {
          loaderChannel.trigger('page:load:complete');
        });
      });
      modalChannel.request('add', modalView);
    }
  },

  createSubModels() {
    this.subServiceQuestionModel = new QuestionModel({
      optionData: [{ name: 'subserv-question-no', value: NO_BUTTON_VALUE, text: 'NO', cssClass: 'option-button yes-no'},
        { name: 'subserv-question-yes', value: YES_BUTTON_VALUE, text: 'YES', cssClass: 'option-button yes-no'}],
      required: true,
    });

    this.listenTo(this.subServiceQuestionModel, 'change:question_answer', (model, value) => {
      if (value === YES_BUTTON_VALUE) this.getUI('subServButton').removeClass('hidden');
      else this.getUI('subServButton').addClass('hidden');
    });
  },

  getRoutingFragment() {
    return 'page/9';
  },

  onRender() {
    const dispute = disputeChannel.request('get');
    const activePayment = paymentsChannel.request('get:payment:intake');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');

    if (!activePayment) {
      console.log(`[Error] No active payment for payment receipt page`);
      Backbone.history.navigate('#page/8', {trigger: true, replace: true});
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
      messageSubType: configChannel.request('get', activePayment.isApproved() ? 'EMAIL_MESSAGE_SUB_TYPE_INTAKE_PAID' : 'EMAIL_MESSAGE_SUB_TYPE_INTAKE_UNPAID')
    }));

    this.showChildView('reviewPageReceipt', new IntakeReviewReceipt());

    if (this.showSubServeRouting) {
      this.showChildView('subServiceQuestionRegion', new PageItemView({
        stepText: `Would you like to submit an application for substituted service?`,
        subView: new QuestionView({ model: this.subServiceQuestionModel }),
        forceVisible: true,
      }));
    }
  },

  onAttach() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const printAndEmailContent = $('.receipt-container__content__html').html();
    const receiptView = this.getChildView('receiptContainerRegion');
    receiptView.displayHtml = printAndEmailContent;
    receiptView.getChildView('printableIframe').printPageBody = printAndEmailContent;
    receiptView.autoEmailReceipt();

    if (activePayment.isApproved()) {
      emailsChannel.request('save:receipt', {
        participant_id: primaryApplicant ? primaryApplicant.id : null,
        receipt_body: printAndEmailContent,
        receipt_title: 'Application Submission',
        receipt_type: configChannel.request('get', 'RECEIPT_TYPE_INTAKE_SUBMISSION'),
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_ONLINE_INTAKE'),
      });
    }
  },

  clickMenu() {
    Backbone.history.navigate('#list', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  regions: {
    receiptContainerRegion: '.payment-page-receipt-container',
    subServiceQuestionRegion: '.payment-page-subservice-question',
    reviewPageReceipt: '.review-page-receipt'
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
    subServButton: '.payment-page-subservice-request'
    })
  },

  requestSubServ() {
    const daSubServActionId = configChannel.request('get', 'EXTERNAL_DA_ACTION_SUBSERV');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const extSiteId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_INTAKE');
    const submitterName = primaryApplicant.getContactName();
    sessionChannel.trigger('redirect:disputeAccess', primaryApplicant.get('access_code'), daSubServActionId, extSiteId, submitterName);
  },

  template() {
    return <div className="step payment-type-description">
      
      <div className="payment-page-title hidden-print">{PAGE_TITLE}</div>
      <p className="payment-page-receipt-container-top-text">Your application for dispute resolution has been submitted. Please note your file number and dispute access code. </p>
      <div className="payment-page-receipt-container">{this.receiptPageHtml()}</div>

      {this.renderJsxSubServeSection()}

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
    </div>;
  },

  renderJsxSubServeSection() {
    if (!this.showSubServeRouting) return;
    return (
      <div className="payment-page-subservice-container">
        <p className="payment-page-subservice-description"><span className="warning-label--with-icon">IMPORTANT:</span> You <b>must</b> be able to serve documents and evidence to each tenant in a <a className='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution'>method allowed by BC tenancy laws</a>. If you cannot serve documents in person, do not have the service address of each tenant or do not have a written agreement with the tenant to serve documents by email, you can apply for substituted service.</p>
        <p className="payment-page-subservice-respondents">You have indicated that you do not have the addresses for the following respondent(s)</p>
        <ul>
        {
          this.respondents.filter(p => !p.hasContactAddress() && p.get('known_contact_fields'))
            .map(p => <li className="payment-page-subservice-respondent"><b>{p.getDisplayName()}</b> - {Formatter.toKnownContactReviewDisplay(p.get('known_contact_fields'))}</li>)
        }
        </ul>
        <div className="payment-page-subservice-question"></div>
        <div className="payment-page-subservice-request hidden">
          <p className="payment-page-subservice-button-header">Click the button below to request substituted service. A separate request must be made for each respondent.</p>
          <button className="btn btn-standard btn-lg payment-page-subservice-question-button" onClick={() => this.requestSubServ()}>Request Substituted Service</button>
        </div>
      </div>
    );
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
        The following is your application receipt (and payment receipt, if applicable), file number and dispute access code. Make sure that you keep this information for your records. You will be contacted by the Residential Tenancy Branch when your application has been processed. Keep your BCeID login information in a safe place so that you can return to this application and make changes if requested by the Residential Tenancy Branch.
	    </p>
      <div className="spacer-block-20"></div>

      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>File number: </span><b>{dispute.get('file_number')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Dispute access code: </span><b>{primaryApplicant ? primaryApplicant.get('access_code') : '-'}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Act: </span>{dispute.isMHPTA() ? 'MHPTA (Manufactured home or trailer)' : 'RTA (Residential)'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Applicant type: </span>{dispute.isLandlord() ? 'Landlord' : 'Tenant'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Primary applicant: </span>{primaryApplicant ? primaryApplicant.getContactName() : '-'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Package provided: </span>{packageProvidedText}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date submitted: </span>{dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : '-'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Payment submitted: </span>{paymentSubmittedDisplay}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Payment amount: </span>{renderJsxPaymentAmountDisplay()}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Payment method: </span>{paymentMethodDisplay}</p>

      {!payment.isApproved() ? (
        <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{ padding: '0px', borderCollapse: 'collapse' }}><tbody>
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

      <div className={`review-page-receipt receipt-mode`} style={{ marginTop: '30px' }}></div>
    </>
  },
});

_.extend(IntakePagePaymentReceiptView.prototype, ViewJSXMixin);
export default IntakePagePaymentReceiptView;
