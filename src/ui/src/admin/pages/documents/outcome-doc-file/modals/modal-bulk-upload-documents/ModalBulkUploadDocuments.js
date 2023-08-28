/**
 * @fileoverview - Modal for uploading files to multiple decisions as well as uploading working files
 */
import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../../../core/utilities/JsxViewMixin';
import BulkUploadFiles from '../../../../../../core/components/files/bulk-upload/BulkUploadFiles';
import FilesView from '../../../../../../core/components/files/Files';
import FileCollection from '../../../../../../core/components/files/File_collection';
import OutcomeDocFilesCollection from '../../../../../../core/components/documents/OutcomeDocFiles_collection';
import DisputeOutcomeExternalFilesView from '../../../outcome-doc-file/DisputeOutcomeExternalFiles';
import OutcomeDocFileUploadValidation from '../../OutcomeDocFileUploadValidation';
import BulkUploadFile_collection from '../../../../../../core/components/files/bulk-upload/BulkUploadFile_collection';
import { generalErrorFactory } from '../../../../../../core/components/api/ApiLayer';
import './ModalBulkUploadDocuments.scss';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const participantChannel = Radio.channel('participants');

const NO_SELECTED_FILES = 'No files added to upload. Please select at least one final or working document';

const ModalBulkUploadDocuments = ModalBaseView.extend({ 
  id: "bulkUploadDocuments_modal",
  /**
   * @param {OutcomeDocFileCollection} outcomeFiles
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['outcomeFiles']);

    this.finalOutcomeDocs = new OutcomeDocFilesCollection(this.outcomeFiles.filter(f => !f.isPublic() && !f.isExternal() && !f.hasUploadedFile()));
    this.publicOutcomeDocs = new OutcomeDocFilesCollection(this.outcomeFiles.filter(f => f.isPublic() && !f.hasUploadedFile()));

    this.finalDocBulkFiles = new BulkUploadFile_collection(this.finalOutcomeDocs.map(doc => ({
      title: doc.get('file_title'),
      dataModel: doc,
    })));
    this.publicDocBulkFiles = new BulkUploadFile_collection(this.publicOutcomeDocs.map(doc => ({
      title: doc.get('file_title'),
      dataModel: doc,
    })));

    if (!configChannel.request('get', 'UAT_TOGGLING')?.SHOW_OUTCOME_PUBLIC_DOCS) this.publicOutcomeDocs.reset([]);
    this.workingFiles = new FileCollection();

    this.listenTo(this.workingFiles, 'update', () => this.resetFileErrorAndHide());
    [...this.finalDocBulkFiles.models, ...this.publicOutcomeDocs.models]
      .forEach(m => this.listenTo(m.get('files'), 'update', () => this.resetFileErrorAndHide()));
  },

  cancel() {
    const workingDocsfileUploader = this.getChildView('workingFileUploadRegion');
    if (workingDocsfileUploader) workingDocsfileUploader.trigger('cancel:all');

    const finalDocsView = this.getChildView('finalDocsUploadRegion');
    finalDocsView.children?.forEach(child => {
      const finalDocsFileUploader = child?.getChildView('fileUploadRegion');
      if (finalDocsFileUploader) finalDocsFileUploader?.trigger('cancel:all');
    });
    const publicDocsView = this.getChildView('publicDocsUploadRegion');
    publicDocsView?.children?.forEach(child => {
      const publicDocsFileUploader = child?.getChildView('fileUploadRegion');
      if (publicDocsFileUploader) publicDocsFileUploader?.trigger('cancel:all');
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

  save() {
    const finalDocsView = this.getChildView('finalDocsUploadRegion');
    const publicDocsView = this.getChildView('publicDocsUploadRegion');
    const workingDocsView = this.getChildView('workingFileListRegion');
    const finalDocsHasUploads = finalDocsView?.hasReadyToUploadFiles();
    const publicDocsHasUploads = publicDocsView?.hasReadyToUploadFiles();
    const workingDocsHasUploads = !!this.workingFiles.getReadyToUpload().length;
    let isValid = finalDocsView.validateAndShowErrors()
      && (publicDocsView ? publicDocsView.validateAndShowErrors() : true)
      && workingDocsView.validateAndShowErrors();
    if (!finalDocsHasUploads && !publicDocsHasUploads && !workingDocsHasUploads) {
      this.getUI('fileError').removeClass('hidden');
      isValid = false;
    }
    if (!isValid) return;

    this.$el.scrollTop(0);
    this.saveInProgress = true;
    this.showUploadUI();

    const uploadDocFiles = async (uploadFilesView) => {
      try {
        for (let i=0; i < uploadFilesView.children.length; i++) {
          const view = uploadFilesView.children?.findByIndex(i);
          await view.uploadFiles();
          const firstFile = view.model.get('files')?.at(0);
          if (firstFile?.isUploaded()) {
            await view.model.get('dataModel').save({ file_id: firstFile.id });
          }
        }
      } catch (err) {
        // pass, errors will be shown at the file level
        console.debug(err);
      }
    };

    const finalDocPromise = () => finalDocsHasUploads ? uploadDocFiles(finalDocsView) : Promise.resolve();
    const publicDocPromise = () => publicDocsHasUploads ?
      uploadDocFiles(publicDocsView)
            // When uploading the first file, always set to public=False - it must be set via the Edit Documents save on the Outcome Doc Group edit
            .then(() => Promise.all(this.publicOutcomeDocs.map(d => d.save({ visible_to_public: false }))))
      : Promise.resolve();

    const fileUploaderView = this.getChildView('workingFileUploadRegion');
    const workingDocsPromise = () => !this.workingFiles.length ? Promise.resolve() : fileUploaderView.uploadAddedFiles().done(() => {
      const uploadedFiles = this.workingFiles.getUploaded();
      const allXhr = uploadedFiles.map(uploadedFile => {
        const outcome_doc_file_model = this.model.createOutcomeFile({
          file_id: uploadedFile.id,
          file_type: configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_EXTERNAL')  
        }, { add: true });
        return _.bind(outcome_doc_file_model.save, outcome_doc_file_model);
      });
      $('.outcome-external-file-delete-btn').addClass('hidden');
      return allXhr.map(xhr => xhr());
    });

    Promise.all([finalDocPromise(), workingDocsPromise(), publicDocPromise()])
    .catch(() => {
      this.resetUploadUI();
      return generalErrorFactory.createHandler('ADMIN.FILES.UPLOAD');
    })
    .finally(() => {
      setTimeout(() => {
        this.trigger('save:complete'); 
        this.close();
      }, 1000);
    });
  },

  resetFileErrorAndHide() {
    this.getUI('fileError').addClass('hidden');
  },

  getFileProcessingOptions(attrs={isPublic:false}) {
    const validator = new OutcomeDocFileUploadValidation(Object.assign({ outcomeGroupModel: this.model }, attrs));
    const context = this;
    return {
      errorModalTitle: `Adding ${attrs?.isPublic ? 'Public' : 'Outcome'} Document File`,
      maxNumberOfFilesErrorMsg: `Only one outcome document can be uploaded.  If you have more than one PDF document for the same outcome document file, they must be combined into a single PDF document.`,
      maxNumberOfFiles: 1,
      checkForDisputeDuplicates: false,
      maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
      allowedFileTypes: configChannel.request('get', 'VALID_OUTCOME_DOC_FILE_TYPES'),
      customFileValidationErrorMsg: validator.customFileValidationErrorMsg.bind(validator),
      customFileValidationFn: (fileObj) => {
        if (
          context.finalDocBulkFiles.find(m => m.get('files').getByFileObject(fileObj)) ||
          context.publicDocBulkFiles.find(m => m.get('files').getByFileObject(fileObj))
        ) {
          fileObj._dmsFileValidationError = OutcomeDocFileUploadValidation?.ERROR_CODES?.DUP;
          return false;
        } else {
          return validator.customFileValidationFn.bind(validator)(fileObj);
        }
      }
    };
  },

  regions: {
    finalDocsUploadRegion: '.bulk-upload-document',
    publicDocsUploadRegion: '.bulk-upload-document-public',
    workingFileUploadRegion: '.working-documents',
    workingFileListRegion: '.working-documents-list',
    externalFilesRegion: '.dispute-outcome-doc-files-external',
  },

  ui: {
    fileError: '.file-error',
    continueBtn: '.btn-continue',
    cancelBtn: '.btn-cancel',
    closeBtn: '.close-x',
    cancelRemainingBtn: '.btn-cancel-remaining'
  },

  onRender() {
    this.showChildView('finalDocsUploadRegion', new BulkUploadFiles({
      collection: this.finalDocBulkFiles,
      fileType: configChannel.request('get', 'FILE_TYPE_INTERNAL'),
      processingOptions: this.getFileProcessingOptions(),
    }));
    this.renderWorkingDocuments();

    if (configChannel.request('get', 'UAT_TOGGLING')?.SHOW_OUTCOME_PUBLIC_DOCS && this.publicOutcomeDocs.length) {
      this.showChildView('publicDocsUploadRegion', new BulkUploadFiles({
        collection: this.publicDocBulkFiles,
        fileType: configChannel.request('get', 'FILE_TYPE_ANONYMOUS_EXTERNAL'),
        processingOptions: this.getFileProcessingOptions({ isPublic: true }),
        fileCreationFn: (fileData) => Object.assign(fileData, { editable: false, display_mode: true }),
      }));
    }
  },

  renderWorkingDocuments() {
    const fileType = configChannel.request('get', 'FILE_TYPE_INTERNAL');
    const addedBy = participantChannel.request('get:primaryApplicant:id');
    const autofillRename = true;
    const processingOptions = {
      errorModalTitle: 'Adding Working Document',
      checkForDisputeDuplicates: false,
      maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
    };
    
    const fileUploader = filesChannel.request('create:uploader', {
      // Use the DisputeEvidenceModel that was passed in
      processing_options: processingOptions,
      files: this.workingFiles,
      file_description: null,
      file_creation_fn: function() {
        return _.extend({}, this.defaultFileCreationFn(...arguments), {
            added_by: addedBy,
            file_type: fileType,
            autofillRename,
          },
        );
      }
    });
    
    this.showChildView('workingFileUploadRegion', fileUploader);
    this.showChildView('workingFileListRegion', new FilesView({
      showDelete: false,
      collection: this.workingFiles,
    }));
    
    this.showChildView('externalFilesRegion', new DisputeOutcomeExternalFilesView({ collection: this.outcomeFiles }));
  },

  template() {
    return (
      <div className="modal-dialog bulk-upload-documents">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Bulk Upload Outcome Documents</h4>
             <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
          </div>
          <div className="modal-body clearfix">
            <div className="bulk-upload-documents__body">
              <p>
                This bulk upload allows you to drag and drop a final pdf copy of your outcome documents and copies of all associated working documents. This view only
                allows final pdf documents to be added where a file is not already uploaded. To replace or remove final pdf documents, you must use the individual document
                features.
              </p>
              <div className="bulk-upload-documents__header">Final Documents</div>
              <div className="bulk-upload-document"></div>

              <div className="bulk-upload-documents__header--working-docs">Working Documents</div>
              <div className="dispute-outcome-doc-files-external"></div>
              <div className="working-documents"></div>
              <div className="working-documents-list"></div>

              {this.renderJsxPublicDocuments()}
            </div>
            <span className="file-error error-block hidden">{NO_SELECTED_FILES}</span>
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
  },

  renderJsxPublicDocuments() {
    return this.publicOutcomeDocs.length ? <>
      <div className="bulk-upload-documents__header--public">Public Final Documents</div>
      <div className="bulk-upload-document-public"></div>
    </> : null;
  },

});

_.extend(ModalBulkUploadDocuments.prototype, ViewJSXMixin);
export default ModalBulkUploadDocuments;