import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import ExternalPaymentTransactionModel from '../../components/external-api/ExternalPaymentTransaction_model';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import ExternalDisputeInfoModel from '../../components/external-api/ExternalDisputeInfo_model';
import InputView from '../../../core/components/input/Input';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import ParticipantModel from '../../../core/components/participant/Participant_model';
import OfficePaymentsMixin from '../../components/payments/OfficePaymentMixin';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import pageTemplate from './OfficePaymentPage_template.tpl';
import receiptTemplate from './OfficePaymentReceiptContent_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const RECEIPT_TITLE = 'Payment';

const emailsChannel = Radio.channel('emails');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const OfficePaymentPageView = PageView.extend({
  template: pageTemplate,
  className: `${PageView.prototype.className} office-page-payment`,

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    disputeRegion: '.da-access-overview-container',
    payorNameRegion: '.office-payment-name',
    paymentAmountRegion: '.office-payment-amount',
    paymentMethodRegion: '.office-payment-method',
    receiptContainerRegion: '.office-page-receipt-container',
  },

  ui: {
    submit: '.btn-continue',
    cancel: '.btn-cancel',
    logout: '.office-receipt-logout',
  },

  events: {
    'click @ui.cancel': 'clickCancel',
    'click @ui.submit': 'clickSubmit',
    'click @ui.logout': 'clickLogout'
  },

  clickCancel() {
    Backbone.history.navigate('main', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  clickSubmit() {
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const self = this;
    loaderChannel.trigger('page:load');
    const newPaymentTransaction = this.disputeFeeModel.createPayment({
      payment_verified: 1,
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_OFFICE'),
      transaction_amount: this.disputeFeeModel.get('amount_due'),
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED'),
      payment_note: `Payor name: ${this.payorModel.getData()}, Payment method: ${this.paymentMethodModel.getSelectedText()}`,
      office_payment_idir: this.currentUser ? this.currentUser.getUsername() : null,
    }, { no_save: true });
    
    (new ExternalPaymentTransactionModel(newPaymentTransaction.toJSON())).save().done(function(response) {
      const dispute = disputeChannel.request('get');
      // The response is actually a dispute fee, so save that back onto the fee used
      self.disputeFeeModel.set(self.disputeFeeModel.parse(response), { silent: true });
      self.receiptData = self.generateReceiptData( self.disputeFeeModel.getActivePayment() );
      self.renderAsReceipt = true;

      const statusSaveModel = new ExternalDisputeStatusModel({ file_number: dispute.get('file_number'), dispute_stage: 2, dispute_status: 20 });
      const statusUpdatePromise = dispute.checkStageStatus(0, [2, 3, 4]) ?
        _.bind(statusSaveModel.save, statusSaveModel) :
        () => $.Deferred().resolve().promise();
        
      statusUpdatePromise().done(function() {
        (new ExternalDisputeInfoModel( dispute.toJSON() )).checkAndUpdateInitialPayment({
          initial_payment_by: dispute.get('tokenParticipantId') || participantsChannel.request('get:primaryApplicant:id'),
          initial_payment_method: configChannel.request('get', 'PAYMENT_METHOD_OFFICE'),
        })
        .done(() => self._refreshDisputeStateThenShowReceipt(dispute))
        .fail(
          generalErrorFactory.createHandler('OS.STATUS.SAVE', () => self._refreshDisputeStateThenShowReceipt(dispute), `Payment recorded successfully, but there was an issue updating the dispute data and dispute status after the payment was recorded.`)
        );
      }).fail(
        generalErrorFactory.createHandler('OS.DISPUTE.SAVE', () => self._refreshDisputeStateThenShowReceipt(dispute), `Payment recorded successfully, but there was an issue updating the dispute data after the payment was recorded.`)
      );

    }).fail(() => {
      const dispute = disputeChannel.request('get');
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => self._refreshDisputeStateThenShowReceipt(dispute));
    });
  },

  _refreshDisputeStateThenShowReceipt(disputeModel) {
    const fileNumber = disputeModel.get('file_number');
    const self = this;
    this.model.performFileNumberSearch(fileNumber).always(function() {
      self.render();
      loaderChannel.trigger('page:load:complete');
      Backbone.history.navigate('payment-receipt', { trigger: false });
    });
  },

  generateReceiptData(paymentTransactionModel) {
    return [
      { label: 'File number', value: disputeChannel.request('get:filenumber') },
      { label: 'Payment date', value: Formatter.toDateDisplay(Moment()) },
      { label: 'Payment ID', value: paymentTransactionModel.get('payment_transaction_id') },
      { label: 'Payment for', value: this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : '-' },
      { label: 'Payment by', value: this.payorModel.getData() },
      { label: 'Payment amount', value: Formatter.toAmountDisplay(paymentTransactionModel.get('transaction_amount')) },
      { label: 'Payment method', value: `Office, ${$.trim(this.paymentMethodModel.getSelectedText())}` }
    ];
  },

  initialize(options) {
    this.mergeOptions(options, ['disputeFeeId']);
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.disputeFeeId = this.disputeFeeId ? Number(this.disputeFeeId) : null;
    this.disputeFeeModel = paymentsChannel.request('get:fees').findWhere({ dispute_fee_id: this.disputeFeeId });
    this.currentUser = sessionChannel.request('get:user');
    this.renderAsReceipt = false;
    this.receiptData = [];
    this.submissionReceiptSent = false;

    if (!this.disputeFeeModel || this.disputeFeeModel.isPaid()) {
      console.log(`[Error] Loaded payment page with no active unpaid dispute fee`);
      Backbone.history.navigate('main', { trigger: true, replace: true });
      return;
    }

    //this.createSubModels();
    this.mixin_officePayments_createSubModels();

    this.setupListeners();

    this.editGroup = ['payorNameRegion', 'paymentAmountRegion', 'paymentMethodRegion'];
  },

  setupListeners() {
    // If a new search occurs, load the dispute menu
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);
  },


  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    const amountValue = Number(this.paymentAmountModel.getData());
    if (amountValue && Number(this.disputeFeeModel.get('amount_due')) !== amountValue) {
      is_valid = false;
      const view = this.getChildView('paymentAmountRegion');
      if (view) {
        view.showErrorMessage('Payment amount must match the amount due');
      }
    }

    return is_valid;
  },

  onBeforeRender() {
    if (!this.submissionReceiptSent && this.renderAsReceipt) {
      this.submissionReceiptSent = true;
      const primaryApplicant = participantsChannel.request('get:primaryApplicant');
      emailsChannel.request('save:receipt', {
        participant_id: primaryApplicant ? primaryApplicant.id : null,
        receipt_body: this.receiptPageHtml(),
        receipt_title: RECEIPT_TITLE,
        receipt_type: configChannel.request('get', 'RECEIPT_TYPE_OFFICE_SUBMISSION'),
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_PAYMENT'),
      });
    }
  },

  onRender() {
    const dispute = disputeChannel.request('get');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');

    this.showChildView('topSearchRegion', new OfficeTopSearchView({ model: this.model.getOfficeTopSearchModel() }));
    this.showChildView('disputeRegion', new OfficeDisputeOverview({ model: this.model }));
    this.showChildView('payorNameRegion', new InputView({ model: this.payorModel }));
    this.showChildView('paymentAmountRegion', new InputView({ model: this.paymentAmountModel }));
    this.showChildView('paymentMethodRegion', new DropdownView({ model: this.paymentMethodModel }));

    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      emailUpdateParticipantId: primaryApplicant ? primaryApplicant.id : null,
      autoSendEmail: false,
      participantSaveModel: this.currentUser && this.currentUser.isOfficeUser() ? ExternalParticipantModel : ParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_PAYMENT')
    }));
  },

  receiptPageHtml() {
    return receiptTemplate({ receiptTitle: RECEIPT_TITLE, receiptData: this.receiptData });
  },

  templateContext() {
    return {
      paymentTypeDisplay: this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : null,
      paymentAmountDisplay: this.disputeFeeModel ? Formatter.toAmountDisplay(this.disputeFeeModel.get('amount_due'), true) : null,
      renderAsReceipt: this.renderAsReceipt,
    };
  }
});

_.extend(OfficePaymentPageView.prototype, OfficePaymentsMixin);
export default OfficePaymentPageView;
