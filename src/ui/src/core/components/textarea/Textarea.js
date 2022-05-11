/**
 * @class core.components.textarea.TextareaView
 * @memberof core.components.textarea
 */

import ViewMixin from '../../utilities/ViewMixin';
import template from './Textarea_template.tpl';

export default ViewMixin.extend({
  template,
  defaultClass: 'intake-textarea-component form-group',

  ui: {
    input: 'textarea',
    error: '.error-block',
    container: '.form-group',
    submit: '.btn-validate',
    countdown: '.textarea-countdown .countdown-value'
  },

  // Pass along these change events from <textarea> element to View, so that View can attach listeners if needed
  triggers: {
    'blur @ui.input' : 'blur',
    'focus @ui.input' : 'focus',
    'change @ui.input' : 'change',
    'keyup @ui.input' : 'keyup',
    'input @ui.input' : 'input',
    'propertychange @ui.input': 'propertychange'
  },

  events: {
    'blur @ui.input': 'inputBlur',
    'change @ui.input': 'inputChanged',
    'keyup @ui.input': 'inputChanged',
    'input @ui.input': 'inputChanged',
    'propertychange @ui.input': 'inputChanged',

    'click @ui.submit': 'saveInput'
  },

  inputBlur(event) {
    if (this.disableOnBlurAction) {
      return;
    }

    this.getUI('input').val($.trim(this.getUI('input').val()));
    this.inputChanged(event);
  },

  inputChanged(event) {
    this.getUI('error').html('');
    this.getUI('container').removeClass('has-error');
    const uiValue = $(event.currentTarget).val();
    const cleanedValue = this.model.applyCharacterRestrictions(uiValue);

    if (uiValue !== cleanedValue) {
      // If the replace / removal of characters changed the original string, update the UI
      this.getUI('input').val(cleanedValue);
    }

    if (this.model.get('countdown')) {
      // Newlines are seen as two characters by textarea's "maxlength", so factor that into textarea length
      let newLines = cleanedValue.match(/\n/g);
      newLines = newLines !== null ? newLines.length : 0;
      const contentLength = cleanedValue.length + newLines;
      this.getUI('countdown').text(Math.max(this.model.get('max') - contentLength, 0));
    }

    this.model.set('value', uiValue);
  },

  // This is only called when Validate Button is enabled
  saveInput() {
    if (this.getUI('submit').hasClass('btn-disabled')) {
      return;
    }

    const error_msg = this.model.validate(this.model.attributes);
    if (error_msg) {
      this.showErrorMessage(error_msg);
    } else {
      this._savedInput = this.model.get('value');
      this.setValidateTextToUpdate();
      this.inputChanged();
      this.trigger('itemComplete');
    }
  },


  initialize(options) {
    this.mergeOptions(options, ['disableOnBlurAction', 'autofocus']);

    this.listenTo(this.model, 'render', this.render, this);
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

  focus() {
    console.log(this.getUI('input'));
    this.getUI('input').focus();
  },

  removeErrorStyles() {
    this.getUI('container').removeClass('has-error');
    this.getUI('error').html('');
  },

  // Displays an error message
  showErrorMessage(error_msg) {
    this.getUI('container').addClass('has-error');
    this.getUI('error').html(error_msg);
  },

  validateAndShowErrors() {
    // If Validate Button option is enabled, perform that check first
    if (this.model.get('showValidate') && !this.getUI('submit').hasClass('btn-disabled')) {
      this.getUI('error').html('Please update changes to continue');
      return false;
    }

    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  onRender() {
    if (this.model.get('value') !== null) {
      this.setValidateTextToUpdate();
    }
  },

  templateContext() {
    return {
      autofocus: this.autofocus,
    };
  }
});
