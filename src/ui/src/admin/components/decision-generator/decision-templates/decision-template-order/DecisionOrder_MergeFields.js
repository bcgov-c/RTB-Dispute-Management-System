import React from 'react';
import { renderToString } from 'react-dom/server';
import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';
import { IssueCodes } from '../../DecGenLookups';

export default {

  // Required contextData
  // - issues: Array<DisputeClaimModel>
  'st_order-possession-act-sections': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    const hasLandlordOP = contextData?.issues?.filter(issue => [...IssueCodes.Emergency, ...IssueCodes.LL_OP, ...IssueCodes.LL_OP_STOP, ...IssueCodes.LL_OP_TT].includes(issue?.get('claim_code'))).length;
    const hasTenantOp = contextData?.issues?.filter(issue => [...IssueCodes.TT_OP].includes(issue?.get('claim_code'))).length;
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>{
      isMHPTA ? <>{
        hasLandlordOP ? <b>Re: An application under section(s) {`{issues_section-number-list}`} and 48 of the <i>{`{u_act}`}.</i></b> :
        hasTenantOp ? <b>Re: An application under section(s) {`{issues_section-number-list}`} and 47 of the <i>{`{u_act}`}.</i></b> :
        null
      }</> :
      // RTA
      <>{
        hasLandlordOP ? <b>Re: An application under section(s) {`{issues_section-number-list}`} and 55 of the <i>{`{u_act}`}.</i></b> :
        hasTenantOp ? <b>Re: An application under section(s) {`{issues_section-number-list}`} and 54 of the <i>{`{u_act}`}.</i></b> :
        null
      }</>
    }</>), contextData);
  },

  // Required contextData
  // - issues: Array<DisputeClaimModel>
  'st_order-possession-monetary-act-sections': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<b>Re: An application under section(s) {`{issues_section-number-list}`} of the <i>{`{u_act}`}.</i></b>), contextData);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'st_applicant_possession-order': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      <p><b>I DO AUTHORIZE AND COMMAND YOU, {`{u_dispute-respondent-party-list}`}</b>, {`{u_dispute-respondent-type}`}, and any other occupant or other person occupying the premises to deliver full and peaceable vacant possession and occupation of the said premises to the {`{u_dispute-applicant-type}`}, <b>{`{u_dispute-applicant-party-list}`}</b>, {`{issue_awarded-timeframe}`}.</p>
      <p><b>THIS ORDER</b> may be filed and enforced in the Supreme Court of British Columbia.</p>
    </>), contextData);
  },

  'st_respondent_possession-order': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      <p><b>I DO AUTHORIZE AND COMMAND YOU, {`{u_dispute-applicant-party-list}`}</b>, {`{u_dispute-applicant-type}`}, and any other occupant or other person occupying the premises to deliver full and peaceable vacant possession and occupation of the said premises to the {`{u_dispute-respondent-type}`}, <b>{`{u_dispute-respondent-party-list}`}</b>, {`{issue_awarded-timeframe}`}.</p>
      <p><b>THIS ORDER</b> may be filed and enforced in the Supreme Court of British Columbia.</p>
    </>), contextData);
  }, 

  'st_single-monetary-order': (contextData={}) => {
    const grantedIssues = contextData?.[DecGenData.allIssues]?.filter(issue => !issue.isRemoved() && issue.hasOutcomeAwarded());
    const hasGrantedFeeRecovery = grantedIssues?.filter(issue => issue.isFeeRecovery()).length;
    const onlyHasGrantedFeeRecovery = grantedIssues?.length === 1 && hasGrantedFeeRecovery;
    const totalAwarded = contextData?.[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence().reduce((memo, issue) => issue.getAwardedAmount() + memo, 0);
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    let contentToReturn = '';
    if (onlyHasGrantedFeeRecovery) {
      contentToReturn = isMHPTA ? <p><b>I DO HEREBY ORDER</b>, under section 65 of the <i>{`{u_act}`}</i>, that the respondent, <b>{`{u_dispute-respondent-party-list}`}</b>, pay to the  applicant, <b>{`{u_dispute-applicant-party-list}`}</b>, the sum of <b>{`{u_issues-total-awarded-amount}`}</b>.</p> :
        <p><b>I DO HEREBY ORDER</b>, under section 72 of the <i>{`{u_act}`}</i>, that the respondent, <b>{`{u_dispute-respondent-party-list}`}</b>, pay to the  applicant, <b>{`{u_dispute-applicant-party-list}`}</b>, the sum of <b>{`{u_issues-total-awarded-amount}`}</b>.</p>
    } else if (totalAwarded > 0) {
      contentToReturn = isMHPTA ? <p><b>I DO HEREBY ORDER</b>, under sections 60 and 65 of the <i>{`{u_act}`}</i> that the respondent, <b>{`{u_dispute-respondent-party-list}`}</b>, pay to the applicant, <b>{`{u_dispute-applicant-party-list}`}</b>, the sum of <b>{`{u_issues-total-awarded-amount}`}</b>.</p> :
        <p><b>I DO HEREBY ORDER</b>, under sections 67 and 72 of the <i>{`{u_act}`}</i>, that the respondent, <b>{`{u_dispute-respondent-party-list}`}</b>, pay to the applicant, <b>{`{u_dispute-applicant-party-list}`}</b>, the sum of <b>{`{u_issues-total-awarded-amount}`}</b>.</p>;
    } else if (totalAwarded < 0) {
      contentToReturn = isMHPTA ? <p><b>I DO HEREBY ORDER</b>, under sections 67 and 72 of the <i>{`{u_act}`}</i>, that the applicant, <b>{`{u_dispute-applicant-party-list}`}</b>, pay to the respondent, <b>{`{u_dispute-respondent-party-list}`}</b>, the sum of <b>{`{u_issues-total-awarded-amount}`}</b>.</p> :
        <p><b>I DO HEREBY ORDER</b>, under sections 67 and 72 of the <i>{`{u_act}`}</i>, that the applicant, <b>{`{u_dispute-applicant-party-list}`}</b>, pay to the respondent, <b>{`{u_dispute-respondent-party-list}`}</b>, the sum of <b>{`{u_issues-total-awarded-amount}`}</b>.</p>;
    }

    return DecGenFormatter.applyMergeFieldConversions(renderToString(contentToReturn), contextData);
  },


};
