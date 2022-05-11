import Marionette from 'backbone.marionette';
import UploadIssue from './UploadIssue';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: UploadIssue,

  initialize(options) {
    this.mergeOptions(options, ['mode', 'claimCollection', 'uploadModel', 'evidenceCategory', 'evidenceCode', 'showEvidenceWarningPromise', 'enableRequiredEvidenceWarning']);
  },

  childViewOptions(child) {
    return {
      mode: this.mode,
      claimCollection: this.collection,
      evidenceCollection: child.get('dispute_evidences'),
      uploadModel: this.uploadModel,
      evidenceCategory: this.evidenceCategory,
      evidenceCode: this.evidenceCode,
      showEvidenceWarningPromise: this.showEvidenceWarningPromise,
      enableRequiredEvidenceWarning: this.enableRequiredEvidenceWarning
    };
  }
});
