import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import GeneralDisputeView from './NewDisputeGeneralInfo/NewDisputeGeneralInfo';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DoubleSelectorView from '../../../core/components/double-selector/DoubleSelector';
import DoubleSelectorModel from '../../../core/components/double-selector/DoubleSelector_model';
import EmailView from '../../../core/components/email/Email';
import template from './NewDisputePage_template.tpl';

import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const BASE_APPLICATION_FEE_AMOUNT = 300;
const MAX_UNIT_FEE_AMOUNT = 300;
const PER_UNIT_FEE_AMOUNT = 10;
const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';
const DROPDOWN_CODE_HOME = '1';
const DROPDOWN_CODE_MH_PARK = '2';
const TENANCY_COUNTRY = 'Canada';
const GEOZONE_WARNING = 'This address does not appear to be a valid British Columbia address. Check that the address is correct before you continue.';
const TENANT_DR_WARNING = `A Tenant application by Direct Request is not allowed for rentals that fall under the Manufactured Home Park Tenancy Act (MHPTA).  
Based on the above selections this unit falls under the MHPTA and this application cannot be submitted by Direct Request.`;
const ISSUES_ARIE_TEXT = 'All pages and signed?';
const RENTAL_ARIE_TEXT = 'Main Rental Site Address';
const ISSUES_TEXT = 'Issues selected and signed?'
const RENTAL_TEXT = 'Rental Unit Street Address'


const geozoneChannel = Radio.channel('geozone');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} office-page-new-dispute`,

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    generalDisputeRegion: '.office-page-new-dispute-section',

    rentalTypeRegion: '.office-new-dispute-rental-type',
    ownsHomeRegion: '.office-new-dispute-owns-home',
    crossAppRegion: '.office-new-dispute-cross-app',
    streetRegion: '.office-new-dispute-street',
    cityRegion: '.office-new-dispute-city',
    postalCodeRegion: '.office-new-dispute-postal-code',

    addressQuestionRegion: '.office-new-dispute-shared-address',
    rentalUnitRegion: '.office-new-dispute-rental-unit',

    participantTypeRegion: '.office-page-new-dispute-participant-type',
    businessNameRegion: '.office-new-dispute-business-name',
    firstNameRegion: '.office-new-dispute-first-name',
    lastNameRegion: '.office-new-dispute-last-name',
    emailRegion: '.office-new-dispute-email',
    phoneRegion: '.office-new-dispute-phone',
    packageMethodRegion: '.office-new-dispute-package-method',

    issuesSelectedRegion: '.office-new-dispute-applicant-issues-selected',
    additionalFormsRegion: '.office-new-dispute-applicant-additional-forms',
    respondentIncludedRegion: '.office-new-dispute-applicant-included-respondent',
    hasRespondentAddressRegion: '.office-new-dispute-applicant-has-respondent-address',
    requiredEvidenceRegion: '.office-new-dispute-applicant-required-evidence',

    rentIncreaseInformationRegion: '.office-new-dispute-rent-increase-information',
    rentIncreaseUnitsRegion:'.office-new-dispute-rent-increase-units',
  },

  ui: {
    geozoneWarning: '.office-new-dispute-geozone-warning',
    tenantDrWarning: '.office-new-dispute-tenantdr-warning',
    rentIncreaseFees: '.rent-increase-fee-calculation',
    rentIncreasePerUnitFees: '.rent-increase-per-unit-fee',
    rentIncreaseTotalFee: '.rent-increase-total-fee',

    cancel: '.btn-cancel',
    submit: '.btn-continue',
    rentIncreaseSubmit: '.btn-office-increase-submit'
  },

  events: {
    'click @ui.cancel': 'clickCancel',
    'click @ui.submit': 'clickSubmit',
    'click @ui.rentIncreaseSubmit': 'clickRentIncreaseSubmit'
  },

  clickCancel() {
    Backbone.history.navigate('main', { trigger: true });
  },

  clickSubmit() {
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const getAccessCodeFromNewDisputeResponseFn = (response) => {
      response = response || {};
      const hasParticipantData = !_.isEmpty(response.claim_groups) && !_.isEmpty(response.claim_groups[0].participants) &&
          response.claim_groups[0].participants[0];
        
      return hasParticipantData ? response.claim_groups[0].participants[0].access_code : null;
    };

    const self = this;
    const apiData = this.getPageApiData();
    loaderChannel.trigger('page:load');
    disputeChannel.request('create:external', apiData).done(function(response) {
      response = response || {};
      const realAccessCode = getAccessCodeFromNewDisputeResponseFn(response);
      const dataToSet = _.extend( apiData, realAccessCode ? { access_code: realAccessCode } : {});
      
      self._updateSearchModel(response.file_number);
      self.parseNewDisputeSaveResponse(response.file_number, dataToSet)
        .done(function() {
          Backbone.history.navigate('new/2', { trigger: true, replace: true });
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('OS.DISPUTE.LOAD', () => Backbone.history.navigate('main', { trigger: true }), 'The dispute was created, but there was an error refreshing the data.  You will be returned to the main menu.');
          handler(err);
        });
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('OS.DISPUTE.CREATE');
      handler(err);
    })
  },

  clickRentIncreaseSubmit() {
    if (this.rentIncreaseUnitsModel.getData() > 0) {
      this.getUI('rentIncreasePerUnitFees').text(Formatter.toAmountDisplay(this._getPerUnitAmount()))
      this.getUI('rentIncreaseTotalFee').text(Formatter.toAmountDisplay(this._getCalculatedFeeAmount()))
      this.getUI('rentIncreaseFees').removeClass('hidden');
    } else {
      this.showRentalUnitsErrorMessage();
    }
  },

  parseNewDisputeSaveResponse(fileNumber, apiSaveData) {
    const dfd = $.Deferred();
    this.model.performFileNumberSearch(fileNumber).done(function() {
      // At this point, the dispute is loaded.  Now merge those details with the page attrs on the page:
      const dispute = disputeChannel.request('get');
      const primaryApplicant = participantsChannel.request('get:primaryApplicant');

      dispute.set( apiSaveData );

      primaryApplicant.set( _.extend({}, {
        bus_contact_first_name: apiSaveData.business_contact_first_name,
        bus_contact_last_name: apiSaveData.business_contact_last_name,
        bus_name: apiSaveData.business_name
      }, apiSaveData) );

      console.log('[NewDispute] Created dispute', dispute.toJSON());
      console.log(primaryApplicant);

      dfd.resolve();
    }).fail(dfd.reject);

    return dfd.promise();
  },

  resetForm() {
    this.step1PageData = {... this.step1PageData, step1Complete: false}

    this.packageMethodModel.set({
      optionData: this._getPackageMethodPickupOptions(['SEND_METHOD_EMAIL', 'SEND_METHOD_PICKUP']),
      value: (String(this.packageMethodModel.getData()) === this.SEND_METHOD_EMAIL)
    }, { silent: true });

    this.emailModel.set({
      disabled: false,
      value: null,
      cssClass: null,
      required: true,
      customLink: 'Unable to use email?'
    });

    _.each(this.step1Group, function(viewName) {
      const view = this.getChildView(viewName);
      view.model.set({ value: null, disabled: false });
    }, this);

    this.geozoneWarning = null;
    this.tenantDrWarning = null;
    this.render();

  },

  setupListeners() {
    // If a new search occurs, load the dispute menu
    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);
    this.listenTo(this.model, "step1:continue", (pageData) => {
      this.step1PageData = pageData;

      if(pageData.isRentIncrease) { 
        this.issuesSelectedModel.set('labelText', ISSUES_ARIE_TEXT);
        this.streetModel.set('labelText', RENTAL_ARIE_TEXT);
        this.rentIncreaseUnitsModel.set('required', true);
        this.rentIncreaseInformationModel.set('required', true);
      } else {
        this.issuesSelectedModel.set('labelText', ISSUES_TEXT);
        this.streetModel.set('labelText', RENTAL_TEXT);
        this.rentIncreaseUnitsModel.set('required', false);
        this.rentIncreaseInformationModel.set('required', false);
      }
      this.requiredEvidenceModel.set('required', pageData.isDirectRequest && pageData.shouldShowDirectRequest);
      this.render();
    });
    this.listenTo(this.model, "step1:reset", () => {
      this.resetForm();
      this.render();
    });
    this.listenTo(this.addressQuestionModel, 'change:value', function(model, value) {
      const isYes = (value === DROPDOWN_CODE_YES);
      if (isYes) {
        this.rentalUnitModel.setToRequired();
      } else {
        this.rentalUnitModel.setToOptional();
        this.rentalUnitModel.clearSelections();
      }
      
      this.showRentalUnit = isYes;
      this.render();
    }, this);

    this.listenTo(this.rentalTypeModel, 'change:value', function(model, value) {
      const isManufacturedHomeOrParkSelected = value === DROPDOWN_CODE_MH_PARK;
      this.ownsHomeModel.set({
        required: isManufacturedHomeOrParkSelected,
        disabled: !isManufacturedHomeOrParkSelected,
        value: null // Always clear value on rental type change
      }, { silent: true });

      this.render();
    }, this);

    this.listenTo(this.rentalTypeModel, 'change:value', () => {
      if(this._isHomeSelected() && this.tenantDrWarning) this.hideTenantDrWarning();
    });

    this.listenTo(this.ownsHomeModel, 'change:value', () => {
      if (!this.step1PageData.isLandlord && this.step1PageData.isDirectRequest && this._isOwnsHomeSelected()) this.showTenantDrWarning();
      else this.hideTenantDrWarning();
    })

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

    this.listenTo(this.participantTypeModel, 'change:value', function(model, value) {
      const isBusiness = value === this.PARTICIPANT_TYPE_BUSINESS;
      const setOptions = { silent: true };

      this.businessNameModel.set({ required: isBusiness });

      this.firstNameModel.set({
        labelText: `${isBusiness ? 'Business contact f': 'F'}irst name`,
        apiMapping: isBusiness ? 'business_contact_first_name' : 'first_name'
      }, setOptions);

      this.lastNameModel.set({
        labelText: `${isBusiness ? 'Business contact l': 'L'}ast name`,
        apiMapping: isBusiness ? 'business_contact_last_name' : 'last_name'
      }, setOptions);

      this.render();
    }, this);


    this.listenTo(this.additionalFormsModel, 'change:value', this.render, this);
    this.listenTo(this.hasRespondentAddressModel, 'change:value', this.render, this);
    this.listenTo(this.rentIncreaseInformationModel, 'change:value', this.render, this);
  },

  _updateSearchModel(fileNumber) {
    this.model.getOfficeTopSearchModel().setToFileNumberSearchState(fileNumber);
  },

  reRenderChildView(region) {
    const view = this.getChildView(region);
    if (view) {
      view.render();
    }
  },

  getPageApiData() {
    this.step1Group = _.union(this.step1Group, this.getFormConfig().questions);
    const apiData = {};
    _.each(this.step1Group, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        if (view.model.get('apiMapping')) {
          _.extend(apiData, view.model.getPageApiDataAttrs());
        }
      }
    }, this);

    _.extend(apiData,
      { accepted_tou: 1, },
      this.step1PageData.isRentIncrease ? { creation_method: configChannel.request('get', 'DISPUTE_CREATION_METHOD_ARI_E'), amount_due: this._getCalculatedFeeAmount() }: {},
      { dispute_sub_type: configChannel.request('get', this.step1PageData.isLandlord ? 'DISPUTE_SUBTYPE_LANDLORD'  : 'DISPUTE_SUBTYPE_TENANT')},
      { submitted_date: Moment().toISOString() },
      { participant_status: configChannel.request('get', 'PARTICIPANT_STATUS_VALIDATED') },
      { dispute_urgency: this.step1PageData.isEmergency? this.DISPUTE_URGENCY_EMERGENCY : this.step1PageData.isRentIncrease ? this.DISPUTE_URGENCY_REGULAR : null },
      { tenancy_country: TENANCY_COUNTRY },
      { process: this.step1PageData.isRentIncrease ? configChannel.request('get', 'PROCESS_RENT_INCREASE') : configChannel.request('get', this.step1PageData.isDirectRequest ? 'PROCESS_WRITTEN_OR_DR' : 'PROCESS_ORAL_HEARING') },
      { tenancy_ended:this.step1PageData.isCurrentTenancy ? 0 : 1 },
      { dispute_type: configChannel.request('get', this._isHomeSelected() || !this._isOwnsHomeSelected() ? 'DISPUTE_TYPE_RTA' : 'DISPUTE_TYPE_MHPTA') },
      { no_email: this.noEmail ? 1 : 0 },
      { primary_contact_method: configChannel.request('get', this.noEmail ? 'PARTICIPANT_CONTACT_METHOD_PHONE_MAIL' : 'PARTICIPANT_CONTACT_METHOD_EMAIL') },
    );

    console.log(apiData);
    return apiData;    
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.step1Group = _.union(this.step1Group, this.getFormConfig().questions);
    _.each(this.step1Group, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    if (this.issuesSelectedModel.getData() === DROPDOWN_CODE_NO) {
      this.showIssuesErrorMessage();
      is_valid = false;
    }

    if (this.respondentIncludedModel.getData() === DROPDOWN_CODE_NO) {
      this.showRespondentErrorMessage();
      is_valid = false;
    }

    if (this.requiredEvidenceModel.get('required') && this.requiredEvidenceModel.getData() !== DROPDOWN_CODE_YES) {
      this.showRequiredEvidenceErrorMessage();
      is_valid = false;
    }

    if(this.rentIncreaseInformationModel.get('required') && this.rentIncreaseInformationModel.getData() === DROPDOWN_CODE_NO) {
      this.showRentalInformationErrorMessage();
      is_valid = false;
    }

    return is_valid;
  },

  _validateGeozone() {
    if (!_.all([this.streetModel, this.cityModel, this.postalCodeModel], (model) => model.isValid() )) {
      return;
    }

    const addressString = `${this.streetModel.getData()} ${this.cityModel.getData()}, ${this.postalCodeModel.getData()}`;

    loaderChannel.trigger('page:load');
    this.listenToOnce(geozoneChannel, 'lookup:address:complete', function(geozone_val) {
      if (geozone_val === configChannel.request('get', 'INVALID_GEOZONE_CODE')) {
        this.showGeozoneWarning();
      } else {
        this.hideGeozoneWarning();
      }
      loaderChannel.trigger('page:load:complete');
    }, this);
    geozoneChannel.request('lookup:address', addressString);
  },

  _isHomeSelected() {
    return String(this.rentalTypeModel.getData()) === String(DROPDOWN_CODE_HOME);
  },

  _isManufacturedHomeOrParkSelected() {
    return String(this.rentalTypeModel.getData()) === String(DROPDOWN_CODE_MH_PARK);
  },

  _isOwnsHomeSelected() {
    return String(this.ownsHomeModel.getData()) === String(DROPDOWN_CODE_YES);
  },

  _isBusinessSelected() {
    return String(this.participantTypeModel.getData()) === String(this.PARTICIPANT_TYPE_BUSINESS);
  },

  _hasAdditionalForms() {
    return String(this.additionalFormsModel.getData()) === String(DROPDOWN_CODE_YES);
  },

  _doesNotHaveRespondentAddress() {
    return String(this.hasRespondentAddressModel.getData()) === String(DROPDOWN_CODE_NO);
  },

  _getPackageMethodPickupOptions(configCodesToUse) {
    return (configCodesToUse || []).map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { text: Formatter.toHearingOptionsByDisplay(configValue), value: String(configValue) };
    });
  },

  _getAdditionalFormsText() {
    this.step1PageData.formType;
    const formConfig = this.getFormConfig();
    const text = formConfig.additionalFormsDisplay;
    return text ? text : '';
  },

  _getPerUnitAmount() {
    const units = this.rentIncreaseUnitsModel.getData();
    return units ? (units * PER_UNIT_FEE_AMOUNT > MAX_UNIT_FEE_AMOUNT ? MAX_UNIT_FEE_AMOUNT : units * PER_UNIT_FEE_AMOUNT) : 0;
  },
  
  _getCalculatedFeeAmount() {
    return (BASE_APPLICATION_FEE_AMOUNT + this._getPerUnitAmount());
  },

  _getIssuesSelectedLabel() {
    return (
      this.step1PageData.isRentIncrease ? "Are all pages of the application form included and is the declaration signed?" : 
    "Is at least one issue selected on the application form and is the form declaration signed?"
    );
  },

  _showErrorMessageOnRegion(regionName, errorMsg) {
    const view = this.getChildView(regionName);
    if (view) {
      view.showErrorMessage(errorMsg);
    }
  },

  showIssuesErrorMessage() {
    const errorText = this.step1PageData.isRentIncrease ? 
    'This application cannot be accepted by the RTB unless all pages are included and the form declaration is signed.' : 
    'This application cannot be accepted by the RTB unless at least one issue is selected and the form declaration is signed.'
    this._showErrorMessageOnRegion('issuesSelectedRegion',
    errorText
    );
  },

  showRespondentErrorMessage() {
    this._showErrorMessageOnRegion('respondentIncludedRegion',
      `This application cannot be accepted by the RTB unless at least one respondent is included.`
    );
  },

  showRentalInformationErrorMessage() {
    this._showErrorMessageOnRegion('rentIncreaseInformationRegion',
      `This application cannot be accepted by the RTB unless all rental units and tenant information is provided.`
    );
  },

  showRentalUnitsErrorMessage() {
    this._showErrorMessageOnRegion('rentIncreaseUnitsRegion',
      `Invalid Number`
    );
  },

  showRequiredEvidenceErrorMessage() {
    this._showErrorMessageOnRegion('requiredEvidenceRegion',
      `This application cannot be submitted without the minimum required evidence as outlined on the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/direct-request">RTB web site</a>.`
    );
  },

  hideGeozoneWarning() {
    this.geozoneWarning = null;
    this.getUI('geozoneWarning').html('').addClass('hidden');
  },

  showGeozoneWarning() {
    this.geozoneWarning = GEOZONE_WARNING;
    this.getUI('geozoneWarning').html(this.geozoneWarning).removeClass('hidden');
  },

  showTenantDrWarning() {
    this.tenantDrWarning = TENANT_DR_WARNING;
    this.render();
  },

  hideTenantDrWarning() {
    this.tenantDrWarning = null;
    this.render();
  },

  showCrossAppInput() {
    const isLandlord = this.step1PageData.isLandlord;
    const isTenant = this.step1PageData.isTenant;
    const isNotEmergency = this.step1PageData.isNotEmergency;
    const isCurrentTenancy = this.step1PageData.isCurrentTenancy;
    const isPastTenancy = this.step1PageData.isPastTenancy;
    const isRentIncrease = this.step1PageData.isRentIncrease;

    if(isRentIncrease) return false;
    if(isLandlord && isCurrentTenancy && isNotEmergency) return true;
    else if(isLandlord && isPastTenancy && isNotEmergency) return true;
    else if(isTenant && isCurrentTenancy && isNotEmergency) return true;
    else if(isTenant && isPastTenancy && isNotEmergency) return true;
    else return false;
  },

  createSubModels() {
    // Site or Unit
    this.rentalTypeModel = new DropdownModel({
      labelText: 'What is the tenant renting?',
      optionData: [{ value: DROPDOWN_CODE_HOME, text: 'Home, suite or apartment' }, { value: DROPDOWN_CODE_MH_PARK, text: 'Site in a manufactured home park' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    const isManufacturedHomeOrParkSelected = this._isManufacturedHomeOrParkSelected();
    this.ownsHomeModel = new DropdownModel({
      labelText: 'Owns manufactured home?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: isManufacturedHomeOrParkSelected,
      disabled: !isManufacturedHomeOrParkSelected,
      value: null
    });

    this.crossAppModel = new InputModel({
      labelText: 'Associated file number',
      cssClass: 'optional-input',
      inputType: 'legacy_dispute_number',
      maxLength: 9,
      required: false,
      value: null,
      apiMapping: 'cross_app_file_number'
    });

    this.streetModel = new InputModel({
      labelText: 'Rental Unit Street Address',
      errorMessage: 'Rental Address is required',
      required: true,
      minLength: this.ADDRESS_FIELD_MIN,
      maxLength: this.ADDRESS_FIELD_MAX,
      value: null,
      apiMapping: 'tenancy_address',
      restrictedCharacters: InputModel.getRegex('address__restricted_chars'),
    });

    this.cityModel = new InputModel({
      labelText: 'City',
      errorMessage: 'City is required',
      required: true,
      minLength: this.CITY_FIELD_MIN,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: null,
      apiMapping: 'tenancy_city',
    });

    this.postalCodeModel = new InputModel({
      labelText: 'Postal Code',
      errorMessage: 'Required',
      required: true,
      inputType: 'postal_code',
      subLabel: ' ',
      maxLength: this.POSTAL_CODE_FIELD_MAX,
      value: null,
      apiMapping: 'tenancy_zip_postal',
    });

    this.addressQuestionModel = new DropdownModel({
      labelText: 'Shared Address?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    // Create rental address type and question
    const RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    const rentUnitTypeOptions = Object.entries(configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY') || {})
      .filter(([value]) => value && String(value) !== RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );

    this.rentalUnitModel = new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        required: true,
        clearWhenHidden: true,
        value: null,
        apiMapping: 'tenancy_unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.APPLICANT_FIELD_MAX,
        minLength: 3,
        value: null,
        apiMapping: 'tenancy_unit_text',
      }),
      clearWhenHidden: true,
      singleDropdownMode: true,
      showValidate: false,
      enableOther: true,
      otherOverrideValue: RENT_UNIT_TYPE_OTHER,
      // Set apiMapping to true here so getAllPageData picks up that this model has an API translation available
      apiMapping: true,
      currentValue: null
    });

    // Primary Applicant Info
    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY');
    const PARTICIPANT_TYPE_PERSON = configChannel.request('get', 'PARTICIPANT_TYPE_PERSON');
    this.participantTypeModel = new RadioModel({
      optionData: _.map(PARTICIPANT_TYPE_DISPLAY, function(val, key) {
        return { value: Number(key), text: val };
      })
      .filter((participant) => {
        return this.model.isNew() ? participant.value !== configChannel.request('get', 'PARTICIPANT_TYPE_AGENT_OR_LAWYER') && participant.value != configChannel.request('get', 'PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT') : true;
      }),
      required: true,
      value: Number(PARTICIPANT_TYPE_PERSON) || null,
      apiMapping: 'participant_type',
    });


    const isBusiness = this._isBusinessSelected();
    this.businessNameModel = new InputModel({
      labelText: 'Business name',
      errorMessage: 'Business Name is required',
      required: isBusiness,
      maxLength: this.APPLICANT_FIELD_MAX,
      maxWords: this.BUSINESS_NAME_MAX_NUM_WORDS,
      value: null,
      apiMapping: 'business_name'
    });

    this.firstNameModel = new InputModel({
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: isBusiness ? 'Business contact first name' : 'First name',
      errorMessage: 'First name is required',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: null,
      apiMapping: isBusiness ? 'business_contact_first_name' : 'first_name'
    });

    this.lastNameModel = new InputModel({
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: isBusiness ? 'Business contact last name' : 'Last name',
      errorMessage: 'Last name is required',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: null,
      apiMapping: isBusiness ? 'business_contact_last_name' : 'last_name'
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
      apiMapping: 'primary_phone'
    });

    this.packageMethodModel = new DropdownModel({
      optionData: this._getPackageMethodPickupOptions(['SEND_METHOD_EMAIL', 'SEND_METHOD_PICKUP']),
      labelText: 'Hearing package method',
      required: true,
      defaultBlank: true,
      value: null,
      apiMapping: 'package_delivery_method'
    });

    this.issuesSelectedModel = new DropdownModel({
      labelText: 'Issues selected and signed?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    this.additionalFormsModel = new DropdownModel({
      labelText: 'Additional forms?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    this.respondentIncludedModel = new DropdownModel({
      labelText: 'Respondent included?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    this.hasRespondentAddressModel = new DropdownModel({
      labelText: 'Respondent address?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: true,
      value: null
    });

    this.requiredEvidenceModel = new DropdownModel({
      labelText: 'Required evidence?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: false,
      value: null
    });

    this.rentIncreaseInformationModel = new DropdownModel({
      labelText: 'Units and Tenants Complete?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
      defaultBlank: true,
      required: false,
      value: null
    });

    this.rentIncreaseUnitsModel = new InputModel({
      showValidate: true,
      inputType: 'positive_integer',
      restrictedCharacters: '\\D',
      maxLength: 3,
      required: false,
      value: null,
      required: false,
      defaultBlank: true,
    });
  },

  initialize() {
    this.step1PageData = {};
    this.LANDLORD_CODE = String(configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'));
    this.DISPUTE_URGENCY_EMERGENCY = configChannel.request('get', 'DISPUTE_URGENCY_EMERGENCY');
    this.DISPUTE_URGENCY_REGULAR = configChannel.request('get', 'DISPUTE_URGENCY_REGULAR');

    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.PHONE_FIELD_MAX = configChannel.request('get', 'PHONE_FIELD_MAX');
    this.BUSINESS_NAME_MAX_NUM_WORDS = configChannel.request('get', 'BUSINESS_NAME_MAX_NUM_WORDS');

    // Note: No need to cast to string because Radios can use numberic
    this.PARTICIPANT_TYPE_BUSINESS = configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS');

    this.SEND_METHOD_EMAIL = String(configChannel.request('get', 'SEND_METHOD_EMAIL'));

    this.CITY_FIELD_MIN = configChannel.request('get', 'CITY_FIELD_MIN');
    this.ADDRESS_FIELD_MIN = configChannel.request('get', 'ADDRESS_FIELD_MIN');
    this.ADDRESS_FIELD_MAX = configChannel.request('get', 'ADDRESS_FIELD_MAX');
    this.POSTAL_CODE_FIELD_MAX = configChannel.request('get', 'POSTAL_CODE_FIELD_MAX');
    
    this.geozoneWarning = null;
    this.tenantDrWarning = null;
    this.noEmail = false;
    this.currentUser = sessionChannel.request('get:user');
    
    this.createSubModels();
    this.setupListeners();

    const siteInfoGroup = ['rentalTypeRegion', 'ownsHomeRegion', 'streetRegion', 'cityRegion', 'postalCodeRegion', 'addressQuestionRegion', 'rentalUnitRegion'];
    const applicantInfoGroup = ['participantTypeRegion', 'crossAppRegion', 'businessNameRegion', 'firstNameRegion', 'lastNameRegion', 'emailRegion', 'phoneRegion', 'packageMethodRegion'];

    this.step1Group = _.union([], siteInfoGroup, applicantInfoGroup);
  },

  getFormConfig() {
    const rtbFormValidationConfig = {
      'RTB-12L-CT': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion'
        ],
        additionalFormsDisplay: 'RTB-12L-O, RTB-13, RTB-18, RTB-26, RTB-36, RTB-43'
      },
      'RTB-12L-EXH': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion'
        ],
        additionalFormsDisplay: 'RTB-13, RTB-26, RTB-36, RTB-43',
      },
      // New rent increase form
      'RTB-52': {
        questions: [
          'issuesSelectedRegion',
          'rentIncreaseInformationRegion',
          'additionalFormsRegion',
          'rentIncreaseUnitsRegion'
        ],
        additionalFormsDisplay: 'RTB-13, RTB-26, RTB-36, RTB-43',
      },
      'RTB-12L-DR': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion',
          'requiredEvidenceRegion',
        ],
        additionalFormsDisplay: 'RTB-13, RTB-26'
      },
      'RTB-12L-PT': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion'
        ],
        additionalFormsDisplay: 'RTB-12L-O, RTB-13, RTB-18, RTB-26, RTB-36, RTB-43'
      },
      'RTB-12T-EXH': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion'
        ],
        additionalFormsDisplay: 'RTB-13, RTB-26, RTB-43'
      },
      'RTB-12T-CT': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion'
        ],
        additionalFormsDisplay: 'RTB-12T-O, RTB-13, RTB-19, RTB-26, RTB-43'
      },
      'RTB-12T-DR': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion',
          'requiredEvidenceRegion',
        ],
        additionalFormsDisplay: 'RTB-13, RTB-26'
      },
      'RTB-12T-PT': {
        questions: [
          'issuesSelectedRegion',
          'additionalFormsRegion',
          'respondentIncludedRegion',
          'hasRespondentAddressRegion'
        ],
        additionalFormsDisplay: 'RTB-13, RTB-19, RTB-26, RTB-43'
      },
    }
    
    const form = this.step1PageData.formType;
    const config = rtbFormValidationConfig[form] ? rtbFormValidationConfig[form] : '';
    return config;
  },

  getGeneralInfoView() {
    if(this.currentChildView) {
      return this.currentChildView;
    }
    
    return new GeneralDisputeView({ model: this.model });
  },

  onBeforeRender() {
    if(this.isRendered()) {
      const region = this.getRegion('generalDisputeRegion');
      if(region.hasView()) {
        this.currentChildView = region.detachView();
      }
    }
   },

  onRender() {
    this.showChildView('topSearchRegion', new OfficeTopSearchView({ isNewDisputePage: true, model: this.model.getOfficeTopSearchModel() }));
    this.showChildView('generalDisputeRegion', this.getGeneralInfoView());
    // Site information
    this.showChildView('rentalTypeRegion', new DropdownView({ model: this.rentalTypeModel }));
    this.showChildView('ownsHomeRegion', new DropdownView({ model: this.ownsHomeModel }));
    this.showChildView('crossAppRegion', new InputView({ model: this.crossAppModel }));
    this.showChildView('streetRegion', new InputView({ model: this.streetModel }));
    this.showChildView('cityRegion', new InputView({ model: this.cityModel }));
    this.showChildView('postalCodeRegion', new InputView({ model: this.postalCodeModel }));

    this.showChildView('addressQuestionRegion', new DropdownView({ model: this.addressQuestionModel }));
    this.showChildView('rentalUnitRegion', new DoubleSelectorView({ model: this.rentalUnitModel }));

    // Primary Applicant information
    this.showChildView('participantTypeRegion', new RadioView({ model: this.participantTypeModel }));
    this.showChildView('businessNameRegion', new InputView({ model: this.businessNameModel }));
    this.showChildView('firstNameRegion', new InputView({ model: this.firstNameModel }));
    this.showChildView('lastNameRegion', new InputView({ model: this.lastNameModel }));
    this.showChildView('emailRegion', new EmailView({ showOptOut: true, model: this.emailModel }));
    this.showChildView('phoneRegion', new InputView({ model: this.phoneModel }));
    this.showChildView('packageMethodRegion', new DropdownView({ model: this.packageMethodModel }));

    this.showChildView('issuesSelectedRegion', new DropdownView({ model: this.issuesSelectedModel }));
    this.showChildView('additionalFormsRegion', new DropdownView({ model: this.additionalFormsModel }));
    this.showChildView('respondentIncludedRegion', new DropdownView({ model: this.respondentIncludedModel }));
    this.showChildView('hasRespondentAddressRegion', new DropdownView({ model: this.hasRespondentAddressModel }));
    
    this.showChildView('requiredEvidenceRegion', new DropdownView({ model: this.requiredEvidenceModel }));
    
    this.showChildView('rentIncreaseInformationRegion', new DropdownView({ model: this.rentIncreaseInformationModel }));
    const unitRegion = this.showChildView('rentIncreaseUnitsRegion', new InputView({ model: this.rentIncreaseUnitsModel }));

    if(unitRegion) {
      this.listenTo(unitRegion.currentView, 'itemComplete', this.clickRentIncreaseSubmit.bind(this));
    }

    // Setup address view listeners for geozone
    _.each(['streetRegion', 'cityRegion', 'postalCodeRegion'], function(regionName) {
      const view = this.getChildView(regionName);
      if (!view) {
        return;
      }
      
      this.stopListening(view, 'blur');
      this.listenTo(view, 'blur', this._validateGeozone, this);
    }, this);
    
  },

  templateContext() {
    const showStep2 = this.step1PageData.step1Complete;
    const isLandlord = this.step1PageData.isLandlord;
    const isTenant = this.step1PageData.isTenant;
    const isDirectRequest = this.step1PageData.isDirectRequest;
    const isRentIncrease = this.step1PageData.isRentIncrease;
    const issuesSelectedLabel = this._getIssuesSelectedLabel();
    const additionalFormsText = this._getAdditionalFormsText();
    const formConfig = this.getFormConfig() ? this.getFormConfig().questions : [];

    return {
      BASE_APPLICATION_FEE_AMOUNT,
      Formatter,
      showStep2,
      geozoneWarning: this.geozoneWarning,
      tenantDrWarning: this.tenantDrWarning,
      isLandlord,
      showRentalUnit: this.showRentalUnit,
      isTenant,
      showCrossAppInput: this.showCrossAppInput(),
      isDirectRequest,
      isRentIncrease,
      isBusiness: this._isBusinessSelected(),
      doesNotHaveRespondentAddress: this._doesNotHaveRespondentAddress(),
      hasAdditionalForms: this._hasAdditionalForms(),
      issuesSelectedLabel,
      additionalFormsText,
      formConfig,
    }
  }


  
});