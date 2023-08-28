import React from 'react';
import DecGenData from '../../DecGenData';
import { DecGenFormatter } from '../../decision-formatter/DecGenFormatter';
import { renderToString } from 'react-dom/server';

export default {
  'st_hearing_title': (contextData={}) => {
    const fallbackValue = '**INVALID_MERGE_FIELD=st_hearing_title';
    
    return DecGenFormatter.applyMergeFieldConversions(contextData?.[DecGenData.dispute]?.checkProcess(2) ?
        `{st_hearing_title-non-participatory}` : `{st_hearing_title-participatory}`, contextData)
      || fallbackValue;
  },
  'st_hearing_title-participatory': () => 'Scheduled Hearing(s)',
  'st_hearing_title-non-participatory': () => 'Conducted Hearing(s)',

  'st_hearing_opening-participatory': (contextData={}) => {
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      {`Date of Hearing: {hearing_start-date-time|**InvalidStartDate}, {st_hearing_hearing-type}`}
    </>), contextData);
  },
  
  // TODO: This is a candidate for a separate sub-template since it is html???
  'st_hearing_opening-non-participatory': (contextData={}) => {
    const isLandlord = contextData?.[DecGenData.dispute]?.isLandlord();
    const isTenant = contextData?.[DecGenData.dispute]?.isTenant();
    const isNonParticipatory = contextData?.[DecGenData.dispute]?.checkProcess(2);
    const isMHPTA = contextData?.[DecGenData.dispute]?.isMHPTA();
    if (!isNonParticipatory) return;
    
    return DecGenFormatter.applyMergeFieldConversions(renderToString(<>
      <div className="section_subtitle">DIRECT REQUEST PROCEEDING</div>
      <div className="">
        {isLandlord && !isMHPTA ?
          <>Under section 55(4) of the <i>Residential Tenancy Act</i> (the "Act"), the decision in this matter was made without a participatory hearing and based on the written submissions of the landlord provided on {`{u_initial-payment-date | **MnthDayYear}`}.</>
        : isLandlord && isMHPTA ?
          <>Under section 48(4) of the <i>Manufactured Home Park Tenancy Act</i> (the "Act"), the decision in this matter was made without a participatory hearing and based on the written submissions of the landlord provided on {`{u_initial-payment-date | **MnthDayYear}`}.</>
        : isTenant && !isMHPTA ?
          <>Under section 38.1 of the <i>Residential Tenancy Act</i> (the "Act"), the decision in this matter was made without a participatory hearing and based on the written submissions of the tenant provided on {`{u_initial-payment-date | **MnthDayYear}`}.</>
        : isTenant && isMHPTA ?
          <div>{this.wrapHtmlWithError(`--- THIS FILE IS A TENANT MHPTA - THERE IS NO BOILERPLATE FOR THIS ---`)}</div>
        :
          <div>{this.wrapHtmlWithError('--- INSERT EX PARTE BOILERPLATE ---')}</div>
        }
      </div>
    </>), contextData);
  },

  // TODO: Required contextData: hearing: HearingModel
  'st_hearing_hearing-type': (contextData={}) => {
    const fallbackValue = '**INVALID_MERGE_FIELD=st_hearing_hearing-type';
    return contextData?.hearing?.isFaceToFace() ? 'by in person and/or conference call' :
      contextData?.hearing?.isConference() ? 'by conference call' :
      fallbackValue;
  },

  // TODO: Required contextData: hearingParticipation: HearingParticipationModel
  'st_hearing_participant-attendance': (contextData={}) => {
    const isOther = contextData?.hearingParticipation.isOther();
    return DecGenFormatter.applyMergeFieldConversions(`{hearing_participation-name}${isOther ? ' - Other Hearing Attendee' : ''}`, contextData);
  },
};
