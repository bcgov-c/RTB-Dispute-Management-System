import Marionette from 'backbone.marionette';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import template from './ClaimCheckbox_template.tpl';

export default Marionette.View.extend({
  template,

  regions: {
    checkboxRegion: '.checkbox',
    dropdownRegion: '.dropdown',
    secondDropdownRegion: '.second-dropdown',
    thirdDropdownRegion: '.third-dropdown',
    fourthDropdownRegion: '.fourth-dropdown',
  },

  ui: {
    dropdown: '.dropdown',
    'second-dropdown': '.second-dropdown',
    'third-dropdown': '.third-dropdown',
    'fourth-dropdown': '.fourth-dropdown',
  },

  DEFAULT_ACCORDION_DURATION: 300,

  initialize() {
    this.listenTo(this.model, 'change:checked', function() {
      if (this.model.get('dropdown')) {
        this.toggleDropdownDisplay();
      }
    }, this);

    this.listenTo(this.model, 'render', this.render, this);

    const dropdownChangeFn = this.model.get('getDropdownChangeFn');
    this.listenTo(this.model, 'dropdownChanged', function(dropdownModel) {
      if (typeof dropdownChangeFn === 'function') {
        console.log("dropdown changed", this.model);
        dropdownChangeFn.call(this, this.model, dropdownModel);
      }

      // Clear all error messages when a dropdown gets a changed value
      _.each(this.regions, function(selector, region) {
        const childView = this.getChildView(region);
        if (childView && _.isFunction(childView.removeErrorStyles)) {
          childView.removeErrorStyles();
        }
      }, this);
    }, this);
  },

  toggleDropdownDisplay(options) {
    const delay_time = options ? options.duration : this.DEFAULT_ACCORDION_DURATION;

    this.getUI('dropdown').animate({height: 'toggle'}, delay_time);
    this.getUI('second-dropdown').animate({height: 'toggle'}, delay_time);
    this.getUI('third-dropdown').animate({height: 'toggle'}, delay_time);
    this.getUI('fourth-dropdown').animate({height: 'toggle'}, delay_time);
  },


  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      console.log(childView);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, region);
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }

      if (!childView.$el) {
        console.log(`[Warning] No childView element rendered in DOM to valdiate`, childView);
        return;
      }
      if (!childView.$el.is(':visible')) {
        console.log(`[Info] Skipping validation on hidden childView`, childView);
        return;
      }

      is_valid = childView.validateAndShowErrors() && is_valid;
    }, this);

    if (_.isFunction(this.model.get('extraValidationFn'))) {
      const errorObject = this.model.get('extraValidationFn')(this.model) || {};
      is_valid = _.isEmpty(errorObject) && is_valid;

      Object.keys(errorObject).forEach(key => {
        if (_.has(this.regions, key)) {
          const childView = this.getChildView(key);
          if (childView && childView.isRendered() && _.isFunction(childView.showErrorMessage)) {
            childView.showErrorMessage(errorObject[key]);
          }
        }
      });
    }

    return is_valid;
  },

  onRender() {
    if (this.model.get('hidden')) {
      return;
    }
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.model.get('checkbox') }));

    this.renderDropdown('dropdownRegion', this.model.get('dropdown'));
    this.renderDropdown('secondDropdownRegion', this.model.get('secondDropdown'));
    this.renderDropdown('thirdDropdownRegion', this.model.get('thirdDropdown'));
    this.renderDropdown('fourthDropdownRegion', this.model.get('fourthDropdown'));
  },

  renderDropdown(regionName, dropdownModel) {
    if (dropdownModel) {
      this.showChildView(regionName, new DropdownView({ model: dropdownModel }));
    }
  }
});
