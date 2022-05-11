import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ModalBaseView from '../../modals/ModalBase';
import DropdownView from '../../dropdown/Dropdown';
import InputView from '../../input/Input';
import TextareaView from '../../textarea/Textarea';
import FilesView from '../../files/Files';
import ViewMixin from '../../../utilities/ViewMixin';
import template from './ModalAddFiles_template.tpl';

const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.`;

const filesChannel = Radio.channel('files');
const participantChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');

export default ModalBaseView.extend({
  template,
  id: 'addFiles_modal',
  
  className() {
    return `${ModalBaseView.prototype.className} ${this.getOption('cssClass') || ''}`;
  },

  // Completely override the ui and events from ModalBaseView, because we do custom things with the actions
  ui: {
    save: '#addFilesSave',
    cancel: '#addFilesCancel',
    close: '#addFilesClose',
    deleteAll: '#addFilesDeleteAll',
    closeBtn: '.close-x',
    fileDescription: '.file-description'
  },

  regions: {
    fileTypeRegion: '.modal-add-files-file-type',
    fileTitleRegion: '.file-title',
    fileDescriptionRegion: '@ui.fileDescription',
    fileUploadRegion: '.file-upload',
    fileListRegion: '.file-upload-list'
  },

  events: {
    'click @ui.save': 'save',
    'click @ui.close': 'close',
    'click @ui.closeBtn': 'close',
    'click @ui.cancel': 'cancel',
    'click @ui.deleteAll': 'deleteAll'
  },

  isOnlyFiles: false,
  fileType: null,
  showDelete: true,
  isDescriptionRequired: true,

  
  save() {
    this.hideFilesError();

    const fileUploader = this.getChildView('fileUploadRegion');
    if (!this.isOnlyFiles) {
      this.model.saveInternalDataToModel();
      this.model.get('file_description').set('file_method', 100);
    }

    fileUploader.saveInternalDataToModel();

    if (!this.validateAndShowErrors()) {
      console.log('DisputeEvidence or Files was not valid');
      return false;
    }
    
    if (this.noUploadOnSave) {
      this.trigger('save:complete');
      this.close();
      return;
    }

    if (!this.isOnlyFiles) {
      if (this.model.needsApiUpdate()) {
        loaderChannel.trigger('page:load');
      }
      this.model.save(this.model.getApiChangesOnly())
        .done(() => this._uploadAddedFiles())
        .always(() => loaderChannel.trigger('page:load:complete'));
      
    } else {
      this._uploadAddedFiles();
    }
  },

  _uploadAddedFiles() {
    const fileUploader = this.getChildView('fileUploadRegion');
    loaderChannel.trigger('page:load:complete');
    fileUploader.uploadAddedFiles().done(() => {
      this.trigger('save:complete');
      this.close();
    }).always(() => loaderChannel.trigger('page:load:complete'));
  },

  close() {
    if (!this.noUploadOnSave) {
      const fileUploader = this.getChildView('fileUploadRegion');
      if (fileUploader) {
        fileUploader.clearNonUploadedFiles();
      }
      
      if (!this.isOnlyFiles) {
        this.model.resetModel();
      }
    }
    modalChannel.request('remove', this);
  },

  cancel() {
    const fileUploader = this.getChildView('fileUploadRegion');
    if (fileUploader) {
      fileUploader.trigger('cancel:all');
    }
  },

  deleteAll() {
    loaderChannel.trigger('page:load');
    
    let deletePromise = $.Deferred().resolve().promise();
    if (!this.noUploadOnSave) {
      deletePromise = this.isOnlyFiles ? this.files.deleteAll() : filesChannel.request('delete:filedescription:full', this.model, { intakeEvidenceRules: true, files: this.files });
    }
    
    deletePromise
      .done(() => this.trigger('delete:complete'))
      .fail(() => alert("Error deleting one or more files"))
      .always(() => {
        this.close();
        loaderChannel.trigger('page:load:complete');
      });
  },

  deleteFile(file_model) {
    (this.isOnlyFiles ? file_model.destroy() : filesChannel.request('delete:file', file_model))
      .done(() => {
        if (file_model.collection) {
          file_model.collection.remove(this.model, { silent: true });
        }
      });
  },

  /**
   * @param {BackboneFileCollection} files - The FileCollection list which will be changed by user selections in this modal.
   * @param {String} [title] - Modal title to display.  If none is provided, uses a default value
   * @param {Object} [processing_options] - Options to pass through to the FileUploader
   * 
   * @param {Boolean} [isOnlyFiles] - Indicates when this modal is to be used with no FileDescription as the underlying model
   * @param {Boolean} [hideDescription] - Indicates whether to show the description component.  Does not affect whether description model is required or not
   * @param {Boolean} [showDelete] - Indicates whether to allow "Delete All" of the files and underlying FileDescription.  Default true
   * @param {Boolean} [isDescriptionRequired] - Indicates whether description should be required for modal validation
   * @param {Integer} [fileType] - The positive integer value to pass through to any FileModels being created here
   * @param {Integer} [addedBy] - Participant id of who is adding the file.  Must be provided, so defaults to primary applicant if not provided.
   * @param {Integer} [filePackageId] - The optional file package ID to set on files added to this modal.  Passed through to FileUploader.
   * @param {Boolean} [noUploadOnSave] - Indicates that the save button should not perform an upload, but should just close
   * @param {String} [saveButtonText] - An optional value to replace the text on the save button
   * * @param {String} [mobileSaveButtonText] - An optional value to replace the text on the save button for mobile only
   * @param {Boolean} [useFileTypeDropdown] - Indicates that we want to pick files from a list
   * @param {Boolean} [hideCloseButton] - An optional value to hide close button
   * @param {Boolean} [autofillRename] - An optional value to automatically rename files added by user as the filename. Equivalent to the user clicking "use this name" on a File
   * @param {String} [cssClass] - An optional string of class names to add to top level modal element
   */
  initialize(options) {
    this.mergeOptions(options, ['files', 'title', 'processing_options', 'isOnlyFiles', 'hideDescription', 'showDelete', 'isDescriptionRequired',
        'fileType', 'filePackageId', 'noUploadOnSave', 'saveButtonText', 'mobileSaveButtonText', 'useFileTypeDropdown', 'hideCloseButton', 
        'autofillRename', 'cssClass']);
    
    this.descriptionModel = this.model ? this.model.get('descriptionModel') : null;
    this.CUSTOM_NON_ISSUE_NON_EVIDENCE_CODE = configChannel.request('get', 'CUSTOM_NON_ISSUE_NON_EVIDENCE_CODE') || null;
    
    this.setupListeners();
  },

  setupListeners() {
    this.stopListening(this.files, 'delete:file', this.deleteFile);
    this.listenTo(this.files, 'delete:file', this.deleteFile, this);
    
    if (!this.isOnlyFiles) {
      if (!this.isDescriptionRequired) {
        this._makeFileDescriptionOptional();
      }
      this.listenTo(this.model.get('titleModel'), 'change:value', this.refreshButtonsUI, this);
      this.listenTo(this.descriptionModel, 'change:value', this.refreshButtonsUI, this);
      this.listenTo(this.model.get('typeModel'), 'change:value', this.onTypeModelChange, this);
    }
  },

  setupFileUploaderListeners(fileUploader) {
    if (!fileUploader) {
      return;
    }

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

  onTypeModelChange(model, value) {
    if (value && String(value) === String(this.CUSTOM_NON_ISSUE_NON_EVIDENCE_CODE)) {
      this.model.get('titleModel').set({
        value: null,
        required: true,
        disabled: false,
      });
      this.toggleFileTitleView({show: true});
    } else {
      this.model.get('titleModel').set({
        value: model.getSelectedText() || null,
        required: false
      });
      this.toggleFileTitleView({show: false});
    }  
  },

  _makeFileDescriptionOptional() {
    if (this.descriptionModel) {
      this.descriptionModel.set({ cssClass: 'optional-input', required: false });
    }
  },

  validateAndShowErrors() {
    const regionsToValidate = this.isOnlyFiles ? ['fileListRegion'] :
      ['fileTitleRegion', 'fileDescriptionRegion', 'fileListRegion'];

    const fileUploader = this.getChildView('fileUploadRegion');


    let is_valid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    });

    // If there are no files uploaded, and no files ready to upload
    if (!fileUploader.files || !_.union(fileUploader.files.getUploaded(), fileUploader.files.getReadyToUpload()).length) {
      this.$(filesErrorClassSelector).html(NO_FILES_ERROR_MSG);
      is_valid = false;
    }

    return is_valid;
  },


  showUploadButtons() {
    this.getUI('cancel').removeClass('hidden-item');
    this.getUI('save').addClass('hidden-item');
    this.getUI('close').addClass('hidden-item');
    this.getUI('deleteAll').addClass('hidden-item');
    this.getUI('closeBtn').addClass('hidden-item');

    this.getUI('fileDescription').find('textarea').attr('disabled', 'disabled');
  },

  hideUploadButtons() {
    this.getUI('cancel').addClass('hidden-item');
    this.getUI('deleteAll').removeClass('hidden-item');
    this.getUI('close').removeClass('hidden-item');
    this.getUI('closeBtn').removeClass('hidden-item');
    
    if (!this.isOnlyFiles && !this.descriptionModel.get('disabled')) {
      this.getUI('fileDescription').find('textarea').removeAttr('disabled');
    }
  },

  hideFilesError() {
    this.$(filesErrorClassSelector).html('');
  },

  // Model and Value are passed in when this is used as an 'on-change' handler from textarea and name model
  refreshButtonsUI(model) {
    this.hideFilesError();
    const fileUploader = this.getChildView('fileUploadRegion');

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
        if ( !this.isOnlyFiles && $.trim(this.model.get('file_description').get(api_field_name)) !== $.trim(api_values[api_field_name]) ) {
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

  toggleFileTitleView(options) {
    options = options || {};
    const titleView = this.getChildView('fileTitleRegion');
    if (!titleView || !titleView.isRendered()) {
      return;
    }

    if (options.show) {
      titleView.render();
      $(titleView.$el).closest(this.regions.fileTitleRegion).show();
      titleView.$el.show();
    } else {
      titleView.$el.hide();
    }
  },

  onRender() {
    if (!this.isOnlyFiles) {
      this.showChildView('fileTypeRegion', new DropdownView({ model: this.model.get('typeModel') }));
      this.showChildView('fileTitleRegion', new InputView({ model: this.model.get('titleModel') }));
      this.showChildView('fileDescriptionRegion', new TextareaView({ model: this.descriptionModel }));  
    }

    const filePackageId = this.filePackageId;
    const fileType = this.fileType;
    const addedBy = this.addedBy;
    const autofillRename = this.autofillRename;
    const fileUploader = filesChannel.request('create:uploader', {
      // Use the DisputeEvidenceModel that was passed in
      processing_options: this.processing_options ? this.processing_options : {},
      files: this.files,
      file_description: !this.isOnlyFiles ? this.model.get('file_description') : null,
      file_creation_fn: function() { // Scope context is the FileUploader so that we can use the default params
        return _.extend({}, this.defaultFileCreationFn(...arguments), {
            added_by: addedBy ? addedBy : participantChannel.request('get:primaryApplicant:id'),
            file_type: fileType ? fileType : configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_EVIDENCE'),
            autofillRename,
          },
          filePackageId ? { file_package_id: filePackageId } : {}
        );
      }
    });

    this.showChildView('fileUploadRegion', fileUploader);
    this.showChildView('fileListRegion', new FilesView({
      showDelete: this.showDelete,
      collection: this.files,
    }));


    this.setupFileUploaderListeners(fileUploader);
    this.refreshButtonsUI();

    if (this.model) {
      if (this.useFileTypeDropdown && this.model.get('typeModel')) {
        this.onTypeModelChange(this.model.get('typeModel'), this.model.get('typeModel').getData({ parse: true }));
      }
      ViewMixin.prototype.initializeHelp.call(this, this, this.model.get('helpHtml'));
    }
  },

  templateContext() {
    return {
      closeButtonText: this.noUploadOnSave ? 'Cancel' : 'Close',
      saveButtonText: this.saveButtonText || 'Save',
      mobileSaveButtonText: this.mobileSaveButtonText,
      hideCloseButton: this.hideCloseButton,
      title: this.title,
      useFileTypeDropdown: this.useFileTypeDropdown,
      showDelete: this.showDelete,
      hideDescription: this.hideDescription,
      titleModel: this.model && this.model.get('titleModel') ? this.model.get('titleModel') : new Backbone.Model({}),
      helpHtml: this.model && this.model.get('helpHtml') ? this.model.get('helpHtml') : null
    }
  }
});
