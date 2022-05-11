import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import AddressView from '../../../../core/components/address/Address';
import AddressModel from '../../../../core/components/address/Address_model';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import DoubleSelectorView from '../../../../core/components/double-selector/DoubleSelector';
import DoubleSelectorModel from '../../../../core/components/double-selector/DoubleSelector_model';
import ModalIssueDeletes from '../../../components/modals/modal-issue-deletes/ModalDisputeChangeIssueDeletes';
import PageItemCreator from '../../../components/page-item-creator/PageItemCreator';
import PageItemsConfig from './intake_general_page_config';
import template from './IntakePageGeneral_template.tpl';
import TOU_template from '../../../../core/components/tou/TOU_template.tpl';
import QuestionEvents from '../../../../core/components/question/Question_events.js';
import TrialLogic_BIGEvidence from '../../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import Question_model from '../../../../core/components/question/Question_model';
import Question from '../../../../core/components/question/Question';

const touLinkClass = 'accepted-terms-link';

const QUESTION_ANSWER_NO = '0';
const QUESTION_ANSWER_YES = '1';

const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const geozoneChannel = Radio.channel('geozone');
const configChannel = Radio.channel('config');
const claimsChannel = Radio.channel('claims');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');

export default PageView.extend({
  template,

  regions: {
    touRegion: '#p1-TOU',
    trialOptInRegion: '#p1-TrialOptIn',

    applicantType: '#p1-ApplicantType',
    propertyType: '#p1-PropertyType',
    rentalAddress: '#p1-RentalAddress',

    rentalAddressQuestion: '#p1-RentalAddressQuestion',
    rentalQuestionDescription: '#p1-RentalQuestionDescription',

    manufacturedHomeType: '#p1-ManufacturedHomeType',
    tenancyResidenceStatus: '#p1-TenancyResidenceStatus',

    tenancyEndDate: '#p1-TenancyEndDate',
    tenancyEndDateLegacy: '#p1-TenancyEndDateLegacy',

    tenancyStartDateQuestion: '#p1-TenancyStartDateQuestion',
    tenancyStartDate: '#p1-TenancyStartDate',
    monthlyRent: '#p1-MonthlyRent',
    rentalInterval: '#p1-RentalInterval',

    securityDepositQuestion: '#p1-SecurityDepositQuestion',
    securityDeposit: '#p1-SecurityDeposit',

    petDepositQuestion: '#p1-PetDepositQuestion',
    petDeposit: '#p1-PetDeposit',

    counterDisputeQuestion: '#p1-CounterDisputeQuestion',
    counterDisputeNumber: '#p1-CounterDisputeNumber'
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      'out-of-bc-warning': '#out-of-bc-warning',
      touContents: '.info-help-container'
    });
  },

  events() {
    return _.extend({}, PageView.prototype.events, {
      [`click .${touLinkClass}`]: 'clickTermsOfUseLink',
    });
  },

  clickTermsOfUseLink(e) {
    e.preventDefault();
    const touContentsEle = this.getUI('touContents');

    if (touContentsEle.hasClass('help-opened')) {
      touContentsEle.slideUp({duration: 400, complete: function() {
        touContentsEle.removeClass('help-opened');
      }});
    } else {
      touContentsEle.addClass('help-opened');
      touContentsEle.find('.close-help').on('click', _.bind(this.clickTermsOfUseLink, this));
      touContentsEle.slideDown({duration: 400});
    }
  },

  getRoutingFragment() {
    return 'page/1';
  },

  cleanupPageInProgress() {
    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.resetModel();
    }
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    // Trial setup
    const dispute = disputeChannel.request('get');
    this.hasOngoingTrial = TrialLogic_BIGEvidence.isTrialOngoing();
    this.showOptInQuestion = TrialLogic_BIGEvidence.isOptInAllowed(dispute) || (this.hasOngoingTrial && TrialLogic_BIGEvidence.getDisputeTrialModel());

    this.AMOUNT_FIELD_MAX = configChannel.request('get', 'AMOUNT_FIELD_MAX') || 15;
    this.RENT_PAYMENT_INTERVAL_MAX = configChannel.request('get', 'RENT_PAYMENT_INTERVAL_MAX') || 95;
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX') || 45;

    this.createPageItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 1);
  },

  // Create all the models and page items for this intake page
  createPageItems() {
    const dispute = disputeChannel.request('get');
    const step1HasProgress = dispute.get('questionCollection').find(function(q) { return q.get('group_id') === 0 && q.get('question_answer') !== null });

    // Add event handlers
    const eventHandlers = [
      { pageItem: 'applicantType', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'propertyType', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'rentalAddressQuestion', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'tenancyStartDateQuestion', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'securityDepositQuestion', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'petDepositQuestion', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'tenancyResidenceStatus', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'counterDisputeQuestion', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) }
    ];

    PageItemCreator.definePageItemEventHandlers(this, PageItemsConfig, eventHandlers);
    PageItemCreator.buildPageItemsFromConfig(this, PageItemsConfig);

    const touCheckboxModel = new CheckboxModel({
      html: `<span class="accepted-terms-content">I agree to the Residential Tenancy online systems </span><span class="${touLinkClass}">Terms of Use</span>`,
      disabled: !!step1HasProgress,
      checked: !!step1HasProgress,
      required: true,
      ignoredLinkClass: touLinkClass
    });

    this.addPageItem('touRegion', new PageItemView({
      stepText: null,
      subView: new CheckboxView({ model: touCheckboxModel }),
      stepComplete: touCheckboxModel.isValid()
    }));

    const disputeTrial = TrialLogic_BIGEvidence.getDisputeTrialModel();
    const trialOptInModel = new Question_model({
      optionData: [{ name: 'trial-opt-out', value: QUESTION_ANSWER_NO, cssClass: 'option-button trial-option intake-trial-opt-out', text: 'No'},
        { name: 'trial-opt-in', value: QUESTION_ANSWER_YES, cssClass: 'option-button trial-option intake-trial-opt-in', text: `Yes` }],
      question_answer: !disputeTrial ? null : (
          disputeTrial.isOptedIn() ? QUESTION_ANSWER_YES :
          disputeTrial.isOptedOut() ? QUESTION_ANSWER_NO : null
      ),
      required: true,
      unselectDisabled: !!disputeTrial,
      apiToUse: null,
    });

    this.addPageItem('trialOptInRegion', new PageItemView({
      stepText: `The Residential Tenancy Branch is looking for ways to make the online application process easier for landlords and tenants. Your satisfaction with this online service is important to us.<br/><br/>By clicking "Yes", you may see new content that will help the Residential Tenancy Branch understand how to improve this application process. Otherwise, click "No".`,
      subView: new Question({ model: trialOptInModel }),
      stepComplete: trialOptInModel.isValid()
    }));
    

    const rentalAddressApiMappings = {
      street: 'tenancy_address',
      city: 'tenancy_city',
      country: 'tenancy_country',
      postalCode: 'tenancy_zip_postal',
      geozoneId: 'tenancy_geozone_id',
      unitType: 'tenancy_unit_type',
      unitText: 'tenancy_unit_text'
    };
    const rentalAddressModel = new AddressModel({
        json: _.mapObject(rentalAddressApiMappings, function(val, key) { return dispute.get(val); }),
        apiMapping: rentalAddressApiMappings,
        required: true,
        useDefaultProvince: true,
        showValidate: true,
        useSubLabel: false
      }),
      is_rental_address_valid = rentalAddressModel.isValid();

    // Create rental address component
    this.addPageItem('rentalAddress', new PageItemView({
      stepText: 'What is the address of the rental unit or site where the dispute is occurring or has occurred?',
      subView: new AddressView({ model: rentalAddressModel }),
      stepComplete: is_rental_address_valid
    }));


    // Create rental address type and question
    const RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    const rentUnitTypeOptions = Object.entries(configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY') || {})
      .filter(([value]) => value && String(value) !== RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );

    const tenancy_unit_type = String(dispute.get('tenancy_unit_type') || '') || null;
    const rentDescriptionModel = new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        required: true,
        clearWhenHidden: true,
        value: tenancy_unit_type,
        apiMapping: 'tenancy_unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.APPLICANT_FIELD_MAX,
        minLength: 3,
        value: dispute.get('tenancy_unit_text') || null,
        apiMapping: 'tenancy_unit_text',
      }),
      clearWhenHidden: true,
      singleDropdownMode: true,
      enableOther: true,
      otherOverrideValue: RENT_UNIT_TYPE_OTHER,
      currentValue: tenancy_unit_type
    });

    this.addPageItem('rentalQuestionDescription', new PageItemView({
      stepText: 'Please provide a description of the unit (i.e., basement suite, upper home, lower home, etc.)',
      subView: new DoubleSelectorView({ model: rentDescriptionModel }),
      stepComplete: rentDescriptionModel.isValid(),
      helpHtml: 'Please select from the drop-down menu. If your unit type is not listed, select "Other" and provide a short description of your unit type, for example "RV in backyard".<br/><br/>If you rent a room in a house, select "Other" and indicate specific room identifier'
    }));


    // Create tenancy end date component
    const tenancyEndDateMapping = 'tenancy_end_date';
    const tenancyEndDateModel = new InputModel({
        labelText: 'End date',
        errorMessage: 'Enter a date and accept',
        inputType: 'date',
        required: true,
        showValidate: true,
        minDate: Moment().subtract( configChannel.request('get', 'DATE_MIN_YEAR_OFFSET'), 'years' ),
        apiMapping: tenancyEndDateMapping,
        value: dispute.get(tenancyEndDateMapping),
        clearWhenHidden: true
      }),
      is_tenancy_end_valid = tenancyEndDateModel.isValid();

    this.addPageItem('tenancyEndDate', new PageItemView({
      stepText: 'When did the tenancy end?',
      subView: new InputView({ model: tenancyEndDateModel }),
      stepComplete: is_tenancy_end_valid,
      helpHtml: 'This is the date that the tenant physically moved out of the rental unit or site or when the unit was considered abandoned.',
    }));


    // Create tenancy start date component
    const tenancyStartDateMapping = 'tenancy_start_date';
    const tenancyStartDateModel = new InputModel({
        labelText: 'Tenancy start date',
        errorMessage: 'Enter the start date and accept',
        inputType: 'date',
        required: true,
        showValidate: true,
        minDate: Moment(configChannel.request('get', 'TENANCY_START_YEAR_MIN'), 'YYYY'),
        apiMapping: tenancyStartDateMapping,
        value: dispute.get(tenancyStartDateMapping),
        clearWhenHidden: true,
        showYearDate: true
      });

    this.addPageItem('tenancyStartDate', new PageItemView({
      stepText: 'Please provide the date the tenancy started',
      subView: new InputView({ model: tenancyStartDateModel }),
      stepComplete: tenancyStartDateModel.isValid(),
      helpHtml: 'Most written tenancy agreements should indicate when the tenancy started.  Refer to the written tenancy agreement if you are unsure of the exact date.',
    }));


    // Create rental amount component
    const rentAmountMapping = 'rent_payment_amount';
    const rentalAmountModel = new InputModel({
        labelText: 'Total monthly rent',
        errorMessage: 'Enter the total monthly rent',
        inputType: 'currency',
        allowZeroAmount: true,
        required: true,
        showValidate: true,
        maxLength: this.AMOUNT_FIELD_MAX,
        apiMapping: rentAmountMapping,
        value: dispute.get(rentAmountMapping),
        clearWhenHidden: true
      });

    this.addPageItem('monthlyRent', new PageItemView({
      stepText: 'What is the current required rental payment amount?',
      subView: new InputView({ model: rentalAmountModel }),
      stepComplete: rentalAmountModel.isValid(),
      helpHtml: 'Please enter the rental payment amount.'
    }));


    const rentalIntervalMapping = 'rent_payment_interval',
      secondDropdownData = [
        { value: String(configChannel.request('get', 'RENT_INTERVAL_MONTHLY_FIRST')), text: 'First day of the month'},
        { value: String(configChannel.request('get', 'RENT_INTERVAL_MONTHLY_LAST')), text: 'Last day of the month'},
        { value: String(configChannel.request('get', 'RENT_INTERVAL_MONTHLY_MIDDLE')), text: 'Middle day of the month'}
      ];

      // Create rent interval component
    const rentalIntervalModel = new DoubleSelectorModel({
        firstDropdownModel: new DropdownModel({
          defaultBlank: true,
          optionData: [{ value: '1' , text: 'Monthly' }],
          labelText: 'Pay interval',
          errorMessage: 'Enter the pay interval',
          clearWhenHidden: true
        }),
        secondDropdownModel: new DropdownModel({
          defaultBlank: true,
          optionData: secondDropdownData,
          labelText: 'Payment day',
          errorMessage: 'Enter the payment day',
          clearWhenHidden: true
        }),
        otherInputModel: new InputModel({
          labelText: 'Due on the',
          errorMessage: 'Enter when the rent is due',
          maxLength: this.RENT_PAYMENT_INTERVAL_MAX
        }),
        apiMapping: rentalIntervalMapping,
        enableOther: true,
        currentValue: dispute.get(rentalIntervalMapping)
      });

    this.addPageItem('rentalInterval', new PageItemView({
      stepText: 'When is rent due and how often is it paid?',
      subView: new DoubleSelectorView({ model: rentalIntervalModel }),
      stepComplete: rentalIntervalModel.isValid(),
      helpHtml: 'Specify the day rent is due and the frequency it is paid, according to the written or verbal tenancy agreement. If rent is paid once per month, select \'Monthly\'.'
    }));

    // Create security deposit amount component
    const securityDepositMapping = 'security_deposit_amount';
    const securityDepositModel = new InputModel({
        labelText: null,
        errorMessage: 'Enter the security deposit',
        inputType: 'currency',
        required: true,
        showValidate: true,
        maxLength: this.AMOUNT_FIELD_MAX,
        apiMapping: securityDepositMapping,
        value: dispute.get(securityDepositMapping),
        clearWhenHidden: true
      });

    this.addPageItem('securityDeposit', new PageItemView({
      stepText: 'Please provide the security deposit amount',
      subView: new InputView({ model: securityDepositModel }),
      stepComplete: securityDepositModel.isValid()
    }));


    // Create security deposit amount component
    const petDepositMapping = 'pet_damage_deposit_amount';
    const petDepositModel = new InputModel({
        labelText: null,
        errorMessage: 'Enter the pet deposit',
        inputType: 'currency',
        required: true,
        showValidate: true,
        maxLength: this.AMOUNT_FIELD_MAX,
        apiMapping: petDepositMapping,
        value: dispute.get(petDepositMapping),
        clearWhenHidden: true
      });

    this.addPageItem('petDeposit', new PageItemView({
      stepText: 'Please provide the pet deposit amount',
      subView: new InputView({ model: petDepositModel }),
      stepComplete: petDepositModel.isValid()
    }));


    // Create cross-app number component
    const counterDisputeApiMapping = 'cross_app_file_number';
    const disputeFileNumberApiMapping = 'file_number';
    const counterDisputeModel = new InputModel({
        labelText: 'File Number',
        errorMessage: 'Cross-application file number is required',
        inputType: 'dispute_number',
        minLength: 9,
        maxLength: 9,
        required: true,
        showValidate: true,
        apiMapping: counterDisputeApiMapping,
        value: dispute.get(counterDisputeApiMapping),
        clearWhenHidden: true,
        restrictedStrings: {
            values: `${dispute.get(disputeFileNumberApiMapping)}`,
            errorMessage: [`Please enter a file number different than this dispute's file number.`]
          }
      }),
      is_counter_dispute_valid = counterDisputeModel.isValid();

    this.addPageItem('counterDisputeNumber', new PageItemView({
      stepText: 'What is the file number on the Notice of Dispute Resolution Proceeding you are filing against?',
      subView: new InputView({ model: counterDisputeModel }),
      stepComplete: is_counter_dispute_valid,
      helpHtml: 'The file number is a 6, 8 or 9 digit number located on the top of your Notice of Dispute Resolution Proceeding.',
    }));

    this.first_view_id = 'touRegion';
  },

  showOutOfBCWarning() {
    animationChannel.request('run', this.getUI('out-of-bc-warning'), 'fadeIn');
  },

  hideOutOfBCWarning() {
    animationChannel.request('run', this.getUI('out-of-bc-warning'), 'fadeOut');
  },

  setupFlows() {
    const dispute = disputeChannel.request('get');

    const touRegion = this.getPageItem('touRegion');
    this.listenTo(touRegion, 'itemComplete', function(options) {
      if (!touRegion.stepComplete) return;
      this.showPageItem(this.showOptInQuestion ? 'trialOptInRegion' : 'applicantType', options);
    }, this);

    const trialOptIn = this.getPageItem('trialOptInRegion');
    this.listenTo(trialOptIn, 'itemComplete', function(options) {
      if (trialOptIn.stepComplete) {
        this.showPageItem('applicantType', options);
      }
    }, this);

    const applicantType = this.getPageItem('applicantType');
    this.listenTo(applicantType, 'itemComplete', function(options) {
      if (applicantType.stepComplete) {
        this.showPageItem('propertyType', options);
      }
    }, this);

    const propertyType = this.getPageItem('propertyType');
    const manufacturedHomeType = this.getPageItem('manufacturedHomeType');
    const dispute_type_rta = configChannel.request('get', 'DISPUTE_TYPE_RTA');
    const dispute_type_mhpta = configChannel.request('get', 'DISPUTE_TYPE_MHPTA');

    this.listenTo(propertyType, 'itemComplete', function(options) {
      const answer = propertyType.getModel().getData();
      const manufacturedHomeAnswer = manufacturedHomeType.getModel().getData();
      animationChannel.request('clearElement', manufacturedHomeType.$el);
      if (answer === "1") { // If MHPTA property type
        // Check if they own home or not
        dispute.set('dispute_type', manufacturedHomeAnswer === "1" ? dispute_type_mhpta : dispute_type_rta);
        this.showPageItem('manufacturedHomeType', options);
      } else if (answer === "0") { // RTA
        dispute.set('dispute_type', dispute_type_rta);

        const manufacturedHomeTypeModel = this.getPageItem('manufacturedHomeType').getModel();
        manufacturedHomeTypeModel.set('question_answer', null);

        this.hideAndCleanPageItem('manufacturedHomeType', options);
        this.showPageItem('rentalAddress', options);
      }
    }, this);

    this.listenTo(manufacturedHomeType, 'itemComplete', function(options) {
      const answer = manufacturedHomeType.getModel().getData();
      dispute.set('dispute_type', answer === "1" ? dispute_type_mhpta : dispute_type_rta);
      if (answer === "1") {
        this.hideAndCleanPageItem('securityDepositQuestion', options);
        this.hideAndCleanPageItem('petDepositQuestion', options);
        this.hideAndCleanPageItem('petDeposit', options);
        this.hideAndCleanPageItem('securityDeposit', options);
      }
      if (manufacturedHomeType.stepComplete) {
        this.showPageItem('rentalAddress', options);
      }
    }, this);


    const rentalAddress = this.getPageItem('rentalAddress');
    this.listenTo(rentalAddress, 'itemComplete', function(options) {
      if (rentalAddress.stepComplete) {
        this.hideOutOfBCWarning();
        if (options && options.triggered_on_show) {
          this.showPageItem('rentalAddressQuestion', options);
        } else {
          // Perform a geozone lookup on the address, and only continue when that has returned
          loaderChannel.trigger('page:load');
          geozoneChannel.request('lookup:address', rentalAddress.getModel().getGeozoneAddressString({
            no_province: true,
            no_country: true
          }));
          this.listenToOnce(geozoneChannel, 'lookup:address:complete', function(geozone_val) {
            rentalAddress.getModel().set('geozone_id', geozone_val);
            if (geozone_val === configChannel.request('get', 'INVALID_GEOZONE_CODE')) {
              this.showOutOfBCWarning();
            }
            loaderChannel.trigger('page:load:complete');
            this.showPageItem('rentalAddressQuestion', options);
          }, this);
        }
      }
    }, this);

    const rentalAddressQuestion = this.getPageItem('rentalAddressQuestion');
    this.listenTo(rentalAddressQuestion, 'itemComplete', function(options) {
      const answer = rentalAddressQuestion.getModel().get('question_answer');
      if (answer === "1") {
        this.showPageItem('rentalQuestionDescription', options);
      } else if (answer === "0") {
        const rentalQuestionDescriptionModel = this.getPageItem('rentalQuestionDescription').getModel();
        rentalQuestionDescriptionModel.set('value', null);

        this.hideAndCleanPageItem('rentalQuestionDescription', options);
        this.showPageItem('tenancyStartDateQuestion', options);
      }
    }, this);

    const rentalQuestionDescription = this.getPageItem('rentalQuestionDescription');
    this.listenTo(rentalQuestionDescription, 'itemComplete', function(options) {
      if (rentalQuestionDescription.stepComplete) {
        this.showPageItem('tenancyStartDateQuestion', options);
      }
    }, this);

    const tenancyStartDateQuestion = this.getPageItem('tenancyStartDateQuestion'),
      tenancyStartDate = this.getPageItem('tenancyStartDate'),
      monthlyRent = this.getPageItem('monthlyRent'),
      rentalInterval = this.getPageItem('rentalInterval'),

      securityDepositQuestion = this.getPageItem('securityDepositQuestion'),
      securityDeposit = this.getPageItem('securityDeposit'),

      petDepositQuestion = this.getPageItem('petDepositQuestion'),
      petDeposit = this.getPageItem('petDeposit'),

      tenancyResidenceStatus = this.getPageItem('tenancyResidenceStatus'),
      tenancyEndDate = this.getPageItem('tenancyEndDate'),
      tenancyEndDateLegacy = this.getPageItem('tenancyEndDateLegacy');

    this.listenTo(tenancyStartDateQuestion, 'itemComplete', function(options) {
      const answer = tenancyStartDateQuestion.getModel().get('question_answer');
      if (answer === "1") {
        this.showPageItem('tenancyStartDate', options);
      } else if (answer === "0") {
        const fast_hide_options = _.extend({}, options, {duration: 100});
        const startDateModel = this.getPageItem('tenancyStartDate').getModel();
        startDateModel.set('value', null);

        this.hideAndCleanPageItem('tenancyStartDate', options);
        this.showPageItem('monthlyRent', options);
      }
    }, this);


    this.listenTo(tenancyStartDate, 'itemComplete', function(options) {
      if (tenancyStartDate.stepComplete) {
        this.showPageItem('monthlyRent', options);
      }
    }, this);


    this.listenTo(monthlyRent, 'itemComplete', function(options) {
      if (monthlyRent.stepComplete) {
        this.showPageItem('rentalInterval', options);
      }
    }, this);

    this.listenTo(rentalInterval, 'itemComplete', function(options) {
      if (rentalInterval.stepComplete && !dispute.isMHPTA()) {
        this.showPageItem('securityDepositQuestion', options);
      } else if (dispute.isMHPTA()) {
        this.showPageItem('tenancyResidenceStatus', options);
      }
    }, this);


    this.listenTo(securityDepositQuestion, 'itemComplete', function(options) {
      const answer = securityDepositQuestion.getModel().get('question_answer');
      if (answer === "1") {
        this.showPageItem('securityDeposit', options);
      } else if (answer === "0") {
        const fast_hide_options = _.extend({}, options, {duration: 100});
        const securityDepositModel = this.getPageItem('securityDeposit').getModel();
        securityDepositModel.set('value', null);

        this.hideAndCleanPageItem('securityDeposit', options);
        this.showPageItem('petDepositQuestion', options);
      }
    }, this);

    this.listenTo(securityDeposit, 'itemComplete', function(options) {
      if (securityDeposit.stepComplete) {
        this.showPageItem('petDepositQuestion', options);
      }
    }, this);

    this.listenTo(petDepositQuestion, 'itemComplete', function(options) {
      const answer = petDepositQuestion.getModel().get('question_answer');
      if (answer === "1") {
        this.showPageItem('petDeposit', options);
      } else if (answer === "0") {
        const fast_hide_options = _.extend({}, options, {duration: 100});
        const petDepositModel = this.getPageItem('petDeposit').getModel();
        petDepositModel.set('value', null);

        this.hideAndCleanPageItem('petDeposit', options);
        this.showPageItem('tenancyResidenceStatus', options);
      }
    }, this);

    this.listenTo(petDeposit, 'itemComplete', function(options) {
      if (petDeposit.stepComplete) {
        this.showPageItem('tenancyResidenceStatus', options);
      }
    }, this);

    this.listenTo(tenancyResidenceStatus, 'itemComplete', function(options) {
      const answer = tenancyResidenceStatus.getModel().get('question_answer');
      animationChannel.request('clearElement', tenancyEndDate.$el);
      animationChannel.request('clearElement', tenancyEndDateLegacy.$el);
      if (answer === 1) {
        this.showPageItem('tenancyEndDate', options);
      } else if (answer === 0) {
        const fast_hide_options = _.extend({}, options, {duration: 100});
        const tenancyEndDateLegacyModel = this.getPageItem('tenancyEndDateLegacy').getModel();
        tenancyEndDateLegacyModel.set('value', null);

        const tenancyEndDateModel = this.getPageItem('tenancyEndDate').getModel();
        tenancyEndDateModel.set('value', null);

        this.hideAndCleanPageItem('tenancyEndDateLegacy', fast_hide_options);
        this.hideAndCleanPageItem('tenancyEndDate', options);
        this.showPageItem('counterDisputeQuestion', options);
      }
    }, this);

    this.listenTo(tenancyEndDate, 'itemComplete', function(options) {
      const date = Moment(tenancyEndDate.getModel().getData({ parse: true }));
      if (date.isValid() && date.isBefore(Moment().subtract(2, 'years'), 'days')) {
        this.showPageItem('tenancyEndDateLegacy', options);
      } else {
        const tenancyEndDateLegacyModel = this.getPageItem('tenancyEndDateLegacy').getModel();
        tenancyEndDateLegacyModel.set('value', null);

        this.hideAndCleanPageItem('tenancyEndDateLegacy', options);
        this.showPageItem('counterDisputeQuestion', options);
      }
    }, this);

    this.listenTo(tenancyEndDateLegacy, 'itemComplete', function(options) {
      if (tenancyEndDateLegacy.stepComplete) {
        this.showPageItem('counterDisputeQuestion', options);
      }
    }, this);

    const counterDisputeQuestion = this.getPageItem('counterDisputeQuestion');
    this.listenTo(counterDisputeQuestion, 'itemComplete', function(options) {
      const answer = counterDisputeQuestion.getModel().get('question_answer');
      if (answer === "1") {
        this.showPageItem('counterDisputeNumber', options);
      } else if (answer === "0") {
        const counterDisputeNumberModel = this.getPageItem('counterDisputeNumber').getModel();
        counterDisputeNumberModel.set('value', null);

        this.hideAndCleanPageItem('counterDisputeNumber', options);
        this.showNextButton(options);
      }
    }, this);

    const counterDisputeNumber = this.getPageItem('counterDisputeNumber');
    this.listenTo(counterDisputeNumber, 'itemComplete', function(options) {
      loaderChannel.trigger('page:load');
      this.validateDmsFileNumbers().then(() => {
        if (counterDisputeNumber.stepComplete) {
          this.showNextButton(options);
        }
      }).catch(() => {
        this.hideNextButton(options);
      })
      .finally(() => loaderChannel.trigger('page:load:complete'));
    }, this);
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView)
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  getPageApiUpdates() {
    return this.getAllPageXHR();
    
  },

  checkForIssueDependentData() {
    // If the user is updating issue-dependent data here, warn them
    const dispute = disputeChannel.request('get');
    const disputeClaims = claimsChannel.request('get');

    const previousDisputeData = {
      isMHPTA: dispute.getApiSavedAttr('dispute_type') === configChannel.request('get', 'DISPUTE_TYPE_MHPTA'),
      isPastTenancy: dispute.getApiSavedAttr('tenancy_ended'),
      hasPetDeposit: dispute.getApiSavedAttr('pet_damage_deposit_amount'),
      hasSecurityDeposit: dispute.getApiSavedAttr('security_deposit_amount'),
      hasDeposit: dispute.getApiSavedAttr('security_deposit_amount') || dispute.getApiSavedAttr('pet_damage_deposit_amount')
    };

    const newDataPetDeposit = String(this.getPageItem('petDepositQuestion').getModel().getData()) === '1';
    const newDataSecurityDeposit = String(this.getPageItem('securityDepositQuestion').getModel().getData()) === '1';
    const newDisputeData = {
      isMHPTA: dispute.isMHPTA(),
      isPastTenancy: String(this.getPageItem('tenancyResidenceStatus').getModel().getData()) === '1',
      hasPetDeposit: newDataPetDeposit,
      hasSecurityDeposit: newDataSecurityDeposit,
      hasDeposit: newDataPetDeposit || newDataSecurityDeposit
    };

    let issueDiscrepancies = {};
    try {
      issueDiscrepancies = disputeChannel.request('check:issue:state', previousDisputeData, newDisputeData, disputeClaims);
    } catch (err) {
      console.log(`[Error] There was an error saving the dispute values during check: `, err);
      issueDiscrepancies = {};
      // Perform no deletes if there was an unexpected error during the check
    }

    console.log(`[Info] Wanting to delete these claims: `, issueDiscrepancies);
    return _.flatten((Object.values(issueDiscrepancies) || []));
  },

  checkIssuesAndShowWarningModal() {
    const issues_to_delete = this.checkForIssueDependentData();
    return new Promise((res, rej) => {
      if (!issues_to_delete || _.isEmpty(issues_to_delete)) return res([]);
    
      const modalIssueDeletes = new ModalIssueDeletes({ issues_to_delete: issues_to_delete });
      this.stopListening(modalIssueDeletes);
      this.listenTo(modalIssueDeletes, 'continue', function() {
        const disputeClaims = claimsChannel.request('get');
        const all_xhr = _.map(issues_to_delete, function(disputeClaim) {
          const dfd = $.Deferred();
          claimsChannel.request('delete:full', disputeClaim).done(function() {
            disputeClaims.remove(disputeClaim);
            dfd.resolve();
          }).fail(dfd.reject);
          return _.bind(dfd.promise, dfd);
        });
        res(all_xhr);
        modalChannel.request('remove', modalIssueDeletes);
      }, this);
  
      this.listenTo(modalIssueDeletes, 'cancel', () => rej());
  
      modalChannel.request('add', modalIssueDeletes);
    });
  },

  performNextPageApiCalls(all_xhr) {
    all_xhr = all_xhr && !_.isEmpty(all_xhr) ? all_xhr : [];

    const onNextSuccessFn = function() {
      applicationChannel.trigger('progress:step:complete', 1);
      Backbone.history.navigate('page/2', {trigger: true});
    };

    _.each(this.getPageApiUpdates(), function(xhr) {
      all_xhr.push(xhr);
    });

    if (all_xhr.length === 0) {
      console.log("[Info] No changes to the Dispute or IntakeQuestions API.  Moving to next page");
      onNextSuccessFn();
      return;
    }
    Promise.all(all_xhr.map(xhr => xhr())).then(() => {
      console.log("[Info] API updates successful.  Moving to next page");
      onNextSuccessFn();
    }, this.createPageApiErrorHandler(this, 'INTAKE.PAGE.NEXT.GENERAL'));
  },

  validateDmsFileNumbers() {
    const counterDisputeNumberView = this.getPageItem('counterDisputeNumber');
    const counterDisputeNumberModel = counterDisputeNumberView.getModel()

    if (!counterDisputeNumberModel.getData()) return Promise.resolve();
    const fileNumberPromise = new Promise((res, rej) => {
      disputeChannel.request('check:filenumber', counterDisputeNumberModel.getData())
        .done((response={}) => {
          if (!response.validated) {
            counterDisputeNumberView.showErrorMessage('File number is not valid');
            rej();
          } else {
            res();
          }
        // If check fails, have it fail silently and continue
        }).fail(() => {
          res();
        })
    });
        return fileNumberPromise
  },

  scrollToFirstError() {
    const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (visible_error_eles.length === 0) {
      console.log(`[Warning] Page not valid, but no visible error message found`);
    } else {
      animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
    }
  },

  nextPage() {
    const isPageValid = this.validatePage();

    if (!isPageValid) {
      this.scrollToFirstError();
      return;
    }
    const dispute = disputeChannel.request('get');
    const trialOptIn = this.getPageItem('trialOptInRegion');
    const isOptIn = trialOptIn && trialOptIn.getModel().getData() === QUESTION_ANSWER_YES;
    const disputeTrialModel = TrialLogic_BIGEvidence.getDisputeTrialModel();
    const isOptedIn = isOptIn && (!disputeTrialModel || !disputeTrialModel.get('dispute_role'));

    this.checkIssuesAndShowWarningModal().then(issueDeleteXhr => {
      loaderChannel.trigger('page:load');
      if (!TrialLogic_BIGEvidence.isOptInAllowed(dispute)) return this.performNextPageApiCalls(issueDeleteXhr);

      const trialRolePromise = () => isOptedIn ? TrialLogic_BIGEvidence.getIntakeTrialRole() : Promise.resolve(configChannel.request('get', 'TRIAL_DISPUTE_ROLE_NOT_PARTICIPATING'));
      trialRolePromise().then(trialRole => {
        const disputeTrialData = trialRole ? { dispute_role: trialRole } : null;

        TrialLogic_BIGEvidence.addIntakeDisputeToTrial(dispute, disputeTrialData)
          .finally(() => this.performNextPageApiCalls(issueDeleteXhr));
      });
    })
  },

  templateContext() {
    return {
      TOU_template: TOU_template({ trialsText: this.hasOngoingTrial ? TrialLogic_BIGEvidence.getTrialsTOUHtml() : null })
    };
  }
});
