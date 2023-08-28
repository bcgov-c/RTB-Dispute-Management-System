import Radio from 'backbone.radio';
import React from 'react';
import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';
import { IssueCodes } from '../../DecGenLookups';
import { renderToString } from 'react-dom/server';

const configChannel = Radio.channel('config');

const AnalysisLanguageConfig = {
  [`NPG-1`]: <p>Therefore, I find that the landlord is entitled to {`{bp_issue_act-title}`}.</p>,
  [`NPG-2`]: <p>Therefore, I find the landlord is entitled to {`{bp_issue_act-title}`} in the amount of {`{issue_awarded-amount}`}.</p>,
  [`NPG-3`]: <p>Therefore, I find that the tenant is entitled to a monetary award in the amount of {`{issue_awarded-amount}`}, the amount claimed by the tenant for double the security deposit and the pet damage deposit under section 38 of the Act.</p>,
  [`NPDWL-1`]: <>
    <p>**ReasonForDismissalInfoHere</p>
    <p>For the above reasons, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply on the basis of the 10 Day Notice dated **MnthDayYear. The 10 Day Notice dated **MnthDayYear is cancelled and of no force or effect.</p>
  </>,
  [`NPDWL-2`]: <>
    <p>**ReasonForDismissalInfoHere</p>
    <p>For the above reasons, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply, on the basis of the **One/Two/Four Month Notice to End Tenancy dated **MnthDayYear. The **One/Two/Four Month Notice dated **MnthDayYear is cancelled and of no force or effect.</p>
  </>,
  [`PG-1`]: <p>Therefore, I find that the landlord is entitled to {`{bp_issue_act-title}`}.</p>,
  [`PG-2`]: <>
    <p>Therefore, I find the landlord is entitled to {`{bp_issue_act-title}`}.</p>
  </>,
  [`PG-3`]: <p>As I have dismissed the landlord's application to retain the security and/or pet damage deposit due to the extinguishment of their right to keep it under the section **36/38 of the Act, I find that the tenant is entitled to a monetary award  in the amount of {`{issue_awarded-amount}`}, for double the return of the total security and/or pet damage deposit.</p>,
  [`PG-4`]: <>
    <p>Therefore, the tenant's application is granted for {`{bp_issue_act-title}`}.</p>
  </>,
  [`PG-5`]: <>
    <p>Therefore, I find the tenant is entitled to {`{bp_issue_act-title}`}, in the amount of {`{issue_awarded-amount}`}.</p>
  </>,
  [`PG-6`]: <></>,
  [`PG-7`]: <p>Therefore, I find the landlord is entitled to a Monetary Order for unpaid rent in the amount of {`{issue_awarded-amount}`}.</p>,
  [`PG-8`]: <>
    <p>Section 67 of the Act states that if damage or loss results from a tenancy, an Arbitrator may determine the amount of that damage or loss and order that party to pay compensation to the other party.</p>
    <p>Therefore, I find the landlord is entitled to {`{bp_issue_act-title}`}, in the amount of {`{issue_awarded-amount}`}.</p>
  </>,
  [`PG-9`]: <>
    <p>Section 60 of the Act states that if damage or loss results from a tenancy, an Arbitrator may determine the amount of that damage or loss and order that party to pay compensation to the other party.</p>
    <p>Therefore, I find the landlord is entitled to {`{bp_issue_act-title}`}, in the amount of {`{issue_awarded-amount}`}.</p>
  </>,
  [`PG-10`]: <p>Therefore, I find that the landlord is entitled to an Order of Possession.</p>,
  [`PDWL-1`]: <>
    <p>**ReasonForDismissalInfoHere</p>
    <p>For the above reasons, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply on the basis of the Notice to End Tenancy dated **MnthDayYear. The Notice to End Tenancy dated **MnthDayYear is cancelled and of no force or effect. This tenancy continues until ended in accordance with the Act.</p>
  </>,
  [`PDWL-2`]: <>
    <p>**ReasonForDismissalInfoHere</p>
    <p>For the above reasons, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply. This tenancy continues until ended in accordance with the Act.</p>
  </>,
  [`PS-1`]: <>
    <p>As discussed and agreed to by both parties at the hearing, I grant the landlord an order of possession {`{issue_awarded-timeframe}`}.</p>
  </>,
  [`BG-1`]: <p>As the {`{u_dispute-applicant-type}`} was successful in their application, I find that the {`{u_dispute-applicant-type}`} is entitled to recover the {`{issue_awarded-amount}`} filing fee paid for this application under section 72 of the Act.</p>,
  [`BG-2`]: <p>As the {`{u_dispute-applicant-type}`} was successful in their application, I find that the {`{u_dispute-applicant-type}`} is entitled to recover the {`{issue_awarded-amount}`} filing fee paid for this application under section 65 of the Act.</p>,
  [`BDWL-1`]: <>
    <p>**InsertReasonForDismissalHere</p>
    <p>For the above reasons, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, with leave to reapply. I make no findings on the merits of the matter.  Leave to reapply is not an extension of any applicable limitation period.</p>
  </>,
  [`BDWOL-1`]: <p>As the {`{u_dispute-applicant-type}`} was not successful in this application, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply.</p>,
  [`BDWOL-2`]: <>
    <p>**InsertReasonForDismissalHere</p>
    <p>For the above reasons, the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`} is dismissed, without leave to reapply.</p>
  </>,
  ['BS-1']: <>
    <p>**InsertSettlementAnalysisInfo</p>
    <p>Both parties agreed that these particulars comprise the full settlement of all aspects of the current {`{u_dispute-applicant-type}`} application for {`{bp_issue_act-title}`}</p>
  </>,
  ['BS-2']: <>
    <p>**InsertSettlementAnalysisInfo</p>
    <p>As discussed and agreed to by both parties at the hearing, I grant the landlord {`{bp_issue_act-title}`}, in the amount of {`{issue_awarded-amount}`}.</p>
  </>,
  ['BS-3']: <>
  <p>**InsertSettlementAnalysisInfo</p>
  <p>As discussed and agreed to by both parties at the hearing, I grant the tenant {`{bp_issue_act-title}`}, in the amount of {`{issue_awarded-amount}`}.</p>
  </>,
  ['BNJ-1']: <>
    <p>**InsertNoJurisdictionAnalysisHere</p>
    <p>Based on the evidence above and the affirmed testimony of both parties, I find that I do not have jurisdiction to hear this matter regarding the {`{u_dispute-applicant-type}`}'s application for {`{bp_issue_act-title}`}.</p>
  </>,
};

export default {

  'st_LL-adjourned-analysis': (contextData={}) => {
    return renderToString(<>
      <p>In an <i>ex parte</i> Direct Request Proceeding, the onus is on the landlord to ensure that all submitted evidentiary material is in accordance with the prescribed criteria and that such evidentiary material does not lend itself to ambiguity or give rise to issues that may need further clarification beyond the purview of a Direct Request Proceeding. If the landlord cannot establish that all documents meet the standard necessary to proceed via the Direct Request Proceeding, the application may be found to have deficiencies that necessitate a participatory hearing, or, in the alternative, the application may be dismissed.</p>
      <p>**InsertAdjournedLLDRAnalysisHereAndDeleteThisLine</p>
      <p>I find this discrepancy raises a question that can only be addressed in a participatory hearing.</p>
    </>);
  },

  'st_TT-adjourned-analysis': (contextData={}) => {
    return renderToString(<>
      <p>In an <i>ex parte</i> Direct Request Proceeding, the onus is on the tenant to ensure that all submitted evidentiary material is in accordance with the prescribed criteria and that such evidentiary material does not lend itself to ambiguity or give rise to issues that may need further clarification beyond the purview of a Direct Request Proceeding. If the tenant cannot establish that all documents meet the standard necessary to proceed via the Direct Request Proceeding, the application may be found to have deficiencies that necessitate a participatory hearing, or, in the alternative, the application may be dismissed.</p>
      <p>**InsertAdjournedTTDRAnalysisHereAndDeleteThisLine</p>
      <p>I find this discrepancy raises a question that can only be addressed in a participatory hearing.</p>
    </>);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'st_issue-outcome-statement': (contextData={}) => {
    let toReturn;
    // Dispute state
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    const isNonParticipatory = contextData?.[DecGenData.dispute]?.isNonParticipatory();
    const isParticipatoryOrSimilar = contextData?.[DecGenData.dispute]?.checkProcess([1, 4]);
    
    // Issue states
    const isLandlordHoldDeposit = contextData?.issue?.get('claim_code') === configChannel.request('get', 'LL_RETAIN_SECURITY_DEPOSIT_CODE');
    const isLandlordPossessionAll = [...IssueCodes.Emergency, ...IssueCodes.LL_OP, ...IssueCodes.LL_OP_STOP].includes(contextData?.issue?.get('claim_code'));
    const isLandlordPossessionAllWithoutEmerg = [...IssueCodes.LL_OP, ...IssueCodes.LL_OP_STOP].includes(contextData?.issue?.get('claim_code'));
    const isLandlordPossessionStopTenancy = [...IssueCodes.Emergency, ...IssueCodes.LL_OP_STOP].includes(contextData?.issue?.get('claim_code'));
    const isLandlordPossession = IssueCodes.LL_OP.includes(contextData?.issue?.get('claim_code'));
    const isLandlordDrPossession = IssueCodes.LL_DR_OP.includes(contextData?.issue?.get('claim_code'));
    const isLandlordPossession10Day = IssueCodes.LL_DR_OP_10Day.includes(contextData?.issue?.get('claim_code'));
    const isLandlordMonetary = [...IssueCodes.MN_LL, ...IssueCodes.MN_LL_Deposit, ...IssueCodes.LL_DR_MN].includes(contextData?.issue?.get('claim_code'));
    const isLandlordDrMonetary = IssueCodes.LL_DR_MN.includes(contextData?.issue?.get('claim_code'));
    const isLandlordOther = IssueCodes.LL_Other.includes(contextData?.issue?.get('claim_code'));
    const isLandlordTenantAward = contextData?.issue?.get('claim_code') === configChannel.request('get', 'TT_DEPOSIT_AWARD_LANDLORD_APP_ISSUE_CODE');
    const isTenantDrMonetary = IssueCodes.TT_DR_MN.includes(contextData?.issue?.get('claim_code'));
    const isTenantCn = IssueCodes.CN.includes(contextData?.issue?.get('claim_code'));
    const isTenantMonetary = [...IssueCodes.MN_TT].includes(contextData?.issue?.get('claim_code'));
    const isTenantMiscOrLandlordOther = [configChannel.request('get', 'LANDLORD_OTHER_ISSUE_CODE'), ...IssueCodes.TT_Misc].includes(contextData?.issue?.get('claim_code'));
    const isTenantReversePayment = contextData?.issue?.get('claim_code') === configChannel.request('get', 'LL_UNPAID_RENT_AWARD_TENANT_APP_ISSUE_CODE');
    const isTenantReversePossession = contextData?.issue?.get('claim_code') === configChannel.request('get', 'LL_POSSESSION_TENANT_APP_ISSUE_CODE');
    const isFeeRecovery = contextData?.issue?.isFeeRecovery();
    const isLandlordFeeRecovery = IssueCodes.LL_FF.includes(contextData?.issue?.get('claim_code'));
    const isTenantFeeRecovery = IssueCodes.TT_FF.includes(contextData?.issue?.get('claim_code'));
    const isReverseAward = contextData?.issue?.isReverseAward();
    const isRetainSecurityDeposit = contextData?.issue?.isRetainSecurityDeposit();
    
    // Issue award states
    const isGranted = contextData?.issue?.hasOutcomeAwarded();
    const isDismissedWithLeave = contextData?.issue?.hasOutcomeDismissedWithLeave();
    const isDismissedWithoutLeave = contextData?.issue?.hasOutcomeDismissedWithoutLeave();
    const isSettled = contextData?.issue?.hasOutcomeSettled();
    const isNoJurisdiction = contextData?.issue?.hasOutcomeNoJurisdiction();

    if (isNonParticipatory) {
      // Non-Participatory Granted Rules
      if (isGranted) {
        if (isLandlordDrPossession) {
          toReturn = AnalysisLanguageConfig['NPG-1'];
        } else if (isLandlordDrMonetary) {
          toReturn = AnalysisLanguageConfig['NPG-2'];
        } else if (isTenantDrMonetary) {
          toReturn = AnalysisLanguageConfig['NPG-3'];
        }
      } else if (isDismissedWithoutLeave) {
      // Non-Participatory Dismissed Rules
        if (isLandlordPossession10Day) {
          toReturn = AnalysisLanguageConfig['NPDWL-1'];
        } else if (isLandlordDrPossession) {
          toReturn = AnalysisLanguageConfig['NPDWL-2'];
        }
      }
    } else if (isParticipatoryOrSimilar) {
      // Participatory Granted Rules
      if (isGranted) {
        if (isLandlordPossessionAll) {
          toReturn = AnalysisLanguageConfig['PG-1'];
        } else if (isLandlordOther) {
          toReturn = AnalysisLanguageConfig['PG-2'];
        } else if (isLandlordTenantAward) {
          toReturn = AnalysisLanguageConfig['PG-3'];
        } else if (isTenantCn) {
          toReturn = AnalysisLanguageConfig['PG-4'];
        } else if (isTenantMonetary) {
          toReturn = AnalysisLanguageConfig['PG-5'];
        } else if (isTenantMiscOrLandlordOther) {
          toReturn = AnalysisLanguageConfig['PG-6'];
        } else if (isTenantReversePayment) {
          toReturn = AnalysisLanguageConfig['PG-7'];
        } else if (!isMHPTA && isLandlordMonetary) {
          toReturn = AnalysisLanguageConfig['PG-8'];
        } else if (isMHPTA && isLandlordMonetary) {
          toReturn = AnalysisLanguageConfig['PG-9'];
        } else if (isTenantReversePossession) {
          toReturn = AnalysisLanguageConfig['PG-10'];
        }
      } else if (isDismissedWithoutLeave) {
        // Participatory Dismissed Rules
        if (isLandlordPossession) {
          toReturn = AnalysisLanguageConfig['PDWL-1'];
        } else if (isLandlordPossessionStopTenancy) {
          toReturn = AnalysisLanguageConfig['PDWL-2'];
        }
      } else if (isSettled) {
        // Participatory Settled Rules
        if (isTenantMiscOrLandlordOther) {
          toReturn = AnalysisLanguageConfig['BS-1'];
        } else if (isLandlordMonetary || isLandlordFeeRecovery || isLandlordHoldDeposit) {
          toReturn = AnalysisLanguageConfig['BS-2'];
        } else if (isTenantMonetary || isTenantFeeRecovery || isLandlordTenantAward) {
          toReturn = AnalysisLanguageConfig['BS-3'];
        } else if (isLandlordPossessionAllWithoutEmerg) {
          toReturn = AnalysisLanguageConfig['PS-1'];
        }
      }
    }

    if (!toReturn) {
      // Apply General rules
      if (isGranted) {
        if (!isMHPTA && isFeeRecovery) {
          toReturn = AnalysisLanguageConfig['BG-1'];
        } else if (isMHPTA && isFeeRecovery) {
          toReturn = AnalysisLanguageConfig['BG-2'];
        }
      } else if (isDismissedWithLeave) {
      // General Dismissed rules
        toReturn = AnalysisLanguageConfig['BDWL-1'];
      } else if (isDismissedWithoutLeave && isFeeRecovery) {
        toReturn = AnalysisLanguageConfig['BDWOL-1'];
      } else if (isDismissedWithoutLeave && !isFeeRecovery && !isLandlordPossessionAll) {
        toReturn = AnalysisLanguageConfig['BDWOL-2'];
      } else if (isSettled) {
      // General Settled rules
        toReturn = AnalysisLanguageConfig['BG-1'];
      } else if (isNoJurisdiction && (!isReverseAward || isRetainSecurityDeposit)) {
      // General No Jurisdiction rules - does not apply to reverse awards except LRSD
        toReturn = AnalysisLanguageConfig['BNJ-1'];
      }
    }
    
    return DecGenFormatter.applyMergeFieldConversions(renderToString(toReturn), contextData);
  }
};
