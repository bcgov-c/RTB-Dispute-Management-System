import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import PageView from '../../../core/components/page/Page';
import FeeWaiverModel from '../../../core/components/payments/fee-waiver/FeeWaiver_model';
import FeeWaiverView from '../../../core/components/payments/fee-waiver/FeeWaiver';
import ExternalDisputeInfo_model from '../../../office/components/external-api/ExternalDisputeInfo_model';
import ExternalDisputeStatus_model from '../../components/external-api/ExternalDisputeStatus_model';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import './DAPayment.scss';

const PAYMENT_API_ERROR_MSG = 'Payment recorded successfully, but there was an issue updating the dispute data after the payment was recorded';

const applicationChannel = Radio.channel('application');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const paymentsChannel = Radio.channel('payments');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const DAPaymentPage = PageView.extend({
  /**
   * 
   * @param {Backbone.Model} model - the Application model
   * @param {Number} disputeFeeId - the ID of the DisputeFeeModel being paid
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['disputeFeeId']);
    this.disputeFeeId = this.disputeFeeId ? Number(this.disputeFeeId) : null;
        
    this.loadedPaymentMethod = UtilityMixin.util_getParameterByName('mode');
    this.loadedPaymentMethod = this.loadedPaymentMethod ? Number(this.loadedPaymentMethod) : null;
    if (this.loadedPaymentMethod && this.disputeFeeId) Backbone.history.navigate(`#pay/${this.disputeFeeId}`, { trigger: false, replace: true });
    
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.PAYMENT_METHOD_ONLINE = configChannel.request('get', 'PAYMENT_METHOD_ONLINE');
    this.PAYMENT_METHOD_FEE_WAIVER = configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER');
    this.editGroup = ['paymentMethodTypeRegion'];
    this.isLoaded = false;

    const disputeFeeModel = paymentsChannel.request('get:fees').findWhere({ dispute_fee_id: this.disputeFeeId });
    const activePayment = disputeFeeModel && disputeFeeModel.getActivePayment();
    this.setPaymentToSavedAndTransitionDispute(activePayment);
    
    this.createSubModels();
    this.setupListeners();
  },

  generateReceiptData() {
    const disputeFeeModel = this.disputeFeeModel;
    const paymentTransactionModel = this.disputeFeeModel.getActivePayment();
    
    return {
      disputeFeeModel,
      paymentTransactionModel,
      hasUploadedFiles: false,
      receiptData: [
        { label: 'File number', value: disputeChannel.request('get:filenumber') },
        { label: 'Payment date', value: Formatter.toDateDisplay(Moment()) },
        { label: 'Payment ID', value: paymentTransactionModel.get('payment_transaction_id') },
        { label: 'Payment for', value: Formatter.toFeeTypeDisplay(disputeFeeModel.get('fee_type')) },
        { label: 'Payment by', value: this.loggedInParticipant ? this.loggedInParticipant.getInitialsDisplay() : '-' },
        { label: 'Payment amount', value: Formatter.toAmountDisplay(paymentTransactionModel.get('transaction_amount')) },
        { label: 'Payment method', value: Formatter.toPaymentMethodDisplay(paymentTransactionModel.get('transaction_method')) }
      ]
    };
  },

  setPaymentToSavedAndTransitionDispute(activePayment) {
    if (!activePayment || !activePayment.isOnline() || activePayment.isDeclined()) {
      this.isLoaded = true;
      return;
    }
    
    this.isLoaded = false;
    const routeToReceiptFn = () => {
      this.model.setReceiptData(this.generateReceiptData());
      this.model.set('routingReceiptMode', true);
      Backbone.history.navigate('#payment/receipt', { trigger: true });
    };
    const routeToMenuFn = () => Backbone.history.navigate('#access', { trigger: true });
    const continueToPageFn = () => {
      this.isLoaded = true;
      this.render();
      loaderChannel.trigger('page:load:complete');
    };

    setTimeout(() => loaderChannel.trigger('page:load'), 1);
    // Otherwise, perform the bambora check
    activePayment.updateTransactionAfterBeanstream({ update_status_only: true })
      .done(() => {
        // If payment is still not approved, show the payment page
        if (!activePayment.isApproved()) return continueToPageFn();

        // Otherwise, update dispute and SSPO based on approved intake payment.  These methods check whether the fee is intake
          this.updateDisputeStatusPromise()
          .catch(err => {
            loaderChannel.trigger('page:load:complete');
            generalErrorFactory.createHandler('OS.STATUS.SAVE', routeToMenuFn, PAYMENT_API_ERROR_MSG)(err);
          })
          .then(() => this.updateDisputeInfoPromise())
          .catch(err => {
            loaderChannel.trigger('page:load:complete');
            generalErrorFactory.createHandler('OS.DISPUTE.SAVE', routeToMenuFn, PAYMENT_API_ERROR_MSG)(err);
          })
          .then(routeToReceiptFn)
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('PAYMENT.BEANSTREAM_CHECK', routeToMenuFn)(err);
      });
  },

  createSubModels() {
    this.disputeFeeModel = paymentsChannel.request('get:fees').findWhere({ dispute_fee_id: this.disputeFeeId });

    const isDisputeFeeValid = (this.disputeFeeModel && this.disputeFeeModel.isActive() && !this.disputeFeeModel.isPaid());
    if (!isDisputeFeeValid) {
      alert("Invalid dispute fee.  Returning to main list");
      return;
    }
    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.showFeeWaiver = this.loadedPaymentMethod === this.PAYMENT_METHOD_FEE_WAIVER;
    this.feeWaiverIsUpload = false;

    const latestPayment = this.disputeFeeModel.getActivePayment();
    const canTryFeeWaiver = this.canTryFeeWaiver();
    const optionData = [{
        name: 'payment-method-type',
        text: '<b>Pay Online</b> (recommended) by Visa, MasterCard, Visa Debit, MasterCard Debit, or American Express',
        value: this.PAYMENT_METHOD_ONLINE,
      },
      ...(canTryFeeWaiver ? [{
        name: 'payment-method-type',
        text: 'I am unable to pay this fee due to low income and want to provide my financial and income information with a request to have this fee waived (<a class="static-external-link" href="javascript:;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/fees-and-fee-waivers#Waiver">learn more about fee waivers</a>)',
        value: this.PAYMENT_METHOD_FEE_WAIVER,
      }] : [])
    ];
    this.paymentMethodTypeModel = new RadioModel({
      optionData,
      required: true,
      cssClass: 'payment-options',
      value: this.loadedPaymentMethod || (
        latestPayment && optionData.find(opt => opt.value === latestPayment.get('transaction_method')) ? latestPayment.get('transaction_method') : null
      )
    });

    this.feeWaiverModel = new FeeWaiverModel({ step: 1, disputeFeeId: this.disputeFeeId });

    // If non-Intake fee, make sure to clear any already uploaded evidence, to force new evidence to be created
    if (!this.disputeFeeModel.isIntakeFee()) {
      this.feeWaiverModel?.evidenceModel?.get('evidenceCollection')?.forEach(evidence => {
        evidence.description_by = participantsChannel.request('get:primaryApplicant:id');
        evidence.file_description = null;
      });
    }

    if (this.feeWaiverModel.payorModel) this.feeWaiverModel.payorModel.set({ value: sessionChannel.request('name') || null });
  },

  setupListeners() {
    this.listenTo(this.paymentMethodTypeModel, 'change:value', this.render, this);

    this.listenTo(this.feeWaiverModel, 'upload:ready', function() {
      this.feeWaiverIsUpload = true;
      this.render();
      this.feeWaiverModel.trigger('upload:start');
    }, this);

    this.listenTo(this.feeWaiverModel, 'upload:complete', this._onUploadComplete, this);
    this.listenTo(this.feeWaiverModel, 'lico:declined', this.saveAsDeclined, this);
    this.listenTo(this.feeWaiverModel, 'lico:approved', this.saveAsPending, this);

    this.listenTo(this.feeWaiverModel, 'cancel', () => {
      if (this.feeWaiverModel.isStep2()) this.showFeeWaiverIncompleteWarning(this.routeToMainMenu);
      else this.routeToMainMenu();
    }, this);
  },

  showFeeWaiverIncompleteWarning(routingFn) {
    let confirmExit = false;
    const modalView = modalChannel.request('show:standard', {
      title: 'Fee Waiver Pending',
      bodyHtml: `<p>You have a fee waiver application in progress. If you do not upload proof, this fee waiver will not be accepted.  You can add proof to this fee waiver again through this site.</p>
      <p>Are you sure you want to complete later?</p>`,
      cancelButtonText: 'No, complete now',
      primaryButtonText: 'Yes, complete later',
      onContinueFn(_modalView) {
        confirmExit = true;
        _modalView.close();
      }
    });

    this.listenTo(modalView, 'removed:modal', () => {
      if (confirmExit) routingFn();
    });
  },

  showFeeWaiverDeclined(routingFn) {
    const modalView = modalChannel.request('show:standard', {
      title: 'Fee Waiver Declined',
      bodyHtml: `<p>The income information provided does not meet the criteria for these fees to be waived.  The rejected fee waiver request has been stored on the dispute file.</p>
      <p>Close this window to return to the payment page to view the available options.</p>`,
      hideCancelButton: true,
      primaryButtonText: 'Back to payment options',
      onContinueFn(_modalView) { _modalView.close(); }
    });

    this.listenTo(modalView, 'removed:modal', () => routingFn());
  },

  isOnlineMethodSelected() {
    return this.paymentMethodTypeModel.getData() === this.PAYMENT_METHOD_ONLINE;
  },

  isFeeWaiverMethodSelected() {
    return this.paymentMethodTypeModel.getData() === this.PAYMENT_METHOD_FEE_WAIVER;
  },

  canTryFeeWaiver() {
    // An applicant can only try fee waiver if they are a tenant and if they don't have a rejected fee waiver
    return this.loggedInParticipant && this.loggedInParticipant.isTenant() && !this.disputeFeeModel.hasDeclinedFeeWaiver();
  },

  hasMultiplePayOptions() {
    return this.canTryFeeWaiver();
  },

  validateAndShowErrors() {
    let isValid = true;
    this.editGroup.forEach(viewName => {
      const view = this.getChildView(viewName);
      if (view) isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  _onUploadComplete(uploadedEvidence) {
    this.feeWaiverIsUpload = false;

    const routeToReceiptFn = () => {
      if (this.disputeFeeModel.isReviewFee()) {
        Backbone.history.navigate(`#review/step1`, { trigger: true });
      } else {
        this.model.setReceiptData(this.feeWaiverModel.generateReceiptData(this.disputeFeeModel.getActivePayment(), true));
        this.model.set('routingReceiptMode', true);
        Backbone.history.navigate('#payment/receipt', { trigger: true }); 
      }
    };

    const anyFilesUploaded = _.any(uploadedEvidence, disputeEvidence => disputeEvidence.getUploadedFiles().length);
    const uploadErrorFiles = [];
    _.each(uploadedEvidence, disputeEv => uploadErrorFiles.push( ...(disputeEv.get('files').filter(f => f.isUploadError())) ));

    if (anyFilesUploaded) {
      this.saveAsApproved()
        .then(() => this._checkAndShowFileUploadErrors(routeToReceiptFn, uploadErrorFiles),
          generalErrorFactory.createHandler('OS.PAYMENT.SAVE', () => this._checkAndShowFileUploadErrors(this.routeToMainMenu, uploadErrorFiles )));
    } else {
      this._checkAndShowFileUploadErrors(this.routeToMainMenu, uploadErrorFiles);
    }
  },

  _checkAndShowFileUploadErrors(routingFn, uploadErrorFiles) {
    if (!_.isEmpty(uploadErrorFiles)) {
      filesChannel.request('show:upload:error:modal', uploadErrorFiles, () => {
        loaderChannel.trigger('page:load');
        routingFn();
      });
    } else {
      setTimeout(() => routingFn(), 500);
    }
  },

  // When an Intake Fee is paid, the status should be updated
  updateDisputeStatusPromise()  {
    // Update status if intake fee
    const statusSaveModel = new ExternalDisputeStatus_model({ file_number: this.dispute.get('file_number'), dispute_stage: 2, dispute_status: 20 });
    return new Promise((res, rej) => {
      if (this.disputeFeeModel.isIntakeFee()) {
        return statusSaveModel.save().then(response => {
          // Manually apply any status change to the loaded dispute, because we won't do another fresh load call before displaying page
          this.dispute.set({ status: response });
          _.extend(this.dispute.get('_originalData'), { status: response });
          return res(response);
        }, rej);
      } else {
        return res();
      }
    });
  },

  updateDisputeInfoPromise() {
    const disputeSaveModel = new ExternalDisputeInfo_model( this.dispute.toJSON() );
    return new Promise((res, rej) => {
      if (this.disputeFeeModel.isIntakeFee()) {
        return disputeSaveModel.checkAndUpdateInitialPayment({
          initial_payment_by: this.dispute.get('tokenParticipantId') || participantsChannel.request('get:primaryApplicant:id'),
          initial_payment_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
        }).done(res).fail(rej);
      } else {
        return res();
      }
    });
  },

  _savePaymentTransaction(paymentTransactionData) {
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

    return new Promise((res, rej) => newPaymentTransaction.save().done(res).fail(err => {
      // If save fails, remove payment transaction from the dispute fee
      this.disputeFeeModel.resetPaymentTransactions();
      rej(err);
    }));
  },

  saveAsApproved() {
    return new Promise((resolve, reject) => {
      this._savePaymentTransaction({ payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED') })
      // Parse data back
      .then(() => {
        this.disputeFeeModel.set({ is_paid: true }, { silent: true });
      }, generalErrorFactory.createHandler('OS.PAYMENT.SAVE', reject))
      .then(() => this.updateDisputeStatusPromise())
      .then(() => this.updateDisputeInfoPromise(), generalErrorFactory.createHandler('OS.STATUS.SAVE', reject, PAYMENT_API_ERROR_MSG))
      .then(resolve, generalErrorFactory.createHandler('OS.DISPUTE.SAVE', reject, PAYMENT_API_ERROR_MSG))
    });
  },

  saveAsPending() {
    loaderChannel.trigger('page:load');
    this._savePaymentTransaction({ payment_status: configChannel.request('get', 'PAYMENT_STATUS_PENDING') })
      .then(()=>{}, generalErrorFactory.createHandler('OS.PAYMENT.SAVE', ()=>{}))
      .finally(() => loaderChannel.trigger('page:load:complete'))
  },

  saveAsDeclined() {
    loaderChannel.trigger('page:load');
    this._savePaymentTransaction({ payment_status: configChannel.request('get', 'PAYMENT_STATUS_REJECTED') })
      .then(()=>{}, generalErrorFactory.createHandler('OS.PAYMENT.SAVE', ()=>{}))
      .finally(() => {
        this.isLoaded = false;
        this.render();
        this.showFeeWaiverDeclined(() => this.reloadPage());
        loaderChannel.trigger('page:load:complete');
      });
  },

  startFeeWaiverPayment() {
    this.showFeeWaiver = true;
    this.render();
  },

  startOnlinePayment() {
    loaderChannel.trigger('page:load');
    
    this.disputeFeeModel.createAndSavePayment({
      transaction_by: this.dispute.get('tokenParticipantId'),
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_ONLINE'),
      payment_provider: configChannel.request('get', 'PAYMENT_PROVIDER_BEANSTREAM'),
    }).then(createdPayment => {
      // Loads complete, reset page data
      // All APIs complete, now check if online and go to beanstream
      if (createdPayment.isOnline()) {
        const paymentUrl = createdPayment.get('payment_url');
        console.log("Routing to ", paymentUrl);
        const accessCode = this.model.get('accessCode');
        const submitterName = this.model.get('submitterName');
        const paymentTokenObj = {
          t: btoa(`${sessionChannel.request('token')}!#${accessCode}!@#${submitterName}`),
          exp: (new Date).getTime() + 15*60*1000,
          ac: btoa(UtilityMixin.util_hash(accessCode)),
        };

        sessionStorage.setItem('_dmsPaymentToken', JSON.stringify(paymentTokenObj));
        window.location = paymentUrl
      } else {
        alert("Error, payment wasn't able to be created.  Refresh and try again");
      }
    }, (err) => {
      console.log(err);
      alert("create and save Payment Error, payment wasn't able to be created.  Refresh and try again");
    });
  },

  clickPayMethod() {
    if (this.isOnlineMethodSelected()) paymentsChannel.request('show:online:instructions:modal', () => this.startOnlinePayment());
    else if (this.isFeeWaiverMethodSelected()) this.startFeeWaiverPayment();
  },

  routeToMainMenu() {
    Backbone.history.navigate('#access', { trigger: true });
  },

  reloadPage() {
    // Unless we are coming from the login page, do a refresh of the login data
    this.listenToOnce(applicationChannel, 'dispute:loaded:disputeaccess', () => {
      this.createSubModels();
      this.setupListeners();
      this.isLoaded = true;
      this.render();
      loaderChannel.trigger('page:load:complete');
    }, this);

    loaderChannel.trigger('page:load');
    
    // Clear and re-load the DA data
    const accessCode = this.model.get('accessCode');
    const submitterName = this.model.get('submitterName');
    this.model.clearLoadedInfo();
    this.model.loadDisputeAccess(accessCode, submitterName);
  },

  onRender() {
    if (!this.isLoaded) return;

    if (!this.feeWaiverIsUpload) {
      this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    }

    this.showChildView('paymentMethodTypeRegion', new RadioView({ model: this.paymentMethodTypeModel }));

    if (this.showFeeWaiver) {
      this.showChildView('feeWaiverRegion', new FeeWaiverView({
        showPaymentDetails: true,
        hideButtonsWhenDeclined: true,
        showConfirm: true,

        model: this.feeWaiverModel,
        isUpload: false,

        step1TitleText: 'Income Information',
        step1DescriptionText: 'To qualify for a fee waiver, you must provide the following information to prove the inability to pay the fee.',
        step2TitleText: 'Supporting proof',
        step2DescriptionText: `You must now provide proof that supports the income information you provided. At least one proof of income file must be provided to complete the payment process. It is recommended that you provide proof now, but if you can't upload it right now you can submit it later online or in person at any Service BC Office or the Burnaby Residential Tenancy Branch Office. Keep in mind it must be received within three days of submitting your application or before the deadline for disputing a notice to end your tenancy expires (if applicable), whichever is earlier.`
      }));
    }
  },

  /* Template Functions */
  className: `${PageView.prototype.className} da-payment-page`,
  regions: {
    disputeRegion: '.da-payment-page__dispute-overview',
    paymentMethodTypeRegion: '.da-payments-payment-method-type',
    feeWaiverRegion: '.office-page-fee-waiver-container',
  },

  ui() {
    return Object.assign({}, PageView.prototype.ui, {
      logout: '.office-receipt-logout',
    });
  },

  template() {
    if (!this.isLoaded) return;
    const paymentTypeDisplay = this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : null;
    const paymentAmountDisplay = this.disputeFeeModel ? Formatter.toAmountDisplay(this.disputeFeeModel.get('amount_due'), true) : null;
    return (
      <>
        <div className="da-payment-page__dispute-overview"></div>

        {this.renderJsxPageTitleAndInstructions()}
        
        {!this.showFeeWaiver ? (
          <div className="office-page-payment-details">
            <div className="">
              <span className="review-label">Payment for:</span>&nbsp;<span>{paymentTypeDisplay || '-'}</span>
            </div>
            <div className="">
              <span className="review-label">Total amount due:</span>&nbsp;<span>{paymentAmountDisplay || '-'}</span>
            </div>
          </div>
        ) : null}

        {this.renderJsxIncompletePayment()}

        <div className={`da-payments-payment-method-type ${this.showFeeWaiver ? 'hidden' : ''}`}></div>

        {this.renderJsxFeeWaiver()}
        {this.renderJsxPageButtons()}
      </>
    );
  },

  renderJsxPageTitleAndInstructions() {
    let titleDisplay = 'Complete Payment';
    if (this.feeWaiverIsUpload) titleDisplay = 'Uploading fee waiver proof please wait';
    else if (this.showFeeWaiver) titleDisplay = 'Complete fee waiver';

    return <div className="dac__page-header-container">
      <div className="dac__page-header hidden-print">
        <span className="dac__page-header__icon dac__icons__menu__payment"></span>
        <span className="dac__page-header__title">{titleDisplay}</span>
      </div>
    </div>;
  },

  renderJsxIncompletePayment() {
    if (this.showFeeWaiver) return;

    const activePayment = this.disputeFeeModel ? this.disputeFeeModel.getActivePayment() : null;
    if (!activePayment || activePayment.isApproved() || !activePayment.isOnline()) return;

    const isDeclined = activePayment.isDeclined();
    const dateDisplay = `${Formatter.toTimeDisplay(activePayment.get('created_date'))} ${Formatter.toWeekdayDateDisplay(activePayment.get('created_date'))}`;
    const completionStatusDisplay = `${isDeclined ? 'declined' : 'not completed'}`;

    const feeWaiverDeclinedMsg = `Based on the information that you provided, you are not eligible for the fee to be waived and must choose another option.`;
    const feeWaiverIncompleteMsg = `A previous fee waiver, started at ${dateDisplay}, was ${completionStatusDisplay}. Select the fee waiver option and Continue to add fee waiver proof.`;

    const feeWaiverTitle = isDeclined ? 'Fee Waiver Request Declined' : 'Fee Waiver Not Complete';
    const feeWaiverMsg = isDeclined ? feeWaiverDeclinedMsg : feeWaiverIncompleteMsg;
    const onlineIncompleteMsg = `A previous online payment, started at ${dateDisplay}, was ${completionStatusDisplay}. Select Pay Online to try again${this.hasMultiplePayOptions() ? ' or select another option' : ''}.`;

    return <p className="error-block warning fee-waiver-error-container">
      <span className="fee-waiver-error">
        {activePayment.isFeeWaiver() ? <>
          <b>{feeWaiverTitle}:</b>&nbsp;{feeWaiverMsg}
        </>
        : <>
          <b>Payment Not Completed:</b>&nbsp;{onlineIncompleteMsg}
        </>}
      </span>
    </p>;
  },

  renderJsxFeeWaiver() {
    return (
      <div className={
        `office-sub-page-view da-upload-page-wrapper ${this.showFeeWaiver ? '' : 'hidden'} ${this.feeWaiverIsUpload ? 'upload' : ''}`
      }>
        <div className="office-page-fee-waiver-container"></div>
      </div>
    );
  },

  renderJsxPageButtons() {
    const nextButtonTitleDisplay = this.isOnlineMethodSelected() ? 'Pay Online' : 'Continue';
    const isNextDisabled = !this.paymentMethodTypeModel.getData(); 
    if (this.showFeeWaiver) return;
    else return (<>
      <div className="spacer-block-30"></div>
      <div className="dac__page-buttons">
        <button className="btn btn-lg btn-cancel" onClick={this.routeToMainMenu}>Cancel</button>
        <button className={`btn btn-lg btn-standard btn-continue ${isNextDisabled?'disabled':''}`} onClick={() => this.clickPayMethod()} disabled={isNextDisabled}>{nextButtonTitleDisplay}</button>
      </div>
      <div className="spacer-block-10"></div>
    </>);
  }
});

_.extend(DAPaymentPage.prototype, ViewJSXMixin);
export default DAPaymentPage;
