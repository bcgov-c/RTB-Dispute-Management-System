import React from 'react';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import ModalBaseView from '../modals/ModalBase';
import BulkUploadFiles from '../files/bulk-upload/BulkUploadFiles';
import { generalErrorFactory } from '../api/ApiLayer';
import BulkUploadFile_collection from '../files/bulk-upload/BulkUploadFile_collection';
import File_collection from '../files/File_collection';

const NO_ADDED_FILES_ERROR_MSG = 'No files added to upload. Please upload at least one document.';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');

const ModalAddServiceFiles = ModalBaseView.extend({ 
  id: "addNoticeServiceFiles_modal",

  /**
   * @param {ServiceModel} model
   * @param {Number} fileType
   */
  initialize(options) {
    this.mergeOptions(options, ['fileType']);
    this.template = this.template.bind(this);
    this.SERVICE_FILES_MAX = configChannel.request('get', 'SERVICE_FILES_MAX');
    this.isCancelled = false;

    const mainProofFileDescription = this.model.getServiceFileDescription() || this.model.createServiceFileDescription();
    const otherProofFileDescription = this.model.getOtherServiceFileDescription() || this.model.createOtherServiceFileDescription();
    this.bulkUploadCollection = new BulkUploadFile_collection([{
      fileDescriptionModel: mainProofFileDescription,
      files: new File_collection(this.model.getProofFileModels()),
      title: mainProofFileDescription.get('title'),
    }, {
      fileDescriptionModel: otherProofFileDescription,
      files: new File_collection(this.model.getOtherProofFileModels()),
      title: otherProofFileDescription.get('title'),
    }]);

    const participantName = participantsChannel.request('get:participant:name', this.model.get('participant_id'));
    this.modalTitle = `Add Service Files${participantName ? ` for ${participantName}` : ''}`;
    
    this.bulkUploadCollection.forEach(bulkUpload => {
      this.listenTo(bulkUpload.get('files'), 'update', () => this.resetFileErrorAndHide());
    });
  },

  showUploadUI() {
    $('.add-files-container').addClass('hidden');
    $('.outcome-external-file-delete-btn').addClass('hidden');
    this.getUI('continueBtn').addClass('hidden');
    this.getUI('cancelBtn').addClass('hidden');
    this.getUI('closeBtn').addClass('hidden');
    this.getUI('cancelRemainingBtn').removeClass('hidden');
  },

  resetUploadUI() {
    $('.add-files-container').removeClass('hidden');
    $('.outcome-external-file-delete-btn').removeClass('hidden');
    this.getUI('continueBtn').removeClass('hidden');
    this.getUI('cancelBtn').removeClass('hidden');
    this.getUI('closeBtn').removeClass('hidden');
    this.getUI('cancelRemainingBtn').addClass('hidden');
  },

  resetFileErrorAndHide() {
    this.getUI('fileError').addClass('hidden');
  },

  async save() {
    const uploadView = this.getChildView('uploadRegion');
    const hasUploads = uploadView.hasReadyToUploadFiles();
    let isValid = uploadView.validateAndShowErrors();
    if (!hasUploads) {
      this.getUI('fileError').removeClass('hidden');
      isValid = false;
    }

    if (!isValid) return;

    this.saveInProgress = true;
    this.showUploadUI();
    
    const createFileDescriptionPromise = () => Promise.all(this.bulkUploadCollection.map(model => model.get('fileDescriptionModel').save()
      .done(() => filesChannel.request('add:filedescription', model.get('fileDescriptionModel')))));
    
    const uploadFilePromise = () => hasUploads ? Promise.all(uploadView.children?.map(child => child?.uploadFiles())) : Promise.resolve();
    const saveServiceModelPromise = () => new Promise((res, rej) => {
      this.model.set({
        proof_file_description_id: this.bulkUploadCollection.at(0).get('fileDescriptionModel')?.id,
        other_proof_file_description_id: this.bulkUploadCollection.at(1).get('fileDescriptionModel')?.id,
      });
      this.model.save(this.model.getApiChangesOnly())
        .done(res)
        .fail(err => {
          const handler = generalErrorFactory.createHandler('ADMIN.NOTICESERVICE.SAVE', () => rej());
          handler(err);
        });
    });
    
    try {
      await createFileDescriptionPromise();
      await uploadFilePromise();
    } catch (err) {
      console.debug(err);
      this.resetUploadUI();
      if (!this.isCancelled) generalErrorFactory.createHandler('ADMIN.FILES.UPLOAD')(err);
    }

    try {
      await saveServiceModelPromise();
    } catch (err) {
      console.debug(err);
      generalErrorFactory.createHandler('ADMIN.NOTICESERVICE.SAVE')(err);
    }
    this.close();
  },

  cancel() {
    this.isCancelled = true;
    const finalDocsView = this.getChildView('uploadRegion');
    finalDocsView.children?.forEach(child => {
      const finalDocsFileUploader = child.getChildView('fileUploadRegion');
      if (finalDocsFileUploader) {
        finalDocsFileUploader.trigger('cancel:all');
      }
    });
  },

  getFileProcessingOptions() {
    return {
      errorModalTitle: 'Adding Service Proof',
      maxNumberOfFilesErrorMsg: `A maximum of 5 files can be uploaded in this section.`,
      maxNumberOfFiles: this.SERVICE_FILES_MAX,
      checkForDisputeDuplicates: false,
      customFileValidationFn: (fileObj) => !this.bulkUploadCollection.find(model => {
        const files = model.get('files');
        return !!files.getByFileObject(fileObj);
      }),
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been added to this service record.`,
    }
  },

  onRender() {
    this.showChildView('uploadRegion', new BulkUploadFiles({
      collection: this.bulkUploadCollection,
      fileType: configChannel.request('get', 'FILE_TYPE_NOTICE'),
      processingOptions: this.getFileProcessingOptions(),
    }));
  },

  regions: {
    uploadRegion: '.add-files',
  },

  ui: {
    fileError: '.file-error',
    continueBtn: '.btn-continue',
    cancelBtn: '.btn-cancel',
    closeBtn: '.close-x',
    cancelRemainingBtn: '.btn-cancel-remaining'
  },

  template() {
    return (
      <div className="modal-dialog add-notice-service-files">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">{this.modalTitle}</h4>
            <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
        </div>
        <div className="modal-body clearfix">
          <div className="add-files"></div>
          <span className="file-error error-block hidden">{NO_ADDED_FILES_ERROR_MSG}</span>
          <div className="button-row">
              <div className="pull-right">
                <button type="button" className="btn btn-lg btn-default btn-cancel btn-cancel-remaining hidden" onClick={() => this.cancel()}><span>Cancel Remaining</span></button>
                <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Cancel</span></button>
                <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.save()}>Save and Close</button>
              </div>
            </div>
        </div>
      </div>
    </div>
    );
  }
});

_.extend(ModalAddServiceFiles.prototype, ViewJSXMixin);
export default ModalAddServiceFiles;