/**
 * @class core.components.address.AddressModel
 * @memberof core.components.address
 * @augments Backbone.Model
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import InputModel from '../input/Input_model';
import DropdownModel from '../dropdown/Dropdown_model';

const configChannel = Radio.channel('config');


const defaultStreetSubLabel = `Please ensure address is complete and indicate if unit is upper, lower or a basement suite if applicable eg. BSMT 1234 Fort Street`;

/**
 * @class AddressModel
 * @memberof core.components.address
 * @param {Boolean} [selectProvinceAndCountry] - If false= BC/Canada as default, true=province and country are selectable
 * @param {Boolean} [useSubLabel] - Turn on/off text label below address
 * @param {String} [streetSubLabel] - Text displayed below address if useSubLabel: true
 * @param {Boolean} [showUpdateControls] - Turn on/off display of "update" button
 * @param {Boolean} [useAddressValidation] - Whether or not to run address validation on address inputs once "Verify" is clicked
 * @param {Number} [addressIsValidated] - Api mapping to get/set passed in address validation key
 * @param {Boolean} [useCPToolBackup] - If true, it will give the option to use the native Canada Post tool if no address is found using Hive 1 tool
 * @param {JSON} [json]   Maps json fields to inputs and populates them
 * @param {String} [helpHtml] - Text to display in help '?' dropdown
 */
export default Backbone.Model.extend({

  defaults() {
    return {
      cssClass: null,
      name: 'address',
      selectProvinceAndCountry: false,
      useSubLabel: true,
      streetSubLabel: null,
      streetMaxLength: null,
      showUpdateControls: false,
      stepComplete: false, //TODO: unsed?
      json: null,
      helpName: null,
      helpHtml: null,
      useAddressValidation: false,
      addressIsValidated: null,
      useCPToolBackup: false,
      isOptional: false,

      apiMapping: null,

      geozone_id: configChannel.request('get', 'INVALID_GEOZONE_CODE')//TODO: unsed?
    };
  },

  initialize() {
    this.CITY_FIELD_MIN = configChannel.request('get', 'CITY_FIELD_MIN');
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.ADDRESS_FIELD_MIN = configChannel.request('get', 'ADDRESS_FIELD_MIN');
    this._ADDRESS_FIELD_MAX = this.get('streetMaxLength') || configChannel.request('get', 'ADDRESS_FIELD_MAX');
    this.POSTAL_CODE_FIELD_MAX = configChannel.request('get', 'POSTAL_CODE_FIELD_MAX');

    this.set('json', this.get('json') || {});
    this.initializeData();

    if (this.get('isOptional')) this.setToOptional();
  },

  initializeData() {
    const json = this.get('json') || {};
    this.unitType = json.unitType ? String(json.unitType) : null;
    this.unitText = json.unitText;

    this.createSubModels(json);
    this.setupListeners();
  },

  updateValues(newJson) {
    this.set('json', newJson);
    this.initializeData();
  },

  createSubModels(json) {
    const name = this.get('name');
    this.set('streetModel', new InputModel({
      allowedCharacters: InputModel.getRegex('address__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('address__restricted_chars'),
      name: name + '-street',
      labelText: 'Street Address',
      errorMessage: 'Address is required',
      required: true,
      minLength: this.ADDRESS_FIELD_MIN,
      maxLength: this._ADDRESS_FIELD_MAX,
      subLabel: this.get('useSubLabel') ? (this.get('streetSubLabel') || defaultStreetSubLabel) : null,
      value: json.street,
    }));

    this.set('cityModel', new InputModel({
      allowedCharacters: InputModel.getRegex('address__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('address__restricted_chars'),
      name: name + '-city',
      labelText: 'City',
      errorMessage: 'City is required',
      required: true,
      minLength: this.CITY_FIELD_MIN,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: json.city
    }));

    this.set('postalCodeModel', new InputModel(_.extend({
      name: name + '-postalcode',
      labelText: 'Postal Code',
      errorMessage: 'Postal Code is required',
      required: true,
      inputType: 'postal_code',
      maxLength: this.POSTAL_CODE_FIELD_MAX,
      value: json.postalCode,
      nonCanadaPostalCode: (json.country && json.country !== 'Canada')
    }, !this.get('useSubLabel') ? { subLabel: ' ' } : {} )));

    this.set('countryDropdownModel', new DropdownModel({
      name: name + '-country-dropdown',
      labelText: 'Country',
      errorMessage: 'Country is required',
      required: true,
      optionData: [{ value: 'Canada', text: 'Canada' },
      { value: 'Other', text: 'Other' }],
      value: (!json.country || json.country === 'Canada')? 'Canada' : 'Other' ,
    }));

    this.set('provinceDropdownModel', new DropdownModel({
      name: name + '-province-dropdown',
      labelText: 'Province',
      errorMessage: 'Province is required',
      required: true,
      optionData: _.map(configChannel.request('get', 'PROVINCES'), function(province) {
        return { value: province, text: province };
      }),
      value: (!json.province || json.country !== 'Canada')? 'British Columbia' : json.province,
    }));

    this.set('countryTextModel', new InputModel({
      allowedCharacters: InputModel.getRegex('address__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('address__restricted_chars'),
      name: name + '-country-text',
      labelText: 'Other Country',
      errorMessage: 'Other Country is required',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: (!json.country || json.country === 'Canada')? null : json.country
    }));

    this.set('provinceTextModel', new InputModel({
      allowedCharacters: InputModel.getRegex('address__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('address__restricted_chars'),
      name: name + '-country-text',
      labelText: 'Region, State or Province',
      errorMessage: 'Region, State or Province is required',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: (!json.country || json.country === 'Canada')? null : json.province
    }));

    

    this.set('addressIsValidated', !json.street ? null : json.addressIsValidated);
  },

  enableInputs(options={}) {
    const modelList = ['streetModel', 'cityModel', 'postalCodeModel', 'countryDropdownModel', 'countryTextModel', 'provinceTextModel', 'provinceDropdownModel'];
    modelList.forEach(modelName => {
      this.get(modelName).set('disabled', false);
    });
    if (options.render) this.trigger('render');
  },

  disableInputs(options={}) {
    const modelList = ['streetModel', 'cityModel', 'postalCodeModel', 'countryDropdownModel', 'countryTextModel', 'provinceTextModel', 'provinceDropdownModel'];
    modelList.forEach(modelName => {
      this.get(modelName).set('disabled', true);
    });
    if (options.render) this.trigger('render');
  },

  setToOptional() {
    const modelList = ['streetModel', 'cityModel', 'postalCodeModel', 'countryDropdownModel', 'countryTextModel', 'provinceTextModel', 'provinceDropdownModel'];
    _.each(modelList, function(modelName) {
      this.get(modelName).set({
        required: false
      });
    }, this);

    this.get('countryDropdownModel').set('defaultBlank', true);
    this.get('provinceDropdownModel').set('defaultBlank', true);
  },

  setToRequired() {
    const modelList = ['streetModel', 'cityModel', 'postalCodeModel', 'countryDropdownModel', 'countryTextModel', 'provinceTextModel', 'provinceDropdownModel'];
    _.each(modelList, function(modelName) {
      this.get(modelName).set({
        required: true
      });
    }, this);

    this.get('countryDropdownModel').set('defaultBlank', true);
    this.get('provinceDropdownModel').set('defaultBlank', true);
  },

  onCountryDropdownChange(model, value) {
    if (value === 'Other') {
      this.get('postalCodeModel').set({
        labelText: 'Zip or Postal Code',
        errorMessage: 'Zip or Postal Code is required',
        nonCanadaPostalCode: true
      });
    } else {
      this.get('postalCodeModel').set({
        labelText: 'Postal Code',
        errorMessage: 'Postal Code is required',
        nonCanadaPostalCode: false
      });
    }
    this.trigger('render');
  },

  setupListeners() {
    const modelList = ['streetModel', 'cityModel', 'postalCodeModel', 'countryDropdownModel'];

    this.listenTo(this.get('countryDropdownModel'), 'change:value', () => this.onCountryDropdownChange(...arguments));
    _.each(modelList, function(modelName) {
      this.listenTo(this.get(modelName), 'change:value', function() {
        this.trigger('change', this.model);
      }, this);
    }, this);
  },

  validate() {
    const error_obj = {},
      modelList = ['streetModel', 'cityModel', 'postalCodeModel', 'countryDropdownModel'];

    if (this.get('countryDropdownModel').get('value') === 'Other') {
      modelList.push('countryTextModel');
      modelList.push('provinceTextModel');
    } else {
      modelList.push('provinceDropdownModel');
    }

    if (this.get('selectProvinceAndCountry')) {
      // If use default, don't validate the province/countries
      _.each(['countryDropdownModel', 'provinceDropdownModel', 'countryTextModel', 'provinceTextModel'], function(modelName) {
        var index = modelList.indexOf(modelName);
        if (index !== -1) {
          modelList.splice(index, 1);
        }
      });
    }

    _.each(modelList, function(modelName) {
      if (!this.get(modelName).isValid()) {
        error_obj[modelName] = this.get(modelName).validationError;
      }
    }, this);

    if (!_.isEmpty(error_obj)) {
      return error_obj;
    }
  },

  isEmpty() {
    return !this.get('streetModel').get('value') && !this.get('cityModel').get('value') && !this.get('postalCodeModel').get('value');
  },

  _getAddressStringComponents(options) {
    options = options || {};
        
    let provinceString = 'British Columbia';
    if (!options.no_province) {
      provinceString = this.get('countryDropdownModel').get('value') === 'Other' ?
        this.get('provinceTextModel').get('value') : this.get('provinceDropdownModel').get('value');
    }
    
    let countryString;
    if (!options.no_country) {
      countryString = this.get('countryDropdownModel').get('value') === 'Other' ?
        this.get('countryTextModel').get('value') : this.get('countryDropdownModel').get('value');
    }

    return _.extend({
        street: $.trim(this.get('streetModel').getData()),
        city: $.trim(this.get('cityModel').get('value')),
        postal_code: $.trim(this.get('postalCodeModel').getData()),
      },
      options.no_province ? {} : { province: $.trim(provinceString) },
      options.no_country ? {} : { country: $.trim(countryString) }
    );
  },

  getGeozoneAddressString(options) {//TODO: unused?
    // Hardcode no province or country.  Should be changed if using Geozone elsewhere in system besides step1
    const order = ['street', 'city'];
    const address_components = this._getAddressStringComponents(options);
    
    let address_string = _.filter(_.map(order, function(key) {
      return _.has(address_components, key) ? address_components[key] : null;
    }), function(item) { return item; }).join(' ');

    if (address_components && address_components.postal_code) {
      address_string = `${address_string}, ${address_components.postal_code.replace(' ', '')}`;
    }
    return address_string;
  },

  getAddressString(options={}) {
    const order = ['street', 'city', 'province', 'country', 'postal_code'];
    const address_components = this._getAddressStringComponents(options);
    const unitTypeDisplay = options.no_unit ? null : this.getUnitTypeDisplay();

    return `${unitTypeDisplay ? `(${unitTypeDisplay}) ` : ''}${_.filter(_.map(order, function(key) {
      return _.has(address_components, key) ? address_components[key] : null;
    }), function(item) { return item; }).join(', ')}`;
  },

  getUnitTypeDisplay() {
    const RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    const RENT_UNIT_TYPE_DISPLAY = configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY') || {};
    const unitTypeDisplay = this.unitType && (
      this.unitType === RENT_UNIT_TYPE_OTHER ? this.unitText :
      _.has(RENT_UNIT_TYPE_DISPLAY, this.unitType) ? RENT_UNIT_TYPE_DISPLAY[this.unitType] : null
    );
    return unitTypeDisplay;
  },

  _model_mappings: [
    ['streetModel', 'street'],
    ['cityModel', 'city'],
    ['postalCodeModel', 'postalCode']
  ],
  getPageApiDataAttrs() {
    const return_obj = {};

    // Let API mapping be a variable that maps rental address fields to thier API names
    const apiMapping = _.extend({
      street: 'street',
      city: 'city',
      province: 'province',
      country: 'country',
      postalCode: 'postalCode',
      geozoneId: 'geozoneId',
      addressIsValidated: 'addressIsValidated'
    }, this.get('apiMapping'));


    _.each(this._model_mappings, function(mapping) {
      const mapping_name = (mapping.length === 2)? mapping[1] : mapping[0];
      return_obj[ apiMapping[mapping_name] ] = this.get(mapping[0]).getData();
    }, this);

    return_obj[apiMapping.province] = (this.get('countryDropdownModel').get('value') === 'Other') ?
      this.get('provinceTextModel').get('value') : this.get('provinceDropdownModel').get('value');
    return_obj[apiMapping.country] = (this.get('countryDropdownModel').get('value') === 'Other') ?
      this.get('countryTextModel').get('value') : this.get('countryDropdownModel').get('value');
    return_obj[apiMapping.geozoneId] = this.get('geozone_id');
    return_obj[apiMapping.addressIsValidated] = this.get('addressIsValidated')

    return return_obj;
  },

  getData() {
    return this.getPageApiDataAttrs();
  },

});
