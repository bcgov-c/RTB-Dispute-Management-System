import Radio from 'backbone.radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import FilesView from '../../../../core/components/files/Files';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ModalAddNoticeBase from './ModalAddNoticeBase';
import NoticePreviewView from '../../../components/notice/NoticePreview';
import EditorView from '../../../../core/components/editor/Editor';
import EditorModel from '../../../../core/components/editor/Editor_model';
import template from './ModalAddNotice_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.`;
const RADIO_CODE_GENERATE = 0;
const RADIO_CODE_UPLOAD = 1;
const DEFAULT_UPLOAD_NOTICE_TITLE = 'Dispute Notice';

const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const ModalAddNotice = ModalBaseView.extend({
  template,
  id: 'addNotice-modal',
  
  regions : {
    disputeFiltersRegion: '.notice-dispute-type-filters',
    disputeNoticeTitleRegion: '.dispute-notice-title',
    specialInstructionsText: '.special-instructions',
    useSpecialInstructions: '.use-special-instructions',
    noticePreview: '#notice-preview',
    deficientReasonRegion: '.mark-deficient-reason',
    packageProvided: '.package-provided-dropdown',
    noticeDeliveryMethod: '.notice-delivery-method',
    noticeDeliveryTo: '.notice-delivered-to',
    noticeDeliveryDate: '.notice-delivery-date',
    noticeDeliveryTime: '.notice-delivery-time',
    noticeUploadRegion: '.notice-upload-component',
    noticeFilesRegion: '.notice-upload-files',
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

    this.cleanupExistingFileDescriptionAndSaveNewNoticeFileDescription()
      .done(noticeFileDescriptionModel => {
        filesChannel.request('add:filedescription', noticeFileDescriptionModel);
        // NOTE: Must save NoticeModel first to get the notice_version number to be used on the generated PDF
        // This will also save any new FileDescription to be associated to the notice
        this.model.save()
          .done(() => {
            this.performNoticeGeneration(this.disputeNoticeTitleModel.getData(), this.getChildView('noticePreview').$el.html(), noticeFileDescriptionModel, null, this.model.isNew());
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
      file_date: apiChanges.file_date,
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
    this.mergeOptions(options, ['isRegenerationMode']);

    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.NOTICE_ASSOCIATED_TO_APPLICANT = configChannel.request('get', 'NOTICE_ASSOCIATED_TO_APPLICANT');
    this.activeHearing = hearingChannel.request('get:active');

    this.createSubModels();
    
    this.fileUploader = this.initFileUploader();
    this.setupListeners();
  },

  initFileUploader(options={}) {
    const maxNumberOfFiles = 1;
    return filesChannel.request('create:uploader', {
      processing_options: {
        maxNumberOfFiles,
        checkForDisputeDuplicates: false,
        allowedFileTypes: configChannel.request('get', 'VALID_NOTICE_FILE_TYPES')
      },
      file_creation_fn: function() {
        return _.extend(this.defaultFileCreationFn(...arguments), {
          file_type: configChannel.request('get', 'FILE_TYPE_NOTICE'),
          autofillRename: true,
        });
      }
    });
  },

  createSubModels() {
    const dispute = disputeChannel.request('get');
    const isHearingRequired = dispute && dispute.isHearingRequired();
    const hasHearingInstructions = isHearingRequired && this.activeHearing && $.trim(this.activeHearing.get('special_instructions'));
    const valuesToDisable = [
      ...(isHearingRequired && !this.activeHearing ? [RADIO_CODE_GENERATE] : []),
    ];

    this.disputeNoticeFilters = new RadioModel({
      optionData: [{ text: 'Generate', value: RADIO_CODE_GENERATE }, { text: 'Upload', value: RADIO_CODE_UPLOAD }],
      value: !isHearingRequired || (isHearingRequired && this.activeHearing) ? RADIO_CODE_GENERATE : RADIO_CODE_UPLOAD,
      valuesToDisable,
    });

    this.disputeNoticeTitleModel = new InputModel({
      labelText: 'Notice Title',
      errorMessage: "Enter a Notice Title",
      required: true,
      disabled: true,
      value: this.model.get('notice_title') || DEFAULT_UPLOAD_NOTICE_TITLE,
      apiMapping: 'notice_title'
    });

    this.useSpecialInstructionsModel = new CheckboxModel({
      html: 'Include Special Instructions',
      checked: hasHearingInstructions,
      required: true
    });

    this.specialInstructionsModel = new EditorModel({
      required: false, // Default to not required, will be reset on-render UI toggle
      disabled: !this.useSpecialInstructionsModel.get('checked'),
      errorMessage: 'Enter special instructions or uncheck "Include Special Instructions" above',
      isEmailable: false,
      trumbowygOptions: {
        btns: [
          ['strong', 'em'],
          ['unorderedList', 'orderedList'],
          ['historyUndo', 'historyRedo'],
          ['removeformat']
        ],
      },
      maxLength: configChannel.request('get', 'NOTICE_SPECIAL_INSTRUCTIONS_MAX_LENGTH'),
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
      ...(this._isGenerateSelected() ? ['specialInstructionsText'] : ['packageProvided', 'noticeDeliveryMethod', 'noticeDeliveryTo', 'noticeDeliveryDate', 'noticeDeliveryTime']),
      ...(this.isRegenerationMode ? ['deficientReasonRegion'] : [])
    ];
  },

  setupListeners() {
    this.listenTo(this.fileUploader.files, 'update', this.hideFilesError, this);

    this.listenTo(this.disputeNoticeFilters, 'change:value', this.render, this);
    this.listenTo(this.specialInstructionsModel, 'change:value', this._onChangeSpecialInstructions, this);
    this.listenTo(this.useSpecialInstructionsModel, 'change:checked', this._onChangeUseSpecialInstructions, this);
    this.listenTo(this.specialInstructionsModel, 'change:required', this._setNoticeRequired, this);

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
      previewView.hideSpecialInstructions();
      this.getUI('specialInstructions').hide();
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
      this.showChildView('specialInstructionsText', new EditorView({ model: this.specialInstructionsModel })); 

      if (disputeChannel.request('get').getProcess()) {
        this.showChildView('noticePreview', new NoticePreviewView({ model: this.model }));
        // Trigger the special instructions toggle first
        this._onChangeUseSpecialInstructions(null, this.useSpecialInstructionsModel.getData());
        if (this.activeHearing && this.activeHearing.get('special_instructions')) {
          this._onChangeSpecialInstructions(null, this.specialInstructionsModel.getData());
        }
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

  templateContext() {
    const disputeProcess = disputeChannel.request('get').getProcess();
    return {
      Formatter,
      disputeProcess,
      disableGenerateButton: !disputeProcess,
      isUploadView: this._isUploadSelected(),
      isRegenerationMode: this.isRegenerationMode,
      existingNoticeFiles: this.existingNoticeFiles,
    };
  }
});

_.extend(ModalAddNotice.prototype, ModalAddNoticeBase);
export default ModalAddNotice;