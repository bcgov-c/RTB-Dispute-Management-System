
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import AriRemedyInformationView from './AriRemedyInformation';
import template from './AriRemedyInformations_template.tpl';

const RemedyInformationCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: AriRemedyInformationView
});

export default Marionette.View.extend({
  template,

  regions: {
    collectionRegion: '.remedy-information-collection-view'
  },

  initialize(options) {
    this.options = options || {};
  },

  hideErrorMessages() {
    this.getUI('error').html('').addClass('hidden-item');
  },

  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).removeClass('hidden-item');
  },

  validateAndShowErrors() {
    let is_valid = true;
    const collectionView = this.getChildView('collectionRegion');
    collectionView.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      is_valid = childView.validateAndShowErrors() & is_valid;
    });


    const is_own_collection_valid = this.collection.isValid();
    is_valid = is_own_collection_valid && is_valid;
    if (!is_own_collection_valid) {
      this.showErrorMessage(this.collection.validationError);
    }
    return is_valid;
  },

  onRender() {
    this.showChildView('collectionRegion', new RemedyInformationCollectionView(this.options));

  },

  templateContext() {
    return {
      
    };
  },

});
