import CheckboxCollection from '../../../core/components/checkbox/Checkbox_collection';
import ClaimCheckboxModel from './ClaimCheckbox_model';

export default CheckboxCollection.extend({
  model: ClaimCheckboxModel,

  isEmpty() {
    return this.where({checked: true}).length === 0;
  },

  validate() {
    var returned_error = CheckboxCollection.prototype.validate.call(this);

    if (returned_error) {
      // Error around selections -> display custom error message
      var new_error_msg = "Select at least one issue from this list, or change the answer above to No";
      this.validationError = new_error_msg;
      return new_error_msg;
    }

    var return_string = null;
    _.each(this.where({checked: true}), function(claimCheckbox) {
      if (!claimCheckbox.isValid()) {
        return_string = "Missing selection(s)";
      }
    });

    if (return_string !== null) {
      this.validationError = return_string;
      return return_string;
    }
  }
});
