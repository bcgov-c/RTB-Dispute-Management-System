import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PageView from '../../../core/components/page/Page';
import ExternalParticipantModel from '../../components/external-api/ExternalParticipant_model';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './SubstitutedServicePage.scss';

const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');
const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');

const SubstitutedServiceReceiptPage = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.receiptData = this.model.get('receiptData');
    this.dispute = disputeChannel.request('get');
    this.participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.receiptTitle = 'Substituted Service Request Submission';

    emailsChannel.request('save:receipt', {
      participant_id: this.participant ? this.participant.id : null,
      receipt_body: this.receiptPageHtml(),
      receipt_title: this.receiptTitle,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_SUB_SERVICE'),
    });
  },

  className: `${PageView.prototype.className} da-receipt-page`,
  regions: {
    disputeRegion: '.subserv__overview-container',
    receiptContainerRegion: '.subserv__receipt-container',
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

  receiptPageHtml() {
    const isLandlord = !this.participant || this.participant.isLandlord();
    const isApplicant = this.participant && this.participant.isApplicant();
    const participantInitials = this.participant && this.participant.getInitialsDisplay() ? this.participant.getInitialsDisplay()  : '-';
    const { substitutedServiceModel, serviceTo, hasEmailServiceAgreement } = this.receiptData;

    return renderToString(<>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: Request for substituted service</h4>

      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	    </p>

      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>File number: </span> <b>{this.dispute.get('file_number')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Access code: </span> <b>{this.dispute.get('accessCode')}</b></p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Added for: </span> {isApplicant ? 'Applicant' : 'Respondent'} { isLandlord ? 'Landlord' : 'Tenant' } - Initials { participantInitials}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Submitted by: </span> {this.model.get('submitterName')}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date of submission: </span> { Formatter.toDateDisplay(Moment()) }</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Associated document(s): </span> {this.renderJsxAssociatedDocuments()}</p>
      <p className={`er-text ${substitutedServiceModel.get('request_doc_other_description') ? '' : 'hidden'}`} style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Associated document(s) description: </span> {substitutedServiceModel.get('request_doc_other_description')}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>For service to: </span> {serviceTo}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Email service agreement exists: </span> {hasEmailServiceAgreement ? 'Yes' : 'No'}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Existing available methods: </span> {substitutedServiceModel.get('request_additional_info')}</p>
      <p className={`er-text ${substitutedServiceModel.get('failed_method1_description') ? '' : 'hidden'}`} style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Why existing methods won't work: </span> {substitutedServiceModel.get('failed_method1_description')}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Requested substituted service method: </span> {substitutedServiceModel.get('requested_method_description')}</p>
      <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Why requested method will work: </span> {substitutedServiceModel.get('requested_method_justification')}</p>
      <span className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Evidence of method: </span> {this.renderJsxFileList()}</span>
    </>)
  },

  renderJsxAssociatedDocuments() {
    const { substitutedServiceModel, serviceQuadrant } = this.receiptData;
    
    const renderDocs = () => {
      const { substitutedServiceModel } = this.receiptData;
      if (substitutedServiceModel.get('request_doc_other_description')) return;

      return <>
        <ul>
          {
            serviceQuadrant.displayedDocumentList.map((document, index) => {
              return <li key={index}>{document}</li>;
            })
          }
        </ul>
      </>
    }

    return <>
      <span>{substitutedServiceModel.get('request_doc_other_description') ? 'Other' : substitutedServiceModel.getDocTypeDisplay()}</span>
      {renderDocs()}
    </>
  },

  renderJsxFileList() {
    const { disputeEvidenceModel } = this.receiptData;
    const files = disputeEvidenceModel.get('files');
    if (files.where({file_id: null}).length > 0 || files.isEmpty()) return <span style={{ fontSize: this.RECEIPT_FONT_SIZE_PX }}>-</span> //if no valid uploaded files, return -
    
    return <span dangerouslySetInnerHTML={{__html: Formatter.toUploadedFilesDisplay(files) }}></span>
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
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_SUB_SERVICE')
    }));
  },

  template() {
    return (
      <>
        <div className="subserv__overview-container hidden-print"></div>
        <div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
          <span className="dac__page-header__title">Substituted Service request submitted</span>
        </div>
        <div className="subserv__receipt-container"></div>
        <div className="dac__page-buttons hidden-print">
          <button className="btn btn-standard btn-lg da-receipt-main-menu-btn">Main Menu</button>
          <span className="receipt-logout-btn">Logout</span>
        </div>
      </>
    )
  }
});

_.extend(SubstitutedServiceReceiptPage.prototype, ViewJSXMixin);
export { SubstitutedServiceReceiptPage }
