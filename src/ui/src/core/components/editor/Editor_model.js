/**
 * @class core.components.editor.EditorModel
 * @memberof core.components.editor
 * @augments Backbone.Model
 */

import Backbone from 'backbone';

const EDITOR_TABLE_CLASS = 'editor-table';
const EMAIL_EDITOR_TABLE_CLASS = 'body-table';

export default Backbone.Model.extend({
  defaults: {
    theme: 'default',
    value: null,
    required: false,
    errorMessage: null,
    disabled: false,
    labelText: '',
    maxLength: null,
    bottomControl: false,
    withGeneratedContent: false,
    withAutoText: false,
    trumbowygOptions: false,
    withTable: false,
    isEmailable: false,
    appendExtraHtml: null,
    apiMapping: null
  },

  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'value';
    const return_obj = {};
    return_obj[mapping_attr] = this.getData();
    return return_obj;
  },

  getEditorTableClass() {
    return this.get('isEmailable') ? EMAIL_EDITOR_TABLE_CLASS : EDITOR_TABLE_CLASS;
  },

  // Deprecated, will possibly be un-unsed
  _filter_appendExtraHtml(htmlString) {
    const trimmedExtraHtmlString = $.trim(this.get('appendExtraHtml'));
    return trimmedExtraHtmlString !== '' ? $(`<div>${htmlString}</div>`).append(trimmedExtraHtmlString).html() : htmlString;
  },

  getData() {
    const val = this.get('value');
    if ($.trim(val) === '') {
      return null;
    }
    return val;
  },
  
  validate() {
    const trimmedVal = $.trim(this.get('value'));
    const trimmedLen = trimmedVal.length;
    if (this.get('required') && trimmedVal === '') {
      return this.get('errorMessage') || "Please enter text";
    } else if (this.get('maxLength') && trimmedLen > this.get('maxLength')) {
      return `The current content results in ${trimmedLen} character${trimmedLen==1?'':'s'} of html.  Please ensure html is ${this.get('maxLength')} characters or fewer.`;
    }
  }

});
