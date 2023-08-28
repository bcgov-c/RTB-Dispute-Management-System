import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import DisputeEvidenceModel from '../../../../core/components/claim/DisputeEvidence_model';
import { CcrRequestItem } from '../../../components/ccrRequestItem/CcrRequestItem';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { ParentViewMixin } from '../../../../core/utilities/ParentViewMixin';

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const modalChannel = Radio.channel('modals');
const YES_CODE = 1;

const QUESTION_ONE_QUESTION_LABEL = 'Were you unable to attend the hearing due to circumstances that could not be anticipated and were not in your control (e.g., a medical emergency, an earthquake)?';
const QUESTION_ONE_DESCRIPTION_LABEL = `Please describe:
<ol>
<li>What happened that was beyond your control and could not have been anticipated which prevented you from attending the hearing; and
<li>What testimony or evidence you would have provided if you were at the hearing.</li>
</ol>`;

const QUESTION_ONE_HELP_TEXT = `You must show that the reasons you could not attend were:
<ul>
<li>beyond your control; and</li>
<li>not anticipated</li>
</ul>`;
const QUESTON_ONE_EVIDENCE_TITLE = "Proof that you were unable to attend the hearing";
const QUESTION_TWO_QUESTION_LABEL = 'Do you have new and relevant evidence that was not available at the time of the hearing?';
const QUESTION_TWO_DESCRIPTION_LABEL = 'List each item of new and relevant evidence, why it was not available at the hearing, and how it is relevant';
const QUESTION_TWO_HELP_TEXT = `A review may be granted on this basis if the applicant can prove <u>all of the following</u>:
<ul>
<li>the applicant has evidence that was not available at the time of the original hearing;</li>
<li>the evidence is new and relevant to the matter described in the initial application; and</li>
<li>the evidence is credible and it could reasonably be expected to have affected the result.</li>
</ul>`;

const QUESTON_TWO_EVIDENCE_TITLE = "New and relevant evidence";
const QUESTION_TWO_MODAL_BODY_HTML = `
<p>You claim you have new and relevant evidence that was not available at the time of the hearing. You must provide this evidence or your claim may not be successful. <b>There is no opportunity to add any evidence after the application for review has been submitted.</b></p>
<p>Are you sure you want to continue without providing the new and relevant evidence?  Press 'Cancel' to return to the form and upload evidence or press 'Continue without evidence' to proceed without uploading the new and relevant evidence.</p>
`; 
const QUESTION_THREE_QUESTION_LABEL = 'Do you have evidence that the decision was obtained by fraud?';
const QUESTION_THREE_DESCRIPTION_LABEL = 'Which information submitted for the initial hearing was false and what information would have been true? How did the person who submitted the information know it was false? How do you think the false information was used to get the desired outcome?';
const QUESTION_THREE_HELP_TEXT = `There is evidence that the original decision was obtained by fraud. A party must submit evidence to prove <u>all three</u> of the following:
<ul>
  <li>False information was submitted</li>
  <li>The person submitting the information knew that it was false</li>
  <li>The false information was used to get the outcome desired by the person who submitted it</li>
</ul>`;
const QUESTON_THREE_EVIDENCE_TITLE = "Evidence of fraud";
const QUESTION_THREE_MODAL_BODY_HTML = `
<p>You claim this decision and/or order was obtained by fraud. You must provide evidence or your claim may not be successful. <b>There is no opportunity to add any evidence after the application for review has been submitted.</b></p>
<p>Are you sure you want to continue without providing evidence of fraud? Press 'Cancel' to return to the form and upload evidence or press 'Continue without evidence' to proceed without uploading evidence of fraud.</p>
`;
const NOTHING_SELECTED_ERROR = "You must answer 'Yes' to at least one of the allowed grounds for review to submit a review request";

const ReviewPageStepTwo = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['uploadModel', 'docRequestModel']);
    this.template = this.template.bind(this);
    this.setupListeners();
    if (this.model.getReceiptData().stepTwoQuestionTwoData) return;
    this.questionOneDisputeEvidenceModel = new DisputeEvidenceModel({});
    this.questionOneQuestionModel = null;
    
    this.questionTwoDisputeEvidenceModel = new DisputeEvidenceModel({});
    this.questionTwoQuestionModel = null;
    this.questionTwoEvidenceRequired = false;
    this.questionTwoDescriptionModel = null;
    
    this.questionThreeDisputeEvidenceModel = new DisputeEvidenceModel({});
    this.questionThreeQuestionModel = null;
    this.questionThreeEvidenceRequired = false;
    this.questionThreeDescriptionModel = null;
  },

  setupListeners() {
    this.listenTo(this.model, 'upload:complete', () => {
      const regions = ['questionOneRegion', 'questionTwoRegion', 'questionThreeRegion'];

      regions.forEach((region) => {
        this.getChildView(region).onUploadComplete();
      });
    });

    this.listenTo(this.uploadModel, 'file:added', () => {
      this.getUI('questionTwoFileError').addClass('hidden');
      this.getUI('questionThreeFileError').addClass('hidden');
    });

    const questionOneModel = (this.getChildView('questionOneRegion').getData() || {}).questionModel;
    const questionTwoModel = (this.getChildView('questionTwoRegion').getData() || {}).questionModel;
    const questionThreeModel = (this.getChildView('questionThreeRegion').getData() || {}).questionModel;

    this.listenTo(questionOneModel, 'page:itemComplete', this.hidePageError);
    this.listenTo(questionTwoModel, 'page:itemComplete', () => {
      this.questionTwoEvidenceRequired = questionTwoModel.getData() === YES_CODE;
      if (!this.questionTwoEvidenceRequired) this.getUI('questionTwoFileError').addClass('hidden');
      this.hidePageError();
    });
    this.listenTo(questionThreeModel, 'page:itemComplete', () => {
      questionThreeModel.getData() === YES_CODE ? this.questionThreeEvidenceRequired = true : this.questionThreeEvidenceRequired = false;
      if (!this.questionThreeEvidenceRequired) this.getUI('questionThreeFileError').addClass('hidden')
      this.hidePageError();
    });
  },

  hidePageError() {
    this.getUI('pageError').addClass('hidden');
  },

  validateAndShowErrors() {
    const regionsToValidate = ['questionOneRegion', 'questionTwoRegion', 'questionThreeRegion'];
    let isValid = true;

    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });


    const questionTwoEvidenceModel = (this.getChildView('questionTwoRegion').getData() || {}).disputeEvidenceModel;
    const questionThreeEvidenceModel = (this.getChildView('questionThreeRegion').getData() || {}).disputeEvidenceModel;

    if (questionTwoEvidenceModel.get('files').length < 1 && this.questionTwoEvidenceRequired) {
      isValid = false;
      this.getUI('questionTwoFileError').removeClass('hidden');
    }

    if (questionThreeEvidenceModel.get('files').length < 1 && this.questionThreeEvidenceRequired) {
      isValid = false;
      this.getUI('questionThreeFileError').removeClass('hidden');
    }
    
    if (this.hasQuestionSetToYes()) this.getUI('pageError').addClass('hidden');
    else this.getUI('pageError').removeClass('hidden');

    const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (!isValid || visible_error_eles.length >= 1) {
      animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      return;
    };

    if (isValid) this.setStepTwoData();
    return isValid;
  },

  setStepTwoData() {
    const stepTwoData = this.getData();
    this.model.setReceiptData({...this.model.getReceiptData(), ...stepTwoData })
  },

  getData() {
    return {
      stepTwoQuestionOneData: {
        ...this.getChildView('questionOneRegion').getData()
      },
      stepTwoQuestionTwoData: {
        questionTwoEvidenceRequired: this.questionTwoEvidenceRequired,
        ...this.getChildView('questionTwoRegion').getData()
      },
      stepTwoQuestionThreeData: {
        questionThreeEvidenceRequired: this.questionThreeEvidenceRequired,
        ...this.getChildView('questionThreeRegion').getData()
      }
    }
  },

  hasQuestionSetToYes() {
    return ['questionOneRegion', 'questionTwoRegion', 'questionThreeRegion'].some(regionName => {
      const { questionModel } = this.getChildView(regionName).getData();
      return questionModel && questionModel.getData() === YES_CODE;    
    });
  },

  openOptOutModal(region, bodyHtml) {
    modalChannel.request('show:standard', {
      title: 'Continue without providing evidence?',
      bodyHtml,
      cancelButtonText: 'Cancel',
      primaryButtonText: 'Continue without evidence',
      modalCssClasses: 'dac__opt-out-modal',
      onContinue: (_modalView) => {
        _modalView.close();
        region === 'questionTwoFileError' ? this.questionTwoEvidenceRequired = false : this.questionThreeEvidenceRequired = false
        this.getUI(region).addClass('hidden');
      }
    });
  },

  onRender() {
    const questionOneitemType = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_UNABLE_ATTEND');
    const questionTwoitemType = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_NEW_EVIDENCE');
    const questionThreeitemType = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DECISION_FRAUD');

    if (this.model.getReceiptData().stepTwoQuestionTwoData) {//means we have already submitted step2 data
      const { stepTwoQuestionOneData, stepTwoQuestionTwoData, stepTwoQuestionThreeData } = this.model.getReceiptData();
      this.questionOneDisputeEvidenceModel = stepTwoQuestionOneData.disputeEvidenceModel;
      this.questionOneQuestionModel = stepTwoQuestionOneData.questionModel;

      this.questionTwoDisputeEvidenceModel = stepTwoQuestionTwoData.disputeEvidenceModel;
      this.questionTwoQuestionModel = stepTwoQuestionTwoData.questionModel;
      this.questionTwoEvidenceRequired = stepTwoQuestionTwoData.questionTwoEvidenceRequired;
      this.questionTwoDescriptionModel = stepTwoQuestionTwoData.descriptionModel;

      this.questionThreeDisputeEvidenceModel = stepTwoQuestionThreeData.disputeEvidenceModel;
      this.questionThreeQuestionModel = stepTwoQuestionThreeData.questionModel;
      this.questionThreeEvidenceRequired = stepTwoQuestionThreeData.questionThreeEvidenceRequired;
      this.questionThreeDescriptionModel = stepTwoQuestionThreeData.descriptionModel;
    }

    this.showChildView('questionOneRegion', new CcrRequestItem({
      model: this.model,
      uploadModel: this.uploadModel,

      itemType: questionOneitemType,
      docRequestItemModel: this.docRequestModel.getRequestItems().at(1),
      
      disputeEvidenceModel: this.questionOneDisputeEvidenceModel,

      questionModel: this.questionOneQuestionModel,
      enableQuestion: true,
      enableEvidence: true,

      evidenceTitle: QUESTON_ONE_EVIDENCE_TITLE,
      evidenceHelp: QUESTION_ONE_HELP_TEXT,

      questionLabel: QUESTION_ONE_QUESTION_LABEL,
      questionHelp: QUESTION_ONE_HELP_TEXT,
      
      descriptionLabel: QUESTION_ONE_DESCRIPTION_LABEL,

      descriptionMax: 1000,
      descriptionMin: 50
    }));

    this.showChildView('questionTwoRegion', new CcrRequestItem({
      model: this.model,
      uploadModel: this.uploadModel,

      itemType: questionTwoitemType,
      docRequestItemModel: this.docRequestModel.getRequestItems().at(2),
      
      disputeEvidenceModel: this.questionTwoDisputeEvidenceModel,

      questionModel: this.questionTwoQuestionModel,
      enableQuestion: true,
      enableEvidence: true,

      evidenceTitle: QUESTON_TWO_EVIDENCE_TITLE,
      evidenceHelp: QUESTION_TWO_HELP_TEXT,

      questionLabel: QUESTION_TWO_QUESTION_LABEL,
      questionHelp: QUESTION_TWO_HELP_TEXT,
      
      descriptionModel: this.questionTwoDescriptionModel,
      descriptionLabel: QUESTION_TWO_DESCRIPTION_LABEL,
      descriptionHelp: QUESTION_TWO_HELP_TEXT,

      descriptionMax: 500,
      descriptionMin: 50
    }));

    this.showChildView('questionThreeRegion', new CcrRequestItem({
      model: this.model,
      uploadModel: this.uploadModel,

      itemType: questionThreeitemType,
      docRequestItemModel: this.docRequestModel.getRequestItems().at(3),
      
      disputeEvidenceModel: this.questionThreeDisputeEvidenceModel,

      questionModel: this.questionThreeQuestionModel,
      enableQuestion: true,
      enableEvidence: true,

      evidenceTitle: QUESTON_THREE_EVIDENCE_TITLE,
      evidenceHelp: QUESTION_THREE_HELP_TEXT,

      questionLabel: QUESTION_THREE_QUESTION_LABEL,
      questionHelp: QUESTION_THREE_HELP_TEXT,
      
      descriptionModel: this.questionThreeDescriptionModel,
      descriptionLabel: QUESTION_THREE_DESCRIPTION_LABEL,
      descriptionHelp: QUESTION_THREE_HELP_TEXT,

      descriptionMax: 500,
      descriptionMin: 50
    }));
  },

  className: "dar-step-two",
  regions: {
    questionOneRegion: '.dar-step-two__question-one',
    questionTwoRegion: '.dar-step-two__question-two',
    questionThreeRegion: '.dar-step-two__question-three'
  },

  ui: {
    pageError: '.dar-step-two__error',
    questionTwoFileError: '.dar-step-two-question-two__review-upload__error',
    questionThreeFileError: '.dar-step-two-question-three__review-upload__error'

  },
  
  template() {
    return (
      <>
        <div className="dac__page-header-container">
          <div className="dac__page-header">
            <span className="dac__page-header__icon dac__icons__menu__service"></span>
            <span className="dac__page-header__title">Request a Review - Step 3</span>
          </div>
        </div>
        <div className="dar-step-two__question-one"></div>
        <div className="dar-step-two__question-two"></div>
        <p className={`dar-step-two-question-two__review-upload__error error-block hidden`}>Please provide a copy of the document(s). If you cannot provide them, <span className="ccr__add-file__open-modal" onClick={() => this.openOptOutModal('questionTwoFileError', QUESTION_TWO_MODAL_BODY_HTML)}>click here</span></p>
        <div className="dar-step-two__question-three"></div>
        <p className={`dar-step-two-question-three__review-upload__error error-block hidden`}>Please provide a copy of the document(s). If you cannot provide them, <span className="ccr__add-file__open-modal" onClick={() => this.openOptOutModal('questionThreeFileError', QUESTION_THREE_MODAL_BODY_HTML)}>click here</span></p>
        <p className={`dar-step-two__error error-block hidden`}>{NOTHING_SELECTED_ERROR}</p>
      </>
    )
  }
});

_.extend(ReviewPageStepTwo.prototype, ViewJSXMixin, ParentViewMixin);
export { ReviewPageStepTwo }