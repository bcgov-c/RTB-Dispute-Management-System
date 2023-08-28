import Radio from 'backbone.radio';
import React from 'react';
import DecGenData from '../DecGenData';
import DisputeEvidenceModel from '../../../../core/components/claim/DisputeEvidence_model';
import GeneratedOutcomeDocSection from '../GeneratedOutcomeDocSection';
import DecisionHeaderBanner from './decision-template-header/DecisionHeaderBanner';
import { DecGenPageBreak } from './DecGenPageBreak';

const participantsChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default GeneratedOutcomeDocSection.extend({
  initialize(options) {
    this.mergeOptions(options, ['data', 'templateData']);
    this.template = this.template.bind(this);

    this.selectedRequest = this.data[DecGenData.currentCcrItem];
    const correctionsDocId = configChannel.request('get', 'file_types_corrections');
    this.isCorrection = correctionsDocId.includes(this.model.config.id);
    this.outcomeDocGroupModel = this.selectedRequest.getOutcomeDocGroup();
    this.docsCompletedDate = this.outcomeDocGroupModel?.get('doc_completed_date') ? Formatter.toFullDateDisplay(this.outcomeDocGroupModel.get('doc_completed_date')) : '**DocsCompletedDate';
    const OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    this.affectedDocDisplay = OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY?.[this.selectedRequest.get('affected_documents')] || `${this.isCorrection ? '**InsertDocumentsToCorrect' : '**InsertDocumentsToClarify'}`;
    this.submitterParticipant = participantsChannel.request('get:participant', this.selectedRequest.get('submitter_id'));
    this.submitterTypeDisplay = this.submitterParticipant ? (this.submitterParticipant.isLandlord() ? 'landlord' : 'tenant') : '**Landlord_Tenant';
    this.requestFileDescriptionModel = this.selectedRequest ? filesChannel.request('get:filedescription', this.selectedRequest.get('file_description_id')) : null;
    this.requestFiles = new DisputeEvidenceModel({ file_description: this.requestFileDescriptionModel });
  },

  getRequestTypeText(options={ capitalize: false, allCaps: false }) {
    const requestTypeText = this.isCorrection ? 'correction' : 'clarification';
    if (options.allCaps) return requestTypeText.toUpperCase();
    else if (options.capitalize) return requestTypeText.charAt(0).toUpperCase() + requestTypeText.slice(1);
    return requestTypeText;
  },

  template() {
    if (!this.selectedRequest) return;
    return this.finalizeRender(
      <>
        { this.renderJsxRequestInfo() }
        <br/>
        { this.renderJsxConclusion() }
      </>
    );
  },

  renderJsxRequestInfo() {
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();
    const latestHearing = this.data[DecGenData.hearings]?.getLatest();

    const renderRequestItems = () => {
      return this.selectedRequest.get('outcome_document_req_items').map(reqItem => {
        return (
          <div className="bottom_spacer_sm">
            <span className="light_text">Requested {reqItem.getTypeDisplay()?.toLowerCase()}: </span>
            <span>{this.selectedRequest.isSourceOffice() ?  `**Put${this.getRequestTypeText({ capitalize: true })}RequestHere` : reqItem.get('item_description')}</span>
          </div>
        )
      });
    }

    const renderRequestItemsDetail = () => {
      return this.selectedRequest.get('outcome_document_req_items').map(reqItem => {
        if (this.isCorrection) {
          return (
            <>
              <div>The following correction was requested in in this submission:</div>
              <ul className="list_block">
                <li>Requested {reqItem.getTypeDisplay()}: {reqItem.get('item_description')}</li>
              </ul>
              <div>**UseBelowIf_NotGrantedRecitationOfEvidence_AndDeleteThisLine</div>
              <p>
              ****I have considered all submissions of the {this.submitterTypeDisplay} and I find that the submissions are not in relation to any of the corrections provided for under the Act. 
              I find that these submissions are arguments and recitation of evidence that challenges the findings as contained in the Decision.****
              </p>
              <br/>
              <div>**IfOtherNotGrantedInsertAnalysisInsertHereAndDeleteThisLine</div>
              <br/>
              <p>****As a result of the above, I dismiss the Request for Correction****</p>
              <br/>
              <div>**UseBelowIf_Granted_AndDeleteThisLine</div>
              <p>****I have considered the submissions of the {this.submitterTypeDisplay} and I find that this is a valid request for correction under the Act.****</p>
              <br/>
              <div>**InsertGrantedCorrectionInfoHereAndDeleteThisLine</div>
            </>
          );
        } else {
          return (
            <>
              <div>The applicant requests clarification regarding the following:</div>
              <ul className="list_block">
                <li>Requested {reqItem.getTypeDisplay()}: {reqItem.get('item_description')}</li>
              </ul>
              <div>**UseBelowIf_NotGrantedRecitationOfEvidence_AndDeleteThisLine</div>
              <p>
                ****I have considered all submissions of the {this.submitterTypeDisplay} and I find that the submissions are not in relation to any of the corrections or clarifications provided for under the Act. 
                I find that these submissions are arguments and recitation of evidence that challenges the findings as contained in the Decision.****
              </p>
              <br/>
              <div>**InsertIf_NotGranted_OtherAnalysisHereAndDeleteThisLine</div>
              <p>****I find that the evidence does not support the Request for Clarification.****</p>
              <br/>
              <div>**_IfClarificationGranted_InsertClarificationHereAndDeleteThisLine</div>
            </>
          );
        }
      })
    }
    
    return (
      <>
        <div>{ latestHearing?.get('hearing_start_datetime') && !dispute.isNonParticipatory() ? `Date of Hearing: ${Formatter.toFullDateDisplay(latestHearing.get('hearing_start_datetime'))}` : '' }</div>
        <br/>
        {DecGenPageBreak}
        <div className="section_title">Request for {this.getRequestTypeText({ capitalize: true })}</div>
        <div>This decision is in response to the following request for {this.getRequestTypeText()} that was submitted to the Residential Tenancy Branch:</div>
        <br/>
        <div className="text_block">
          <span className="light_text">Request type: </span>
          <span>Request for {this.getRequestTypeText({ capitalize: true })}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Submitted By:&nbsp;</span>
          <span>{this.submitterParticipant.getDisplayName()}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Associated documents:&nbsp;</span>
          <span>{this.outcomeDocGroupModel?.getGroupRequestTitleDisplay() || `**Insert${this.getRequestTypeText({ capitalize: true })}DocumentsHere`}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Specified documents to {this.isCorrection ? 'correct' : 'clarify'}:&nbsp;</span>
          <span>{this.affectedDocDisplay}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Date document(s) received:&nbsp;</span>
          <span>{Formatter.toDateDisplay(this.selectedRequest.get('date_documents_received'))}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Date request received:&nbsp;</span>
          <span>{Formatter.toDateDisplay(this.selectedRequest.get('request_date'))}</span>
        </div>
          { this.selectedRequest.get('outcome_document_req_items').length ? 
          <div>
            {renderRequestItems()}
          </div> : 
          <>{<span>**Insert{this.getRequestTypeText({ capitalize: true })}RequestInfoHere</span>}</>}
        <div className="text_block">
          <span className="light_text">With the following supporting evidentiary material:&nbsp;</span>
          <span>{this.renderJsxFileList()}</span>
        </div>
        <br/>
        {DecGenPageBreak}
        {DecisionHeaderBanner(this.data)}
        <br/>
        <br/>
        <div className="doc_title">DECISION ON REQUEST FOR {this.getRequestTypeText({ allCaps: true })}</div>
        <br/>
        <div>The {this.submitterTypeDisplay} has requested a {this.getRequestTypeText()} to a {this.affectedDocDisplay} of the Residential Tenancy Branch dated {this.docsCompletedDate}.</div>
        <br/>
        <div>
          <div>Section {isMHPTA ? <>71 of the <i>Manufactured Home Park Tenancy Act</i></> : <>78 of the <i>Residential Tenancy Act</i></>} (the "Act"), enables the Residential Tenancy Branch to:</div>
          <ul className="list_block">
            {this.isCorrection ?
            <>
              <li>correct typographic, grammatical, arithmetic, or other similar errors in a decision or order, or</li>
              <li>deal with an obvious error or inadvertent omission in a decision or order.</li>
            </>
            : <li>clarify a decision or order.</li>
            }
          </ul>
        </div>
        {renderRequestItemsDetail()}
      </>
    );
  },

  renderJsxConclusion() {
    const signature = this.data[DecGenData.signature];
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();

    return (
      <>
        <div className="section_title">Conclusion</div>
        <div>{`**UseBelowIf_AllDismissed_AndDeleteThisLine`}</div>
        <p>****{this.isCorrection ? `The Request for correction is dismissed. The original decision and order stand` : `I find that the evidence does not support the Request for Clarification.`}****</p>
        <br/>
        <div>{`**UseBelowIf_Providing${this.getRequestTypeText({ capitalize: true })}_AndDeleteThisLine`}</div>
        <div>{this.isCorrection ? `**InsertGrantedCorrectionInfoHere` : <p>****I find that the evidence supports the Request for Clarification and I have clarified the decision.****</p>}</div>
        <br/>
        <p>
          This decision is made on authority delegated to me by the Director of the Residential Tenancy Branch under
          section 9.1(1) of the {isMHPTA ? <i>Manufactured Home Park Tenancy Act</i> : <i>Residential Tenancy Act</i>}.
        </p>
        <p>Dated: {Formatter.toFullDateDisplay(this.data[DecGenData.currentDocSet].get('doc_completed_date'))}</p>
        <p className="signature_container">
          {signature?.img ? <img src={signature.img} width={`${signature.dimensions?.width}`} height={`${signature.dimensions?.height}`} />
          : <>**InsertSignatureHere</>}
        </p>
      </>
    )
  },

  renderJsxFileList() {
    return this.requestFiles.get('files')?.length ?
      <ul className="list_block">
        {this.requestFiles.get('files').map(model => <li>{model.get('file_name')} {model.get('original_file_name') !== model.get('file_name') ? `(original file name ${model.get('original_file_name')})` : ''}</li>)}
      </ul>
      :
      "**InsertEvidentiaryMaterialHere"
  }

},{
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.currentCcrItem]: true,
      [DecGenData.signature]: true,
      [DecGenData.currentDocSet]: true,
      [DecGenData.hearings]: true,
    };
  }
});