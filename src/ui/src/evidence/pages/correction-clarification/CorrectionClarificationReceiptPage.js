import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import './CorrectionClarificationPageReceipt.scss';
import ApplicantViewDispute from '../../../core/components/ivd/ApplicantViewDispute';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

const CorrectionClarificationReceiptView = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.documentsChannel = Radio.channel('documents');
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.RECEIPT_FONT_SIZE_PX = this.model.getReceiptFontSizePx();
    this.dispute = disputeChannel.request('get');
    this.participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.receiptData = this.model.get('receiptData');
    this.affectedDocDisplay = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    this.isCorrection = this.receiptData.docRequestModel.get('request_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CORRECTION');
    
    this.receiptTitle = `${this.isCorrection ? "Correction" : "Clarification"} Request Submission`;
    this.pageTitle = `${this.isCorrection ? "Correction" : "Clarification"} request submitted`;

    emailsChannel.request('save:receipt', {
      participant_id: this.participant ? this.participant.id : null,
      receipt_body: this.receiptPageHtml(),
      receipt_title: this.receiptTitle,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', this.isCorrection ? 'RECEIPT_SUBTYPE_DA_CORRECTION' : 'RECEIPT_SUBTYPE_DA_CLARIFICATION'),
    });
  },

  className: `${PageView.prototype.className} da-receipt-page ccr__page`,
  regions: {
    disputeRegion: '.ccr__overview-container',
    receiptContainerRegion: '.ccr__receipt-container',
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

  clickMenu() {
    Backbone.history.navigate('#access', {trigger: true});
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  getCorrectionType(type) {
    const typeDisplay = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY') || {};
    return typeDisplay[type] || null;
  },

  getDocumentsToCorrect() {
    const affectedDocuments = this.receiptData.docRequestModel.get('affected_documents');
    if (!affectedDocuments) return;
    
    return this.affectedDocDisplay[affectedDocuments];
  },

  getAssociatedDocuments() {
    const outcomeDocGroupId = this.receiptData.docRequestModel.get('outcome_doc_group_id');
    const outcomeDocGroups = this.documentsChannel.request('get:all').models;
    if (!outcomeDocGroupId) return
    let groupIndex = '';
    outcomeDocGroups.forEach((model, index) => { if(model.get('outcome_doc_group_id') === outcomeDocGroupId) groupIndex = index })
    
    return outcomeDocGroups[groupIndex].getGroupRequestTitleDisplay();
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
      messageSubType: configChannel.request('get', this.isCorrection ? 'EMAIL_MESSAGE_SUB_TYPE_DA_CORRECTION' : 'EMAIL_MESSAGE_SUB_TYPE_DA_CLARIFICATION')
    }));
  },

  template() {
    return (
      <>
        <div className="ccr__overview-container hidden-print"></div>

        <div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
          <span className="dac__page-header__title">{this.pageTitle}</span>
        </div>
        <div className="ccr__receipt-container"></div>

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
    const { docRequestModel } = this.receiptData;
    return renderToString(<>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {this.receiptTitle}</h4>
      
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following was submitted to the Residential Tenancy Branch.{showIVDReceiptLanguage ? <span> You can view your submitted request and outcome by <a href={configChannel.request('get', 'INTAKE_URL')} target="_blank" rel="noopener noreferrer">logging in online with the BceID that was used to create this application</a>.</span> : ''} For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	    </p>

      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>File number: </span> <b>{this.dispute.get('file_number')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Access code: </span> <b>{this.dispute.get('accessCode')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Added for: </span> {isApplicant ? 'Applicant' : 'Respondent'} { isLandlord ? 'Landlord' : 'Tenant' } - Initials { participantInitials}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Submitted by: </span> {this.model.get('submitterName')}</p>	
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Associated document(s): </span> {this.getAssociatedDocuments()}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date document(s) received: </span> { Formatter.toDateDisplay(docRequestModel.get('date_documents_received')) }</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date of submission: </span> { Formatter.toDateDisplay(Moment()) }</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Document(s) to {this.isCorrection ? "correct" : "clarify"}: </span> { this.getDocumentsToCorrect() }</p>
      <span className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Document copies provided: </span>{this.renderJsxFileList()}</span>

      {this.renderJsxItemList()}
    </>)
  },

  renderJsxItemList() {
    const { docRequestModel } = this.receiptData;
    const requestItems = docRequestModel.get('outcome_document_req_items');
    if (!requestItems) return;

    return <>
      {requestItems.map((item, index) => {
        return <table key={++index} cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{margin: '0px', padding: '0px', borderCollapse: 'collapse'}}><tr><td className="er-nesttable-wrapper-td" style={{padding: '15px 0px 10px 0px'}}>
          <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable" style={{margin: '0px', padding: '0px', borderCollapse: 'collapse'}}>
            <tbody>
            <tr className="er-nesttable-tr">
              <td className="er-nesttable-header" style={{ minWidth: '110px', width: '10%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', border: '1px solid #e3e3e3', backgroundColor: '#f0f0f0', padding: '4px', whiteSpace: 'nowrap'}}>{this.isCorrection ? "Correction" : "Clarification"}{this.isCorrection ?`: ${Formatter.toLeftPad(index)}` : null }</td>
              <td className="er-nesttable-subheader" style={{padding: '4px 4px 4px 10px', width: 'auto', border: '1px solid #e3e3e3'}}>{ this.isCorrection ? this.getCorrectionType(item.get('item_type')) : null }</td>
            </tr>
            <tr className="er-nesttable-tr">
              <td colSpan="2" className="er-nesttable-item" style={{ padding: '8px', width: '100%', border: '1px solid #e3e3e3'}}>{item.get('item_description')}</td>
            </tr>
            </tbody>
          </table>
          </td></tr></table>;
      })}
    </>;
  },

  renderJsxFileList() {
    const files = this.receiptData.disputeEvidenceModel.get('files');
    if (files.where({file_id: null}).length > 0 || files.isEmpty()) return <span style={{ fontSize: this.RECEIPT_FONT_SIZE_PX }}>-</span> //if no valid uploaded files, return -
    
    return <span dangerouslySetInnerHTML={{__html: Formatter.toUploadedFilesDisplay(files) }}></span>;
  },

});

_.extend(CorrectionClarificationReceiptView.prototype, ViewJSXMixin);
export { CorrectionClarificationReceiptView }
