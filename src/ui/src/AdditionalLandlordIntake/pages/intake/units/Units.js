import Marionette from 'backbone.marionette';
import UnitView from './Unit';

const UnitCollectionView = Marionette.CollectionView.extend({
  childView: UnitView
});

export default Marionette.View.extend({
  template: _.template(`<div class="ari-units-list"></div><div class="error-block"></div>`),
  
  regions: {
    list: '.ari-units-list'
  },

  ui: {
    error: '.error-block'
  },

  initialize(options) {
    this.options = _.extend({}, this.options, options);
  },
  
  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).show();
  },

  hideErrorMessage() {
    this.getUI('error').html('').hide();
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.getChildView('list').children.each(function(childView) {
      if (childView) {
        is_valid = childView.validateAndShowErrors() & is_valid;
      }
    }, this);
    return is_valid;
  },

  onRender() {
    this.showChildView('list', new UnitCollectionView(this.options));
  },

});