import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareView from '../../../core/components/textarea/Textarea';
import InputView from '../../../core/components/input/Input';
import PaymentTransactionViewMixin from '../../../core/components/payments/PaymentTransactionViewMixin';
import template from './ModalAddPaymentTransaction_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const animationChannel = Radio.channel('animations');
const Formatter = Radio.channel('formatter').request('get');

const ModalAddPaymentTransactionView = Marionette.View.extend({
  template,

  regions: {
    transactionMethodRegion: '.addTransaction-method',
    paymentStatusRegion: '.addTransaction-status',
    transactionAmountRegion: '.addTransaction-amount',
    cardRegion: '.addTransaction-card',
    onlineApprovalRegion: '.addTransaction-transaction-approval',
    onlineIdRegion: '.addTransaction-transaction-id',
    officeIdirRegion: '.addTransaction-office-idir',
    familyCountRegion: '.addTransaction-family-count',
    familyIncomeRegion: '.addTransaction-family-income',
    cityRegion: '.addTransaction-city',

    hardshipQuestionRegion: '.addTransaction-hardship',
    hardshipDetailsRegion: '.addTransaction-hardship-details'
  },

  ui: {
    onlineContainer: '.addTransaction-online-container',
    officeContainer: '.addTransaction-office-container',
    feeWaiverContainer: '.addTransaction-fee-waiver-container',

    save: '#addTransactionSave',
    cancel: '#addTransactionCancel',
    close: '.close-x'
  },

  events: {
    'click @ui.close': 'clickClose',
    'click @ui.cancel': 'clickClose',
    'click @ui.save': 'clickSave',
  },

  clickClose() {
    // Make sure to clean up model
    if (this.model.isNew() && this.model.collection) {
      this.model.collection.remove(this.model);
    }
    Radio.channel('modals').request('remove', this);
  },


  clickSave() {
    const childViewsToValidate = this._isOnline() ? this.onlineGroup :
        this._isOffice() ? this.officeGroup :
        this._isFeeWaiver() ? this.feeWaiverGroup :
        this.defaultGroup;

    if (this.validateAndShowErrors(childViewsToValidate)) {
      loaderChannel.trigger('page:load');

      $.when(this.activePayment ? this.activePayment.cancelAndSave() : null).always(() => {
        this._applyPageModelChanges(childViewsToValidate);
        this._saveModel();
      });
    }
  },

  validateAndShowErrors(childViews) {
    let is_valid = true;
    _.each(childViews, function(component_name) {
      const component = this.getChildView(component_name);
      if (component && component.validateAndShowErrors) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  _applyPageModelChanges(childViews) {
    _.each(childViews, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        this.model.set(component.model.getPageApiDataAttrs());
      }
    }, this);
    
    // When creating a new payment transaction, always set to verified so the scheduler doesn't overwrite status
    this.model.set({ payment_verified: 1 });
  },

  _saveModel() {
    this.model.save(this.model.getApiChangesOnly())
      .done(() => this.trigger('save:complete'))
      .fail(generalErrorFactory.createHandler('ADMIN.PAYMENT.CREATE', () => this.trigger('save:complete')))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  animateHideContainers() {
    //animationChannel.request('queue', this.getUI('onlineContainer'), 'fadeOut');
    animationChannel.request('queue', this.getUI('officeContainer'), 'fadeOut');
    animationChannel.request('queue', this.getUI('feeWaiverContainer'), 'fadeOut');
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
      animationChannel.request('queue', this.getUI(ui), 'fadeIn');
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['activePayment']);
    this.mixin_createSubModels();

    // Pre-populate the dispute fee IDIR entry with current user's user_name.  For Admin users, this should be the IDIR.
    const currentUser = sessionChannel.request('get:user');
    if (this.officeIdirModel) {
      this.officeIdirModel.set('value', currentUser.get('user_name'));
    }

    this.setupListeners();
    this.setEditGroups();
  },

  setupListeners() {
    this.listenTo(this.transactionMethodModel, 'change:value', function(model, value) {
      value = value ? Number(value) : value;
      this.amountInputModel.set({
        value: Formatter.toAmountDisplay(
          (this._isOnline(value) || this._isOffice(value)) ? this.model.get('dispute_fee_amount_due') : 0
        ).replace('$', '')
      });
      const childView = this.getChildView('transactionAmountRegion');
      if (childView) {
        childView.render();
      }
      this.animateHideContainers();
      this.animateShowContainer();
    }, this);

    this.listenTo(this.hardshipQuestionModel, 'change:value', function(model) {
      this.hardshipDetailsModel.set('required', model.getData({ parse: true }) === 1);
    }, this);
  },

  setEditGroups() {
    this.defaultGroup = ['transactionMethodRegion', 'paymentStatusRegion', 'transactionAmountRegion'];
    
    this.onlineGroup = [ ...this.defaultGroup ]; //, 'cardRegion', 'onlineApprovalRegion', 'onlineIdRegion' ];
    this.officeGroup = [ ...this.defaultGroup, 'officeIdirRegion' ];
    this.feeWaiverGroup = [ ...this.defaultGroup, 'familyCountRegion', 'familyIncomeRegion', 'cityRegion', 'hardshipQuestionRegion', 'hardshipDetailsRegion'];
  },

  _getTransactionMethod() {
    //return this.model.get('transaction_method');
    const childView = this.isRendered() ? this.getChildView('transactionMethodRegion') : null;
    return childView ? childView.model.getData({ parse: true }) : this.model.get('transaction_method');
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

  onRender() {
    this.showChildView('transactionMethodRegion', new DropdownView({ model: this.transactionMethodModel }));
    this.showChildView('paymentStatusRegion', new DropdownView({ model: this.paymentStatusModel }));
    this.showChildView('transactionAmountRegion', new InputView({ model: this.amountInputModel }));

    this.showChildView('officeIdirRegion', new InputView({ model: this.officeIdirModel }));
    
    this.showChildView('familyCountRegion', new InputView({ model: this.familyCountModel }));
    this.showChildView('familyIncomeRegion', new InputView({ model: this.familyIncomeModel }));
    this.showChildView('cityRegion', new DropdownView({ model: this.citySizeModel }));

    this.showChildView('hardshipQuestionRegion', new DropdownView({ model: this.hardshipQuestionModel }));
    this.showChildView('hardshipDetailsRegion', new TextareView({ model: this.hardshipDetailsModel }));    
  },

  attachElContent(html) {
    // Have to attach modals this way so that the 'modal' class in the template is top-level
    this.setElement(html);
    return this;
  },

  templateContext() {
    return _.extend({}, this.options, {
      isOnline: this._isOnline(),
      isOffice: this._isOffice(),
      isFeeWaiver: this._isFeeWaiver()
    });
  }
});

_.extend(ModalAddPaymentTransactionView.prototype, PaymentTransactionViewMixin);

export default ModalAddPaymentTransactionView;