import React from 'react';
import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';
import { renderToString } from 'react-dom/server';
import { IssueCodes } from '../../DecGenLookups';

export default {

  'st_background_opening': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(`I have reviewed all evidence, including the testimony of the parties, but will refer only to what I find relevant for my decision.`, contextData);
  },

  'st_tenancy-summary': (contextData={}) => {
    const securityDepositText = contextData?.[DecGenData.dispute]?.hasSecurityDeposit() ? `a security deposit in the amount of {u_security-deposit-amount|**$__.__}` : '';
    const petDepositText = contextData?.[DecGenData.dispute]?.hasPetDeposit() ? `a pet damage deposit in the amount of {u_pet-damage-deposit-amount|**$__.__}` : '';
    return DecGenFormatter.applyMergeFieldConversions(
      `Evidence was provided showing that this tenancy began on {u_tenancy-start-date|**MnthDayYear}, with a monthly rent of {u_rent-payment-amount|**$__.__}, due on {u_rent-payment-interval|**RentPaymentOn}`
      + `${securityDepositText || petDepositText ? `, with ${securityDepositText ? securityDepositText : ''}${securityDepositText && petDepositText ? ' and ' : ''}${petDepositText}` : ''}.`, contextData);
  },

  'st_tenancy-summary-ta': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(`A copy of a residential tenancy agreement which was signed by the {u_tenancy-agreement-signed-by|**TenancyAgreementSignedBy} on {u_tenancy-agreement-date|**MnthDayYear}, indicating a monthly rent of {u_rent-payment-amount|**$__.__}, due on the {u_rent-payment-interval|**RentPaymentOn} for a tenancy commencing on {u_tenancy-start-date|**MnthDayYear};`, contextData);
  },

  'st_tenancy-evidence-list': (contextData={}) => {
    if (!contextData?.[DecGenData.dispute]?.isNonParticipatory()) return;
    
    const isLandlord = contextData?.[DecGenData.dispute]?.isLandlord();
    const isLandlordPossession10Day = isLandlord && contextData?.[DecGenData.allIssues].filter(issue => IssueCodes.LL_DR_OP_10Day.includes(issue.get('claim_code')))?.length;
    return DecGenFormatter.applyMergeFieldConversions(renderToString(isLandlordPossession10Day ? <>
      {/* OPU-DR, OPR-DR */}
      <li>**** A copy of **InsertCountOfForms Notice of Rent Increase forms showing the rent being increased from **$__.__ to the monthly rent amount of **$__.__ ****</li>
      <li>A copy of the 10 Day Notice dated **MnthDayYear, for **$__.__ in unpaid rent. The 10 Day Notice provides that the tenant had five days from the date of service to pay the rent in full or apply for Dispute Resolution or the tenancy would end on the stated effective vacancy date of **MnthDayYear;</li>
      <li>**** A copy of a witnessed Proof of Service Notice to End Tenancy form which indicates that the 10 Day Notice was posted to the tenant's door at **__:__ am or pm not indicated on **MnthDayYear ****</li>
      <li>A Direct Request Worksheet showing the rent owing and paid during the relevant portion of this tenancy.</li>
    </> : isLandlord ? <>
      {/* OPC-DR, OPE-DR, OPQ-DR, OPL-4M-DR */}
      <li>A copy of a ****One/Two/Four Month Notice to End Tenancy For Cause/For End of Employment/Because Tenant Does Not Qualify for Subsidized Rental Unit/For Demolition or Conversion of a Rental Unit**** dated **MnthDayYear. The notice to end tenancy provides that the tenant had **10/15/30 days from the date of service to apply for Dispute Resolution or the tenancy would end on the stated effective vacancy date of **MnthDayYear;</li>
      <li>**** A copy of a witnessed Proof of Service Notice to End Tenancy form which indicates that the notice to end tenancy was posted to the tenant's door at **__:__ am or pm not indicated on **MnthDayYear;****</li>
      <li>A copy of **InsertSupportingEvidenceHere.</li>
    </> : <>
      {/* Tenant DR evidence list */}
      <li>**** A copy of a notice to vacate which was signed by the tenant on **MnthDayYear indicating the tenancy would end as of **MnthDayYear ; ****</li>
      <li>**** A copy of a letter from the tenant to the landlord dated **MnthDayYear , providing the tenant's forwarding address and requesting the return of the deposit; ****</li>
      <li>**** A copy of a Proof of Service Tenant Forwarding Address for the Return of Security and/or Pet Damage Deposit form (Proof of Service of the Forwarding Address) which indicates that the forwarding address was sent to the landlord by registered mail at **Hour:Min AM PM on **MnthDayYear; ****</li>
      <li>**** A copy of a Canada Post Customer Receipt containing the tracking number to confirm the forwarding address was sent to the landlord on **MnthDayYear ; ****</li>
    </>), contextData);
  },

  'st_tt_security-deposit-summary': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(
      `A copy of a receipt dated **MnthDayYear for {u_security-deposit-amount} of security deposit, paid by the tenant;`
    , contextData);
  },

  'st_tt_pet-damage-deposit-summary': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(
      `A copy of a receipt dated **MnthDayYear for {u_pet-damage-deposit-amount} of pet damage deposit, paid by the tenant;`
    , contextData);
  },

  'st_tenant-worksheet-summary': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(
      `**** A copy of a Tenant's Direct Request Worksheet showing the amount of the deposits paid by the tenant, an authorized deduction of **$__.__ , a partial reimbursement of **$__.__. and indicating the tenancy ended on {u_tenancy-end-date|**MnthDayYear}. ****`
    , contextData);
  },

  // Required contextData
  // - file: FileModel
  // Required loaded extra data: Notes
  'st_referenced-evidence-item': (contextData={}) => {
    const file = contextData.file;
    const renameDisplay = file?.wasRenamed() ? ` (Original name: {files_evidence-original-filename})` : '';
    const referencedDisplay = file?.getDecisionNotes()?.length ? `: {files_evidence-reference-note}` : '';
    return DecGenFormatter.applyMergeFieldConversions(
      `{files_evidence-filename}${renameDisplay}${referencedDisplay}`
    , contextData);
  },

};
