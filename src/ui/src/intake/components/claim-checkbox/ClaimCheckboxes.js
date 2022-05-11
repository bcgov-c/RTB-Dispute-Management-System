
import Marionette from 'backbone.marionette';

import CheckboxCollectionView from '../../../core/components/checkbox/Checkboxes';

import ClaimCheckbox from './ClaimCheckbox';

const ClaimCheckboxCollectionView = CheckboxCollectionView.extend({
  template: _.noop,
  childView: ClaimCheckbox,

  // Only show non-hidden views
  filter(model) {
    return !model.get('hidden');
  },
});


export default Marionette.View.extend({
  template: _.template(`<div class="claim-checkbox-container"></div><p class="error-block"></p>`),
  tagName: 'div',
  className() {
    return 'intake-claim-checkboxes-component';
  },

  regions: {
    claimCheckboxes: '.claim-checkbox-container',
  },

  ui: {
    error: '> .error-block'
  },

  initialize() {
    this.collection.on('dropdownChanged', this.clearErrors, this);
    this.collection.on('change:checked', this.clearErrors, this);
  },

  clearErrors() {
    this.getUI('error').html('');
  },

  onRender() {
    this.showChildView('claimCheckboxes', new ClaimCheckboxCollectionView({ collection: this.collection }));
  },

  showErrorMessage(errorMsg) {
    // Show own error message
    this.getUI('error').html(errorMsg);
  },

  checkboxClicked(event) {
    CheckboxCollectionView.prototype.checkboxClicked.call(this);
    var ele = $(event.currentTarget);
    ele.closest('.intake-checkbox').find('.error-block').html('');
    this.getUI('error').html('');
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.getChildView('claimCheckboxes').children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      console.log(childView);
      is_valid = childView.validateAndShowErrors() && is_valid;
    });

    const is_own_collection_valid = this.collection.isValid();
    is_valid = is_own_collection_valid && is_valid;
    if (!is_own_collection_valid) {
      this.showErrorMessage(this.collection.validationError);
    }
    return is_valid;
  },

  uncheckAll() {
    _.each(this.collection.where({checked: true}), function(model) {
      model.set('checked', false);
    });
  }


});
