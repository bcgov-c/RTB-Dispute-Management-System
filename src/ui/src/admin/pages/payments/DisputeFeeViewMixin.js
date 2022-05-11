import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputModel from '../../../core/components/input/Input_model';
import TextareaModel from '../../../core/components/textarea/Textarea_model';

const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');

export default {

  _getFeeTypeOptions() {
    // Only allow an intake fee if it doesn't exist
    const PAYMENT_FEE_TYPE_INTAKE = configChannel.request('get', 'PAYMENT_FEE_TYPE_INTAKE'),
      fees = paymentsChannel.request('get:fees'),
      api_intake_fee = fees.find(function(fee) { return !fee.isNew() && fee.get('fee_type') === PAYMENT_FEE_TYPE_INTAKE });
    
    return _.map([
      ...(!api_intake_fee ? [{ value: PAYMENT_FEE_TYPE_INTAKE, text: configChannel.request('get', 'PAYMENT_FEE_NAME_INTAKE')}] : []),
      { value: configChannel.request('get', 'PAYMENT_FEE_TYPE_REVIEW'), text: configChannel.request('get', 'PAYMENT_FEE_NAME_REVIEW') },
      { value: configChannel.request('get', 'PAYMENT_FEE_TYPE_OTHER'), text: configChannel.request('get', 'PAYMENT_FEE_NAME_OTHER') }],
      function(option) {
        option.value = String(option.value);
        return option;
      });
  },

  _getPayorOptions() {
    const applicants = participantsChannel.request('get:applicants'),
      respondents = participantsChannel.request('get:respondents'),
      participants = _.union(applicants ? applicants.models : [], respondents ? respondents.models : []);
    
    return _.map(participants, function(p) { 
      return { value: String(p.id), text: p.getContactName() };
    });
  },

  mixin_createSubModels() {
    this.feeTypeModel = new DropdownModel({
      optionData: this._getFeeTypeOptions(),
      required: true,
      defaultBlank: false,
      labelText: 'Fee Type',
      value: this.model.get('fee_type') ? String(this.model.get('fee_type')) : null,
      apiMapping: 'fee_type'
    });

    this.amountInputModel = new InputModel({
      inputType: 'currency',
      allowZeroAmount: false,
      required: false,
      cssClass: 'optional-input',
      labelText: 'Fee Amount',
      value: this.model.get('amount_due'),
      apiMapping: 'amount_due'
    });

    this.activeDropdownModel = new DropdownModel({
      optionData: [{ value: '0', text: 'No' }, { value: '1', text: 'Yes' }],
      required: true,
      labelText: 'Active',
      value: this.model.get('is_active') ? '1' : '0',
      apiMapping: 'is_active'
    });

    this.dueDateModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      labelText: 'Due Date',
      cssClass: 'optional-input',
      required: false,
      allowFutureDate: true,
      value: this.model.get('due_date'),
      apiMapping: 'due_date'
    });

    this.payorModel = new DropdownModel({
      optionData: this._getPayorOptions(),
      labelText: 'Payor',
      defaultBlank: true,
      errorMessage: 'Select the payor',
      required: true,
      value: this.model.get('payor_id') ? String(this.model.get('payor_id')) : null,
      apiMapping: 'payor_id'
    });

    this.descriptionModel = new TextareaModel({
      labelText: 'Description',
      cssClass: 'optional-input',
      required: false,
      displayRows: 2,
      max: configChannel.request('get', 'FEE_DESCRIPTION_MAX_LENGTH'),
      value: this.model.get('fee_description'),
      apiMapping: 'fee_description'
    });
  }
};