/**
 * @fileoverview - Contains payment helper functions for use in payment views
 */
import Radio from 'backbone.radio';
import DropdownModel from '../dropdown/Dropdown_model';
import InputModel from '../input/Input_model';
import TextareaModel from '../textarea/Textarea_model';

const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');

export default {
  mixin_getCityBucketOptions() {
    const FEE_WAIVER_CITY_SIZE_DISPLAY = configChannel.request('get', 'FEE_WAIVER_CITY_SIZE_DISPLAY') || {}
    return [{ name: 'rural-city-size', value: 0, cssClass: '', text: FEE_WAIVER_CITY_SIZE_DISPLAY[0]},
        { name: 'small-city-size', value: 1, cssClass: '', text: FEE_WAIVER_CITY_SIZE_DISPLAY[1]},
        { name: 'medium-city-size', value: 2, cssClass: '', text: FEE_WAIVER_CITY_SIZE_DISPLAY[2]},
        { name: 'large-city-size', value: 3, cssClass: '', text: FEE_WAIVER_CITY_SIZE_DISPLAY[3]}];
  },

  _getTransactionMethodOptions() {
    return [
      { value: configChannel.request('get', 'PAYMENT_METHOD_ONLINE'), text: 'Online' },
      { value: configChannel.request('get', 'PAYMENT_METHOD_OFFICE'), text: 'Office' },
      { value: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'), text: 'Fee Waiver' }
    ];
  },

  _getPaymentStatusOptions() {
    return [
      { value: configChannel.request('get', 'PAYMENT_STATUS_PENDING'), text: 'Pending' },
      { value: configChannel.request('get', 'PAYMENT_STATUS_APPROVED'), text: 'Completed/Paid' },
      { value: configChannel.request('get', 'PAYMENT_STATUS_REJECTED'), text: 'Rejected/Declined' },
      { value: configChannel.request('get', 'PAYMENT_STATUS_CANCELLED'), text: 'Cancelled' }];
  },

  mixin_createSubModels() {
    const transactionBy = participantsChannel.request('get:participant', this.model.get('transaction_by'));

    this.transactionMethodModel = new DropdownModel({
      optionData: this._getTransactionMethodOptions(),
      required: true,
      defaultBlank: true,
      labelText: 'Transaction Method',
      errorMessage: 'Select a transaction method',
      value: this.model.get('transaction_method'),
      apiMapping: 'transaction_method'
    });

    this.paymentStatusModel = new DropdownModel({
      optionData: this._getPaymentStatusOptions(),
      required: true,
      defaultBlank: false,
      labelText: 'Payment Status',
      value: this.model.get('payment_status'),
      apiMapping: 'payment_status'
    });

    // If there is no transaction_amount, set it to the fee amount
    this.amountInputModel = new InputModel({
      inputType: 'currency',
      allowZeroAmount: true,
      required: false,
      disabled: true,
      labelText: 'Payment Amount',
      value: this.model.get('transaction_amount') ? this.model.get('transaction_amount') : this.model.get('dispute_fee_amount_due'),
      apiMapping: 'transaction_amount'
    });

    this.cardTypeModel = new InputModel({
      inputType: 'text',
      required: true,
      labelText: 'Card Type',
      value: !this.model.get('card_type') || !$.trim(this.model.get('card_type')) ? null : $.trim(this.model.get('card_type')),
      apiMapping: 'card_type'
    });

    this.transactionApprovedModel = new DropdownModel({
      optionData: [{ value: 0, text: 'No'}, { value: 1, text: 'Yes' }],
      required: true,
      labelText: 'Transaction Approved',
      value: this.model.get('trn_approved') ? 1 : 0,
      apiMapping: 'trn_approved'
    });

    this.transactionIdModel = new InputModel({
      inputType: 'text',
      required: true,
      labelText: 'Online Transaction ID',
      value: !this.model.get('trn_id') || !Number(this.model.get('trn_id')) ? null : this.model.get('trn_id'),
      apiMapping: 'trn_id'
    });

    this.officeIdirModel = new InputModel({
      inputType: 'text',
      required: true,
      labelText: 'Office Payment IDIR',
      value: this.model.get('office_payment_idir'),
      apiMapping: 'office_payment_idir'
    });

    this.familyCountModel = new InputModel({
      minValue: 1,
      maxLength: 2,
      required: true,
      labelText: transactionBy ? (
        transactionBy.isLandlord() ? '# Landlord(s)' : '# Tenants and Family'
      ) : '# Applicants and Family',
      errorMessage: 'Please enter the number',
      inputType: 'positive_integer',
      value: this.model.get('fee_waiver_tenants_family'),
      apiMapping: 'fee_waiver_tenants_family'
    });

    this.familyIncomeModel = new InputModel({
      inputType: 'currency',
      required: true,
      allowZeroAmount: true,
      labelText: 'Monthly Income',
      errorMessage: 'Please enter the total income',
      maxLength: configChannel.request('get', 'FEE_WAIVER_INCOME_AMOUNT_FIELD_MAX') || 8,
      value: this.model.get('fee_waiver_income'),
      apiMapping: 'fee_waiver_income'
    });

    this.citySizeModel = new DropdownModel({
      optionData: this.mixin_getCityBucketOptions(),
      defaultBlank: true,
      required: true,
      labelText: 'City Size',
      errorMessage: 'Please enter the population',
      value: this.model.get('fee_waiver_city_size'),
      apiMapping: 'fee_waiver_city_size'
    });

    this.hardshipQuestionModel = new DropdownModel({
      optionData: [{ value: 0, cssClass: 'option-button yes-no', text: 'No'},
          { value: 1, cssClass: 'option-button yes-no', text: 'Yes'}],
      labelText: 'Hardship',
      defaultBlank: true,
      required: true,
      value: this.model.get('fee_waiver_hardship') === null ? null : (this.model.get('fee_waiver_hardship') ? 1 : 0),
      apiMapping: 'fee_waiver_hardship'
    });

    this.hardshipDetailsModel = new TextareaModel({
      showInputEntry: true,
      labelText: 'Hardship Details',
      required: this.model.get('fee_waiver_hardship'),
      errorMessage: 'Please enter the hardship details',
      value: this.model.get('fee_waiver_hardship_details'),
      min: 25,
      max: 250,
      apiMapping: 'fee_waiver_hardship_details'
    });
  }
};