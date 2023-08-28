import Radio from 'backbone.radio';
import DecGenData from "../DecGenData";
import DecGenIssueConfig from "../DecGenIssueConfig";
import Formatter from "../../../../core/components/formatter/Formatter";
import { DecGenFormatter } from './DecGenFormatter';
import { MHPTA_ACT_CONFIG, RTA_ACT_CONFIG } from '../DecGenActTextConfig';
import { DocTitles } from '../DecGenLookups';

const MERGE_FIELD_ERROR_PREFIX = `INVALID_MERGE_FIELD`;
const _createMergeFieldError = (mergeField, customMessage='') => `**${MERGE_FIELD_ERROR_PREFIX}=${mergeField}${customMessage ? `, ${customMessage}` : ''}`;

const configChannel = Radio.channel('config');

// Shared utility methods for parsing data etc
const getBpConfig = (contextData={}) => {
  const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
  const process = contextData?.[DecGenData.dispute]?.getProcess();
  return DecGenIssueConfig[contextData?.issue?.get('claim_code')]?.[isMHPTA ?'MHPTA':'RTA']?.[process];
};

const getDisputeParties = (contextData={}) => {
  return contextData?.[DecGenData.allParticipants]?.filter(p => !p.isRemoved() && !p.isAssistant());
};

export default {
  'u_dispute-applicant-type': (contextData={}) => {
    return contextData?.[DecGenData.dispute]?.isLandlord() ? 'landlord' : 'tenant';
  },

  'u_dispute-respondent-type': (contextData={}) => {
    return contextData?.[DecGenData.dispute]?.isLandlord() ? 'tenant' : 'landlord';
  },

  'u_initial-payment-date': (contextData={}) => {
    return Formatter.toFullDateDisplay(contextData?.[DecGenData.dispute]?.get('initial_payment_date'));
  },

  'u_tenancy-start-date': (contextData={}) => {
    return Formatter.toFullDateDisplay(contextData?.[DecGenData.dispute]?.get('tenancy_start_date'));
  },

  'u_tenancy-end-date': (contextData={}) => {
    return Formatter.toFullDateDisplay(contextData?.[DecGenData.dispute]?.get('tenancy_end_date'));
  },
  
  'u_pet-damage-deposit-amount': (contextData={}) => {
    return contextData?.[DecGenData.dispute]?.get('pet_damage_deposit_amount') ?
      Formatter.toAmountDisplay(contextData?.[DecGenData.dispute]?.get('pet_damage_deposit_amount'))
    : null;
  },

  'u_security-deposit-amount': (contextData={}) => {
    return contextData?.[DecGenData.dispute]?.get('security_deposit_amount') ?
      Formatter.toAmountDisplay(contextData?.[DecGenData.dispute]?.get('security_deposit_amount'))
    : null;
  },

  'u_dispute-landlord-party-list': (contextData={}) => {
    const landlords = getDisputeParties(contextData)?.filter(p => p.isLandlord());
    return !landlords.length ? '**InsertLandlordPartyList' : landlords.map(p => p.getDisplayName()).join(', ');
  },

  'u_dispute-tenant-party-list': (contextData={}) => {
    const tenants = getDisputeParties(contextData)?.filter(p => p.isTenant());
    return !tenants.length ? '**InsertTenantPartyList' : tenants.map(p => p.getDisplayName()).join(', ');
  },

  'u_dispute-respondent-party-list': (contextData={}) => {
    const respondents = getDisputeParties(contextData)?.filter(p => p.isRespondent());
    return !respondents.length ? '**InsertRespondentPartyList' : respondents.map(p => p.getDisplayName()).join(', ');
  },

  'u_dispute-applicant-party-list': (contextData={}) => {
    const applicants = getDisputeParties(contextData)?.filter(p => p.isApplicant());
    return !applicants.length ? '**InsertApplicantPartyList' : applicants.map(p => p.getDisplayName()).join(', ');
  },

  'u_tenancy-agreement-date': (contextData={}) => {
    return Formatter.toFullDateDisplay(contextData?.[DecGenData.dispute]?.get('tenancy_agreement_date'));
  },

  'u_tenancy-agreement-signed-by': (contextData={}) => {
    const tenancyAgreementDisplays = {
      "1": "landlord and the tenant",
      "2": "landlord only",
      "3": "tenant only",
      "4": "**TenancyAgreementNotSigned"
    };
    const tenancy_agreement_signed_by = contextData?.[DecGenData.dispute]?.get('tenancy_agreement_signed_by');
    return tenancyAgreementDisplays[tenancy_agreement_signed_by] ? `${tenancyAgreementDisplays[tenancy_agreement_signed_by]}`.toLowerCase() : null;
  },

  'u_rent-payment-interval': (contextData={}) => {
    const rent_payment_interval = contextData?.[DecGenData.dispute]?.get('rent_payment_interval');
    const rentPaymentDisplays = {
      1: 'first day of the month',
      2: 'last day of the month',
      3: '15th day of the month',
    };
    return rentPaymentDisplays[rent_payment_interval] || (rent_payment_interval ? `****Other-${rent_payment_interval}****` : `**InsertRentPaymentInterval`);
  },

  'u_rent-payment-amount': (contextData={}) => {
    return contextData?.[DecGenData.dispute]?.get('rent_payment_amount') ? Formatter.toAmountDisplay(contextData?.[DecGenData.dispute]?.get('rent_payment_amount')) : null;
  },

  'u_act': (contextData={}) => {
    return contextData?.[DecGenData.dispute]?.isMHPTA() ? 'Manufactured Home Park Tenancy Act' : 'Residential Tenancy Act';
  },

  // Required contextData (should be auto-provided)
  // - currentDocSet: OutcomeDocGroupModel
  'u_document_date': (contextData={}) => {
    return Formatter.toFullDateDisplay(contextData?.[DecGenData.currentDocSet].get('doc_completed_date'));
  },

  // Required contextData (should be auto-provided)
  // - currentDoc: OutcomeDocFileModel
  'u_document_title': (contextData={}) => {
    return (DocTitles[contextData?.[DecGenData.currentDoc]?.get('file_type')] || '').toLowerCase();
  },

  'u_hearing-latest-start-time-plus-10min': (contextData={}) => {
    const latestHearing = contextData?.[DecGenData.hearings]?.getLatest();
    if (!latestHearing) return;
    const hearingStartMoment = Moment.tz(latestHearing.get('hearing_start_datetime'), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING'));
    return Formatter.toTimeDisplay(hearingStartMoment.add(10, 'minutes'));
  },

  'u_hearing-latest-start-time': (contextData={}) => {
    const latestHearing = contextData?.[DecGenData.hearings]?.getLatest();
    if (!latestHearing) return;
    const hearingStartMoment = Moment.tz(latestHearing.get('hearing_start_datetime'), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING'));
    return Formatter.toTimeDisplay(hearingStartMoment);
  },

  // The total awarded amount for all issues on the disputes; always returned as positive even if total is negative
  'u_issues-total-awarded-amount': (contextData={}) => {
    const totalAwarded = contextData?.[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence().reduce((memo, issue) => issue.getAwardedAmount() + memo, 0);
    return Formatter.toAmountDisplay(Math.abs(totalAwarded));
  },
  

  // Required contextData
  // - hearing: HearingModel
  'hearing_start-date-time': (contextData={}) => {
    if (!contextData.hearing) return _createMergeFieldError('hearing_start-date-time');
    
    return Formatter.toFullDateAndTimeDisplay(
      Moment.tz(contextData?.hearing?.get('hearing_start_datetime'), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING'))
    );
  },

  // Required contextData
  // - hearingParticipation: HearingParticipationModel
  'hearing_participation-name': (contextData={}) => {
    if (!contextData.hearingParticipation) return _createMergeFieldError('hearing_participation-name');
    return contextData.hearingParticipation.getDisplayName();
  },

  // Required contextData
  // - hearingParticipation: HearingParticipationModel
  'hearing_participation-initials': (contextData={}) => {
    if (!contextData.hearingParticipation) return _createMergeFieldError('hearing_participation-initials');
    return contextData.hearingParticipation.getInitialsDisplay();
  },

  // Required contextData
  // - hearingParticipation: HearingParticipationModel
  'hearing_participation-dispute-type': (contextData={}) => {
    if (!contextData.hearingParticipation) return _createMergeFieldError('hearing_participation-dispute-type');
    const disputeIsLandlord = contextData?.[DecGenData.dispute]?.isLandlord();
    const isApplicant = contextData.hearingParticipation.isApplicant();
    
    return isApplicant && disputeIsLandlord ? 'landlord'
      : isApplicant && !disputeIsLandlord ? 'tenant'
      : !isApplicant && disputeIsLandlord ? 'tenant'
      : 'landlord';
  },

  // Required contextData
  // - hearingParticipation: HearingParticipationModel
  'hearing_participation-dispute-type-capitalized': (contextData={}) => {
    if (!contextData.hearingParticipation) return _createMergeFieldError('hearing_participation-dispute-type-capitalized');
    return Formatter.capitalize(DecGenFormatter.applyMergeFieldConversions(`{hearing_participation-dispute-type}`, contextData));
  },

  // Required contextData
  // - participant: ParticipationModel
  'participant_initials': (contextData={}) => {
    if (!contextData.participant) return _createMergeFieldError('participant_initials');
    return contextData.participant.getInitialsDisplay();
  },

  // Required contextData
  // - participant: ParticipationModel
  'participant_dispute-type-initials': (contextData={}) => {
    if (!contextData.participant) return _createMergeFieldError('participant_dispute-type-initials');
    return `${contextData.participant.isLandlord() ? 'Landlord' : 'Tenant'} ${contextData.participant.getInitialsDisplay()}`;
  },

  // Required contextData
  // - notice: NoticeModel
  'notice_applicant-type': (contextData={}) => {
    if (!contextData.notice) return _createMergeFieldError('notice_applicant-type');
    const isDisputeLandlord = contextData?.[DecGenData.dispute]?.isLandlord();
    const isLandlordApplicant = (isDisputeLandlord && !contextData.notice?.isAssociatedToRespondent()) ||
      (!isDisputeLandlord && contextData.notice?.isAssociatedToRespondent());
    return isLandlordApplicant ? 'landlord' : 'tenant';
  },
  // Required contextData
  // - notice: NoticeModel
  'notice_applicant-type-capitalized': (contextData={}) => {
    if (!contextData.notice) return _createMergeFieldError('notice_applicant-type-capitalized');
    return Formatter.capitalize(DecGenFormatter.applyMergeFieldConversions(`{notice_applicant-type}`, contextData));
  },

  // Required contextData
  // - notice: NoticeModel
  'notice_respondent-type': (contextData={}) => {
    if (!contextData.notice) return _createMergeFieldError('notice_respondent-type');
    const isDisputeLandlord = contextData?.[DecGenData.dispute]?.isLandlord();
    const isLandlordApplicant = (isDisputeLandlord && !contextData.notice?.isAssociatedToRespondent()) ||
      (!isDisputeLandlord && contextData.notice?.isAssociatedToRespondent());
    return isLandlordApplicant ? 'tenant' : 'landlord';
  },

  // Required contextData
  // - service: ServiceModel
  'notice_service-date': (contextData={}) => {
    if (!contextData.service) return _createMergeFieldError('notice_service-date');
    return Formatter.toFullDateDisplay(contextData.service.get('service_date'));
  },

  // Required contextData
  // - service: ServiceModel
  // - notice: NoticeModel
  'notice_service-method-text':  (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    const noticeServiceMethodDisplays = {
      1: isMHPTA ? `by attaching the Proceeding Package on the door of the rental unit in accordance with section 82(2) of the Act.****The {notice_applicant-type} had a witness sign the Proof of Service form to confirm this service****`
          : `by attaching the Proceeding Package on the door of the rental unit in accordance with section 89(2) of the Act.****The {notice_applicant-type} had a witness sign the Proof of Service form to confirm this service****`,
      2: isMHPTA ? `by leaving the Proceeding Package in a mail slot or box of the rental unit in accordance with section 82(2) of the Act. ****The {notice_applicant-type} had a witness sign the Proof of Service form to confirm this service****`
          : `by leaving the Proceeding Package in a mail slot or box of the rental unit in accordance with section 89(2) of the Act. ****The {notice_applicant-type} had a witness sign the Proof of Service form to confirm this service****`,
      3: isMHPTA ? `by registered mail in accordance with section 82(1) of the Act, the fifth day after the registered mailing. **** The {notice_applicant-type} provided a copy of the Canada Post Customer Receipt containing the tracking number to confirm this service****`
          : `by registered mail in accordance with section 89(1) of the Act, the fifth day after the registered mailing. **** The {notice_applicant-type} provided a copy of the Canada Post Customer Receipt containing the tracking number to confirm this service****`,
      4: 'by regular mail',
      5: isMHPTA ? `in person in accordance with section 82(1) of the Act. ****The {notice_applicant-type} and a witness signed the Proof of Service form to confirm this service****`
        : `in person in accordance with section 89(1) of the Act. ****The {notice_applicant-type} and a witness signed the Proof of Service form to confirm this service****`,
      6: 'by fax',
      7: '**InsertServiceMethodHere',
      8: isMHPTA ? `by pre-agreed e-mail in accordance with section 43(2) of the <i>Residential Tenancy Regulation</i>.****The {notice_applicant-type} provided a copy of the outgoing e-mail showing the documents were included as an attachment to confirm this service. The {notice_applicant-type} also submitted a copy of an Address for Service form which was signed by the tenant on **MthDayYear, indicating the {notice_respondent-type} agreed to receive documents by e-mail****`
        : `by pre-agreed e-mail in accordance with section 43(2) of the <i>Residential Tenancy Regulation</i>.****The {notice_applicant-type} provided a copy of the outgoing e-mail showing the documents were included as an attachment to confirm this service. The {notice_applicant-type} also submitted a copy of an Address for Service form which was signed by the tenant on **MthDayYear, indicating the {notice_respondent-type} agreed to receive documents by e-mail****`
    };
    const methodText = noticeServiceMethodDisplays[contextData?.service?.get('service_method')];
    return methodText ? DecGenFormatter.applyMergeFieldConversions(methodText, contextData) : '**ServedMethodTextBoilerplate';
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue_act-title': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue_act-title');
    const defaultTitleFallback = `**InsertIssueActTitle_${contextData.issue.get('claim_code')}`;
    const config = getBpConfig(contextData);
    return config?.actTitle || defaultTitleFallback;
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue_act-title-amount': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue_act-title');
    const amountDisplay = contextData.issue.isMonetaryIssue() && contextData.issue.getAmount() ? ` (${Formatter.toAmountDisplay(Math.abs(contextData.issue.getAmount()))})` : '';
    return DecGenFormatter.applyMergeFieldConversions(`{bp_issue_act-title}${amountDisplay}`, contextData);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue_decided-title': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue_decided-title');
    const defaultTitleFallback = `**InsertIssueDecidedTitle_${contextData.issue.get('claim_code')}`;
    const config = getBpConfig(contextData);
    return config?.decidedTitle || config?.decidedTitle === '' ? config?.decidedTitle : defaultTitleFallback;
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue_decided-title-amount': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue_decided-title-amount');
    const amountDisplay = contextData.issue?.isMonetaryIssue() && contextData.issue?.getAmount() ? ` (${Formatter.toAmountDisplay(Math.abs(contextData.issue.getAmount()))})` : '';
    return DecGenFormatter.applyMergeFieldConversions(`{bp_issue_decided-title}${amountDisplay}`, contextData);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue-act-conversational': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue-act-conversational');
    const config = getBpConfig(contextData);
    return config?.conversationalAct || '';
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue-act-strict': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue-act-strict');
    const fallback = `**InsertIssueStrict_${contextData.issue.get('claim_code')}`;
    const config = getBpConfig(contextData);
    if (config?.strictAct) return config.strictAct;

    const actConfig = contextData?.[DecGenData.dispute]?.isMHPTA() ? MHPTA_ACT_CONFIG : RTA_ACT_CONFIG;
    const sections = config?.sectionNumbers?.map(num => actConfig[String(num)] || fallback);
    return sections?.length ? sections.join('') : fallback;
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue-granted-text': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue-granted-text');
    const fallback = `**InsertIssueGrantedText_${contextData.issue.get('claim_code')}`;
    const config = getBpConfig(contextData);
    const grantedText = config?.conversationalGranted || config?.conversationalGranted === '' ? config?.conversationalGranted : fallback;
    return DecGenFormatter.applyMergeFieldConversions(grantedText, contextData);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'bp_issue-granted-conclusion-text': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('bp_issue-granted-conclusion-text');
    const config = getBpConfig(contextData);
    if (!config?.conversationalGrantedConclusion) return;
    return DecGenFormatter.applyMergeFieldConversions(config?.conversationalGrantedConclusion, contextData);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'issue_awarded-amount': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('issue_awarded-amount');
    const amount = contextData.issue?.getAwardedAmount();
    return amount ? Formatter.toAmountDisplay(Math.abs(amount)) : null;
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'issue_awarded-amount-signed': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('issue_awarded-amount-signed');
    const amount = contextData.issue?.getAwardedAmount();
    return amount ? Formatter.toAmountDisplayWithNegative(amount, false, false) : null;
  },

  // Required contextData
  // - issue: DisputeClaimModel
  // Always show 
  'issue_awarded-amount-negative-signed': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('issue_awarded-amount-negative-signed');
    const amount = contextData.issue?.getAwardedAmount();
    return amount ? Formatter.toAmountDisplayWithNegative(-1*Math.abs(amount), false, false) : null;
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'issue_intake-service-date': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('issue_intake-service-date');
    return Formatter.toFullDateDisplay(contextData.issue?.getNoticeDeliveryDate());
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'issue_awarded-timeframe': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('issue_awarded-timeframe');

    const remedy = contextData.issue?.getApplicantsRemedy();
    return DecGenFormatter.applyMergeFieldConversions(remedy?.isOutcomeAwarded2Day() ?  `effective two (2) days after service of this Order on the tenant(s)`
      : remedy?.isOutcomeAwardedSpecificDate() ? `effective on {issue_awarded-specific-date}, after service of this Order on the tenant(s)`
      : remedy?.isOutcomeAwardedOtherDate() ? `**InsertWhenPossessionGranted`
      : ''
    , contextData);
  },

  // Required contextData
  // - issue: DisputeClaimModel
  'issue_awarded-specific-date': (contextData={}) => {
    if (!contextData.issue) return _createMergeFieldError('issue_awarded-specific-date');
    const awardedDate = contextData.issue?.getApplicantsRemedy()?.get('awarded_date');
    return awardedDate ? Formatter.toFullDateDisplay(awardedDate) : null;
  },

  
  // Required contextData
  // - issues: Array<DisputeClaimModel>
  'issues_section-number-list': (contextData={}) => {
    if (!contextData.issues) return _createMergeFieldError('issues_section-number-list');
    const allSectionNumbers = [];
    contextData.issues.forEach(issue => {
      const config = getBpConfig(Object.assign({ issue }, contextData));
      if (config?.sectionNumbers?.length) allSectionNumbers.push(config.sectionNumbers);
    });
    
    return allSectionNumbers?.length ? allSectionNumbers.join(', ') : '**InsertSectionNumbers';
  },

  // Required contextData
  // - file: FileModel
  'files_evidence-filename': (contextData={}) => {
    if (!contextData.file) return _createMergeFieldError('files_evidence-filename');
    return contextData.file.get('file_name');
  },

  // Required contextData
  // - file: FileModel
  'files_evidence-original-filename': (contextData={}) => {
    if (!contextData.file) return _createMergeFieldError('files_evidence-original-filename');
    return contextData.file.get('original_file_name');
  },

  // Required contextData
  // - file: FileModel
  'files_evidence-reference-note': (contextData={}) => {
    if (!contextData.file) return _createMergeFieldError('files_evidence-reference-note');
    const decisionNotes = contextData.file.getDecisionNotes();
    return decisionNotes?.length ? decisionNotes.at(0).get('note') : '';
  },


  // Required contextData
  // - file: FileModel
  'files_evidence-filename': (contextData={}) => {
    if (!contextData.file) return _createMergeFieldError('files_evidence-filename');
    return contextData.file.get('file_name');
  },

  // Required contextData
  // - file: FileModel
  'files_evidence-original-filename': (contextData={}) => {
    if (!contextData.file) return _createMergeFieldError('files_evidence-original-filename');
    return contextData.file.get('original_file_name');
  },

  // Required contextData
  // - file: FileModel
  'files_evidence-reference-note': (contextData={}) => {
    if (!contextData.file) return _createMergeFieldError('files_evidence-reference-note');
    const decisionNotes = contextData.file.getDecisionNotes();
    return decisionNotes?.length ? decisionNotes.at(0).get('note') : '';
  },

};
