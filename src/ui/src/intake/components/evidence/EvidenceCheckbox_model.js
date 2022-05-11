import Backbone from 'backbone';

export default Backbone.Model.extend({
    defaults: {
      cssClass: null,
      stepComplete: false,
      checkboxModel: null,
      evidenceModel: null,
      helpName: null,
      helpHtml: null,
      checked: false,
    },

    initialize() {
      this.listenTo(this.get('checkboxModel'), 'change:checked', function(model, value, options) {
        this.set('checked', value, options);
      }, this);

      this.set('checked', this.get('checkboxModel').get('checked'));
    },

    hasUploadedEvidence() {
      const evidence = this.get('evidenceModel');
      return evidence && !evidence.isEmpty() && evidence.get('files') && evidence.get('files').length;
    },

    destroy() {
      return this.get('evidenceModel').destroy();
    },

    validate() {
      var error_obj = {},
        checkboxModel = this.get('checkboxModel'),
        evidenceModel = this.get('evidenceModel');

      if (!checkboxModel.isValid()) {
          error_obj['checkbox'] = checkboxModel.validationError;
      }

      if (evidenceModel && checkboxModel.get('checked')) {
          if (!evidenceModel.isValid()) {
              error_obj['evidence'] = evidenceModel.validationError;
          }
      }

      if (!_.isEmpty(error_obj)) {
          return error_obj;
      }

      this.set('stepComplete', true);
    }
});
