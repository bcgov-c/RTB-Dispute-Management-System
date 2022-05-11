import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import ViewMixin from '../../../../core/utilities/ViewMixin';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownCollection from '../../../../core/components/dropdown/Dropdown_collection';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import { AddIssueModal } from '../../../components/modals/AddIssueModal';
import { IconAdd, IconPostedDecisionsDelete, IconInfo } from '../../../assets/images';
import './DecisionSearch.scss';
import { polyglot } from '../../../assets/locales';

//no codes found in internal_config
const TENANT_IN_UNIT_CODE = '0';
const TENANT_MOVED_OUT_CODE = '1';
const OWNED_BY_RENTER_CODE = '1';
const NOT_OWNED_BY_RENTER_CODE = '0';
const BETWEEN_DATES_SEARCH_CODE = '0';
const BEFORE_DATE_SEARCH_CODE = '1';
const AFTER_DATE_SEARCH_CODE = '2';
const RADIO_CODE_PROPERTIES = 0;
const RADIO_CODE_TEXT = 1;
const BUSINESS_NAME_MAX_LENGTH = 50;
const BUSINESS_NAME_MIN_LENGTH = 3;
const INCOMPLETE_FIELDS_ERROR = 'Necessary fields not complete';
const NO_ISSUE_SELECTED_ERROR = 'Please select an issue'
const POSTED_DECISIONS_RELEASE_DATE = Moment("2020-09-31");

const DecisionSearch = Marionette.View.extend({
  initialize(options) {
    this.configChannel = Radio.channel('config');
    this.animationChannel = Radio.channel('animations');
    this.modalChannel = Radio.channel('modals');
    this.LANDLORD_CODE = String(this.configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'));
    this.TENANT_CODE = String(this.configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'));
    this.DROPDOWN_CODE_HOME = String(this.configChannel.request('get', 'DISPUTE_TYPE_RTA'));
    this.DROPDOWN_CODE_MH_PARK = String(this.configChannel.request('get', 'DISPUTE_TYPE_MHPTA'));

    this.LANDLORD_AND_TENANT_HEARING_CODE = String(this.configChannel.request('get', 'COMPLEXITY_SIMPLE'));
    this.APPLICANT_HEARING_CODE = String(this.configChannel.request('get', 'COMPLEXITY_STANDARD'));
    this.RESPONDENTS_HEARING_CODE = String(this.configChannel.request('get', 'COMPLEXITY_COMPLEX'));

    this.PARTICIPATORY_HEARING_CODE = String(this.configChannel.request('get', 'PROCESS_ORAL_HEARING'));
    this.DIRECT_REQUEST_CODE = String(this.configChannel.request('get', 'PROCESS_WRITTEN_OR_DR'));
    this.REVIEW_HEARING_CODE = String(this.configChannel.request('get', 'PROCESS_REVIEW_HEARING'));
    this.JOINED_APPLICATION_CODE = String(this.configChannel.request('get', 'PROCESS_JOINER_HEARING'));
    this.RENT_INCREASE_CODE = String(this.configChannel.request('get', 'PROCESS_RENT_INCREASE'));

    this.mergeOptions(options, ['searchOption']);
    this.createSubModels();
    this.setupListeners();
    this.template = this.template.bind(this);//bind this to template so we can call functions inside of template. E.G "this.functionName()"

    this.searchOption ? this.searchOption : null;
    this.addIssueCollection = new DropdownCollection();
    this.showIssueError = false;
    this.showAddIssue = false;
    this.showOwnedBy = false;
    this.showAfterDate = false;
    this.showBeforeDate = false;
    this.showAndText = false;
    
    this.requiredDisputeRegions = ['applicantDropdownRegion', 'rentalTypeDropdownRegion', 'tenancyStatusDropdownRegion', 'resolutionProcessDropdownRegion',
    'businessCheckboxRegion', 'attendancCheckboxRegion', 'specificIssueCheckboxRegion', 'dateCheckboxRegion', 'ownedByDropdownRegion', 'dateDecisionAfterInputRegion', 'dateDecisionBeforeInputRegion'];
    this.requiredInputsRegions = ['applicantDropdownRegion', 'rentalTypeDropdownRegion', 'tenancyStatusDropdownRegion', 'ownedByDropdownRegion', 'resolutionProcessDropdownRegion'];
    this.disputeRegions = ['applicantDropdownRegion', 'rentalTypeDropdownRegion', 'ownedByDropdownRegion', 
    'tenancyStatusDropdownRegion', 'resolutionProcessDropdownRegion', 'businessNameInputRegion', 'attendanceDropdownRegion',
    'decisionDateDropdownRegion', 'dateDecisionAfterInputRegion', 'dateDecisionBeforeInputRegion', 'businessCheckboxRegion', 'attendancCheckboxRegion', 'specificIssueCheckboxRegion', 'dateCheckboxRegion'];
    this.dateRegions = ['decisionDateDropdownRegion','dateDecisionAfterInputRegion', 'dateDecisionBeforeInputRegion'];
    this.disputeTextFreeRegions = ['decisionFreeTextRegion'];
    this.decisionSearchRegions = [...this.disputeRegions, ...this.disputeTextFreeRegions];
  },

  setupListeners() {
    /* Model trigger listeners */
    this.listenTo(this.model, 'filter:update', (filterVal) => {
      this.resetDecisionSearch();
      this.searchOption = filterVal;
      this.render();
    });
    this.listenTo(this.model, 'search:clicked', () => {
      const valid = this.validateAndShowErrors(this.decisionSearchRegions);
      if (valid) {
        this.disableForm();
        this.loadDecisions();
      }
    });
    this.listenTo(this.model, 'search:reset', this.resetDecisionSearch);

    /* Input Listeners */
    this.listenTo(this.applicantModel, 'change:value', () => {
      if (this.requiredRegionsValid()) {
        this.setProcessModel();
      } else {
        this.resolutionProcessModel.set({ disabled: true, errorMessage: INCOMPLETE_FIELDS_ERROR });
      }
      this.resetAndRenderDependentModels();
    });

    this.listenTo(this.rentalTypeModel, 'change:value', () => {
      if (this.requiredRegionsValid()) {
        this.setProcessModel();
      } else {
        this.resolutionProcessModel.set({ disabled: true, errorMessage: INCOMPLETE_FIELDS_ERROR });
      }
      this.resetAndRenderDependentModels();
    });

    this.listenTo(this.ownedByModel, 'change:value', () => {
      if (this.requiredRegionsValid()) {
        this.setProcessModel();
      } else {
        this.resolutionProcessModel.set({ disabled: true, errorMessage: INCOMPLETE_FIELDS_ERROR });
      }
      this.resetAndRenderDependentModels();
    });

    this.listenTo(this.tenancyStatusModel, 'change:value', () => {
      if (this.requiredRegionsValid()) {
        this.setProcessModel();
      } else {
        this.resolutionProcessModel.set({ disabled: true, errorMessage: INCOMPLETE_FIELDS_ERROR });
      }
      this.resetAndRenderDependentModels();
    });

    this.listenTo(this.resolutionProcessModel, 'change:value', () => {                                   
      this.showIssueError = false;
      const resetResolutionProcess = false;
      this.resetAndRenderDependentModels(resetResolutionProcess);
    });


    /* Checkbox listeners*/
    this.listenTo(this.businessCheckboxModel, 'change:checked', () => {
      if (this.businessCheckboxModel.getData() === true) {
        this.businessNameModel.set({ disabled: false, value: null, required: true });
        this.getChildView('businessNameInputRegion').render();
      } else {
        this.businessNameModel.set({ disabled: true, value: null, required: false });
        this.getChildView('businessNameInputRegion').render();
      }
    });

    this.listenTo(this.attendanceCheckboxModel, 'change:checked', () => {
      if (this.attendanceCheckboxModel.getData() === true) {
        this.attendanceModel.set({ disabled: false, value: null, required: true });
        this.getChildView('attendanceDropdownRegion').render();
      } else {
        this.attendanceModel.set({ disabled: true, value: null, required: false });
        this.getChildView('attendanceDropdownRegion').render();
      }
    });

    this.listenTo(this.decisionDateCheckboxModel, 'change:checked', () => {
      if (this.decisionDateCheckboxModel.getData() === true) {
        this.dateSearchDropdownModel.set({ disabled: false, required: true });
        this.dateDecisionAfterModel.set({ disabled: false, required: true });
        this.dateDecisionBeforeModel.set({ disabled: false, required: true });
        this.getChildView('decisionDateDropdownRegion').render();
      } else {
        this.dateSearchDropdownModel.set({ disabled: true, value: null, required: false });
        this.dateDecisionAfterModel.set({ disabled: false, value: null, required: false });
        this.dateDecisionBeforeModel.set({ disabled: false, value: null, required: false });
        this.render();
      }
    });

    this.listenTo(this.specificIssueCheckboxModel, 'change:checked', () => {
      if (this.specificIssueCheckboxModel.getData() === true) {
        this.showAddIssue = true;
      } else {
        this.addIssueCollection.reset([], { silent: true });
        this.showIssueError = false;
        this.showAddIssue = false;
      }
      this.render();
    });

    /* Dropdown Listeners */
    this.listenTo(this.rentalTypeModel, 'change:value', () => {
      if (this.rentalTypeModel.getData() === this.DROPDOWN_CODE_MH_PARK) {
        this.showOwnedBy = true;
        this.ownedByModel.set({ required: true });
      } else {
        this.showOwnedBy = false;
        this.ownedByModel.set({ required: false });
      }

      this.render();
    });

    /* Date Input Listeners */
    this.listenTo(this.dateDecisionAfterModel, 'change:value', (model, val) => {
      if (Moment(val).isAfter(Moment().subtract(1, 'd')) && this.dateSearchDropdownModel.getData() === BETWEEN_DATES_SEARCH_CODE) this.dateDecisionBeforeModel.set({ customLink: '' });
      else this.dateDecisionBeforeModel.set({ customLink: 'Today' });
      this.dateDecisionBeforeModel.set({ minDate: Moment(val).add(1, 'd') });
      this.render();
    });

    this.listenTo(this.dateDecisionBeforeModel, 'change:value', (model, val) => {
      if (val) this.dateDecisionAfterModel.set({ maxDate: Moment(val).subtract(1, 'd') });
      this.render();
    });

    this.listenTo(this.dateSearchDropdownModel, 'change:value', () => {
      if (this.dateSearchDropdownModel.getData() === BETWEEN_DATES_SEARCH_CODE) {
        this.dateDecisionAfterModel.set({ value: null, required: true, maxDate: Moment().subtract(1, 'd') });
        this.dateDecisionBeforeModel.set({ value: null, required: true });
        this.showAfterDate = true; 
        this.showAndText = true;
        this.showBeforeDate = true;
      } else if (this.dateSearchDropdownModel.getData() === BEFORE_DATE_SEARCH_CODE) {
        this.dateDecisionAfterModel.set({ value: null, required: null });
        this.dateDecisionBeforeModel.set({ value: null, required: true });
        this.showAfterDate = false;
        this.showAndText = false;
        this.showBeforeDate = true;
      } else if (this.dateSearchDropdownModel.getData() === AFTER_DATE_SEARCH_CODE) {
        this.dateDecisionBeforeModel.set({ value: null, required: null });
        this.dateDecisionAfterModel.set({ value: null, required: true, maxDate: Moment() });
        this.showAfterDate = true;
        this.showAndText = false;
        this.showBeforeDate = false;
      } else {
        this.dateDecisionAfterModel.set({ value: null });
        this.dateDecisionBeforeModel.set({ value: null});
        this.showAfterDate = false;
        this.showAndText = false;
        this.showBeforeDate = false;
      }

      this.render();
    });
  },

  createSubModels() {
    /* Dropdown Models */
    this.applicantModel = new DropdownModel({
      optionData: [{ value: this.LANDLORD_CODE, text: 'Landlord' },
      { value: this.TENANT_CODE, text: 'Tenant' }],
      labelText: "Applicant",
      required: true,
      defaultBlank: true,
      value: null,
    });

    this.rentalTypeModel = new DropdownModel({
      optionData: [{ value: this.DROPDOWN_CODE_HOME, text: 'Home, suite or apartment' }, 
      { value: this.DROPDOWN_CODE_MH_PARK, text: 'Site in a manufactured home park' }],
      labelText: "Rental Type",
      required: true,
      defaultBlank: true,
      value: null,
    });

    this.ownedByModel = new DropdownModel({
      optionData: [{ value: OWNED_BY_RENTER_CODE, text: 'Owned By the Renter'}, { value: NOT_OWNED_BY_RENTER_CODE, text: 'Not owned by the renter'}],
      labelText: "Ownership",
      required: false,
      defaultBlank: true,
      value: null
    })

    this.tenancyStatusModel = new DropdownModel({
      optionData: [{ value: TENANT_IN_UNIT_CODE, text: 'Tenant was living in unit' }, { value: TENANT_MOVED_OUT_CODE, text: 'Tenant already moved out' }],
      labelText: "Tenancy Status",
      required: true,
      defaultBlank: true,
      value: null,
    });

    this.resolutionProcessModel = new DropdownModel({
      optionData: this.getResolutionProcessOptions(),
      labelText: "Resolution Process",
      errorMessage: INCOMPLETE_FIELDS_ERROR,
      disabled: true,
      required: true,
      defaultBlank: true,
      value: null,
    });

    /* Checkbox + Input/Dropdown Models */

    this.businessCheckboxModel = new CheckboxModel({
      html: 'With a business like:',
      checked: false
    });

    this.businessNameModel = new InputModel({
      labelText: 'Business Name',
      inputType: 'text',
      errorMessage: 'Please enter part of the business name',
      disabled: true,
      required: false,
      maxLength: BUSINESS_NAME_MAX_LENGTH,
      minLength: BUSINESS_NAME_MIN_LENGTH,
      value: null
    })

    this.attendanceCheckboxModel = new CheckboxModel({
      html: 'With the hearing attended by:',
      checked: false
    });

    this.attendanceModel = new DropdownModel({
      optionData: this.getHearingOptions(),
      labelText: "Hearing Attendance",
      disabled: true,
      required: false,
      defaultBlank: true,
      value: null,
    });

    this.specificIssueCheckboxModel = new CheckboxModel({
      html: 'With specific issue(s):',
      checked: false
    });

    /* Date Checkbox, Dropdown and Input Models*/ 

    this.decisionDateCheckboxModel = new CheckboxModel({
      html: 'Where the decision date was:',
      checked: false
    });

    this.dateSearchDropdownModel = new DropdownModel({
      optionData: this.getDateSearchOptions(),
      labelText: "Date Search",
      disabled: true,
      required: false,
      defaultBlank: true,
      value: null,
    });

    
    this.dateDecisionAfterModel = new InputModel({
      labelText: 'On or After',
      inputType: 'date',
      errorMessage: 'Enter a date',
      required: false,
      minDate: POSTED_DECISIONS_RELEASE_DATE,
      value: null,
    });

    this.dateDecisionBeforeModel = new InputModel({
      labelText: 'On or Before',
      inputType: 'date',
      errorMessage: 'Enter a date',
      required: false,
      minDate: POSTED_DECISIONS_RELEASE_DATE,
      value: null,
      customLink: 'Today',
      customLinkFn: (() => {
        this.dateDecisionBeforeModel.set({ value: Moment().format("MMM D, YYYY") });
        this.render();
      })
    });

    this.decisionFreeTextModel = new TextareaModel({
      labelText: 'Enter text from an uploaded decision',
      errorMessage: 'Enter decision search text',
      required: true,
      value: null,
      countdown: true,
      max: 500
    });
  },

  validateAndShowErrors(regionsToValidate) {
    
    let isValid = true;

    if (this.specificIssueCheckboxModel.getData() && (!this.applicantModel.getData() || !this.rentalTypeModel.getData() 
    || !this.tenancyStatusModel.getData() || !this.resolutionProcessModel.getData())) {
      this.getUI('issueError').text(INCOMPLETE_FIELDS_ERROR);
      this.showIssueError = true;
      isValid = false;
      this.render();
    } else if (regionsToValidate.includes("specificIssueCheckboxRegion") && this.specificIssueCheckboxModel.getData() && this.addIssueCollection.length < 1) {
      this.getUI('issueError').text(NO_ISSUE_SELECTED_ERROR);
      this.showIssueError = true;
      isValid = false;
      this.render();
    }

    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        this.animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }

    return isValid;
  },

  requiredRegionsValid() {
    if (this.applicantModel.getData() && (this.rentalTypeModel.getData() === this.DROPDOWN_CODE_HOME ||  
      (this.rentalTypeModel.getData() === this.DROPDOWN_CODE_MH_PARK && this.ownedByModel.getData())) 
      && this.tenancyStatusModel.getData()) return true;
    else return false;
  },

  loadDecisions() {
    const decisionSearchData = {
      disputeType: this.rentalTypeModel,
      tenancyEnded: this.tenancyStatusModel,
      disputeProcess:  this.resolutionProcessModel,
      disputeSubType: this.applicantModel,
      businessNames: this.businessNameModel,
      hearingAttendance: this.attendanceModel,
      decisionDateGreaterThan: this.dateDecisionAfterModel,
      decisionDateLessThan: this.dateDecisionBeforeModel,
      includedClaimCodes: this.getClaimCodes()
    }

    const decisionFreeTextData = {
      query: this.decisionFreeTextModel
    }

    this.model.trigger('form:disabled', this.searchOption === RADIO_CODE_PROPERTIES ? decisionSearchData : decisionFreeTextData);
  },

  disableForm() {
    let regionsToDisable = '';
    
    if (this.searchOption === RADIO_CODE_PROPERTIES) {
      regionsToDisable = this.disputeRegions;
      this.showAddIssue = false;
      this.dateDecisionBeforeModel.set({ customLink: '' })
    } else if (this.searchOption === RADIO_CODE_TEXT) {
      regionsToDisable = this.disputeTextFreeRegions;
    }

    _.each(regionsToDisable, function(viewName) {
      const view = this.getChildView(viewName);
      view.model.set({ disabled: true });
      view.render();
    }, this);

    this.render();
  },

  resetDecisionSearch() {
    let regionsToReset = '';
    let requiredRegions = '';
    if (this.searchOption === RADIO_CODE_PROPERTIES) {
      regionsToReset = this.disputeRegions;//enable required inputs
      requiredRegions = this.requiredDisputeRegions;
      this.dateDecisionBeforeModel.set({ customLink: 'Today' });
    } else if (this.searchOption === RADIO_CODE_TEXT) {
      regionsToReset = this.disputeTextFreeRegions
      requiredRegions = this.disputeTextFreeRegions;
    }

    _.each(requiredRegions, function(viewName) {
      const view = this.getChildView(viewName);
      view.model.set({ disabled: false });
      view.render();
    }, this);

    _.each(regionsToReset, function(viewName) {//reset inputs and checkboxes
      const view = this.getChildView(viewName);
      if (view.model.get('checked')) view.model.set({ checked: false });
      else view.model.set({ value: null });
      view.render();
    }, this);

    this.addIssueCollection.reset([], { silent: true });
    $.scrollPageToTop();
    this.render();
  },

  resetAndRenderDependentModels(resetResolutionProcess = true) {
    resetResolutionProcess ? this.resolutionProcessModel.set({ value: null }) : null;
    this.addIssueCollection.reset([], { silent: true });
    this.showIssueError = false;
    this.render();
  },

  addIssue() {
    if (!this.validateAndShowErrors(this.requiredInputsRegions)) return;
    this.showIssueError = false;
    const issueData = {
      disputeProcess: { text: this.renderJsxDisputeProcessText(), value: this.resolutionProcessModel.getData() },
      act: this.getAct(),
      applicantType: { text: this.applicantModel.getSelectedText(), value: this.applicantModel.getData() },
      tenancyStatus: { text: this.renderJsxTenancyStatusText(), value: this.tenancyStatusModel.getData() }
    };

    const modalAddIssue = new AddIssueModal({
      issueData,
      addIssueCollection: this.addIssueCollection,
    });

    this.modalChannel.request('add', modalAddIssue);

    /* Add issue modal listener */
    this.listenTo(modalAddIssue, 'issue:added', (addIssueCollection) => {
      this.addIssueCollection = addIssueCollection
      this.render();
    });
  },

  deleteIssue(index) {
    
    if (!this.showAddIssue) return;

    this.addIssueCollection.remove(this.addIssueCollection.at(index));
    this.render();
  },

  setProcessModel() {
    this.resolutionProcessModel.set({ disabled: false, errorMessage: null });
    if (this.applicantModel.getData() === this.LANDLORD_CODE && this.tenancyStatusModel.getData() === TENANT_IN_UNIT_CODE) {
      this.resolutionProcessModel.set({ optionData: [...this.getResolutionProcessOptions(), ...this.getDirectRequestProcess(), ...this.getRentIncreaseProcess()] });
    } else if (this.applicantModel.getData() === this.TENANT_CODE && this.tenancyStatusModel.getData() === TENANT_MOVED_OUT_CODE) {
      this.resolutionProcessModel.set({ optionData: [...this.getResolutionProcessOptions(), ...this.getDirectRequestProcess()] });
    } else {
      this.resolutionProcessModel.set({ optionData: [...this.getResolutionProcessOptions()] });
    }
  },

  getClaimCodes() {
    let claimCodes = [];
    this.addIssueCollection.forEach((issue) => {
      claimCodes = [...claimCodes, issue.getData()];
    });

    return claimCodes;
  },

  getDateSearchOptions() {
    return  [
      { value: '0', text: 'Between two dates'},
      { value: '1', text: 'Before a specific date'},
      { value: '2', text: 'After a specific date'}
    ]
  },

  getHearingOptions() {
    return [
      { value: this.LANDLORD_AND_TENANT_HEARING_CODE, text: 'Applicants and Respondents' },
      { value: this.APPLICANT_HEARING_CODE, text: 'Applicants only' },
      { value: this.RESPONDENTS_HEARING_CODE, text: 'Respondents only' },
    ]
  },

  getResolutionProcessOptions() {
    return [
      { value: this.PARTICIPATORY_HEARING_CODE, text: 'Participatory hearing (oral)' },
      { value: this.REVIEW_HEARING_CODE, text: 'Review hearing (oral)' },
      { value: this.JOINED_APPLICATION_CODE, text: 'Joined application hearing (oral)' },
    ];
  },

  getDirectRequestProcess() {
    return [{ value: this.DIRECT_REQUEST_CODE, text: 'Direct request (written)' }];
  },

  getRentIncreaseProcess() {
    return [{ value: this.RENT_INCREASE_CODE, text: 'Rent increase hearing (oral)' }];
  },

  getAct() {
    if (this.rentalTypeModel.getData() === this.DROPDOWN_CODE_MH_PARK && this.ownedByModel.getData() === OWNED_BY_RENTER_CODE) return {text: 'MHPTA', value: this.DROPDOWN_CODE_MH_PARK};
    else return {text: 'RTA', value: this.DROPDOWN_CODE_HOME};
  },


  /* Marionette Methods*/

  onRender() {
    ViewMixin.prototype.initializeHelp(this, polyglot.t('postedDecisions.helpText'));

    if (this.searchOption === RADIO_CODE_PROPERTIES) {
      this.showChildView('applicantDropdownRegion', new DropdownView({ model: this.applicantModel }));
      this.showChildView('rentalTypeDropdownRegion', new DropdownView({ model: this.rentalTypeModel }));
      this.showChildView('ownedByDropdownRegion', new DropdownView({ model: this.ownedByModel }));
      this.showChildView('tenancyStatusDropdownRegion', new DropdownView({ model: this.tenancyStatusModel }));
      this.showChildView('resolutionProcessDropdownRegion', new DropdownView({ model: this.resolutionProcessModel }));
  
      this.showChildView('businessCheckboxRegion', new CheckboxView({ model: this.businessCheckboxModel }));
      this.showChildView('businessNameInputRegion', new InputView({ model: this.businessNameModel }));
  
      this.showChildView('attendancCheckboxRegion', new CheckboxView({ model: this.attendanceCheckboxModel }));
      this.showChildView('attendanceDropdownRegion', new DropdownView({ model: this.attendanceModel }));
  
      this.showChildView('specificIssueCheckboxRegion', new CheckboxView({ model: this.specificIssueCheckboxModel }));
  
      this.showChildView('dateCheckboxRegion', new CheckboxView({ model: this.decisionDateCheckboxModel }));
      this.showChildView('decisionDateDropdownRegion', new DropdownView({ model: this.dateSearchDropdownModel }));
      this.showChildView('dateDecisionAfterInputRegion', new InputView({ model: this.dateDecisionAfterModel }));
      this.showChildView('dateDecisionBeforeInputRegion', new InputView({ model: this.dateDecisionBeforeModel }));

    } else if (this.searchOption === RADIO_CODE_TEXT) {
      this.showChildView('decisionFreeTextRegion', new TextareaView({ model: this.decisionFreeTextModel }));
    }
  },

  regions: {
    applicantDropdownRegion: '.decision-search__input__applicant',
    rentalTypeDropdownRegion: '.decision-search__input__rental-type',
    ownedByDropdownRegion: '.decision-search__input__owned-by',
    tenancyStatusDropdownRegion: '.decision-search__input__tenancy-status',
    resolutionProcessDropdownRegion: '.decision-search__input__resolution-process',
    
    businessCheckboxRegion: '.decision-search__input__business-checkbox',
    businessNameInputRegion: '.decision-search__input__business-name',
   
    attendancCheckboxRegion: '.decision-search__input__attendance-checkbox',
    attendanceDropdownRegion: '.decision-search__input__attendance',
    
    specificIssueCheckboxRegion: '.decision-search__issue__specific-issue',

    dateCheckboxRegion: '.decision-search__decision-date__date-checkbox',
    decisionDateDropdownRegion: '.decision-search__decision-date__date-dropdown',
    dateDecisionAfterInputRegion: '.decision-search__decision-date__date-after',
    dateDecisionBeforeInputRegion: '.decision-search__decision-date__date-before',
    decisionFreeTextRegion: '.decision-search__free-text'
  },

  ui: {
    issueError: '.decision-search__issue__add_error'
  },

  template() {
    return (
      <div className="decision-search">
        {this.renderJsxDecisionSearch()}
      </div>
    );
  },

  renderJsxDisputeProperties() {
    return (
      <>
        {/* Dropdown Inputs */}
        <div className="decision-search__input">
          <span className="decision-search__input__label">Where the dispute was filled by a:</span>
          <div className="decision-search__input__applicant"></div>
        </div>
        <div className="decision-search__input">
          <span className="decision-search__input__label">Where the rental unit was a:</span>
          <div className="decision-search__input__rental-type"></div>
          <div className={`decision-search__input__wrapper ${this.showOwnedBy ? '' : 'hidden'}`}>
            <span className="decision-search__input__label--inline">and the manufactured home is:</span>
            <div className="decision-search__input__owned-by"></div>
          </div>
        </div>
        <div className="decision-search__input">
          <span className="decision-search__input__label">Where the tenancy status was:</span>
          <div className="decision-search__input__tenancy-status"></div>
        </div>
        <div className="decision-search__input">
          <span className="decision-search__input__label">That was resolved by:</span>
          <div className="decision-search__input__resolution-process"></div>
        </div>
        {/* Checkbox + Dropdown/Inputs */}
        <div className="decision-search__input">
          <span className="decision-search__input__checkbox-label">
            <div className="decision-search__input__business-checkbox"></div>
          </span>
          <div className="decision-search__input__business-name"></div>
          <div className="decision-search__issue__tip">
            <span className="decision-search__issue__tip__text">
              <img className="decision-search__issue__tip__img" src={IconInfo} />
              <span className="decision-search__issue__tip__title">Tip: <span className="decision-search__issue__tip__body">{polyglot.t('postedDecisions.tipText')}</span></span>
            </span>
          </div>
        </div>
        <div className="decision-search__input">
          <span className="decision-search__input__checkbox-label">
            <div className="decision-search__input__attendance-checkbox"></div>
          </span>
          <div className="decision-search__input__attendance"></div>
        </div>
        <div className="decision-search__issue">
          <span className="decision-search__issue__checkbox">
            <div className="decision-search__issue__specific-issue"></div>
            <span className="decision-search__input__specific-issue__img">
              <a role="button" className="badge help-icon">?</a>
            </span>
          </span>
          <div className="decision-search__issue__wrapper">
            <span className={`decision-search__issue__add ${this.showAddIssue ? '' : 'hidden'}`} onClick={() => this.addIssue()}>
              <img className="decision-search__issue__add__image" src={IconAdd} alt="" /> 
              <span className="decision-search__issue__add__text">{polyglot.t('postedDecisions.addIssue')}</span>
            </span>
            <p className={`decision-search__issue__add_error error-block ${this.showIssueError ? '' : 'hidden'}`}>{}</p>
          </div>
        </div>
        <div className="decision-search__chosen-issues">
          {this.renderJsxIssue()}
        </div>
        {/* Date Elements */}
        <div className="decision-search__decision-date">
          <div className="decision-search__decision-date__date-checkbox"></div>
          <div className="decision-search__decision-date__date-dropdown"></div>
          <div className={`decision-search__decision-date__date-after ${this.showAfterDate ? '' : 'hidden'}`}></div>
          <span className={`decision-search__decision-date__date-text ${this.showAndText ? '' : 'hidden'}`}>and</span>
          <div className={`decision-search__decision-date__date-before ${this.showBeforeDate ? '' : 'hidden'}`}></div>
        </div>
      </>
    )
  },

  renderJsxDisputeProcessText() {
    const disputeText = this.resolutionProcessModel.getSelectedText();
    return disputeText.substring(0, disputeText.indexOf("("));
  },

  renderJsxTenancyStatusText() {
    if (this.tenancyStatusModel.getData() === TENANT_IN_UNIT_CODE) return 'Current Tenant';
    else return 'Past Tenant';
  },

  renderJsxFreeSearch() {
    return <div className="decision-search__free-text"></div>;
  },

  renderJsxDecisionSearch() {
    if (this.searchOption === RADIO_CODE_PROPERTIES) return this.renderJsxDisputeProperties();
    else return this.renderJsxFreeSearch();
  },

  renderJsxIssue() {
    return this.addIssueCollection.map((issue, index) => {
      return (
        <div className="decision-search__chosen-issues__issue" key={index}>
          <div>
            <span className="decision-search__chosen-issues__issue__index">{index+1}:</span>
            <span>{issue.getSelectedText()}</span>
          </div>
          <img className={`decision-search__chosen-issues__issue__img ${this.showAddIssue ? '' : 'hidden'}`} src={ IconPostedDecisionsDelete } onClick={() => this.deleteIssue(index)}/>
        </div>
      );
    });
  },
});

_.extend(DecisionSearch.prototype, ViewJSXMixin);
export { DecisionSearch }