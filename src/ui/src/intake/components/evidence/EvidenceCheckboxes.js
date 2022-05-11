import Marionette from 'backbone.marionette';
import Checkboxes from '../../../core/components/checkbox/Checkboxes';
import EvidenceCheckboxView from './EvidenceCheckbox';

const EvidenceCheckboxCollectionView = Checkboxes.extend({
  template: _.noop,
  childView: EvidenceCheckboxView,
  
  uncheckAll() {
    _.each(this.collection.where({checked: true}), function(model) {
      model.set('checked', false);
    });
  }
});


export default Marionette.View.extend({
  template: _.template(`<div class="evidence-checkbox-list"></div><div class="error-block"></div>`),

  ui: {
    error: '.error-block'
  },

  regions: {
    list: '.evidence-checkbox-list'
  },

  initialize() {
    this.listenTo(this.collection, 'change:checked', function() {
      this.getUI('error').html('');
    }, this);
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.getChildView('list').children.each(function(childView) {
      if (childView) {
        is_valid = childView.validateAndShowErrors() & is_valid;
      }
    }, this);

    const collection_valid = this.collection.isValid();
    
    if (!collection_valid) {
      this.showErrorMessage(this.collection.validationError);
    }

    return collection_valid && is_valid;
  },
  
  showErrorMessage(errorMsg) {
    this.getUI('error').html(errorMsg);
  },

  onRender() {
    this.showChildView('list', new EvidenceCheckboxCollectionView(this.options));

  }
});