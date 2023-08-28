import React from 'react';
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
import ServiceConfirmIcon from '../../../core/static/Icon_Notice_Confirm.png';
import ServiceRefutedIcon from '../../../core/static/Icon_Notice_Refute.png';
import ExternalNoticeServiceModel from '../../components/external-api/ExternalNoticeService_model';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import PageItem from '../../../core/components/page/PageItem';
import Formatter from '../../../core/components/formatter/Formatter';
import QuestionView from '../../../core/components/question/Question';
import QuestionModel from '../../../core/components/question/Question_model';
import ViewMixin from '../../../core/utilities/ViewMixin';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import AddressValidationHandler from '../../../core/components/address/AddressValidationHandler';

const DROPDOWN_CODE_NO = 0;
const DROPDOWN_CODE_YES = 1;

const RADIO_CODE_REGISTERED_MAIL = 1
const RADIO_CODE_XPRESSPOST = 2;

const VALID_CANADA_POST_TRACKING_NUMBER_LENGTH = 13;
const VALID_CANADA_POST_XPRESS_POST_NUMBER_LENGTH = 16;
const TRACKING_NUMBER_LENGTH_NOT_VALID = 'Invalid Canada Post tracking ID - these have the format RN123456789CA';
const XPRESS_POST_NUMBER_LENGTH_NOT_VALID = 'Invalid XpressPost tracking ID - these must be 16 characters long';
const TRACKING_NUMBER_NOT_VALID = 'Invalid Canada Post tracking ID - cannot continue until tracking number has been verified';
const TRACKING_NUMBER_INPUT_ERROR_CLASS = '.da-notice-service-tracking-number .error-block'

const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

const SubmitNoticeServicePage = PageView.extend({
  className: `${PageView.prototype.className} da-modify-notice-service-page`,

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['pageTitle', 'formTypeText', 'noticeServiceDeadline', 'serviceListRoute', 'serviceReceiptRoute', 'maxDeliveryDate']);
    this.SERVICE_FILES_MAX = configChannel.request('get', 'SERVICE_FILES_MAX');
    this.ALL_SERVICE_METHODS = configChannel.request('get', 'ALL_SERVICE_METHODS');
    this.SERVICE_DATE_USED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_SERVED');
    const dispute = disputeChannel.request('get');
    this.isNonParticipatory = dispute.isNonParticipatory();

    this.isLoadingTracking = false;
    this.TENANT_ALLOWED_NOTICE_METHOD_CODES = ["REGISTERED_MAIL", "IN_PERSON", "OTHER", "EMAIL"];

    this.noticeServiceModel = this.model.get('noticeServiceToEdit');
    this.participant = participantsChannel.request('get:participant', this.noticeServiceModel.get('participant_id'));

    this.participantBeingServedIsLandlord = participantsChannel.request('is:landlord', this.participant);
    this.formTypeText = this.formTypeText || this.getFormTypeText();

    this.createSubModels();
    this.setupListeners();

    const mainFileDescription = this.noticeServiceModel.getServiceFileDescription();
    const otherFileDescription = this.noticeServiceModel.getOtherServiceFileDescription();
    this.hasExistingFiles = mainFileDescription && mainFileDescription.getUploadedFiles().length;
    this.hasOtherProofExistingFiles = otherFileDescription && otherFileDescription.getUploadedFiles().length;

    // Note: We should never have an existing file description. Check to make sure
    if ((mainFileDescription && !mainFileDescription.isNew()) || (otherFileDescription && !otherFileDescription.isNew())) {
      console.log(`[Warning] Previous proof file description exists!`);
    }
  },

  createSubModels() {
    // Create a new file description.  This will only be saved to the API on save
    this.proofDisputeEvidenceModel = new DisputeEvidenceModel({ file_description: this.noticeServiceModel.createServiceFileDescription() });
    this.otherProofDisputeEvidenceModel = new DisputeEvidenceModel({ file_description: this.noticeServiceModel.createOtherServiceFileDescription() });
    this.serviceFileCollection = this.proofDisputeEvidenceModel.get('files');
    this.otherServiceFileCollection = this.otherProofDisputeEvidenceModel.get('files');

    this.noticeDeliveryDropDownModel = new DropdownModel({
      optionData: this.getNoticeDeliveryDefaultOptions(),
      defaultBlank: true,
      required: true,
      value: null,
      apiMapping: 'service_method',
    });

    this.noticeDeliveryDateInputModel = new InputModel({
      inputType: 'date',
      errorMessage: 'Please enter a date',
      required: true,
      value: null,
      maxDate: this.maxDeliveryDate ? Moment(this.maxDeliveryDate) : Moment(),
      apiMapping: 'service_date'
    });

    this.emailAddressInputModel = new InputModel({
      inputType: 'email',
      errorMessage: 'Please enter an email',
      required: true,
      value: null,
    }); 

    this.questionOneModel = new QuestionModel({
      optionData: [{ name: 'da-notice-service__q1-no', value: 0, cssClass: 'option-button dac__yes-no', text: 'NO'},
      { name: 'da-notice-service__q1-yes', value: 1, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      question_answer: null
    });

    this.questionTwoModel = new QuestionModel({
      optionData: [{ name: 'da-notice-service__q2-no', value: 0, cssClass: 'option-button dac__yes-no', text: 'NO'},
      { name: 'da-notice-service__q2-yes', value: 1, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      question_answer: null
    });

    this.serviceDescriptionTextareaModel = new TextareaModel({
      required: true,
      errorMessage: 'Please enter a service description',
      countdown: true,
      min: configChannel.request('get', 'SERVICE_COMMENT_MIN_LENGTH'),
      max: configChannel.request('get', 'SERVICE_COMMENT_MAX_LENGTH'),
      value: null,
      apiMapping: 'service_description'
    });

    this.trackingNumberModel = new InputModel({
      inputType: 'string',
      errorMessage: 'Please enter a valid Canada Post tracking ID in the format RN123456789CA',
      required: true,
      maxLength: VALID_CANADA_POST_TRACKING_NUMBER_LENGTH,
      showValidate: true,
      value: null,
    });

    this.mailTypeModel = new RadioModel({
      optionData: [
        { value: RADIO_CODE_REGISTERED_MAIL, text:  'Registered Mail (13 digit tracking number ending in CA)' },
        { value: RADIO_CODE_XPRESSPOST, text: 'Xpresspost (16 digit tracking number)' }
      ],
      required: false,
      value: null
    });
  },

  setupListeners() {
    this.listenTo(this.questionOneModel, 'page:itemComplete', () => {
      const preAgreedEmailCode = String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL);
      if (this.noticeDeliveryDropDownModel.getData() === preAgreedEmailCode) this.noticeDeliveryDropDownModel.set({ value: null });
      this.emailAddressInputModel.set({ value: null });

      if (this.questionOneModel.getData() === DROPDOWN_CODE_NO) {
        const optionData = this.noticeDeliveryDropDownModel.get('optionData');
        const removedPreAgreedEmailOptions = optionData.filter(option => {
          return option.value !== preAgreedEmailCode;
        });
  
        this.noticeDeliveryDropDownModel.set({ optionData: removedPreAgreedEmailOptions });
      } else {
        this.noticeDeliveryDropDownModel.set({ optionData: this.getNoticeDeliveryDefaultOptions() });
      }

      this.render();
    });

    this.listenTo(this.questionTwoModel, 'page:itemComplete', () => {
      this.serviceDescriptionTextareaModel.set({ value: null });
      this.otherServiceFileCollection.resetCollection();
      this.render();
    });

    this.listenTo(this.noticeDeliveryDropDownModel, 'change:value', (model, value) => {
      const isRegisteredMailMethodSelected = value === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL);
      this.emailAddressInputModel.set({ value: null });
      this.trackingNumberModel.set({ value: null });
      if (isRegisteredMailMethodSelected) {
        this.mailTypeModel.set({ required: true });
      } else {
        this.mailTypeModel.set({ required: false });
      }
      this.render();
    });

    this.listenTo(this.serviceFileCollection, 'update reset', this.hideEmptyFilesError, this);
    this.listenTo(this.otherServiceFileCollection, 'update reset', this.hideEmptyFilesError, this);
    this.listenTo(this.mailTypeModel, 'change:value', (model, value) => {
      this.cpTrackingData = null;
      this.trackingNumberModel.set({ value: null });

      if (value === RADIO_CODE_REGISTERED_MAIL) {
        this.trackingNumberModel.set({ maxLength: VALID_CANADA_POST_TRACKING_NUMBER_LENGTH });
      } else if (value === RADIO_CODE_XPRESSPOST) {
        this.trackingNumberModel.set({ maxLength: VALID_CANADA_POST_XPRESS_POST_NUMBER_LENGTH });
      }

      this.render();
    });
    this.listenTo(this.trackingNumberModel, 'page:itemComplete', () => this.clickValidateTrackingNumber());
  },

  clickCancelNoticeServiceUpdate() {
    Backbone.history.navigate(this.serviceListRoute || 'notice/service/list', { trigger: true });
  },

  clickAddFile(options={}) {
    this.showAddFilesModal(options);
  },

  clickAddOther() {
    this.clickAddFile({ uploadOtherProof: true });
  },

  async clickValidateTrackingNumber() {
    if (this.isLoadingTracking) return;
    this.resetSavedCPTrackingInfoAndRender();
    const trackingNumberView = this.getChildView('trackingNumberRegion');
    if (!trackingNumberView?.validateAndShowErrors()) return;
    if (this.trackingNumberModel.getData()?.length !== VALID_CANADA_POST_TRACKING_NUMBER_LENGTH && this.mailTypeModel.getData() === RADIO_CODE_REGISTERED_MAIL) {
      $(TRACKING_NUMBER_INPUT_ERROR_CLASS).text(TRACKING_NUMBER_LENGTH_NOT_VALID);
      return;
    }
    if (this.trackingNumberModel.getData()?.length !== VALID_CANADA_POST_XPRESS_POST_NUMBER_LENGTH && this.mailTypeModel.getData() === RADIO_CODE_XPRESSPOST) {
      $(TRACKING_NUMBER_INPUT_ERROR_CLASS).text(XPRESS_POST_NUMBER_LENGTH_NOT_VALID);
      return;
    }
    
    loaderChannel.trigger('page:load');
    this.cpTrackingData = await this.validateTrackingNumber();
    loaderChannel.trigger('page:load:complete');
    this.render();
  },

  validateTrackingNumber() {
    const trackingCode = this.trackingNumberModel.getData();
    return AddressValidationHandler.validateCPTrackingNumber(trackingCode)
      .catch(() => this.resetSavedCPTrackingInfoAndRender())
      .finally(() => this.isLoadingTracking = false);
  },

  getFormTypeText() {
    if (this.isNonParticipatory) {
      return this.participantBeingServedIsLandlord ? 'RTB-50' : 'RTB-44';
    } else {
      return 'RTB-55';
    }
  },

  getNoticeDeliveryDefaultOptions() {
    const dispute = disputeChannel.request('get');
    const daNoticeDeliveryOptions = Formatter.getServiceDeliveryMethods()?.map(item => Number(item.value));
    const allDeliveryOptions = (dispute.isTenant() && !_.isEmpty(this.TENANT_ALLOWED_NOTICE_METHOD_CODES) ?
    Formatter.getNoticeDeliveryMethodsFromCodeList(this.TENANT_ALLOWED_NOTICE_METHOD_CODES) :
    Formatter.getClaimDeliveryMethods());
    return allDeliveryOptions?.filter(option => daNoticeDeliveryOptions.includes(Number(option.value)));
  },

  resetSavedCPTrackingInfoAndRender() {
    if (!this.mailTypeModel.getData()) return;
    this.cpTrackingData = null;
    this.render();
  },

  showAddFilesModal(options={}) {
    // Copy files into a new collection so no events are triggered on the old collection
    const originalFileModels = (options.uploadOtherProof ? this.otherServiceFileCollection.getReadyToUpload() : this.serviceFileCollection.getReadyToUpload()) || [];
    originalFileModels.forEach(fileModel => {
      if (fileModel.collection) {
        fileModel.collection.remove(fileModel, { silent: true });
      }
      
      // Allow renames to happen in the Upload window
      fileModel.set('display_mode', false);
    });

    const participantName = this.participant?.getDisplayName();
    const modalFiles = new FileCollection(originalFileModels);
    const modalAddFiles = new ModalAddFiles({
      model: options.uploadOtherProof ? this.otherProofDisputeEvidenceModel : this.proofDisputeEvidenceModel,
      fileType: configChannel.request('get', 'FILE_TYPE_NOTICE'),
      files: modalFiles,
      title: `Add Service Files${participantName ? ` for ${participantName}` : ''}`,
      hideDescription: true,
      isDescriptionRequired: false,
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
      const serviceFileCollection = options.uploadOtherProof ? this.otherServiceFileCollection : this.serviceFileCollection;
      serviceFileCollection.reset(modelsToResetWith.map(function(file_model) {
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
    
    const createProofDisputeEvidencePromise = () => new Promise((res, rej) => this.proofDisputeEvidenceModel.save().then(res, rej));
    const createOtherProofDisputeEvidencePromise = () => new Promise((res, rej) => this.otherProofDisputeEvidenceModel.save().then(res, rej));

    Promise.all([createProofDisputeEvidencePromise(), createOtherProofDisputeEvidencePromise()])
      .then(this.uploadNoticeServiceFiles.bind(this))
      .then(this.uploadOtherNoticeServiceFiles.bind(this))
      .then(() => {
        this.saveInternalDataToModel();
        const noticeServiceSaveModel = new ExternalNoticeServiceModel(this.noticeServiceModel.toJSON());
        noticeServiceSaveModel.save(this.noticeServiceModel.getApiChangesOnly())
          .done(() => {
            this.checkAndUpdateDisputeStatus()
              .always(() => {
                this.noticeServiceModel.set(noticeServiceSaveModel.toJSON());
                this.model.setReceiptData({
                  noticeServiceModel: this.noticeServiceModel,
                  submittedNoticeFiles: new FileCollection(this.serviceFileCollection.toJSON().concat(this.otherServiceFileCollection.toJSON())),
                  submittedEmailAddress: this.emailAddressInputModel.getData(),
                  trackingNumber: this.trackingNumberModel.getData()
                });
                this.model.set('routingReceiptMode', true);
                Backbone.history.navigate(this.serviceReceiptRoute || 'notice/service/receipt', { trigger: true });
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
          Backbone.history.navigate(this.serviceListRoute || 'notice/service/list', {trigger: true});
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

  uploadOtherNoticeServiceFiles() {
    this.otherFileUploader = filesChannel.request('create:uploader', {
      file_description: this.otherProofDisputeEvidenceModel.get('file_description'),
      files: this.otherServiceFileCollection
    }).render();

    return this.otherFileUploader.uploadAddedFiles();
  },

  validateAndShowErrors() {
    this.hideEmptyFilesError();

    const isRegisteredMailMethodSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL);
    const isEmailMethodSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL);
    const regionsToValidate = ['noticeQuestionOneRegion', 'noticeServiceMethodRegion', 'noticeServiceDateRegion', 'noticeQuestionTwoRegion'];

    if (this.isServiceDescriptionRequired() || this.serviceDescriptionTextareaModel.getData()) regionsToValidate.push('noticeServiceDescriptionRegion');
    if (isEmailMethodSelected) regionsToValidate.push('noticeServiceEmailRegion');
    if (isRegisteredMailMethodSelected) regionsToValidate.push('mailTypeRegion');
    if (isRegisteredMailMethodSelected && this.mailTypeModel.getData()) regionsToValidate.push('trackingNumberRegion');

    let isValid = true;

    regionsToValidate.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    if (this.serviceFileCollection.isEmpty() && this.requiredMainProofCheck()) {
      this.showEmptyFilesError();
      isValid = false;
    }

    if (isRegisteredMailMethodSelected && AddressValidationHandler.hasError(this.cpTrackingData)) {
      this.resetSavedCPTrackingInfoAndRender();
      $(TRACKING_NUMBER_INPUT_ERROR_CLASS).text(TRACKING_NUMBER_NOT_VALID);
      isValid = false;
    }

    if (this.trackingNumberModel.getData()?.length !== VALID_CANADA_POST_TRACKING_NUMBER_LENGTH && this.mailTypeModel.getData() === RADIO_CODE_REGISTERED_MAIL) {
      this.resetSavedCPTrackingInfoAndRender();
      $(TRACKING_NUMBER_INPUT_ERROR_CLASS).text(TRACKING_NUMBER_LENGTH_NOT_VALID);
      return;
    }
    if (this.trackingNumberModel.getData()?.length !== VALID_CANADA_POST_XPRESS_POST_NUMBER_LENGTH && this.mailTypeModel.getData() === RADIO_CODE_XPRESSPOST) {
      this.resetSavedCPTrackingInfoAndRender();
      $(TRACKING_NUMBER_INPUT_ERROR_CLASS).text(XPRESS_POST_NUMBER_LENGTH_NOT_VALID);
      return;
    }

    if (this.noticeServiceDeadline && Moment(this.noticeServiceDeadline).isValid() && Moment(this.noticeServiceDeadline).isBefore(this.noticeDeliveryDateInputModel.getData())) {
      this.getChildView('noticeServiceDateRegion')?.showErrorMessage(
        `You must have served prior to your service declaration deadline of ${Formatter.toFullDateAndTimeDisplay(this.noticeServiceDeadline)}`
      );
      isValid = false;
    }

    return isValid;
  },

  requiredMainProofCheck() {
    const isPostedOnDoorServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.ON_DOOR);
    
    if (isPostedOnDoorServiceSelected && !this.isNonParticipatory) return false;
    if (!this.isNonParticipatory) return false;

    return true;
  },

  setServiceDescription() {
    const isPreAgreedEmailServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL);
    const isRegisteredMailServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL);

    if (isPreAgreedEmailServiceSelected) {
      this.serviceDescriptionTextareaModel.set({
        value: `Service to: ${this.emailAddressInputModel.getData()} ${this.serviceDescriptionTextareaModel.getData() || ''}`
      });
    } else if (isRegisteredMailServiceSelected) {
      this.serviceDescriptionTextareaModel.set({
        value: `${AddressValidationHandler.getTrackingDisplay(this.cpTrackingData)} ${this.serviceDescriptionTextareaModel.getData() || ''}`
      });
    }
  },

  saveInternalDataToModel() {
    this.setServiceDescription();
    const proofFileDescriptionId = this.proofDisputeEvidenceModel.get('file_description').id;
    const otherProofFileDescriptionId = this.otherProofDisputeEvidenceModel.get('file_description').id;
    const participantId = disputeChannel.request('get').get('tokenParticipantId');
    this.noticeServiceModel.set(Object.assign(
        // Always set to Served and service type Served
        { is_served: true, service_date_used: this.SERVICE_DATE_USED_SERVED },
        { served_by: participantId },
        proofFileDescriptionId ? { proof_file_description_id: proofFileDescriptionId } : {},
        otherProofFileDescriptionId ? { other_proof_file_description_id: otherProofFileDescriptionId } : {},
        this.cpTrackingData && !AddressValidationHandler.hasError(this.cpTrackingData) && AddressValidationHandler.isDelivered(this.cpTrackingData) ? { validation_status: configChannel.request('get', 'SERVICE_VALIDATION_EXTERNAL_CONFIRMED') } : {},
        this.noticeDeliveryDropDownModel.getPageApiDataAttrs(),
        this.noticeDeliveryDateInputModel.getPageApiDataAttrs(),
        this.serviceDescriptionTextareaModel.getPageApiDataAttrs()
      )
    );
  },

  checkAndUpdateDisputeStatus() {
    const unservedNoticeServices = this.noticeServiceModel.getParentNoticeModel().getUnservedServices();
    const dfd = $.Deferred();
    const externalSaveStatusModel = new ExternalDisputeStatusModel({ file_number: disputeChannel.request('get:filenumber') });
    let dispute = disputeChannel.request('get');
    let statusSaveAttrs = {}
    
    if (dispute.checkProcess(1) && !dispute.checkStageStatus(6, 60)) {
      statusSaveAttrs = { dispute_stage: 6, dispute_status: 60 };
    } else if (dispute.checkProcess(2) && !unservedNoticeServices?.length) {
      statusSaveAttrs = { dispute_stage: 6, dispute_status: 61 };
    } else {
      dfd.resolve();
    }

    if (statusSaveAttrs?.dispute_stage) {
      externalSaveStatusModel.save(statusSaveAttrs)
        .done(() => {
          dispute = disputeChannel.request('get');
          dispute.set('status', _.extend(dispute._getStatusObj(), statusSaveAttrs));
          dfd.resolve();
        }).fail(generalErrorFactory.createHandler('DA.STATUS.SAVE', () => dfd.reject()));
    }

    return dfd.promise();
  },

  getServiceTypeText() {
    return configChannel.request('get', 'SERVICE_METHOD_DISPLAYS')?.[this.noticeDeliveryDropDownModel.getData()] || '';
  },

  getAdditionalServiceTitle() {
    const isPostedOnDoorServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.ON_DOOR);
    const isInPersonServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.IN_PERSON);
    const isOtherServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.OTHER);
    const isPreAgreedEmailServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL);
    const isRegisteredMailMethodSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL);
    // const describeText = isOtherServiceSelected ? 'Describe the methods you used to serve this respondent' : 'Describe how you served this respondent';
    if (isPostedOnDoorServiceSelected) return `Describe how you served this respondent by attaching to their door${this.questionTwoModel.getData() === DROPDOWN_CODE_NO ? ' (optional)' : ', and any additional service methods used'}`;
    else if (isInPersonServiceSelected) return `Describe how you served this respondent in person${this.questionTwoModel.getData() === DROPDOWN_CODE_NO ? ' (optional)' : ', and any additional service methods used'}`;
    else if (isOtherServiceSelected) return `Describe the methods you used to serve this respondent by another method${this.questionTwoModel.getData() === DROPDOWN_CODE_NO ? '' : ', and any additional service methods used'}`
    else if (isPreAgreedEmailServiceSelected) return `Describe how you served this respondent by email${this.questionTwoModel.getData() === DROPDOWN_CODE_NO ? ' (optional)' : ', and any additional service methods used'}`;
    else if (isRegisteredMailMethodSelected) return `Describe how you served this respondent by registered mail${this.questionTwoModel.getData() === DROPDOWN_CODE_NO ? ' (optional)' : ', and any additional service methods used'}`
    else return 'Describe how you served this respondent'
  },

  getUploadMainProofTitle() {
    const isInPersonServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.IN_PERSON);
    const isRegisteredMailServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL);
    const isPostedOnDoorServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.ON_DOOR);
    const isPreAgreedEmailServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL);
    const isOtherServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.OTHER);
    const formText = this.formTypeText;

    if (this.isNonParticipatory) {
      if (isInPersonServiceSelected) return `${formText}: Proof of Service Form`;
      else if (isRegisteredMailServiceSelected) return `${formText}: Proof of Service Form and registered mail receipt`;
      else if (isPostedOnDoorServiceSelected) return `${formText}: Proof of Service Form`;
      else if (isPreAgreedEmailServiceSelected) return `${formText}: Proof of Service Form, proof of pre-agreed e-mail and copy of outgoing e-mail`;
      else if (isOtherServiceSelected) return `${formText}: Proof of service Form, copy of Substituted Service Decision and proof you served the notice of dispute as directed in the Decision`;
    } else {
      if (isInPersonServiceSelected) return `(optional) ${formText}: Proof of Service Form`;
      else if (isRegisteredMailServiceSelected) return `(optional) ${formText}: Proof of Service Form and registered mail receipt`;
      else if (isPostedOnDoorServiceSelected) return `(optional) ${formText}: Proof of Service Form`;
      else if (isPreAgreedEmailServiceSelected) return `(optional) ${formText}: Proof of Service Form, proof of pre-agreed e-mail and copy of outgoing e-mail`;
      else if (isOtherServiceSelected) return `(optional) ${formText}: Proof of service Form, copy of Substituted Service Decision and proof you served the notice of dispute as directed in the Decision`;
    }
    
    return '';
  },

  getMainServiceUploadInstructionText() {
    const participant = this.participant;
    const participantLabel = this.participantBeingServedIsLandlord ? 'Landlord' : 'Tenant';
    const mainTextBlock = this.isNonParticipatory ? 
      `Upload completed ${this.formTypeText} form to prove that you served <b>${participantLabel}</b>:&nbsp;<b>${participant.getInitialsDisplay() }</b>` :
      `You may upload proof that you served <b>${participantLabel}</b>:&nbsp;<b>${participant.getInitialsDisplay() }</b>`;
    if (this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.OTHER)) {
      return `${mainTextBlock} by an approved method as directed in a Substituted Service Decision.`
    } 

    return  `${mainTextBlock} ${this.getServiceTypeText()}`;
    
  },

  isServiceDescriptionRequired() {
    const isPostedOnDoorServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.ON_DOOR);
    const isInPersonServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.IN_PERSON);
    const isOtherServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.OTHER);
    const isPreAgreedEmailServiceSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL);
    const isRegisteredMailMethodSelected = this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL);

    return (
      ((isPostedOnDoorServiceSelected || isInPersonServiceSelected || isPreAgreedEmailServiceSelected || isRegisteredMailMethodSelected) && this.questionTwoModel.getData() === DROPDOWN_CODE_YES)
      || isOtherServiceSelected
      )
  },
  

  showEmptyFilesError() {
    this.getUI('filesError').text('Please add at least one notice service file');
  },

  hideEmptyFilesError() {
    this.getUI('filesError').text('');
  },

  onRender() {
    const participant = this.participant;
    const participantLabel = this.participantBeingServedIsLandlord ? 'Landlord' : 'Tenant';

    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));

    this.showChildView('noticeQuestionOneRegion', new PageItem({
      stepText: `Do you have a written agreement with respondent <b>${participantLabel} ${participant.getInitialsDisplay()}</b> to serve documents by email?`,
      helpHtml: `You can only serve documents by email if that respondent gave an email address specifically for service. 
      Visit the <a class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution">Residential Tenancy Branch</a> website to learn more about service rules, or
      <a class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">contact us</a> before submitting this application.`,
      subView: new QuestionView({ model: this.questionOneModel }),
      forceVisible: true,
    }));

    if (this.questionOneModel.getData() === null) return;
    
    this.showChildView('noticeServiceMethodRegion', new PageItem({
      stepText: `What method did you use to serve the Notice of Dispute to&nbsp;<b>${participantLabel} ${participant.getInitialsDisplay()}</b>?`,
      helpHtml: '',
      subView: new DropdownView({ model: this.noticeDeliveryDropDownModel }),
      forceVisible: true
    }));

    if (this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.EMAIL) && this.questionOneModel.getData()) {
      this.showChildView('noticeServiceEmailRegion', new PageItem({
        stepText: `What email address did you send to for serving <b>${participantLabel}</b>:&nbsp;<b>${participant.getInitialsDisplay()}</b>?`,
        subView: new InputView({ model: this.emailAddressInputModel }),
        forceVisible: true
      }));
    }

    this.showChildView('noticeServiceDateRegion', new PageItem({
      stepText: `When was the Notice of Dispute Resolution Proceeding served to <b>${participantLabel} ${participant.getInitialsDisplay()}</b>?`,
      helpHtml: '',
      subView: new InputView({ model: this.noticeDeliveryDateInputModel }),
      forceVisible: true
    }));

    this.showChildView('serviceProofUploadDisplayRegion', new PageItem({
      stepText: this.getMainServiceUploadInstructionText(),
      helpHtml: `You ${this.isNonParticipatory ? 'must' : 'may'} upload your ${this.formTypeText}: Proof of Service Notice of Dispute Resolution Proceeding Package. You may have to submit additional proof depending on your method of service. You may upload multiple files to the Add files selection below.`,
      subView: new FilesView({ collection: this.serviceFileCollection, hideUploaded: true }),
      forceVisible: true
    }));

    if (this.noticeDeliveryDropDownModel.getData() === String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL)) {
      
      this.showChildView('mailTypeRegion', new PageItem({
        stepText: 'What Canada Post serivce did you use?',
        helpHtml: '',
        subView: new RadioView({ model: this.mailTypeModel }),
        forceVisible: true
      }))
      
      if (this.mailTypeModel.getData()) {
        this.showChildView('trackingNumberRegion', new PageItem({
          stepText: `Enter your Canada Post tracking number and press 'Accept' to validate it. `,
          helpHtml: '',
          subView: new InputView({ model: this.trackingNumberModel }),
          forceVisible: true,
        }));
      }
    }

    this.showChildView('noticeQuestionTwoRegion', new PageItem({
      stepText: `Did you serve <b>${ participantLabel}</b>:&nbsp;Initials&nbsp;<b>${participant.getInitialsDisplay() }</b> using more than one method?`,
      helpHtml: '',
      subView: new QuestionView({ model: this.questionTwoModel }),
      forceVisible: true,
    }));

    if (this.questionTwoModel.getData() !== null) {
      this.showChildView('noticeServiceDescriptionRegion', new PageItem({
        stepText: `${this.getAdditionalServiceTitle()}`,
        helpHtml: '',
        subView: new TextareaView({ model: this.serviceDescriptionTextareaModel }),
        forceVisible: true
      }));
    }

    if (this.questionTwoModel.getData() === DROPDOWN_CODE_YES) {
      this.showChildView('otherProofUploadRegion', new PageItem({
        stepText: `Upload proof that you served <b>${ participantLabel}</b>:&nbsp;Initials&nbsp;<b>${participant.getInitialsDisplay() }</b> by additional service methods.`,
        helpHtml: '',
        subView: new FilesView({ collection: this.otherServiceFileCollection, hideUploaded: true }),
        forceVisible: true
      }));
    }


  },

  regions: {
    disputeRegion: '.dac__service__dispute-overview',
    noticeQuestionOneRegion: '.da-notice-service__q1',
    noticeQuestionTwoRegion: '.da-notice-service__q2',
    noticeServiceMethodRegion: '.da-notice-service-method',
    noticeServiceEmailRegion: '.da-notice-service-email',
    noticeServiceDateRegion: '.da-notice-service-delivered-date',
    noticeServiceDescriptionRegion: '.da-notice-service-comment',
    serviceProofUploadDisplayRegion: '.da-notice-service-files',
    mailTypeRegion: '.da-notice-service-mail-type',
    trackingNumberRegion: '.da-notice-service-tracking-number',
    otherProofUploadRegion: '.da-notice-service-other-upload'
  },

  ui: {
    serviceContainer: '.da-modify-notice-service-container',
    updateNoticeServiceBtn: '.btn-update-notice-service',
    cancelNoticeServiceUpdateBtn: '.btn-cancel',
    addFilesButton: '.da-upload-add-evidence-button',
    addFilesOtherButton: '.da-upload-add-evidence-button-other',
    filesError: '.main-file-error',
  },

  events: {
    'click @ui.updateNoticeServiceBtn': 'clickSave',
    'click @ui.cancelNoticeServiceUpdateBtn': 'clickCancelNoticeServiceUpdate',
    'click @ui.addFilesButton': 'clickAddFile',
    'click @ui.addFilesOtherButton': 'clickAddOther',
  },

  template() {
    const participant = this.participant;
    const participantLabel = this.participantBeingServedIsLandlord ? 'Landlord' : 'Tenant';

    return (
      <>
        <div className="dac__service__dispute-overview"></div>
        <div className="dac__page-header-container">
          <div className="dac__page-header">
            <span className="dac__page-header__icon dac__icons__menu__service"></span>
            <span className="dac__page-header__title">{this.pageTitle || `Record service of dispute notice`}</span>
          </div>
        </div>
        <div className="dac__page-header__instructions">
          <div className="step-description">Adding service information for:</div>
          <div className="add-service-info-for-container">
            <div className="notice-service-initials-icon"></div>
            <div className="da-notice-tenant-initials-access-code-container">
              <div className="da-notice-service-modify-initials"><b>{ participantLabel}</b>:&nbsp;Initials&nbsp;<b>{participant.getInitialsDisplay() }</b></div>
              <div className="da-notice-service-modify-access-code">(Access Code&nbsp;{ participant.get('access_code') })</div>
            </div>
          </div>
        </div>

        <div className="spacer-block-30"></div>
        <div className="da-notice-service__q1"></div>
        <div className="da-notice-service-method"></div>
        <div className="da-notice-service-email"></div>
        {this.renderJsxServiceTrackingNumber()}

        <div className="da-notice-service-delivered-date"></div>
        { this.questionOneModel.getData() !== null ?  
        <div className="da-notice-service-add-files-container">
          <div className="da-notice-service-files"></div>
          <label className="da-upload-add-button da-upload-add-evidence-button">Add files</label>
          <span className="da-notice-service-add-files-text"><b>{this.getUploadMainProofTitle()}</b></span>

          <div className="">
            <p className="error-block main-file-error"></p>
          </div>
        </div>
        : null }
        <div className="da-notice-service__q2"></div>
        <div className="da-notice-service-comment"></div>
        <div className="da-notice-service-add-files-container">
          <div className="da-notice-service-other-upload"></div>
          { this.questionTwoModel.getData() ?
          <>
            <label className="da-upload-add-button da-upload-add-evidence-button-other">Add files</label>
            <span className="da-notice-service-add-files-text"><b>{`Proof of additional service (optional)`}</b></span>
          </>
          : null }
          <div className="">
            <p className="error-block other-file-error"></p>
          </div>
        </div>

        <div className="spacer-block-30"></div>
        <div className="dac__page-buttons hidden-print">
          <button type="button" className="btn btn-lg btn-cancel"><span>Cancel</span></button>
          { this.questionOneModel.getData() !== null ? <button type="button" className="btn btn-lg btn-standard btn-update-notice-service"><span>Submit Service Record</span></button> : null }
        </div>
        <div className="spacer-block-10"></div>
      </>
    );
  },

  renderJsxServiceTrackingNumber() {
    if (this.noticeDeliveryDropDownModel.getData() !== String(configChannel.request('get', 'ALL_SERVICE_METHODS')?.REGISTERED_MAIL)) return;

    const cpTrackingDataDisplay = this.cpTrackingData ? AddressValidationHandler.getTrackingDisplay(this.cpTrackingData) : '';
    const hasError = this.cpTrackingData ? AddressValidationHandler.hasError(this.cpTrackingData) : '';
    const trackingIcon = hasError ? ServiceRefutedIcon : ServiceConfirmIcon;

    return (
      <>
        <div className="da-notice-service-mail-type"></div>
        { this.mailTypeModel.getData() === RADIO_CODE_XPRESSPOST ? <div className="dac__warning error-block warning">For Xpresspost it must require a signature upon delivery to be a valid service method.</div> : null }
        <div className={`da-notice-service-tracking-wrapper${hasError ? '--error' : '--success'}`}>
          <div className="da-notice-service-tracking-number"></div>
          { this.cpTrackingData ? <div className="da-notice-service-tracking-result">
            <img src={trackingIcon} alt=""/>
            <span>&nbsp;{cpTrackingDataDisplay}</span>
          </div> : null }
        </div>
      </>
    )
  },

  renderPageForUpload() {
    this.getUI('serviceContainer').addClass('upload');
  },
});

_.extend(SubmitNoticeServicePage.prototype, ViewJSXMixin);
export default SubmitNoticeServicePage;
