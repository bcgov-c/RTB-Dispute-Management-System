import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview'
import NoticeServiceList from './DANoticeServiceList';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import ModalBlankCheckboxView from '../../../core/components/modals/modal-blank/ModalBlankCheckbox';
import template from './NoticeServiceMenuPage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import ApplicantRequiredService from '../../../core/components/service/ApplicantRequiredService';

const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const noticeChannel = Radio.channel('notice');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} da-notice-service-page`,

  regions: {
    disputeRegion: '.dac__service__dispute-overview',
    noticeServiceListRegion: '.da-notice-service-list'
  },

  ui: {
    logoutButton: '.receipt-logout-btn',
    mainMenuButton: '.btn-standard',
    skipService: '.da-notice-service-skip'
  },

  events: {
    'click @ui.mainMenuButton': 'returnToMenu',
    'click @ui.logoutButton': 'logout',
    'click @ui.skipService': 'showSkipModal'
  },

  returnToMenu() {
    Backbone.history.navigate('access', { trigger: true });
  },

  logout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  showSkipModal() {
    modalChannel.request('show:custom', ModalBlankCheckboxView, {
      title: 'Skip Respondent Service',
      bodyHtml: `
        <div class="center-text">
          <div class="modal-withdraw-title" style="margin-bottom: 10px;>
            Now that you have served one respondent you have the option of continuing this dispute without serving the additional respondent(s).  This action has consequences to your dispute file. Read the following carefully
          </div>
          <div class="modal-withdraw-body">
            <ul class="sublist">
              <li style="margin-top: 10px;"><span>If you don't serve the other respondents, they may not be included on any orders in this dispute.</span></li>
              <li style="margin-top: 10px;"><span>Only choose this option if you've submitted all your proof of service details for the respondents you served. Once you confirm this option, you won't be able to view or change any service details.</span></li>
              <li style="margin-top: 10px;"><span>This action can't be undone. If you aren't sure you want to do this, press 'Cancel'.</span></li>
            </ul>
          </div>
        </div>
      `,
      modalCssClasses: 'skipService-modal',
      primaryButtonText: 'Skip Service',
      onContinueFn: (modalView) => {
        loaderChannel.trigger('page:load');

        // Else if all notice services served, set dispute stage:status to 6:61
        const externalSaveStatusModel = new ExternalDisputeStatusModel({
          file_number: disputeChannel.request('get:filenumber')
        });
        const statusSaveAttrs = { dispute_stage: 6, dispute_status: 61 };
        externalSaveStatusModel.save(statusSaveAttrs)
          .done(() => {
            loaderChannel.trigger('page:load:complete');
            modalView.close();
            const dispute = disputeChannel.request('get');
            dispute.set('status', _.extend(dispute._getStatusObj(), statusSaveAttrs));
            this.showSkipModalSuccessModal();
          }).fail(
            generalErrorFactory.createHandler('DA.STATUS.SAVE', () => {
              modalView.close();
              this.returnToMenu();
            })
          );
      },
      checkboxHtml: 'I have read and understand the above and want to skip serving the additional respondent(s) on my dispute file'
    });
  },

  showSkipModalSuccessModal() {
    const successModal = modalChannel.request('show:standard', {
      title: 'Service Skipped',
      bodyHtml: `<p>Your dispute file has been moved forward without service to the remaining unserved respondent(s). Only the served respondent(s) will be considered in the hearing and included in orders that result from the hearing.</p>`,
      primaryButtonText: 'Continue',
      hideCancelButton: true,
      onContinueFn: (modalView) => modalView.close()
    });

    this.listenTo(successModal, 'removed:modal', this.returnToMenu, this);
  },

  getServiceDetailsText() {
    const dispute = disputeChannel.request('get');
    const serviceDeadline = Formatter.toDateAndTimeDisplay(this.activeNotice.get('service_deadline_date'));
    const serviceDetailsText = ApplicantRequiredService.externalLogin_hasUpcomingArsDeadline(dispute, this.activeNotice) ?
      `<span class="da-update-contact-service-info-warning">You must enter service details for the dispute respondents below before the service declaration deadline of <b>${serviceDeadline}</b></span>` :
      `You must enter service details for all respondents`;

    return serviceDetailsText;
  },

  initialize(options) {
    this.mergeOptions(options, ['pageTitle', 'pageInstructionsHtml', 'disableProgressBar', 'serviceRoute']);
    this.activeNotice = noticeChannel.request('get:active');
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('noticeServiceListRegion', new NoticeServiceList({ 
      collection: this.activeNotice.getServices(),
      model: this.model,
      serviceRoute: this.serviceRoute,
    }));
  },

  templateContext() {
    const dispute = disputeChannel.request('get');
    const numServedServices =  this.activeNotice.getServedServices().length;
    return {
      numServedServices,
      enableSkipService: dispute.checkProcess(2) && numServedServices,
      totalNumServices: this.activeNotice.getServices().length,
      pageTitle: this.pageTitle || `Record service of dispute notice`,
      pageInstructionsHtml: this.pageInstructionsHtml || `
        <div class="da-update-contact-service-info-header">Enter your service details below for each respondent.</div>
        <div class="da-update-contact-service-info-desc">
          ${this.getServiceDetailsText()}. For privacy reasons, only the initials and access code are displayed for each respondent. 
          The full names and access codes are listed in your Notice of Dispute document. If you have trouble serving the Notice of Dispute using the allowed methods, contact us and ask for special service instructions.
        </div>
      `,
      disableProgressBar: this.disableProgressBar,
    };
  }

});
