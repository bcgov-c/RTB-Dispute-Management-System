import Marionette from 'backbone.marionette';
import IntakeCeuUnit from './IntakeCeuUnit';

const UnitCollectionView = Marionette.CollectionView.extend({
  childView: IntakeCeuUnit,
  childViewOptions() {
    return {
      applicantSelectText: this.getOption('applicantSelectText'),
      applicantSelectHelp: this.getOption('applicantSelectHelp'),
      enableUnitType: this.getOption('enableUnitType'),
    }
  }
});

export default Marionette.View.extend({
  template: _.template(`<div class="ceu-units-list"></div><div class="error-block"></div>`),
  
  regions: {
    list: '.ceu-units-list'
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