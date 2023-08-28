import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import ExternalParticipantModel from '../../components/external-api/ExternalParticipant_model';
import ModalEmailVerification from '../../../core/components/email-verification/ModalEmailVerification';
import ApplicantRequiredService from '../../../core/components/service/ApplicantRequiredService';
import template from './AccessPage_template.tpl';
import './AccesPage.scss';
import ApplicantViewDispute from '../../../core/components/ivd/ApplicantViewDispute';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const paymentsChannel = Radio.channel('payments');
const Formatter = Radio.channel('formatter').request('get');
const hearingChannel = Radio.channel('hearings');
const participantsChannel = Radio.channel('participants');
const flagsChannel = Radio.channel('flags');
const modalChannel = Radio.channel('modals');
const noticeChannel = Radio.channel('notice');
const accessChannel = Radio.channel('access');

export default PageView.extend({
  template,

  regions: {
    disputeRegion: '.dac__access-menu__dispute-overview',
  },

  ui: {
    menuRequestReinstatement: '.dac__access-menu__item--reinstatement',
    menuEvidence: '.dac__access-menu__item--evidence',
    menuRecordService: '.dac__access-menu__item--service',
    menuUpdateContact: '.dac__access-menu__item--update-contact',
    menuRequestAmendment: '.dac__access-menu__item--amendment',
    menuRequestCorrection: '.dac__access-menu__item--correction',
    menuRequestClarification: '.dac__access-menu__item--clarification',
    menuRequestSubServ: '.dac__access-menu__item--sub-serv',
    menuRequestReview: '.dac__access-menu__item--review',
    menuRequestReviewPayment: '.dac__access-menu__item--review-payment',
    menuPayment: '.dac__access-menu__item--payment',
  },

  events: {
    'click @ui.menuRequestReinstatement': 'clickMenuReinstatement',
    'click @ui.menuEvidence': 'clickMenuEvidence',
    'click @ui.menuRecordService': 'clickMenuRecordService',
    'click @ui.menuUpdateContact': 'clickMenuUpdateContact',
    'click @ui.menuRequestAmendment': 'clickMenuRequestAmendment',
    'click @ui.menuRequestCorrection': 'clickMenuRequestCorrection',
    'click @ui.menuRequestClarification': 'clickMenuRequestClarification',
    'click @ui.menuRequestSubServ': 'clickMenuSubServ',
    'click @ui.menuRequestReview': 'clickMenuRequestReview',
    'click @ui.menuRequestReviewPayment': 'clickMenuReviewPayment',
    'click @ui.menuPayment': 'clickMenuPayment',
  },

  clickMenuReinstatement() {
    Backbone.history.navigate('reinstate/service/list', { trigger: true });
  },

  clickMenuEvidence() {
    Backbone.history.navigate('evidence', {trigger: true});
  },

  clickMenuRecordService() {
    Backbone.history.navigate('notice/service/list', { trigger: true });
  },

  clickMenuUpdateContact() {
    Backbone.history.navigate('update/contact', { trigger: true });
  },

  clickMenuRequestAmendment() {
    Backbone.history.navigate('amendment', { trigger: true });
  },

  clickMenuRequestCorrection() {
    Backbone.history.navigate('correction', { trigger: true });
  },

  clickMenuRequestClarification() {
    Backbone.history.navigate('clarification', { trigger: true });
  },

  clickMenuSubServ() {
    Backbone.history.navigate('substituted-service', { trigger: true });
  },

  clickMenuRequestReview() {
    this.model.clearReceiptData();
    Backbone.history.navigate('review/step1', { trigger: true });
  },

  clickMenuReviewPayment() {
    this.model.clearReceiptData();
    Backbone.history.navigate('review-pay', { trigger: true });
  },

  clickMenuPayment(ev) {
    const ele = $(ev.currentTarget);
    const disputeFeeId = ele.data('feeId');
    if (!disputeFeeId) {
      alert("Invalid fee");
      return;
    }
    Backbone.history.navigate(`#pay/${disputeFeeId}`, { trigger: true });
  },

  onRender() {
    const hearing = hearingChannel.request('get:latest');
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));

    
    const dispute = disputeChannel.request('get');
    const hearingLinkType = hearing ? hearing.getHearingLinkType() : null;
    const flags = flagsChannel.request('get');
    const reviewFlags = flags.filter((flag) => flag.isReview() && flag.isActive());
    const disputeParticipants = participantsChannel.request('get:all:participants');

    if (!this.model.get('reviewNotificationDisplayed')) {
      this.model.set({ reviewNotificationDisplayed: true });
      flagsChannel.request('show:review:notification', reviewFlags, disputeParticipants, hearingLinkType, dispute)
        .finally(() => this.checkAndShowEmailVerification());
    } else {
      this.checkAndShowEmailVerification();
    }
  },

  checkAndShowEmailVerification() {
    const dispute = disputeChannel.request('get');
    if (this.model.get('emailVerificationDisplayed')) return;
    const loggedInParticipantId = disputeChannel.request('get').get('tokenParticipantId');
    const activeParticipant = participantsChannel.request('get:participant', loggedInParticipantId);
    if (dispute?.get('disputeAccessOpen') && !activeParticipant.get('email_verified') && activeParticipant.get('email')) {
      modalChannel.request('add', new ModalEmailVerification({ participantSaveModel: ExternalParticipantModel, participant: activeParticipant, fetchParticipantAfterVerification: false }));
    }
    this.model.set({ emailVerificationDisplayed: true });
  },

  showSecondaryDisputeWarning() {
    const dispute = disputeChannel.request('get');
    const hearing = hearingChannel.request('get:latest');

    if (!hearing) return false;
    return !hearing.checkIsDisputePrimaryLink(dispute);//if not primary then display warning
  },

  /**
   * Will display menu options based on variables:
   * canUploadEvidence
   * canUpdateContactInfo
   * canRecordServiceOfNotice
   * canRequestCorrection
   * canRequestClarification
   * canRequestReview
   * canRequestSubServ
   */
  getAccessMenuOptionsTemplateData() {
    const dispute = disputeChannel.request('get');
    const notice = noticeChannel.request('get:active');
    const isDisputeOpen = dispute.get('disputeAccessOpen');
    const payableFees = (paymentsChannel.request('get:fees') || []).filter(fee => {
      const isUnpaidActiveFee = fee.isActive() && !fee.isPaid();
      const isAssociatedToUser = fee.get('payor_id') === dispute.get('tokenParticipantId');
      const hasCorrectSSPO = fee.isIntakeFee() ? dispute.checkStageStatus(0, [2,3,4,6]): true;
      return !fee.isReviewFee() && isUnpaidActiveFee && isAssociatedToUser && hasCorrectSSPO;
    });
    const canMakePayment = isDisputeOpen && payableFees.length;
    const showSecondaryDisputeWarning = this.showSecondaryDisputeWarning();
    
    const templateDate = {
      Formatter,
      dispute,
      notice,
      canRequestReinstatement: accessChannel.request('external:reinstatement'),
      canUploadEvidence: accessChannel.request('external:evidence'),
      canUpdateContactInfo: accessChannel.request('external:contact'),
      canRequestAmendment: accessChannel.request('external:amendment'),
      canRecordServiceOfNotice: accessChannel.request('external:notice'),
      canRequestCorrection: accessChannel.request('external:correction'),
      canRequestClarification: accessChannel.request('external:clarification'),
      canRequestReview: accessChannel.request('external:review'),
      canRequestReviewPayment: accessChannel.request('external:review:payment'),
      canRequestSubServ: accessChannel.request('external:subserv', dispute.get('tokenParticipantId')),
      canMakePayment,
      payableFees,
      reviewFeeAmount: configChannel.request('get', 'PAYMENT_FEE_AMOUNT_REVIEW'),
      showSecondaryDisputeWarning,
      showArsDeadlineWarning: ApplicantRequiredService.externalLogin_hasUpcomingArsDeadline(dispute, notice),
      showArsReinstatementDeadlineWarning: ApplicantRequiredService.externalLogin_hasUpcomingArsReinstatementDeadline(dispute, notice),
      showIVDAlert: ApplicantViewDispute.isIvdEnabled(),
      intakeUrl: configChannel.request('get', 'INTAKE_URL')
    };

    templateDate.hasMenuActions = _.any(_.pick(templateDate, ['canUploadEvidence', 'canRecordServiceOfNotice', 'canUpdateContactInfo',
        'canRequestCorrection', 'canRequestClarification', 'canRequestSubServ', 'canRequestReview', 'canRequestReviewPayment', 'canMakePayment']));

    return templateDate;
  },

  templateContext() {
    return Object.assign({}, this.getAccessMenuOptionsTemplateData());
  }

});
