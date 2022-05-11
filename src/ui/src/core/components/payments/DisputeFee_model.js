/**
 * @class core.components.
 * @memberof core.components.user
 * @augments Backbone.Model
 */

import CMModel from '../../../core/components/model/CM_model';
import Radio from 'backbone.radio';
import PaymentTransactionCollection from './PaymentTransaction_collection';
import PaymentTransactionModel from './PaymentTransaction_model';

const api_name = 'disputefee';
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');

export default CMModel.extend({
  idAttribute: 'dispute_fee_id',
  defaults: {
    payment_transactions: null, // Will be filled in and auto-parsed from nested_collections field
    dispute_fee_id: null,
    due_date: null,
    is_active: true,
    fee_type: null,
    fee_description: null,

    payor_id: null,
    amount_due: null,
    method_paid: null,
    is_paid: null,
    date_paid: null,
    amount_paid: null,
    
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'due_date',
    'is_active',
    'fee_type',
    'fee_description',
    'payor_id',
    'amount_due',
    'method_paid',
    'is_paid',
    'date_paid'
  ],

  nested_collections_data() {
    return {
      payment_transactions: PaymentTransactionCollection
    };
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}${this.isNew() ? '/'+disputeChannel.request('get:id') : ''}`;
  },

  // Add extra fields to the payment transaction
  initialize() {
    CMModel.prototype.initialize.call(this, ...arguments);
    this.get('payment_transactions').each(function(transaction) {
      transaction.set({
        dispute_fee_id: this.id,
        dispute_fee_amount_due: this.get('amount_due')
      }, {silent: true});
    }, this);
  },

  // Add extra fields to the payment transaction
  parse(response, options) {
    const parse_response = CMModel.prototype.parse.call(this, response, options);
    parse_response.payment_transactions.each(function(transaction) {
      transaction.set({
        dispute_fee_id: this.id,
        dispute_fee_amount_due: this.get('amount_due')
      }, {silent: true});
    }, this);
    return parse_response;
  },

  getPayments() {
    return this.get('payment_transactions');
  },

  _getPaymentAtIndex(index) {
    const payments = this.getPayments();
    return payments.length > index ? payments.at(index) : null;
  },

  getActivePayment() {
    return this._getPaymentAtIndex(0);
  },

  getPreviouslyActivePayment() {
    return this._getPaymentAtIndex(1);
  },

  createPayment(payment_data, options) {
    options = options || {};
    payment_data = payment_data || {};
    const created_payment = new PaymentTransactionModel(_.extend({
      transaction_by: this.get('payor_id') // This is overwritable by data passed in
    }, payment_data, {
      // This data will always be set
      dispute_fee_id: this.id,
      dispute_fee_amount_due: this.get('amount_due'),
    }), options);
    this.get('payment_transactions').unshift(created_payment);
    
    return options.no_save ? created_payment : created_payment.save();
  },

  isActive() {
    return !!this.get('is_active');
  },

  isPaid() {
    return !!this.get('is_paid');
  },

  isIntakeFee() {
    const dispute = disputeChannel.request('get');
    const feeTypeToUse = dispute && dispute.isUnitType() ? 'PAYMENT_FEE_TYPE_INTAKE_UNIT_BASED' : 'PAYMENT_FEE_TYPE_INTAKE';
    return this.get('fee_type') === configChannel.request('get', feeTypeToUse);
  },

  isReviewFee() {
    return this.get('fee_type') === configChannel.request('get', 'PAYMENT_FEE_TYPE_REVIEW');
  },

  isPayorTenant() {
    const matchingParticipant = participantsChannel.request('get:participant', this.get('payor_id'));
    return matchingParticipant && matchingParticipant.isTenant();
  },

  hasDeclinedFeeWaiver() {
    return this.getPayments().find(function(p) {
      return p.isFeeWaiver() && p.isDeclined();
    });
  },

  resetPaymentTransactions() {
    this.getPayments().each(function(paymentModel) {
      paymentModel.resetModel();
    });
  },

  addToDisputeFeeCollection(model) {
    paymentsChannel.request('add:fee', model);
  },

  /**
   * Cancels any previous pending payments
   * 
   */
  createAndSavePayment(paymentData) {
    const transaction_by = participantsChannel.request('get:primaryApplicant:id');
    const paymentTransactionData = _.extend({
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_PENDING'),
      transaction_by
    }, paymentData);
    const activePayment = this.getActivePayment();
    let createdPaymentModel = null;

    // If there's an existing pending payment, make sure to always cancel it once the new one is created
    return new Promise((res, rej) => {
      const paymentPromise = new Promise((_res, _rej) => {
        createdPaymentModel = this.createPayment(paymentTransactionData, { no_save: true });
        return createdPaymentModel.save().done(() => _res(createdPaymentModel)).fail(_rej);
      });
      paymentPromise
        .then(paymentTransactionModel => {
          if (!activePayment || !activePayment.isPending()) return res(paymentTransactionModel);
          activePayment.save({ payment_status: configChannel.request('get', 'PAYMENT_STATUS_CANCELLED') })
            .done(() => res(paymentTransactionModel)).fail(rej);
        }, rej)
    });
  },

  save(attributes, options)  {
    const dfd = $.Deferred();

    CMModel.prototype.save.call(this, attributes, options)
    .done(() => {
      this.addToDisputeFeeCollection(this);
      dfd.resolve();
    })
    .fail((err) => {
      console.log(err);
      dfd.reject();
    });

    return dfd.promise();
  }

});
