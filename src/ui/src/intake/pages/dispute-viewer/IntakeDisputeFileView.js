import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import Icon_Warning from '../../static/Icon_AlertSml.png';
import ApplicantRequiredService from '../../../core/components/service/ApplicantRequiredService';
import FileListJsx from '../../../core/components/files/file-list/FileListJsx';
import ReceiptTableWithPaginationJsx from './ReceiptTableWithPaginationJsx';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const modalChannel = Radio.channel('modals');
const emailsChannel = Radio.channel('emails');
const noticeChannel = Radio.channel('notice');
const sessionChannel = Radio.channel('session');

const FILE_VIEW_ALLOWED_RECEIPT_SUB_TYPES = [1, 61];
const RECEIPT_LOAD_COUNT = configChannel.request('get', 'IVD_RECEIPT_LOAD_COUNT') || 20;

const IntakeDisputeFileView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);

    this.dispute = disputeChannel.request('get');
    this.hearing = hearingChannel.request('get:latest');
    this.applicants = participantsChannel.request('get:applicants');
    this.respondents = participantsChannel.request('get:respondents');
    const allClaims = claimsChannel.request('get:full:with:supporting', { skip_tenancy_agreement: true }).removeAllRemovedClaimsAndEvidence();
    this.claims = allClaims.filter(claim => !claim.isReverseAward() && !claim.isSupportingEvidence());
    this.otherClaims = allClaims.filter(claim => claim.isSupportingEvidence())?.[0];
    this.notice = noticeChannel.request('get:active');
    this.showArsDeadlineWarning = ApplicantRequiredService.hasUpcomingArsDeadline(this.dispute, this.notice),
    this.showArsReinstatementDeadlineWarning = ApplicantRequiredService.hasUpcomingArsReinstatementDeadline(this.dispute, this.notice)

    this.emailReceipts = emailsChannel.request('get:receipts')?.filter(receipt => participantsChannel.request('get:participant', receipt.get('participant_id'))?.isApplicant() && FILE_VIEW_ALLOWED_RECEIPT_SUB_TYPES.includes(receipt.get('receipt_subtype')));
    this.index = 0;
    this.count = 20;

  },

  print() {
    window.print();
  },

  clickFilename(fileModel) {
    fileModel.download();
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

  isFileAddedByApplicant(file) {
    return participantsChannel.request('get:participant', file.get('added_by')).isApplicant();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  clickDaArsLink(daActionConfig) {
    const accessCode = participantsChannel.request('get:primaryApplicant')?.get('access_code');
    const daActionId = configChannel.request('get', daActionConfig);
    const extSiteId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_INTAKE');
    const submitterName = sessionChannel.request('name');
    sessionChannel.trigger('redirect:disputeAccess', accessCode, daActionId, extSiteId, submitterName);
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

  template() {
    return (
      <div className="intake-dispute">
        <div className="intake-dispute__page-title hidden-print">
          <span>Dispute Application</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        {DisputePrintHeaderJsx(`File Number: ${this.dispute.get('file_number')} Dispute Application`)}
        
        <p className="intake-dispute__description">
          This is a <b>view only</b> record of applicant submissions for this dispute. Use the tabs on the left to navigate through your file.
        </p>

        { this.renderJsxDisputeWarnings() }

        <div className="intake-dispute__label">
          <span className="review-label">File number:</span>
          <span><b>{this.dispute.get('file_number')}</b></span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Status:</span>
          <span><b>{Formatter.toStatusDisplay(this.dispute.getStatus())}</b></span>
        </div>
        { this.renderJsxARSDeadline() }

        { this.renderJsxGeneralDisputeInfo() }
        { this.renderJsxApplicants() }
        { this.renderJsxIssues() }
        { ReceiptTableWithPaginationJsx(this.emailReceipts, this.index, this.count, this.prevPage.bind(this), this.nextPage.bind(this)) }
      </div>
    )
  },

  renderJsxDisputeWarnings() {
    const renderARSDeclarationDeadlineWarning = () => {
      if (!this.showArsDeadlineWarning) return;

      return (
        <div className="intake-dispute__warning">
          <img className="intake-dispute__warning__icon" src={Icon_Warning} />
          <span className="intake-dispute__warning__text">
            You must indicate to the Residential Tenancy Branch that you served the Notice of Dispute Resolution Proceeding Package <span className="general-link" onClick={() => this.clickDaArsLink('EXTERNAL_DA_ACTION_NOTICE')}>online</span> or 
            at the Residential Tenancy Branch or Service BC Centre. You must declare service for at least one respondent before&nbsp;<b>{ Formatter.toFullDateAndTimeDisplay(this.notice.get('service_deadline_date')) }</b>&nbsp;or your dispute will be adjourned
          </span>
        </div>
      )
    }

    const renderARSReinstatementDeadlineWarning = () => {
      if (!this.showArsReinstatementDeadlineWarning) return;
      
      return (
        <div className="intake-dispute__warning">
          <img className="intake-dispute__warning__icon" src={Icon_Warning} />
          <span className="intake-dispute__warning__text">
            This dispute has been adjourned because you did not declare service to at least one respondent before the declaration deadline&nbsp;<b>{ Formatter.toFullDateAndTimeDisplay(this.notice.get('service_deadline_date')) }</b>.
            If you have served the respondent(s), you may request to reinstate your hearing by providing RTB-55 proof of service form <span className="general-link" onClick={() => this.clickDaArsLink('EXTERNAL_DA_ACTION_REINSTATEMENT')}>online</span> or 
            at the Residential Tenancy Branch or Service BC Centre by&nbsp;<b>{ Formatter.toFullDateAndTimeDisplay(this.notice.get('second_service_deadline_date')) }</b>.
            If you do not provide proof that the notice of dispute has been served, your dispute will be deemed withdrawn.
          </span>
        </div>
      )
    }
    
    return (
      <div className="intake-dispute__warning__wrapper">
        { renderARSDeclarationDeadlineWarning() }
        { renderARSReinstatementDeadlineWarning() }
      </div>  
    )
  },
  
  renderJsxARSDeadline() {
    if (!this.showArsDeadlineWarning && !this.showArsReinstatementDeadlineWarning) return;
    const hasUnservedServices = !!this.notice.getUnservedServices().length;
    const serviceDeadlineDate = this.notice.get('service_deadline_date');
    const secondServiceDeadlineDate = Moment(this.notice.get('service_deadline_date')).add(7, 'day');
    const deadlineInFuture = Moment(serviceDeadlineDate).isAfter(Moment());
    const secondDeadlineInFuture = Moment(secondServiceDeadlineDate).isAfter(Moment());

    return (
      <div class="">
        { this.showArsDeadlineWarning ? 
        <div className="intake-dispute__label">
          <span className="review-label">Declaration Deadline:</span>
          <span class={
            this.notice.get('has_service_deadline') && hasUnservedServices && !deadlineInFuture ? 'error-red'
            : this.notice.get('has_service_deadline') && (!hasUnservedServices || deadlineInFuture) ? 'success-green'
            : '' }>
            { Formatter.toDateAndTimeDisplay(serviceDeadlineDate) }</span>
        </div> : null }

        { this.showArsReinstatementDeadlineWarning ? <div className="intake-dispute__label">
          <span className="review-label">Reinstatement Deadline:</span>
          <span class={
            this.notice.get('has_service_deadline') && hasUnservedServices && !secondDeadlineInFuture ? 'error-red'
            : this.notice.get('has_service_deadline')  && (!hasUnservedServices || secondDeadlineInFuture) ? 'success-green'
            : '' }>
            { Formatter.toDateAndTimeDisplay(secondServiceDeadlineDate) }
          </span>
        </div> : null }
      </div>
    )
  },

  renderJsxGeneralDisputeInfo() {
    const DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY = configChannel.request('get', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY');
    const isSigned = this.dispute.get('tenancy_agreement_signed_by') &&
    this.dispute.get('tenancy_agreement_signed_by') !== configChannel.request('get', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_NOT_SIGNED') &&
    DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY[this.dispute.get('tenancy_agreement_signed_by')];
    const tenancyAgreementFileDescriptionModels = filesChannel.request('get:filedescriptions:code', configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')) || [];
    const filteredTenancyAgreementFiles = tenancyAgreementFileDescriptionModels?.map(fileDescription => fileDescription.getUploadedFiles()).filter(f => f.length).flat();

    return (
      <div>
        <div className="intake-dispute__section-title"><b>General dispute information</b></div>
        <div className="intake-dispute__label">
          <span className="review-label">Applicant type:</span>
          <span>{this.dispute.isLandlord() ? 'Landlord' : 'Tenant'}</span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Act:</span>
          <span>{this.dispute.isMHPTA() ? 'MHPTA (Manufactured home or trailer)' : 'RTA (Residential)'}</span>
        </div>
        <div className="intake-dispute__label--break-word">
          <span className="review-label">Rental address:</span>
          <span>{this.dispute.getCompleteAddress()}</span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Tenancy start:</span>
          <span>{this.dispute.get('tenancy_start_date') ? Formatter.toDateDisplay(this.dispute.get('tenancy_start_date')) : '-'}</span>
        </div>
        { this.dispute.get('cross_app_file_number') ? <div className="intake-dispute__label">
          <span className="review-label">Filed in response to:</span>
          <span>{this.dispute.get('cross_app_file_number')}</span>
        </div> : null }
        <div className="intake-dispute__label">
          <span className="review-label">Rent:</span>
          <span>{this.dispute.get('rent_payment_amount') ? `${Formatter.toAmountDisplay(this.dispute.get('rent_payment_amount'))}, ${Formatter.toRentIntervalDisplay(this.dispute.get('rent_payment_interval'))}` : '-'}</span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Security deposit:</span>
          <span>{this.dispute.get('security_deposit_amount') ? Formatter.toAmountDisplay(this.dispute.get('security_deposit_amount')) : '-'}</span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Pet damage deposit:</span>
          <span>{this.dispute.get('pet_damage_deposit_amount') ? Formatter.toAmountDisplay(this.dispute.get('pet_damage_deposit_amount')) : '-'}</span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Tenancy status:</span>
          <span>{this.dispute.isPastTenancy() ? 'Tenant has moved out' : 'Tenant is still living in or renting the unit or site'}</span>
        </div>
        { this.dispute.isPastTenancy() ? <div className="intake-dispute__label">
          <span className="review-label">Date tenancy ended:</span>
          <span>{Formatter.toDateDisplay(this.dispute.get('tenancy_end_date'))}</span>
        </div> : null }
        <div className="intake-dispute__label">
          <span className="review-label">Tenancy agreement:</span>
          <span className="">
            { FileListJsx(filteredTenancyAgreementFiles.filter(file => this.isFileAddedByApplicant(file)), this.clickFilename) }
          </span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Tenancy agreement effective:</span>
          <span>
          {this.dispute.get('tenancy_agreement_date') ?
          `${Formatter.toDateDisplay(this.dispute.get('tenancy_agreement_date'))} - ${isSigned ? `signed by: ${DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY[this.dispute.get('tenancy_agreement_signed_by')]}`: 'Not Signed'}` : '-'}
          </span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Date paid/waived:</span>
          <span>
            {!this.dispute.get('submitted_date') && !this.dispute.get('initial_payment_date') ? '-' 
            : Moment(this.dispute.get('submitted_date')).isAfter(this.dispute.get('initial_payment_date')) || !this.dispute.get('initial_payment_date') ? Formatter.toDateDisplay(this.dispute.get('submitted_date')) 
            : Formatter.toDateDisplay(this.dispute.get('initial_payment_date'))}
          </span>
        </div>
      </div>
    )
  },

  renderJsxApplicants() {
    const displayParticipantInfo = (participant, index) => {
      return (
        <>
          <div className="intake-dispute__item-header">{participant.isLandlord() ? 'Landlord' : 'Tenant'} {index+1}</div>
          { participant.isPrimary() ? <div className="intake-dispute__label"><b>Primary applicant contact</b></div> : null }
          <div className="intake-dispute__item-wrapper">
            <div className="intake-dispute__label--break-word">
              <span className="review-label">Name:</span>
              <span><b>{participant.getDisplayName()}</b></span>
            </div>
            { participant.isBusiness() ? <div className="intake-dispute__label">
              <span className="review-label">Business Contact:</span>
              <span>{participant.getContactName()}</span>
            </div> : null }
            { participant.isApplicant() ? <div className="intake-dispute__label">
              <span className="review-label">Dispute Access Code:</span>
              <span><b>{participant.get('access_code')}</b></span>
            </div> : null }
            <div className="intake-dispute__label">
              <span className="review-label">Type:</span>
              <span>{participant.getTypeDisplay()}</span>
            </div>
            {participant.isPrimary() ? <div className="intake-dispute__label">
              <span className="review-label">Receive Notice of Dispute Resolution Proceeding package by:</span>
              <span>{Formatter.toHearingOptionsByDisplay(participant.get('package_delivery_method'))}</span>
            </div> : null}
            <div className="intake-dispute__label--break-word">
              <span>{participant.get('address') ? participant.getAddressStringWithUnit() : ''}</span>
            </div>
            <div className="intake-dispute__label--break-word">
              <span>{participant.get('mail_address') ? `Mail: ${participant.getMailingAddressString()}` : ''}</span>
            </div>
            <div className="intake-dispute__label--break-word">
              <span className="review-label">Email:</span>
              <span>{participant.get('email') || '-'}</span>
            </div>
            { participant.get('primary_phone') ? <div className="intake-dispute__label">
              <span className="review-label">Daytime phone:</span>
              <span>{participant.get('primary_phone') || '-'}</span>
            </div> : null }
            { participant.get('secondary_phone') ? <div className="intake-dispute__label">
              <span className="review-label">Other phone:</span>
              <span>{participant.get('secondary_phone') || '-'}</span>
            </div> : null }
            { participant.get('fax') ? <div className="intake-dispute__label">
              <span className="review-label">Fax:</span>
              <span>{participant.get('fax')}</span>
            </div> : null }
          </div>
        </>
      )
    }
    return (
      <div className="">
        <div className="intake-dispute__section-title"><b>Applicants</b> (that filed the dispute)</div>
        <div>
          {this.applicants.map((participant, index) => {
            return displayParticipantInfo(participant, index);
          })}
        </div>
        <div className="intake-dispute__section-title"><b>Respondents</b> (the dispute is against)</div>
        <div>
          {this.respondents.map((participant, index) => {
            return displayParticipantInfo(participant, index);
          })}
        </div>
      </div>
    )
  },

  renderJsxIssues() {
    if (!this.claims?.length) return;
    
    return (
      <div>
        <div className="intake-dispute__section-title"><b>Issues</b></div>
        <div>
          {this.claims.map((issue, index) => {
            const isApplicantIssueUpload = issue?.getUploadedFiles()?.filter(file => participantsChannel.request('get:participant', file.get('added_by'))?.isApplicant())?.length;
            return (
              <div>
                <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable" style={{ borderCollapse: "collapse" }}>
                  <tbody>
                    <tr className="er-nesttable-tr">
                      <td className="er-nesttable-header" style={{ minWidth: "110px", width: "10%", textAlign: "center", verticalAlign: "middle", fontWeight: "bold", border: "1px solid #e3e3e3", backgroundColor: "#f0f0f0", padding: "4px", whiteSpace: "nowrap" }}>{issue.getApplicantsClaimDetail() ? 'Claim' : 'Other'}</td>
                      <td className="er-nesttable-subheader" style={{ padding: "4px 4px 4px 10px", width: "auto", border: "1px solid #e3e3e3" }}>{issue.getClaimTitle()}</td>
                    </tr>

                    <tr className="er-nesttable-tr">
                      <td colSpan="2" className="er-nesttable-item" style={{ padding: "8px", width: "100%", border: "1px solid #e3e3e3" }}>
                        { issue.getAmount() ? <div className="intake-dispute__label">
                          <span className="review-label">Amount requested:</span>
                            <span>{Formatter.toAmountDisplay(issue.getAmount())}</span>
                          </div> : null }
                        { issue.getNoticeDeliveryDate() ? <div className="intake-dispute__label">
                        <span className="review-label">Notice delivery date:</span>
                          <span>{Formatter.toDateDisplay(issue.getNoticeDeliveryDate())}</span>
                        </div> : null }
                        { issue.getNoticeDeliveryMethod() ? <div className="intake-dispute__label">
                        <span className="review-label">Notice delivery method:</span>
                          <span>{Formatter.toNoticeMethodDisplay(issue.getNoticeDeliveryMethod())}</span>
                        </div> : null }
                        { issue.getDescription() ? <div className="intake-dispute__label--break-word">
                          <span className="review-label">Description:</span>
                          <span>{Formatter.toAmountDisplay(issue.getDescription())}</span>
                        </div> : null }
                      </td>
                    </tr>
                  </tbody>
                </table>
                <br/>
              </div>
            )
          })}
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
                { evidence.get('required') ? <b>{evidence.getTitle()}</b> : <i>{evidence.getTitle()} (optional)</i> }
              </div>
            )
          })
          }
        </div>
      </>
    )
  },
});

_.extend(IntakeDisputeFileView.prototype, ViewJSXMixin);
export default IntakeDisputeFileView;