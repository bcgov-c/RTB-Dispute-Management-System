/**
 * @class core.components.checkbox.CheckboxView
 * @memberof core.components.checkbox
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';

import template from './Checkbox_template.tpl';

import ViewMixin from '../../../core/utilities/ViewMixin';

export default Marionette.View.extend({
  template,
  className: 'form-group',

  ui: {
    input: 'input[type="checkbox"]',
    error: '.error-block'
  },

  events: {
    'click @ui.input' : 'checkboxClicked'
  },

  initialize() {
    this.listenTo(this.model, 'change:checked', function(model, value) {
      if (value) {
        this.trigger('itemComplete');
      }
    }, this);

    this.listenTo(this.model, 'render', this.render, this);
  },

  onRender() {
    if (this.model.get('helpHtml')) {
      ViewMixin.prototype.initializeHelp(this, this.model.get('helpHtml'));
    }
  },

  checkboxClicked(event) {
    this.removeErrorStyles();
    
    // Check first if Ele to ignore was clicked
    var ignoredLinkClass = this.model.get('ignoredLinkClass'),
      ignoredLinkEle = this.$('.'+ignoredLinkClass),
      source_ele = $(document.elementFromPoint(event.clientX, event.clientY));
    if (ignoredLinkClass && ignoredLinkEle.length && source_ele.is(ignoredLinkEle[0])) {
      event.stopPropagation();
      return false;
    }

    var clicked_ele = $(document.elementFromPoint(event.clientX, event.clientY));
    // Check if help icon open/close was actually the element clicked
    if (clicked_ele.is('.popover-close, .badge.help-icon')) {
      event.stopPropagation();
      return false;
    }

    this.model.set('checked', $(event.currentTarget).prop('checked'));
  },

  validateAndShowErrors() {
    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  removeErrorStyles() {
    this.getUI('error').html('');
  },

  showErrorMessage(errorMsg) {
    this.getUI('error').removeClass('warning').html(errorMsg);
  }
});
