import ModalBaseView from '../../../../core/components/modals/ModalBase';
import template from './ModalBlank_template.tpl';

export default ModalBaseView.extend({
  template,

  className() {
    return `${ModalBaseView.prototype.className} ${this.getOption('modalCssClasses') || ''}`;
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      formGroups: '.modal-blank-form-groups',
      continue: '.btn-continue',
      secondary: '.btn-secondary',
    });
  },

  triggers: {
    'click @ui.continue': 'continue',
    'click @ui.cancel': 'cancel',
    'click @ui.close': 'cancel',
    'click @ui.secondary': 'secondary',
  },

  initialize(options) {
    if (!options || !options.title || !options.bodyHtml) {
      const error_msg = `[Error] Missing required attributes for opening default modal`;
      console.log(error_msg);
      throw error_msg;
    }
    this.mergeOptions(options, ['title', 'bodyHtml', 'onContinueFn', 'onCancelFn', 'onSecondaryFn']);

    // Default modal options
    if (this.onContinueFn) {
      this.on('continue', function() {
        // Always add the modal view instance as the first argument to the continue function
        this.onContinueFn(this, ...arguments);
      });
    }
    if (this.onSecondaryFn) {
      this.on('secondary', function() {
        this.onSecondaryFn(this, ...arguments);
      });
    }

    this.onCancelFn = this.onCancelFn ? this.onCancelFn : function() { this.close(); };
    this.on('cancel', function() {
      this.onCancelFn(this, ...arguments);
    });
  },

  templateContext() {
    return {
      title: this.title,
      bodyHtml: this.bodyHtml,
      hideHeaderX: this.getOption('hideHeaderX'),
      hideAllControls: this.getOption('hideAllControls'),
      hideCancelButton: this.getOption('hideCancelButton'),
      hideContinueButton: this.getOption('hideContinueButton'),
      modalCssClasses: this.getOption('modalCssClasses') || '',
      cancelButtonText: this.getOption('cancelButtonText') || 'Cancel',
      primaryButtonText: this.getOption('primaryButtonText') || 'Continue',
      cancelButtonTextMobile: this.getOption('cancelButtonTextMobile') || 'Cancel',
      primaryButtonTextMobile: this.getOption('primaryButtonTextMobile'),
      secondaryButtonText: this.getOption('secondaryButtonText'),
    };
  }
});
