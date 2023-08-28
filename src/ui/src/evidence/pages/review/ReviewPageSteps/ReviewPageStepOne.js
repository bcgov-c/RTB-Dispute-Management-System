import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import DocRequestSelectView from '../../../../core/components/documents/doc-requests/DocRequestSelect';
import InputView from '../../../../core/components/input/Input';
import QuestionView from '../../../../core/components/question/Question';
import PageItem from '../../../../core/components/page/PageItem';
import { CcrRequestItem } from '../../../components/ccrRequestItem/CcrRequestItem';
import UploadViewMixin from '../../../../core/components/upload/UploadViewMixin';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { ParentViewMixin } from '../../../../core/utilities/ParentViewMixin';
import { showDocumentOptOutModal } from '../../../components/optout-modal/OptoutModal';
import UtilityMixin from '../../../../core/utilities/UtilityMixin';
/* this.getUI('addFileError') temporarily removed*/
const descriptionLabel = "Describe why you were unable to submit the Application for Review Consideration before the deadline. Upload supporting evidence below.";
const TRUE_CODE = 1;
const FALSE_CODE = 0;
const CALC_DAYS_Q1_YES = 2;
const CALC_DAYS_Q2_YES = 5;
const CALC_DAYS_Q2_NO = 15;
const questionHelp = `
<p>Parties can apply for review consideration of a decision within:</p>
<p><b>Two days</b>&nbsp;after receiving a decision or order related to:</p>
<ol>
  <li>An Order of Possession</li>
  <li>Sublet or assignment of a tenancy</li>
  <li>Notice to End Tenancy for Unpaid Rent</li>
</ol>
<p><b>Five days</b>&nbsp;after receiving a decision or order (other than an Order of Possession) related to:</p>
<ol>
  <li>Repairs or maintenance</li>
  <li>Terminating services or facilities</li>
  <li>A Notice to End Tenancy (except for unpaid rent)</li>
</ol>
<p><b>Fifteen days</b>&nbsp; after receiving a decision or order related to any other matter.</p>
`;

const disputeChannel = Radio.channel('dispute');
const documentsChannel = Radio.channel('documents');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const animationChannel = Radio.channel('animations');

const ReviewPageStepOne = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['docRequestModel', 'disputeEvidenceModel', 'uploadModel', 'stepOneModels']);

    this.setupListeners();
    this.questionOneItem = this.docRequestModel.getRequestItems().at(0);
    this.stepOneQuestionOneEvidenceModel = null;
    this.evidenceRequired = this.model.getReceiptData().stepOneQuestionOneData ? this.model.getReceiptData().stepOneQuestionOneData.evidenceRequired : true;
    this.dispute = disputeChannel.request('get');
    this.lateFilingRulesDate = null;
    this.setLateFilingRulesDate();
  },

  setupListeners() {
    const updateLateFilingDateAndRender = () => {
      this.setLateFilingRulesDate();
      this.render();
    }

    this.listenTo(this.stepOneModels.questionOneModel, 'page:itemComplete', () => {
      if (this.stepOneModels.questionOneModel.getData()) this.stepOneModels.questionTwoModel.set('question_answer', null, { silent: true });
      updateLateFilingDateAndRender();
    });

    this.listenTo(this.stepOneModels.questionTwoModel, 'page:itemComplete', updateLateFilingDateAndRender);
    this.listenTo(this.stepOneModels.dateDocumentReceivedModel, 'page:itemComplete', updateLateFilingDateAndRender);
  },

  openOptOutModal() {
    const onContinue = (_modalView) => {
      _modalView.close();
      this.evidenceRequired = false;
    }
    showDocumentOptOutModal(onContinue);
  },

  setLateFilingRulesDate() {
    this.lateFilingRulesDate = null;
    let deemedRuleDayOffset = 0;
    if (this.dispute.isCreatedAriC()) deemedRuleDayOffset = CALC_DAYS_Q2_NO;
    else if (this.stepOneModels.questionOneModel.getData() === FALSE_CODE && this.stepOneModels.questionTwoModel.getData() === FALSE_CODE) deemedRuleDayOffset = CALC_DAYS_Q2_NO;
    else if (this.stepOneModels.questionOneModel.getData() === FALSE_CODE && this.stepOneModels.questionTwoModel.getData() === TRUE_CODE) deemedRuleDayOffset = CALC_DAYS_Q2_YES;
    else if (this.stepOneModels.questionOneModel.getData() === TRUE_CODE) deemedRuleDayOffset = CALC_DAYS_Q1_YES;
    this.lateFilingRulesDate = this.getRulesDateForFiling(deemedRuleDayOffset);
  },

  shouldQuestionTwoBeShown() {
    return this.stepOneModels.questionOneModel.getData() === FALSE_CODE;
  },

  shouldEntirePageBeShown() {
    if (this.dispute.isCreatedAriC()) return true;
    return this.stepOneModels.questionOneModel.getData() === TRUE_CODE || this.stepOneModels.questionTwoModel.getData() !== null;
  },

  isFiledLate() {
    return this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? this.lateFilingRulesDate.isBefore(Moment().subtract(1, 'day').endOf('day')) : false;
  },

  getRulesDateForFiling(dayOffset) {
    if (!this.stepOneModels.dateDocumentReceivedModel.getData() || !dayOffset) return;
    const deemedRuleDate = Moment(this.stepOneModels.dateDocumentReceivedModel.getData()).add(dayOffset, 'days');
    return UtilityMixin.util_getFirstBusinessDay(deemedRuleDate);
  },

  validateAndShowErrors() {
    const regionsToValidate = ['dateDocumentReceivedRegion'];
    regionsToValidate.push('outcomeDocsRegion');
    if (!this.dispute.isCreatedAriC()) regionsToValidate.push('decisionQuestionOneRegion');

    if (this.shouldQuestionTwoBeShown() && !this.dispute.isCreatedAriC()) regionsToValidate.push('decisionQuestionTwoRegion');
    // if (this.shouldEntirePageBeShown()) regionsToValidate.push('dateDocumentReceivedRegion', 'reviewDocumentsRegion');
    if (this.isFiledLate()) regionsToValidate.push('addItemRegion');

    let isValid = true;
    (regionsToValidate || []).forEach(regionName => {
      try {
        const pageItemValidationResult = this.callMethodOnChild(regionName, 'callMethodOnSubView', ['validateAndShowErrors']);
        if (pageItemValidationResult === null) throw new Error();
        else isValid = pageItemValidationResult && isValid;
      } catch (err) {
        isValid = this.callMethodOnChild(regionName, 'validateAndShowErrors') && isValid;
      }
    });

    // if (this.disputeEvidenceModel.get('files').length < 1 && this.evidenceRequired) {
    //   isValid = false;
    //   this.getUI('addFileError').removeClass('hidden');
    // }

    const visible_error_eles = this.$('.error-block:visible').filter(function() { 
      return ($.trim($(this).html()) !== "" && !$(this).hasClass('error-block warning')); 
    });
    if (!isValid || visible_error_eles.length >= 1) {
      animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      isValid = false;
    };

    if (isValid) { 
      this.setDocRequestModel();
      this.setStepOneData();
    }

    return isValid;
  },

  setStepOneData() {
      const stepOneData = this.getData();

      if (!this.isFiledLate()) {
        this.uploadModel.removePendingUpload(stepOneData.stepOneQuestionOneData.disputeEvidenceModel);
        this.questionOneItem.set({ item_description: null });
      } 

      this.model.setReceiptData({...this.model.getReceiptData(), ...stepOneData })
  },

  getData() {
    const stepOneQuestionOne = this.getChildView('addItemRegion');

    return {
      stepOneQuestionOneData: {
        isLate: this.isFiledLate(),
        evidenceRequired: this.evidenceRequired,
        ...stepOneQuestionOne.getData()
      }
    }
  },

  setDocRequestModel() {
    const docSelectView = this.getChildView('outcomeDocsRegion');
    const { affected_documents, affected_documents_text, outcome_doc_group_id, request_sub_type  } = docSelectView.getPageApiDataAttrs();
    this.docRequestModel.set({ affected_documents, affected_documents_text, outcome_doc_group_id, request_sub_type,
          date_documents_received: this.stepOneModels.dateDocumentReceivedModel.getData() });
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

  onBeforeRender() {
    if (!this.isRendered()) return;
    if (this.getChildView('outcomeDocsRegion')) this.setDocRequestModel();//prevent outcomedocselect from clearing input
  },
  
  onRender() {
    const outcomeDocRequestCollection = documentsChannel.request('get:requests');
    const loggedInParticipant = disputeChannel.request('get').get('tokenParticipantId');
    this.showChildView('outcomeDocsRegion', new DocRequestSelectView({
      docGroupCollection: documentsChannel.request('get:all'),
      getValidDocFilesFromGroupFn: docGroup => {
        const requestsForGroup = outcomeDocRequestCollection.filter(req => req.get('outcome_doc_group_id') === docGroup.id);
        const hasCurrentUserReview = requestsForGroup.find(request => (
          !request.isPastProcess() &&
          request.isReview() &&
          request.get('submitter_id') === loggedInParticipant
        ));
        return hasCurrentUserReview ? [] : docGroup.getDocFilesThatCanRequestReview();
      },
      model: this.docRequestModel,
    }));

    if (!this.dispute.isCreatedAriC()) {
      this.showChildView('decisionQuestionOneRegion', new PageItem({
        stepText: 'Is this a decision or order(s) that relates to an Order of Possession, a notice to end tenancy for unpaid rent or an unreasonable denial of sublet or assignment by a landlord?',
        subView: new QuestionView({ model: this.stepOneModels.questionOneModel }),
        helpName: 'Payment reimbursement?',
        helpHtml: questionHelp,
        stepComplete: this.stepOneModels.questionOneModel.isValid(),
        forceVisible: true
      }));


      if (this.shouldQuestionTwoBeShown()) {
        this.showChildView('decisionQuestionTwoRegion', new PageItem({
          stepText: 'Is this a decision or order(s) that relate to repairs/maintenance, restricted services/facilities or a notice to end tenancy that is <b>not</b> for unpaid rent?',
          subView: new QuestionView({ model: this.stepOneModels.questionTwoModel }),
          helpName: 'Payment reimbursement?',
          helpHtml: questionHelp,
          stepComplete: this.stepOneModels.questionTwoModel.isValid(),
          forceVisible: true
        }));
      }
    }

    if (!this.shouldEntirePageBeShown()) return;
      
    this.showChildView('dateDocumentReceivedRegion', new PageItem({
      stepText: 'Provide the date you received the document(s) that you are requesting to be reviewed',
      subView: new InputView({ model: this.stepOneModels.dateDocumentReceivedModel }),
      helpName: 'Payment reimbursement?',
      stepComplete: this.stepOneModels.dateDocumentReceivedModel.isValid(),
      forceVisible: true
    }));


    const itemType = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_LATE_FILING');

    if (this.model.getReceiptData().stepOneQuestionOneData) {
      this.stepOneQuestionOneEvidenceModel = this.model.getReceiptData().stepOneQuestionOneData.disputeEvidenceModel;
    }

    this.showChildView('addItemRegion', new CcrRequestItem({
      model: this.model,

      uploadModel: this.uploadModel,

      itemType: itemType,
      itemCssClass: 'request-item__margin-bottom',
      docRequestItemModel: this.questionOneItem,
      
      disputeEvidenceModel: this.stepOneQuestionOneEvidenceModel,

      enableQuestion: false,
      enableEvidence: true,
      evidenceRequired: false,

      evidenceTitle: 'Proof you were unable to submit the Application for Review Consideration before the deadline',
      
      descriptionLabel: descriptionLabel,
      descriptionHelp: `If you do not submit evidence to support your late submission, your application may be dismissed. Your evidence must show how an exceptional circumstance caused your late submission. To learn more about exception circumstances, <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl36.pdf">visit our website</a>.`,

      descriptionMax: 1000,
      descriptionMin: 50
    }));

    const stepOneQuestionOneData = this.getChildView('addItemRegion');
    this.listenTo(stepOneQuestionOneData.disputeEvidenceModel, 'update:evidence', () => {
      this.stepOneQuestionOneEvidenceModel = stepOneQuestionOneData.disputeEvidenceModel;
    })

    // this.showChildView('reviewDocumentsRegion', new PageItem({
    //   stepText: "Please upload a copy of the decision and/or order(s) that you want reviewed",
    //   helpHtml: "Decision and/or order(s) that require review",
    //   subView: new UploadEvidenceView({
    //     uploadModel: this.uploadModel,
    //     model: this.disputeEvidenceModel,
    //     showDelete: false,
    //     mode: this.isUpload ? 'upload' : null,
    //     hideDescription: true,
    //     required: true,
    //     fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
    //     processing_options: this.getProcessingOptions(),
    //   }),
    //   stepComplete: true,
    //   forceVisible: true
    // }));
  },

  regions: {
    'outcomeDocsRegion': '.dar-step-one__outcome-docs',
    'decisionQuestionOneRegion': '.dar-step-one__question-one',
    'decisionQuestionTwoRegion': '.dar-step-one__question-two',
    'dateDocumentReceivedRegion': '.dar-step-one__received-date',
    'addItemRegion': '.dar-step-one__list',
    // 'reviewDocumentsRegion': '.dar-step-one__review-upload'
  },

  ui: {
    'addFileError': '.dar-step-one__review-upload__error'
  },
  
  template() {
    return (
      <>
        <div className="dac__page-header-container">
          <div className="dac__page-header">
            <span className="dac__page-header__icon dac__icons__menu__service"></span>
            <span className="dac__page-header__title">Request a Review - Step 2</span>
          </div>
          <div className="dac__page-header__instructions">
            <p>
            In limited circumstances, a landlord or a tenant may request a review of a decision or order. This is not a chance to reargue the case or review evidence that should have been presented at the original hearing. Instead, it's an opportunity for a landlord or tenant to ask that an arbitrator take a second look at an original decision or order on these grounds:
            </p>
            <ul>
              <li><b>New evidence:</b> There is new and relevant evidence that was not available at the time of the original hearing.</li>
              <li><b>Unable to attend:</b> One of the parties can prove they were unable to attend the original hearing due to unexpected circumstances beyond their control.One of the parties can prove they were unable to attend the original hearing due to unexpected circumstances beyond their control.</li>
              <li>
                <b>Fraud:</b> There is evidence that the original decision was obtained by fraud. A party must submit evidence to prove <u>all three</u> of the following:
                <ol type="a">
                  <li>False information was submitted</li>
                  <li>The person submitting the information knew that it was false</li>
                  <li>The false information was used to get the outcome desired by the person who submitted it</li>
                </ol>
              </li>
            </ul>
            <p>
              <b>All evidence must be provided at the time that the application for review is being completed as there is no opportunity to add more evidence after the application for review is submitted.</b>&nbsp;
              For more information contact the&nbsp;<a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>.
              Please review <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Policy Guideline 24: Review Consideration of a Decision or Order</a>&nbsp;or visit the&nbsp;<a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Residential Tenancy Branch website</a>&nbsp;for more information.
            </p>
            <p>If you requested and obtained a copy of the hearing recording from the Residential Tenancy Branch, do not submit it as part of your application for review consideration</p>
          </div>
        </div>

        <div className="dar-step-one__label da-label">
          <span className="dar-step-one__label__text">What is the date on the decision or order you are seeking review consideration for?</span>
        </div>
        <div className="dar-step-one__outcome-docs"></div>

        {!this.dispute.isCreatedAriC() ? 
        <>
          <div className="step dar-step-one__question-one"></div>
          {this.shouldQuestionTwoBeShown() ? <div className="step dar-step-one__question-two"></div> : null} 
        </>
        : null }

        {this.shouldEntirePageBeShown() ? <>
          <div className="dar-step-one__received-date"></div>
          {this.renderJsxLateFilingUI()}

          <div className="dar-step-one__review-upload"></div>
          <p className={`dar-step-one__review-upload__error error-block hidden`}>Please provide a copy of the document(s). If you cannot provide them, <span className="ccr__add-file__open-modal" onClick={() => this.openOptOutModal()}>click here</span></p>
        </> : null}
      </>
    )
  },

  renderJsxLateFilingUI() {
    const lateDays = this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? this.lateFilingRulesDate.diff(Moment(this.stepOneModels.dateDocumentReceivedModel.getData()), 'days') : 0;
    return (
      <div className={`dar-step-one__late-filing ${!this.isFiledLate() ? 'hidden' : ''}`}>
        <div className="dar-step-one__warning error-block warning">
          Warning: An Application for Review Consideration should be submitted by {Formatter.toDateDisplay(this.lateFilingRulesDate)}, which is {lateDays} days 
          after you received the decision or order. You must submit proof you were unable to submit the Application for Review Consideration before the deadline due to exceptional circumstances.
        </div>
        <div className="dar-step-one__list"></div>
      </div>
    )
  }
});

_.extend(ReviewPageStepOne.prototype, ViewJSXMixin, ParentViewMixin, UploadViewMixin);
export { ReviewPageStepOne }