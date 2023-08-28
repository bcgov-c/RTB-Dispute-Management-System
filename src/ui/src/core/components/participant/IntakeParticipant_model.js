/**
 * IntakeParticipantModel holds UI values for a participant.  For API connections to a participant,
 * see {@link core.components.participant.ParticipantModel|ParticipantModel}.
 * @class core.components.participant.IntakeParticipantModel
 * @memberof core.components.participant
 * @augments Backbone.Model
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import RadioModel from '../../../core/components/radio/Radio_model';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import AddressModel from '../../../core/components/address/Address_model';
import DoubleSelectorModel from '../double-selector/DoubleSelector_model';

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default Backbone.Model.extend({
  APPLICANT_FIELD_MAX: null,
  PHONE_FIELD_MAX: null,

  defaults: {
    participantTypeUI: null,
    noPackageProvision: false,
    noEmailOptOut: null,
    isRespondent: false,
    useAddressValidation: false,
    useMailAddressValidation: false,
  },

  initialize() {
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.PHONE_FIELD_MAX = configChannel.request('get', 'PHONE_FIELD_MAX');
    this.BUSINESS_NAME_MAX_NUM_WORDS = configChannel.request('get', 'BUSINESS_NAME_MAX_NUM_WORDS');

    if (!this.get('apiMapping') || _.isEmpty(this.get('apiMapping'))) {
      this.createDefaultApiMappings();
    }

    // Creates a random, unique ID for the string to be used in 'name' templates
    if (!this.get('name')) {
      this.set('name', this._generateRandomString());
    }

    if (!this.get('participantModel')) {
      console.log(`[Error] IntakeParticipant object needs a participantModel`, this);
    }

    this.listenTo(this.get('participantModel'), 'sync:complete', this.setupFrontendData, this);

    if (this?.collection?.collectionOptions?.isRespondent || this.get('isRespondent')) {
      this.set('optionalEmail', true);
      this.set('optionalPhone', true);
    }
    this.setupFrontendData();
  },

  setupFrontendData() {
    this.setOptionalEmail();
    this.setParticipantTypeUI();
    this.createSubModels();
    // Broadcast a sync complete event so submodels can be listened to if they're recreated
    this.trigger('build:complete', this);
  },

  setOptionalEmail() {
    // If model has no_email api field, then email should be optional
    this.set('optionalEmail', this.get('participantModel').get('no_email') ? true : this.get('optionalEmail'));
  },

  setEmailToOptional() {
    // Modify the front-end model and the API values
    this.get('emailModel').set({
      required: false,
      cssClass: `${$.trim(this.get('emailModel').get('cssClass')).replace('optional-input', '')} optional-input`
    }, { silent: true });
    this.set('optionalEmail', true);
    this.get('participantModel').set('no_email', true);
  },

  setEmailToRequired() {
    // Modify the front-end model and the API values
    this.get('emailModel').set({
      required: true,
      cssClass: $.trim(this.get('emailModel').get('cssClass')).replace('optional-input', ''),
    }, { silent: true });
    this.set('optionalEmail', false);
    this.get('participantModel').set('no_email', false);
  },

  setPhoneToRequired() {
    this.get('daytimePhoneModel').set({
      required: true,
      cssClass: $.trim(this.get('emailModel').get('cssClass')).replace('optional-input', ''),
    }, { silent: true });
    this.set('optionalPhone', false);
  },

  setParticipantTypeUI() {
    // If no UI participantType code passed in, detect and set it
    const participant_type = this.get('participantModel').get('participant_type'),
      PARTICIPANT_TYPE_BUSINESS = configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS'),
      PARTICIPANT_TYPE_PERSON = configChannel.request('get', 'PARTICIPANT_TYPE_PERSON'),
      PARTICIPANT_TYPE_AGENT_OR_LAWYER = configChannel.request('get', 'PARTICIPANT_TYPE_AGENT_OR_LAWYER'),
      PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT = configChannel.request('get', 'PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT');
    
    let participant_type_to_set = null;
    if (!this.get('participantTypeUI') && participant_type) {
      if (_.contains([PARTICIPANT_TYPE_BUSINESS, PARTICIPANT_TYPE_PERSON], participant_type)) {
        participant_type_to_set = 1;
      } else if (_.contains([PARTICIPANT_TYPE_AGENT_OR_LAWYER, PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT], participant_type)) {
        participant_type_to_set = 2;
      }

      this.set('participantTypeUI', participant_type_to_set);
    }
  },

  getContactName() {
    return this.isBusiness() ? (`${this.get('participantModel').get('bus_contact_first_name')} ${this.get('participantModel').get('bus_contact_last_name')}`) :
        (`${this.get('participantModel').get('first_name')} ${this.get('participantModel').get('last_name')}`);
  },

  getDisplayName() {
    return this.isBusiness() ? this.get('participantModel').get('bus_name') :
        (`${this.get('participantModel').get('first_name')} ${this.get('participantModel').get('last_name')}`);
  },

  createDefaultApiMappings() {
    this.set('apiMapping', {
      participantTypeModel: 'participant_type',
      businessNameModel: 'bus_name',
      emailModel: 'email',
      daytimePhoneModel: 'primary_phone',
      otherPhoneModel: 'secondary_phone',
      faxPhoneModel: 'fax',
      knownContactModel: 'known_contact_fields',
    });
  },

  isBusiness() {
    const participantTypeModel = this.get('participantTypeModel'),
      participant_type = participantTypeModel && $.trim(participantTypeModel.getData()) !== "" ? participantTypeModel.getData() : this.get('participantModel').get('participant_type');
    return participant_type === configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS');
  },

  isPersonOrBusiness() {
    const participantTypeModel = this.get('participantTypeModel'),
      participant_type = participantTypeModel && $.trim(participantTypeModel.getData()) !== "" ? participantTypeModel.getData() : this.get('participantModel').get('participant_type');
    return participant_type === configChannel.request('get', 'PARTICIPANT_TYPE_PERSON') || this.isBusiness() || this.get('participantTypeUI') === 1;
  },

  isAssistant() {
    // Return whatever has been set on the dropdown model itself
    const assistant_type_keys = ['PARTICIPANT_TYPE_AGENT_OR_LAWYER', 'PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT'],
      val = this.get('participantTypeModel').getData();
    return _.any(assistant_type_keys, function(key) {
      return String(val) === String(configChannel.request('get', key));
    }, this);
  },

  resetModel() {
    return this.get('participantModel').resetModel();
  },

  needsApiUpdate() {
    return this.get('participantModel').needsApiUpdate();
  },

  isNew() {
    return this.get('participantModel').isNew();
  },

  hasMailAddress() {
    return this.get('participantModel').hasMailAddress();
  },

  _generateRandomString() {
    return String(Math.random()).substring(2,12);
  },

  getParticipantTypeOptionsUI() {
    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY'),
      participant_type_ui = this.get('participantTypeUI'),
      name = this.get('name');

    const getOptionFor = function(config_type_key) {
      const value = configChannel.request('get', config_type_key);
      return { name: `${name}-type`, value, text: PARTICIPANT_TYPE_DISPLAY[value] };
    }

    const option_data_to_return = participant_type_ui === 2 ? [getOptionFor('PARTICIPANT_TYPE_AGENT_OR_LAWYER'), getOptionFor('PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT')] :
        [getOptionFor('PARTICIPANT_TYPE_PERSON'), getOptionFor('PARTICIPANT_TYPE_BUSINESS')];
    
    if (participant_type_ui === configChannel.request('get', 'PARTICIPANT_TYPE_UI_ALL')) {
      option_data_to_return[1].separatorHtml = '<div class="admin-radio-separator"></div>';
      option_data_to_return.push(getOptionFor('PARTICIPANT_TYPE_AGENT_OR_LAWYER'));
      option_data_to_return.push(getOptionFor('PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT'));
    }
    return option_data_to_return;
  },

  // If no participant type set, populate with a default value depending on UI type
  getDefaultParticipantType() {
    const participant_type = this.get('participantModel').get('participant_type');
    if (participant_type) {
      return participant_type;
    }
    const typeUI = this.get('participantTypeUI');
    return typeUI === 1 ? configChannel.request('get', 'PARTICIPANT_TYPE_PERSON') :
        typeUI === 2 ? configChannel.request('get', 'PARTICIPANT_TYPE_AGENT_OR_LAWYER') :
        participant_type;
  },

  createSubModels() {
    this.UNIT_TYPE_DESCRIPTION_MAX = configChannel.request('get', 'UNIT_TYPE_DESCRIPTION_MAX');
    this.RENT_UNIT_TYPE_DISPLAY = configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY');
    this.RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    
    const name = this.get('name'),
      isBusiness = this.isBusiness();

    this.set('participantTypeModel', new RadioModel({
      optionData: this.getParticipantTypeOptionsUI(),
      required: true,
      value: this.getDefaultParticipantType()
    }));

    this.set('businessNameModel', new InputModel({
      name: name + '-businessname',
      labelText: 'Business Name',
      errorMessage: 'Business Name is required',
      required: true,
      minLength: configChannel.request('get', 'BUSINESS_NAME_MIN_LENGTH'),
      maxLength: this.APPLICANT_FIELD_MAX,
      maxWords: this.BUSINESS_NAME_MAX_NUM_WORDS,
      value: this.get('participantModel').get('bus_name')
    }));

    this.set('firstNameModel', new InputModel({
      allowedCharacters: InputModel.getRegex('person_name__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      name: name + '-firstname',
      labelText: 'First Name',
      errorMessage: 'First Name is required',
      required: true,
      subLabel: 'Ensure the legal name is entered',
      maxLength: this.APPLICANT_FIELD_MAX,
      value: isBusiness ? this.get('participantModel').get('bus_contact_first_name') : this.get('participantModel').get('first_name')
    }));

    this.set('lastNameModel', new InputModel({
      allowedCharacters: InputModel.getRegex('person_name__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      name: name + '-lastname',
      labelText: 'Last Name',
      errorMessage: 'Last Name is required',
      required: true,
      subLabel: 'Ensure the legal name is entered',
      maxLength: this.APPLICANT_FIELD_MAX,
      value: isBusiness ? this.get('participantModel').get('bus_contact_last_name') : this.get('participantModel').get('last_name')
    }));

    
    this.set('unitTypeRadioModel', new RadioModel({
      optionData: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }],
      required: true,
      value: this.get('participantModel').isNew() ? null : (this.get('participantModel').get('unit_type') ? 1 : 0)
    }));
    // Create rental address type and question
    const rentUnitTypeOptions = Object.entries(this.RENT_UNIT_TYPE_DISPLAY || {})
      .filter(([value]) => value && String(value) !== this.RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );

    const unit_type = this.get('participantModel').get('unit_type') ? String(this.get('participantModel').get('unit_type')) : null;
    const unit_text = this.get('participantModel').get('unit_text') || null;
    this.set('unitTypeModel', new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        required: false,
        clearWhenHidden: true,
        value: unit_type,
        apiMapping: 'unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.UNIT_TYPE_DESCRIPTION_MAX,
        minLength: 3,
        value: unit_text || null,
        apiMapping: 'unit_text',
      }),
      showValidate: false,
      clearWhenHidden: true,
      singleDropdownMode: true,
      enableOther: true,
      otherOverrideValue: this.RENT_UNIT_TYPE_OTHER,
      currentValue: unit_type
    }));

    const participantAddressApiMappings = {
      street: 'address',
      city: 'city',
      postalCode: 'postal_zip',
      country: 'country',
      province: 'province_state',
      addressIsValidated: 'address_is_validated'
    };

    this.set('addressModel', new AddressModel({
      json: _.mapObject(participantAddressApiMappings, function(val) { return this.get('participantModel').get(val); }, this),
      apiMapping: participantAddressApiMappings,
      name: name + '-address',
      useSubLabel: false,
      streetMaxLength: configChannel.request('get', 'PARTICIPANT_ADDRESS_FIELD_MAX'),
      showUpdateControls: false,
      useAddressValidation: this.get('useAddressValidation'),
      useCPToolBackup: this.get('useAddressValidation'),
      selectProvinceAndCountry: true,
    }));

    this.set('useMailModel', new DropdownModel({
      optionData: [{value: '1', text: 'Yes'},
          { value: '0', text: 'No'}],
      value: this.hasMailAddress() ? '0' : '1'
    }));


    let participantMailingAddressApiMappings = {
      street: 'mail_address',
      city: 'mail_city',
      postalCode: 'mail_postal_zip',
      country: 'mail_country',
      province: 'mail_province_state',
      addressIsValidated: 'mail_address_is_validated'
    };

    const mailingAddressModel = new AddressModel({
      name: name + '-mailing-address',
      json: _.mapObject(participantMailingAddressApiMappings, function(val) { return this.get('participantModel').get(val); }, this),
      apiMapping: participantMailingAddressApiMappings,
      showUpdateControls: false,
      useAddressValidation: this.get('useMailAddressValidation') || false,
      useCPToolBackup: this.get('useMailAddressValidation') || false,
      selectProvinceAndCountry: true,
    });
    // Add text 'Mail' to each model with a labelText on address
    _.each(_.keys(mailingAddressModel.attributes), function(attr) {
      const mailAddressSubmodel = mailingAddressModel.get(attr);
      if (mailAddressSubmodel && mailAddressSubmodel instanceof Backbone.Model) {
        const labelText = mailAddressSubmodel.get('labelText');
        if (labelText) {
          mailAddressSubmodel.set('labelText', 'Mail ' + labelText);
        }
      }
    });
    this.set('mailingAddressModel', mailingAddressModel);

    const optionalEmail = this.get('optionalEmail');
    this.set('emailModel', new InputModel(
      Object.assign({
        name: name + '-email',
        labelText: 'Email Address',
        cssClass: optionalEmail ? 'optional-input' : null,
        errorMessage: 'Email is required',
        inputType: 'email',
        required: !optionalEmail,
        maxLength: this.APPLICANT_FIELD_MAX,
        value: this.get('participantModel').get('email')
      })
    ));

    const optionalPhone = this.get('optionalPhone');
    this.set('daytimePhoneModel', new InputModel({
      inputType: 'phone',
      name: name + '-daytimephone',
      labelText: 'Daytime Phone',
      cssClass: optionalPhone ? 'optional-input' : null,
      errorMessage: 'Daytime phone is required',
      required: !optionalPhone,
      maxLength: this.PHONE_FIELD_MAX,
      value: this.get('participantModel').get('primary_phone')
    }));

    this.set('otherPhoneModel', new InputModel({
      inputType: 'phone',
      name: name + '-otherphone',
      labelText: 'Other Phone',
      cssClass: 'optional-input',
      required: false,
      maxLength: this.PHONE_FIELD_MAX,
      value: this.get('participantModel').get('secondary_phone')
    }));

    this.set('faxPhoneModel', new InputModel({
      inputType: 'phone',
      name: name + '-faxphone',
      labelText: 'Fax Number',
      errorMessage: 'Fax Number is required',
      cssClass: 'optional-input',
      required: false,
      maxLength: this.PHONE_FIELD_MAX,
      value: this.get('participantModel').get('fax')
    }));
    
    this.set('hearingOptionsByModel', new DropdownModel({
      optionData: [
        { text: Formatter.toHearingOptionsByDisplay(1), value: '1' },
        { text: Formatter.toHearingOptionsByDisplay(2), value: '2' }
      ],
      labelText: 'Notice Package Delivery Method',
      required: false,
      defaultBlank: true,
      value: this.get('package_delivery_method') ? String(this.get('package_delivery_method')) : null
    }));

    const PARTICIPANT_KNOWN_CONTACT_DISPLAY = configChannel.request('get', 'PARTICIPANT_KNOWN_CONTACT_DISPLAY') || {};
    this.set('knownContactModel', new DropdownModel({
      optionData: Object.keys(PARTICIPANT_KNOWN_CONTACT_DISPLAY).map(val => ({ value: String(val), text: PARTICIPANT_KNOWN_CONTACT_DISPLAY[val] })),
      labelText: 'What contact information do you have for them?',
      required: true,
      defaultBlank: true,
      value: this.get('participantModel').get('known_contact_fields') ? String(this.get('participantModel').get('known_contact_fields')) : null,
      apiMapping: 'known_contact_fields',
    }));
  },

  enableAddress(options={}) {
    this.get('addressModel').enableInputs(options);
    this.get('unitTypeRadioModel')?.set({ disabled: false, });
    this.get('unitTypeModel')?.updateCurrentValue(this.get('participantModel').get('unit_text') || this.get('participantModel').get('unit_type'));
    this.get('unitTypeModel')?.set({ disabled: false });
    if (options.render) {
      this.get('unitTypeRadioModel')?.trigger('render');
      this.get('unitTypeModel')?.trigger('render');
    }
  },

  disableAddress(options={}) {
    // Re-set the address values to API defaults, then disable all inputs
    const participantAddressApiMappings = {
      street: 'address',
      city: 'city',
      postalCode: 'postal_zip',
      country: 'country',
      province: 'province_state',
    };
    this.get('addressModel')?.updateValues(_.mapObject(participantAddressApiMappings, val => this.get('participantModel').get(val)));
    this.get('unitTypeRadioModel')?.set({
      value: this.get('participantModel').isNew() ? null : (this.get('participantModel').get('unit_type') ? 1 : 0),
      disabled: true,
    });
    
    this.get('addressModel').disableInputs(options);
    this.get('unitTypeModel')?.updateCurrentValue(this.get('participantModel').get('unit_text') || this.get('participantModel').get('unit_type'));
    this.get('unitTypeModel')?.set('disabled', true);

    if (options.disableMail) {
      this.get('useMailModel')?.set('disabled', true);
    }

    if (options.render) {
      this.get('useMailModel')?.trigger('render');
      this.get('unitTypeRadioModel')?.trigger('render');
      this.get('unitTypeModel')?.trigger('render');
    }
  },

  // Get the parsed attributes from the UI
  getUIDataAttrs() {
    const return_obj = {};
    _.each(this.get('apiMapping'), function(mapping_name, modelName) {
      return_obj[mapping_name] = this.get(modelName).getData({ parse: true });
    }, this);
    return_obj.no_email = this.get('optionalEmail') ? this.get('optionalEmail') : false;
    if (!this.get('addressModel').isEmpty()) _.extend(return_obj, this.get('addressModel').getPageApiDataAttrs());
    
    if (this.isBusiness()) {
      return_obj.bus_contact_first_name = this.get('firstNameModel').getData();
      return_obj.bus_contact_last_name = this.get('lastNameModel').getData();
      return_obj.first_name = null;
      return_obj.last_name = null;
    } else {
      return_obj.bus_contact_first_name = null;
      return_obj.bus_contact_last_name = null;
      return_obj.first_name = this.get('firstNameModel').getData();
      return_obj.last_name = this.get('lastNameModel').getData();
    }

    // Add unit type data, ensure type is casted back to Number for completeness checks on nav
    _.extend(return_obj, this.get('unitTypeModel').getPageApiDataAttrs());
    if (return_obj.unit_type) return_obj.unit_type = Number(return_obj.unit_type);

    const mailing_address_api_attrs = this.get('mailingAddressModel').getPageApiDataAttrs();
    if ($.trim(this.get('useMailModel').getData()) === '1') {
      // Clear out mailingAddress if using same mailing address
      _.extend(return_obj, _.mapObject(mailing_address_api_attrs, function() { return null; }));
      return_obj.mail_address_is_validated = false;
    } else { // Otherwise, add the mail model
      _.extend(return_obj, mailing_address_api_attrs);
    }

    if (!this.get('noPackageProvision')) {
      return_obj.package_delivery_method = this.get('hearingOptionsByModel').getData({ parse: true });
    }

    const knownContactValue = this.get('knownContactModel').getData({ parse: true });
    const participantModel = this.get('participantModel');
    
    // Manually clear out any invalid fields
    if (knownContactValue) {
      return_obj.no_email = false;
      if (!participantModel.hasContactAddress(knownContactValue)) {
        return_obj.address = null;
        return_obj.city = null;
        return_obj.province_state = null;
        return_obj.country = null;
        return_obj.postal_zip = null;
        return_obj.mail_address = null;
        return_obj.mail_city = null;
        return_obj.mail_province_state = null;
        return_obj.mail_country = null;
        return_obj.mail_postal_zip = null;
        return_obj.unit_text = null;
        return_obj.unit_type = null;
      }

      if (!participantModel.hasContactEmail(knownContactValue)) {
        return_obj.email = null;
      }

      if (!participantModel.hasContactPhone(knownContactValue)) {
        return_obj.primary_phone = null;
        return_obj.secondary_phone = null;
        return_obj.fax = null;
      }
    }

    return return_obj;
  },

  parse(response, options) {
    // NOTE: This needs to be overwritten in order to properly parse the "batch" response we have set up in the API
    const parsedResponse = _.isArray(response) && response.length === 1 ? response[0] : response;
    return Backbone.Model.prototype.parse.call(this, parsedResponse, options);
  },

  save(attrs, options) {
    return this.get('participantModel').save(attrs, options);
  },

  fetch(options) {
    return this.get('participantModel').fetch(options);
  }

});
