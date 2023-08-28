/**
 * @class core.components.address.AddressView
 * @memberof core.components.address
 * @augments Marionette.View
 * @fileoverview - Input with canada post api integration to verify canadian addresses
 */

import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../input/Input';
import DropdownView from '../dropdown/Dropdown';
import IconAddressNotVerified from '../../../core/static/Icon_Admin_AddressNotVerified.png';
import IconAddressVerified from '../../../core/static/Icon_Admin_AddressVerified.png'
import ModalAddressValidator from './ModalAddressValidator/ModalAddressValidator';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

/**
 * @class AddressView
 * @memberof core.components.address
 */

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const Address = Marionette.View.extend({
  tagName: 'div',

  defaultClass: 'intake-address-component clearfix',
  className() {
    const extraCssClasses = this.model.get('cssClass');
    return this.defaultClass + ' ' + (extraCssClasses ? extraCssClasses : '');
  },

  regions: {
    streetRegion: '.streetContainer',
    provinceRegion: '.provinceContainer',
    countryDropdownRegion: '.countryDropdownContainer',
    countryTextRegion: '.countryTextContainer',
    cityRegion: '.cityContainer',
    postalCodeRegion: '.postalCodeContainer'
  },

  ui: {
    validate: '.btn-validate',
    error: '.address-error',
    editAddress: '.verified-address-edit',
    retryVerification: '.verified-address-retry'
  },

  events: {
    'click @ui.editAddress': 'editAddress',
    'click @ui.retryVerification': 'retryVerification',
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this._savedAddress = this.model.getAddressString();
    this.setupListeners();
    this.listenTo(this.model, 'render', () => this.render());
  },

  setupListeners() {
    this.on('address:enter', this.addressSubmit, this);
    this.listenTo(this.model, 'change', this.onAddressChange, this);

    this.listenTo(this.model, 'addressClicked', (addressData) => {
      if (addressData?.postalCode) this.model.get('postalCodeModel')?.set('value', addressData.postalCode);
      if (addressData?.street) this.model.get('streetModel')?.set('value', addressData.street);
      if (addressData?.city) this.model.get('cityModel')?.set('value', addressData.city);
      if (addressData?.province) this.model.get('provinceDropdownModel').set('value', addressData.province);
      this.model.set({ addressIsValidated: true });
      modalChannel.request('remove', this.modalAddressValidator);
      // Trigger an address change since we've saved the current value
      this.trigger('itemComplete');
      this.render();
      this.model.disableInputs({ render: true });
      this.disableButton();
    });

    this.listenTo(this.model, 'exit:validation', () => {
      modalChannel.request('remove', this.modalAddressValidator);
      this.trigger('itemComplete');
      this.render();
    });
  },

  addressSubmit() {
    if (this.getUI('validate')?.hasClass('btn-disabled')) return;

    const isOtherCountrySelected = this.model.get('countryDropdownModel').get('value') === 'Other';
    this._savedAddress = this.model.getAddressString();

    if (this.model.get('useAddressValidation') && this.model.get('addressIsValidated') === null && configChannel.request('get', 'UAT_TOGGLING')?.ALLOW_CP_ADDRESS_VALIDATION) {
      this.setInputsToRequired();
      if (!this.validateChildrenAndShowErrors()) {
        this.unsetInputsRequired();
        return;
      }
      this.model.set({ addressIsValidated: false });
      if (!isOtherCountrySelected) {
        this.modalAddressValidator = new ModalAddressValidator({
          model: this.model,
          addressString: this.model.getAddressString({ no_country: true, no_unit: true }),
          useCPToolBackup: this.model.get('useCPToolBackup')
        });
        loaderChannel.trigger('page:load');
        modalChannel.request('add', this.modalAddressValidator);
      }
      this.render();
      this.disableButton();
    } else {
      if (!this.validateChildrenAndShowErrors()) return;
      if (this.model.get('addressIsValidated') === null) this.model.set({ addressIsValidated: false });
      this.trigger('itemComplete');
      this.render();
      this.disableButton();
    }

    this.unsetInputsRequired();
  },

  editAddress() {
    this.model.set({ addressIsValidated: null });
    this.model.enableInputs();
    this.render();
    this.enableButton();
  },

  retryVerification() {
    this.model.set({ addressIsValidated: null });
    this.render();
    this.enableButton();
  },

  enableButton() {
    this.getUI('validate')?.removeClass('btn-disabled');
  },

  disableButton() {
    this.getUI('validate')?.addClass('btn-disabled');
  },

  onAddressChange() {
    this.getUI('error').html('');
    if (this._isAddressChanged() && !this.model.get('addressIsValidated')) {
      this.enableButton();
    } else {
      this.disableButton();
    }
  },

  _isAddressChanged() {
    return this._savedAddress !== this.model.getAddressString();
  },

  validateChildrenAndShowErrors() {
    let is_valid = true;
    _.each(_.keys(this.regions), function(region) {
      const childView = this.getChildView(region);
      if (childView) {
        is_valid = childView.validateAndShowErrors() & is_valid;
      }
    }, this);
    return is_valid;
  },

  validateAndShowErrors() {
    let is_valid = true;
    if ((!this.getUI('validate').hasClass('btn-disabled') && this.getUI('validate').length) && !this.model.get('isOptional')) {
      if (this.model.get('addressIsValidated') === null && this.model.get('useAddressValidation')) this.getUI('error').html('You must confirm your address to continue');
      else this.getUI('error').html('Please update changes to continue');
      is_valid = false;
    }
    
    if ((this.model.getAddressString() && this.model.get('isOptional')) || !this.model.get('isOptional')) {
      this.model.setToRequired();
    } else {
      this.model.setToOptional();
    }

    return this.validateChildrenAndShowErrors() && is_valid;
  },

  setInputsToRequired() {
    this.model.get('provinceDropdownModel').set({ required: true });
    this.model.get('streetModel').set({required: true}); 
    this.model.get('cityModel').set({ required: true });
    this.model.get('postalCodeModel').set({ required: true });
    this.model.get('countryDropdownModel').set({ required: true });
  },

  unsetInputsRequired() {
    this.model.get('provinceDropdownModel').set({ required: false });
    this.model.get('streetModel').set({required: false}); 
    this.model.get('cityModel').set({ required: false });
    this.model.get('postalCodeModel').set({ required: false });
    this.model.get('countryDropdownModel').set({ required: false });
  },

  onRender() {
    const isOtherCountrySelected = this.model.get('countryDropdownModel').get('value') === 'Other';

    if (!this.model.get('selectProvinceAndCountry')) {
      this.model.get('countryDropdownModel')?.set({ disabled: true });
      this.model.get('provinceDropdownModel')?.set({ disabled: true });
    }

    this.showChildView('streetRegion', new InputView({ model: this.model.get('streetModel') }));
    this.showChildView('cityRegion', new InputView({ model: this.model.get('cityModel') }));
    this.showChildView('postalCodeRegion', new InputView({ model: this.model.get('postalCodeModel') }));
    this.showChildView('countryDropdownRegion', new DropdownView({ model: this.model.get('countryDropdownModel') }));
    if (isOtherCountrySelected) {
      this.showChildView('countryTextRegion', new InputView({ model: this.model.get('countryTextModel') }));
      this.showChildView('provinceRegion', new InputView({ model: this.model.get('provinceTextModel') }));
    } else {
      this.showChildView('provinceRegion', new DropdownView({ model: this.model.get('provinceDropdownModel') }));
    }

    // Bubble up the enter event
    const triggerEnterKeyFn = function() { this.trigger('address:enter'); };
    _.each(['streetRegion', 'cityRegion', 'postalCodeRegion'], function(regionName) {
      const view = this.getChildView(regionName);
      if (!view) {
        return;
      }
      this.stopListening(view, 'input:enter');
      this.listenTo(view, 'input:enter', triggerEnterKeyFn, this);
    }, this);
  },

  onAttach() {
    const verificationNotTouched = this.model.get('addressIsValidated') === null;
    if (!this.model.get('isOptional') && verificationNotTouched) {
      this.enableButton();
    } else {
      this.disableButton();
    }
    
    if (this.model.get('addressIsValidated')) {
      this.model.disableInputs({ render: true });
    }
  },

  template() {
    const isVerified = !!this.model.get('addressIsValidated');
    const isNotVerified = !this.model.get('addressIsValidated') && this.model.get('addressIsValidated') !== null;
    const verificationNotTouched = this.model.get('addressIsValidated') === null;
    const verifiedIcon = isVerified ? IconAddressVerified : isNotVerified ? IconAddressNotVerified : null;
    const verifiedText = isVerified ? 'Address found' : 'Address not found';
    const verifiedButtonText = isVerified || verificationNotTouched ? 'Confirm Address' : 'Update';
    const verifiedColorClass = `verified-address${isVerified ? '--verified' : '--unverified'}`;
    const showUpdateControls = this.model.get('showUpdateControls');
    const useAddressValidation = this.model.get('useAddressValidation');
    const displayVerified = isVerified || (isNotVerified && useAddressValidation);
    
    return (
      <>
        <div className={`verified-address-wrapper ${displayVerified ? '' : 'hidden' }`}>
          <img className={`verified-address-icon`} src={ verifiedIcon } />
          <span className={`verified-address-icon-label ${ verifiedColorClass }`}>{ verifiedText }</span>
          <span className={`verified-address-edit general-link ${ isVerified ? '' : 'hidden' }`}>&nbsp;- Edit address</span>
          <span className={`verified-address-retry general-link ${ !isVerified && useAddressValidation ? '' : 'hidden' }`}>&nbsp;- Retry</span>
        </div>
        <div className="country-province-wrapper">
          <div className="countryDropdownContainer"></div>
          { this.model.get('countryDropdownModel').get('value') === 'Other' ? <div className="countryTextContainer"></div> : null }
          <div className="provinceContainer"></div>
        </div>
        <div className="streetContainer"></div>
        <div className="city-postal-wrapper">
          <div className="cityContainer"></div>
          <div className="postalCodeContainer"></div>
          { (useAddressValidation && showUpdateControls) || (useAddressValidation && !showUpdateControls && (isVerified || verificationNotTouched)) ? 
          <div className="validateContainer">
            <button className="option-button selected btn-validate" onClick={() => this.addressSubmit()}>{verifiedButtonText}</button>
          </div> : null 
          }
        </div>
      <div className={`address-error error-block`}></div>
      </>
    )
  },

});

_.extend(Address.prototype, ViewJSXMixin);
export default Address;