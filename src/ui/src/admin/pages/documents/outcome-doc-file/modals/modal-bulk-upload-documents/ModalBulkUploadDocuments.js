
import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../../../core/utilities/JsxViewMixin';
import BulkUploadDocument from './BulkUploadDocument';
import FilesView from '../../../../../../core/components/files/Files';
import FileCollection from '../../../../../../core/components/files/File_collection';
import OutcomeDocFilesCollection from '../../../../../../core/components/documents/OutcomeDocFiles_collection';
import DisputeOutcomeExternalFilesView from '../../../outcome-doc-file/DisputeOutcomeExternalFiles';
import { generalErrorFactory } from '../../../../../../core/components/api/ApiLayer';
import './ModalBulkUploadDocuments.scss';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const participantChannel = Radio.channel('participants');

const NO_SELECTED_FILES = 'No files added to upload. Please select at least one final or working document';

const ModalBulkUploadDocuments = ModalBaseView.extend({ 
  id: "bulkUploadDocuments_modal",

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['outcomeFiles']);

    this.finalOutcomeDocs = new OutcomeDocFilesCollection(this.outcomeFiles.filter((outcomeFile) => outcomeFile.isActive() && !outcomeFile.hasUploadedFile()));
    this.workingFiles = new FileCollection();

    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.finalOutcomeDocs, 'change:files', () => this.resetFileErrorAndHide());
  },

  cancel() {
    const workingDocsfileUploader = this.getChildView('workingFileUploadRegion');
    if (workingDocsfileUploader) {
      workingDocsfileUploader.trigger('cancel:all');
    }
    const finalDocsView = this.getChildView('finalDocsUploadRegion');
    finalDocsView.children?.forEach(child => {
      const finalDocsFileUploader = child.getChildView('fileUploadRegion');
      if (finalDocsFileUploader) {
        finalDocsFileUploader.trigger('cancel:all');
      }
    });
  },

  isFileAlreadyAddedToUpload(fileObj) {
    const finalDocsView = this.getChildView('finalDocsUploadRegion');
    const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
    const alreadyUploadededFiles = finalDocsView.children?.filter(child => {
      const finalDocsFileUploader = child.getChildView('fileUploadRegion');
        return (finalDocsFileUploader.files.filter(fileModel => fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize)).length
    });
    return !!alreadyUploadededFiles.length;
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
    this.finalOutcomeDocs.forEach(model => model.trigger('validate:upload'));

    const workingDocsView = this.getChildView('workingFileListRegion');
    if (workingDocsView) workingDocsView.validateAndShowErrors();

    const visibleErrorEles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (visibleErrorEles.length) return;

    const finalDocsView = this.getChildView('finalDocsUploadRegion');
    const finalDocsHasUploads = finalDocsView.children?.filter(child => child.files?.length)?.length;
    const workingDocsHasUploads = this.getChildView('workingFileUploadRegion').files?.length;

    if (!finalDocsHasUploads && !workingDocsHasUploads) {
      this.getUI('fileError').removeClass('hidden');
      return;
    }

    this.$el.scrollTop(0);
    this.saveInProgress = true;
    this.showUploadUI();

    const finalDocPromise = () => finalDocsHasUploads ? Promise.all(finalDocsView.children?.map(child => child.save())) : Promise.resolve();

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

    Promise.all([finalDocPromise(), workingDocsPromise()])
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

  regions: {
    finalDocsUploadRegion: '.bulk-upload-document',
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
    const allOutcomeFileIds = this.outcomeFiles.filter(doc => doc.id !== this.model.id && !doc.isExternal() && doc.get('file_id')).map(doc => doc.get('file_id'));
    this.showChildView('finalDocsUploadRegion', new BulkUploadDocument({ collection: this.finalOutcomeDocs, allOutcomeDocIds: allOutcomeFileIds, isFileAlreadyAddedToUpload: this.isFileAlreadyAddedToUpload.bind(this) }));

    const fileType = configChannel.request('get', 'FILE_TYPE_INTERNAL');
    const addedBy = participantChannel.request('get:primaryApplicant:id');
    const autofillRename = true;
    const processingOptions = {
      errorModalTitle: 'Adding Working Document',
      checkForDisputeDuplicates: false, 
    }
    
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

    this.listenTo(fileUploader, 'change:files', () => {
      this.resetFileErrorAndHide();
    })
    
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

});

_.extend(ModalBulkUploadDocuments.prototype, ViewJSXMixin);
export default ModalBulkUploadDocuments;