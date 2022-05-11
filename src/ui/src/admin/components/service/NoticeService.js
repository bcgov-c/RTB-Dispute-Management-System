import DisputeServiceView from './DisputeService';
import Radio from 'backbone.radio';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import FileCollection from '../../../core/components/files/File_collection';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

export default DisputeServiceView.extend({
  
  initialize(options) {
    DisputeServiceView.prototype.initialize.call(this, options);
    const parentNoticeModel = this.model.getParentNoticeModel();
    this.parentNoticeIsAmendment = parentNoticeModel && parentNoticeModel.isAmendmentNotice();
  },

  addFilesFn() {
    const fileDescription = this.model.getServiceFileDescription() || this.model.createNoticeServiceFileDescription();
    const modalAddFiles = new ModalAddFiles({
      files: new FileCollection(this.existingFileModels),
      title: `Add ${this.parentNoticeIsAmendment ? 'Amendment' : 'Notice'} Service Files`,
      hideDescription: true,
      isDescriptionRequired: false,
      showDelete: false,
      model: new DisputeEvidenceModel({ file_description: fileDescription }),
      fileType: configChannel.request('get', 'FILE_TYPE_NOTICE'),
      addedBy: this.model.get('participant_id'),
      autofillRename: true,
      processing_options: {
        errorModalTitle: 'Adding Notice Service Proof',
        checkForDisputeDuplicates: false,
        maxNumberOfFiles: this.SERVICE_FILES_MAX
      },
    });

    this.stopListening(modalAddFiles);
    this.listenTo(modalAddFiles, 'save:complete', () => {
      modalChannel.request('remove', modalAddFiles);

      this.model.set('proof_file_description_id', fileDescription.id);
      this.model.save(this.model.getApiChangesOnly())
        .done(() => {
          this.render();
          loaderChannel.trigger('page:load:complete');
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.NOTICESERVICE.SAVE', () => this.render());
          handler(err);
        });
    });

    modalChannel.request('add', modalAddFiles);
  }
});