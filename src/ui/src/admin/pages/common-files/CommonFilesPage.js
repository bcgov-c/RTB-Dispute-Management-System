import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import FileBlockDisplayView from './FileBlockDisplay';
import ModalAddFileBaseView from '../../../core/components/modals/modal-add-file-base/ModalAddFileBase';
import ModalAddSignatureView from '../../../core/components/modals/modal-add-signature/ModalAddSignature';
import CommonFileCollection from '../../../core/components/files/CommonFile_collection';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import CommonFileModel from '../../../core/components/files/CommonFile_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './CommonFilesPage_template.tpl'
import './common-files.css';

const HELP_FILE_TITLE = 'Add / Edit RTB File';
const RTB_FORM_FILE_TITLE = 'Add / Edit RTB Form';
const DOCUMENT_FILE_TITLE = 'Add / Edit Document File';
const EXCEL_FILE_TITLE = 'Add / Edit Excel Report File';
const THUMBNAIL_TEXT = 'Show Thumbnails';
const REMOVED_FILE_HTML = `Show Archived`;

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const emailsChannel = Radio.channel('emails');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  initialize() {
    this.isLoaded = false;
    this.isReportsUser = sessionChannel.request('get:user')?.isReportsUser();
    this.createSubModels();
    this.setupListeners();
    this.loadFiles({ initialLoad: true });
  },

  createSubModels() {
    this.helpFiles = new CommonFileCollection();
    this.rtbForms = new CommonFileCollection();
    this.documentSignatures = new CommonFileCollection();
    this.excelFiles = new CommonFileCollection();

    this.helpCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: this.model.get('commonFiles')?.thumbnailsEnabled_help,
    });
    this.formsCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: this.model.get('commonFiles')?.thumbnailsEnabled_forms,
    });
    this.documentsCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: this.model.get('commonFiles')?.thumbnailsEnabled_signatures,
    });
    this.excelCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: this.model.get('commonFiles')?.thumbnailsEnabled_excel,
    });

    this.showRemovedHelpModel = new CheckboxModel({
      html: REMOVED_FILE_HTML,
      checked: this.model.get('commonFiles')?.showArchivedHelp,
    });
    this.showRemovedFormsModel = new CheckboxModel({
      html: REMOVED_FILE_HTML,
      checked: this.model.get('commonFiles')?.showArchivedForms,
    });
    this.showRemovedExcelModel = new CheckboxModel({
      html: REMOVED_FILE_HTML,
      checked: this.model.get('commonFiles')?.showArchivedExcel,
    });
  },

  setupListeners() {
    this.listenTo(this.model, "page:refresh", () => this.clickRefresh());
    this.listenTo(this.helpFiles, 'click:delete', this.removeCommonFileFn, this);
    this.listenTo(this.rtbForms, 'click:delete', this.removeCommonFileFn, this);
    this.listenTo(this.documentSignatures, 'click:delete', this.removeCommonFileFn, this);
    this.listenTo(this.excelFiles, 'click:delete', this.removeCommonFileFn, this);
    this.listenTo(this.helpCheckboxModel, 'change:checked', this.render, this);
    this.listenTo(this.formsCheckboxModel, 'change:checked', this.render, this);
    this.listenTo(this.documentsCheckboxModel, 'change:checked', this.render, this);
    this.listenTo(this.excelCheckboxModel, 'change:checked', this.render, this);
    this.listenTo(this.showRemovedHelpModel, 'change:checked', this.render, this);
    this.listenTo(this.showRemovedFormsModel, 'change:checked', this.render, this);
    this.listenTo(this.showRemovedExcelModel, 'change:checked', this.render, this);
  },

  loadFiles(initialLoad = false) {
    if (!initialLoad) loaderChannel.trigger('page:load');
    this.isLoaded = false;
    
    $.whenAll(filesChannel.request('load:commonfiles'), emailsChannel.request('load:templates'))
      .done(() => {
        const commonFileCollection = filesChannel.request('get:commonfiles');
        commonFileCollection.forEach(commonFile => {
          if (commonFile.isTypeHelp()) this.helpFiles.add(commonFile);
          else if (commonFile.isTypeForm()) this.rtbForms.add(commonFile);
          else if (commonFile.isTypeDocument()) this.documentSignatures.add(commonFile);
          else if (commonFile.isTypeReport()) this.excelFiles.add(commonFile);
        });
        this.isLoaded = true;
        this.render();
      }).fail(generalErrorFactory.createHandler('ADMIN.COMMONFILES.LOAD', () => {
          loaderChannel.trigger('page:load:complete');
      }));
  },


  clickRefresh() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  openAddFileModal(title, fileType, inUseFiles, processingOptions=null) {
    const modalFiles = new CommonFileCollection();
    const modalAddFile = new ModalAddFileBaseView({
      title,
      inUseFiles,
      files: modalFiles,
      saveButtonText: 'Add Common File',
      mobileSaveButtonText: null,
      showDelete: false,
      model: new CommonFileModel(this.model),
      fileType,
      processing_options: processingOptions || {
        maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
        maxNumberOfFiles: 1,
        allowedFileTypes: configChannel.request('get', 'VALID_PDF_ONLY_FILE_TYPES'),
      }
     });
    modalChannel.request('add', modalAddFile);

    this.listenTo(modalAddFile, 'save:complete', this.clickRefresh, this);
  },

  openAddSignatureModal() {
    const modalAddSignatureFile = new ModalAddSignatureView({
      files: new CommonFileCollection(),
      signatures: new CommonFileCollection(this.documentSignatures),
      allowedFileTypes: ['jpg', 'jpeg', 'png'],
      processing_options: {
        maxNumberOfFiles: 1,
      }
    });

    modalChannel.request('add', modalAddSignatureFile);

    this.listenTo(modalAddSignatureFile, 'save:complete', this.clickRefresh, this);
  },

  removeCommonFileFn(commonFileModel) {
    // Check if the common file is used in any default email templates first
    const emailTemplates = emailsChannel.request('get:templates');
    const emailTemplatesUsingCommonFile = (emailTemplates || []).filter(emailTemplate => (
      _.any(emailTemplate.getAttachmentCommonFileIds(), cfId => cfId === commonFileModel.id)
    ));

    if (emailTemplatesUsingCommonFile.length) {
      modalChannel.request('show:standard', {
        title: 'Common File In Use',
        bodyHtml: `<p>The common file <b>${commonFileModel.get('file_title')}</b> cannot be removed because it is used in the following email templates:</p>
        <p><ul>
          ${emailTemplatesUsingCommonFile.map(emailTemplate => `<li>${emailTemplate.get('template_title')}</li>`).join('')}
        </ul></p>
        `,
        hideContinueButton: true,
        cancelButtonText: 'Close'
      });
      return;
    }

    modalChannel.request('show:standard', {
      title: 'Remove Common File?',
      bodyHtml: 
        `<p>Are you sure you want to remove the following common file?</p>
        <p class="common-file-modal-file-name">${commonFileModel.get('file_name')}</p>
        <p>This action is permanent and cannot be undone. If this file is currently used in any automated processes or workflows, it will no longer be available and may cause that process or workflow to fail. If you are not sure that it is safe to remove this file press 'Cancel' to keep this file.</p>
      `,
      primaryButtonText: 'Remove File',
      onContinue: (_modalView) => {
        _modalView.close();
        loaderChannel.trigger('page:load');
        // Only signature files can be deleted, otherwise all common files are archived
        if (commonFileModel.isTypeDocument()) {
          commonFileModel.destroy()
            .fail(generalErrorFactory.createHandler('ADMIN.COMMONFILE.DELETE'))
            .always(() => this.clickRefresh());
        } else {
          commonFileModel.save({ file_status: configChannel.request('get', 'COMMONFILE_STATUS_ARCHIVED') })
          .fail(generalErrorFactory.createHandler('ADMIN.COMMONFILE.REMOVE'))
            .always(() => this.clickRefresh());
        }
      }
    });
  },
  
  template,
  className: `${PageView.prototype.className} common-files-page`,

  regions: {
    helpFilesRegion: '.common-files-help-files',
    rtbFormsRegion : '.common-files-rtb-forms',
    documentSignatureRegion: '.common-files-document-signature',
    excelFilesRegion: '.common-files-excel-files',
    showHelpThumbnailRegion: '#common-files-checkbox-1',
    showFormsThumbnailRegion: '#common-files-checkbox-2',
    showDocumentThumbnailRegion: '#common-files-checkbox-3',
    showExcelThumbnailRegion: '#common-files-checkbox-4',
    removedHelpCheckboxRegion: '#common-files-removed-checkbox-1',
    removedFormsCheckboxRegion: '#common-files-removed-checkbox-2',
    removedDocumentsCheckboxRegion: '#common-files-removed-checkbox-3',
    removedExcelCheckboxRegion: '#common-files-removed-checkbox-4',
  },

  ui: {
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    addHelpFile: '#add-help-file',
    addFormFile: '#add-rtb-file',
    addDocumentFile: '#add-document-file',
    addExcelFile: '#add-excel-file',
  },

  events: {
    'click @ui.print': function() { window.print(); },
    'click @ui.refresh': 'clickRefresh',
    'click @ui.addHelpFile': function() {
      this.openAddFileModal(HELP_FILE_TITLE, configChannel.request('get', 'COMMONFILE_TYPE_HELP_FILE'), this.helpFiles); },
    'click @ui.addFormFile': function() {
      this.openAddFileModal(RTB_FORM_FILE_TITLE, configChannel.request('get', 'COMMONFILE_TYPE_RTB_FORM'), this.rtbForms); },
    'click @ui.addDocumentFile': function() {
      this.openAddSignatureModal(DOCUMENT_FILE_TITLE, configChannel.request('get', 'COMMONFILE_TYPE_DOCUMENT'), this.documentSignatures); },
    'click @ui.addExcelFile': function() {
      this.openAddFileModal(EXCEL_FILE_TITLE, configChannel.request('get', 'COMMONFILE_TYPE_REPORT'), this.excelFiles, {
        maxNumberOfFiles: 1,
        maxNonVideoFileSize: 5 * 1024 * 1024,
        allowedFileTypes: {
          xlsx: true,
          xlsm: true,
          xlsb: true,
          xltx: true,
          xltm: true,
          xls: true,
          xlt: true,
          xls: true,
          xlam: true,
          xla: true,
          xlw: true,
          xlr: true,
        }
      });
    }
  },

  onBeforeRender() {
    this.model.set({
      commonFiles: {
        ...this.model.get('commonFiles'),
        thumbnailsEnabled_help: this.helpCheckboxModel.getData(),
        thumbnailsEnabled_forms: this.formsCheckboxModel.getData(),
        thumbnailsEnabled_signatures: this.documentsCheckboxModel.getData(),
        thumbnailsEnabled_excel: this.excelCheckboxModel.getData(),
        showArchivedHelp: this.showRemovedHelpModel.getData(),
        showArchivedForms: this.showRemovedFormsModel.getData(),
        showArchivedExcel: this.showRemovedExcelModel.getData(),
      }
    });
  },

  onRender() {
    if (!this.isLoaded) return;
    const defaultFileViewOptions = {
      model: this.model,
      showDelete: true,
      showInfo: true,
      showEdit: true,
    };
    
    this.showChildView('helpFilesRegion', new FileBlockDisplayView(Object.assign({}, defaultFileViewOptions, {
      editModalTitle: HELP_FILE_TITLE,
      showThumbnails: this.helpCheckboxModel.getData(),
      filter: (m) => this.showRemovedHelpModel.getData() ? true : !m.isStatusArchived(),
      collection: this.helpFiles,
    })));
    this.showChildView('rtbFormsRegion', new FileBlockDisplayView(Object.assign({}, defaultFileViewOptions, {
      editModalTitle: RTB_FORM_FILE_TITLE,
      showThumbnails: this.formsCheckboxModel.getData(),
      filter: (m) => this.showRemovedFormsModel.getData() ? true : !m.isStatusArchived(),
      collection: this.rtbForms,
    })));
    this.showChildView('documentSignatureRegion', new FileBlockDisplayView(Object.assign({}, defaultFileViewOptions, {
      editModalTitle: DOCUMENT_FILE_TITLE,
      showThumbnails: this.documentsCheckboxModel.getData(),
      collection: this.documentSignatures,
      showEdit: false,
    })));

    this.showChildView('showHelpThumbnailRegion', new CheckboxView({ model: this.helpCheckboxModel }));
    this.showChildView('showFormsThumbnailRegion', new CheckboxView({ model: this.formsCheckboxModel }));
    this.showChildView('showDocumentThumbnailRegion', new CheckboxView({ model: this.documentsCheckboxModel }));
    this.showChildView('removedHelpCheckboxRegion', new CheckboxView({ model: this.showRemovedHelpModel }));
    this.showChildView('removedFormsCheckboxRegion', new CheckboxView({ model: this.showRemovedFormsModel }));

    if (this.isReportsUser) {
      this.showChildView('excelFilesRegion', new FileBlockDisplayView(Object.assign({}, defaultFileViewOptions, {
        editModalTitle: EXCEL_FILE_TITLE,
        showThumbnails: this.excelCheckboxModel.getData(),
        filter: (m) => this.showRemovedExcelModel.getData() ? true : !m.isStatusArchived(),
        collection: this.excelFiles,
      })));
      this.showChildView('removedExcelCheckboxRegion', new CheckboxView({ model: this.showRemovedExcelModel }));
      this.showChildView('showExcelThumbnailRegion', new CheckboxView({ model: this.excelCheckboxModel }));
    }

    loaderChannel.trigger('page:load:complete');    
  },

  templateContext() {
    return {
      Formatter,
      isLoaded: this.isLoaded,
      lastRefreshTime: Moment(),
      showReports: this.isReportsUser,
    };
  }
});