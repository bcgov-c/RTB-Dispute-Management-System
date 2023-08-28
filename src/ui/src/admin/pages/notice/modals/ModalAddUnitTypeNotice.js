import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import FilesView from '../../../../core/components/files/Files';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ModalAddNoticeBase from './ModalAddNoticeBase';
import AriNoticePreviewView from '../../../components/notice/AriNoticePreview';
import PfrNoticePreviewView from '../../../components/notice/PfrNoticePreview';
import UtilityMixin from '../../../../core/utilities/UtilityMixin';
import EditorView from '../../../../core/components/editor/Editor';
import EditorModel from '../../../../core/components/editor/Editor_model';
import template from './ModalAddUnitTypeNotice_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import { PAGE_BREAK_CLASS } from '../../../components/decision-generator/decision-templates/DecGenPageBreak';

const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.`;
const RADIO_CODE_GENERATE = 0;
const RADIO_CODE_UPLOAD = 1;
const DEFAULT_UPLOAD_NOTICE_TITLE = 'Dispute Notice';

const flagsChannel = Radio.channel('flags');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const getGenerateProgressLine = (index, total) => index && total ? `Generating: ${index}/${total}` : '';
const getNumBatches = (total, batchSize) => Math.ceil(total / batchSize);

const NoticeGeneratorHelper = Marionette.Object.extend({
 
  initialize(options) {
    options = options || {};
    const context = options.context || null;
    this.getNoticeGenPromises = this._getNoticeGenPromises.bind(context);
    this.createGenerateProgressModalAndSwitchView = this._createGenerateProgressModalAndSwitchView.bind(context);
    this.generateNoticeHtml = this._generateNoticeHtml.bind(context);
    context.__dms_self = this;
  },

  _getNoticeGenPromises(allUnitsOrTenants, noticeFileDescriptionModel, progressModal) {
    // Process batches of units/tenants

    const noticeGenPromises = [];
    const getUnitDisplay = (unitOrTenant) => unitOrTenant?.getUnitNumDisplay?.().replace(/\s/g, '');

    for (let i = 0; i < allUnitsOrTenants.length; i += this.generationCount) {
      const unitsOrTenants = allUnitsOrTenants.slice(i, i + this.generationCount);
      const noticeHtml = unitsOrTenants.reduce((html, unitOrTenant, index) => (
        html += `${this.__dms_self.generateNoticeHtml(unitOrTenant)}\n${index < (unitsOrTenants.length - 1) ? `<div class="${PAGE_BREAK_CLASS}"></div>` : ''}\n`
      ), '');
      let noticeTitleCustomText = '';
      if (this.isCreatedAriE) {
        noticeTitleCustomText = unitsOrTenants?.[0]?.get('name_abbreviation');
      } else {
        // Add UnitX-UnitY display to batches of notices
        noticeTitleCustomText = `${getUnitDisplay(unitsOrTenants?.[0])}${unitsOrTenants.length > 1 ? `-${getUnitDisplay(unitsOrTenants?.slice(-1)?.[0])}` : ``}`;
      }
      const pdfTitle = `${this.disputeNoticeTitleModel.getData()}_${noticeTitleCustomText}`;

      noticeGenPromises.push(this.performNoticeGeneration.bind(this, pdfTitle, noticeHtml, noticeFileDescriptionModel, () => {
        const nextIndex = i + this.generationCount + 1;
        if (nextIndex > this.unitOrTenantIterable.length) return;
        progressModal.updateProgressText( getGenerateProgressLine(getNumBatches(nextIndex, this.generationCount), getNumBatches(this.unitOrTenantIterable.length, this.generationCount)) );
      }));
    }

    return noticeGenPromises;
  },

  _generateNoticeHtml(unitOrTenant) {
    const noticePreviewView = new (this.modalClass)({
      templateData: {
        respondents: this.isCreatedAriE ? [unitOrTenant] : this.unitParticipants[unitOrTenant.get('unit_id')],
        INTAKE_LOGIN_URL: (configChannel.request('get', 'INTAKE_URL') || '').replace('/Intake', '/AdditionalLandlordIntake'),
      },
      model: this.model,
      matchingUnit: this.isCreatedAriE ? null : unitOrTenant,
      isPrelim: this.isPrelim,
    });
    
    // Have to render the DOM first in order to access the view methods to toggle special instructions
    noticePreviewView.render();
    if (this.useSpecialInstructionsModel.get('checked')) {
      noticePreviewView.updateSpecialInstructions(this.specialInstructionsModel.getData());
      noticePreviewView.showSpecialInstructions();
    } else {
      noticePreviewView.hideSpecialInstructions();               
    }

    return noticePreviewView.$el.html();
  },

  _createGenerateProgressModalAndSwitchView(initialProgressText) {
    const numToGenerate = getNumBatches(this.unitOrTenantIterable.length, this.generationCount);
    const modalView = modalChannel.request('show:standard', {
      title: 'Generating Notices',
      bodyHtml: `<p>${numToGenerate} notice${numToGenerate === 1 ? ' is' : 's are'} being generated for ${this.unitOrTenantIterable.length} ${this.isCreatedAriE ? 'tenant' : 'unit'}${this.unitOrTenantIterable.length===1?'':'s'}.  When this process has completed this window will close automatically.  If you cancel or close this modal all generated notice files will be cleared.</p>
        <b><div class="modal-notice-progress-text">${initialProgressText || ''}</div></b>`,
      hideContinueButton: true
    });

    // Add some utility functions for displaying info
    modalView.updateProgressText = (text) => {
      modalView.$('.modal-notice-progress-text').text(text);
    };
    
    modalView.hideModal = () => {
      modalView.close();
    };

    // Hide current add notice modal, as we are now in a progress feedback view
    this.$el.hide();
    loaderChannel.trigger('page:load:complete');

    return modalView;
  },

});


const ModalAddNotice = ModalBaseView.extend({
  template,
  id: 'addNotice-modal',
  
  regions : {
    disputeFiltersRegion: '.notice-dispute-type-filters',
    disputeNoticeTitleRegion: '.dispute-notice-title',
    specialInstructionsText: '.special-instructions',
    useSpecialInstructions: '.use-special-instructions',
    singleGenerationRegion: '.notice-single-generation',
    noticePreview: '#notice-preview',
    noticeUploadRegion: '.notice-upload-component',
    noticeFilesRegion: '.notice-upload-files',
    deficientReasonRegion: '.mark-deficient-reason',
    packageProvided: '.package-provided-dropdown',
    noticeDeliveryMethod: '.notice-delivery-method',
    noticeDeliveryTo: '.notice-delivered-to',
    noticeDeliveryDate: '.notice-delivery-date',
    noticeDeliveryTime: '.notice-delivery-time',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      generate: '.btn-add',
      upload: '.btn-upload',
      specialInstructions: '.special-instructions'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.generate': 'clickGenerateNotice',
      'click @ui.upload': 'clickUploadNotice'
    });
  },

  clickGenerateNotice() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    loaderChannel.trigger('page:load');
    this.saveInternalDataToNotice({
      notice_title: this.disputeNoticeTitleModel.getData(),
      notice_type: configChannel.request('get', 'NOTICE_TYPE_GENERATED'),
      notice_special_instructions: this.specialInstructionsModel.getData()
    });

    const initialFileDescription = this.model.getNoticeFileDescription();
    this.cleanupExistingFileDescriptionAndSaveNewNoticeFileDescription()
      .done(noticeFileDescriptionModel => {
        // NOTE: Must save NoticeModel first to get the notice_version number to be used on the generated PDF
        // This will also save any new FileDescription to be associated to the notice
        this.model.save()
          .done(() => {
            const noticeHelper = new NoticeGeneratorHelper({ context: this });
            const progressModal = noticeHelper.createGenerateProgressModalAndSwitchView( getGenerateProgressLine(1, getNumBatches(this.unitOrTenantIterable.length, this.generationCount)) );
            const generateNoticeDfds = noticeHelper.getNoticeGenPromises(this.unitOrTenantIterable, noticeFileDescriptionModel, progressModal);
            
            // Add cancel listeners, via the Modal, and trigger them when this modal is removed
            const noticeSaveQueue = UtilityMixin.util_clearQueue(generateNoticeDfds, { stop_on_error: true, add_cancel_listener: true });
            
            let savesComplete = false;
            let cancelled = false;
            this.listenTo(progressModal, 'removed:modal', () => {
              if (!savesComplete) {
                cancelled = true;
                noticeSaveQueue.trigger('cancel:all');
              }
            });
            noticeSaveQueue.then(() => {
              savesComplete = true;
              if (cancelled) {
                throw 'cancelled';
              }

              const onFinish = () => {
                setTimeout(() => loaderChannel.trigger('page:load'), 10);
                this.$el.html('').show();
                if (progressModal) {
                  progressModal.hideModal();
                }
                this.onNoticeModelSaveSuccess();
              };
              if (this.isPrelim) {
                const flag = flagsChannel.request('create:prelim');
                flag.save().always(() => onFinish());
              } else {
                onFinish();
              }
            })
            .catch(err => {
              loaderChannel.trigger('page:load');
              const shouldDeleteNotice = !this.isRegenerationMode && cancelled;
              // Re-set the file description to either the previous one (and remove deficient), or clear the file description
              const modelSaveData = {};
              if (this.isRegenerationMode && initialFileDescription) {
                modelSaveData.notice_file_description_id = initialFileDescription.id;
                initialFileDescription.markNotDeficient();
              }

              if (progressModal) {
                progressModal.updateProgressText('Deleting generated files');
              }
              // Always clean up the latest file deascription and notice files
              $.whenAll(
                noticeFileDescriptionModel ? noticeFileDescriptionModel.fullDelete() : null,
                shouldDeleteNotice ? this.model.fullDelete() : null,
                !shouldDeleteNotice && modelSaveData ? this.model.save(modelSaveData) : null,
                !shouldDeleteNotice && this.isRegenerationMode && initialFileDescription && initialFileDescription !== noticeFileDescriptionModel ? initialFileDescription.save() : null,
              ).done(() => {
                  this.$el.html('').show();
                  if (progressModal) {
                    progressModal.hideModal();
                  }
                  if (this.isRegenerationMode) {
                    this.model.trigger('notice:regenerated');
                  } else {
                    this.model.trigger('refresh:notice:page');
                  }
                  this.close();
                }).fail(err => {
                  alert(`[Error] There was an error cleanup up notice data after a failure occurred during notice generation.`);
                });
            });
          })
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.NOTICE.SAVE');
            handler(err);
          });
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.NOTICE.CLEANUP');
        handler(err);
      });
  },

  clickUploadNotice() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    const apiChanges = this.getPackageProvidedApiChanges();
    this.saveInternalDataToNotice(Object.assign({
      notice_title: this.disputeNoticeTitleModel.getData(),
      notice_type: configChannel.request('get', 'NOTICE_TYPE_UPLOADED'),
    }, apiChanges));

    this.prepareFileUploads(this.fileUploader, {
      added_by: apiChanges.notice_delivered_to,
      file_date: apiChanges.notice_delivered_date
    });
    this.fileUploader.saveInternalDataToModel();

    loaderChannel.trigger('page:load');
    this.performNoticeUpload();
  },

  validateAndShowErrors() {
    this.hideFilesError();
    let isValid = true;
    const viewsToValidate = this._getViewsToValidate();
    _.each(viewsToValidate, function(viewName) {
      const view = this.getChildView(viewName);
      if (view && !view.validateAndShowErrors()) {
        isValid = false;
      }
    }, this);

    if (this._isUploadSelected()) {
      if (!this.fileUploader.files.length) {
        this.$(filesErrorClassSelector).html(NO_FILES_ERROR_MSG);
        isValid = false;
      }
    }

    return isValid;
  },

  initialize(options) {
    this.mergeOptions(options, ['isRegenerationMode', 'isPrelim']);

    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.NOTICE_ASSOCIATED_TO_APPLICANT = configChannel.request('get', 'NOTICE_ASSOCIATED_TO_APPLICANT');
    this.activeHearing = hearingChannel.request('get:active');

    this.dispute = disputeChannel.request('get');
    this.isCreatedAriE = this.dispute.isCreatedAriE();
    const isCreatedAriC = this.dispute.isCreatedAriC();

    this.rentIncreaseUnits = participantsChannel.request('get:dispute:units').filter(unit => isCreatedAriC ? unit.hasSavedRentIncreaseData() : unit.get('selected_tenants'));
    this.respondentModels = participantsChannel.request('get:respondents').models;
    this.unitOrTenantIterable = this.isCreatedAriE ? this.respondentModels : this.rentIncreaseUnits;

    this.modalClass = isCreatedAriC || this.isCreatedAriE ? AriNoticePreviewView : PfrNoticePreviewView;
    
    this.unitParticipants = {};
    if (this.rentIncreaseUnits.length) {
      this.rentIncreaseUnits.forEach(unitModel => {
        this.unitParticipants[unitModel.get('unit_id')] = _.map(unitModel.getParticipantIds(), participantId => participantsChannel.request('get:participant', participantId));
      });
    }

    this.createSubModels();
    this.generationCount = this.singleGenerationModel.getData() ? 1 : this.singleGenerationModel.get('_defaultCount');
    
    this.fileUploader = this.initFileUploader();
    this.setupListeners();
  },

  initFileUploader(options={}) {
    const maxNumberOfFiles = 1;
    return filesChannel.request('create:uploader', {
      processing_options: {
        maxNumberOfFiles,
        checkForDisputeDuplicates: false,
        maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
        allowedFileTypes: configChannel.request('get', 'VALID_NOTICE_FILE_TYPES')
      },
      file_creation_fn: function() {
        return _.extend(this.defaultFileCreationFn(...arguments), {
          file_type: configChannel.request('get', 'FILE_TYPE_NOTICE')
        });
      }
    });
  },

  createSubModels() {
    const dispute = disputeChannel.request('get');
    const isHearingRequired = dispute && dispute.isHearingRequired();
    const hasHearingInstructions = isHearingRequired && this.activeHearing && $.trim(this.activeHearing.get('special_instructions'));

    this.disputeNoticeFilters = new RadioModel({
      optionData: [{ text: 'Generate', value: RADIO_CODE_GENERATE }, { text: 'Upload', value: RADIO_CODE_UPLOAD }],
      value: RADIO_CODE_GENERATE
    });

    this.disputeNoticeTitleModel = new InputModel({
      labelText: 'Notice Title',
      errorMessage: "Enter a Notice Title",
      required: true,
      disabled: true,
      value: this.model.get('notice_title') || `${this.isPrelim ? 'Prelim ':''}${DEFAULT_UPLOAD_NOTICE_TITLE}`,
      apiMapping: 'notice_title'
    });

    this.useSpecialInstructionsModel = new CheckboxModel({
      html: 'Include Special Instructions',
      checked: hasHearingInstructions,
      required: true
    });

    this.singleGenerationModel = new CheckboxModel({
      html: `Generate Individually`,
      disabled: this.isCreatedAriE,
      checked: this.isCreatedAriE,
      _defaultCount: configChannel.request('get', 'NOTICE_GENERATION_UNIT_COUNT'),
    });

    this.specialInstructionsModel = new EditorModel({
      required: false, // Default to not required, will be reset on-render UI toggle
      disabled: !this.useSpecialInstructionsModel.get('checked'),
      errorMessage: 'Enter special instructions or uncheck "Include Special Instructions" above',
      isEmailable: false,
      maxLength: configChannel.request('get', 'NOTICE_SPECIAL_INSTRUCTIONS_MAX_LENGTH'),
      trumbowygOptions: {
        btns: [
          ['strong', 'em'],
          ['unorderedList', 'orderedList'],
          ['historyUndo', 'historyRedo'],
          ['removeformat'],
          ['fullscreen']
        ],
      },
      value: hasHearingInstructions && this.activeHearing ? $.trim(this.activeHearing.get('special_instructions')) : null
    });

    this.existingNoticeFiles = this.model.getNoticeFileModels();

    this.deficientReasonModel = new TextareaModel({
      labelText: 'Removal Reason',
      errorMessage: `Please enter the reason`,
      required: true,
      min: configChannel.request('get', 'DEFICIENT_REASON_MIN_LENGTH'),
      max: configChannel.request('get', 'DEFICIENT_REASON_MAX_LENGTH'),
      countdown: false,
      displayRows: 2
    });

    this.createPackageProvidedUiModels();
  },

  _getViewsToValidate() {
    return ['disputeNoticeTitleRegion',
      ...(this._isGenerateSelected() ? ['specialInstructionsText'] : ['packageProvided', 'noticeDeliveryMethod', 'noticeDeliveryTo', 'noticeDeliveryDate', 'noticeDeliveryTime',]),
      ...(this.isRegenerationMode ? ['deficientReasonRegion'] : [])
    ];
  },

  setupListeners() {
    this.listenTo(this.fileUploader.files, 'update', this.hideFilesError, this);
    this.listenTo(this.disputeNoticeFilters, 'change:value', this.render, this);
    this.listenTo(this.specialInstructionsModel, 'change:value', this._onChangeSpecialInstructions, this);
    this.listenTo(this.useSpecialInstructionsModel, 'change:checked', this._onChangeUseSpecialInstructions, this);
    this.listenTo(this.specialInstructionsModel, 'change:required', this._setNoticeRequired, this);

    this.listenTo(this.singleGenerationModel, 'change:checked', (m, checked) => {
      this.generationCount = checked ? 1 : this.singleGenerationModel.get('_defaultCount');
      this.render();
    });

    this.setupPackageProvidedUiModelListeners();
  },

  _setNoticeRequired(model, value) {
    const instructionsView = this.getChildView('specialInstructionsText');
    if (instructionsView) {
      instructionsView.render();
      if (value) {
      this.specialInstructionsModel.set({ disabled: false });
      } else {
      this.specialInstructionsModel.set({ disabled: true, value: null });
      }
      this.getChildView('specialInstructionsText').render();
    }
  },

  _onChangeSpecialInstructions(model, value) {
    const previewView = this.getChildView('noticePreview');
    previewView.updateSpecialInstructions(value);
  },

  _onChangeUseSpecialInstructions(model, value) {
    const previewView = this.getChildView('noticePreview');
    if (!previewView) {
      return;
    }
    if (value) {
      this.getUI('specialInstructions').show();
      previewView.showSpecialInstructions();
    } else {
      this.getUI('specialInstructions').hide();
      previewView.hideSpecialInstructions();
    }
    this.specialInstructionsModel.set({
      required: value
    });
  },

  _isGenerateSelected() {
    return this.disputeNoticeFilters.getData() === RADIO_CODE_GENERATE;
  },

  _isUploadSelected() {
    return this.disputeNoticeFilters.getData() === RADIO_CODE_UPLOAD;
  },

  hideFilesError() {
    this.$(filesErrorClassSelector).html('');
  },

  onBeforeRender() {
    if (this.fileUploader && this.fileUploader.isRendered()) {
      this.detachChildView('noticeUploadRegion');
    }
  },

  onRender() {
    this.showChildView('disputeFiltersRegion', new RadioView({ model: this.disputeNoticeFilters, displayTitle: 'Dispute Notice: ' }));
    this.renderDisputeNoticeViews();

    if (this.isRegenerationMode) {
      this.$('.add-files-container label').html('Replace files with');
    }
  },

  renderDisputeNoticeViews() {
    this.showChildView('disputeNoticeTitleRegion', new InputView({ model: this.disputeNoticeTitleModel }));

    if (this._isGenerateSelected()) {
      this.showChildView('useSpecialInstructions', new CheckboxView({ model: this.useSpecialInstructionsModel }));
      this.showChildView('singleGenerationRegion', new CheckboxView({ model: this.singleGenerationModel }));
      this.showChildView('specialInstructionsText', new EditorView({ model: this.specialInstructionsModel })); 

      if (this.dispute.getProcess()) {
        this.renderNoticePreview();
        // If any entered user info in special instructions model, use that on re-render
        // Trigger the special instructions toggle first
        this._onChangeUseSpecialInstructions(null, this.useSpecialInstructionsModel.getData());
        this._onChangeSpecialInstructions(null, this.specialInstructionsModel.getData());
      }
    } else if (this._isUploadSelected()) {
      this.showChildView('noticeUploadRegion', this.fileUploader);
      this.showChildView('noticeFilesRegion', new FilesView({ collection: this.fileUploader.files }));
      this.showChildView('packageProvided', new DropdownView({ model: this.packageProvidedModel }));
      this.showChildView('noticeDeliveryMethod', new DropdownView({ model: this.noticeDeliveryModel }));
      this.showChildView('noticeDeliveryTo', new DropdownView({ model: this.noticeDeliveryTo }));
      this.showChildView('noticeDeliveryDate', new InputView({ model: this.deliveryDateModel }));
      this.showChildView('noticeDeliveryTime', new InputView({ model: this.deliveryTimeModel }));  
    }

    if (this.isRegenerationMode) {
      this.showChildView('deficientReasonRegion', new TextareaView({ model: this.deficientReasonModel }));
    }
  },

  renderNoticePreview() {
    this.showChildView('noticePreview', new (this.modalClass)(Object.assign({ model: this.model, isPrelim: this.isPrelim },
      this.unitOrTenantIterable.length ? {
        templateData: {
          respondents: this.isCreatedAriE && this.respondentModels.length ? [this.respondentModels[0]] :
              (this.unitParticipants[this.rentIncreaseUnits[0].get('unit_id')] || []),
          INTAKE_LOGIN_URL: (configChannel.request('get', 'INTAKE_URL') || '').replace('/Intake', '/AdditionalLandlordIntake')
        },
        matchingUnit: this.rentIncreaseUnits[0]
      } : {}
    )));
  },

  templateContext() {
    const disputeProcess = this.dispute.getProcess();
    return {
      Formatter,
      disputeProcess,
      disableGenerateButton: !disputeProcess || !this.unitOrTenantIterable.length,
      isRegenerationMode: this.isRegenerationMode,
      isUploadView: this._isUploadSelected(),
      existingNoticeFiles: this.existingNoticeFiles,
      rentIncreaseUnits: this.rentIncreaseUnits,
      respondents: this.respondentModels,
      hideUnitInfo: this.isCreatedAriE,
      generationCount: this.generationCount
    };
  }
});

_.extend(ModalAddNotice.prototype, ModalAddNoticeBase);
export default ModalAddNotice;