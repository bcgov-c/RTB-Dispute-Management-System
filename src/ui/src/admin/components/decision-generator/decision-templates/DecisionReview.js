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
    this.outcomeDocGroupModel = this.selectedRequest.getOutcomeDocGroup();
    this.docsCompletedDate = this.outcomeDocGroupModel?.get('doc_completed_date') ? Formatter.toFullDateDisplay(this.outcomeDocGroupModel.get('doc_completed_date')) : '**DocsCompletedDate';
    const OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    this.affectedDocDisplay = OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY?.[this.selectedRequest.get('affected_documents')] || '**InsertDocumentsToReview';
    this.submitterParticipant = participantsChannel.request('get:participant', this.selectedRequest.get('submitter_id'));
    this.submitterTypeDisplay = this.submitterParticipant ? (this.submitterParticipant.isLandlord() ? 'landlord' : 'tenant') : '**Landlord_Tenant';
    this.reverseSubmitterTypeDisplay = this.submitterParticipant ? (this.submitterParticipant.isLandlord() ? 'tenant' : 'landlord') : '**Tenant_Landlord';
    this.requestFileDescriptionModel = this.selectedRequest ? filesChannel.request('get:filedescription', this.selectedRequest.get('file_description_id')) : null;
    this.requestFiles = new DisputeEvidenceModel({ file_description: this.requestFileDescriptionModel });
    this.isLateObj = {
      val: false,
      description: null,
      files: null,
    };
    this.isUnableToEndObj = {
      val: false,
      description: null,
      files: null,
    };
    this.isNewEvidenceObj = {
      val: false,
      description: null,
      files: null,
    };
    this.isFraudObj = {
      val: false,
      description: null,
      files: null,
    };

    this.setReviewAnswers();
  },

  setReviewAnswers() {
    const renderFileItems = (requestType) => {
      return this.selectedRequest.get('outcome_document_req_items').filter(reqItem => reqItem.get('item_type') === requestType).map(reqItem => {
        const fileDescription = filesChannel.request('get:filedescription', reqItem.get('file_description_id'));
        const file = new DisputeEvidenceModel({ file_description: fileDescription });
        return file.get('files').map((model) => {
          return `${model.get('file_name')} ${model.get('file_name') !== model.get('original_file_name') ? `(${model.get('original_file_name')})` : ''}`
        })
      });
    }

    if (this.selectedRequest) this.selectedRequest.get('outcome_document_req_items').forEach(reqItem => {
      if (reqItem.get('item_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_LATE_FILING')) {
        this.isLateObj = {
          val: true,
          description: reqItem.get('item_description') ? reqItem.get('item_description') : `**InsertFilingLateApplicantDescriptionHere`,
          files: `${reqItem.get('file_description_id') ? renderFileItems(configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_LATE_FILING')) : '**InsertFilingLateApplicantEvidenceHere'}`
        };
      } else if (reqItem.get('item_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_UNABLE_ATTEND')) {
        this.isUnableToEndObj = {
          val: true,
          description: reqItem.get('item_description') ? reqItem.get('item_description') : '**InsertUnableToAttendApplicantDescriptionHere',
          files: `${reqItem.get('file_description_id') ? renderFileItems(configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_UNABLE_ATTEND')) : '**InsertUnableToAttendEvidenceProvidedHere'}`
        };
      } else if (reqItem.get('item_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_NEW_EVIDENCE')) {
        this.isNewEvidenceObj = {
          val: true,
          description: reqItem.get('item_description') ? reqItem.get('item_description') : '**InsertNewRelevantApplicantDescriptionHere',
          files: `${reqItem.get('file_description_id') ?  renderFileItems(configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_NEW_EVIDENCE')) : '**InsertNewRelevantEvidenceProvidedHere'}`
        };
      } else if (reqItem.get('item_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DECISION_FRAUD')) {
        this.isFraudObj = {
          val: true,
          description: reqItem.get('item_description') ? reqItem.get('item_description') : '**InsertFraudAndFalseInformationApplicantDescriptionHere',
          files: `${reqItem.get('file_description_id') ? renderFileItems(configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DECISION_FRAUD')) : 'No evidence provided'}`
        };
      }
    });
  },

  template() {
    const latestHearing = this.data[DecGenData.hearings]?.getLatest();
    const dispute = this.data[DecGenData.dispute];
    if (!this.selectedRequest) return;
    
    return this.finalizeRender(
      <>
        <br/>
        <div>{ !dispute.isNonParticipatory() && latestHearing?.get('hearing_start_datetime') ? `Date of Hearing: ${Formatter.toFullDateDisplay(latestHearing.get('hearing_start_datetime'))}` : '' }</div>
        <br/>
        {DecGenPageBreak}
        <div className="section_title">Application for review consideration</div>
        { this.renderJsxReviewInfo() }
        { this.renderJsxLateFilingInfo() }
        <br/>
        { this.renderJsxFactsAndAnalysis() }
        <br/>
        { this.renderJsxFindingsAndAnalysisNewEvidence() }
        <br/>
        { this.renderJsxFindingsAndAnalysisFalseInfo() }
        <br/>
        { this.renderJsxConclusion() }
      </>
    );
  },

  renderJsxReviewInfo() {
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();
    const issues = this.data[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence();

    return (
      <>
        <p>The decision is in response to the following request for review consideration application submitted to the Residential Tenancy Branch:</p>
        <div className="text_block">
          <span className="light_text">Request Type:&nbsp;</span>
          <span>Application for Review Consideration</span>
        </div>
        <div className="text_block">
          <span className="light_text">Submitted By:&nbsp;</span>
          <span>{this.submitterParticipant.getDisplayName()}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Associated documents:&nbsp;</span>
          <span>{this.outcomeDocGroupModel?.getGroupRequestTitleDisplay() || '**InsertReviewDocumentsHere'}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Specified documents for review consideration:&nbsp;</span>
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
        <div className="text_block">
          <span className="light_text">Filing late:&nbsp;</span>
          <span>{this.isLateObj.val ? 'Yes' : 'No'}</span>
          <br/>
          {this.isLateObj.val ? <div className="bottom_spacer_sm">
            <div>Description: {this.renderAnswerText(this.isLateObj.description)}</div>
            <div>Proof of late request: {this.renderAnswerText(this.isLateObj.files)}</div>
          </div> : null}
        </div>
        <div className="text_block">
          <span className="light_text">Unable to attend due to circumstances outside of your control:&nbsp;</span>
          <span>{this.isUnableToEndObj.val ? 'Yes' : 'No'}</span>
          <br/>
          {this.isUnableToEndObj.val ? <div className="bottom_spacer_sm">
            <div>Description: {this.renderAnswerText(this.isUnableToEndObj.description)}</div>
            <div>Proof unable to attend: {this.renderAnswerText(this.isUnableToEndObj.files)}</div>
          </div> : null}
        </div>
        <div className="text_block">
          <span className="light_text">New and relevant evidence not available at time of hearing:&nbsp;</span>
          <span>{this.isNewEvidenceObj.val ? 'Yes' : 'No'}</span>
          <br/>
          {this.isNewEvidenceObj.val ? <div className="bottom_spacer_sm">
            <div>Description: {this.renderAnswerText(this.isNewEvidenceObj.description)}</div>
            <div>Proof of new relevant evidence: {this.renderAnswerText(this.isNewEvidenceObj.files)}</div>
          </div> : null}
        </div>
        <div className="text_block">
          <span className="light_text">False information was submitted (Fraud):&nbsp;</span>
          <span>{this.isFraudObj.val ? 'Yes' : 'No'}</span>
          <br/>
          {this.isFraudObj.val ? <div className="bottom_spacer_sm">
            <div>Description: {this.renderAnswerText(this.isFraudObj.description)}</div>
            <div>Proof of false information: {this.renderAnswerText(this.isFraudObj.files)}</div>
          </div> : null}
        </div>
        <br/>
        {DecGenPageBreak}
        {DecisionHeaderBanner(this.data)}
        <br/>
        <br/>
        <div className="doc_title">REVIEW CONSIDERATION DECISION</div>
        <br/>
        <div>Issue Codes: {issues.length ? Formatter.toIssueCodesDisplay(issues) : '-'}</div>
        <br/>
        <div>On {Formatter.toFullDateDisplay(this.selectedRequest.get('request_date'))}, the {this.submitterTypeDisplay} applied for a review consideration of a dispute resolution decision issued on {this.docsCompletedDate}.</div>
        <br/>
        <div>
          Section {isMHPTA ? '72' : '79'} of the <i>{isMHPTA ? 'Manufactured Home Park Tenancy Act' : 'Residential Tenancy Act'}</i> (the "Act") provides 3 grounds 
          on which a party may request that a decision or order be reviewed:
          <ul>
            <li>unable to attend due to circumstances outside of their control</li>
            <li>new and relevant evidence not available at time of hearing</li>
            <li>the decision was obtained by fraud</li>
          </ul>
        </div>
        <div>
          The {this.submitterTypeDisplay} requests that the decision be reviewed on the ground(s) of:
          <ul className="list_block">
            {this.isUnableToEndObj.val ? <li>unable to attend due to circumstances outside of their control</li> : null}
            {this.isNewEvidenceObj.val ? <li>new and relevant evidence not available at time of hearing</li> : null}
            {this.isFraudObj.val ? <li>the decision was obtained by fraud</li> : null}
          </ul>
        </div>
      </>
    );
  },

  renderJsxLateFilingInfo() {
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();

    const renderJsxLateFilingBoilerplate = () => {
      return <>
        <div>
          Section {isMHPTA ? '73' : '80'} of the <i>Act</i> stipulates that a party must make an Application for Review
          Consideration of a decision or order within:
        </div>
        <ul className="list_block">
          <li>
            2 days after a copy of the decision or order is received by the party, if the decision or order relates to an early end of tenancy; 
            an order of possession for a landlord or tenant; unreasonable withholding of consent by a landlord regarding assignment or subletting; 
            or a landlord's notice to end tenancy for non-payment of rent;
          </li>
          <li>
            5 days after a copy of the decision or order is received by the party, if the decision or order relates to a notice to end tenancy for any other reason; 
            repairs or maintenance; or services or facilities; or
          </li>
          <li>
            15 days after a copy of the decision or order is received by the party, if the decision relates to any other part of the Act.
          </li>
        </ul>
        <div>
          The {this.submitterTypeDisplay} has ****2/5/15 days**** to apply because the decision of {this.docsCompletedDate}, related to **InsertOutlineIssueFromAboveListHere.
        </div>
        <br/>
        <div>The {this.submitterTypeDisplay} received the decision on {Formatter.toFullDateDisplay(this.selectedRequest.get('date_documents_received'))} and filed this application on {Formatter.toFullDateDisplay(this.selectedRequest.get('request_date'))}.</div>
        <br/>
        <div>**UseBelowIfApplication_FiledInTime_AndDeleteThisLine</div>
        <p>****The application was filed on time.****</p>
        <br/>
        <div>**UseBelowIfApplication_NotFiledInTime_AndDeleteThisLine</div>
        <p>****The application was not filed on time.****</p>
        <br/>
        <div>
          Section {isMHPTA ? '74(1)' : '81(1)'} of the Act establishes that an Arbitrator or Adjudicator may dismiss or refuse to consider an application for review for one or more of the following reasons:
        </div>
        <ul className="list_block">
          <li>the application does not give full particulars of the issues submitted for review or of the evidence on which the applicant intends to rely;</li>
          <li>the application does not disclose sufficient evidence of a ground for review;</li>
          <li>the application discloses no basis on which, even if the submission in the application were accepted, the decision or order of the arbitrator should be set aside or varied; or</li>
          <li>the applicant fails to pursue the application diligently or does not follow an order made in the course of the review. </li>
        </ul>
      </>
    };

    if (!this.isLateObj.val) {
      return renderJsxLateFilingBoilerplate();
    } else {
      // If Filing Late was selected by the user
      return <>
        <div>**InsertBelowIfLateReviewConsiderationApplicationFiledLateAndDeleteThisLine</div>
        <br/>
        <div>The {this.submitterTypeDisplay} also applied for more time to file their review consideration application.</div>
        <br/>
        {renderJsxLateFilingBoilerplate()}
        <br/>
        <div><u>Request for an Extension of Time to File the Review Consideration Application</u></div>
        <br/>
        <div>The {this.submitterTypeDisplay} is requesting an extension of time to make this application.</div>
        <p>
          In response to the instruction "Describe why you were unable to submit the Application for Review Consideration before the deadline", the {this.submitterTypeDisplay} responded as follows:
        </p>
        <div>{this.isLateObj?.description ? this.renderReviewInfo(this.isLateObj) : '**InsertQuoteOrSummaryOfApplicantsSubmissionsHereAndDeleteThisLine'}</div>
        <br/>
        <div className="section_subtitle">Findings on Extension of Time to File the Review Consideration Application</div>
        <br/>
        <div>Section {isMHPTA ? '59' : '66'} of the Act provides that an arbitrator may extend or modify a time limit established by these Acts only in <b>exceptional circumstances</b>.</div>
        <br/>
        <div>**InsertFilingLateAnalysisHere</div>
        <br/>
        <div>**SelectOneReasonFromBelowIfTimeExtension_NotGranted_AndDeleteThisLine</div>
        <br/>
        <p>****The {this.submitterTypeDisplay} has not provided enough information for me to understand why they should be given more time.****</p>
        <p>****The {this.submitterTypeDisplay} has not described circumstances beyond their control that prevented them from applying on time.****</p>
        <p>****The {this.submitterTypeDisplay} has not submitted evidence of the circumstances that prevented them from applying on time.****</p>
        <p>****Although the {this.submitterTypeDisplay} may have a reason they could not apply on time, they have not demonstrated the decision would have been different had they applied on time.****</p>
        <p>****I dismiss the application to extend the time for filing the review. The decision of {this.docsCompletedDate}, is confirmed.****</p>
        <br/>
        <div>**UseBelowIfTimeExtension_IsGranted_AndDeleteThisLine</div>
        <br/>
        <p>****The {this.submitterTypeDisplay} experienced exceptional circumstances and I extend the time limit.****</p>
      </>
    }
  },

  renderJsxFindingsAndAnalysisNewEvidence() {
    if (!this.isNewEvidenceObj.val) return;
    return (
      <>
        <div className="section_title">Facts and Analysis - New and Relevant Evidence</div>
        <p>A review may be granted if the applicant can prove that:</p>
        <ul className="list_block">
          <li>they have evidence that was not available at the time of the hearing</li>
          <li>the evidence is new</li>
          <li>the evidence is relevant</li>
          <li>the evidence is credible</li>
          <li>the evidence will have an effect on the outcome</li>
        </ul>
        <p>
          In response to the instruction "List each item of new and relevant evidence and state why it was not available at the time of the hearing and how it is relevant", the {this.submitterTypeDisplay} responded as follows:
        </p>
        <div>{this.renderReviewInfo(this.isNewEvidenceObj)}</div>
        <br/>
        <div>**InsertNewAndRelevantEvidenceAnalysisHere</div>
        <br/>

        <div>**UseBelow_IfEvidenceWasAvailableAtHearing_AndDeleteThisLine</div>
        <br/>
        <div>****Much if not all of this information was available or could have been made available at the time of the original hearing.****</div>
        <br/>
        <div>****Much if not all of this information was available or could have been made available at the time of the original hearing.****</div>

        <div>**UseBelow_IfReArguingHearing_AndDeleteThisLine</div>
        <br/>
        <div>****The {this.submitterTypeDisplay} has not identified new evidence that will likely have an effect on the outcome.****</div>
        <br/>
        <div>****The {this.submitterTypeDisplay} has not identified new evidence that will likely have an effect on the outcome.****</div>

        <div>**UseBelowIfNewEvidence_NotSuccessful_AndDeleteThisLine</div>
        <br/>
        <div>****The application is dismissed. The decision of {this.docsCompletedDate}, is confirmed.****</div>
        <br/>
        <div>****The application is dismissed. The decision of {this.docsCompletedDate} is confirmed.****</div>

        <div>**UseBelowIfNewEvidence_IsSuccessful_AndDeleteThisLine</div>
        <br/>
        <div>****I will conduct a review on the grounds of new evidence as it is possible the outcome may have been different had this evidence been provided to me.****</div>
        <br/>

        <div>**InsertBelowIfRequestingWrittenSubmissionRespondentAndDeleteThisLine</div>
        <br/>
        <div>In response to this review consideration application, I will accept written submissions from the {this.reverseSubmitterTypeDisplay} to decide if there is new and relevant evidence and if so, would the decision have been different.</div>
        <p>Within 3 days after receiving this decision, the {this.submitterTypeDisplay} must give to the {this.reverseSubmitterTypeDisplay}:</p>
        <ul>
          <li>this decision</li>
          <li>**InsertIfApplicationWasPaperAndDelete their review consideration application</li>
          <li>the evidence they submitted to the Residential Tenancy Branch to support their review consideration application.</li>
        </ul>
        <div>The {this.submitterTypeDisplay} must give the above documents to the {this.reverseSubmitterTypeDisplay} in the same way they would give a notice of dispute resolution, e.g., registered mail, in person, or when agreed to in advance, email.</div>
        <br/>

        <div>**InsertIfNoNewEvidenceAndDeleteThisLine</div>
        <div>The {this.submitterTypeDisplay} must not add new evidence; only evidence that has been provided with the review consideration application will be considered.</div>
        <br/>
        <div>The {this.submitterTypeDisplay} must provide proof to the Residential Tenancy Branch of how and when they gave the {this.reverseSubmitterTypeDisplay} this decision, application and evidence, e.g., details of registered mail, copy of email.</div>
        <br/>
        <div>The {this.submitterTypeDisplay}'s proof of how and when they gave this decision, application and evidence to the {this.reverseSubmitterTypeDisplay} must be received by the Residential Tenancy Branch by **6DaysFromTomorrow.</div>
        <br/>
        <div>If the {this.reverseSubmitterTypeDisplay} chooses to respond, they must provide their written response and evidence to the {this.submitterTypeDisplay} and the Residential Tenancy Branch within 3 days after receiving the {this.submitterTypeDisplay}'s information. Information received after **10DaysFromTomorrow will not be considered.</div>
        <br/>

        <div>**InsertBelowIfGrantingReviewHearingAndDeleteThisLine</div>
        <br/>
        <div>****I will hold a hearing to conduct a review on the grounds of new evidence as it is possible the outcome may have been different had this evidence been provided to me.****</div>
        <p>Within 3 days after receiving this decision, the {this.submitterTypeDisplay} must give to the {this.reverseSubmitterTypeDisplay}:</p>
        <ul>
          <li>this decision</li>
          <li>**InsertIfApplicationWasPaperAndDelete their review consideration application</li>
          <li>the evidence they submitted to the Residential Tenancy Branch to support their review consideration application</li>
          <li>the notice of the review hearing</li>
        </ul>
        <div>The {this.submitterTypeDisplay} must give the above documents to the {this.reverseSubmitterTypeDisplay} in the same way they would give a notice of dispute resolution, e.g., registered mail, in person, or when agreed to in advance, email.</div>
        <br/>

        <div>**InsertIfNoNewEvidenceAndDeleteThisLine</div>
        <div>The {this.submitterTypeDisplay} must not add new evidence; only evidence that has been provided with the review consideration application will be considered.</div>
        <br/>
        <div>The {this.submitterTypeDisplay} must provide proof to the Residential Tenancy Branch of how and when they gave the {this.reverseSubmitterTypeDisplay} this decision, application and evidence, e.g., details of registered mail, copy of email.</div>
        <br/>
        <div>The {this.submitterTypeDisplay}'s proof of how and when they gave this decision, application and evidence to the {this.reverseSubmitterTypeDisplay} must be received by the Residential Tenancy Branch by **6DaysFromTomorrow.</div>
        <br/>
        <div>If the {this.reverseSubmitterTypeDisplay} chooses to respond, they must provide their written response and evidence to the {this.submitterTypeDisplay} and the Residential Tenancy Branch within 3 days after receiving the {this.submitterTypeDisplay}'s information. Information received after **10DaysFromTomorrow will not be considered.</div>
        <br/>
      </>
    );
  },

  renderJsxFactsAndAnalysis() {
    if (!this.isUnableToEndObj.val) return;
    return (
      <>
        <div className="section_title">Facts and Analysis - Unable to Attend Original Hearing</div>
        <div>
          A dispute resolution hearing is a formal, legal process and parties should take reasonable steps to ensure that they will be in attendance at the hearing.
          This ground is not intended to permit a matter to be reopened if a party, through the exercise of reasonable planning, could have attended.
          The application must establish that the circumstances which led to the inability to attend the hearing were both:
        </div>
        <ul>
          <li>beyond the control of the applicant, and</li>
          <li>could not be anticipated.</li>
        </ul>
        <div>Furthermore, an application must establish that the outcome would be different had the applicant attended.</div>
        <p>
          In the application for review, the {this.submitterTypeDisplay} was asked to explain what happened that was beyond their control or that could not have been anticipated that prevented them from attending the original teleconference hearing. The {this.submitterTypeDisplay} responded as follows:
        </p>
        <div>{this.renderReviewInfo(this.isUnableToEndObj)}</div>
        <br/>
        <div>**InsertUnableToAttendAnalysisHere</div>
        <br/>
        <div>**SelectOneReasonFromBelowIfUnableToAttend_NotGranted_AndDeleteThisLine</div>
        <br/>
        <p>****The {this.submitterTypeDisplay} has not provided enough detail to determine why they were unable to attend.****</p>
        <p>****The {this.submitterTypeDisplay} has not described circumstances that were beyond their control and could not have been anticipated.****</p>
        <p>****The {this.submitterTypeDisplay} has not submitted evidence of the circumstances that prevented them from attending.****</p>
        <p>****Although the {this.submitterTypeDisplay} may have a reason they could not attend, they have not demonstrated the decision would have been different had they attended.****</p>
        <p>****The decision was issued through the direct request process and there was no hearing for the {this.submitterTypeDisplay} to attend.****</p>
        <br/>
        <div>**UseBelowIf_DismissUnableToAttend_AndDeleteThisLine</div>
        <p>****The application is dismissed. The decision of {this.docsCompletedDate}, is confirmed.****</p>
        <br/>
        <div>**UseBelowIf_GrantUnableToAttend_AndDeleteThisLine</div>
        <p>****The {this.submitterTypeDisplay} was prevented from attending and it is possible that if they attended the outcome would have been different.****</p>

        <div>**InsertBelowIfRequestingWrittenSubmissionRespondentAndDeleteThisLine</div>
        <div>In response to this review consideration application, I will accept written submissions from the {this.reverseSubmitterTypeDisplay} to decide if the {this.submitterTypeDisplay} was unable to attend and if so, would the decision have been different if they attended.</div>
        <p>Within 3 days after receiving this decision, the {this.submitterTypeDisplay} must give to the {this.reverseSubmitterTypeDisplay}:</p>
        <ul>
          <li>this decision</li>
          <li>**InsertIfApplicationWasPaperAndDelete their review consideration application</li>
          <li>the evidence they submitted to the Residential Tenancy Branch to support their review consideration application</li>
        </ul>
        <div>The {this.submitterTypeDisplay} must give the above documents to the {this.reverseSubmitterTypeDisplay} in the same way they would give a notice of dispute resolution, e.g., registered mail, in person, or when agreed to in advance, email.</div>
        <br/>

        <div>**InsertIfNoNewEvidenceAndDeleteThisLine</div>
        <div>The {this.submitterTypeDisplay} must not add new evidence; only evidence that has been provided with the review consideration application will be considered.</div>
        <br/>
        <div>The {this.submitterTypeDisplay} must provide proof to the Residential Tenancy Branch of how and when they gave the {this.reverseSubmitterTypeDisplay} this decision, application and evidence, e.g., details of registered mail, copy of email.</div>
        <br/>
        <div>The {this.submitterTypeDisplay}'s proof of how and when they gave this decision, application and evidence to the {this.reverseSubmitterTypeDisplay} must be received by the Residential Tenancy Branch by **6DaysFromTomorrow.</div>
        <br/>
        <div>If the {this.reverseSubmitterTypeDisplay} chooses to respond, they must provide their written response and evidence to the {this.submitterTypeDisplay} and the Residential Tenancy Branch within 3 days after receiving the {this.submitterTypeDisplay}'s information. Information received after **10DaysFromTomorrow will not be considered.</div>
        <br/>
        
        <div>**InsertBelowIfGrantingReviewHearingAndDeleteThisLine</div>
        <div>****I will hold a hearing to decide if the {this.submitterTypeDisplay} was unable to attend and, if so, would the decision have been different if they attended.****</div>
        <p>Within 3 days after receiving this decision, the {this.submitterTypeDisplay} must give to the {this.reverseSubmitterTypeDisplay}:</p>
        <ul>
          <li>this decision</li>
          <li>**InsertIfApplicationWasPaperAndDelete their review consideration application</li>
          <li>the evidence they submitted to the Residential Tenancy Branch to support their review consideration application</li>
          <li>the notice of the review hearing</li>
        </ul>
        <div>The {this.submitterTypeDisplay} must give the above documents to the {this.reverseSubmitterTypeDisplay} in the same way they would give a notice of dispute resolution, e.g., registered mail, in person, or when agreed to in advance, email.</div>
        <br/>
        <div>**InsertIfNoNewEvidenceAndDeleteThisLine</div>
        <div>The {this.submitterTypeDisplay} must not add new evidence; only evidence that has been provided with the review consideration application will be considered.</div>
        <br/>
        <div>The {this.submitterTypeDisplay} must provide proof to the Residential Tenancy Branch of how and when they gave the {this.reverseSubmitterTypeDisplay} this decision, application and evidence, e.g., details of registered mail, copy of email.</div>
        <br/>
        <div>The {this.submitterTypeDisplay}'s proof of how and when they gave this decision, application and evidence to the {this.reverseSubmitterTypeDisplay} must be received by the Residential Tenancy Branch by **6DaysFromTomorrow.</div>
        <br/>
        <div>If the {this.reverseSubmitterTypeDisplay} chooses to respond, they must provide their written response and evidence to the {this.submitterTypeDisplay} and the Residential Tenancy Branch within 3 days after receiving the {this.submitterTypeDisplay}'s information. Information received after **10DaysFromTomorrow will not be considered.</div>
        <br/>
      </>
    );
  },

  renderJsxFindingsAndAnalysisFalseInfo() {
    if (!this.isFraudObj.val) return;
    return (
      <>
        <div className="section_title">Facts and Analysis - Fraud</div>
        <div>This ground applies where a party has evidence that the Arbitrator's decision was obtained by fraud.</div>
        <br/>
        <div>Residential Tenancy Policy Guideline 24 outlines the test to be met for demonstrating that the decision or order was obtained by fraud.</div>
        <br/>
        <div className="tab"><i>Fraud must be intended. An unintended negligent act or omission (e.g. making a mistake) is not fraudulent.</i></div>
        <br/>
        <div>
          A review on the basis of fraud may be granted when there is evidence that meets all four of the following tests:
          <ol>
            <li>information presented ****at the hearing/in the direct request**** was false;</li>
            <li>the person submitting the information knew it was false;</li>
            <li>the false information was used to get the outcome desired by the person who submitted it; and</li>
            <li>the outcome of the dispute would have been different if the false information had not been submitted.</li>
          </ol>
        </div>
        <p>In the review consideration application, the {this.submitterTypeDisplay} claimed that:</p>
        <div>{this.renderReviewInfo(this.isFraudObj)}</div>
        <br/>
        <span>**InsertFraudAnalysisHere</span>
        <br/>
        <br/>
        <div><span>**UseBelowIf_NotFraud_AndDeleteThisLine</span></div>
        <br/>
        <div>****The {this.submitterTypeDisplay} has not submitted sufficient evidence to demonstrate that the original decision was obtained by fraud.****</div>
        <br/>
        <div>****The application is dismissed. The decision of {this.docsCompletedDate}, is confirmed.****</div>
        <br/>
        <div>**UseBelowIfPossibleFraud_AndDeleteThisLine</div>
        <p>****It is possible that the outcome of the dispute may have been obtained by fraud.****</p>
        <br/>
        <div>**AddInAdditionalReasonsIfAppropriateAndDeleteThisLine</div>
        <br/>

        <div>**InsertBelowIfRequestingWrittenSubmissionRespondentAndDeleteThisLine</div>
        <br/>
        <div>In response to this review consideration application, I will conduct a review by accepting written submissions from the {this.reverseSubmitterTypeDisplay} to decide if the decision was obtained by fraud.</div>
        <p>Within 3 days after receiving this decision, the {this.submitterTypeDisplay} must give to the {this.reverseSubmitterTypeDisplay}:</p>
        <ul>
          <li>this decision</li>
          <li>**InsertIfApplicationWasPaperAndDelete their review consideration application</li>
          <li>the evidence they submitted to the Residential Tenancy Branch to support their review consideration application</li>
        </ul>
        <div>The {this.submitterTypeDisplay} must give the above documents to the {this.reverseSubmitterTypeDisplay} in the same way they would give a notice of dispute resolution, e.g., registered mail, in person, or when agreed to in advance, email.</div>
        <br/>
        <div>**InsertIfNoNewEvidenceAndDeleteThisLine   </div>
        <br/>
        <div>The {this.submitterTypeDisplay} must not add new evidence; only evidence that has been provided with the review consideration application will be considered.</div>
        <br/>
        <div>The {this.submitterTypeDisplay} must provide proof to the Residential Tenancy Branch of how and when they gave the {this.reverseSubmitterTypeDisplay} this decision, their application and evidence, e.g., details of registered mail, copy of email.</div>
        <br/>
        <div>The {this.submitterTypeDisplay}'s proof of how and when they gave this decision and the review application to the {this.reverseSubmitterTypeDisplay} must be received by the Residential Tenancy Branch by **6DaysFromTomorrow.</div>
        <br/>
        <div>If the {this.reverseSubmitterTypeDisplay} chooses to respond, they must provide their written response and evidence to the {this.submitterTypeDisplay} and the Residential Tenancy Branch within 3 days after receiving the {this.submitterTypeDisplay}'s information. Information received after **10DaysFromTomorrow will not be considered.</div>
        <br/>
        <div>**InsertBelowIfGrantingReviewHearingAndDeleteThisLine</div>
        <br/>
        <div>In response to this review consideration application, I will hold a hearing to decide if the decision was obtained by fraud.</div>
        <p>Within 3 days after receiving this decision, the {this.submitterTypeDisplay} must give to the {this.reverseSubmitterTypeDisplay}:</p>
        <ul>
          <li>this decision</li>
          <li>**InsertIfApplicationWasPaperAndDelete their review consideration application</li>
          <li>the evidence they submitted to the Residential Tenancy Branch to support their review consideration application</li>
          <li>the notice of the review hearing</li>
        </ul>
        <div>The {this.submitterTypeDisplay} must give the above documents to the {this.reverseSubmitterTypeDisplay} in the same way they would give a notice of dispute resolution, e.g., registered mail, in person, or when agreed to in advance, email.</div>
        <br/>
        <div>**InsertifNoNewEvidenceAndDeleteThisLine </div>
        <br/>
        <div>The {this.submitterTypeDisplay} must not add new evidence; only evidence that has been provided with the review consideration application will be considered.</div>
        <br/>
        <div>The {this.submitterTypeDisplay} must provide proof to the Residential Tenancy Branch of how and when they gave the {this.reverseSubmitterTypeDisplay} this decision, application, evidence and notice of review hearing, e.g., details of registered mail, copy of email.</div>
        <br/>
        <div>The {this.submitterTypeDisplay}'s proof of how and when they gave this decision and the review application to the {this.reverseSubmitterTypeDisplay} must be received by the Residential Tenancy Branch by **6DaysFromTomorrow.</div>
        <br/>
        <div>If the {this.reverseSubmitterTypeDisplay} chooses to respond, they must provide their written response and evidence to the {this.submitterTypeDisplay} and the Residential Tenancy Branch within 3 days after receiving the tenant's information. Information received after **10DaysFromTomorrow will not be considered.</div>
        <br/>
      </>
    );
  },

  renderJsxConclusion() {
    const signature = this.data[DecGenData.signature];
    const isMHPTA = this.data[DecGenData.dispute].isMHPTA();
    return (
      <>
        <div className="section_title">Conclusion</div>
        <div>**UseBelowIf_ReviewDenied_AndDeleteThisLine</div>
        <p>I dismiss the application for review consideration. The decision and order(s) issued on {this.docsCompletedDate}, is/are confirmed.</p>
        <br/>
        <div>**UseBelowIf_ReviewGranted_AndDeleteThisLine</div>
        <p>I will conduct a review. The decision and order(s) issued on date of {this.docsCompletedDate}, is/are suspended until my review is complete.</p>
        <p>I have explained above how the {this.submitterTypeDisplay} must notify the {this.reverseSubmitterTypeDisplay} of the review and how it will be conducted. Failure to adhere to the instructions and timelines may result in the review application being dismissed and the decision being confirmed.</p>
        <br/>
        <div>
          Fact sheets are available at <a href="http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf">http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf</a>&nbsp;that
          explain evidence and service requirements.  For more information see our website at: <a href="www.gov.bc.ca/landlordtenant">www.gov.bc.ca/landlordtenant</a>&nbsp;If 
          either party has any questions they may contact an Information Officer with the Residential Tenancy Branch at: <a href="www.gov.bc.ca/landlordtenant">www.gov.bc.ca/landlordtenant</a>&nbsp;If
          either party has any questions they may contact an Information Officer with the Residential Tenancy Branch at:
        </div>
        <br/>
        <div className="tab">
          <span><b>Lower Mainland:&nbsp;</b></span>
          <span>604-660-1020</span>
        </div>
        <div className="tab">
          <span><b>Victoria:&nbsp;</b></span>
          <span>250-387-1602</span>
        </div>
        <div className="tab">
          <span><b>Elsewhere in BC:&nbsp;</b></span>
          <span>1-800-665-8779</span>
        </div>
        <br/>
        <p>This decision is made on authority delegated to me by the Director of the Residential Tenancy Branch under section 9.1(1) of the <i>{isMHPTA ? 'Manufactured Home Park Tenancy Act' : 'Residential Tenancy Act'}</i>.</p>
        <p>Dated: {Formatter.toFullDateDisplay(this.data[DecGenData.currentDocSet].get('doc_completed_date'))}</p>
        <p className="signature_container">
          {signature?.img ? <img src={signature.img} width={`${signature.dimensions?.width}`} height={`${signature.dimensions?.height}`} />
          : <>**InsertSignatureHere</>}
        </p>
      </>
    )
  },

  renderReviewInfo(infoObj) {
    return (
      <>
        <p className="tab">{this.renderAnswerText(infoObj.description)}</p>
        <span>With the following evidence: {this.renderAnswerText(infoObj.files)}</span>
      </>
    )
  },

  renderAnswerText(answerText) {
    if (!answerText) return;

    return answerText;
  }
},{
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.currentCcrItem]: true,
      [DecGenData.signature]: true,
      [DecGenData.currentDocSet]: true,
      [DecGenData.hearings]: true,
      [DecGenData.allIssues]: true,
    };
  }
});