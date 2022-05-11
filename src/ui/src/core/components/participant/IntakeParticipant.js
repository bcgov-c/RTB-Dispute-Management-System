/**
 * @class core.components.participant.IntakeParticipantView
 * @memberof core.components.participant
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioView from '../radio/Radio';
import EmailView from '../email/Email';
import InputView from '../input/Input';
import DropdownView from '../dropdown/Dropdown';
import AddressView from '../address/Address';
import DoubleSelector from '../double-selector/DoubleSelector';
import PageItemView from '../page/PageItem';
import template from './IntakeParticipant_template.tpl';

const SUPPORT_TYPE_DISPLAY = 'Agent or Advocate';
const RADIO_CODE_YES = 1;

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: 'intake-participant',

  regions: {
    participantTypeRegion: '.participant-type',
    businessNameRegion: '.participant-business-name',
    firstNameRegion: '.participant-first-name',
    lastNameRegion: '.participant-last-name',
    knownContactRegion: '.participant-known-contact',
    addressRegion: '.participant-address',
    differentMailAddressRegion: '.participant-use-mail',
    mailingAddressRegion: '.participant-mailing-address',
    emailRegion: '.participant-email',
    daytimePhoneRegion: '.participant-daytime-phone',
    otherPhoneRegion: '.participant-other-phone',
    faxPhoneRegion: '.participant-fax-phone',
    hearingOptionsByRegion: '.participant-hearing-options-by',
    unitTypeRadioRegion: '.participant-address-unit-radio',
    unitTypeRegion: '.participant-address-unit-type',
  },

  ui: {
    useDisputeAddress: '.participant-use-dispute-address',
    delete: '.participant-delete-icon'
  },

  events: {
    'click @ui.useDisputeAddress': 'clickUseDisputeAddress',
  },

  triggers: {
    'click @ui.delete': 'click:delete'
  },

  clickUseDisputeAddress() {
    const addressModel = this.model.get('addressModel');
    const participantAddress = addressModel.getPageApiDataAttrs();
    const dispute = disputeChannel.request('get');
    const disputeAddress = {
      street: dispute.get('tenancy_address'),
      city: dispute.get('tenancy_city'),
      postalCode: dispute.get('tenancy_zip_postal'),
      country: dispute.get('tenancy_country'),
      province: null,
    };
    const updateAddressFn = (modalView) => {
      if (modalView) { modalView.close(); }
      addressModel.updateValues(disputeAddress);
      this.render();
    };

    // Check if values in street, city or postal code to know if there was an existing values.
    // Also check just the streets are different so we don't warn just when updating same address
    if ((participantAddress.address || participantAddress.city || participantAddress.postal_zip) &&
        (!participantAddress.address || participantAddress.address !== disputeAddress.street)) {
      modalChannel.request('show:standard', {
        title: 'Use Rental Address?',
        bodyHtml: `<p>Are you sure you want to replace the address you have entered with the Rental Address <b>${disputeAddress.street}</b>?</p>`,
        primaryButtonText: 'Replace',
        onContinueFn: updateAddressFn
      });
    } else {
      updateAddressFn();
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['baseName', 'noHeader', 'enableUnitType', 'enableKnownContact', 'enablePackageMethod', 'packageMethodOptional', 'disableEmailOptOut']);

    this.baseName = this.baseName || 'Applicant';

    this.SEND_METHOD_EMAIL = String(configChannel.request('get', 'SEND_METHOD_EMAIL') || '');

    if (this.enablePackageMethod && !this.packageMethodOptional) {
      this.model.get('hearingOptionsByModel').set('required', true);
    }

    if (this.disableEmailOptOut || this.enableKnownContact) {
      if (this.model.get('hearingOptionsByModel').getData() === this.SEND_METHOD_EMAIL) {
        this.model.setEmailToRequired();
      } else {
        this.model.setEmailToOptional();
      }
    }

    if (this.enableKnownContact) {
      this.model.setEmailToRequired();
      this.model.setPhoneToRequired();
    } else {
      // Otherwise, unset any saved known contact value
      this.model.get('knownContactModel').set('value', null, { silent: true });
    }

    this.showRentalUnit = this.model.get('unitTypeModel').getData({ parse: true });
    this.setupListeners();
  },

  setupListeners() {
    const businessType = configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS');
    const assistant_keys = ['PARTICIPANT_TYPE_AGENT_OR_LAWYER', 'PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT'];

    this.listenTo(this.model.get('useMailModel'), 'change:value', this.onUseMailChange);

    this.listenTo(this.model.get('participantTypeModel'), 'change:value', function(model, value) {
      if ((model.previous('value') === businessType || value === businessType) ||
          _.any(assistant_keys, function(key) {
            const val = configChannel.request('get', key);
            return model.previous('value') === val || value === val;
          }) ) {
        this.render();
      }
    }, this);

    this.listenToOnce(this.model.get('emailModel'), 'unableToEmail', function() {
      this.model.setEmailToOptional();
      const emailView = this.getChildView('emailRegion');
      if (emailView && emailView.isRendered()) {
        emailView.render();
      }
    }, this);


    this.listenTo(this.model.get('hearingOptionsByModel'), 'change:value', (model, value) => {
      if (value && String(value) === this.SEND_METHOD_EMAIL) {
        this.model.setEmailToRequired();
      } else {
        this.model.setEmailToOptional();
      }
      const emailView = this.getChildView('emailRegion');
      if (emailView && emailView.isRendered()) {
        emailView.render();
      }
    });

    this.listenTo(this.model.get('unitTypeRadioModel'), 'change:value', function(model, value) {
      const isYes = value === RADIO_CODE_YES;
      if (isYes) {
        this.model.get('unitTypeModel').setToRequired();
      } else {
        this.model.get('unitTypeModel').setToOptional();
        this.model.get('unitTypeModel').clearSelections();
      }
      
      this.showRentalUnit = isYes;
      this.render();
    }, this);

    this.listenTo(this.model.get('knownContactModel'), 'change:value', (model, value) => {
      const hasContactEmail = this.model.get('participantModel').hasContactEmail(Number(value))

      if (this.model.get('hearingOptionsByModel').getData() === String(configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL'))) {
        this.model.get('hearingOptionsByModel').set({ value: null });
      }

      const optionData = [
        ...(hasContactEmail ? [{ text: Formatter.toHearingOptionsByDisplay(1), value: '1' }] : []),
        { text: Formatter.toHearingOptionsByDisplay(2), value: '2' }
      ];

      this.model.get('hearingOptionsByModel').set({ optionData });

      this.render();
    });
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
    this.model.get('firstNameModel').set({labelText: 'First Name'});
    this.model.get('lastNameModel').set({labelText: 'Last Name'});
    this.model.get('addressModel').get('streetModel').set({labelText: 'Street Address'});
    this.model.get('emailModel').set({labelText: 'Email Address'});
    this.model.get('daytimePhoneModel').set({labelText: 'Daytime Phone'});
  },

  toBusiness() {
    this.model.get('firstNameModel').set({labelText: 'Business Contact First Name'});
    this.model.get('lastNameModel').set({labelText: 'Business Contact Last Name'});
    this.model.get('addressModel').get('streetModel').set({labelText: 'Business Street Address'});
    this.model.get('emailModel').set({labelText: 'Business Contact Email Address'});
    this.model.get('daytimePhoneModel').set({labelText: 'Business Daytime Phone'});
  },

  hideAddressLink() {
    const dispute = disputeChannel.request('get');
    return !dispute || (dispute.isPastTenancy() && this.model.get('participantModel').isTenant()) || this.model.isAssistant();
  },

  onBeforeRender() {
    const participantModel = this.model.get('participantModel');
    const selectedContactVal = this.model.get('knownContactModel').getData({ parse: true });
    this.showAddressEntry = this.enableKnownContact ? participantModel.hasContactAddress(selectedContactVal) : true;
    this.showEmailEntry = this.enableKnownContact ? participantModel.hasContactEmail(selectedContactVal) : true;
    this.showPhoneEntry = this.enableKnownContact ? participantModel.hasContactPhone(selectedContactVal): true;
  },

  onRender() {
    this.showChildView('participantTypeRegion', new RadioView({ model: this.model.get('participantTypeModel') }));
    this.showChildView('businessNameRegion', new InputView({ model: this.model.get('businessNameModel') }));
    this.showChildView('firstNameRegion', new InputView({ model: this.model.get('firstNameModel') }));
    this.showChildView('lastNameRegion', new InputView({ model: this.model.get('lastNameModel') }));
    this.showChildView('addressRegion', new AddressView({ model: this.model.get('addressModel') }));

    this.showChildView('differentMailAddressRegion', new DropdownView({ model: this.model.get('useMailModel') }));
    this.showChildView('mailingAddressRegion', new AddressView({ model: this.model.get('mailingAddressModel') }));

    this.showChildView('emailRegion', new EmailView({
      showOptOut: !this.disableEmailOptOut && !this.enableKnownContact,
      model: this.model.get('emailModel')
    }));
    this.showChildView('daytimePhoneRegion', new InputView({ model: this.model.get('daytimePhoneModel') }));
    this.showChildView('otherPhoneRegion', new InputView({ model: this.model.get('otherPhoneModel') }));
    this.showChildView('faxPhoneRegion', new InputView({ model: this.model.get('faxPhoneModel') }));
    this.showChildView('hearingOptionsByRegion', new DropdownView({ model: this.model.get('hearingOptionsByModel') }));

    if (this.enableUnitType) {
      this.renderUnitTypeRegions();
    }

    if (this.enableKnownContact) {
      this.showChildView('knownContactRegion', new DropdownView({ model: this.model.get('knownContactModel') }));
    }

    // Do a dummy scroll in order to make sure floating headers are correct on re-renders
    this.$el.closest('.persist-area').scroll();
  },

  renderUnitTypeRegions() {
    this.showChildView('unitTypeRadioRegion', new PageItemView({
      stepText: 'If the address is part of a larger residential property with a shared address, does it have a unique unit identifier (i.e. basement, upper, lower, coach house, etc.)?',
      subView: new RadioView({ model: this.model.get('unitTypeRadioModel') }),
      helpHtml: 'This might mean a basement suite, room rental, upper home, lower home, coach house or laneway.',
      forceVisible: true,
    }));
    this.showChildView('unitTypeRegion', new DoubleSelector({ model: this.model.get('unitTypeModel') }));
  },

  getViewsToValidate() {
    const viewsToValidate = ['participantTypeRegion', 'businessNameRegion', 'firstNameRegion', 'lastNameRegion', 'hearingOptionsByRegion'];
    if (this.enableKnownContact) viewsToValidate.push('knownContactRegion');
    if (this.showAddressEntry) viewsToValidate.push('addressRegion', 'differentMailAddressRegion', 'mailingAddressRegion', 'unitTypeRadioRegion', 'unitTypeRegion');
    if (this.showEmailEntry) viewsToValidate.push('emailRegion');
    if (this.showPhoneEntry) viewsToValidate.push('daytimePhoneRegion', 'otherPhoneRegion', 'faxPhoneRegion');
    return viewsToValidate;
  },

  validateAndShowErrors() {
    let is_valid = true;

    this.getViewsToValidate().forEach(regionName => {
      const childView = this.getChildView(regionName);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, regionName);
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }

      if (!childView.$el) {
        console.log(`[Warning] No childView element rendered in DOM to valdiate`, childView);
        return;
      }
      if (!childView.$el.is(':visible')) {
        console.log(`[Info] Skipping validation on hidden childView`, childView);
        return;
      }

      is_valid = childView.validateAndShowErrors() && is_valid;
    });
    return is_valid;
  },

  getContactWarningHtml() {
    if (!this.enableKnownContact || !this.model.get('knownContactModel').getData()) return;

    const landlordTenantText = disputeChannel.request('get').isLandlord() ? 'tenant' : 'landlord';
    return this.showAddressEntry ? `
      <p>You must be able to serve a Notice of Dispute Resolution Proceeding Package to all the ${landlordTenantText}s listed on the application. Each ${landlordTenantText} must receive their own package. <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution">Click here</a> to learn about <b>allowable</b> methods of service.</p>
    ` : `
    <p>You must be able to serve a Notice of Dispute Resolution Proceeding Package to all the ${landlordTenantText}s listed on the application. Each ${landlordTenantText} must receive their own package. <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution">Click here</a> to learn about <b>allowable</b> methods of service. If you cannot serve using an allowable method, you can apply for substituted service online after submitting this application or complete a paper application (form RTB-13) and submit it in person.</p>
    <p>Substituted service requires you to indicate the alternate way you want to serve the documents with proof the respondent(s) would receive them. There is no additional fee for an application for substituted service.</p>
    `;
  },

  templateContext() {
    const collection = this.model.collection;
    const dispute = disputeChannel.request('get');
    const participantIndex = collection ? collection.indexOf(this.model) : -1;

    let displayIndex = participantIndex !== -1 ? participantIndex + 1 : '';
    if (this.model.isAssistant() && collection) {
      displayIndex = displayIndex - collection.filter(function(p) { return p.isPersonOrBusiness(); }).length;
    }

    return {
      enableKnownContact: this.enableKnownContact,
      enableUnitType: this.enableUnitType,
      showRentalUnit: this.showRentalUnit,
      enablePackageMethod: this.enablePackageMethod,
      noHeader: this.noHeader,
      isFinalPersonBusiness: this.model.isPersonOrBusiness() && collection && collection.where({ participantTypeUI: 1}).length === 1,
      disputeAddressString: dispute ? dispute.getAddressString() : '',
      hasMailAddress: this.model.hasMailAddress() || this.model.get('useMailModel').getData({ parse: true }) === 0,
      isBusiness: this.model.isBusiness(),
      partyName: `${this.model.isAssistant() ? SUPPORT_TYPE_DISPLAY : this.baseName} ${displayIndex}`,
      hideAddressLink: this.hideAddressLink(),

      showAddressEntry: this.showAddressEntry,
      showEmailEntry: this.showEmailEntry,
      showPhoneEntry: this.showPhoneEntry,
      knownContactWarningHtml: this.getContactWarningHtml(),
    };
  }

});
