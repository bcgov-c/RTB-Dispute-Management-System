/**
 * @class core.components.files.FileCollectionView
 * @memberof core.components.files
 * @augments Marionette.CollectionView
 */

import Marionette from 'backbone.marionette';
import FileView from './File';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: FileView,

  childViewOptions() {
    return { showDelete: this.showDelete };
  },

  initialize(options) {
    this.mergeOptions(options, ['hideUploaded', 'showDelete']);
    
    this.listenTo(this.collection, 'change:rename:value', this.removeErrorStyles, this);
  },

  filter(child) {
    return this.hideUploaded && !child.isNew() && child.isUploaded() ? false : true;
  },

  removeErrorStyles() {
    this.children.each(function(childView) {
      if (typeof childView.removeErrorStyles !== "function") {
        console.log(`[Warning] No remove error styles function defined for child view`, childView);
        return;
      }
      childView.removeErrorStyles();
    });
  },

  showErrorMessage(errorMsg) {
    this.children.each(function(childView) { 
      childView.showErrorMessage(errorMsg);
    });
  },

  // Generic collection validate children method
  validateAndShowErrors() {
    let is_valid = true;

    this.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      is_valid = childView.validateAndShowErrors() && is_valid;
    });
    return is_valid;
  }
});
