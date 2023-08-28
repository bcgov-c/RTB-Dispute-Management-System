import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import UploadMixinModel from '../../../core/components/upload/UploadMixin_model';
import UploadEvidenceView from '../upload/UploadEvidence';
import SubstitutedServiceModel from '../../../core/components/substituted-service/SubstitutedService_model';
import ExternalDisputeStatusModel from '../../../office/components/external-api/ExternalDisputeStatus_model';
import FileDescription from '../../../core/components/files/file-description/FileDescription_model';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import QuestionView from '../../../core/components/question/Question';
import QuestionModel from '../../../core/components/question/Question_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import PageItem from '../../../core/components/page/PageItem';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import ViewMixin from '../../../core/utilities/ViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './SubstitutedServicePage.scss';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const noticeChannel = Radio.channel('notice');
const flagsChannel = Radio.channel('flags');
const taskChannel = Radio.channel('tasks');
const loaderChannel = Radio.channel('loader');
const claimsChannel = Radio.channel('claims');

const YES_CODE = 1;
const NO_CODE = 0;
const DROPDOWN_CODE_EMAIL = '1';
const DROPDOWN_CODE_TEXT = '2';
const DROPDOWN_CODE_SOCIAL_MEDIA = '3';
const DROPDOWN_CODE_OTHER = '4';

const FILE_DESCRIPTION_TITLE = 'Proof to Support Requested Service Method';
const FILE_DESCRIPTION_DESCRIPTION = 'Supporting evidence that shows that the requested substituted service method is a valid way of serving the associated respondent';
const QUESTION_ONE_LABEL = 'Do you have the document(s) listed above and need a substituted service order?';
const QUESTION_ONE_DESCRIPTION_LABEL = 'Describe the specific documents that are you seeking substituted service for';
const QUESTION_ONE_DESCRIPTION_HELP_TEXT = 'Provide the name and a brief description of the document that you are seeking substituted service for.';
const QUESTION_TWO_LABEL = 'Who are you serving the above document(s) to?';
const QUESTION_TWO_HELP_TEXT = `
<p>Select the party that you are requesting to serve.</p>
<p>If two parties have the same initials, refer to each party's unique access code on your Notice of dispute resolution proceeding.</p>
`;
const QUESTION_THREE_HELP_HTML = `
<span>Serving documents by email can only be used if a party has provided an email address specifically for service. Learn more about</span>
<a className="static-external-link" href="javascript:;" url="http://www.gov.bc.ca/landlordtenant/service">service rules</a> or contact the <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>
`;

const SERVICE_OPTION_DESCRIPTION_HELP_TEXT = 'Proof is required that shows reasonable effort to serve the documents via one of the available options.';
const SERVICE_METHOD_DESCRIPTION_HELP_TEXT = 'Please describe the method of service that you would like to use that is not allowed by law. For example: if requesting to serve using email/social media account/alternate address, provide the account information.';
const DOCUMENTS_TO_SERVE_HELP_TEXT = `
<p>You can request a special order to serve document(s) in a different way than is allowed by law. <b>Proof</b> is required that shows the party cannot be served via one of the available options allowed by law.</p>
<p>If you cannot serve documents using a method listed below, and would like to use a different method, select "No"</p>
`;
const SERVICE_OPTIONS_HELP_TEXT = `
<span>Documents must be served to another party in certain methods according to the law. Learn more about </span>
<a className="static-external-link" href="javascript:;" url="http://www.gov.bc.ca/landlordtenant/service">service rules</a> or contact the <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a> if you are unsure. 
`;

const SubstitutedServicePage = PageView.extend({

  initialize() {
    this.template = this.template.bind(this);
    this.createViewVars();
    this.createSubModels();
    this.setupListeners();
  },

  createViewVars() {
    this.showQuestionOneNoDisplay = false;
    this.showInputOne = false;
    this.showInputTwo = false;
    this.showInputThree = false;
    this.showMethodError = false;
    this.stepObj = {
      stepOneComplete: false,
      stepTwoComplete: false,
      stepThreeComplete: false,
      stepFourComplete: false,
    }
    this.dispute = disputeChannel.request('get');
    this.participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.serviceQuadrant = noticeChannel.request('get:subservices:quadrant:config', this.participant.id);
    this.activeNotice = noticeChannel.request('get:active');
    this.substitutedServiceModel = null;
    // Upload file vars
    this.fileUploader = null;
    this.isCancel = false;
    this.isUpload = false;
    this.evidenceRequired = true;
    this.uploadModel = new UploadMixinModel();
    this.fileDescription = new FileDescription({
      dispute_guid: this.dispute.get('dispute_guid'),
      title: FILE_DESCRIPTION_TITLE,
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_NOTICE'),
      description_code: '',
      description: FILE_DESCRIPTION_DESCRIPTION,
    });
    this.disputeEvidenceModel = new DisputeEvidenceModel({ file_description: this.fileDescription, required: true });
  },

  createSubModels() {
    this.questionOneModel = new QuestionModel({
      optionData: [{ name: 'sub-serve-q1-no', value: 0, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'sub-serve-q1-yes', value: 1, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      question_answer: null
    });

    this.questionOneDescriptionModel = new TextareaModel({
      errorMessage: 'Description is required',
      max: 100,
      min: 15,
      countdown: true,
      value: null,
    });

    this.questionTwoModel = new DropdownModel({
      optionData: this._getServiceToOptions(),
      labelText: this._getServiceToLabelText(),
      required: true,
      defaultBlank: true,
      value: null,
      showValidate: true,
    });

    this.questionThreeModel = new QuestionModel({
      optionData: [{ name: 'sub-serve-q3-no', value: 0, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'sub-serve-q3-yes', value: 1, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      question_answer: null
    });

    this.serviceOptionDescriptionModel = new TextareaModel({
      errorMessage: 'Description is required',
      max: 255,
      min: 25,
      required: true,
      countdown: true,
      value: null,
    });

    this.serviceOptionQuestionModel = new QuestionModel({
      optionData: [{ name: 'sub-serve-opts-no', value: NO_CODE, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'sub-serve-opts-yes', value: YES_CODE, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      question_answer: null,
    });

    this.serviceMethodTypeModel = new DropdownModel({
      labelText: 'Requested Method',
      optionData: [], // Will be set each render to get correct state
      defaultBlank: true,
      required: true,
      value: null,
    });
    

    this.serviceMethodTypeInputModel = new InputModel({
      value: null,
      required: false,
      maxLength: 200,
      minLength: 3,
    });
    this.serviceMethodTypeInput2Model = new InputModel({
      inputType: 'string',
      value: null,
      required: false,
      maxLength: 200,
      minLength: 3,
    });
    this.serviceMethodTypeInput3Model = new TextareaModel({
      errorMessage: 'Description is required',
      max: 255,
      min: 25,
      required: true,
      countdown: true,
      value: null,
    });

    this.serviceMethodDescriptionModel = new TextareaModel({
      errorMessage: 'Description is required',
      max: 255,
      min: 25,
      required: true,
      countdown: true,
      value: null,
    });

    this.serviceMethodResultDescriptionModel = new TextareaModel({
      errorMessage: 'Description is required',
      max: 255,
      min: 25,
      required: true,
      countdown: true,
      value: null,
    });
  },

  setupListeners() {
    this.listenTo(this.questionOneModel, 'page:itemComplete', () => {
      this.stepObj.stepOneComplete = this.questionOneModel.getData() === YES_CODE;
      this.render();
    });

    this.listenTo(this.questionTwoModel, 'page:itemComplete', () => {
      this.stepObj.stepTwoComplete = this.questionTwoModel.getData() !== null;
      this.render();
    });

    this.listenTo(this.questionThreeModel, 'page:itemComplete', () => {
      this.stepObj.stepThreeComplete = this.questionThreeModel.getData() !== null;
      this.render();
    });

    this.listenTo(this.serviceOptionQuestionModel, 'page:itemComplete', () => {
      this.showMethodError = this.serviceOptionQuestionModel.getData() === YES_CODE;
      this.stepObj.stepFourComplete = this.serviceOptionQuestionModel.getData() !== null;
      this.render();
    });

    this.listenTo(this.serviceMethodTypeModel, 'change:value', () => {
      this.serviceMethodTypeInputModel.set('value', null);
      this.serviceMethodTypeInput2Model.set('value', null);
      this.render();
    });

    this.listenTo(this.uploadModel, 'file:added', () => {
      this.getUI('addFileError').addClass('hidden');
    });
  },

  isPreAgreedEmailAvailable() {
    return this.questionThreeModel.getData() === YES_CODE;
  },

  getServiceOptionListText() {
    if (this.questionOneModel.getData() === NO_CODE) {
      return ['Registered Mail', 'In Person', 'Attached to Door', 'Regular Mail', 'Mail Slot or Box', 'Pre-agreed Fax', 
        ...(this.isPreAgreedEmailAvailable() ? ['Pre-agreed email'] : [])]
    }
    const isQuadrant1 = this.serviceQuadrant.quadrantId === 1;
    const isQuadrant2 = this.serviceQuadrant.quadrantId === 2;
    const isQuadrant3 = this.serviceQuadrant.quadrantId === 3;
    const isQuadrant4 = this.serviceQuadrant.quadrantId === 4;
    const noticeAssociatedToRespondent = this.activeNotice && this.activeNotice.isAssociatedToRespondent();
    const isReviewProcess = this.dispute.getProcess() === configChannel.request('get', 'PROCESS_REVIEW_HEARING');
    const isRespondentLogin = isReviewProcess && noticeAssociatedToRespondent ? this.participant.isApplicant() : this.participant.isRespondent();
    const isLandlord = this.participant.isLandlord();
    const claims = claimsChannel.request('get');
    const postOnDoorClaimList = configChannel.request('get', 'POST_ON_DOOR_CLAIM_CODE_LIST');
    const nonPostOnDoorCodesList = claims?.filter(claimModel => {
      const claimCode = claimModel.getClaimCode() || '';
      return !postOnDoorClaimList.includes(claimCode);
    });

    const defaultServiceOptions = ['Registered Mail', 'In Person'];
    const preAgreedEmail = this.isPreAgreedEmailAvailable() ? ['Pre-agreed email'] : [];
    const postOnDoor = (
      (isQuadrant1 && isRespondentLogin)
      || (isQuadrant1 && !isRespondentLogin && isLandlord && (nonPostOnDoorCodesList?.length < 1 && claims?.length)) 
      || (isQuadrant3 && isRespondentLogin)
      || (isQuadrant2 || isQuadrant4)
    ) ? ['Attached to Door'] : [];

    const mailAndFaxOptions = (
      (isQuadrant1 && isRespondentLogin)
      || (isQuadrant3 && isRespondentLogin)
      || (isQuadrant2 || isQuadrant4)
    ) ? ['Regular Mail', 'Mail Slot or Box', 'Pre-agreed Fax'] : [];

    return [...defaultServiceOptions, ...postOnDoor, ...preAgreedEmail, ...mailAndFaxOptions];
  },

  _getServiceToOptions() {
    if (!this.participant) {
      return [];
    }
    const participantIsApplicant = this.participant.isApplicant();
    const collectionToUse = participantsChannel.request(`get:${participantIsApplicant ? 'respondents' : 'applicants'}`);
    
    return collectionToUse.map(participant => {
      const shortDisplay = `${this.getLandlordTenantTextDisplay(participant)} ${participant.getInitialsDisplay()}`
      const text = `${shortDisplay} (Access Code ${participant.get('access_code')})`;
      return { value: String(participant.id), text, display: shortDisplay };
    });
  },

  _getServiceToLabelText() {
    if (!this.participant) {
      return;
    }
    return `${this.participant.isLandlord() ? 'Tenant' : 'Landlord'} being served`;
  },

  getLandlordTenantTextDisplay(participantModel) {
    return `${participantModel.isTenant() ? 'Tenant' : 'Landlord'}`;
  },

  onCancelButtonNoUpload() {
    Backbone.history.navigate('#access', { trigger: true });
  },

  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = disputeChannel.request('get').get('tokenParticipantId');

    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const fileDate = this.model.get('fileDate');
    const submitterName = this.model.get('submitterName');
    const participantId = disputeChannel.request('get').get('tokenParticipantId');
    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        file_date: fileDate ? fileDate : null,
        submitter_name: submitterName ? submitterName : null
      });
    });
  },

  createFilePackageCreationPromise() {
    // We do not want to create file package, but need to pass promise otherwise errors out
    return $.Deferred().resolve().promise();
  },

  getProcessingOptions() {
    const processingOptionsForDuplicates = {
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been selected to be uploaded`,
      customFileValidationFn: ((fileObj) => {
        const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
        const fileComparisonFn = (fileModel) => {
          if (!fileModel) return false;
          return fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
        };
        const matchingFileObj = _.find(this.model.getPendingUploads(), disputeEvidenceModel => {
          const files = disputeEvidenceModel.get('files');
          return files && files.find(fileComparisonFn);
        });
        return !matchingFileObj;
      }).bind(this)
    };

    return processingOptionsForDuplicates;
  },

  openOptOutModal() {
    const onContinue = (_modalView) => {
      _modalView.close();
      this.evidenceRequired = false;
      this.getUI('addFileError').addClass('hidden');
    }

    const modalChannel = Radio.channel('modals');
    modalChannel.request('show:standard', {
      title: 'Continue without providing evidence?',
      bodyHtml: `
        <p>Your request will likely be <b>denied</b> if you do not provide evidence that the requested method will work.</p>
        <p>If you can provide evidence, press 'Cancel' to return to the form.</p>
        <p>If you are sure you wish to proceed without evidence, press 'Continue without evidence'.</p>
      `,
      cancelButtonText: 'Cancel',
      primaryButtonText: 'Continue without evidence',
      modalCssClasses: 'dac__opt-out-modal',
      onContinue: onContinue
    });
  },

  validateAndSetQuestionOneDescription() {
    const view = this.getChildView('questionOneDescriptionRegion');
    if (!view) return false;
    
    const isValid = view.validateAndShowErrors();
    if (isValid) {
      this.stepObj.stepOneComplete = true;
      this.render();
    }
    
    return isValid;
  },

  validateAndShowErrors() {
    let isValid = true;
    const regionsToValidate = [
      'serviceOptionsDescriptionRegion',
      'serviceMethodTypeRegion',
      'serviceMethodTypeInputRegion',
      'serviceMethodTypeInput2Region',
      'serviceMethodResultDescriptionRegion',
      'formEvidenceRegion'
    ];
    if (this.questionOneModel.getData() === NO_CODE) regionsToValidate.push('questionOneDescriptionRegion');
    if (this.disputeEvidenceModel.get('files').length < 1 && this.evidenceRequired) {
      isValid = false;
      this.getUI('addFileError').removeClass('hidden');
    }
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && view.subView) isValid = view.subView.validateAndShowErrors() && isValid;
      else if (view) isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  submitRequest() {
    const valid = this.validateAndShowErrors();
    if (!valid) return;

    if (!this.uploadModel.hasReadyToUploadFiles()) {//if no files, skip upload
      this.onUploadComplete();
    } else {
      this.mixin_upload_transitionToUploadStep().always(() => {
        setTimeout(() => {
          if (this.isCancel) {
            return;
          }
          this.mixin_upload_startUploads();
        }, 1000);
      });
    }
  },

  generateReceiptData() {
    return {
      substitutedServiceModel: this.substitutedServiceModel,
      serviceQuadrant: this.serviceQuadrant,
      serviceTo: this.questionTwoModel.getSelectedOption().display,
      hasEmailServiceAgreement: this.isPreAgreedEmailAvailable(),
      disputeEvidenceModel: this.disputeEvidenceModel
    }
  },

  createSubServPromise() {
    const methodOption = this.serviceMethodTypeModel.getSelectedOption();
    const methodDescription = `${methodOption?.text}: ${
      methodOption?.value === DROPDOWN_CODE_OTHER ? this.serviceMethodTypeInput3Model.getData() : this.serviceMethodTypeInputModel.getData()}${
      methodOption?.value === DROPDOWN_CODE_SOCIAL_MEDIA ? `, UserID: ${this.serviceMethodTypeInput2Model.getData()}` : ''
    }`;
    this.substitutedServiceModel = new SubstitutedServiceModel({
      dispute_guid: this.dispute.get('dispute_guid'),
      request_source: configChannel.request('get', 'SUB_SERVICE_REQUEST_SOURCE_DA'),
      request_status: configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_RECEIVED'),
      service_by_participant_id: this.participant.id,
      service_to_participant_id: this.questionTwoModel.getData(),
      request_additional_info: this.getServiceOptionListText().join(", "),
      request_doc_type: this.questionOneModel.getData() === NO_CODE ? configChannel.request('get', 'SERVICE_DOC_TYPE_OTHER') : this.serviceQuadrant.documentId,
      request_doc_other_description: this.questionOneModel.getData() === NO_CODE ? this.questionOneDescriptionModel.getData() : null ,
      failed_method1_description: this.serviceOptionDescriptionModel.getData(),
      requested_method_description: methodDescription,
      requested_method_justification: this.serviceMethodResultDescriptionModel.getData(),
      request_method_file_desc_id: this.disputeEvidenceModel.get('files').length ? this.fileDescription.id : null
    });
    return new Promise((res, rej) => this.substitutedServiceModel.save().then(res, generalErrorFactory.createHandler('OS.REQUEST.SUBSERVICE.CREATE', rej)))
  },

  createTask() {
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    const participantInitials = participant && participant.getInitialsDisplay() ? participant.getInitialsDisplay() : '-';

    const taskDescription = [
      `A substituted service request was submitted through the dispute access site. Submitter name: ${this.model.get('submitterName')}, Initials: ${participantInitials}, Access Code: ${this.model.get('accessCode')}.`
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);

    const taskData = {
      task_text: taskDescription,
      dispute_guid: this.dispute.get('dispute_guid'),
      task_activity_type: configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_SUB_SERVICE'),
      task_link_id: this.substitutedServiceModel.id,
      task_linked_to: configChannel.request('get', 'TASK_LINK_SUB_SERVE'),
    };    
    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: null,
      docRequestModel: null,
    });
    return taskCreator.submitExternalTask(taskData);
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

  createDisputeFlag() {
    const flagAttr = { flag_participant_id: this.substitutedServiceModel.get('service_to_participant_id'), related_object_id: this.substitutedServiceModel.id, }
    const flag = flagsChannel.request('create:subservice:requested', flagAttr);
    if (!flag) return;

    return new Promise((res, rej) => flag.save().then(res, generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE', rej)));
  },

  onUploadComplete() {
    const createSubServPromise = () => this.createSubServPromise();
    const createTaskPromise = () => new Promise((res, rej) => this.createTask().then(res).catch(generalErrorFactory.createHandler('ADMIN.TASK.SAVE', rej)))
    const changeDisputeStatusPromise = () => this.changeDisputeStatusPromise();
    const createDisputeFlag = () => this.createDisputeFlag();
    
    // Sub-serve must be created first, as the record's ID is linked to flag and task
    loaderChannel.trigger('page:load');
    createSubServPromise().then(() => {
      return Promise.all([createDisputeFlag(), createTaskPromise()]);
    })
    .then(changeDisputeStatusPromise)
    .catch(() => {
      Backbone.history.navigate('#access', {trigger: true});
    })
    .then(() => {
      this.model.setReceiptData(this.generateReceiptData());
      this.model.set('routingReceiptMode', true);
      Backbone.history.navigate('substituted-service/receipt', { trigger: true });
    })
    .finally(() => {
      loaderChannel.trigger('page:load:complete');
    })
  },

  clickMethodErrorLink() {
    this.showMethodError = false;
    this.render();
  },

  className: `subserv ${PageView.prototype.className}`,

  onBeforeRender() {
    const isNoSelected = this.questionOneModel.getData() === NO_CODE;
    this.showQuestionOneNoDisplay = isNoSelected;
    this.questionOneDescriptionModel.set({ required: isNoSelected, disabled: false });
    if (this.questionOneModel.getData() === YES_CODE) this.questionOneDescriptionModel.set({ value: null });

    const participantDisplay = this.questionTwoModel?.getSelectedOption()?.display;
    if (participantDisplay) {
      this.QUESTION_THREE_LABEL = `Do you have a written agreement with (${participantDisplay}) to serve documents by email?`; 
    }

    this.serviceMethodTypeModel.set({
      optionData: [
        ...(!this.isPreAgreedEmailAvailable() ? [{ value: DROPDOWN_CODE_EMAIL, text: 'Email' }] : []),
        { value: DROPDOWN_CODE_TEXT, text: 'Text Message' },
        { value: DROPDOWN_CODE_SOCIAL_MEDIA, text: 'Social Media' },
        { value: DROPDOWN_CODE_OTHER, text: 'Other' }
      ],
    });

    const method = this.serviceMethodTypeModel.getData();
    if (method === DROPDOWN_CODE_EMAIL && !this.isPreAgreedEmailAvailable()) {
      this.serviceMethodTypeInputModel.set({
        labelText: 'Email Address',
        inputType: 'email',
        required: true,
      });
      this.showInputOne = true;
      this.showInputTwo = false;
      this.showInputThree = false;
    } else if (method === DROPDOWN_CODE_TEXT) {
      this.serviceMethodTypeInputModel.set({
        labelText: 'Phone Number',
        inputType: 'phone',
        required: true,
      });
      this.showInputOne = true;
      this.showInputTwo = false;
      this.showInputThree = false;
    } else if (method === DROPDOWN_CODE_SOCIAL_MEDIA) {
      this.serviceMethodTypeInputModel.set({
        labelText: 'Social Media Platform (i.e. Wechat, Facebook Messenger etc.)',
        inputType: 'string',
        required: true,
      });
      this.serviceMethodTypeInput2Model.set({
        labelText: 'Platform Username or UserID',
        inputType: 'string',
        required: true,
      });
      this.showInputOne = true;
      this.showInputTwo = true;
      this.showInputThree = false;
    } else if (method === DROPDOWN_CODE_OTHER) {
      this.serviceMethodTypeInputModel.set({
        required: false,
      });
      this.serviceMethodTypeInput2Model.set({
        required: false,
      });
      this.serviceMethodTypeInput3Model.set({
        required: true,
      });
      this.showInputOne = false;
      this.showInputTwo = false;
      this.showInputThree = true;
    } else {
      const resetValues = {
        required: false,
      };
      this.serviceMethodTypeInputModel.set(resetValues);
      this.serviceMethodTypeInput2Model.set(resetValues);
      this.serviceMethodTypeInput3Model.set(resetValues);
      this.showInputOne = false;
      this.showInputTwo = false;
      this.showInputThree = false;
    }
  },

  onRender() {
    // Always ensure file error is hidden on-render. It will be shown on-click, as needed
    this.getUI('addFileError').addClass('hidden');
    
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
      this.renderEvidence();
    } else {
      ViewMixin.prototype.initializeHelp(this, DOCUMENTS_TO_SERVE_HELP_TEXT);

      this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
      this.showChildView('questionOneRegion', new PageItem({
        stepText: QUESTION_ONE_LABEL,
        helpHtml: null,
        subView: new QuestionView({ model: this.questionOneModel }),
        stepComplete: this.questionOneModel.getData(),
        forceVisible: true
      }));

      if (this.showQuestionOneNoDisplay) {
        this.showChildView('questionOneDescriptionRegion', new PageItem({
          stepText: QUESTION_ONE_DESCRIPTION_LABEL,
          helpHtml: QUESTION_ONE_DESCRIPTION_HELP_TEXT,
          subView: new TextareaView({ model: this.questionOneDescriptionModel }),
          stepComplete: this.questionOneDescriptionModel.getData(),
          forceVisible: true
        }));
      }
      
      //displayed after question one is answered
      if (this.stepObj.stepOneComplete) {
        this.showChildView('questionTwoRegion', new PageItem({
          stepText: QUESTION_TWO_LABEL,
          helpHtml: QUESTION_TWO_HELP_TEXT,
          subView: new DropdownView({ model: this.questionTwoModel }),
          stepComplete: this.questionTwoModel.getData(),
          forceVisible: true
        }));
      }

      //displayed after question 2 is answered
      if (this.stepObj.stepOneComplete && this.stepObj.stepTwoComplete) {
        this.showChildView('questionThreeRegion', new PageItem({
          stepText: this.QUESTION_THREE_LABEL,
          helpHtml: QUESTION_THREE_HELP_HTML,
          subView: new QuestionView({ model: this.questionThreeModel }),
          stepComplete: this.questionThreeModel.getData(),
          forceVisible: true
        }));
      }
      
      //displayed after question 3 is answered
      if (this.stepObj.stepOneComplete && this.stepObj.stepTwoComplete && this.stepObj.stepThreeComplete) {
        this.showChildView('serviceOptionsQuestionRegion', new PageItem({
          stepText: null,
          helpHtml: null,
          subView: new QuestionView({ model: this.serviceOptionQuestionModel }),
          stepComplete: this.serviceOptionQuestionModel.getData(),
          forceVisible: true
        }));
      }

      //displayed after question 4 is answered No
      if (this.stepObj.stepOneComplete && this.stepObj.stepTwoComplete && this.stepObj.stepThreeComplete && this.stepObj.stepFourComplete
            && !this.showMethodError) {
        this.showChildView('serviceMethodTypeRegion', new PageItem({
          stepText: `What method of substituted service are you requesting?`,
          helpHtml: SERVICE_METHOD_DESCRIPTION_HELP_TEXT,
          subView: new DropdownView({ model: this.serviceMethodTypeModel }),
          stepComplete: this.serviceMethodTypeModel.getData(),
          forceVisible: true
        }));

        if (this.showInputOne) {
          this.showChildView('serviceMethodTypeInputRegion', new InputView({
            model: this.serviceMethodTypeInputModel
          }));
        }

        if (this.showInputTwo) {
          this.showChildView('serviceMethodTypeInput2Region', new InputView({
            model: this.serviceMethodTypeInput2Model
          }));
        }

        if (this.showInputThree) {
          this.showChildView('serviceMethodTypeInput3Region', new PageItem({
            stepText: `List the details of the other method you are requesting`,
            helpHtml: ``,
            subView: new TextareaView({
              model: this.serviceMethodTypeInput3Model
            }),
            stepComplete: this.serviceMethodTypeInput3Model.getData(),
            forceVisible: true,
          }))
        }

        this.showChildView('serviceOptionsDescriptionRegion', new PageItem({
          stepText: `Please explain why you cannot serve the documents using the service methods listed above.`,
          helpHtml: SERVICE_OPTION_DESCRIPTION_HELP_TEXT,
          subView: new TextareaView({ model: this.serviceOptionDescriptionModel }),
          stepComplete: this.serviceOptionDescriptionModel.getData(),
          forceVisible: true
        }));

        this.showChildView('serviceMethodResultDescriptionRegion', new PageItem({
          stepText: `Why do you think the party will receive the documents using your requested service method?`,
          helpHtml: `Have they used the service platform recently? Do you have proof of communication using this method?`,
          subView: new TextareaView({ model: this.serviceMethodResultDescriptionModel }),
          stepComplete: this.serviceMethodResultDescriptionModel.getData(),
          forceVisible: true
        }));

        this.renderEvidence();
      }
    }
  },

  renderEvidence() {
    this.showChildView('formEvidenceRegion', new PageItem({
      stepText: 'Provide evidence that the requested method will result in the party receiving the documents',
      subView: new UploadEvidenceView({
        uploadModel: this.uploadModel,
        model: this.disputeEvidenceModel,
        showDelete: false,
        mode: this.isUpload ? 'upload' : null,
        hideDescription: true,
        fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
        processing_options: this.getProcessingOptions(),
      }),
      forceVisible: true
    }));
  },
  
  regions: {
    disputeRegion:'.subserv__overview-container',
    questionOneRegion: '.subserv__question-one',
    questionOneDescriptionRegion: '.subserv__question-one__description',
    questionTwoRegion: '.subserv__question-two',
    questionThreeRegion: '.subserv__question-three',
    serviceOptionsQuestionRegion: '.subserv__service-options__question',
    serviceOptionsDescriptionRegion: '.subserv__service-options__description',
    serviceMethodTypeRegion: '.subserv__service-method__type',
    serviceMethodTypeInputRegion: '.subserv__service-method__type-input',
    serviceMethodTypeInput2Region: '.subserv__service-method__type-input2',
    serviceMethodTypeInput3Region: '.subserv__service-method__type-input3',
    serviceMethodResultDescriptionRegion: '.subserv__service-method-result__description',
    formEvidenceRegion: '.subserv__evidence-upload'
  },

  ui() {
    return Object.assign({}, PageView.prototype.ui, {
      fileCounter: '.file-upload-counter',
      uploadingFilesProgress: '.da-upload-overall-file-progress',
      addFileError: '.subserv__evidence-upload__error',
    });
  },

  template() {
    return (
      <div className={`da-upload-page-wrapper ${this.isUpload ? 'upload' : '' }`}>
        <div className="subserv__container">
          <div className={`subserv__overview-container ${this.isUpload ? 'hidden' : ''}`}></div>
          <div className={`subserv__page-header ${this.isUpload ? 'hidden' : ''}`}>
            <span className="dac__page-header__icon dac__icons__menu__service"></span><span className="subserv__page-header__title">Application for Substituted Service</span>
          </div>
          <div className={`dac__page-header-container ${this.isUpload ? '' : 'hidden'} `}>
            <div className="dac__page-header">
              <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
              <span className="dac__page-header__title">Uploading please wait</span>
            </div>
            <div className="dac__page-header__instructions">
              File&nbsp;<b className="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b> {this.dispute.get('file_number')} </b>. When all files have uploaded, you will be provided with a submission receipt for your records.
            </div>
          </div>
          <div className={`subserv__questions-container ${this.isUpload ? 'hidden' : ''}`}>
            <p>   	
              In some cases, parties cannot serve a document using one of the <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution">methods required by law</a>.
              Use this application to apply for substituted service and request a different method of service.
            </p>
            <p>
              Your request will likely be denied if you do not provide <b>evidence</b> that the requested method will work. For example: if you are requesting to serve by email, provide copies of emails to show recent activity.
            </p>
            <div className="subserv__documents-to-serve-container">
              <div className="subserv__documents-to-serve">
                <span className="subserv__documents-to-serve__title">Based on the current status of this dispute file, you may need to serve the following document(s):</span>
                <span className="">
                  <a role="button" className="badge help-icon">?</a>
                  {this.renderJsxDocumentList()}
                </span>
              </div>
            </div>
            <div className="subserv__question-one"></div>
            {this.renderJsxQuestionOneNoDisplay()}
            <div className="subserv__question-two"></div>
            <div className="subserv__question-three"></div>
            <div className="subserv__service-options-container">
              {this.renderJsxServiceOptions()}
            </div>
          </div>
          {this.renderJsxSubServRequestFields()}
          {this.renderJsxPageButtons()}
          <div className="spacer-block-10"></div>
        </div>
      </div>
    );
  },

  renderJsxDocumentList() {
    if (!this.serviceQuadrant) return;
    return <>
      <ul>
        {
          this.serviceQuadrant.displayedDocumentList.map((document, index) => {
            return <li key={index}>{document}</li>;
          })
        }
      </ul>
    </>
  },

  renderJsxQuestionOneNoDisplay() {
    if (!this.showQuestionOneNoDisplay) return;
    
    const renderContinueButton = () => {
      if (this.stepObj.stepOneComplete) return 
      return <button type="button" className="subserv__question-one__continue-button btn btn-lg btn-standard option-button" onClick={() => this.validateAndSetQuestionOneDescription()}>Continue</button>;
    }
    
    return <>
      <div className="subserv__question-one__warning error-block warning">
        Based on the status of this dispute file, the document you are requesting to serve is unknown. If you are sure you have document(s) that you are not able to serve in a way allowed by the law, you can specify the document(s) below. 
        Learn more about <a className="static-external-link" href="javascript:;" url="http://www.gov.bc.ca/landlordtenant/service">service rules</a> or contact the&nbsp;<a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a> before submitting this application.
      </div>
      <div className="subserv__question-one__description"></div>
      {renderContinueButton()}
    </>
  },

  renderJsxServiceOptions() {
    if (!this.stepObj.stepOneComplete || !this.stepObj.stepTwoComplete || !this.stepObj.stepThreeComplete) return;
    const renderServiceOptions = () => <>
      <span className="subserv__service-options__title">The following service methods are available. Can you serve using one of these ways?</span>
      <a role="button" className="badge help-icon">?</a>
      <ul>
        {this.getServiceOptionListText().map((serviceOption, index) => {
          return <li key={index}>{serviceOption}</li>
        })}
      </ul>
    </>;

    ViewMixin.prototype.initializeHelp(this, SERVICE_OPTIONS_HELP_TEXT);
    
    return (
      <div>
        <div className="subserv__service-options">
          {renderServiceOptions()}
          <div className="subserv__service-options__question"></div>

          {this.showMethodError ? <>
            <div className="error-block"><p>
              Based on the information provided, you do not need to file a substituted service request. If you still want to proceed, <span className="general-link" onClick={() => this.clickMethodErrorLink()}>click here</span>.
            </p></div>
          </> : null}

          <div className="subserv__service-options__description"></div>
        </div>
      </div>
    );
  },

  renderJsxSubServRequestFields() {
    if (!this.stepObj.stepOneComplete || !this.stepObj.stepTwoComplete || !this.stepObj.stepThreeComplete) return;
    return (
      <div className={`subserv__bottom-section da-upload-page-wrapper ${this.isUpload ? 'upload' : '' }`}>
        <div className="subserv__service-method__type"></div>
        <div className="subserv__service-method__type-input-container">
          {this.showInputOne ? <div className="subserv__service-method__type-input"></div> : null}
          {this.showInputTwo ? <div className="subserv__service-method__type-input2"></div> : null}
          {this.showInputThree ? <div className="subserv__service-method__type-input3"></div> : null}
        </div>
        <div className="subserv__service-method-result__description"></div>
        <div className="subserv__evidence-upload"></div>
        <p className="subserv__evidence-upload__error error-block hidden">Please provide a copy of your proof. If you cannot provide them, <span className="subserv__evidence-upload__open-modal" onClick={() => this.openOptOutModal()}>click here</span></p>
        <div className="all-file-upload-ready-count hidden">
          <b className="glyphicon glyphicon-download"></b>&nbsp;<span className="file-upload-counter">0</span>&nbsp;ready to submit
        </div>
      </div>
    );
  },

  renderJsxPageButtons() {
    const allStepsComplete = Object.values(this.stepObj)?.every(step => !!step);
    return <div className="dac__page-buttons">
      <button className="btn btn-cancel btn-lg da-upload-cancel-button" onClick={(ev) => this.mixin_upload_onCancel(ev)}>{this.isUpload ? 'Cancel Remaining' : 'Cancel'}</button>
      {!this.isUpload && !this.showMethodError && allStepsComplete ? <button className="btn btn-standard btn-lg" onClick={() => this.submitRequest()}>Submit Request</button> : null}
    </div>
  },
})

_.extend(SubstitutedServicePage.prototype, ViewJSXMixin, UploadViewMixin);
export { SubstitutedServicePage }