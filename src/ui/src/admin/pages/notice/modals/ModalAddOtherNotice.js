import Radio from 'backbone.radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import FilesView from '../../../../core/components/files/Files';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ModalAddNoticeBase from './ModalAddNoticeBase';
import template from './ModalAddOtherNotice_template.tpl';

const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.`;
const RADIO_CODE_UPLOAD = 1;

const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const ModalAddOtherNotice = ModalBaseView.extend({
  template,
  id: 'addNotice-modal',
  
  regions: {
    disputeFiltersRegion: '.notice-dispute-type-filters',
    disputeNoticeTitleRegion: '.dispute-notice-title',
    noticeUploadRegion: '.notice-upload-component',
    noticeFilesRegion: '.notice-upload-files',
    associatedToRegion: '.notice-associated-to-region',
    deficientReasonRegion: '.mark-deficient-reason',
    packageProvided: '.package-provided-dropdown',
    noticeDeliveryMethod: '.notice-delivery-method',
    noticeDeliveryTo: '.notice-delivered-to',
    noticeRTBInitiatedRegion: '.notice-rtb-initiated',
    noticeDeliveryDate: '.notice-delivery-date',
    noticeDeliveryTime: '.notice-delivery-time',
    noticeOtherDeliveryDescriptionRegion: '.notice-other-delivery-description',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      upload: '.btn-upload',
      noticeOtherDeliveryDescription: '.notice-other-delivery-description'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.upload': 'clickUploadNotice' 
    });
  },


  clickUploadNotice() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    const apiChanges = this.getPackageProvidedApiChanges();
    this.saveInternalDataToNotice(Object.assign({
      notice_title: this.disputeNoticeTitleModel.getData(),
      notice_type: configChannel.request('get', 'NOTICE_TYPE_UPLOADED_OTHER'),
      notice_associated_to: this.associatedToModel.getData(),
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

    if (!this.fileUploader.files.length) {
      this.$(filesErrorClassSelector).html(NO_FILES_ERROR_MSG);
      isValid = false;
    }

    return isValid;
  },
  
  initialize(options) {
    this.mergeOptions(options, ['isRegenerationMode']);

    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    
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
        maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
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
    this.disputeNoticeFilters = new RadioModel({
      optionData: [{ text: 'Upload', value: RADIO_CODE_UPLOAD }],
      value: RADIO_CODE_UPLOAD,
    });

    this.disputeNoticeTitleModel = new InputModel({
      labelText: 'Notice Title',
      errorMessage: "Enter a Notice Title",
      required: true,
      disabled: false,
      value: this.model.get('notice_title') || 'Other Notice',
      apiMapping: 'notice_title'
    });

    const noticeAssociatedTo = this.model.get('notice_associated_to');
    this.associatedToModel = new DropdownModel({
      optionData: [{ value: '1', text: 'Applicant' }, { value: '2', text: 'Respondent' }],
      labelText: 'Notice Associated To',
      defaultBlank: true,
      required: true,
      value: noticeAssociatedTo ? String(noticeAssociatedTo) : null,
      apiMapping: 'notice_associated_to'
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
    return ['disputeNoticeTitleRegion', 'associatedToRegion', 'packageProvided', 'noticeDeliveryMethod', 'noticeDeliveryTo', 'noticeDeliveryDate', 'noticeDeliveryTime',
      ...(this.isRegenerationMode ? ['deficientReasonRegion'] : [])
    ];
  },

  setupListeners() {
    this.listenTo(this.fileUploader.files, 'update', this.hideFilesError, this);
    this.listenTo(this.associatedToModel, 'change:value', (model, value) => {
      this.model.set(this.associatedToModel.getPageApiDataAttrs());
      this.noticeDeliveryTo.set({
        optionData: this._getDeliveryToOptions(value),
        value: null
      });
      this.noticeDeliveryTo.trigger('render');
    });

    this.setupPackageProvidedUiModelListeners();
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
    this.showChildView('disputeFiltersRegion', new RadioView({ model: this.disputeNoticeFilters, displayTitle: 'Other Notice: ' }));
    this.showChildView('disputeNoticeTitleRegion', new InputView({ model: this.disputeNoticeTitleModel }));
    this.showChildView('associatedToRegion', new DropdownView({ model: this.associatedToModel }));
    this.showChildView('packageProvided', new DropdownView({ model: this.packageProvidedModel }));  
    this.showChildView('noticeDeliveryMethod', new DropdownView({ model: this.noticeDeliveryModel }));
    this.showChildView('noticeDeliveryTo', new DropdownView({ model: this.noticeDeliveryTo }));
    this.showChildView('noticeRTBInitiatedRegion', new CheckboxView({ model: this.servedByRTBModel }));
    this.showChildView('noticeDeliveryDate', new InputView({ model: this.deliveryDateModel }));
    this.showChildView('noticeDeliveryTime', new InputView({ model: this.deliveryTimeModel }));
    this.showChildView('noticeUploadRegion', this.fileUploader);
    this.showChildView('noticeFilesRegion', new FilesView({ collection: this.fileUploader.files }));
    this.showChildView('noticeOtherDeliveryDescriptionRegion', new InputView({ model: this.noticeOtherDeliveryDescriptionModel }));
    
    if (this.isRegenerationMode) {
      this.showChildView('deficientReasonRegion', new TextareaView({ model: this.deficientReasonModel }));
      this.$('.add-files-container label').html('Replace files with');
    }
  },

  templateContext() {
    return {
      Formatter,
      isRegenerationMode: this.isRegenerationMode,
      existingNoticeFiles: this.existingNoticeFiles
    };
  }
});

_.extend(ModalAddOtherNotice.prototype, ModalAddNoticeBase);
export default ModalAddOtherNotice;