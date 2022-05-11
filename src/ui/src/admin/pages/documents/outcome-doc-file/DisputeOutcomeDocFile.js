import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import EditableComponentView from '../../../../core/components/editable-component/EditableComponent';
import DisputeOutcomeExternalFileView from './DisputeOutcomeExternalFile';
import FileCollection from '../../../../core/components/files/File_collection';
import ModalAddFiles from '../../../../core/components/modals/modal-add-files/ModalAddFiles';
import ModalGeneratedOutcomeDoc from './modals/ModalGeneratedOutcomeDoc';
import template from './DisputeOutcomeDocFile_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

let UAT_TOGGLING = {};

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const filesChannel = Radio.channel('files');
const documentsChannel = Radio.channel('documents');
const menuChannel = Radio.channel('menu');

export default Marionette.View.extend({
  template,
  className() {
    return `standard-list-item outcome-doc-file-container ${this.model.isOther() ? 'other-doc-file' : ''}`;
  },

  regions: {
    statusRegion: '.outcome-doc-file-status',
    commentRegion: '.outcome-doc-file-comment',
    sourceRegion: '.outcome-doc-file-source',
    visibleRegion: '.outcome-doc-file-visible',

    uploadsRegion: '.outcome-doc-file-uploads'
  },

  ui: {
    sourceActionBtn: '.outcome-doc-file-source-btn',
    deleteBtn: '.outcome-doc-file-delete-btn',
    uploadDeleteBtn: '.outcome-doc-file-uploads-delete-btn'
  },

  events: {
    'click @ui.sourceActionBtn': 'clickSourceActionBtn',
    'click @ui.uploadDeleteBtn': 'clickUploadDelete',
    'click @ui.deleteBtn': 'clickDelete'
  },

  _clickComposerSourceActionBtn() {
    const composer_instance = documentsChannel.request('create:composer', this.model),
      menu_composer_item = composer_instance ? composer_instance.getMenuItem() : null;

    if (!menu_composer_item) {
      return;
    }
    
    menuChannel.trigger('add:group:item', menu_composer_item);
    Backbone.history.navigate(menu_composer_item.navigation_link, {trigger: true});
  },

  _clickExternalSourceActionBtn() {
    const files = new FileCollection();
    const uploadedDocGroupFileIds = this.outcomeGroupModel.getOutcomeFiles().filter(doc => {
      // Don't look in the current doc group for duplicate files, so don't include this model
      return doc.id !== this.model.id && !doc.isExternal() && doc.get('file_id');
    }).map(doc => doc.get('file_id'));
    const modal = new ModalAddFiles({
      title: 'Upload Final Document',
      fileType: this.model.isPublic() ? configChannel.request('get', 'FILE_TYPE_ANONYMOUS_EXTERNAL') : configChannel.request('get', 'FILE_TYPE_INTERNAL'),
      isOnlyFiles: true,
      files,
      showDelete: false,
      autofillRename: true,
      processing_options: {
        errorModalTitle: 'Adding Outcome Document File',
        maxNumberOfFilesErrorMsg: `Only one final document can be uploaded.  If you have more than one PDF document for the same outcome document file, they must be combined into a single PDF document.`,
        maxNumberOfFiles: 1,
        checkForDisputeDuplicates: false,        
        allowedFileTypes: configChannel.request('get', 'VALID_OUTCOME_DOC_FILE_TYPES'),
        customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been uploaded to this document group`,
        customFileValidationFn: ((fileObj) => {
          const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
          return !_.any(uploadedDocGroupFileIds, fileId => {
            const fileModel = filesChannel.request('get:file', fileId);
            if (!fileModel) {
              return false;
            }
            return fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
          });
        }).bind(this)
      }
    });

    this.stopListening(modal);
    this.listenTo(modal, 'save:complete', () => {
      const uploadedFiles = files.getUploaded() || [];
      const uploadedFile = !_.isEmpty(uploadedFiles) ? uploadedFiles[0] : null;
      const fileId = uploadedFile && uploadedFile.id;

      if (this.model.isPublic()) {
        this._deleteAndCreateNewAnonymizedDoc(fileId);
      } else {
        this.fileModel = uploadedFile;
        this.model.save({ file_id: fileId })
          .done(() => {
            this.render();
            this.switchToEditState();
            loaderChannel.trigger('page:load:complete');
          })
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.SAVE', () => {
              this.render();
              this.switchToEditState();
            });
            handler(err);
          });
      }
    });
    modalChannel.request('add', modal);
  },

  _clickGeneratedActionBtn() {
    modalChannel.request('add', new ModalGeneratedOutcomeDoc({ model: this.model }));
  },

  _deleteAndCreateNewAnonymizedDoc(fileId) {
    const outcomeFileDCN = this.outcomeGroupModel.getOutcomeFileDCN();
    const docConfigId = configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION');
    const fileConfig = documentsChannel.request('config:file', docConfigId) || {};
    const createdOutcomeFile = this.outcomeGroupModel.createOutcomeFile(
    _.extend({
        file_type: docConfigId,
        file_acronym: fileConfig.code,
        file_title: fileConfig.title,
        file_id: fileId,
        file_source: configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL'),
        visible_to_public: this.model.get('visible_to_public')
      },
      outcomeFileDCN ? { note_worthy: outcomeFileDCN.get('note_worthy'), materially_different: outcomeFileDCN.get('materially_different') } : {},
  
    ), { add: true });

    const deleteOutcomeDocPromise = () => new Promise((res, rej) => this.model.destroy().then(res).catch(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.REMOVE', rej)));
    const deleteOutcomeDocFilePromise = () => new Promise((res, rej) => filesChannel.request('delete:file', this.fileModel).then(res).catch(generalErrorFactory.createHandler('ADMIN.FILES.UPLOAD', rej)));
    const createOutcomeDocPromise = () => new Promise((res, rej) => createdOutcomeFile.saveAll().then(res).catch(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.SAVE.ALL', rej)));
    
    deleteOutcomeDocPromise()
      .then(() => deleteOutcomeDocFilePromise())
      .then(() => createOutcomeDocPromise())
      .catch(() => this.switchToEditState())
      .finally(() => {
        this.fileModel = null;
        this.render();
        this.switchToEditState();
        loaderChannel.trigger('page:load:complete');
      });
  },

  clickSourceActionBtn() {
    if (this._isFileSourceExternal()) {
      this._clickExternalSourceActionBtn();
    } else if (this._isFileSourceGenerated() && this._canDecisionGeneratorBeRun()) {
      this._clickGeneratedActionBtn();
    } else {
      this._clickComposerSourceActionBtn();
    }
  },

  clickUploadDelete() {
    if (!this._canAssociatedFileBeDeleted()) {
      console.log('Cannot delete uploaded file, it may not be uploaded, or this outcome file may have associated deliveries', this.model, this);
      return;
    }

    const deleteOutcomeDocFilePromise = () => new Promise((res, rej) => filesChannel.request('delete:file', this.fileModel).then(res).catch(rej));
    const deleteOutcomeDocPromise = () => new Promise((res, rej) => this.model.destroy().then(res).catch(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.REMOVE', rej)));

    const onDeleteFinishFn = (() => {
      this.render();
      this.switchToEditState();
      this.fileModel = null;
      loaderChannel.trigger('page:load:complete');
    }).bind(this);

    const deleteFn = () => {
      deleteOutcomeDocPromise()
        .then(() => deleteOutcomeDocFilePromise())
        .finally(() => onDeleteFinishFn())
    };

    modalChannel.request('show:standard', {
      title: `Delete Final Document?`,
      bodyHtml: `<p>This action will permanently delete this final document from this dispute. This action cannot be undone. If you do not want to delete this outcome document and its deliveries, press Cancel.</p>`,
      primaryButtonText: 'Delete',
      onContinueFn: (modal) => {
        modal.close();
        deleteFn();
      }
    });
  },

  clickDelete() {
    if (!this._canModelBeDeleted()) {
      console.log('Cannot delete last outcome doc file, or a doc file with an uploaded pdf file', this.model, this);
      return;
    }

    const deleteFn = () => {
      loaderChannel.trigger('page:load');
      // Delete any associated deliveries, then delete the document
      Promise.all(this.model.getDeliveries().map(delivery => delivery.destroy()))
        .then(() => {
          this.model.destroy().fail(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.REMOVE'))
            .always(() => loaderChannel.trigger('page:load:complete'))
        }, err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.REMOVE');
          handler(err);
        });
    };

    modalChannel.request('show:standard', {
      title: `Delete Outcome Document?`,
      bodyHtml: `<p>This action will permanently delete this outcome document and all its associated document deliveries from this dispute. This action cannot be undone. If you do not want to delete this outcome document and its deliveries, press Cancel.</p>`,
      primaryButtonText: 'Delete Outcome Document',
      onContinueFn: (modal) => {
        modal.close();
        deleteFn();
      }
    });
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};

    const docConfig = documentsChannel.request('config:file', this.model.get('file_type')) || {};
    this.hasDecisionTemplates = docConfig && !_.isEmpty(docConfig.templates_for_decision);
    this.outcomeGroupModel = documentsChannel.request('get:group', this.model.get('outcome_doc_group_id'));
    this.fileModel = filesChannel.request('get:file', this.model.get('file_id'));

    this.createSubModels();
    this.setEditGroup();
    this.setupListeners();
  },

  _canDecisionGeneratorBeRun() {
    return UAT_TOGGLING.SHOW_DECISION_GENERATOR && this.hasDecisionTemplates;
  },

  _canAssociatedFileBeDeleted() {
    return this.fileModel && this.fileModel.isUploaded() && this.model.getDeliveries().all(delivery => delivery.isNew());
  },

  _canModelBeDeleted() {
    const hasMultipleOutcomeFiles = this.outcomeGroupModel && this.outcomeGroupModel.getOutcomeFiles().length > 1;
    const hasUploadedFile = this.fileModel && this.fileModel.isUploaded();
    return hasMultipleOutcomeFiles && !hasUploadedFile;
  },

  _isFileSourceExternal() {
    return this.creationMethodDropdownModel.getData({ parse: true }) === configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL');
  },

  _isFileSourceGenerated() {
    return this.creationMethodDropdownModel.getData({ parse: true }) === configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_GENERATED');
  },

  _getFileStatusOptions() {
    const display_config = configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_STATUS_DISPLAY') || {};

    return ['OUTCOME_DOC_FILE_SUB_STATUS_NOT_SET',
        'OUTCOME_DOC_FILE_SUB_STATUS_NOT_STARTED',
        'OUTCOME_DOC_FILE_SUB_STATUS_IN_PROGRESS',
        'OUTCOME_DOC_FILE_SUB_STATUS_REVIEW',
        'OUTCOME_DOC_FILE_SUB_STATUS_COMPLETED']
      .map(configCode => {
        const value = configChannel.request('get', configCode);
        return { value: String(value), text: display_config[value] };
      });
  },

  _getFileCreationMethodOptions() {
    return [
      // NOTE: R1 is not being released with composer
      //{ value: configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_COMPOSER'), text: 'Composer' },
      ...(this._canDecisionGeneratorBeRun() ? [{ value: String(configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_GENERATED')), text: 'Generate' }] : []),
      { value: String(configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL')), text: 'External' },
    ];
  },

  createSubModels() {
    this.statusDropdownModel = new DropdownModel({
      optionData: this._getFileStatusOptions(),
      labelText: 'Status',
      required: true,
      value: this.model.get('file_sub_status') ? String(this.model.get('file_sub_status')) : 0,
      apiMapping: 'file_sub_status',
    });

    this.commentInputModel = new InputModel({
      labelText: 'Comment',
      value: this.model.get('internal_file_comment'),
      maxLength: configChannel.request('get', 'OUTCOME_DOC_FILE_COMMENT_MAX_LENGTH'),
      required: false,
      apiMapping: 'internal_file_comment',
    });

    const fileSource = this.model.get('file_source');
    const creationMethodOptions = this._getFileCreationMethodOptions();
    this.creationMethodDropdownModel = new DropdownModel({
      optionData: creationMethodOptions,
      labelText: 'Method',
      defaultBlank: false,
      required: true,
      value: fileSource && _.find(creationMethodOptions, opt => String(opt.value) === String(fileSource)) ? String(fileSource) :
        creationMethodOptions.length ? creationMethodOptions[0].value : null,
      apiMapping: 'file_source',
    });

    // Out of scope for R1
    this.visibilityDropdownModel = new DropdownModel({
      optionData: [{ value: true, text: 'Yes' }, { value: false, text: 'No' }],
      labelText: 'Visible to Public',
      required: this.model.isPublic(),
      value: this.model.get('visible_to_public'),
      apiMapping: 'visible_to_public',
    });
  },

  setEditGroup() {
    this.editGroup = ['commentRegion', 'sourceRegion', 'visibleRegion'];
  },

  setupListeners() {
    this.listenTo(this.creationMethodDropdownModel, 'change:value', this.refreshSourceButtonUI, this);
  },

  switchToEditState() {
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  resetModelValues() {
    this.model.resetModel();
  },

  saveInternalDataToModel() {
    this.model.set(_.extend({},
      this.statusDropdownModel.getPageApiDataAttrs(),
      this.commentInputModel.getPageApiDataAttrs(),
      this.creationMethodDropdownModel.getPageApiDataAttrs(),
      this.visibilityDropdownModel.getPageApiDataAttrs()
    ));
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  
  _getSourceButtonText() {
    let buttonText = 'Edit';
    if (this.model.hasUploadedFile()) {
      buttonText = 'Replace';
    } else if (this._isFileSourceGenerated()) {
      buttonText = 'Preview';
    } else if (this._isFileSourceExternal()) {
      buttonText = 'Upload';
    }

    return buttonText;
  },

  _checkDeliveredAndDisableUpload() {
    const isDelivered = this.model.getDeliveries().findWhere({is_delivered: true});
    const ele = this.getUI('sourceActionBtn');

    if(isDelivered) {
      ele.addClass('disabled').attr('disabled', 'disabled');
    } else {
      ele.removeClass('disabled').removeAttr('disabled', 'disabled');
    }
  },

  refreshSourceButtonUI() {
    const ele = this.getUI('sourceActionBtn');

    if (!this.creationMethodDropdownModel.getData()) {
      ele.addClass('hidden');
    } else {
      ele.removeClass('hidden');
    }

    ele.text(this._getSourceButtonText());

    this._checkDeliveredAndDisableUpload();
  },

  onRender() {
    this.showChildView('commentRegion', new EditableComponentView({
      label: '',
      view_value: this.model.get('internal_file_comment') ? this.model.get('internal_file_comment') : '-',
      subView: new InputView({ model: this.commentInputModel })
    }));

    this.showChildView('sourceRegion', new EditableComponentView({
      label: '',
      view_value: this.creationMethodDropdownModel.getData() ? this.creationMethodDropdownModel.getSelectedText() : '-',
      subView: new DropdownView({ model: this.creationMethodDropdownModel })
    }));

    this.showChildView('visibleRegion', new EditableComponentView({
      label: '',
      view_value: this.model.get('visible_to_public') ? 'Yes' : 'No',
      subView: new DropdownView({ model: this.visibilityDropdownModel })
    }));

    if (this.model.get('file_id')) {
      this.showChildView('uploadsRegion', new DisputeOutcomeExternalFileView({ trimFileNamesTo: 16, model: this.model }));
    }

    this._checkDeliveredAndDisableUpload();
  },

  templateContext() {
    return {
      hasUploadedFile: this.fileModel && this.fileModel.isUploaded(),
      showDelete: this._canModelBeDeleted(),
      showSourceButton: this.creationMethodDropdownModel.getSelectedText() || false,
      showUploadDelete: this._canAssociatedFileBeDeleted(),
      sourceButtonText: this._getSourceButtonText(),
      titleDisplay: this.model.isPublic() ? this.model.get('file_title') : this.model.getFileTitleDisplay(),
    };
  }
});
