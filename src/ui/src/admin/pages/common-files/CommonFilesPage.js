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
const DOCUMENT_FILE_TITLE = 'Add / Edit Document File'
const THUMBNAIL_TEXT = 'Show Thumbnails';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const emailsChannel = Radio.channel('emails');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} common-files-page`,

  regions: {
    'helpFilesRegion': '.common-files-help-files',
    'rtbFormsRegion' : '.common-files-rtb-forms',
    'documentSignatureRegion': '.common-files-document-signature',
    'showHelpThumbnailRegion': '#common-files-checkbox-1',
    'showRTBThumbnailRegion': '#common-files-checkbox-2',
    'showDocumentThumbnailRegion': '#common-files-checkbox-3',
  },

  ui: {
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    showThumbnails: '.common-files-checkbox',
    addHelpFile: '#add-help-file',
    addFormFile: '#add-rtb-file',
    addDocumentFile: '#add-document-file',
  },

  events: {
    'click @ui.print': function() { window.print(); },
    'click @ui.refresh': 'clickRefresh',
    'click @ui.showThumbnails': 'showThumbnails',
    'click @ui.addHelpFile': function() {
      this.openAddFileModal(HELP_FILE_TITLE, this.COMMONFILE_TYPE_HELP_FILE, this.helpFiles); },
    'click @ui.addFormFile': function() {
      this.openAddFileModal(RTB_FORM_FILE_TITLE, this.COMMONFILE_TYPE_RTB_FORM, this.rtbForms); },
    'click @ui.addDocumentFile': function() {
      this.openAddSignatureModal(DOCUMENT_FILE_TITLE, this.COMMONFILE_TYPE_DOCUMENT, this.documentSignatures); }
  },

  clickRefresh() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  openAddFileModal(title, fileType, inUseFiles) {
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
      processing_options: {
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

  showThumbnails(el) {
    if (el.currentTarget.id === 'common-files-checkbox-1') {
      this.helpFilesView.showThumbnails = this.helpCheckboxModel.getData()
      this.helpFilesView.render();
    } else if (el.currentTarget.id === 'common-files-checkbox-2') {
      this.rtbFormsView.showThumbnails = this.rtbCheckboxModel.getData()
      this.rtbFormsView.render();
    } else if (el.currentTarget.id === 'common-files-checkbox-3') {
      this.documentSignatureView.showThumbnails = this.documentsCheckboxModel.getData()
      this.documentSignatureView.render();
    } else return;
  },

  deleteCommonFileFn(commonFileModel) {
    // Check if the common file is used in any default email templates first
    const emailTemplates = emailsChannel.request('get:templates');
    const emailTemplatesUsingCommonFile = (emailTemplates || []).filter(emailTemplate => (
      _.any(emailTemplate.getAttachmentCommonFileIds(), cfId => cfId === commonFileModel.id)
    ));

    if (emailTemplatesUsingCommonFile.length) {
      modalChannel.request('show:standard', {
        title: 'Common File In Use',
        bodyHtml: `<p>The common file <b>${commonFileModel.get('file_title')}</b> cannot be deleted because it is used in the following email templates:</p>
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
      title: 'Delete Common File?',
      bodyHtml: 
        `<p>Are you sure you want to delete the following common file?</p>
        <p class="common-file-modal-file-name">${commonFileModel.get('file_name')}</p>
        <p>This action is permanent and cannot be undone. If this file is currently used in any automated processes or workflows, it will no longer be available and may cause that process or workflow to fail. If you are not sure that it is safe to delete this file press 'Cancel' to keep this file.</p>
      `,
      continueButtonText: 'Delete File',
      onContinue: (_modalView) => {
        _modalView.close();

        loaderChannel.trigger('page:load');
        commonFileModel.destroy()
          .fail(err => generalErrorFactory.createHandler(err, 'ADMIN.COMMONFILE.DELETE'))
          .always(() => {
            this.clickRefresh();
          });
      }
    });
  },

  setupListeners() {
    this.listenTo(this.model, "page:refresh", () => this.clickRefresh());
  },

  setHelpFiles(commonFileCollection) {
    this.helpFiles = commonFileCollection.filter(commonFile => commonFile.get('file_type') === this.COMMONFILE_TYPE_HELP_FILE);
  },

  setRTBForms(commonFileCollection) {
    this.rtbForms = commonFileCollection.filter(commonFile => commonFile.get('file_type') === this.COMMONFILE_TYPE_RTB_FORM);
  },

  setDocumentSignatures(commonFileCollection) {
    this.documentSignatures = commonFileCollection.filter(commonFile => commonFile.get('file_type') === this.COMMONFILE_TYPE_DOCUMENT);
  },

  loadFiles(initialLoad = false) {
    if (!initialLoad) loaderChannel.trigger('page:load');
    this.isLoaded = false;
    
    $.whenAll(filesChannel.request('load:commonfiles'), emailsChannel.request('load:templates'))
      .done(() => {
        const commonFileCollection = filesChannel.request('get:commonfiles');
        this.setHelpFiles(commonFileCollection);
        this.setRTBForms(commonFileCollection);
        this.setDocumentSignatures(commonFileCollection);
        this.isLoaded = true;
        this.render();
      }).fail(generalErrorFactory.createHandler('ADMIN.COMMONFILES.LOAD', () => {
          loaderChannel.trigger('page:load:complete');
      }));
  },

  createSubModels() {
    this.helpCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: false,
    });

    this.rtbCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: false,
    });

    this.documentsCheckboxModel = new CheckboxModel({
      html: THUMBNAIL_TEXT,
      checked: false,
    });
  },

  createSubViews() {
    this.helpFilesView = new FileBlockDisplayView({
      editModalTitle: HELP_FILE_TITLE,
      model: this.model,
      showThumbnails: this.helpCheckboxModel.getData(),
      showDelete: true,
      showInfo: true,
      showEdit: true,
      collection: new CommonFileCollection(this.helpFiles),
    });

    this.rtbFormsView = new FileBlockDisplayView({
      editModalTitle: RTB_FORM_FILE_TITLE,
      model: this.model, 
      showThumbnails: this.rtbCheckboxModel.getData(),
      showDelete: true,
      showInfo: true,
      showEdit: true,
      collection: new CommonFileCollection(this.rtbForms),
    });

    this.documentSignatureView = new FileBlockDisplayView({
      editModalTitle: DOCUMENT_FILE_TITLE,
      model: this.model, 
      showThumbnails: this.documentsCheckboxModel.getData(),
      showDelete: true,
      showInfo: true,
      showEdit: false,
      collection: new CommonFileCollection(this.documentSignatures),
    });

    this.listenTo(this.helpFilesView.collection, 'click:delete', this.deleteCommonFileFn, this);
    this.listenTo(this.rtbFormsView.collection, 'click:delete', this.deleteCommonFileFn, this);
    this.listenTo(this.documentSignatureView.collection, 'click:delete', this.deleteCommonFileFn, this);
  },

  initialize() {
    this.isLoaded = true;
    this.COMMONFILE_TYPE_HELP_FILE = configChannel.request('get', 'COMMONFILE_TYPE_HELP_FILE');
    this.COMMONFILE_TYPE_RTB_FORM = configChannel.request('get', 'COMMONFILE_TYPE_RTB_FORM');
    this.COMMONFILE_TYPE_DOCUMENT = configChannel.request('get', 'COMMONFILE_TYPE_DOCUMENT');

    this.createSubModels();
    this.setupListeners();

    this.loadFiles({ initialLoad: true });
  },

  onBeforeRender() {
    this.createSubViews();
  },

  onRender() {
    if (!this.isLoaded) return;
    
    this.showChildView('helpFilesRegion', this.helpFilesView);
    this.showChildView('showHelpThumbnailRegion', new CheckboxView({ model: this.helpCheckboxModel }));

    this.showChildView('rtbFormsRegion', this.rtbFormsView);
    this.showChildView('showRTBThumbnailRegion', new CheckboxView({ model: this.rtbCheckboxModel }));

    this.showChildView('documentSignatureRegion', this.documentSignatureView);
    this.showChildView('showDocumentThumbnailRegion', new CheckboxView({ model: this.documentsCheckboxModel }));

    loaderChannel.trigger('page:load:complete');    
  },

  templateContext() {
    return {
      Formatter,
      isLoaded: this.isLoaded,
      lastRefreshTime: Moment()
    };
  }
});