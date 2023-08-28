import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionBackground_MergeFields from './DecisionBackground_MergeFields';

const noticeChannel = Radio.channel('notice');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');

const DecisionBackgroundContent = GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionBackground_MergeFields);

    this.referencedFiles = this.data[DecGenData.files].filter(fileModel => {
      // TODO: Need update for displaying linked files
      return fileModel.isReferenced() && !filesChannel.request('is:file:linked:to:removed', fileModel);
    });
  },

  template() {
    const isNonParticipatory = this.data[DecGenData.dispute].isNonParticipatory();
    return this.finalizeRender(<>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
        <br/>
      </> : null}
      {isNonParticipatory ? this.renderJsxNonParticipatory() : this.renderJsxReferencedEvidence()}
    </>);
  },

  renderJsxNonParticipatory() {
    const hasSecurityDeposit = this.data[DecGenData.dispute]?.hasSecurityDeposit();
    const hasPetDeposit = this.data[DecGenData.dispute]?.hasPetDeposit();
    const isLandlord = this.data[DecGenData.dispute]?.isLandlord();
    return this.finalizeRender(<>
      <p>I have reviewed all written submissions and evidence before me; however, only the evidence and submissions relevant to the issues and findings in this matter are described in this decision.</p>
      <p>The {`{u_dispute-applicant-type}`} submitted the following evidentiary material:</p>
      <ul>
        <li>{`{st_tenancy-summary-ta}`}</li>
        {!isLandlord && hasSecurityDeposit ? <li>{`{st_tt_security-deposit-summary}`}</li> : null}
        {!isLandlord && hasPetDeposit ? <li>{`{st_tt_pet-damage-deposit-summary}`}</li> : null}
        {`{st_tenancy-evidence-list}`}
        {!isLandlord ? <li>{`{st_tenant-worksheet-summary}`}</li> : null}
      </ul>
    </>);
  },

  renderJsxReferencedEvidence() {
    const applicantEvidence = [];
    const respondentEvidence = [];

    this.referencedFiles.forEach(file => {
      const participant = participantsChannel.request('get:participant', file.get('added_by'));
      if (participant?.isApplicant()) {
        applicantEvidence.push(file);
      } else if (participant?.isRespondent()) {
        respondentEvidence.push(file);
      }
    });
    const renderEvidence = ({ isRespondent= false } = {}) => {
      const applicantIntro = `The {u_dispute-applicant-type}(s) submitted the following evidentiary material:`;
      const respondentIntro = `The {u_dispute-respondent-type}(s) submitted the following evidentiary material:`;
      const intro  = isRespondent ? respondentIntro : applicantIntro;
      const evidenceList = isRespondent ? respondentEvidence : applicantEvidence;
      return evidenceList.length ? <>
          <p>{intro}</p>
          <ul>
            {evidenceList.map(file => {
              return this.finalizeRender(<li>{`{st_referenced-evidence-item}`}</li>, { file });
            })}
          </ul>
        </> : null;
    };
    const renderRespondentEvidence = () => renderEvidence({ isRespondent: true });
    return this.finalizeRender(<>
      <p>{`{st_background_opening}`}</p>
      <p>{`{st_tenancy-summary}`}</p>
      {renderEvidence()}
      {renderRespondentEvidence()}
      <p>**InsertTestimonyAndHearingInfoHere</p>
    </>, { notice: noticeChannel.request('get:active') });
  },
  
}, {
  getDataToLoad() {
    return {
      [DecGenData.currentDoc]: true,
      [DecGenData.dispute]: true,
      [DecGenData.files]: true,
      [DecGenData.allParticipants]: true,
      [DecGenData.allIssues]: true,
      [DecGenData.notes]: true,
    };
  },
});

export default GeneratedOutcomeDocSection.extend({
  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionBackgroundContent);
  },

  ui: {
    content: '.decision_background_content'
  },

  template() {
    return <>
      <div className="section_title">Background and Evidence</div>
      <div className="decision_background_content"></div>
    </>
  },

}, {
  getDataToLoad() {
    return {
      ...DecisionBackgroundContent.getDataToLoad(),
      [DecGenData.linkedDisputes]: DecisionBackgroundContent.getDataToLoad(),
    };
  },
});

