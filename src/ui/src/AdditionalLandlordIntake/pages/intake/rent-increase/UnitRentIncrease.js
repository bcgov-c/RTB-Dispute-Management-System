import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import ModalAriMultiDelete from '../../../components/multi-delete/ModalAriMultiDelete';
import template from './UnitRentIncrease_template.tpl';

const UNSAVED_CHANGES_ERROR = 'Please update changes to continue';

const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,

  regions: {
    checkboxRegion: '.unit-rent-increase-checkbox',
    monthlyRentRegion: '.unit-rent-increase-monthly-rent',
    tenantsRegion: '.unit-rent-increase-tenants'
  },

  ui: {
    content: '.unit-rent-increase-content',
    validateBtn: '.unit-rent-increase-validate-btn',
    error: '.error-block'
  },

  events: {
    'click @ui.validateBtn': 'clickUpdate'
  },

  clickUpdate() {
    if (this.getUI('validateBtn').hasClass('btn-disabled') || !this.validateAndShowErrorsOnRentAndTenantInputs()) {
      return;
    }
    this.removeErrorStyles();

    const numTenantsSelected = this.tenantsModel.getData({ parse: true });      
    if (Number(numTenantsSelected) < this.model.getParticipantIds().length) {
      this.showTenantRemovalFromUnitModal();
      return;
    }
    
    // Stash the saved tenant value in the model
    if (this.tenantsModel.isValid()) {
      this.tenantsModel.set('_previousValue', numTenantsSelected, { silent: true });
    }
    
    this.saveInputValuesToLocal();
  },

  showUnitRemovalModal(onCancelFn) {
    onCancelFn = _.isFunction(onCancelFn) ? onCancelFn : (() => {});

    let isContinuePressed = false;
    
    const modalView = modalChannel.request('show:standard', {
      modalCssClasses: 'modal-rent-increase-removal',
      title: `Confirm ${this.model.getUnitNumDisplay()} Rent Increase Removal`,
      bodyHtml: `<p><b>Remove ${this.model.getStreetDisplayWithDescriptor()} as a rental unit?</b></p>`
      + `<p>Are you sure you want to remove this unit from being included in the rent increase?  If you remove this unit from the rent increase, all rent and tenant information associated to it will also be removed.</p>`
      + (this.SAVED_TENANT_NAMES.length ? `
          <p>The following tenants have been added to this rent increase unit and will be removed if the unit is removed as a rent increase unit:</p>
          <p><ul>
            ${this.SAVED_TENANT_NAMES.map(name => `<li>${name}</li>`).join('')}
          </ul></p>`
          : ''
      )
      + `<p>Press Cancel to keep this unit as a rental unit or Continue to remove it.</p>`,
      onContinueFn: (_modalView) => {
        isContinuePressed = true;
        _modalView.close();
        this.model.trigger('delete:full', this.model);
      },
    });

    this.listenTo(modalView, 'removed:modal', function() {
      if (!isContinuePressed) {
        onCancelFn();
      }
    }, this);
  },

  showTenantRemovalFromUnitModal() {
    let isContinuePressed = false;
    const numTenants = Number(this.tenantsModel.getData());
    const numSavedTenants = this.model.getParticipantIds().length;
    const numToRemove = numSavedTenants - numTenants;
    if (numToRemove < 1) {
      return;
    }

    const modalView = new ModalAriMultiDelete({
      title: `Delete Rent Increase Tenants`,
      bodyHtml: `<p>Information for ${numSavedTenants} tenant${numSavedTenants===1?'':'s'} in this unit has been saved to this application, but you have selected that only ${numTenants} tenant${numTenants===1?' is':'s are'} in the unit.</p>
      <p>Please select <b>${numToRemove} tenant${numToRemove===1?'':'s'}</b> to be deleted from this unit.</p>`,
      primaryButtonText: `Delete tenant${numToRemove===1?'':'s'}`,
      onContinueFn: (_modalView) => {
        isContinuePressed = true;
        const checkedIds = _.map(_modalView.checkboxCollection.getData(), model => model.get('participantId'));
        _modalView.close();

        // Also update tenant count in API count info
        this.model.set(this.tenantsModel.getPageApiDataAttrs());
        
        // Save new inputs 
        this.saveInputValuesToLocal();

        // Clean up participants and save
        this.model.trigger('delete:participants', this.model, checkedIds);
      },
      checkboxesOptions: { minSelectsRequired: numToRemove, maxSelectsAllowed: numToRemove },
      checkboxesData: _.filter(_.map(this.model.getParticipantIds(), participantId => {
        const participantModel = participantsChannel.request('get:participant', participantId);
        if (!participantModel) {
          return null;
        }

        return {
          html: participantModel.getDisplayName(),
          participantId: participantModel.id
        };
      }), v => v)
    })

    modalChannel.request('add', modalView);
    this.listenTo(modalView, 'removed:modal', () => {
      if (!isContinuePressed) {
        this.tenantsModel.set('value', this.tenantsModel.get('_previousValue') || null);
        this.tenantsModel.trigger('render');
      }
    });
  },
  
  initialize(options) {
    this.mergeOptions(options, ['validatePageFn']);
    this.SAVED_TENANT_NAMES = _.map(this.model.getParticipantIds(), participantId => participantsChannel.request('get:participant:name', participantId));
    this.AMOUNT_FIELD_MAX = configChannel.request('get', 'AMOUNT_FIELD_MAX');

    this.savedNumTenants = this.model.get('selected_tenants');
    this.savedRentAmount = this.model.get('rent_amount');
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.checkboxModel = new CheckboxModel({
      html: `<span>${this.model.getUnitNumDisplay()}:</span>&nbsp;<span class="unit-rent-increase-addr">${this.model.getStreetDisplayWithDescriptor()}</span>`,
      checked: this.model.hasSavedRentIncreaseData()
    });

    this.rentModel = new InputModel({
      labelText: 'Monthly rent',
      errorMessage: 'Enter the total monthly rent',
      inputType: 'currency',
      allowZeroAmount: false,
      required: true,
      maxLength: this.AMOUNT_FIELD_MAX,
      apiMapping: 'rent_amount',
      value: this.model.get('rent_amount'),
    });

    this.tenantsModel = new InputModel({
      labelText: 'Tenants',
      errorMessage: 'Enter the number of tenants',
      inputType: 'positive_integer',
      cssClass: 'smallest-form-field',
      maxLength: 2,
      required: true,
      apiMapping: 'selected_tenants',
      value: this.model.get('selected_tenants'),

      // Add an extra value here that can be used to re-set the model if tenant delete is cancelled
      _previousValue: this.model.get('selected_tenants'),
    });
  },

  selectUnitCheckbox() {
    this.checkboxModel.set('checked', true, { trigger: true });
  },

  setupListeners() {
    const onCheckboxChangeCompleteFn = () => {
      this.model.trigger('update:counts');
      this.render();
    };

    this.listenTo(this.model, 'unselect:checkbox', function() {
      this.checkboxModel.set('checked', false, { silent: true });
      onCheckboxChangeCompleteFn();
    });
    
    this.listenTo(this.checkboxModel, 'change:checked', (checkboxModel, value) => {
      
      if (!value && (this.model.getParticipantIds().length || this.savedNumTenants || this.savedRentAmount)) {
        // Always keep checkbox as "true" until confirmation occurs
        checkboxModel.set('checked', true, { silent: true });
        checkboxModel.trigger('render');

        if (_.isFunction(this.validatePageFn) && !this.validatePageFn()) {
          return;
        }
        this.showUnitRemovalModal(onCheckboxChangeCompleteFn);
      } else {
        this.rentModel.set('value', null, { silent: true });
        this.tenantsModel.set('value', null, { silent: true });
        onCheckboxChangeCompleteFn();
      }
    });


    this.listenTo(this.rentModel, 'change:value', this.refreshValidateBtnStyle, this);
    this.listenTo(this.tenantsModel, 'change:value', this.refreshValidateBtnStyle, this);
  },

  refreshValidateBtnStyle() {
    this.removeErrorStyles();
    if (this._shouldValidateButtonBeEnabled()) {
      this.validateEnable();
    } else {
      this.validateDisable();
    }
  },

  saveInputValuesToLocal() {
    this.savedNumTenants = this.tenantsModel.getData({ parse: true });
    this.savedRentAmount = this.rentModel.getData({ parse: true });

    this.validateDisable();
    this.setValidateTextToUpdate();
    this.model.trigger('update:counts');
  },

  validateEnable() {
    this.getUI('validateBtn').removeClass('btn-disabled');
  },

  validateDisable() {
    this.getUI('validateBtn').addClass('btn-disabled');
  },

  setValidateTextToUpdate() {
    this.getUI('validateBtn').text('Update');
  },

  _shouldValidateButtonBeEnabled() {
    return this.savedNumTenants !== this.tenantsModel.getData({ parse: true }) || this.savedRentAmount !== this.rentModel.getData({ parse: true });
  },

  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).show();
  },

  removeErrorStyles() {
    this.getUI('error').html('').hide();
  },
  
  isChecked() {
    return this.checkboxModel.get('checked');
  },

  getMonthlyAmount() {
    return this.isChecked() && (this._shouldValidateButtonBeEnabled() ? this.savedRentAmount : this.rentModel.getData({ parse: true })) || 0;
  },

  getSelectedTenants() {
    return this.isChecked() && (this._shouldValidateButtonBeEnabled() ? this.savedNumTenants : this.tenantsModel.getData({ parse: true })) || 0;
  },

  saveInternalDataToModel() {
    const unitData = {};

    _.each([this.rentModel, this.tenantsModel], (model) => _.extend(unitData, model.getPageApiDataAttrs()));

    this.model.set(unitData);
  },

  validateAndShowErrorsOnRentAndTenantInputs() {
    let isValid = true;
    if (this.isChecked()) {
      _.each(['monthlyRentRegion', 'tenantsRegion'], function(regionName) {
        const childView = this.getChildView(regionName);
        if (childView && childView.isRendered() && _.isFunction(childView.validateAndShowErrors)) {
          isValid = childView.validateAndShowErrors() && isValid;
        }
      }, this);
    }
    return isValid;
  },

  validateAndShowErrors() {
    let isValid = true;

    if (this.isChecked()) {
      isValid = this.validateAndShowErrorsOnRentAndTenantInputs();

      if (isValid && !this.getUI('validateBtn').hasClass('btn-disabled')) {
        this.showErrorMessage(UNSAVED_CHANGES_ERROR);
        isValid = false;
      }
    }

    return isValid;
  },
  
  onRender() {
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.checkboxModel }));

    this.showChildView('monthlyRentRegion', new InputView({ model: this.rentModel }));
    this.showChildView('tenantsRegion', new InputView({ model: this.tenantsModel }));
  },

  templateContext() {
    return {
      isChecked: this.isChecked()
    };
  }
});