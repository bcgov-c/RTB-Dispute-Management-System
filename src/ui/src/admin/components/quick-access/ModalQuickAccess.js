/**
 * @fileoverview - Modal that contains SSPO changes in the form of one click actions
 */
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import QuickDismiss from './QuickDismiss';
import QuickStatus from '../status/QuickStatus';
import ModalInHearingCross from './modal-in-hearing-cross/ModalInHearingCross';
import ModalHearingReschedule from '../hearing/modals/modal-reschedule-hearing/ModalHearingReschedule';
import { routeParse } from '../../routers/mainview_router';
import ViewMixin from '../../../core/utilities/ViewMixin';
import template from './ModalQuickAccess_template.tpl';

const APPLICANT_NO_SHOW_CODE = '1';
const DOUBLE_NO_SHOW_CODE = '2';
const NO_NOTICE_SERVICE_CODE = '3';
const ISSUES_ONLY_WITH_LEAVE_CODE = '4';
const ISSUES_ONLY_WITHOUT_LEAVE_CODE = '5';

const MODAL_CONFIRMATION_DISMISS_TITLE = 'Confirm Quick Dismiss';
const MODAL_CONFIRMATION_HTML = `I confirm the above actions on this file. I understand that I need to upload my finished decision, complete prep time, writing time, and all other required fields based on the associated process.`;
const MODAL_CONFIRMATION_BUTTON_TEXT = `Apply QuickDismiss`;

const NO_MATCHING_DISPUTE_ERROR = 'No matching dispute';
const SAME_FILE_NUMBER_ERROR = 'Enter different file number than currently loaded dispute';

const disputeChannel = Radio.channel('dispute');
const statusChannel = Radio.channel('status');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const hearingChannel = Radio.channel('hearings');
const menuChannel = Radio.channel('menu');
const searchChannel = Radio.channel('searches');
const sessionChannel = Radio.channel('session');

export default ModalBaseView.extend({
  template,
  id: 'quickAccess_modal',

  regions: {
    dismissTypesRegion: '.quickaccess-dismiss__type',
    inHearingCrossRegion: '.quickaccess-dismiss__hearing-cross',
    quickstatusRegion: '.quickaccess-option__quickstatuses',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      saveDismiss: '.quickaccess-option__row__button',
      saveHearingCross: '.quickaccess-option__hearing-cross__row__button',
      hearingReschedule: '.quickaccess-option__hearing-reschedule__row__button',
      linkedFiles: '.quickaccess-linked-files-save'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.saveDismiss': 'clickDismiss',
      'click @ui.linkedFiles': 'clickLinkedFiles',
      'click @ui.saveHearingCross': 'clickHearingCrossSearch',
      'click @ui.hearingReschedule': 'clickHearingReschedule'
    });
  },

  clickDismiss() {
    if (!this.validateDismissAndShowErrors()) return;

    const selectedOption = this.dismissTypesModel.getSelectedOption() || {};
    if (!selectedOption && _.isFunction(selectedOption._actionFunction)) alert("Invalid Quick Access dismiss configuration.");
    else selectedOption._actionFunction();
  },

  async clickHearingCrossSearch() {
    if (!this.validateHearingCrossAndShowErrors()) return;

    const fileNumber = this.inHearingCrossModel.getData();

    try {
      loaderChannel.trigger('page:load');
      const disputeToCross = await searchChannel.request('search:dispute', fileNumber);
      const crossDisputeGuid = disputeToCross?.[0]?.dispute_guid;
      const crossedDisputeInfo = await Promise.all([disputeChannel.request('load', crossDisputeGuid, { no_cache: true }), hearingChannel.request('load', crossDisputeGuid, { no_cache: true })])
      loaderChannel.trigger('page:load:complete');
      const crossDispute = crossedDisputeInfo?.[0];
      const crossDisputeHearing = crossedDisputeInfo?.[1].getLatest();
      this.showHearingModal({ crossDispute, crossDisputeHearing });
    } catch(err) {
      $('.quickaccess-dismiss__hearing-cross .error-block').html(NO_MATCHING_DISPUTE_ERROR);
      loaderChannel.trigger('page:load:complete');
    }
  },

  clickHearingReschedule() {
    const hearing = hearingChannel.request('get:latest');
    
    this.close();
    const rescheduleHearingModal = new ModalHearingReschedule({ model: hearing, title: 'In-Hearing Reschedule', deleteAfterReschedule: true });

    modalChannel.request('add', rescheduleHearingModal);
  },

  showHearingModal(modalData={}) {
    this.$el.hide();
    const hearingCrossModal = new ModalInHearingCross(modalData);
    let actionComplete = false;
    this.listenTo(hearingCrossModal, 'removed:modal', () => {
      this.$el.show();
      if (actionComplete) {
        this.close();
        Backbone.history.loadUrl(Backbone.history.fragment);
      }
    });
    this.listenTo(hearingCrossModal, 'hearingCross:complete', () => {
      actionComplete = true;
    });
    modalChannel.request('add', hearingCrossModal);
  },

  clickLinkedFiles() {
    this.getLinkedDisputeHearings().filter(dh => !dh.isExternal()).forEach(disputeHearing => {
      menuChannel.trigger('add:dispute', disputeHearing.getFileNumber(), disputeHearing.get('dispute_guid'));
    });
    this.close();
  },

  showConfirmationModal(modalData) {
    this.$el.hide();
    const modalView = modalChannel.request('show:standard', Object.assign({
      id: 'quickDismissConfirm_modal',
      onContinueFn: (_modalView) => _modalView.trigger('hearingCross:complete')
    }, modalData));

    this.listenTo(modalView, 'removed:modal', () => {
      this.$el.show();
    });

    return modalView;
  },

  showConfirmationModalDismiss(bodyHtml, quickActionPromise=()=>{}) {
    const modalView = this.showConfirmationModal({
      title: MODAL_CONFIRMATION_DISMISS_TITLE,
      primaryButtonText: MODAL_CONFIRMATION_BUTTON_TEXT,
      bodyHtml: `${bodyHtml}<div class="modal-withdraw-body">${MODAL_CONFIRMATION_HTML}</div>`,
    });

    this.listenTo(modalView, 'hearingCross:complete', () => {
      loaderChannel.trigger('page:load');
      quickActionPromise().finally(() => {
          modalView.close();
          this.close();
          Backbone.history.loadUrl(Backbone.history.fragment);
        });
    });
    return modalView;
  },

  dismissDoubleNoShow() {
    this.showConfirmationModalDismiss(
      `<div class="quickaccess-modal__title">Double no-show</div>
      <div class="quickaccess-modal__instructions">Carefully confirm the following quick dismiss actions. They will be applied immediately.</div>
      <div class="modal-withdraw-body">
        <ul class="sublist">
          <li><span>All issues except recovery of filing fee will be set to dismissed <b>with</b> leave to re-apply</span></li>
          <li><span>The recover filing fee issue will be set to dismissed <b>without</b> leave to re-apply if it exists</span></li>
          <li><span>On the current (latest) hearing, all participants will be set to "No Participation", the hearing duration will be set to "10 minutes", the hearing method to "Adjudication", and the hearing complexity to "Simple". Your prep time will be set to 30 minutes. If you want to change your prep time, you can do it manually in the Hearing tab.</span></li>
        </ul>
      </div>`,
      () => this.dismissHelper.performDismissDoubleNoShow()
    );
  },

  dismissApplicantNoShow() {
    this.showConfirmationModalDismiss(
      `<div class="quickaccess-modal__title">Applicant no-show</div>
      <div class="quickaccess-modal__instructions">Carefully confirm the following quick dismiss actions. They will be applied immediately.</div>
      <div class="modal-withdraw-body">
        <ul class="sublist">
          <li><span>All issues including recovery of filing fee will be set to dismissed <b>without</b> leave to re-apply</span></li>
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication". Your prep time will be set to 30 minutes. If you want to change your prep time, you can do it manually in the Hearing tab.</span></li>
        </ul>
        <div class="error-block warning">
          Please note: If this dispute concerns a notice to end tenancy and the tenant is the applicant who did not attend the hearing, the landlord bears the onus to prove grounds for the notice.
        </div>
      </div>`,
      () => this.dismissHelper.performDismissApplicantNoShow()
    );
  },

  dismissNoNoticeService() {
    this.showConfirmationModalDismiss(
      `<div class="quickaccess-modal__title">No notice service</div>
      <div class="quickaccess-modal__instructions">Carefully confirm the following quick dismiss actions. They will be applied immediately.</div>
      <div class="modal-withdraw-body">
        <ul class="sublist">
          <li><span>All issues except recovery of filing fee will be set to dismissed <b>with</b> leave to re-apply</span></li>
          <li><span>The recover filing fee issue will be set to dismissed <b>without</b> leave to re-apply if it exists</span></li>
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication". Your prep time will be set to 30 minutes. If you want to change your prep time, you can do it manually in the Hearing tab.</span></li>
          <li><span>The latest notice on this file and any of its amendments will be marked as not served</span></li>
        </ul>
      </div>`,
      () => this.dismissHelper.performDismissNoNoticeService()
    );
  },

  dismissIssuesWithLeave() {
    this.showConfirmationModalDismiss(
      `<div class="quickaccess-modal__title">Dismiss issues only - with leave</div>
      <div class="quickaccess-modal__instructions">Carefully confirm the following quick dismiss actions. They will be applied immediately.</div>
      <div class="modal-withdraw-body">
        <ul class="sublist">
          <li><span>All issues except recovery of filing fee will be set to dismissed <b>with</b> leave to re-apply</span></li>
          <li><span>The recover filing fee issue will be set to dismissed <b>without</b> leave to re-apply if it exists</span></li>
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication". Your prep time will be set to 30 minutes. If you want to change your prep time, you can do it manually in the Hearing tab.</span></li>
        </ul>
      </div>`,
      () => this.dismissHelper.performDismissIssuesWithLeave()
    );
  },

  dismissIssuesNoLeave() {
    this.showConfirmationModalDismiss(
      `<div class="quickaccess-modal__title">Dismiss issues only - without leave</div>
      <div class="quickaccess-modal__instructions">Carefully confirm the following quick dismiss actions. They will be applied immediately.</div>
      <div class="modal-withdraw-body">
        <ul class="sublist">
          <li><span>All issues will be set to dismissed <b>without</b> leave to re-apply</span></li>
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication". Your prep time will be set to 30 minutes. If you want to change your prep time, you can do it manually in the Hearing tab.</span></li>
        </ul>
      </div>`,
      () => this.dismissHelper.performDismissIssuesNoLeave()
    );
  },


  /* Add API functionality to remove dispute */
  loadDisputePromise() {
    return;
  },
  /**
   * @param {Boolean} quickStatusOnly - enables quick dismiss actions
   */
  initialize(options) {
    this.mergeOptions(options, ['quickStatusOnly']);
    
    this.dismissHelper = new QuickDismiss();
    this.dismissStageStatusGroups = [
      [8, [80, 81]],
      [10, [100, 101]]
    ];
    this.enableQuickDismiss = !this.quickStatusOnly;
    const dispute = disputeChannel.request('get');
    const latestHearing = hearingChannel.request('get:latest');
    this.enableInHearingCross = !this.quickStatusOnly && latestHearing?.isSingleApp() && Moment(latestHearing.get('hearing_start_datetime')).isBefore(Moment(), 'minutes')
      && dispute?.checkProcess(1) && dispute?.checkStageStatus([8, 10], [80, 81, 100, 101]);
    this.enableHearingReschedule = sessionChannel.request('is:scheduler') && dispute?.checkProcess(1) && dispute?.checkStageStatus([6]) && Moment().isAfter(Moment(latestHearing.get('hearing_start_datetime'))) && Moment().isBefore(Moment(latestHearing.get('hearing_end_datetime')));

    this.createSubModels();
    this.setupListeners();
  },
  
  createSubModels() {
    this.quickStatusCollection = new Backbone.Collection(statusChannel.request('get:rules:quickstatus', this.model));

    this.dismissTypesModel = new DropdownModel({
      optionData: [
        { value: APPLICANT_NO_SHOW_CODE, text: 'Applicant no-show', _actionFunction: () => this.dismissApplicantNoShow() },
        { value: DOUBLE_NO_SHOW_CODE, text: 'Double no-show', _actionFunction: () => this.dismissDoubleNoShow() },
        { value: NO_NOTICE_SERVICE_CODE, text: 'No notice service', _actionFunction: () => this.dismissNoNoticeService() },
        { value: ISSUES_ONLY_WITH_LEAVE_CODE, text: 'Dismiss issues only - with leave', _actionFunction: () => this.dismissIssuesWithLeave() },
        { value: ISSUES_ONLY_WITHOUT_LEAVE_CODE, text: 'Dismiss issues only - without leave', _actionFunction: () => this.dismissIssuesNoLeave() },
      ],
      required: true,
      defaultBlank: true,
      value: null,
    });

    this.inHearingCrossModel = new InputModel({
      labelText: '',
      inputType: 'dispute_number',
      maxLength: 9,
      required: true,
      value: null,
    });
  },

  setupListeners() {
    this.listenTo(this.quickStatusCollection, 'save:complete', () => {
      loaderChannel.trigger('page:load');
      setTimeout(() => {
        this.close();
        Backbone.history.loadUrl(Backbone.history.fragment);
      }, 5);
    });
    
    const dispute = disputeChannel.request('get');
    if (dispute) {
      this.stopListening(dispute, 'incomplete:items:nav');
      this.listenToOnce(dispute, 'incomplete:items:nav', () => this.close());
    }
  },

  validateDismissAndShowErrors() {
    let isValid = true;
    const view = this.getChildView('dismissTypesRegion');
    if (view && view.isRendered()) isValid = view.validateAndShowErrors();
    return isValid;
  },

  validateHearingCrossAndShowErrors() {
    const dispute = disputeChannel.request('get');
    let isValid = true;
    const view = this.getChildView('inHearingCrossRegion');
    if (view && view.isRendered()) isValid = view.validateAndShowErrors();

    if (String(dispute.get('file_number')) === this.inHearingCrossModel.getData()) {
      isValid = false;
      $('.quickaccess-dismiss__hearing-cross .error-block').html(SAME_FILE_NUMBER_ERROR);
    }

    return isValid;
  },

  getLinkedDisputeHearings() {
    const disputeFileNumber = disputeChannel.request('get')?.get('file_number');
    const latestHearing = hearingChannel.request('get:latest');
    if (!latestHearing) return;
    
    return latestHearing.getDisputeHearings()
      .filter(disputeHearing => !disputeFileNumber || disputeHearing.get('file_number') !== disputeFileNumber);
  },

  getLinkedFileNumbersDisplay() {
    if (!this.getLinkedDisputeHearings()?.length) return;
    return this.getLinkedDisputeHearings().map(dh => ` ${dh.getFileNumber()}`)?.toString();
  },

  onRender() {
    this.showChildView('quickstatusRegion', new QuickStatus({
      disputeModel: this.model,
      collection: this.quickStatusCollection
    }));

    if (this.enableQuickDismiss) {
      this.showChildView('dismissTypesRegion', new DropdownView({ model: this.dismissTypesModel }));
    }

    if (this.enableInHearingCross) {
      const view = new InputView({ model: this.inHearingCrossModel });
      this.showChildView('inHearingCrossRegion', view);
      this.listenTo(view, 'input:enter', () => this.clickHearingCrossSearch());
    }

    const dismissHelpText = `Quick Dismiss is only available in the following stage and statuses:
    <ul>${this.dismissStageStatusGroups.map(stageStatusGroup => (
      `<li>${Formatter.toStageDisplay(stageStatusGroup[0])}: ${stageStatusGroup[1].map(status => Formatter.toStatusDisplay(status)).join(', ')}</li>`
    )).join('')}</ul>`;

    ViewMixin.prototype.initializeHelp.call(this, this, dismissHelpText);
  },

  templateContext() {
    return {
      enableQuickDismiss: this.enableQuickDismiss,
      enableInHearingCross: this.enableInHearingCross,
      enableHearingReschedule: this.enableHearingReschedule,
      quickStatusAllowed: this.quickStatusCollection.length,
      quickOptionsLinkedFileNumbers: this.getLinkedFileNumbersDisplay(),
      quickDismissAllowed: this.dismissStageStatusGroups.some(stageStatusGroup => this.model.checkStageStatus(stageStatusGroup[0], stageStatusGroup[1]))
    };
  }
});
