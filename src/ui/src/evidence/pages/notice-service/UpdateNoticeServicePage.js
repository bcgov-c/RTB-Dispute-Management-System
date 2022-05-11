import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview'
import NoticeServiceList from './DANoticeServiceList';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import ModalBlankCheckboxView from '../../../core/components/modals/modal-blank/ModalBlankCheckbox';
import template from './UpdateNoticeServicePage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const noticeChannel = Radio.channel('notice');
const disputeChannel = Radio.channel('dispute');

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
              <li style="margin-top: 10px;"><span>By choosing to not serve the remaining respondent(s), they will no longer be part of your dispute file and will <b>not</b> be included in any orders associated to this dispute file.</span></li>
              <li style="margin-top: 10px;"><span>By choosing this option your file will be moved into a state where you cannot view or modify any of your dispute service information.  You should only choose this option if you have submitted all respondent proof of service information and are certain you want to continue without serving the remaining respondent(s). </span></li>
              <li style="margin-top: 10px;"><span>This action cannot be undone. If you are not sure you want to do this, press cancel. </span></li>
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

  initialize() {
    this.activeNotice = noticeChannel.request('get:active');
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('noticeServiceListRegion', new NoticeServiceList({ 
      collection: this.activeNotice.getServices(),
      model: this.model
    }));
  },

  templateContext() {
    const numServedServices = this.activeNotice.getServedServices().length;
    return {
      numServedServices,
      enableSkipService: numServedServices,
      totalNumServices: this.activeNotice.getServices().length,
    };
  }

});
