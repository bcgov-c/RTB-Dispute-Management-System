import Marionette from 'backbone.marionette';
import UploadEvidenceView from './UploadEvidence';

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: UploadEvidenceView,

  initialize(options) {
    this.mergeOptions(options, ['mode', 'uploadModel', 'associatedClaim', 'claimCollection', 'showEvidenceWarningPromise']);
  },

  childViewOptions(child) {
    return {
      mode: this.mode,
      uploadModel: this.uploadModel,
      associatedClaim: this.associatedClaim,
      claimCollection: this.claimCollection,
      showEvidenceWarningPromise: this.showEvidenceWarningPromise
    };
  }
});
