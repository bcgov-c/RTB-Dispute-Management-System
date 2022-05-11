/**
 * @class core.components.textarea.TextareaModel
 * @memberof core.components.textarea
 */


import Backbone from 'backbone';

const typeRegex = {
  // Strip HTML characters by default
  html__restricted_chars: '\\<\\>'
};

export default Backbone.Model.extend({
  defaults: {
    labelText: '',
    value: '',
    helpName: null,
    helpHtml: null,
    restrictHtml: true,
    max: 1000,
    min: null,
    showInputEntry: false,
    disabled: false,
    required: false,
    countdown: false,
    showValidate: false,
    stepComplete: false,
    cssClass: null,
    apiMapping: null,
    errorMessage: 'Input is required',

    displayRows: 5
  },

  applyCharacterRestrictions(value) {
    const allRestrictedChars = this.get('restrictHtml') ? typeRegex.html__restricted_chars : [];
    if (allRestrictedChars.length) {
      value = value.replace(new RegExp('['+allRestrictedChars+']', 'g'), '');
    }
    return value;
  },

  validate(attrs) {
    if (attrs.required && (attrs.value === '' || attrs.value === null)) {
      this.set('stepComplete', false);
      return attrs.errorMessage ? attrs.errorMessage : 'Please enter text';
    } else if (attrs.max && attrs.max > 0 && attrs.value !== null && attrs.value.length > attrs.max) {
      this.set('stepComplete', false);
      return 'Too many characters entered';
    } else if (attrs.min && attrs.value && attrs.value.length < attrs.min) {
      this.set('stepComplete', false);
      return 'Please enter at least ' + attrs.min + ' characters';
    }

    this.set('stepComplete', true);
  },


  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'value';
    const return_obj = {};
    return_obj[mapping_attr] = this.getData({ parse: true });
    return return_obj;
  },


  getData(options) {
    options = options || {};
    return options.parse ? $.trim(this.get('value')) : this.get('value');
  }
});
