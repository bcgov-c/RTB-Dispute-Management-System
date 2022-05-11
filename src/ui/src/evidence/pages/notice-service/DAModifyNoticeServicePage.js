import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import FileCollection from '../../../core/components/files/File_collection';
import FilesView from '../../../core/components/files/Files';
import ExternalNoticeServiceModel from '../../components/external-api/ExternalNoticeService_model';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import template from './DAModifyNoticeServicePage_template.tpl';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import Formatter from '../../../core/components/formatter/Formatter';
import ViewMixin from '../../../core/utilities/ViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const LANDLORD_UPLOAD_HELP = `Upload your Proof of Service - Notice of Direct Request Proceeding (RTB-44) and the registered mail receipt (if applicable)`;
const TENANT_UPLOAD_HELP = `Upload your Proof of Service - Tenant's Notice of Direct Request Proceeding (RTB-50) and the registered mail receipt (if applicable)`;

const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} da-modify-notice-service-page`,

  regions: {
    disputeRegion: '.dac__service__dispute-overview',
    noticeServiceserviceMethodRegion: '.da-notice-service-method',
    noticeServiceserviceDateRegion: '.da-notice-service-delivered-date',
    noticeServiceCommentRegion: '.da-notice-service-comment',
    filesDisplayRegion: '.da-notice-service-files'
  },

  ui: {
    serviceContainer: '.da-modify-notice-service-container',
    updateNoticeServiceBtn: '.btn-update-notice-service',
    cancelNoticeServiceUpdateBtn: '.btn-cancel',
    addFilesButton: '.da-upload-add-evidence-button',
    filesError: '.error-block',
  },

  events: {
    'click @ui.updateNoticeServiceBtn': 'clickSave',
    'click @ui.cancelNoticeServiceUpdateBtn': 'clickCancelNoticeServiceUpdate',
    'click @ui.addFilesButton': 'clickAddFile'
  },

  clickCancelNoticeServiceUpdate() {
    Backbone.history.navigate('update/notice/service', { trigger: true });
  },

  clickAddFile() {
    // Only show overwrites if it's been served
    if (this.hasExistingFiles) {
      modalChannel.request('show:standard', {
        title: 'Warning',
        bodyHtml: `<p>The previously uploaded files will be deleted. Are you sure you would like to continue?</p>`,
        onContinueFn: _.bind(function(modalView) {
          modalView.close();
          this.showAddFilesModal();
        }, this)
      });
    } else {
      this.showAddFilesModal();
    }
  },

  showAddFilesModal() {
    // Copy files into a new collection so no events are triggered on the old collection
    const originalFileModels = this.serviceFileCollection.getReadyToUpload() || [];
    originalFileModels.forEach(fileModel => {
      if (fileModel.collection) {
        fileModel.collection.remove(fileModel, { silent: true });
      }
      
      // Allow renames to happen in the Upload window
      fileModel.set('display_mode', false);
    });

    const modalFiles = new FileCollection(originalFileModels);

    const modalAddFiles = new ModalAddFiles({
      model: this.proofDisputeEvidenceModel,
      fileType: configChannel.request('get', 'FILE_TYPE_NOTICE'),
      files: modalFiles,
      title: 'Add / Edit Service Files',
      hideDescription: true,
      noUploadOnSave: true,
      saveButtonText: 'Update upload list',
      showDelete: false,
      processing_options: {
        maxNumberOfFiles: this.SERVICE_FILES_MAX
      }
    });
    
    let modelsToResetWith = originalFileModels;
    this.listenTo(modalAddFiles, 'save:complete', () => {
      modelsToResetWith = modalFiles.getReadyToUpload()
    });

    this.listenTo(modalAddFiles, 'removed:modal', () => {
      this.serviceFileCollection.reset(modelsToResetWith.map(function(file_model) {
        file_model.set('display_mode', true);
        if (file_model.collection) {
          file_model.collection.remove(file_model, {silent: true});
        }
        return file_model;
      }));
    });


    modalChannel.request('add', modalAddFiles);
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }


    this.renderPageForUpload();
    loaderChannel.trigger('page:load');
    
    this.proofDisputeEvidenceModel.save()
      .then(this.uploadNoticeServiceFiles.bind(this))
      .then(() => {
        this.saveInternalDataToModel();
        const noticeServiceSaveModel = new ExternalNoticeServiceModel(this.noticeServiceModel.toJSON());
        noticeServiceSaveModel.save(this.noticeServiceModel.getApiChangesOnly())
          .done(() => {
            this.checkAndUpdateDisputeStatus()
              .always(() => {
                this.model.setReceiptData({
                  noticeServiceModel: this.noticeServiceModel,
                  submittedNoticeFiles: this.serviceFileCollection
                });
                this.model.set('routingReceiptMode', true);
                Backbone.history.navigate('update/notice/service/receipt', { trigger: true });
              });
          }).fail(
            generalErrorFactory.createHandler('DA.NOTICESERVICE.SAVE', () => {
              this.noticeServiceModel.resetModel();
              loaderChannel.trigger('page:load:complete');
            })
          );
      })
      .catch(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('DA.ACTION.FILEUPLOAD', () => {
          this.noticeServiceModel.resetModel();
          Backbone.history.navigate('update/notice/service', {trigger: true});
        })(err);
      });
  },

  uploadNoticeServiceFiles() {
    this.fileUploader = filesChannel.request('create:uploader', {
      file_description: this.proofDisputeEvidenceModel.get('file_description'),
      files: this.serviceFileCollection
    }).render();

    return this.fileUploader.uploadAddedFiles();
  },

  validateAndShowErrors() {
    this.hideEmptyFilesError();

    const regionsToValidate = ['noticeServiceserviceMethodRegion', 'noticeServiceserviceDateRegion', 'noticeServiceCommentRegion'];
    let is_valid = true;

    regionsToValidate.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    });

    if (this.serviceFileCollection.isEmpty()) {
      this.showEmptyFilesError();
      is_valid = false;
    }
    return is_valid;
  },


  saveInternalDataToModel() {
    const proofFileDescriptionId = this.proofDisputeEvidenceModel.get('file_description').id;
    this.noticeServiceModel.set(Object.assign(
        // Always set to Served and service type Served
        { is_served: true, service_date_used: this.SERVICE_DATE_USED_SERVED },
        proofFileDescriptionId ? { proof_file_description_id: proofFileDescriptionId } : {},
        this.noticeDeliveryDropDownModel.getPageApiDataAttrs(),
        this.noticeDeliveryDateInputModel.getPageApiDataAttrs(),
        this.serviceCommentTextareaModel.getPageApiDataAttrs()
      )
    );
  },

  checkAndUpdateDisputeStatus() {
    const unservedNoticeServices = this.noticeServiceModel.getParentNoticeModel().getUnservedServices();
    const dfd = $.Deferred();
    
    // If any notices services are still un-served, then don't change status
    if (!_.isEmpty(unservedNoticeServices)) {
      return dfd.resolve().promise();
    }

    // Else if all notice services served, set dispute stage:status to 6:61
    const externalSaveStatusModel = new ExternalDisputeStatusModel({
      file_number: disputeChannel.request('get:filenumber')
    });

    const statusSaveAttrs = { dispute_stage: 6, dispute_status: 61 };
    externalSaveStatusModel.save(statusSaveAttrs)
      .done(() => {
        const dispute = disputeChannel.request('get');
        dispute.set('status', _.extend(dispute._getStatusObj(), statusSaveAttrs));
        dfd.resolve();
      }).fail(
        generalErrorFactory.createHandler('DA.STATUS.SAVE', () => dfd.reject())
      );
    
    return dfd.promise();
  },

  initialize() {
    this.SERVICE_FILES_MAX = configChannel.request('get', 'SERVICE_FILES_MAX');
    this.ALL_SERVICE_METHODS = configChannel.request('get', 'ALL_SERVICE_METHODS');
    this.SERVICE_DATE_USED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_SERVED');

    this.TENANT_ALLOWED_NOTICE_METHOD_CODES = (configChannel.request('get:issue', 237) || {}).allowedNoticeMethodCodes || [];

    this.noticeServiceModel = this.model.get('noticeServiceToEdit');
    this.participant = participantsChannel.request('get:participant', this.noticeServiceModel.get('participant_id'));

    this._participantBeingServedIsLandlord = participantsChannel.request('is:landlord', this.participant);

    this.createSubModels();
    this.setupListeners();

    const fileDescription = this.noticeServiceModel.getServiceFileDescription();
    this.hasExistingFiles = fileDescription && fileDescription.getUploadedFiles().length;


    // Note: We should never have an existing file description.  Check to make sure
    const previousProofFileDescription = this.noticeServiceModel.getServiceFileDescription();
    if (previousProofFileDescription && !previousProofFileDescription.isNew()) {
      console.log(`[Warning] Previous proof file description exists!`);
    }
  },

  createSubModels() {
    const dispute = disputeChannel.request('get');
    // Create a new file description.  This will only be saved to the API on save
    this.proofDisputeEvidenceModel = new DisputeEvidenceModel({
      file_description: this.noticeServiceModel.createNoticeServiceFileDescription()
    });
    this.serviceFileCollection = this.proofDisputeEvidenceModel.get('files');

    this.noticeDeliveryDropDownModel = new DropdownModel({
      optionData: dispute.isTenant() && !_.isEmpty(this.TENANT_ALLOWED_NOTICE_METHOD_CODES) ?
        Formatter.getNoticeDeliveryMethodsFromCodeList(this.TENANT_ALLOWED_NOTICE_METHOD_CODES) :
        Formatter.getClaimDeliveryMethods(),
      labelText: 'Notice Service Method',
      defaultBlank: true,
      required: true,
      value: null,
      apiMapping: 'service_method',
    });

    this.noticeDeliveryDateInputModel = new InputModel({
      labelText: 'Date Delivered or Provided',
      inputType: 'date',
      errorMessage: 'Please enter a date',
      required: true,
      value: null,
      apiMapping: 'service_date'
    });

    this.serviceCommentTextareaModel = new TextareaModel({
      labelText: 'Service Comment',
      required: true,
      errorMessage: 'Please enter a service comment',
      countdown: true,
      min: configChannel.request('get', 'SERVICE_COMMENT_MIN_LENGTH'),
      max: configChannel.request('get', 'SERVICE_COMMENT_MAX_LENGTH'),
      value: null,
      apiMapping: 'service_comment'
    });
  },

  setupListeners() {
    this.listenTo(this.noticeDeliveryDropDownModel, 'change:value', function(model, value) {
      const isOtherSelected = value && String(value) === String(this.ALL_SERVICE_METHODS.OTHER);
      this.serviceCommentTextareaModel.set('required', isOtherSelected);
      this.showChildView('noticeServiceCommentRegion', new TextareaView({ model: this.serviceCommentTextareaModel }));
    }, this);

    this.listenTo(this.serviceFileCollection, 'update reset', this.hideEmptyFilesError, this);
  },

  showEmptyFilesError() {
    this.getUI('filesError').text('Please add at least one notice service file');
  },

  hideEmptyFilesError() {
    this.getUI('filesError').text('');
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    this.showChildView('noticeServiceserviceMethodRegion', new DropdownView({ model: this.noticeDeliveryDropDownModel }));
    this.showChildView('noticeServiceserviceDateRegion', new InputView({ model: this.noticeDeliveryDateInputModel }));
    this.showChildView('noticeServiceCommentRegion', new TextareaView({ model: this.serviceCommentTextareaModel }));
    this.showChildView('filesDisplayRegion', new FilesView({ collection: this.serviceFileCollection, hideUploaded: true }));

    ViewMixin.prototype.initializeHelp(this, this._participantBeingServedIsLandlord ? TENANT_UPLOAD_HELP : LANDLORD_UPLOAD_HELP);
  },

  renderPageForUpload() {
    this.getUI('serviceContainer').addClass('upload');
  },


  templateContext() {
    return {
      participant: this.participant,
      participant_label: this._participantBeingServedIsLandlord ? 'Landlord' : 'Tenant'
    };
  }
});
