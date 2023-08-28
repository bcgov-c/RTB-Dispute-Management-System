/**
 * @overview - View with same functionality as Radio, but supports usage of clickable icons that can be passed in rather than default radio buttons
 * @class core.components.radio.RadioModel
 * @memberof core.components.radio
 */

import ViewMixin from '../../utilities/ViewMixin';
import template from './RadioIcon_template.tpl';

const CLASS_SELECTED = 'selected';

export default ViewMixin.extend({
  template,
  tagName: 'div',
  className: 'intake-radio-icon-component',

  events: {
    'click .radio-icon' : 'radioChangeHandler'
  },

  initialize(options) {
    this.mergeOptions(options, ['deselectEnabled', 'isSingleViewMode']);

    this.listenTo(this.model, 'change:value', function() {
      this.trigger('itemComplete');
    }, this);
    this.listenTo(this.model, 'render', this.render, this);
  },

  getNextSingleViewValue(value) {
    value = value === "" ? null : value;
    const optionData = this.model.get('optionData') || [];
    const currentPositionOfValue = optionData.findIndex( (option) => option.value === value );
    let positionToUse = currentPositionOfValue + 1;
    
    if (positionToUse >= optionData.length) {
      positionToUse = 0;
    }

    return optionData[positionToUse].value;
  },

  radioChangeHandler(event) {
    if (this.model.get('disabled')) {
      event.preventDefault();
      return;
    }

    const ele = $(event.currentTarget);
    let value = ele.data('val');

    if (this._isValueDisabled(value)) {
      event.preventDefault();
      return;
    }

    if (this.isSingleViewMode) {
      value = this.getNextSingleViewValue(value);
    } else if (ele.hasClass(CLASS_SELECTED)) {
      if (this.deselectEnabled) {
        value = null;
      } else {
        event.preventDefault();
        return;
      }
    }

    this.model.set('value', value);
    this.model.set('stepComplete', true);
    this.render();
  },

  _isValueDisabled(value) {
    const valuesToDisable = this.model.get('valuesToDisable');
    return this.model.get('disabled') || ( !_.isEmpty(valuesToDisable) && _.contains(valuesToDisable, Number(value)) );
  },

  validateAndShowErrors() {
    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  showErrorMessage(errorMsg) {
    this.$('.error-block').removeClass('warning').html(errorMsg);
  },

  hideErrorMessage() {
    this.$('.error-block').html('');
  },

  templateContext() {
    return {
      isSingleViewMode: this.isSingleViewMode,
      isValueDisabledFn: _.bind(this._isValueDisabled, this)
    };
  }

});
