/**
 * @class core.components.checkbox.CheckboxModel
 * @memberof core.components.checkbox
 * @augments Backbone.Model
 */

import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    html: null,
    helpName: null,
    helpHtml: null,
    errorMessage: 'Accept to continue',
    checked: false,
    disabled: false,
    required: false,
    ignoredLinkClass: null,
    hidden: false,
    cssClass: null,
    stepComplete: false,
    value: null
  },

  validate() {
    if (this.get('required') && this.get('checked') !== true) {
      return this.get('errorMessage');
    }
  },

  // Does not reset to any API value
  clearModelValue() {
    this.set('checked', null);
  },

  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'checked',
      return_obj = {};
    return_obj[mapping_attr] = this.getData({ parse: true });
    return return_obj;
  },

  getData(options) {
    options = options || {};
    let val = this.get('checked');
    // Checkboxes often map to API 0/1 bit fields instead of true/false
    if (options.parse) {
      if (val === true) {
        val = 1;
      } else if (val === false) {
        val = 0;
      }
    }
    return val;
  }
});
