/**
 * @class core.components.checkbox.CheckboxCollectionView
 * @memberof core.components.checkbox
 * @augments Marionette.CollectionView
 */

import Marionette from 'backbone.marionette';
import CheckboxView from './Checkbox';

const checkboxErrorClass = 'checkboxes-error-block';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: CheckboxView,
  className() {
    return `intake-checkboxes-component ${this.cssClass? this.cssClass : ''}`;
  },

  initialize() {
    this.listenTo(this.collection, 'change:checked', this.removeErrorStyles, this);
    this.listenTo(this.collection, 'render', this.render, this);
  },

  removeErrorStyles() {
    this.$(`.${checkboxErrorClass}`).remove();
  },

  validateAndShowErrors() {
    this.removeErrorStyles();
    const is_valid = this.collection.isValid();
    if (is_valid) {
      this.removeErrorStyles();
    } else {
      this.showErrorMessage(this.collection.validationError);
    }
    return is_valid;
  },

  showErrorMessage(errorMsg) {
    this.$el.append(`<div class="${checkboxErrorClass} error-block">${errorMsg}</div>`);
  },

  onBeforeRender() {
    // Remove any errors that were manually applied.  This is needed because template: _.noop, and errors are being html-added
    this.$(`.${checkboxErrorClass}`).remove();
  },
});
