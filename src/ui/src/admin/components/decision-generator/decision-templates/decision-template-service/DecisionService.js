import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionService_MergeFields from './DecisionService_MergeFields';

const filesChannel = Radio.channel('files');

const DecisionServiceContent = GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionService_MergeFields);

    this.latestNotice = this.data[DecGenData.notices].getCurrentNotice();
    this.filePackagesWithFiles = this.data[DecGenData.filePackages].filter(packageModel => this.data[DecGenData.files].any(file => {
      return file.get('file_package_id') === packageModel.id
        && file.isUploaded()
        // Also ensure that the file is not associated to a removed claim
        // TODO: Issue with linked files and dispute linking??
        && !filesChannel.request('is:file:linked:to:removed', file);
    }));
  },
  
  template() {
    return <>
      {this.templateData[DecGenData['all:showSectionFileNumber']] ? <>
        <div>File Number: <b>{this.data[DecGenData.dispute].get('file_number')}</b> ({this.data[DecGenData.dispute].isLandlord() ? 'Landlord' : 'Tenant'} Application)</div>
      </> : null}
      {this.renderJsxNoticeSection()}
      {this.renderJsxEvidenceSection()}
    </>
  },

  renderJsxNoticeSection() {
    const renderedErrors = this.renderJsxNoticeErrors();
    if (renderedErrors) {
      return this.finalizeRender(<>
        <div className="section_title">{`{st_notice_section_title}`}</div>
        {renderedErrors}
      </>, { notice: this.latestNotice });
    }

    const services = this.latestNotice.getServices();

    return this.finalizeRender(<>
      <div className="section_title">{`{st_notice_section_title}`}</div>
      <div>{`{st_notice_opening}`}</div>
      <div><ul>{
        services.every(s => s.isAcknowledgedServed()) ? <li>{`{st_notice-all-acknowledged-served}`}</li>
        : services.every(s => s.isNotServed()) ? <li>{`{st_notice-all-not-served}`}</li>
        : services.map(s => <li>{this.renderJsxNoticeService(s)}</li>)
      }</ul></div>
    </>, { notice: this.latestNotice })
  },

  renderJsxNoticeErrors() {
    if (!this.latestNotice) return <div>{this.wrapHtmlWithError(`--- NOTICE AND SERVICE INFORMATION CANNOT BE POPULATED ON FILES THAT DO NOT CONTAIN A NOTICE ---`)}</div>
    else if (this.latestNotice.getServices().any(s => s.isServiceUnknown())) return <div>{this.wrapHtmlWithError(`--- NOTICE SERVICE INFORMATION CANNOT BE POPULATED ON FILES WITH A LATEST NOTICE THAT IS MISSING SERVICE INFORMATION - COMPLETE THE SERVICE INFORMATION TO POPULATE THIS SECTION ---`)}</div>
  },

  renderJsxNoticeService(service) {
    const participant = this.data[DecGenData.allParticipants]?.find(p => p.id === service.get('participant_id'));
    const isMHPTA = this.data[DecGenData.dispute].isMHPTA();
    let textToReturn;
    if (service.isNotServed()) {
      textToReturn = `I find that {participant_dispute-type-initials} was not served with the Proceeding Package in accordance with the Act. **InsertNotServedAnalysisHere.`;
    } else if (service.isAcknowledgedServed()) {
      textToReturn = `I find that {participant_dispute-type-initials} acknowledged service and is duly served with the Proceeding Package in accordance with the Act.`;
    } else if (service.isDeemedServed()) {
      textToReturn = !isMHPTA ? `I find that {participant_dispute-type-initials} is deemed served with the Proceeding Package, in accordance with section 90 of the Act, on {notice_service-date}, {notice_service-method-text}.`
        : `I find that {participant_dispute-type-initials} is deemed served with the Proceeding Package, in accordance with section 83 of the Act, on {notice_service-date}, {notice_service-method-text}.`
    } else if (service.isServed()) {
      textToReturn = `I find that {participant_dispute-type-initials} was served on {notice_service-date}, {notice_service-method-text}.`;
    }
    return this.finalizeRender(textToReturn, { notice: this.latestNotice, service, participant });
  },

  renderJsxEvidenceSection() {
    if (this.data[DecGenData.dispute]?.isNonParticipatory()) return;

    const renderedErrors = this.renderJsxEvidenceErrors();
    return this.finalizeRender(<>
      <div className="section_title">Service of Evidence</div>
      <div>{renderedErrors ? renderedErrors : <>
        <ul>
          <li>{this.renderJsxApplicantServiceSummary()}</li>
          <li>{this.renderJsxRespondentServiceSummary()}</li>
        </ul>
      </>}</div>
    </>);
  },

  renderJsxEvidenceErrors() {
    if (this.filePackagesWithFiles.length && this.filePackagesWithFiles.some(filePackage => filePackage.getServices().any(s => s.isServiceUnknown()))) {
      return <div>{this.wrapHtmlWithError(`--- EVIDENCE SERVICE INFORMATION CANNOT BE POPULATED ON FILES THAT ARE MISSING FILE PACKAGE SERVICE INFORMATION - COMPLETE THE FILE PACKAGE SERVICE TO POPULATE THIS SECTION ---`)}</div>;
    }
  },

  renderJsxApplicantServiceSummary() {
    const applicantFilePackages = this.filePackagesWithFiles.filter(filePackage => !filePackage.isAssociatedToRespondent());
    const applicantServices = [].concat.apply([], applicantFilePackages.map(fp => [...fp.getServices()?.models]));
    const allServicesServed = applicantServices.length && applicantServices.every(s => s.isServed());
    const noServicesServed = applicantServices.length && applicantServices.every(s => s.isNotServed());
    const isMHPTA = this.data?.[DecGenData.dispute]?.isMHPTA();

    return this.finalizeRender(<>
      {
        !applicantFilePackages.length ? `No evidence was received by the Residential Tenancy Branch from the {u_dispute-applicant-type}. ****The {u_dispute-applicant-type} confirmed that they did not submit any evidence for consideration.****`
        : allServicesServed ? `{st_filepackage-service-applicant_summary_served}`
        : noServicesServed ? `{st_filepackage-service-applicant_summary_none_served}`
        : isMHPTA ? `Based on the submissions before me, I find that the {u_dispute-applicant-type}'s evidence was served to the {u_dispute-respondent-type} in accordance with section 81 of the Act. **InsertEvidenceServiceInformationHere`
        : `Based on the submissions before me, I find that the {u_dispute-applicant-type}'s evidence was served to the {u_dispute-respondent-type} in accordance with section 88 of the Act. **InsertEvidenceServiceInformationHere`
      }
    </>);
  },

  renderJsxRespondentServiceSummary() {
    const respondentFilePackages = this.filePackagesWithFiles.filter(filePackage => filePackage.isAssociatedToRespondent());
    const respondentServices = [].concat.apply([], respondentFilePackages.map(fp => [...fp.getServices()?.models]));
    const allServicesServed = respondentServices.length && respondentServices.every(s => s.isServed());
    const noServicesServed = respondentServices.length && respondentServices.every(s => s.isNotServed());
    const isMHPTA = this.data?.[DecGenData.dispute]?.isMHPTA();
    return this.finalizeRender(<>
      {
        !respondentFilePackages.length ? `No evidence was received by the Residential Tenancy Branch from the {u_dispute-respondent-type}. ****The {u_dispute-respondent-type} confirmed that they did not submit any evidence for consideration.****`
        : allServicesServed ? `{st_filepackage-service-respondent_summary_served}`
        : noServicesServed ? `{st_filepackage-service-respondent_summary_none_served}`
        : isMHPTA ? `Based on the submissions before me, I find that the {u_dispute-respondent-type}'s evidence was served to the {u_dispute-applicant-type} in accordance with section 81 of the Act. **InsertEvidenceServiceInformationHere`
        : `Based on the submissions before me, I find that the {u_dispute-respondent-type}'s evidence was served to the {u_dispute-applicant-type} in accordance with section 88 of the Act. **InsertEvidenceServiceInformationHere`
      }
    </>);
  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.notices]: true,
      [DecGenData.allIssues]: true,
      [DecGenData.allParticipants]: true,
      [DecGenData.allIssues]: true,
      [DecGenData.files]: true,
      [DecGenData.filePackages]: true
    };
  },
});

export default GeneratedOutcomeDocSection.extend({
  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionServiceContent);
  },

  ui: {
    content: '.decision_service_content'
  },

  template() {
    return <>
      <div className="decision_service_content"></div>
    </>
  },

}, {
  getDataToLoad() {
    return {
      ...DecisionServiceContent.getDataToLoad(),
      [DecGenData.linkedDisputes]: DecisionServiceContent.getDataToLoad(),
    };
  },
});
