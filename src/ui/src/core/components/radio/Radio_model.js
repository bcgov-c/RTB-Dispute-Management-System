/**
 * @class core.components.radio.RadioModel
 * @memberof core.components.radio
 */

import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    optionData: [],
    value: null,
    stepComplete: false,
    cssClass: null,
    helpHtml: null,
    disabled: false,
    valuesToDisable: []
  },

  validate() {
    if (this.get('required') && (this.get('value') === undefined || this.get('value') === null)) {
      return "Please select an option";
    }
  },

  // Does not reset to any API value
  clearModelValue() {
    this.set('value', null);
  },

  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'value';
    const return_obj = {};
    return_obj[mapping_attr] = this.getData();
    return return_obj;
  },

  getData() {
    return this.get('value');
  },

  getSelectedText() {
    const val = this.get('value');
    const selectedOption = _.find(this.get('optionData'), (options) => options.value === val);
    return selectedOption ? selectedOption.text : null;
  },

  getSelectedOption() {
    const val = String(this.get('value'));
    const selectedOption = _.find(this.get('optionData'), function(config_obj) {
      return String(config_obj.value) === val;
    });
    return selectedOption ? selectedOption : null;
  },
});
