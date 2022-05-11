import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import Email from '../../../core/components/email/Email';
import ExternalParticipantModel from '../../components/external-api/ExternalParticipant_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './UpdateContactPage_template.tpl';
import TOU_template from '../../../core/components/tou/TOU_template.tpl';
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';

const touLinkClass = 'accepted-terms-link';
const CONTACT_METHOD_EMAIL_CODE = 1;
const CONTACT_METHOD_PHONE_CODE = 2;

const participantChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} da-update-contact-page`,

  regions: {
    disputeRegion: '.dac__contact__dispute-overview',
    emailRegion: '.da-update-contact-email-address',
    daytimePhoneRegion: '.da-update-contact-daytime-phone',
    otherPhoneRegion: '.da-update-contact-other-phone',
    faxRegion: '.da-update-contact-fax',
    preferredContactRegion: '.da-update-contact-preferred-contact-method',
    confirmEmailRegion: '.da-update-contact-confirm-email',
    touCheckboxRegion: '.dac__contact__tou'
  },

  ui: {
    submitButton: '.da-update-contact-submit-btn',
    cancelButton: '.da-update-contact-cancel',
    skipButton: '.btn-skip',
    removeFaxButton: '.da-update-contact-remove-fax',
    removeOtherPhoneButton: '.da-update-contact-remove-other-phone',
    removeEmailButton: '.da-update-contact-remove-email',
    confirmEmailContainer: '.da-update-contact-confirm-email-container',
    pageError: '#da-update-contact-page-error',

    touContents: '.info-help-container'
  },

  events: {
    'click @ui.submitButton': 'clickSubmit',
    'click @ui.cancelButton': 'clickCancel',
    'click @ui.removeFaxButton': 'clickRemoveFax',
    'click @ui.removeOtherPhoneButton': 'clickRemoveOtherPhone',
    'click @ui.removeEmailButton': 'clickRemoveEmail',
    'click @ui.skipButton': 'clickSkip',

    [`click .${touLinkClass}`]: 'clickTermsOfUseLink',
  },  

  clickCancel() {
    this.participant.resetModel();
    Backbone.history.navigate('access', { trigger: true });
  },

  clickSkip() {
    modalChannel.request('show:standard', {
      title: 'Skip Contact Information Update?',
      bodyHtml: `<p>Are you sure you don't want to update your contact information? Having your correct contact information is important for providing you with timely service and information.</p>
      <p>If you skip this now you will be asked to provide this again on your next login.</p>`,
      onContinueFn: _.bind(function(modalView) {
        modalView.close();
        this.model.set('skipInitialLogin', true);
        this.participant.resetModel();
        Backbone.history.navigate('access', { trigger: true });
      }, this),
      primaryButtonText: 'Skip'
    });
  },

  clickSubmit() {
    if (!this.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    // Detect if anything would change
    const saved_attrs = this.participant.getApiSnapshotOfData();
    const to_save_attrs = this.prepareSaveAttrs();
    const new_change_attrs = _.omit(to_save_attrs, function(val, key) {
      return val === saved_attrs[key];
    });

    if (_.isEmpty(new_change_attrs)) {
      this.showNoChangesErrorMessage();
      return;
    }

    this.saveAndUpdateParticipant(new_change_attrs);
  },

  clickTermsOfUseLink(e) {
    e.preventDefault();
    const touContentsEle = this.getUI('touContents');

    if (touContentsEle.hasClass('help-opened')) {
      touContentsEle.slideUp({duration: 400, complete: function() {
        touContentsEle.removeClass('help-opened');
      }});
    } else {
      touContentsEle.addClass('help-opened');
      touContentsEle.find('.close-help').on('click', _.bind(this.clickTermsOfUseLink, this));
      touContentsEle.slideDown({duration: 400});
    }
  },

  saveAndUpdateParticipant(save_attrs) {
    save_attrs = _.extend(
      !this.participant.get('accepted_tou_date') ? { accepted_tou_date: Moment().toISOString() } : {},
      save_attrs,
      { accepted_tou: true }
    );

    const participantSaveModel = new ExternalParticipantModel(this.participant.toJSON());
    const model_before_save = this.participant.clone();

    loaderChannel.trigger('page:load');
    this.model.set('routingReceiptMode', true);
    participantSaveModel.save(save_attrs)
      .done(() => {
        // Sync participant with what was just saved
        this.participant.set(participantSaveModel.toJSON(), { silent: true });

        // Prepare and route to receipt
        this.model.setReceiptData({
          changed_attrs: save_attrs,
          old_participant_model: model_before_save
        });
        Backbone.history.navigate('update/contact/receipt', { trigger: true });
      }).fail(
        generalErrorFactory.createHandler('DA.PARTICIPANT.SAVE', () => {
          Backbone.history.navigate('update/contact/receipt', { trigger: true });
        })
      ).always(() => loaderChannel.trigger('page:load:complete'));
  },

  clickRemoveFax() {
    modalChannel.request('show:standard', {
      title: 'Remove Fax',
      bodyHtml: `<p>Are you sure that you would like to remove the fax?</p>`,
      primaryButtonText: 'Continue',
      cancelButtonText: 'Cancel, keep fax',
      primaryButtonTextMobile: 'Continue',
      cancelButtonTextMobile: 'Cancel',
      onContinueFn: _.bind(function(modalView) {
        this.faxModel.set({ value: null, placeholder: null });
        this.faxRemoved = true;
        this.preferredContactModel.set({ value: Number(this.preferredContactModel.getData()) });
        modalView.close();
        this.render();
      }, this)
    });
  },

  clickRemoveOtherPhone() {
    modalChannel.request('show:standard', {
      title: 'Remove Other Phone',
      bodyHtml: `<p>Are you sure that you would like to remove the other phone?</p>`,
      primaryButtonText: 'Continue',
      cancelButtonText: 'Cancel, keep other phone',
      primaryButtonTextMobile: 'Continue',
      cancelButtonTextMobile: 'Cancel',
      onContinueFn: _.bind(function(modalView) {
        this.otherPhoneRemoved = true;
        this.otherPhoneModel.set({ value: null, placeholder: null });
        this.preferredContactModel.set({ value: Number(this.preferredContactModel.getData()) });
        modalView.close();
        this.render();
      }, this)
    });
  },

  clickRemoveEmail() {
    modalChannel.request('show:standard', {
      title: 'Remove Email',
      bodyHtml: `<p>Are you sure that you would like to remove the email address?  An email address is the easiest way for the Residential Tenancy Branch to send you notifications and information about your dispute.  It is highly recommended that you keep an email address on file.</p>`,
      primaryButtonText: 'Continue',
      cancelButtonText: 'Cancel, keep email',
      primaryButtonTextMobile: 'Continue',
      cancelButtonTextMobile: 'Cancel',
      onContinueFn: _.bind(function(modalView) {
        this.emailRemoved = true;
        this.emailAddressModel.set({ value: null, placeholder: null }, { silent: true });
        modalView.close();

        //this.emailAddressModel.set({ cssClass: 'optional-input', required: false, customLink: null });
        this.preferredContactModel.set({ value: CONTACT_METHOD_PHONE_CODE }, { silent: true });
        this.render();
        this.showOrHideConfirmEmail();
        //this.handleEmailOptOut();
      }, this)
    });
  },

  initialize() {
    this.PHONE_FIELD_MAX = configChannel.request('get', 'PHONE_FIELD_MAX') || 15;
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX') || 48;

    this.isInitialRespondentLogin = this.model.isInitialRespondentLogin();
    this.isInitialLogin = this.isInitialRespondentLogin && !this.model.get('skipInitialLogin');
    
    this.participant = participantChannel.request('get:participant', sessionChannel.request('get:active:participant:id'));
    this.faxRemoved = false;
    this.otherPhoneRemoved = false;
    this.emailRemoved = false;
    this.showConfirmEmail = false;
    
    this.createSubModels();
    this.setupListeners();
  },

  // Email is required if no email previously provided and either preferred contact method is email OR if email not opted out for participant
  isEmailRequired(preferredContactMethodValue) {
    const hasSavedEmail = !!this.participant.getApiSavedAttr('email');
    const hasOptedOut = this.participant.get('no_email');
    
    if (hasSavedEmail && !this.emailRemoved) {
      return false;
    }
    return preferredContactMethodValue === CONTACT_METHOD_EMAIL_CODE || !hasOptedOut;
  },

  createSubModels() {
    this.touCheckboxModel = new CheckboxModel({
      html: `<span class="accepted-terms-content">I agree to the Residential Tenancy online systems </span><span class="${touLinkClass}">Terms of Use</span>`,
      disabled: !this.isInitialRespondentLogin,
      checked: !this.isInitialRespondentLogin,
      required: this.isInitialRespondentLogin,
      ignoredLinkClass: touLinkClass
    });


    const isEmailRequired = this.isEmailRequired(this.participant.get('primary_contact_method'));
    this.emailAddressModel = new InputModel({
      labelText: 'Email Address',
      inputType: 'email',
      errorMessage: 'Please enter an email',
      placeholder: this.participant.get('email'),
      cssClass: isEmailRequired ? null : 'optional-input',
      required: isEmailRequired,
      maxLength: this.APPLICANT_FIELD_MAX,
      apiMapping: 'email',
      value: null
    });

    this.confirmEmailAddressModel = new InputModel({
      labelText: 'Email Address',
      inputType: 'email',
      errorMessage: 'Please enter an email',
      maxLength: this.APPLICANT_FIELD_MAX,
      required: true,
    });

    this.daytimePhoneModel = new InputModel({
      labelText: 'Daytime Phone',
      inputType: 'phone',
      maxLength: this.PHONE_FIELD_MAX,
      errorMessage: 'Please enter a phone',
      placeholder: this.participant.get('primary_phone'),
      required: !this.participant.get('primary_phone'),
      apiMapping: 'primary_phone'
    });

    this.otherPhoneModel = new InputModel({
      labelText: 'Other Phone',
      inputType: 'phone',
      placeholder: this.participant.get('secondary_phone'),
      required: false,
      maxLength: this.PHONE_FIELD_MAX,
      apiMapping: 'secondary_phone',
      cssClass: 'optional-input'
    });

    this.faxModel = new InputModel({
      labelText: 'Fax',
      inputType: 'phone',
      placeholder: this.participant.get('fax'),
      maxLength: this.PHONE_FIELD_MAX,
      required: false,
      apiMapping: 'fax',
      cssClass: 'optional-input'
    });

    this.preferredContactModel = new DropdownModel({
      labelText: 'Preferred Contact Method',
      optionData: [{ text: 'Email (Recommended)', value: CONTACT_METHOD_EMAIL_CODE },
        { text: 'Phone and Standard Mail', value: CONTACT_METHOD_PHONE_CODE }],
      errorMessage: `Please enter a preferred contact`,
      defaultBlank: true,
      value: this.participant.get('primary_contact_method'),
      required: !this.participant.get('primary_contact_method'),
      apiMapping: 'primary_contact_method'
    });
  },

  handleEmailOptOut() {
    this.participant.set({ no_email: 1 });
    this.emailAddressModel.set({ cssClass: 'optional-input', required: false, customLink: null });
    this.preferredContactModel.set({ value: CONTACT_METHOD_PHONE_CODE }, { silent: true });
    this.render();
  },


  prepareSaveAttrs() {
    let save_attrs = {};

    if (this.faxRemoved) {
      save_attrs.fax = null;
    }

    if (this.otherPhoneRemoved) {
      save_attrs.secondary_phone = null;
    }

    if (this.emailRemoved) {
      save_attrs.email = null;
    }

    if (this.isInitialLogin) {
      save_attrs.accepted_tou = true;
      save_attrs.accepted_tou_date = Moment().toISOString();
    }

    if (this.emailAddressModel.getData()) {
      save_attrs = _.extend(save_attrs, this.emailAddressModel.getPageApiDataAttrs());
    }

    if (this.daytimePhoneModel.getData()) {
      save_attrs = _.extend(save_attrs, this.daytimePhoneModel.getPageApiDataAttrs());
    }

    if (this.otherPhoneModel.getData()) {
      save_attrs = _.extend(save_attrs, this.otherPhoneModel.getPageApiDataAttrs());
    }

    if (this.faxModel.getData()) {
      save_attrs = _.extend(save_attrs, this.faxModel.getPageApiDataAttrs());
    }

    if (this.preferredContactModel.getData() && this.preferredContactModel.getData() !== this.participant.get('primary_contact_method')) {
      save_attrs = _.extend(save_attrs, this.preferredContactModel.getPageApiDataAttrs());
    }

    save_attrs.no_email = this.participant.get('no_email');
    return save_attrs;
  },

  validateAndShowErrors() {
    let is_valid = true;
    const views_to_validate = ['touCheckboxRegion', 'emailRegion', 'daytimePhoneRegion', 'preferredContactRegion',
      'confirmEmailRegion', 'faxRegion', 'otherPhoneRegion'];

    _.each(views_to_validate, function(viewName) {
      const view = this.getChildView(viewName);
      if (!view) {
        return;
      }

      if (viewName === 'confirmEmailRegion') {
        if (!this.showConfirmEmail) {
          return;
        }
        is_valid = view.validateAndShowErrors() && is_valid;
        if (this.confirmEmailAddressModel.getData() !== this.emailAddressModel.getData()) {
          view.showErrorMessage("Email address does not match.");
          is_valid = false;
        }
      } else {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    return is_valid;
  },

  setupListeners() {
    this.listenTo(this.emailAddressModel, 'change:value', this.showOrHideConfirmEmail, this);
    this.listenTo(this.preferredContactModel, 'change:value', this.handleContactPreferenceChange, this);
    this.listenTo(this.emailAddressModel, 'unableToEmail', this.handleEmailOptOut, this);

    this.listenTo(this.otherPhoneModel, 'change:value', this.handleOtherPhoneChange, this);
    this.listenTo(this.faxModel, 'change:value', this.handleFaxChange, this);
  },

  handleOtherPhoneChange(model, value) {
    this.hideNoChangesErrorMessage();
    if (this.otherPhoneRemoved) {
      if ($.trim(value)) {
        this.$('.other-phone-message span').removeClass('error-red').addClass('success-green').text('Enter a new number to update it.');
      } else {
        this.$('.other-phone-message span').removeClass('success-green').addClass('error-red').text('Other Phone Removed');
      }
    }
  },

  handleFaxChange(model, value) {
    this.hideNoChangesErrorMessage();
    if (this.faxRemoved) {
      if ($.trim(value)) {
        this.$('.da-update-contact-fax-message span').removeClass('error-red').addClass('success-green').text('Enter a new number to update it.');
      } else {
        this.$('.da-update-contact-fax-message span').removeClass('success-green').addClass('error-red').text('Fax Removed');
      }
    }
  },


  handleContactPreferenceChange(model, value) {
    value = Number(value);
    this.preferredContactModel.set({ value });

    const isEmailRequired = this.isEmailRequired(value);
    this.emailAddressModel.set(_.extend({
      required: isEmailRequired,
      cssClass: isEmailRequired ? '' : 'optional-input',
    }, !isEmailRequired ? { customLink: null } : {}));

    this.render();
  },

  showOrHideConfirmEmail(model, value) {
    this.hideNoChangesErrorMessage();
    if (this.emailRemoved) {
      if ($.trim(value)) {
        this.$('.da-update-contact-email-provide-message span').removeClass('error-red').addClass('success-green').text('Enter a new number to update it.');
      } else {
        this.$('.da-update-contact-email-provide-message span').removeClass('success-green').addClass('error-red').text('Email Removed');
      }
    }

    if (this.emailAddressModel.getData() && !this.emailRemoved) {
      this.showConfirmEmail = true;
      this.getUI('confirmEmailContainer').show();
    } else {
      this.showConfirmEmail = false;
      this.getUI('confirmEmailContainer').hide();
    }
    this.preferredContactModel.set({ value: Number(this.preferredContactModel.getData()) }, { silent: true });
  },

  showNoChangesErrorMessage() {
    this.getUI('pageError').text("You must change at least one value to submit changes").show();
  },

  hideNoChangesErrorMessage() {
    this.getUI('pageError').text("").hide();
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));

    this.showChildView('touCheckboxRegion', new CheckboxView({ model: this.touCheckboxModel }));
    this.showChildView('emailRegion', new Email({ model: this.emailAddressModel, showOptOut: this.participant.get('no_email') !== 0 ? true : false }));
    this.showChildView('daytimePhoneRegion', new InputView({ model: this.daytimePhoneModel }));
    this.showChildView('otherPhoneRegion', new InputView({ model: this.otherPhoneModel }));
    this.showChildView('faxRegion', new InputView({ model: this.faxModel }));
    this.showChildView('preferredContactRegion', new DropdownView({ model: this.preferredContactModel }));
    this.showChildView('confirmEmailRegion', new InputView({ model: this.confirmEmailAddressModel })); 
  },

  templateContext() {
    return {
      TOU_template: TOU_template({ trialsText: TrialLogic_BIGEvidence.isTrialOngoing() ? TrialLogic_BIGEvidence.getTrialsTOUHtml() : null }),
      isInitialRespondentLogin: this.isInitialRespondentLogin,
      isInitialLogin: this.isInitialLogin,
      participant: this.participant,
      participantInitials: this.participant && this.participant.getInitialsDisplay() ? this.participant.getInitialsDisplay() : '-',
      isApplicant: this.participant.isApplicant(),
      isLandlord: this.participant.isLandlord(),
      displayConfirmEmail: this.showConfirmEmail,
      savedOtherPhoneVal: this.otherPhoneModel.get('placeholder'),
      currentOtherPhoneVal: this.otherPhoneModel.getData(),
      isOtherPhoneRemoved: this.otherPhoneRemoved,
      savedFaxVal: this.faxModel.get('placeholder'),
      currentFaxVal: this.faxModel.getData(),
      isFaxRemoved: this.faxRemoved,
      savedEmailVal: this.emailAddressModel.get('placeholder'),
      currentEmailVal: this.emailAddressModel.getData(),
      isEmailRemoved: this.emailRemoved,
      showContactPreferenceMethod: !this.participant.get('primary_contact_method') || Number(this.preferredContactModel.getData()) !== CONTACT_METHOD_EMAIL_CODE,
      showConfirmEmail: this.showConfirmEmail
    };
  }

});
