import Radio from 'backbone.radio';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import template from './AdvancedSearchParticipants_template.tpl';
import AdvancedSearchMixinView from './AdvancedSearch_mixin';

const configChannel = Radio.channel('config');

export default AdvancedSearchMixinView.extend({
  template,

  regions: {
    accessNumberRegion: '.access-number',
    participantNameType: '.name-type',
    participantFirstName: '.search-participant-first-name',
    participantLastName: '.search-participant-last-name',
    contactInfoType: '.contact-type',
    contactInfoEmailPhone: '.contact-email-phone'
  },

  ui: {
    participantsSearchBtn: '.access-number-btn-search',
    participantNameSearchBtn: '.particpant-name-btn-search',
    contactInfoSearchBtn: '.contact-email-btn-search',
  },

  events: {
    'click @ui.participantsSearchBtn': 'clickSearchAccessNumber',
    'click @ui.participantNameSearchBtn': 'clickParticipantNameSearch',
    'click @ui.contactInfoSearchBtn': 'clickContactInfoSearch',
  },

  clickSearchAccessNumber() {
    const searchInputView = this.getChildView('accessNumberRegion');
    if (!searchInputView.validateAndShowErrors()) return;

    this.performDirectSearch(this.model.get('accessNumberModel').getData(), 'search:accessNumber', this.handleSearchResponse, null, 'Access Number')
      .fail(err => {
        if (err && err.status === 404) searchInputView.showErrorMessage('No matching dispute');
        else generalErrorFactory.createHandler('ADMIN.SEARCH.ACCESSCODE')(err);
      });
  },

  clickParticipantNameSearch() {
    // Validate and build request
    const request = Number(this.model.get('participantNameTypeModel').getData()) === 0 ?
        this._createPersonNameSearchRequest() : this._createBusinessNameSearchRequest();
    
    if (!request) {
      return;
    }

    this.performParticipantNameSearch(request).fail(generalErrorFactory.createHandler('ADMIN.SEARCH.PARTICIPANT'));
  },

  clickContactInfoSearch() {
    const contactInformationBox = this.getChildView('contactInfoEmailPhone');

    if (!this.model.get('contactInfoEmailPhone').getData()) {
      contactInformationBox.showErrorMessage(`Please provide a${Number(this.model.get('contactInfoTypeModel').getData()) === 0? 'n email address' : ' phone number'}.`);
      return;
    }
    
    if (!contactInformationBox.validateAndShowErrors()) {
      return;
    }

    const request = this._createBaseRequest();

    if (Number(this.model.get('contactInfoTypeModel').getData()) === 0) {
      request.Email = $.trim(this.model.get('contactInfoEmailPhone').getData()).toLowerCase();
    } else {
      request.AllPhone = $.trim(this.model.get('contactInfoEmailPhone').getData()).replace(/[^\d]/g, '').slice(-10);
    }

    this.performParticipantContactSearch(request).fail(generalErrorFactory.createHandler('ADMIN.SEARCH.PARTICIPANT'));
  },

  _createBaseRequest() {
    return {
      index: 0,
      count: this.model.getInitialRequestCount()
    };
  },

  _createPersonNameSearchRequest() {
    const request = this._createBaseRequest();
    const firstNameView = this.getChildView('participantFirstName');
    const lastNameView = this.getChildView('participantLastName');

    firstNameView.removeErrorStyles();
    lastNameView.removeErrorStyles();

    if (!this.model.get('participantFirstNameModel').getData() && !this.model.get('participantLastNameModel').getData()) {
      firstNameView.showErrorMessage('Please enter a first or last name.');
      return;
    }

    if (this.model.get('participantFirstNameModel').getData() && !firstNameView.validateAndShowErrors()) {
      return;
    }

    if (this.model.get('participantLastNameModel').getData() && !lastNameView.validateAndShowErrors()) {
      return;
    }

    if(this.model.get('participantFirstNameModel').getData()) {
      request.AllFirstName = $.trim(this.model.get('participantFirstNameModel').getData()).toLowerCase();
    }

    if (this.model.get('participantLastNameModel').getData()) {
      request.AllLastName = $.trim(this.model.get('participantLastNameModel').getData()).toLowerCase();
    }

    return request;
  },

  _createBusinessNameSearchRequest() {
    const request = this._createBaseRequest();
    const firstNameView = this.getChildView('participantFirstName');
    firstNameView.removeErrorStyles();

    if (!this.model.get('participantFirstNameModel').getData()) {
      firstNameView.showErrorMessage('Please enter a business name.');
      return;
    }

    if (this.model.get('participantFirstNameModel').getData() && !firstNameView.validateAndShowErrors()) {
      return;
    }

    if (this.model.get('participantFirstNameModel').getData()) {
      request.BusinessName = $.trim(this.model.get('participantFirstNameModel').getData()).toLowerCase();
    }

    return request;
  },

  performParticipantNameSearch(request) {
    this.lastUsedSearchIsName = true;
    return this.performSearch(request, 'search:participantName', this.handleSearchResponse, null, 'Participant');
  },

  performParticipantContactSearch(request) {
    this.lastUsedSearchIsName = false;
    return this.performSearch(request, 'search:participantName', this.handleSearchResponse, null, 'Contact');
  },

  searchByRequest(request) {
    return this.performSearch(request, 'search:participantName', this.handleSearchResponse, null, this.lastUsedSearchIsName ? 'Participant' : 'Contact');
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);

    this.lastUsedSearchIsName = false;
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model.get('contactInfoTypeModel'), 'change:value', this.handleContactInfoTypeChange, this);
    this.listenTo(this.model.get('participantNameTypeModel'), 'change:value', this.handleParticipantNameTypeChange, this);
  },

  handleParticipantNameTypeChange() {
    const BUSINESS_NAME_MIN_LENGTH = configChannel.request('get', 'BUSINESS_NAME_MIN_LENGTH');
    this.model.get('participantNameTypeModel').set({value: Number(this.model.get('participantNameTypeModel').getData())});

    let participantFirstNameRegion;
    let participantLastNameRegion;
    if (Number(this.model.get('participantNameTypeModel').getData()) === 0) {
      this.model.get('participantFirstNameModel').set({labelText: 'First Name (2 Min)', disabled: false, minLength: 2});
      this.model.get('participantLastNameModel').set({labelText: 'Last Name (2 Min)', disabled: false, minLength: 2});
      participantFirstNameRegion = this.showChildView('participantFirstName', new InputView({ model: this.model.get('participantFirstNameModel') }));
      participantLastNameRegion = this.showChildView('participantLastName', new InputView({ model: this.model.get('participantLastNameModel') }));
    } else {
      this.model.get('participantFirstNameModel').set({labelText: `Business Name (${BUSINESS_NAME_MIN_LENGTH} Min)`, disabled: false, minLength: BUSINESS_NAME_MIN_LENGTH});
      this.model.get('participantLastNameModel').set({labelText: ' ', disabled: true});
      participantFirstNameRegion = this.showChildView('participantFirstName', new InputView({ model: this.model.get('participantFirstNameModel') }));
      participantLastNameRegion = this.showChildView('participantLastName', new InputView({ model: this.model.get('participantLastNameModel') }));
    }

    this.setupParticipantNameViewListeners(participantFirstNameRegion, participantLastNameRegion);
  },

  handleContactInfoTypeChange() {
    this.model.get('contactInfoTypeModel').set({value: Number(this.model.get('contactInfoTypeModel').getData())});

    if (Number(this.model.get('contactInfoTypeModel').getData()) === 0) {
      this.model.get('contactInfoEmailPhone').set({ inputType: 'email', labelText: 'Email Address (exact)', value: null });
    } else {
      this.model.get('contactInfoEmailPhone').set({ inputType: 'phone', labelText: 'Phone Number (exact)', value: null });
    }
    const contactInfoEmailPhoneRegion = this.showChildView('contactInfoEmailPhone', new InputView({ model: this.model.get('contactInfoEmailPhone') }));
    this.setupEmailPhoneViewListeners(contactInfoEmailPhoneRegion);
  },
  
  onRender() {
    const accessNumberRegion = this.showChildView('accessNumberRegion', new InputView({ model: this.model.get('accessNumberModel') }));
    this.showChildView('participantNameType', new DropdownView({ model: this.model.get('participantNameTypeModel') }));
    const participantFirstName = this.showChildView('participantFirstName', new InputView({ model: this.model.get('participantFirstNameModel') }));
    const participantLastName = this.showChildView('participantLastName', new InputView({ model: this.model.get('participantLastNameModel') }));
    this.showChildView('contactInfoType', new DropdownView({ model: this.model.get('contactInfoTypeModel')}));
    const contactInfoEmailPhone = this.showChildView('contactInfoEmailPhone', new InputView({ model: this.model.get('contactInfoEmailPhone')}));

    this.addEnterListener(accessNumberRegion, this.clickSearchAccessNumber);

    this.setupParticipantNameViewListeners(participantFirstName, participantLastName);
    this.setupEmailPhoneViewListeners(contactInfoEmailPhone);
  },

  setupParticipantNameViewListeners(participantFirstNameRegion, participantLastNameRegion) {
    this.addEnterListener(participantFirstNameRegion, this.clickParticipantNameSearch);
    this.addEnterListener(participantFirstNameRegion, this.clickParticipantNameSearch);

    this.addRemoveErrorStylesListener(participantFirstNameRegion, participantLastNameRegion);
    this.addRemoveErrorStylesListener(participantLastNameRegion, participantFirstNameRegion);
  },

  setupEmailPhoneViewListeners(contactInfoEmailPhoneRegion) {
    this.addEnterListener(contactInfoEmailPhoneRegion, this.clickContactInfoSearch);
  }

});
