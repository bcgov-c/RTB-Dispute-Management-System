/**
 * @class core.components.address.AddressView
 * @memberof core.components.address
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';
import InputView from '../input/Input';
import DropdownView from '../dropdown/Dropdown';
import template from './Address_template.tpl';

/**
 * @class AddressView
 * @memberof core.components.address
 */
export default Marionette.View.extend({
  template,
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
    submit: '.btn-validate',
    error: '.address-error'
  },

  events: {
    'click @ui.submit' : 'addressSubmit'
  },

  addressSubmit() {
    if (this.getUI('submit').hasClass('btn-disabled')) {
      return;
    }
    if (this.validateChildrenAndShowErrors()) {
      this._savedAddress = this.model.getAddressString();
      this.setValidateTextToUpdate();
      // Trigger an address change since we've saved the current value
      this.onAddressChange();
      this.trigger('itemComplete');
    }
    return false;
  },

  initialize(options) {
    this.mergeOptions(options, ['overrideBootstrapStyles', 'useFlatLayout']);
    
    this._savedAddress = this.model.getAddressString();
    this.setupListeners();
  },

  setupListeners() {
    if (this.model.get('showValidate')) {
      this.listenTo(this.model, 'change', this.onAddressChange, this);
      this.on('address:enter', this.addressSubmit, this);
    }

    this.listenTo(this.model.get('countryDropdownModel'), 'change:value', this.render, this);
  },

  onAddressChange() {
    this.getUI('error').html('');
    if (this._isAddressChanged()) {
      this.validateEnable();
    } else {
      this.validateDisable();
    }
  },

  _isAddressChanged() {
    return this._savedAddress !== this.model.getAddressString();
  },

  validateEnable() {
    this.getUI('submit').removeClass('btn-disabled');
  },

  validateDisable() {
    this.getUI('submit').addClass('btn-disabled');
  },

  setValidateTextToUpdate() {
    this.getUI('submit').text('Update');
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
    if (this.model.get('showValidate') && !this.getUI('submit').hasClass('btn-disabled')) {
      this.getUI('error').html('Please update changes to continue');
      is_valid = false;
    }
    return this.validateChildrenAndShowErrors() && is_valid;
  },

  onRender() {
    this.showChildView('streetRegion', new InputView({ model: this.model.get('streetModel') }));
    this.showChildView('cityRegion', new InputView({ model: this.model.get('cityModel') }));
    this.showChildView('postalCodeRegion', new InputView({ model: this.model.get('postalCodeModel') }));

    if (!this.model.get('useDefaultProvince')) {
      this.showChildView('countryDropdownRegion', new DropdownView({ model: this.model.get('countryDropdownModel') }));
      if (this.model.get('countryDropdownModel').get('value') === 'Other') {
        this.showChildView('countryTextRegion', new InputView({ model: this.model.get('countryTextModel') }));
        this.showChildView('provinceRegion', new InputView({ model: this.model.get('provinceTextModel') }));
      } else {
        this.showChildView('provinceRegion', new DropdownView({ model: this.model.get('provinceDropdownModel') }));
      }
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

    if (!this.model.isEmpty()) {
      this.setValidateTextToUpdate();
    }
  },

  templateContext() {
    return {
      useFlatLayout: this.useFlatLayout,
      useBootstrapStyles: !this.overrideBootstrapStyles
    };
  }

});
