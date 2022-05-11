import Radio from 'backbone.radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import FilesView from '../../../../core/components/files/Files';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ModalAddNoticeBase from './ModalAddNoticeBase';
import template from './ModalAddAmendmentNotice_template.tpl';

const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `You must add at least one valid file to continue.`;
const RADIO_CODE_GENERATE = 0;
const RADIO_CODE_UPLOAD = 1;
const DEFAULT_UPLOAD_NOTICE_TITLE = 'Amendment';

const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const loaderChannel = Radio.channel('loader');

const ModalAddAmendmentNotice = ModalBaseView.extend({
  template,
  id: 'addNotice-modal',
  
  regions : {
    amendmentFiltersRegion: '.notice-amendment-type-filters',
    amendmentNoticeTitleRegion: '.notice-amendment-title',
    amendmentNoticeUploadRegion: '.notice-amendmned-upload-component',
    amendmentNoticeFilesRegion: '.notice-amendment-upload-files',
    deficientReasonRegion: '.mark-deficient-reason',
    packageProvided: '.package-provided-dropdown',
    noticeDeliveryMethod: '.notice-delivery-method',
    noticeDeliveryTo: '.notice-delivered-to',
    noticeDeliveryDate: '.notice-delivery-date',
    noticeDeliveryTime: '.notice-delivery-time',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      amendmentUpload: '.btn-amendment-upload'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.amendmentUpload': 'clickAmendmentUpload'
    });
  },

  clickAmendmentUpload() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    const apiChanges = this.getPackageProvidedApiChanges();
    this.saveInternalDataToNotice(Object.assign({
      notice_title: this.amendmentNoticeTitleModel.getData(),
      notice_type: configChannel.request('get', 'NOTICE_TYPE_UPLOADED_AMENDMENT'),
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
    this.mergeOptions(options, ['isChildApplication', 'isRegenerationMode']);

    this.parentNoticeModel = noticeChannel.request('get:by:id', this.model.get('parent_notice_id'));
    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.activeHearing = hearingChannel.request('get:active');

    const fileModels = this.model.getNoticeFileModels();
    this.firstFileModel = fileModels.length ? fileModels[0] : null;

    this.createSubModels();
    this.fileUploader = this.initAmendmentFileUploader();
  
    this.setupListeners();
  },
  

  initAmendmentFileUploader() {
    const maxNumberOfFiles = this.NOTICE_FILES_MAX;
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
    const getNoticeTypeOptionsFn = function() {
      return [{ text: 'Generate', value: RADIO_CODE_GENERATE }, { text: 'Upload', value: RADIO_CODE_UPLOAD }];
    };

    this.disputeAmendmentFilters = new RadioModel({
      optionData: getNoticeTypeOptionsFn(),
      disabled: false,
      value: RADIO_CODE_UPLOAD,
      valuesToDisable: [RADIO_CODE_GENERATE], // R1 always disable Generate Amendment
    });

    
    // Amendment models
    this.amendmentNoticeTitleModel = new InputModel({
      labelText: 'Notice Title',
      errorMessage: "Enter a Notice Title",
      required: true,
      disabled: true,
      value: DEFAULT_UPLOAD_NOTICE_TITLE,
      apiMapping: 'notice_title'
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

  setupListeners() {
    this.listenTo(this.fileUploader.files, 'update', this.hideFilesError, this);
    this.setupPackageProvidedUiModelListeners();
  },

  _getViewsToValidate() {
    return ['amendmentNoticeTitleRegion', 'packageProvided', 'noticeDeliveryMethod', 'noticeDeliveryTo', 'noticeDeliveryDate', 'noticeDeliveryTime',
      ...(this.isRegenerationMode ? ['deficientReasonRegion'] : [])
    ];
  },

  hideFilesError() {
    this.$(filesErrorClassSelector).html('');
  },

  onBeforeRender() {
    if (this.fileUploader && this.fileUploader.isRendered()) {
      this.detachChildView('amendmentNoticeUploadRegion');
    }
  },

  onRender() {
    this.showChildView('amendmentFiltersRegion', new RadioView({ model: this.disputeAmendmentFilters, displayTitle: 'Amendment Notice: ' }));
    this.showChildView('amendmentNoticeTitleRegion', new InputView({ model: this.amendmentNoticeTitleModel }));
    this.showChildView('amendmentNoticeUploadRegion', this.fileUploader);
    this.showChildView('amendmentNoticeFilesRegion', new FilesView({ collection: this.fileUploader.files, hideUploaded: false }));
    this.showChildView('packageProvided', new DropdownView({ model: this.packageProvidedModel }));  
    this.showChildView('noticeDeliveryMethod', new DropdownView({ model: this.noticeDeliveryModel }));
    this.showChildView('noticeDeliveryTo', new DropdownView({ model: this.noticeDeliveryTo }));
    this.showChildView('noticeDeliveryDate', new InputView({ model: this.deliveryDateModel }));
    this.showChildView('noticeDeliveryTime', new InputView({ model: this.deliveryTimeModel }));

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

_.extend(ModalAddAmendmentNotice.prototype, ModalAddNoticeBase);
export default ModalAddAmendmentNotice;