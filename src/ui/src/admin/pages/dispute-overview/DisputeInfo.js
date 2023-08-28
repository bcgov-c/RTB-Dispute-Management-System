import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import AddressView from '../../../core/components/address/Address';
import AddressModel from '../../../core/components/address/Address_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import ContextContainer from '../../components/context-container/ContextContainer';
import DoubleSelectorView from '../../../core/components/double-selector/DoubleSelector';
import DoubleSelectorModel from '../../../core/components/double-selector/DoubleSelector_model';
import DisputeStatusModel from '../../../core/components/dispute/DisputeStatus_model';
import DisputeStatusView from '../../components/status/DisputeStatus';
import ModalAmendmentConfirmView from '../../components/amendments/ModalAmendmentConfirm';
import IconAddressNotVerified from '../../../core/static/Icon_Admin_AddressNotVerified.png';
import IconAddressVerified from '../../../core/static/Icon_Admin_AddressVerified.png'
import PartyNames from './PartyNames';
import template from './DisputeInfo_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import ModalManagerUserAccess from '../../components/modals/modal-manage-user-access/ModalManageUserAccess';

const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const claimsChannel = Radio.channel('claims');
const participantChannel = Radio.channel('participants');
const hearingChannel = Radio.channel('hearings');
const amendmentChannel = Radio.channel('amendments');
const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const userChannel = Radio.channel('users');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: '',

  regions: {
    partyNamesRegion: '.review-dispute-party-names',
    unitTypeRegion: '.review-dispute-rent-unit',
    addressRegion: '.review-dispute-address',
    submittedDateRegion: '.review-submitted-date',
    paymentDateRegion: '.review-payment-date',
    actRegion: '.review-act-type',
    urgencyRegion: '.review-urgency',
    complexityRegion: '.review-complexity',
    crossAppRegion: '.review-cross-app-file-number',
    migrationTruthRegion: '.review-migration-truth',
    tenancyStatusRegion: '.review-tenancy-status',
    tenancyEndDateRegion: '.review-tenancy-end-date',
    rentAmountRegion: '.review-rent-amount',
    rentalIntervalRegion: '.review-rental-interval',
    securityDepositRegion: '.review-security-deposit',
    petDepositRegion: '.review-pet-deposit',
    tenancyStartDateRegion: '.review-tenancy-start-date',
    tenancyEffectiveRegion: '.review-tenancy-effective-edit',
    tenancySignedRegion: '.review-tenancy-signed-edit',
    statusRegion: '.review-dispute-status',
  },

  ui: {
    filename: '.filename-download',
    autoSetUrgency: '.review-urgency-auto-set',
    autoSetComplexity: '.review-complexity-auto-set',
    addressWarning: '.review-dispute-address-warning',
    disputeUserActiveToggle: '.dispute-user-manager'
  },

  events: {
    'click @ui.filename': 'clickFilename',
    'click @ui.autoSetUrgency': 'autoSetUrgency',
    'click @ui.autoSetComplexity': 'autoSetComplexity',
    'click @ui.disputeUserActiveToggle': 'disputeUserActiveToggle'
  },

  clickFilename(ev) {
    const ele = $(ev.currentTarget);
    const file_id = ele.data('fileId');

    let file_model = null;
    
    this.tenancyAgreementFileDescriptionModels.forEach(fileDescription => {
      if (file_model) { return; }
      file_model = fileDescription.get('files').findWhere({ file_id });
    });

    if (!file_model) {
      console.log(`[Error] Couldn't find file to download`, ev, file_id, file_model, this);
    } else {
      filesChannel.request('click:filename:preview', ev, file_model, { fallback_download: true });
    }
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


  applyPageModelChangesWithIssueStateCheck(childViewsToSave) {
    const dfd = $.Deferred();

    // Get the state of previous dispute data without changes applied
    const previousDisputeData = {
      isMHPTA: this.model.isMHPTA(),
      isPastTenancy: this.model.isPastTenancy(),
      hasPetDeposit: this.model.hasPetDeposit(),
      hasSecurityDeposit: this.model.hasSecurityDeposit(),
      hasDeposit: this.model.hasDeposit()
    };
    
    // Apply changes
    this._applyPageModelChanges(childViewsToSave);
    
    const newDisputeData = {
      isMHPTA: this.model.isMHPTA(),
      isPastTenancy: this.model.isPastTenancy(),
      hasPetDeposit: this.model.hasPetDeposit(),
      hasSecurityDeposit: this.model.hasSecurityDeposit(),
      hasDeposit: this.model.hasDeposit()
    };

    // Now check for any dispute discrepancies
    try {
      const issueDiscrepancies = disputeChannel.request('check:issue:state', previousDisputeData, newDisputeData, this.claims);
      console.log(issueDiscrepancies);
      this._showIssueStateWarning(issueDiscrepancies).done(dfd.resolve).fail(dfd.reject);
    } catch (err) {
      console.log(`[Error] There was an error saving the dispute values during check: `, err);
      modalChannel.request('remove:all');
      // Just save and don't show warning of invalid data
      dfd.resolve();
    }

    return dfd.promise();
  },

  _showIssueStateWarning(issueDiscrepancies) {
    const dfd = $.Deferred();

    if (!_.isEmpty(issueDiscrepancies)) {
      const issuesDisplay = _.sortBy(_.keys(issueDiscrepancies)).map(keyDisplay => {
        return _.union([`<div style="text-decoration:underline;">${keyDisplay}:</div>`, '<ul>'],
          _.map(issueDiscrepancies[keyDisplay], claimModel => (
            `<li>${claimModel.getClaimTitle()}</li>`
          )),
          ['</ul>']
        ).join('');
      });

      modalChannel.request('show:standard', {
        modalCssClasses: 'modal-issue-state-breaking-change',
        title: `Rule-breaking change`,
        bodyHtml: `<p>You are trying to change a value on the dispute that will put the dispute in a state where some existing issues no longer align with business rules. The following issues are affected:</p>` +
          `<p>${issuesDisplay.join('')}</p>` +
          `<p style="margin:25px 0 0 0;">Are you sure you want to continue?</p>`,
        primaryButtonText: 'Yes, continue',
        onContinueFn(modalView) {
          modalView.close();
          dfd.resolve().promise();
        },
        onCancelFn: (modalView) => {
          modalView.close();
          dfd.reject();
        }
      });
    } else {
      dfd.resolve();
    }

    return dfd.promise();
  },


  _applyPageModelChanges(childViewsToSave) {
    _.each(childViewsToSave, function(component_name) {
      const component = this.getChildView(component_name);
      if (component.isActive()) {
        // Save the local data into the participant model
        if (component.subView && component.getApiData) {
          this.model.set(component.getApiData());
        }
      }
    }, this);

    // If the tenancy has ended, make sure to clear the tenancy end date
    if (this.model.get('tenancy_ended') === 0) {
      this.model.set('tenancy_end_date', null);
    }
  },

  _saveModel() {
    $.whenAll(this._saveDisputeModel(this.model))
      .always(() => {
        if (this.model.isMigrated() !== this.isMigratedDuringInit) {
          Backbone.history.loadUrl(Backbone.history.fragment);
        } else {
          this.reinitialize();
          this.model.trigger('contextRender:refresh');
          loaderChannel.trigger('page:load:complete');
        }
      });
  },

  _saveDisputeModel(model) {
    const dfd = $.Deferred();
    model.save(model.getApiChangesOnly())
      .done(dfd.resolve)
      .fail(
        generalErrorFactory.createHandler('ADMIN.DISPUTE.SAVE', () => {
          this.model.resetModel();
          dfd.reject();
        })
      );
    return dfd.promise();
  },

  _saveAmendment(other_amendment_data) {
    other_amendment_data = other_amendment_data || {};
    const change_data = this.model.getApiChangesOnly();

    if (!change_data || _.isEmpty(change_data)) {
      console.log("No amendment changes needed");
      this.reinitialize();
      loaderChannel.trigger('page:load:complete');
      return;
    }
    
    amendmentChannel.request('change:rentaladdress', this.model, other_amendment_data)
      .done(() => {
        this.model.set('is_amended', true);
        this.trigger('contextRender');
        this._saveModel();
      }).fail(
        generalErrorFactory.createHandler('ADMIN.AMENDMENT.DISPUTE.SAVE', () => {
          this.reinitialize();
          loaderChannel.trigger('page:load:complete');
        })
      );
  },

  _showModalAmendmentChange() {
    const modal = new ModalAmendmentConfirmView({
      title: 'Change Dispute Address?',
      bodyHtml: `<p>Warning - this will change the dispute address and record an amendment.  This action cannot be undone</p>
        <p>Are you sure you want to amend the dispute address?</p>`
    });
    this.listenToOnce(modal, 'save', function(amendment_save_data) {
      modal.close();
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges(this.amendmentEditGroup);
      this._saveAmendment(amendment_save_data);
    }, this);

    modalChannel.request('add', modal);
  },

  onMenuAmend() {
    this.switchToAmendState();
  },

  onMenuEditStatus() {
    const statusView = this.getChildView('statusRegion');
    if (statusView && statusView.wrappedView) {
      this.stopListening(statusView.wrappedView.model, 'save:status');
      this.listenToOnce(statusView.wrappedView.model, 'save:status', () => {
        this.reinitialize();
        this.trigger('contextRender');
      });
      statusView.wrappedView.triggerMethod('menu:edit');
    }
  },

  onMenuEditPreNotice() {
    this.switchToEditState(this.preNoticeEditGroup);
  },

  onMenuEditPostNotice() {
    this.switchToEditState(this.postNoticeEditGroup);
  },

  _onMenuSave(childViewsToSave) {
    if (this.validateAndShowErrors(childViewsToSave)) {
      $.when(this.applyPageModelChangesWithIssueStateCheck(childViewsToSave)).done(() => {
        loaderChannel.trigger('page:load');
        this._saveModel();
      }).fail(() => {
        loaderChannel.trigger('page:load:complete');
        this.resetModelValues();
      });
    }
  },

  onMenuSubmitAmendment() {
    if (this.validateAndShowErrors(this.amendmentEditGroup)) {
      $.when(this.applyPageModelChangesWithIssueStateCheck(this.amendmentEditGroup)).done(() => {
        this._showModalAmendmentChange();
      }).fail(() => {
        loaderChannel.trigger('page:load:complete');
        this.resetModelValues();
      });
    }
  },

  onMenuSavePreNotice() {
    this._onMenuSave(this.preNoticeEditGroup);
  },

  onMenuSavePostNotice() {
    this._onMenuSave(this.postNoticeEditGroup);
  },

  onMenuSaveStatus() {
    const statusView = this.getChildView('statusRegion');
    this._performStatusSaveIssueStateCheck(statusView).done(() => {
      statusView.wrappedView.triggerMethod('menu:save');
    }).fail(() => {
      // Note: This is not an API handler fail block, no API error handling needed.
      loaderChannel.trigger('page:load:complete');
      this.resetModelValues();
    });  
  },

  _performStatusSaveIssueStateCheck(statusView) {
    const dfd = $.Deferred();
    try {
      const issueDiscrepancies = {};
      const displayKeys = {
        participatory: 'Invalid with participatory process',
        nonParticipatory: 'Invalid with non-participatory process'
      };
      const previousStatusData = this.model.getApiSavedAttr('status');
      const nextProcess = statusView.wrappedView.processEditModel.getData({ parse: true });

      if (previousStatusData.process === 1 && nextProcess === 2) {
        _.each(this.claims.filter(claim => !claim.isValidWithDirectRequest()), invalidClaim => {
          if (!issueDiscrepancies[displayKeys.nonParticipatory]) {
            issueDiscrepancies[displayKeys.nonParticipatory] = [];
          }
          issueDiscrepancies[displayKeys.nonParticipatory].push(invalidClaim);
        });
      }

      if (previousStatusData.process === 2 && nextProcess === 1) {
        _.each(this.claims.filter(claim => claim.isDirectRequest()), invalidClaim => {
          if (!issueDiscrepancies[displayKeys.participatory]) {
            issueDiscrepancies[displayKeys.participatory] = [];
          }
          issueDiscrepancies[displayKeys.participatory].push(invalidClaim);
        });
      }

      return this._showIssueStateWarning(issueDiscrepancies);

    } catch (err) {
      console.log(`[Error] There was an error saving the status values during check: `, err);
      modalChannel.request('remove:all');
      // Just save and don't show warning of invalid data
      dfd.resolve();
    }

    return dfd.promise();
  },

  switchToAmendState() {
    _.each(this.amendmentEditGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  resetModelValues() {
    this.model.resetModel();
    this.reinitialize();
  },

  switchToEditState(editGroup=[]) {
    _.each(editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);

    _.each(this.editDisableGroup, function(component_obj) {
      const component = this.getChildView(component_obj.child);
      if (component) {
        component.toEditableDisabled(component_obj.disabledMessage);
      }
    }, this);

    const canAutoSetFromDispute = this.claims.some(claim => claim.get('claim_code') && !claim.isFeeRecovery());
    if (!this.urgencyEditModel.getData() && canAutoSetFromDispute && editGroup?.indexOf('urgencyRegion') !== -1) {
      this.getUI('autoSetUrgency').removeClass('hidden');
    } else {
      this.getUI('autoSetUrgency').addClass('hidden');
    }

    if (!this.complexityEditModel.getData() && canAutoSetFromDispute && editGroup?.indexOf('complexityRegion') !== -1) {
      this.getUI('autoSetComplexity').removeClass('hidden');
    } else {
      this.getUI('autoSetComplexity').addClass('hidden');
    }
  },

  initialize() {
    this.claims = claimsChannel.request('get');
    this.isMigratedDuringInit = this.model.isMigrated();

    this.AMOUNT_FIELD_MAX = configChannel.request('get', 'AMOUNT_FIELD_MAX') || 15;
    this.RENT_PAYMENT_INTERVAL_MAX = configChannel.request('get', 'RENT_PAYMENT_INTERVAL_MAX') || 95;
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX') || 45;

    this.createEditModels();
    this.setupListeners();
    this.setEditGroups();
  },

  reinitialize() {
    this.isMigratedDuringInit = this.model.isMigrated();
    this.createEditModels();
    this.setupListeners();
    this.render();
  },

  _getUrgencyOptions() {
    const DISPUTE_URGENCY_DISPLAY = configChannel.request('get', 'DISPUTE_URGENCY_DISPLAY'),
      urgency_list = ['DISPUTE_URGENCY_EMERGENCY', 'DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED'];
    return _.map(urgency_list, function(config_name) {
      const value = configChannel.request('get', config_name);
      return { value, text: _.has(DISPUTE_URGENCY_DISPLAY, value) ? DISPUTE_URGENCY_DISPLAY[value] : value };
    });
  },

  _getComplexityOptions() {
    const DISPUTE_COMPLEXITY_MAPPINGS = _.omit(configChannel.request('get', 'DISPUTE_COMPLEXITY_DISPLAY') || {}, configChannel.request('get', 'COMPLEXITY_COMPLEX'));
    return Object.entries(DISPUTE_COMPLEXITY_MAPPINGS).map( ([value, text]) => ({ value, text }) );
  },

  _getSignedByOptions() {
    const DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY = configChannel.request('get', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY'),
      tenancy_signed_list = ['DISPUTE_TENANCY_AGREEMENT_SIGNED_LANDLORDS_AND_TENANTS', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_LANDLORDS_ONLY',
          'DISPUTE_TENANCY_AGREEMENT_SIGNED_TENANTS_ONLY', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_NOT_SIGNED'];
    return _.map(tenancy_signed_list, function(config_name) {
      const value = configChannel.request('get', config_name);
      return { value, text: _.has(DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY, value) ? DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY[value] : value };
    });
  },

  _getMigrationTruthOptions() {
    const DISPUTE_MIGRATION_TRUTH_DISPLAY = configChannel.request('get', 'DISPUTE_MIGRATION_TRUTH_DISPLAY');
    const migrationTruthCodes = ['DISPUTE_MIGRATION_TRUTH_DMS', 'DISPUTE_MIGRATION_TRUTH_CMS'];
    return _.map(migrationTruthCodes, function(config_name) {
      const value = configChannel.request('get', config_name);
      return { value: String(value), text: _.has(DISPUTE_MIGRATION_TRUTH_DISPLAY, value) ? DISPUTE_MIGRATION_TRUTH_DISPLAY[value] : value };
    });   
  },

  autoSetUrgency() {
    const urgency = claimsChannel.request('get:dispute:urgency');
    this.urgencyEditModel.set({ value: urgency });
    this.urgencyEditModel.trigger('render');
  },

  autoSetComplexity() {
    const complexity = disputeChannel.request('check:complexity', this.model);
    this.complexityEditModel.set({ value: String(complexity) });
    this.complexityEditModel.trigger('render');
  },

  disputeUserActiveToggle() {
    const userAccessModal = new ModalManagerUserAccess({ model: disputeChannel.request('get:dispute:creator') });
    modalChannel.request('add', userAccessModal);
    this.listenTo(userAccessModal, 'removed:modal', () => {
      //this.render(); TODO: mid-tier bug after patch results in full_name and user_name not being returned. Workaround is to full refresh
      const currentRoute = Backbone.history.getFragment();
      Backbone.history.loadUrl(`${currentRoute}`, { trigger: true, replace: true });
    });
  },

  createEditModels() {
    // Create rental address type and question
    const RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || '');
    const rentUnitTypeOptions = Object.entries(configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY') || {})
      .filter(([value]) => value && String(value) !== RENT_UNIT_TYPE_OTHER)
      .map( ([value, text]) => ({ value: String(value), text }) );
    
    const tenancy_unit_type = String(this.model.get('tenancy_unit_type') || '') || null;
    this.unitTypeModel = new DoubleSelectorModel({
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: rentUnitTypeOptions,
        labelText: 'Unit Type',
        errorMessage: 'Enter the unit type',
        clearWhenHidden: true,
        value: tenancy_unit_type,
        apiMapping: 'tenancy_unit_type',
      }),
      otherInputModel: new InputModel({
        labelText: 'Unit Description',
        errorMessage: 'Enter the unit description',
        maxLength: this.APPLICANT_FIELD_MAX,
        clearWhenHidden: true,
        minLength: 3,
        value: this.model.get('tenancy_unit_text') || null,
        apiMapping: 'tenancy_unit_text',
      }),
      singleDropdownMode: true,
      enableOther: true,
      showValidate: false,
      alwaysOptional: true,
      otherOverrideValue: RENT_UNIT_TYPE_OTHER,
      currentValue: tenancy_unit_type,
    });

    const rentalAddressApiMappings = {
      street: 'tenancy_address',
      city: 'tenancy_city',
      country: 'tenancy_country',
      postalCode: 'tenancy_zip_postal',
      geozoneId: 'tenancy_geozone_id',
      unitType: 'tenancy_unit_type',
      unitText: 'tenancy_unit_text',
      addressIsValidated: 'tenancy_address_validated'
    };
    this.addressEditModel = new AddressModel({
      json: _.mapObject(rentalAddressApiMappings, function(val) { return this.model.get(val); }, this),
      apiMapping: rentalAddressApiMappings,
      required: true,
      useSubLabel: false,
      selectProvinceAndCountry: false,
      showUpdateControls: false,
      useSubLabel: false,
      useAddressValidation: false,
      isOptional: true,
    });

    this.submittedDateEditModel = new InputModel({
      labelText: 'Last Submitted Date',
      inputType: 'date',
      showYearDate: true,
      errorMessage: 'Enter the submitted date',
      required: false,
      value: this.model.get('submitted_date'),
      apiMapping: 'submitted_date'
    });

    this.paymentDateEditModel = new InputModel({
      labelText: 'Intake Payment Date',
      inputType: 'date',
      showYearDate: true,
      errorMessage: 'Enter the intake payment date',
      required: false,
      value: this.model.get('initial_payment_date'),
      apiMapping: 'initial_payment_date'
    });

    this.actEditModel = new DropdownModel({
      optionData: [{ value: configChannel.request('get', 'DISPUTE_TYPE_RTA'), text: 'RTA'},
          {value: configChannel.request('get', 'DISPUTE_TYPE_MHPTA'), text: 'MHPTA'}],
      labelText: 'Act',
      defaultBlank: false,
      required: false,
      value: this.model.get('dispute_type'),
      apiMapping: 'dispute_type'
    });

    this.urgencyEditModel = new DropdownModel({
      optionData: this._getUrgencyOptions(),
      labelText: 'Urgency',
      errorMessage: 'Enter the urgency',
      defaultBlank: true,
      required: true,
      value: this.model.get('dispute_urgency'),
      apiMapping: 'dispute_urgency'
    });

    this.complexityEditModel = new DropdownModel({
      optionData: this._getComplexityOptions(),
      labelText: 'Complexity',
      errorMessage: 'Enter the complexity',
      defaultBlank: true,
      required: false,
      value: this.model.get('dispute_complexity') ? String(this.model.get('dispute_complexity')) : null,
      apiMapping: 'dispute_complexity'
    });

    this.crossAppEditModel = new InputModel({
      labelText: 'Intake Filed in Response to',
      inputType: 'legacy_dispute_number',
      maxLength: 9,
      required: false,
      value: this.model.get('cross_app_file_number'),
      apiMapping: 'cross_app_file_number'
    });

    this.migrationTruthEditModel = new DropdownModel({
      optionData: this._getMigrationTruthOptions(),
      labelText: 'Source of truth',
      defaultBlank: true,
      required: false,
      value: this.model.get('migration_source_of_truth') ? String(this.model.get('migration_source_of_truth')) : null,
      apiMapping: 'migration_source_of_truth'
    });

    this.tenancyStatusEditModel = new DropdownModel({
      defaultBlank: false,
      labelText: 'Tenancy Status',
      optionData: [{ value: 0, text: 'Current Tenant'}, { value: 1, text: 'Past Tenant'}],
      required: false,
      value: this.model.get('tenancy_ended'),
      apiMapping: 'tenancy_ended'
    });


    this.tenancyEndDateEditModel = new InputModel({
      labelText: 'Tenancy End Date',
      errorMessage: 'Enter the tenancy end date',
      inputType: 'date',
      showYearDate: true,
      disabled: String(this.tenancyStatusEditModel.getData()) === '0',
      required: this.model.get('tenancy_ended') ? true : false,
      value: this.model.get('tenancy_end_date'),
      apiMapping: 'tenancy_end_date'
    });

    this.rentAmountEditModel = new InputModel({
      labelText: 'Rent Amount',
      inputType: 'currency',
      allowZeroAmount: true,
      required: false,
      maxLength: this.AMOUNT_FIELD_MAX,
      value: this.model.get('rent_payment_amount'),
      apiMapping: 'rent_payment_amount'
    });

    const rentalIntervalMapping = 'rent_payment_interval',
      secondDropdownOptions = [
        { value: '1', text: 'First day of the month' },
        { value: '2', text: 'Last day of the month' },
        { value: '3', text: '15th day of the month' }
      ];
    this.rentalIntervalEditModel = new DoubleSelectorModel({
      showValidate: false,
      alwaysOptional: true,
      firstDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: [{ value: '1' , text: 'Monthly' }],
        labelText: 'Pay interval',
        errorMessage: 'Enter the pay interval',
        clearWhenHidden: true
      }),
      secondDropdownModel: new DropdownModel({
        defaultBlank: true,
        optionData: secondDropdownOptions,
        labelText: 'Payment day',
        errorMessage: 'Enter the payment day',
        clearWhenHidden: true
      }),
      otherInputModel: new InputModel({
        labelText: 'Due on the',
        errorMessage: 'Enter the description',
        maxLength: this.RENT_PAYMENT_INTERVAL_MAX,
      }),
      apiMapping: rentalIntervalMapping,
      enableOther: true,
      currentValue: this.model.get(rentalIntervalMapping)
    });


    this.securityDepositEditModel = new InputModel({
      labelText: 'Security Deposit',
      inputType: 'currency',
      required: false,
      maxLength: this.AMOUNT_FIELD_MAX,
      value: this.model.get('security_deposit_amount'),
      apiMapping: 'security_deposit_amount'
    });

    this.petDepositEditModel = new InputModel({
      labelText: 'Pet Damage Deposit',
      inputType: 'currency',
      required: false,
      maxLength: this.AMOUNT_FIELD_MAX,
      value: this.model.get('pet_damage_deposit_amount'),
      apiMapping: 'pet_damage_deposit_amount'
    });

    this.tenancyStartDateEditModel = new InputModel({
      labelText: 'Tenancy Start Date',
      inputType: 'date',
      showYearDate: true,
      required: false,
      value: this.model.get('tenancy_start_date'),
      apiMapping: 'tenancy_start_date'
    });


    this.tenancyEffectiveModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      required: false,
      labelText: 'Tenancy Agreement Effective Date',
      value: this.model.get('tenancy_agreement_date'),
      apiMapping: 'tenancy_agreement_date'
    });

    this.tenancySignedModel = new DropdownModel({
      optionData: this._getSignedByOptions(),
      defaultBlank: true,
      required: false,
      labelText: 'Signed By',
      value: this.model.get('tenancy_agreement_signed_by'),
      apiMapping: 'tenancy_agreement_signed_by'
    });


    this.tenancyAgreementFileDescriptionModels = filesChannel.request('get:filedescriptions:code', configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')) || [];

    this.tenancyAgreementFileDescriptionModels.forEach(fileDescription => {
      fileDescription.set('files', filesChannel.request('get:filedescription:files', fileDescription));
    });
  },


  setupListeners() {
    this.listenTo(this.tenancyStatusEditModel, 'change:value', function(model, value) {
      const tenancyEndDateComponent = this.getChildView('tenancyEndDateRegion');
      if (String(value) === '1') {
        this.tenancyEndDateEditModel.set({ required: true, disabled: false });
        tenancyEndDateComponent.toEditable();
      } else {
        this.tenancyEndDateEditModel.set({ required: false });
        tenancyEndDateComponent.toEditableDisabled(tenancyEndDateComponent.disabledMessage);
      }
    }, this);

    this.listenTo(this.urgencyEditModel, 'change:value', (model, value) => {
      const hasAutoUrgencyIssues = this.claims.some(claim => claim.get('claim_code') && !claim.isFeeRecovery());
      if (!value && hasAutoUrgencyIssues) this.getUI('autoSetUrgency').removeClass('hidden');
      else this.getUI('autoSetUrgency').addClass('hidden')
    });

    this.listenTo(this.complexityEditModel, 'change:value', (model, value) => {
      const hasIssues = this.claims.length;
      if (!value && hasIssues) this.getUI('autoSetComplexity').removeClass('hidden');
      else this.getUI('autoSetComplexity').addClass('hidden')
    });
  },

  setEditGroups() {
    this.amendmentEditGroup = ['unitTypeRegion', 'addressRegion'];

    this.preNoticeEditGroup = ['unitTypeRegion', 'addressRegion', 'submittedDateRegion', 'paymentDateRegion',
        'actRegion', 'urgencyRegion', 'complexityRegion', 'migrationTruthRegion', 'tenancyStatusRegion', 'tenancyEndDateRegion','tenancyStartDateRegion', 'rentAmountRegion',
        'rentalIntervalRegion', 'securityDepositRegion', 'petDepositRegion',
        'tenancyEffectiveRegion', 'tenancySignedRegion', 'crossAppRegion'
      ];

    this.postNoticeEditGroup = ['submittedDateRegion', 'paymentDateRegion', 'actRegion',
        'urgencyRegion', 'complexityRegion', 'migrationTruthRegion', 'tenancyStatusRegion', 'tenancyEndDateRegion','tenancyStartDateRegion', 'rentAmountRegion',
        'rentalIntervalRegion', 'securityDepositRegion', 'petDepositRegion',
        'tenancyEffectiveRegion', 'tenancySignedRegion', 'crossAppRegion'
      ];

    this.editDisableGroup = this.tenancyStatusEditModel.get('value') !== 0 ? [] :
        [{ child: 'tenancyEndDateRegion', disabledMessage: "Can't set the tenancy end date of a current tenancy" }];
  },

  onRender() {
    this.showChildView('partyNamesRegion', new PartyNames({ maxLength: this.model.get('sessionSettings')?.hearingToolsEnabled ? 50 : null }));

    this.showChildView('unitTypeRegion', new EditableComponentView({
      state: 'view',
      label: '',
      view_value: ' ',
      subView: new DoubleSelectorView({ model: this.unitTypeModel })
    }));
    
    const addressView = this.showChildView('addressRegion', new EditableComponentView({
      state: 'view',
      label: 'Rental Address',
      view_value: `<img class="address-validated-icon" src="${this.model.get('tenancy_address_validated') ? IconAddressVerified : IconAddressNotVerified}" />&nbsp;${this.model.get('sessionSettings')?.hearingToolsEnabled && this.addressEditModel.getAddressString() ? this.addressEditModel.getAddressString().toUpperCase() : this.addressEditModel.getAddressString()}`,
      subView: new AddressView({
        model: this.addressEditModel
      })
    }));

    this.listenTo(addressView?.currentView?.subView, 'itemComplete', () => {
      if (!this.addressEditModel.get('addressIsValidated')) this.getUI('addressWarning').removeClass('hidden');
      else this.getUI('addressWarning').addClass('hidden');
    })

    this.showChildView('submittedDateRegion', new EditableComponentView({
      state: 'view',
      label: 'Last Submitted Date',
      view_value: this.submittedDateEditModel.get('value') ? Formatter.toDateDisplay(this.submittedDateEditModel.get('value')) : '-',
      subView: new InputView({
        model: this.submittedDateEditModel
      })
    }));

    const latestIntakePayment = paymentsChannel.request('get:payment:intake');
    this.showChildView('paymentDateRegion', new EditableComponentView({
      state: 'view',
      label: 'Intake Payment',
      view_value: this.paymentDateEditModel.get('value') ? `${
        Formatter.toDateDisplay(this.paymentDateEditModel.get('value'))}
        ${latestIntakePayment && latestIntakePayment.isApproved() ? ` - ${Formatter.toPaymentMethodDisplay(latestIntakePayment.get('transaction_method'))}` : ''}
      ` : '-',
      subView: new InputView({
        model: this.paymentDateEditModel
      })
    }));

    this.showChildView('actRegion', new EditableComponentView({
      state: 'view',
      label: 'Act',
      view_value: this.actEditModel.get('value') === configChannel.request('get', 'DISPUTE_TYPE_MHPTA') ? 'MHPTA' : 'RTA',
      subView: new DropdownView({
        model: this.actEditModel
      })
    }));

    const urgencyOptions = this.urgencyEditModel.get('optionData') || {},
      dispute_urgency = this.model.get('dispute_urgency');
    this.showChildView('urgencyRegion', new EditableComponentView({
      state: 'view',
      label: 'Urgency',
      view_value: _.findWhere(urgencyOptions, { value: dispute_urgency}) ? Formatter.toUrgencyDisplay(dispute_urgency, { urgencyColor: true }) : '-',
      subView: new DropdownView({
        model: this.urgencyEditModel
      })
    }));

    const complexityOptions = this.complexityEditModel.get('optionData') || {};
    const disputeComplexity = String(this.model.get('dispute_complexity'));

    this.showChildView('complexityRegion', new EditableComponentView({
      state: 'view',
      label: 'Complexity',
      view_value: _.findWhere(complexityOptions, { value: disputeComplexity}) ? _.findWhere(complexityOptions, { value: disputeComplexity}).text : '-',
      subView: new DropdownView({
        model: this.complexityEditModel
      })
    }));

    this.showChildView('crossAppRegion', new EditableComponentView({
      state: 'view',
      label: 'Intake Filed in Response to',
      view_value: this.model.get('cross_app_file_number') || '-',
      subView: new InputView({
        model: this.crossAppEditModel
      })
    }));

    this.showChildView('migrationTruthRegion', new EditableComponentView({
      state: 'view',
      label: 'Source of truth',
      view_value: this.migrationTruthEditModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.migrationTruthEditModel
      })
    }));

    this.showChildView('tenancyStatusRegion', new EditableComponentView({
      state: 'view',
      label: 'Tenancy Status',
      view_value: this.tenancyStatusEditModel.get('value') ? 'Past Tenant' : 'Current Tenant',
      subView: new DropdownView({
        model: this.tenancyStatusEditModel
      })
    }));

    this.showChildView('tenancyEndDateRegion', new EditableComponentView({
      state: 'view',
      label: 'Tenancy End Date',
      view_value: Formatter.toDateDisplay(this.tenancyEndDateEditModel.get('value')),
      subView: new InputView({
        model: this.tenancyEndDateEditModel
      })
    }));

    this.showChildView('rentAmountRegion', new EditableComponentView({
      // Edit-only
      state: 'view',
      label: null,
      view_value: null,
      subView: new InputView({
        model: this.rentAmountEditModel
      })
    }));

    this.showChildView('rentalIntervalRegion', new EditableComponentView({
      // Edit-only
      state: 'view',
      label: null,
      view_value: null,
      subView: new DoubleSelectorView({
        model: this.rentalIntervalEditModel
      })
    }));


    this.showChildView('securityDepositRegion', new EditableComponentView({
      state: 'view',
      label: 'Security Deposit',
      view_value: this.securityDepositEditModel.get('value') ? Formatter.toAmountDisplay(this.securityDepositEditModel.get('value')) : '-',
      subView: new InputView({
        model: this.securityDepositEditModel
      })
    }));

    this.showChildView('securityDepositRegion', new EditableComponentView({
      state: 'view',
      label: 'Security Deposit',
      view_value: this.securityDepositEditModel.get('value') ? Formatter.toAmountDisplay(this.securityDepositEditModel.get('value')) : '-',
      subView: new InputView({
        model: this.securityDepositEditModel
      })
    }));

    this.showChildView('petDepositRegion', new EditableComponentView({
      state: 'view',
      label: 'Pet Damage Deposit',
      view_value: this.petDepositEditModel.get('value') ? Formatter.toAmountDisplay(this.petDepositEditModel.get('value')) : '-',
      subView: new InputView({
        model: this.petDepositEditModel
      })
    }));

    this.showChildView('tenancyStartDateRegion', new EditableComponentView({
      state: 'view',
      label: 'Tenancy Start Date',
      view_value: this.tenancyStartDateEditModel.get('value') ? Formatter.toDateDisplay(this.tenancyStartDateEditModel.get('value')) : '-',
      subView: new InputView({
        model: this.tenancyStartDateEditModel
      })
    }));


    this.showChildView('tenancyEffectiveRegion', new EditableComponentView({
      state: 'view',
      label: null,
      view_value: null,
      subView: new InputView({
        model: this.tenancyEffectiveModel
      })
    }));

    this.showChildView('tenancySignedRegion', new EditableComponentView({
      state: 'view',
      label: 'Tenancy Start Date',
      view_value: null,
      subView: new DropdownView({
        model: this.tenancySignedModel
      })
    }));

    const status = this.model.get('status') ? this.model.get('status') : {};
    this.showChildView('statusRegion', ContextContainer.withContextMenu({
      wrappedView: new DisputeStatusView({ model: this.model }),
      titleDisplay: 'Status',
      displayOnly: true,
      menu_model: status ? new DisputeStatusModel(status) : null,
      // Render the whole DisputeInfo view if dispute status triggers this event
      contextRender: () => this.render(),
      disputeModel: this.model,
    }));
  },

  templateContext() {
    const latestHearing = hearingChannel.request('get:latest');
    const primaryApplicant = participantChannel.request('get:primaryApplicant');
    const primaryApplicantPackageDelivery = primaryApplicant ? primaryApplicant.get('package_delivery_method') : null;
    const DISPUTE_URGENCY_DISPLAY = configChannel.request('get', 'DISPUTE_URGENCY_DISPLAY');
    const DISPUTE_CREATION_METHOD_DISPLAY = configChannel.request('get', 'DISPUTE_CREATION_METHOD_DISPLAY');
    const DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY = configChannel.request('get', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY');
    const isSigned = this.model.get('tenancy_agreement_signed_by') &&
        this.model.get('tenancy_agreement_signed_by') !== configChannel.request('get', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_NOT_SIGNED') &&
        DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY[this.model.get('tenancy_agreement_signed_by')];
    const primaryDisputeHearing = latestHearing ? latestHearing.getPrimaryDisputeHearing() : null;
    const secondaryDisputeHearings = latestHearing ? latestHearing.getSecondaryDisputeHearings() : null;
    const customFileMethodDisplayMappings = {
      101: 'To be uploaded',
      103: 'To be mailed',
      104: 'To be dropped off',
      105: 'Not provided'
    };
    const files_storage_setting = this.model.get('files_storage_setting');
    const DISPUTE_FILES_STORAGE_DISPLAY = configChannel.request('get', 'DISPUTE_FILES_STORAGE_DISPLAY') || {};
    const storageLocationDisplay = _.has(DISPUTE_FILES_STORAGE_DISPLAY, files_storage_setting) ? DISPUTE_FILES_STORAGE_DISPLAY[files_storage_setting] : (
      files_storage_setting === null ? 'Not Set' : null);

    // If there's only one TA with no files, assume it is the intake TA and show the 'provide later' message the user selected, if any
    const tenancyAgreementNoFileDisplay = this.tenancyAgreementFileDescriptionModels.length === 1 &&
        !this.tenancyAgreementFileDescriptionModels[0].get('files').getUploaded().length &&
        _.has(customFileMethodDisplayMappings, this.tenancyAgreementFileDescriptionModels[0].get('file_method')) ?
      customFileMethodDisplayMappings[this.tenancyAgreementFileDescriptionModels[0].get('file_method')] :
      '-';
    const isCreatedPfr = this.model.isCreatedPfr();

    const disputeCreator = disputeChannel.request('get:dispute:creator');
    const creatorDisplay = disputeCreator ? `(Filed by ${userChannel.request('get:user', disputeCreator.get('system_user_id'))?.getObscuredUsername()} - Access ${disputeCreator.get('is_active') ? 'Active' : 'Inactive'} <span class="general-link dispute-user-manager">Manage Access</span>)` : '';

    return {
      Formatter,
      issueCodesDisplay: isCreatedPfr && this.claims.length ? this.claims.at(0).getClaimCodeReadable() : Formatter.toIssueCodesDisplay(this.claims),
      disputeSubtypeDisplay: this.model.get('dispute_sub_type') === null ? 'None selected' : ( this.model.isLandlord() ? 'Landlord' : 'Tenant' ),
      disputeTypeDisplay: this.model.get('dispute_type') === null ? 'None selected' : ( this.model.isMHPTA() ? 'MHPTA (Manufactured home or trailer)' : 'RTA (Residential)' ),
      urgencyDisplay: _.has(DISPUTE_URGENCY_DISPLAY, this.model.get('dispute_urgency')) ? DISPUTE_URGENCY_DISPLAY[this.model.get('dispute_urgency')] : this.model.get('dispute_urgency'),
      creationMethodDisplay: _.has(DISPUTE_CREATION_METHOD_DISPLAY, this.model.get('creation_method')) ? `${DISPUTE_CREATION_METHOD_DISPLAY[this.model.get('creation_method')]} ${creatorDisplay}` : this.model.get('creation_method'),
      primaryApplicant: primaryApplicant ? ( this.model.get('sessionSettings')?.hearingToolsEnabled ? `${primaryApplicant.getContactName()}`.toUpperCase() : primaryApplicant.getContactName() ) : null,
      hearingOptionsByDisplay: primaryApplicantPackageDelivery ? Formatter.toHearingOptionsByDisplay(primaryApplicantPackageDelivery) :  '-',
      hearingDisplay: latestHearing ? latestHearing.toHearingDisplay() : '-',
      initialNoticeDisplay: this.model.get('original_notice_delivered') ? `Yes - ${Formatter.toDateAndTimeDisplay(this.model.get('original_notice_date'))}` : '-',
      tenancyAgreementFileCollections: this.tenancyAgreementFileDescriptionModels.filter(fileDescription => fileDescription.get('files').getUploaded().length).map(fileDescription => fileDescription.get('files')),
      tenancyAgreementNoFileDisplay,
      tenancyAgreementInfoDisplay: this.model.get('tenancy_agreement_date') ?
        `${Formatter.toDateDisplay(this.model.get('tenancy_agreement_date'))} - ${isSigned ? `signed by: ${DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY[this.model.get('tenancy_agreement_signed_by')]}`: 'Not Signed'}` : '-',
      linkTypeDisplay: !latestHearing ? '-' :
        latestHearing.isSingleApp() ? 'Single Application' :
        latestHearing.isCrossApp() ? 'Cross Application' :
        latestHearing.isJoinerApp() ? 'Joined Application' :
        latestHearing.isCrossRepeatApp() ? 'Cross-Repeat Application' :
        latestHearing.isRepeatedApp() ? 'Repeated Application' : '-'
      ,
      primaryDisputeHearingDisplay: primaryDisputeHearing ? primaryDisputeHearing.getDisputeLinkHtml() : '-',
      secondaryDisputeHearingsDisplay: !_.isEmpty(secondaryDisputeHearings) ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
        return dispute_hearing_model.getDisputeLinkHtml();
      }).join(',&nbsp;') : '-',
      storageLocationDisplay,
    };
  }
});
