
import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    hidden: false,
    cssClass: null,
    stepComplete: false,
    claimCode: null,
    checkbox: null,
    dropdown: null,
    secondDropdown: null,
  },

  initialize() {
    const dropdownModel = this.get('dropdown'),
      secondDropdownModel = this.get('secondDropdown'),
      self = this;

    if (dropdownModel) {
      this.listenTo(dropdownModel, 'change:value', function() {
        this.trigger('dropdownChanged', this);
      }, this);
    }

    if (secondDropdownModel) {
      this.listenTo(secondDropdownModel, 'change:value', function() {
        this.trigger('dropdownChanged', this);
      }, this);
    }

    this.listenTo(this.get('checkbox'), 'change:checked', function(model, value, options) { self.set('checked', value, options); });

    this.set('checked', this.get('checkbox').get('checked'));
  },

  setToChecked() {
    this.get('checkbox').set('checked', true);
  },

  // Gets the configured claim code from the selection
  getChosenClaimCodes() {
    const claimCode = this.get('claimCode');
    let selectedClaimCodes = claimCode || [];

    if (_.isObject(claimCode)) {
      const selectedDropdownValue = this.get('dropdown').get('value');
      const secondDropdownClaimSelectors = this.get('secondDropdownClaimSelectors');
      if (_.isObject(secondDropdownClaimSelectors)) {
        const selectedSecondDropdownValue = this.get('secondDropdown').get('value');
        if (_.has(secondDropdownClaimSelectors, selectedSecondDropdownValue)) {
          selectedClaimCodes = secondDropdownClaimSelectors[selectedSecondDropdownValue](selectedDropdownValue);
        }
      } else {
        selectedClaimCodes = claimCode[selectedDropdownValue];
      }
    }

    return _.filter((!_.isArray(selectedClaimCodes) ? [selectedClaimCodes] : selectedClaimCodes), function(code) { return code; });
  },

  validate() {
    const error_obj = {},
      checkboxModel = this.get('checkbox'),
      dropdownModel = this.get('dropdown'),
      secondDropdownModel = this.get('secondDropdown');

    if (!checkboxModel.isValid()) {
      error_obj.checkbox = checkboxModel.validationError;
    }

    if (dropdownModel && checkboxModel.get('checked')) {
      if (!dropdownModel.isValid()) {
        error_obj.dropdown = dropdownModel.validationError;
      }
    }

    if (secondDropdownModel && checkboxModel.get('checked')) {
      if (!secondDropdownModel.isValid()) {
        error_obj['second-dropdown'] = secondDropdownModel.validationError;
      }
    }

    if (!_.isEmpty(error_obj)) {
      return error_obj;
    }

    this.set('stepComplete', true);
  }
});
