import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import FileDescriptionModel from '../../../core/components/files/file-description/FileDescription_model';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import DisputeEvidenceCollection from '../../../core/components/claim/DisputeEvidence_collection';
import DocumentDisputeFiles from './DocumentDisputeFiles';
import DisputeOutcomeDocGroupsView from './outcome-doc-group/DisputeOutcomeDocGroups';
import DisputeDocRequestsView from './outcome-doc-request/DisputeDocRequests';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './DocumentsPage_template.tpl';

const notesChannel = Radio.channel('notes');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const configChannel  = Radio.channel('config');
const menuChannel = Radio.channel('menu');
const modalChannel = Radio.channel('modals');
const noticeChannel = Radio.channel('notice');
const documentsChannel = Radio.channel('documents');
const hearingChannel = Radio.channel('hearings');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} documents-page`,

  ui: {
    printHeader: '.print-header',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    fileTitleRegion: '.file-title-container',
    customFileTitleRegion: '.file-custom-title-container',
    providedByRegion: '.file-provided-by-container',
    addFileButton: '.add-file-button button',
    legacyWarning: '.documents-page-legacy-service-portal-warning',
  },

  regions: {
    disputeFlags: '.dispute-flags',
    fileTypeRegion: '.file-type-container',
    fileTitleRegion: '@ui.fileTitleRegion',
    documentListRegion: '.dispute-documents-list',
    deficientdocumentListRegion: '.deficient-dispute-documents-list',
    customFileTitleRegion: '@ui.customFileTitleRegion',
    providedByRegion: '@ui.providedByRegion',

    outcomeDocsRegion: '.outcome-documents-section',

    docsRequestsRegion: '.doc-requests-container'
  },

  events: {
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': 'clickPrint',
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose',
    'click @ui.addFileButton': 'clickAddFile',
    'click @ui.completenessCheck': 'completenessCheck',
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickPrint() {
    const dispute = disputeChannel.request('get');
    dispute.checkEditInProgressPromise()
      .then(() => window.print())
      .catch(() => dispute.showEditInProgressModalPromise());
  },

  clickRefresh() {
    const refreshPageFn = () => {
      this.model.triggerPageRefresh();
    };

    this.model.checkEditInProgressPromise().then(
      refreshPageFn,
      () => {
        this.model.showEditInProgressModalPromise(true).then(isAccepted => {
          if (isAccepted) {
            this.model.stopEditInProgress();
            refreshPageFn();
          }
        });
      });
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), {trigger: true});
  },

  clickAddFile() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    const addFileFn = () => {
      const title_to_use = this.showCustomTitleEditor ? this.customFileTitleInputModel.getData() :
        this.showProvidedByEditor ? this.fileTypeDropdownModel.getSelectedText() :
        this.fileTitleDropdownModel.getSelectedText();

      const newDisputeEvidenceModel = new DisputeEvidenceModel({
        file_description: new FileDescriptionModel({
          description_by: this.showProvidedByEditor ? this.providedByDropdownModel.getData({ parse: true }) : null,
          description_code: this.fileTitleDropdownModel.getData({ parse: true }),
          description_category: this.fileTypeDropdownModel.getData({ parse: true }),
          title: title_to_use
        })
      });

      const modalAddFiles = new ModalAddFiles({
        model: newDisputeEvidenceModel,
        files: newDisputeEvidenceModel.get('files'),
        title: 'Add/Edit Internal Documents',
        isDescriptionRequired: false,
        autofillRename: true,
        processing_options: {
          errorModalTitle: 'Adding Documents',
          checkForDisputeDuplicates: false,
          maxNonVideoFileSize: 50 * 1024 * 1024 // 50MB
        },
        fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE')
      });
      modalChannel.request('add', modalAddFiles);

      this.stopListening(modalAddFiles);
      this.listenTo(modalAddFiles, 'removed:modal', function() {
        this.fileTypeDropdownModel.set({ value: null })

        this.loadFiles();
      }, this);
    };

    this.model.checkEditInProgressPromise().then(
      addFileFn,
      () => this.model.showEditInProgressModalPromise()
    );
  },

  validateAndShowErrors() {
    const views_to_validate = ['fileTypeRegion'];
    let is_valid = true;

    if (this.showFileTitleEditor) {
      views_to_validate.push('fileTitleRegion');
    }
    if (this.showCustomTitleEditor) {
      views_to_validate.push('customFileTitleRegion');
    }
    if (this.showProvidedByEditor) {
      views_to_validate.push('providedByRegion');
    }
    _.each(views_to_validate, function(name) {
      const view = this.getChildView(name);
      is_valid = (view && view.validateAndShowErrors ? view.validateAndShowErrors() : true) && is_valid;
    }, this);

    return is_valid;
  },


  loadAllDocuments() {
    const disputeGuid = disputeChannel.request('get:id');

    this.model.stopEditInProgress();    
    // NOTE: Assumes that notice and file data is loaded from core dispute load
    this.setDocumentFieldsFromFileDescriptions();
    $.whenAll(
      documentsChannel.request('load', disputeGuid),
      documentsChannel.request('load:requests', disputeGuid),
      notesChannel.request('load', disputeGuid),
      this.loadPrimaryDisputeOutcomeDocsAndFiles()
    ).done(() => {
      this.outcomeDocGroupCollection = documentsChannel.request('get:all');
      this.isLoaded = true;
      this.render();
    }).fail(err => {
      this.outcome_docs_loaded = true;
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUPS.LOAD', () => {
        this.isLoaded = false;
        this.render();
      });
      handler(err);
    });
  },

  loadPrimaryDisputeOutcomeDocsAndFiles() {
    this.model.stopEditInProgress();
    const dfd = $.Deferred();
    const primaryDisputesData = this.getAllPrimaryDisputesBySharedHearing();
    const loadExternalDisputeData = (disputeGuid, fileNumber) => {
      const outcomeDocLoadPromise = new Promise((res, rej) => documentsChannel.request('load', disputeGuid, { no_cache: true }).done(res).fail(rej));
      const fileLoadPromise = new Promise((res, rej) => filesChannel.request('load:files', disputeGuid, { no_cache: true }).done(res).fail(rej));
      
      return new Promise((res, rej) => {
        $.whenAll(outcomeDocLoadPromise, fileLoadPromise)
          .then((outcomeDocGroupCollection, fileCollection) => {
            // Set file number so it can be looked up by the primary file outcome doc display
            outcomeDocGroupCollection.forEach(docGroupModel => docGroupModel.set('_fileNumber', fileNumber));
            this.primaryOutcomeDocGroupModels = [...this.primaryOutcomeDocGroupModels, ...outcomeDocGroupCollection.map(m => m)];
            this.primaryOutcomeDocGroupModels.forEach(groupModel => {
              groupModel.getOutcomeFiles().forEach(docFile => {
                if (!docFile.hasUploadedFile()) return;
                const fileModel = fileCollection.findWhere({ file_id: docFile.get('file_id') });
                if (!fileModel) return;
                this.primaryFileModelLookup[fileModel.id] = fileModel;
              });
            });
            res();
          }, err => {
            const handler = generalErrorFactory.createHandler('ADMIN.PRIMARY.OUTCOMES.LOAD', () => rej());
            handler(err);
          });
        });
    };

    this.primary_outcome_docs_loaded = false;
    Promise.all(primaryDisputesData.map(data => loadExternalDisputeData(data[0], data[1])))
      .then(() => {
        this.primary_outcome_docs_loaded = true;
        dfd.resolve();
      }, err => {
        this.primary_outcome_docs_loaded = true;
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUPS.LOAD', () => {
          dfd.reject(err);
        });
        handler(err);
      });

    return dfd.promise();
  },

  getAllPrimaryDisputesBySharedHearing() {
    const allHearings = hearingChannel.request('get');

    const primaryDisputes = [];
    allHearings.forEach(hearing => {
      const disputeHearings = hearing.getDisputeHearings();
      const primary = disputeHearings.getPrimary();
      const isCurrentDisputeAChild = primary && primary.get('dispute_guid') !== disputeChannel.request('get:id');
      if (isCurrentDisputeAChild && !primary.isExternal()) primaryDisputes.push([primary.get('dispute_guid'), primary.getFileNumber()]);
    });
    return primaryDisputes;
  },
  

  loadFiles(options) {
    this.model.stopEditInProgress();

    options = options || {};
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }

    const dfd = $.Deferred();
    this.files_loaded = false;
    filesChannel.request('load:full', disputeChannel.request('get:id'))
      .done(() => {
        this.setDocumentFieldsFromFileDescriptions();
        this.files_loaded = true;
        if (!options.load_only) {
          this.render();
          loaderChannel.trigger('page:load:complete');
        }
        dfd.resolve();
      }).fail(err => {
        this.files_loaded = true;
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.FILES.LOAD.FULL', () => {
          if (!options.load_only) {
            this.render();
            loaderChannel.trigger('page:load:complete');
          }
          dfd.reject(err);
        });
        handler(err);
      });
    return dfd.promise();
  },

  initialize() {
    this.EVIDENCE_CATEGORY_PAYMENT = configChannel.request('get', 'EVIDENCE_CATEGORY_PAYMENT');
    this.EVIDENCE_CATEGORY_GENERAL = configChannel.request('get', 'EVIDENCE_CATEGORY_GENERAL');
    this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL = configChannel.request('get', 'EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL');

    this.showCustomTitleEditor = false;
    this.showProvidedByEditor = false;
    this.showFileTitleEditor = true;
    this.showLegacyWarning = false;


    // Used to hold lookup data for external (not this dispute) file models.  Used in primary outcome docs display
    // Filled in loadPrimaryDisputeOutcomeDocsAndFiles()
    this.primaryFileModelLookup = {};
    this.primaryOutcomeDocGroupModels = [];

    this.disputeEvidenceCollection = new DisputeEvidenceCollection();
    this.deficientDocumentsEvidenceCollection = new DisputeEvidenceCollection();
    this.setDocumentFieldsFromFileDescriptions();
    this.docRequestsCollection = documentsChannel.request('get:requests');

    this.isLoaded = false

    this.createSubModels();
    this.setupListeners();

    this.loadAllDocuments();
  },

  setDocumentFieldsFromFileDescriptions() {
    this.disputeEvidenceCollection.reset(
      filesChannel.request('get:filedescriptions').map(fileDescription => Object.assign({}, { file_description: fileDescription }, fileDescription))
    );
    
    this.deficientDocumentsEvidenceCollection.reset(
      filesChannel.request('get:filedescriptions:deficient').map(fileDescription => Object.assign({}, { file_description: fileDescription }, fileDescription))
    );
  },

  createSubModels() {
    this.fileTypeDropdownModel = new DropdownModel({
      optionData: [
        { text: 'Payment', value: String(this.EVIDENCE_CATEGORY_PAYMENT) },
        { text: 'General', value: String(this.EVIDENCE_CATEGORY_GENERAL) },
        { text: 'Legacy Forms', value: String(this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL) },
      ],
      labelText: 'File Type',
      errorMessage: `Please enter file type`,
      required: true,
      defaultBlank: true,
    });

    this.fileTitleDropdownModel = new DropdownModel({
      labelText: 'File Title',
      errorMessage: `Please enter file type`,
      required: true,
      defaultBlank: true,
      disabled: true,
    });

    this.customFileTitleInputModel = new InputModel({
      labelText: 'Enter Custom Title',
      required: true,
      maxLength: configChannel.request('get', 'FILE_TITLE_MAX_LENGTH'),
      errorMessage: 'Please enter a custom file title',
    });

    this.providedByDropdownModel = new DropdownModel({
      optionData: this._providedByOptions(),
      labelText: 'Provided By',
      required: true,
      defaultBlank: true
    });
  },

  setupListeners() {
    this.listenTo(this.fileTypeDropdownModel, 'change:value', this.handleFileTypeChange, this);
    this.listenTo(this.fileTitleDropdownModel, 'change:value', this.handleFileTitleChange, this);

    this.listenTo(this.disputeEvidenceCollection, 'refresh:page', () => {
      this.setDocumentFieldsFromFileDescriptions();
      this.render();
    });
    this.listenTo(this.docRequestsCollection, 'refresh:page', () => {
      this.render();
    });
  },

  _providedByOptions() {
    const applicants = participantsChannel.request('get:applicants'),
      respondents = participantsChannel.request('get:respondents');
    return _.map(_.union(applicants.models, respondents.models), function(p) {
      return { text: p.getContactName(), value: p.id };
    });
  },


  handleFileTypeChange(model, value) {
    this._hideProvidedBy();

    if (!value) {
      this.fileTitleDropdownModel.set({ disabled: true, value: null });
      this.customFileTitleInputModel.set({ value: null });
      this._renderFileTitle();
      return;
    }
    
    const config_to_use = configChannel.request('get:evidence:category', value) || {};
    this.fileTitleDropdownModel.set({
      optionData: Object.keys(config_to_use).filter(key => config_to_use[key].title && config_to_use[key].id)
        .map(key => {
          const config_item = config_to_use[key];
          return { text: config_item.title, value: String(config_item.id), customTitle: config_item.customTitle };
        }),
      disabled: false,
      value: null
    });
    this.customFileTitleInputModel.set({ value: null });
    this._renderFileTitle();
  },

  handleFileTitleChange(model) {
    const selectedOption = model.getSelectedOption();
    if (selectedOption && selectedOption.customTitle) {
      this._showCustomTitle();
    } else {
      this._hideCustomTitle();
    }
  },

  _renderFileTitle() {
    this.showChildView('fileTitleRegion', new DropdownView({ model: this.fileTitleDropdownModel }));
    this.showLegacyWarning = String(this.fileTypeDropdownModel.getData()) === String(this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL);
    
    if (this.showLegacyWarning) {
      this.getUI('legacyWarning').show();
    } else {
      this.getUI('legacyWarning').hide();
    }
    this._showFileTitle();
  },

  _showFileTitle() {
    this.showFileTitleEditor = true;
    this.getUI('fileTitleRegion').show();
  },

  _hideFileTitle() {
    this.showFileTitleEditor = false;
    this.getUI('fileTitleRegion').hide();
  },

  _showCustomTitle() {
    this.showCustomTitleEditor = true;
    this.getUI('customFileTitleRegion').show();
  },

  _hideCustomTitle() {
    this.showCustomTitleEditor = false;
    this.getUI('customFileTitleRegion').hide();
  },

  _showProvidedBy() {
    this.showProvidedByEditor = true;
    this.getUI('providedByRegion').show();
  },

  _hideProvidedBy() {
    this.showProvidedByEditor = false;
    this.getUI('providedByRegion').hide();
  },

  onBeforeRender() {
    this.showLegacyWarning = String(this.fileTypeDropdownModel.getData()) === String(this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL);
  },

  onRender() {
    if (!this.isLoaded) return;

    const dispute = disputeChannel.request('get');

    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${dispute.get('file_number')} Documents Page`
    }));
    
    this.showChildView('disputeFlags', new DisputeFlags());
    this.showChildView('fileTypeRegion', new DropdownView({ model: this.fileTypeDropdownModel }));
    this.showChildView('fileTitleRegion', new DropdownView({ model: this.fileTitleDropdownModel }));
    this.showChildView('customFileTitleRegion', new InputView({ model: this.customFileTitleInputModel }));
    this.showChildView('providedByRegion', new DropdownView({ model: this.providedByDropdownModel }));
    
    // Notice File + Category Code 7 - ID Plus Code 
    // Notice Service (proof of service) + Category Code 7
    // Amendments (RTB-42L, RTB-42T) + Category Code 7
    // Sub-Service (RTB-13) +
    const codesToFilter = [72, 74, 75];
    const categoriesToFilter = ['EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST'].map(code => configChannel.request('get', code));
    const notices = noticeChannel.request('get:all');
    const filePackages = filesChannel.request('get:filepackages');
    this.showChildView('documentListRegion', new DocumentDisputeFiles({
      collection: this.disputeEvidenceCollection,
      showControls: true,
      docFilter: (model) => {
        // Don't show any evidence.  It should all be displayed on the Admin Evidence page.
        if (model.isEvidence()) return false;

        // Filter Amendments (RTB-42L, RTB-42T) and Sub-Service (RTB-13). Those are displayed elsewhere in the system
        if (_.contains(codesToFilter, model.getDescriptionCode())) return false;

        // Filter invalid categories
        if (_.contains(categoriesToFilter, model.getDescriptionCategory())) return false;

        // Filter the file descriptions associated to a notice, notice service, or file package service
        const fileDescriptionId = model.get('file_description').get('file_description_id');
        const isAssociatedToNotice = notices.any(noticeModel => {
          return (
            noticeModel.get('notice_file_description_id') === fileDescriptionId ||
            noticeModel.getServices().any(noticeServiceModel => noticeServiceModel.get('proof_file_description_id') === fileDescriptionId)
          );
        });

        const isAssociatedToFilePackage = filePackages.any(filePackage => {
          return filePackage.getServices().any(service => service.get('proof_file_description_id') === fileDescriptionId);
        });

        return !isAssociatedToNotice && !isAssociatedToFilePackage;
      }
    }));
    this.showChildView('deficientdocumentListRegion', new DocumentDisputeFiles({
      collection: this.deficientDocumentsEvidenceCollection,
      emptyMessage: 'No documents have been removed and marked deficient.'
    }));

  
    this.showChildView('outcomeDocsRegion', new DisputeOutcomeDocGroupsView({
      collection: this.outcomeDocGroupCollection,
      primaryFileModelLookup: this.primaryFileModelLookup,
      primaryOutcomeDocGroupModels: this.primaryOutcomeDocGroupModels,
    }));
    this.showChildView('docsRequestsRegion', new DisputeDocRequestsView({ disputeModel: this.model, collection: this.docRequestsCollection }));

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      Formatter,
      isLoaded: this.isLoaded,
      lastRefreshTime: Moment(),
      showLegacyWarning: this.showLegacyWarning,
      showFileTitleEditor: this.showFileTitleEditor,
      showCustomTitleEditor: this.showCustomTitleEditor,
      showProvidedByEditor: this.showProvidedByEditor,
      enableQuickAccess: isQuickAccessEnabled(this.model),
    };
  }

});
