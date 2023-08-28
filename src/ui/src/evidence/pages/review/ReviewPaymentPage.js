import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import DocRequestModel from '../../../core/components/documents/doc-requests/DocRequest_model';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import QuestionModel from '../../../core/components/question/Question_model';
import QuestionView from '../../../core/components/question/Question';
import DisputeFeeModel from '../../../core/components/payments/DisputeFee_model';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { ParentViewMixin } from '../../../core/utilities/ParentViewMixin';
import DocRequestSelectView from '../../../core/components/documents/doc-requests/DocRequestSelect';
import PageItemView from '../../../core/components/page/PageItem';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import Formatter from '../../../core/components/formatter/Formatter';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './ReviewPage.scss';
import './ReviewPaymentPage.scss';
import '../payment/DAPayment.scss';

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

const sessionChannel = Radio.channel('session');
const documentsChannel = Radio.channel('documents');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');
const paymentsChannel = Radio.channel('payments');
const participantsChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');

const TRUE_CODE = 1;
const FALSE_CODE = 0;

const ReviewPaymentPage = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    
    this.isLoaded = false;
    this.PAYMENT_METHOD_ONLINE = configChannel.request('get', 'PAYMENT_METHOD_ONLINE');
    this.PAYMENT_METHOD_FEE_WAIVER = configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER');
    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.reviewDataCache = this.model.get('reviewDataCache') || {};

    const reviewFees = paymentsChannel.request('get:fees').filter(f => f.isReviewFee() && f.get('payor_id') === this.loggedInParticipant.id);
    const unpaidFees = reviewFees.filter(f => !f.isPaid()).slice(-1);
    const latestUnpaidFee = unpaidFees?.[0];
    const areAllReviewFeesPaid = !unpaidFees.length;
    this.disputeFeeModel = areAllReviewFeesPaid || !latestUnpaidFee ? new DisputeFeeModel({
      fee_type: configChannel.request('get', 'PAYMENT_FEE_TYPE_REVIEW'),
      due_date: Moment().toISOString(),
      is_active: true,
      payor_id: this.loggedInParticipant.id,
      fee_description: configChannel.request('get', 'PAYMENT_FEE_DESCRIPTION_REVIEW'),
      amount_due: configChannel.request('get', 'PAYMENT_FEE_AMOUNT_REVIEW')
    }) : latestUnpaidFee;

    const activePayment = this.disputeFeeModel.getActivePayment();
    if (activePayment && activePayment.isOnline() && !activePayment.isDeclined()) {
      this.setPaymentToSavedAndTransitionDispute(activePayment);
    } else {
      this.isLoaded = true;
    }

    this.createSubModels();
    this.setupListeners();
  },

  setPaymentToSavedAndTransitionDispute(activePayment) {
    this.isLoaded = false;
    const routeToMenuFn = () => Backbone.history.navigate('#access', { trigger: true });
    const continueToPageFn = () => {
      this.isLoaded = true;
      this.render();
      loaderChannel.trigger('page:load:complete');
    };

    loaderChannel.trigger('page:load');
    // Otherwise, perform the bambora check
    activePayment.updateTransactionAfterBeanstream({ update_status_only: true })
      .done(() => {
        // If payment is still not approved, show the review payment page
        if (!activePayment.isApproved()) return continueToPageFn();
        else Backbone.history.navigate(`#review/step1`, { trigger: true });
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('PAYMENT.BEANSTREAM_CHECK', routeToMenuFn)(err);
      });
  },

  createSubModels() {
    this.docRequestModel = new DocRequestModel({
      request_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_REVIEW'), 
      dispute_guid: this.dispute.get('dispute_guid'), 
      submitter_id: this.loggedInParticipant.id,
      affected_documents_text: this.reviewDataCache && this.reviewDataCache.dr,
      outcome_doc_group_id: this.reviewDataCache && this.reviewDataCache.oid,
    });

    this.questionOneModel = new QuestionModel({
      optionData: [{ name: 'decision-one-no', value: FALSE_CODE, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'decision-one-yes', value: TRUE_CODE, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      required: !this.dispute.isCreatedAriC(),
      question_answer: this.reviewDataCache && this.reviewDataCache.q1,
    });

    this.questionTwoModel = new QuestionModel({
      optionData: [{ name: 'decision-two-no', value: FALSE_CODE, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'decision-two-yes', value: TRUE_CODE, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      required: !this.dispute.isCreatedAriC(),
      question_answer: this.reviewDataCache && this.reviewDataCache.q2,
    });

    this.dateDocumentReceivedModel = new InputModel({
      labelText: 'Date document received',
      inputType: 'date',
      errorMessage: 'Enter a date',
      required: true,
      showValidate: true,
      value: this.reviewDataCache && this.reviewDataCache.rd,
      apiMapping: 'date_documents_received',
    });

    this.termsCheckbox = new CheckboxModel({
      html: `I have read and understand the above rules and conditions and would like to continue with this submission`,
      checked: false,
      required: true
    });

    this.lateFilingRulesDate = null;

    const latestPayment = this.disputeFeeModel.getActivePayment();
    const canTryFeeWaiver = this.canTryFeeWaiver();
    const optionData = [{
        name: 'payment-method-type',
        text: '<b>Pay Online</b> (recommended) by Visa, MasterCard, Visa Debit, MasterCard Debit, or American Express',
        value: this.PAYMENT_METHOD_ONLINE,
      },
      ...(canTryFeeWaiver ? [{
        name: 'payment-method-type',
        text: 'I am unable to pay this fee due to low income and want to provide my financial and income information with a request to have this fee waived (<a class="static-external-link" href="javascript:;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/fees-and-fee-waivers#Waiver">learn more about fee waivers</a>)',
        value: this.PAYMENT_METHOD_FEE_WAIVER,
      }] : [])
    ];
    this.paymentMethodTypeModel = new RadioModel({
      optionData,
      required: true,
      cssClass: 'payment-options',
      value: latestPayment && optionData.find(opt => opt.value === latestPayment.get('transaction_method')) ?
        latestPayment.get('transaction_method') :
        // Auto-select Online if it's the only option
        (canTryFeeWaiver ? null : this.PAYMENT_METHOD_ONLINE)
    });
  },

  setupListeners() {
    const updateLateFilingDateAndRender = () => {
      this.setLateFilingRulesDate();
      this.render();
    }

    this.listenTo(this.questionOneModel, 'page:itemComplete', () => {
      if (this.questionOneModel.getData()) this.questionTwoModel.set('question_answer', null, { silent: true });
      updateLateFilingDateAndRender();
    });

    this.listenTo(this.questionTwoModel, 'page:itemComplete', updateLateFilingDateAndRender);
    this.listenTo(this.dateDocumentReceivedModel, 'page:itemComplete', () => {
      this.termsCheckbox.set('checked', false);
      updateLateFilingDateAndRender();
    });
  },

  validateAndShowErrors() {
    const regionsToValidate = ['outcomeDocsRegion', 'decisionQuestionOneRegion', 'decisionQuestionTwoRegion', 'dateDocumentReceivedRegion', 'termsCheckboxRegion'];
    let isValid = true;
    regionsToValidate.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && view.isRendered()) isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  clickPay() {
    if (!this.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true, force_scroll: true});
      }
      return;
    }

    const reviewTokenObj = {
      oid: this.docRequestModel.get('outcome_doc_group_id'),
      pid: this.loggedInParticipant.id,
      dr: this.docRequestModel.get('affected_documents_text'),
      q1: this.questionOneModel.getData(),
      q2: this.questionTwoModel.getData(),
      rd: this.dateDocumentReceivedModel.getData(),
      exp: (new Date).getDate(),
    };
    localStorage.setItem('_dmsReviewToken', JSON.stringify(reviewTokenObj));

    if (this.isOnlineMethodSelected()) paymentsChannel.request('show:online:instructions:modal', () => this.startOnlinePayment());
    else if (this.isFeeWaiverMethodSelected()) this.startFeeWaiverPayment();
  },

  startOnlinePayment() {
    loaderChannel.trigger('page:load');
    this.setDocRequestModel();

    // Create a new few each submission
    Promise.all([this.disputeFeeModel.save(this.disputeFeeModel.getApiChangesOnly())])
    .then(() => {
      return this.disputeFeeModel.createAndSavePayment({
        transaction_by: this.dispute.get('tokenParticipantId'),
        // NOTE: Must to pass payment provider = bambora for URL to be generated -
        transaction_method: configChannel.request('get', 'PAYMENT_METHOD_ONLINE'),
        payment_provider: configChannel.request('get', 'PAYMENT_PROVIDER_BEANSTREAM'),
      });
    }).then(createdPayment => {
      // Loads complete, reset page data
      // All APIs complete, now check if online and go to beanstream
      if (createdPayment.isOnline()) {
        const paymentUrl = createdPayment.get('payment_url');
        console.log("Routing to ", paymentUrl);
        const accessCode = this.model.get('accessCode');
        const submitterName = this.model.get('submitterName');
        const paymentTokenObj = {
          t: btoa(`${sessionChannel.request('token')}!#${accessCode}!@#${submitterName}`),
          exp: (new Date).getTime() + 15*60*1000,
          ac: btoa(UtilityMixin.util_hash(accessCode)),
        };
        sessionStorage.setItem('_dmsPaymentToken', JSON.stringify(paymentTokenObj));
        window.location = paymentUrl;
      } else {
        return Promise.reject("Error, payment wasn't able to be created.  Refresh and try again");
      }
    })
    .catch(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('EXTERNAL.PAYMENT.SAVE', () => {
        loaderChannel.trigger('page:load');
        Backbone.history.navigate(`#access`, { trigger: true });
      });
      handler(err);
    });
  },

  startFeeWaiverPayment() {
    loaderChannel.trigger('page:load');
    Promise.all([this.disputeFeeModel.save(this.disputeFeeModel.getApiChangesOnly())])
    .then(() => {
      // Go to payment page in fee waiver mode
      Backbone.history.navigate(`#pay/${this.disputeFeeModel.id}?mode=${this.PAYMENT_METHOD_FEE_WAIVER}`, { trigger: true });
    })
    .catch(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('EXTERNAL.PAYMENT.SAVE', () => {
        loaderChannel.trigger('page:load');
        Backbone.history.navigate(`#access`, { trigger: true });
      });
      handler(err);
    });
  },

  cancel() {
    modalChannel.request('show:standard', {
      title: 'Cancel Request?',
      bodyHtml: 
        `<p>If you exit this request you will lose any unsaved information that you have entered.  If you are sure you want to exit this request, click "Yes, Exit".</p>`,
      primaryButtonText: 'Yes, Exit',
      cancelButtonText: `Return to Request`,
      onContinue: (_modalView) => {
        _modalView.close();
        Backbone.history.navigate('#access', {trigger: true});
      }
    });
  },

  setLateFilingRulesDate() {
    this.lateFilingRulesDate = null;
    let deemedRuleDayOffset = 0;
    if (this.dispute.isCreatedAriC()) deemedRuleDayOffset = CALC_DAYS_Q2_NO;
    else if (this.questionOneModel.getData() === FALSE_CODE && this.questionTwoModel.getData() === FALSE_CODE) deemedRuleDayOffset = CALC_DAYS_Q2_NO;
    else if (this.questionOneModel.getData() === FALSE_CODE && this.questionTwoModel.getData() === TRUE_CODE) deemedRuleDayOffset = CALC_DAYS_Q2_YES;
    else if (this.questionOneModel.getData() === TRUE_CODE) deemedRuleDayOffset = CALC_DAYS_Q1_YES;
    this.lateFilingRulesDate = this.getRulesDateForFiling(deemedRuleDayOffset);
  },

  isOnlineMethodSelected() {
    return this.paymentMethodTypeModel.getData() === this.PAYMENT_METHOD_ONLINE;
  },

  isFeeWaiverMethodSelected() {
    return this.paymentMethodTypeModel.getData() === this.PAYMENT_METHOD_FEE_WAIVER;
  },

  canTryFeeWaiver() {
    // An applicant can only try fee waiver if they are a tenant and if they don't have a rejected fee waiver
    return this.loggedInParticipant && this.loggedInParticipant.isTenant() && !this.disputeFeeModel.hasDeclinedFeeWaiver();
  },

  shouldQuestionTwoBeShown() {
    return this.questionOneModel.getData() === FALSE_CODE;
  },

  shouldEntirePageBeShown() {
    if (this.dispute.isCreatedAriC()) return true;
    const questionsAnswered = this.questionOneModel.getData() === TRUE_CODE || this.questionTwoModel.getData() !== null;
    const dateEntered = this.dateDocumentReceivedModel.getData();
    return questionsAnswered && dateEntered;
  },

  isFiledLate() {
    return this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? this.lateFilingRulesDate.isBefore(Moment().subtract(1, 'day').endOf('day')) : false;
  },

  getRulesDateForFiling(dayOffset) {
    if (!this.dateDocumentReceivedModel.getData() || !dayOffset) return;
    const deemedRuleDate = Moment(this.dateDocumentReceivedModel.getData()).add(dayOffset, 'days');
    return UtilityMixin.util_getFirstBusinessDay(deemedRuleDate);
  },

  setDocRequestModel() {
    const docSelectView = this.getChildView('outcomeDocsRegion');
    if (!docSelectView || !docSelectView.isRendered()) return;
    const { affected_documents, affected_documents_text, outcome_doc_group_id, request_sub_type  } = docSelectView.getPageApiDataAttrs();
    this.docRequestModel.set({ affected_documents, affected_documents_text, outcome_doc_group_id, request_sub_type,
          date_documents_received: this.dateDocumentReceivedModel.getData() });
  },

  onBeforeRender() {
    if (this.isRendered()) this.setDocRequestModel();
  },
  
  onRender() {
    if (!this.isLoaded) return;

    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));

    const outcomeDocRequestCollection = documentsChannel.request('get:requests');
    this.showChildView('outcomeDocsRegion', new DocRequestSelectView({
      docGroupCollection: documentsChannel.request('get:all'),
      getValidDocFilesFromGroupFn: docGroup => {
        const requestsForGroup = outcomeDocRequestCollection.filter(req => req.get('outcome_doc_group_id') === docGroup.id);
        const hasCurrentUserReview = requestsForGroup.find(request => (
          !request.isPastProcess() &&
          request.isReview() &&
          request.get('submitter_id') === this.loggedInParticipant.id
        ));
        return hasCurrentUserReview ? [] : docGroup.getDocFilesThatCanRequestReview();
      },
      model: this.docRequestModel,
    }));

    if (!this.dispute.isCreatedAriC()) {
      this.showChildView('decisionQuestionOneRegion', new PageItemView({
        stepText: 'Is this a decision or order(s) that relates to an Order of Possession, a notice to end tenancy for unpaid rent or an unreasonable denial of sublet or assignment by a landlord?',
        subView: new QuestionView({ model: this.questionOneModel }),
        helpName: 'Payment reimbursement?',
        helpHtml: questionHelp,
        stepComplete: this.questionOneModel.isValid(),
        forceVisible: true
      }));


      if (this.shouldQuestionTwoBeShown()) {
        this.showChildView('decisionQuestionTwoRegion', new PageItemView({
          stepText: 'Is this a decision or order(s) that relate to repairs/maintenance, restricted services/facilities or a notice to end tenancy that is <b>not</b> for unpaid rent?',
          subView: new QuestionView({ model: this.questionTwoModel }),
          helpName: 'Payment reimbursement?',
          helpHtml: questionHelp,
          stepComplete: this.questionTwoModel.isValid(),
          forceVisible: true
        }));
      }
    }

    this.showChildView('dateDocumentReceivedRegion', new PageItemView({
      stepText: 'Provide the date you received the document(s) that you are requesting to be reviewed',
      subView: new InputView({ model: this.dateDocumentReceivedModel }),
      helpName: 'Payment reimbursement?',
      stepComplete: this.dateDocumentReceivedModel.isValid(),
      forceVisible: true
    }));

    if (!this.shouldEntirePageBeShown()) return;

    this.showChildView('termsCheckboxRegion', new CheckboxView({ model: this.termsCheckbox }));

    this.showChildView('paymentMethodTypeRegion', new RadioView({ model: this.paymentMethodTypeModel }))
  },
  
  className: 'da-review-payment page-view da-review da-payment-page',
  regions: {
    disputeRegion: '.da-review__overview-container',
    
    termsCheckboxRegion: '.dar-step-one__terms',
    outcomeDocsRegion: '.dar-step-one__outcome-docs',
    decisionQuestionOneRegion: '.dar-step-one__question-one',
    decisionQuestionTwoRegion: '.dar-step-one__question-two',
    dateDocumentReceivedRegion: '.dar-step-one__received-date',

    paymentMethodTypeRegion: '.da-payments-payment-method-type'
  },

  template() {
    if (!this.isLoaded) return;

    return <>
        <div className="da-review__overview-container hidden-print"></div>
        
        {this.renderJsxIncompletePayment()}

        <div className="dac__page-header-container">
          <div className="dac__page-header">
            <span className="dac__page-header__icon dac__icons__menu__service"></span>
            <span className="dac__page-header__title">Request a Review - Step 1</span>
          </div>
          <div className="dac__page-header__instructions">
            <p>
            In limited circumstances, a landlord or a tenant may request a review of a decision or order. This is not a chance to reargue the case or review evidence that should have been presented at the original hearing. Instead, it's an opportunity for a landlord or tenant to ask that an arbitrator take a second look at an original decision or order on very specific grounds.  Answer the following questions to learn more.
            </p>
            <p>
              <b>Important: All evidence must be provided at the time that the application for review is being completed as there is no opportunity to add more evidence after the application for review is submitted.</b>
            </p>
            <div className="dar-step-one__warning error-block warning">
              If your initial application has been dismissed with leave to reapply, you have the option to reapply. Reapplying for your initial claims based on the instructions in your decision may lead to a quicker resolution than applying
              for a review of the decision. To re-apply please visit our <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online">web site</a>.
            </div>
          </div>
        </div>
        
        {this.renderJsxPageInputs()}

        <div className="spacer-block-30"></div>
        <div className="dac__page-buttons">
          <button className="btn btn-cancel btn-lg da-upload-cancel-button" onClick={() => this.cancel()}>Cancel</button>
          
          {this.shouldEntirePageBeShown() ? (
            <button className="btn btn-lg btn-standard da-review__buttons__next option-button step-next" onClick={() => this.clickPay()}>Continue</button>
          ) : null}
        </div>
        <div className="spacer-block-10"></div>
      </>;
  },

  renderJsxPageInputs() {
    const PAYMENT_FEE_AMOUNT_REVIEW = configChannel.request('get', 'PAYMENT_FEE_AMOUNT_REVIEW');
    return <>
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

      <div className="dar-step-one__received-date"></div>

      {this.shouldEntirePageBeShown() ? <>
        <div className="dac__page-header-container">
          <div className="dac__page-header">Rules and Conditions</div>
          <div className="dac__page-header__instructions">
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
            <div className="spacer-block-20"></div>
            <p>
              The filing fee for an Application for Review Consideration is {Formatter.toAmountDisplay(PAYMENT_FEE_AMOUNT_REVIEW, true)}. A fee waiver may be available. For more information contact the&nbsp;<a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>.
              Please review <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Policy Guideline 24: Review Consideration of a Decision or Order</a>&nbsp;or visit the&nbsp;<a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Residential Tenancy Branch website</a>&nbsp;for more information.
            </p>
          </div>
        </div>

        {this.renderJsxLateFilingUI()}

        <div className="dar-step-one__terms"></div>

        {this.renderJsxPaymentOptions()}
      </> : null}
    </>;
  },

  renderJsxLateFilingUI() {
    const lateDays = this.lateFilingRulesDate && this.lateFilingRulesDate.isValid() ? this.lateFilingRulesDate.diff(Moment(this.dateDocumentReceivedModel.getData()), 'days') : 0;
    return (
      <div className={`dar-step-one__late-filing ${!this.isFiledLate() ? 'hidden' : ''}`}>
        <div className="dar-step-one__warning error-block warning">
          Warning: Under the rules, you should have submitted a request for review within {lateDays} days of receiving the decision or order or before <b>{Formatter.toDateDisplay(this.lateFilingRulesDate)}</b>.
          To process this request, you will be asked to provide a reason with proof that a time extension is warranted.  If the reason for the time extension is determined to be invalid, this request will be dismissed without refund.
        </div>
      </div>
    )
  },

  renderJsxPaymentOptions() {
    const paymentTypeDisplay = this.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.disputeFeeModel.get('fee_type')) : null;
    const paymentAmountDisplay = this.disputeFeeModel ? Formatter.toAmountDisplay(this.disputeFeeModel.get('amount_due'), true) : null;
    return <>
      <div className="office-page-payment-details">
        <div className="spacer-block-20"></div>
        <div className="dar-payment__info">
          <span className="error-red">
            Immediate payment required!</span>&nbsp;You must pay a {paymentAmountDisplay} filing fee to continue. When your payment is completed, you will be taken to the online form to submit your review consideration. 
            As an alternative to the online process, you can submit a paper application at a Service BC or Residential Tenancy office where additional payment methods are accepted. 
            You must complete step 2 after payment or fee waiver in order to complete your application for review consideration.
        </div>
        <div className="spacer-block-10"></div>
        <div className="">
          <span className="review-label">Payment for:</span>&nbsp;<span>{paymentTypeDisplay || '-'}</span>
        </div>
        <div className="">
          <span className="review-label">Total amount due:</span>&nbsp;<span>{paymentAmountDisplay || '-'}</span>
        </div>
      </div>
      <div className="da-payments-payment-method-type"></div>
    </>
  },

  renderJsxIncompletePayment() {
    const activePayment = this.disputeFeeModel.getActivePayment();
    if (!activePayment || activePayment.isApproved() || !activePayment.isOnline()) return;

    const isDeclined = activePayment.isDeclined();
    const dateDisplay = `${Formatter.toTimeDisplay(activePayment.get('created_date'))} ${Formatter.toWeekdayDateDisplay(activePayment.get('created_date'))}`;
    const completionStatusDisplay = `${isDeclined ? 'declined' : 'not completed'}`;
    const feeWaiverDeclinedMsg = `Based on the information that you provided, you are not eligible for the fee to be waived and must choose another option.`;
    const feeWaiverIncompleteMsg = `A previous fee waiver, started at ${dateDisplay}, was ${completionStatusDisplay}. Select the fee waiver option and Continue to add fee waiver proof.`;
    const feeWaiverTitle = isDeclined ? 'Fee Waiver Request Declined' : 'Fee Waiver Not Complete';
    const feeWaiverMsg = isDeclined ? feeWaiverDeclinedMsg : feeWaiverIncompleteMsg;
    const onlineIncompleteMsg = `A previous online payment, started at ${dateDisplay}, was ${completionStatusDisplay}. You must complete your payment at the bottom of this page in order to submit your request for review consideration.`;

    return <p className="error-block warning fee-waiver-error-container">
      <span className="fee-waiver-error">
        {activePayment.isFeeWaiver() ? <>
          <b>{feeWaiverTitle}:</b>&nbsp;{feeWaiverMsg}
        </>
        : <>
          <b>Payment Not Completed:</b>&nbsp;{onlineIncompleteMsg}
        </>}
      </span>
    </p>;
  },

});

_.extend(ReviewPaymentPage.prototype, ViewJSXMixin, ParentViewMixin);
export { ReviewPaymentPage };