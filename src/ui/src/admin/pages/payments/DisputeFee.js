import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import TextareaView from '../../../core/components/textarea/Textarea';
import EditableComponent from '../../../core/components/editable-component/EditableComponent';
import DisputeFeeViewMixin from './DisputeFeeViewMixin';
import PaymentTransactionsView from './PaymentTransactions';
import ModalAddPaymentTransactionView from './ModalAddPaymentTransaction';
import template from './DisputeFee_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const DisputeFeeView = Marionette.View.extend({
  template,

  className: '',

  regions: {
    paymentsRegion: '.dispute-fee-payments',
    feeActiveRegion: '.dispute-fee-active',
    feeDueDateRegion: '.dispute-fee-due-date',
    feePayorRegion: '.dispute-fee-payor',
    feeDescriptionRegion: '.dispute-fee-description'
  },

  initialize() {
    this.mixin_createSubModels();
    this.setEditGroups();
  },

  reinitialize() {
    this.mixin_createSubModels();
    this.render();
  },

  setEditGroups() {
    this.editGroup = ['feeActiveRegion', 'feeDueDateRegion', 'feePayorRegion', 'feeDescriptionRegion'];
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
  },


  _saveModel() {
    const dispute = disputeChannel.request('get');
    if (dispute && dispute.checkEditInProgressModel(this.model)) {
      dispute.stopEditInProgress();
    }
    
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        this.reinitialize();
        this.trigger('contextRender');
        loaderChannel.trigger('page:load:complete');
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.FEE.SAVE', () => {
          this.model.resetModel();
          this.reinitialize();
          this.trigger('contextRender');
          loaderChannel.trigger('page:load:complete');
        });
        handler(err);
      });
  },

  onMenuSave() {
    if (this.validateAndShowErrors(this.editGroup)) {
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges(this.editGroup);
      this._saveModel();
    }
  },

  onMenuEdit() {
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  onMenuCancelTransaction() {
    const payment = this.model.getActivePayment();
    if (payment) {
      payment.resetModel();
    }
    this.render();
  },

  onMenuEditTransaction() {
    const payment = this.model.getActivePayment();
    if (payment) {
      if (payment.isOnline()) {
        loaderChannel.trigger('page:load');
      }
      const wasApproved = payment.isApproved();
      payment.checkTransaction()
      .done(() => {
        if (!wasApproved && payment.isApproved() && payment.isOnline()) {
          this.trigger('contextRender');
          loaderChannel.trigger('page:load:complete');
          paymentsChannel.request('show:checktrans:modal', payment);
        } else {
          payment.trigger('reinitialize');
          payment.trigger('to:edit');  
        }
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.PAYMENT.ONLINE.CHECK', () => {
          loaderChannel.trigger('page:load:complete');
          payment.trigger('reinitialize');
          payment.trigger('to:edit');
        })
      )
      .always(() => loaderChannel.trigger('page:load:complete'));
    }
  },

  onMenuSaveTransaction() {
    const payment = this.model.getActivePayment();
    if (payment) {
      this.listenToOnce(payment, 'save:complete', function() {
        this._paymentTransactionSaved();
      }, this);
      payment.trigger('save:transaction');
    }
  },

  onMenuMarkPaid() {
    const markPaidFn = () => {
      loaderChannel.trigger('page:load');
      const payment = this.model.getActivePayment();
      payment.set({ payment_status: configChannel.request('get', 'PAYMENT_STATUS_APPROVED') });
      payment.save(payment.getApiChangesOnly())
        .done(() => this._paymentTransactionSaved() )
        .fail(
          generalErrorFactory.createHandler('ADMIN.PAYMENT.SAVE', () => {
            this.trigger('contextRender');
            loaderChannel.trigger('page:load:complete');
          })
        );
    };

    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.checkEditInProgressPromise().then(
        markPaidFn,
        () => dispute.showEditInProgressModalPromise()
      );
    } else {
      markPaidFn();
    }
  },

  _paymentTransactionSaved() {
    const dispute = disputeChannel.request('get');
    if (dispute && dispute.checkEditInProgressModel(this.model)) {
      dispute.stopEditInProgress();
    }

    const reRenderDisputeFn = _.bind(function() {
      this.trigger('contextRender');
      loaderChannel.trigger('page:load:complete');
    }, this);
  
    
    this.model.fetch()
      .done(() => {
        // Parse active payment again
        const activePayment = this.model.getActivePayment();

        if (activePayment && activePayment.isApproved()) {
          $.whenAll(
              dispute.checkAndUpdateInitialPayment({
                initial_payment_method: activePayment.get('transaction_method'),
                initial_payment_by: activePayment.get('transaction_by')
              }),
              dispute.checkStageStatus(0, [2, 3, 4]) ? 
                  dispute.saveStatus({ dispute_stage: 2, dispute_status: 20 }) : $.Deferred().resolve().promise()
          )
          .done(reRenderDisputeFn)
          .fail(generalErrorFactory.createHandler('ADMIN.DISPUTE.SAVE', reRenderDisputeFn))
          .always(() => loaderChannel.trigger('page:load:complete'));
        } else if (activePayment && !activePayment.isApproved()) {
          const promise = dispute.checkStageStatus(2, [20, 21]) ? dispute.saveStatus({ dispute_stage: 0, dispute_status: 2 }) : $.Deferred().resolve().promise();
          promise
            .done(reRenderDisputeFn)
            .fail(generalErrorFactory.createHandler('ADMIN.PSSO.SAVE', reRenderDisputeFn))
            .always(() => loaderChannel.trigger('page:load:complete'));
        } else {
          reRenderDisputeFn();
        } 
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.FEE.LOAD', reRenderDisputeFn, 'The dispute payment date and dispute status may not be aligned with payment update you have just made.');
        handler(err);
      });
  },

  onMenuAddTransaction() {
    const addTransactionFn = () => {
      const modal = new ModalAddPaymentTransactionView({
        // Create a temporary new payment.  Will be saved if user saves in modal
        model: this.model.createPayment({}, { no_save: true, silent: true }),
        // If creating a new payment, update the previously active one first
        activePayment: this.model.getPreviouslyActivePayment() || null
      });
  
      modal.once('save:complete', () => {
        modalChannel.request('remove', modal);
        this._paymentTransactionSaved();
      });
      modalChannel.request('add', modal);
    };

    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.checkEditInProgressPromise().then(
        addTransactionFn,
        () => dispute.showEditInProgressModalPromise()
      );
    } else {
      addTransactionFn();
    }
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
    this.showChildView('feeActiveRegion', new EditableComponent({
      label: 'Active',
      view_value: this.activeDropdownModel.getData({ parse: true }) ? 'Yes' : 'No',
      subView: new DropdownView({ model: this.activeDropdownModel })
    }));
    
    this.showChildView('feeDueDateRegion', new EditableComponent({
      label: 'Due Date',
      view_value: this.model.get('due_date') ? Formatter.toDateDisplay(this.model.get('due_date')) : null,
      subView: new InputView({ model: this.dueDateModel })
    }));

    const selectedOption = _.findWhere(this.payorModel.get('optionData'), { value: String(this.model.get('payor_id')) });
    this.showChildView('feePayorRegion', new EditableComponent({
      label: 'Payor',
      view_value: selectedOption ? selectedOption.text : '-',
      subView: new DropdownView({ model: this.payorModel })
    }));

    this.showChildView('feeDescriptionRegion', new EditableComponent({
      label: 'Description',
      view_value: this.model.get('fee_description') ? this.model.get('fee_description') : '-',
      subView: new TextareaView({ model: this.descriptionModel })
    }));

    this.showChildView('paymentsRegion', new PaymentTransactionsView({ collection: this.model.getPayments() }));
  },

  templateContext() {
    const PAYMENT_METHOD_DISPLAY = configChannel.request('get', 'PAYMENT_METHOD_DISPLAY');
    return {
      Formatter,
      feeTypeDisplay: Formatter.toFeeTypeDisplay(this.model.get('fee_type')),
      createdByDisplay: userChannel.request('get:user:name', this.model.get('created_by')),
      paymentMethodDisplay: PAYMENT_METHOD_DISPLAY && _.has(PAYMENT_METHOD_DISPLAY, this.model.get('method_paid')) ? PAYMENT_METHOD_DISPLAY[this.model.get('method_paid')] : '-'
    }
  }
});

_.extend(DisputeFeeView.prototype, DisputeFeeViewMixin);

export default DisputeFeeView;