/**
 * @class core.components.dropdown.DropdownView
 * @memberof core.components.dropdown
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';
import ViewMixin from '../../utilities/ViewMixin';
import template from './Dropdown_template.tpl';

export default Marionette.View.extend({
  template,
  tagName: 'div',
  defaultClass: 'intake-dropdown-component form-group',
  className() {
    const extraCssClasses = this.model.get('cssClass');
    return this.defaultClass + ' ' + (extraCssClasses ? extraCssClasses : '');
  },

  ui: {
    container: '.form-group',
    error: '.error-block',
    select: 'select',
    remove: '.dropdown-remove',
    customLink: '.dropdown-model-custom-link'
  },

  events() {
    return _.extend({
      'change @ui.select': 'optionChanged',
      'click @ui.select': 'optionClicked',
      'click @ui.remove': 'clickRemove',
    }, this.model.get('customLinkFn') ?
      // NOTE: The custom link function is run in the context of the dropdown's model by default
      { 'click @ui.customLink': _.bind(this.model.get('customLinkFn'), this.model) }
    : {});
  },

  clearInputSelectionAndRender() {
    this.model.set({
      value: null,
      stepComplete: false
    });
    this.render();
  },

  clickRemove() {
    const collection = this.model.collection;
    if (collection) {
      collection.remove(this.model);
    }
  },

  optionChanged(event) {
    const triggerSelection = () => {
      this.removeErrorStyles();
      this.model.set('value', $(event.currentTarget).val());
      this.model.set('stepComplete', true);
      this.trigger('itemComplete');
    };

    const beforeClick = this.model.get('beforeClick');

    const currValue = this.model.get('value');
    const nextValue = $(event.currentTarget).val();

    if (typeof beforeClick === 'function') {
      const beforeClickPromise = beforeClick(currValue, nextValue) || false; // If function returns true, change selection

      beforeClickPromise
        .then((changeSelection) => {
          if (changeSelection) {
            triggerSelection();
          } else {
            $(event.currentTarget).val(currValue);
          }
        })
        .catch(() => {
          console.log('[Notice] Selection cancelled');
        });
    } else {
      triggerSelection();
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['displayTitle']);

    this.listenTo(this.model, 'render', this.render, this);
  },

  removeErrorStyles() {
    this.getUI('error').html('');
    this.getUI('container').removeClass('has-error');
  },

  // Displays an error message
  showErrorMessage(error_msg) {
    this.getUI('container').addClass('has-error');
    this.getUI('error').html(error_msg);
  },

  validateAndShowErrors() {
    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  isActive() {
    return this.$el.is(':visible');
  },

  onRender() {
    ViewMixin.prototype.initializeHelp(this, this.model.get('helpHtml'));
  },

  templateContext() {
    return {
      displayTitle: this.displayTitle || this.model.get('displayTitle')
    };
  }

});
