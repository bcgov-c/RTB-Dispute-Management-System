import Backbone from 'backbone';
import Radio from 'backbone.radio';
import AddressModel from '../../../address/Address_model';
import RadioModel from '../../../radio/Radio_model';
import InputModel from '../../../input/Input_model';
import DropdownModel from '../../../dropdown/Dropdown_model';
import DoubleSelectorModel from '../../../double-selector/DoubleSelector_model';
import ParticipantModel from '../../../participant/Participant_model';

const DEFAULT_PROVINCE_STRING = 'British Columbia';
const DEFAULT_COUNTRY_STRING = 'Canada';

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default Backbone.Model.extend({

  defaults: {
    unit_id: null,
    address: null,
    unit_type: null,
    unit_text: null,
		city: null,
		postal_zip: null,
		participant_ids: null,
    rent_amount: null,
    selected_tenants: null,
		rent_start_month: null,
    awarded_amount: null,
    issue_id: null,
    permits: null,
    /**
     * Permits has format
       "local-permit_id": "CRX-12345",
        "local-permit_description": null,
        "local-issued_date": "2021-01-01T10:03:03.428Z",
        "local-issued_by": "John Smith"
     */
  },

  initialize() {
    this.UNIT_TYPE_DESCRIPTION_MAX = configChannel.request('get', 'UNIT_TYPE_DESCRIPTION_MAX');
    this.RENT_UNIT_TYPE_DISPLAY = configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY');
    this.RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    this.createSubModels();
  },

  createSubModels() {
    this.set('addressModel', new AddressModel({
      useSubLabel: false,
      name: `address${this.get('unit_id')}`,
      json: {
        street: this.get('address'),
        city: this.get('city'),
        postalCode: this.get('postal_zip'),
      },
      showUpdateControls: false,
      useAddressValidation: false,
      useCPToolBackup: false,
      selectProvinceAndCountry: false,
    }));

    try {
      const addressModel = this.get('addressModel');
      addressModel.get('streetModel').set('labelText', 'Unit Address');
      addressModel.get('cityModel').set('disabled', true);
    } catch (err) {
      //
    }

    this.set('hasUnitTypeModel', new RadioModel({
      optionData: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }],
      required: true,
      value: this.get('unit_id') ? (this.get('unit_type') ? 1 : 0) : null
    }));

    // Create rental address type and question
    const rentUnitTypeOptions = Object.entries(this.RENT_UNIT_TYPE_DISPLAY || {})
      .filter(([value]) => value && String(value) !== this.RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );

    const unit_type = this.get('unit_type') ? String(this.get('unit_type')) : null;
    this.set('rentDescriptionModel', new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        required: true,
        clearWhenHidden: true,
        value: unit_type,
        apiMapping: 'unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.UNIT_TYPE_DESCRIPTION_MAX,
        minLength: 3,
        value: this.get('unit_text') || null,
        apiMapping: 'unit_text',
      }),
      showValidate: false,
      clearWhenHidden: true,
      singleDropdownMode: true,
      enableOther: true,
      otherOverrideValue: this.RENT_UNIT_TYPE_OTHER,
      currentValue: unit_type
    }));
  },

  getAddressData() {
    return {
      address: this.getStreetDisplayWithDescriptor(),
      city: this.get('city'),
      province_state: DEFAULT_PROVINCE_STRING,
      country: DEFAULT_COUNTRY_STRING,
      postal_zip: this.get('postal_zip'),
    };
  },

  createTenantForUnit() {
    return new ParticipantModel(this.getAddressData());
  },

  isSharedAddressSelected() {
    return this.get('hasUnitTypeModel').getData();
  },

  clearParticipantIds() {
    this.set('participant_ids', null);
  },

  getParticipantIds() {
    return this.get('participant_ids') || [];
  },

  addParticipantId(participantId) {
    const existingIds = this.getParticipantIds();
    this.set('participant_ids', _.union(existingIds, [participantId]));
  },

  removeParticipantIds(participantIdsToRemove) {
    participantIdsToRemove = _.isArray(participantIdsToRemove) ? participantIdsToRemove : [participantIdsToRemove];
    
    const existingIds = this.getParticipantIds();
    this.set('participant_ids', _.without(existingIds, participantIdsToRemove));
  },

  getUnitNumDisplay() {
    return `Unit ${Formatter.toLeftPad(this.get('unit_id'), '0', 3)}`;
  },

  getUnitNumDisplayShort() {
    return `U${Formatter.toLeftPad(this.get('unit_id'), '0', 3)}`;
  },

  hasParticipantId(participantId) {
    return _.contains(this.getParticipantIds(), participantId);
  },

  hasSavedAddressData() {
    return this.get('address');
  },

  hasSavedRentIncreaseData() {
    return this.get('selected_tenants') && this.get('rent_amount');
  },

  clearSavedRentIncreaseData() {
    this.set('selected_tenants', null, { silent: true });
    this.set('rent_amount', null, { silent: true });
  },

  getRentAmount() {
    return this.get('rent_amount');
  },

  getStreetDisplayWithDescriptor() {
    if (!this.get('address')) {
      return '';
    }
    return `${this.getUnitDescriptorDisplay()}${this.get('address')}`;
  },

  getUnitDescriptorDisplay() {
    const unitType = this.get('unit_type');
    const isOther = unitType && unitType === this.RENT_UNIT_TYPE_OTHER;
    
    const rentDescriptorString = $.trim(_.has(this.RENT_UNIT_TYPE_DISPLAY, unitType) ?
      (isOther ? this.get('unit_text') : this.RENT_UNIT_TYPE_DISPLAY[unitType]) : '');

    return rentDescriptorString ? `(${rentDescriptorString}) ` : '';
  },

  getAddressWithoutStreet() {
    return `${this.get('city')}, ${DEFAULT_PROVINCE_STRING}, ${DEFAULT_COUNTRY_STRING}, ${this.get('postal_zip')}`;
  },

  getPermits() {
    return this.get('permits') || [];
  },

  noPermitsRequired() {
    // When user answers this question, it is set from null to empty list
    return Array.isArray(this.get('permits')) && !this.get('permits').length;
  },

  isMissingRequiredSelections() {
    const modelAttrs = ['addressModel', 'hasUnitTypeModel', ...(this.isSharedAddressSelected() ? ['rentDescriptionModel'] : [])];
    return _.any(modelAttrs, modelAttrs => !this.get(modelAttrs).isValid());
  },

  saveInternalDataToModel() {
    const isSharedAddressSelected = this.isSharedAddressSelected();
    const addressApiData = this.get('addressModel').getPageApiDataAttrs();
    const rentDescriptionApiData = this.get('rentDescriptionModel').getPageApiDataAttrs();

    if (!isSharedAddressSelected) {
      Object.keys(rentDescriptionApiData).forEach(key => rentDescriptionApiData[key] = null);
    }

    this.set(_.extend({
      unit_id: this.collection ? this.collection.indexOf(this) + 1 : null,
      address: addressApiData.street,
      city: addressApiData.city,
      postal_zip: addressApiData.postalCode
    }, rentDescriptionApiData));
  }
});