/**
 * @fileoverview - Overrides ModalBlank to add a checkbox for additional validation
 */
import ModalBlank from './ModalBlank';
import CheckboxView from '../../../components/checkbox/Checkbox';
import CheckboxModel from '../../../components/checkbox/Checkbox_model';

export default ModalBlank.extend({

  initialize(options) {
    ModalBlank.prototype.initialize.call(this, options);
    this.onContinueFn = function() {
      if (this.validateAndShowErrors()) {
        ModalBlank.prototype.getOption.call(this, 'onContinueFn')(this);
      }
    };

    this.checkboxModel = new CheckboxModel({
      html: this.getOption('checkboxHtml'),
      required: true
    });

    this.checkboxModel.on('change:checked', function() {
      // If there is a checkbox view, hide any error messages on click
      if (this.checkboxView && this.checkboxView.isRendered()) {
        this.checkboxView.showErrorMessage("");
      }
    }, this);
  },

  validateAndShowErrors() {
    return this.checkboxView && this.checkboxView.isRendered() ? this.checkboxView.validateAndShowErrors() : true;
  },

  onRender() {
    this.checkboxView = new CheckboxView({
      model: this.checkboxModel
    });

    this.getUI('formGroups').append( this.checkboxView.render().el );
  }
});