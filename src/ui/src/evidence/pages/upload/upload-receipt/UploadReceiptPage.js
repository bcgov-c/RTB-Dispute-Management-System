import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PageView from '../../../../core/components/page/Page';
import AccessDisputeOverview from '../../../components/access-dispute/AccessDisputeOverview';
import ExternalParticipantModel from '../../../../evidence/components/external-api/ExternalParticipant_model';
import DisputeEvidenceCollection from '../../../../core/components/claim/DisputeEvidence_collection';
import DisputeClaimCollection from '../../../../core/components/claim/DisputeClaim_collection';
import Filesize from 'filesize';
import { ReceiptContainer } from '../../../../core/components/receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const PAGE_TITLE = `Evidence submitted`;
const RECEIPT_TITLE = 'Evidence Submission';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const UploadReceiptPage = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));

    this.uploaded_evidence = _.filter(this.model.getPendingUploads(), function(e) {
      return e.get('files').any(function(file_model) { return file_model.isUploaded() && file_model.isDisputeAccess(); });
    });

    const receipt_claims = [];
    claimsChannel.request('get:full').each(function(full_claim) {
      let claim_has_matching_evidence = false;
      _.each(this.uploaded_evidence, function(dispute_evidence) {
        if (dispute_evidence.get('claim_id') !== full_claim.get('claim_id')) {
          return;
        }
        claim_has_matching_evidence = true;
        // If the evidence isn't in the claim list already, add manually into the list
        if (!full_claim.get('dispute_evidences').find(function(dispute_ev) {
              return dispute_ev.get('file_description').get('file_description_id') === dispute_evidence.get('file_description').get('file_description_id'); })
        ){
          full_claim.get('dispute_evidences').add(dispute_evidence, {silent: true});
        }
      });
      if (claim_has_matching_evidence) {
        receipt_claims.push(full_claim);
      }
    }, this);

    this.uploaded_claims = new DisputeClaimCollection(receipt_claims);
    this.other_upload_evidence = new DisputeEvidenceCollection(_.filter(this.uploaded_evidence, function(dispute_evidence_model) {
      return dispute_evidence_model.isOtherUpload();
    }));

    
    emailsChannel.request('save:receipt', {
      participant_id: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      receipt_body: renderToString(this.receiptPageHtml()),
      receipt_title: RECEIPT_TITLE,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_DA_EVIDENCE'),
    });
  },

  findPackageId() {
    let filePackageId = null;
    _.each(this.uploaded_evidence, function(dispute_evidence_model) {
      if (filePackageId) {
        return;
      }
      const uploaded_files = _.filter(dispute_evidence_model.getDisputeAccessFiles(), function(file) { return file.isUploaded(); });
      filePackageId = uploaded_files.length ? uploaded_files[0].get('file_package_id') : null;
    });

    return filePackageId;
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      emailUpdateParticipantId: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      autoSendEmail: true,
      participantSaveModel: ExternalParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_EVIDENCE')
    }));
  },

  clickMenu() {
    Backbone.history.navigate('#access', {trigger: true});
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  className: `${PageView.prototype.className} da-upload-receipt-page da-receipt-page`,

  regions: {
    disputeRegion: '.dac__evidence__dispute-overview',
    receiptContainerRegion: '.dac__receipt-container'
  },

  template() {
    return (
      <>
        <div className="dac__evidence__dispute-overview"></div>

        <div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
          <span className="dac__page-header__title">{PAGE_TITLE}</span>
        </div>
        <div className="dac__receipt-container"></div>
        <div className="dac__page-buttons hidden-print">
          <button className="btn btn-standard btn-lg da-receipt-main-menu-btn" onClick={() => this.clickMenu()}>Main Menu</button>
          <span className="receipt-logout-btn" onClick={() => this.clickLogout()}>Logout</span>
        </div>
        <div className="spacer-block-10"></div>
      </>
    );
  },

  receiptPageHtml() {
    const uploadClaimsHeader = 'Claim';
    const uploadEvidenceHeader = 'Other';
    const RECEIPT_FONT_SIZE_PX = this.model.getReceiptFontSizePx();
    const isApplicant = this.loggedInParticipant.isApplicant();
    const filePackageDisplay =  this.findPackageId() ? this.findPackageId() : 'N/A';
    const addedForDisplay = `${isApplicant ? 'Applicant' : 'Respondent'} ${(!(this.dispute.isLandlord() ^ isApplicant)) ? 'Landlord' : `Tenant - ${this.loggedInParticipant.getInitialsDisplay()}`}`
    const uploadedFilesCount = _.reduce(this.uploaded_evidence, function(memo, dispute_evidence_model) {
      return memo + _.filter(dispute_evidence_model.getDisputeAccessFiles(), function(file) { return file.isUploaded(); }).length;
    }, 0);

    return <>
      <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {RECEIPT_TITLE}</h4>

      <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}>
      <tbody><tr><td className="er-nesttable-wrapper-td" style={{ padding: '15px 0px 10px 0px' }}>
        <table cellPadding="0" cellSpacing="0" width="100%" className="er-alert-table" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td className="er-warning-image" style={{ width: '55px', padding: '5px', verticalAlign: 'middle' }}>
                <img src={`${this.COMMON_IMAGE_ROOT}Icon_Reminder_email.png`} className="er-warning-icon" style={{ width: '55px', height: '42px' }}/>
              </td>
              <td className="er-warning-text" style={{ color: '#de2f3c', padding: '5px' }}>
                <span className="showmobile">Don't forget!&nbsp;</span>
                Keep copies of the evidence and submission receipt(s) to refer to at the hearing. You must also serve identical copies of your evidence to the other party(s).
              </td>
            </tr>
          </tbody>
        </table>
      </td></tr></tbody>
      </table>

      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
        The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
	    </p>

      <p className="er-subheader" style={{ borderBottom: '1px solid #e3e3e3', margin: '0px 0px 10px 0px', padding:'5px 5px 2px 0px', color:'#8d8d8d' }}>Submission Information</p>
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>File number: </span>&nbsp; <b>{this.dispute.get('file_number')}</b></p>
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>File package: </span>&nbsp; <b>{filePackageDisplay}</b></p>
      
      <p className="er-noreply-text" style={{ textAlign: 'left', color: '#666', padding: '0px 0px 0px 0px', margin: '30px 0px 10px 0px' }}>The following files were submitted to the Residential Tenancy Branch to support the dispute file.</p>
      
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Files added: </span>&nbsp; {uploadedFilesCount}</p>
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Date: </span>&nbsp; {Formatter.toDateDisplay(Moment())}</p>
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Added For: </span>&nbsp; {addedForDisplay}</p>
      <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Added By: </span>&nbsp; {this.model.get('submitterName')}</p>
      <div className="" style={{ marginTop: '30px' }}>
        <div className="" style={{ fontSize: `${RECEIPT_FONT_SIZE_PX}px` }}>
          <div className="adhoc-receipt-evidence-claims">{this.renderEvidenceListJsx(this.uploaded_claims, uploadClaimsHeader)}</div>
          <div className="adhoc-receipt-other-uploads">{this.renderEvidenceListJsx(this.other_upload_evidence, uploadEvidenceHeader)}</div>
        </div>
      </div>
    </>;
  },

  renderEvidenceListJsx(evidenceList, title) {
    if (evidenceList.isEmpty()) return;
    const otherTitleText = 'Files that support the above claims or your application';

    return (
      <>
        {evidenceList.map((model, index) => {
          const disputeEvidences = model.get('dispute_evidences') ? model.get('dispute_evidences') : [model];
          return (
            <table key={index} cellPadding="0" cellSpacing="0" width="100%" className="er-alert-table" style={{ margin: '0', padding: '0', borderCollapse: 'collapse' }}>
            <tr>
              <td className="er-nesttable-wrapper-td" style={{ padding: '15px 0px 10px 0px' }}>
                <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable" style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr className="er-nesttable-tr">
                      <td className="er-nesttable-header" style={{ minWidth: '110px', width:'10%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', border: '1px solid #e3e3e3', backgroundColor: '#f0f0f0', padding: '4px', whiteSpace: 'nowrap' }}>{title}</td>
                      <td className="er-nesttable-subheader" style={{ padding: '4px 4px 4px 10px', width: 'auto', border: '1px solid #e3e3e3' }}>{`${model.getClaimTitle ? model.getClaimTitle() : otherTitleText}`}</td>
                    </tr>
                    {disputeEvidences.map((model, index) => {
                      const fileDescription = model.get('file_description')
                      const uploadedFiles = model.getDisputeAccessFiles()
                      if (!model.hasDisputeAccessFiles()) { return; }

                      return (
                        <>
                          <tr className="er-nesttable-tr" key={index}>
                            <td colSpan="2" className="er-nesttable-item" style={{ padding: '8px', width: '100%', border: '1px solid #e3e3e3' }}>
                              { model.get('required').isRequired ? 
                                fileDescription.title : 
                                <>
                                  <b>{ fileDescription.get('title') }</b> <i>(optional):</i>
                                </>
                              }
                              <ul className="er-sublist" style={{ padding: '0px 0px 0px 0px', margin: '0px 0px 0px 20px' }}>
                                <li className="er-sublist-li" style={{ padding: '4px 0px 0px 0px', margin: '0px', listStyleType: 'square' }}>
                                <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>{ uploadedFiles.length +' file'+(uploadedFiles.length === 1 ? '' : 's') } </span>
                                  {uploadedFiles.map((model, index) => {
                                    return (
                                      <>
                                        {index > 0 ? ', ' : ''}<img src={`${this.COMMON_IMAGE_ROOT}Icon_File_email.png`} className="er-file-icon" style={{ padding: '0px', position: 'relative', top: '0px' }}/>
                                        <span className="er-filename" style={{ wordBreak: 'break-all', overflowWrap: 'break-word', wordWrap: 'break-word', }}>{model.get('file_name')}</span>
                                        <span className="er-filesize" style={{ color: '#999999', paddingRight: '5px', fontSize: '15px' }}> ({Filesize(model.get('file_size'))})</span>
                                      </>
                                    )
                                  })}
                                  </li>
                              </ul>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </td>
            </tr>
          </table>
          )
        })}
      </>
    );
  },
});

_.extend(UploadReceiptPage.prototype, ViewJSXMixin);
export { UploadReceiptPage }
