import React from 'react';
import { renderToString } from 'react-dom/server';
import Formatter from '../../../../../core/components/formatter/Formatter';
import DecGenData from '../../DecGenData';
import { IssueCodes } from '../../DecGenLookups';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';

export default {

  'st_LL-possession-granted-conclusion': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(`I grant an Order of Possession to the landlord <b>{issue_awarded-timeframe}</b>.  Should the tenant(s) or anyone on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.`, contextData);
  },

  'st_LL-monetary-granted-conclusion': (contextData={}) => {
    const grantedIssues = contextData?.[DecGenData.allIssues]?.filter(issue => !issue.isRemoved() && issue.hasOutcomeAwarded());
    const grantedMonetaryIssues = grantedIssues.filter(issue => [...IssueCodes.LL_DR_MN, ...IssueCodes.LL_FF].includes(issue.get('claim_code')));
    const hasGrantedFeeRecovery = grantedMonetaryIssues?.filter(issue => issue.isFeeRecovery()).length;
    const onlyHasGrantedFeeRecovery = grantedMonetaryIssues?.length === 1 && hasGrantedFeeRecovery;
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>{
        /* MN + FF granted */
        hasGrantedFeeRecovery && !onlyHasGrantedFeeRecovery ? <>I grant the landlord a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> for rent owed for **MnthYear, and for the recovery of the filing fee for this application. The landlord is provided with this Order in the above terms and the tenant(s) must be served with <b>this Order</b> as soon as possible.  Should the tenant(s) fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</>
        /* Only FF granted */
        : onlyHasGrantedFeeRecovery ? <>I grant the landlord a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> for the recovery of the filing fee for this application. The landlord is provided with this Order in the above terms and the tenant(s) must be served with <b>this Order</b> as soon as possible.  Should the tenant(s) fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</>
        /* No granted fee recovery */
        : !hasGrantedFeeRecovery ? <>I grant the landlord a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> for rent owed for **MnthYear. The landlord is provided with this Order in the above terms and the tenant(s) must be served with <b>this Order</b> as soon as possible.  Should the tenant(s) fail to comply with <b>this Order</b>, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</>
        : null
      }</>), contextData);
  },

  /* Required context: issue (tenant DR issue) */
  'st_TT-monetary-granted-conclusion': (contextData={}) => {
    const hasGrantedFeeRecovery = contextData?.[DecGenData.allIssues]?.find(issue => !issue.isRemoved() && issue.isFeeRecovery() && issue.hasOutcomeAwarded());
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      {hasGrantedFeeRecovery ? <>
        I grant the tenant a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> for the return of double {`{st_granted-conclusion-deposit-text}`} and for the recovery of the filing fee for this application. The tenant is provided with <b>this Order</b> in the above terms and the landlord must be served with this Order as soon as possible.  Should the landlord fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</>
      : <>
        I grant the tenant a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> for the return of double {`{st_granted-conclusion-deposit-text}`}. The tenant is provided with <b>this Order</b> in the above terms and the landlord must be served with this Order as soon as possible.  Should the landlord fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.
      </>}
    </>), contextData);
  },

  /* Required context: issue (tenant DR issue) */
  'st_granted-conclusion-deposit-text': (contextData={}) => {
    const isValidWithNoDeposit = contextData?.issue?.isValidWithNoDeposit();
    const isValidWithNoPetDeposit = contextData?.issue?.isValidWithNoPetDeposit();
    const isValidWithNoSecurityDeposit = contextData?.issue?.isValidWithNoSecurityDeposit();
    return `${
      !isValidWithNoDeposit && !isValidWithNoPetDeposit && !isValidWithNoSecurityDeposit ?  `the security deposit and the pet damage deposit`
      : !isValidWithNoDeposit && !isValidWithNoPetDeposit && isValidWithNoSecurityDeposit ?  `the pet damage deposit`
      : !isValidWithNoDeposit && isValidWithNoPetDeposit && !isValidWithNoSecurityDeposit ?  `the security deposit`
      : ''
    }`;
  },

  /* Required context: issue*/
  'st_dismissed-conclusion': (contextData={}) => {
    const issue = contextData?.issue;
    const isLandlordOP = IssueCodes.LL_DR_OP.includes(issue?.get('claim_code'));
    const withoutLeave = issue?.hasOutcomeDismissedWithoutLeave();

    return DecGenFormatter.applyMergeFieldConversions(isLandlordOP && !withoutLeave ?
      `The landlord's application for {bp_issue_act-title} is dismissed, with leave to reapply.`
    : isLandlordOP && withoutLeave ? 
      `The landlord's application for {bp_issue_act-title} is dismissed, without leave to reapply. This tenancy will continue until ended in accordance with the Act.`
    : !isLandlordOP && !withoutLeave ?
      `The {u_dispute-applicant-type}'s application for {bp_issue_act-title} is dismissed, with leave to reapply.`
    : !isLandlordOP && withoutLeave ?
      `The {u_dispute-applicant-type}'s application for {bp_issue_act-title} is dismissed, without leave to reapply.`
    : ``, contextData);
  },
  
  
  'st_LL-adjourned-conclusion': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    return renderToString(isMHPTA ? <>
      {/* MHPTA Language */}
      <p>I order that the direct request proceeding be reconvened in accordance with section 67 of the Act. I find that a participatory hearing to be conducted by an arbitrator appointed under the Act is required in order to determine the details of the landlord's application.</p>
      <p><b>Notices of Reconvened Hearing are enclosed with this interim decision. The applicant must serve the Notice of Reconvened Hearing, the interim decision, and all other required documents, upon the tenant within three (3) days of receiving this decision in accordance with section 82 of the Act.</b></p>
      <p>Each party must serve the other and the Residential Tenancy Branch with any evidence that they intend to reply upon at the new hearing. Fact sheets are available at <a href="http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf">http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf</a> that explain evidence and service requirements. For more information see our website at: <a href="http://gov.bc.ca/landlordtenant">http://gov.bc.ca/landlordtenant</a>. If either party has any questions they may contact an Information Officer with the Residential Tenancy Branch at:</p>
      <p className="tab">
        <b>Lower Mainland</b>: 604-660-1020
        <br/><b>Victoria</b>: 250-387-1602
        <br/><b>Elsewhere in BC</b>: 1-800-665-8779
      </p>
    </> : <>
      {/* RTA Language */}
      <p>I order that the direct request proceeding be reconvened in accordance with section 74 of the Act. I find that a participatory hearing to be conducted by an arbitrator appointed under the Act is required in order to determine the details of the landlord's application.</p>
      <p><b>Notices of Reconvened Hearing are enclosed with this interim decision. The applicant must serve the Notice of Reconvened Hearing, the interim decision, and all other required documents, upon the tenant within three (3) days of receiving this decision in accordance with section 89 of the Act.</b></p>
      <p>Each party must serve the other and the Residential Tenancy Branch with any evidence that they intend to reply upon at the new hearing. Fact sheets are available at <a href="http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf">http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf</a> that explain evidence and service requirements. For more information see our website at: <a href="http://gov.bc.ca/landlordtenant">http://gov.bc.ca/landlordtenant</a>. If either party has any questions they may contact an Information Officer with the Residential Tenancy Branch at:</p>
      <p className="tab">
        <b>Lower Mainland</b>: 604-660-1020
        <br/><b>Victoria</b>: 250-387-1602
        <br/><b>Elsewhere in BC</b>: 1-800-665-8779
      </p>
    </>);
  },

  'st_TT-adjourned-conclusion': (contextData={}) => {
    return renderToString(<>
      <p>I order that the direct request proceeding be reconvened in accordance with section 74 of the Act. I find that a participatory hearing to be conducted by an arbitrator appointed under the Act is required in order to determine the details of the tenant's application.</p>
      <p><b>Notices of Reconvened Hearing are enclosed with this interim decision. The applicant must serve the Notice of Reconvened Hearing, the interim decision, and all other required documents, upon the landlord within three (3) days of receiving this decision in accordance with section 89 of the Act.</b></p>
      <p>Each party must serve the other and the Residential Tenancy Branch with any evidence that they intend to reply upon at the new hearing. Fact sheets are available at <a href="http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf">http://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb114.pdf</a> that explain evidence and service requirements.</p>
      <p>For more information see our website at: <a href="http://gov.bc.ca/landlordtenant">http://gov.bc.ca/landlordtenant</a>. If either party has any questions they may contact an Information Officer with the Residential Tenancy Branch at:</p>
      <p className="tab">
        <b>Lower Mainland</b>: 604-660-1020
        <br/><b>Victoria</b>: 250-387-1602
        <br/><b>Elsewhere in BC</b>: 1-800-665-8779
      </p>
    </>);
  },

  'st_monetary-participatory': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      <p>I grant the {`{u_dispute-applicant-type}`} a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> under the following terms:</p> 
      {`{st_monetarytable-conclusion}`}
      <p>The {`{u_dispute-applicant-type}`} is provided with this Order in the above terms and the {`{u_dispute-respondent-type}`}(s) must be served with <b>this Order</b> as soon as possible. Should the {`{u_dispute-respondent-type}`}(s) fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</p>
    </>), contextData);
  },

  'st_monetary-participatory-reverse': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      <p>I grant the {`{u_dispute-respondent-type}`} a Monetary Order in the amount of <b>{`{u_issues-total-awarded-amount}`}</b> under the following terms:</p>
      {`{st_monetarytable-conclusion}`}
      <p>The {`{u_dispute-respondent-type}`} is provided with this Order in the above terms and the {`{u_dispute-applicant-type}`}(s) must be served with <b>this Order</b> as soon as possible. Should the {`{u_dispute-applicant-type}`}(s) fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</p>
    </>), contextData);
  },
  
  'st_monetarytable-conclusion': (contextData={}) => {
    const allAwardedMonetaryIssues = contextData?.[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence().filter(issue => {
      return (issue.hasOutcomeAwarded() || issue.hasOutcomeSettled()) && Number(issue.getAwardedAmount()) !== 0;
    });
    const totalAwarded = allAwardedMonetaryIssues.reduce((memo, issue) => issue.getAwardedAmount() + memo, 0);
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      <p style={{ display: 'flex', justifyContent: 'center' }}>
        <table width="100%" border="1" cellspacing="0" cellpadding="0" style={{ border: '1px solid #CCC' }}><tbody>
          <tr>
            <td style={{ border: '1px solid #CCC', backgroundColor: '#e6e6e6', width: '82%', padding: '4px' }}><b>Monetary Issue</b></td>
            <td style={{ border: '1px solid #CCC', backgroundColor: '#e6e6e6', padding: '4px', textAlign: 'right' }}><b>Granted Amount</b></td>
          </tr>
          {allAwardedMonetaryIssues.map(issue => {
            const shouldIssueBeNegative = (totalAwarded > 0 && issue.getAwardedAmount() < 0) || (totalAwarded < 0 && issue.getAwardedAmount() > 0);
            // NOTE: Limitation to merge field parsing, cannot nest `applyMergeFieldConversions` or it will split out HTML as string
            // Workaround is to wrap only the string part of the value in the nested call
            return <tr>
              <td style={{ border: '1px solid #CCC', width: '82%', padding: '4px' }}>
                {DecGenFormatter.applyMergeFieldConversions(`{bp_issue_act-title}`, Object.assign({ issue }, contextData))}
              </td>
              <td style={{ border: '1px solid #CCC', textAlign: 'right', padding: '4px' }}>
                {DecGenFormatter.applyMergeFieldConversions(shouldIssueBeNegative ? `{issue_awarded-amount-negative-signed}` : `{issue_awarded-amount}`, Object.assign({ issue }, contextData))}
              </td>
            </tr>;
          })}
          <tr>
            <td style={{ border: '1px solid #CCC', width: '82%', textAlign: 'right', padding: '4px' }}><b>Total Amount</b></td>
            <td style={{ border: '1px solid #CCC', textAlign: 'right', padding: '4px' }}><b>{Formatter.toAmountDisplay(Math.abs(totalAwarded), false, false)}</b></td>
          </tr>
        </tbody></table>
      </p>
    </>), contextData);
  },

};
