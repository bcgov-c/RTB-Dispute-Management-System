import Radio from 'backbone.radio';
import React from 'react';
import DecGenData from '../DecGenData';
import GeneratedOutcomeDocSection from '../GeneratedOutcomeDocSection';
import DisputeEvidenceModel from '../../../../core/components/claim/DisputeEvidence_model';
import DecisionHeaderBanner from './decision-template-header/DecisionHeaderBanner';
import { DecGenPageBreak } from './DecGenPageBreak';

const participantsChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');
const noticeChannel = Radio.channel('notice');

export default GeneratedOutcomeDocSection.extend({ 
  initialize(options) {
    this.mergeOptions(options, ['data']);
    this.template = this.template.bind(this);
    this.selectedSubService = this.data[DecGenData.currentSubServItem];
    this.requestFileDescriptionModel = this.selectedSubService ? filesChannel.request('get:filedescription', this.selectedSubService.get('request_method_file_desc_id')) : null;
    this.subServFiles = new DisputeEvidenceModel({ file_description: this.requestFileDescriptionModel });
    const requestQuadrant = noticeChannel.request('get:subservices:quadrant:by:documentId', Number(this.selectedSubService.get('request_doc_type')));
    this.docTypeDisplay = requestQuadrant?.displayedDocumentList.join(", ") || '**RequestedDocuments';
    const serviceByParticipant = participantsChannel.request('get:participant', this.selectedSubService.get('service_by_participant_id'));
    this.submitterTypeDisplay = serviceByParticipant ? (serviceByParticipant.isLandlord() ? 'landlord' : 'tenant') : '**ServiceByLandlordTenant';
    this.reverseSubmitterTypeDisplay = serviceByParticipant ? (serviceByParticipant.isLandlord() ? 'tenant' : 'landlord') : '**ServiceToTenantLandlord';
  },

  template() {
    if (!this.selectedSubService) return;
    return this.finalizeRender(
      <>
        { this.renderJsxApplicationInfo() }
        <br/>
        { this.renderJsxConductedHearings() }
        <br />
        { this.renderJsxIssues() }
        <br />
        { this.renderJsxBackgroundAndEvidence() }
        { this.renderJsxAnalysis() }
        <br />
        { this.renderJsxConclusion() }
      </>
    );
  },

  renderJsxApplicationInfo() {
    const serviceByParticipant = participantsChannel.request('get:participant', this.selectedSubService.get('service_by_participant_id'));
    const serviceToParticipant = participantsChannel.request('get:participant', this.selectedSubService.get('service_to_participant_id'));

    const serviceBy = serviceByParticipant ? `${serviceByParticipant.getDisplayName()} (${serviceByParticipant.isLandlord() ? 'Landlord' : 'Tenant'}) - ${Formatter.toDateDisplay(this.selectedSubService.get('created_date'))}` : '**InsertServiceByParticipant';
    const serviceTo = serviceToParticipant ? `${serviceToParticipant.getDisplayName()} (${serviceToParticipant.isLandlord() ? 'Landlord' : 'Tenant'})` : '**InsertServiceToParticipant';
    const existingMethods = this.selectedSubService.get('request_additional_info') ? this.selectedSubService.get('request_additional_info') : '**InsertExistingMethods';
    const notWorkingDescription = this.selectedSubService.get('failed_method1_description');
    const willWorkDescription = this.selectedSubService.get('requested_method_justification');
    const requestedMethod = this.selectedSubService.get('requested_method_description');
    const isMHPTA = this.data[DecGenData.dispute].isMHPTA();

    return (
      <>
        <div className="section_title">Conducted Hearing(s)</div>
        <div className="section_subtitle"><b>EX PARTE PROCEEDING (SUBSTITUTED SERVICE PROCEEDING)</b></div>
        <br/>
        <div>
          Under section {isMHPTA ? <>64(1) of the <i>Manufactured Home Park Tenancy Act</i></> : <>74(1) of the <i>Residential Tenancy Act</i></>} (the "Act"),
          the decision in this matter was made without a participatory hearing. The decision in this matter was made on the basis of an Application for Substituted 
          Service and the written submissions from the {this.submitterTypeDisplay}.
        </div>
        <br/>
        {DecGenPageBreak}
        <div className="section_title">Application for Substituted Service</div>
        <p>The following substituted service request was submitted to the Residential Tenancy Branch:</p>
        <div className="text_block">
          <span className="light_text">Request Type:&nbsp;</span>
          <span>Substituted Service</span>
        </div>
        <div className="text_block">
          <span className="light_text">Submitted By (the Applicant):&nbsp;</span>
          <span>{serviceBy}</span>
        </div>
        <div className="text_block">
          <span className="light_text">For Service Of:&nbsp;</span>
          <span>{this.docTypeDisplay}</span>
        </div>
        <div className="text_block">
          <span className="light_text">With Service To (the Respondent):&nbsp;</span>
          <span>{serviceTo}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Existing methods confirmed not available for service:&nbsp;</span>
          <span>{existingMethods}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Reason provided why existing methods won't work:&nbsp;</span>
          <span>{notWorkingDescription ? notWorkingDescription : '**InsertWhyExistingMethodWillNotWorkHere'}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Requested substituted service method:&nbsp;</span>
          <span>{requestedMethod ? requestedMethod : '**InsertRequestedMethodDescriptionHere'}</span>
        </div>
        <div className="text_block">
          <span className="light_text">Why requested method will work:&nbsp;</span>
          <span>{willWorkDescription ? willWorkDescription : '**InsertWhyRequestedMethodWillWorkHere'}</span>
        </div>
        <div className="text_block">
          <span className="light_text">With the following supporting evidentiary material:&nbsp;</span>
          {this.renderJsxFileList()}
        </div>
      </>
    );
  },

  renderJsxConductedHearings() {
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();
    return (
      <>
        <br/>
        {DecGenPageBreak}
        {DecisionHeaderBanner(this.data)}
        <br/>
        <br/>
        <div className="doc_title"><b>SUBSTITUTED SERVICE DECISION</b></div>
        <br/>
        <div className="section_title">Introduction</div>
        <div>
          This hearing dealt with an ex parte application by the {this.submitterTypeDisplay} for an order for substituted service
          under section {isMHPTA ? '64(1)' : '71(1)' } of the <i>{isMHPTA ? 'Manufactured Home Park Tenancy Act' : 'Residential Tenancy Act'}</i> (the "Act").
        </div>
      </>
    );
  },

  renderJsxIssues() {
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();
    const requestQuadrant = noticeChannel.request('get:subservices:quadrant:by:documentId', Number(this.selectedSubService.get('request_doc_type')));
    return (
      <>
        <div className="section_title">Issue(s) to be Decided</div>
        <div>
          Is the {this.submitterTypeDisplay} entitled to an order for substituted service of their {this.docTypeDisplay} in a manner different than what
          is required under section {isMHPTA ? '82' : '89'} of the <i>{isMHPTA ? 'Manufactured Home Park Tenancy Act' : 'Residential Tenancy Act'}</i>?
        </div>
      </>
    )
  },

  renderJsxBackgroundAndEvidence() {
    return (
      <>
        <div className="section_title">Background and Evidence</div>
        <div>
          <div>**UseBelowAndEditAsRequiredIf_Landlord_ApplyingForSubServeAndDeleteThisLine</div>
          <br/>
          <p>
            ****The landlord has filed an Application for Dispute Resolution (the Application) against the tenant for the purpose of keeping the security 
            deposit, obtaining compensation for unpaid rent, obtaining compensation for damages done to the rental unit, obtaining compensation 
            for money owed or other losses and recovering the filing fee paid for their Application.****
          </p>
          <br/>
          <div>**UseBelowAndEditAsRequiredIf_Tenant_ApplyingForSubServeAndDeleteThisLine</div>
          <br/>
          <p>****The tenant has filed an Application for Dispute Resolution (the Application) against the landlord for the purpose of **InsertPurposeOfAppHere and recovering the filing fee paid for the Application.****</p>
          <br/>
          <div>**EditThisSectionAsRequiredAndDeleteThisLine</div>
          <p>****The {this.submitterTypeDisplay} states that they do not have a mailing address for the service of documents to the {this.reverseSubmitterTypeDisplay}. The {this.submitterTypeDisplay} has requested  
            to serve the {this.docTypeDisplay}, to the {this.reverseSubmitterTypeDisplay} by **InsertRequestedMethodOfServiceHere.****
          </p>
        </div>
        <br/>
        <div>**InsertAdditionalBackgroundInfoHere</div>
        <br/>
        <div>
          I have reviewed all written submissions and evidence before me; however, only the evidence and submissions relevant to
          the issues and findings in this matter are described in this decision.
        </div>
        <br/>
        <div>
          The {this.submitterTypeDisplay} submitted the following evidentiary material:
          {this.renderJsxFileList({ displaySubServeForm: true })}
        </div>
      </>
    );
  },

  renderJsxAnalysis() {
    const dispute = this.data[DecGenData.dispute];
    const isMHPTA = dispute.isMHPTA();
    const existingMethods = this.selectedSubService.get('request_additional_info') ? this.selectedSubService.get('request_additional_info') : '**InsertExistingMethods';
    const existingMethodsDisplay = existingMethods?.toLowerCase()?.replace(/, /g, ' or ');

    return (
      <>
        <div className="section_title">Analysis</div>
        <div>
          This application for the issuance of a substituted service order was made under section {isMHPTA ? '64' : '71'} of the Act.
          This section enables me to issue an order that a document may be served by substituted service in accordance with the order,
          despite the service provisions of section {isMHPTA ? '82' : '89'} of the Act.
        </div>
        <br/>
        <div>Residential Tenancy Guideline #12 deals with the service of documents. With respect to orders for substituted service, the Guideline states:</div>
        <br/>
        <div>
          <div className="tab">
            An application for substituted service may be made at the time of filing the application or at a time after filing.
            The party applying for substituted service must be able to demonstrate two things:
            <br/>
            <ul className="list_block">
              <li>that the party to be served cannot be served by any of the methods permitted under the Legislation, and</li>
              <li>that there is a reasonable expectation that the party being served will receive the documents by the method requested.</li>
            </ul>
          </div>
          <div>**EditThisSectionAsRequiredAndDeleteThisLine</div>
          <p>
            ****Under section {isMHPTA ? '82' : '89'} of the Act, a {this.submitterTypeDisplay} may serve a {this.reverseSubmitterTypeDisplay} with the {this.docTypeDisplay} by {existingMethodsDisplay}; however, the {
            this.submitterTypeDisplay} states that they do not have an address for service for the {this.reverseSubmitterTypeDisplay}.****
          </p>
          <br/>
          <div>I accept the {this.submitterTypeDisplay}'s statement that the {this.reverseSubmitterTypeDisplay} cannot be served by any of the methods permitted by the legislation.</div>
          <br/>
          <div>I have reviewed all documentary evidence and I find **InsertYourFindingHere</div>
          <br/>
          <div>**UseBelowIf_Granted_AndDeleteThisLine</div>
          <br/>
          <p>****I find that the {this.submitterTypeDisplay} has provided evidence which demonstrates that the {this.reverseSubmitterTypeDisplay} can receive documents by **InsertApprovedSubServMethodHere.****</p>
          <br/>
          <p>****I further find that it would be reasonable to conclude from this that the {this.reverseSubmitterTypeDisplay} would receive the {this.docTypeDisplay} and have actual knowledge of the {this.docTypeDisplay} if served to the {this.reverseSubmitterTypeDisplay} by **InsertApprovedSubServMethodHere.****</p>
          <br/>
          <p>****For this reason, I allow the {this.submitterTypeDisplay} substituted service of the {this.docTypeDisplay} by **InsertApprovedSubServeMethodHere to the e-mail address listed on the second page of this decision.****</p>
          <br/>
          <p>
            ****I order the {this.submitterTypeDisplay} to provide proof of service of the e-mail which may include a print-out of the sent item, a confirmation of delivery receipt, or other documentation to confirm the {this.submitterTypeDisplay} has served the {this.reverseSubmitterTypeDisplay} in accordance with this order.
            If possible, the {this.submitterTypeDisplay} should provide a read receipt confirming the e-mail was opened and viewed by the {this.reverseSubmitterTypeDisplay}.****
          </p>
          <br/>
          <div>**UseBelowIf_DismissedWithLeave_AndDeleteThisLine</div>
          <br/>
          <p>****I find I cannot conclude that the {this.reverseSubmitterTypeDisplay} would receive the {this.docTypeDisplay} and have actual knowledge of the {this.docTypeDisplay} if served by **InsertDeniedSubServeMethodHere.****</p>
          <br/>
          <p>****Therefore, the application for substituted service of the {this.docTypeDisplay} by **InsertDeniedSubServeMethodHere is dismissed with leave to reapply.****</p>
        </div>
      </>
    );
  },

  renderJsxConclusion() {
    const signature = this.data[DecGenData.signature];
    const isMHPTA = this.data[DecGenData.dispute]?.isMHPTA();
    return (
      <>
        <div className="section_title">Conclusion</div>
        <div>**UseBelowIf_DismissedWithLeave_AndDeleteThisLine</div>
        <br/>
        <p>****The application for substituted service of the {this.docTypeDisplay} by **InsertDeniedSubServeMethodHere is dismissed with leave to reapply.****</p>
        <br/>
        <div>**UseBelowIf_Granted_AndDeleteThisLine</div>
        <br />
        <p>The {this.submitterTypeDisplay} is granted an order for substituted service and may serve the {this.docTypeDisplay}, along with a copy of this substituted service decision, to the {this.reverseSubmitterTypeDisplay} by **InsertGrantedMethodHere as set out above.</p>
        <p>I order that documents served in this manner have been sufficiently served to the {this.reverseSubmitterTypeDisplay} for the purposes of the Act, three days after the date of service by **InsertGrantedMethodHere.</p>
        <p>This decision is made on authority delegated to me by the Director of the Residential Tenancy Branch under section 9.1(1) of the <i>{isMHPTA ? 'Manufactured Home Park Tenancy Act' : 'Residential Tenancy Act'}</i>.</p>
        <p>Dated: {Formatter.toFullDateDisplay(this.data[DecGenData.currentDocSet].get('doc_completed_date'))}</p>
        <p className="signature_container">
          {signature?.img ? <img src={signature.img} width={`${signature.dimensions?.width}`} height={`${signature.dimensions?.height}`} />
          : <>**InsertSignatureHere</>}
        </p>
      </>
    )
  },

  renderJsxFileList(options={}) {
    return this.subServFiles.get('files')?.length || options.displaySubServeForm ?
      <ul className="list_block list_end_block">
        {options.displaySubServeForm ? <li>An Application for Substituted Service</li> : null}
        {this.subServFiles.get('files').map(model => <li>{model.get('file_name')} {model.get('original_file_name') !== model.get('file_name') ? `(original file name ${model.get('original_file_name')})` : ''}</li>)}
      </ul>
      :
      "-"
  }

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.currentSubServItem]: true,
      [DecGenData.signature]: true,
      [DecGenData.currentDocSet]: true,
    };
  }
});