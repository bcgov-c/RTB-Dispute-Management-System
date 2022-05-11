import Radio from 'backbone.radio';
import ViewMixin from '../../../core/utilities/ViewMixin';
import FileCollection from '../../../core/components/files/File_collection';
import FilesView from '../../../core/components/files/Files';
import ModalAddFilesView from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import template from './UploadEvidence_template.tpl';

const ADD_FILES_BUTTON_TEMPLATE = `<label class="da-upload-add-button da-upload-add-evidence-button"><%= addedFiles && addedFiles.length ? 'Edit added files' : 'Add files' %></label>`;
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.  To delete this item, click 'Add files' and click Delete All`;

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');

export default ViewMixin.extend({
  template,

  className() {
    return `da-upload-evidence-item ${this.getOption('mode') === 'upload' && !this.hasUploadableFiles() ? 'hidden' : ''}`;
  },

  regions: {
    uploaderRegion: '.da-upload-evidence-file-uploader',
    fileUploadRegion: '.files-to-upload'
  },

  ui: {
    add: '.da-upload-add-evidence-button',
    error: '.other-evidence-empty-error'
  },

  events: {
    'click @ui.add': 'clickAddWithWarning'
  },

  clickAddWithWarning() {
    const showEvidenceWarningPromise = this.getOption('showEvidenceWarningPromise');
    if (showEvidenceWarningPromise && _.isFunction(showEvidenceWarningPromise)) {
      $.when(showEvidenceWarningPromise(this.associatedClaim)).then(() => this.clickAdd());
    } else {
      this.clickAdd();
    }
  },

  clickAdd() {
    // Copy files into a new collection so no events are triggered on the old collection
    const originalFileModels = this.model.get('files').getReadyToUpload() || [];
    originalFileModels.forEach(fileModel => {
      if (fileModel.collection) {
        fileModel.collection.remove(fileModel, { silent: true });
      }
      
      // Allow renames to happen in the Upload window
      fileModel.set('display_mode', false);
    });

    const modal_files = new FileCollection(originalFileModels);

    if (!this.model.isCustom()) {
      this.model.get('titleModel').set('disabled', true);
    }

    const modalShowDelete = _.isUndefined(this.showDelete) ? this.model.isNew() : this.showDelete;
    const modalAddFiles = new ModalAddFilesView({
      title: 'Add / Edit Files',
      files: modal_files,
      isOnlyFiles: !this.model.isNew(), // If the file description is already saved, we don't need a description
      noUploadOnSave: true,
      saveButtonText: 'Update upload list',
      mobileSaveButtonText: modalShowDelete ? 'Update' : null,
      useFileTypeDropdown: this.model && this.model.get('typeModel') && this.model.get('typeModel').getData({ parse: true }),
      showDelete: modalShowDelete,
      hideDescription: this.hideDescription,
      model: this.model,
      isDescriptionRequired: this.isDescriptionRequired,
      fileType: this.fileType,
      
      processing_options: this.processing_options
    });

    let modelsToResetWith = originalFileModels;
    let fileAdded = false;
    this.listenTo(modalAddFiles, 'save:complete', () => {
      this.uploadModel.addPendingUpload(this.model);

      fileAdded = true;
      modelsToResetWith = modal_files.getReadyToUpload()
    });

    this.listenTo(modalAddFiles, 'delete:complete', () => {
      this.uploadModel.removePendingUpload(this.model);
      
      if (this.model.isCustom() || this.model.isBulkEvidence()) {
        this.model.destroy();
      } else {
        modal_files.resetCollection();
        this._resetDescription();
      }
    });

    this.listenTo(modalAddFiles, 'removed:modal', () => {
      this.model.get('files').reset(modelsToResetWith.map(function(file_model) {
        file_model.set('display_mode', true);
        if (file_model.collection) {
          file_model.collection.remove(file_model, {silent: true});
        }
        return file_model;
      }));

      if (fileAdded) this.uploadModel.trigger('file:added', this.model);
      this.refreshUI();
    }, this);

    modalChannel.request('add', modalAddFiles);
  },

  _resetDescription() {
    const fileDescription = this.model.get('file_description');
    const savedDescription = fileDescription.getApiSavedAttr('description');
    fileDescription.set('description', savedDescription, { silent: true });
    this.model.get('descriptionModel').set('value', savedDescription, { silent: true });
  },

  hasUploadableFiles() {
    const uploadModel = this.getOption('uploadModel');
    const readyFiles = this.model.getReadyToUploadFiles();
    return uploadModel.hasPendingUpload(this.model) && readyFiles.length;
  },

  initFileUploader() {
    return filesChannel.request('create:uploader', {
      files: this.model.get('files'),
      file_description: this.model.get('file_description'),
      child_template: _.template(ADD_FILES_BUTTON_TEMPLATE)({ addedFiles: this.model.get('files').getReadyToUpload() }),
      // NOTE: Use the "External" file type for all dispute access uploads
      file_creation_fn: function() {
        return _.extend(this.defaultFileCreationFn(...arguments), {
          file_type: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_EVIDENCE'),
          added_by: disputeChannel.request('get').get('tokenParticipantId')
        });
      }
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'uploadModel', 'claimCollection', 'associatedClaim', 'isDescriptionRequired', 'hideDescription', 'showDelete', 'fileType', 'processing_options', 'showEvidenceWarningPromise']);
    this.processing_options = this.processing_options || {};
    
    this.fileUploader = this.initFileUploader();
    this.listenTo(this.model.get('files'), 'remove', this.refreshUI, this);
    this.listenTo(this.model.get('files'), 'update', this.refreshUI, this);

    this.listenTo(this.model, 'render', () => {
      this.render();
      this.refreshUI();
    }, this);

    this.listenTo(this.model, 'open:help', () => this.$('.help-icon:visible').trigger('click.rtb-help'));
  },

  refreshUI() {
    this.render();
    if (this.claimCollection) {
      this.claimCollection.trigger('update:file:count');
    }
    this.validateAndShowErrors();
  },

  onRender() {
    if (this.fileUploader.isDestroyed()) {
      this.fileUploader = this.initFileUploader();
    }
    this.showChildView('uploaderRegion', this.fileUploader);
    this.showChildView('fileUploadRegion', new FilesView({ collection: this.model.get('files'), hideUploaded: true }));

    this.initializeHelp(this, this.model.get('helpHtml'));

    this.validateAndShowErrors();
  },

  validateAndShowErrors() {
    const files = this.model.get('files');

    let is_valid = true;
    if (this.model.isNew() && this.model.isCustom() && (!files || !files.getReadyToUpload().length) ) {
      this.showErrorMessage(NO_FILES_ERROR_MSG);
      is_valid = false;
    } else {
      this.hideErrorMessage();
    }

    const filesViewRegion = this.getChildView('fileUploadRegion');
    if (filesViewRegion) {
      is_valid = is_valid & filesViewRegion.validateAndShowErrors();
    }
    return is_valid;
  },

  hideErrorMessage() {
    this.getUI('error').text('').addClass('hidden-item');
  },

  showErrorMessage(error_msg) {
    this.getUI('error').text(error_msg).removeClass('hidden-item');
  },

  templateContext() {
    const file_description = this.model.get('file_description');
    const uploadedFilesLength = this.model.get('files').getUploaded().length;
    const pendingFilesLength = this.model.get('files').getReadyToUpload().length;
    const title = file_description ? file_description.get('title') : this.model.get('title');
    const evidenceTitle = this.model.isCustom() && !title ? 'Other' : (this.model.get('required') ? `<b>${title}</b>` : `<i>${title} (optional)</i>`)

    return {
      helpHtml: this.model.get('helpHtml'),
      description: file_description ? file_description.get('description') : null,
      uploadedFilesLength,
      pendingFilesLength,
      isUpload: this.mode === 'upload',
      isDisplayOnly: this.mode === 'displayOnly' || this.model.isCustom(),
      evidenceTitle,
    };
  }
});
