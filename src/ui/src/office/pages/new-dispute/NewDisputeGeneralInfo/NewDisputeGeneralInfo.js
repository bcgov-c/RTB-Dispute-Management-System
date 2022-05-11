import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import template from './NewDisputeGeneralInfo_template.tpl';

//constants
const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';
//Radio Channels
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');

export default Marionette.View.extend({
  template,
  className: `office-page-general-dispute`,

  regions: {
    applicantTypeRegion: '.office-new-dispute-applicant-type',
    currentTenancyRegion: '.office-new-dispute-current-tenancy',
    isEmergencyRegion: '.office-new-dispute-is-emergency',
    directRequestRegion: '.office-new-dispute-direct-request',
    rentIncreaseRegion: '.office-new-dispute-rent-increase',
    formUsedRegion: '.office-new-dispute-rtb-form-used',
  },

  ui: {
    continue: '.btn-office-continue',
    reset: '.btn-office-reset'
  },

  events: {
    'click @ui.continue': 'clickContinue',
    'click @ui.reset': 'clickReset'
  },

  clickContinue() {
    if (!this.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const continueButtonEle = this.getUI('continue');
    animationChannel.request('queue', $(continueButtonEle) , 'scrollPageTo', {is_page_item: true});
    this.disableForm();
  },
  
  clickReset() {
    this.getUI('continue').removeAttr('disabled', 'disabled');
    this.getUI('reset').addClass('hidden');

    _.each(this.generalInfoGroup, function(viewName) {
      const view = this.getChildView(viewName);
      view.model.set({ value: null, disabled: false });
    }, this);

    this.model.trigger('step1:reset');
  },

  disableForm() {
    this.getUI('continue').attr('disabled', 'disabled');
    this.getUI('reset').removeClass('hidden');

    _.each(this.generalInfoGroup, function(viewName) {
      const view = this.getChildView(viewName);
      view.model.set({ disabled: true });
      view.render();
    }, this);

    this.model.trigger('step1:continue', this.getPageData())
  },

  initialize() {
    this.LANDLORD_CODE = String(configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'));
    this.TENANT_CODE = String(configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'));

    this.createSubModels();
    this.setupListeners();

    this.generalInfoGroup = ['applicantTypeRegion', 'currentTenancyRegion','isEmergencyRegion', 'rentIncreaseRegion','directRequestRegion', 
    'formUsedRegion'];
  },

  _isLandlordSelected() {
    return String(this.applicantTypeModel.getData()) === this.LANDLORD_CODE;
  },

  _isTenantSelected() {
    return String(this.applicantTypeModel.getData()) === this.TENANT_CODE;
  },

  _isPastTenancySelected() {
    return String(this.currentTenancyModel.getData()) === DROPDOWN_CODE_NO;
  },

  _isCurrentTenancySelected() {
    return String(this.currentTenancyModel.getData()) === DROPDOWN_CODE_YES;
  },

  _isDirectRequestSelected() {
    return String(this.directRequestModel.getData()) === DROPDOWN_CODE_YES;
  },

  _isNotDirectRequestSelected() {
    return String(this.directRequestModel.getData()) === DROPDOWN_CODE_NO;
  },

  _isEmergencySelected() {
    return String(this.isEmergencyModel.getData()) === DROPDOWN_CODE_YES;
  },

  _isNotEmergencySelected() {
    return String(this.isEmergencyModel.getData()) === DROPDOWN_CODE_NO;
  },

  _isRentIncreaseSelected() {
    return String(this.rentIncreaseModel.getData()) === DROPDOWN_CODE_YES;
  },

  _isNotRentIncreaseSelected() {
    return String(this.rentIncreaseModel.getData()) === DROPDOWN_CODE_NO;
  },

  _getFormUsedValue() {
    const isLandlordSelected = this._isLandlordSelected();
    const isTenantSelected = this._isTenantSelected();
    const isDirectRequestSelected = this._isDirectRequestSelected();
    const isNotDirectRequestSelected = this._isNotDirectRequestSelected();
    const isEmergencySelected = this._isEmergencySelected();
    const isNotEmergencySelected = this._isNotEmergencySelected()
    const isCurrentTenancySelected = this._isCurrentTenancySelected();
    const isPastTenancySelected = this._isPastTenancySelected();
    const isRentIncrease = this._isRentIncreaseSelected();
    const isNotRentIncrease = this._isNotRentIncreaseSelected();

    if (isLandlordSelected && isPastTenancySelected) return 'RTB-12L-PT';
    else if (isTenantSelected && isCurrentTenancySelected && isNotEmergencySelected) return 'RTB-12T-CT';
    else if (isTenantSelected && isCurrentTenancySelected && isEmergencySelected) return 'RTB-12T-EXH';
    else if (isTenantSelected && isPastTenancySelected && isDirectRequestSelected) return 'RTB-12T-DR';
    else if (isTenantSelected && isPastTenancySelected && isNotDirectRequestSelected) return 'RTB-12T-PT';
    else if (isLandlordSelected && isCurrentTenancySelected && isDirectRequestSelected) return 'RTB-12L-DR';
    else if (isLandlordSelected && isCurrentTenancySelected && isNotDirectRequestSelected && isNotEmergencySelected && isNotRentIncrease) return 'RTB-12L-CT';
    else if (isLandlordSelected && isCurrentTenancySelected && isNotDirectRequestSelected && isEmergencySelected) return 'RTB-12L-EXH';
    else if (isLandlordSelected && isCurrentTenancySelected && isNotDirectRequestSelected && isNotEmergencySelected && isRentIncrease) return 'RTB-52';
    else return null;
  },

  _isContinueHidden() {
    const pageModels = [
      this.applicantTypeModel,
      this.currentTenancyModel,
      this.directRequestModel,
      this.isEmergencyModel,
      this.rentIncreaseModel,
      this.formUsedModel,
    ];

    return _.all(pageModels, model => model.isValid());
  },

  
  createSubModels() {
    this.applicantTypeModel = new DropdownModel({
      labelText: 'Applicant type',
      optionData: [{ value: this.LANDLORD_CODE, text: 'Landlord' },
        { value: this.TENANT_CODE, text: 'Tenant' }],
      errorMessage: `Required`,
      required: true,
      defaultBlank: true,
      value: null,
      apiMapping: 'dispute_sub_type',
      disabled: false
    });

    this.currentTenancyModel = new DropdownModel({
      labelText: 'Tenant in rental unit?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' },
        { value: DROPDOWN_CODE_NO, text: 'No' }],
      errorMessage: `Required`,
      required: true,
      defaultBlank: true,
      value: null,
      disabled: false
    });

    const isLandlordSelected = this._isLandlordSelected();
    this.directRequestModel = new DropdownModel({
      labelText: 'Landlord Direct Request?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' },
        { value: DROPDOWN_CODE_NO, text: 'No' }],
      errorMessage: `Required`,
      required: isLandlordSelected,
      defaultBlank: true,
      value: null,
      disabled: false
    });

    const isCurrentTenancy = this._isCurrentTenancySelected();
    const isDirectRequestSelected = this._isDirectRequestSelected();
    this.isEmergencyModel = new DropdownModel({
      labelText: 'Emergency hearing required?',
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' },
        { value: DROPDOWN_CODE_NO, text: 'No' }],
      errorMessage: `Required`,
      required: !isDirectRequestSelected && !isCurrentTenancy,
      defaultBlank: true,
      value: null,
      disabled: false
    });
  const isNotEmergencySelected = this._isNotEmergencySelected();
  this.rentIncreaseModel = new DropdownModel({
    labelText: 'Rent Increase?',
    optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }],
    required: isLandlordSelected && isCurrentTenancy && !isDirectRequestSelected && isNotEmergencySelected,
    defaultBlank: true,
    value: null,
    disabled: false
  })

   this.repaymentModel = new DropdownModel({
     labelText: 'Repayment plan issued?',
     optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' },
       { value: DROPDOWN_CODE_NO, text: 'No' }],
     required: isDirectRequestSelected && isLandlordSelected,
     defaultBlank: true,
     value: null,
     disabled: false
   });

    const formUsed = this._getFormUsedValue();
    this.formUsedModel = new DropdownModel({
      labelText: `${formUsed} used?`,
      optionData: formUsed ? [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }] : [],
      defaultBlank: true,
      disabled: !formUsed,
      required: formUsed,
      _formUsed: formUsed,
      value: null
    });
  },

  setupListeners() {

    const updateGeneralDisputeModelsAndRenderFn = _.bind(function() {
      this.updateGeneralDisputeModels();
      this.render();
    }, this);

    this.listenTo(this.currentTenancyModel, 'change:value', updateGeneralDisputeModelsAndRenderFn, this);
    this.listenTo(this.directRequestModel, 'change:value', updateGeneralDisputeModelsAndRenderFn, this);
    this.listenTo(this.isEmergencyModel, 'change:value', updateGeneralDisputeModelsAndRenderFn, this);
    this.listenTo(this.rentIncreaseModel, 'change:value', updateGeneralDisputeModelsAndRenderFn, this);
    this.listenTo(this.formUsedModel, 'change:value', updateGeneralDisputeModelsAndRenderFn, this);

    
    this.listenTo(this.applicantTypeModel, 'change:value', function(model, value) {
      const isLandlord = String(value) === this.LANDLORD_CODE;
      // Always re-set the direct request value on applicant type change, and trigger change handlers on DR
      this.directRequestModel.set({
        labelText: `${isLandlord ? 'Landlord' : 'Tenant'} Direct Request`,
        value: null
      });
      updateGeneralDisputeModelsAndRenderFn();
    }, this);
  },

  updateGeneralDisputeModels() {
    const options = { silent: true };
    const isLandlordSelected = this._isLandlordSelected();
    const isCurrentTenancySelected = this._isCurrentTenancySelected();
    const isPastTenancySelected = this._isPastTenancySelected();
    const isDirectRequestSelected = this._isDirectRequestSelected();
    const isTenantSelected = this._isTenantSelected();
    const isNotEmergencySelected = this._isNotEmergencySelected();
    const shouldShowDirectRequest = (isLandlordSelected && isCurrentTenancySelected) || (isTenantSelected && isPastTenancySelected)

    this.directRequestModel.set(
      Object.assign({
        required: shouldShowDirectRequest
      },
    ), options);

    this.isEmergencyModel.set({
      required: !isDirectRequestSelected && isCurrentTenancySelected
    });

    this.rentIncreaseModel.set({
      required: isLandlordSelected && isCurrentTenancySelected && !isDirectRequestSelected && isNotEmergencySelected
    })
    
    const formUsed = this._getFormUsedValue();
    this.formUsedModel.set(
      _.extend({
        labelText: `${formUsed} used?`,
        optionData: formUsed ? [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }] : [],
        disabled: !formUsed,
        required: formUsed,
        _formUsed: formUsed,
      },
        // If form used was changed, then un-set the form selection
        formUsed !== this.formUsedModel.get('_formUsed') ? { value: null } : {}
      ), options);
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.generalInfoGroup, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    if (this.formUsedModel.get('required') && this.formUsedModel.getData() === DROPDOWN_CODE_NO) {
      this.showFormErrorMessage();
      is_valid = false;
    }

    return is_valid;
  },

  _showErrorMessageOnRegion(regionName, errorMsg) {
    const view = this.getChildView(regionName);
    if (view) {
      view.showErrorMessage(errorMsg);
    }
  },

  showFormErrorMessage() {
    this._showErrorMessageOnRegion('formUsedRegion',
      `This application cannot be submitted if the wrong form was used.  Forms are available on the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/forms">RTB web site</a>.`,
    );
  },

  getPageData() {
    const shouldShowDirectRequest = (this._isLandlordSelected() && this._isCurrentTenancySelected()) || (this._isTenantSelected() && this._isPastTenancySelected());
    const pageData = {
      step1Complete: true,
      isLandlord: this._isLandlordSelected(),
      isTenant: this._isTenantSelected(),
      isDirectRequest: this._isDirectRequestSelected(),
      isEmergency: this._isEmergencySelected(),
      isNotEmergency: this._isNotEmergencySelected(),
      isCurrentTenancy: this._isCurrentTenancySelected(),
      isPastTenancy: this._isPastTenancySelected(),
      isRentIncrease: this._isRentIncreaseSelected(),
      formType: this.formUsedModel.get('_formUsed'),
      shouldShowDirectRequest
    }

    return pageData;
  },

  onRender() {
    this.showChildView('applicantTypeRegion', new DropdownView({ model: this.applicantTypeModel }));
    this.showChildView('currentTenancyRegion', new DropdownView({ model: this.currentTenancyModel }));
    this.showChildView('isEmergencyRegion', new DropdownView({ model: this.isEmergencyModel }));
    this.showChildView('directRequestRegion', new DropdownView({ model: this.directRequestModel }));
    this.showChildView('rentIncreaseRegion', new DropdownView({ model: this.rentIncreaseModel}));
    this.showChildView('formUsedRegion', new DropdownView({ model: this.formUsedModel }));
  },

  templateContext() {
    const isTenant = this._isTenantSelected();
    const isLandlord = this._isLandlordSelected();
    const isPastTenancy = this._isPastTenancySelected();
    const isNotDirectRequest = this._isNotDirectRequestSelected();
    const isCurrentTenancy = this._isCurrentTenancySelected();
    const isNotEmergency = this._isNotEmergencySelected();
    const expectedFormDisplay = this.formUsedModel.get('_formUsed');
    const showDirectRequest = (isCurrentTenancy && isLandlord) || (isPastTenancy && isTenant)
    const showContinueButton = this._isContinueHidden();
    const showEmergency = isCurrentTenancy && (isLandlord ? isNotDirectRequest : true);
    const showRentIncrease = isLandlord && isCurrentTenancy && isNotDirectRequest && isNotEmergency;

    return {
      showDirectRequest,
      isTenant,
      showEmergency,
      showRentIncrease,
      expectedFormDisplay,
      showContinueButton,
    }
  }
});