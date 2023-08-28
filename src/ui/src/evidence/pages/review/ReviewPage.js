import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import UploadMixinModel from '../../../core/components/upload/UploadMixin_model';
import DocRequestModel from '../../../core/components/documents/doc-requests/DocRequest_model';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import DocRequestItemModel from '../../../core/components/documents/doc-requests/DocRequestItem_model';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import InputModel from '../../../core/components/input/Input_model';
import QuestionModel from '../../../core/components/question/Question_model';
import DisputeEvidenceCollection from '../../../core/components/claim/DisputeEvidence_collection';
import UploadEvidenceCollectionView from '../upload/UploadEvidenceCollectionView';
import FileDescription from '../../../core/components/files/file-description/FileDescription_model';
import BCLogo from '../../../core/static/Header_BCLogo_White.png';
import { ReviewPageStepOne, ReviewPageStepTwo, ReviewPageStepThreeAndFour } from './ReviewPageSteps';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { ParentViewMixin } from '../../../core/utilities/ParentViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './ReviewPage.scss';

const STEP_1 = 1;
const STEP_2 = 2;
const STEP_3 = 3;
const STEP_4 = 4;
const STEP_5 = 5;
const REQUEST_ITEMS = 4;

const backButtonPages = [STEP_2, STEP_3];
const nextButtonPages = [STEP_1, STEP_2, STEP_3, STEP_4];
const cancelButtonPages = [STEP_1, STEP_2, STEP_3];
const buttonText = {
  [STEP_1]: "Next",
  [STEP_2]: "Next",
  [STEP_3]: "",
  [STEP_4]: "Main Menu"
};

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const flagsChannel = Radio.channel('flags');
const participantsChannel = Radio.channel('participants');
const taskChannel = Radio.channel('tasks');
const Formatter = Radio.channel('formatter').request('get');

const TRUE_CODE = 1;
const FALSE_CODE = 0;

const ReviewPage = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.reviewDataCache = this.model.get('reviewDataCache') || {};
    this.stepOneModels = this.model.getReceiptData() ? this.model.getReceiptData().stepOneModels : null;
    this.reviewModels = this.model.getReceiptData() ? this.model.getReceiptData().reviewModels : null;
    this.currentStep = STEP_1;
    this.setupModels();
    this.setupQuestionOneModels();
    this.initFileUploadVars();
  },

  initFileUploadVars() {
    // Upload support vars
    this.fileUploader = null;
    this.isCancel = false;
    this.isUpload = false;
  },

  initDocRequestItems() {
    for(let i=0; i<REQUEST_ITEMS; i++) {
      const docRequestItem = new DocRequestItemModel({});
      this.docRequestModel.getRequestItems().add(docRequestItem);
    }
  },

  setupModels() {
    this.dispute = disputeChannel.request('get');
    const participantId = this.dispute.get('tokenParticipantId');

    this.docRequestModel = this.reviewModels ? this.reviewModels.docRequestModel : new DocRequestModel({
      request_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_REVIEW'), 
      dispute_guid: this.dispute.get('dispute_guid'), 
      submitter_id: participantId,
      affected_documents_text: this.reviewDataCache && this.reviewDataCache.dr,
      outcome_doc_group_id: this.reviewDataCache && this.reviewDataCache.oid,
    });

    this.initDocRequestItems();

    this.fileDescription = this.reviewModels ? this.reviewModels.fileDescription : new FileDescription({
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST'),
      description: " "
    });

    this.disputeEvidenceModel = this.reviewModels ? this.reviewModels.disputeEvidenceModel : new DisputeEvidenceModel({
      title: "Form #RTB-2 and Additional Documents",
      file_description: this.fileDescription,
      required: true,
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST'),
    });

    this.uploadModel = this.reviewModels ? this.reviewModels.uploadModel : new UploadMixinModel();
    this.evidenceCollection = this.reviewModels ? this.reviewModels.evidenceCollection : new DisputeEvidenceCollection();

    const reviewModels = {
      docRequestModel: this.docRequestModel,
      fileDescription: this.fileDescription,
      disputeEvidenceModel: this.disputeEvidenceModel,
      uploadModel: this.uploadModel,
      evidenceCollection: this.evidenceCollection,
    }

    this.model.setReceiptData({ ...this.model.getReceiptData(), reviewModels });
  },

  setupQuestionOneModels() {
    const termsCheckbox = this.stepOneModels ? this.stepOneModels.termsCheckbox : new CheckboxModel({
      html: `I understand and certify that the Application for Review Consideration review must include one of the grounds listed above. `,
      checked: false,
      required: true
    });

    const questionOneModel = this.stepOneModels ? this.stepOneModels.questionOneModel : new QuestionModel({
      optionData: [{ name: 'decision-one-no', value: FALSE_CODE, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'decision-one-yes', value: TRUE_CODE, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      required: true,
      question_answer: this.reviewDataCache && this.reviewDataCache.q1,
    });

    const questionTwoModel = this.stepOneModels ? this.stepOneModels.questionTwoModel : new QuestionModel({
      optionData: [{ name: 'decision-two-no', value: FALSE_CODE, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'decision-two-yes', value: TRUE_CODE, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      required: true,
      question_answer: this.reviewDataCache && this.reviewDataCache.q2,
    });

    const dateDocumentReceivedModel = this.stepOneModels ? this.stepOneModels.dateDocumentReceivedModel : new InputModel({
      labelText: 'Date document received',
      inputType: 'date',
      errorMessage: 'Enter a date',
      required: true,
      showValidate: true,
      value: this.reviewDataCache && this.reviewDataCache.rd,
      apiMapping: 'date_documents_received',
    });

    this.stepOneModels = {
      termsCheckbox,
      questionOneModel,
      questionTwoModel,
      dateDocumentReceivedModel
    };

    this.model.setReceiptData({ ...this.model.getReceiptData(), stepOneModels: this.stepOneModels });
  },

  nextStep() {
    if (this.callMethodOnChild('reviewStep', 'validateAndShowErrors')) {
      this.model.setReceiptData({ ...this.model.getReceiptData(), docRequestModel: this.docRequestModel, disputeEvidenceModel: this.disputeEvidenceModel });
      if (this.currentStep === STEP_3) {
        this.setDocRequestItems();
        this.setEvidenceCollection();
        this.startFileUpload();
      } else {
        // Transition to next step
        this.currentStep++;
        this.routeToNextPage();
        this.render();
      }
    } else {
      //animate to error?
    }
  },

  setDocRequestItems() {
    this.docRequestModel.getRequestItems().remove(this.docRequestModel.getRequestItems().where({item_description: null}));
  },

  setDocRequestItemFileDescriptionId() {
    const { stepOneQuestionOneData, stepTwoQuestionOneData, stepTwoQuestionTwoData, stepTwoQuestionThreeData } = this.model.getReceiptData();
    const itemDataArray = [stepOneQuestionOneData, stepTwoQuestionOneData, stepTwoQuestionTwoData, stepTwoQuestionThreeData];

    itemDataArray.forEach((question) => {
      if (question) question.onUploadComplete();
    });
  },

  setEvidenceCollection() {
    const receiptData = this.model.getReceiptData();
    const StepOneQ1DisputeEvidenceModel = receiptData.stepOneQuestionOneData.disputeEvidenceModel;
    const StepTwoQ1DisputeEvidenceModel = receiptData.stepTwoQuestionOneData.disputeEvidenceModel;
    const StepTwoQ2DisputeEvidenceModel = receiptData.stepTwoQuestionTwoData.disputeEvidenceModel;
    const StepTwoQ3DisputeEvidenceModel = receiptData.stepTwoQuestionThreeData.disputeEvidenceModel;
    const evidenceCollectionArray = [this.disputeEvidenceModel, StepOneQ1DisputeEvidenceModel, StepTwoQ1DisputeEvidenceModel, StepTwoQ2DisputeEvidenceModel, StepTwoQ3DisputeEvidenceModel];
    
    evidenceCollectionArray.forEach((evidence) => {
      if (evidence.get('files').length > 0) this.evidenceCollection.add(evidence);
    });
  },

  startFileUpload() {
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

  previousStep() {
    if (this.currentStep === STEP_2 ) {
      this.callMethodOnChild('reviewStep', 'setStepTwoData');
    }
    this.currentStep--;
    this.routeToNextPage()
    this.render();
  },

  cancel() {
    modalChannel.request('show:standard', {
      title: 'Cancel Request?',
      bodyHtml: 
        `<p>If you exit this request, you will lose any information that you have entered. Exiting this process at this point will not result in a refund of any fees, but you will still be able to submit a request for review considerations using your existing payment.
        </p><p>Timeframes are very important to requests for review and delaying this process could lead to a late filing and a dismissal of your request if you are unable to provide a valid reason and proof for a late filing.  Are you sure you want to exit?
        </p>`,
      cancelButtonText: `Return to Request`,
      primaryButtonText: 'Yes, Exit',
      onContinue: (_modalView) => {
        _modalView.close();
        Backbone.history.navigate('#access', {trigger: true});
      }
    });
  },

  logout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  routeToNextPage() {
    if (this.currentStep === STEP_1) Backbone.history.navigate('review/step1');
    else if (this.currentStep === STEP_2) Backbone.history.navigate('review/step2');
    else if (this.currentStep === STEP_3) Backbone.history.navigate('review/step3');
    else if (this.currentStep === STEP_4) {
      this.model.set('routingReceiptMode', true);
      Backbone.history.navigate('review/receipt');
    } else if (this.currentStep === STEP_5) {
      Backbone.history.navigate('#access', {trigger: true});
    }
  },

  renderReviewStep() {
    this.$el.scrollTop(0);
    if (this.currentStep === STEP_1) this.showChildView('reviewStep', new ReviewPageStepOne({ model: this.model, uploadModel: this.uploadModel, docRequestModel: this.docRequestModel, disputeEvidenceModel: this.disputeEvidenceModel, stepOneModels: this.stepOneModels }));
    else if (this.currentStep === STEP_2) this.showChildView('reviewStep', new ReviewPageStepTwo({ model: this.model, uploadModel: this.uploadModel, docRequestModel: this.docRequestModel }));
    else if (this.currentStep === STEP_3) this.showChildView('reviewStep', new ReviewPageStepThreeAndFour({ model: this.model, docRequestModel: this.docRequestModel, disputeEvidenceModel: this.disputeEvidenceModel, step: STEP_3 }));
    else if (this.currentStep === STEP_4) this.showChildView('reviewStep', new ReviewPageStepThreeAndFour({ model: this.model, step: STEP_4, uploadModel: this.uploadModel }));
  },

  /* Upload support functions */

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
    //we do not want to create file package, but need to pass promise otherwise errors out
    return $.Deferred().resolve().promise();
  },

  prepareDocRequestData() {
    const fileDescriptionId = this.fileDescription.get('file_description_id');

    this.docRequestModel.set({
      file_description_id: fileDescriptionId,
      request_sub_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_SUB_TYPE_INSIDE'),
      request_source: configChannel.request('get', 'TASK_REQUEST_SOURCE_DA'),
      request_date: Moment().toISOString(),
      submitter_details: this.model.get('submitterName')
    });
  },

  createReviewTask() {
    const dispute = disputeChannel.request('get');
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const participant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    const participantInitials = participant && participant.getInitialsDisplay() ? participant.getInitialsDisplay() : '-';

    const taskDescription = [
      `A review request was submitted through the Dispute Access site. Submitter name ${this.model.get('submitterName')}, Initials: ${participantInitials}`,
      `Access code: ${this.model.get('accessCode')}. Date Request Submitted: ${Formatter.toDateDisplay(Moment())}.`, 
      `See the outcome document request section of the documents view for more information.`,
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);;

    const taskData = {
      task_text: taskDescription,
      task_activity_type: configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_REV_REQUEST'),
      task_linked_to: configChannel.request('get', 'TASK_LINK_DOC_REQUEST'),
      task_link_id: this.docRequestModel.id,
      dispute_guid: dispute.get('dispute_guid'),
    };
    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: null,
      docRequestModel: null,
    });
    this.model.set('outcomeDocRequestId', null);
    
    return taskCreator.submitExternalTask(taskData);
  },

  createFlag() {
    const { stepOneQuestionOneData } = this.model.getReceiptData();
    const flagAttr = { flag_participant_id: this.dispute.get('tokenParticipantId'), related_object_id: this.docRequestModel.id }
    const flag = flagsChannel.request(`create:review${stepOneQuestionOneData.isLate ? ':late' : ''}`, flagAttr);
    if (!flag) return;
    
    const createFlagPromise = new Promise((res, rej) => flag.save().then(res, generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE', rej)));
    return createFlagPromise;
  },

  onUploadComplete() {
    //reset vars
    this.isUpload = false;
    this.setDocRequestItemFileDescriptionId();
    this.prepareDocRequestData();

    const saveRequestPromise = () => new Promise((res, rej) => this.docRequestModel.save(this.docRequestModel.getApiChangesOnly()).then(res, generalErrorFactory.createHandler('OUTCOME.DOC.REQUEST.CREATE', rej)));
    const createReviewTaskPromise = () => new Promise((res, rej) => this.createReviewTask().then(res).catch(generalErrorFactory.createHandler('ADMIN.TASK.SAVE', rej)));

    loaderChannel.trigger('page:load');
    saveRequestPromise()
      .then(res => {
        this.createFlag();
        const docRequestItems = this.docRequestModel.getRequestItems();
        docRequestItems.forEach((item) => {
          item.set({ outcome_doc_request_id: res.outcome_doc_request_id });
        });
        return new Promise((res, rej) => this.docRequestModel.saveRequestItems().then(res, rej));
      })
      .then(createReviewTaskPromise)
      .then(() => {
        this.currentStep++;
        this.routeToNextPage();
        this.render();
        loaderChannel.trigger('page:load:complete');
      })
      .catch((err) => {
        console.log(err);
        this.model.trigger('search:reset');
        Backbone.history.navigate('#access', { trigger: true });
      });
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
        const matchingFileObj = _.find(this.uploadModel.getPendingUploads(), disputeEvidenceModel => {
          const files = disputeEvidenceModel.get('files');
          return files && files.find(fileComparisonFn);
        });
        return !matchingFileObj;
      }).bind(this)
    };

    return processingOptionsForDuplicates;
  },

  /* End of upload support functions*/
  
  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
    }

    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    if (this.isUpload) {
      this.showChildView('uploadRegion',new UploadEvidenceCollectionView({
        uploadModel: this.uploadModel,
        collection: this.evidenceCollection,
        showDelete: false,
        mode: this.isUpload ? 'upload' : null,
        hideDescription: true,
        fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
        processing_options: this.getProcessingOptions(),
      }));
    }

    this.renderReviewStep();
  },
  
  className: 'page-view da-review',
  regions: {
    disputeRegion: '.da-review__overview-container',
    reviewStep: '.da-review__step',
    uploadRegion: '.da-review__upload'
  },

  ui: {
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',
  },

  template() {
    return (
      <>
        <div className="print-page-top-container">
          <div className="print-page-logo">
              <img src={BCLogo} width="120"/>
          </div>
          <div className="print-page-title-container">
            <span className="print-page-sub-title">Residential Tenancy Branch</span>
            <span className="print-page-title">Review Submission Receipt</span>
          </div>
        </div>
        <div className="da-review__overview-container hidden-print"></div>
        <div className={`da-upload-page-wrapper ${this.isUpload ? 'upload' : '' }`}>
          <div className={`da-review__step ${this.isUpload ? 'hidden' : ''}`}></div>
          <div className={`da-upload-page-wrapper ${this.isUpload ? 'upload' : '' }`}>
            <div className={`dac__page-header-container ${this.isUpload ? '' : 'hidden'} `}>
              <div className="dac__page-header">
                <span className="dac__page-header__icon dac__icons__menu__service"></span>
                <span className="dac__page-header__title">Uploading please wait</span>
              </div>
              <div className="dac__page-header__instructions">
                File&nbsp;<b className="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b> {this.dispute.get('file_number')} </b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
              </div>
            </div>
            <div className={`dac__page-header-container ${this.isUpload ? '' : 'hidden'}`}>
              <div className="da-review__upload"></div>
              <div className="all-file-upload-ready-count hidden">
                <b className="glyphicon glyphicon-download"></b>&nbsp;<span className="file-upload-counter">0</span>&nbsp;ready to submit
              </div>
            </div>
          </div>
        </div>
        
        <div className="spacer-block-30"></div>
        <div className="dac__page-buttons">
          {this.renderJsxCancelButton()}
          {this.renderJsxBackButton()}
          {this.renderJsxNextButton()}
          {this.renderJsxLogoutButton()}
        </div>
        <div className="spacer-block-10"></div>

      </>
    )
  },

  renderJsxBackButton() {
    if (backButtonPages.includes(this.currentStep)) {
      return <button className={`btn btn-lg btn-standard da-review__buttons__back option-button step-next ${this.isUpload ? 'hidden' : ''}`} onClick={() => this.previousStep()}>Back</button>;
    }
  },

  renderJsxNextButton() {
    if (nextButtonPages.includes(this.currentStep)) {
      return <button className={`btn btn-lg btn-standard da-review__buttons__next${this.currentStep === STEP_3 ? 
        '--step3' : this.currentStep === STEP_2 ? '--step2' : ''} option-button step-next ${this.isUpload ? 'hidden' : ''}`} onClick={() => this.nextStep()}>{buttonText[this.currentStep]}</button>;
    }
  },

  renderJsxCancelButton() {
    if (cancelButtonPages.includes(this.currentStep) && !this.isUpload) {
     return <button className="btn btn-cancel btn-lg da-upload-cancel-button" onClick={() => this.cancel()}>Cancel</button>;
    }
  },

  renderJsxLogoutButton() {
    if (this.currentStep === STEP_4) {
      return <span className="receipt-logout-btn" onClick={() => this.logout()}>Logout</span>
    }
  }

});

_.extend(ReviewPage.prototype, ViewJSXMixin, ParentViewMixin, UploadViewMixin);
export { ReviewPage }