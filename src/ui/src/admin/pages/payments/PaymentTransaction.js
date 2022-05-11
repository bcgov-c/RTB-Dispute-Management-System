import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareaView from '../../../core/components/textarea/Textarea';
import InputView from '../../../core/components/input/Input';
import PaymentTransactionViewMixin from '../../../core/components/payments/PaymentTransactionViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './PaymentTransaction_template.tpl';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const participantsChannel = Radio.channel('participants');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const PaymentTransactionView = Marionette.View.extend({
  template,
  className: 'review-information-body payment-transaction-item standard-list-item',

  regions: {
    methodRegion: '.payment-transaction-method',
    statusRegion: '.payment-transaction-status',
    amountRegion: '.payment-transaction-amount',
    cardTypeRegion: '.payment-transaction-card-type',
    onlineApprovalRegion: '.payment-transaction-online-approval',
    onlineTransactionIdRegion: '.payment-transaction-online-id',
    officeIdirRegion: '.payment-transaction-idir',
    familySizeRegion: '.payment-transaction-family-size',
    familyIncomeRegion: '.payment-transaction-family-income',
    citySizeRegion: '.payment-transaction-city-size',

    hardshipQuestionRegion: '.payment-transaction-hardship',
    hardshipDetailsRegion: '.payment-transaction-hardship-details'
  },

  ui: {
    onlineContainer: '.payment-transaction-online-container',
    officeContainer: '.payment-transaction-office-container',
    feeWaiverContainer: '.payment-transaction-fee-waiver-container'
  },

  initialize() {
    this.mixin_createSubModels();
    this.transactionMethodModel.set('defaultBlank', false);

    this.setEditGroups();
    this.setupListeners();

    this.transactionBy = participantsChannel.request('get:participant', this.model.get('transaction_by'));
  },

  reinitialize() {
    this.mixin_createSubModels();
    this.setupListeners();
    this.render();
  },

  setEditGroups() {
    this.editGroup = [
      //'methodRegion',
      'statusRegion', 'amountRegion',
      // 'cardTypeRegion', 'onlineApprovalRegion', 'onlineTransactionIdRegion',
      'officeIdirRegion',
      'familySizeRegion', 'familyIncomeRegion', 'citySizeRegion',
      'hardshipQuestionRegion', 'hardshipDetailsRegion'
    ];
  },

  _getTransactionMethod() {
    const component = this.isRendered() ? this.getChildView('methodRegion') : null;
    return component && component.isActive() ? component.getModel().getData({ parse: true }) : this.model.get('transaction_method');
  },

  _isOnline(transaction_method=null) {
    return (transaction_method || this._getTransactionMethod()) === configChannel.request('get', 'PAYMENT_METHOD_ONLINE');
  },

  _isOffice(transaction_method=null) {
    return (transaction_method || this._getTransactionMethod()) === configChannel.request('get', 'PAYMENT_METHOD_OFFICE');
  },

  _isFeeWaiver(transaction_method=null) {
    return (transaction_method || this._getTransactionMethod()) === configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER');
  },

  animateHideContainers() {
    animationChannel.request('queue', this.getUI('onlineContainer'), 'hide');
    animationChannel.request('queue', this.getUI('officeContainer'), 'hide');
    animationChannel.request('queue', this.getUI('feeWaiverContainer'), 'hide');
  },

  animateShowContainer() {
    let ui;
    if (this._isOnline()) {
      ui = 'onlineContainer';
    } else if (this._isOffice()) {
      ui = 'officeContainer';
    } else if (this._isFeeWaiver()) {
      ui = 'feeWaiverContainer';
    }

    if (ui) {
      animationChannel.request('queue', this.getUI(ui), 'show');
    }
  },

  setupListeners() {
    this.stopListening(this.model, 'reinitialize', this.reinitialize);
    this.listenTo(this.model, 'reinitialize', this.reinitialize, this);

    this.stopListening(this.model, 'to:edit', this.toEditMode);
    this.listenTo(this.model, 'to:edit', this.toEditMode, this);

    this.stopListening(this.model, 'save:transaction', this.saveTransaction);
    this.listenTo(this.model, 'save:transaction', this.saveTransaction, this);

    this.stopListening(this.transactionMethodModel, 'change:value');
    this.listenTo(this.transactionMethodModel, 'change:value', function(model, value) {
      value = Number(value);
      if (!value) {
        return;
      }
      this.amountInputModel.set({
        value: Formatter.toAmountDisplay(
          (this._isOnline(value) || this._isOffice(value)) ? this.model.get('dispute_fee_amount_due') : 0
        ).replace('$', '')
      });
      this.animateHideContainers();
      this.animateShowContainer();

      const childView = this.getChildView('amountRegion');
      if (childView) {
        childView.render();
      }
    }, this);

    this.stopListening(this.hardshipQuestionModel, 'change:value');
    this.listenTo(this.hardshipQuestionModel, 'change:value', function(model) {
      this.hardshipDetailsModel.set('required', model.getData({ parse: true }) === 1);
    }, this);
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

    // When creating a new payment transaction, always set to verified so the scheduler doesn't overwrite status
    this.model.set({ payment_verified: 1 });
  },

  _saveModel() {
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        this.reinitialize();
        this.model.trigger('save:complete');
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.PAYMENT.SAVE', () => {
          this.model.resetModel();
          this.reinitialize();
          this.model.trigger('save:complete');
        })
      )
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  saveTransaction() {
    if (this.validateAndShowErrors(this.editGroup)) {
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges(this.editGroup);
      this._saveModel();
    }
  },

  toEditMode() {
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  resetModelValues() {
    this.model.resetModel();
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

  onRender() {
    const PAYMENT_METHOD_DISPLAY = configChannel.request('get', 'PAYMENT_METHOD_DISPLAY'),
      PAYMENT_STATUS_DISPLAY = configChannel.request('get', 'PAYMENT_STATUS_DISPLAY'),
      FEE_WAIVER_CITY_SIZE_DISPLAY = configChannel.request('get', 'FEE_WAIVER_CITY_SIZE_DISPLAY');
    
    this.showChildView('methodRegion', new EditableComponentView({
      state: 'view',
      label: 'Transaction Method',
      view_value: PAYMENT_METHOD_DISPLAY && _.has(PAYMENT_METHOD_DISPLAY, this.model.get('transaction_method')) ? PAYMENT_METHOD_DISPLAY[this.model.get('transaction_method')] : '-',
      subView: new DropdownView({ model: this.transactionMethodModel })
    }));

    this.showChildView('statusRegion', new EditableComponentView({
      state: 'view',
      label: 'Payment Status',
      view_value: PAYMENT_STATUS_DISPLAY && _.has(PAYMENT_STATUS_DISPLAY, this.model.get('payment_status')) ? PAYMENT_STATUS_DISPLAY[this.model.get('payment_status')] : '-',
      subView: new DropdownView({ model: this.paymentStatusModel })
    }));

    const amount = this.amountInputModel.getData();
    this.showChildView('amountRegion', new EditableComponentView({
      state: 'view',
      label: 'Payment Amount',
      view_value: amount === null ? '-' : Formatter.toAmountDisplay(amount).replace('$', ''),
      subView: new InputView({ model: this.amountInputModel })
    }));

    this.showChildView('cardTypeRegion', new EditableComponentView({
      state: 'view',
      label: 'Card Type',
      view_value: this.cardTypeModel.getData() ? this.cardTypeModel.getData() : '-',
      subView: new InputView({ model: this.cardTypeModel })
    }));

    this.showChildView('onlineApprovalRegion', new EditableComponentView({
      state: 'view',
      label: 'Transaction Approved',
      view_value: this.transactionApprovedModel.getData() ? 'Yes' : 'No',
      subView: new DropdownView({ model: this.transactionApprovedModel })
    }));

    this.showChildView('onlineTransactionIdRegion', new EditableComponentView({
      state: 'view',
      label: 'Online Transaction ID',
      view_value: this.transactionIdModel.getData() ? this.transactionIdModel.getData() : '-',
      subView: new InputView({ model: this.transactionIdModel })
    }));


    this.showChildView('officeIdirRegion', new EditableComponentView({
      state: 'view',
      label: 'Office Payment IDIR',
      view_value: $.trim(this.officeIdirModel.getData()) || null,
      subView: new InputView({ model: this.officeIdirModel })
    }));

    this.showChildView('familySizeRegion', new EditableComponentView({
      state: 'view',
      label: this.transactionBy ? (
        this.transactionBy.isLandlord() ? '# Landlord(s)' : '# Tenants and Family'
      ) : '# Applicants and Family',
      view_value: $.trim(this.familyCountModel.getData()) || null,
      subView: new InputView({ model: this.familyCountModel })
    }));

    this.showChildView('familyIncomeRegion', new EditableComponentView({
      state: 'view',
      label: 'Monthly Income',
      view_value: this.familyIncomeModel.getData() ? Formatter.toAmountDisplay(this.familyIncomeModel.getData()) : '-',
      subView: new InputView({ model: this.familyIncomeModel })
    }));

    this.showChildView('citySizeRegion', new EditableComponentView({
      state: 'view',
      label: 'City Size',
      view_value: FEE_WAIVER_CITY_SIZE_DISPLAY && _.has(FEE_WAIVER_CITY_SIZE_DISPLAY, this.model.get('fee_waiver_city_size')) ? FEE_WAIVER_CITY_SIZE_DISPLAY[this.model.get('fee_waiver_city_size')] : '-',
      subView: new DropdownView({ model: this.citySizeModel })
    }));


    const fee_waiver_hardship = this.model.get('fee_waiver_hardship');
    this.showChildView('hardshipQuestionRegion', new EditableComponentView({
      state: 'view',
      label: 'Hardship Indicated',
      view_value: fee_waiver_hardship === null ? '-' : (fee_waiver_hardship ? 'Yes' : 'No'),
      subView: new DropdownView({ model: this.hardshipQuestionModel })
    }));

    this.showChildView('hardshipDetailsRegion', new EditableComponentView({
      state: 'view',
      label: 'Hardship Description',
      view_value: this.model.get('fee_waiver_hardship_details') || '',
      subView: new TextareaView({ model: this.hardshipDetailsModel })
    }));

  },

  templateContext() {
    return {
      Formatter,
      isOnline: this.model.isOnline(),
      isOffice: this.model.isOffice(),
      isFeeWaiver: this.model.isFeeWaiver(),
      transactionByDisplay: this.transactionBy ? this.transactionBy.getContactName() : '-',
      modifiedByDisplay: userChannel.request('get:user:name', this.model.get('modified_by')),
      createdByDisplay: userChannel.request('get:user:name', this.model.get('created_by')),
    };
  }
});

_.extend(PaymentTransactionView.prototype, PaymentTransactionViewMixin);
export default PaymentTransactionView;