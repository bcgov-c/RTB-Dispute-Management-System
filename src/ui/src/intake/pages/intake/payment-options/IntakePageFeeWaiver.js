import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import InputModel from '../../../../core/components/input/Input_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import QuestionModel from '../../../../core/components/question/Question_model';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../core/components/input/Input';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import QuestionView from '../../../../core/components/question/Question';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import EvidenceCheckboxCollectionView from '../../../components/evidence/EvidenceCheckboxes';
import DisputeEvidenceModel from '../../../../core/components/claim/DisputeEvidence_model';
import EvidenceCheckboxCollection from '../../../components/evidence/EvidenceCheckbox_collection';
import PaymentTransactionViewMixin from '../../../../core/components/payments/PaymentTransactionViewMixin';
import template from './IntakePageFeeWaiver_template.tpl';

const CLASS_DISABLED_BTN = 'step-next-disabled';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const paymentsChannel = Radio.channel('payments');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      history: '.fee-waiver-progress-container',
      feeWaiverNextBtn: '.step-next',

      paymentLink: '.back-to-payment-options-link',
      step1Link: '.fee-waiver-edit-link',
      editIncomeQuestionsLink: '.fee-waiver-edit-provided-link',
      step1Container: '.fee-waiver-step1',
    });
  },

  regions: {
    FamilyMemberCount: '.family-member-count-question',
    FamilyIncome: '.family-income-question',
    CitySizeDropdown: '.city-size-question',
    AcceptanceCheck: '.fee-waiver-accept',
    EvidenceRegion: '.income-evidence',
    FeeWaiverReceiptAccept: '.fee-waiver-receipt-accept'
  },

  events() {
    return _.extend({}, PageView.prototype.events, {
      'click @ui.paymentLink': 'backToPayment',
      'click @ui.step1Link': _.bind(this.transitionToStep, this, 1),
      'click @ui.editIncomeQuestionsLink': 'showIncomeQuestions',
      'click @ui.notCorrectBtn': _.bind(this.transitionToStep, this, 1)
    });
  },

  getRoutingFragment() {
    return 'page/8';
  },

  cleanupPageInProgress() {
    
  },

  initialize(options) {
    PageView.prototype.initialize.call(this, arguments);
    
    this.mergeOptions(options, ['currentStep']);
    this.currentStep = 1;

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    const activePayment = paymentsChannel.request('get:payment:intake');
    // Set initial currentStep
    if (activePayment && activePayment.isFeeWaiverStep1Complete()) {
      this.currentStep = this.licoApprovedNoExpense() ? 2 : 3;
    }

    // If we're already passed step1, then we know it's been accepted
    if (this.currentStep > 1) {
      this.getPageItem('FeeWaiverReceiptAccept').getModel().set('value', 1);
    }
  },

  createPageItems() {
    this.createFamilyIncomeModels();
    this.createFeeWaiverEvidenceModels();

    const FeeWaiverReceiptAcceptModel = new QuestionModel({
      optionData: [{ name: 'fee-waiver-accept-no', value: 0, cssClass: 'option-button yes-no', text: 'No'},
          { name: 'fee-waiver-accept-yes', value: 1, cssClass: 'option-button yes-no', text: 'Yes'}],
      //value: 1,
      helpName: 'Is above information correct?',
      //helpHtml: RTB_Help.fee_waiver_income_source_confirmation
    });

    this.addPageItem('FeeWaiverReceiptAccept', new PageItemView({
      stepText: 'Is the above information correct and does it include all sources of income for the tenants and their families?',
      subView: new QuestionView({ model: FeeWaiverReceiptAcceptModel })
    }));

    //this.first_view_id = 'FamilyMemberCount';
  },

  createFamilyIncomeModels() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const feeWaiverPayment = activePayment && activePayment.isFeeWaiver() ? activePayment : null;

    const FamilyMemberCountModel = new InputModel({
      minValue: 1,
      maxLength: 2,
      required: true,
      errorMessage: 'Please enter the number of family members',
      inputType: 'positive_integer',
      cssClass: 'smallest-form-field',
      value: feeWaiverPayment ? feeWaiverPayment.get('fee_waiver_tenants_family') : null,
      apiMapping: 'fee_waiver_tenants_family'
    });
    this.addPageItem('FamilyMemberCount', new PageItemView({
      stepText: 'What is the total number of tenants and their family members or dependents living in this rental unit or site?',
      subView: new InputView({ model: FamilyMemberCountModel }),
      helpName: 'Family member help',
      //helpHtml: RTB_Help.fee_waiver_family_size,
    }))

    const FamilyIncomeModel = new InputModel({
        inputType: 'currency',
        required: true,
        allowZeroAmount: true,
        errorMessage: 'Please enter the total income',
        cssClass: 'small-form-field',
        helpName: 'Monthly income help',
        maxLength: configChannel.request('get', 'FEE_WAIVER_INCOME_AMOUNT_FIELD_MAX') || 8,
        value: feeWaiverPayment ? feeWaiverPayment.get('fee_waiver_income') : null,
        apiMapping: 'fee_waiver_income'
    });

    this.addPageItem('FamilyIncome', new PageItemView({
      stepText: 'What is the total monthly income before deductions of all tenants and family members or dependents listed above?',
      subView: new InputView({ model: FamilyIncomeModel }),
      helpName: 'Family member help',
      //helpHtml: RTB_Help.fee_waiver_family_size,
    }))

    const CitySizeDropdownModel = new DropdownModel({
      optionData: PaymentTransactionViewMixin.mixin_getCityBucketOptions(),
      cssClass: 'small-form-field',
      defaultBlank: true,
      required: true,
      errorMessage: 'Please enter the population',
      helpName: 'Monthly income help',
      //helpHtml: RTB_Help.fee_waiver_city_size,
      value: feeWaiverPayment ? feeWaiverPayment.get('fee_waiver_city_size') : null,
      apiMapping: 'fee_waiver_city_size'
    });

    this.addPageItem('CitySizeDropdown', new PageItemView({
      stepText: 'What is the size or population of the city, town or community where the rental address is located?',
      subView: new DropdownView({ model: CitySizeDropdownModel }),
      helpName: 'Family member help',
      //helpHtml: RTB_Help.fee_waiver_family_size,
    }))

    const AcceptanceCheckModel = new CheckboxModel({
      html: 'I confirm that all information I have entered or will enter is accurate, and I understand that submitting false information to the Residential Tenancy Branch to avoid paying the filing fee is a punishable offence.',
      required: true,
      checked: !!(activePayment && activePayment.isFeeWaiver() && activePayment.get('fee_waiver_tenants_family'))
    });

    this.addPageItem('AcceptanceCheck', new PageItemView({
      subView: new CheckboxView({ model: AcceptanceCheckModel })
    }));

  },

  createFeeWaiverEvidenceModels() {
    const fee_waiver_evidence_config = paymentsChannel.request('get:payment:evidence:config'),
      feeWaiverEvidenceCheckboxCollection = new EvidenceCheckboxCollection(),
      config_ids_to_ignore = [66,65];
    _.each(fee_waiver_evidence_config, function(config) {
      if (_.find(config_ids_to_ignore, function(id) { return id === config.id} )) {
        return;
      }
      const matching_file_description = filesChannel.request('get:filedescription:code', config.id);
      feeWaiverEvidenceCheckboxCollection.add({
        checkboxModel: new CheckboxModel({
          html: config.checkboxTitle,
          checked: matching_file_description ? true : false,
          helpName: config.helpName,
          helpHtml: config.helpHtml
        }),
        evidenceModel: new DisputeEvidenceModel({
          evidence_id: config.id,
          description_by: !matching_file_description ? participantsChannel.request('get:primaryApplicant:id') : null,
          category: config.category,
          title: config.title,
          mustProvideNowOrLater: true,
          required: true,
          file_description: matching_file_description ? matching_file_description : null,
        })
      }, { silent: true });
    });

    this.addPageItem('EvidenceRegion', new PageItemView({
      stepText: `
      Select all income sources for the tenants and family members above and upload files for all sources you have selected to provide.
      <b>You will receive a receipt for your fee waiver once your selected proof of income is uploaded or submitted to the Residential Tenancy Branch.</b>
      Applications that do not include all selected income proof will be abandoned.
      <br/><br/>
      If you cannot provide a previously selected proof of income, uncheck the box to proceed with the remaining income source(s) you selected.
      `,
      subView: new EvidenceCheckboxCollectionView({ collection: feeWaiverEvidenceCheckboxCollection })
    }));
  },

  setupListenersBetweenItems() {
    const FamilyMemberCountModel = this.getPageItem('FamilyMemberCount').getModel();
    const FamilyIncomeModel = this.getPageItem('FamilyIncome').getModel();
    const CitySizeDropdownModel = this.getPageItem('CitySizeDropdown').getModel();
    const AcceptanceCheckModel = this.getPageItem('AcceptanceCheck').getModel();
    const FeeWaiverReceiptAcceptModel = this.getPageItem('FeeWaiverReceiptAccept').getModel();
    
    this.stopListening(FamilyMemberCountModel, 'change:value', this.checkNextButtonActivation);
    this.stopListening(FamilyIncomeModel, 'change:value', this.checkNextButtonActivation);
    this.stopListening(CitySizeDropdownModel, 'change:value', this.checkNextButtonActivation);
    this.stopListening(AcceptanceCheckModel, 'change:checked', this.checkNextButtonActivation);
    
    this.listenTo(FamilyMemberCountModel, 'change:value', this.checkNextButtonActivation, this);
    this.listenTo(FamilyIncomeModel, 'change:value', this.checkNextButtonActivation, this);
    this.listenTo(CitySizeDropdownModel, 'change:value', this.checkNextButtonActivation, this);
    this.listenTo(AcceptanceCheckModel, 'change:checked', this.checkNextButtonActivation, this);
   
    const onChangeFeeWaiverReceiptAcceptModelFn = (model, answer) => {
      if (answer === 0) {
        model.set({ question_answer: null });
        this.getPageItem('FeeWaiverReceiptAccept').render();
        this.transitionToStep(1);
      }
    };
    this.stopListening(FeeWaiverReceiptAcceptModel, 'change:question_answer', onChangeFeeWaiverReceiptAcceptModelFn);
    this.listenTo(FeeWaiverReceiptAcceptModel, 'change:question_answer', onChangeFeeWaiverReceiptAcceptModelFn, this);
  },

  setupFlows() {
    
  },

  getCitySizeText() {
    const CitySizeDropdownModel = this.getPageItem('CitySizeDropdown').getModel();
    var selected_index = CitySizeDropdownModel.getData();
    if (selected_index === null) {
      return 'N/A';
    }
    var selected_option = CitySizeDropdownModel.get('optionData')[selected_index];
    if (!selected_option || !_.has(selected_option, 'text')) {
      return 'N/A';
    }
    return selected_option.text;
  },

  backToPayment() {
    this.trigger('return');
  },

  transitionToStep(step_number) {
    this.currentStep = step_number;
    $.scrollPageToTop();
    this.render();
  },

  isStep1Complete() {
    return this.getPageItem('FamilyMemberCount').getModel().isValid() &&
      this.getPageItem('FamilyIncome').getModel().isValid() && 
      this.getPageItem('CitySizeDropdown').getModel().isValid() &&
      this.getPageItem('AcceptanceCheck').getModel().get('checked') === true;
  },

  showIncomeQuestions() {
    this.getUI('step1Container').show();
  },

  hideIncomeQuestions() {
    this.getUI('step1Container').hide();
  },

  renderFeeWaiverHistory() {
    if (this.currentStep <= 1) {
      return;
    }

    const historyValues = [];
    const family_member_count = this.getPageItem('FamilyMemberCount').getModel().getData();
    const family_income_amount = this.getPageItem('FamilyIncome').getModel().getData();
    
    let fee_waiver_progress_container_html_string = '';
    let fee_waiver_progress_html_string = '';

    fee_waiver_progress_container_html_string += `<h3 class="step-description">Income Information&nbsp;<span class="fee-waiver-edit-link">edit</span></h3>
        <hr class="title-underline" />
        <div class="fee-waiver-progress"></div>`;

    if (this.currentStep > 1 && this.isStep1Complete()) {
      historyValues.push([ 'Tenants and family <span class="hidden-xs">members in rental unit</span>', family_member_count]);
      historyValues.push([ 'Total monthly income <span class="hidden-xs">before deductions</span>', Formatter.toAmountDisplay(family_income_amount) ]);
      historyValues.push([ 'Population <span class="hidden-xs">where you live</span>', this.getCitySizeText() ]);
    }

    _.each(historyValues, function(item) {
      fee_waiver_progress_html_string += `<div ${item[2] ? `class="${item[2]}"` : ''}>
        <span class="fee-waiver-progress-label">${item[0]}:</span> <span class="fee-waiver-progress-value">${item[1]}</span>
      </div>`;
    }, this);

    fee_waiver_progress_html_string += `<div class="fee-waiver-consent-label">
        <b class="glyphicon glyphicon-ok"></b>
        <span class="">You confirmed that all information entered is accurate</span>
      </div>`;
    
    this.$('.fee-waiver-progress-container').empty();
    this.$('.fee-waiver-progress-container').append(fee_waiver_progress_container_html_string);
    this.$('.fee-waiver-progress').append(fee_waiver_progress_html_string);

    this.getUI('history').show();
  },

  checkNextButtonActivation() {
    if (this.isStep1Complete()) {
      this.getUI('feeWaiverNextBtn').removeClass(CLASS_DISABLED_BTN);
    }
  },

  licoApprovedNoExpense() {
    let income = this.getPageItem('FamilyIncome').getModel().getData();
    income = income ? parseFloat(income) : income;

    // Add pandemic check to the lico check above
    return income <= this.getLicoAmount();
  },

  getLicoAmount() {
    const memberCount = this.getPageItem('FamilyMemberCount').getModel().getData();
    const citySize = this.getPageItem('CitySizeDropdown').getModel().getData({ parse: true });
    return paymentsChannel.request('get:lico', memberCount, citySize);
  },

  getPaymentSaveAttrs() {
    const pageItemNames = ['FamilyMemberCount', 'FamilyIncome', 'CitySizeDropdown'];
    const return_obj = {};

    _.each(pageItemNames, function(pageItemName) {
      const pageItem = this.getPageItem(pageItemName),
        model = pageItem.getModel();
      if (pageItem.isActive()) {
        _.extend(return_obj, { [model.get('apiMapping')]: model.getData() });
      }
    }, this);

    return return_obj;
  },


  // Applies complex routing rules based on state.  Changes this.currentStep
  checkCurrentStepAndApplyRules() {
    if (this.currentStep === 2 && !this.licoApprovedNoExpense()) {
      this.currentStep = 3;
    }
  },

  hasFeeWaiverEvidencePending() {
    const dispute = disputeChannel.request('get'),
      status = dispute && dispute.getStatus();
    return status === configChannel.request('get', 'STATUS_FEE_WAIVER_PAYMENT_REQUIRED');
  },

  onBeforeRender() {
    _.each(this.page_items, function(itemView, regionName) {
      if ( itemView.isRendered()) {
        this.detachChildView(regionName);
      }
      // Always un-set the confirm question value before render
      if (regionName === 'FeeWaiverReceiptAccept' && itemView) {
        itemView.getModel().set('question_answer', null, {silent: true});
        itemView.render();
      }
    }, this);

    this.checkCurrentStepAndApplyRules();
  },

  onRender() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    if (!activePayment || !activePayment.isFeeWaiver()) {
      console.log(`[Error] No active fee waiver payment`, activePayment);
      return;
    }

    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);

      // Show all page items at once.  Step1/2/3 will take care of show/hiding them
      this.showPageItem(regionName, {no_animate: true});
    }, this);

    this.renderFeeWaiverHistory();
    this.checkNextButtonActivation();

    // Make sure to scroll page to the top on load
    $.scrollPageToTop();
    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      Formatter,
      currentStep: this.currentStep,
      showIncomeQuestions: (this.currentStep === 1),
      hasFeeWaiverEvidencePending: this.hasFeeWaiverEvidencePending(),
      dispute: disputeChannel.request('get'),
      payment: paymentsChannel.request('get:payment:intake'),
      primaryApplicant: participantsChannel.request('get:primaryApplicant'),
      receiptEmailSent: false,
    };
  },

  _getApiUpdatesForIncomeQuestions(activePayment) {
    activePayment.set(this.getPaymentSaveAttrs());
    const all_xhr = [];
    const changes = activePayment.getApiChangesOnly();
    if (!_.isEmpty(changes)) {
      all_xhr.push(() => activePayment.save(changes));
    }
    return all_xhr;
  },

  hasFeeWaiverEvidenceAllUploaded(evidenceCheckboxCollection) {
    const selectedFeeWaiverEvidence = evidenceCheckboxCollection.getChecked();
    return !selectedFeeWaiverEvidence.length ? true :
      _.all(selectedFeeWaiverEvidence, evidenceCheckboxModel => {
        const evidenceModel = evidenceCheckboxModel.get('evidenceModel');
        const files = filesChannel.request('get:filedescription:files', evidenceModel.get('file_description'));
        return files && files.hasUploaded();
      });
  },

  _getApiUpdatesForSubmit(activePayment) {
    // Validate step 3 items
    // Nothing to save here
    const all_xhr = [];
    const dispute = disputeChannel.request('get');
    const dispute_changes = {};
    const dispute_status_changes = {};
    const payment_changes = {};
    const evidenceCheckboxCollection = this.getPageItem('EvidenceRegion').getCollection();

    if (this.licoApprovedNoExpense()) {
      if (this.hasFeeWaiverEvidenceAllUploaded(evidenceCheckboxCollection)) {
        _.extend(dispute_changes, {
            initial_payment_date: Moment().toISOString(),
            initial_payment_by: participantsChannel.request('get:primaryApplicant:id')  
          },
          activePayment ? { initial_payment_method: activePayment.get('transaction_method') } : null,
        );

        _.extend(dispute_status_changes, {
          dispute_stage: configChannel.request('get', 'STAGE_APPLICATION_SCREENING'),
          dispute_status: configChannel.request('get', 'STATUS_APPLICATION_RECEIVED')
        });

        _.extend(payment_changes, {
          payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED'),
        });
      } else {
        // Fee Waiver approved, but waiting for all evidence.  Set the dispute status to pending evidence
        _.extend(dispute_status_changes, {
          dispute_stage: configChannel.request('get', 'STAGE_APPLICATION_IN_PROGRESS'),
          dispute_status: configChannel.request('get', 'STATUS_FEE_WAIVER_PAYMENT_REQUIRED')
        });
        _.extend(payment_changes, {
          payment_status: configChannel.request('get', 'PAYMENT_STATUS_PENDING'),
        });
      }

    } else {
      // DECLINED
      
      // Delete all uploaded evidence on Decline
      const to_remove = evidenceCheckboxCollection.filter(function(m) { return m.hasUploadedEvidence(); });

      if (!_.isEmpty(to_remove)) {
        all_xhr.push(
          () => {
            const dfd = $.Deferred();
            Promise.all(_.map(to_remove, function(e) { return e.destroy(); }))
              .then(dfd.resolve, dfd.reject);
            return dfd.promise();
          }
        );
      }
      
      // Get dispute status etc changes
      _.extend(dispute_status_changes, {
        dispute_stage: configChannel.request('get', 'STAGE_APPLICATION_IN_PROGRESS'),
        dispute_status: configChannel.request('get', 'STATUS_PAYMENT_REQUIRED')
      });
      _.extend(payment_changes, {
        payment_status: configChannel.request('get', 'PAYMENT_STATUS_REJECTED'),
      });
    }

    // Apply all step3 API changes, if any exist
    if (!_.isEmpty(dispute_changes)) {
      all_xhr.push( _.bind(dispute.save, dispute, dispute_changes) );
    }
    if (!_.isEmpty(dispute_status_changes)) {
      all_xhr.push( _.bind(dispute.saveStatus, dispute, dispute_status_changes) );
    }
    if (!_.isEmpty(payment_changes)) {
      all_xhr.push( _.bind(activePayment.save, activePayment, payment_changes) );
    }

    return all_xhr;
  },

  getPageApiUpdates() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const all_xhr = [];

    if (!activePayment) {
      console.log(`[Error] No active payment, can't save`)
      return [];
    }

    if (this.currentStep === 1 || this.currentStep === 2) {
      // Validate any income questions again on step1 and step2.  If they are hidden on the page, they won't be re-validated
      all_xhr.push(...this._getApiUpdatesForIncomeQuestions(activePayment));
      
      if (this.currentStep === 2) {
        // Validate step 2 items, just deletes
        const evidenceCheckboxCollection = this.getPageItem('EvidenceRegion').getCollection();
        const to_remove = evidenceCheckboxCollection.filterForUncheckedWithEvidence();

        all_xhr.push(
          () => {
            const dfd = $.Deferred();
            Promise.all(_.map(to_remove, function(e) { return e.destroy(); }))
              .then(dfd.resolve, dfd.reject);
            return dfd.promise();
          }
        );

        if (this.licoApprovedNoExpense()) {
          all_xhr.push(...this._getApiUpdatesForSubmit(activePayment));
        }
      }

    } else if (this.currentStep === 3) {
      if (!this.licoApprovedNoExpense()) {
        all_xhr.push(...this._getApiUpdatesForSubmit(activePayment));
      }
    }

    return all_xhr;
  },


  previousPage() {
    if (this.currentStep === 3) {
      this.transitionToStep(1);
    } else if (this.currentStep === 2) {
      this.transitionToStep(1);
    } else if (this.currentStep === 1) {
     this.backToPayment(); 
    }
  },


  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const all_xhr = this.getPageApiUpdates();
    const onNextFn = () => {
      const activePayment = paymentsChannel.request('get:payment:intake');
      if (this.currentStep === 1 && this.isStep1Complete()) {
        this.transitionToStep(3);
      } else if (this.currentStep === 2) {
        if (activePayment && activePayment.isDeclined()) {
          this.backToPayment();
        } else {
          Backbone.history.navigate('#page/9', {trigger: true});
        }
      } else if (this.currentStep === 3) {
        if (activePayment && activePayment.isDeclined()) {
          this.backToPayment();
        } else {
          this.transitionToStep(2);
        }
      }
    };

    if (_.isEmpty(all_xhr)) {
      console.log("No changes needed");
      onNextFn();
      return;
    }

    loaderChannel.trigger('page:load');
    Promise.all(all_xhr.map(xhr => xhr())).then(onNextFn, this.createPageApiErrorHandler(this));
  }

});