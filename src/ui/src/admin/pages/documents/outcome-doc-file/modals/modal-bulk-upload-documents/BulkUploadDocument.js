import React from 'react';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import FileCollection from '../../../../../../core/components/files/File_collection';
import FilesView from '../../../../../../core/components/files/Files';
import { ViewJSXMixin } from '../../../../../../core/utilities/JsxViewMixin';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const participantChannel = Radio.channel('participants');

const UploadDocumentView = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['collection', 'allOutcomeDocIds', 'isFileAlreadyAddedToUpload']);
    this.template = this.template.bind(this);
    this.files = new FileCollection();
    this.listenTo(this.model, 'validate:upload', () => {
      this.validateAndShowErrors();
    });
  },

  save() {
    if (!this.files.length) {
      this.hideUpload = true;
      this.render();
      return;
    };
    this.hideUpload = false;
    const fileUploader = this.getChildView('fileUploadRegion');
    fileUploader.saveInternalDataToModel();
    
    return fileUploader.uploadAddedFiles().done(() => {
      const uploadedFiles = this.files.getUploaded();
      const uploadedFile = !_.isEmpty(uploadedFiles) ? uploadedFiles[0] : null;
      const fileId = uploadedFile && uploadedFile.id;
      
      return this.model.save({ file_id: fileId });
    });

    
  },

  validateAndShowErrors() {
    const regionsToValidate = ['fileListRegion'];

    let is_valid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    });

    return is_valid;
  },

  regions: {
    fileUploadRegion: '.file-upload',
    fileListRegion: '.file-upload-list'
  },

  onRender() {
    if (this.hideUpload) return;
    const fileType = configChannel.request('get', 'FILE_TYPE_INTERNAL');
    const addedBy = participantChannel.request('get:primaryApplicant:id');
    const uploadedDocGroupFileIds = this.allOutcomeDocIds;
    const autofillRename = true;
    const processingOptions = {
      errorModalTitle: 'Adding Outcome Document File',
      maxNumberOfFilesErrorMsg: `Only one final document can be uploaded.  If you have more than one PDF document for the same outcome document file, they must be combined into a single PDF document.`,
      maxNumberOfFiles: 1,
      checkForDisputeDuplicates: false,        
      allowedFileTypes: configChannel.request('get', 'VALID_OUTCOME_DOC_FILE_TYPES'),
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been uploaded to this document group`,
      customFileValidationFn: ((fileObj) => {
        const isFileAlreadyAddedToUpload = this.isFileAlreadyAddedToUpload(fileObj)
        if (isFileAlreadyAddedToUpload) return false;

        const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
        return !_.any(uploadedDocGroupFileIds, fileId => {
          const fileModel = filesChannel.request('get:file', fileId);
          if (!fileModel) {
            return false;
          }
          
          return (fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize);
        });
      }).bind(this)
    }
    
    const fileUploader = filesChannel.request('create:uploader', {
      processing_options: processingOptions,
      files: this.files,
      file_description: null,
      file_creation_fn: function() { // Scope context is the FileUploader so that we can use the default params
        return _.extend({}, this.defaultFileCreationFn(...arguments), {
            added_by: addedBy,
            file_type: fileType,
            autofillRename,
          },
        );
      }
    });

    this.listenTo(fileUploader, 'change:files', () => {
      this.collection.trigger('change:files');
    });
    
    this.showChildView('fileUploadRegion', fileUploader);
    this.showChildView('fileListRegion', new FilesView({
      showDelete: false,
      collection: this.files,
    }));
  },

  template() {
    if (this.hideUpload) return;
    return (
      <div className="bulk-upload-documents__document">
        <span className="bulk-upload-documents__document__header">{this.model.getFileTitleDisplay()}</span>
        <div className="file-upload"></div>
        <div className="file-upload-list"></div>
      </div>
    );
  }
});

_.extend(UploadDocumentView.prototype, ViewJSXMixin);

const BulkUploadDocumentView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: UploadDocumentView,

  childViewOptions() {
    return {
      collection: this.collection,
      allOutcomeDocIds: this.getOption('allOutcomeDocIds'),
      isFileAlreadyAddedToUpload: this.getOption('isFileAlreadyAddedToUpload')
    }
  }
});

export default BulkUploadDocumentView;