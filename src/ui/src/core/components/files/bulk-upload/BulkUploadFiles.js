/**
 * @fileoverview - Modal for uploading files to a FileDescriptionCollection
 */
import React from 'react';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import FilesView from '../Files';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import './BulkUploadFiles.scss';

const filesChannel = Radio.channel('files');
const participantChannel = Radio.channel('participants');

/**
 * @param {BulkUploadFileModel} model - BulkUploadFileModel object to upload files to
 * @param {Object} processingOptions - file upload options to pass in to file uploader
 * @param {Function} fileCreationFn - Callback function that gets passed in to file uploader. Gets executed on file save
 * @param {Number} fileType - FileModel file_type 
*/
const BulkUploadFileView = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['processingOptions', 'fileCreationFn', 'fileType']);
    this.template = this.template.bind(this);
  },

  async uploadFiles() {
    if (!this.model.get('files').length) {
      this.hideUpload = true;
      this.render();
      return true;
    };

    this.hideUpload = false;
    const fileUploader = this.getChildView('fileUploadRegion');
    fileUploader.saveInternalDataToModel();
    await fileUploader.uploadAddedFiles();
    return true;
  },

  hasReadyToUploadFiles() {
    return !!this.model.get('files')?.getReadyToUpload().length;
  },

  validateAndShowErrors() {
    const regionsToValidate = ['fileListRegion'];
    let isValid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  regions: {
    fileUploadRegion: '.file-upload',
    fileListRegion: '.file-upload-list'
  },

  onRender() {
    if (this.hideUpload) return;
    const fileType = this.fileType;
    const addedBy = participantChannel.request('get:primaryApplicant:id');
    const autofillRename = true;
    const self = this;
    const fileUploader = filesChannel.request('create:uploader', {
      processing_options: this.processingOptions,
      files: this.model.get('files'),
      file_description: this.model.get('fileDescriptionModel') || null,
      file_creation_fn: function() { // Scope context is the FileUploader so that we can use the default params
        const fileData = Object.assign({}, this.defaultFileCreationFn(...arguments), {
            added_by: addedBy,
            file_type: fileType,
            autofillRename,
          },
        );
        return _.isFunction(self.fileCreationFn) ? self.fileCreationFn(fileData) : fileData;
      },
    });
    
    this.showChildView('fileUploadRegion', fileUploader);
    this.showChildView('fileListRegion', new FilesView({
      showDelete: false,
      collection: this.model.get('files'),
    }));
  },

  template() {
    if (this.hideUpload) return;
    return (
      <div className="bulk-upload-files__document">
        <span className="bulk-upload-files__document__header">{this.model.get('title')}</span>
        <div className="file-upload"></div>
        <div className="file-upload-list"></div>
      </div>
    );
  }
});


const BulkUploadFiles = Marionette.CollectionView.extend({
  template: _.noop,
  childView: BulkUploadFileView,

  childViewOptions() {
    return {
      processingOptions: this.getOption('processingOptions'),
      fileCreationFn: this.getOption('fileCreationFn'),
      fileType: this.getOption('fileType')
    }
  },

  hasReadyToUploadFiles() {
    return this.children?.reduce((memo, child) => !!child.hasReadyToUploadFiles() || memo, false);
  },

  validateAndShowErrors() {
    let isValid = true;
    this.children.forEach(child => {
      if (child?.validateAndShowErrors) {
        isValid = child?.validateAndShowErrors?.() && isValid;
      }
    });
    return isValid;
  },
});


_.extend(BulkUploadFileView.prototype, ViewJSXMixin);
_.extend(BulkUploadFiles.prototype, ViewJSXMixin);

export default BulkUploadFiles;