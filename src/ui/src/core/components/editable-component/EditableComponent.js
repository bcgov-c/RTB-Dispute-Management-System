/**
 * This component allows easy switching between an "edit" state and a "view" state for a nested model/view.
 * @class core.components.editable-component.EditableComponentView
 * @memberof core.components.editable-component
 * @augments Marionnete.View
 * @fileoverview - Wrapper for other DMS input components that switches between input and view mode
 * TODO: Refactor - update variables to camelCase
 */

import Marionette from 'backbone.marionette';
import { ParentViewMixin } from '../../utilities/ParentViewMixin';
import template from './EditableComponent_template.tpl';

const EditableComponentView = Marionette.View.extend({
  template,

  tagName: 'div',
  className: 'rtb-editable-component',

  regions: {
    editRegion: '.rtb-editable-component-editstate'
  },

  ui: {
    editableContainer: '.rtb-editable-component-editstate'
  },

  state: 'view',
  label: null,
  view_value: null,
  is_disabled: false,
  subView: null,
  defaultDisabledMessage: null, //TODO: unused?
  _disabledMessage: null, //TODO: unused?

  /**
   * 
   * @param {Boolean} [is_disabled] - enables/disables sub view
   * @param {String} [state] - edit|view|hidden. edit displays input subview, view displays the value of subview, hidden hides the subview
   * @param {String} [label] - label for editable component wrapper
   * @param {Number|String|Boolean} [view_value] - value of subview to display
   * @param {String} [view_class] - css class wrapper
   * @param {Marionette.View} subView - view to wrap, must be a core DMS input
   */

  initialize(options) {
    this.mergeOptions(options, ['is_disabled', 'state', 'label', 'view_value', 'view_class', 'subView', 'defaultDisabledMessage', '_disabledMessage']);

    if (!this.subView) {
      console.log(`[Error] Created an EditableComponent without a subView`);
    }

    this._original_value = this.getModel() ? this.getModel().get('value') : undefined;
  },

  isActive() {
    return this.subView && this.subView.$el.is(':visible');
  },

  getModel() {
    if (this.subView && this.subView.model) {
      return this.subView.model;
    }
  },

  getCollection() {
    if (this.subView && this.subView.collection) {
      return this.subView.collection;
    }
  },

  getViewState() {
    return this.state;
  },

  validateAndShowErrors() {
    if (this.subView && this.subView.validateAndShowErrors) {
      return this.subView.validateAndShowErrors();
    } else {
      console.log(`[Warning] No validation defined on `, this);
      return true;
    }
  },

  getApiData() {
    const model = this.getModel();
    if (model && model.getPageApiDataAttrs) {
      return model.getPageApiDataAttrs();
    } else {
      console.log(`[Warning] No api data defined for `, this);
      return null;
    }
  },

  resetValue() {
    if (this.getModel()) this.getModel().set('value', this._original_value);
  },

  _switchStateTo(state) {
    this.state = state;
    this.render();
  },

  toEditable() {
    this.is_disabled = false;
    this._switchStateTo('edit');
  },

  toView() {
    this._switchStateTo('view');
  },

  toHidden() {
    this._switchStateTo('hidden');
  },

  toEditableDisabled(disabledMessage) {
    if (disabledMessage) {
      this.disabledMessage = disabledMessage;
    } else {
      this.disabledMessage = this.defaultDisabledMessage;
    }

    this.is_disabled = true;
    this._switchStateTo('edit');

    // Now add disabled attribute to all sub styles
    this.$(':input').attr('disabled','disabled').addClass('disabled');

    /* Descoped for R1
    if (this.disabledMessage) {
      this._addTooltipToInputControl(this.$(':input'), this.disabledMessage);
    }
    */
  },

  _addTooltipToInputControl(input_ele, title) {
    // NOTE: Tooltips don't show up on disabled inputs, so add a wrapper around it for the tooltip
    $(input_ele).wrap(`<div data-toggle="tooltip" title="${title}">`);
    input_ele.closest('div[data-toggle="tooltip"]').tooltip({
      placement: 'top',
      container: 'body'
    });
  },

  callMethodOnSubView(methodName, methodArgs) {
    return this.callMethodOnChild('editRegion', methodName, methodArgs);
  },

  onBeforeRender() {
    if (this.subView && this.subView.isRendered()) {
      this.detachChildView('editRegion');
    }
  },

  onRender() {
    this.subView.render();
    this.showChildView('editRegion', this.subView);
  },

  templateContext() {
    return {
      state: this.state,
      is_disabled: this.is_disabled,
      label: this.label,
      view_value: this.view_value,
      view_class: this.view_class ? this.view_class : ''
    };
  },

});

_.extend(EditableComponentView.prototype, ParentViewMixin);
export default EditableComponentView;
