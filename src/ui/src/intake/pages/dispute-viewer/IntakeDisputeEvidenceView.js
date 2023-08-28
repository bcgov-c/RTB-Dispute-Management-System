import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import FileListJsx from '../../../core/components/files/file-list/FileListJsx';
import ThumbnailFileListJsx from '../../../core/components/files/file-list/ThumbnailFileListJsx';
import ReceiptTableWithPaginationJsx from './ReceiptTableWithPaginationJsx';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const emailsChannel = Radio.channel('emails');
const hearingChannel = Radio.channel('hearings');
const claimsChannel = Radio.channel('claims');
const participantsChannel = Radio.channel('participants');

const EVIDENCE_VIEW_ALLOWED_RECEIPT_SUB_TYPES = [60];
const RECEIPT_LOAD_COUNT = configChannel.request('get', 'IVD_RECEIPT_LOAD_COUNT') || 20;

const IntakeDisputeEvidenceView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);

    this.emailReceipts = emailsChannel.request('get:receipts')?.filter(receipt => participantsChannel.request('get:participant', receipt.get('participant_id'))?.isApplicant() 
      && EVIDENCE_VIEW_ALLOWED_RECEIPT_SUB_TYPES.includes(receipt.get('receipt_subtype')));
    let allClaims = claimsChannel.request('get:full:with:supporting').removeAllRemovedClaimsAndEvidence(true);
    allClaims.add( claimsChannel.request('get:removed:full').filter(m => m.isAmendRemoved()), { silent: true });
    this.claims = allClaims.filter(claim => !claim.isReverseAward() && !claim.isSupportingEvidence());
    this.otherClaims = allClaims.filter(claim => claim.isSupportingEvidence())?.[0];
    this.allClaims = allClaims.filter(claim => !claim.isReverseAward());
    this.index = 0;
    this.count = 20;
    this.dispute = disputeChannel.request('get');

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.thumbnailsModel = new CheckboxModel({
      html: 'Thumbnails',
      checked: false
    });
  },

  setupListeners() {
    this.listenTo(this.thumbnailsModel, 'change:checked', () => this.render());
  },

  openReceiptModal(receipt) {
    const emailReceiptModal = new ReceiptModal({
      receiptTitle: receipt.get('receipt_title'),
      receiptBody: receipt.get('receipt_body'),
      receiptParticipantId: receipt.get('participant_id'),
      disableEmail: true
    });

    modalChannel.request('add', emailReceiptModal);
  },

  prevPage() {
    if (this.index <= 0) return;
    this.index -= RECEIPT_LOAD_COUNT;
    this.render();
  },

  nextPage() {
    if ((this.index) + this.count >= this.emailReceipts?.length) return;
    this.index += RECEIPT_LOAD_COUNT;
    this.render();
  },

  isFileAddedByApplicant(file) {
    return participantsChannel.request('get:participant', file.get('added_by')).isApplicant();
  },

  print() {
    window.print();
  },

  clickFilename(fileModel) {
    fileModel.download();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  onRender() {
    this.showChildView('thumbnailToggleRegion', new CheckboxView({ model: this.thumbnailsModel }));

    this.listenToOnce(this.getUI('mainImg'), 'load', () => {
      try {
        this.getUI('loaderImg').addClass('hidden');
        this.getUI('mainImg').removeClass('hidden');
      } catch (err) {
        // Pass
      }
    });
  },

  regions: {
    thumbnailToggleRegion: '.intake-dispute__evidence__thumbnail-toggle'
  },

  ui: {
    loaderImg: '.file-card__image-container > img:not(.hidden)',
    mainImg: '.file-card__image-container > img.hidden',
  },

  template() {
    const latestHearing = hearingChannel.request('get:latest');
    const evidenceDeadline = latestHearing ? (Formatter.toDateDisplay(latestHearing.getApplicantEvidenceDeadline(), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING')) || '-') : '-';

    return (
      <div className="intake-dispute">
        <div className="intake-dispute__page-title hidden-print">
          <span>Applicant Evidence</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        {DisputePrintHeaderJsx(`File Number: ${this.dispute.get('file_number')} Applicant Evidence`)}

        <p className="intake-dispute__description">
        The following is a list of applicant submitted evidence on this dispute. If your dispute is in a status that is open for 
        submissions, you can upload additional evidence through the <a class='static-external-link' href='javascript:;' url={configChannel.request('get', 'DISPUTE_ACCESS_URL')}>Dispute Access</a> site using your dispute access code. 
        Learn more about&nbsp;<a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/prepare-for-a-hearing/choosing-and-preparing-evidence">preparing</a> and <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/prepare-for-a-hearing/submitting-evidence?keyword=preparing&keyword=evidence">submitting</a> evidence.
        </p>

        { this.renderJsxRemovedEvidenceText() }

        <div className="intake-dispute__label">
          <span className="review-label">Applicant Evidence Deadline:</span>
          <span><b>{evidenceDeadline}</b></span>
        </div>

        { this.renderJsxEvidence() }
        { ReceiptTableWithPaginationJsx(this.emailReceipts, this.index, this.count, this.prevPage.bind(this), this.nextPage.bind(this)) }
      </div>
    )
  },

  renderJsxRemovedEvidenceText() {
    const removedIssues = claimsChannel.request('get:removed:full').filter(m => m.isAmendRemoved());
    const removedApplicants = participantsChannel.request('get:removed')?.filter(p => p.isApplicant());

    if (!removedIssues?.length && !removedApplicants?.length) return;

    return (
      <>
        <p className="intake-dispute__description">
          The following issues or applicants have been removed from this
          dispute file. Although removed issues and applicants are no longer displayed on your dispute application, 
          the evidence will be displayed here in case it is still relevant to your remaining issues:
        </p>

        <ul>
          {removedApplicants?.length ? 
           removedApplicants.map(p => {
            return <li><span className="review-label">Removed Applicant: </span>{p.getDisplayName()}</li>
           })
           : null }

          {removedIssues?.length ? 
           removedIssues.map(i => {
            return <li><span className="review-label">Removed Issue: </span>{i.getClaimTitle()}</li>
           })
           : null }
        </ul>

        <br/>
      </>
    )
  },

  renderJsxEvidence() {
    if (!this.claims?.length) return;

    const showThumbnails = this.thumbnailsModel.getData();
    const allApplicantissueFiles = this.allClaims?.map(issue => issue.get('dispute_evidences').getFilesProvided()?.map(evidence => evidence.getUploadedFiles().filter(file => this.isFileAddedByApplicant(file))).flat() ).flat()

    return (
      <div>
        <div className="intake-dispute__evidence__thumbnail-wrapper">
          <div class="radio-display-title evidence-page-filter-hide-radio-label">Submitted Evidence</div>
          <div className="intake-dispute__evidence__thumbnail-toggle hidden-print"></div>
        </div>
        <div>
          {this.claims.map((issue, index) => {
            const isApplicantIssueUpload = issue?.getUploadedFiles()?.filter(file => participantsChannel.request('get:participant', file.get('added_by'))?.isApplicant())?.length;
            return (
              <div>
                <div>
                  <div>
                    <div className="intake-dispute__evidence__evidence-title">
                      <span>{issue.isRemoved() ? <b>REMOVED: </b> : ''}{issue.getClaimTitle()}</span>
                    </div>

                    <div className="">
                      <div className="">
                        { issue.getUploadedFiles()?.length && isApplicantIssueUpload ? <div className="intake-dispute__label">
                          <span>{ issue.get('dispute_evidences').getFilesProvided()?.filter(evidence => evidence.get('isApplicant'))?.length ? issue.get('dispute_evidences').getFilesProvided()?.filter(evidence => evidence.get('isApplicant')).map(evidence => {
                            const applicantIssueEvidence = evidence.getUploadedFiles().filter(file => this.isFileAddedByApplicant(file));
                            return (
                              <>
                                <b className="intake-dispute__word-break">{evidence.getTitle()}</b> 
                                <span className="intake-dispute__issue-item intake-dispute__word-break">{evidence.getDescription() ? `- ${evidence.getDescription()}` : ''}</span>
                                {evidence.getUploadedFiles()?.length ? 
                                  showThumbnails ? 
                                    <div className="intake-dispute__evidence__thumbnail-item">{ThumbnailFileListJsx(allApplicantissueFiles, applicantIssueEvidence, this.clickFilename)}</div> :
                                    <div className="intake-dispute__issue-item">{FileListJsx(applicantIssueEvidence, this.clickFilename, this.showFile)}</div>
                                : null}
                              </>
                            );
                          })
                          : null}
                          </span>
                        </div> : null }
                        { issue.get('dispute_evidences')?.getFilesMissing({ no_custom: true })?.length && !issue.isRemoved() ? this.renderJsxEvidenceNotProvided(issue.get('dispute_evidences')?.getFilesMissing({ no_custom: true })) : <></> }
                      </div>
                    </div>
                  </div>
                </div>
                <br/>
              </div>
            )
          })}

        {this.otherClaims?.get('dispute_evidences')?.length ?
         <>
         {
          <div>
          <div>
            <div className="intake-dispute__evidence__evidence-title">
              <span className="">Other supporting information</span>
            </div>

              <div className="">
                <div className="">
                  <span>{ this.otherClaims.get('dispute_evidences').getFilesProvided()?.map(evidence => {
                    const applicantIssueEvidence = evidence.getUploadedFiles().filter(file => this.isFileAddedByApplicant(file));
                    if (evidence.get('isRespondent')) return;

                    return (
                      <div className="intake-dispute__evidence__item-wrapper">
                        <b>{evidence.getTitle()}</b> 
                        <span>{evidence.getDescription() ? ` - ${evidence.getDescription()}` : ''}</span>
                        <br/>
                        {evidence.getUploadedFiles()?.length ? 
                          showThumbnails ? 
                            <div className="intake-dispute__evidence__thumbnail-item">{ThumbnailFileListJsx(allApplicantissueFiles, applicantIssueEvidence, this.clickFilename)}</div> :
                            <div className="intake-dispute__issue-item">{FileListJsx(applicantIssueEvidence, this.clickFilename, this.showFile)}</div>
                        : null}
                      </div>
                    );
                  })
                  }
                  </span>
                  
                  { this.otherClaims?.get('dispute_evidences')?.getFilesMissing({ no_custom: true })?.length ? this.renderJsxEvidenceNotProvided(this.otherClaims?.get('dispute_evidences')?.getFilesMissing({ no_custom: true })) : <></> }
                </div>
              </div>
            </div>
          </div>
         }
         </> 
        : null}
        </div>
      </div>
    )
  },

  renderJsxEvidenceNotProvided(evidenceCollection) {
    return (
      <>
        <div className="intake-dispute__error">
          <img className="intake-dispute__error__error-icon" src={`${configChannel.request('get', 'COMMON_IMAGE_ROOT')}Icon_FeedbackWarning.png`}/>&nbsp;
          <div className="dispute-list-error-text">Have you provided the following recommended information?</div>
        </div>
        <div>
          {evidenceCollection.map(evidence => {
            return (
              <div>
                { evidence.get('required') ? <b><i>{evidence.getTitle()} (required)</i></b> : <i>{evidence.getTitle()} (optional)</i> }
              </div>
            )
          })
          }
        </div>
      </>
    )
  },

})

_.extend(IntakeDisputeEvidenceView.prototype, ViewJSXMixin);
export default IntakeDisputeEvidenceView;