import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import ExternalParticipantModel from '../../components/external-api/ExternalParticipant_model';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const PAGE_TITLE = `Respondent service information submitted`;
const RECEIPT_TITLE = 'Respondent Service';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

const SubmitNoticeServicePageReceipt = PageView.extend({
  className: `${PageView.prototype.className} da-update-service-receipt-page da-receipt-page`,

  ui: {
    logoutButton: '.receipt-logout-btn',
    mainMenuButton: '.da-receipt-main-menu-btn',
    completeServiceButton: '.da-receipt-complete-service'
  },

  regions: {
    disputeRegion: '.dac__service__dispute-overview',
    receiptContainerRegion: '.dac__service__receipt',
  },

  events: {
    'click @ui.mainMenuButton': 'clickMenu',
    'click @ui.logoutButton': 'clickLogout',
    'click @ui.completeServiceButton': 'clickCompleteService'
  },

  clickMenu() {
    Backbone.history.navigate('access', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  clickCompleteService() {
    // Disable the restriction that keeps us on receipt pages
    this.model.set('routingReceiptMode', false);
    // The "Complete Service" button always routes to the notice service views
    Backbone.history.navigate('notice/service/list', { trigger: true, replace: true });
  },

  initialize(options) {
    this.mergeOptions(options, ['submissionTitle', 'submissionMessage', 'serviceListRoute']);
    this.receiptData = this.model.getReceiptData() || {};
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');

    this.noticeServiceModel = this.receiptData.noticeServiceModel || new Backbone.Model();
    this.submittedNoticeFiles = this.receiptData.submittedNoticeFiles || [];
    this.submittedEmailAddress = this.receiptData.submittedEmailAddress;
    this.trackingNumber = this.receiptData.trackingNumber;

    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));

    emailsChannel.request('save:receipt', {
      participant_id: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      receipt_body: renderToString(this.receiptPageHtml()),
      receipt_title: RECEIPT_TITLE,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_DA_SERVICE_PROOF'),
    });
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      emailUpdateParticipantId: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      autoSendEmail: true,
      participantSaveModel: ExternalParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_RESPONDENT_SERVICE'),
      submissionTitle: this.submissionTitle,
      submissionMessage: this.submissionMessage
    }));
  },

  template() {
    const dispute = disputeChannel.request('get');
    const activeNotice = noticeChannel.request('get:active');
    const warningText = dispute.isNonParticipatory() ? 
      `You haven't finished providing proof that you served the Notice of Dispute. We can't schedule your hearing until you do. Click 'Complete Proof of Service' to finish providing it.` : 
      `You haven't finished providing proof that you served the Notice of Dispute.  Click 'Complete Proof of Service' to finish providing your service information for the remaining respondent(s).`
    const hasMoreProofOfService = activeNotice && activeNotice.getUnservedServices().length > 0
    const proofOfServiceWarningJsx = () => {
      if (!hasMoreProofOfService) return;
      return <p className="error-block warning">{warningText}</p>
    };
    const renderProofOfServiceButtonJsx = () => {
      if (!hasMoreProofOfService) return;
      return <button className="btn btn-lg btn-standard da-receipt-complete-service">Complete Proof of Service</button>;
    };
    return (
      <>
        <div className="dac__service__dispute-overview"></div>
        <div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__service"></span>
          <span className="dac__page-header__title">{PAGE_TITLE}</span>
        </div>
        <div className="dac__service__receipt"></div>
        {proofOfServiceWarningJsx()}
        <div className="spacer-block-30"></div>
        <div className="dac__page-buttons hidden-print">
          {renderProofOfServiceButtonJsx()}
          <button className={`btn btn-lg da-receipt-main-menu-btn ${hasMoreProofOfService ? 'btn-cancel' : 'btn-standard'}`}>Main Menu</button>
          <span className="receipt-logout-btn">Logout</span>
        </div>
        <div className="spacer-block-10"></div>
      </>
    )
  },

  receiptPageHtml() {
    const participant = participantsChannel.request('get:participant', this.noticeServiceModel.get('participant_id'));
    const participantInitials = participant ? participant.getInitialsDisplay() : '';
    const participantDisplay = `${participant.isTenant() ? 'Tenant' : 'Landlord'} - ${participantInitials} (Access Code ${participant.get('access_code')})`;
    const service_method = this.noticeServiceModel.get('service_method');
    const service_date = this.noticeServiceModel.get('service_date');
    const service_description = this.noticeServiceModel.get('service_description');
    const isApplicant = participant.isApplicant();
    const addedForDisplay = `${isApplicant ? 'Applicant' : 'Respondent'} ${(!(this.dispute.isLandlord() ^ isApplicant)) ? 'Landlord' : `Tenant - ${participant.getInitialsDisplay()}`}`
    const additionalServiceMethodText = this.submittedEmailAddress ? `to ${this.submittedEmailAddress}` :
      this.trackingNumber ? this.trackingNumber : 
      ''

    const receiptData = [
      ...(participant ? [{ label: 'Service to', value: participantDisplay }] : []),
      ...(service_method ? [{ label: 'Service method', value: `${Formatter.toNoticeMethodDisplay(service_method)} ${additionalServiceMethodText}` }] : []),
      ...(service_date ? [{ label: 'Date served', value: Formatter.toDateDisplay(service_date) }] : []),
      ...(this.submittedNoticeFiles && this.submittedNoticeFiles.getUploaded()?.length ? [{ label: 'Files submitted', value: Formatter.toUploadedFilesDisplay(this.submittedNoticeFiles) }] : []),
      ...(service_description ? [{ label: 'Service description', value: service_description }] : [])
    ];

    return (
      <>
        <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {RECEIPT_TITLE}</h4>

        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
          The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	      </p>

        <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '0px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Submission Information</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>File number: </span>&nbsp; <b>{this.dispute.get('file_number')}</b></p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Access code: </span>&nbsp; <b>{this.dispute.get('accessCode')}</b></p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Added for: </span>&nbsp; {addedForDisplay}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Submitted By: </span>&nbsp; {this.model.get('submitterName')}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Date of submission: </span>&nbsp; {Formatter.toDateDisplay(Moment())}</p>

        {receiptData.map((obj, index) => {
          return <p className="er-text" key={index} style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>{obj.label}: </span>&nbsp; <span dangerouslySetInnerHTML={{__html: obj.value || '' }}></span></p>;
        })}
      </>
    )
  },
});

_.extend(SubmitNoticeServicePageReceipt.prototype, ViewJSXMixin);
export default SubmitNoticeServicePageReceipt;
