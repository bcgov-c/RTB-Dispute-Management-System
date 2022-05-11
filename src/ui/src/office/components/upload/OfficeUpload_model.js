import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    disputeEvidencesToUpload: null,
    isUpload: false
  },

  isUpload() {
    return this.get('isUpload');
  },

  toUpload() {
    this.set('isUpload', true);
  },

  initialize() {
    this.set('disputeEvidencesToUpload', {});
  },

  _getPendingUploadIndex(dispute_evidence_model) {
    return dispute_evidence_model.isNew() ? dispute_evidence_model.cid :
        dispute_evidence_model.get('file_description').get('file_description_id');
  },
  
  getPendingUploads() {
    return this.get('disputeEvidencesToUpload');
  },

  hasPendingUpload(disputeEvidenceModel) {
    const indexToUse = this._getPendingUploadIndex(disputeEvidenceModel);
    return !!(this.getPendingUploads()[indexToUse]);
  },
  
  addPendingUpload(dispute_evidence_model) {
    const disputeEvidencesToUpload = this.get('disputeEvidencesToUpload'),
      index_to_use = this._getPendingUploadIndex(dispute_evidence_model);
    
    if (!_.has(disputeEvidencesToUpload, index_to_use)) {
      disputeEvidencesToUpload[index_to_use] = dispute_evidence_model;
    }
  },

  removePendingUpload(dispute_evidence_model) {
    const disputeEvidencesToUpload = this.get('disputeEvidencesToUpload'),
      index_to_use = this._getPendingUploadIndex(dispute_evidence_model);
    
    if (_.has(disputeEvidencesToUpload, index_to_use)) {
      delete disputeEvidencesToUpload[index_to_use];
    }
  },

  clearPendingUploads() {
    const pending_uploads = this.getPendingUploads();

    // Iterate through API data and reset
    _.each(pending_uploads, function(dispute_evidence_model) {
      dispute_evidence_model.get('files').resetCollection();
    
      if (dispute_evidence_model.isNew()) {
        dispute_evidence_model.destroy();
      }
    });
    this.set('disputeEvidencesToUpload', {});
  }
});