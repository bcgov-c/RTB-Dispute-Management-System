import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';

const configChannel = Radio.channel('config');

export default GeneratedOutcomeDocSection.extend({

  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.isMHPTA = this.data[DecGenData.dispute].isMHPTA();
    this.isLandlord = this.data[DecGenData.dispute].isLandlord();
  },

  template() {
    return <>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
        <br/>
      </> : null}
      {this.renderJsxDisputeInfo()}
      {this.renderJsxParticipants()}
      <br/>
    </>
  },

  renderJsxDisputeInfo() {
    const textRTA = <>the <i>Residential Tenancy Act</i>, SBC 2002, c. 78</>;
    const textMHPTA = <>the <i>Manufactured Home Park Tenancy Act</i>, SBC 2002, c. 77</>;
    return <>
      <p className="">In the matter of {this.isMHPTA ? textMHPTA : textRTA}, as amended</p>
    </>
  },

  renderJsxParticipants() {
    const isSubServReview = this.isSubServReview();
    const isLandlord = this.data[DecGenData.dispute].isLandlord();
    const applicantLandlordLabel = isLandlord && !isSubServReview ? 'Landlord' : 'Tenant';
    const respondentLandlordLabel = isLandlord && !isSubServReview ? 'Tenant' : 'Landlord';
    const activeApplicants = [];
    const activeRespondents = [];
    const amendRemoved = [];
    
    this.data[DecGenData.allParticipants].forEach(p => {
      if (p.isAssistant() || p.isDeleted()) return;
      if (p.isAmendRemoved()) return amendRemoved.push(p);

      // TODO: "isApplicant" check uses claim_group_participants - how to check this for crossed disputes where full participant state isn't loaded into ParticipantManager??
      const isApplicant = isSubServReview ? p.isRespondent() : p.isApplicant();
      const targetList = isApplicant ? activeApplicants : activeRespondents;
      targetList.push(p);
    });

    return <>
      <div>Between</div>
      {activeApplicants.map((p, index) => (
        <div className="">&nbsp;&nbsp;&nbsp;&nbsp;{this.renderJsxParty(p, `${applicantLandlordLabel} ${index+1}`)}</div>
      ))}
      <div className="align_right"><span className="light_text">Applicant(s)</span> - <b>{applicantLandlordLabel}</b></div>
      
      <div>And</div>
      {activeRespondents.map((p, index) => (
        <div className="">&nbsp;&nbsp;&nbsp;&nbsp;{this.renderJsxParty(p, `${respondentLandlordLabel} ${index+1}`)}</div>
      ))}
      <div className="align_right bottom_spacer_sm"><span className="light_text">Respondent(s)</span> - <b>{respondentLandlordLabel}</b></div>
      
      <br/>
      <div className="bottom_spacer_sm">Regarding the {this.isMHPTA ? 'manufactured home site' : 'rental unit'} located at:</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<b>{this.data[DecGenData.dispute].getFullAddressString()?.toUpperCase()}</b></div>
    </>;
  },

  renderJsxParty(participantModel, tenantLandlordLabel='') {
    const initialsDisplay = this.templateData[DecGenData['DecisionHeader:hidePartyInitials']] ? null : <> - ({participantModel.getInitialsDisplay()})</>
    return <>
      <b>{participantModel.getDisplayName()?.toUpperCase()}{initialsDisplay}</b>
    </>
  },

  isSubServReview() {
    // This check will always return false when displaying crossed disputes due to currentDoc
    const isSubServe = this.data[DecGenData.currentDoc]?.config?.code === configChannel.request('get', 'OUTCOME_DOC_SUBSERVE_CODE');
    const isReviewProcess = this.data[DecGenData.dispute].getProcess() === configChannel.request('get', 'PROCESS_REVIEW_HEARING');
    const activeNotice = this.data[DecGenData.notices].getCurrentNotice();
    const noticeAssociatedToRespondent = activeNotice?.isAssociatedToRespondent();
    return isSubServe && isReviewProcess && noticeAssociatedToRespondent;
  },

}, {
  // TODO: Define data, or assume data since it is from linkedDisputes ??
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.notices]: true,
      [DecGenData.allParticipants]: true,

      // This cannot be linked and will not be loaded for cross disputes
      [DecGenData.currentDoc]: true,
    };
  },
});
