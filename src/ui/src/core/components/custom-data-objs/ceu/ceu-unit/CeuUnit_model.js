import Backbone from 'backbone';
import Radio from 'backbone.radio';
import AddressModel from '../../../address/Address_model';
import RadioModel from '../../../radio/Radio_model';
import InputModel from '../../../input/Input_model';
import DropdownModel from '../../../dropdown/Dropdown_model';
import DoubleSelectorModel from '../../../double-selector/DoubleSelector_model';
import Checkbox_collection from '../../../checkbox/Checkbox_collection';
import Question_model from '../../../question/Question_model';
import Input_model from '../../../input/Input_model';
import DisputeEvidence_model from '../../../claim/DisputeEvidence_model';
import IntakeCeuDataParser from '../IntakeCeuDataParser';
import File_collection from '../../../files/File_collection';

const DEFAULT_PROVINCE_STRING = 'British Columbia';
const DEFAULT_COUNTRY_STRING = 'Canada';
const LL_SELECT_TEXT = `Please select the tenants that currently reside or previously resided in this unit.`;
const LL_SELECT_HELP_TEXT = `If the name of the tenant is not listed below, please click the Edit Tenants link.`;
const TT_SELECT_TEXT = `Please select the landlord that owns or manages the unit/site.`;
const TT_SELECT_HELP_TEXT = `If the name of the landlord is not listed below, please click the Edit Landlords link.`;

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  idAttribute: 'r_rental_unit_guid',
  defaults: {
    r_rental_unit_guid: null,
    r_tenancy_address: null,
    r_tenancy_city: null,
    r_tenancy_postal_zip: null,
    r_tenancy_province_state: null,
    r_tenancy_country: null,
    r_tenancy_unit_type: null,
    r_tenancy_unit_text: null,
    r_num_tenants: null,
    r_associated_impacted_parties: null,
    r_tenancy_ended: null,
    r_tenancy_end_date: null,
    r_has_tenancy_agreement: null,
    r_tenancy_agreement_evidence: null,
    /*
    e_evidence_guid
    e_is_other_evidence
    e_evidence_type
    e_evidence_title
    e_provision_option
    */
    r_tenancy_agreement_extfile_ids: null,

    // Will be auto-determined based on CEU intake state, UI-only values
    selectableTenants: null,
    applicantSelectText: 'Please select who is associated to this unit',
    applicantSelectHelp: null,
    applicantSelectLinkText: 'Edit Applicants',
  },

  initialize() {
    this.UNIT_TYPE_DESCRIPTION_MAX = configChannel.request('get', 'UNIT_TYPE_DESCRIPTION_MAX');
    this.RENT_UNIT_TYPE_DISPLAY = configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY');
    this.RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    
    const isRespondentLandlord = IntakeCeuDataParser.isRespondentLandlord();
    this.set({
      selectableTenants: IntakeCeuDataParser.getApplicantCollection(),
      applicantSelectText: isRespondentLandlord ? LL_SELECT_TEXT : TT_SELECT_TEXT,
      applicantSelectHelp: isRespondentLandlord ? LL_SELECT_HELP_TEXT : TT_SELECT_HELP_TEXT,
      applicantSelectLinkText: isRespondentLandlord ? 'Edit Tenants' : 'Edit Landlords',
    });
    
    this.createSubModels();
  },

  createSubModels() {
    this.set('addressModel', new AddressModel({
      useDefaultProvince: true,
      streetSubLabel: `Please ensure address is complete and indicate the unit number if applicable eg. 111 - 1234 Fort Street`,
      name: `address${this.get('r_rental_unit_guid')}`,
      json: {
        street: this.get('r_tenancy_address'),
        city: this.get('r_tenancy_city'),
        postalCode: this.get('r_tenancy_postal_zip'),
      }
    }));

    this.set('hasUnitTypeModel', new RadioModel({
      optionData: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }],
      required: true,
      value: this.get('r_rental_unit_guid') ? (this.get('r_tenancy_unit_type') ? 1 : 0) : null
    }));

    // Create rental address type and question
    const rentUnitTypeOptions = Object.entries(this.RENT_UNIT_TYPE_DISPLAY || {})
      .filter(([value]) => value && String(value) !== this.RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );

    const unit_type = this.get('r_tenancy_unit_type') ? String(this.get('r_tenancy_unit_type')) : null;
    this.set('rentDescriptionModel', new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        required: true,
        clearWhenHidden: true,
        value: unit_type,
        apiMapping: 'r_tenancy_unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.UNIT_TYPE_DESCRIPTION_MAX,
        minLength: 3,
        value: this.get('r_tenancy_unit_text') || null,
        apiMapping: 'r_tenancy_unit_text',
      }),
      showValidate: false,
      clearWhenHidden: true,
      singleDropdownMode: true,
      enableOther: true,
      otherOverrideValue: this.RENT_UNIT_TYPE_OTHER,
      currentValue: unit_type
    }));

    this.set('numTenantsModel', new InputModel({
      inputType: 'positive_integer',
      labelText: ' ',
      maxLength: 3,
      required: false,
      value: this.get('r_num_tenants') || null,
      apiMapping: 'r_num_tenants',
    }));
    
    this.set('participantCheckboxes', new Checkbox_collection(
      (this.get('selectableTenants') || []).map(p => {
        return {
          html: `${p.getDisplayName()}`,
          checked: !!this.hasParticipantId(p.id),
          participantId: p.id,
        }
      }),
    { minSelectsRequired: this.get('selectableTenants')?.length ? 1 : 0 }));
    

    this.set('hasCurrentTenant', new Question_model({
      optionData: [{ name: 'ceu-unit-tenancy-no', cssClass: 'option-button yes-no', value: 0, text: 'NO' },
        { name: 'ceu-unit-tenancy-yes', cssClass: 'option-button yes-no', value: 1, text: 'YES' }],
      required: true,
      question_answer: this.get('r_tenancy_ended') === null ? null
          : (this.get('r_tenancy_ended') ? 0 : 1),
    }));

    this.set('tenancyEndDate', new Input_model({
      inputType: 'date',
      labelText: ' ',
      errorMessage: 'Enter a date and accept',
      minDate: Moment().subtract( configChannel.request('get', 'DATE_MIN_YEAR_OFFSET'), 'years' ),
      apiMapping: 'r_tenancy_end_date',
      value: this.get('r_tenancy_end_date') ? Moment(this.get('r_tenancy_end_date')).format(InputModel.getDateFormat()) : null,
    }));

    this.set('hasTenancyAgreement', new Question_model({
      optionData: [{ name: 'ceu-unit-ta-no', cssClass: 'option-button yes-no', value: 0, text: 'NO' },
        { name: 'ceu-unit-ta-yes', cssClass: 'option-button yes-no', value: 1, text: 'YES' }],
      required: true,
      question_answer: this.get('r_has_tenancy_agreement') === null ? null
          : this.get('r_has_tenancy_agreement') ? 1 : 0,
    }));

    const pendingUploads = filesChannel.request('get:pending:ceu') || {};
    const savedEvidence = this.getTenancyAgreementEvidence();
    const matchingFiles = savedEvidence ?
      Object.values(pendingUploads)
        .filter(uploadData => uploadData.evidenceData.e_evidence_guid === savedEvidence.e_evidence_guid)
        .map(data => data.fileModel)
      : null;
    
    this.set('tenancyAgreementEvidence', new DisputeEvidence_model({
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
      title: "Tenancy Agreement",
      required: true,
      helpHtml: ' ',
      mustUploadNow: true,
      e_evidence_guid: savedEvidence ? savedEvidence.e_evidence_guid : null,
      file_method: savedEvidence ? savedEvidence.e_provision_option : null,
      files: matchingFiles ? new File_collection(matchingFiles) : null,
    }));
  },

  getTenancyAgreementEvidence() {
    return this.get('r_tenancy_agreement_evidence') || null;
  },

  isSharedAddressSelected() {
    return this.get('hasUnitTypeModel').getData();
  },

  clearParticipantIds() {
    this.set('r_associated_impacted_parties', null);
  },

  getParticipantIds() {
    return this.get('r_associated_impacted_parties') || [];
  },

  addParticipantId(participantId) {
    const existingIds = this.getParticipantIds();
    this.set('r_associated_impacted_parties', _.union(existingIds, [participantId]));
  },

  removeParticipantIds(participantIdsToRemove) {
    participantIdsToRemove = _.isArray(participantIdsToRemove) ? participantIdsToRemove : [participantIdsToRemove];
    
    const existingIds = this.getParticipantIds();
    this.set('r_associated_impacted_parties', _.without(existingIds, participantIdsToRemove));
  },

  hasParticipantId(participantId) {
    return _.contains(this.getParticipantIds(), participantId);
  },

  hasSavedAddressData() {
    return this.get('r_tenancy_address');
  },

  getStreetDisplayWithDescriptor() {
    if (!this.get('r_tenancy_address')) {
      return '';
    }
    return `${this.getUnitDescriptorDisplay()}${this.get('r_tenancy_address')}`;
  },

  getUnitDescriptorDisplay() {
    const unitType = this.get('r_tenancy_unit_type');
    const isOther = unitType && unitType === this.RENT_UNIT_TYPE_OTHER;
    
    const rentDescriptorString = $.trim(_.has(this.RENT_UNIT_TYPE_DISPLAY, unitType) ?
      (isOther ? this.get('r_tenancy_unit_text') : this.RENT_UNIT_TYPE_DISPLAY[unitType]) : '');

    return rentDescriptorString ? `(${rentDescriptorString}) ` : '';
  },

  getAddressWithoutStreet() {
    return `${this.get('r_tenancy_city')}, ${DEFAULT_PROVINCE_STRING}, ${DEFAULT_COUNTRY_STRING}, ${this.get('r_tenancy_postal_zip')}`;
  },

  saveInternalDataToModel(options={}) {
    const modelSaveData = {};

    const isSharedAddressSelected = this.isSharedAddressSelected();
    const addressApiData = this.get('addressModel').getPageApiDataAttrs();
    const rentDescriptionApiData = this.get('rentDescriptionModel').getPageApiDataAttrs();

    if (!isSharedAddressSelected) {
      Object.keys(rentDescriptionApiData).forEach(key => rentDescriptionApiData[key] = null);
    }

    const hasCurrentTenant = this.get('hasCurrentTenant').getData({ parse: true });
    const hasTenancyAgreement = this.get('hasTenancyAgreement').getData({ parse: true });
    const tenancyAgreementData = hasTenancyAgreement ? IntakeCeuDataParser.convertDisputeEvidenceToData(this.get('tenancyAgreementEvidence')) : {};
    
    Object.assign(modelSaveData, {
      r_tenancy_address: addressApiData.street,
      r_tenancy_city: addressApiData.city,
      r_tenancy_postal_zip: addressApiData.postalCode,
      r_num_tenants: this.get('numTenantsModel').getData({ parse: true }),

      r_tenancy_ended: !hasCurrentTenant,
      r_tenancy_end_date: !hasCurrentTenant ? this.get('tenancyEndDate').getData({ format: 'date' }) : null,
      r_has_tenancy_agreement: hasTenancyAgreement,
      
      r_tenancy_agreement_evidence: hasTenancyAgreement ? tenancyAgreementData : null,
      r_associated_impacted_parties: this.get('participantCheckboxes').filter(c => c.get('checked')).map(c => c.get('participantId')),

    }, rentDescriptionApiData);

    if (options.returnOnly) {
      return modelSaveData;
    } else {
      if (tenancyAgreementData && tenancyAgreementData.e_evidence_guid) {
        this.get('tenancyAgreementEvidence').set('e_evidence_guid', tenancyAgreementData.e_evidence_guid);
      }
  
      if (hasTenancyAgreement) {
        this.get('tenancyAgreementEvidence').get('files').forEach(fileModel => {
          if (fileModel.isReadyToUpload()) filesChannel.request('add:pending:ceu', tenancyAgreementData, fileModel);
        });
      }

      this.set(modelSaveData);
    }
  }
});