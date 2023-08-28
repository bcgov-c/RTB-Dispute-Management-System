import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import { IssueCodes } from '../../DecGenLookups';
import DecisionPrelimMatters_MergeFields from './DecisionPrelimMatters_MergeFields';

const configChannel = Radio.channel('config');

const DecisionPrelimMattersContent = GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionPrelimMatters_MergeFields);

    // Ignore ignore reverse awarded issues (except LRSD) and deleted issues from this section
    this.filteredIssues = this.data[DecGenData.allIssues].filter(claim => (!claim.isReverseAward() || claim.isRetainSecurityDeposit()) && !claim.isDeleted());
    this.amendRemovedIssues = this.filteredIssues.filter(issue => issue.hasOutcomeAmend() || issue.hasOutcomeSever());
    this.monthlyRentIssues = this.filteredIssues.filter(issue => IssueCodes.MN_LL_Monthly.includes(issue.get('claim_code')));
    this.isMHPTA = this.data[DecGenData.dispute].isMHPTA();
    this.process = this.data[DecGenData.dispute].getProcess();
  },
  
  template() {
    if (this.data[DecGenData.dispute].checkProcess(2)) return;
    if (!this.amendRemovedIssues.length && !this.monthlyRentIssues.length) return;

    return this.finalizeRender(<>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
        <br/>
      </> : null}
      {this.renderJsxAmendRemovedIssues()}
      {this.monthlyRentIssues.length ? `{st_issue-monetary-text}` : null}
    </>);
  },

  renderJsxAmendRemovedIssues() {
    if (!this.amendRemovedIssues.length) return;
    const severedIssues = this.amendRemovedIssues.filter(issue => issue.hasOutcomeSever());
    const amendedIssues = this.amendRemovedIssues.filter(issue => issue.hasOutcomeAmend());
    return <>
      <p>{`{st_issues-removed-intro}`}</p>
      <ul>
      {
        severedIssues.map((issue, index) => <li>
            {this.finalizeRender(`{bp_issue_act-title-amount}`, { issue })}
          </li>
        )
      }
      </ul>
      {severedIssues.length ? <p>{`{st_issue-severed-info-text}`}</p> : null}

      {amendedIssues.map(issue => {
        const remedy = issue.getApplicantsRemedy();
        const statusCode = remedy.get('remedy_status_reason_code');
        return <>
          <ul>
            <li>
              {this.finalizeRender(`{bp_issue_act-title-amount}`, { issue })}
            </li>
          </ul>
          <div>{
            statusCode && statusCode === configChannel.request('get', 'REMEDY_STATUS_REASON_AMEND_REMOVED_BY_APPLICANT') ? `{st_issue-amend-removed-applicant-text}`
              : statusCode && statusCode === configChannel.request('get', 'REMEDY_STATUS_REASON_AMEND_REMOVED_BY_RESPONDENT') ? `{st_issue-amend-removed-respondent-text}`
              : `{st_issue-amend-removed-arb-text}`
          }</div>
        </>
      })}
      <br/>
    </>;
  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.allIssues]: true,
    };
  },
});

export default GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    
    // Always ignore reverse awarded issues and deleted issues from this section
    this.filteredIssues = this.data[DecGenData.allIssues].filter(claim => !claim.isReverseAward() && !claim.isDeleted());
    this.amendRemovedIssues = this.filteredIssues.filter(issue => issue.hasOutcomeAmend() || issue.hasOutcomeSever());
    this.monthlyRentIssues = this.filteredIssues.filter(issue => IssueCodes.MN_LL_Monthly.includes(issue.get('claim_code')));
  },
  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionPrelimMattersContent);
  },

  ui: {
    content: '.decision_prelim_content'
  },

  template() {
    if (this.data[DecGenData.dispute].checkProcess(2)) return;
    if (!this.amendRemovedIssues.length && !this.monthlyRentIssues.length) return;

    return <>
      <div className="section_title">Preliminary Matters</div>
      <div className="decision_prelim_content"></div>
    </>
  },

}, {
  getDataToLoad() {
    return {
      ...DecisionPrelimMattersContent.getDataToLoad(),
      [DecGenData.linkedDisputes]: DecisionPrelimMattersContent.getDataToLoad(),
    };
  },
});