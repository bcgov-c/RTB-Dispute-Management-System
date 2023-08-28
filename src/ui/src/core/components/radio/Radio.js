/**
 * @fileoverview - Customizable View that displays radio buttons
 * @class core.components.radio.RadioModel
 * @memberof core.components.radio
 */

import ViewMixin from '../../utilities/ViewMixin';
import template from './Radio_template.tpl';

export default ViewMixin.extend({
  template,
  tagName: 'div',
  className: 'intake-radio-component form-group',

  events: {
    'click input[type=radio]' : 'radioChangeHandler'
  },

  radioChangeHandler(event) {
    const ele = $(event.currentTarget);
    let value = ele.val();
    
    if (this._isValueDisabled(value)) {
      event.preventDefault();
    } else {
      if (value.match(/^\d+$/)) {
        value = parseInt(value);
      }

      this.model.set('value', value);
      this.model.set('stepComplete', true);
      this.hideErrorMessage();
    }
  },

  /**
   * @param {RadioModel} model
   * @param {String} [displayTitle] - Text to display above radio buttons
   */

  initialize(options) {
    this.mergeOptions(options, ['displayTitle']);
    this.listenTo(this.model, 'change:value', function() {
      this.trigger('itemComplete');
    }, this);
    this.listenTo(this.model, 'render', this.render, this);
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
      name: this.model.get('name') ? this.model.get('name') : `radio-${this.cid}`,
      displayTitle: this.displayTitle ? this.displayTitle : null,
      isValueDisabledFn: _.bind(this._isValueDisabled, this)
    };
  }

});
