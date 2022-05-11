import CheckboxCollection from '../../../core/components/checkbox/Checkbox_collection';
import EvidenceCheckboxModel from './EvidenceCheckbox_model';

export default CheckboxCollection.extend({
    model: EvidenceCheckboxModel,
    validationError: null,
    
    isEmpty() {
      return this.where({checked: true}).length === 0;
    },

    isValid() {
      return (typeof this.validate() === 'undefined');
    },

    getChecked() {
      return this.filter(function(m) { return m.get('checked'); });
    },

    filterForUncheckedWithEvidence() {
      return this.filter(function(m) { return !m.get('checked') && m.hasUploadedEvidence(); });
    },

    validate() {
      this.validationError = null;
      const returned_error = CheckboxCollection.prototype.validate.call(this);
      if (returned_error) {
        // Error around selections -> display custom error message
        const new_error_msg = "Select at least one method of proof from this list";
        this.validationError = new_error_msg;
        return new_error_msg;
      }

      let return_string = null;
      _.each(this.where({checked: true}), function(claimCheckbox) {
        if (!claimCheckbox.isValid()) {
          return_string = "Missing selection(s)";
        }
      });

      if (return_string !== null) {
        this.validationError = return_string;
        return return_string;
      }
    },
});