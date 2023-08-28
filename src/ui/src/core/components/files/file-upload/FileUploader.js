/**
 * @fileoverview - The FileUploader wraps functionality from the jQuery fileupload widget and offers a default UI for file uploading.
 * @class core.components.file-upload.FileUploader
 * @memberof core.components.files.file-upload
 */

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import FileCollection from '../File_collection';
import CommonFileCollection from '../CommonFile_collection';
import FileModel from '../File_model';
import default_child_template from './FileUploader_template.tpl';

const DEFAULT_ERROR_MODAL_TITLE = 'Adding Evidence';
const DEFAULT_CUSTOM_VALIDATION_FAILED_ERROR_MESSAGE = `File did not pass validation checks`;

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');

const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template: _.template(`<form method="POST" enctype="multipart/form-data"><div class="file-upload-child-region"</div></form>`),

  ui: {
    childRegion: '.file-upload-child-region',
    fileuploader: 'form'
  },

  events: {
    'click input': 'clickFileUpload',
  },

    // NOTE: If passing in a template, it must define a <form> element that the fileupload will be initialized on
    /**
     * @param {Boolean} is_uploading //TODO: unused? not being passed in anywhere
     * @param {FileCollection} files
     * @param {FileDescriptionModel} file_description 
     * @param {String} [child_template] - can pass in custom file upload region HTML
     * @param {Function} [file_creation_fn] - Pass in custom file creation function. Look at defaultFileCreationFn for example function
     */
    initialize(options) {
      this.mergeOptions(options, ['is_uploading', 'files', 'file_description', 'child_template', 'file_creation_fn']);//TODO: refactor to camelCase
      options = options || {};
  
      this.processing_options = {};
      this.files = this.files || new FileCollection();
      this.child_template = this.child_template || default_child_template;
      this.file_description = this.file_description || null;
      this.file_creation_fn = this.file_creation_fn || this.defaultFileCreationFn;
  
      this.fileupload_options = _.extend(this.getDefaultComponentOptions(), options);
      this.processing_options = _.extend(this.getDefaultProcessingOptions(), options.processing_options || {});
  
      this.isFileInputSelectComplete = false;
  
      this.listenTo(this.files, 'add remove', () => this.trigger('change:files'));
    },

  clickFileUpload() {
    this.isFileInputSelectComplete = false;
    loaderChannel.trigger('page:load');

    const interval = setInterval(() => {
      if (!this?.isRendered()) return clearInterval(this._internalLoaderInterval);
      if (this.isFileInputSelectComplete) {
        loaderChannel.trigger('page:load:complete');
        return clearInterval(interval);
      }
    }, 500);
    // After the file dialog is opened, the window will always get focus back once the file input returns
    // This listener is needed to handle file input closed, as the browser does not provide any event
    window.addEventListener('focus', () => this.isFileInputSelectComplete = true, { once: true });
  },
  

  // Can be used to simulate clicking the "Add Files" button from the default view
  openFileDialog() {
    this.getUI('fileuploader').find('input').click();
  },

  getDefaultProcessingOptions() {
    return _.extend({
      minFileSize: 1,
      checkForDisputeDuplicates: false,
      maxNumberOfFiles: null,
      maxNonVideoFileSize: configChannel.request('get', 'MAX_NON_VIDEO_FILESIZE_BYTES'),
      maxVideoFileSize: configChannel.request('get', 'MAX_VIDEO_FILESIZE_BYTES'),
      videoFileTypes: configChannel.request('get', 'VIDEO_FILE_TYPES'),
      allowedFileTypes: configChannel.request('get', 'ALLOWED_FILE_TYPES'),
      maxNumberOfFilesErrorMsg: null,
      customFileValidationFn: null,
      customFileValidationErrorMsg: null,
      // Note: Note used in R1 RTB
      invalidFileTypes: null,
    }, this.processing_options);
  },

  getDefaultComponentOptions() {
    let url = '';
    if (this.files instanceof CommonFileCollection) url = filesChannel.request('get:commonfileupload:url');
    else url = filesChannel.request('get:fileupload:url');

    return {
      url,
      headers: {
        Token: sessionChannel.request('token')
      },

      // 15 MB
      maxChunkSize: 15 * 1024 * 1024,

      // Component configuration options
      singleFileUploads: false,
      sequentialUploads: true,
      limitConcurrentUploads: 1,
      autoUpload: false
    };
  },

  defaultFileCreationFn(fileObj, processing_result) {
    return {
      fileObj: fileObj,
      original_file_name: fileObj.name,
      file_name: fileObj.name,
      file_type: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_EVIDENCE'),
      file_size: fileObj.size,
      upload_status: !processing_result ? 'ready' : 'processing_error',
      error_state: processing_result,
      ui_added_date: Moment().toISOString()
    };
  },


  // Allow the fileuploader to define the manner that files get parsed once added
  setFileCreationFn(file_creation_fn) {
    this.file_creation_fn = file_creation_fn;
  },

  _getDefaultMaxNumberOfFilesErrorMesage() {
    return `Only ${this.processing_options.maxNumberOfFiles} file${this.processing_options.maxNumberOfFiles === 1 ? ' is' : 's are'} permitted to be uploaded.`;
  },

  onRender() {
    this.getUI('childRegion').html(this.child_template);
    const all_fileuploader_options = _.extend({}, this.fileupload_options, {
      // Have to pass template selection at run time
      fileInput: this.$('input[type=file]'),
      dropZone: this.$('.file-upload-dropzone')
    }, this.processing_options);
    let generatedUploadId;

    this.getUI('fileuploader').fileupload(all_fileuploader_options)
    .on('fileuploadchange', (e, data) => {
      this.isFileInputSelectComplete = true;
    })
    .on('fileuploadadd', (e, data) => {
      const processing_options = this.processing_options;
      console.log("Adding ", data.originalFiles);
      _.each(data.originalFiles, function(file) {
        const existing_file = this.files.getByFileObject(file);
        const error_title = processing_options.errorModalTitle || DEFAULT_ERROR_MODAL_TITLE;
        let error_message = false;

        // If the file exists but is cancelled, then remove it and try to process and upload it again
        if (existing_file && existing_file.isCancelled()) {
          this.files.remove(existing_file, { silent: true });
        }

        // Otherwise, if the file exists then it's either duplicate on this same modal or an error
        if (existing_file && !existing_file.isCancelled()) {
          error_message = `File ${file.name} has already been ${existing_file.get('upload_status') === 'uploaded' ? 'uploaded' : 'selected to be uploaded'}` +
            `${ existing_file.get('error_state') ? ' but there was an error adding or uploading the file.  See the error message for details.' : ''}`;
        } else if (processing_options.checkForDisputeDuplicates && filesChannel.request('has:duplicate:file', file)) {
          // Check for duplicates elsewhere in the dispute
          error_message = `File ${file.name} has already been added to this application.`;
        } else if (processing_options.maxNumberOfFiles && _.union(this.files.getReadyToUpload(), this.files.getUploaded()).length >= processing_options.maxNumberOfFiles) {
          error_message = processing_options.maxNumberOfFilesErrorMsg || this._getDefaultMaxNumberOfFilesErrorMesage();
        } else if (_.isFunction(processing_options.customFileValidationFn) && !processing_options.customFileValidationFn(file)) {
          error_message = _.isFunction(processing_options.customFileValidationErrorMsg) ?
            processing_options.customFileValidationErrorMsg(file) :
            processing_options.customFileValidationErrorMsg || DEFAULT_CUSTOM_VALIDATION_FAILED_ERROR_MESSAGE;
        } else {
          const processing_result = this.processFile(file),
            new_file_model = new FileModel(this.file_creation_fn(file, processing_result));
          this.files.add(new_file_model);
          data.file_model = new_file_model;
          data.context = new_file_model;
        }

        if (error_message) {
          modalChannel.request('show:standard', {
            title: error_title,
            bodyHtml: `<p>${error_message}</p>`,
            primaryButtonText: 'Close',
            hideCancelButton: true,
            onContinueFn(modalView) {
              modalView.close();
            }
          });
        }
      }, this);

    }).on('fileuploadsend', (e, data) => {
      const fileObj = data && data.files && data.files.length ? data.files[0] : null,
        file_model = fileObj ? this.files.getByFileObject(fileObj) : null;
      if (!fileObj || !file_model) {
        console.log(`[Error] Can't find a file model to update for this file `, e, data);
        return false;
      }
      file_model.set({
        upload_status: 'uploading',
        error_state: null
      });

      generatedUploadId = sessionChannel.request('add:active:api', file_model.toJSON());
    })
    .on('fileuploadprogress', (e, data) => {
      console.log("file upload progress...", e, data);
      const fileObj = data && data.files && data.files.length ? data.files[0] : null,
        file_model = fileObj ? this.files.getByFileObject(fileObj) : null;
      if (!fileObj || !file_model) {
        console.log(`[Error] Can't find a file model to update for this file `, e, data);
        return false;
      }

      const progress = parseInt(data.loaded / data.total * 100, 10);
      file_model.trigger('update:progress', progress);
    })
    .on('fileuploaddone',  (e, data) => {
      console.log("file upload done...", e, data);
      const fileObj = data && data.files && data.files.length ? data.files[0] : null,
        file_model = fileObj ? this.files.getByFileObject(fileObj) : null;
      if (!fileObj || !file_model) {
        console.log(`[Error] Can't find a file model to update for this file `, e, data);
        return false;
      }
    })
    .on('fileuploadfail', (e, data) => {
      console.log("file upload done...", e, data);
      const fileObj = data && data.files && data.files.length ? data.files[0] : null,
        file_model = fileObj ? this.files.getByFileObject(fileObj) : null;
      if (!fileObj || !file_model) {
        console.log(`[Error] Can't find a file model to update for this file `, e, data);
        return false;
      }
    })
    .on('fileuploadalways', (e, data) => {
      if (generatedUploadId) sessionChannel.request('remove:active:api', generatedUploadId);
    });
  },

  clearNonUploadedFiles() {
    this.files.resetCollection();
  },

  getFileExtension(filename) {
    const matches = filename.match(/^.+\.(.+)$/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return "null";
  },


  processFile(fileObj) {
    const processing_options = this.processing_options;

    let error_state = null;
    const fileSize = $.type(fileObj.size) === 'number' ? fileObj.size : 0,
      lowercase_extension = this.getFileExtension(fileObj.name) ? this.getFileExtension(fileObj.name).toLowerCase() : '',
      is_video = processing_options.videoFileTypes && (_.has(processing_options.videoFileTypes, fileObj.type) ||
          _.has(processing_options.videoFileTypes, lowercase_extension)),
      is_invalid_type = !this.getFileExtension(fileObj.name) ||
        (processing_options.allowedFileTypes && !_.has(processing_options.allowedFileTypes, lowercase_extension)) ||
        (processing_options.invalidFileTypes && (_.has(processing_options.invalidFileTypes, fileObj.type)) ||
        _.has(processing_options.invalidFileTypes, lowercase_extension)) ;

    if (is_invalid_type) {
      error_state = 'type_error';
    } else if (is_video && processing_options.maxVideoFileSize && fileSize > processing_options.maxVideoFileSize) {
      error_state = 'video_size_error';
    } else if (!is_video && processing_options.maxNonVideoFileSize && fileSize > processing_options.maxNonVideoFileSize) {
      error_state = 'file_size_error';
    } else if (fileSize < processing_options.minFileSize) {
      error_state = 'empty_size_error';
    }

    return error_state;
  },

  onFileUploadSuccess(file_model, result, textStatus, jqXHR) {
    console.log(file_model, result, textStatus, jqXHR);
    console.log(result);
    // Only one file uploaded at a time is supported. Chunk endpoint returns object, original file one returns [object].  Handle both types here:
    const resultData = _.isArray(result) && result.length ? result[0] : result;
    if (resultData) {
      file_model.set(_.extend(file_model.parse(resultData), {
        upload_status: 'uploaded',
        error_state: null
      }));
    } else {
      console.log(`[Warning] Couldn't get file information after upload`, file_model, result);
      file_model.set({
        upload_status: 'uploaded',
        error_state: null
      });
    }

    // Only FileModels should be added to the dispute list, ignore things like CommonFileModels
    if (file_model instanceof FileModel) {
      filesChannel.request('add:file', file_model);
    }

    if (!this.file_description) {
      return $.Deferred().resolve().promise();
    } else {
      return filesChannel.request('create:linkfile', file_model, this.file_description);
    }
  },

  onFileUploadError(file_model, jqXHR, textStatus, errorThrown) {
    console.log(file_model, jqXHR, textStatus, errorThrown);
    if (textStatus === 'cancelled' || textStatus === 'abort') {
      file_model.set({
        upload_status: 'cancelled',
        error_state: 'cancelled'
      });
    } else {
      file_model.set({
        upload_status: 'error',
        error_state: 'upload_error'
      });
    }
  },

  onFileUploadComplete(file_model, xhr, foo, bar) {
    console.log(file_model, xhr, foo, bar);
  },

  addCancelListenerToXHR(xhr, file_model) {
    // The xhr will listen to a cancel event from this FileUploader instance and will cancel uploads accordingly
    _.extend(xhr, Backbone.Events);
    xhr.listenToOnce(this, 'cancel:all', function() {
      if (!file_model.isUploaded()) {
        file_model.set({
          upload_status: 'cancelled',
          error_state: 'cancelled'
        });
        xhr.abort('cancelled');
      }
    });
  },

  // Save the rename input into the file name parameter
  saveInternalDataToModel() {
    _.each(this.files.getReadyToUpload(), function(file_model) {
      file_model.saveInternalDataToModel();
    });
  },

  uploadAddedFiles() {
    // Validate files first
    const files_to_upload = this.files.getReadyToUpload();
    const dfd = $.Deferred();

    console.log("Trying to add ", files_to_upload);
    if (files_to_upload && !_.isEmpty(files_to_upload)) {
      this.is_uploading = true;
      this.trigger('upload:start', files_to_upload);
    }

    const all_file_xhr = [];
    _.each(files_to_upload, function(file_model) {
      file_model.set({
        upload_status: 'waiting',
        error_state: null
      });
      const fileObj = file_model.get('fileObj');
      const wrapping_dfd = $.Deferred();

      const xhr = this.getUI('fileuploader').fileupload('send', {
        files: [fileObj],
        formData: _.extend({
            FileName: file_model.get('file_name'),
            FileGuid: file_model.generateUploadGuid(),
          },
          file_model.get('file_type') ? { FileType: file_model.get('file_type') } : {},
          file_model.get('file_description') ? { FileDescription: file_model.get('file_description')} : {},
          file_model.get('file_title') ? { FileTitle: file_model.get('file_title')} : {},
          // File API doesn't pass the 'Z' at the end to denote UTC timezone, because this file endpoint default handling is to assume UTC.
          // If we pass timezone info 'Z', endpoint converts to UTC using server timezone.  We want no conversion to take place.
          file_model.get('file_date') ? { FileDate: file_model.get('file_date').replace('Z', '') } : {},
          file_model.get('added_by') ? { AddedBy: file_model.get('added_by') } : {},
          file_model.get('submitter_name') ? { SubmitterName: file_model.get('submitter_name') } : {},
          file_model.get('file_package_id') ? { FilePackageId: file_model.get('file_package_id') } : {}
        )
      })
      .success((result, textStatus, jqXHR) => {
        
        const resultData = _.isArray(result) && result.length ? result[0] : result;
        // DMS-4013: Detect and handle 0KB file upload issue by treating it as an error: clean up the API file, but keeping local model for error display
        if (resultData && resultData.file_size === 0) {
          file_model.set({
            upload_status: 'error',
            error_state: 'empty_size_upload_error'
          });
          apiChannel.request('allow:unauthorized');
          (new FileModel({ file_id: resultData.file_id })).destroy({ silent: true }).always(() => {
            apiChannel.request('restrict:unauthorized');
            wrapping_dfd.reject(result, textStatus, jqXHR);
          });
        } else {
          this.onFileUploadSuccess(file_model, result, textStatus, jqXHR).done(wrapping_dfd.resolve).fail(wrapping_dfd.reject);
        }
      }).error((jqXHR, textStatus, errorThrown) => {
        this.onFileUploadError(file_model, jqXHR, textStatus, errorThrown);
        wrapping_dfd.reject();
      }).complete(() => this.trigger('upload:file:complete', file_model));

      this.addCancelListenerToXHR(xhr, file_model);
      all_file_xhr.push(wrapping_dfd.promise());
    }, this);

    $.whenAll.apply($, all_file_xhr).done(() => {
      dfd.resolve();
    }).fail((errorMsg, status) => {
      console.log(errorMsg, status);
      // If user cancelled or aborted, consider a success
      if (status && status === 'cancelled' || status === 'abort') {
        dfd.resolve();
      } else {
        dfd.reject();
      }
    }).always(() => {
      this.is_uploading = false;
      this.trigger('upload:complete');
    });

    return dfd.promise();
  }
});
