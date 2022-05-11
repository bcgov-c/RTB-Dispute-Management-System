/**
 * @class core.components.dropdown.DropdownModel
 * @memberof core.components.dropdown
 * @augments Backbone.Model
 */

import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    beforeClick: null,
    optionData: [],
    value: null,
    labelText: null,
    helpHtml: null,
    cssClass: null,
    required: false,
    disabled: false,
    defaultBlank: false,
    stepComplete: false,

    clearWhenHidden: false,
    customLink: null,
    customLinkFn: null,
    showRemovalButton: false,
    displayTitle: null,

    apiMapping: false
  },

  initialize() {
    let initialValue = null;
    if (this.get('value') === null) {
      if (this.get('defaultBlank') === true) {
        initialValue = '';
      } else if (this.get('optionData') && this.get('optionData').length > 0) {
        initialValue = this.get('optionData')[0].value;
      }
      this.set('value', initialValue);
    }
  },

  validate() {
    if (this.get('required') && ($.trim(this.get('value')) === "" || $.trim(this.getSelectedText()) === "")) {
      return this.get('errorMessage') || "Please select an option";
    }
  },

  // Does not reset to any API value
  clearModelValue() {
    this.set('value', null);
  },

  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'value',
      return_obj = {};
    return_obj[mapping_attr] = this.getData({ parse: true });
    return return_obj;
  },

  getData(options) {
    options = options || {};
    let val = this.get('value');
    if (options.parse) {
      // NOTE: Dropdowns are difficult in that they have to store strings
      // Automatically parse out booleans and ints
      if (val === 'blank' || val === '') {
        val = null;
      } else if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      }
      const int_value = parseInt(val);
      if (!_.isNaN(int_value)) {
        val = int_value;
      }
    }
    return val;
  },

  getSelectedOption() {
    const val = String(this.get('value'));
    const selectedOption = _.find(this.get('optionData'), function(config_obj) {
      return String(config_obj.value) === val;
    });
    return selectedOption ? selectedOption : null;
  },

  getSelectedText() {
    const selectedOption = this.getSelectedOption();
    return selectedOption ? selectedOption.text : null;
  }
});
