/**
 * @class core.components.participant.ParticipantModel
 * @memberof core.components.participant
 * @augments core.components.model.CMModel
 */
import Backbone from 'backbone';
import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import Formatter from '../formatter/Formatter';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');

const api_name = 'parties/participant';
const KNOWN_CONTACT_CODES_WITH_ADDRESS = [1,2,3,5];
const KNOWN_CONTACT_CODES_WITH_EMAIL = [1,3,4,6];
const KNOWN_CONTACT_CODES_WITH_PHONE = [1,2,4,7];

export default CMModel.extend({
  idAttribute: 'participant_id',

  defaults: {
    participant_id: null,
    // Api field names
    participant_type: null,
    participant_status: null,
    access_code: null,
    bus_name: null,
    bus_contact_first_name: null,
    bus_contact_last_name: null,
    name_abbreviation: null,
    first_name: null,
    last_name: null,
    accepted_tou: null,
    accepted_tou_date: null,
    known_contact_fields: null,
    email: null,
    email_verified: null,
    no_email: null,
    primary_phone: null,
    primary_phone_ext: null,
    primary_phone_type: null,
    primary_phone_verified: null,
    secondary_phone: null,
    secondary_phone_ext: null,
    secondary_phone_type: null,
    secondary_phone_verified: null,
    fax: null,
    package_delivery_method: null,
    primary_contact_method: null,
    secondary_contact_method: null,
    decision_delivery_method: null,
    unit_text: null,
    unit_type: null,
    address: null,
    address_is_validated: null,
    city: null,
    province_state: null,
    country: null,
    postal_zip: null,
    mail_address: null,
    mail_address_is_validated: null,
    mail_city: null,
    mail_province_state: null,
    mail_country: null,
    mail_postal_zip: null,
    is_amended: null,
    is_sub_service: null, 

    created_by: null,
    created_date: null,
    modified_by: null,
    modified_date: null,

    // Api fields from ClaimGroupParticipant, but we'll fill this from disputeclaimgroupparticipants API call when ParticipantModels are created
    group_participant_role: null,
    group_participant_id: null,

    apiMapping: null,
  },

  API_SAVE_ATTRS: [
    // Api field names
    'participant_type',
    'participant_status',
    'bus_name',
    'bus_contact_first_name',
    'bus_contact_last_name',
    'first_name',
    'last_name',
    'accepted_tou',
    'accepted_tou_date',
    'known_contact_fields',
    'email',
    'no_email',
    'primary_phone',
    'primary_phone_ext',
    'primary_phone_type',
    'primary_phone_verified',
    'secondary_phone',
    'secondary_phone_ext',
    'secondary_phone_type',
    'secondary_phone_verified',
    'fax',
    'package_delivery_method',
    'primary_contact_method',
    'secondary_contact_method',
    'decision_delivery_method',
    'unit_text',
    'unit_type',
    'address',
    'address_is_validated',
    'city',
    'province_state',
    'country',
    'postal_zip',
    'mail_address',
    'mail_address_is_validated',
    'mail_city',
    'mail_province_state',
    'mail_country',
    'mail_postal_zip',
    'is_amended',
    'is_sub_service'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew()? `/${disputeChannel.request('get').get('dispute_guid')}` : '');
  },

  initialize() {
    CMModel.prototype.initialize.call(this, ...arguments);
  },

  getInitialsDisplay() {
    return `${(this.get('name_abbreviation')||'').trim()}`;
  },

  getContactName() {
    const fields_to_use = this.isBusiness() ? ['bus_contact_first_name', 'bus_contact_last_name'] : ['first_name', 'last_name'];
    if (_.all(fields_to_use, function(field) { return !this.get(field); }, this)) {
      console.log(`[Error] Unable to find expected contact name display values for participant ${this.id}`, this.toJSON(), this);
      return String(this.id) || '';
    }
    return `${this.get(fields_to_use[0])} ${this.get(fields_to_use[1])}`;
  },

  getDisplayName() {
    // Returns the  Business name, person's name, or an abbreviation if in private mode
    if (this.isBusiness()) {
      return this.get('bus_name') ? this.get('bus_name') : this.getInitialsDisplay();
    } else {
      return this.get('first_name') && this.get('last_name') ? (`${this.get('first_name')} ${this.get('last_name')}`) : this.getInitialsDisplay();
    }
  },

  getAmendmentTypeDisplay() {
    const AMENDMENT_PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'AMENDMENT_PARTICIPANT_TYPE_DISPLAY'),
      participant_type = this.get('participant_type');
    return _.has(AMENDMENT_PARTICIPANT_TYPE_DISPLAY, participant_type) ? AMENDMENT_PARTICIPANT_TYPE_DISPLAY[participant_type] : participant_type;
  },

  getTypeDisplay() {
    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY'),
      participant_type = this.get('participant_type');
    return _.has(PARTICIPANT_TYPE_DISPLAY, participant_type) ? PARTICIPANT_TYPE_DISPLAY[participant_type] : participant_type;
  },

  getNameContactDisplay() {
    let participantString = '';
    participantString += `${this.getDisplayName()}${this.isBusiness() ? `, ${this.getContactName()}` : ''}`;

    const optionalParts = [this.get('email'), this.get('primary_phone')].filter(part => part);
    participantString += `${optionalParts.length? ', ' : ''}${optionalParts.join(', ')}`;

    return `${this.getTypeDisplay()}: ${participantString}`;
  },

  getAddressString(options = {}) {
    return [
      ...options.withoutAddress ? [] : [$.trim(this.get('address'))],
      $.trim(this.get('city')),
      $.trim(this.get('province_state')),
      $.trim(this.get('country')),
      $.trim(this.get('postal_zip'))
    ].join(', ');
  },

  getStreetAddressString() {
    const unitTypeToDisplay = this.getParticipantUnitTypeDisplay();
    return [
      ...(unitTypeToDisplay ? [`(${unitTypeToDisplay})`] : []),
      $.trim(this.get('address')),
      $.trim(this.get('city')),
      $.trim(this.get('postal_zip'))
    ].join(', ');
  },

  getCityCountryPostalString() {
    return [
      $.trim(this.get('city')),
      $.trim(this.get('country')),
      $.trim(this.get('postal_zip'))
    ].join(', ');
  },

  getMailingAddressString() {
    return [
      $.trim(this.get('mail_address')),
      $.trim(this.get('mail_city')),
      $.trim(this.get('mail_province_state')),
      $.trim(this.get('mail_country')),
      $.trim(this.get('mail_postal_zip'))
    ].join(', ');
  },

  getParticipantUnitTypeDisplay() {
    return Formatter.toUnitTypeDisplay(this.get('unit_type'), this.get('unit_text'));
  },

  getAddressStringWithUnit() {
    const unitTypeToDisplay = this.getParticipantUnitTypeDisplay();
    return `${unitTypeToDisplay ? `(${unitTypeToDisplay}) ` : ''}${this.getAddressString()}`;
  },

  createDefaultApiMappings() {
    this.set('apiMapping', {
      participantTypeModel: 'participant_type',
      businessNameModel: 'bus_name',
      emailModel: 'email',
      daytimePhoneModel: 'primary_phone',
      otherPhoneModel: 'secondary_phone',
      faxPhoneModel: 'fax'
    });
  },

  setDeleted() {
    this.set('participant_status', configChannel.request('get', 'PARTICIPANT_STATUS_DELETED'));
  },

  setAmendedRemoved() {
    this.set({
      is_amended: true,
      participant_status: configChannel.request('get', 'PARTICIPANT_STATUS_REMOVED')
    });
  },

  setAmended() {
    this.set('is_amended', true);
  },

  isLandlord() {
    return participantsChannel.request('is:landlord', this);
  },

  isTenant() {
    return participantsChannel.request('is:tenant', this);
  },

  isApplicant() {
    return participantsChannel.request('is:applicant', this);
  },

  isRespondent() {
    return participantsChannel.request('is:respondent', this);
  },

  isPrimary() {
    return participantsChannel.request('is:primary', this);
  },

  isRemoved() {
    return this.isAmendRemoved() || this.isDeleted();
  },

  isDeleted() {
    return this.get('participant_status') === configChannel.request('get', 'PARTICIPANT_STATUS_DELETED');
  },

  isAmendRemoved() {
    return this.get('participant_status') === configChannel.request('get', 'PARTICIPANT_STATUS_REMOVED')
  },

  isAmendRemoved() {
    return this.get('participant_status') === configChannel.request('get', 'PARTICIPANT_STATUS_REMOVED');
  },

  isAmended() {
    return this.get('is_amended');
  },

  hasSubstitutedService() {
    return this.get('is_sub_service');
  },

  isBusiness() {
    return this.get('participant_type') === configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS');
  },

  isAssistant() {
    const assistant_type_keys = ['PARTICIPANT_TYPE_AGENT_OR_LAWYER', 'PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT'];
    return _.any(assistant_type_keys, function(key) {
      return String(this.get('participant_type')) === String(configChannel.request('get', key));
    }, this);
  },

  isPersonOrBusiness() {
    return this.get('participant_type') === configChannel.request('get', 'PARTICIPANT_TYPE_PERSON') || this.isBusiness();
  },

  hasMailAddress() {
    return this.get('mail_address') && this.get('mail_city');
  },

  mergeHintsWithFields() {
    const fieldToHintMappings = {
      email: 'email_hint',
      access_code: 'access_code_hint',
      primary_phone: 'primary_phone_hint',
      fax: 'fax_hint',
      secondary_phone: 'secondary_phone_hint'
    };
    //
    
    const changes = {};
    _.each(fieldToHintMappings, function(hintKey, fieldKey) {
      const hintValue = this.get(hintKey);
      if (hintValue && !this.get(fieldKey)) {
        changes[fieldKey] = hintValue;
      }
    }, this);

    if (this.get('email_address_hint') && !this.get('email')) {
      changes.email = this.get('email_address_hint');
    }

    if (this.get('access_code')) {
      // Always use the hint in access code for privacy
      changes.access_code = this.get('access_code_hint');
      // Save real access code in private-style variable
      changes._access_code = this.get('access_code');
    }
    
    this.set(changes, { silent: true });
  },

  getPageApiDataAttrs() {

    const return_obj = CMModel.prototype.getPageApiDataAttrs.call(this);

    // Clear fields if it is business
    if (this.isBusiness()) {
      return_obj.first_name = null;
      return_obj.last_name = null;
    } else {
      return_obj.bus_contact_first_name = null;
      return_obj.bus_contact_last_name = null;
    }
    return return_obj;
  },

  parse(response, options) {
    // NOTE: This needs to be overwritten in order to properly parse the "batch" response we have set up in the API
    const parsedResponse = _.isArray(response) && response.length === 1 ? response[0] : response;
    return Backbone.Model.prototype.parse.call(this, parsedResponse, options);
  },

  save(attrs, options) {
    return CMModel.prototype.save.call(this, attrs, _.extend({}, options, { singleton_batch: true }));
  },
  
  fetch(options) {
    return CMModel.prototype.fetch.call(this, _.extend({}, options, { singleton_batch: true }));
  },

  hasDeliveryByEmail() {
    return this.get('package_delivery_method') === configChannel.request('get', 'SEND_METHOD_EMAIL');
  },

  hasDeliveryByPickup() {
    return this.get('package_delivery_method') === configChannel.request('get', 'SEND_METHOD_PICKUP');
  },

  hasDecisionDeliveryByEmail() {
    return !this.get('decision_delivery_method') || this.get('decision_delivery_method') === configChannel.request('get', 'SEND_METHOD_EMAIL');
  },

  hasPrimaryContactEmail() {
    return this.get('primary_contact_method') && this.get('primary_contact_method') === configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL');
  },

  hasSecondaryContactEmail() {
    return this.get('secondary_contact_method') && this.get('secondary_contact_method') === configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL');
  },

  getMessageRecipientDisplayHtml(options={}) {
    const pickupIcon = (this.hasDeliveryByPickup() || !this.get('email')) && !options.no_pickup ? `<span class="participant-icon-pickup"></span>` : '';
    const emailIcon = this.get('email') ? `<span class="participant-icon-email"></span>` : '';
    const pickupIconsDisplay = `${pickupIcon}${emailIcon}${pickupIcon||emailIcon?'&nbsp':''}`;
    const emailDisplay = this.get('email') ? `<a href="mailto:${this.get('email')}">${this.get('email')}</a>` : '<i>no email</i>';
    return `<div class="participant-recipient-display">
      ${options.no_icons?'':pickupIconsDisplay}${this.getContactName()} (${this.isLandlord() ? 'Landlord' : 'Tenant'})${
        options.no_email?'':`: ${emailDisplay}`}
    </div>`;
  },
  
  _hasContactInfo(contactValues=[], overrideValue=null) {
    const knownContactValue = overrideValue || this.get('known_contact_fields');
    return knownContactValue && contactValues.indexOf(knownContactValue) !== -1;
  },

  hasContactAddress(overrideValue) {
    return this._hasContactInfo(KNOWN_CONTACT_CODES_WITH_ADDRESS, overrideValue);
  },

  hasContactEmail(overrideValue) {
    return this._hasContactInfo(KNOWN_CONTACT_CODES_WITH_EMAIL, overrideValue);
  },

  hasContactPhone(overrideValue) {
    return this._hasContactInfo(KNOWN_CONTACT_CODES_WITH_PHONE, overrideValue);
  },

});
