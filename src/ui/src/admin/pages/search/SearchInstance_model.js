import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import InputModel from '../../../core/components/input/Input_model';
import DropdownCollection from '../../../core/components/dropdown/Dropdown_collection';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import { routeParse } from '../../routers/mainview_router';
import DynamicMenuInstanceModel from '../../components/menu/DynamicMenuInstance_model';

const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const participantChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const statusChannel = Radio.channel('status');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

const INITIAL_RESULTS_LOW = 20;
const INITIAL_RESULTS_HIGH = 100;

const SEARCH_TYPE_CODE_DISPUTES = 0;
const SEARCH_TYPE_CODE_PARTICIPANTS = 1;
const SEARCH_TYPE_CODE_STATUS = 2;
const SEARCH_TYPE_CODE_HEARINGS = 3;
const SEARCH_TYPE_CODE_FILES = 4;
const SEARCH_TYPE_CODE_CROSS = 5;
const SEARCH_TYPE_CODE_CMS = 6;
const SEARCH_TYPE_CODE_CLAIMS = 7;

const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';

// CrossApp export params for other search views
const DROPDOWN_CODE_ALL = '1';
const DROPDOWN_CODE_DUP = '2';
const DROPDOWN_CODE_CROSS = '3';
export const CrossAppSubTypeDropdownCodes = { DROPDOWN_CODE_ALL, DROPDOWN_CODE_DUP, DROPDOWN_CODE_CROSS };

// SP Constants for CMS Archive search
import { CMS_STATUS_DISPLAYS } from '../cms/CMSArchivePage';

export default DynamicMenuInstanceModel.extend({
  defaults: {
    menu_config_name: 'search_item',

    searchTypeFiltersModel: null,
    fileNumberModel: null,

    crossAppFileNumberModel: null,
    crossAppTenancyAddressModel: null,
    crossAppIncludeInactiveDisputesModel: null,
    crossAppExcludeActiveHearingsModel: null,
    minThresholdScoreModel: null,
    crossAppExcludeActiveHearingsAmountModel: null,

    tenancyAddressModel: null,
    tenancyZipPostalModel: null,
    disputeTypeModel: null,
    disputeSubTypeModel: null,
    restrictDatesCheckBoxModel: null,
    sortResultsCheckBoxModel: null,
    includeActiveDisputesCheckBox: null,
    resultsCountModel: null,
    restrictDateFieldModel: null,
    restrictDateTypeModel: null,
    startingDateModel: null,
    endingDateModel: null,
    restrictMethodModel: null,
    creationMethodsModel: null,
    sortByModel: null,
    sortTypeModel: null,
    accessNumberModel: null,
    participantFirstNameModel: null,
    participantLastNameModel: null,
    participantNameTypeModel: null,
    contactInfoTypeModel: null,
    contactInfoEmailPhone: null,
    stageEditModel: null,
    statusEditModel: null,
    processEditModel: null,
    includeOwnerModel: null,
    ownerTypeModel: null,
    ownerEditModel: null,
    hearingDateModel: null,
    hearingTypeModel: null,
    includeInactiveHearingsCheckboxModel: null,
    hearingOwnerModel: null,
    disputeCollection: null,
    searchType: null,
    searchName: null,

    searchClaimsDisputeTypeModel: null,
    searchClaimsDisputeSubTypeModel: null,
    searchClaimsTenancyStatusModel: null,
    searchClaimsDropdownCollection: null,

    searchStageModel: null,
    searchStatusModel: null,
    restrictStatusCheckBoxModel: null,

    // Cross App
    crossAppSubTypeDropdown: null,
    populatedSearchData: null, // This is an object with these fields: { dispute, activeHearing, primaryApplicant, participants, applicants, respondents }

    // CMS Archive
    cmsArchiveCollection: null,
    cmsArchiveDisplayableCollection: null,
    searchCmsStatusModel: null,
    restrictCmsStatusCheckBoxModel: null,
  },

  initialize() {
    DynamicMenuInstanceModel.prototype.initialize.call(this);

    this.SEARCH_CROSS_APP_ACTIVE_HEARING_DAY_OFFSET = configChannel.request('get', 'SEARCH_CROSS_APP_ACTIVE_HEARING_DAY_OFFSET');
    this.ETL_GENERIC_ACCESS_CODE = configChannel.request('get', 'ETL_GENERIC_ACCESS_CODE');

    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX') || 48;
    this.createSubModels();
    this.createCMSArchiveSubModels();
  },

  getMenuItem() {
    const menu_search_item = DynamicMenuInstanceModel.prototype.getMenuItem.call(this);
    if (!menu_search_item) {
      return;
    }

    const searchTypeFilter = this.get('searchTypeFiltersModel');
    const search_type = searchTypeFilter ? searchTypeFilter.getData({ parse: true }) : null;

    menu_search_item.title = `${menu_search_item.title}${search_type === 0 ? ' - Disputes' : ''}`;
    menu_search_item.navigation_link = routeParse(this.get('menu_config_name'), null, this.id);
    return menu_search_item;
  },

  getCrossAppPopulateSearchResults() {
    // This data is loaded in clickSearchCrossAppFileNumber
    const dispute = disputeChannel.request('get') || null; // The object provided is not a valid override || dispute;
    const participants = participantChannel.request('get:all:participants') || null;
    const applicants = participantChannel.request('get:applicants') || null;
    const primaryApplicant = participantChannel.request('get:primaryApplicant') || null;
    const respondents = participantChannel.request('get:respondents') || null;
    const activeHearing = hearingChannel.request('get:active') || null;

    return {
      dispute,
      participants,
      primaryApplicant,
      applicants,
      respondents,
      activeHearing
    };
  },


  getHearingOwners() {
    const hearingOwners = _.map(userChannel.request('get:arbs', { all: true }), function(arb) { return {value: arb.get('user_id'), text: arb.getDisplayName() }; });
    hearingOwners.unshift({value: 0, text: 'Search all hearing owners'});

    return hearingOwners;
  },

  getHearingTypeOptions() {
    const hearingOptions = ['HEARING_TYPE_CONFERENCE', 'HEARING_TYPE_FACE_TO_FACE'],
        hearingDisplay = configChannel.request('get', 'HEARING_TYPE_DISPLAY');

    const hearingTypeOptions = _.map(hearingOptions, function(hearingOption) {
      const hearingOptionIndex = configChannel.request('get', hearingOption);
      return { value: hearingOptionIndex, text: hearingDisplay[hearingOptionIndex] };
    });

    hearingTypeOptions.unshift({value: 0, text: 'Search All Types'});
    return hearingTypeOptions;
  },

  getCreationMethodOptions() {
    return _.map([
      'DISPUTE_CREATION_METHOD_INTAKE',
      'DISPUTE_CREATION_METHOD_MANUAL',
      'DISPUTE_CREATION_METHOD_ETL_SP',
      'DISPUTE_CREATION_METHOD_ARI_C',
      'DISPUTE_CREATION_METHOD_ARI_E',
      'DISPUTE_CREATION_METHOD_PFR'
    ],
      function(code) {
        const value = configChannel.request('get', code);
        return { value: String(value), text: Formatter.toDisputeCreationMethodDisplay(value) };
      });
  },

  stagesToPicklist() {
    const stages = statusChannel.request('get:stages');
    return _.map(stages, function(stage) {
      return { value: String(stage), text: statusChannel.request('get:stage:display', stage) };
    });
  },

  statusesToPicklistFromStageWithoutStatusNotSubmitted(stage) {
    const stageConfig = statusChannel.request('get:stage', stage);
    if (!stageConfig || !stageConfig.statuses) {
      console.log("[Error] Invalid stage config, no statuses");
      return;
    }
    
    const statuses = String(stage) === '0' ? stageConfig.statuses.filter(status => String(status) !== '0') : stageConfig.statuses;
    return this.statusesToPicklist(statuses);
  },

  statusesToPicklist(statuses) {
    return _.map(statuses, function(status) {
      return { value: String(status), text: statusChannel.request('get:status:display', status) };
    });
  },

  cmsStatusesToPicklist(statuses) {
    return Object.keys(statuses).map((key) => {
      return { value: String(key), text: statuses[key] };
    });
  },

  _getRoleTypeOptions() {
    const stage = this.get('stageEditModel').getData({ parse: true }),
      status = this.get('statusEditModel').getData({ parse: true }),
      stage_status_rules = statusChannel.request('get:rules:stagestatus', stage, status);

    let allowed_owner_types = [];
    if (stage_status_rules && stage_status_rules.ownerTypes) {
      allowed_owner_types = stage_status_rules.ownerTypes;
    }

    return _.map(allowed_owner_types, function(owner_type) {
      return { value: owner_type, text: userChannel.request('get:role:display', owner_type) };
    });
  },

  createCMSArchiveSubModels() {
    this.set('cmsFileNumberModel', new InputModel({
      labelText: 'File Number (exact)',
      required: true,
      errorMessage: 'Please enter file number',
      maxLength: 20
    }));

    this.set('cmsReferenceNumberModel', new InputModel({
      labelText: 'Reference Number (exact)',
      required: true,
      errorMessage: 'Please enter a reference number',
      minLength: 6,
      maxLength: 20
    }));

    this.set('cmsDisputeAddressModel', new InputModel({
      labelText: 'Tenancy Address (4-Min)',
      minLength: 4,
      maxLength: 80
    }));

    this.set('cmsDisputeCityModel', new InputModel({
      labelText: 'City (3-Min)',
      minLength: 3,
      maxLength: 100
    }));

    this.set('cmsApplicantTypeModel', new DropdownModel( {
      labelText: 'Dispute Sub-Type',
      optionData: [{value:0, text: 'Landlord'}, {value:1, text: 'Tenant'}],
      defaultBlank: true
    }));

    this.set('cmsFirstNameModel', new InputModel({
      labelText: 'First Name (2-Min)',
      minLength: 2,
      maxLength: 20
    }));

    this.set('cmsLastNameModel', new InputModel({
      labelText: 'Last or Business Name (2-Min)',
      minLength: 2,
      maxLength: 20
    }));

    this.set('cmsPhoneModel', new InputModel({
      labelText: 'Phone',
      inputType: 'phone'
    }));

    this.set('cmsEmailModel', new InputModel({
      labelText: 'Email Address',
      inputType: 'email',
      maxLength: 250
    }));

    this.set('cmsParticipantTypeModel', new DropdownModel( {
      labelText: 'Participant Type',
      optionData: [{value:1, text: 'Applicant'}, {value:2, text: 'Agent'}, {value:3, text: 'Respondent'}],
      defaultBlank: true
    }));
  },

  _doesSearchTypeEqual(searchTypeVal) {
    return this.get('searchTypeFiltersModel').getData({ parse: true }) === searchTypeVal;
  },

  isSearchTypeDisputes() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_DISPUTES);
  },

  isSearchTypeParticipants() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_PARTICIPANTS);
  },

  isSearchTypeStatus() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_STATUS);
  },

  isSearchTypeHearings() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_HEARINGS);
  },

  isSearchTypeClaims() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_CLAIMS);
  },

  isSearchTypeFiles() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_FILES);
  },

  isSearchTypeCrossApp() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_CROSS);
  },

  isSearchTypeCMS() {
    return this._doesSearchTypeEqual(SEARCH_TYPE_CODE_CMS);
  },

  getInitialRequestCount() {
    return this.get('resultsCountModel').getData({ parse: true }) || INITIAL_RESULTS_LOW;
  },

  createSubModels() {
    this.set('searchTypeFiltersModel', new RadioModel({
      optionData: [
        { value: SEARCH_TYPE_CODE_DISPUTES, text: 'Disputes' },
        { value: SEARCH_TYPE_CODE_PARTICIPANTS, text: 'Participants' },
        { value: SEARCH_TYPE_CODE_STATUS, text: 'Status' },
        { value: SEARCH_TYPE_CODE_HEARINGS, text: 'Hearings' },
        { value: SEARCH_TYPE_CODE_CLAIMS, text: 'Issues' },
        { value: SEARCH_TYPE_CODE_CROSS, text: 'Cross/Repeated' },
        { value: SEARCH_TYPE_CODE_CMS, text: 'CMS Archives' }
      ],
      valuesToDisable: null,
      value: SEARCH_TYPE_CODE_DISPUTES
    }));

    this.set('fileNumberModel', new InputModel({
      labelText: 'File Number (exact)',
      inputType: 'dispute_number',
      errorMessage: 'Enter file number',
      required: true,
      maxLength: 9
    }));

    this.set('crossAppFileNumberModel', new InputModel({
      labelText: 'File Number (exact)',
      inputType: 'dispute_number',
      maxLength: 9
    }));

    this.set('crossAppTenancyAddressModel', new InputModel({
      labelText: 'Tenancy Address (4-min)',
      minLength: 4,
      maxLength: 80,
    }));

    this.set('crossAppIncludeInactiveDisputesModel', new CheckboxModel({
      html: 'Include inactive disputes',
      checked: false
    }));

    this.set('crossAppExcludeActiveHearingsModel', new CheckboxModel({
      html: `Exclude disputes with a hearing less than`,
      checked: true
    }));

    this.set('crossAppExcludeActiveHearingsAmountModel', new InputModel({
      labelText: ' ',
      inputType: 'positive_integer',
      required: true,
      value: this.SEARCH_CROSS_APP_ACTIVE_HEARING_DAY_OFFSET,
      minLength: 1,
      maxLength: 2,
    }));

    this.set('minThresholdScoreModel', new InputModel({
      labelText: 'Min Score (optional)',
      inputType: 'positive_integer',
      minLength: 1,
      maxLength: 2,
    }));

    this.set('tenancyAddressModel', new InputModel({
      labelText: 'Tenancy Address (4-min)',
      minLength: 4,
      maxLength: 80,
    }));

    this.set('tenancyZipPostalModel', new InputModel({
      labelText: 'Tenancy Zip/Postal (3-min)',
      minLength: 3,
      maxLength: 15
    }));


    this.set('disputeTypeModel', new DropdownModel( {
      labelText: 'Dispute Type',
      value: -1,
      optionData: [{value:configChannel.request('get', 'DISPUTE_TYPE_RTA'), text: 'RTA'}, {value:configChannel.request('get', 'DISPUTE_TYPE_MHPTA'), text: 'MHPTA'}, {value:-1, text: 'All'}]
    }));

    this.set('disputeSubTypeModel', new DropdownModel( {
      labelText: 'Dispute Sub-Type',
      value: -1,
      optionData: [{value:configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'), text: 'Landlord'}, {value:configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'), text: 'Tenant'}, {value:-1, text: 'All'}]
    }));

    this.set('restrictDatesCheckBoxModel', new CheckboxModel({
      html: 'Restrict Dates',
      checked: false
    }));

    this.set('sortResultsCheckBoxModel', new CheckboxModel({
      html: 'Sort Results',
      checked: false
    })); 

    this.set('includeActiveDisputesCheckBox', new CheckboxModel({
      html: 'Include inactive disputes',
      checked: true
    }));

    this.set('resultsCountModel', new DropdownModel({
      value: INITIAL_RESULTS_LOW,
      optionData: [{ value: INITIAL_RESULTS_LOW, text: INITIAL_RESULTS_LOW }, { value: INITIAL_RESULTS_HIGH, text: INITIAL_RESULTS_HIGH }] 
    }));

    this.set('restrictDateFieldModel', new DropdownModel({
      labelText: 'Date',
      value: 0,
      optionData: [{value:0, text: 'Submitted'}, {value:1, text: 'Modified'}, {value:2, text: 'Created'}],
      disabled: !this.get('restrictDatesCheckBoxModel').getData()
    }));

    this.set('restrictDateTypeModel', new DropdownModel({
      value: 0,
      optionData: [{value:0, text: 'Before'}, {value:1, text: 'After'}, {value:2, text: 'Between'}],
      disabled: !this.get('restrictDatesCheckBoxModel').getData()
    }));

    this.set('startingDateModel', new InputModel ({
      inputType: 'date',
      showYearDate: true,
      errorMessage: 'Enter the start date',
      value: null,
      required: false,
      labelText: 'Starting Date',
      disabled: !this.get('restrictDatesCheckBoxModel').getData()
    }));

    this.set('endingDateModel', new InputModel({
      inputType: 'date',
      showYearDate: true,
      errorMessage: 'Enter the end date',
      value: null,
      required: false,
      labelText: 'Ending Date',
      disabled: true
    }));

    this.set('sortByModel', new DropdownModel({
      value: 0,
      optionData: [{value:0, text: 'Date Created'}, {value:1, text: 'Date Submitted'}, {value:2, text: 'Date Modified'}],
      disabled: !this.get('restrictDatesCheckBoxModel').getData()
    }));

    this.set('sortTypeModel', new DropdownModel({
      value: 0,
      optionData: [{value:0, text: 'Oldest First'}, {value:1, text: 'Newest First'}],
      disabled: !this.get('restrictDatesCheckBoxModel').getData()
    }));

    this.set('accessNumberModel', new InputModel({
      labelText: 'Access Number (exact)',
      inputType: 'access_number',
      maxLength: 7,
      minLength: 7,
      required: true,
      errorMessage: 'Enter access code',
      restrictedStrings: this.ETL_GENERIC_ACCESS_CODE ? {
        values: this.ETL_GENERIC_ACCESS_CODE,
        errorMessage: [`Invalid access code.`]
      } : null
    }));

    this.set('participantFirstNameModel', new InputModel({
      labelText: 'First Name (2 Min)',
      minLength: 2,
      maxLength: 20,
    }));

    this.set('participantLastNameModel', new InputModel({
      labelText: 'Last Name (2 Min)',
      minLength: 2,
      maxLength: 20,
    }));

    this.set('participantNameTypeModel', new DropdownModel({
      value: 0,
      optionData: [{value:0, text: 'First Last Name'}, {value:1, text: 'Business Name'}]
    }));

    this.set('contactInfoTypeModel', new DropdownModel({
      value: 0,
      optionData: [{ value:0, text: 'Email' }, { value:1, text: 'Phone' }]
    }));

    this.set('contactInfoEmailPhone', new InputModel({
      labelText: 'Email Address (exact)',
      inputType: 'email',
      required: true,
      maxLength: 250
    }));

    this.set('stageEditModel', new DropdownModel({
      optionData: this.stagesToPicklist(),
      labelText: 'Stage',
      errorMessage: 'Select a stage type',
      required: true,
      value: 0
    }));

    const statusEditOptions = this.statusesToPicklistFromStageWithoutStatusNotSubmitted(this.get('stageEditModel').getData());
    this.set('statusEditModel', new DropdownModel({
      optionData: statusEditOptions,
      labelText: 'Status',
      errorMessage: 'Select a status type',
      required: true,
      value: statusEditOptions.length ? (statusEditOptions[0] || {}).value : null,
    }));

    this.set('processEditModel', new DropdownModel({
      optionData: (statusChannel.request('get:processes') || []).map(configValue => {
        return { value: String(configValue), text: Formatter.toProcessDisplay(configValue) };
      }),
      labelText: 'Process',
      errorMessage: 'Select a process type',
      value: 1,
    }));

    this.set('includeOwnerModel', new DropdownModel( {
      value: DROPDOWN_CODE_NO,
      disabled: true,
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Yes' }, { value: DROPDOWN_CODE_NO, text: 'No' }]
    }));

    this.set('ownerTypeModel', new DropdownModel({
      optionData: this._getRoleTypeOptions(),
      labelText: 'Owner Type',
      required: false,
      defaultBlank: true,
      value: null,
      disabled: true
    }));


    this.set('ownerEditModel', new DropdownModel({
      labelText: 'Owner',
      errorMessage: 'Select a status owner',
      required: true,
      defaultBlank: true,
      value: null,
      disabled: true
    }));

    this.set('hearingDateModel', new InputModel ( {
      inputType: 'date',
      showYearDate: true,
      value: null,
      required: true,
      labelText: 'Hearing Date',
      allowFutureDate: true
    }));

    this.set('hearingTypeModel', new DropdownModel({
      labelText: 'Hearing Type',
      required: true,
      optionData: this.getHearingTypeOptions(),
      value: 0
    }));

    this.set('includeInactiveHearingsCheckboxModel', new CheckboxModel({
      html: 'Include inactive hearings',
      checked: false
    }));

    this.set('hearingOwnerModel', new DropdownModel({
      labelText: 'Hearing Owner',
      optionData: this.getHearingOwners(),
      value: 0
    }));

    this.set('restrictStatusCheckBoxModel', new CheckboxModel({
      html: 'Restrict Status',
      checked: false
    }));

    this.set('searchStageModel', new DropdownModel({
      optionData: this.stagesToPicklist(),
      labelText: 'Stage',
      errorMessage: 'Select a stage type',
      required: false,
      disabled: true,
      value: 0,
    }));

    const searchStatusOptions = this.statusesToPicklistFromStageWithoutStatusNotSubmitted(this.get('searchStageModel').getData());
    this.set('searchStatusModel', new DropdownModel({
      optionData: searchStatusOptions,
      labelText: 'Status',
      errorMessage: 'Select a status type',
      required: false,
      disabled: true,
      value: searchStatusOptions.length ? (searchStatusOptions[0] || {}).value : null,
    }));

    this.set('crossAppSubTypeModel', new DropdownModel({
      optionData: [{ value: DROPDOWN_CODE_ALL, text: 'All' },
        { value: DROPDOWN_CODE_DUP, text: 'Duplicate' },
        { value: DROPDOWN_CODE_CROSS, text: 'Cross' }],
      labelText: 'Search Type',
      required: true,
      disabled: true,
      defaultBlank: false,
      value: DROPDOWN_CODE_ALL
    }));

    const subTypeLandlord = String(configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'));
    const typeRTA = String(configChannel.request('get', 'DISPUTE_TYPE_RTA'));
    this.set('searchClaimsDisputeSubTypeModel', new DropdownModel({
      labelText: 'Applicant Type',
      value: subTypeLandlord,
      optionData: [{ value: subTypeLandlord, text: 'Landlord' }, { value: String(configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT')), text: 'Tenant' }]
    }));

    this.set('searchClaimsDisputeTypeModel', new DropdownModel({
      labelText: 'Act',
      value: typeRTA,
      optionData: [{ value: typeRTA, text: 'RTA'}, { value: String(configChannel.request('get', 'DISPUTE_TYPE_MHPTA')), text: 'MHPTA' }]
    }));

    this.set('searchClaimsTenancyStatusModel', new DropdownModel({
      labelText: 'Tenancy Status',
      value: DROPDOWN_CODE_YES,
      optionData: [{ value: DROPDOWN_CODE_YES, text: 'Current Tenancy' }, { value: DROPDOWN_CODE_NO , text: 'Past Tenancy' }]
    }));

    this.set('searchClaimsDropdownCollection', new DropdownCollection());
    this.set('claimFilterState', false);


    this.set('restrictCmsStatusCheckBoxModel', new CheckboxModel({
      html: 'Restrict Status',
      checked: false
    }));

    this.set('searchCmsStatusModel', new DropdownModel({
      optionData: this.cmsStatusesToPicklist(CMS_STATUS_DISPLAYS),
      labelText: 'Status',
      errorMessage: 'Select a status type',
      required: false,
      disabled: true,
      value: 0,
    }));

    this.set('restrictMethodModel', new CheckboxModel({
      html: 'Restrict Type',
      checked: false
    }));

    this.set('creationMethodsModel', new DropdownModel({
      optionData: this.getCreationMethodOptions(),
      labelText: 'Type',
      errorMessage: 'Select a type',
      defaultBlank: false,
      required: false,
      disabled: true,
      value: null
    }));
  },

  /* Utility methods for accessing models */
  isClaimFilterRTA() {
    return this.get('searchClaimsDisputeTypeModel').getData({ parse: true }) === configChannel.request('get', 'DISPUTE_TYPE_RTA');
  },

  isClaimFilterLandlord() {
    return this.get('searchClaimsDisputeSubTypeModel').getData({ parse: true }) === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD');
  },

  isClaimFilterCurrent() {
    return String(this.get('searchClaimsTenancyStatusModel').getData()) === DROPDOWN_CODE_YES;
  },
  
});

