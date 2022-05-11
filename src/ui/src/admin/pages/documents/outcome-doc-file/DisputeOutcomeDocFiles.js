import Marionette from 'backbone.marionette';
import DisputeOutcomeDocFileView from './DisputeOutcomeDocFile';

const EmptyDisputeOutcomeDocFileView = Marionette.View.extend({
  template: _.template('<%= msg %>'),
  className: 'standard-list-empty',

  templateContext() {
    return {
      msg: this.getOption('emptyMessage') || 'No outcome documents added'
    };
  }
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  emptyView: EmptyDisputeOutcomeDocFileView,
  childView: DisputeOutcomeDocFileView,

  emptyViewOptions() {
    return {
      emptyMessage: this.emptyMessage
    };
  },

  initialize(options) {
    this.mergeOptions(options, ['emptyMessage']);
  },

  switchToEditState() {
    this.children.each(function(child) {
      if (_.isFunction(child.switchToEditState)) {
        child.switchToEditState();
      }
    });
  },

  resetModelValues() {
    this.children.each(function(child) {
      if (_.isFunction(child.resetModelValues)) {
        child.resetModelValues();
      }
    });
  },

  saveInternalDataToModel() {
    this.children.each(function(child) {
      if (_.isFunction(child.saveInternalDataToModel)) {
        child.saveInternalDataToModel();
      }
    });
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(child) {
      if (_.isFunction(child.validateAndShowErrors)) {
        is_valid = is_valid & child.validateAndShowErrors();
      }
    });
    return is_valid;
  },

});
