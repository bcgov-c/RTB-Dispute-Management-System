import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import EmailView from '../../../core/components/email/Email';
import AddressModel from '../../../core/components/address/Address_model';
import AddressView from '../../../core/components/address/Address';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import SubstitutedServiceModel from '../../../core/components/substituted-service/SubstitutedService_model';
import UploadEvidenceView from '../../../evidence/pages/upload/UploadEvidence';
import UploadModel from '../../../core/components/upload/UploadMixin_model';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import template from './OfficeSubstitutedServicePage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';
const FORM_EVIDENCE_DESCRIPTION = 'This is the original substituted service application form(s) and supporting evidence';
const FORM_EVIDENCE_MISSING_MSG = 'You must add the substituted service application form to continue';
const FORM_EVIDENCE_HELP = `Upload the main application form, a copy of the decision or order if provided, and any other additional document(s).`;
const FORM_CODE = 72;

const filesChannel = Radio.channel('files');
const taskChannel = Radio.channel('tasks');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');
const noticeChannel = Radio.channel('notice');

const SubServicePageView = PageView.extend({
  template,
  className: `${PageView.prototype.className} office-page-sub-service office-upload-page`,

  ui: {
    // Upload UI items
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',

    formError: '.office-form-evidence-error',
    fieldsContainer: '.office-clarification-input-fields-container',
    cancel: '.btn-cancel',
    submit: '.office-page-clarification-buttons > .btn-continue',

    pageButtons: '.office-page-clarification-buttons',

    evidenceWarningContainer: '.office-page-clarification-date-warning-container',
    correctDocuments: '.office-correct-documents-used',
    documentsDescribed: '.office-documents-described',
    documentsDescribedWrapper: '.office-documents-described-wrapper',
    documentsDescribedError: '.office-documents-described-error'

  },

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    disputeRegion: '.da-access-overview-container',

    firstNameRegion: '.office-new-dispute-first-name',
    lastNameRegion: '.office-new-dispute-last-name',
    emailRegion: '.office-new-dispute-email',
    phoneRegion: '.office-new-dispute-phone',
    packageMethodRegion: '.office-new-dispute-package-method',
    addressRegion: '.office-clarification-address',

    correctDocumentsRegion: '@ui.correctDocuments',
    documentsDescribedRegion: '@ui.documentsDescribed',
    participantBeingServedRegion: '.office-substitute-participant-being-served',
    dateReceivedRegion: '.office-clarification-date-received',
    formCompleteRegion: '.office-substitute-form-complete',
    evidenceProvidedRegion: '.office-substitute-evidence-provided',
    evidenceWarningConfirmationRegion: '.office-page-evidence-provided-warning-dropdown',
    formUsedRegion: '.office-new-dispute-rtb-form-used',
    applicationNoteRegion: '.office-application-note',

    formEvidenceRegion: '.office-page-new-dispute-form-evidence',
  },

  events: {
    'click @ui.cancel': 'mixin_upload_onCancel',
    'click @ui.submit': 'clickSubmit'
  },

  onCancelButtonNoUpload() {
    Backbone.history.navigate('main', { trigger: true });
  },

  clickSubmit() {
    this.hideFormEvidenceError();
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    // Save any application note (if entered) into the file description
    const noteValue = this.applicationNoteModel.getData();
    if (noteValue) {
      this.formEvidenceModel.get('descriptionModel').set('value', `${FORM_EVIDENCE_DESCRIPTION} - APPLICATION NOTE: ${noteValue}`);
      this.formEvidenceModel.saveInternalDataToModel();
    }
    
    this.mixin_upload_transitionToUploadStep()
    .always(() => {
      setTimeout(() => {
        if (this.isCancel) {
          return;
        }
        this.mixin_upload_startUploads();
      }, 1000);
    });
  },


  createParallelTask(subServiceId) {
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const pageApiData = this._getPageApiData();
    const {
      city, country, email, first_name, last_name,
      postal_code, province, street, received_date,
      application_note, package_delivery_method, phone
    } = pageApiData;

    const selectedParticipant = participantsChannel.request('get:participant', this.serviceToParticipantModel.getData({ parse: true }));
    const taskDescription = [
      `A manual ${this.requestName} request was submitted through the office submission site. Office IDIR: ${this.currentUser.getUsername()}, Access Code: ${this.dispute.get('accessCode')}`,
      `Submitter: ${first_name} ${last_name}, Phone: ${phone}, Email: ${email?email:'-'}, Address: ${street} ${city}, ${province}, ${country}, ${postal_code}`,
      ...(selectedParticipant ? [`Request for service of ${this.serviceQuadrant.displayedDocumentList.join(", ")} only to ${this.toParticipantDisplayWithAccessCode(selectedParticipant)}`] : []),
      `RTB documents by ${Formatter.toHearingOptionsByDisplay(package_delivery_method)}`,
      `Date request submitted: ${Formatter.toDateDisplay(received_date)}`,
      `See the dispute view participants to manage the substituted service request`,
      `See the dispute documents for the application files: ${this.formEvidenceModel.getTitle()}`,
      ...(application_note ? [`APPLICATION NOTE: ${application_note}`] : [])
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);
  
    const taskData = {
      task_text: taskDescription,
      dispute_guid: this.dispute.get('dispute_guid'),
      task_activity_type: configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_SUB_SERVICE'),
      task_link_id: subServiceId,
      task_linked_to: configChannel.request('get', 'TASK_LINK_SUB_SERVE')
    };
    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: null,
      docRequestModel: null,
    });
    return taskCreator.submitExternalTask(taskData).catch(generalErrorFactory.createHandler('OS.REQUEST.SUBSERVICE.TASK'));
  },

  createFlag(subServiceId, participantId) {
    const flagAttr = { flag_participant_id: participantId, related_object_id: subServiceId }
    const flag = flagsChannel.request('create:subservice:requested', flagAttr);
    if (!flag) return;
    return Promise.all([flag.save()]);
  },

  createSubstitutedServiceRecordWithLinkedData() {
    const docTypeValue = this.correctDocumentsModel.getData();//this.docTypeDropdownModel.getData();

    const substitutedServiceModel = new SubstitutedServiceModel({
      dispute_guid: this.dispute.id,
      service_by_participant_id: this.participantToUse.id,
      service_to_participant_id: this.serviceToParticipantModel.getData(),
      request_doc_type: docTypeValue === DROPDOWN_CODE_YES ? this.serviceQuadrant.documentId : configChannel.request('get', 'SERVICE_DOC_TYPE_OTHER'),
      request_doc_other_description: null,
      request_method_file_desc_id: this.formEvidenceModel.get('file_description').id,
      request_status: configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_RECEIVED'),
      request_source: configChannel.request('get', 'SUB_SERVICE_REQUEST_SOURCE_OS')
    });

    return substitutedServiceModel.save()
      .then(() => Promise.all([
        this.createFlag(substitutedServiceModel.id, this.serviceToParticipantModel.getData()),
        this.createParallelTask(substitutedServiceModel.id),
      ]))
      .catch(err => new Promise((resolve, reject) => generalErrorFactory.createHandler('OS.REQUEST.SUBSERVICE.CREATE', reject)(err) ));
  },

  _getYesNoDropdownOptions() {
    return [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }];
  },

  _getPageApiData() {
    const pageApiData = {};
    try {
      _.each(this.validateGroup, function(regionName) {
        const view = this.getChildView(regionName);
        if (view) {
          _.extend(pageApiData, view.model.getPageApiDataAttrs());
        }
      }, this);
    } catch (err) {
      return pageApiData;
    }
    return pageApiData;
  },

  generateReceiptData() {
    const uploadedFormFiles = this.formEvidenceModel.getUploadedFiles();
    console.log(uploadedFormFiles);
    
    const pageApiData = this._getPageApiData();
    const {
      city, country, email, first_name, last_name,
      postal_code, province, street, received_date,
      package_delivery_method, phone
    } = pageApiData;
    
    const selectedParticipant = participantsChannel.request('get:participant', this.serviceToParticipantModel.getData({ parse: true }));

    return {
      requestName: this.capitalizedRequestName,
      formTitleDisplay: this.formEvidenceModel.getTitle(),
      formDescriptionDisplay: this.formEvidenceModel.getDescription(),
      disputeInfo: [
        { label: 'File number', value: this.dispute.get('file_number') },
        { label: 'Access code', value: `<b>${this.dispute.get('accessCode')}</b>` },
        { label: 'Access code for', value: this.toParticipantDisplayWithType(this.participantToUse) },
        { label: `${this.capitalizedRequestName} request received`, value: Formatter.toDateDisplay(received_date) }
      ],
      requesterInfo: [
        { label: 'Name', value: `<b>${first_name} ${last_name}</b>` },
        { label: 'Phone number', value: phone },
        { label: 'Email address', value: email ? email : '-' },
        { label: 'Receive RTB documents by', value: Formatter.toHearingOptionsByDisplay(package_delivery_method) },
        { label: 'Address', value: `${street}, ${city}, ${province}, ${country}, ${postal_code}` }
      ],
      substitutedServiceFor: [
        { label: 'Associated Document(s)', value: this.correctDocumentsModel.getData() === DROPDOWN_CODE_NO ? `Other - see paper form for details` : `${this.serviceQuadrant.documentsName} <p>${this.documentListHtml()}</p>` },
        { label: 'Being served to', value: this.toParticipantDisplayWithAccessCode(selectedParticipant) },
      ],
      formInfo: [
        { label: 'File(s) submitted', value: !_.isEmpty(uploadedFormFiles) ? Formatter.toUploadedFilesDisplay(uploadedFormFiles) : '<i>No form files were successfully uploaded at the time of submitting this request.</i>' }
      ]
    };
  },


  initialize() {
    this.requestTitle = 'Submit Request for Substitute Service';
    this.requestName = 'substituted-service';
    this.capitalizedRequestName = 'Substituted Service';
    this.dispute = disputeChannel.request('get');
    this.formCode = FORM_CODE;
    this.formConfig = configChannel.request('get:evidence', this.formCode);
    this.participantToUse = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));;
    this.isUpload = false;
    this.isCancel = false;
    this.noEmail = false;
    this.displayDocumentsDescribed = false;
    this.displayDocumentsDescribedError = false;
    this.serviceQuadrant = noticeChannel.request('get:subservices:quadrant:config', this.dispute.get('tokenParticipantId'));
    this.currentUser = sessionChannel.request('get:user');

    this.noRespondents = !participantsChannel.request('get:respondents').length;

    this.SERVICE_DOC_TYPE_DISPLAY = configChannel.request('get', 'SERVICE_DOC_TYPE_DISPLAY') || {};
    this.SEND_METHOD_EMAIL = String(configChannel.request('get', 'SEND_METHOD_EMAIL'));
    this.ACCESS_CODE_LENGTH = configChannel.request('get', 'ACCESS_CODE_LENGTH');
    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.OS_APPLICATION_NOTE_MIN_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MIN_LENGTH');
    this.OS_APPLICATION_NOTE_MAX_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MAX_LENGTH');

    this.OTHER_DOCTYPE_FIELD_MIN = 10;
    this.OTHER_DOCTYPE_FIELD_MAX = 100;
    
    this.createSubModels();
    this.setupListeners();

    this.validateGroup = [
      'firstNameRegion',
      'lastNameRegion',
      'emailRegion',
      'phoneRegion',
      'packageMethodRegion',
      'addressRegion',
      'correctDocumentsRegion',
      'participantBeingServedRegion',
      'dateReceivedRegion',
      'formUsedRegion',
      'evidenceProvidedRegion',
      'evidenceWarningConfirmationRegion',
      'formCompleteRegion',
      'applicationNoteRegion',
    ];

  },

  _getFormUsedValue() {
    const matches = this.formConfig.title.match(/\((.+?)\)/);
    if (matches) {
      return matches[1];
    } else {
      console.log('[Warning] Unexpected form code');
      return '-';
    }
  },

  _getPackageMethodPickupOptions(configCodesToUse) {
    return (configCodesToUse || []).map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { text: Formatter.toHearingOptionsByDisplay(configValue), value: String(configValue) };
    });
  },

  _getServiceToOptions() {
    if (!this.participantToUse) {
      return [];
    }
    const participantIsApplicant = this.participantToUse.isApplicant();
    const collectionToUse = participantsChannel.request(`get:${participantIsApplicant ? 'respondents' : 'applicants'}`);
    
    return collectionToUse.map(participant => {
      const text = `${this.getLandlordTenantTextDisplay(participant)} - Initials ${participant.getInitialsDisplay()} - Access Code ${participant.get('access_code')}`;
      return { value: participant.id, text };
    });
  },

  _getServiceToLabelText() {
    if (!this.participantToUse) {
      return;
    }

    return `${this.participantToUse.isLandlord() ? 'Tenant' : 'Landlord'} being served`;
  },


  _getDocTypeOptions() {
    return Object.entries(this.SERVICE_DOC_TYPE_DISPLAY).map( ([value, text]) => ({ value, text }) );
  },

  createSubModels() {
    this._createEvidenceModels();
    
    this.firstNameModel = new InputModel({
      allowedCharacters: InputModel.getRegex('person_name__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'First name',
      errorMessage: 'First name is required',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: null,
      apiMapping: 'first_name'
    });

    this.lastNameModel = new InputModel({
      allowedCharacters: InputModel.getRegex('person_name__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'Last name',
      errorMessage: 'Last name is required',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: null,
      apiMapping: 'last_name'
    });

    this.emailModel = new InputModel({
      labelText: 'Email',
      errorMessage: 'Enter the email',
      inputType: 'email',
      cssClass: this.noEmail ? 'optional-input' : null,
      required: !this.noEmail,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: null,
      apiMapping: 'email'
    });

    this.phoneModel = new InputModel({
      inputType: 'phone',
      labelText: 'Primary phone',
      errorMessage: 'Enter the primary phone',
      required: true,
      maxLength: this.PHONE_FIELD_MAX,
      value: null,
      apiMapping: 'phone'
    });

    this.packageMethodModel = new DropdownModel({
      optionData: this._getPackageMethodPickupOptions(['SEND_METHOD_EMAIL', 'SEND_METHOD_PICKUP']),
      labelText: 'Receive RTB documents by',
      required: true,
      defaultBlank: true,
      value: null,
      apiMapping: 'package_delivery_method'
    });

    this.addressModel = new AddressModel({
      required: true,
      apiMapping: {
        street: 'street',
        city: 'city',
        province: 'province',
        country: 'country',
        postalCode: 'postal_code',
      },
      useSubLabel: false,
    });

    this.dateReceivedModel = new InputModel({
      labelText: 'Date received',
      inputType: 'date',
      errorMessage: 'Enter the date',
      required: true,
      minDate: Moment().subtract(configChannel.request('get', 'STAFF_BACKDATE_OFFSET') || 0, 'days'),
      value: Moment().format(InputModel.getDateFormat()),
      apiMapping: 'received_date'
    });

    this.correctDocumentsModel = new DropdownModel({
      optionData: this._getYesNoDropdownOptions(),
      labelText: 'Correct documents?',
      required: true,
      defaultBlank: true,
      value: null
    });

    this.documentsDescribedModel = new DropdownModel({
      optionData: this._getYesNoDropdownOptions(),
      labelText: 'Documents described?',
      required: true,
      defaultBlank: true,
      value: null
    });

    this.serviceToParticipantModel = new DropdownModel({
      optionData: this._getServiceToOptions(),
      labelText: this._getServiceToLabelText(),
      required: true,
      defaultBlank: true,
      value: null
    });

    this.formCompleteModel = new DropdownModel({
      labelText: 'Minimum info provided?',
      optionData: this._getYesNoDropdownOptions(),
      defaultBlank: true,
      required: true,
      value: null
    });

    this.evidenceProvidedModel = new DropdownModel({
      labelText: 'Evidence provided?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    this.evidenceWarningConfirmationModel = new DropdownModel({
      optionData: this._getYesNoDropdownOptions(),
      defaultBlank: true,
      labelText: 'Continue?',
      required: false
    });

    const formUsed = this._getFormUsedValue();
    this.formUsedModel = new DropdownModel({
      labelText: `${formUsed} used?`,
      optionData: formUsed ? this._getYesNoDropdownOptions() : [],
      defaultBlank: true,
      disabled: !formUsed,
      required: formUsed,
      _formUsed: formUsed,
      value: null
    });

    this.applicationNoteModel = new InputModel({
      labelText: 'Application Note',
      minLength: this.OS_APPLICATION_NOTE_MIN_LENGTH,
      maxLength: this.OS_APPLICATION_NOTE_MAX_LENGTH,
      required: false,
      apiMapping: 'application_note'
    });
  },

  _createEvidenceModels() {
    this.uploadModel = new UploadModel();

    this.formEvidenceModel = new DisputeEvidenceModel({
      helpHtml: FORM_EVIDENCE_HELP,
      title: this.formConfig.title ? `${this.formConfig.title} and Supporting Evidence` : null,
      evidence_id: this.formCode,
      category: this.formConfig.category,
      mustProvideNowOrLater: true,
      required: true,
      
      // DO create a file description
      _skipFileDescriptionCreation: false,
    });
    this.formEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: FORM_EVIDENCE_DESCRIPTION
    });
    this.formEvidenceModel.saveInternalDataToModel();
  },

  setupListeners() {
    // If a new search occurs, load the dispute menu
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);

    this.listenTo(this.emailModel, 'unableToEmail', function() {
      this.noEmail = true;
      this.packageMethodModel.set({
        optionData: this._getPackageMethodPickupOptions(['SEND_METHOD_PICKUP']),
        value: (String(this.packageMethodModel.getData()) === this.SEND_METHOD_EMAIL)
      }, { silent: true });

      this.emailModel.set({
        disabled: true,
        value: null,
        customLink: 'I can use email',
        customLinkFn: (() => {
          this.packageMethodModel.set({
            optionData: this._getPackageMethodPickupOptions(['SEND_METHOD_EMAIL', 'SEND_METHOD_PICKUP']),
            value: (String(this.packageMethodModel.getData()) === this.SEND_METHOD_EMAIL)
          }, { silent: true });
          this.reRenderChildView('packageMethodRegion');
          
          this.emailModel.set({
            customLink: null,
            customLinkFn: null,
            disabled: false
          }, { silent: false });
          // If email is chosen, then set email to be required
          const emailView = this.getChildView('emailRegion');
          if (emailView) {
            this.noEmail = false;
            emailView.optInToEmail();
            emailView.render();
          }
        }).bind(this)
      }, { silent: true });

      this.reRenderChildView('packageMethodRegion');
      this.reRenderChildView('emailRegion');
    }, this);

    this.listenTo(this.formEvidenceModel, 'update:evidence', function() {
      this.mixin_upload_updateReadyToUploadCount();
      this.hideFormEvidenceError();
    }, this);

    this.listenTo(this.evidenceProvidedModel, 'change:value', (model, value) => {
      if (String(value) === DROPDOWN_CODE_NO) {
        this.showEvidenceProvidedWarning();
      } else {
        this.hideEvidenceProvidedWarning();
      }
    });

    this.listenTo(this.uploadModel, 'update:file:count', this.mixin_upload_updateReadyToUploadCount, this);

    this.listenTo(this.formCompleteModel, 'change:value', function() { this.reRenderChildView('formCompleteRegion'); }, this)

    this.listenTo(this.correctDocumentsModel, 'change:value', (model, value) => {
      const isNoSelected = value === DROPDOWN_CODE_NO;
      this.documentsDescribedModel.set({ value: null });
      this.displayDocumentsDescribed = isNoSelected;
      this.render();
    });

    this.listenTo(this.documentsDescribedModel, 'change:value', (model, value) => {
      this.displayDocumentsDescribedError = value === DROPDOWN_CODE_NO;
      this.render();
    });
  },

  /* Upload supporting functions */
  createFilePackageCreationPromise() {
    return $.Deferred().resolve().promise();
  },

  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = this.participantToUse.id;
    
    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const participantId = this.participantToUse.id;
    const fileDate = this.dateReceivedModel.getData();

    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        file_date: fileDate ? fileDate : null,
        submitter_name: sessionChannel.request('name')
      });
    });
  },

  changeDisputeStatusPromise() {
    if ((this.dispute.checkStageStatus(2, 20) && !this.dispute.getOwner()) || this.dispute.checkStageStatus(4, 41)) {
      const statusSaveModel = new ExternalDisputeStatusModel({
        file_number: this.dispute.get('file_number'),
        dispute_stage: 2, 
        dispute_status: 95
      });
      return new Promise((res, rej) => statusSaveModel.save().then(res, generalErrorFactory.createHandler('OS.REQUEST.SUBSERVICE.CREATE', rej)))
    } else {
      return Promise.resolve();
    }
  },

  onUploadComplete() {
    this.isUpload = false;
    this.fileUploader = null;

    const receiptRoute = `${this.requestName}/receipt`;
    const routeDirectlyToReceiptFail = _.bind(function() {
      this.model.setReceiptData(this.generateReceiptData());
      Backbone.history.navigate(receiptRoute, { trigger: true });
    }, this);

    const anyFilesUploaded = _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.getUploadedFiles().length;
    });

    if (anyFilesUploaded) {
      this._checkAndShowFileUploadErrors(_.bind(this.performApiCallsAfterUpload, this));
    } else {
      this._checkAndShowFileUploadErrors(routeDirectlyToReceiptFail);
    }
  },

  _routeToReceiptPage() {
    const receiptRoute = `${this.requestName}/receipt`;
    this.model.setReceiptData(this.generateReceiptData());
    Backbone.history.navigate(receiptRoute, { trigger: true });
  },

  performApiCallsAfterUpload() {
    const changeDisputeStatusPromise = () => this.changeDisputeStatusPromise();
    // Create task and substituted service model
    loaderChannel.trigger('page:load');
    this.createSubstitutedServiceRecordWithLinkedData()
      .done(changeDisputeStatusPromise)
      .done(() => {
        this._routeToReceiptPage();
        loaderChannel.trigger('page:load:complete');
      }).fail(() => {
        // Detailed user messaging for task or notice error happens createSubstitutedServiceRecordWithLinkedData.
        // Just handle the reject routing here
        loaderChannel.trigger('page:load:complete');
        this._routeToReceiptPage();
      });
  },

  _checkAndShowFileUploadErrors(routingFn) {
    const upload_error_files = [];
    _.each(this.uploadModel.getPendingUploads(), function(e) {
      upload_error_files.push( ...(e.get('files').filter(function(f) { return f.isUploadError(); })) );
    });

    if (!_.isEmpty(upload_error_files)) {
      filesChannel.request('show:upload:error:modal', upload_error_files, () => {
        loaderChannel.trigger('page:load');
        routingFn();
      });
    } else {
      setTimeout(routingFn, 500);
    }
  },
  /* End upload support functionality */



  validateAndShowErrors() {
    let is_valid = true;
    let groupToValidate = this.validateGroup;
    const hiddenRegion = this.correctDocumentsModel.getData() === DROPDOWN_CODE_NO ? ['documentsDescribedRegion'] : [];
    groupToValidate = [...this.validateGroup, ...hiddenRegion];

    // Validate vanilla fields
    _.each(groupToValidate, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    if (this.evidenceProvidedModel.getData() === DROPDOWN_CODE_NO) {
      this.showEvidenceProvidedWarning();
    }

    // Perform other special handling
    if (this.formUsedModel.getData() === DROPDOWN_CODE_NO) {
      this.showFormErrorMessage();
      is_valid = false;
    }

    if (this.formCompleteModel.getData() === DROPDOWN_CODE_NO) {
      this.showFormCompleteErrorMessage();
      is_valid = false;
    }

    if (this.evidenceWarningConfirmationModel.get('required') && this.evidenceWarningConfirmationModel.getData() === DROPDOWN_CODE_NO) {
      const view = this.getChildView('evidenceWarningConfirmationRegion');
      view.showErrorMessage('This must be accepted to continue');
      is_valid = false;
    }

    if (!this.formEvidenceModel.getReadyToUploadFiles().length) {
      this.showFormEvidenceError();
      is_valid = false;
    }

    if (this.documentsDescribedModel.getData() === DROPDOWN_CODE_NO) is_valid = false;

    return is_valid;
  },

  reRenderChildView(region) {
    const view = this.getChildView(region);
    if (view) {
      view.render();
    }
  },
 
  showFormErrorMessage() {
    const msg = `This application cannot be submitted if the wrong form was used.  Forms are available on the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/forms">RTB web site</a>.`;
    const view = this.getChildView('formUsedRegion');
    if (view) {
      view.showErrorMessage(msg);
    }
  },

  showFormCompleteErrorMessage() {
    const msg = `The form must be complete to continue`;
    const view = this.getChildView('formCompleteRegion');
    if (view) {
      view.showErrorMessage(msg);
    }
  },

  showFormEvidenceError() {
    this.getUI('formError').html(FORM_EVIDENCE_MISSING_MSG).show();
  },

  hideFormEvidenceError() {
    this.getUI('formError').html('').hide();
  },

  updateServiceToParticipantView() {
    this.serviceToParticipantModel.set({
      optionData: this._getServiceToOptions(),
      labelText: this._getServiceToLabelText()
    });

    // If we switched from applicant to respondent and the previously-selected value is no longer in the list, then clear value
    if (!this.serviceToParticipantModel.getSelectedText()) {
      this.serviceToParticipantModel.set('value', null);
    }

    this.reRenderChildView('participantBeingServedRegion');
  },

  showEvidenceProvidedWarning() {
    this.hasEvidenceProvidedWarning = true;
    this.evidenceWarningConfirmationModel.set('required', true);
    this.getUI('evidenceWarningContainer').removeClass('hidden');
  },

  hideEvidenceProvidedWarning() {
    this.hasEvidenceProvidedWarning = false;
    this.evidenceWarningConfirmationModel.set('required', false);
    this.getUI('evidenceWarningContainer').addClass('hidden');
  },

  onBeforeRender() {
    if (this.participantToUse) {
      const descriptionBy = this.participantToUse.id;
      this.formEvidenceModel.set('description_by', descriptionBy);
    }
  },

  onRender() {    
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
    } else {
      this.mixin_upload_updateReadyToUploadCount();
      this.showChildView('topSearchRegion', new OfficeTopSearchView({ model: this.model.getOfficeTopSearchModel() }));
      this.showChildView('disputeRegion', new OfficeDisputeOverview({ model: this.model }));
    }

    this._renderRequestDetailsRegions();
    this._renderEvidenceRegions();
  },

  _renderEvidenceRegions() {
    this.showChildView('formEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.formEvidenceModel,
      showDelete: false,
      hideDescription: true,
      mode: this.isUpload ? 'upload' : null,
      fileType: configChannel.request('get', 'FILE_TYPE_NOTICE'),
      processing_options: {
        maxNumberOfFiles: this.NOTICE_FILES_MAX || 5
      }
    }));
  },

  _renderRequestDetailsRegions() {
    this.showChildView('firstNameRegion', new InputView({ model: this.firstNameModel }));
    this.showChildView('lastNameRegion', new InputView({ model: this.lastNameModel }));
    this.showChildView('emailRegion', new EmailView({ showOptOut: true, model: this.emailModel }));
    this.showChildView('phoneRegion', new InputView({ model: this.phoneModel }));
    this.showChildView('packageMethodRegion', new DropdownView({ model: this.packageMethodModel }));
    this.showChildView('addressRegion', new AddressView({ model: this.addressModel, useFlatLayout: true }));

    this.showChildView('correctDocumentsRegion', new DropdownView({ model: this.correctDocumentsModel }));
    this.showChildView('documentsDescribedRegion', new DropdownView({ model: this.documentsDescribedModel }));
    this.showChildView('participantBeingServedRegion', new DropdownView({ model: this.serviceToParticipantModel }));
    this.showChildView('dateReceivedRegion', new InputView({ model: this.dateReceivedModel }));
    this.showChildView('participantBeingServedRegion', new DropdownView({ model: this.serviceToParticipantModel }));
    this.showChildView('applicationNoteRegion', new InputView({ model: this.applicationNoteModel }));
    this.showChildView('formCompleteRegion', new DropdownView({ model: this.formCompleteModel }));
    this.showChildView('formUsedRegion', new DropdownView({ model: this.formUsedModel }));
    this.showChildView('evidenceProvidedRegion', new DropdownView({ model: this.evidenceProvidedModel }));
    this.showChildView('evidenceWarningConfirmationRegion', new DropdownView({ model: this.evidenceWarningConfirmationModel }));
  },

  _toParticipantDisplay(participant) {
    if (!participant) {
      return;
    }
    return `${this.getLandlordTenantTextDisplay(participant)} - Initials ${participant.getInitialsDisplay()}`;
  },

  getLandlordTenantTextDisplay(participantModel) {
    return `${participantModel.isTenant() ? 'Tenant' : 'Landlord'}`;
  },

  toParticipantDisplayWithType(participant) {
    if (!participant) {
      return;
    }
    return `${this._toParticipantDisplay(participant)} (${participant.isRespondent() ? 'Respondent' : 'Applicant'})`;
  },

  toParticipantDisplayWithAccessCode(participant) {
    if (!participant) {
      return;
    }
    return `${this._toParticipantDisplay(participant)}, (Access Code ${participant.get('access_code')})`;
  },

  documentListHtml() {
    if (!this.serviceQuadrant) return;

    return `
      <ul>
        ${
          this.serviceQuadrant.displayedDocumentList.map((document) => {
            return `<li>${document}</li>`;
          })
        }
      </ul>
    `.replace(/,/g, '');
  },

  templateContext() {
    return {
      requestTitle: this.requestTitle || `Submit Request for ${this.capitalizedRequestName}`,
      fileNumber: this.dispute.get('file_number'),
      isUpload: this.isUpload,
      noRespondents: this.noRespondents,
      showFormContent: this.participantToUse && !this.noRespondents,
      accessCodeForDisplay: this.participantToUse ? `<b>${this.toParticipantDisplayWithType(this.participantToUse)}</b>` : '-',
      expectedFormDisplay: this._getFormUsedValue(),
      participantType: this.participantToUse ? (this.participantToUse.isLandlord() ? 'landlord' : 'tenant'): 'participant',
      hasEvidenceProvidedWarning: this.hasEvidenceProvidedWarning,
      documentHeader: this.serviceQuadrant.documentsName,
      documentListHtml: this.documentListHtml(),
      displayDocumentsDescribedError: this.displayDocumentsDescribedError,
      displayDocumentsDescribed: this.displayDocumentsDescribed
    };
  }
});

_.extend(SubServicePageView.prototype, UploadViewMixin);
export default SubServicePageView;