import Backbone from 'backbone';
import Radio from 'backbone.radio';
import FeeWaiverEvidenceModel from './FeeWaiverEvidence_model';
import PaymentTransactionViewMixin from '../PaymentTransactionViewMixin';
import InputModel from '../../input/Input_model';
import DropdownModel from '../../dropdown/Dropdown_model';
import CheckboxModel from '../../checkbox/Checkbox_model';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const paymentsChannel = Radio.channel('payments');
const Formatter = Radio.channel('formatter').request('get');

export default Backbone.Model.extend({

  defaults: {
    disputeFeeId: null,
    disputeFeeModel: null,
    uploadModel: null,
    step: 1
  },

  initialize() {
    this.disputeFeeModel = this.get('disputeFeeModel') || paymentsChannel.request('get:fees').findWhere({ dispute_fee_id: this.get('disputeFeeId') });
    this.evidenceModel = new FeeWaiverEvidenceModel();
    this.uploadModel = this.get('uploadModel') || this.evidenceModel;
    
    this.OFFICE_PAYOR_NAME_MAX_LENGTH = configChannel.request('get', 'OFFICE_PAYOR_NAME_MAX_LENGTH') || 200;
    this.OFFICE_PAYOR_NAME_MIN_LENGTH = configChannel.request('get', 'OFFICE_PAYOR_NAME_MIN_LENGTH') || 3;
    this.activeFeeWaiverPayment = this._getActiveFeeWaiverPayment();

    // If we are continuing a fee waiver, jump to step 2
    if (this.activeFeeWaiverPayment) {
      this.set('step', 2);
    }

    this.createSubModels();
  },

  _getActiveFeeWaiverPayment() {
    const activePayment = this.disputeFeeModel ? this.disputeFeeModel.getActivePayment() : null;
    if (!activePayment || !activePayment.isFeeWaiver() || !activePayment.isPending() || !activePayment.isFeeWaiverStep1Complete()) {
      return;
    }
    return activePayment;
  },

  createSubModels() {
    const isStep1 = this.isStep1();
    
    this.payorModel = new InputModel({
      labelText: 'Name of Payor',
      errorMessage: 'Please enter the name',
      minLength: this.OFFICE_PAYOR_NAME_MIN_LENGTH,
      maxLength: this.OFFICE_PAYOR_NAME_MAX_LENGTH,
      required: true,
      value: null
    });

    this.familyMemberCountModel = new InputModel({
      minValue: 1,
      maxLength: 2,
      required: true,
      disabled: !isStep1,
      errorMessage: 'Please enter the number of family members',
      inputType: 'positive_integer',
      value: this.activeFeeWaiverPayment ? this.activeFeeWaiverPayment.get('fee_waiver_tenants_family') : null,
      apiMapping: 'fee_waiver_tenants_family'
    });

    this.familyIncomeModel = new InputModel({
      inputType: 'currency',
      allowZeroAmount: true,
      required: true,
      disabled: !isStep1,
      errorMessage: 'Please enter the total income',
      maxLength: configChannel.request('get', 'FEE_WAIVER_INCOME_AMOUNT_FIELD_MAX') || 8,
      value: this.activeFeeWaiverPayment ? this.activeFeeWaiverPayment.get('fee_waiver_income') : null,
      apiMapping: 'fee_waiver_income'
    });

    this.citySizeDropdown = new DropdownModel({
      optionData: _.map(PaymentTransactionViewMixin.mixin_getCityBucketOptions(), function(option) {
        option.value = String(option.value);
        return option;
      }),
      defaultBlank: true,
      required: true,
      disabled: !isStep1,
      errorMessage: 'Please enter the population',
      value: this.activeFeeWaiverPayment ? String(this.activeFeeWaiverPayment.get('fee_waiver_city_size')) : null,
      apiMapping: 'fee_waiver_city_size'
    });

    this.confirmModel = new CheckboxModel({
      html: `I confirm that all information I have entered or will enter is accurate and complete, and I understand that submitting false information to the Residential Tenancy Branch to avoid paying the filing fee is a punishable offence.`,
      disabled: !isStep1,
      required: true,
      checked: !isStep1,
    });
  },

  isStep1() {
    return this.get('step') === 1;
  },

  isStep2() {
    return this.get('step') === 2;
  },

  _getUploadedFilesString() {
    const pendingUploads = this.uploadModel.getPendingUploads() || [];

    if (_.isEmpty(pendingUploads)) {
      return;
    }

    let uploadedFileCount = 0;
    let uploadedFilesString = '<span class="office-files-evidence-display-container">';

    _.each(pendingUploads, disputeEvidence => {
      const files = disputeEvidence.get('files');
      const uploadedFileModels = files.getUploaded();
      if (!uploadedFileModels.length) {
        return;
      }

      uploadedFileCount += uploadedFileModels.length;

      const fileString = `
        <span class="office-file-evidence-display-container">
          <b>${disputeEvidence.getTitle()}:</b> ${Formatter.toUploadedFilesDisplay(uploadedFileModels)}
        </span><br/>`;

      uploadedFilesString += fileString;
    });

    const uploadedFilesHtml = $(`${$.trim(uploadedFilesString)}</span>`);
    const lastBreakEle = uploadedFilesHtml.find('.office-file-evidence-display-container:last-child br');
    lastBreakEle.remove();
    return `${uploadedFileCount} file${uploadedFileCount===1?'':'s'}:<br/>${uploadedFilesHtml.html()}`;
  },

  generateReceiptData(paymentTransactionModel, returnFullData=false) {
    const receiptData = [
      { label: 'File number', value: disputeChannel.request('get:filenumber') },
      { label: 'Payment date', value: Formatter.toDateDisplay(Moment()) },
      { label: 'Payment ID', value: paymentTransactionModel.get('payment_transaction_id') },
      { label: 'Payment for', value: this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : '-' },
      { label: 'Payment by', value: this.payorModel.getData() },
      { label: 'Payment amount', value: Formatter.toAmountDisplay(paymentTransactionModel.get('transaction_amount')) },
      { label: 'Payment method', value: Formatter.toPaymentMethodDisplay(paymentTransactionModel.get('transaction_method')) },
      { label: 'Tenants and family members', value: this.familyMemberCountModel.getData({ parse: true }) },
      { label: 'Monthly income', value: Formatter.toAmountDisplay(this.familyIncomeModel.getData()) },
      { label: 'City size', value: this.citySizeDropdown.getSelectedText() },
      { label: 'Proof of income', value: this._getUploadedFilesString() || '-', isHtml: true }
    ];

    return returnFullData ? {
      disputeFeeModel: this.disputeFeeModel,
      hasUploadedFiles: (Object.keys(this.uploadModel.getPendingUploads()) || []).length,
      paymentTransactionModel,
      receiptData,
    } : receiptData;
  },

  /* External access methods */
  getPayorName() {
    return this.payorModel.getData();
  },

  getStep1ApiData() {
    return _.extend(
      this.familyMemberCountModel.getPageApiDataAttrs(),
      this.familyIncomeModel.getPageApiDataAttrs(),
      this.citySizeDropdown.getPageApiDataAttrs(),
    );
  },

});