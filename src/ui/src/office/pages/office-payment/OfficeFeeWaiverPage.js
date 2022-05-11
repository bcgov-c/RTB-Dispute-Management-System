import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import ExternalPaymentTransactionModel from '../../components/external-api/ExternalPaymentTransaction_model';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import ExternalDisputeInfoModel from '../../components/external-api/ExternalDisputeInfo_model';
import FeeWaiverModel from '../../../core/components/payments/fee-waiver/FeeWaiver_model';
import FeeWaiverView from '../../../core/components/payments/fee-waiver/FeeWaiver';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import ParticipantModel from '../../../core/components/participant/Participant_model';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import pageTemplate from './OfficeFeeWaiverPage_template.tpl';
import receiptTemplate from './OfficePaymentReceiptContent_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const RECEIPT_TITLE = 'Fee waiver payment';

const emailsChannel = Radio.channel('emails');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');

const OfficeFeeWaiverPageView = PageView.extend({
  template: pageTemplate,
  className: `${PageView.prototype.className} office-page-fee-waiver office-upload-page`,

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    disputeRegion: '.da-access-overview-container',
    feeWaiverRegion: '.office-page-fee-waiver-container',
    
    receiptContainerRegion: '.office-page-receipt-container',
  },

  ui: {
    feeWaiverContainer: '.da-upload-page-wrapper',
    feeWaiverContainerTitle: '.da-upload-page-wrapper .da-page-header-title-text',
    menu: '.btn-cancel',
    logout: '.office-receipt-logout',
  },

  events: {
    'click @ui.menu': 'clickMainMenu',
    'click @ui.logout': 'clickLogout'
  },

  clickMainMenu() {
    Backbone.history.navigate('main', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },


  initialize(options) {
    this.mergeOptions(options, ['disputeFeeId']);

    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.disputeFeeId = this.disputeFeeId ? Number(this.disputeFeeId) : null;
    this.disputeFeeModel = paymentsChannel.request('get:fees').findWhere({ dispute_fee_id: this.disputeFeeId });
    this.currentUser = sessionChannel.request('get:user');
    this.fileUploader = null;
    this.step = 1;
    this.isUpload = false;
    this.isDeclined = false;
    this.isCancel = false;
    this.renderAsReceipt = false;
    this.receiptData = [];
    this.submissionReceiptSent = false;

    if (!this.disputeFeeModel || this.disputeFeeModel.isPaid()) {
      console.log(`[Error] Loaded fee waiver page with no active unpaid dispute fee`);
      Backbone.history.navigate('main', { trigger: true, replace: true });
      return;
    }

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.feeWaiverModel = new FeeWaiverModel({ step: this.step, disputeFeeId: this.disputeFeeId });
  },

  setupListeners() {
    // If a new search occurs, load the dispute menu
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);

    this.listenTo(this.feeWaiverModel, 'upload:ready', function() {
      this.isUpload = true;
      this.render();
      this.feeWaiverModel.trigger('upload:start');
    }, this);

    this.listenTo(this.feeWaiverModel, 'upload:complete', this._onUploadComplete, this);
    this.listenTo(this.feeWaiverModel, 'lico:declined', this.saveAsDeclined, this);
    this.listenTo(this.feeWaiverModel, 'lico:approved', this.saveAsPending, this);

    this.listenTo(this.feeWaiverModel, 'cancel', function() { Backbone.history.navigate('main', { trigger: true }); });
  },


  _onUploadComplete(uploadedEvidence) {
    this.isUpload = false;

    const routeToMenuFn = function() {
      Backbone.history.navigate('main', { trigger: true, replace: true });
    };
    const routeToReceiptFn = _.bind(function(disputeModel) {
      this.receiptData = this.feeWaiverModel.generateReceiptData( this.disputeFeeModel.getActivePayment() );
      this.renderAsReceipt = true;
      this._refreshDisputeStateThenShowReceipt(disputeModel);
    }, this, disputeChannel.request('get'));

    const anyFilesUploaded = _.any(uploadedEvidence, function(disputeEvidence) {
      return disputeEvidence.getUploadedFiles().length;
    });
    const self = this;
    const upload_error_files = [];  
    _.each(uploadedEvidence, function(e) {
      upload_error_files.push( ...(e.get('files').filter(function(f) { return f.isUploadError(); })) );
    });

    if (anyFilesUploaded) {
      this.saveAsApproved().done(function() {
        self._checkAndShowFileUploadErrors(routeToReceiptFn, upload_error_files);
      }).fail(
        generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => self._checkAndShowFileUploadErrors( routeToMenuFn, upload_error_files ))
      );
    } else {
      this._checkAndShowFileUploadErrors(routeToMenuFn, upload_error_files);
    }
  },

  _refreshDisputeStateThenShowReceipt(disputeModel) {
    const fileNumber = disputeModel.get('file_number');
    const self = this;
    this.model.performFileNumberSearch(fileNumber).always(function() {
      self.render();
      loaderChannel.trigger('page:load:complete');
      Backbone.history.navigate('#payment-receipt', { trigger: false, replace: false });
    });
  },

  _checkAndShowFileUploadErrors(routingFn, upload_error_files) {
    if (!_.isEmpty(upload_error_files)) {
      filesChannel.request('show:upload:error:modal', upload_error_files, () => {
        loaderChannel.trigger('page:load');
        routingFn();
      });
    } else {
      setTimeout(routingFn, 500);
    }
  },

  _savePaymentTransaction(paymentTransactionData) {
    const dfd = $.Deferred();
    
    const newPaymentTransaction = this.disputeFeeModel.createPayment(_.extend(
      {
        payment_verified: 1,
        transaction_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
        transaction_amount: 0,
        payment_note: `Payor name: ${this.feeWaiverModel.getPayorName()}`,
        office_payment_idir: this.currentUser ? this.currentUser.getUsername() : null,
      },
      paymentTransactionData,
      this.feeWaiverModel.getStep1ApiData()
      
    ), { no_save: true });
    

    (new ExternalPaymentTransactionModel(newPaymentTransaction.toJSON())).save()
      .done(dfd.resolve)
      .fail(err => {
        // If save fails, remove payment transaction from the dispute fee
        this.disputeFeeModel.resetPaymentTransactions();
        dfd.reject(err);
      });
    return dfd.promise();
  },

  saveAsPending() {
    const dfd = $.Deferred();
    loaderChannel.trigger('page:load');
    this._savePaymentTransaction({
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_PENDING')
    })
    .done(() => dfd.resolve())
    .fail(generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => dfd.resolve()))
    .always(() => loaderChannel.trigger('page:load:complete'))
    return dfd.promise();
  },

  saveAsApproved() {
    const dfd = $.Deferred();
    const self = this;

    this._savePaymentTransaction({
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED'),
    }).done(function(response) {
      const dispute = disputeChannel.request('get');
      // The response is actually a dispute fee, so save that back onto the fee used
      self.disputeFeeModel.set(self.disputeFeeModel.parse(response), { silent: true });

      const statusSaveModel = new ExternalDisputeStatusModel({ file_number: dispute.get('file_number'), dispute_stage: 2, dispute_status: 20 });
      const statusUpdatePromise = dispute.checkStageStatus(0, [2, 3, 4]) ?
        _.bind(statusSaveModel.save, statusSaveModel) :
        () => $.Deferred().resolve().promise();
        
      statusUpdatePromise().done(function() {
        (new ExternalDisputeInfoModel( dispute.toJSON() )).checkAndUpdateInitialPayment({
          initial_payment_by: dispute.get('tokenParticipantId') || participantsChannel.request('get:primaryApplicant:id'),
          initial_payment_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
        }).done(function() {
          dfd.resolve();
        }).fail(
          generalErrorFactory.createHandler('OS.DISPUTE.SAVE', () => dfd.reject(), `Payment recorded successfully, but there was an issue updating the dispute data after the payment was recorded.`)
        );
      }).fail(
        generalErrorFactory.createHandler('OS.STATUS.SAVE', () => dfd.reject(), `Payment recorded successfully, but there was an issue updating the dispute data and dispute status after the payment was recorded.`)
      );
    }).fail(
      generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => dfd.reject())
    );

    return dfd.promise();
  },

  saveAsDeclined() {
    const dfd = $.Deferred();
    const self = this;
    return this._savePaymentTransaction({
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_REJECTED'),
    }).done(function() {
      dfd.resolve();
    }).fail(
      generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => dfd.reject())
    ).always(function() {
      self.feeWaiverModel.trigger('transition:declined');
      loaderChannel.trigger('page:load:complete');
    });
  },

  showErrorMessage(error_msg) {
    this.getUI('error').html(error_msg);
  },

  hideErrorMessage() {
    this.getUI('error').html('');
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
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_OFFICE_FEE_WAIVER'),
      });
    }
  },

  onRender() {
    const dispute = disputeChannel.request('get');
    
    if (!this.isUpload) {
      this.showChildView('topSearchRegion', new OfficeTopSearchView({ model: this.model.getOfficeTopSearchModel() }));
      this.showChildView('disputeRegion', new OfficeDisputeOverview({ model: this.model }));
    }

    if (!this.renderAsReceipt) {
      this.showChildView('feeWaiverRegion', new FeeWaiverView({
        model: this.feeWaiverModel,
        isUpload: this.isUpload
      }));
    } else {
      const primaryApplicant = participantsChannel.request('get:primaryApplicant');

      this.showChildView('receiptContainerRegion', new ReceiptContainer({
        displayHtml: this.receiptPageHtml(),
        emailSubject: `File number ${dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
        containerTitle: RECEIPT_TITLE,
        emailUpdateParticipantId: primaryApplicant ? primaryApplicant.id : null,
        autoSendEmail: false,
        participantSaveModel: this.currentUser && this.currentUser.isOfficeUser() ? ExternalParticipantModel : ParticipantModel,
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_FEE_WAIVER')
      }));
      $.scrollPageToTop();
    }
  },

  receiptPageHtml() {
    return receiptTemplate({ receiptTitle: RECEIPT_TITLE, receiptData: this.receiptData });
  },

  templateContext() {
    return {
      isUpload: this.isUpload,
      renderAsReceipt: this.renderAsReceipt,
    };
  }

});

export default OfficeFeeWaiverPageView;