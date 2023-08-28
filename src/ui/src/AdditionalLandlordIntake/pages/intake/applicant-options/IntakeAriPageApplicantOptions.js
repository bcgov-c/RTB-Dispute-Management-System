import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import EmailView from '../../../../core/components/email/Email';
import InputModel from '../../../../core/components/input/Input_model';
import RadioView from '../../../../core/components/radio/Radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import ParticipantModel from '../../../../core/components/participant/Participant_model';
import template from './IntakeAriPageApplicantOptions_template.tpl';
import ModalEmailVerification from '../../../../core/components/email-verification/ModalEmailVerification';

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const applicationChannel = Radio.channel('application');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

export default PageView.extend({
  template,

  // Don't use the 'ui' hash for this because we have to search it dynamically
  JUNK_MAIL_MESSAGE_CLASS: 'junk-email-msg',
  RADIO_SEPARATOR_SELECTOR: '.intake-radio-separator',
  EMAIL_REGION: {
    name: 'emailRegion',
    id: 'p3-EmailValidate',
    selector: '#p3-EmailValidate'
  },

  regions: {
    primarySelectRegion: '#p3-PrimarySelect',
    documentsRegion: '#p3-Documents',
    consentRegion: '#p3-Consent'
  },

  getRoutingFragment() {
    return 'page/3';
  },

  PROVIDING_DOCUMENTS_TEXT: 'How should the Notice of Dispute Resolution Proceeding Package be provided to',
  PROVIDED_BY_EMAIL_TEXT: 'By email to ',
  PROVIDED_BY_EMAIL_TEXT_NOT_VERIFIED: `By email (recommended). Please ensure we have the correct email for `,

  // If we are moving on, remove front-end applicants we added
  cleanupPageInProgress() {
    // Clean up ones that were added
    const applicants = participantsChannel.request('get:applicants'),
      claimGroupParticipants = participantsChannel.request('get:applicants:claimGroupParticipants');

    _.each(_.union(applicants.models, claimGroupParticipants.models), function(model) {
      if (model && typeof model.needsApiUpdate === 'function' && model.needsApiUpdate()) {
        if (typeof model.resetModel === 'function') {
          model.resetModel();
        }
      }
    });

  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 3);
  },


  showEmailInput() {
    if (!this.$(this.EMAIL_REGION.selector) || !this.$(this.EMAIL_REGION.selector).length) {
      this.$(this.RADIO_SEPARATOR_SELECTOR).before(`
        <p class="${this.JUNK_MAIL_MESSAGE_CLASS}">You will be receiving e-mails directly from the Residential Tenancy Branch with important information and documents. It is important to check your Junk e-mail folders and add noreply.rtb@gov.bc.ca to your preferred contacts when possible.</p>
        <div id="${this.EMAIL_REGION.id}"></div>
      `);
    }

    if (!this.$(this.EMAIL_REGION.selector) || !this.$(this.EMAIL_REGION.selector).length) {
      console.log(`[Error] Couldn't show email input`, this);
      return;
    }

    console.log(this.getRegion(this.EMAIL_REGION.name));
    let emailRegion = this.getRegion(this.EMAIL_REGION.name);
    console.log(emailRegion);
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
      $(`.${this.JUNK_MAIL_MESSAGE_CLASS}`).remove();
    }
    this.$(this.EMAIL_REGION.selector).remove();
  },


  createPageItems() {
    const applicants = participantsChannel.request('get:applicants');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const currentlySelectedApplicant = applicants.at( primaryApplicant && applicants.indexOf(primaryApplicant) ? applicants.indexOf(primaryApplicant) : 0 );

    const primaryApplicantsRadioModel = new RadioModel({
      optionData: _.sortBy(applicants.map(function(applicant, index) {
        return {
          value: index,
          text: `${applicant.getDisplayName()}`,
          subtext: `${applicant.getTypeDisplay()}`
        };
      }), option => option.value),
      name: `primary-applicant`,
      required: true,
      value: applicants.indexOf(currentlySelectedApplicant),
      cssClass: 'radio-table',
      helpName: 'Primary applicant',
      helpHtml: null,
    });

    this.addPageItem('primarySelectRegion', new PageItemView({
      stepText: 'Who will be the primary applicant for this dispute?',
      subView: new RadioView({ model: primaryApplicantsRadioModel }),
      stepComplete: primaryApplicantsRadioModel.isValid(),
      helpHtml: 'This is the first point of contact of the applicant(s) who is responsible for serving documents on all parties and who the Residential Tenancy Branch will contact about this dispute file.'
    }));

    const providingDocumentsRadioModel = new RadioModel({
      optionData: [],
      name: `documents-provided`,
      required: true,
      value: primaryApplicant && primaryApplicant.get('package_delivery_method') ? primaryApplicant.get('package_delivery_method') : null,
      cssClass: 'hearing-options',
      helpName: 'Providing documents',
      helpHtml: null,
      apiMapping: 'package_delivery_method'
    });

    this.addPageItem('documentsRegion', new PageItemView({
      stepText: 'How will the documents be provided?',
      subView: new RadioView({ model: providingDocumentsRadioModel }),
      stepComplete: providingDocumentsRadioModel.isValid()
    }));

    const consentModel = new CheckboxModel({
      html: 'I certify that I am the applicant or an authorized agent of the applicant, that all of the information that is being provided in this application is true, correct and complete to the best of my knowledge and I understand it is a legal offense to provide false or misleading information to the Residential Tenancy Branch',
      value: 1,
      required: true,
      disabled: currentlySelectedApplicant.get('accepted_tou'),
      checked: currentlySelectedApplicant.get('accepted_tou')
    });

    this.addPageItem('consentRegion', new PageItemView({
      stepText: 'Read the following carefully and select the checkbox to agree',
      subView: new CheckboxView({ model: consentModel }),
      stepComplete: consentModel.isValid()
    }));

    this.emailValidationModel = new InputModel({
      labelText: 'Re-enter email',
      inputType: 'email',
      required: true,
      errorMessage: 'Please confirm email address'
    });

    this.first_view_id = applicants.length > 1 ? 'primarySelectRegion' : 'documentsRegion';
  },


  getProvideEmailMessageFor(primaryApplicant) {
    return !primaryApplicant.get('email_verified') ? `${this.PROVIDED_BY_EMAIL_TEXT_NOT_VERIFIED} ${primaryApplicant.getDisplayName()} by entering it again below.` :
        `${this.PROVIDED_BY_EMAIL_TEXT} ${primaryApplicant.getDisplayName()} (${primaryApplicant.get('email')})`;
  },

  onPrimaryApplicantChange(model, value) {
    const applicants = participantsChannel.request('get:applicants');

    if (value) {
      console.log(applicants, value);
    }
    const primaryApplicant = applicants.at(value);
    participantsChannel.request('set:primaryApplicant', primaryApplicant);

    const optionData = [];

    // Clear any entered email value if primary applicant is changed
    this.emailValidationModel.set('value', null, {silent: true});

    if ($.trim(primaryApplicant.get('email'))) {
      const applicantName = primaryApplicant.getDisplayName();
      this.emailValidationModel.set({
        primaryApplicantEmail: $.trim(primaryApplicant.get('email')),
        primaryApplicantName: applicantName,
        labelText: applicantName ? `Re-enter email for ${applicantName}` : 'Re-enter email address'
      });
      optionData.push({
        name: 'hearing-options',
        value: configChannel.request('get', 'SEND_METHOD_EMAIL'),
        text: this.getProvideEmailMessageFor(primaryApplicant)
      });
    } else {
      this.emailValidationModel.set({
        primaryApplicantEmail: null,
        primaryApplicantName: null
      });
    }
    if (!_.isEmpty(optionData)) {
      _.last(optionData).separatorHtml = '<div class="intake-radio-separator">Other available options</div>';
    }
    optionData.push({name: 'hearing-options', value: configChannel.request('get', 'SEND_METHOD_PICKUP'), text: 'They will be picked up at a <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc">Service BC Office</a> or the <a class="static-external-link" href="javascript:;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Burnaby Residential Tenancy Branch office</a>.'});

    const documentsPageItem = this.getPageItem('documentsRegion'),
      documentsRadioView = documentsPageItem.subView,
      documentsRadioModel = documentsRadioView.model;

    documentsPageItem.stepText = `${this.PROVIDING_DOCUMENTS_TEXT} ${primaryApplicant.getDisplayName()}?`;
    documentsRadioModel.set({
      optionData: optionData,
      value: primaryApplicant && primaryApplicant.get('package_delivery_method') ? primaryApplicant.get('package_delivery_method') : null
    }, {silent: true});

    documentsPageItem.render();
    documentsRadioModel.trigger('change:value', documentsRadioModel, documentsRadioModel.get('value'));
  },


  setupListenersBetweenItems() {
    const primarySelectPageItem = this.getPageItem('primarySelectRegion'),
      primarySelectRadioView = primarySelectPageItem.subView,
      primarySelectRadioModel = primarySelectRadioView.model,

      documentsPageItem = this.getPageItem('documentsRegion'),
      documentsView = documentsPageItem.subView,
      documentsModel = documentsView.model,

      consentPageItem = this.getPageItem('consentRegion'),
      consentView = consentPageItem.subView,
      consentModel = consentView.model,

      applicants = participantsChannel.request('get:applicants');


    this.listenTo(primarySelectRadioModel, 'change:value', this.onPrimaryApplicantChange, this);

    this.listenTo(documentsModel, 'change:value', function(model, value) {
      const api_data = model.getPageApiDataAttrs();
      applicants.each(function(applicant) {
        applicant.set(api_data);
      });

      if (value === configChannel.request('get', 'SEND_METHOD_EMAIL')) {
        // Only show email if they have not yet confirmed
        const primaryApplicant = participantsChannel.request('get:primaryApplicant');
        if (primaryApplicant && !primaryApplicant.get('email_verified')) {
          this.showEmailInput();
        }
      } else {
        this.hideEmailInput();
      }
    }, this);

    this.listenTo(consentModel, 'change:checked', function(model, value) {
      if (value) {
        applicants.each(function(applicant) {
          applicant.set({
            accepted_tou: true,
            accepted_tou_date: Moment()
          });
        });
      }
    }, this);
  },

  setupFlows() {
    const primarySelectPageItem = this.getPageItem('primarySelectRegion');
    const documentsProvidedPageItem = this.getPageItem('documentsRegion');
    const consentPageItem = this.getPageItem('consentRegion');

    this.listenTo(primarySelectPageItem, 'itemComplete', function(options) {
      if (primarySelectPageItem.stepComplete) {
        this.showPageItem('documentsRegion', options);
      }
    }, this);

    this.listenTo(documentsProvidedPageItem, 'itemComplete', function(options) {
      if (documentsProvidedPageItem.stepComplete) {
        if (consentPageItem.stepComplete) {
          this.showPageItem('consentRegion', options);
        } else {
          this.showPageItem('consentRegion', options);
        }
      }
    }, this);

    this.listenTo(consentPageItem, 'itemComplete', function(options) {
      if (consentPageItem.stepComplete) {
        this.showNextButton(_.extend({}, options, {no_animate: true}));
      }
    }, this);
  },


  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Do an initial run to get correct primary data selection
    const primarySelectRegion = this.getPageItem('primarySelectRegion'),
      primarySelectView = primarySelectRegion.subView,
      primarySelectModel = primarySelectView.model;

    this.onPrimaryApplicantChange(primarySelectModel, primarySelectModel.get('value'));

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  templateContext() {
    return {
      hasOneApplicant: participantsChannel.request('get:applicants').length === 1
    };
  },

  previousPage() {
    Backbone.history.navigate('page/2', {trigger: true});
  },

  saveInternalDataToModel() {
    const applicants = participantsChannel.request('get:applicants');
    const consentModel = this.getPageItem('consentRegion')?.getModel();
    const documentsModel = this.getPageItem('documentsRegion')?.getModel();

    applicants.forEach(applicant => {
      applicant.set(Object.assign({
        accepted_tou: !!consentModel?.getData(),
        accepted_tou_date: consentModel?.getData() ? Moment() : null,
      }, documentsModel?.getPageApiDataAttrs()))
    });
  },

  getPageApiUpdates() {
    const all_xhr = [],
      claim_group_participants = participantsChannel.request('get:applicants:claimGroupParticipants'),
      applicants = participantsChannel.request('get:applicants'),
      primaryApplicant = participantsChannel.request('get:primaryApplicant');

    if (primaryApplicant.get('package_delivery_method') === configChannel.request('get', 'SEND_METHOD_EMAIL')) {
      primaryApplicant.set('email_verified', true);
    }

    _.each(_.union(claim_group_participants, applicants.models), function(model) {
      const changes = model.getApiChangesOnly();
      if (changes && !_.isEmpty(changes)) {
        all_xhr.push( _.bind(model.save, model, changes) );
      }
    });

    // Create the file package here if it didn't exist
    if (!filesChannel.request('get:filepackage:intake')) {
      all_xhr.push( _.bind(filesChannel.request, filesChannel, 'create:filepackage:intake') );
    }

    return all_xhr;
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
        const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
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

  nextPage() {
    if (!this.validatePage() || !this.validateEmailMatches({ no_scroll: true })) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const onNextSuccessFn = function() {
      applicationChannel.trigger('progress:step:complete', 3);
      Backbone.history.navigate('page/4', {trigger: true});
    };

    const saveApplicantOptions = () => {
      const all_xhr = this.getPageApiUpdates();  

      if (all_xhr.length === 0) {
        console.log("[Info] No changes to the Participants or Claim Group Participants.  Moving to next page");
        onNextSuccessFn();
        return;
      }
  
      loaderChannel.trigger('page:load');
      Promise.all(all_xhr.map(xhr => xhr())).then(() => {
        loaderChannel.trigger('page:load:complete');
        onNextSuccessFn();
      }, this.createPageApiErrorHandler(this, 'INTAKE.PAGE.NEXT.APPLICANT_OPTIONS'));
    }

    const documentsPageItem = this.getPageItem('documentsRegion');
    const selectedDocOption = documentsPageItem.subView.model.getData();
    const applicants = participantsChannel.request('get:applicants');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const currentlySelectedApplicant = applicants.at( primaryApplicant && applicants.indexOf(primaryApplicant) ? applicants.indexOf(primaryApplicant) : 0 );

    if (selectedDocOption === configChannel.request('get', 'SEND_METHOD_EMAIL') && !currentlySelectedApplicant.get('email_verified')) {
      const emailVerificationModal = new ModalEmailVerification({ participantSaveModel: ParticipantModel, participant: currentlySelectedApplicant, fetchParticipantAfterVerification: true });
      modalChannel.request('add', emailVerificationModal);

      this.listenTo(emailVerificationModal, 'removed:modal', () => {
        // Email validation can refresh the participant and cause changes on this page to be lost before save.
        // Ensure page changes are applied to local models before trying to save models.
        this.saveInternalDataToModel();
        saveApplicantOptions();
      });
    } else {
      saveApplicantOptions();
    }
  }
});
