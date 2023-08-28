import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionAnalysis_MergeFields from './DecisionAnalysis_MergeFields';

const configChannel = Radio.channel('config');

const DecisionAnalysisContent = GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionAnalysis_MergeFields);
    // Always ignore severed and amend-removed outcome issues from this section, as those issues are not considered part of a decision
    this.filteredIssues = this.data[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence()
      .filter(claim => !claim.hasOutcomeAmend() && !claim.hasOutcomeSever());
  },
  
  template() {
    const renderIssueStrictAct = () => (<>
      <br/>
      {`{bp_issue-act-strict}`}
      <p>**InsertArbAnalysisHere</p>
    </>);

    const renderIssueDescription = (issue) => {
      if (issue.isFeeRecovery()) return;
      return this.generationOptions?.insertConversational ? `{bp_issue-act-conversational}`
          : this.generationOptions?.insertStrict ? renderIssueStrictAct()
          : null;
    };
    const renderIssueOutcome = (issue) => {
      if (!issue.allOutcomesComplete()) return this.wrapHtmlWithError(<div>--- OUTCOMES CANNOT BE POPULATED ON ISSUES THAT DO NOT HAVE THEIR OUTCOME INFORMATION COMPLETED IN DMS  ---</div>);
      const showGrantedBoilerplate = this.generationOptions?.insertConversational && issue.hasOutcomeAwarded() && !issue.isFeeRecovery();
      return <>
        {showGrantedBoilerplate ? `{bp_issue-granted-text}` : null}
        <p>{`{st_issue-outcome-statement}`}</p>
        {showGrantedBoilerplate ? `{bp_issue-granted-conclusion-text}` : null}
      </>
    };
    return <>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
        <br/>
      </> : null}
      {this.filteredIssues.map(issue => this.finalizeRender(<>
        <div className="section_subtitle2">{`{bp_issue_decided-title}`}</div>
        {renderIssueDescription(issue)}
        {renderIssueOutcome(issue)}
      </>, { issue }))}
    </>;
  },
}, {
  getDataToLoad() {
    return {
      [DecGenData.currentDoc]: true,
      [DecGenData.dispute]: true,
      [DecGenData.allIssues]: true,
    };
  },
});

export default GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionAnalysis_MergeFields);

    this.isLandlord = this.data[DecGenData.dispute].isLandlord();
    this.useBlank = !this.generationOptions?.insertConversational && !this.generationOptions?.insertStrict;
    this.isDoubleNoShow = (configChannel.request('get', 'file_types_double_no_show')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isInterimDecision = (configChannel.request('get', 'file_types_interim_decisions')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isSettlementAgreement = (configChannel.request('get', 'file_types_settlement_agreements')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isOutcomeDocDirectRequest = this.data[DecGenData.currentDoc]?.isDirectRequest();
  },

  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionAnalysisContent);
  },

  ui: {
    content: '.decision_analysis_content'
  },

  template() {
    return this.finalizeRender(<>
      <div className="section_title">Analysis</div>
      {
        this.useBlank ? <div>**EnterAnalysisSection</div> :
        this.isDoubleNoShow ? this.renderJsxDoubleNoShow() :
        this.isInterimDecision && this.isOutcomeDocDirectRequest ? this.renderJsxInterimDecisionDirectRequest() :
        this.isInterimDecision && !this.isOutcomeDocDirectRequest ? this.renderJsxInterimDecision() :
        this.isSettlementAgreement ? this.renderJsxSettlementAgreement() :
        this.renderJsxStandardDecision()
      }
    </>);
  },

  renderJsxDoubleNoShow() {
    if (!this.data[DecGenData.hearings]?.getLatest()) return <div>{this.wrapHtmlWithError('--- NO HEARING INFORMATION COULD BE FOUND ON THIS DISPUTE ---')}</div>;
    return <>
      <p>
        None of the parties attended at the appointed time set for the hearing, although I waited until {`{u_hearing-latest-start-time-plus-10min}`} to enable them to participate in this hearing scheduled for {`{u_hearing-latest-start-time}`}.
        I confirmed that the correct call-in number and participant code had been provided in the Notice of Dispute Resolution Proceeding. I also confirmed on the teleconference system that I was the only person who had called into this hearing.
      </p>
      <p>Rule of Procedure 7 states:</p>
      <p className="tab"><b>Rule 7.1 Commencement of the hearing</b>
        <br/>The hearing must commence at the scheduled time unless otherwise decided by the arbitrator.
        <br/><b>Rule 7.3 Consequences of not attending the hearing</b>
        <br/>The arbitrator may conduct the hearing in the absence of a party or dismiss the application, with or without leave to re-apply.
      </p>
    </>;
  },

  renderJsxInterimDecisionDirectRequest() {
    return <div>{this.isLandlord ? `{st_LL-adjourned-analysis}` : `{st_TT-adjourned-analysis}`}</div>
  },

  renderJsxInterimDecision() {
    //st_singlepartipatory-adjourned-analysis
    const rtaTemplate = <>
      <p>**InsertIfPartyRequestedAdjournmentAndDeleteThisLine</p>
      <p>****At the outset of the hearing, a party to the proceeding requested an adjournment.****</p>
      <p>**InsertIfHearingDidNotCompleteInScheduledTimeAndDeleteThisLine</p>
      <p>****The hearing did not complete within the scheduled time.****</p>
      <p>Rule 7 of the <i>Residential Tenancy Branch Rules of Procedure</i> provides guidance on the criteria that must be considered for granting an adjournment:</p>
      <p className="tab"><b>7.8 Adjournment after the dispute resolution hearing begins</b>
        <br/>At any time after the dispute resolution hearing begins, the arbitrator may adjourn the dispute resolution hearing to another time.
        <br/>
        <br/>A party or a party's agent may request that a hearing be adjourned.
        <br/>
        <br/>The arbitrator will determine whether the circumstances warrant the adjournment of the hearing.
      </p>
      <p className="tab"><b>7.9 Criteria for granting an adjournment</b>
        <br/>Without restricting the authority of the arbitrator to consider other factors, the arbitrator will consider the following when allowing or disallowing a party's request for an adjournment:
        <br/>
        <ul>
          <li>the oral or written submissions of the parties;</li>
          <li>the likelihood of the adjournment resulting in a resolution;</li>
          <li>the degree to which the need for the adjournment arises out of the intentional actions or neglect of the party seeking the adjournment;</li>
          <li>whether the adjournment is required to provide a fair opportunity for a party to be heard; and</li>
          <li>the possible prejudice to each party.</li>
        </ul>
      </p>
      <p>**InsertAdjournedAnalysisHere</p>
      <p>For the above reasons I grant the **landlord/tenant's request for an adjournment.</p>
      <p>The two parties are at liberty to settle the issues at hand before the reconvened hearing if they are able to come to a mutually agreed resolution. If an agreement is reached, please notify the Residential Tenancy Branch.</p>
    </>;

    const mhptaTemplate = <>
      <p>**InsertIfPartyRequestedAdjournmentAndDeleteThisLine</p>
      <p>****At the outset of the hearing, a party to the proceeding requested an adjournment.****</p>
      <p>**InsertIfHearingDidNotCompleteInScheduledTimeAndDeleteThisLine</p>
      <p>****The hearing did not complete within the scheduled time.****</p>
      <p>Rule 7 of the <i>Residential Tenancy Branch Rules of Procedure</i> provides guidance on the criteria that must be considered for granting an adjournment:</p>
      <p className="tab"><b>7.8 Adjournment after the dispute resolution hearing begins</b>
        <br/>At any time after the dispute resolution hearing begins, the arbitrator may adjourn the dispute resolution hearing to another time.
        <br/>
        <br/>A party or a party's agent may request that a hearing be adjourned.
        <br/>
        <br/>The arbitrator will determine whether the circumstances warrant the adjournment of the hearing.
      </p>
      <p className="tab"><b>7.9 Criteria for granting an adjournment</b>
        <br/>Without restricting the authority of the arbitrator to consider other factors, the arbitrator will consider the following when allowing or disallowing a party's request for an adjournment:
        <br/>
        <ul>
          <li>the oral or written submissions of the parties;</li>
          <li>the likelihood of the adjournment resulting in a resolution;</li>
          <li>the degree to which the need for the adjournment arises out of the intentional actions or neglect of the party seeking the adjournment;</li>
          <li>whether the adjournment is required to provide a fair opportunity for a party to be heard; and</li>
          <li>the possible prejudice to each party.</li>
        </ul>
      </p>
      <p>**InsertAdjournedAnalysisHere</p>
      <p>For the above reasons I grant the **landlord/tenant's request for an adjournment.</p>
      <p>The two parties are at liberty to settle the issues at hand before the reconvened hearing if they are able to come to a mutually agreed resolution. If an agreement is reached, please notify the Residential Tenancy Branch.</p>
    </>

    return this.data[DecGenData.dispute].isMHPTA() ? mhptaTemplate : rtaTemplate;
  },

  renderJsxSettlementAgreement() {
    const isMHPTA = this.data[DecGenData.dispute].isMHPTA();
    return isMHPTA ? <>
      <p>Under section 56 of the Act, the Arbitrator may assist the parties to settle their dispute. If the parties settle their dispute during the dispute resolution proceedings, the settlement may be recorded in the form of a decision or an order. During this hearing, the parties reached an agreement to settle their dispute.</p>
      <p>Both parties agreed to the following terms of a final and binding resolution of the {`{u_dispute-applicant-type}`}'s application and the issues in dispute arising out of this tenancy at this time and that they did so of their own free volition and without any element of coercion:</p>
      <ol>
        <li>**InsertIfTenancyEnding ****Both parties agreed that this tenancy will end by 1:00 p.m. on **MthDayYear, by which time the tenant agreed to have vacated the rental unit. ****</li>
        <li>**InsertIfMonetaryOrderGranted ****The {`{u_dispute-respondent-type}`} agreed to pay compensation in the amount of **$__.__ to the {`{u_dispute-applicant-type}`}. ****</li>
        <li>**InsertOtherSettlementAgreementOrDeleteThisLine</li>
        <li>Both parties agreed that these particulars comprise the full settlement of all aspects of the {`{u_dispute-applicant-type}`}'s current application for dispute resolution.</li>
      </ol>
    </> : //RTA
    <>
      <p>Under section 63 of the Act, the Arbitrator may assist the parties to settle their dispute. If the parties settle their dispute during the dispute resolution proceedings, the settlement may be recorded in the form of a decision or an order. During this hearing, the parties reached an agreement to settle their dispute.</p>
      <p>Both parties agreed to the following terms of a final and binding resolution of the {`{u_dispute-applicant-type}`}'s application and the issues in dispute arising out of this tenancy at this time and that they did so of their own free volition and without any element of coercion:</p>
      <ol>
        <li>**InsertIfTenancyEnding ****Both parties agreed that this tenancy will end by 1:00 p.m. on **MthDayYear, by which time the tenant agreed to have vacated the rental unit. ****</li>
        <li>**InsertIfMonetaryOrderGranted ****The {`{u_dispute-respondent-type}`} agreed to pay compensation in the amount of **$__.__ to the {`{u_dispute-applicant-type}`}. ****</li>
        <li>**InsertOtherSettlementAgreementOrDeleteThisLine</li>
        <li>Both parties agreed that these particulars comprise the full settlement of all aspects of the {`{u_dispute-applicant-type}`}'s current application for dispute resolution.</li>
      </ol>
    </>;
  },

  renderJsxStandardDecision() {
    const participatoryPartyInstructions = !this.isOutcomeDocDirectRequest ? <>
        <p><b>**InsertBelowIfContestingTestimonyFromBothPartiesOrDeleteIfUncontestedTestimony</b></p>
        <p>When two parties to a dispute provide equally plausible accounts of events or circumstances related to a dispute, the party making the claim has the burden to provide sufficient evidence over and above their testimony to establish their claim.</p>
      </> : null;

    return <>
      {participatoryPartyInstructions}
      <div className="decision_analysis_content"></div>
    </>;
  },

}, {
  getDataToLoad() {
    return {
      ...DecisionAnalysisContent.getDataToLoad(),
      [DecGenData.linkedDisputes]: DecisionAnalysisContent.getDataToLoad(),
    };
  },
});

