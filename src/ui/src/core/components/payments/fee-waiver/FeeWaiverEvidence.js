import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import UploadEvidenceView from '../../../../evidence/pages/upload/UploadEvidence';

const configChannel = Radio.channel('config');

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: UploadEvidenceView,

  childViewOptions() {
    return {
      uploadModel: this.uploadModel,
      mode: this.mode,
      isDescriptionRequired: false,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.dispatcher,
      fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE')
    };
  },

  filter(child) {
    return !this.uploadModel.isUpload() || child.getReadyToUploadFiles().length;
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'uploadModel']);
    this.collection = this.model.get('evidenceCollection');
    this.dispatcher = _.clone(Backbone.Events);

    this.listenTo(this.dispatcher, 'update:file:count', function() {
      this.model.trigger('update');
    }, this);
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(childView) {
      if (childView) {
        is_valid = childView.validateAndShowErrors() & is_valid;
      }
    }, this);
    return is_valid;
  }

});
