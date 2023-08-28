import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import Icon_Warning from '../../static/Icon_AlertSml.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import FileListJsx from '../../../core/components/files/file-list/FileListJsx';
import ReceiptTableWithPaginationJsx from './ReceiptTableWithPaginationJsx';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const participantsChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const documentsChannel = Radio.channel('documents');
const emailsChannel = Radio.channel('emails');
const disputeChannel = Radio.channel('dispute');
const flagsChannel = Radio.channel('flags');

const SUB_SERVICE_ALLOWED_RECEIPT_SUB_TYPES = [45];
const CCR_ALLOWED_RECEIPT_SUB_TYPES = [46, 47, 48, 64, 65, 66];

const IntakeDisputeSubmittedRequests = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);
    this.subServices = noticeChannel.request('get:subservices').filter(participant => participantsChannel.request('get:participant', participant.get('service_by_participant_id'))?.isApplicant());
    this.outcomeDocRequests = documentsChannel.request('get:requests').filter(participant => participantsChannel.request('get:participant', participant.get('submitter_id'))?.isApplicant());
    this.hasReceipts = emailsChannel.request('get:receipts')?.length;
    this.hasDecisionDocs = documentsChannel.request('get:all')?.filter(doc => doc.isCompleted() && doc.getOutcomeFiles().filter(docFile => docFile.getDeliveries().filter(delivery => delivery.get('is_delivered'))))?.length;
    this.reviewHearingFlag = flagsChannel.request('get')?.filter((flag) => flag.isReview() && flag.isActive())?.[0];
    //SS flag stores participant id of service_to participant, so we need to check if id belongs to respondent, as that indicates the request was created by an applicant
    this.subServiceFlag = flagsChannel.request('get')?.filter((flag) => flag.isSubServiceRequested() && flag.isActive() && participantsChannel.request('get:participant', flag.get('flag_participant_id'))?.isRespondent())?.[0];
    this.correctionFlag = flagsChannel.request('get')?.filter((flag) => flag.isCorrection() && flag.isActive() && participantsChannel.request('get:participant', flag.get('flag_participant_id'))?.isApplicant())?.[0];
    this.clarificationFlag = flagsChannel.request('get')?.filter((flag) => flag.isClarification() && flag.isActive() && participantsChannel.request('get:participant', flag.get('flag_participant_id'))?.isApplicant())?.[0];
    this.isReviewRequestFlag = flagsChannel.request('get')?.filter((flag) => flag.isReviewRequest() && flag.isActive() && participantsChannel.request('get:participant', flag.get('flag_participant_id'))?.isApplicant())?.[0];
    this.dispute = disputeChannel.request('get');
    
    this.subServiceReceipts = emailsChannel.request('get:receipts')?.filter(receipt => participantsChannel.request('get:participant', receipt.get('participant_id'))?.isApplicant() 
    && SUB_SERVICE_ALLOWED_RECEIPT_SUB_TYPES.includes(receipt.get('receipt_subtype')));
    this.subServiceReceiptsIndex = 0;
    this.count = 20;

    this.ccrReceipts = emailsChannel.request('get:receipts')?.filter(receipt => participantsChannel.request('get:participant', receipt.get('participant_id'))?.isApplicant() 
    && CCR_ALLOWED_RECEIPT_SUB_TYPES.includes(receipt.get('receipt_subtype')));
    this.ccrReceiptsIndex = 0;
  },

  clickFilename(fileModel) {
    fileModel.download();
  },

  print() {
    window.print();
  },

  prevPage(index) {
    if (index <= 0) return;
    index -= 20;
    this.render();
  },

  nextPage(index, count, receiptLength) {
    if ((index) + count >= receiptLength) return;
    index += 20;
    this.render();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  routeToReceiptsView() {
    if (!this.hasReceipts) return;
    Backbone.history.navigate('view/receipts', { trigger: true });
  },

  routeToDecisionsView() {
    if (!this.hasDecisionDocs) return;
    Backbone.history.navigate('view/documents', { trigger:true })
  },

  template() {
    return (
      <div className="intake-dispute">
        
        <div className="intake-dispute__page-title hidden-print">
          <span>My Requests</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        {DisputePrintHeaderJsx(`File Number: ${disputeChannel.request('get')?.get('file_number')} My Requests`)}

        <p className="intake-dispute__description">
          This is a record of requests that you have submitted for substituted service, corrections, clarifications and/or review considerations.
          <br/>
          You can view status updates here, and decision(s) will be uploaded to the <span className={`${this.hasDecisionDocs ? `general-link` : ''} hidden-print`} onClick={() => this.routeToDecisionsView()}>Decisions and Orders</span> tab when it is completed.
        </p>

        { this.renderJsxDisputeWarnings() }
        { this.renderJsxSubServRequests() }
        { ReceiptTableWithPaginationJsx(this.subServiceReceipts, this.subServiceReceiptsIndex, this.count, this.prevPage.bind(this, this.subServiceReceiptsIndex), this.nextPage.bind(this, this.subServiceReceiptsIndex, this.count, this.subServiceReceipts?.length)) }
        { this.renderJsxCCRRequests() }
        { ReceiptTableWithPaginationJsx(this.ccrReceipts, this.ccrReceiptsIndex, this.count, this.prevPage.bind(this, this.ccrReceiptsIndex), this.nextPage.bind(this, this.ccrReceiptsIndex, this.count, this.ccrReceipts?.length)) }
      </div>
    );
  },

  renderJsxDisputeWarnings() {
    const renderReviewWarning = () => {
      if (!this.reviewHearingFlag) return;

      const participantDisplay = () => {
        const participant = participantsChannel.request('get:participant', this.reviewHearingFlag?.get('flag_participant_id'));
        const participantInitialsDisplay = participant?.getDisplayName();
        const isTenant = participant?.isApplicant() ? this.dispute.isTenant() : !this.dispute.isTenant();
        
        if (!participant) return '';
        return <span>by {participantInitialsDisplay} - {isTenant ? 'Tenant' : 'Landlord'}</span>
      }

      return (
        <div className="intake-dispute__warning">
          <img className="intake-dispute__warning__icon" src={Icon_Warning} />
          <span className="intake-dispute__warning__text">
            Dispute Resolution File Number <b>{this.dispute.get('file_number')}</b> has an open application for review consideration that was filed { participantDisplay() } on { Formatter.toDateDisplay(this.reviewHearingFlag.get('created_date')) }.
            Orders made as a result of this dispute may not be enforced until the Residential Tenancy Branch has made a decision about the application for review consideration. 
            Learn more about applications for review consideration on the <a className="static-external-link" href="#" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Residential Tenancy Branch website</a>.
          </span>
        </div>
      )
    }

    const renderSubServiceWarning = () => {
      if (!this.subServiceFlag) return;
      return (
        <div className="intake-dispute__warning">
          <img className="intake-dispute__warning__icon" src={Icon_Warning} />
          <span className="intake-dispute__warning__text">
            Dispute Resolution File Number <b>{this.dispute.get('file_number')}</b> has an open request for substituted service.
          </span>
        </div>
      )
    }

    const renderCorrectionWarning = () => {
      if (!this.correctionFlag) return
      return (
        <div className="intake-dispute__warning">
          <img className="intake-dispute__warning__icon" src={Icon_Warning} />
          <span className="intake-dispute__warning__text">
            Dispute Resolution File Number <b>{this.dispute.get('file_number')}</b> has an open request for correction.
          </span>
        </div>
      )
    }

    const renderClarificationWarning = () => {
      if (!this.clarificationFlag) return;
      return (
        <div className="intake-dispute__warning">
          <img className="intake-dispute__warning__icon" src={Icon_Warning} />
          <span className="intake-dispute__warning__text">
            Dispute Resolution File Number <b>{this.dispute.get('file_number')}</b> has an open request for clarification.
          </span>
        </div>
      )
    }

    return (
      <div className="intake-dispute__warning__wrapper">
        { renderReviewWarning() }
        { renderSubServiceWarning() }
        { renderCorrectionWarning() }
        { renderClarificationWarning() }
      </div>
    )
  },

  renderJsxSubServRequests() {
    const serviceStatuses = configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DISPLAY');
    const serviceSources = configChannel.request('get', 'REQUEST_SOURCE_DISPLAY');

    if (!this.subServices?.length) return;

    return (
      <>
        <div className="intake-dispute__requests-title"><b>Substituted Service</b></div>
        <p className="intake-dispute__description">
          For full details regarding your request(s), please refer to the Submission Receipts below.
        </p>

        {this.subServices.map(ss => {     
          const serviceFiles = filesChannel.request('get:filedescription', ss.get('request_method_file_desc_id'))?.getUploadedFiles();
          
          return (
            <div className="intake-dispute__item-wrapper">
              <div className="review-label intake-dispute__hearing-header">Substituted Service Request</div>
              
              <div className="intake-dispute__label--break-word">
                <span className="review-label">Requested by:</span>
                <span>{participantsChannel.request('get:participant:name', ss.get('service_by_participant_id'))} - {Formatter.toDateDisplay(ss.get('created_date'))}</span>
              </div>

              <div className="intake-dispute__label">
                <span className="review-label">Status:</span>
                <span>{serviceStatuses[ss.get('request_status')]} {ss.isStatusApproved() || ss.isStatusDenied() ? <span>(See <span className={`${this.hasDecisionDocs ? `general-link` : ''} hidden-print`} onClick={() => this.routeToDecisionsView()}>associated decision</span>)</span> : null}</span>
              </div>

              <div className="intake-dispute__label">
                <span className="review-label">Requested source:</span>
                <span>{serviceSources[ss.get('request_source')]}</span>
              </div>

              <div className="intake-dispute__label--break-word">
                <span className="review-label">Service to:</span>
                <span>{participantsChannel.request('get:participant:name', ss.get('service_to_participant_id'))}</span>
              </div>

              <div className="intake-dispute__label">
                <span className="review-label">Methods confirmed will not work:</span>
                <span>{ss.get('request_additional_info')}</span>
              </div>

              <div className="intake-dispute__label">
                <span className="review-label">Source documents:</span>
                <span>{FileListJsx(serviceFiles, this.clickFilename)}</span>
              </div>
            </div>
          )
        })}
      </>
    )
  },

  renderJsxCCRRequests() {
    const docRequestStatuses = configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_DISPLAY');
    const affectedDocDisplay = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY')

    if (!this.outcomeDocRequests?.length) return;

    return (
      <>
        <div className="intake-dispute__requests-title"><b>Correction, Clarification and Review Consideration</b></div>
        <p className="intake-dispute__description">
          For full details regarding your request(s), please refer to the Submission Receipts below.
        </p>

        {this.outcomeDocRequests.map(docRequest => {
          const docRequestSourceFiles = filesChannel.request('get:filedescription', docRequest.get('file_description_id'))?.getUploadedFiles();
          const headerText = docRequest.isClarification() ? 'Clarification Request' : docRequest.isCorrection() ? 'Correction Request' : 'Review Request';
          const outcomeDocGroupModel = docRequest.getOutcomeDocGroup();

          return <div className="intake-dispute__item-wrapper">
            <div className="review-label intake-dispute__hearing-header">{headerText}</div>
            
            <div className="intake-dispute__label--break-word">
              <span className="review-label">Requested by:</span>
              <span>{docRequest.get('submitter_id') ? participantsChannel.request('get:participant:name', docRequest.get('submitter_id')) : '-'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Status:</span>
              <span>{docRequest.get('request_status') ? <span>{docRequestStatuses[docRequest.get('request_status')]}{docRequest.isStatusCompleted() ? <span>&nbsp;(See <span className={`${this.hasDecisionDocs ? `general-link` : ''} hidden-print`} onClick={() => this.routeToDecisionsView()}>associated decision</span>)</span> : null}</span> : 'Received'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Associated document(s):</span>
              <span>{outcomeDocGroupModel ? outcomeDocGroupModel.getGroupRequestTitleDisplay() : '-'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Affected document(s):</span>
              <span>{docRequest.get('affected_documents') ? affectedDocDisplay[docRequest.get('affected_documents')] : '-'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Request source:</span>
              <span>{docRequest.get('request_source') ? docRequest.getSourceDisplay() : '-'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Date document(s) received by requestor:</span>
              <span>{docRequest.get('date_documents_received') ? Formatter.toDateDisplay(docRequest.get('date_documents_received')) : '-'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Date request received:</span>
              <span>{docRequest.get('request_date') ? Formatter.toDateDisplay(docRequest.get('request_date')) : '-'}</span>
            </div>

            <div className="intake-dispute__label">
              <span className="review-label">Source documents:</span>
              <span>{FileListJsx(docRequestSourceFiles, this.clickFilename)}</span>
            </div>

          </div>
        })}
      </>
    )
  },

});

_.extend(IntakeDisputeSubmittedRequests.prototype, ViewJSXMixin);
export default IntakeDisputeSubmittedRequests;