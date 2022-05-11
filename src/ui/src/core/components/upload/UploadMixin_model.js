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

  hasReadyToUploadFiles() {
    return _.any(this.getPendingUploads(), ev => ev.getReadyToUploadFiles().length);
  },

  _getPendingUploadIndex(disputeEvidenceModel) {
    return disputeEvidenceModel.isNew() ? disputeEvidenceModel.cid :
        disputeEvidenceModel.get('file_description').get('file_description_id');
  },
  
  getPendingUploads() {
    return this.get('disputeEvidencesToUpload');
  },

  hasPendingUpload(disputeEvidenceModel) {
    const indexToUse = this._getPendingUploadIndex(disputeEvidenceModel);
    return !!(this.getPendingUploads()[indexToUse]);
  },
  
  addPendingUpload(disputeEvidenceModel) {
    const disputeEvidencesToUpload = this.get('disputeEvidencesToUpload'),
      indexToUse = this._getPendingUploadIndex(disputeEvidenceModel);
    
    if (!_.has(disputeEvidencesToUpload, indexToUse)) disputeEvidencesToUpload[indexToUse] = disputeEvidenceModel;
  },

  removePendingUpload(disputeEvidenceModel) {
    const disputeEvidencesToUpload = this.get('disputeEvidencesToUpload');
    const indexToUse = this._getPendingUploadIndex(disputeEvidenceModel);
    
    if (_.has(disputeEvidencesToUpload, indexToUse)) delete disputeEvidencesToUpload[indexToUse];
  },

  clearPendingUploads() {
    const pendingUploads = this.getPendingUploads();

    // Iterate through API data and reset
    _.each(pendingUploads, function(disputeEvidenceModel) {
      disputeEvidenceModel.get('files').resetCollection();
    
      if (disputeEvidenceModel.isNew()) {
        disputeEvidenceModel.destroy();
      }
    });
    this.set('disputeEvidencesToUpload', {});
    this.trigger('cleared');
  }
});