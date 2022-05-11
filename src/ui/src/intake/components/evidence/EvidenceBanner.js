import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './EvidenceBanner_template.tpl';

const configChannel = Radio.channel('config');
export default Marionette.View.extend({
  template,
  className() {
    return `evidence-banner`;
  },

  initialize() {
    this.UPLOAD_NOW_CODE = configChannel.request('get', 'EVIDENCE_METHOD_UPLOAD_NOW');
  },

  _hasRequiredFn(evidence_list) {
    return !_.isEmpty(evidence_list) && _.any(evidence_list, function(evidence_model) {
      return this.getOption('treatAsRequired') || evidence_model.get('required');
    }, this);
  },

  _hasRequiredAndMissingFilesFn(evidence_list) {
    return !_.isEmpty(evidence_list) && _.any(evidence_list, function(evidence_model) {
      const files = evidence_model.get('files');
      return evidence_model.get('required') && (!files || !files.hasUploaded());
    });
  },
  
  _missingFilesUploadNowFn(evidence_list) {
    return !_.isEmpty(evidence_list) &&  _.any(evidence_list, function(evidence_model) {
      const file_method = evidence_model.getFileMethod(),
        files = evidence_model.get('files');
      return !file_method || (String(file_method) === String(this.UPLOAD_NOW_CODE) && (!files || !files.hasUploaded()));
    }, this);
  },

  templateContext() {
    let evidence_status = 'missing';
    // If forceMissing, then always return missing
    if (!this.getOption('forceMissing')) {
      const evidenceCollection = this.getOption('disputeEvidenceCollection'),
        provided = evidenceCollection ? evidenceCollection.getProvided() : [],
        provided_later = evidenceCollection ? evidenceCollection.getProvideLater() : [],
        not_provided = evidenceCollection ? evidenceCollection.getCantProvide() : []; 

      if (this._missingFilesUploadNowFn(not_provided) || this._missingFilesUploadNowFn(provided) || this._hasRequiredFn(not_provided)) {
        evidence_status = 'missing';
      } else if (this._hasRequiredFn(provided_later)) {
        evidence_status =  'later';
      } else if (this._hasRequiredAndMissingFilesFn(provided)) {
        evidence_status = 'missing';
      } else {
        evidence_status = 'provided';
      }
    }
    return {
      COMMON_IMAGE_ROOT: configChannel.request('get', 'COMMON_IMAGE_ROOT'),
      evidence_status,
      useShortMessages: this.getOption('useShortMessages'),
    };
  }
});