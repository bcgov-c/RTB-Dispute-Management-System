import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import Icon_Warning from '../../static/Icon_AlertSml.png';
import ApplicantRequiredService from '../../../core/components/service/ApplicantRequiredService';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import FileListJsx from '../../../core/components/files/file-list/FileListJsx';
import ReceiptTableWithPaginationJsx from './ReceiptTableWithPaginationJsx';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const hearingChannel = Radio.channel('hearings');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const emailsChannel = Radio.channel('emails');
const flagsChannel = Radio.channel('flags');
const sessionChannel = Radio.channel('session');

const NOTICE_VIEW_ALLOWED_RECEIPT_SUB_TYPES = [44, 67];
let RECEIPT_LOAD_COUNT = 20;

const IntakeDisputeNoticesView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);
    RECEIPT_LOAD_COUNT = configChannel.request('get', 'IVD_RECEIPT_LOAD_COUNT') || RECEIPT_LOAD_COUNT;
    const disputeNotices = noticeChannel.request('get:all').filter(notice => notice.get('notice_delivered_to') && participantsChannel.request('get:participant', notice.get('notice_delivered_to'))?.isApplicant());
    const hearingNoticeFileDescriptions = hearingChannel.request('get')?.map(hearing => hearing.getHearingNoticeFileDescription());
    this.emailReceipts = emailsChannel.request('get:receipts')?.filter(receipt => participantsChannel.request('get:participant', receipt.get('participant_id'))?.isApplicant() 
      && NOTICE_VIEW_ALLOWED_RECEIPT_SUB_TYPES.includes(receipt.get('receipt_subtype')));
    this.disputeAndHearingNotices = new Backbone.Collection([...disputeNotices, ...hearingNoticeFileDescriptions], {
      comparator: this.getSortOrder()
    });

    this.dispute = disputeChannel.request('get');
    this.reviewFlag = flagsChannel.request('get')?.filter((flag) => flag.isReview() && flag.isActive())?.[0];
    this.notice = noticeChannel.request('get:active');
    this.showArsDeadlineWarning = ApplicantRequiredService.hasUpcomingArsDeadline(this.dispute, this.notice),
    this.showArsReinstatementDeadlineWarning = ApplicantRequiredService.hasUpcomingArsReinstatementDeadline(this.dispute, this.notice)
    this.index = 0;
    this.count = 20;
  },

  getSortOrder() {
    const item_comparator = (n) => { return $.trim(n.get('created_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); };

    const reverseSortBy = (sortByFunction) => {
      return (left, right) => {
        let l = sortByFunction(left);
        let r = sortByFunction(right);
  
        if (l === void 0) return -1;
        if (r === void 0) return 1;
  
        return l < r ? 1 : l > r ? -1 : 0;
      };
    };

    return reverseSortBy(item_comparator);
  },

  clickDaArsLink(daActionConfig) {
    const accessCode = participantsChannel.request('get:primaryApplicant')?.get('access_code');
    const daActionId = configChannel.request('get', daActionConfig);
    const extSiteId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_INTAKE');
    const submitterName = sessionChannel.request('name');
    sessionChannel.trigger('redirect:disputeAccess', accessCode, daActionId, extSiteId, submitterName);
  },

  clickFilename(fileModel) {
    fileModel.download();
  },

  print() {
    window.print();
  },

  refresh() {
    this.refreshDataAndRenderView();
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
          <span>Dispute Notices and Amendments</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        { DisputePrintHeaderJsx(`File Number: ${disputeChannel.request('get')?.get('file_number')} Dispute Notices and Amendments`) }

        <p className="intake-dispute__description">This is a record of dispute notice(s) and/or amendments that are associated to this dispute file.</p>
        { this.renderJsxArsWarnings() }
        { this.renderJsxNotices() }
        { ReceiptTableWithPaginationJsx(this.emailReceipts, this.index, this.count, this.prevPage.bind(this), this.nextPage.bind(this)) }
      </div>
    );
  },

  renderJsxArsWarnings() {
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
    );
  },

  renderJsxNotices() {
    return this.disputeAndHearingNotices.map(notice => {

      return (
        <div className="intake-dispute__notice-item">
          { notice.get('file_description_id') ? this.renderJsxHearingNotice(notice) : this.renderJsxNODRPInfo(notice) }
        </div>
      )
    })
  },

  renderJsxHearingNotice(notice) {
    return (
      <div className="intake-dispute__notice-hearing" key={notice.id}>
        <div className=""><b>Hearing Notice</b></div>
        <div className="intake-dispute__label">
          <span className="review-label">Notice document:</span>
          <span>{FileListJsx(notice.getUploadedFiles(), this.clickFilename)}</span>
        </div>
        <div className="intake-dispute__label">
          <span className="review-label">Required service to respondents:</span>
          <span>No</span>
        </div>
      </div>
    );
  },

  renderJsxNODRPInfo(notice) {
    if (!notice.id || notice?.isAmendmentNotice()) return;
    const noticeAmendments = noticeChannel.request('get:amendmentNotices:of', notice.id).filter(notice => participantsChannel.request('get:participant', notice.get('notice_delivered_to'))?.isApplicant());
    return <>
      {this.renderJsxNotice(`Notice of Dispute Resolution Proceeding`, notice)}
      {
        noticeAmendments?.length ? <div className="intake-dispute__notice-amendment">
          {noticeAmendments.map(amendment => this.renderJsxNotice(`Associated Amendment`, amendment))}
        </div>
      : null}
    </>
  },

  renderJsxNotice(noticeTitle, notice) {
    const noticeDeliveredToText = notice.get('notice_delivered_to') && notice.get('notice_delivered_date') ? `${participantsChannel.request('get:participant:name', notice.get('notice_delivered_to'))} - ${Formatter.toDateAndTimeDisplay(notice.get('notice_delivered_date'))}` : '-';

    const renderService = (service) => {
      const participantName = participantsChannel.request('get:participant:name', service.get('participant_id'));
      let serviceInfo = '';
      if (service.isNotServed()) {
        serviceInfo = `Not served`;
      } else if (service.isServed()) {
        const serviceDateDisplay = Formatter.capitalize(
          `${configChannel.request('get', 'SERVICE_DATE_USED_DISPLAY')?.[service.get('service_date_used')] || ''}`.toLowerCase()
        );
        serviceInfo = <>
          <span>{serviceDateDisplay}</span>
          {service.get('service_method') && service.get('service_date') ? <>
            <span>
              &nbsp;{configChannel.request('get', 'SERVICE_METHOD_DISPLAYS')?.[service.get('service_method')]}&nbsp;on&nbsp;
              {Formatter.toDateDisplay(service.get('service_date'))}
            </span>
          </> : null}
        </>;
      } else {
        serviceInfo = <span className="info-gray">No service information</span>;
      }

      const proofFiles = [...service.getProofFileModels(), ...service.getOtherProofFileModels()];
      if (proofFiles.length) {
        serviceInfo = <>{serviceInfo} - {FileListJsx(proofFiles, this.clickFilename)}</>
      }

      return <>
        <span>{participantName}:</span>&nbsp;&nbsp;
        <span>{serviceInfo}</span>
      </>
    };

    return <>
      <div className="" key={notice.id}><b>{noticeTitle}</b></div>
      <div className="intake-dispute__label">
        <span className="review-label">Notice document:</span>
        <span>{FileListJsx(notice.getNoticeFileDescription()?.getUploadedFiles(), this.clickFilename)}</span>
      </div>
      <div className="intake-dispute__label--break-word">
        <span className="review-label">Provided to:</span>
        <span>{noticeDeliveredToText}</span>
      </div>
      <div className="intake-dispute__label">
        {notice.isServedByRTB() ? <>
          <span className="review-label">Requires service to respondents:</span>
          <span>No</span>
        </> : <>
          <span className="review-label">Respondent service summary:</span>
          {notice.getServices().map(service => {
            return <div>{renderService(service)}</div>;
          })}
        </>}
      </div>
    </>;
  },

});

_.extend(IntakeDisputeNoticesView.prototype, ViewJSXMixin);
export default IntakeDisputeNoticesView;