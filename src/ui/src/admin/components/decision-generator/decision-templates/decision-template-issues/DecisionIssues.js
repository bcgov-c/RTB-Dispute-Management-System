import React from 'react';
import Radio from 'backbone.radio';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionIssues_MergeFields from './DecisionIssues_MergeFields';

const configChannel = Radio.channel('config');

const DecisionIssuesContent = GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionIssues_MergeFields);

    // Ignore reverse awarded issues from this section - But keep LRSD issue
    this.filteredIssues = this.data[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence().filter(claim => claim.isRetainSecurityDeposit() || !claim.isReverseAward());
    this.process = this.data[DecGenData.dispute].getProcess();
  },
  
  template() {
    const renderedErrors = this.renderJsxErrors();
    return this.finalizeRender(<>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
        <br/>
      </> : null}
      {renderedErrors ? renderedErrors : this.renderJsxContent()}
    </>);
  },

  renderJsxErrors() {
    if (!this.filteredIssues) return <div>{this.wrapHtmlWithError(`--- NO ACTIVE ISSUES ON THIS DISPUTE. ADD ISSUES TO POPULATE THIS SECTION ---`)}</div>
    return false;
  },

  renderJsxContent() {
    return <div>
      <p>{this.data[DecGenData.dispute]?.checkProcess(2) ? `{st_issue_opening-non-participatory}` : `{st_issue_opening-participatory}`}</p>
      <ul>
        {this.filteredIssues.map(issue => this.finalizeRender(<li>{`{bp_issue_act-title}`}</li>, { issue }))}
      </ul>
      {this.renderJsxHearingAttendance()}
      {this.renderJsxSettlementAgreement()}
    </div>;
  },

  renderJsxHearingAttendance() {
    const isDoubleNoShow = (configChannel.request('get', 'file_types_double_no_show')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    const isDirectRequest = this.data[DecGenData.currentDoc]?.isDirectRequest();
    const hearing = this.data[DecGenData.hearings]?.getLatest();
    if (isDoubleNoShow || isDirectRequest || !hearing || hearing.isActive()) return;

    return this.finalizeRender(<>
      <p>{`{st_hearing-applicant-attendance-list}`} attended the hearing for the {`{u_dispute-applicant-type}`}.</p>
      <p>{`{st_hearing-respondent-attendance-list}`} attended the hearing for the {`{u_dispute-respondent-type}`}.</p>
    </>, { hearing });
  },

  renderJsxSettlementAgreement() {
    const isSettlementAgreement = (configChannel.request('get', 'file_types_settlement_agreements')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    if (!isSettlementAgreement) return;
    //st_settlement-issue-summary
    return <>
      <p>At the outset of the hearing the parties indicated their intention to settle their dispute.</p>
    </>

  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.allIssues]: true,
      [DecGenData.hearings]: true,
      [DecGenData.allParticipants]: true,
    };
  },
});

export default GeneratedOutcomeDocSection.extend({
  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionIssuesContent);
  },

  ui: {
    content: '.decision_issues_content'
  },

  template() {
    return <>
      <div className="section_title">Introduction</div>
      <div className="decision_issues_content"></div>
    </>
  },

}, {
  getDataToLoad() {
    return {
      ...DecisionIssuesContent.getDataToLoad(),
      [DecGenData.linkedDisputes]: DecisionIssuesContent.getDataToLoad(),
    };
  },
});

