import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from './OfficeTopSearch';
import ModalAccessCodeLookup from './modal-access-code-lookup/ModalAccessCodeLookup';
import ApplicantRequiredService from '../../../core/components/service/ApplicantRequiredService';
import template from './OfficeMainPage_template.tpl';

const INSTRUCTIONS_TEXT = 'To see menu options, select a file type and provide any required information';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const paymentsChannel = Radio.channel('payments');
const accessChannel = Radio.channel('access');
const modalChannel = Radio.channel('modals');
const hearingChannel = Radio.channel('hearings');
const flagsChannel = Radio.channel('flags');
const Formatter = Radio.channel('formatter').request('get');
const sessionChannel = Radio.channel('session');
const noticeChannel = Radio.channel('notice');

export default PageView.extend({
  template,

  ui: {
    menuCreate: '.da-access-menu-create',
    menuComplete: '.da-access-menu-complete',
    menuUpdateCreated: '.da-access-menu-update-created',
    menuPayment: '.da-access-menu-payment',
    menuFeeWaiver: '.da-access-menu-fee-waiver',
    menuSubstitute: '.da-access-menu-substitute',
    menuAmendment: '.da-access-menu-amendment',
    menuReview: '.da-access-menu-review',
    menuCorrection: '.da-access-menu-correction',
    menuClarification: '.da-access-menu-clarification',
    menuPickup: '.da-access-menu-pickup',
    menuRecoveryAccessCode: '.da-access-menu-access-code',
    menuViewAccessCode: '.office-view-access-code',

    menuDaUpdateContact: '.da-access-menu--da-contact',
    menuDaReinstatement: '.da-access-menu--da--reinstatement',
    menuDaUploadEvidence: '.da-access-menu--da-evidence',
    menuDaProofNoticeService: '.da-access-menu--da-notice-pos',
  },

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    disputeRegion: '.da-access-overview-container'
  },

  events: {
    'click @ui.menuCreate': 'clickMenuCreate',
    'click @ui.menuComplete': 'clickMenuCompleteDispute',
    'click @ui.menuUpdateCreated': 'clickMenuUpdateCreatedDispute',
    'click @ui.menuPayment': 'clickMenuPayment',
    'click @ui.menuFeeWaiver': 'clickMenuFeeWaiver',
    'click @ui.menuSubstitute': 'clickMenuSubstitute',
    'click @ui.menuAmendment': 'clickMenuAmendment',
    'click @ui.menuReview': 'clickMenuReview',
    'click @ui.menuCorrection': 'clickMenuCorrection',
    'click @ui.menuClarification': 'clickMenuClarification',
    'click @ui.menuPickup': 'clickMenuPickup',
    'click @ui.menuRecoveryAccessCode': 'clickMenuAccessCodeRecovery',
    'click @ui.menuViewAccessCode': 'clickViewAccessCode',
    
    'click @ui.menuDaUpdateContact': function() { this.clickDaLink('EXTERNAL_DA_ACTION_CONTACT'); },
    'click @ui.menuDaReinstatement': function() { this.clickDaLink('EXTERNAL_DA_ACTION_REINSTATEMENT'); },
    'click @ui.menuDaUploadEvidence': function() { this.clickDaLink('EXTERNAL_DA_ACTION_EVIDENCE'); },
    'click @ui.menuDaProofNoticeService': function() { this.clickDaLink('EXTERNAL_DA_ACTION_NOTICE'); }
  },

  clickDaLink(daActionConfig) {
    const dispute = disputeChannel.request('get');
    const accessCode = dispute?.get('_routingAccessCode');
    if (!accessCode) {
      this.showModalNoAccessCodeExternal();
      return;
    }
    const daActionId = configChannel.request('get', daActionConfig);
    const extSiteId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_OFFICE');
    const submitterName = configChannel.request('get', 'RTB_STAFF_USERNAME_DISPLAY');
    sessionChannel.trigger('redirect:disputeAccess', accessCode, daActionId, extSiteId, submitterName);
  },

  showModalNoAccessCodeExternal() {
    modalChannel.request('show:standard', {
      title: 'Access Code Required',
      bodyHtml: `<p>You have requested a feature that requires the user's Access Code.  To use this feature, you must search for the file using the Access Code option and not the File Number option.</p>
      <ul>
        <li>At the top of the submissions page - select the 'File Identifier' option 'Dispute Access Code', enter the user's Access Code and click 'Update'.</li>
        <li>When the menu of options refreshes, click on the feature option again.</li>
        <li>The system will use the Dispute Access Code to connect you automatically to the requested feature.</li>
      </ul>`,
      id: 'accessCodeExternal_modal',
      hideCancelButton: true,
      primaryButtonText: 'Close',
      onContinueFn(modal) { modal.close(); }
    });
  },

  clickMenuCreate() {
    Backbone.history.navigate(`new`, { trigger: true });
  },

  clickMenuCompleteDispute() {
    Backbone.history.navigate(`#new/2`, { trigger: true });
  },

  clickMenuUpdateCreatedDispute() {
    Backbone.history.navigate(`#new/2`, { trigger: true });
  },

  _getFirstUnpaidDisputeFeeId() {
    const disputeFees = paymentsChannel.request('get:fees');
    const firstUnpaidDisputeFee = disputeFees.getFirstUnpaidActiveFee();
    return firstUnpaidDisputeFee ? firstUnpaidDisputeFee.id : null;
  },

  clickMenuPayment() {
    const disputeFeeId = this._getFirstUnpaidDisputeFeeId();
    if (!disputeFeeId) {
      alert("[Error] No unpaid dispute fee found.  Payment should not be selectable.");
      this.render();
      return;
    }
    Backbone.history.navigate(`#pay/${disputeFeeId}`, { trigger: true });
  },

  clickMenuFeeWaiver() {
    const disputeFeeId = this._getFirstUnpaidDisputeFeeId();
    if (!disputeFeeId) {
      alert("[Error] No unpaid dispute fee found.  Fee Waiver should not be selectable.");
      this.render();
      return;
    }
    Backbone.history.navigate(`#pay/waiver/${disputeFeeId}`, { trigger: true });
  },

  clickMenuSubstitute() {
    const dispute = disputeChannel.request('get');
    const accessCode = dispute.get('accessCode');
    if (!accessCode) {
      this.showModalNoAccessCodeExternal();
      return;
    }
    Backbone.history.navigate(`#substituted-service`, { trigger: true });
  },

  clickMenuAmendment() {
    Backbone.history.navigate(`#amendment`, { trigger: true });
  },

  clickMenuReview() {
    Backbone.history.navigate(`#review`, { trigger: true });
  },

  clickMenuCorrection() {
    Backbone.history.navigate(`#correction`, { trigger: true });
  },

  clickMenuClarification(){
    Backbone.history.navigate(`#clarification`, { trigger: true });
  },

  clickMenuPickup() {
    Backbone.history.navigate('#pickup', { trigger: true });
  },
  
  clickMenuAccessCodeRecovery() {
    const accessCodeRecoveryUrl = `${configChannel.request('get', 'DISPUTE_ACCESS_URL')}#recovery`;
    const winTab = window.open(accessCodeRecoveryUrl, '_blank');
      winTab.opener = null;
  },

  clickViewAccessCode() {
    const modalAccessCodeLookup = new ModalAccessCodeLookup();
    modalChannel.request('add', modalAccessCodeLookup);
    
    this.listenTo(modalAccessCodeLookup, 'login:participant', (participant, participantType) => {
      const dispute = disputeChannel.request('get');
      dispute.set({
        accessCode: participant.get('access_code'),
        tokenParticipantId: participant.get('participant_id'),
        _routingAccessCode: participant.get('_access_code'),
      });
      const topSearchModel = this.model.getOfficeTopSearchModel();
      const ACCESS_CODE_FILE_IDENTIFIER_CODE = '2';
      topSearchModel.setToAccessCodeLookupState(ACCESS_CODE_FILE_IDENTIFIER_CODE, participantType, participant.get('access_code'));
      this.render();
    })
  },

  initialize() {
    this.dispute_loaded = false;
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', this.render, this);
    this._refreshLoadedDispute();
  },

  _refreshLoadedDispute() {
    this.dispute_loaded = false;
    const dispute = disputeChannel.request('get');
    const onLoadFinishFn = _.bind(function() {
      this.dispute_loaded = true;
      this.render();
      loaderChannel.trigger('page:load:complete');
    }, this);

    if (!dispute) {
      onLoadFinishFn();
      return;
    }

    loaderChannel.trigger('page:load');

    setTimeout(() => {
      const loadPromise = dispute.get('_routingAccessCode') ? this.model.performAccessCodeSearch(dispute.get('_routingAccessCode')) : this.model.performFileNumberSearch(dispute.get('file_number'));
      loadPromise.always(() => {
        onLoadFinishFn();
      });
    }, 25);
    
  },

  onRender() {
    if (!this.dispute_loaded) {
      return;
    }
    const officeTopSearchModel = this.model.getOfficeTopSearchModel();
    this.showChildView('topSearchRegion', new OfficeTopSearchView({ model: officeTopSearchModel }));

    const dispute = disputeChannel.request('get');
    if (dispute) {
      this.showChildView('disputeRegion', new OfficeDisputeOverview({ model: this.model }));
      if (officeTopSearchModel.isFileTypeExistingSelected()) {
        const hearing = hearingChannel.request('get:latest');
        const dispute = disputeChannel.request('get');
        const hearingLinkType = hearing ? hearing.getHearingLinkType() : null;
        const flags = flagsChannel.request('get');
        const reviewFlags = flags.filter((flag) => flag.isReview() && flag.isActive());
        const disputeParticipants = participantsChannel.request('get:all:participants');

        if (!officeTopSearchModel.get('reviewNotificationDisplayed')) {
          flagsChannel.request('show:review:notification', reviewFlags, disputeParticipants, hearingLinkType, dispute);
          officeTopSearchModel.set({ reviewNotificationDisplayed: true });
        }
      }
    }
  },

  _isAccessCodeSearchFromRespondent(dispute) {
    if (!dispute) {
      return;
    }
    const participantId = dispute.get('tokenParticipantId');
    const participantModel = participantId ? participantsChannel.request('get:participant', participantId): null;
    return participantModel && participantModel.isRespondent();
  },

  /**
   * Will display menu options based on variables:
   * canCreateDispute
   * canCompleteDispute
   * canUpdateCreatedDispute
   * canRecordPayment
   * canRecordFeeWaiver
   * canRequestSubstituteService
   * canRequestAmendment
   * canRequestReview
   * canRequestCorrection
   * canRequestClarification
   * 
   * DA menu requests
   * canDaUpdateContactInfo
   * canDaUploadEvidence
   * canDaRecordServiceOfNotice
   */
  getOfficeMenuOptionsTemplateData() {
    const dispute = disputeChannel.request('get');
    const isRespondentAccessCodeSearch = this._isAccessCodeSearchFromRespondent(dispute);
    const disputeFees = paymentsChannel.request('get:fees');
    const firstUnpaidDisputeFee = disputeFees.getFirstUnpaidActiveFee();
    const firstUnpaidDisputeFeeHasDeclinedFeeWavier = firstUnpaidDisputeFee && firstUnpaidDisputeFee.hasDeclinedFeeWaiver();
    const _canRecordPayments = dispute && firstUnpaidDisputeFee;
    const participantId = dispute ? dispute.get('tokenParticipantId') : null;
    const officeTopSearchModel = this.model.getOfficeTopSearchModel();
    const isFileNumberSearch = dispute ? !dispute.get('accessCode') && officeTopSearchModel._isFileNumberIdentifierSelected() : false;
    const disputeAccessUrl = `${configChannel.request('get', 'DISPUTE_ACCESS_URL')}#recovery`;
    const reviewFees = disputeFees.filter(f => f.isReviewFee() && f.get('payor_id') === participantId && participantId);
    const isReviewFeePaid = reviewFees.length ? reviewFees[0].isPaid() : false;
    const notice = noticeChannel.request('get:active');

    const templateData = {
      Formatter,
      dispute,
      notice,
      canCreateDispute: dispute && dispute.isNew(),
      canCompleteDispute: dispute && dispute.checkStageStatus(0, 5),
      canUpdateCreatedDispute: dispute && dispute.checkStageStatus(0, 6),
      canRecordPayment: _canRecordPayments,
      canRecordFeeWaiver: dispute && _canRecordPayments && !firstUnpaidDisputeFeeHasDeclinedFeeWavier && firstUnpaidDisputeFee.isPayorTenant(),
      canRequestAmendment: !isRespondentAccessCodeSearch && accessChannel.request('office:amendment'),
      canRequestSubstituteService: accessChannel.request('office:subservice', participantId),
      canRequestCorrection: accessChannel.request('office:correction'),
      canRequestClarification: accessChannel.request('office:clarification'),
      canRequestReview: accessChannel.request('office:review'),
      canDaUpdateContactInfo: accessChannel.request('external:contact'),
      canDaUploadEvidence: accessChannel.request('external:evidence'),
      canDaRecordServiceOfNotice: accessChannel.request('external:notice'),
      canRequestPickup: accessChannel.request('office:pickup'),
      canDaRequestReinstatement: accessChannel.request('external:reinstatement'),
      feeAmountDisplay: firstUnpaidDisputeFee ? Formatter.toAmountDisplay(firstUnpaidDisputeFee.get('amount_due'), true) : null,
      feeTypeDisplay: firstUnpaidDisputeFee ? Formatter.toFeeTypeDisplay(firstUnpaidDisputeFee.get('fee_type')) : null,
      canRequestAccessCodeRecovery: accessChannel.request('office:recovery'),
      INTAKE_FEE_AMOUNT_DISPLAY: Formatter.toAmountDisplay(configChannel.request('get', 'PAYMENT_FEE_AMOUNT_INTAKE'), true),
      REVIEW_FEE_AMOUNT_DISPLAY: Formatter.toAmountDisplay(configChannel.request('get', 'PAYMENT_FEE_AMOUNT_REVIEW'), true),
      showArsDeadlineWarning: ApplicantRequiredService.externalLogin_hasUpcomingArsDeadline(dispute, notice),
      showArsReinstatementDeadlineWarning: ApplicantRequiredService.externalLogin_hasUpcomingArsReinstatementDeadline(dispute, notice),
      isReviewFeePaid,
    };

    const hasMenuActions = _.any(_.pick(templateData, [
      'canCreateDispute', 'canCompleteDispute', 'canUpdateCreatedDispute', 'canRecordPayment', 'canRecordFeeWaiver', 'canRequestSubstituteService',
      'canRequestAmendment', 'canRequestReview', 'canRequestCorrection', 'canRequestClarification',
      'canDaUpdateContactInfo', 'canDaUploadEvidence', 'canDaRecordServiceOfNotice', 'canRequestAccessCodeRecovery', 'canRequestPickup'
    ]));

    const showExternalLinkMsg = _.any(_.pick(templateData, ['canDaUpdateContactInfo', 'canDaRecordServiceOfNotice', 'canDaUploadEvidence', 'canRequestAccessCodeRecovery']))

    templateData.hasMenuActions = hasMenuActions;
    templateData.showExternalLinkMsg = showExternalLinkMsg;
    templateData.isFileNumberSearch = isFileNumberSearch;
    templateData.disputeAccessUrl = disputeAccessUrl;

    return templateData;
  },

  templateContext() {
    return Object.assign({}, this.getOfficeMenuOptionsTemplateData(), {
      instructionsText: INSTRUCTIONS_TEXT,
      hideDisputeOverview: !!this.model.getOfficeTopSearchModel().isFileTypeNewSelected(),
      
    });
  }

});
