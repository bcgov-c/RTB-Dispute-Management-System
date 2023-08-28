import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionConclusion_MergeFields from './DecisionConclusion_MergeFields';
import { DocTitles, IssueCodes } from '../../DecGenLookups';

const configChannel = Radio.channel('config');

export default GeneratedOutcomeDocSection.extend({

  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionConclusion_MergeFields);

    this.filteredIssues = this.data[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence();
    this.isLandlord = this.data[DecGenData.dispute].isLandlord();
    this.useBlank = !this.generationOptions?.insertConversational && !this.generationOptions?.insertStrict;
    this.isDoubleNoShow = (configChannel.request('get', 'file_types_double_no_show')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isInterimDecision = (configChannel.request('get', 'file_types_interim_decisions')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isSettlementAgreement = (configChannel.request('get', 'file_types_settlement_agreements')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isOutcomeDocDirectRequest = this.data[DecGenData.currentDoc]?.isDirectRequest();
    this.isAvailableParticipatory = (configChannel.request('get', 'file_types_participatory_conclusion_decisions')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isAvailableParticipatoryCrossed = (configChannel.request('get', 'file_types_participatory_cross_conclusion_decisions')||[]).includes(this.data[DecGenData.currentDoc].get('file_type'));
    this.isMHPTA = this.data?.[DecGenData.dispute]?.isMHPTA();
  },

  template() {
    return this.finalizeRender(<>
      <div className="section_title">Conclusion</div>
      {
        this.useBlank ? <div>**EnterConclusionSection</div> :
        this.isDoubleNoShow ? this.renderJsxNoShow() :
        this.isInterimDecision && this.isOutcomeDocDirectRequest ? this.renderJsxInterimDecisionDirectRequest() :
        this.isInterimDecision && !this.isOutcomeDocDirectRequest ? this.renderJsxInterimDecision() :
        this.isSettlementAgreement ? this.renderJsxSettlementAgreement() :
        this.isOutcomeDocDirectRequest ? this.renderJsxNonParticipatory() :
        this.isAvailableParticipatory ? this.renderJsxParticipatory() :
        this.isAvailableParticipatoryCrossed ? this.renderJsxParticipatoryCrossed() : null
      }
      {this.renderJsxSignoff()}
      {this.renderJsxSignature()}
      <br/>
    </>);
  },

  renderJsxNoShow() {
    return <>
      <p>Accordingly, in the absence of any evidence or submissions, I order the application dismissed, with leave to reapply. I make no findings on the merits of the matter. Leave to reapply is not an extension of any applicable limitation period.</p>
    </>;
  },

  renderJsxInterimDecisionDirectRequest() {
    return <div>{this.isLandlord ? `{st_LL-adjourned-conclusion}` : `{st_TT-adjourned-conclusion}`}</div>;
  },

  renderJsxInterimDecision() {
    return <>
      <p>Based on the above:</p>
      <ul>
        <li>****<b>I order</b> this hearing will be reconvened on the date identified in the Notice of Hearing documents attached to this decision;****</li>
        <li>****<b>I order</b> this adjournment is not an opportunity for either party to submit any additional evidence;****</li>
        <li>****<b>I order</b> this adjournment is not an opportunity for the {`{u_dispute-applicant-type}`} to amend this Application for Dispute Resolution;****</li>
        <li>****<b>I order</b> this adjournment is not an opportunity for the {`{u_dispute-respondent-type}`} to submit an Application for Dispute Resolution to be crossed, or for the {`{u_dispute-applicant-type}`} to submit a new Application for Dispute Resolution to be joined with this application currently before me.****</li>
      </ul>
      <p>**InsertAdditionalInterimOrdersIfNecessary</p>
    </>;
  },

  renderJsxSettlementAgreement() {
    const isMHPTA = this.data[DecGenData.dispute].isMHPTA();
    return isMHPTA ? <>
      <p>**KeepAndEditForOP In order to give effect to the settlement reached between the parties, and as discussed at the hearing, I grant an Order of Possession to the landlord effective <b>on **MthDayYear, after service of this Order</b> on the tenant.  Should the tenant or any occupant on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>
      <p>**KeepAndEditForMN In order to give effect to the above settlement reached between the parties, I grant a Monetary Order in the {`{u_dispute-applicant-type}`}'s favour in the amount of **$__.__. The {`{u_dispute-applicant-type}`} is provided with these Orders and the {`{u_dispute-respondent-type}`} must be served with a copy of these Orders as soon as possible. Should the {`{u_dispute-respondent-type}`} fail to comply with these Orders, these Orders may be filed in the Small Claims Division of the Provincial Court and enforced as Orders of that Court.</p>
      <p>**InsertOtherSettlementAgreementOrDeleteThisLine</p>
    </> : // RTA
    <>
      <p>**KeepAndEditForOP In order to give effect to the settlement reached between the parties, and as discussed at the hearing, I grant an Order of Possession to the landlord effective <b>on **MthDayYear, after service of this Order</b> on the tenant.  Should the tenant or any occupant on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>
      <p>**KeepAndEditForMN In order to give effect to the above settlement reached between the parties, I grant a Monetary Order in the {`{u_dispute-applicant-type}`}'s favour in the amount of **$__.__. The {`{u_dispute-applicant-type}`} is provided with these Orders and the {`{u_dispute-respondent-type}`} must be served with a copy of these Orders as soon as possible. Should the {`{u_dispute-respondent-type}`} fail to comply with these Orders, these Orders may be filed in the Small Claims Division of the Provincial Court and enforced as Orders of that Court.</p>
      <p>**InsertOtherSettlementAgreementOrDeleteThisLine</p>
    </>;
  },

  renderJsxNonParticipatory() {
    const landlordPossessionIssues = this.filteredIssues.filter(issue => IssueCodes.LL_DR_OP.includes(issue.get('claim_code')));
    const landlordMonetaryIssues = this.filteredIssues.filter(issue => IssueCodes.LL_DR_MN.includes(issue.get('claim_code')));
    const tenantMonetaryIssues = this.filteredIssues.filter(issue => IssueCodes.TT_DR_MN.includes(issue.get('claim_code')));
    const landlordFeeRecoveries = this.filteredIssues.filter(issue => IssueCodes.LL_FF.includes(issue.get('claim_code')));
    const tenantFeeRecoveries = this.filteredIssues.filter(issue => IssueCodes.TT_FF.includes(issue.get('claim_code')));
    const grantedPossession = landlordPossessionIssues.filter(issue => issue.hasOutcomeAwarded());
    const grantedLandlordMonetary = landlordMonetaryIssues.filter(issue => issue.hasOutcomeAwarded());
    const grantedTenantMonetary = tenantMonetaryIssues.filter(issue => issue.hasOutcomeAwarded());
    const hasOneGrantedPossession = grantedPossession.length === 1;
    const hasOneGrantedLandlordMonetaryOrFeeRecovery = grantedLandlordMonetary.length === 1 || landlordFeeRecoveries.filter(issue => issue.hasOutcomeAwarded()).length;
    const hasOneGrantedTenantMonetary = grantedTenantMonetary.length === 1;
    const dismissedIssues = this.filteredIssues.filter(issue => issue.hasOutcomeDismissed());
    
    return <>
      {
        /* Render LL possession */
        landlordPossessionIssues.find(issue => !issue.allOutcomesComplete()) ? this.wrapHtmlWithError(<p>--- POSSESSION CONCLUSIONS CANNOT BE POPULATED WHERE OUTCOME INFORMATION IS NOT COMPLETED IN DMS ---</p>)
        : grantedPossession.length > 1 ? this.wrapHtmlWithError(<p>--- POSSESSION CONCLUSIONS CANNOT BE POPULATED WHERE MORE THAN ONE POSSESSION IS GRANTED IN DMS ---</p>)
        : hasOneGrantedPossession ? this.finalizeRender(<p>{`{st_LL-possession-granted-conclusion}`}</p>, { issue: grantedPossession[0] })
        : null
      }

      {
        /* Render LL monetary */
        [...landlordMonetaryIssues, ...landlordFeeRecoveries].find(issue => !issue.allOutcomesComplete()) ? this.wrapHtmlWithError(<p>--- MONETARY CONCLUSIONS CANNOT BE POPULATED WHERE OUTCOME INFORMATION IS NOT COMPLETED IN DMS ---</p>)
        : grantedLandlordMonetary.length > 1 ? this.wrapHtmlWithError(<p>--- MONETARY CONCLUSIONS CANNOT BE POPULATED WHERE MORE THAN ONE MONETARY IS GRANTED IN DMS ---</p>)
        : hasOneGrantedLandlordMonetaryOrFeeRecovery ? <p>{`{st_LL-monetary-granted-conclusion}`}</p>
        : null
      }

      {
        /* Render TT monetary */
        [...tenantMonetaryIssues, ...tenantFeeRecoveries].find(issue => !issue.allOutcomesComplete()) ? this.wrapHtmlWithError(<div>--- MONETARY CONCLUSIONS CANNOT BE POPULATED WHERE OUTCOME INFORMATION IS NOT COMPLETED IN DMS ---</div>)
        : grantedTenantMonetary.length > 1 ? this.wrapHtmlWithError(<div>--- MONETARY CONCLUSIONS CANNOT BE POPULATED WHERE MORE THAN ONE MONETARY IS GRANTED IN DMS ---</div>)
        : hasOneGrantedTenantMonetary ? <p>{`{st_TT-monetary-granted-conclusion}`}</p>
        : null
      }

      {
        /* Render Dismissed issues */
        dismissedIssues.map(issue => this.finalizeRender(<p>{`{st_dismissed-conclusion}`}</p>, { issue }))
      }
    </>;
  },

  renderJsxParticipatory() {
    const hasMissingOutcomes = this.filteredIssues.filter(issue => !issue.allOutcomesComplete()).length;
    const landlordPossessionIssues = this.filteredIssues.filter(issue => [...IssueCodes.Emergency, ...IssueCodes.LL_OP, ...IssueCodes.LL_OP_STOP, ...IssueCodes.LL_OP_TT].includes(issue?.get('claim_code')));
    const issuesWithoutFeeRecovery = this.filteredIssues.filter(issue => !issue.isFeeRecovery());
    const awardedLandlordPossessionIssue = landlordPossessionIssues.find(c => c.hasOutcomeAwarded())
    const settledLandlordPossessionIssue = landlordPossessionIssues.find(c => c.hasOutcomeSettled())
    const tenantPossessionIssues = this.filteredIssues.filter(issue => IssueCodes.TT_OP.includes(issue?.get('claim_code')));
    const awardedTenantPossessionIssue = tenantPossessionIssues.find(c => c.hasOutcomeAwarded());
    const settledTenantPossessionIssue = tenantPossessionIssues.find(c => c.hasOutcomeSettled());
    const tenantMoveOutIssues = this.filteredIssues.filter(issue => IssueCodes.CN.includes(issue?.get('claim_code')));
    const monetaryIssues = this.filteredIssues.filter(issue => [...IssueCodes.MN_LL, ...IssueCodes.LL_DR_MN, ...IssueCodes.MN_LL_Deposit, ...IssueCodes.MN_TT, ...IssueCodes.MN_Misc, ...IssueCodes.FF].includes(issue?.get('claim_code')));
    const otherIssues = this.filteredIssues.filter(issue => [...IssueCodes.LL_Other, ...IssueCodes.TT_Misc].includes(issue?.get('claim_code')));
    const conclusionIssues = this.filteredIssues.filter(issue => IssueCodes.All.includes(issue?.get('claim_code')));
    const totalAwarded = this.filteredIssues.reduce((memo, issue) => issue.getAwardedAmount() + memo, 0);

    if (hasMissingOutcomes) return this.wrapHtmlWithError(<p>--- POSSESSION CONCLUSIONS CANNOT BE POPULATED WHERE OUTCOME INFORMATION IS NOT COMPLETED IN DMS  ---</p>);
    if (landlordPossessionIssues.filter(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled()).length > 1) return this.wrapHtmlWithError(<p>---  POSSESSION CONCLUSIONS CANNOT BE POPULATED WHERE MORE THAN ONE POSSESSION IS GRANTED OR SETTLED IN DMS  ---</p>);
    if (issuesWithoutFeeRecovery.every(issue => issue.hasOutcomeDismissedWithLeave())) return <p>The {`{u_dispute-applicant-type}`}'s application is dismissed, with leave to reapply.</p>;
    if (this.filteredIssues.every(issue => issue.hasOutcomeDismissedWithoutLeave())) return <p>The {`{u_dispute-applicant-type}`}'s application is dismissed in its entirety, without leave to reapply.</p>;
    if (this.filteredIssues.every(issue => issue.hasOutcomeNoJurisdiction())) return <p>I decline to proceed due to a lack of jurisdiction.</p>;

    const renderDismissedIssues = (issues, isOP=false) => {
      const dismissedIssues = issues.filter(issue => issue.hasOutcomeDismissed());
      return <>
        {
          dismissedIssues.map(issue => this.finalizeRender(<>
            {
              issue.hasOutcomeDismissedWithLeave() ? <>
                <p>The {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, with leave to reapply.</p>
                {isOP ? <p>This tenancy continues until it is ended in accordance with the Act.</p> : null}
              </> :
              issue.hasOutcomeDismissedWithoutLeave() ? <>
                <p>The {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply.</p>
                {isOP ? <p>This tenancy continues until it is ended in accordance with the Act.</p> : null}
              </> : null
            }
          </>, { issue }))
        }
      </>;
    };
    const renderNoJurisdictionIssue = (issue) => {
      return issue.hasOutcomeNoJurisdiction() ? this.finalizeRender(
        <p>I decline to proceed due to a lack of jurisdiction regarding the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`}.</p>, { issue }
      ) : null;
    };
    
    return <>
      {
        // Possession info
        awardedLandlordPossessionIssue ? this.finalizeRender(<p>I grant an Order of Possession to the landlord <b>{`{issue_awarded-timeframe}`}</b>. Should the tenant(s) or anyone on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>, { issue: awardedLandlordPossessionIssue }) :
        settledLandlordPossessionIssue ? this.finalizeRender(<p>In order to give effect to the above settlement, I grant an Order of Possession to the landlord <b>{`{issue_awarded-timeframe}`}</b>. Should the tenant(s) or anyone on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>, { issue: settledLandlordPossessionIssue }) :
        awardedTenantPossessionIssue ? this.finalizeRender(<p>I grant an Order of Possession to the tenant <b>{`{issue_awarded-timeframe}`}</b>. Should the landlord or anyone on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>, { issue: awardedTenantPossessionIssue }) :
        settledTenantPossessionIssue ? this.finalizeRender(<p>In order to give effect to the above settlement, I grant an Order of Possession to the tenant <b>{`{issue_awarded-timeframe}`}</b>. Should the landlord or anyone on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>, { issue: settledTenantPossessionIssue }) :
        tenantMoveOutIssues.length ? tenantMoveOutIssues.map(issue => {
          return this.finalizeRender(<>
            {issue.hasOutcomeAwarded() ? <>
                <p>The tenant's application is granted for {`{bp_issue_act-title}`}.</p>
                <p>The ****10 Day/One/Two/Four/12 Month Notice**** of **MnthDayYear is cancelled and is of no force or effect.</p>
                <p>This tenancy continues until it is ended in accordance with the Act.</p>
              </>
            : issue.hasOutcomeSettled() ? <>
              <p>In order to give effect to the above settlement in regard to the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`}, I order **InsertOrderHere</p>
              </>
            : null}
          </>, { issue });
        }) : null
      }
      {
        // Dismissed possession info
        renderDismissedIssues(conclusionIssues.filter(issue => landlordPossessionIssues.find(c => c.get('claim_code') === issue.get('claim_code'))), true)
      }
      {
        // No Jurisdiction possession info
        conclusionIssues.filter(issue => landlordPossessionIssues.find(c => c.get('claim_code') === issue.get('claim_code')))
          .map(renderNoJurisdictionIssue)
      }
      {
        // Monetary info
        totalAwarded !== 0 && monetaryIssues.length ? (totalAwarded > 0 ? '{st_monetary-participatory}' : '{st_monetary-participatory-reverse}') : null
      }
      {
        // Other/misc granted issues
        otherIssues.map(issue => {
          return this.finalizeRender(<>
            {
              issue.hasOutcomeAwarded() ? <p>The {`{u_dispute-applicant-type}`}'s application is granted for {`{bp_issue_act-title}`}.</p> :
              issue.hasOutcomeSettled() ? <p>In order to give effect to the above settlement in regard to the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`}, I order **InsertOrderHere</p>
              : null
            }
          </>, { issue })
        })
      }
      {
        // Dismissed non-OP
        renderDismissedIssues(conclusionIssues.filter(issue => !landlordPossessionIssues.find(c => c.get('claim_code') === issue.get('claim_code'))))
      }
      {
        // No Jurisdiction non-OP info
        conclusionIssues.filter(issue => !landlordPossessionIssues.find(c => c.get('claim_code') === issue.get('claim_code')))
          .map(renderNoJurisdictionIssue)
      }
    </>;
  },

  renderJsxParticipatoryCrossed() {
    const landlordPossessionIssues = this.filteredIssues.filter(issue => [...IssueCodes.Emergency, ...IssueCodes.LL_OP, ...IssueCodes.LL_OP_STOP, ...IssueCodes.LL_OP_TT].includes(issue?.get('claim_code')));
    const tenantMoveOutIssues = this.filteredIssues.filter(issue => IssueCodes.CN.includes(issue?.get('claim_code')));
    const monetaryIssues = this.filteredIssues.filter(issue => [...IssueCodes.MN_LL, ...IssueCodes.LL_DR_MN, ...IssueCodes.MN_LL_Deposit, ...IssueCodes.MN_TT, ...IssueCodes.MN_Misc, ...IssueCodes.FF].includes(issue?.get('claim_code')));

    return <>
      {
        landlordPossessionIssues.length || tenantMoveOutIssues.length ? <>
          <p>**IfOrderofPossessionIssuedAndCNdismissedUseThisWording</p>
          <p>The tenant's application is dismissed in its entirety, without leave to reapply.</p>
          <p>I grant an Order of Possession to the landlord effective <b>two days after service of this Order</b> on the tenant. Should the tenant(s) or anyone on the premises fail to comply with this Order, this Order may be filed and enforced as an Order of the Supreme Court of British Columbia.</p>
          <p>**IfCancelNoticetoEndTenancyAndOPDismissedUsethisWording</p>
          <p>The landlord's application is dismissed in its entirety, without leave to reapply.</p>
          <p>The tenant's application is successful.</p>
          <p>The ****10 Day/One/Two/Four/12 Month Notice**** of **MnthDayYear is cancelled and is of no force or effect.</p>
          <p>This tenancy continues until it is ended in accordance with the Act.</p>
        </> : null
      }
      {
        monetaryIssues.length ? <>
          <p>I grant the **landlord/tenant a Monetary Order in the amount of **$__.__ for **InsertItemHere and for the recovery of the filing fee.
            The **landlord/tenant is provided with this Order in the above terms and the **landlord/tenant must be served with this Order as soon as possible.
            Should the **landlord/tenant fail to comply with this Order, this Order may be filed in the Small Claims Division of the Provincial Court and enforced as an Order of that Court.</p>
        </> : null
      }
      {
        this.filteredIssues.length > (landlordPossessionIssues.length + tenantMoveOutIssues.length + monetaryIssues.length) ? <>
          <p>The **landlord/tenant's application is successful. I order...</p>
        </> : null
      }
    </>;
  },

  renderJsxSignoff() {
    return <>
      <p>This {`{u_document_title}`} is made on authority delegated to me by the Director of the Residential Tenancy Branch under section 9.1(1) of the <i>{`{u_act}`}</i>.</p>
      <p>Dated: {`{u_document_date}`}</p>
    </>
  },

  renderJsxSignature() {
    const signature = this.data[DecGenData.signature];
    return <p className="signature_container">
      {signature?.img ? <img src={signature.img} width={`${signature.dimensions?.width}`} height={`${signature.dimensions?.height}`} />
      : <>**InsertSignatureHere</>}
    </p>;
  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.currentDoc]: true,
      [DecGenData.currentDocSet]: true,
      [DecGenData.signature]: true,
    };
  },
});
