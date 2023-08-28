/**
 * @class core.components.input.InputModel
 * @memberof core.components.input
 * @augments Backbone.Model
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';

//
const filename__restricted_chars = [',', '~', '#', '%', '{', '}', ';', '^', '`', '+', '<', '>', ':', '"', '“', '”', '‘', '’', '/', '\\', '|', '?', '*'];
// NOTE: This does not include special chars that are part of filename restricted chars
const special_chars = ['(', ')', '!', '@', '$', '&', '=', '[', ']', '_'];
const address_special_chars = ['&', '+', '/', ',', '(', ')', '#'];
const charArrayToRegexString = (charArray) => charArray.map(c => `\\${c}`).join('');

const typeRegex = {
  currency: /^\d+(\.\d{1,2})?$/,
  phone: /^[\(\)\-\.\s\d]{10,15}$/,
  phoneDigits: /^\d{10,15}$/,
  postal_code: /^[A-Za-z\d]{3}\s?[A-Za-z\d]{3}$/,
  zip_code: /^[A-Za-z\d\s\-]{5,15}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  dispute_number: /^[1-9]\d{7,8}$/,
  legacy_dispute_number: /^[1-9]\d{5,8}?$/,
  positive_integer: /^[1-9]\d*$/,
  access_code: /^[A-Za-z\d]{7}$/,
  dial_code: /^\d{7}#$/,
  whitespace__restricted_chars: '\\s',
  person_name__restricted_chars: `${charArrayToRegexString([...filename__restricted_chars, ...special_chars])}\\d`,
  filename__restricted_chars: charArrayToRegexString(filename__restricted_chars),
  address__restricted_chars: charArrayToRegexString([...filename__restricted_chars, ...special_chars].filter(function(c) { return this.indexOf(c) < 0; }, address_special_chars)),
  // Strip HTML characters by default
  html__restricted_chars: '\\<\\>',
  person_name__allowed_chars: /[^\w\-.\s\.]/ig,
  address__allowed_chars: /[^\w\-.\s\.\&\+\/\,\(\)\#]/ig,
  filename__allowed_chars: /[^\w\-.\s]/ig
};

const subLabels = {
  postal_code: 'eg. A1A 1A1',
  access_code: 'eg. A1b2c3d'
};

const sessionChannel = Radio.channel('session');
const _dateFormatData = 'YYYY-MM-DD';
const _dateFormatDisplay = 'MMM D, YYYY';
const _longDateFormatDisplay = 'ddd - MMM D, YYYY';
const _mobileDateFormat = 'YYYY-MM-DD';
const _isoTimeFormat = 'HH:mm';
const _displayTimeFormat = 'hh:mmA';
const getDateFormat = () => sessionChannel.request('is:mobile') ? _mobileDateFormat : _dateFormatDisplay;
const getLongDateFormat = () => sessionChannel.request('is:mobile') ? _mobileDateFormat : _longDateFormatDisplay;
const getTimeFormat = () => _displayTimeFormat;
const getTimeISOFormat = () => _isoTimeFormat;
const getRegex = (key) => key && typeRegex[key];

export default Backbone.Model.extend({
  defaults: {
    value: null,
    questionHtml: null,
    required: false,
    inputType: 'string',
    labelText: '',
    errorMessage: 'Input is required',
    disabled: false,
    cssClass: null,
    stepComplete: false,
    showValidate: false,
    autoAcceptFirstTouch: false,
    validateButtonWrap: false,
    warningValidator: null,
    isMobile: false,
    placeholder: null,
    subLabel: null,
    allowedCharacters: null,
    restrictedCharacters: null,
    replacementCharacters: null,
    maxLength: null,
    minLength: null,
    maxWords: null,
    maxNum: null,
    autofocus: false,
    nonCanadaPostalCode: false,
    allowZeroAmount: false,
    autocomplete: true,
    helpName: null,
    helpHtml: null,
    customLink: null,
    customLinkFn: null,
    secondCustomLink: null,
    secondCustomLinkFn: null,
    allowFutureDate: false,
    minDate: null,
    maxDate: null,
    showYearDate: true,
    yearRange: null,
    minTime: null,
    maxTime: null,
    minNum: null,
    maxNum: null,
    restrictHtml: true,
    restrictedStrings: null,
    clearWhenHidden: false,
    apiMapping: null
  },

  isTime() {
    return this.get('inputType') === 'time';
  },

  isDate() {
    return this.get('inputType') === 'date';
  },

  isCurrency() {
    return this.get('inputType') === 'currency';
  },

  getParsedDate() {
    const val = this.get('value');
    if (val === null || /^0001-01-01T00:00:00/.test(val)) {
      return null;
    }

    if (Moment(val, Moment.ISO_8601).isValid()) {
      return Moment(val).format(getDateFormat());
    } else {
      console.log(`[Warning] date ${val} is not in ISO format`, this);
      return val;
    }
  },

  getParsedAmount() {
    const amount = parseFloat(this.get('value'));
    return String(amount).indexOf('.') !== -1 ? amount.toFixed(2) : !_.isNaN(amount) ? amount : null;
  },

  _setupDates() {
    // Add lookup values to the model
    this.set({
      isMobile: sessionChannel.request('is:mobile'),
      getDateFormat,
      getLongDateFormat,
    });
    
    // Add date validation.  Non-mobile date validation format supports optional day of week (long day format)
    typeRegex.date = this.get('isMobile') ? /^\d{4}-\d{2}-\d{2}$/ : /^([A-z]{3} - )?[A-z]{3} [1-3]?\d, [1,2]\d{3}$/;
  },

  initialize() {
    Backbone.Model.prototype.initialize.call(this, ...arguments);

    // Initialize the date logic
    this._setupDates();

    // Initiailize and parse the default value based on the input type
    this.set('value', this.isDate() ? this.getParsedDate() :
        this.isCurrency() ? this.getParsedAmount() :
        this.get('value'), {silent: true});

    // Initialize correct subLabel based on type
    this.on('change:inputType', this.setDefaultSubLabel);
    this.setDefaultSubLabel(true);

    // Initialize the default class
    this.setDefaultCssClass();
  },

  setDefaultSubLabel(no_overwrite) {
    if (no_overwrite && this.get('subLabel')) {
      return;
    }
    const inputType = this.get('inputType');
    this.set('subLabel', _.has(subLabels, inputType) ? subLabels[inputType] : '');
  },

  setDefaultCssClass() {
    const inputTypeToClassName = {
      date: 'input-component-date',
      time: 'input-component-time',
      currency: 'input-component-currency',
      dispute_number: 'input-component-filenumber',
      legacy_dispute_number: 'input-component-filenumber',
      email: 'input-component-email',
      phone: 'input-component-phone',
      postal_code: 'input-component-postalcode'
    };

    const inputType = this.get('inputType');
    if (_.has(inputTypeToClassName, inputType)) {
      this.set('cssClass', `${this.get('cssClass') || ''} ${inputTypeToClassName[inputType]}`);
    }
  },

  // Does not reset to any API value
  clearModelValue() {
    this.trigger('update:input', null, { update_saved_value: true });
  },

  applyCharacterRestrictions(value) {
    let replaced_value = value;
    if (this.get('replacementCharacters')) {
      _.each(this.get('replacementCharacters'), function(replace_string, to_replace) {
        const character_replaced_value = replaced_value.replace(new RegExp('['+to_replace+']', 'g'), replace_string);
        if (value !== character_replaced_value) {
          replaced_value = character_replaced_value;
        }
      }, this);
    }

    const allRestrictedChars = [].concat(this.get('restrictedCharacters') || [], this.get('restrictHtml') ? typeRegex.html__restricted_chars : []);
    if (allRestrictedChars.length) {
      replaced_value = replaced_value.replace(new RegExp(`[${allRestrictedChars}]`, 'g'), '');
    }

    if (this.get('allowedCharacters')) {
      replaced_value = replaced_value.replace(new RegExp(this.get('allowedCharacters')), '');
    }

    return replaced_value;
  },

  validate(attrs) {
    attrs.value = (attrs.value === null || _.isNaN(attrs.value)) ? '' : attrs.value;
    if (attrs.required === true && $.trim(attrs.value) === '') {
      return attrs.errorMessage;
    } else if(attrs.value !== '' && attrs.inputType === 'date') {

      if (!typeRegex.date.test(attrs.value)) {
        this.set('stepComplete', false);
        return `Please use date format ${getDateFormat()}`;
      }

      if (!attrs.allowFutureDate && Moment(attrs.value, getDateFormat()).isAfter( Moment(), 'days')) {
        this.set('stepComplete', false);
        return 'Please select a past date';
      }

      if (attrs.minDate && Moment(attrs.minDate).isValid() && Moment(attrs.value, getDateFormat()).isBefore(attrs.minDate, 'days')) {
        this.set('stepComplete', false);
        return `Date cannot be before ${Moment(attrs.minDate).format(getDateFormat())}`;
      }

      if (attrs.maxDate && Moment(attrs.maxDate).isValid() && Moment(attrs.value, getDateFormat()).isAfter(attrs.maxDate, 'days')) {
        this.set('stepComplete', false);
        return `Date cannot be after ${Moment(attrs.maxDate).format(getDateFormat())}`;
      }

    } else if(attrs.value !== '' && attrs.inputType === 'time') {
      const timeMoment = Moment(attrs.value, getTimeFormat());
      if (!timeMoment.isValid()) {
        return `Please use time format ${getTimeFormat()}`;
      }
      if (attrs.maxTime) { 
        const maxTimeMoment = Moment(attrs.maxTime, getTimeFormat());
        if (!maxTimeMoment.isValid() || timeMoment.isAfter(maxTimeMoment, 'minutes')) {
          this.set('stepComplete', false);
          return `Time cannot be after ${maxTimeMoment.format(getTimeFormat())}`;
        }
      }

      if (attrs.minTime) { 
        const minTimeMoment = Moment(attrs.minTime, getTimeFormat());
        if (!minTimeMoment.isValid() || timeMoment.isBefore(minTimeMoment, 'minutes')) {
          this.set('stepComplete', false);
          return `Time cannot be before ${minTimeMoment.format(getTimeFormat())}`;
        }
      }
    } else if(attrs.value !== '' && attrs.inputType === 'currency') {
      if (!typeRegex.currency.test(attrs.value)) {
        this.set('stepComplete', false);
        return 'Please enter a dollar amount like 24.99';
      } else {
        const floatVal = parseFloat(attrs.value);
        const maxNum = Number(attrs.maxNum);
        if (floatVal <= 0 && !attrs.allowZeroAmount) {
          this.set('stepComplete', false);
          return 'Please enter a dollar amount greater than 0';
        } else if (maxNum > 0 && floatVal > maxNum) {
          this.set('stepComplete', false);
          return `Please enter less than ${maxNum}`;
        }
      }
    } else if(attrs.value !== '' && attrs.inputType === 'phone') {
      const strippedValue = (attrs.value || '').replace(/\D/g,'');
      if (!typeRegex.phone.test(attrs.value) || !typeRegex.phoneDigits.test(strippedValue)) {
        this.set('stepComplete', false);
        return 'Please enter a valid phone number eg. 111-222-3333'
      }
    } else if(attrs.value !== '' && attrs.inputType === 'postal_code') {
      const regexToUse = attrs.nonCanadaPostalCode ? typeRegex.zip_code : typeRegex.postal_code;

      if (!regexToUse.test(attrs.value)) {
        this.set('stepComplete', false);
        return `Please enter a valid ${attrs.nonCanadaPostalCode ? 'zip' : 'postal'} code`;
      }
    } else if(attrs.value !== '' && attrs.inputType === 'email' && !typeRegex.email.test(attrs.value)) {
      this.set('stepComplete', false);
      return 'Please enter a valid email address';
    } else if(attrs.value !== '' && attrs.inputType === 'dispute_number' && !typeRegex.dispute_number.test(attrs.value)) {
      this.set('stepComplete', false);
      return 'Invalid file number';
    } else if(attrs.value !== '' && attrs.inputType === 'legacy_dispute_number' && !typeRegex.legacy_dispute_number.test(attrs.value)) {
      this.set('stepComplete', false);
      return 'Invalid file number';
    } else if (attrs.value !== '' && attrs.inputType === 'positive_integer') {
      if (!typeRegex.positive_integer.test(attrs.value) || (Number(attrs.value) === 0 && !attrs.allowZeroAmount)) {
        this.set('stepComplete', false);
        return 'Please enter a number greater than 0';
      }
      if (Number.isInteger(attrs?.minNum) && Number(attrs.minNum) > Number(attrs.value)) {
        this.set('stepComplete', false);
        return `Please enter a number greater than ${attrs.minNum}`;
      } else if (Number.isInteger(attrs?.maxNum) && Number(attrs.maxNum) < Number(attrs.value)) {
        this.set('stepComplete', false);
        return `Please enter a number less than ${attrs.maxNum}`;
      }
    } else if(attrs.value !== '' && attrs.inputType === 'access_code' && !typeRegex.access_code.test(attrs.value)) {
      this.set('stepComplete', false);
      return 'Invalid access code';
    } else if (attrs.value !== '' && attrs.inputType === 'dial_code' && !typeRegex.dial_code.test(attrs.value)) {
      this.set('stepComplete', false);
      return 'Invalid dial code';
    } else if(attrs.minLength && attrs.value && attrs.value.length < attrs.minLength) {
      this.set('stepComplete', false);
      return 'Please enter at least ' + attrs.minLength + ' characters';
    } else if (attrs.maxLength && attrs.value && attrs.value.length > attrs.maxLength) {
      this.set('stepComplete', false);
      return 'Please enter ' + (attrs.maxLength) + ' characters or fewer';
    } else if (attrs.maxWords && $.trim(attrs.value).split(/\s+/).length > attrs.maxWords) {
      this.set('stepComplete', false);
      return 'Please enter ' + (attrs.maxWords) + ' words or fewer';
    }

    const restricted_strings = this.get('restrictedStrings');
    if (attrs.value) {
      // Check for prohibited values
      if (restricted_strings && restricted_strings.values && restricted_strings.errorMessage) {
        if ($.trim(attrs.value).indexOf(restricted_strings.values) >= 0) {
          this.set('stepComplete', false);
          return restricted_strings.errorMessage;
        }
      }
    }
  },

  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'value',
      return_obj = {};
    return_obj[mapping_attr] = this.getData();
    return return_obj;
  },

  getData(options) {
    options = options || {};
    const val = this.get('value');
    let parsed_value;
    if (this.isTime() && val) {
      parsed_value = options.iso ? Moment(val, getTimeFormat()).format(_isoTimeFormat) : val;
    } else if (this.isDate() && val) {
      // Use duck-typing to detect long vs regular date
      parsed_value = Moment(val, getDateFormat());
      if (!parsed_value.isValid()) {
        parsed_value = Moment(val, getLongDateFormat());
      }
      parsed_value = options.format === 'date' ? parsed_value.format(_dateFormatData) : parsed_value.toISOString();
    } else if (this.isCurrency() && val) {
      parsed_value = parseFloat(val);
      if (_.isNaN(parsed_value)) {
        parsed_value = val;
      }
    } else if (val === "") {
      parsed_value = null;
    } else {
      parsed_value = val;
    }
    return parsed_value;
  }

}, {
  // Class variable for external access
  getDateFormat,
  getLongDateFormat,
  getTimeFormat,
  getTimeISOFormat,
  getRegex
});
