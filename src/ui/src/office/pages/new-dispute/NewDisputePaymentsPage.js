import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import InputView from '../../../core/components/input/Input';
import AddressModel from '../../../core/components/address/Address_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import ExternalPaymentTransactionModel from '../../components/external-api/ExternalPaymentTransaction_model';
import ExternalDisputeInfoModel from '../../components/external-api/ExternalDisputeInfo_model';
import FeeWaiverModel from '../../../core/components/payments/fee-waiver/FeeWaiver_model';
import FeeWaiverView from '../../../core/components/payments/fee-waiver/FeeWaiver';
import OfficePaymentsMixin from '../../components/payments/OfficePaymentMixin';
import template from './NewDisputePaymentsPage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const NOT_VISIBLE_MSG = `<i>Cannot be displayed on resumed applications for privacy purposes</i>`;
const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';
const RADIO_CODE_OFFICE = 1;
const RADIO_CODE_FEE_WAIVER = 2;
const PAY_LATER_WARNING_MSG = `The applicant should be made aware that this dispute is not considered filed until payment is made.<br/>Submitting this application without payment will not extend any timelines for filing.`;

const sessionChannel = Radio.channel('session');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');
const Formatter = Radio.channel('formatter').request('get');

const NewDisputePaymentsPageView = PageView.extend({
  template,
  className: `${PageView.prototype.className} office-page-new-dispute-payments`,

  ui: {
    submit: '.btn-continue',
    paymentType: '.office-page-new-dispute-payment-type',
    payLaterWarning: '.office-page-new-dispute-payment-warning',
    officePayContainer: '.office-page-new-dispute-payment-office-container',
    feeWaiverPayContainer: '.office-page-new-dispute-payment-fee-waiver-container'
  },

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    disputeRegion: '.da-access-overview-container',

    payNowRegion: '.office-page-new-dispute-pay-now',
    paymentTypeRegion: '@ui.paymentType',

    // Fee waiver region
    feeWaiverRegion: '.office-page-new-dispute-payment-fee-waiver',

    // Office payment regions
    payorNameRegion: '.office-payment-name',
    paymentAmountRegion: '.office-payment-amount',
    paymentMethodRegion: '.office-payment-method'
  },

  events: {
    'click @ui.submit': 'clickSubmit'
  },

  clickSubmit() {
    if (this.isFeeWaiverMode) {
      console.log("[Error] Should not activate this button in fee waiver mode");
      return;
    }

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
    if (this._isPayLaterSelected()) {
      this._routeToReceiptPage();
    } else if (this.isOfficeMode) {
      this.saveOfficePayment().always(function() {
        loaderChannel.trigger('page:load:complete');
        self._routeToReceiptPage();
      });
    } else {
      console.log('[Error] Unknown state for submit button press');
      alert("Unexpected UI error.  Cannot submit");
    }

  },

  _routeToReceiptPage() {
    Backbone.history.navigate('#new/receipt', { trigger: true });
  },

  _savePaymentTransaction(paymentTransactionData) {
    const dfd = $.Deferred();
    const newPaymentTransaction = this.disputeFeeModel.createPayment(_.extend(
      {
        payment_verified: 1,
        payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED'),
        office_payment_idir: this.currentUser ? this.currentUser.getUsername() : null,
      },
      paymentTransactionData
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

  saveOfficePayment() {
    const self = this;
    const dfd = $.Deferred();
    const paymentMethodText = this.paymentMethodModel.getSelectedText();
    this.dispute.set('officePaymentMethod', paymentMethodText);
    loaderChannel.trigger('page:load');
    this._savePaymentTransaction({
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_OFFICE'),
      transaction_amount: this.disputeFeeModel.get('amount_due'),
      payment_note: `Payor name: ${this.payorModel.getData()}, Payment method: ${paymentMethodText}`,
    }).done(function(response) {
      self.saveStatusChangesAfterPaymentPromise(response).done(dfd.resolve).fail(dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  saveAsPending() {
    const dfd = $.Deferred();
    const self = this;
    loaderChannel.trigger('page:load');
    this._savePaymentTransaction({
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_PENDING')
    }).done(function() {
      dfd.resolve();
    }).fail(
      generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => dfd.reject())
    ).always(function() {
      self.paymentTypeRadioModel.set({
        optionData: [{ value: RADIO_CODE_OFFICE, text: 'Office Payment' },
          { value: RADIO_CODE_FEE_WAIVER, text: 'Fee Waiver <span class="success-green"><i>(Approved)</i></span>' }]
      });
      self.reRenderChildView('paymentTypeRegion');
      loaderChannel.trigger('page:load:complete');
    });
    return dfd.promise();
  },

  saveAsApproved() {
    const dfd = $.Deferred();
    const self = this;

    this._savePaymentTransaction(_.extend({
        transaction_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
        payment_note: `Payor name: ${this.feeWaiverModel.getPayorName()}`,
        transaction_amount: 0,
      }, this.feeWaiverModel.getStep1ApiData()
    )).done(function(response) {
      self.saveStatusChangesAfterPaymentPromise(response).done(dfd.resolve).fail(dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  saveAsDeclined() {
    const dfd = $.Deferred();
    const self = this;
    this._savePaymentTransaction({
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_REJECTED'),
    }).done(function() {
      dfd.resolve();
    }).fail(
      generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => dfd.reject())
    ).always(function() {
      self.paymentTypeRadioModel.set({
        valuesToDisable: [RADIO_CODE_FEE_WAIVER],
        optionData: [{ value: RADIO_CODE_OFFICE, text: 'Office Payment' },
          { value: RADIO_CODE_FEE_WAIVER, text: 'Fee Waiver <span class="error-red"><i>(Declined)</i></span>' }],
      });
      self.reRenderChildView('paymentTypeRegion');
      self.feeWaiverModel.trigger('transition:declined');
      loaderChannel.trigger('page:load:complete');
    });
    return dfd.promise();
  },

  saveStatusChangesAfterPaymentPromise(response) {
    const dfd = $.Deferred();
    const dispute = disputeChannel.request('get');
    // The response is actually a dispute fee, so save that back onto the fee used
    this.disputeFeeModel.set(this.disputeFeeModel.parse(response), { silent: true });

    const statusUpdatePromise = () => this.disputeFeeModel?.isPaid() ? (new ExternalDisputeStatusModel({ file_number: dispute.get('file_number'), dispute_stage: 2, dispute_status: 20 })).save() : $.Deferred().resolve().promise();  
    statusUpdatePromise().done(() => {
      const participantById = dispute.get('tokenParticipantId') || participantsChannel.request('get:primaryApplicant:id');
      const activePayment = this.disputeFeeModel.getActivePayment();
      (new ExternalDisputeInfoModel( dispute.toJSON() )).checkAndUpdateInitialPayment(
        _.extend(
          {
            initial_payment_by: participantById,
            submitted_by: participantById,
          },
          activePayment && activePayment.get('transaction_method') ? { initial_payment_method: activePayment.get('transaction_method') } : {}
        )
      ).done(() => dfd.resolve())
      .fail(
        generalErrorFactory.createHandler('OS.DISPUTE.SAVE', () => dfd.reject(), `Payment recorded successfully, but there was an issue updating the dispute's initial payment date after the payment was recorded.`)
      );
    }).fail(
      generalErrorFactory.createHandler('OS.STATUS.SAVE', () => dfd.reject(), `Payment recorded successfully, but there was an issue updating the dispute's status and initial payment date after the payment was recorded.`)
    );
    return dfd.promise();
  },


  initialize() {
    this.dispute = disputeChannel.request('get');
    this.formCode = this.model.getFormCodeUsedFromLoadedDispute();
    this.formConfig = configChannel.request('get:evidence', this.formCode);

    if (!this.formCode || _.isEmpty(this.formConfig)) {
      alert("[Error] Invalid application form data configuration.  This process cannot continue.  Please contact RTB for support.");
      Backbone.history.navigate('main', { trigger: true });
      return;
    }
    
    this.currentUser = sessionChannel.request('get:user');
    this.matchingFormFileDescription = filesChannel.request('get:filedescription:code', this.formCode);
    this.matchingBulkFileDescriptions = filesChannel.request('get:filedescriptions:category', configChannel.request('get', 'EVIDENCE_CATEGORY_BULK'));
    this.OFFICE_FORM_EVIDENCE_DESCRIPTION = configChannel.request('get', 'OFFICE_FORM_EVIDENCE_DESCRIPTION');

    const disputeFees = paymentsChannel.request('get:fees');
    this.disputeFeeModel = disputeFees.getFirstUnpaidActiveFee();

    this.isOfficeMode = false;
    this.isFeeWaiverMode = false;

    this.createSubModels();
    this.setupListeners();
    
    this.step3Group = ['payNowRegion', 'paymentTypeRegion'];
    this.officeGroup = ['payorNameRegion', 'paymentAmountRegion', 'paymentMethodRegion'];
  },

  _isPayLaterSelected() {
    return this.payNowModel.getData() === DROPDOWN_CODE_NO;
  },

  createSubModels() {
    const firstUnpaidDisputeFeeHasDeclinedFeeWavier = this.disputeFeeModel && this.disputeFeeModel.hasDeclinedFeeWaiver();
    this.paymentTypeRadioModel = new RadioModel({
      optionData: [{ value: RADIO_CODE_OFFICE, text: 'Office Payment' },
          { value: RADIO_CODE_FEE_WAIVER, text: 'Fee Waiver (tenant only)' }],
      required: true,
      value: null,
      valuesToDisable: !this.dispute.isTenant() || firstUnpaidDisputeFeeHasDeclinedFeeWavier ? [RADIO_CODE_FEE_WAIVER] : []
    });

    this.payNowModel = new DropdownModel({
      labelText: 'Complete payment?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' },
        { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      errorMessage: 'Required',
      required: true,
      value: null
    });


    // Office payment models:
    this.mixin_officePayments_createSubModels();

    // Fee Waiver payment models:
    this.feeWaiverModel = new FeeWaiverModel({
      disputeFeeId: this.disputeFeeModel.id,
      submitButtonText: 'Submit and View Receipt',
      hideCancelButtonBeforeUploads: true
    });

  },

  setupListeners() {
    // If a new search occurs, load the dispute menu
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);

    this.listenTo(this.payNowModel, 'change:value', this._onChangePayNowModel, this);

    this.listenTo(this.paymentTypeRadioModel, 'change:value', function(model, value) {
      if (value === RADIO_CODE_OFFICE) {
        this._showOfficePayment();
      } else {
        this._hideOfficePayment();
      }

      if (value === RADIO_CODE_FEE_WAIVER) {
        this._showFeeWaiver();
      } else {
        this._hideFeeWaiver();
      }
    }, this);


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

    const upload_error_files = [];  
    _.each(uploadedEvidence, function(e) {
      upload_error_files.push( ...(e.get('files').filter(function(f) { return f.isUploadError(); })) );
    });

    const routeToMenuFn = function() {
      Backbone.history.navigate('main', { trigger: true, replace: true });
    };
    const routeToReceiptFn = _.bind(this._routeToReceiptPage, this);

    const anyFilesUploaded = _.any(uploadedEvidence, function(disputeEvidence) {
      return disputeEvidence.getUploadedFiles().length;
    });

    const self = this;
    if (anyFilesUploaded) {
      this.saveAsApproved().done(function() {
        self._checkAndShowFileUploadErrors(routeToReceiptFn);
      }).fail(
        generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => self._checkAndShowFileUploadErrors( routeToMenuFn ))
      );
    } else {
      this._checkAndShowFileUploadErrors(routeToMenuFn);
    }
  },

  _checkAndShowFileUploadErrors(routingFn) {
    const upload_error_files = [];
    _.each(this.feeWaiverModel.uploadModel.getPendingUploads(), function(e) {
      upload_error_files.push( ...(e.get('files').filter(function(f) { return f.isUploadError(); })) );
    });

    if (!_.isEmpty(upload_error_files)) {
      filesChannel.request('show:upload:error:modal', upload_error_files, () => {
        loaderChannel.trigger('page:load');
        routingFn();
      });
    } else {
      setTimeout(routingFn, 500);
    }
  },

  
  _onChangePayNowModel(model, value) {
    const isPayNow = value === DROPDOWN_CODE_YES;
    const isPayLater = value === DROPDOWN_CODE_NO;
    this.paymentTypeRadioModel.set(_.extend({
        required: isPayNow,
        disabled: !isPayNow
      }, !isPayNow ? { value: null } : {}
    ));

    if (isPayLater) {
      this.showPayLaterWarning();
    } else {
      this.hidePayLaterWarning();
    }
    
    if (!isPayNow && !isPayLater) {
      this.getUI('paymentType').hide();
    }

    const view = this.getChildView('paymentTypeRegion');
    if (view) {
      view.render();
    }

    if (isPayNow) {
      this.getUI('paymentType').show();
    }
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(_.union([], this.step3Group, this.isOfficeMode ? this.officeGroup :[]), function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    if (this.isOfficeMode) {
      const amountValue = Number(this.paymentAmountModel.getData());
      if (amountValue && Number(this.disputeFeeModel.get('amount_due')) !== amountValue) {
        is_valid = false;
        const view = this.getChildView('paymentAmountRegion');
        if (view) {
          view.showErrorMessage('Payment amount must match the amount due');
        }
      }
    }
    
    return is_valid;
  },

  showPayLaterWarning() {
    this.getUI('payLaterWarning').html(PAY_LATER_WARNING_MSG).show();
  },

  hidePayLaterWarning() {
    this.getUI('payLaterWarning').html('').hide();
  },

  _hideOfficePayment() {
    this.isOfficeMode = false;
    this.getUI('officePayContainer').hide();
  },

  _showOfficePayment() {
    this.isOfficeMode = true;
    this.isFeeWaiverMode = false    
    this.render();
    
    this.getUI('submit').removeClass('hidden');
    const officePaymentEle = this.getUI('officePayContainer');
    setTimeout(function() {
      animationChannel.request('queue', officePaymentEle, 'slideDown', { duration: 400 });
    }, 50);
  },

  _showFeeWaiver() {
    this.isOfficeMode = false;
    this.isFeeWaiverMode = true;
    this.render();

    this.getUI('submit').addClass('hidden');
    const feeWaiverEle = this.getUI('feeWaiverPayContainer');
    setTimeout(function() {
      animationChannel.request('queue', feeWaiverEle, 'slideDown', { duration: 600 });
    }, 50);
  },


  _hideFeeWaiver() {
    this.isFeeWaiverMode = false;
    this.getUI('submit').removeClass('hidden');
    this.getUI('feeWaiverPayContainer').hide();
  },

  reRenderChildView(region) {
    const view = this.getChildView(region);
    if (view) {
      view.render();
    }
  },

  onRender() {
    if (!this.isUpload) {
      this.showChildView('topSearchRegion', new OfficeTopSearchView({ model: this.model.getOfficeTopSearchModel() }));
      this.showChildView('disputeRegion', new OfficeDisputeOverview({ model: this.model }));
    }

    this.showChildView('payNowRegion', new DropdownView({ model: this.payNowModel }));
    this.showChildView('paymentTypeRegion', new RadioView({ model: this.paymentTypeRadioModel }));

    if (this.isOfficeMode) {
      this.renderOfficePayment();
    } else if (this.isFeeWaiverMode) {
      this.renderFeeWaiver();
    }
  },

  renderOfficePayment() {
    this.showChildView('payorNameRegion', new InputView({ model: this.payorModel }));
    this.showChildView('paymentAmountRegion', new InputView({ model: this.paymentAmountModel }));
    this.showChildView('paymentMethodRegion', new DropdownView({ model: this.paymentMethodModel }));
  },

  renderFeeWaiver() {
    this.showChildView('feeWaiverRegion', new FeeWaiverView({
      isUpload: this.isUpload,
      hideButtonsWhenDeclined: true,
      model: this.feeWaiverModel
    }));
  },

  templateContext() {
    const rentalAddressApiMappings = {
      street: 'tenancy_address',
      city: 'tenancy_city',
      country: 'tenancy_country',
      postalCode: 'tenancy_zip_postal',
      geozoneId: 'tenancy_geozone_id',
      unitType: 'tenancy_unit_type',
      unitText: 'tenancy_unit_text'
    };
    this.addressEditModel = new AddressModel({
      json: _.mapObject(rentalAddressApiMappings, function(val, key) { return this.dispute.get(val); }, this),
    });

    const isPrivateMode = !this.dispute.get('tenancy_address');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    //primaryApplicant.mergeHintsWithFields();

    return {
      paymentTypeDisplay: this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : null,
      paymentAmountDisplay: this.disputeFeeModel ? Formatter.toAmountDisplay(this.disputeFeeModel.get('amount_due'), true) : null,

      showPaymentOptions: this.payNowModel.getData(),
      isOfficeMode: this.isOfficeMode,
      isFeeWaiverMode: this.isFeeWaiverMode,
      isUpload: this.isUpload,
      isPrivateMode,
      Formatter,
      dispute: this.dispute,
      fileNumber: this.dispute.get('file_number'),
      addressDisplay: !isPrivateMode ? this.addressEditModel.getAddressString() : NOT_VISIBLE_MSG,
      isBusiness: primaryApplicant.isBusiness(),
      primaryApplicant: participantsChannel.request('get:primaryApplicant'),
      
      formTitleDisplay: this.matchingFormFileDescription ? this.matchingFormFileDescription.get('title') : this.formConfig.title,
      formDescriptionDisplay: this.matchingFormFileDescription ? this.matchingFormFileDescription.get('description') : this.OFFICE_FORM_EVIDENCE_DESCRIPTION,

      // Payment step only accessible after uploading files, so if any matchingFormFileDescription is found, we must NOT be in private mode
      formFilesDisplay: !this.matchingFormFileDescription ? NOT_VISIBLE_MSG :
        Formatter.toUploadedFilesDisplay(this.matchingFormFileDescription.getUploadedFiles()),

      bulkFilesDisplay: !this.matchingFormFileDescription ? NOT_VISIBLE_MSG :
        !_.isEmpty(this.matchingBulkFileDescriptions) ? 
          Formatter.toUploadedFilesDisplay(_.union.apply(_, _.map(this.matchingBulkFileDescriptions, function(fileDescription) {
            return fileDescription.getUploadedFiles(); }))
          ) : 'No evidence files submitted.'
    };
  }
});

_.extend(NewDisputePaymentsPageView.prototype, OfficePaymentsMixin);
export default NewDisputePaymentsPageView;