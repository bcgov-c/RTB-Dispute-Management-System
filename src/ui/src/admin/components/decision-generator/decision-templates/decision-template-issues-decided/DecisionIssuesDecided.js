import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';

const DecisionIssuesDecidedContent = GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);    
    this.filteredIssues = this.data[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence().filter(claim => (
      // Always ignore reverse awarded issues from this section - But keep LRSD issue
      (claim.isRetainSecurityDeposit() || !claim.isReverseAward())
      // Remove severed and amend/removed issues
      && !claim.hasOutcomeSever() && !claim.hasOutcomeAmend()
    ));
  },
  
  template() {
    const renderedErrors = this.renderJsxErrors();
    return this.finalizeRender(<>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
        <br/>
      </> : null}
      {renderedErrors ? renderedErrors : <div>
        {this.filteredIssues.map(issue => this.finalizeRender(<p>{`{bp_issue_decided-title}`}</p>, { issue }))}
      </div>}
    </>);
  },

  renderJsxErrors() {
    if (!this.filteredIssues) return <div>{this.wrapHtmlWithError(`--- NO ACTIVE ISSUES ON THIS DISPUTE. ADD ISSUES TO POPULATE THIS SECTION ---`)}</div>
    return false;
  },
}, {
  getDataToLoad() {
    return {
      [DecGenData.allIssues]: true,
    };
  }
});

export default GeneratedOutcomeDocSection.extend({
  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionIssuesDecidedContent);
  },

  ui: {
    content: '.decision_issues_decided_content'
  },

  template() {
    return <>
      <div className="section_title">Issue(s) to be Decided</div>
      <div className="decision_issues_decided_content"></div>
    </>
  },

}, {
  getDataToLoad() {
    return {
      ...DecisionIssuesDecidedContent.getDataToLoad(),
      [DecGenData.linkedDisputes]: DecisionIssuesDecidedContent.getDataToLoad(),
    };
  },
});
