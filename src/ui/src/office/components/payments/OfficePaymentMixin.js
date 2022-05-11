import Radio from 'backbone.radio';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';

const configChannel = Radio.channel('config');

export default {
  mixin_officePayments_createSubModels() {
    this.payorModel = new InputModel({
      labelText: 'Name of Payor',
      errorMessage: 'Please enter the name',
      minLength: configChannel.request('get', 'OFFICE_PAYOR_NAME_MIN_LENGTH'),
      maxLength: configChannel.request('get', 'OFFICE_PAYOR_NAME_MAX_LENGTH'),
      required: true,
      value: null
    });

    this.paymentAmountModel = new InputModel({
      maxLength: 6,
      labelText: 'Payment Amount',
      errorMessage: 'Please enter the amount',
      inputType: 'currency',
      required: true,
      value: null
    });

    const OFFICE_PAYMENT_METHOD_CODE_DISPLAY = configChannel.request('get', 'OFFICE_PAYMENT_METHOD_CODE_DISPLAY');
    this.paymentMethodModel = new DropdownModel({
      labelText: 'Payment Method',
      optionData: Object.entries(OFFICE_PAYMENT_METHOD_CODE_DISPLAY).map( ([value, text]) => ({ value, text }) ),
      errorMessage: `Please select the method`,
      required: true,
      defaultBlank: true,
      value: null
    });
  },

  mixin_officePayments_setupListeners() {
    // 
  }

};