/**
 * @class core.components.dropdown.DropdownCollection
 * @memberof core.components.dropdown
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import DropdownModel from './Dropdown_model';

export default Backbone.Collection.extend({
  model: DropdownModel,

  isValid() {
    return (typeof this.validate() === 'undefined');
  },

  validate() {
    this.validationError = null;
    let return_string = null;
    
    if (this.any(m => !m.isValid())) {
      return_string = `Missing selection(s)`;
    }

    if (return_string !== null) {
      this.validationError = return_string;
      return return_string;
    }
  }
});
