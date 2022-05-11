/**
 * @class core.components.dropdown.DropdownCollectionView
 * @memberof core.components.dropdown
 * @augments Marionette.CollectionView
 */

import Marionette from 'backbone.marionette';
import DropdownView from './Dropdown';
//import template from './DropdownCollectionView_template.tpl';

const dropdownErrorClass = 'dropdown-error-block';

export default Marionette.CollectionView.extend({
  childView: DropdownView,
  
  template: _.noop,

  className() {
    return `intake-dropdown-collection-component ${this.cssClass? this.cssClass : ''}`;
  },

  initialize() {
    this.listenTo(this.collection, 'change:value', this.removeErrorStyles, this);
  },

  removeErrorStyles() {
    this.$(`.${dropdownErrorClass}`).remove();
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
    this.$el.append(`<div class="${dropdownErrorClass} error-block">${errorMsg}</div>`);
  }
});
