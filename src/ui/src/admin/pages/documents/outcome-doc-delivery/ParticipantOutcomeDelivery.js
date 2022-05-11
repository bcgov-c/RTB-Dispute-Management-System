import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxCollectionView from '../../../../core/components/checkbox/Checkboxes';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import ModalEditDeliveryAddress from './modals/ModalEditDeliveryAddress';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const ParticipantOutcomeDelivery = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['collection']);
    this.template = this.template.bind(this);

    this.SEND_METHOD_EMAIL = String(configChannel.request('get', 'SEND_METHOD_EMAIL'));
    this.SEND_METHOD_MAIL = String(configChannel.request('get', 'SEND_METHOD_MAIL'));
    this.SEND_METHOD_OTHER = String(configChannel.request('get', 'SEND_METHOD_OTHER'));
    this.participantEmail = this.model.get('participant_model') && this.model.get('participant_model').get('email');
    
    this.createSubModels();
    this.setEditGroup();
    this.setupListeners();

    const isEmailMethodSelected = this.deliveryMethodModel.getData() === this.SEND_METHOD_EMAIL;
    this.showEmailInput = this.model.get('_isEditMode') && !this.model.get('_isEditSentMode') && isEmailMethodSelected && !this.participantEmail;
  },
  
  clickOtherDelete() {
    if (!this.model.isOther()) {
      console.log(`[Warning] Tried to delete a Participant Delivery`);
      return;
    }

    if (this.model.collection) {
      this.model.collection.remove(this.model);
    }
    loaderChannel.trigger('page:load');
    this.model.get('outcome_doc_delivery_model').destroy()
      .fail(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.REMOVE'))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  clickMailEdit() {
    const modalEditAddress = new ModalEditDeliveryAddress({ participantModel: this.model.get('participant_model') });
    this.listenTo(modalEditAddress, 'removed:modal', () => this.render());
    modalChannel.request('add', modalEditAddress);
  },

  clickEmailEdit() {
    this.showEmailInput = true;
    this.render();
  },

  saveEmailEdit() {
    const emailView = this.getChildView('emailRegion');
    const newEmail = this.emailModel.getData();
    if (!emailView || !emailView.validateAndShowErrors()) return;
    
    if (this.participantEmail === newEmail) {
      emailView.showErrorMessage('This is the email already on file');
      return;
    }
    
    loaderChannel.trigger('page:load');
    this.model.get('participant_model').save({ email: newEmail })
      .done(() => {
        // Always soft set method to email when Email is saved
        this.deliveryMethodModel.set('value', this.SEND_METHOD_EMAIL);
      })
      .fail(generalErrorFactory.createHandler('ADMIN.PARTY.SAVE'))
      .always(() => {
        this.showEmailInput = false;
        this.render();
        loaderChannel.trigger('page:load:complete');
      });
  },

  cancelEmailEdit() {
    this.showEmailInput = false;
    this.emailModel.set('value', this.participantEmail);
    this.render();
  },

  _getDeliveryMethodOptions() {
    const OUTCOME_DOC_DELIVERY_METHOD_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_METHOD_DISPLAY') || {};
    return [
      this.SEND_METHOD_EMAIL,
      this.SEND_METHOD_MAIL,
      this.SEND_METHOD_OTHER,
    ].map(val => ({ value: String(val), text: OUTCOME_DOC_DELIVERY_METHOD_DISPLAY[val] }));
  },

  createSubModels() {
    const outcomeDocGroupModel = this.model.get('outcome_doc_group_model');
    outcomeDocGroupModel.createAssociatedOutcomeDeliveries();
    const participantModel = this.model.get('participant_model');
    const first_saved_delivery = this.model.getFirstSavedDelivery();
    this.model.set('_isSentChecked', first_saved_delivery && first_saved_delivery.get('is_delivered'));

    this.autoDeliveryMethod = first_saved_delivery && first_saved_delivery.get('delivery_method') ?
      String(first_saved_delivery.get('delivery_method')) :
      this.model.isOther() ? this.SEND_METHOD_OTHER :
      this.participantEmail && participantModel.hasDecisionDeliveryByEmail() ? this.SEND_METHOD_EMAIL :
      this.SEND_METHOD_MAIL;
    
    this.deliveryMethodModel = new DropdownModel({
      optionData: this._getDeliveryMethodOptions(),
      labelText: 'Delivery Method',
      errorMessage: 'Required',
      defaultBlank: true,
      value: this.autoDeliveryMethod,
      apiMapping: 'delivery_method',
    });

    this.emailModel = new InputModel({
      inputType: 'email',
      labelText: 'Update Particpant Email',
      errorMessage: 'Please enter a valid email address',
      required: false,
      value: this.participantEmail || null
    });

    this.deliveryDetailsModel = new InputModel({
      labelText: this.model.isOther() ? 'Deliver to Whom and How' : 'Details',
      errorMessage: 'Enter the delivery details',
      maxLength: configChannel.request('get', 'OUTCOME_DOC_DELIVERY_COMMENT_MAX_LENGTH'),
      value: first_saved_delivery ? first_saved_delivery.get('delivery_comment') : null,
      apiMapping: 'delivery_comment'
    });

    this.isSentModel = new CheckboxModel({
      html: 'Sent',
      checked: first_saved_delivery ? first_saved_delivery.get('is_delivered') : null,
      apiMapping: 'is_delivered'
    });

    this.deliveryDateModel = new InputModel({
      labelText: 'Delivery Date',
      inputType: 'date',
      errorMessage: 'Enter a date',
      minDate: outcomeDocGroupModel && outcomeDocGroupModel.get('doc_completed_date') ?
          Moment(outcomeDocGroupModel.get('doc_completed_date')).format(InputModel.getDateFormat()) : null,
      value: first_saved_delivery ? first_saved_delivery.get('delivery_date') : null,
      apiMapping: 'delivery_date'
    });


    const momentDeliveryDate = first_saved_delivery ? Moment(first_saved_delivery.get('delivery_date')) : null;
    this.deliveryTimeModel = new InputModel({
      labelText: 'Time',
      inputType: 'time',
      maxTime: momentDeliveryDate && Moment().isSame(momentDeliveryDate, 'day') ? Moment() : null,
      errorMessage: 'Enter a time',
      value: first_saved_delivery ? momentDeliveryDate.format(InputModel.getTimeFormat()) : null,
    });

  },

  setEditGroup() {
    this.editGroup = ['methodRegion', 'detailsRegion', 'isSentRegion', 'serviceDateRegion', 'serviceTimeRegion'];
    this.disableSentGroup = ['methodRegion', 'detailsRegion'];
  },

  setupListeners() {
    this.listenTo(this.model, 'render', this.render, this);

    this.listenTo(this.model.get('inclusionCheckboxCollection'), 'change:checked', (checkboxModel) => {
      this.render();
      this.model.trigger('deliveries:changed', this.model);
      this.model.collection.trigger('update:bulk:selects', checkboxModel);
    }, this);
    this.listenTo(this.deliveryMethodModel, 'change:value', function(model, value) {
      if (value !== this.SEND_METHOD_EMAIL) this.showEmailInput = false;
      this.render();
    }, this);

    this.listenTo(this.deliveryDateModel, 'change:value', () => this.render());

    const outcomeDocGroupModel = this.model.get('outcome_doc_group_model');
    this.listenTo(outcomeDocGroupModel, 'update:ready_for_delivery', (value) => {
      outcomeDocGroupModel.getOutcomeFiles().each(function(outcome_doc_file_model) {
        const participant_id = this.model.get('participant_model') && this.model.get('participant_model').get('participant_id');
        const delivery_model = participant_id ? outcome_doc_file_model.getParticipantDelivery(participant_id) : this.model.get('outcome_doc_delivery_model');
        
        if (!delivery_model) return;
        delivery_model.set('ready_for_delivery', value);
      }, this);
    });

    this.listenTo(outcomeDocGroupModel, 'update:delivery_priority', (value) => {
      outcomeDocGroupModel.getOutcomeFiles().each(function(outcome_doc_file_model) {
        const participant_id = this.model.get('participant_model') && this.model.get('participant_model').get('participant_id');
        const delivery_model = participant_id ? outcome_doc_file_model.getParticipantDelivery(participant_id) : this.model.get('outcome_doc_delivery_model');
        if (!delivery_model) return;
        delivery_model.set('delivery_priority', value);
      }, this);
    });

    this.listenTo(this.isSentModel, 'change:checked', function(model, value) {
      const isReadyForDelivery = this.model.get('outcome_doc_group_model').get('_isReadyForDeliveryChecked');
      if (value && !isReadyForDelivery) {
        this.showModalCantSendError();
        model.set('checked', false, { silent: true });
        model.trigger('render');
      } else {
        this.model.set('_isSentChecked', value);
        this.deliveryDateModel.set({ value: Formatter.toDateDisplay(Moment()) });
        this.deliveryTimeModel.set({ value: Moment().format(InputModel.getTimeFormat()) });

        this.render();
      }
    }, this);

    this.listenTo(this.model.collection, 'bulk:select:clicked', (value) => {
      this.model.set({ _bulkSelectEnabled: value });
    });

    this.listenTo(this.model.collection, 'update:bulk:selects', (checkboxModel) => {
      if (!this.model.get('_bulkSelectEnabled')) return;
      this.model.get('inclusionCheckboxCollection')
        .filter(c => !c.get('disabled') && c.get('html') === checkboxModel.get('html'))
        .forEach(c => c.set({ checked: checkboxModel.get('checked') }));
    });
  },

  showModalCantSendError() {
    modalChannel.request('show:standard', {
      title: 'Not Ready for Delivery',
      bodyHtml: `<p>You cannot record a document as sent that is not already marked as ready for document delivery.  The ready for delivery checkbox must be selected and saved before you can record a document as sent.</p>`,
      hideCancelButton: true,
      primaryButtonText: 'Close',
      onContinueFn: (_modalView) => _modalView.close()
    });
  },

  shouldDateTimeBeDisabled() {
    return !this.isSentModel.get('checked');
  },

  getDeliveryDateWithTime() {
    const timeMomentObj = Moment(this.deliveryTimeModel.getData(), InputModel.getTimeFormat());
    const hour = timeMomentObj.hour();
    const minute = timeMomentObj.minute();
    const dateWithTime = Moment(this.deliveryDateModel.getData()).set({ hour, minute });
    return dateWithTime;
  },

  resetModelValues() {
    this.showEmailInput = false;
    this.model.resetModel();
  },

  _participantSaveInternalDataToModel() {
    // Save the values from the row into all delivery models associated to participant.
    this.model.get('outcome_doc_group_model').getOutcomeFiles().each(outcome_doc_file_model => {
      const participant_id = this.model.get('participant_model').get('participant_id'),
        delivery_model = outcome_doc_file_model.getParticipantDelivery(participant_id);
      
      if (!delivery_model) {
        return;
      }
      delivery_model.set(_.extend(
        this.deliveryMethodModel.getPageApiDataAttrs(),
        this.deliveryDetailsModel.getPageApiDataAttrs(),
        {
          [this.isSentModel.get('apiMapping')]: !!this.isSentModel.getData(),
          [this.deliveryDateModel.get('apiMapping')]: this.getDeliveryDateWithTime(),
        },
      ));
    });

    const deliveryMethod = this.deliveryMethodModel.getData();
    this.model.set('_participantSaveData', deliveryMethod ? { decision_delivery_method: deliveryMethod } : {});
  },

  _otherSaveInternalDataToModel() {
    this.model.get('outcome_doc_delivery_model').set(_.extend(
      this.deliveryDetailsModel.getPageApiDataAttrs(),
      {
        [this.isSentModel.get('apiMapping')]: !!this.isSentModel.getData(),
        [this.deliveryDateModel.get('apiMapping')]: this.getDeliveryDateWithTime(),
      },
    ));
  },

  saveInternalDataToModel() {
    if (this.model.isOther()) {
      this._otherSaveInternalDataToModel();
    } else {
      this._participantSaveInternalDataToModel();
    }
  },

  validateAndShowErrors() {
    let is_valid = true;
    if (!this.showEmailInput && !this.participantEmail && this.deliveryMethodModel.getData() === this.SEND_METHOD_EMAIL) {
      this.missingEmailError = true;
      is_valid = false;
      this.render();
    }

    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);

    if (this.showEmailInput) {
      this.getChildView('emailRegion').showErrorMessage('Save or cancel this email update');
      is_valid = false;
    }

    return is_valid;
  },

  onBeforeRender() {
    this.participantEmail = this.model.get('participant_model') && this.model.get('participant_model').get('email');
    this.emailModel.set('required', this.showEmailInput);

    // Re-render was called, view was not destroyed, and so the template didn't get re-rendered completely.
    // Calling React to manually unmount the DOM if this view is being re-rendered
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);

    const isEditSendMode = this.model.get('_isEditSentMode');
    const isSent = this.isSentModel.get('checked');
    const hasInclusions = this.model.get('inclusionCheckboxCollection').getData().length;
    
    const deliveryValueToSet = !hasInclusions ? null :
      (this.deliveryMethodModel.get('value') || this.autoDeliveryMethod || null);
      const disableDeliveryMethod = isEditSendMode || isSent || !hasInclusions;
    this.deliveryMethodModel.set({
      disabled: disableDeliveryMethod,
      required: !disableDeliveryMethod,
      value: deliveryValueToSet
    }, { silent: true });

    const disableDocSelection = isEditSendMode || isSent;
    this.model.get('inclusionCheckboxCollection').each(model => {
      model.set('disabled', disableDocSelection, { silent: true });
    });
    
    const disableDeliveryDetails = isEditSendMode || (!this.model.isOther() && (!hasInclusions || !this.deliveryMethodModel.getData({parse: true})));
    const disableIsSent = !isEditSendMode && disableDeliveryDetails;

    this.deliveryDetailsModel.set(_.extend({
      required: String(this.deliveryMethodModel.getData()) === this.SEND_METHOD_OTHER,
      disabled: disableDeliveryDetails
    }, !hasInclusions ? { checked: false } : {}));

    this.isSentModel.set(_.extend({
      disabled: disableIsSent
    }, !hasInclusions ? { checked: false } : {})).trigger('render');

    const shouldDateTimeBeDisabled = this.shouldDateTimeBeDisabled();
    const enableMaxTime = !shouldDateTimeBeDisabled && Moment(this.deliveryDateModel.getData({ parse: true })).isSame(Moment(), 'day');
    // Don't trigger a change event, instead update the time manually after
    this.deliveryDateModel.set(Object.assign({}, {
      disabled: shouldDateTimeBeDisabled,
      required: !shouldDateTimeBeDisabled
    }, shouldDateTimeBeDisabled ? { value: null } : {}));
    
    this.deliveryTimeModel.set(Object.assign({
      maxTime: enableMaxTime ? Moment() : null,
      disabled: shouldDateTimeBeDisabled,
      required: !shouldDateTimeBeDisabled
    }, shouldDateTimeBeDisabled ? { value: null } : {}));

    if (this.participantEmail || this.deliveryMethodModel.getData() !== this.SEND_METHOD_EMAIL) {
      this.missingEmailError = false;
    }
  },
  
  onRender() {
    if (!this.model.get('_isEditMode')) return;

    const selectedDeliveryMethod = this.deliveryMethodModel.getData();

    this.showChildView('inclusionsRegion', new CheckboxCollectionView({ collection: this.model.get('inclusionCheckboxCollection') }));    
    this.showChildView('methodRegion', new DropdownView({ model: this.deliveryMethodModel }));

    if (this.showEmailInput) {
      this.showChildView('emailRegion', new InputView({ model: this.emailModel }));
    }

    if (this.model.isOther() || selectedDeliveryMethod === this.SEND_METHOD_OTHER) {
      this.showChildView('detailsRegion', new InputView({ model: this.deliveryDetailsModel }));
    }

    this.showChildView('isSentRegion', new CheckboxView({ model: this.isSentModel }));
    this.showChildView('serviceDateRegion', new InputView({ model: this.deliveryDateModel }));
    this.showChildView('serviceTimeRegion', new InputView({ model: this.deliveryTimeModel }));
  },

  className() {
    return `standard-list-item outcome-doc-delivery-container ${this.model.isOther() ? 'other-delivery' : ''}`;
  },

  regions: {
    inclusionsRegion: '.outcome-doc-delivery-inclusions',
    methodRegion: '.outcome-doc-delivery-method',
    detailsRegion: '.outcome-doc-delivery-details',
    isSentRegion: '.outcome-doc-delivery-is-sent',
    serviceDateRegion: '.outcome-doc-delivery-delivery-date',
    serviceTimeRegion: '.outcome-doc-delivery-delivery-time',
    emailRegion: '.outcome-doc-delivery-method-email-input'
  },
  
  template() {
    const firstSavedDelivery = this.model.getFirstSavedDelivery();
    const savedDeliveryMethod = firstSavedDelivery && firstSavedDelivery.get('delivery_method') ? String(firstSavedDelivery.get('delivery_method')) : null;
    const savedDeliveryMethodOption = _.findWhere(this.deliveryMethodModel.get('optionData'), { value: String(savedDeliveryMethod) });
    const deliveryMethodDisplay = savedDeliveryMethod && savedDeliveryMethodOption ? savedDeliveryMethodOption.text : '-';
    
    return <>
      {this.renderJsxNameAndDocs()}

      {this.showEmailInput ? <div className="outcome-doc-delivery-method-email-input-container">
        <div className="outcome-doc-delivery-method-email-input"></div>
        <div className="outcome-doc-delivery-method-email-buttons">
          <div className="component-email-buttons-cancel" onClick={() => this.cancelEmailEdit()}></div>
          <div className="component-email-buttons-ok" onClick={() => this.saveEmailEdit()}></div>
        </div>
      </div> : null}

      <div
        className={`outcome-doc-delivery-method-container ${this.showEmailInput ? 'hidden' : ''}`}
        style={{ flexWrap: this.missingEmailError? 'wrap' : 'nowrap' }}
      >
        {this.model.get('_isEditMode') ? 
            <div className="outcome-doc-delivery-method"></div>
          : <div className="outcome-doc-delivery-method-display">{deliveryMethodDisplay}</div>
        }
        {this.renderJsxMethodDetails()}
        {this.missingEmailError ? <p className="outcome-doc-delivery-missing-email error-block">Add a participant email to deliver by email</p> : null}        
      </div>

      <div className={`outcome-doc-delivery-sent-container ${this.showEmailInput ? 'hidden' : ''}`}>
        {this.renderJsxDeliveryStatus()}

        {this.model.get('_isEditMode') ? <>
          <div className="outcome-doc-delivery-is-sent"></div>
          <div className="outcome-doc-delivery-delivery-date"></div>
          <div className="outcome-doc-delivery-delivery-time"></div>
        </> : null}
      </div>
    </>;
  },

  renderJsxNameAndDocs() {
    const dispute = disputeChannel.request('get');
    const participantModel = this.model.get('participant_model')
    const landlordOrTenant = participantModel && participantModel.isApplicant() ?
        dispute.isLandlord() ? 'Landlord' : 'Tenant'
      : participantModel && participantModel.isRespondent() ?
        dispute.isLandlord() ? 'Tenant' : 'Landlord'
      : 'Unknown';
    const inclusionsList = this.model.get('inclusionCheckboxCollection').filter(function(m) {
      const delivery_model = m.get('_associated_delivery_model');
      return delivery_model && !delivery_model.isNew();
    });
    const inclusionsDisplay = this.model.isOther() ? null :
      `${inclusionsList.length ? _.map(inclusionsList, function(m) { return m.get('html'); }).join(', ') : '-'}`;
    const nameDisplay = this.model.isOther() ? this.model.get('outcome_doc_file_model').get('file_acronym') : participantModel.getContactName();
    const typeDisplay = this.model.isOther() ? 'See Details' : `${participantModel.getTypeDisplay()} - ${landlordOrTenant}`;
    
    return <>
      <div className="outcome-doc-delivery-name-container">
        <div className="outcome-doc-delivery-name">
          {participantModel && participantModel.isPrimary() ? <b className=""></b> : null}
          {nameDisplay}
        </div>
        <div className="outcome-doc-delivery-type">{typeDisplay}</div>
      </div>

      <div className={`outcome-doc-delivery-inclusions-container ${this.showEmailInput ? 'hidden' : ''}`}>
        {this.model.get('_isEditMode') ? <div className="outcome-doc-delivery-inclusions"></div> : null}
        <div className="outcome-doc-delivery-inclusions-display">{inclusionsDisplay}</div>
      </div>
    </>;
  },

  renderJsxMethodDetails() {
    const deliveryMethod = this.deliveryMethodModel.getData();
    return deliveryMethod === this.SEND_METHOD_EMAIL ? this.renderJsxEmailMethod()
      : deliveryMethod === this.SEND_METHOD_MAIL ? this.renderJsxMailMethod()
      : (deliveryMethod === this.SEND_METHOD_OTHER || this.model.isOther()) ? this.renderJsxOtherMethod()
      : null;
  },

  renderJsxEmailMethod() {
    if (this.model.isOther() || this.showEmailInput) return null;

    return <>
      <div className="outcome-doc-delivery-method-email-container">
        <div className="outcome-doc-delivery-method-email">{this.participantEmail}</div>
        {this.model.get('_isEditMode') && !this.model.get('_isEditSentMode') ? <div className="outcome-doc-delivery-method-email-edit general-link" onClick={() => this.clickEmailEdit()}>
          {this.participantEmail ? 'Edit' : 'Add Email'}
        </div> : null}
      </div>      
    </>;
  },

  renderJsxMailMethod() {
    if (this.model.isOther()) return null;
    const p = this.model.get('participant_model');
    const mailingAddressDisplay = p.hasMailAddress() ? p.getMailingAddressString() : p.getStreetAddressString();

    return <div className="outcome-doc-delivery-method-mail-container">
      <div className="outcome-doc-delivery-method-mail">{mailingAddressDisplay}</div>
      {!this.model.get('_isEditSentMode') && this.model.get('_isEditMode') ?
        <div className="outcome-doc-delivery-method-mail-buttons">
          <span className="outcome-doc-delivery-method-mail-edit general-link" onClick={() => this.clickMailEdit()}>Edit</span>
          {!this.deliveryMethodModel.get('disabled') ? <>
            <span className="outcome-doc-delivery-method-mail-buttons-separator"></span>
            <span className="outcome-doc-delivery-method-mail-email general-link" onClick={() => this.clickEmailEdit()}>{`${this.participantEmail ? 'Change' : 'Add'} Email`}</span>
          </> : null}
        </div>
      : null}
    </div>;
  },

  renderJsxOtherMethod() {
    const firstSavedDelivery = this.model.getFirstSavedDelivery();
    const detailsDisplay = firstSavedDelivery && firstSavedDelivery.get('delivery_comment');
    return <div className="outcome-doc-delivery-details-container">
      {this.model.get('_isEditMode') ?
        <div className="outcome-doc-delivery-details"></div>
        : <div className="outcome-doc-delivery-details-display">{detailsDisplay}</div>
      }
      {this.model.isOther() ? <div className="outcome-doc-delivery-other-delete-btn clickable" onClick={() => this.clickOtherDelete()}></div> : null}
    </div>;
  },

  renderJsxDeliveryStatus() {
    const firstSavedDelivery = this.model.getFirstSavedDelivery();
    const firstDeliveryIsDelivered = firstSavedDelivery && firstSavedDelivery.get('is_delivered');
    return <div className="outcome-doc-delivery-sent-display">
      {
        firstDeliveryIsDelivered ?
          firstSavedDelivery.get('ready_for_delivery') ?
            <span className="">Sent: {Formatter.toDateDisplay(firstSavedDelivery.get('delivery_date'))}</span>
          : <span className="outcome-doc-delivery-sent-display--gray">Not Marked Ready</span>
        : <span className="outcome-doc-delivery-sent-display--red">Not Sent</span>
      }
    </div>;
  },

});

_.extend(ParticipantOutcomeDelivery.prototype, ViewJSXMixin);
export default ParticipantOutcomeDelivery;
