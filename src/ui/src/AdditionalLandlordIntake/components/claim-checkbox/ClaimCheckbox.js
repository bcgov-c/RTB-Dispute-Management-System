
import Marionette from 'backbone.marionette';

import CheckboxView from '../../../core/components/checkbox/Checkbox';
import DropdownView from '../../../core/components/dropdown/Dropdown';

import template from './ClaimCheckbox_template.tpl';

export default Marionette.View.extend({
  template,

  regions: {
    checkboxRegion: '.checkbox',
    dropdownRegion: '.dropdown',
    secondDropdownRegion: '.second-dropdown'
  },

  ui: {
    dropdown: '.dropdown',
    'second-dropdown': '.second-dropdown'
  },

  DEFAULT_ACCORDION_DURATION: 300,

  initialize() {
    this.listenTo(this.model, 'change:checked', function() {
      if (this.model.get('dropdown')) {
        this.toggleDropdownDisplay();
      }
    }, this);

    this.listenTo(this.model, 'render', this.render, this);
  },

  onRender() {
    if (this.model.get('hidden')) {
      return;
    }
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.model.get('checkbox') }));
    if (this.model.get('dropdown')) {
      this.showChildView('dropdownRegion', new DropdownView({ model: this.model.get('dropdown') }));
    }
    if (this.model.get('secondDropdown')) {
      this.showChildView('secondDropdownRegion', new DropdownView({ model: this.model.get('secondDropdown') }));
    }
  },

  toggleDropdownDisplay(options) {
    const delay_time = options ? options.duration : this.DEFAULT_ACCORDION_DURATION;

    this.getUI('dropdown').animate({height: 'toggle'}, delay_time);
    this.getUI('second-dropdown').animate({height: 'toggle'}, delay_time);
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

    return is_valid;
  }
});
