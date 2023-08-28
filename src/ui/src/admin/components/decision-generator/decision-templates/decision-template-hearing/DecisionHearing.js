import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionHearing_MergeFields from './DecisionHearing_MergeFields';

export default GeneratedOutcomeDocSection.extend({

  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionHearing_MergeFields);
  },

  template() {
    const renderedErrors = this.renderJsxHearingErrors();
    if (renderedErrors) {
      return <>
        <div className="section_title">Conducted Hearing(s)</div>
        {renderedErrors}
      </>;
    }

    return this.finalizeRender(<>
      {/* Section 1b) */}
      <div className="section_title">{`{st_hearing_title}`}</div>
      {
        this.data[DecGenData.dispute].checkProcess(2) ?
          this.renderJsxNonParticipatory()
        : this.renderJsxParticipatory()
      }
      <br/>
    </>);
  },

  renderJsxNonParticipatory() {
    return <>
      {`{st_hearing_opening-non-participatory}`}
    </>
  },

  renderJsxParticipatory() {
    return <>
      {this.data[DecGenData.hearings].map(hearing => (
        this.finalizeRender(this.renderJsxHearing(hearing), { hearing })
      ))}
    </>
  },

  renderJsxHearing(hearing) {
    const validParticipations = hearing.getParticipations().filter(p => p.didAttend() && !p.get('participant_model')?.isRemoved());
    const applicantParticipations = validParticipations.filter(hp => hp.isApplicant());
    const respondentParticipations = validParticipations.filter(hp => hp.isRespondent());
    const disputeIsLandlord = this.data?.[DecGenData.dispute]?.isLandlord();

    const renderHearingAttendanceList = (list=[]) => {
      return <ul>
        {list.length ? list.map(hearingParticipation => (
          this.finalizeRender(<li>{`{st_hearing_participant-attendance}`}</li>, { hearingParticipation })
        )) : <li><i>No one attending</i></li>}
      </ul>;
    };
    
    return <>
      <p className="">{`{st_hearing_opening-participatory}`}</p>
      <p className="">Attending for the {disputeIsLandlord ? 'Landlord' : 'Tenant'}</p>
      <div>{renderHearingAttendanceList(applicantParticipations)}</div>
      <p className="">Attending for the {disputeIsLandlord ? 'Tenant' : 'Landlord'}</p>
      <div>{renderHearingAttendanceList(respondentParticipations)}</div>
      <br/>
    </>
  },

  renderJsxHearingErrors() {
    const isValidProcess = this.data[DecGenData.dispute].checkProcess([1,2,4]);
    const isParticipatory = !this.data[DecGenData.dispute].checkProcess([2]);
    const hearings = this.data[DecGenData.hearings];

    if (!isValidProcess) return <div>{this.wrapHtmlWithError(`--- HEARING PARTICIPATION INFORMATION CANNOT BE POPULATED ON FILES THAT ARE NOT ASSIGNED A PARTICIPATORY, NON-PARTICIPATORY OR REVIEW HEARING PROCESS ---`)}</div>
    if (isParticipatory) {
      if (!hearings.length) return <div>{this.wrapHtmlWithError(`--- NO HEARING INFORMATION COULD BE FOUND ON THIS DISPUTE ---`)}</div>
      const hasIncompleteHearings = hearings.any(h => h.getParticipations().any(hp => !hp.get('participant_model')?.isRemoved() && hp.isAttendStatusUnknown()));
      if (hasIncompleteHearings) return <div>{this.wrapHtmlWithError(`--- HEARING PARTICIPATION INFORMATION IS NOT COMPLETE IN DMS - NO INFORMATION INSERTED - COMPLETE THE HEARING PARTICIPATION FOR ALL HEARINGS IN DMS TO AUTO-POPULATE THIS SECTION OF THE DECISION ---`)}</div>
    }
    return false;
  },
  
}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.hearings]: true,
      [DecGenData.allParticipants]: true,
    };
  },
});
