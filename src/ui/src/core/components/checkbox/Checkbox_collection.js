/**
 * @class core.components.checkbox.CheckboxCollection
 * @memberof core.components.checkbox
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';

import CheckboxModel from './Checkbox_model';

export default Backbone.Collection.extend({
  model: CheckboxModel,
  DEFAULT_MIN_SELECTS_REQUIRED: 1,

  initialize(models, options) {
    this.questionHtml = options ? options.questionHtml : null;
    this.staticWarning = options ? options.staticWarning : null;
    this.minSelectsRequired = options ? options.minSelectsRequired : null;
    this.maxSelectsAllowed = options ? options.maxSelectsAllowed : null;

    if (this.minSelectsRequired === null || typeof this.minSelectsRequired === "undefined") {
      this.minSelectsRequired = this.DEFAULT_MIN_SELECTS_REQUIRED;
    }
    this.cssClass = options ? options.cssClass : null;
  },

  modelChecked() {
    // Only trigger a step complete if a value changed
    const old_step_complete = this.step_complete;
    const numChecked = this.where({ checked: true }).length;
    if (numChecked >= this.minSelectsRequired || (this.maxSelectsAllowed && numChecked > this.maxSelectsAllowed)) {
      this.step_complete = true;
    } else {
      this.step_complete = false;
    }
    if (this.step_complete !== old_step_complete) {
      this.trigger('change:stepComplete', this, this.step_complete);
    }
  },


  isValid() {
    return (typeof this.validate() === 'undefined');
  },

  validate() {
    let return_string = null;
    const numChecked = this.where({ checked: true }).length;
    if (numChecked < this.minSelectsRequired) {
      if (this.minSelectsRequired === 1 && this.length === 1) {
        return_string = "Select this option to continue";
      } else if (this.minSelectsRequired === 1 && this.length !== 1) {
        return_string = "Select at least one option to continue";
      } else if (this.length === this.minSelectsRequired) {
        return_string = "Select all options to continue";
      } else {
        return_string = `Select at least ${this.minSelectsRequired} option${this.minSelectsRequired>1? 's' : ''} to continue`;
      }
    } else if (this.maxSelectsAllowed && numChecked > this.maxSelectsAllowed) {
      return_string = `Only ${this.maxSelectsAllowed} option${this.maxSelectsAllowed===1?'':'s'} may be selected`;
    }

    if (return_string !== null) {
      this.validationError = return_string;
      return return_string;
    }
  },

  getData() {
    const return_obj = [];
    _.each(this.where({checked: true}), function(checked_model) {
      return_obj.push(checked_model);
    });
    return return_obj;
  }
});
