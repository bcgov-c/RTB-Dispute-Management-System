import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';

const utility_formatHearingAttendanceList = (list=[], contextData={}) => {
  const noAttendanceStub = `No one`;
  return !list?.length ? noAttendanceStub : list.map((hearingParticipation, i) => DecGenFormatter.applyMergeFieldConversions(
    `{hearing_participation-dispute-type-capitalized} {hearing_participation-initials}`,
    Object.assign({}, contextData, { hearingParticipation })
  )).join(', ');
};

export default {
  'st_issue_opening-participatory': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    const rtaText = `This hearing dealt with the {u_dispute-applicant-type}'s Application for Dispute Resolution under the <i>Residential Tenancy Act</i> (the "Act") for:`;
    const mhptaText = `This hearing dealt with the {u_dispute-applicant-type}'s Application for Dispute Resolution under the <i>Manufactured Home Park Tenancy Act</i> (the "Act") for:`
    return DecGenFormatter.applyMergeFieldConversions(isMHPTA ? mhptaText : rtaText, contextData);
  },
  
  'st_issue_opening-non-participatory': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    const isLandlord = contextData?.[DecGenData.dispute]?.isLandlord();
    const landlordRtaText = `This matter proceeded by way of an <i>ex parte</i> Direct Request Proceeding, under section 55(4) of the <i>{u_act}</i> (the "Act"), and dealt with the {u_dispute-applicant-type}'s Application for Dispute Resolution (the Application) for:`;
    const tenantRtaText = `This matter proceeded by way of an <i>ex parte</i> Direct Request Proceeding, under section 38.1 of the <i>{u_act}</i> (the "Act"), and dealt with the {u_dispute-applicant-type}'s Application for Dispute Resolution (the Application) for:`;
    const mhptaText = `This matter proceeded by way of an <i>ex parte</i> Direct Request Proceeding, under section 48(4) of the <i>{u_act}</i> (the "Act"), and dealt with the {u_dispute-applicant-type}'s Application for Dispute Resolution (the Application) for:`;
    const textToUse = isMHPTA ? mhptaText : isLandlord ? landlordRtaText : tenantRtaText;
    return DecGenFormatter.applyMergeFieldConversions(textToUse, contextData);
  },

  // Required contextData
  // - hearing: HearingModel
  'st_hearing-applicant-attendance-list': (contextData={}) => {
    const participations = contextData?.hearing?.getParticipations().filter(p => p.isApplicant() && p.didAttend() && !p.get('participant_model')?.isRemoved());
    return utility_formatHearingAttendanceList(participations, contextData);
  },

  // Required contextData
  // - hearing: HearingModel
  'st_hearing-respondent-attendance-list': (contextData={}) => {
    const participations = contextData?.hearing?.getParticipations().filter(p => p.isRespondent() && p.didAttend() && !p.get('participant_model')?.isRemoved());
    return utility_formatHearingAttendanceList(participations, contextData);
  },

};
