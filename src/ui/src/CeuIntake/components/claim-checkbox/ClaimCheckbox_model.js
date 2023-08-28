
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
    thirdDropdown: null,
    fourthDropdown: null,

    extraValidationFn: null,
    hasRepaymentErrorFn: null
  },

  initialize() {
    const dropdownModel = this.get('dropdown');
    const secondDropdownModel = this.get('secondDropdown');
    const thirdDropdownModel = this.get('thirdDropdown');
    const fourthDropdownModel = this.get('fourthDropdown');

    [dropdownModel, secondDropdownModel, thirdDropdownModel, fourthDropdownModel].forEach(model => {
      this.listenTo(model, 'change:value', function() {
        this.trigger('dropdownChanged', model);
      }, this);
    });
    
    this.listenTo(this.get('checkbox'), 'change:checked', (model, value, options) => this.set('checked', value, options) );

    this.set('checked', this.get('checkbox').get('checked'));
  },

  setToChecked() {
    this.get('checkbox').set('checked', true);
  },

  // Gets the configured claim code from the selection
  getChosenClaimCodes() {
    if (_.isFunction(this.get('getSelectedClaimCodeOverrideFn'))) {
      return this.get('getSelectedClaimCodeOverrideFn')(this);
    }

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
    const error_obj = {};
    const checkboxModel = this.get('checkbox');
    const dropdownModel = this.get('dropdown');
    const secondDropdownModel = this.get('secondDropdown');
    const thirdDropdownModel = this.get('thirdDropdown');
    const fourthDropdownModel = this.get('fourthDropdown');

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

    if (thirdDropdownModel && checkboxModel.get('checked')) {
      if (!thirdDropdownModel.isValid()) {
        error_obj['third-dropdown'] = thirdDropdownModel.validationError;
      }
    }

    if (fourthDropdownModel && checkboxModel.get('checked')) {
      if (!fourthDropdownModel.isValid()) {
        error_obj['fourth-dropdown'] = fourthDropdownModel.validationError;
      }
    }

    if (!_.isEmpty(error_obj)) {
      return error_obj;
    }

    this.set('stepComplete', true);
  }
});
