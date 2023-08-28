import React from 'react';
import { renderToString } from 'react-dom/server';
import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';

export default {
  'st_notice_section_title': (contextData={}) => {
    const isNonParticipatory = contextData?.[DecGenData.dispute]?.isNonParticipatory();
    return isNonParticipatory ? `Service of Notice of Dispute Resolution Proceeding - Direct Request` : `Service of Notice of Dispute Resolution Proceeding (Proceeding Package)`;
  },

  'st_notice_opening': (contextData={}) => {
    const isNonParticipatory = contextData?.[DecGenData.dispute]?.isNonParticipatory();
    return !isNonParticipatory ? '' : DecGenFormatter.applyMergeFieldConversions(
        `The {notice_applicant-type} submitted a signed Proof of Service {notice_applicant-type-capitalized}'s Notice of Direct Request Proceeding which declares that each {notice_respondent-type} was served with the Notice of Dispute Resolution Proceeding - Direct Request (Proceeding Package). Based on the written submissions of the {notice_applicant-type}:`, contextData);
  },

  'st_notice-all-acknowledged-served': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(`I find that the {notice_respondent-type}(s) acknowledged service of the Proceeding Package and are duly served in accordance with the Act.`, contextData);
  },

  'st_notice-all-not-served': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(`I find that the Proceeding Package was not served in accordance with the Act. **InsertNotServedAnalysisHere`, contextData);
  },

  'st_filepackage-service-applicant_summary_served': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    return DecGenFormatter.applyMergeFieldConversions(isMHPTA ?
        `Based on the submissions before me, I find that the {u_dispute-applicant-type}'s evidence was served to the {u_dispute-respondent-type} in accordance with section 81 of the Act.`
      : `Based on the submissions before me, I find that the {u_dispute-applicant-type}'s evidence was served to the {u_dispute-respondent-type} in accordance with section 88 of the Act.`,
      contextData
    );
  },

  'st_filepackage-service-applicant_summary_none_served': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    return DecGenFormatter.applyMergeFieldConversions(isMHPTA ?
        `Based on the submissions before me, I find that the {u_dispute-applicant-type}'s evidence was not served to the {u_dispute-respondent-type} in accordance with section 81 of the Act.**InsertArbAnalysisHere`
      : `Based on the submissions before me, I find that the {u_dispute-applicant-type}'s evidence was not served to the {u_dispute-respondent-type} in accordance with section 88 of the Act.**InsertArbAnalysisHere`,
      contextData
    );
  },
  
  'st_filepackage-service-respondent_summary_served': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    return DecGenFormatter.applyMergeFieldConversions(isMHPTA ?
        `Based on the submissions before me, I find that the {u_dispute-respondent-type}'s evidence was served to the {u_dispute-applicant-type} in accordance with section 81 of the Act.`
      : `Based on the submissions before me, I find that the {u_dispute-respondent-type}'s evidence was served to the {u_dispute-applicant-type} in accordance with section 88 of the Act.`,
      contextData
    );
  },

  'st_filepackage-service-respondent_summary_none_served': (contextData={}) => {
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    return DecGenFormatter.applyMergeFieldConversions(isMHPTA ?
        `Based on the submissions before me, I find that the {u_dispute-respondent-type}'s evidence was not served to the {u_dispute-applicant-type} in accordance with section 81 of the Act. **InsertArbAnalysisHere`
      : `Based on the submissions before me, I find that the {u_dispute-respondent-type}'s evidence was not served to the {u_dispute-applicant-type} in accordance with section 88 of the Act.**InsertArbAnalysisHere`,
      contextData
    );
  },

};
