import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import AddressModel from '../../../core/components/address/Address_model';
import AddressView from '../../../core/components/address/Address';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import CheckboxesView from '../../../core/components/checkbox/Checkboxes';
import CheckboxCollection from '../../../core/components/checkbox/Checkbox_collection';
import InputView from '../../../core/components/input/Input';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import RadioView from '../../../core/components/radio/Radio';
import EmailView from '../../../core/components/email/Email';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import UploadEvidenceView from '../../../evidence/pages/upload/UploadEvidence';
import UploadModel from '../../../core/components/upload/UploadMixin_model';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import DocRequestItemModel from '../../../core/components/documents/doc-requests/DocRequestItem_model';
import ExternalPaymentTransactionModel from '../../components/external-api/ExternalPaymentTransaction_model';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import OfficePaymentsMixin from '../../components/payments/OfficePaymentMixin';
import FileDescription from '../../../core/components/files/file-description/FileDescription_model';
import FeeWaiverModel from '../../../core/components/payments/fee-waiver/FeeWaiver_model';
import DocRequestModel from '../../../core/components/documents/doc-requests/DocRequest_model';
import FeeWaiverView from '../../../core/components/payments/fee-waiver/FeeWaiver';
import PageItem from '../../../core/components/page/PageItem';
import { ParentViewMixin } from '../../../core/utilities/ParentViewMixin';
import template from './OfficeRequestPage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import UtilityMixin from '../../../core/utilities/UtilityMixin';

const RADIO_CODE_OFFICE = 1;
const RADIO_CODE_FEE_WAIVER = 2;
const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';
const CALC_DAYS_Q1_YES = 2;
const CALC_DAYS_Q2_YES = 5;
const CALC_DAYS_Q2_NO = 15;
const FORM_EVIDENCE_MISSING_MSG = 'You must add the application form to continue';

const FORM_EVIDENCE_HELP = `Upload the application form(s), and any other related forms and evidence. If the party requested and obtained a copy of the hearing recording from the Residential Tenancy Branch, please advise them it is not required as evidence.`;
const DEFAULT_DATE_CONTINUE_MSG = `Explain the warning above to the person filing this request.  Would they like to continue?`;
const ITEM_DESCRIPTION_TEXT = 'Office Submission - see paper application ----------------------';

const taskChannel = Radio.channel('tasks');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');
const documentsChannel = Radio.channel('documents');

const OfficeRequestPageView = PageView.extend({
  template,
  className: `${PageView.prototype.className} office-page-clarification office-upload-page`,

  ui: {
    // Upload UI items
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',

    formError: '.office-form-evidence-error',
    dateWarningContainer: '.office-page-clarification-date-warning-container',
    dateWarning: '.office-page-clarification-date-warning',

    fieldsContainer: '.office-clarification-input-fields-container',
    cancel: '.btn-cancel',
    submit: '.office-page-clarification-buttons > .btn-continue',

    pageButtons: '.office-page-clarification-buttons',
    // Payment items
    paymentType: '.office-page-new-dispute-payment-type',
    officePayContainer: '.office-page-new-dispute-payment-office-container',
    feeWaiverPayContainer: '.office-page-new-dispute-payment-fee-waiver-container'
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
    docRequestRegion: '.office-doc-request',
    dateReceivedRegion: '.office-clarification-date-received',
    docRequestItemRegion: '.office-doc-request-item',
    questionOneRegion: '.office-review-question-one',
    questionTwoRegion: '.office-review-question-two',
    dateSubmittedRegion: '.office-clarification-date-submitted',
    lateRequestRegion: '.office-review-late-request',
    formCompleteRegion: '.office-clarification-form-complete',
    formEvidenceRegion: '.office-page-new-dispute-form-evidence',
    applicationNoteRegion: '.office-application-note',
    dateWarningRegion: '.office-page-clarification-date-warning-dropdown',

    // Payment regions
    payNowRegion: '.office-page-new-dispute-pay-now',
    paymentTypeRegion: '@ui.paymentType',
    // Fee waiver region
    feeWaiverRegion: '.office-page-new-dispute-payment-fee-waiver',
    // Office payment regions
    payorNameRegion: '.office-payment-name',
    paymentAmountRegion: '.office-payment-amount',
    paymentMethodRegion: '.office-payment-method'
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
      this.formEvidenceModel.get('descriptionModel').set('value', `${this.OFFICE_FORM_EVIDENCE_DESCRIPTION} - APPLICATION NOTE: ${noteValue}`);
      this.formEvidenceModel.saveInternalDataToModel();
    }

    const self = this;
    this.mixin_upload_transitionToUploadStep().always(function() {
      setTimeout(function() {
        if (self.isCancel) {
          return;
        }
        self.mixin_upload_startUploads();
      }, 1000);
    });
  },


  _createParallelTask() {
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const pageApiData = this._getPageApiData();
    const { city, country, email, first_name, last_name, package_delivery_method, phone,
      postal_code, province, street } = pageApiData;

    const taskDescription = [
      `A manual ${this.requestName} request was submitted through the office submission site. Access Code: ${this.dispute.get('accessCode')}`,
      `Submitter: ${first_name} ${last_name}, Phone: ${phone}, Email: ${email?email:'-'}, Address: ${street} ${city}, ${province}, ${country}, ${postal_code}`,
      `RTB documents by ${Formatter.toHearingOptionsByDisplay(package_delivery_method)} --  See the documents view for more details on the request.`,
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);

    const taskData = Object.assign({
      task_text: taskDescription,
      dispute_guid: this.dispute.get('dispute_guid'),
      task_activity_type: this.taskActivityType,
      task_link_id: this.docRequestModel.id,
      task_linked_to: configChannel.request('get', 'TASK_LINK_DOC_REQUEST')
    });
    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: null,
      docRequestModel: this.docRequestModel,
    });
    return taskCreator.submitExternalTask(taskData);
  },

  _getRequestDescription() {
    const applicantNote = this.applicationNoteModel.getData() ? `Application Note: ${this.applicationNoteModel.getData()}.` : '';
    const documentText = this._getDocumentText();

    return `Documents: ${documentText}. ${applicantNote}`;
  },

  _getDocumentText() {
    const docRequestValues = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    const documentText = this.docRequestTypeCollection.getData().map(item => docRequestValues[item.get('value')] || 'Other');
    return documentText.join(', ');
  },

  _getRequestItems() {
    const requestItemText = this.docRequestModel.getRequestItems().map(item => item.getTypeDisplay());
    return requestItemText.join(', ');
  },

  _createDocRequestPromise() {
    if(!this.docRequestModel) return;

    const outcomeDocGroupModels = documentsChannel.request('get:all');
    const shouldAutoAddDocId = outcomeDocGroupModels?.length === 1;

    this.docRequestModel.set({
      dispute_guid: this.dispute.get('dispute_guid'),
      request_type: this.requestType,
      request_sub_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_SUB_TYPE_OUTSIDE'),
      submitter_details: `${this.currentUser.isOfficeUser() ? 'SBC' : 'RTB'}: ${this.currentUser.getUsername()}`,
      date_documents_received: this.dateReceivedModel.getData(),
      request_date: this.dateSubmittedModel.getData(),
      request_source: configChannel.request('get', 'TASK_REQUEST_SOURCE_OFFICE'),
      file_description_id: this.fileDescription.get('file_description_id'),
      request_description: this._getRequestDescription(),
      submitter_id: this.participantToUse.id,
      outcome_doc_group_id: shouldAutoAddDocId ? outcomeDocGroupModels?.at(0)?.id : null
    });

    this.docRequestItemTypesCollection.forEach((item) => {
      if(!item.getData()) return;
      const docRequestItem = new DocRequestItemModel({ item_type: item.get('value'), item_description: ITEM_DESCRIPTION_TEXT });
      this.docRequestModel.getRequestItems().add(docRequestItem);
    });

    if(this.isFiledLate()) {
      const docRequestItem = new DocRequestItemModel({ item_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_LATE_FILING'), item_description: ITEM_DESCRIPTION_TEXT });
      this.docRequestModel.getRequestItems().add(docRequestItem);
    }

    if(this.isClarificationRequest) {
      const docRequestItem = new DocRequestItemModel({ item_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_CLARIFICATION'), item_description: ITEM_DESCRIPTION_TEXT });
      this.docRequestModel.getRequestItems().add(docRequestItem);
    }

    return new Promise((res, rej) => this.docRequestModel.save(this.docRequestModel.getApiChangesOnly()).then(res, generalErrorFactory.createHandler('OUTCOME.DOC.REQUEST.CREATE', rej)))
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
    const paymentTransactionModel = this.disputeFeeModel ? this.disputeFeeModel.getActivePayment() : null;
    const uploadedFormFiles = this.formEvidenceModel.getUploadedFiles();
    const feeWaiverFiles = _.union.apply(_, this.feeWaiverModel.evidenceModel.get('evidenceCollection').map(function(disputeEvidence) {
      return disputeEvidence.getUploadedFiles();
    }));

    const pageApiData = this._getPageApiData();
    const { city, country, email, first_name, last_name, package_delivery_method, phone,
      postal_code, province, received_date, street, submitted_date } = pageApiData;
    const daysBetweenRequestAndSubmit = Math.abs(Moment(submitted_date).diff(Moment(received_date), 'days'));

    return _.extend({
      requestName: this.capitalizedRequestName,
      formTitleDisplay: this.formEvidenceModel.getTitle(),
      formDescriptionDisplay: this.OFFICE_FORM_EVIDENCE_DESCRIPTION,
      disputeInfo: [
        { label: 'File number', value: this.dispute.get('file_number') },
        { label: 'Access code', value: `<b>${this.dispute.get('accessCode')}</b>` },
        { label: 'Access code for', value: this._toParticipantDisplay(this.participantToUse) },
        { label: 'Document(s)', value: this._getDocumentText()},
        { label: 'Associated document received', value: Formatter.toDateDisplay(received_date) },
        { label: `${this.capitalizedRequestName} request submitted`, value: Formatter.toDateDisplay(submitted_date) },
        { label: 'Time lapsed before request', value: `${daysBetweenRequestAndSubmit} day${daysBetweenRequestAndSubmit===1?'':'s'}` },
        !this.isClarificationRequest ? 
        { label: 'Reason(s) for request', value: this._getRequestItems() } : {}
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
      ]
    },
      this.enablePayments && !this.feeIsInitiallyPaid ? {
        paymentInfo: [
          { label: 'Payment date', value: Formatter.toDateDisplay(Moment()) },
          { label: 'Payment for', value: 'Application for Review Consideration' },
          { label: 'Payment by', value: this.isFeeWaiverMode ? this.feeWaiverModel.getPayorName() : this.payorModel.getData() },
          { label: 'Payment amount', value: Formatter.toAmountDisplay(paymentTransactionModel ? paymentTransactionModel.get('transaction_amount') : 0) },
          { label: 'Payment method', value: `Office, ${this.isFeeWaiverMode ? 'Fee Waiver' : $.trim(this.paymentMethodModel.getSelectedText())}` },
          this.isFeeWaiverMode ? { label: 'File(s) submitted', value: this.isOfficeMode ? '-' : (!_.isEmpty(feeWaiverFiles) ? Formatter.toUploadedFilesDisplay(feeWaiverFiles) : '<i>No fee waiver proof files were successfully uploaded at the time of submitting this request.</i>') } : {}
        ]
      } : {}
    );
  },

  /**
   * @param {Number} formCode - The evidence code to be used for the form
   * @param {String} requestName - Plain english word for the request.  Used for routing, and displays
   * @param {Number} [statusDataAfterPayment] - optional argument to pass a process when changing status on submit
   * @param {Boolean} [requestTitle] - If provided, will be used as the page title
   * @param {Function} [submittedDateWarningFn] - optional argument, will be used to determine any warnings between submitted and received date values
   * @param {String} [dateContinueMsg] - optional argument, will be used with "Continue?" when displaying date warning above
   * @param {Boolean} [enablePayments] - optional argument to show and allow setting payment with the request
   * @param {DisputeFeeModel} [disputeFeeModel] - required if 'enablePayments' is true.  Defines the un-saved disputeFeeModel to use
   * @param {Moment} [taskActivityType] - task activity represented by integer.  Optional.
   * @param {DocRequestModel} [docRequestModel] - required for correction, clarification, review pages
   */
  initialize(options) {
    this.mergeOptions(options, ['formCode', 'requestName', 'requestTitle', 'statusDataAfterPayment', 'submittedDateWarningFn',
        'dateContinueMsg', 'enablePayments', 'disputeFeeModel', 'taskActivityType', 'requestType', 'itemTypesConstantVals']);

    this.capitalizedRequestName = Formatter.capitalize(this.requestName);
    this.dispute = disputeChannel.request('get');
    this.formConfig = configChannel.request('get:evidence', this.formCode);
    this.participantToUse = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.isUpload = false;
    this.isCancel = false;
    this.lateFilingRulesDate = null;
    this.showQuestionTwo = false;
    this.isReviewRequest = this.requestType === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_REVIEW');
    this.isClarificationRequest = this.requestType === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CLARIFICATION');
    this.docRequestModel = new DocRequestModel({});
    this.feeIsInitiallyPaid = this.disputeFeeModel && this.disputeFeeModel.isPaid();
    
    this.SEND_METHOD_EMAIL = String(configChannel.request('get', 'SEND_METHOD_EMAIL'));

    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.OFFICE_FORM_EVIDENCE_DESCRIPTION = configChannel.request('get', 'OFFICE_FORM_EVIDENCE_DESCRIPTION');
    this.ACCESS_CODE_LENGTH = configChannel.request('get', 'ACCESS_CODE_LENGTH');
    this.POSTAL_CODE_FIELD_MAX = configChannel.request('get', 'POSTAL_CODE_FIELD_MAX');
    this.OS_APPLICATION_NOTE_MIN_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MIN_LENGTH');
    this.OS_APPLICATION_NOTE_MAX_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MAX_LENGTH');

    this.noEmail = false;

    this.currentUser = sessionChannel.request('get:user');
    this.isOfficeMode = false;
    this.isFeeWaiverMode = false;

    this.createSubModels();
    this.setupListeners();

    this.officeGroup = ['payorNameRegion', 'paymentAmountRegion', 'paymentMethodRegion'];
    this.feeWaiverGroup = ['feeWaiverRegion'];
    this.reviewGroup = ['questionOneRegion'];
    this.lateRequestGroup = ['lateRequestRegion'];

    this.validateGroup = ['firstNameRegion', 'lastNameRegion', 'emailRegion', 'phoneRegion', 'packageMethodRegion',
      'addressRegion', 'dateReceivedRegion', 'dateSubmittedRegion', 'applicationNoteRegion', 'formCompleteRegion', 'dateWarningRegion', 'paymentTypeRegion'];

  },

  _getPackageMethodPickupOptions(configCodesToUse) {
    return (configCodesToUse || []).map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { text: Formatter.toHearingOptionsByDisplay(configValue), value: String(configValue) };
    });
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
      labelText: 'Document received',
      errorMessage: 'Enter the date',
      inputType: 'date',
      required: true,
      minDate: null,
      value: null,
      apiMapping: 'received_date'
    });

    this.dateSubmittedModel = new InputModel({
      labelText: 'Request submitted',
      inputType: 'date',
      errorMessage: 'Enter the date',
      required: true,
      value: Moment().format(InputModel.getDateFormat()),
      apiMapping: 'submitted_date'
    });

    this.applicationNoteModel = new InputModel({
      labelText: 'Application Note',
      minLength: this.OS_APPLICATION_NOTE_MIN_LENGTH,
      maxLength: this.OS_APPLICATION_NOTE_MAX_LENGTH,
      required: false,
      apiMapping: 'application_note'
    });

    this.dateWarningConfirmationModel = new DropdownModel({
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      labelText: 'Continue?',
      required: false
    });


    this.formCompleteModel = new DropdownModel({
      labelText: 'Form completed and signed?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    // Create payment models
    this.mixin_officePayments_createSubModels();
    this.feeWaiverModel = new FeeWaiverModel({
      disputeFeeModel: this.disputeFeeModel,
      uploadModel: this.uploadModel
    });

    this.paymentTypeRadioModel = new RadioModel({
      optionData: [{ value: RADIO_CODE_OFFICE, text: 'Office Payment' },
          { value: RADIO_CODE_FEE_WAIVER, text: 'Fee Waiver (tenant only)' }],
      required: this.enablePayments && !this.feeIsInitiallyPaid,
      value: null
    });
    
    const OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    this.docRequestTypeCollection = new CheckboxCollection(_.map([
      'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC',
      'OUTCOME_DOC_REQUEST_AFFECTED_DOC_OOP',
      'OUTCOME_DOC_REQUEST_AFFECTED_DOC_MO',
    ], (configName) => {
      const value = configChannel.request('get', configName);
      return { html: OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY[value], value };
    }),
      { minSelectsRequired: 1 }
    );

    const OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY = configChannel.request('get', this.isReviewRequest ? 'OUTCOME_DOC_REQUEST_ITEM_TYPE_OFFICE_DISPLAY' : 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY');
    this.docRequestItemTypesCollection = new CheckboxCollection(_.map(this.itemTypesConstantVals, (configName) => {
      const value = configChannel.request('get', configName);
      return { html: OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY[value], value };
    }),
      { minSelectsRequired: 1 },
    );

    this.questionOneDropdownModel = new DropdownModel({
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: this.isReviewRequest
    });

    this.questionTwoDropdownModel = new DropdownModel({
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: this.isReviewRequest
    });

    this.lateRequestModel = new DropdownModel({
      labelText: 'Submit Late Request?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
    });
  },

  _createEvidenceModels() {
    this.uploadModel = new UploadModel();
    const evidenceTitle = this.isReviewRequest ? `Form #RTB-2 and Additional Documents` :
      this.isClarificationRequest ? `Form #RTB-38 and Additional Documents` : `Form #RTB-6 and Additional Documents`;

    this.fileDescription = new FileDescription({
      title: evidenceTitle,
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST'),
      description: " "
    });

    this.formEvidenceModel = new DisputeEvidenceModel({
      helpHtml: FORM_EVIDENCE_HELP,
      title: this.formConfig.title,
      file_description: this.fileDescription,
      evidence_id: this.formCode,
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_GENERAL'),
      mustProvideNowOrLater: true,
      required: true
    });
    this.formEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: this.OFFICE_FORM_EVIDENCE_DESCRIPTION
    });

    this.formEvidenceModel.saveInternalDataToModel();
  },

  setupListeners() {
    // If a new search occurs, load the dispute menu
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);

    this.listenTo(this.emailModel, 'unableToEmail', () => {
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
    });

    this.listenTo(this.dateReceivedModel, 'change:value', function() {
      const dateSubmittedView = this.getChildView('dateSubmittedRegion');
      if (dateSubmittedView) {
        dateSubmittedView.removeErrorStyles();
      }
      this.hideDateWarning();
    }, this);

    this.listenTo(this.dateSubmittedModel, 'change:value', this.hideDateWarning, this);

    this.listenTo(this.formCompleteModel, 'change:value', this.render, this);
    this.listenTo(this.formEvidenceModel, 'update:evidence', function() {
      this.mixin_upload_updateReadyToUploadCount();
      this.hideFormEvidenceError();
    }, this);
    this.listenTo(this.uploadModel, 'update:file:count', this.mixin_upload_updateReadyToUploadCount, this);

    // Payment listeners
    this.listenTo(this.paymentTypeRadioModel, 'change:value', function(model, value) {
      if (value === RADIO_CODE_OFFICE) {
        this._showOfficePayment();
      } else {
        this._hideOfficePayment();
      }

      if (value === RADIO_CODE_FEE_WAIVER) {
        this._showFeeWaiver();
      } else {
        this._hideFeeWaiver();
      }
    }, this);


    this.listenTo(this.feeWaiverModel, 'upload:ready', function() {
      this.isUpload = true;
      this.render();
      this.feeWaiverModel.trigger('upload:start');
    }, this);

    this.listenTo(this.feeWaiverModel, 'upload:complete', this.onUploadComplete, this);
    
    this.listenTo(this.feeWaiverModel, 'lico:declined', function() {
      this.paymentTypeRadioModel.set({
        valuesToDisable: [RADIO_CODE_FEE_WAIVER],
        optionData: [{ value: RADIO_CODE_OFFICE, text: 'Office Payment' },
          { value: RADIO_CODE_FEE_WAIVER, text: 'Fee Waiver <span class="error-red"><i>(Declined)</i></span>' }],
      });
      this.feeWaiverModel.trigger('transition:declined');
      this.reRenderChildView('paymentTypeRegion');
      loaderChannel.trigger('page:load:complete');
    }, this);
    this.listenTo(this.feeWaiverModel, 'lico:approved', function() {
      this.paymentTypeRadioModel.set({
        optionData: [{ value: RADIO_CODE_OFFICE, text: 'Office Payment' },
          { value: RADIO_CODE_FEE_WAIVER, text: 'Fee Waiver <span class="success-green"><i>(Approved)</i></span>' }]
      });
      this.reRenderChildView('paymentTypeRegion');
      this.getUI('pageButtons').removeClass('hidden');
    }, this);
    this.listenTo(this.feeWaiverModel, 'cancel', function() { Backbone.history.navigate('main', { trigger: true }); });

    this.listenTo(this.feeWaiverModel, 'update:file:count', this.mixin_upload_updateReadyToUploadCount, this);

    /* late filing warning listeners */
    const updateLateFilingDateAndRender = () => {
      this.setLateFilingRulesDate();
      this.render();
    }

    this.listenTo(this.questionOneDropdownModel, 'change:value', () => {
      if (this.questionOneDropdownModel.getData() === DROPDOWN_CODE_NO) this.showQuestionTwo = true;
      else this.showQuestionTwo = false;
      updateLateFilingDateAndRender();
    });
    this.listenTo(this.questionTwoDropdownModel, 'change:value', updateLateFilingDateAndRender);
    this.listenTo(this.dateReceivedModel, 'change:value', updateLateFilingDateAndRender);
    this.listenTo(this.dateSubmittedModel, 'change:value', updateLateFilingDateAndRender);
  },

  setLateFilingRulesDate() {
    this.lateFilingRulesDate = null;
    let deemedRuleDayOffset = 0;
    if (this.questionOneDropdownModel.getData() === DROPDOWN_CODE_NO && this.questionTwoDropdownModel.getData() === DROPDOWN_CODE_NO) deemedRuleDayOffset = CALC_DAYS_Q2_NO;
    else if (this.questionOneDropdownModel.getData() === DROPDOWN_CODE_NO && this.questionTwoDropdownModel.getData() === DROPDOWN_CODE_YES) deemedRuleDayOffset = CALC_DAYS_Q2_YES;
    else if (this.questionOneDropdownModel.getData() === DROPDOWN_CODE_YES) deemedRuleDayOffset = CALC_DAYS_Q1_YES;
    this.lateFilingRulesDate = this.getRulesDateForFiling(deemedRuleDayOffset);
  },

  /* Upload supporting functions */
  _filesToUploadContainEvidence() {
    return _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.isEvidence();
    });
  },

  createFilePackageCreationPromise() {
    const fileDate = this.dateSubmittedModel.getData();
    const filePackagePromise = this._filesToUploadContainEvidence() ?
      filesChannel.request('create:filepackage:office', {
        package_date: fileDate,
        package_description: `Uploaded on ${Formatter.toDateAndTimeDisplay(Moment())}`,

        // File package created by the participant submitting request
        created_by_id: this.participantToUse.id,
        // Cannot use access code because limited dispute return does not make that info available
        created_by_access_code: null
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
    const fileDate = this.dateSubmittedModel.getData();

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

  createFlag() {
    let flagType = '';
    if (this.requestType === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_REVIEW')) flagType = `create:review${this.isFiledLate() ? ':late' : ''}`;
    else if (this.requestType === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CORRECTION')) flagType = 'create:correction';
    else if (this.requestType === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CLARIFICATION')) flagType = 'create:clarification';

    const flagAttr = { flag_participant_id: this.participantToUse.id, related_object_id: this.docRequestModel.id }
    const flag = flagsChannel.request(flagType, flagAttr);
    if (!flag) return;
    
    const createFlagPromise = new Promise((res, rej) => flag.save().then(res, generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE', rej)));
    return createFlagPromise;
  },

  _routeToReceiptPage() {
    const receiptRoute = `${this.requestName}/receipt`;
    this.model.setReceiptData(this.generateReceiptData());
    Backbone.history.navigate(receiptRoute, { trigger: true });
  },

  performApiCallsAfterUpload() {
    const parallelTaskPromise = () => new Promise((res, rej) => this._createParallelTask().then(res, generalErrorFactory.createHandler('ADMIN.TASK.SAVE', () => this._routeToReceiptPage())));

    loaderChannel.trigger('page:load');
    this._createDocRequestPromise().then((res) => {
      this.createFlag();
      const docRequestItems = this.docRequestModel.getRequestItems();
      docRequestItems.forEach((item) => {
        item.set({ outcome_doc_request_id: res.outcome_doc_request_id });
      });
      return new Promise((res, rej) => this.docRequestModel.saveRequestItems().then(res, rej))
    })
    .then(parallelTaskPromise)
    .then(() => {
      if (this.enablePayments && !this.feeIsInitiallyPaid) {
        this.savePaymentPromise().always(() => {
        loaderChannel.trigger('page:load');
        this._routeToReceiptPage();
        });
      } else {
        this._routeToReceiptPage();
      }
    }).catch(err => {
      console.log('[Error] OS Task creation failed', err);
      loaderChannel.trigger('page:load:complete');
    })
  },

  savePaymentPromise() {
    const self = this;
    const dfd = $.Deferred();
    const saveTransactionPromise = this.isOfficeMode ? _.bind(this.saveOfficePayment, this) :
      this.isFeeWaiverMode ? _.bind(this.saveFeeWaiverPayment, this) : _.bind(dfd.resolve, dfd);

    // Always save office
    this.disputeFeeModel.save(this.disputeFeeModel.getApiChangesOnly()).done(function() {
      saveTransactionPromise().done(function(response) {
        if (_.isEmpty(response)) {
          dfd.reject();
          return;
        }
        // Only run status change if payment was enabled
        self.saveStatusChangesAfterPaymentPromise(response)
          .done(response => dfd.resolve(response))
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            generalErrorFactory.createHandler('OS.STATUS.SAVE', () => dfd.reject())(err);
          });
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('OS.FEE.SAVE', () => dfd.reject())(err);
      });
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('OS.FEE.SAVE', () => dfd.reject())(err);
    });

    return dfd.promise();
  },

  _savePaymentTransaction(paymentTransactionData) {
    const dfd = $.Deferred();

    const newPaymentTransaction = this.disputeFeeModel.createPayment(_.extend(
      {
        payment_verified: 1,
        payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED'),
        office_payment_idir: this.currentUser ? this.currentUser.getUsername() : null,
      },
      paymentTransactionData
    ), { no_save: true });

    (new ExternalPaymentTransactionModel(newPaymentTransaction.toJSON())).save()
      .done(dfd.resolve)
      .fail(err => {
        // If save fails, remove payment transaction from the dispute fee
        this.disputeFeeModel.resetPaymentTransactions();
        dfd.reject(err);
      });
    return dfd.promise();
  },

  saveFeeWaiverPayment() {
    return this._savePaymentTransaction(_.extend({
        transaction_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'),
        payment_note: `Payor name: ${this.feeWaiverModel.getPayorName()}`,
        transaction_amount: 0
      }, this.feeWaiverModel.getStep1ApiData()
    ));
  },

  saveOfficePayment() {
    const paymentMethodText = this.paymentMethodModel.getSelectedText();
    return this._savePaymentTransaction({
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_OFFICE'),
      transaction_amount: this.disputeFeeModel.get('amount_due'),
      payment_note: `Payor name: ${this.payorModel.getData()}, Payment method: ${paymentMethodText}`
    });
  },

  saveStatusChangesAfterPaymentPromise(response) {
    const dfd = $.Deferred();

    // The response is actually a dispute fee, so save that back onto the fee used
    this.disputeFeeModel.set(this.disputeFeeModel.parse(response), { silent: true });

    const statusSaveModel = new ExternalDisputeStatusModel(_.extend({ file_number: this.dispute.get('file_number') }, this.statusDataAfterPayment));
    const statusUpdatePromise = !_.isEmpty(this.statusDataAfterPayment) && (this.dispute.checkStageStatus(0, [2, 3, 4]) || this.dispute.checkStageStatus(10, 103)) ?
      _.bind(statusSaveModel.save, statusSaveModel) :
      () => $.Deferred().resolve().promise();

    statusUpdatePromise()
      .done(() => {
        dfd.resolve();
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('OS.STATUS.SAVE', () => dfd.reject())(err);
      });

    return dfd.promise();
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
    const groupsToValidate = _.union([],
      this.validateGroup,
      this.isOfficeMode ? this.officeGroup : [],
      this.isFeeWaiverMode ? this.feeWaiverGroup : [],
      this.isReviewRequest ? this.questionOneDropdownModel.getData() === DROPDOWN_CODE_NO ? [...this.reviewGroup, 'questionTwoRegion'] : this.reviewGroup : [],
      this.isFiledLate() ? this.lateRequestGroup : [],
    );
    let is_valid = true;

    if (_.isFunction(this.submittedDateWarningFn)) {
      const warningMsg = this.submittedDateWarningFn(this.dateSubmittedModel.getData(), this.dateReceivedModel.getData());
      if (warningMsg) {
        this.showDateWarning(warningMsg);
      }
    }

    // Validate vanilla fields
    _.each(groupsToValidate, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    // Now validate the dates again
    if (Moment(this.dateSubmittedModel.getData()).isBefore(Moment(this.dateReceivedModel.getData()), 'days')) {
      const view = this.getChildView('dateSubmittedRegion');
      if (view) {
        view.showErrorMessage('Submitted date must be after the received date');
      }
      is_valid = false;
    } else if (_.isFunction(this.submittedDateWarningFn)) {
      const warningMsg = this.submittedDateWarningFn(this.dateSubmittedModel.getData(), this.dateReceivedModel.getData());
      if (warningMsg) {
        this.showDateWarning(warningMsg);
      }
    }

    //validate page items
    if(!this.isClarificationRequest) {
      const pageItemRegionsToValidate = ['docRequestRegion', 'docRequestItemRegion'];
      (pageItemRegionsToValidate || []).forEach(regionName => {
        try {
          const pageItemValidationResult = this.callMethodOnChild(regionName, 'callMethodOnSubView', ['validateAndShowErrors']);
          if (pageItemValidationResult === null) throw new Error();
          else is_valid = pageItemValidationResult && is_valid;
        } catch (err) {
          is_valid = this.callMethodOnChild(regionName, 'validateAndShowErrors') && is_valid;
        }
      });
    }

    // Perform other special handling
    if (this.isFiledLate && this.lateRequestModel.getData() === DROPDOWN_CODE_NO) {
      this.showLateFilingErrorMessage();
    }

    if (this.formCompleteModel.getData() === DROPDOWN_CODE_NO) {
      this.showFormCompleteErrorMessage();
      is_valid = false;
    }

    if (!this.formEvidenceModel.getReadyToUploadFiles().length) {
      this.showFormEvidenceError();
      is_valid = false;
    }

    if (this.dateWarningConfirmationModel.get('required') && this.dateWarningConfirmationModel.getData() === DROPDOWN_CODE_NO) {
      const view = this.getChildView('dateWarningRegion');
      view.showErrorMessage('This must be accepted to continue');
      is_valid = false;
    }

    if (this.enablePayments && this.isOfficeMode) {
      const amountValue = Number(this.paymentAmountModel.getData());
      if (amountValue && Number(this.disputeFeeModel.get('amount_due')) !== amountValue) {
        is_valid = false;
        const view = this.getChildView('paymentAmountRegion');
        if (view) {
          view.showErrorMessage('Payment amount must match the amount due');
        }
      }
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

  showLateFilingErrorMessage() {
    const msg = `You must select 'Yes'`;
    const view = this.getChildView('lateRequestRegion');
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

  showDateWarning(warningMsg) {
    this.dateWarningMsg = warningMsg;
    this.dateWarningConfirmationModel.set('required', true);
    this.getUI('dateWarning').html(warningMsg);
    this.getUI('dateWarningContainer').removeClass('hidden');
  },

  hideDateWarning() {
    this.dateWarningMsg = '';
    this.dateWarningConfirmationModel.set('required', false);
    this.getUI('dateWarning').html('');
    this.getUI('dateWarningContainer').addClass('hidden');
  },

  _hideOfficePayment() {
    this.isOfficeMode = false;
    this.getUI('officePayContainer').hide();
  },

  _showOfficePayment() {
    this.isOfficeMode = true;
    this.isFeeWaiverMode = false;

    this.render();
    const officePaymentEle = this.getUI('officePayContainer');
    setTimeout(function() {
      animationChannel.request('queue', officePaymentEle, 'slideDown', { duration: 400 });
    }, 50);
  },

  _showFeeWaiver() {
    this.isOfficeMode = false;
    this.isFeeWaiverMode = true;

    this.render();
    const feeWaiverEle = this.getUI('feeWaiverPayContainer');
    setTimeout(function() {
      animationChannel.request('queue', feeWaiverEle, 'slideDown', { duration: 600 });
    }, 50);
  },


  _hideFeeWaiver() {
    this.isFeeWaiverMode = false;
    this.getUI('submit').removeClass('hidden');
    this.getUI('feeWaiverPayContainer').hide();
  },

  isFiledLate() {
    return this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? this.lateFilingRulesDate.isBefore(Moment(this.dateSubmittedModel.getData()).subtract(1, 'day').endOf('day')) : false;
  },

  getRulesDateForFiling(dayOffset) {
    if (!this.isReviewRequest || !this.dateSubmittedModel.getData() || !this.dateReceivedModel.getData() || !dayOffset) return null;
    const deemedRuleDate = Moment(this.dateReceivedModel.getData()).add(dayOffset, 'days');
    return UtilityMixin.util_getFirstBusinessDay(deemedRuleDate);
  },

  onBeforeRender() {
    if (this.participantToUse) {
      const descriptionBy = this.participantToUse.id;
      this.formEvidenceModel.set('description_by', descriptionBy);

      if (this.disputeFeeModel) {
        this.disputeFeeModel.set('payor_id', descriptionBy);

        // Update the disabled state of the fee waiver based on who was selected
        const existingValuesToDisable = this.paymentTypeRadioModel.get('valuesToDisable') || [];
        this.paymentTypeRadioModel.set({
          valuesToDisable: !this.participantToUse.isTenant() ? _.union(existingValuesToDisable, [RADIO_CODE_FEE_WAIVER]) : existingValuesToDisable,
        });

        // Now refresh the value if we disabled the previous selection
        if ( (this.paymentTypeRadioModel.get('valuesToDisable') || []).includes(this.paymentTypeRadioModel.getData())) {
          this.paymentTypeRadioModel.set('value', null, { silent: true });
          this.isFeeWaiverMode = false;
          this.isOfficeMode = false;
        }
      }
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
    this._renderPaymentRegions();
  },

  _renderEvidenceRegions() {
    const processingOptionsForDuplicates = {
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been selected to be uploaded`,
      customFileValidationFn: ((fileObj) => {
        const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
        const fileComparisonFn = (fileModel) => {
          if (!fileModel) return false;
          return fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
        };
        const matchingFileObj = _.find(this.uploadModel.getPendingUploads(), disputeEvidenceModel => {
          const files = disputeEvidenceModel.get('files');
          return files && files.find(fileComparisonFn)
        });
        return !matchingFileObj;
      }).bind(this)
    };

    
    this.showChildView('formEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.formEvidenceModel,
      showDelete: false,
      mode: this.isUpload ? 'upload' : null,
      hideDescription: true,
      fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
      processing_options: processingOptionsForDuplicates
    }));
  },

  _renderRequestDetailsRegions() {
    this.showChildView('firstNameRegion', new InputView({ model: this.firstNameModel }));
    this.showChildView('lastNameRegion', new InputView({ model: this.lastNameModel }));
    this.showChildView('emailRegion', new EmailView({ showOptOut: true, model: this.emailModel }));
    this.showChildView('phoneRegion', new InputView({ model: this.phoneModel }));
    this.showChildView('packageMethodRegion', new DropdownView({ model: this.packageMethodModel }));
    this.showChildView('addressRegion', new AddressView({ model: this.addressModel, useFlatLayout: true }));
    this.showChildView('docRequestRegion', new PageItem({
      stepText: 'Please select the document(s) that are selected in the application',
      subView: new CheckboxesView({ collection: this.docRequestTypeCollection }),
      forceVisible: true,
    }));
    this.showChildView('dateReceivedRegion', new InputView({ model: this.dateReceivedModel }));
    this.showChildView('dateSubmittedRegion', new InputView({ model: this.dateSubmittedModel }));
    this.showChildView('applicationNoteRegion', new InputView({ model: this.applicationNoteModel }));
    if (!this.isClarificationRequest) {
      this.showChildView('docRequestItemRegion', new PageItem({
        stepText: 'Please select the reason(s) that were selected in the application (at least one reason must be selected)',
        subView: new CheckboxesView({ collection: this.docRequestItemTypesCollection }),
        forceVisible: true,
      }));
    }
    if (this.isReviewRequest) {
      this.showChildView('questionOneRegion', new DropdownView({ model: this.questionOneDropdownModel }));
      this.showChildView('questionTwoRegion', new DropdownView({ model: this.questionTwoDropdownModel }));
    }

    if (this.isFiledLate()) {
      this.showChildView('lateRequestRegion', new DropdownView({ model: this.lateRequestModel }));
    }
    this.showChildView('formCompleteRegion', new DropdownView({ model: this.formCompleteModel }));
    this.showChildView('dateWarningRegion', new DropdownView({ model: this.dateWarningConfirmationModel }));
  },

  _renderPaymentRegions() {
    this.showChildView('paymentTypeRegion', new RadioView({ model: this.paymentTypeRadioModel }));

    if (this.isOfficeMode) {
      this.renderOfficePayment();
    } else if (this.isFeeWaiverMode) {
      this.renderFeeWaiver();
    }
  },

  renderOfficePayment() {
    this.showChildView('payorNameRegion', new InputView({ model: this.payorModel }));
    this.showChildView('paymentAmountRegion', new InputView({ model: this.paymentAmountModel }));
    this.showChildView('paymentMethodRegion', new DropdownView({ model: this.paymentMethodModel }));
  },

  renderFeeWaiver() {
    const feeWaiverRegion = this.getRegion('feeWaiverRegion');
    if (feeWaiverRegion) {
      this.showChildView('feeWaiverRegion', new FeeWaiverView({
        hideUploadControls: true,
        isUpload: this.isUpload,
        model: this.feeWaiverModel
      }));
    }
  },

  _toParticipantDisplay(participant) {
    if (!participant) {
      return;
    }
    return `${participant.isTenant() ? 'Tenant' : 'Landlord'} - Initials ${participant.getInitialsDisplay()} (${participant.isRespondent() ? 'Respondent' : 'Applicant'})`;
  },

  templateContext() {
    return {
      requestName: this.requestName,
      requestTitle: this.requestTitle || `Submit Request for ${this.capitalizedRequestName}`,

      dateContinueMsg: this.dateContinueMsg || DEFAULT_DATE_CONTINUE_MSG,
      enablePayments: this.enablePayments,
      showDateWarning: !!this.dateWarningConfirmationModel.get('required'),
      dateWarningMsg: this.dateWarningMsg,
      isReview: this.isReviewRequest,

      fileNumber: this.dispute.get('file_number'),
      isUpload: this.isUpload,
      showFormContent: this.participantToUse,
      participantToUse: this.participantToUse,
      accessCodeForDisplay: this.participantToUse ? `<b>${this._toParticipantDisplay(this.participantToUse)}</b>` : '-',
      isFiledLate: this.isFiledLate(),
      lateDays: this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? this.lateFilingRulesDate.diff(Moment(this.dateReceivedModel.getData()), 'days') : 0,
      lateFilingRulesDateDisplay: this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? Formatter.toDateDisplay(this.lateFilingRulesDate) : '-',
      showQuestionTwo: this.showQuestionTwo,

      // Payment variables
      paymentTypeDisplay: this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : null,
      paymentAmountDisplay: this.disputeFeeModel ? Formatter.toAmountDisplay(this.feeIsInitiallyPaid ? 0 : this.disputeFeeModel.get('amount_due'), true) : null,
      isOfficeMode: this.isOfficeMode,
      isFeeWaiverMode: this.isFeeWaiverMode,

      hideMainButtons: this.isFeeWaiverMode && this.feeWaiverModel.isStep1(),
      feeIsInitiallyPaid: this.feeIsInitiallyPaid,
    };
  }
});

_.extend(OfficeRequestPageView.prototype, UploadViewMixin, OfficePaymentsMixin, ParentViewMixin);
export default OfficeRequestPageView;
