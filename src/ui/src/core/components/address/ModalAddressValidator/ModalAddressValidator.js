/**
 * @fileoverview - Address validation modal that gets triggered when Address component verify button is clicked. 
 */

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../modals/ModalBase';
import InputView from '../../input/Input';
import InputModel from '../../input/Input_model';
import { generalErrorFactory } from '../../api/ApiLayer';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import './ModalAddressValidator.scss';
import '../AddressComplete-2.30.css';
import '../AddressComplete-2.30.js';
import AddressValidationHandler from '../AddressValidationHandler';

const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');

const DEFAULT_ADDRESS_MIN_LENGTH = 6;
const VALIDATOR_SELECTOR = '.address-validator__selection';
const CANADA_POST_ERROR_MSG = 'We were unable to connect to the canada post servers, as a result the address cannot be verified. You may try again, or continue on without a verified address.';

  /**
   * @param {String} addressString - String that will be used for the address match lookup. Should be in format "Street Address, City, Province, Postal Code"
   * @param {Boolean} useCPToolBackup - If true, it will give the option to use the native Canada Post tool if no address is found using Hive 1 tool   
   */

const AddressValidator = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['addressString', 'useCPToolBackup']);

    this.minLength = this.minLength || DEFAULT_ADDRESS_MIN_LENGTH;
    this.addressValidationFields = [
      { element: "address-search", field: "FormattedLine1", mode: pca.fieldMode.DEFAULT }, 
    ]  ;
    this.addressValidationOptions = {
        countries: { codesList: "CAN" },
        key: configChannel.request('get', 'CP_API_KEY'),
    }
    this.addressValidationController = new pca.Address(this.addressValidationFields, this.addressValidationOptions);

    this.addressValidationController.options.list.onlyDown = true;

    this.addressOptions = [];
    this.showCanadaPostWidget = false;
    this.initialRenderComplete = false;
    this.showExitUI = false;
    const addressString = this.options.addressString;

    this.createSubModels();

    this.addressLookup(addressString, { initialLoad: true }).then((response) => {
      this.initialRenderComplete = true;
      const searchAddressNumbers = addressString?.split(",")[0].match(/\d+/g);
      const filteredAddressOptions = !searchAddressNumbers?.length ? response?.Items : response?.Items?.filter(address => {
        const cpAddressToMatch = address?.Text?.match(/\d+/g);
        return searchAddressNumbers?.every(a => cpAddressToMatch?.indexOf(a) >= 0) && searchAddressNumbers?.length === cpAddressToMatch?.length;
      })
      if (!filteredAddressOptions.filter(option => option.Next === 'Retrieve')?.length && !this.useCPToolBackup) {
        this.exitValidator()
      } else {
        this.render();
        this.setDropdownOptions(response?.Items, addressString);
      }
    }).catch((err) => {
      console.log(err);
    });
  },

  createSubModels() {
    this.inputModel = new InputModel({
      name: 'address-search',
      labelText: '',
      errorMessage: '',
      required: true,
      maxLength: 100,
      minLength: this.minLength,
      value: this.model.get('value') || null
    });
  },

  addressLookup(searchValue, options={}) {
    if (!searchValue) {
      return;
    }
    
    return new Promise((res, rej) => {
      AddressValidationHandler.lookupAddress(searchValue).done(response => {
        const provinceList = response.Items.map(item => Formatter.getProvinceStringFromAlphaCode(item.Description.split(", ")?.[1]));
        const selectedProvince = this.model.get('provinceDropdownModel')?.getData();
        if (response.Items.some(item => item.Error) || !response?.Items?.length) {
          const handler = generalErrorFactory.createHandler('CP.ADDRESS.LOOKUP', () => this.exitValidator(), CANADA_POST_ERROR_MSG);
          handler();
        } else if (!provinceList.includes(selectedProvince) && !this.model.get('selectProvinceAndCountry')) {
          this.exitValidator();
          rej(`no matching addresses found within ${selectedProvince}`);
        } else {
          if (!options.initialLoad) this.setDropdownOptions(response?.Items, searchValue);
        }
        res(response);
      }).fail(rej)
      .always(() => loaderChannel.trigger('page:load:complete'))
    });
  },

  validateAndShowErrors() {
    let isValid = true;

    const view = this.getChildView('inputRegion');
    if (view) isValid = view.validateAndShowErrors() && isValid;

    return isValid;
  },

  setDropdownOptions(addressOptions, searchValue) {
    const searchAddressNumbers = searchValue?.split(",")[0].match(/\d+/g);
    const filteredAddressOptions = !searchAddressNumbers?.length ? addressOptions : addressOptions?.filter(address => {
      const cpAddressToMatch = address?.Text?.match(/\d+/g);
      return searchAddressNumbers?.every(a => cpAddressToMatch?.indexOf(a) >= 0) && searchAddressNumbers?.length === cpAddressToMatch?.length;
    })

    this.$(VALIDATOR_SELECTOR).show();
    this.$('.address-validator__dropdown').html(
      `${filteredAddressOptions.filter(option => option.Next === 'Retrieve')
        .map(option => {
        return `<div class="address-validator__dropdown__option" id=${option.Id}>${option.Text}, ${option.Description}</div>`
      }).join('')}`
    )

    if (!filteredAddressOptions.filter(option => option.Next === 'Retrieve')?.length) {
      this.switchInputDisplay();
    }
  },

  resetDropdownOptions() {
    this.$(VALIDATOR_SELECTOR).hide();
  },

  clickAddressOption(el) {
    const selectedTextArr = el?.currentTarget?.innerText?.split(", ");
    const street = selectedTextArr?.[0];
    const city = selectedTextArr?.[1];
    const province = Formatter.getProvinceStringFromAlphaCode(selectedTextArr?.[2]);
    const postalCode = selectedTextArr?.[3];

    this.model.trigger('addressClicked', { street, city, province, postalCode });
    
  },

  setCanadaPostWidget() {
    const setupListener = () => {
      this.addressValidationController.listen("populate", (address) => {
        const street = address.FormattedLine1;
        const city = address.City;
        const province = Formatter.getProvinceStringFromAlphaCode(address.Province);
        const postalCode = address.PostalCode
        
        this.model.trigger('addressClicked', { street, city, province, postalCode });
      });
    }

    this.addressValidationController = new pca.Address(this.addressValidationFields, this.addressValidationOptions);
    setupListener();
  },

  switchInputDisplay() {
    this.showCanadaPostWidget = !this.showCanadaPostWidget;
    this.render();
  },

  exitValidator() {
    this.model.trigger('exit:validation');
  },

  exitClicked() {
    this.showExitUI = true;
    this.render();
  },

  retryClicked() {
    this.showExitUI = false;
    this.showCanadaPostWidget = false;
    this.render();
    loaderChannel.trigger('page:load');
    this.addressLookup(this.addressString);
  },

  resetCPWidgetClicked() {
    const input = $('input[name="address-search"]');
    if (input?.length) input.val("");
  },

  regions: {
    inputRegion: '.address-validator__input'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      option: '.address-validator__dropdown__option',
      input: '.address-validator__input'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.option': 'clickAddressOption',
    });
  },

  onRender() {
    if (this.initialRenderComplete && this.showCanadaPostWidget && this.useCPToolBackup) this.showChildView('inputRegion', new InputView({ model: this.inputModel }));

    if (this.showCanadaPostWidget && this.useCPToolBackup) {
      this.setCanadaPostWidget();
    }
  },

  onAttach() {
    this.$(VALIDATOR_SELECTOR).hide();
  },

  template() {
    if (!this.initialRenderComplete) return;
    return (
      <>
        <div className="address-validator modal-dialog">
          <div className="modal-content clearfix">
            <div className="modal-header address-validator__header">
              <h4 className="modal-title address-validator__modal-title">{this.showExitUI ? 'Skip address check?' : !this.showCanadaPostWidget ? 'Select your address' : 'Start typing your address or postal code'}</h4>
              {this.renderJsxExitButton()}
            </div>
            <div className="modal-body clearfix">
              { this.renderJsxValidatorUI() }
              { this.renderJsxExitUI() }
            </div>
          </div>
        </div>
      </>  
    );
  },

  renderJsxExitButton() {
    if (this.showExitUI) return;

    const buttonText = !this.showCanadaPostWidget ? `It's Not Here` : 'Exit';
    if (!this.showCanadaPostWidget && this.useCPToolBackup) {
      return <button className="btn btn-lg address-validator__exit-button" type="button" onClick={() => this.switchInputDisplay()}>{buttonText}</button>;
    } else {
      return <button className="btn btn-lg address-validator__exit-button" type="button" onClick={() => this.exitClicked()}>{buttonText}</button>;
    }
  },

  renderJsxValidatorUI() {
    return (
      <div className={`address-validator__selection ${!this.initialRenderComplete || this.showExitUI ? 'hidden' : ''}`}>
        <div className="address-validator__input-wrapper">
          <div className="address-validator__input"></div>
          { this.showCanadaPostWidget ? <button className="btn btn-lg address-validator__reset-button" type="button" onClick={() => this.resetCPWidgetClicked()}>Reset</button> : null }
        </div>
        { !this.showCanadaPostWidget ? <div className="address-validator__dropdown"></div> : null }
      </div>
    )
  },

  renderJsxExitUI() {
    if (!this.showExitUI) return;

    return (
      <div className="address-validator__selection">
        <p className="address-validator__exit-text">
        We were not able to confirm your address with the Canada Post system. Please update the address then press the&nbsp;<b>Retry</b>&nbsp;link above. If no corrections need to be made, you may continue without changes.
        </p>
        <button className="btn btn-lg btn-cancel address-validator__cancel-button" type="button" onClick={() => this.exitValidator()}>Exit</button>
      </div>
    )
  }
});

_.extend(AddressValidator.prototype, ViewJSXMixin);
export default AddressValidator;