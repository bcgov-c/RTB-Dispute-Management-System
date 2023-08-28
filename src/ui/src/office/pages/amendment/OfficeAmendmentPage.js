import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import AddressModel from '../../../core/components/address/Address_model';
import AddressView from '../../../core/components/address/Address';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import EmailView from '../../../core/components/email/Email';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import UploadEvidenceView from '../../../evidence/pages/upload/UploadEvidence';
import UploadModel from '../../../core/components/upload/UploadMixin_model';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import ExternalNoticeModel from '../../components/external-api/ExternalNotice_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './OfficeAmendmentPage_template.tpl';

const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';
const FORM_EVIDENCE_MISSING_MSG = 'You must add the amendment form to continue';
const BULK_EVIDENCE_TITLE = 'Bulk Evidence to Support Amended Issues';

const FORM_EVIDENCE_DESCRIPTION = 'This is the original amendment application form(s)';

const LANDLORD_FORM_CODE = 74;
const TENANT_FORM_CODE = 75;

const FORM_EVIDENCE_HELP = `Upload the main application form(s) and related forms (e.g. RTB-26 Schedule of parties form, Other Issues form, or RTB-13 Application for Substituted Service form).
<br/>DO NOT UPLOAD EVIDENCE FILES HERE - SEPARATE THEM FROM THE APPLICATION FORMS`;
const BULK_EVIDENCE_HELP = `Upload evidence, evidence worksheets (i.e. monetary order worksheets, direct request worksheets) and tenancy agreements here.
<br/>DO NOT UPLOAD APPLICATION FORMS HERE`;

const taskChannel = Radio.channel('tasks');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const AmendmentPageView = PageView.extend({
  template,
  className: `${PageView.prototype.className} office-page-amendment office-upload-page`,

  ui: {
    // Upload UI items
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',

    formError: '.office-form-evidence-error',
    fieldsContainer: '.office-clarification-input-fields-container',
    cancel: '.btn-cancel',
    submit: '.office-page-clarification-buttons > .btn-continue',

    pageButtons: '.office-page-clarification-buttons',
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
    dateReceivedRegion: '.office-clarification-date-received',
    timeReceivedRegion: '.office-clarification-time-received',
    applicationNoteRegion: '.office-application-note',
    formUsedRegion: '.office-new-dispute-rtb-form-used',
    formCompleteRegion: '.office-clarification-form-complete',
    formEvidenceRegion: '.office-page-new-dispute-form-evidence',
    bulkEvidenceRegion: '.office-page-new-dispute-bulk-evidence',
    formUsedLabelRegion: '.office-amendment-form-used-label',
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


  _createParallelTask() {
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const pageApiData = this._getPageApiData();
    const { city, country, email, first_name, last_name, package_delivery_method, phone,
      postal_code, province, street, received_date, application_note } = pageApiData;
    const taskDescription = [
      `A manual ${this.requestName} request was submitted through the office submission site. Office IDIR: ${this.currentUser.getUsername()}. Access Code: ${this.dispute.get('accessCode')}`,
      `Submitter: ${first_name} ${last_name}, Phone: ${phone}, Email: ${email?email:'-'}, Address: ${street} ${city}, ${province}, ${country}, ${postal_code}`,
      `RTB documents by ${Formatter.toHearingOptionsByDisplay(package_delivery_method)}`,
      `Date request received ${Formatter.toDateAndTimeDisplay(received_date)}`,
      `See the notice view for the amendment form`,
      this.bulkEvidenceModel.getUploadedFiles().length ? `See the evidence list for ${BULK_EVIDENCE_TITLE}` : 'No bulk evidence was submitted',
      ...(application_note ? [`APPLICATION NOTE: ${application_note}`] : [])
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);
    
    const taskData = {
      task_text: taskDescription,
      task_activity_type: configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_AMENDMENT'),
      dispute_guid: this.dispute.get('dispute_guid'),
    };

    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: null,
      docRequestModel: null,
    });
    return taskCreator.submitExternalTask(taskData).catch(generalErrorFactory.createHandler('OS.REQUEST.AMEND.TASK'));
  },

  _createAmendmentNotice() {
    const amendmentNoticeModel = new ExternalNoticeModel({
      notice_file_description_id: this.formEvidenceModel.get('file_description').id,
      parent_notice_id: this.dispute.get('currentNoticeId'),
      notice_delivered_to: this._getParticipantIdForUploads(),
      notice_delivered_date: this.getFileDate(),
      notice_type: configChannel.request('get', 'NOTICE_TYPE_UPLOADED_AMENDMENT')
    });

    return amendmentNoticeModel.save()
      .catch(err => {
        return new Promise((resolve, reject) => generalErrorFactory.createHandler('OS.REQUEST.AMEND.NOTICE', reject)(err) );
      });
  },

  _getPageApiData() {
    const pageApiData = { received_date: this.getFileDate() };
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
    const bulkEvidenceFiles = this.bulkEvidenceModel.getUploadedFiles();
    
    const pageApiData = this._getPageApiData();
    const { city, country, email, first_name, last_name, package_delivery_method, phone,
      postal_code, province, street, received_date } = pageApiData;

    return {
      requestName: this.capitalizedRequestName,
      formTitleDisplay: this.formEvidenceModel.getTitle(),
      formDescriptionDisplay: this.formEvidenceModel.getDescription(),
      disputeInfo: [
        { label: 'File number', value: this.dispute.get('file_number') },
        { label: 'Access code', value: `<b>${this.dispute.get('accessCode')}</b>` },
        { label: 'Access code for', value: this._toParticipantDisplay(this.participantToUse) },
        { label: `${this.capitalizedRequestName} request received`, value: Formatter.toDateAndTimeDisplay(received_date) }
      ],
      requesterInfo: [
        { label: 'Name', value: `<b>${first_name} ${last_name}</b>` },
        { label: 'Phone number', value: phone },
        { label: 'Email address', value: email ? email : '-' },
        { label: 'Receive RTB documents by', value: Formatter.toHearingOptionsByDisplay(package_delivery_method) },
        { label: 'Address', value: `${street}, ${city}, ${province}, ${country}, ${postal_code}` }
      ],
      formInfo: [
        { label: 'File(s) submitted', value: !_.isEmpty(uploadedFormFiles) ? Formatter.toUploadedFilesDisplay(uploadedFormFiles) : '<i>No form files were successfully uploaded at the time of submitting this request.</i>' }
      ],
      bulkInfo: [
        { label: 'File(s) submitted', value: !_.isEmpty(bulkEvidenceFiles) ? Formatter.toUploadedFilesDisplay(bulkEvidenceFiles) : '<i>No bulk evidence files were successfully uploaded at the time of submitting this request.</i>' }
      ]
    };
  },


  initialize() {
    this.requestTitle = 'Submit Amendment to Dispute File';
    this.requestName = 'amendment';
    this.capitalizedRequestName = Formatter.capitalize(this.requestName);
    this.dispute = disputeChannel.request('get');
    this.formCode = this.dispute.isLandlord() ? LANDLORD_FORM_CODE : TENANT_FORM_CODE;
    this.formConfig = configChannel.request('get:evidence', this.formCode);
    this.participantToUse = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.isUpload = false;
    this.isCancel = false;
    this.noEmail = false;
    this.currentUser = sessionChannel.request('get:user');

    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.SEND_METHOD_EMAIL = String(configChannel.request('get', 'SEND_METHOD_EMAIL'));
    this.ACCESS_CODE_LENGTH = configChannel.request('get', 'ACCESS_CODE_LENGTH');
    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.OS_APPLICATION_NOTE_MIN_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MIN_LENGTH');
    this.OS_APPLICATION_NOTE_MAX_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MAX_LENGTH');
    
    this.createSubModels();
    this.setupListeners();

    this.validateGroup = ['firstNameRegion', 'lastNameRegion', 'emailRegion', 'phoneRegion', 'packageMethodRegion', 'addressRegion', 'dateReceivedRegion', 'timeReceivedRegion', 'applicationNoteRegion', 'formUsedRegion', 'formCompleteRegion'];

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


  createSubModels() {
    this._createEvidenceModels();

    // Create general request details
    this.accessCodeModel = new InputModel({
      name: 'access-code',
      autocomplete: false,
      labelText: 'Dispute Access Code',
      errorMessage: 'Enter the Access Code',
      inputType: 'access_code',
      maxLength: this.ACCESS_CODE_LENGTH,
      subLabel: ' ',
      showValidate: true,
      restrictedCharacters: InputModel.getRegex('whitespace__restricted_chars'),
      required: true,
      value: null,
      apiMapping: 'access_code'
    });
    
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
    });

    this.timeReceivedModel = new InputModel({
      labelText: 'Time received',
      inputType: 'time',
      errorMessage: 'Enter the time',
      required: true,
      value: Moment().format(InputModel.getTimeFormat()),
    });

    this.applicationNoteModel = new InputModel({
      labelText: 'Application Note',
      minLength: this.OS_APPLICATION_NOTE_MIN_LENGTH,
      maxLength: this.OS_APPLICATION_NOTE_MAX_LENGTH,
      required: false,
      apiMapping: 'application_note'
    });

    this.formCompleteModel = new DropdownModel({
      labelText: 'Minimum info provided?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });
    
    const formUsed = this._getFormUsedValue();
    this.formUsedModel = new DropdownModel({
      labelText: `${formUsed} used?`,
      optionData: formUsed ? [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }] : [],
      defaultBlank: true,
      disabled: !formUsed,
      required: formUsed,
      _formUsed: formUsed,
      value: null
    });

    this.formUsedLabelModel = new DropdownModel({
      labelText: 'Applicant type',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Landlord' }, { value: DROPDOWN_CODE_NO, text: 'Tenant' }],
      disabled: true,
      value: this.dispute.isLandlord() ? DROPDOWN_CODE_YES : DROPDOWN_CODE_NO
    });
  },

  _createEvidenceModels() {
    this.uploadModel = new UploadModel();

    this.formEvidenceModel = new DisputeEvidenceModel({
      helpHtml: FORM_EVIDENCE_HELP,
      title: this.formConfig.title,
      evidence_id: this.formCode,
      category: this.formConfig.category,
      mustProvideNowOrLater: true,
      required: true,

      // Office upload option
      _skipFileDescriptionCreation: false
    });
    this.formEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: FORM_EVIDENCE_DESCRIPTION
    });
    this.formEvidenceModel.saveInternalDataToModel();

    this.bulkEvidenceModel = new DisputeEvidenceModel({
      helpHtml: BULK_EVIDENCE_HELP,
      evidence_id: configChannel.request('get', 'EVIDENCE_CODE_BULK'),
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_BULK'),
      title: BULK_EVIDENCE_TITLE,
      mustProvideNowOrLater: true,
      required: true // NOTE: This check will be handled using page controls
    });
    this.bulkEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: configChannel.request('get', 'OFFICE_BULK_EVIDENCE_DESCRIPTION')
    });
    this.bulkEvidenceModel.saveInternalDataToModel();

    this.bulkEvidenceWarningConfirmationgModel = new DropdownModel({
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      labelText: 'Continue?',
      required: false
    });
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

    this.listenTo(this.formCompleteModel, 'change:value', function() { this.reRenderChildView('formCompleteRegion'); }, this);

    this.listenTo(this.formEvidenceModel, 'update:evidence', function() {
      this.mixin_upload_updateReadyToUploadCount();
      this.hideFormEvidenceError();
    }, this);
    this.listenTo(this.uploadModel, 'update:file:count', this.mixin_upload_updateReadyToUploadCount, this);
  },

  /* Upload supporting functions */
  _filesToUploadContainEvidence() {
    return _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.isEvidence();
    });
  },

  getFileDate() {
    return Moment(`${this.dateReceivedModel.getData({ format: 'date' })} ${this.timeReceivedModel.getData({ iso: true })}`, 'YYYY-MM-DD HH:mm').toISOString();
  },

  createFilePackageCreationPromise() {
    const fileDate = this.getFileDate();
    const filePackagePromise = this._filesToUploadContainEvidence() ?
      filesChannel.request('create:filepackage:office', {
        package_date: fileDate,
        package_description: `Uploaded on ${Formatter.toDateAndTimeDisplay(Moment())}`,
      })
      : $.Deferred().resolve().promise();

    return filePackagePromise;
  },

  _getParticipantIdForUploads() {
    return this.participantToUse.id;
  },

  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = this._getParticipantIdForUploads();
    
    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const participantId = this._getParticipantIdForUploads();
    const fileDate = this.getFileDate();

    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        file_date: fileDate ? fileDate : null,
        submitter_name: sessionChannel.request('name')
      });
    });
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
    // Create task and create notice
    loaderChannel.trigger('page:load');
    $.whenAll(
      this._createParallelTask(),
      this._createAmendmentNotice()
    ).done(() => {
      this._routeToReceiptPage();
      loaderChannel.trigger('page:load:complete');
    }).fail(() => {
      // Detailed user messaging for task or notice error happens in createParallelTask and createAmendmentNotice.
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
    
    // Validate vanilla fields
    _.each(this.validateGroup, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    // Perform other special handling
    if (this.formUsedModel.getData() === DROPDOWN_CODE_NO) {
      this.showFormErrorMessage();
      is_valid = false;
    }

    if (this.formCompleteModel.getData() === DROPDOWN_CODE_NO) {
      this.showFormCompleteErrorMessage();
      is_valid = false;
    }

    if (!this.formEvidenceModel.getReadyToUploadFiles().length) {
      this.showFormEvidenceError();
      is_valid = false;
    }

    if (this.bulkEvidenceWarningConfirmationgModel.get('required') && this.bulkEvidenceWarningConfirmationgModel.getData() === DROPDOWN_CODE_NO) {
      const view = this.getChildView('bulkEvidenceWarningRegion');
      view.showErrorMessage('This must be accepted to continue');
      is_valid = false;
    }

    return is_valid;
  },

  reRenderChildView(region) {
    const view = this.getChildView(region);
    if (view) {
      view.render();
    }
  },

  showFormCompleteErrorMessage() {
    const msg = `The form must be complete to continue`;
    const view = this.getChildView('formCompleteRegion');
    if (view) {
      view.showErrorMessage(msg);
    }
  },

  showFormErrorMessage() {
    const msg = `This application cannot be submitted if the wrong form was used.  Forms are available on the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/forms">RTB web site</a>.`;
    const view = this.getChildView('formUsedRegion');
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

  onBeforeRender() {
    if (this.participantToUse) {
      const descriptionBy = this.participantToUse.id;
      this.formEvidenceModel.set('description_by', descriptionBy);
      this.bulkEvidenceModel.set('description_by', descriptionBy);

      this.accessCodeModel.set('disabled', true);
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

    this.showChildView('bulkEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.bulkEvidenceModel,
      showDelete: false,
      hideDescription: true,
      mode: this.isUpload ? 'upload' : null
    }));
  },

  _renderRequestDetailsRegions() {
    this.showChildView('firstNameRegion', new InputView({ model: this.firstNameModel }));
    this.showChildView('lastNameRegion', new InputView({ model: this.lastNameModel }));
    this.showChildView('emailRegion', new EmailView({ showOptOut: true, model: this.emailModel }));
    this.showChildView('phoneRegion', new InputView({ model: this.phoneModel }));
    this.showChildView('packageMethodRegion', new DropdownView({ model: this.packageMethodModel }));
    this.showChildView('addressRegion', new AddressView({ model: this.addressModel, useFlatLayout: true }));
    this.showChildView('dateReceivedRegion', new InputView({ model: this.dateReceivedModel }));
    this.showChildView('timeReceivedRegion', new InputView({ model: this.timeReceivedModel }));
    this.showChildView('applicationNoteRegion', new InputView({ model: this.applicationNoteModel }));
    this.showChildView('formCompleteRegion', new DropdownView({ model: this.formCompleteModel }));
    this.showChildView('formUsedRegion', new DropdownView({ model: this.formUsedModel }));
    this.showChildView('formUsedLabelRegion', new DropdownView({ model: this.formUsedLabelModel })); 
  },

  _toParticipantDisplay(participant) {
    if (!participant) {
      return;
    }
    return `${participant.isTenant() ? 'Tenant' : 'Landlord'} - Initials ${participant.getInitialsDisplay()} (${participant.isRespondent() ? 'Respondent' : 'Applicant'})`;
  },

  templateContext() {
    return {
      requestTitle: this.requestTitle || `Submit Request for ${this.capitalizedRequestName}`,
      fileNumber: this.dispute.get('file_number'),
      isUpload: this.isUpload,
      showFormContent: this.participantToUse,
      accessCodeForDisplay: this.participantToUse ? `<b>${this._toParticipantDisplay(this.participantToUse)}</b>` : '-',
      expectedFormDisplay: this._getFormUsedValue()
    };
  }
});

_.extend(AmendmentPageView.prototype, UploadViewMixin);
export default AmendmentPageView;