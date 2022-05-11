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
import Question from '../../../core/components/question/Question';
import Question_model from '../../../core/components/question/Question_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../core/components/textarea/Textarea';
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
const FILE_DESCRIPTION_TITLE = 'Proof to Support Requested Service Method';
const FILE_DESCRIPTION_DESCRIPTION = 'Supporting evidence that shows that the requested substituted service method is a valid way of serving the associated respondent';
const QUESTION_ONE_LABEL = 'Are you seeking substituted service for one or more of the documents listed above?';
const QUESTION_ONE_DESCRIPTION_LABEL = 'Describe the specific documents that are you seeking substituted service for';
const QUESTION_ONE_DESCRIPTION_HELP_TEXT = 'Provide the name and a brief description of the document that you are seeking substituted service for.';
const QUESTION_ONE_HELP_TEXT = 'Based on the status of your dispute file, you can request substituted service on one or more of the documents listed above. If you would like to serve another type of document that is not listed above, select "No" and provide further details.'

const QUESTION_TWO_LABEL = 'Who are you serving the above document(s) to?';
const QUESTION_TWO_HELP_TEXT = 'Select the party that you are requesting to serve documents to using a method not allowed by law.';
const QUESTION_THREE_HELP_HTML = `
  <span>Serving documents by email can only be used if a party has provided an email address specifically for service. Learn more about</span>
  <a className="static-external-link" href="javascript:;" url="http://www.gov.bc.ca/landlordtenant/service">service rules</a> or contact the <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>
`;
const SERVICE_OPTION_DESCRIPTION_HELP_TEXT = 'Proof is required that shows reasonable effort to serve the documents via one of the available options.';
const SERVICE_METHOD_DESCRIPTION_HELP_TEXT = 'Please describe the method of service that you would like to use that is not allowed by law. For example: if requesting to serve using email/social media account/alternate address, provide the account information.';

const DOCUMENTS_TO_SERVE_HELP_TEXT = `
<span>You can request a special order to serve one or more of the above documents in a different way than is allowed by law.</span>
<p>Proof is required that shows:</p>
<ul>
  <li>Reasonable effort to serve the documents via one of the available options allowed by law</li>
  <li>The other party is likely to receive the document using the proposed method</li>
  <li>If you would like to serve a document that is not listed above, select "No".</li>
</ul>`;

const SERVICE_OPTIONS_HELP_TEXT = `
<span>Documents must be served to another party in certain methods according to the law. Learn more about </span>
<a className="static-external-link" href="javascript:;" url="http://www.gov.bc.ca/landlordtenant/service">service rules</a> or contact the <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a> if you are unsure. 
`;

const SubstitutedServicePage = PageView.extend({
  className: `subserv ${PageView.prototype.className}`,

  initialize() {
    this.template = this.template.bind(this);
    this.createViewVars();
    this.createSubModels();
    this.setupListeners();
  },

  createViewVars() {
    this.showQuestionOneNoDisplay = false;
    this.stepObj = {
      stepOneComplete: false,
      stepTwoComplete: false,
      stepThreeComplete: false
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
    this.questionOneModel = new Question_model({
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

    this.questionThreeModel = new Question_model({
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
      this.setAssociatedQuestionOneData();
    });

    this.listenTo(this.questionTwoModel, 'page:itemComplete', () => {
      this.setAssociatedQuestionTwoData();
    });

    this.listenTo(this.questionThreeModel, 'page:itemComplete', () => {
      this.stepObj.stepThreeComplete = this.questionThreeModel.getData() !== null;
      this.render();
    })

    this.listenTo(this.uploadModel, 'file:added', () => {
      this.getUI('addFileError').addClass('hidden');
    });
  },

  setAssociatedQuestionOneData() {
    const isNoSelected = this.questionOneModel.getData() === NO_CODE;
    this.showQuestionOneNoDisplay = isNoSelected;
    this.questionOneDescriptionModel.set({ required: isNoSelected, disabled: false });
    if (this.questionOneModel.getData() === YES_CODE) this.questionOneDescriptionModel.set({ value: null });
    this.stepObj.stepOneComplete = this.questionOneModel.getData() === YES_CODE;
    this.render();
  },

  setAssociatedQuestionTwoData() {
    this.stepObj.stepTwoComplete = !!this.questionTwoModel.getData();
    if (!this.stepObj.stepTwoComplete) {
      this.render();
      return;
    };

    const participantDisplay = this.questionTwoModel.getSelectedOption().display;
    this.QUESTION_THREE_LABEL = `Do you have a written agreement with (${participantDisplay}) to serve documents by email?`;
    this.SERVICE_METHOD_RESULT_DESCRIPTION_LABEL = `Describe the reasons you believe that (${participantDisplay}) will receive the documents using the requested method`;
    this.SERVICE_METHOD_DESCRIPTION_LABEL = `What substituted service method are you requesting to serve ${participantDisplay}`;
    this.SERVICE_METHOD_RESULT_DESCRIPTION_HELP_TEXT = `
    <p>Evidence is required that shows the other party is likely to receive the documents using the proposed method of service. For example: if requesting to serve using email/social media account/alternate address, provide proof of recent activity or contact to demonstrate that the other party will receive documents.</p>
    <p>A substituted service request is unlikely to be granted if you do no provide proof (evidence) that the requested method will work.</p>`;
    this.render();
  },

  getServiceOptionListText() {
    if (this.questionOneModel.getData() === NO_CODE) {
      return ['Registered Mail', 'In Person', 'Posted on Door', 'Regular Mail', 'Mail Slot or Box', 'Pre-agreed Fax', 
        ...this.questionThreeModel.getData() === YES_CODE ? ['Pre-agreed email'] : []]
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
    const nonPostOnDoorCodesList = claims.filter(claimModel => {
      const claimCode = claimModel.getClaimCode() || '';
      return !postOnDoorClaimList.includes(claimCode);
    });

    const defaultServiceOptions = ['Registered Mail', 'In Person'];
    const preAgreedEmail = this.questionThreeModel.getData() === YES_CODE ? ['Pre-agreed email'] : [];
    const postOnDoor = (
      (isQuadrant1 && isRespondentLogin)
      || (isQuadrant1 && !isRespondentLogin && isLandlord && (nonPostOnDoorCodesList.length < 1 && claims.length)) 
      || (isQuadrant3 && isRespondentLogin)
      || (isQuadrant2 || isQuadrant4)
    ) ? ['Posted on Door'] : [];

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

  /* START of file upload support functions */
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
      title: 'Continue without providing proof?',
      bodyHtml: `
        <p>A substituted service request is unlikely to be granted if you do not provide proof (evidence) that the requested method will work. It is highly recommended that all substituted service requests are submitted with proof that the method will work.</p>
        <p>Are you sure you would like to continue without providing proof? Press 'Cancel' to return to the form and provide the proof or press 'Continue without proof' to proceed without providing the proof.</p>
        `,
      cancelButtonText: 'Cancel',
      primaryButtonText: 'Continue without proof',
      modalCssClasses: 'dac__opt-out-modal',
      onContinue: onContinue
    });
  },

  /* END of file upload support functions */

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
    const regionsToValidate = ['serviceOptionsDescriptionRegion', 'serviceMethodDescriptionRegion',  'serviceMethodResultDescriptionRegion', 'formEvidenceRegion'];
    if (this.questionOneModel.getData() === NO_CODE) regionsToValidate.push('questionOneDescriptionRegion');

    let isValid = true;

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
      hasEmailServiceAgreement: this.questionThreeModel.getData() === YES_CODE,
      disputeEvidenceModel: this.disputeEvidenceModel
    }
  },

  createSubServPromise() {
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
      requested_method_description: this.serviceMethodDescriptionModel.getData(),
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
    };    
    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: null,
      docRequestModel: null,
    });
    return taskCreator.submitExternalTask(taskData);
  },

  changeDisputeStatusPromise() {
    if (this.dispute.checkStageStatus(2, 20) && !this.dispute.getOwner()) {
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

  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();

    } else {
      ViewMixin.prototype.initializeHelp(this, DOCUMENTS_TO_SERVE_HELP_TEXT);

      this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
      this.showChildView('questionOneRegion', new PageItem({
        stepText: QUESTION_ONE_LABEL,
        helpHtml: QUESTION_ONE_HELP_TEXT,
        subView: new Question({ model: this.questionOneModel }),
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
          subView: new Question({ model: this.questionThreeModel }),
          stepComplete: this.questionThreeModel.getData(),
          forceVisible: true
        }));
      }
      //displayed after question 3 is answered
      if (this.stepObj.stepOneComplete && this.stepObj.stepTwoComplete && this.stepObj.stepThreeComplete) {
        this.showChildView('serviceMethodDescriptionRegion', new PageItem({
          stepText: this.SERVICE_METHOD_DESCRIPTION_LABEL,
          helpHtml: SERVICE_METHOD_DESCRIPTION_HELP_TEXT,
          subView: new TextareaView({ model: this.serviceMethodDescriptionModel }),
          stepComplete: this.serviceMethodDescriptionModel.getData(),
          forceVisible: true
        }));

        this.showChildView('serviceMethodResultDescriptionRegion', new PageItem({
          stepText: this.SERVICE_METHOD_RESULT_DESCRIPTION_LABEL,
          helpHtml: this.SERVICE_METHOD_RESULT_DESCRIPTION_HELP_TEXT,
          subView: new TextareaView({ model: this.serviceMethodResultDescriptionModel }),
          stepComplete: this.serviceMethodResultDescriptionModel.getData(),
          forceVisible: true
        }));
      }

      if (this.stepObj.stepOneComplete && this.stepObj.stepTwoComplete && this.stepObj.stepThreeComplete) {
        const participantDisplay = this.questionTwoModel.getSelectedOption().display;
        this.SERVICE_OPTION_DESCRIPTION_LABEL = `Please explain why you cannot use the method(s) above to serve documents to ${participantDisplay} and describe the attempts you have made using the method(s)`;

        this.showChildView('serviceOptionsDescriptionRegion', new PageItem({
          stepText: this.SERVICE_OPTION_DESCRIPTION_LABEL,
          helpHtml: SERVICE_OPTION_DESCRIPTION_HELP_TEXT,
          subView: new TextareaView({ model: this.serviceOptionDescriptionModel }),
          stepComplete: this.serviceOptionDescriptionModel.getData(),
          forceVisible: true
        }));
      }
    }

    if (this.stepObj.stepOneComplete && this.stepObj.stepTwoComplete && this.stepObj.stepThreeComplete) {
      const evidenceView = new UploadEvidenceView({
        uploadModel: this.uploadModel,
        model: this.disputeEvidenceModel,
        showDelete: false,
        mode: this.isUpload ? 'upload' : null,
        hideDescription: true,
        fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
        processing_options: this.getProcessingOptions(),
      });
  
      this.showChildView('formEvidenceRegion', new PageItem({
        stepText: 'Provide proof that the requested method will result in the party receiving the documents',
        subView: evidenceView,
        forceVisible: true
      }));
    }
  },
  
  regions: {
    disputeRegion:'.subserv__overview-container',
    questionOneRegion: '.subserv__question-one',
    questionOneDescriptionRegion: '.subserv__question-one__description',
    questionTwoRegion: '.subserv__question-two',
    questionThreeRegion: '.subserv__question-three',
    serviceOptionsDescriptionRegion: '.subserv__service-options__description',
    serviceMethodDescriptionRegion: '.subserv__service-method__description',
    serviceMethodResultDescriptionRegion: '.subserv__service-method-result__description',
    formEvidenceRegion: '.subserv__evidence-upload'
  },

  ui: {
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',
    addFileError: '.subserv__evidence-upload__error',
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
            <span>   	
              In some cases, parties may have difficulty serving a document using one of the methods required by law. 
              To serve documents in a different way, you must request a special order called substituted service. 
              Use this form to apply for substituted service when you want to serve another party using a method not allowed by the law.
            </span>
            <span> Learn more about <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/serving-notices-during-tenancy">service rules</a>.</span>
            <div className="subserv__documents-to-serve-container">
              <div className="subserv__documents-to-serve">
                <span className="subserv__documents-to-serve__title">Based on the current status of this dispute file, you need to serve <b>one or more</b> of the following documents:</span>
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
          <div className="dac__page-buttons">
          { !this.isUpload ? <button className="btn btn-cancel btn-lg da-upload-cancel-button" onClick={(ev) => this.mixin_upload_onCancel(ev)}>Cancel</button> : null }
            <button className={`btn btn-standard btn-lg ${this.isUpload || !this.stepObj.stepThreeComplete || !this.stepObj.stepTwoComplete || !this.stepObj.stepOneComplete  ? 'hidden' : ''}`} onClick={() => this.submitRequest()}>Submit Request</button>
          </div>
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
    const renderServiceOptions = () => {
      if (!this.stepObj.stepOneComplete || !this.stepObj.stepTwoComplete || !this.stepObj.stepThreeComplete) return;
      const serviceOptions = this.getServiceOptionListText();
      return (
        <>
          <span className="subserv__service-options__title">Based on this dispute file, the following service methods are available <b>without</b> a substituted service request:</span>
          <a role="button" className="badge help-icon">?</a>
          <ul>
            {serviceOptions.map((serviceOption, index) => {
              return <li key={index}>{serviceOption}</li>
            })}
          </ul>
        </>
      )
    }
    
    ViewMixin.prototype.initializeHelp(this, SERVICE_OPTIONS_HELP_TEXT);
    
    return (
      <div>
        <div className="subserv__service-options">
          {renderServiceOptions()}
          <div className="subserv__service-options__description"></div>
        </div>
      </div>
    );
  },

  renderJsxSubServRequestFields() {
    return (
      <div className={`subserv__bottom-section${this.isUpload ? 'upload' : '' }`}>
        <div className="subserv__service-method__description"></div>
        <div className="subserv__service-method-result__description"></div>
        <div className="subserv__evidence-upload"></div>
        <p className="subserv__evidence-upload__error error-block hidden">Please provide a copy of your proof. If you cannot provide them, <span className="subserv__evidence-upload__open-modal" onClick={() => this.openOptOutModal()}>click here</span></p>
        <div className="all-file-upload-ready-count hidden">
          <b className="glyphicon glyphicon-download"></b>&nbsp;<span className="file-upload-counter">0</span>&nbsp;ready to submit
        </div>
      </div>
    );
  }
})

_.extend(SubstitutedServicePage.prototype, ViewJSXMixin, UploadViewMixin);
export { SubstitutedServicePage }