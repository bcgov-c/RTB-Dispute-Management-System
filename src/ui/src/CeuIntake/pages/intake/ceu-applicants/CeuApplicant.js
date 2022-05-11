
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageItemView from '../../../../core/components/page/PageItem';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import AddressModel from '../../../../core/components/address/Address_model';
import AddressView from '../../../../core/components/address/Address';
import EmailView from '../../../../core/components/email/Email';
import './CeuApplicant.scss';

const EMPTY_BDAY_ERROR = `Enter the correct date of birth for the respondent, if you do not know it click 'No' above`;

const CONTACT_TYPES_ADDRESS = [1,2,4,5];
const CONTACT_TYPES_EMAIL = [1,3,4,6];
const CONTACT_TYPES_PHONE = [1,2,3,7];
const PARTICIPANT_TYPES_BUSINESS_NAME = [2,3,4,5,6,7];

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');

const CeuApplicant = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['baseName', 'contactInfoName', 'participantTypes', 'enableBirthday', 'enableDelete', 'showNameWarning']);
    
    this.CEU_PARTICIPANT_TYPE_DISPLAYS = configChannel.request('get', 'CEU_PARTICIPANT_TYPE_DISPLAYS') || {};
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.PHONE_FIELD_MAX = configChannel.request('get', 'PHONE_FIELD_MAX');
    this.BUSINESS_NAME_MAX_NUM_WORDS = configChannel.request('get', 'BUSINESS_NAME_MAX_NUM_WORDS');

    this.template = this.template.bind(this);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const typeOptions = (this.participantTypes||[]).map(t => ({ value: t, text: this.CEU_PARTICIPANT_TYPE_DISPLAYS[t] }));
    this.typeRadioModel = new RadioModel({
      optionData: typeOptions || [],
      required: true,
      value: this.model.get('p_participant_type'),
      apiMapping: 'p_participant_type',
    });

    this.contactTypeModel = new DropdownModel({
      optionData: [
        { value: "1", text: 'Address, Email and Phone' },
        { value: "2", text: 'Address and Phone' },
        { value: "3", text: 'Email and Phone' },
        { value: "4", text: 'Address and Email' },
        { value: "5", text: 'Address Only' },
        { value: "6", text: 'Email Only' },
        { value: "7", text: 'Phone Only' },
        { value: "8", text: 'No Contact Information' }
      ],
      defaultBlank: true,
      required: true,
      value: this.model.get('p_contact_info_selection') ? String(this.model.get('p_contact_info_selection')) : null,
      apiMapping: 'p_contact_info_selection',
    });

    this.otherTitleModel = new InputModel({
      inputType: 'text',
      labelText: 'Short title for who you represent',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('p_participant_type_text'),
      apiMapping: 'p_participant_type_text',
    });
    
    this.businessNameModel = new InputModel({
      name: this.cid + '-businessname',
      labelText: 'Name of Business / Company / Agency',
      required: true,
      minLength: configChannel.request('get', 'BUSINESS_NAME_MIN_LENGTH'),
      maxLength: this.APPLICANT_FIELD_MAX,
      maxWords: this.BUSINESS_NAME_MAX_NUM_WORDS,
      value: this.model.get('p_business_name'),
      apiMapping: 'p_business_name',
    });

    this.firstNameModel = new InputModel({
      name: this.cid + '-firstname',
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'First Name',
      errorMessage: 'First Name is required',
      required: true,
      subLabel: 'Ensure the legal name is entered',
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('p_business_contact_first_name') || this.model.get('p_first_name'),
      apiMapping: 'p_first_name',
    });

    this.lastNameModel = new InputModel({
      name: this.cid + '-lastname',
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'Last Name',
      errorMessage: 'Last Name is required',
      required: true,
      subLabel: 'Ensure the legal name is entered',
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('p_business_contact_last_name') || this.model.get('p_last_name'),
      apiMapping: 'p_last_name',
    });

    const participantAddressApiMappings = {
      street: 'p_address',
      city: 'p_city',
      postalCode: 'p_postal_zip',
      country: 'p_country',
      province: 'p_province_state',
    };

    this.addressModel = new AddressModel({
      json: _.mapObject(participantAddressApiMappings, function(val) { return this.model.get(val); }, this),
      apiMapping: participantAddressApiMappings,
      name: this.cid + '-address',
      useDefaultProvince: false,
      streetMaxLength: configChannel.request('get', 'PARTICIPANT_ADDRESS_FIELD_MAX')
    });

    this.useMailModel = new DropdownModel({
      optionData: [{value: '1', text: 'Yes'},
          { value: '0', text: 'No'}],
      value: this.model.hasMailAddress() ? '0' : '1'
    });

    const participantMailingAddressApiMappings = {
      street: 'p_mail_address',
      city: 'p_mail_city',
      postalCode: 'p_mail_postal_zip',
      country: 'p_mail_country',
      province: 'p_mail_province_state'
    };

    this.mailingAddressModel = new AddressModel({
      name: this.cid + '-mailing-address',
      useDefaultProvince: false,
      json: _.mapObject(participantMailingAddressApiMappings, function(val) { return this.model.get(val); }, this),
      apiMapping: participantMailingAddressApiMappings,
    });
    // Add text 'Mail' to each model with a labelText on address
    Object.keys(this.mailingAddressModel.attributes).forEach(attr => {
      const mailAddressSubmodel = this.mailingAddressModel.get(attr);
      if (mailAddressSubmodel && mailAddressSubmodel instanceof Backbone.Model) {
        const labelText = mailAddressSubmodel.get('labelText');
        if (labelText) {
          mailAddressSubmodel.set('labelText', 'Mail ' + labelText);
        }
      }
    });

    this.emailModel = new InputModel({
      labelText: 'Email Address',
      //cssClass: optionalEmail ? 'optional-input' : null,
      errorMessage: 'Email is required',
      inputType: 'email',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('p_email'),
      apiMapping: 'p_email'
    });

    this.daytimePhoneModel = new InputModel({
      inputType: 'phone',
      labelText: 'Daytime Phone',
      //cssClass: optionalPhone ? 'optional-input' : null,
      errorMessage: 'Daytime phone is required',
      required: true,
      maxLength: this.PHONE_FIELD_MAX,
      value: this.model.get('p_primary_phone'),
      apiMapping: 'p_primary_phone'
    });

    this.otherPhoneModel = new InputModel({
      inputType: 'phone',
      labelText: 'Other Phone',
      cssClass: 'optional-input',
      required: false,
      maxLength: this.PHONE_FIELD_MAX,
      value: this.model.get('p_secondary_phone'),
      apiMapping: 'p_secondary_phone',
    });

    this.hasBirthdayModel = new RadioModel({
      optionData: [
        { text: 'No', value: 0 },
        { text: 'Yes', value: 1 },
      ],
      displayTitle: `Do you have this respondent's date of birth so that we can validate their legal name and address?`,
      required: true,
      value: this.model.isNew() ? null : (this.model.get('p_birth_date') ? 1 : 0),
    });

    this.birthdayModel = new InputModel({
      inputType: 'date',
      labelText: 'Respondent Birthday',
      errorMessage: EMPTY_BDAY_ERROR,
      yearRange: '1900:+00',
      showValidate: true,
      required: true,
      value: this.model.get('p_birth_date') ? Moment(this.model.get('p_birth_date')).format(InputModel.getDateFormat()) : null,
      apiMapping: 'p_birth_date'
    });
  },

  isTypeAgentSelected() {
    return this.typeRadioModel.getData({ parse: true }) === configChannel.request('get', 'CEU_PARTICIPANT_TYPE_AGENT');
  },

  shouldShowBusinessName() {
    return PARTICIPANT_TYPES_BUSINESS_NAME.indexOf(this.typeRadioModel.getData({ parse: true })) !== -1;
  },

  shouldShowOtherTitle() {
    return this.typeRadioModel.getData({ parse: true }) === configChannel.request('get', 'CEU_PARTICIPANT_TYPE_OTHER');
  },

  shouldShowAddress() {
    return CONTACT_TYPES_ADDRESS.indexOf(this.contactTypeModel.getData({ parse: true })) !== -1;
  },

  shouldShowEmail() {
    return CONTACT_TYPES_EMAIL.indexOf(this.contactTypeModel.getData({ parse: true })) !== -1;
  },

  shouldShowPhone() {
    return CONTACT_TYPES_PHONE.indexOf(this.contactTypeModel.getData({ parse: true })) !== -1;
  },

  setupListeners() {
    this.listenTo(this.typeRadioModel, 'change:value', () => this.render());
    this.listenTo(this.contactTypeModel, 'change:value', () => {
      this.model.trigger('contact:changed');
      this.render();
    });


    this.listenTo(this.useMailModel, 'change:value', this.onUseMailChange);
    this.listenTo(this.hasBirthdayModel, 'change:value', () => {
      this.invalidDateError = null;
      this.render();
    });

    if (this.model.collection) {
      // Any time a model is added or removed, refresh all views in collection to ensure correct header numbering
      this.listenTo(this.model.collection, 'update', () => this.render());
    }
  },

  onUseMailChange(model, value) {
    const mailingAddressViewEle = this.getChildView('mailingAddressRegion').$el;
    if (model.previous('value') === '1' && value === '0') {
      // To show mail mailingaddresses
      animationChannel.request('queue', mailingAddressViewEle, 'slideDown');
      animationChannel.request('queue', mailingAddressViewEle, 'scrollPageTo');
    } else if (model.previous('value') === '0' && value === '1') {
      animationChannel.request('queue', mailingAddressViewEle, 'slideUp');
    }
  },

  toNonBusiness() {
    this.firstNameModel.set({
      labelText: 'First Name',
      apiMapping: 'p_first_name',
    });
    this.lastNameModel.set({
      labelText: 'Last Name',
      apiMapping: 'p_last_name',
    });
    this.addressModel.get('streetModel').set({labelText: 'Street Address'});
    this.emailModel.set({labelText: 'Email Address'});
    this.daytimePhoneModel.set({labelText: 'Daytime Phone'});
  },

  toBusiness() {
    this.firstNameModel.set({
      labelText: 'Business Contact First Name',
      apiMapping: 'p_business_contact_first_name',
    });
    this.lastNameModel.set({
      labelText: 'Business Contact Last Name',
      apiMapping: 'p_business_contact_last_name',
    });
    this.addressModel.get('streetModel').set({labelText: 'Business Street Address'});
    this.emailModel.set({labelText: 'Business Contact Email Address'});
    this.daytimePhoneModel.set({labelText: 'Business Daytime Phone'});
    this.businessNameModel.set('required', !this.isTypeAgentSelected());
  },

  saveInternalDataToModel(options={}) {
    const modelSaveData = {};

    // Set correct participant_model state
    const activeEditGroup = this.getEditGroup();
    activeEditGroup.forEach(regionName => {
      const view = this.getChildView(regionName);
      const pageApiDataAttrs = view.getModel ? view.getModel().getPageApiDataAttrs() : view.model.getPageApiDataAttrs();
      Object.assign(modelSaveData, pageApiDataAttrs);
    });
    
    // Clear birth date if "No" is selected on birthday question
    if (!this.hasBirthdayModel.getData()) {
      Object.assign(modelSaveData, {
        [this.birthdayModel.get('apiMapping')] : null
      });
    }
    
    // Clear values if they are now hidden via contact method selection
    if (activeEditGroup.indexOf('emailRegion') === -1) {
      Object.assign(modelSaveData, {
        [this.emailModel.get('apiMapping')] : null
      });
    }
    if (activeEditGroup.indexOf('daytimePhoneRegion') === -1) {
      Object.assign(modelSaveData, {
        [this.daytimePhoneModel.get('apiMapping')]: null,
        [this.otherPhoneModel.get('apiMapping')]: null,
      });
    }
    if (activeEditGroup.indexOf('addressRegion') === -1) {
      Object.assign(modelSaveData, {
        p_address: null,
        p_city: null,
        p_postal_zip: null,
        p_country: null,
        p_province_state: null,
        p_mail_address: null,
        p_mail_city: null,
        p_mail_postal_zip: null,
        p_mail_country: null,
        p_mail_province_state: null,
      });
    }

    // Now strip invalid CEU fields that are added
    delete modelSaveData.geozoneId;
    delete modelSaveData.value;

    if (options.returnOnly) {
      return modelSaveData;
    } else {
      this.model.set(modelSaveData);
    }
  },
  
  getEditGroup() {
    const editRegionNames = ['typeRegion', 'contactTypeRegion', 'firstNameRegion', 'lastNameRegion'];

    if (this.shouldShowBusinessName()) editRegionNames.push('businessNameRegion');
    if (this.shouldShowOtherTitle()) editRegionNames.push('otherTitleRegion');
    if (this.shouldShowEmail()) editRegionNames.push('emailRegion');

    if (this.shouldShowAddress()) {
      editRegionNames.push('addressRegion');
      editRegionNames.push('differentMailAddressRegion');
      editRegionNames.push('mailingAddressRegion');
    }
    
    if (this.shouldShowPhone()) {
      editRegionNames.push('daytimePhoneRegion');
      editRegionNames.push('otherPhoneRegion');
    }

    if (this.enableBirthday) {
      editRegionNames.push('birthdayQuestionRegion');
      if (this.hasBirthdayModel.getData()) editRegionNames.push('birthdayRegion');
    }
    return editRegionNames;
  },

  validateAndShowErrors() {
    let isValid = true;
    _.each(this.getEditGroup(), function(regionName) {
      const childView = this.getChildView(regionName);
      if (!childView) {
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        return;
      }

      if (!childView.$el) {
        return;
      }
      if (!childView.$el.is(':visible')) {
        return;
      }

      isValid = childView.validateAndShowErrors() & isValid;
    }, this);
    return isValid;
  },

  clickDelete() {
    this.model.trigger('click:delete');
  },

  className: 'intake-participant ceu-participant',

  regions: {
    typeRegion: '.participant-type',
    contactTypeRegion: '.ceu-participant__contact-type',
    
    businessNameRegion: '.participant-business-name',
    firstNameRegion: '.participant-first-name',
    lastNameRegion: '.participant-last-name',

    addressRegion: '.participant-address',
    differentMailAddressRegion: '.participant-use-mail',
    mailingAddressRegion: '.participant-mailing-address',
    
    emailRegion: '.participant-email',
    
    daytimePhoneRegion: '.participant-daytime-phone',
    otherPhoneRegion: '.participant-other-phone',

    otherTitleRegion: '.ceu-participant__other-title',

    birthdayQuestionRegion: '.ceu-participant__birthday-question',
    birthdayRegion: '.ceu-participant__birthday',
  },

  ui: {
    delete: '.participant-delete-icon',
    birthdayWarning: '.ceu-participant__birthday-warning',
  },

  triggers: {
    'click @ui.delete': 'click:delete'
  },

  onBeforeRender() {
    if (this.shouldShowBusinessName()) this.toBusiness();
    else this.toNonBusiness();

    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    const CEU_MIN_RESPONDENT_AGE = configChannel.request('get', 'CEU_MIN_RESPONDENT_AGE');
    const maxDate = Moment().subtract(CEU_MIN_RESPONDENT_AGE, 'years');

    this.showChildView('typeRegion', new RadioView({ model: this.typeRadioModel }));

    this.showChildView('contactTypeRegion', new PageItemView({
      stepText: `Please provide contact information for ${this.contactInfoName || 'them'}`,
      subView: new DropdownView({ model: this.contactTypeModel }),
      forceVisible: true,
    }));

    if (this.shouldShowBusinessName()) {
      this.showChildView('businessNameRegion', new InputView({ model: this.businessNameModel }));
    } else if (this.shouldShowOtherTitle()) {
      this.showChildView('otherTitleRegion', new InputView({ model: this.otherTitleModel }));
    }

    this.showChildView('firstNameRegion', new InputView({ model: this.firstNameModel }));
    this.showChildView('lastNameRegion', new InputView({ model: this.lastNameModel }));

    this.renderAddressViews();

    if (this.shouldShowEmail()) {
      this.showChildView('emailRegion', new EmailView({
        showOptOut: false,
        model: this.emailModel
      }));
    }

    if (this.shouldShowPhone()) {
      this.showChildView('daytimePhoneRegion', new InputView({ model: this.daytimePhoneModel }));
      this.showChildView('otherPhoneRegion', new InputView({ model: this.otherPhoneModel }));
    }

    if (this.enableBirthday) {
      this.showChildView('birthdayQuestionRegion', new PageItemView({
        stepText: this.hasBirthdayModel.get('displayTitle'),
        subView: new RadioView({ model: this.hasBirthdayModel }),
        forceVisible: true,
      }));
      if (this.hasBirthdayModel.getData()) {
        const region = this.showChildView('birthdayRegion', new InputView({ model: this.birthdayModel }));
        this.listenTo(region?.currentView, 'itemComplete', () => {
          const selectedDate = Moment(this.birthdayModel.getData());
          this.invalidDateError = selectedDate?.isValid() && selectedDate.isAfter(maxDate, 'days') ? `The date you have entered is for a person less than ${CEU_MIN_RESPONDENT_AGE} years of age.  Please ensure this is correct before you continue.` : null;
          this.render();
        });
      }
    }
  },
  
  renderAddressViews() {
    if (!this.shouldShowAddress()) return;
    this.showChildView('addressRegion', new AddressView({ model: this.addressModel }));
    this.showChildView('differentMailAddressRegion', new DropdownView({ model: this.useMailModel }));
    this.showChildView('mailingAddressRegion', new AddressView({ model: this.mailingAddressModel }));
  },

  template() {
    const collection = this.model.collection;
    const participantIndex = collection ? collection.indexOf(this.model) : -1;
    // Only show an index when there is more than one participant
    const displayIndex = collection && collection.length > 1 ?
      (participantIndex !== -1 ? participantIndex + 1 : '') : '';

    const partyName = `${this.baseName}${displayIndex ? ` ${displayIndex}` : ''}`;
    return <div className="persist-area" data-header-extend="15">
      <div className="participant-section section-header persist-header">
        <div>
          {partyName}
          {this.enableDelete ? <span className="participant-delete-icon general-delete-icon"></span> : null}
        </div>
      </div>
      <div className="participant-wrapper">
        <div className="participant-type"></div>
    
        {this.shouldShowBusinessName() ? <div className="participant-business-name"></div> : null}
        {this.shouldShowOtherTitle() ? <div className="ceu-participant__other-title"></div> : null}
        <div className="participant-name-section clearfix">
          <div className="participant-first-name col-sm-6"></div>
          <div className="participant-last-name col-sm-6"></div>
        </div>
        {this.showNameWarning ? <div className="error-block warning ceu-participant__name-warning">Ensure that the full legal name for the contact person is entered</div> : null}

        <div className="ceu-participant__contact-type"></div>

        {this.renderJsxAddress()}
        {this.renderJsxEmail()}
        {this.renderJsxPhones()}
        {this.renderJsxBirthday()}
      </div>
    
    </div>
  },

  renderJsxAddress() {
    if (!this.shouldShowAddress()) return;
    const hasMailAddress = this.model.hasMailAddress() || this.useMailModel.getData({ parse: true }) === 0;
    return <>
      <div className="participant-address"></div>
      <div className="row participant-use-mail-container clearfix">
        <div className="col-xs-12"><span>Is mail also sent to the above address?</span></div>
        <div className="participant-use-mail col-xs-12"></div>
      </div>
      <div className={`participant-mailing-address ${hasMailAddress ? '' : 'hidden-address'}`}></div>
    </>
  },

  renderJsxEmail() {
    if (!this.shouldShowEmail()) return;
    return <div className="participant-email"></div>;
  },

  renderJsxPhones() {
    if (!this.shouldShowPhone()) return;
    return <div className="participant-phone-container clearfix">
      <div className="participant-daytime-phone"></div>
      <div className="participant-other-phone"></div>
    </div>;
  },

  renderJsxBirthday() {
    if (!this.enableBirthday) return;
    
    const birthdayValue = this.birthdayModel.getData();
    const duration = birthdayValue ? Moment.duration(Moment().diff(Moment(birthdayValue))) : null;

    return <>
      <div className="ceu-participant__birthday-question"></div>
      {this.hasBirthdayModel.getData() ? <>
        <div className="ceu-participant__birthday-container">
          <div className="ceu-participant__birthday"></div>
          <div className="ceu-participant__birthday-label">{duration ? `${duration.years()} year${duration.years()===1?'':'s'} old` : null}</div>
        </div>
        {this.invalidDateError ? <p className="ceu-participant__birthday-warning">{this.invalidDateError}</p> : null}
      </> : null}
    </>;
  }

});

_.extend(CeuApplicant.prototype, ViewJSXMixin);
export default CeuApplicant;
