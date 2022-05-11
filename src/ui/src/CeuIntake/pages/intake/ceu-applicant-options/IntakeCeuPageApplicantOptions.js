import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageItemView from '../../../../core/components/page/PageItem';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import InputModel from '../../../../core/components/input/Input_model';
import EmailView from '../../../../core/components/email/Email';
import CeuPage from '../../../components/page/CeuPage';

const PROVIDING_DOCUMENTS_TEXT = 'How should the Compliance and Enforcement Unit contact';
const PROVIDED_BY_EMAIL_TEXT = 'By email to ';
const PROVIDED_BY_EMAIL_TEXT_NOT_VERIFIED = `By email (recommended). Please ensure we have the correct email for `;

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

const IntakeCeuPageApplicantOptions = CeuPage.extend({
  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    this.applicants = IntakeCeuDataParser.getApplicantCollection();
    this.submitters = IntakeCeuDataParser.getSubmitterCollection();

    this.CEU_CONTACT_METHOD_EMAIL = configChannel.request('get', 'CEU_CONTACT_METHOD_EMAIL');

    const CEU_PARTICIPANT_CONTACT_NONE = configChannel.request('get', 'CEU_PARTICIPANT_CONTACT_NONE');
    this.allApplicants = [...this.submitters.models, ...this.applicants.models];
    this.applicantsWithContact = this.allApplicants.filter(a => a.get('p_contact_info_selection') && a.get('p_contact_info_selection') !== CEU_PARTICIPANT_CONTACT_NONE);
    this.savedPrimaryApplicant = this.applicantsWithContact.find(a => a.get('p_is_primary_applicant'));
    this.savedContactMethod = this.savedPrimaryApplicant?.get('p_primary_contact_method');
    
    this.createPageItems();
    this.setupListeners();
    
    applicationChannel.trigger('progress:step', 3);
  },

  getPageApiUpdates() {
    const currentPrimaryApplicant = this.allApplicants.find(a => a.get('p_is_primary_applicant'));
    const hasUnsavedChanges = !this.savedPrimaryApplicant ? false : (
      (!currentPrimaryApplicant && this.savedPrimaryApplicant)
      || (currentPrimaryApplicant.id !== this.savedPrimaryApplicant.id)
      || (currentPrimaryApplicant.get('p_primary_contact_method') !== this.savedContactMethod)
    );
    return hasUnsavedChanges ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/3';
  },

  createPageItems() {
    const primaryApplicant = this.applicantsWithContact.find(a => a.get('p_is_primary_applicant'));
    const currentlySelectedApplicant = this.applicantsWithContact.at(primaryApplicant && this.applicantsWithContact.indexOf(primaryApplicant) ? this.applicantsWithContact.indexOf(primaryApplicant) : 0 );

    this.primaryApplicantsRadioModel = new RadioModel({
      optionData: _.sortBy(this.applicantsWithContact.map(function(a, index) {
        return {
          value: index,
          text: `${a.getDisplayName()}${a.get('p_business_name')?` - ${a.getContactName()}`:''} (${a.getTypeDisplay()})`,
        };
      }), option => option.value),
      name: `primary-applicant`,
      required: true,
      value: this.applicantsWithContact.indexOf(currentlySelectedApplicant),
      cssClass: 'radio-table',
      helpName: 'Primary applicant',
      helpHtml: null,
    });

    this.contactMethodModel = new RadioModel({
      optionData: [],
      name: `documents-provided`,
      required: true,
      value: primaryApplicant && primaryApplicant.get('p_primary_contact_method') ? primaryApplicant.get('p_primary_contact_method') : null,
      cssClass: 'hearing-options',
      helpName: 'Providing documents',
      helpHtml: null,
      apiMapping: 'p_primary_contact_method'
    });

    this.consentModel = new CheckboxModel({
      html: `I certify that all information that I am providing in this complaint is true, correct, and complete to the best of my knowledge. I understand that under the <i>Residential Tenancy Act</i> and the <i>Manufactured Home Park Tenancy Act</i> administrative penalties of up to $5,000 may be imposed if I give false or misleading information in an investigation conducted by the Compliance and Enforcement Unit of the Residential Tenancy Branch.`,
      required: true,
      disabled: currentlySelectedApplicant.get('p_accepted_tou'),
      checked: currentlySelectedApplicant.get('p_accepted_tou')
    });

    this.emailValidationModel = new InputModel({
      labelText: 'Re-enter email',
      inputType: 'email',
      required: true,
      errorMessage: 'Please confirm email address'
    });

    this.addPageItem('primarySelectRegion', new PageItemView({
      stepText: 'Who should the Compliance and Enforcement Unit contact if more information is required?',
      subView: new RadioView({ model: this.primaryApplicantsRadioModel }),
      stepComplete: this.primaryApplicantsRadioModel.isValid(),
      helpHtml: null,
      forceVisible: true,
    }));

    this.addPageItem('contactMethodRegion', new PageItemView({
      stepText: 'How should the Compliance and Enforcement Unit contact this individual?',
      subView: new RadioView({ model: this.contactMethodModel }),
      stepComplete: this.contactMethodModel.isValid(),
      forceVisible: true,
    }));

    this.addPageItem('consentRegion', new PageItemView({
      stepText: 'Read the following carefully and select the checkbox to agree',
      subView: new CheckboxView({ model: this.consentModel }),
      stepComplete: this.consentModel.isValid(),
      forceVisible: true,
    }));
  },

  setupListeners() {
    this.listenTo(this.primaryApplicantsRadioModel, 'change:value', this.onPrimaryApplicantChange, this);

    this.listenTo(this.contactMethodModel, 'change:value', function(model, value) {
      const api_data = model.getPageApiDataAttrs();
      this.allApplicants.forEach(function(applicant) { applicant.set(api_data); });

      if (value === this.CEU_CONTACT_METHOD_EMAIL) {
        // Only show email if they have not yet confirmed
        const primaryApplicant = this.allApplicants.find(a => a.get('p_is_primary_applicant'));
        if (primaryApplicant && !primaryApplicant.get('p_email_verified')) {
          this.showEmailInput();
        }
      } else {
        this.hideEmailInput();
      }
    }, this);

    this.listenTo(this.consentModel, 'change:checked', function(model, value) {
      if (value) {
        this.allApplicants.forEach(function(applicant) {
          applicant.set({
            p_accepted_tou: true,
            p_accepted_tou_date: Moment()
          });
        });
      }
    }, this);
  },

  getProvideEmailMessageFor(primaryApplicant) {
    return !primaryApplicant.get('p_email_verified') ? `${PROVIDED_BY_EMAIL_TEXT_NOT_VERIFIED} ${primaryApplicant.getContactName()} by entering it again below` :
        `${PROVIDED_BY_EMAIL_TEXT} ${primaryApplicant.getContactName()} (${primaryApplicant.get('email')})`;
  },

  onPrimaryApplicantChange(model, value) {
    const primaryApplicant = this.applicantsWithContact.at(value);
    // Set primary
    this.allApplicants.forEach(app => {
      app.set('p_is_primary_applicant', (app.id === primaryApplicant.id));
    });

    const optionData = [];

    // Clear any entered email value if primary applicant is changed
    this.emailValidationModel.set('value', null, {silent: true});

    if ($.trim(primaryApplicant.get('email'))) {
      const applicantName = primaryApplicant.getContactName();
      this.emailValidationModel.set({
        primaryApplicantEmail: $.trim(primaryApplicant.get('email')),
        primaryApplicantName: applicantName,
        labelText: applicantName ? `Re-enter email for ${applicantName}` : 'Re-enter email address'
      });
      optionData.push({
        name: 'hearing-options',
        value: this.CEU_CONTACT_METHOD_EMAIL,
        text: this.getProvideEmailMessageFor(primaryApplicant)
      });
    } else {
      this.emailValidationModel.set({
        primaryApplicantEmail: null,
        primaryApplicantName: null
      });
    }

    if (primaryApplicant.get('p_address') || primaryApplicant.get('p_primary_phone')) {
      if (!_.isEmpty(optionData)) {
        _.last(optionData).separatorHtml = '<div class="intake-radio-separator">Other available options</div>';
      }
      optionData.push({name: 'hearing-options', value: configChannel.request('get', 'CEU_CONTACT_METHOD_PHONE'), text: 'By phone or mail'});
    }

    const contactMethodPageItem = this.getPageItem('contactMethodRegion');

    contactMethodPageItem.stepText = `${PROVIDING_DOCUMENTS_TEXT} ${primaryApplicant.getContactName()}?`;
    this.contactMethodModel.set({
      optionData: optionData,
      value: primaryApplicant && primaryApplicant.get('p_primary_contact_method') && optionData.map(opt=>opt.value).indexOf(primaryApplicant.get('p_primary_contact_method')) !== -1 ?
          primaryApplicant.get('p_primary_contact_method') : null
    }, {silent: true});

    contactMethodPageItem.render();
    this.contactMethodModel.trigger('change:value', this.contactMethodModel, this.contactMethodModel.get('value'));
  },

  showEmailInput() {
    if (!this.$(this.EMAIL_REGION.selector) || !this.$(this.EMAIL_REGION.selector).length) {
      this.$(`input[name=hearing-options][value=${this.CEU_CONTACT_METHOD_EMAIL}]`).closest('label').after(`<div id="${this.EMAIL_REGION.id}"></div>`);
    }

    if (!this.$(this.EMAIL_REGION.selector) || !this.$(this.EMAIL_REGION.selector).length) {
      return;
    }

    let emailRegion = this.getRegion(this.EMAIL_REGION.name);
    if (emailRegion) {
      // Always remove the region first, and re-make it
      this.removeRegion(this.EMAIL_REGION.name);
    }
    this.addRegion(this.EMAIL_REGION.name, this.EMAIL_REGION.selector);
    emailRegion = this.getRegion(this.EMAIL_REGION.name);

    this.addPageItem(this.EMAIL_REGION.name, new PageItemView({
      stepText: null,
      subView: new EmailView({
        showOptOut: false,
        model: this.emailValidationModel
      }),
      stepComplete: this.emailValidationModel.isValid()
    }));

    this.showPageItem(this.EMAIL_REGION.name, {no_animate: true, no_scroll: true});

    const emailPageItem = this.getPageItem(this.EMAIL_REGION.name);

    // When the subview loses focus, check the email right away against what was entered previously
    this.listenTo(emailPageItem.subView, 'blur', function() {
      const value = this.emailValidationModel.get('value');
      if ($.trim(value) !== '' && emailPageItem && emailPageItem.isActive()) {
        this.validateEmailMatches();
      }
    }, this);

  },

  hideEmailInput() {
    const emailRegion = this.getRegion(this.EMAIL_REGION.name);
    if (emailRegion) {
      this.removeRegion(this.EMAIL_REGION.name);
    }
    this.$(this.EMAIL_REGION.selector).remove();
  },

  validateEmailMatches(options) {
    options = options || {};
    // Extra validation check that the emailValidation matches:
    const emailPageItem = this.getPageItem(this.EMAIL_REGION.name);
    if (emailPageItem && emailPageItem.isActive() && $.trim(this.emailValidationModel.get('primaryApplicantEmail'))) {
      if ($.trim(this.emailValidationModel.get('primaryApplicantEmail')).toLowerCase() !== $.trim(this.emailValidationModel.get('value')).toLowerCase()) {
        emailPageItem.subView.showErrorMessage('Does not match email provided previously.  Please re-enter or go back and validate the email address provided for applicant');
        if (options && options.no_scroll) {
          return false;
        }
        const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
        if (visible_error_eles.length === 0) {
          console.log(`[Warning] Page not valid, but no visible error message found`);
        } else {
          animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
        }
        return false;
      }
    }

    return true;
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);
    this.onPrimaryApplicantChange(this.primaryApplicantsRadioModel, this.primaryApplicantsRadioModel.get('value'));
  },

  previousPage() {
    Backbone.history.navigate('#page/2', {trigger: true});
  },

  nextPage() {
    if (!this.validatePage() || !this.validateEmailMatches({ no_scroll: true })) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }
    
    loaderChannel.trigger('page:load');
    const primaryApplicant = this.applicantsWithContact.find(a => a.get('p_is_primary_applicant'));
    if (primaryApplicant && this.contactMethodModel.getData() === this.CEU_CONTACT_METHOD_EMAIL) {
      primaryApplicant.set('p_email_verified', true);
    }

    IntakeCeuDataParser.setApplicantCollection(this.applicants);
    IntakeCeuDataParser.setSubmitterCollection(this.submitters);

    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      this.savedPrimaryApplicant = primaryApplicant;
      this.savedContactMethod = this.savedPrimaryApplicant?.get('p_primary_contact_method');
      applicationChannel.trigger('progress:step:complete', 3);
      Backbone.history.navigate('#page/4', {trigger: true});
    }).fail(this.createPageApiErrorHandler(this));
  },

  className: `${CeuPage.prototype.className} intake-ceu-p3`,

  RADIO_SEPARATOR_SELECTOR: '.intake-radio-separator',
  EMAIL_REGION: {
    name: 'emailRegion',
    id: 'p3-EmailValidate',
    selector: '#p3-EmailValidate'
  },

  regions: {
    primarySelectRegion: '#p3-PrimarySelect',
    contactMethodRegion: '#p3-Documents',
    consentRegion: '#p3-Consent'
  },

  template() {
    const showApplicantSelect = this.applicantsWithContact.length > 1;
    return <>
      <div id="p3-PrimarySelect" className={`${showApplicantSelect ? '' : 'hidden'} primary-applicant-select`}></div>
      <div id="p3-Documents" className="documents-provided"></div>
      <div id="p3-Consent" className="consent-options"></div>
      
      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="submit">BACK</button>
          <button className="navigation option-button step-next" type="submit">NEXT</button>
      </div>
    </>

  }
});

_.extend(IntakeCeuPageApplicantOptions.prototype, ViewJSXMixin);
export default IntakeCeuPageApplicantOptions;