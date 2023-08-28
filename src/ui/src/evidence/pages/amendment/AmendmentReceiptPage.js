import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import ApplicantViewDispute from '../../../core/components/ivd/ApplicantViewDispute';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const emailsChannel = Radio.channel('emails');
const Formatter = Radio.channel('formatter').request('get');

const AmendmentReceiptPage = PageView.extend({
	className: `${PageView.prototype.className} da-receipt-page amendment-receipt`,

  initialize() {
    this.template = this.template.bind(this);

    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.receiptData = this.model.get('receiptData');
    this.receiptTitle = `Dispute Amendment Submission`;
    this.dispute = disputeChannel.request('get');
    this.participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));

    emailsChannel.request('save:receipt', {
      participant_id: this.participant ? this.participant.id : null,
      receipt_body: this.receiptPageHtml(),
      receipt_title: this.receiptTitle,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_DA_AMENDMENT'),
    });
  },

	clickMenu() {
    Backbone.history.navigate('#access', {trigger: true});
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

	onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${this.receiptTitle} Receipt`,
      containerTitle: this.receiptTitle,
      emailUpdateParticipantId: this.participant.id,
      autoSendEmail: true,
      participantSaveModel: ExternalParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_AMENDMENT')
    }));
	},

  regions: {
    disputeRegion: '.amendment-receipt__overview-container',
    receiptContainerRegion: '.dac__receipt-container',
  },

	ui() {
    return _.extend({}, PageView.prototype.ui, {
      menu: '.da-receipt-main-menu-btn',
      logout: '.receipt-logout-btn',
    });
  },

  events: {
    'click @ui.menu': 'clickMenu',
    'click @ui.logout': 'clickLogout',
  },

	template() {
		return (
			<>
				<div className="amendment-receipt__overview-container hidden-print"></div>
				
				<div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
          <span className="dac__page-header__title">Dispute Amendment Submitted</span>
        </div>

        <div className="dac__receipt-container"></div>

				<div className="dac__page-buttons hidden-print">
          <button className="btn btn-standard btn-lg da-receipt-main-menu-btn">Main Menu</button>
          <span className="receipt-logout-btn">Logout</span>
        </div>
        <div className="spacer-block-10"></div>
			</>
		)
	},

  receiptPageHtml() {
    const isLandlord = !this.participant || this.participant.isLandlord();
    const isApplicant = this.participant && this.participant.isApplicant();
    const participantInitials = this.participant && this.participant.getInitialsDisplay() ? this.participant.getInitialsDisplay()  : '-';
    const showIVDReceiptLanguage = ApplicantViewDispute.isIvdEnabled();

    return renderToString(<>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {this.receiptTitle}</h4>

      <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}>
      <tbody><tr><td className="er-nesttable-wrapper-td" style={{ padding: '15px 0px 10px 0px' }}>
        <table cellPadding="0" cellSpacing="0" width="100%" className="er-alert-table" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td className="er-warning-image" style={{ width: '55px', padding: '5px', verticalAlign: 'middle' }}>
                <img src={`${this.COMMON_IMAGE_ROOT}Icon_Reminder_email.png`} className="er-warning-icon" style={{ width: '55px', height: '42px' }}/>
              </td>
              <td className="er-warning-text" style={{ color: '#de2f3c', padding: '5px' }}>
                <span className="showmobile">Don't forget!&nbsp;</span>
                Keep a copy of the request(s) for amendment and submission receipt to refer to at the hearing. You must also serve an identical copy of your request(s) for amendment and any supporting evidence to the other party(s).
              </td>
            </tr>
          </tbody>
        </table>
      </td></tr></tbody>
      </table>
      
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following was submitted to the Residential Tenancy Branch. {showIVDReceiptLanguage ? <span> You can view your submitted request and outcome by <a href={configChannel.request('get', 'INTAKE_URL')} target="_blank" rel="noopener noreferrer">logging in online with the BceID that was used to create this application</a>.</span> : ''} For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	    </p>

      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>File number: </span> <b>{this.dispute.get('file_number')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Access code: </span> <b>{this.dispute.get('accessCode')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Added for: </span> {isApplicant ? 'Applicant' : 'Respondent'} { isLandlord ? 'Landlord' : 'Tenant' } - Initials { participantInitials}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Submitted by: </span> {this.model.get('submitterName')}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date of submission: </span> { Formatter.toDateDisplay(Moment()) }</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Submitted forms: </span>{this.renderJsxFileList(this.receiptData.formEvidenceModel)}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Supporting evidence: </span>{this.renderJsxFileList(this.receiptData.bulkEvidenceModel)}</p>
    </>)
  },
  
  renderJsxFileList(disputeEvidence) {
    const files = disputeEvidence.get('files');
    if (files.where({file_id: null}).length > 0 || files.isEmpty()) return <span style={{ fontSize: this.RECEIPT_FONT_SIZE_PX }}>-</span> //if no valid uploaded files, return -
    
    return <span dangerouslySetInnerHTML={{__html: Formatter.toUploadedFilesDisplay(files) }}></span>;
  },

});

_.extend(AmendmentReceiptPage.prototype, ViewJSXMixin);
export { AmendmentReceiptPage }