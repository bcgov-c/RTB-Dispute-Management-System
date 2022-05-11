import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import QuickDismiss from './QuickDismiss';
import QuickStatus from '../status/QuickStatus';
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

const disputeChannel = Radio.channel('dispute');
const statusChannel = Radio.channel('status');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'quickAccess_modal',

  regions: {
    dismissTypesRegion: '.quickaccess-dismiss__type',
    quickstatusRegion: '.quickaccess-option__quickstatuses'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.quickaccess-option__row__button'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave'
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) return;

    const selectedOption = this.dismissTypesModel.getSelectedOption() || {};
    if (!selectedOption && _.isFunction(selectedOption._actionFunction)) alert("Invalid Quick Access dismiss configuration.");
    else selectedOption._actionFunction();
  },

  showConfirmationModal(modalData) {
    this.$el.hide();
    const modalView = modalChannel.request('show:standard', Object.assign({
      id: 'quickDismissConfirm_modal',
      onContinueFn: (_modalView) => _modalView.trigger('perform:action')
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

    this.listenTo(modalView, 'perform:action', () => {
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
          <li><span>On the current (latest) hearing, all participants will be set to "No Participation", the hearing duration will be set to "10 minutes", the hearing method to "Adjudication", and the hearing complexity to "Simple"</span></li>
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
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication"</span></li>
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
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication"</span></li>
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
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication"</span></li>
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
          <li><span>On the current (latest) hearing, the hearing method will be set to "Adjudication"</span></li>
        </ul>
      </div>`,
      () => this.dismissHelper.performDismissIssuesNoLeave()
    );
  },


  /* Add API functionality to remove dispute */
  loadDisputePromise() {
    return;
  },

  initialize(options) {
    this.mergeOptions(options, ['quickStatusOnly']);
    
    this.dismissHelper = new QuickDismiss();
    this.dismissStageStatusGroups = [
      [8, [80, 81]],
      [10, [100, 101]]
    ];
    this.enableQuickDismiss = !this.quickStatusOnly;
    
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

  validateAndShowErrors() {
    let isValid = true;
    const view = this.getChildView('dismissTypesRegion');
    if (view && view.isRendered()) isValid = view.validateAndShowErrors();
    return isValid;
  },

  onRender() {
    this.showChildView('quickstatusRegion', new QuickStatus({ collection: this.quickStatusCollection }));

    if (this.enableQuickDismiss) {
      this.showChildView('dismissTypesRegion', new DropdownView({ model: this.dismissTypesModel }));
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
      quickStatusAllowed: this.quickStatusCollection.length,
      quickDismissAllowed: this.dismissStageStatusGroups.some(stageStatusGroup => this.model.checkStageStatus(stageStatusGroup[0], stageStatusGroup[1]))
    };
  }
});
