/**
 * @fileoverview - View that wraps multiple DropdownViews. Used for displaying dropdown's that have display logic tied to each other
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';

import template from './DoubleSelector_template.tpl';


const animationChannel = Radio.channel('animations');

export default Marionette.View.extend({
  template,

  defaultClass: 'component-double-selector',
  className() {
    return this.defaultClass;
  },

  regions: {
    firstDropdown: '.first-dropdown-container',
    secondDropdown: '.second-dropdown-container',
    otherInput: '.other-input-container',
  },

  ui: {
    secondDropdown: '.second-dropdown-container',
    otherInput: '.other-input-container',
    error: '.error-block',
    submit: '.btn-validate'
  },

  events: {
    'click @ui.submit': 'clickSubmit'
  },

  removeErrorStyles() {
    this.getUI('error').html('');
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

  clickSubmit() {
    // If a validate button is present, check that it's not disabled
    if (this.model.get('showValidate') && this.getUI('submit').hasClass('btn-disabled')) {
      return;
    }

    const is_valid = this.validateAndShowErrors(true);
    if (is_valid) {
      this._savedInput = this.model.getData();
      this.setValidateTextToUpdate();
      this.inputChanged();
      this.trigger('itemComplete');
    }
  },

  inputChanged() {
    this.removeErrorStyles();
    if (this.model.getData() === this._savedInput) {
      this.validateDisable();
    } else {
      
      // If no validate button, save changes right away
      if (!this.model.get('showValidate')) {
        this._savedInput = this.model.getData();
      }
      
      this.validateEnable();
    }
  },

  initialize() {
    this._savedInput = this.model.getData();
    this.listenTo(this.model, 'change', this.inputChanged, this);
  },

  onRender() {
    this.showChildView('firstDropdown', new DropdownView({ model: this.model.get('firstDropdownModel') }));

    if (!this.model.get('singleDropdownMode')) {
      this.showChildView('secondDropdown', new DropdownView({ model: this.model.get('secondDropdownModel') }));
    }

    if (this.model.get('enableOther')) {
      const otherRegion = this.showChildView('otherInput', new InputView({ model: this.model.get('otherInputModel') }));
      
      this.listenTo(otherRegion.currentView, 'input:enter', this.clickSubmit, this);
      this.listenTo(this.model.get('firstDropdownModel'), 'change:value', this.toggleOtherDisplay, this);
    }

    if (this.model.getData() !== null) {
      this.setValidateTextToUpdate();
    }
  },

  toggleOtherDisplay() {
    const alwaysOptional = this.model.get('alwaysOptional');
    if (this.model.isOtherModeSelected()) {
      this.model.get('otherInputModel').set('required', !alwaysOptional);
      if (!this.model.get('singleDropdownMode')) {
        this.model.get('secondDropdownModel').set('required', false);
      }
      this.switchDisplayToOther();
    } else {
      this.model.get('otherInputModel').set('required', false);
      if (!this.model.get('singleDropdownMode')) {
        this.model.get('secondDropdownModel').set('required', !alwaysOptional);
      }
      this.switchDisplayToStandard();
    }
  },

  switchDisplayToOther() {
    if (!this.model.get('singleDropdownMode')) {
      animationChannel.request('queue', this.getUI('secondDropdown'), 'fadeOut', { duration: 50 });
    }
    animationChannel.request('queue', this.getUI('otherInput'), 'fadeIn', { duration: 200 });
  },

  switchDisplayToStandard() {
    animationChannel.request('queue', this.getUI('otherInput'), 'fadeOut', { duration: 50 });

    if (!this.model.get('singleDropdownMode')) {
      animationChannel.request('queue', this.getUI('secondDropdown'), 'fadeIn', { duration: 200 });
    }
  },

  templateContext() {
    return {
      isOtherMode: this.model.isOtherModeSelected()
    }
  },

  showErrorMessage(error_msg) {
    this.getUI('error').html(error_msg);
  },

  validateAndShowErrors(skip_disable_check) {
    // If Validate Button option is enabled, perform that check first
    if (!skip_disable_check && this.model.get('showValidate') && !this.getUI('submit').hasClass('btn-disabled')) {
      this.showErrorMessage('Please update changes to continue');
      return false;
    }
    const firstView = this.getChildView('firstDropdown');
    const secondView = this.getChildView('secondDropdown');
    const inputView = this.getChildView('otherInput');
    
    return firstView.validateAndShowErrors() &&
        (this.model.isOtherModeSelected() ? inputView.validateAndShowErrors() :
          this.model.get('singleDropdownMode') ? true : secondView.validateAndShowErrors());
  },

});