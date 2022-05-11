/**
 * @class core.components.participant.IntakeParticipantView
 * @memberof core.components.participant
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioView from '../../../../core/components/radio/Radio';
import EmailView from '../../../../core/components/email/Email';
import InputView from '../../../../core/components/input/Input';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import AddressView from '../../../../core/components/address/Address';
import template from './IntakeParticipantUnit_template.tpl';

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: 'intake-participant intake-participant-unit',

  regions: {
    participantTypeRegion: '.participant-type',
    businessNameRegion: '.participant-business-name',
    firstNameRegion: '.participant-first-name',
    lastNameRegion: '.participant-last-name',
    differentMailAddressRegion: '.participant-use-mail',
    mailingAddressRegion: '.participant-mailing-address',
    emailRegion: '.participant-email',
    daytimePhoneRegion: '.participant-daytime-phone',
    otherPhoneRegion: '.participant-other-phone',
    faxPhoneRegion: '.participant-fax-phone',
  },

  initialize(options) {
    this.mergeOptions(options, ['noHeader']);
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


  onRender() {
    this.showChildView('participantTypeRegion', new RadioView({ model: this.model.get('participantTypeModel') }));
    this.showChildView('businessNameRegion', new InputView({ model: this.model.get('businessNameModel') }));
    this.showChildView('firstNameRegion', new InputView({ model: this.model.get('firstNameModel') }));
    this.showChildView('lastNameRegion', new InputView({ model: this.model.get('lastNameModel') }));
    
    this.showChildView('differentMailAddressRegion', new DropdownView({ model: this.model.get('useMailModel') }));
    this.showChildView('mailingAddressRegion', new AddressView({ model: this.model.get('mailingAddressModel') }));

    this.showChildView('emailRegion', new EmailView({
      showOptOut: !this.disableEmailOptOut,
      model: this.model.get('emailModel')
    }));
    this.showChildView('daytimePhoneRegion', new InputView({ model: this.model.get('daytimePhoneModel') }));
    this.showChildView('otherPhoneRegion', new InputView({ model: this.model.get('otherPhoneModel') }));
    this.showChildView('faxPhoneRegion', new InputView({ model: this.model.get('faxPhoneModel') }));

    // Do a dummy scroll in order to make sure floating headers are correct on re-renders
    this.$el.closest('.persist-area').scroll();
  },


  showErrorMessage(participant_error) {
    console.info(`[Info] participant object error`, participant_error);
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      console.log(childView);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, region);
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
    }, this);

    const is_own_model_valid = this.model.isValid();
    is_valid = is_own_model_valid && is_valid;
    if (!is_own_model_valid) {
      this.showErrorMessage(this.model.validationError);
    }
    return is_valid;
  },

  templateContext() {
    const unitModel = this.model.get('_unitModel');
    const participantsInUnit = this.model.collection ? this.model.collection.filter(participant => unitModel && participant.get('_unitModel') === unitModel) : [];
    const indexOfOwnModel = participantsInUnit.indexOf(this.model);
    console.log(indexOfOwnModel);
    return {
      noHeader: this.noHeader,
      hasMailAddress: this.model.hasMailAddress() || this.model.get('useMailModel').getData({ parse: true }) === 0,
      isBusiness: this.model.isBusiness(),

      partyName: `${unitModel.getUnitNumDisplay()} - Tenant ${indexOfOwnModel !== -1 ? Formatter.toLeftPad(indexOfOwnModel+1) : '' }`,
      addressStreetDisplay: unitModel && unitModel.getStreetDisplayWithDescriptor(),
      addressWithoutStreetDisplay: unitModel && unitModel.getAddressWithoutStreet()
    };
  }

});
