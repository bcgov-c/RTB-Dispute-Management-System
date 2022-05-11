import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import AddressView from '../../../core/components/address/Address';
import AddressModel from '../../../core/components/address/Address_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import EmailView from '../../../core/components/email/Email';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import template from './DisputeParty_template.tpl';
import ModalAmendmentConfirmView from '../../components/amendments/ModalAmendmentConfirm';
import ModalManageSubServiceView from './modals/ModalManageSubService';
import DoubleSelectorModel from '../../../core/components/double-selector/DoubleSelector_model';
import DoubleSelectorView from '../../../core/components/double-selector/DoubleSelector';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import Backbone from 'backbone';

const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const amendmentChannel = Radio.channel('amendments');
const modalChannel = Radio.channel('modals');
const noticeChannel = Radio.channel('notice');
const Formatter = Radio.channel('formatter').request('get');
const sessionChannel = Radio.channel('session');

export default Marionette.View.extend({
  template,
  className: 'dispute-party-container two-column-edit-container review-information-body',

  regions: {
    unitTypeRegion: '.review-participant-rent-unit',
    participantType: '.review-participant-type',
    hearingOptionsByRegion: '.review-participant-hearing-options-by',
    businessName: '.review-participant-business-name',
    firstName: '.review-participant-first',
    lastName: '.review-participant-last',
    businessContactFirstName: '.review-participant-contact-first',
    businessContactLastName: '.review-participant-contact-last',
    addressRegion: '.review-participant-address',
    emailRegion: '.review-participant-email',
    daytimePhoneRegion: '.review-participant-daytime-phone',
    otherPhoneRegion: '.review-participant-other-phone',
    faxRegion: '.review-participant-fax',
    statusRegion: '.review-participant-status',
    contactMethodRegion: '.review-participant-contact-method',
    mailAddressRegion: '.review-participant-mail-address',
    touAcceptedRegion: '.review-participant-tou',
    touDateRegion: '.review-participant-tou-date'
  },

  ui: {
    partyName: '.review-applicant-name',
    partyBusinessName: '.participant-business-name',
    partyContactName: '.review-applicant-contact-name',
  },

  showDeleteConfirmModal() {
    const files = filesChannel.request('get:files');
    const collection = this.model.collection;
    const onCompleteFn = (() => {
      this.refreshList(collection);
      loaderChannel.trigger('page:load:complete');
    }).bind(this);
    modalChannel.request('show:standard', {
      title: `Delete ${this.model.getDisplayName()}?`,
      bodyHtml: `<p>Warning - this will delete <b>${this.model.getDisplayName()}</b>.  Once deleted this person will only be displayed in areas where they have other data associated to them (i.e. hearing participant, notice service). If this participant has associated evidence files, they will no longer be visible after this participant is deleted.`
      + `<p>Associated evidence: <b>${files.filter(f => {
        const fileDescriptions = filesChannel.request('get:filedescriptions:from:file', f);        
        const isClaimRemoved = _.any(fileDescriptions, fileD => {
          const claim = claimsChannel.request('get:claim', fileD.get('claim_id'));
          return claim && claim.isRemoved();
        });
        return !isClaimRemoved && f.get('file_package_id') && f.get('added_by') === this.model.id;
      }).length} files</b></p>`
      + `<p>This action cannot be undone.  Are you sure you want to delete <b>${this.model.getDisplayName()}</b>?</p>`,
      primaryButtonText: 'Delete',
      onContinueFn: (modal) => {
        modal.close();
        loaderChannel.trigger('page:load');
        participantsChannel.request('remove:participant', this.model)
          .done(onCompleteFn)
          .fail(
            generalErrorFactory.createHandler('ADMIN.PARTY.REMOVE', onCompleteFn)
          );
      }
    });
  },

  showRemoveConfirmModal() {
    const files = filesChannel.request('get:files');
    const modal = new ModalAmendmentConfirmView({
      title: `Delete ${this.model.getDisplayName()}?`,
      bodyHtml: `<p>Warning - this will remove <b>${this.model.getDisplayName()}</b> and store the change as an amendment.  Amendments must be served to responding parties.  After removing this participant, they will be indicated as removed through amendment in the dispute view, but will no longer be viewable there.  Any evidence associated to this participant will still be visible in the evidence view but it will be displayed as removed.`
        + `&nbsp;Once removed, this participant will be removed from the dispute view and listed at the top as removed.  This action cannot be undone.</p>`
        + `<p>Associated evidence: <b>${files.filter(f => {
          const fileDescriptions = filesChannel.request('get:filedescriptions:from:file', f);        
          const isClaimRemoved = _.any(fileDescriptions, fileD => {
            const claim = claimsChannel.request('get:claim', fileD.get('claim_id'));
            return claim && claim.isRemoved();
          });
          return !isClaimRemoved && f.get('file_package_id') && f.get('added_by') === this.model.id;
        }).length} files</b></p>`
        + `<p>This action cannot be undone.  Are you sure you want to remove <b>${this.model.getDisplayName()}</b>?</p>`,
    });

    this.listenToOnce(modal, 'save', function(amendment_data) {
      modal.close();
      loaderChannel.trigger('page:load');
      const selection_string = this.model.isApplicant() ? 'applicant' : this.model.isRespondent() ? 'respondent' : 'party';
      const collection = this.model.collection;
      const onCompleteFn = () => {
        this.refreshList(collection);
        loaderChannel.trigger('page:load:complete');
      };
      amendmentChannel.request(`remove:${selection_string}`, this.model, amendment_data)
        .done(() => {
          participantsChannel.request('remove:participant', this.model, { amend: true })
            .done(onCompleteFn)
            .fail( generalErrorFactory.createHandler('ADMIN.PARTY.AMEND_REMOVE', onCompleteFn) )
        })
        .fail( generalErrorFactory.createHandler('ADMIN.AMENDMENT.PARTY.REMOVE', onCompleteFn) )
    }, this);

    modalChannel.request('add', modal);
  },

  _applyPageModelChanges(childViewsToSave) {
    _.each(childViewsToSave, function(component_name) {
      const component = this.getChildView(component_name);
      if (component.subView && component.getApiData) {
        this.model.set(component.getApiData());
      }
    }, this);
  },

  _saveModel() {
    // Always un-set edit mode before API save
    if (this.dispute && this.dispute.checkEditInProgressModel(this.model)) {
      this.dispute.stopEditInProgress();
    }
    
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        this.reinitialize();
        this.trigger('contextRender');
        loaderChannel.trigger('page:load:complete');
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.PARTY.SAVE', () => {
          loaderChannel.trigger('page:load');
          setTimeout(() => {
            this.model.resetModel();
            this.reinitialize();
            this.trigger('contextRender');
          }, 25);
        })
      );
  },

  _saveAmendment(change_type, amendment_data) {
    const change_data = this.model.getApiChangesOnly();
    if (!change_data || _.isEmpty(change_data)) {
      this.reinitialize();
      loaderChannel.trigger('page:load:complete');
      return;
    }
    
    amendmentChannel.request(change_type, this.model, amendment_data)
      .done(() => {
        this.model.set('is_amended', true);
        this._saveModel();
      }).fail(
        generalErrorFactory.createHandler('ADMIN.AMENDMENT.PARTY', () => {
          this.reinitialize();
          loaderChannel.trigger('page:load:complete');
        })
      );
  },

  validateAndShowErrors(childViewsToSave) {
    let is_valid = true;
    _.each(childViewsToSave, function(component_name) {
      const component = this.getChildView(component_name);
      if (component.isActive()) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  _makePrimary() {
    const errorHandler = generalErrorFactory.createHandler('ADMIN.PARTY.PRIMARY', () => {
      this.refreshList();
      loaderChannel.trigger('page:load:complete');
    });
    const savePrimaryPromise = () => new Promise((res, rej) => participantsChannel.request('save:primaryApplicant', this.model).done(res).fail(rej));
    savePrimaryPromise()
    .then(() => {
      this.refreshList();
      loaderChannel.trigger('page:load:complete');
    })
    .catch(errorHandler);
  },

  onMenuDelete() {
    participantsChannel.request('check:participant:delete:modal', this.model)
      .then(() => this.showDeleteConfirmModal(), () => {});
  },

  onMenuRemove() {
    this.showRemoveConfirmModal();
  },


  onMenuMakePrimary() {
    loaderChannel.trigger('page:load');
    this._makePrimary();
  },


  onMenuMakePrimaryAmend() {
    const previousPrimaryModel = participantsChannel.request('get:primaryApplicant');
    const modal = new ModalAmendmentConfirmView({
      title: 'Change Primary Applicant?',
      bodyHtml: `<p>Warning - this will change the primary applicant to <b>${this.model.getDisplayName()}</b> and record an amendment.</p>
        <p>Are you sure you want to amend the primary applicant?</p>`
    });
    this.listenToOnce(modal, 'save', function(amendment_save_data) {
      modal.close();
      loaderChannel.trigger('page:load');
      amendmentChannel.request('change:primaryApplicant', previousPrimaryModel, this.model, amendment_save_data)
        .done(() => {
          if (previousPrimaryModel) {
            previousPrimaryModel.setAmended();
          }
          this.model.setAmended();
          this._makePrimary();
          loaderChannel.trigger('page:load:complete')
        })
        .fail(
          generalErrorFactory.createHandler('ADMIN.AMENDMENT.PARTY.PRIMARY', () => {
            this.refreshList();
            loaderChannel.trigger('page:load:complete')
          })
        );

    }, this);

    modalChannel.request('add', modal);
  },

  onMenuSubmitNameAmendment() {
    const isBusinessSelected = this.participantTypeEditModel.getData({ parse: true }) === configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS');
    // When business is selected, do not validate first/last names, name not added at this
    const childViews = isBusinessSelected ? this.amendNameBusinessEditGroup : this.amendNameEditGroup;
    this._validateAndSendChangeAmendment(`change:${this.isPrimary? 'primaryApplicant' : 'party'}:name`, childViews);
  },

  onMenuSubmitMailingAmendment() {
    this._validateAndSendChangeAmendment(`change:${this.isPrimary? 'primaryApplicant' : 'party'}:mailing`, this.amendMailingEditGroup);
  },

  onMenuSubmitAddressAmendment() {
    this._validateAndSendChangeAmendment(`change:${this.isPrimary? 'primaryApplicant' : 'party'}:address`, this.amendMailingEditGroup);
  },

  onMenuSubmitMailingAmendmentAdd() {
    this._validateAndSendChangeAmendment(`change:${this.isPrimary? 'primaryApplicant' : 'party'}:mailing`, this.amendAddMailingEditGroup);
  },

  onMenuManageSubservice() {
    this.openManageSubserviceWithEditCheck();
  },

  onMenuEmailAccessCode() {
    const requestData = {
      fileNumber: this.dispute.get('file_number'),
      email: this.participantEmailEditModel.getData()
    }

    loaderChannel.trigger('page:load');
    sessionChannel.request('recover:accesscode', requestData).then(() => {
      loaderChannel.trigger('page:load:complete');
    }).catch(generalErrorFactory.createHandler('ACCESS.TOKEN.RECOVERY', () => {
      loaderChannel.trigger('page:load:complete');
    }));
  },

  _openManageSubservice() {
    loaderChannel.trigger('page:load');
    // Always refresh the subservices on click to open sub services
    noticeChannel.request('load:subservices', this.dispute.id)
    .always(() => {
      loaderChannel.trigger('page:load:complete');
      const modalView = new ModalManageSubServiceView({ model: this.model });
      this.listenTo(modalView, 'removed:modal', () => {
        loaderChannel.trigger('page:load');
        Backbone.history.loadUrl(Backbone.history.fragment);
      });
      modalChannel.request('add', modalView);
    });
  },

  openManageSubserviceWithEditCheck() {
    if (!this.dispute || !_.isFunction(this.dispute.checkEditInProgressPromise)) {
      this._openManageSubservice();
      return;
    }

    this.dispute.checkEditInProgressPromise().then(
      this._openManageSubservice.bind(this),
      () => {
        this.dispute.showEditInProgressModalPromise()
      }
    ); 
  },

  _validateAndSendChangeAmendment(amendment_change, amendmentEditGroup) {
    this._applyPageModelChanges(amendmentEditGroup);
    if (_.isEmpty(this.model.getApiChangesOnly())) {
      // If not changes, then exit
      this._saveModel();
      return;
    }
    this.model.resetModel();

    if (this.validateAndShowErrors(amendmentEditGroup)) {
      const modal = new ModalAmendmentConfirmView({
        title: `Change ${this.model.getDisplayName()}?`,
        bodyHtml: `<p>Warning - this will change <b>${this.model.getDisplayName()}</b>, and store the change as an amendment.`
          + `&nbsp;Amendments must be served to responding parties.</p>`
          + `<p>Are you sure you want to make this amendment?`,
      });
  
      this.listenToOnce(modal, 'save', function(amendment_data) {
        modal.close();
        loaderChannel.trigger('page:load');
        this._applyPageModelChanges(amendmentEditGroup);
        this._saveAmendment(amendment_change, amendment_data);
      }, this);
  
      modalChannel.request('add', modal);
    }
  },

  onMenuSavePreNotice() {
    if (this.validateAndShowErrors(this.preNoticeEditGroup)) {
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges(this.preNoticeEditGroup);
      this._saveModel();
    }
  },

  onMenuSavePostNotice() {
    if (this.validateAndShowErrors(this.postNoticeEditGroup)) {
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges(this.postNoticeEditGroup);
      this._saveModel();
    }
  },

  onMenuAmendAddressEdit() {
    this.switchToAmendState(this.amendMailingEditGroup);
  },

  onMenuAmendMailingEdit() {
    this.switchToAmendState(this.amendMailingEditGroup);
  },

  onMenuAmendMailingAdd() {
    this.switchToAmendState(this.amendAddMailingEditGroup);
  },

  onMenuAmendNameEdit() {
    this.switchToAmendState(this.amendNameEditGroup);
  },

  onMenuEditPreNotice() {
    this.switchToPreNoticeEditState();
  },

  onMenuEditPostNotice() {
    this.switchToPostNoticeEditState();
  },

  switchToAmendState(amendEditGroup) {
    // Dispute Party (non-support) primary can only switch between individual/business
    if (this.model.isPrimary() && !this.model.isAssistant()) {
      this.participantTypeEditModel.set({
        optionData: this.getDefaultParticipantTypeOptions().slice(0, 2),
        required: true
      });
      this.participantTypeEditModel.trigger('render');
    }

    _.each(amendEditGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },


  resetModelValues() {
    this.participantTypeEditModel.set({
      optionData: this.getDefaultParticipantTypeOptions(),
      value: this.model.get('participant_type') ? String(this.model.get('participant_type')) : null,
    });
    if (!this.model.get('country')) this.addressEditModel.get('countryDropdownModel').set('value', '');
    if (!this.model.get('province_state')) this.addressEditModel.get('provinceDropdownModel').set('value', '');
  },

  switchToPreNoticeEditState() {
    // Default country/province to Canada/BC on office applicant, when those fields not yet set
    if (this.dispute.isCreatedExternal() && this.model.isApplicant() && !this.model.get('country') && !this.model.get('province_state')) {
      this.addressEditModel.get('countryDropdownModel').set('value', 'Canada');
      this.addressEditModel.get('provinceDropdownModel').set('value', 'British Columbia');
    }

    _.each(this.preNoticeEditGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  switchToPostNoticeEditState() {
    _.each(this.postNoticeEditGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  getBusinessName() {
    const businessName = this.model.isBusiness() ? this.model.getDisplayName() : null;
    return this.isHearingToolsActive && businessName ? businessName.toUpperCase() : businessName;
  },

  initialize(options) {
    this.mergeOptions(options, ['matchingUnit']);

    this.PARTICIPANT_CONTACT_METHOD_DISPLAY = configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_DISPLAY') || {};
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX');
    this.PHONE_FIELD_MAX = configChannel.request('get', 'PHONE_FIELD_MAX');
    this.BUSINESS_NAME_MAX_NUM_WORDS = configChannel.request('get', 'BUSINESS_NAME_MAX_NUM_WORDS');
    this.dispute = disputeChannel.request('get');
    
    this.isHearingToolsActive = this.dispute.get('sessionSettings')?.hearingToolsEnabled;

    this.createEditModels();
    this.setupListenersBetweenEditModels();
    this.setEditGroups();

    this.isPrimary = participantsChannel.request('is:primary', this.model);

    this.listenTo(this.model, 'open:subservice', this.openManageSubserviceWithEditCheck, this);
    this.listenTo(this.hearingOptionsByEditModel, 'change:value', () => this.setEmailAddressRequired())
    this.listenTo(this.contactMethodEditModel, 'change:value', () => this.setEmailAddressRequired())
  },

  reinitialize() {
    this.createEditModels();
    this.setupListenersBetweenEditModels();
    this.render();
  },

  setEmailAddressRequired() {
    const isEmailDelivery = this.hearingOptionsByEditModel.getData() === String(configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL'));
    const isEmailContact = this.contactMethodEditModel.getData() === String(configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL'));
    const isEmail = isEmailDelivery || isEmailContact;
    this.participantEmailEditModel.set({ cssClass: isEmail ? 'input-component-email' : 'optional-input input-component-email', required: isEmail });
    this.participantEmailEditModel.trigger('render');
  },

  setEditGroups() {
    const isMailingAddressDeliveryAddress = this.model.hasMailAddress();
    this.amendNameEditGroup = ['participantType', 'businessName', 'firstName', 'lastName'];
    this.amendNameBusinessEditGroup = ['participantType', 'businessName', 'businessContactFirstName', 'businessContactLastName'];
    
    this.amendMailingEditGroup = isMailingAddressDeliveryAddress? ['mailAddressRegion'] : ['unitTypeRegion', 'addressRegion'];

    this.amendAddMailingEditGroup = ['mailAddressRegion'];

    this.preNoticeEditGroup = ['participantType', 'businessName', 'firstName', 'lastName',
        'businessContactFirstName', 'businessContactLastName', 'unitTypeRegion', 'addressRegion',
        'emailRegion', 'daytimePhoneRegion', 'otherPhoneRegion', 'faxRegion', 'statusRegion', 'mailAddressRegion',
        'touAcceptedRegion', 'touDateRegion', 'contactMethodRegion', 'hearingOptionsByRegion'
      ];

    this.postNoticeEditGroup = [
      'businessContactFirstName', 'businessContactLastName',
      'emailRegion', 'daytimePhoneRegion', 'otherPhoneRegion', 'faxRegion', 'statusRegion',
      'touAcceptedRegion', 'touDateRegion', 'contactMethodRegion', 'hearingOptionsByRegion',
      ...( isMailingAddressDeliveryAddress && !this.dispute.isUnitType() ? ['unitTypeRegion', 'addressRegion'] : [])
    ];

    this.postNoticeDisableGroup = [{ child: 'participantType', disabledMessage: "Notice has been delivered.  An amendment is required to change party type" },
      { child: 'businessName', disabledMessage: "Notice has been delivered.  An amendment is required to change business name" },
      { child: 'firstName', disabledMessage: "Notice has been delivered.  An amendment is required to change first name" },
      { child: 'lastName', disabledMessage: "Notice has been delivered.  An amendment is required to change last name" }];
  },

  setupListenersBetweenEditModels() {
    this.listenTo(this.touAcceptedEditModel, 'change:value', function(model) {
      if (model.getData({ parse: true })) {
        this.touDateEditModel.set({ disabled: false, required: true });
      } else {
        this.touDateEditModel.set({ value: null, disabled: true, required: false });
      }

      this.touDateEditModel.trigger('render');
    }, this);
  },

  getDefaultParticipantTypeOptions() {
    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY');
    return _.map(['PARTICIPANT_TYPE_PERSON', 'PARTICIPANT_TYPE_BUSINESS', 'PARTICIPANT_TYPE_AGENT_OR_LAWYER', 'PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT'], function(configTypeString) {
      const value = String(configChannel.request('get', configTypeString));
      return { value, text: PARTICIPANT_TYPE_DISPLAY[value] };
    });
  },

  createEditModels() {
    // Creates the models needed for editting this party
    this.participantTypeEditModel = new DropdownModel({
      labelText: 'Party Type',
      errorMessage: 'Please enter a party type',
      optionData: this.getDefaultParticipantTypeOptions(),
      value: this.model.get('participant_type') ? String(this.model.get('participant_type')) : null,
      apiMapping: 'participant_type'
    });

    this.listenTo(this.participantTypeEditModel, 'change:value', function(model, value) {
      const showBusinessFields = value === String(configChannel.request('get', 'PARTICIPANT_TYPE_BUSINESS'));
      const firstNameVal = this.participantFirstNameEditModel.getData();
      const lastNameVal = this.participantLastNameEditModel.getData();
      const businessFirstNameVal = this.participantBusinessContactFirstNameEditModel.getData();
      const businessLastNameVal = this.participantBusinessContactLastNameEditModel.getData();

      if (showBusinessFields) {
        this.getUI('partyName').addClass('hidden-item');
        this.getUI('partyBusinessName').removeClass('hidden-item');
        this.getUI('partyContactName').removeClass('hidden-item');

        if (firstNameVal && !businessFirstNameVal) this.participantBusinessContactFirstNameEditModel.set('value', firstNameVal);
        if (lastNameVal && !businessLastNameVal) this.participantBusinessContactLastNameEditModel.set('value', lastNameVal);
      } else {
        this.getUI('partyBusinessName').addClass('hidden-item');
        this.getUI('partyContactName').addClass('hidden-item');
        this.getUI('partyName').removeClass('hidden-item');

        if (businessFirstNameVal && !firstNameVal) this.participantFirstNameEditModel.set('value', businessFirstNameVal);
        if (businessLastNameVal && !lastNameVal) this.participantLastNameEditModel.set('value', businessLastNameVal);
      }
      
      this.participantFirstNameEditModel.set('required', !showBusinessFields).trigger('render');
      this.participantLastNameEditModel.set('required', !showBusinessFields).trigger('render');
      this.participantBusinessNameEditModel.set('required', showBusinessFields).trigger('render');
      this.participantBusinessContactFirstNameEditModel.set('required', showBusinessFields).trigger('render');
      this.participantBusinessContactLastNameEditModel.set('required', showBusinessFields).trigger('render');

    }, this);

    this.participantBusinessNameEditModel = new InputModel({
      labelText: 'Business Name',
      errorMessage: 'Please enter the business name',
      maxLength: this.APPLICANT_FIELD_MAX,
      maxWords: this.BUSINESS_NAME_MAX_NUM_WORDS,
      value: this.model.get('bus_name'),
      apiMapping: 'bus_name'
    });

    this.participantBusinessContactFirstNameEditModel = new InputModel({
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'Business Contact First Name',
      errorMessage: `Please enter the contact's first name`,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('bus_contact_first_name'),
      apiMapping: 'bus_contact_first_name'
    });

    this.participantBusinessContactLastNameEditModel = new InputModel({
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'Business Contact Last Name',
      errorMessage: `Please enter the contact's last name`,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('bus_contact_last_name'),
      apiMapping: 'bus_contact_last_name'
    });

    this.participantFirstNameEditModel = new InputModel({
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'First Name',
      errorMessage: `Please enter the first name`,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('first_name'),
      apiMapping: 'first_name'
    });

    this.participantLastNameEditModel = new InputModel({
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'Last Name',
      errorMessage: `Please enter the last name`,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('last_name'),
      apiMapping: 'last_name'
    });

    const RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    const rentUnitTypeOptions = Object.entries(configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY') || {})
      .filter(([value]) => value && String(value) !== RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );
    
    const unitType = String(this.model.get('unit_type') || '') || null;
    this.unitTypeModel = new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        clearWhenHidden: true,
        value: unitType,
        apiMapping: 'unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.APPLICANT_FIELD_MAX,
        clearWhenHidden: true,
        minLength: 3,
        value: this.model.get('unit_text') || null,
        apiMapping: 'unit_text',
      }),
      singleDropdownMode: true,
      enableOther: true,
      showValidate: false,
      alwaysOptional: true,
      otherOverrideValue: RENT_UNIT_TYPE_OTHER,
      currentValue: unitType,
    });

    const participantAddressApiMappings = {
      street: 'address',
      city: 'city',
      postalCode: 'postal_zip',
      country: 'country',
      province: 'province_state',
      unitType: 'unit_type',
      unitText: 'unit_text',
    };
    this.addressEditModel = new AddressModel({
      json: _.mapObject(participantAddressApiMappings, function(val) { return this.model.get(val); }, this),
      apiMapping: participantAddressApiMappings,
      name: this.cid + '-address',
      useDefaultProvince: false,
      streetMaxLength: configChannel.request('get', 'PARTICIPANT_ADDRESS_FIELD_MAX')
    });
    this.addressEditModel.setToOptional();
    if ($.trim(this.model.get('country')) === '') {
      this.addressEditModel.get('countryDropdownModel').set('value', '');
    }
    if ($.trim(this.model.get('province_state')) === '') {
      this.addressEditModel.get('provinceDropdownModel').set('value', '');
    }

    this.hearingOptionsByEditModel = new DropdownModel({
      optionData: [
        { text: Formatter.toHearingOptionsByDisplay(1), value: String(configChannel.request('get', 'SEND_METHOD_EMAIL')) },
        { text: Formatter.toHearingOptionsByDisplay(2), value: String(configChannel.request('get', 'SEND_METHOD_PICKUP')) }
      ],
      labelText: 'Notice Package Delivery Method',
      required: false,
      defaultBlank: true,
      value: this.model.get('package_delivery_method') ? String(this.model.get('package_delivery_method')) : null,
      apiMapping: 'package_delivery_method'
    });

    this.contactMethodEditModel = new DropdownModel({
      optionData: ['PARTICIPANT_CONTACT_METHOD_EMAIL', 'PARTICIPANT_CONTACT_METHOD_PHONE_MAIL'].map(config_string => {
        const config_value = configChannel.request('get', config_string);
        return { value: String(config_value), text: this.PARTICIPANT_CONTACT_METHOD_DISPLAY[config_value] };
      }),
      defaultBlank: true,
      labelText: 'Preferred Contact Method',
      value: this.model.get('primary_contact_method') ? String(this.model.get('primary_contact_method')) : null,
      apiMapping: 'primary_contact_method'
    });

    const isEmailDelivery = this.hearingOptionsByEditModel.getData() === String(configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL'));
    const isEmailContact = this.contactMethodEditModel.getData() === String(configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_EMAIL'));

    this.participantEmailEditModel = new InputModel({
      labelText: 'Email Address',
      inputType: 'email',
      cssClass: isEmailDelivery || isEmailContact ? '' : 'optional-input',
      required: isEmailDelivery || isEmailContact,
      maxLength: this.APPLICANT_FIELD_MAX,
      errorMessage: `Please enter the email`,
      value: this.model.get('email'),
      apiMapping: 'email'
    });

    this.participantDaytimePhoneEditModel = new InputModel({
      labelText: 'Daytime Phone',
      inputType: 'phone',
      maxLength: this.PHONE_FIELD_MAX,
      cssClass: 'optional-input',
      errorMessage: `Please enter the phone number`,
      value: this.model.get('primary_phone'),
      apiMapping: 'primary_phone'
    });

    this.participantOtherPhoneEditModel = new InputModel({
      labelText: 'Other Phone',
      inputType: 'phone',
      cssClass: 'optional-input',
      maxLength: this.PHONE_FIELD_MAX,
      errorMessage: `Please enter the phone number`,
      value: this.model.get('secondary_phone'),
      apiMapping: 'secondary_phone'
    });

    this.participantFaxEditModel = new InputModel({
      labelText: 'Fax',
      inputType: 'phone',
      cssClass: 'optional-input',
      maxLength: this.PHONE_FIELD_MAX,
      errorMessage: `Please enter the fax number`,
      value: this.model.get('fax'),
      apiMapping: 'fax'
    });

    const PARTICIPANT_STATUS_DISPLAY = configChannel.request('get', 'PARTICIPANT_STATUS_DISPLAY');
    this.statusEditModel = new DropdownModel({
      optionData: _.map(['PARTICIPANT_STATUS_NOT_VALIDATED', 'PARTICIPANT_STATUS_VALIDATED', 'PARTICIPANT_STATUS_NOT_PARTICIPATING'], function(configStatusString) {
        const status_value = configChannel.request('get', configStatusString);
        return { value: String(status_value), text: PARTICIPANT_STATUS_DISPLAY[status_value] };
      }),
      labelText: 'Party Status',
      value: this.model.get('participant_status') ? String(this.model.get('participant_status')) : null,
      apiMapping: 'participant_status'
    });

    const participantMailingAddressApiMappings = {
      street: 'mail_address',
      city: 'mail_city',
      postalCode: 'mail_postal_zip',
      country: 'mail_country',
      province: 'mail_province_state'
    };
    this.mailAddressEditModel = new AddressModel({
      name: this.cid + '-mailing-address',
      useDefaultProvince: false,
      json: _.mapObject(participantMailingAddressApiMappings, function(val) { return this.model.get(val); }, this),
      apiMapping: participantMailingAddressApiMappings,
      streetMaxLength: configChannel.request('get', 'PARTICIPANT_ADDRESS_FIELD_MAX')
    });
    this.mailAddressEditModel.setToOptional();
    if ($.trim(this.model.get('mail_country')) === '') {
      this.mailAddressEditModel.get('countryDropdownModel').set('value', '');
    }
    if ($.trim(this.model.get('mail_province_state')) === '') {
      this.mailAddressEditModel.get('provinceDropdownModel').set('value', '');
    }
    this.mailAddressEditModel.get('streetModel').set('labelText', 'Mail Street Address');


    this.touAcceptedEditModel = new DropdownModel({
      optionData: [{ value: 'false', text: 'No' }, { value: 'true', text: 'Yes' }],
      labelText: 'Accepted TOU',
      value: this.model.get('accepted_tou') ? 'true' : 'false',
      apiMapping: 'accepted_tou'
    });

    this.touDateEditModel = new InputModel({
      labelText: 'Date Accepted',
      inputType: 'date',
      showYearDate: true,
      allowFutureDate: true,
      errorMessage: `Please enter the date`, 
      value: this.model.get('accepted_tou') ? this.model.get('accepted_tou_date') : null,
      disabled: !this.model.get('accepted_tou'),
      required: this.model.get('accepted_tou'),
      apiMapping: 'accepted_tou_date'
    });
  },

  addSpacerToAddressString(addressString) {
    if (addressString) {
      // Add a spacer in the display string
      const a = addressString.split(', ');
      addressString = `${a.slice(0, 3).join(', ')} <br/> ${a.slice(3).join(', ')}`;
    }
    return addressString;
  },

  onRender() {
    this.showChildView('participantType', new EditableComponentView({
      state: 'view',
      label: 'Type',
      view_value: configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY')[this.model.get('participant_type')],
      subView: new DropdownView({
        model: this.participantTypeEditModel
      })
    }));

    this.showChildView('businessName', new EditableComponentView({
      state: 'view',
      label: 'Name',
      view_value: this.getBusinessName(),
      subView: new InputView({
        model: this.participantBusinessNameEditModel
      })
    }));

    this.showChildView('businessContactFirstName', new EditableComponentView({
      state: 'view',
      label: 'Business Contact',
      view_value: this.model.isBusiness() ? this.model.getContactName() : null,
      subView: new InputView({
        model: this.participantBusinessContactFirstNameEditModel
      })
    }));

    // Only show the last name value when editting.  The full contact name is in the first name model component
    this.showChildView('businessContactLastName', new EditableComponentView({
      state: 'hidden',
      label: null,
      view_value: this.model.get('bus_contact_last_name'),
      subView: new InputView({
        model: this.participantBusinessContactLastNameEditModel
      })
    }));


    this.showChildView('firstName', new EditableComponentView({
      state: 'view',
      label: 'Name',
      view_value: !this.model.isBusiness() ? ( this.isHearingToolsActive && this.model.getContactName()? this.model.getContactName().toUpperCase() : this.model.getContactName() ) : null,
      subView: new InputView({
        model: this.participantFirstNameEditModel
      })
    }));

    // Only show the last name value when editting.  The full contact name is in the first name model component
    this.showChildView('lastName', new EditableComponentView({
      state: 'hidden',
      label: null,
      view_value: this.isHearingToolsActive && this.model.get('last_name')? this.model.get('last_name').toUpperCase() : this.model.get('last_name'),
      subView: new InputView({
        model: this.participantLastNameEditModel
      })
    }));

    this.showChildView('unitTypeRegion', new EditableComponentView({
      state: 'view',
      label: '',
      view_value: ' ',
      subView: new DoubleSelectorView({ model: this.unitTypeModel })
    }));

    this.showChildView('addressRegion', new EditableComponentView({
      state: 'view',
      label: this.matchingUnit ? 'Unit' : null,
      view_value: this.addressEditModel.getAddressString(),
      subView: new AddressView({
        model: this.addressEditModel
      })
    }));


    this.showChildView('emailRegion', new EditableComponentView({
      state: 'view',
      label: 'Email',
      view_value: this.model.get('email'),
      subView: new EmailView({
        model: this.participantEmailEditModel
      })
    }));

    this.showChildView('daytimePhoneRegion', new EditableComponentView({
      state: 'view',
      label: 'Daytime Phone',
      view_value: this.model.get('primary_phone'),
      subView: new InputView({
        model: this.participantDaytimePhoneEditModel
      })
    }));

    this.showChildView('otherPhoneRegion', new EditableComponentView({
      state: 'view',
      label: 'Other Phone',
      view_value: this.model.get('secondary_phone'),
      subView: new InputView({
        model: this.participantOtherPhoneEditModel
      })
    }));

    this.showChildView('faxRegion', new EditableComponentView({
      state: 'view',
      label: 'Fax',
      view_value: this.model.get('fax'),
      subView: new InputView({
        model: this.participantFaxEditModel
      })
    }));


    this.showChildView('statusRegion', new EditableComponentView({
      state: 'view',
      label: 'Status',
      view_value: configChannel.request('get', 'PARTICIPANT_STATUS_DISPLAY')[this.model.get('participant_status')],
      subView: new DropdownView({
        model: this.statusEditModel
      })
    }));


    this.showChildView('contactMethodRegion', new EditableComponentView({
      state: 'view',
      label: 'Preferred Contact Method',
      view_value: this.PARTICIPANT_CONTACT_METHOD_DISPLAY[this.model.get('primary_contact_method')] || '-',
      subView: new DropdownView({
        model: this.contactMethodEditModel
      })
    }));

    const hearingOptionsByVal = this.hearingOptionsByEditModel.get('value');
    this.showChildView('hearingOptionsByRegion', new EditableComponentView({
      state: 'view',
      label: this.hearingOptionsByEditModel.get('labelText'),
      view_value: hearingOptionsByVal ? Formatter.toHearingOptionsByDisplay(hearingOptionsByVal) :  '-',
      subView: new DropdownView({
        model: this.hearingOptionsByEditModel
      })
    }));


    this.showChildView('mailAddressRegion', new EditableComponentView({
      state: 'view',
      label: 'Mail',
      view_value: this.model.hasMailAddress() ? this.mailAddressEditModel.getAddressString() : null,
      subView: new AddressView({
        model: this.mailAddressEditModel
      })
    }));

    this.showChildView('touAcceptedRegion', new EditableComponentView({
      state: 'hidden',
      label: 'null',
      view_value: null, // Never show this field, it's just for editing
      subView: new DropdownView({
        model: this.touAcceptedEditModel
      })
    }));

    this.showChildView('touDateRegion', new EditableComponentView({
      state: 'view',
      label: 'Accepted TOU',
      view_value: `${this.model.get('accepted_tou') ? 'Yes' : 'No'}${this.model.get('accepted_tou') && this.model.get('accepted_tou_date') ? ` - ${Formatter.toDateDisplay(this.model.get('accepted_tou_date'))}` : ''}`,
      subView: new InputView({
        model: this.touDateEditModel
      })
    }));
  },

  refreshList(collection) {
    // Always un-set edit mode before list re-render
    if (this.dispute && this.dispute.checkEditInProgressModel(this.model)) {
      this.dispute.stopEditInProgress();
    }
    // Always render whole page when the parties list needs to be updated.  This is because overview info is stored at the top

    // Sometimes a model is removed and so we need to trigger directly on the collection
    // If the model is removed from the collection, events triggered on the model will not bubble to collection
    (collection ? collection : this.model).trigger('contextRender:refresh');
  },

  templateContext() {
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const primaryContactDisplay = (this.getOption('participantType') === 'Applicant' && primaryApplicant) ?
        primaryApplicant.getContactName() : this.model.getContactName();

    return {
      primaryContactDisplay,
      isBusiness: this.model.isBusiness(),
      isPrimary: this.isPrimary,
      matchingUnit: this.matchingUnit,
      associatedSubServices: noticeChannel.request('get:subservices:for:participant', this.model.id) || []
    };
  }
});
