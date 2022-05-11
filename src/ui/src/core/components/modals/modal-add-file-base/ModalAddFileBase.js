import Radio from 'backbone.radio';
import ModalBaseView from '../../modals/ModalBase';
import FilesView from '../../files/Files';
import InputView from '../../input/Input';
import InputModel from '../../input/Input_model';
import TextareaView from '../../textarea/Textarea';
import TextareaModel from '../../textarea/Textarea_model';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import template from './ModalAddFileBase_template.tpl';

const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.`;
const DUPLICATE_FILE_NAME = 'A file with the same name already exists';

export default ModalBaseView.extend({
  template,
  id: 'addFileBase_modal',

  ui: {
    save: '#addFilesSave',
    cancel: '#addFilesCancel',
    close: '#addFilesClose',
    closeBtn: '.close-x',
    fileDescription: '.file-description'
  },

  regions: {
    fileDescriptionRegion: '@ui.fileDescription',
    fileUploadRegion: '.file-upload',
    fileListRegion: '.file-upload-list',
    documentFileTitleRegion: '.file-document-title'
  },

  events: {
    'click @ui.save': 'save',
    'click @ui.close': 'close',
    'click @ui.closeBtn': 'close',
    'click @ui.cancel': 'cancel',
  },

  save() {
    this.hideFilesError();

    const fileUploader = this.getChildView('fileUploadRegion');
    fileUploader.saveInternalDataToModel();
    this.model.saveInternalDataToModel();

    if (!this.validateAndShowErrors()) {
      console.log('DisputeEvidence or Files was not valid');
      return false;
    }

    const fileData = _.extend({}, this.documentTitleModel.getPageApiDataAttrs(), this.descriptionModel.getPageApiDataAttrs(), {file_name: this.files.at(0).get('file_name')});
    fileUploader.files.each(fileModel => fileModel.set(fileData));
    
    if (this.editMode) {
      this.model.save(fileData).done(() => {
        this.close();
        this.trigger('save:complete');
      }).fail(generalErrorFactory.createHandler('ADMIN.COMMONFILE.SAVE', () => {

    }));
    } else {
      this._uploadAddedFiles();
    }
  },

  _uploadAddedFiles() {
    const fileUploader = this.getChildView('fileUploadRegion');
    fileUploader.uploadAddedFiles().done(() => {
      this.close();
      this.trigger('save:complete');
    })
  },

  close() {
    const fileUploader = this.getChildView('fileUploadRegion');
    if (fileUploader) {
      fileUploader.clearNonUploadedFiles();
    }

    modalChannel.request('remove', this);
  },

  cancel() {
    const fileUploader = this.getChildView('fileUploadRegion');
    if (fileUploader) {
      fileUploader.trigger('cancel:all');
    }
  },

  deleteFile(file_model) {
    filesChannel.request('delete:file', file_model)
      .done(() => {
        if (file_model.collection) {
          file_model.collection.remove(this.model, { silent: true });
        }

        if (this.editMode) {
          this.trigger('save:complete');
          this.close();
        }
      });
  },

  createSubModels() {
    this.descriptionModel = new TextareaModel({
      labelText: 'Document Description',
      errorMessage: 'Description is required',
      cssClass: 'optional-input',
      max: 1000,
      countdown: true,
      required: false,
      value: this.model.get('file_description') ? this.model.get('file_description') : null,
      apiMapping: 'file_description'
    });

    this.documentTitleModel = new InputModel({
      labelText: 'Document Title',
      errorMessage: 'Enter the document title',
      maxLength: 40,
      minLength: 5,
      required: true,
      value: this.model.get('file_title') ? this.model.get('file_title') : null,
      apiMapping: 'file_title'
    });
  },

  setupFileUploaderListeners(fileUploader) {
    if (!fileUploader) {
      return;
    }

    this.stopListening(this.files, 'delete:file', this.deleteFile);
    this.listenTo(this.files, 'delete:file', this.deleteFile, this);
    
    this.stopListening(fileUploader, 'change:files', this.refreshButtonsUI);
    this.listenTo(fileUploader, 'change:files', this.refreshButtonsUI, this);

    this.stopListening(fileUploader, 'upload:start', this.refreshButtonsUI);
    this.listenTo(fileUploader, 'upload:start', this.refreshButtonsUI, this);

    this.stopListening(fileUploader, 'upload:complete');
    this.listenTo(fileUploader, 'upload:complete', function() {
      this.refreshButtonsUI();
      this.trigger('upload:complete');
    }, this);
  },

  showUploadButtons() {
    this.getUI('cancel').removeClass('hidden-item');
    this.getUI('save').addClass('hidden-item');
    this.getUI('close').addClass('hidden-item');
    this.getUI('closeBtn').addClass('hidden-item');

    this.getUI('fileDescription').find('textarea').attr('disabled', 'disabled');
  },

  hideUploadButtons() {
    this.getUI('cancel').addClass('hidden-item');
    this.getUI('close').removeClass('hidden-item');
    this.getUI('closeBtn').removeClass('hidden-item');
  },

  // Model and Value are passed in when this is used as an 'on-change' handler from textarea and name model
  refreshButtonsUI(model) {
    this.hideFilesError();
    const fileUploader = this.getChildView('fileUploadRegion');

    //potential file uploader bug. If maxFiles === 1 and "type not allowed error", multiple files are still added to fileUploader.files?
    if (fileUploader.files.models.length > 1 && this.processing_options.maxNumberOfFiles === 1) {
      fileUploader.files.models = [fileUploader.files.models[1]];
    }

    if (fileUploader.is_uploading) {
      this.showUploadButtons();
      return;
    } else {
      this.hideUploadButtons();
    }

    let has_changes = false;
    if (fileUploader && fileUploader.files && fileUploader.files.getReadyToUpload().length) {
      has_changes = true;
    }

    if (model) {
      const api_values = model.getPageApiDataAttrs();
      _.each(_.keys(api_values), function(api_field_name) {
        if (has_changes) {
          return;
        }
        if ($.trim(this.descriptionModel.get(api_field_name)) !== $.trim(api_values[api_field_name]) ) {
          has_changes = true;
        }
      }, this);
    }

    if (has_changes) {
      this.getUI('save').removeClass('hidden-item');
    } else {
      this.getUI('save').addClass('hidden-item');
    }
  },

  hideFilesError() {
    this.$(filesErrorClassSelector).html('');
  },

  _showErrorMessageOnRegion(regionName, errorMsg) {
    const view = this.getChildView(regionName);
    if (view) {
      view.showErrorMessage(errorMsg);
    }
  },

  validateAndShowErrors() {
    const regionsToValidate = ['documentFileTitleRegion', 'fileDescriptionRegion', 'fileListRegion'];
    const fileUploader = this.getChildView('fileUploadRegion');

    let is_valid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    });

    if (this.editMode) {
      return is_valid;
    }
    // If there are no files uploaded, and no files ready to upload
    if (!fileUploader.files || !_.union(fileUploader.files.getUploaded(), fileUploader.files.getReadyToUpload()).length) {
      this.$(filesErrorClassSelector).html(NO_FILES_ERROR_MSG);
      is_valid = false;
    }
    
    if (fileUploader.files.at(0)) {
      const fileNameToUpload = fileUploader.files.at(0).getNameNoExtension();
      const hasDuplicate = this.inUseFiles.find(fileModel => fileModel.getNameNoExtension() === fileNameToUpload && fileNameToUpload);
      if (hasDuplicate) {
        const fileListView = this.getChildView('fileListRegion')
        fileListView.showErrorMessage(DUPLICATE_FILE_NAME);
        is_valid = false;
        return;
      }
    }

    return is_valid;
  },

  initialize(options) {
    this.mergeOptions(options, ['files', 'title', 'processing_options', 'description',
        'fileType', 'saveButtonText', 'mobileSaveButtonText', 'hideCloseButton', 'cssClass', 'inUseFiles', 'editMode', 'showDelete']);

    if (this.editMode) {
      //set models so that we get the edit file display //uploaded
      this.files.at(0).set({ upload_status: 'uploaded', original_file_name: this.files.at(0).get('file_name'), editable: this.editMode })
      this.model.get('renameInputModel').set({ value: this.model.getOriginalNameNoExtension()})
    }
    this.createSubModels();
  },

  onRender() {
    const fileType = this.fileType;
    const fileUploader = filesChannel.request('create:uploader', {
      processing_options: this.processing_options ? this.processing_options : {},
      files: this.files,
      file_creation_fn: function() { // Scope context is the FileUploader so that we can use the default params
        return _.extend({}, this.defaultFileCreationFn(...arguments), {
          file_type: fileType
          },
        );
      }
    });

    this.showChildView('fileUploadRegion', fileUploader);
    this.showChildView('fileListRegion', new FilesView({ showDelete: this.showDelete, collection: this.files }));
    this.showChildView('documentFileTitleRegion', new InputView({ model: this.documentTitleModel }));
    this.showChildView('fileDescriptionRegion', new TextareaView({ model: this.descriptionModel }));

    this.setupFileUploaderListeners(fileUploader);
  },

  templateContext() {
    return {
      closeButtonText: 'Cancel',
      saveButtonText: this.saveButtonText || 'Save',
      mobileSaveButtonText: this.mobileSaveButtonText,
      hideCloseButton: false,
      title: this.title,
      showDelete: this.showDelete,
    }
  }
});