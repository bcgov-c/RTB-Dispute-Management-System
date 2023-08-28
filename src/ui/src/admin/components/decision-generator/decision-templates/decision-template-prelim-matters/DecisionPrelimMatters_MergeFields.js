import React from 'react';
import { renderToString } from 'react-dom/server';
import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';

export default {

  'st_issues-removed-intro': (contextData={}) => {
    return `The following issues ****were withdrawn at the outset of the hearing/are dismissed with leave to reapply:****`;
  },

  'st_issue-severed-info-text': (contextData={}) => {
    return renderToString(<>
      <p><i>Residential Tenancy Branch Rules of Procedure</i>, Rule 2.3, states that if, in the course of the dispute resolution proceeding the Arbitrator determines that it is appropriate to do so, the Arbitrator may sever or dismiss the unrelated disputes contained in a single application with or without leave to apply.</p>
      <p>Aside from the application to ****cancel the Notice to End Tenancy****, I am exercising my discretion to dismiss these issues identified in the application with leave to reapply as these matters are not related. Leave to reapply is not an extension of any applicable time limit.</p>
    </>);
  },

  'st_issue-amend-removed-arb-text': (contextData={}) => {
    return renderToString(contextData?.[DecGenData.dispute].isMHPTA() ? <>
      <b>Removed through amendment by arbitrator</b> - **InsertAmendedAnalysis In accordance with section 57 (3)(c) of the <i>Act</i>, I have amended the application and this issue is withdrawn.
    </> : <>
      <b>Removed through amendment by arbitrator</b> - **InsertAmendedAnalysis In accordance with section 64 (3)(c) of the <i>Act</i>, I have amended the application and this issue is withdrawn.
    </>);
  },

  'st_issue-amend-removed-applicant-text': (contextData={}) => {
    return renderToString(contextData?.[DecGenData.dispute].isMHPTA() ? <>
      The applicant requested to withdraw this issue from consideration. **InsertAmendedAnalysis In accordance with section 57 (3)(c) of the <i>Act</i>, I have permitted the application to be amended and this issue is withdrawn.
    </> : <>
      The applicant requested to withdraw this issue from consideration. **InsertAmendedAnalysis In accordance with section 64 (3)(c) of the <i>Act</i>, I have permitted the application to be amended and this issue is withdrawn.
    </>);
  },

  'st_issue-amend-removed-respondent-text': (contextData={}) => {
    return renderToString(contextData?.[DecGenData.dispute].isMHPTA() ? <>
      The respondent requested to withdraw this issue from consideration. **InsertAmendedAnalysis In accordance with section 57 (3)(c) of the <i>Act</i>, I have permitted the application to be amended and this issue is withdrawn.
    </> : <>
      The respondent requested to withdraw this issue from consideration. **InsertAmendedAnalysis In accordance with section 64 (3)(c) of the <i>Act</i>, I have permitted the application to be amended and this issue is withdrawn.
    </>);
  },

  'st_issue-monetary-text': (contextData={}) => {
    return renderToString(<>
      <p>**CompleteIfAdditionalUnpaidRentOrDeleteIfNone</p>
      <p>At the outset of the hearing the landlord sought to increase their monetary claim from **$__.__ to **$__.__ to reflect the tenant's failure to pay **$__.__in monthly rent for **MnthYear, the additional month of unpaid rent waiting for this hearing.</p>
      <p><i>Residential Tenancy Branch Rules of Procedure</i>, Rule 4.2, states that in circumstances that can reasonably be anticipated, such as when the amount of rent owing has increased since the time the Application for Dispute Resolution was made, the application may be amended at the hearing. I allow the amendment as this was clearly rent that the tenant would have known about and resulted since the landlord submitted the application.</p>
    </>);
  },

  // Required contextData
  // - issues: Array<DisputeClaimModel>
  'st_order-possession-monetary-act-sections': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<b>Re: An application under section(s) {`{issues_section-number-list}`} of the <i>{`{u_act}`}.</i></b>), contextData);
  },

};
