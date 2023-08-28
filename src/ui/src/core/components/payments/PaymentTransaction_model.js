/**
 * @class core.components.
 * @memberof core.components.user
 * @augments Backbone.Model
 */

import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';

const api_name = 'paytransaction';
const RECOVERY_NOTE = `Payment Auto-Recovered - Date of transaction was set to the date the payment recovery process was run, not the date of the actual payment.`;

const configChannel = Radio.channel('config');
const paymentsChannel = Radio.channel('payments');

export default CMModel.extend({
  idAttribute: 'payment_transaction_id',

  defaults: {
    payment_transaction_id: null,
    transaction_site_source: null,
    transaction_method: null,
    office_payment_idir: null,
    transaction_by: null,
    transaction_amount: null,
    payment_note: null,
    payment_status: null,
    payment_verified: 0,

    fee_waiver_tenants_family: null,
    fee_waiver_income: null,
    fee_waiver_city_size: null,
    fee_waiver_hardship: null,
    fee_waiver_hardship_details: null,
    payment_provider: null,

    // Online fields that can be patched/posted
    trn_id: null,
    card_type: null,
    trn_approved: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,

    // These needs to be passed in when creating the model
    dispute_fee_id: null, 
    dispute_fee_amount_due: null
  },

  API_POST_ONLY_ATTRS: [
    'transaction_site_source'
  ],

  API_SAVE_ATTRS: [
    'transaction_method',
    'office_payment_idir',
    'transaction_by',
    'transaction_amount',
    'payment_status',
    'payment_verified',
    'payment_note',

    'trn_id',
    'card_type',
    'trn_approved',

    'fee_waiver_tenants_family',
    'fee_waiver_income',
    'fee_waiver_city_size',
    'fee_waiver_hardship',
    'fee_waiver_hardship_details',
    'payment_provider',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${ this.isNew() ? this.get('dispute_fee_id') : '' }`;
  },

  _isTransactionMethod(transaction_method) {
    return this.get('transaction_method') === transaction_method;
  },

  isOnline() {
    return this._isTransactionMethod(configChannel.request('get', 'PAYMENT_METHOD_ONLINE'));
  },

  isOffice() {
    return this._isTransactionMethod(configChannel.request('get', 'PAYMENT_METHOD_OFFICE'));
  },

  isFeeWaiver() {
    return this._isTransactionMethod(configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER'));
  },

  isPending() {
    return this.get('payment_status') === configChannel.request('get', 'PAYMENT_STATUS_PENDING');
  },

  isApproved() {
    return this.get('payment_status') === configChannel.request('get', 'PAYMENT_STATUS_APPROVED');
  },

  isDeclined() {
    return this.get('payment_status') === configChannel.request('get', 'PAYMENT_STATUS_REJECTED');
  },

  isCancelled() {
    return this.get('payment_status') === configChannel.request('get', 'PAYMENT_STATUS_CANCELLED') ||
      this.get('payment_status') === configChannel.request('get', 'PAYMENT_STATUS_CANCELLED_PAID');
  },

  isFeeWaiverStep1Complete() {
    const fee_waiver_fields = ['fee_waiver_tenants_family', 'fee_waiver_income', 'fee_waiver_city_size'];
    return this.isFeeWaiver() && _.all(fee_waiver_fields, function(field) { return this.get(field) !== null; }, this);
  },

  cancelAndSave() {
    const newStatusCode = this.isApproved() ? 'PAYMENT_STATUS_CANCELLED_PAID' :
      (this.isPending() ? 'PAYMENT_STATUS_CANCELLED' : null);
    
    return newStatusCode ? this.save({ payment_status: configChannel.request('get', newStatusCode) }) : $.Deferred().resolve().done();  
  },

  save(attrs, options) {
    // Always add the transaction site source if this is a new API object without one already set
    if (!this.get('transaction_site_source') && !(attrs || {}).transaction_site_source && this.isNew()) {
      const transactionSiteSource = paymentsChannel.request('get:transaction:site:source');
      if (transactionSiteSource) {
        this.set('transaction_site_source', transactionSiteSource, { silent: true });
        if (_.isObject(attrs)) {
          attrs.transaction_site_source = transactionSiteSource;
        }
      }
    }

    // Cast fee waiver hardship as a number for database validation rules
    if (_.isObject(attrs) && attrs.fee_waiver_hardship) {
      const hardshipAsNumber = Number(attrs.fee_waiver_hardship);
      attrs.fee_waiver_hardship = !_.isNaN(hardshipAsNumber) ? hardshipAsNumber : attrs.fee_waiver_hardship;
    }

    return CMModel.prototype.save.call(this, attrs, options);
  },

  /**
   * This function checks the payment data against beanstream and updates the local state as needed.  Fires info modal if payment gets recovered
   * from an unpaid state to a paid state after beanstream check.
   * 
   * @param {boolean} options.no_cancel - If true, won't cancel the previous payment.  Useful when doing simple bulk validating payments in the background,
   *  and not wanting to cancel a bunch of payments as a side effect
   * @param {boolean} options.no_modal - If true, will not show the payment recovery modal in the case where payment was recovered
   * @param {boolean} options.update_status_only - If true, this function will only update the status field API after unifying beanstream response.
   *  Otherwise all derived info will be parsed from the beanstream check response into the PaymentTransaction model
  */
  updateTransactionAfterBeanstream(options={}) {
    const dfd = $.Deferred();
    const wasApproved = this.isApproved();
    this.checkTransaction().done(() => {
      let nowApproved = this.isApproved();
      let newPaymentStatus;
      let extraSaveNeeded = false;
      // Now parse the derived attributes and save the payment status back
      if (!this.isApproved() && this.checkOnlineDerivedIsAccepted()) {
        newPaymentStatus = configChannel.request('get', 'PAYMENT_STATUS_APPROVED');
        nowApproved = true;
      } else if (!this.isDeclined() && this.checkOnlineDerivedIsDeclined()) {
        newPaymentStatus = configChannel.request('get', 'PAYMENT_STATUS_REJECTED');
      } else if (!options.no_cancel && !nowApproved && !this.isCancelled() && this.checkOnlineDerivedIsCancelled()) {
        newPaymentStatus = configChannel.request('get', 'PAYMENT_STATUS_CANCELLED');
      }
      
      const paymentUpdateData = {};
      if (!options.no_modal && !wasApproved && this.isOnline() && nowApproved) {
        extraSaveNeeded = true;
        Object.assign(paymentUpdateData, { payment_note: RECOVERY_NOTE });
        paymentsChannel.request('show:checktrans:modal', this);
      }

      if (newPaymentStatus) {
        extraSaveNeeded = true;
        Object.assign(paymentUpdateData, { payment_status: newPaymentStatus });
      }

      const feeModel = paymentsChannel.request('get:fees').filter(f => f.get('dispute_fee_id') === this.get('dispute_fee_id'))?.[0];
      if (nowApproved && !feeModel.isPaid()) {
        feeModel.set({ is_paid: true }, { silent: true });
      }

      if (extraSaveNeeded) {
        if (options.update_status_only) {
          this.save(paymentUpdateData).done(dfd.resolve).fail(dfd.reject);
        } else {
          this.set(paymentUpdateData);
          this.save().done(dfd.resolve).fail(dfd.reject);
        }
      } else {
        dfd.resolve();
      }

    }).fail(dfd.reject);

    return dfd.promise();
  },


  checkTransaction() {
    const dfd = $.Deferred();
    paymentsChannel.request('check:transaction', this)
      .done(response => {
        console.log(`Return from check:transaction ${this.id}`);
        const parsedResponse = this.parse(response);
        this.set(parsedResponse, { silent: true });
        dfd.resolve(response);
      }).fail(dfd.reject);
    return dfd.promise();
  },

  hasValidTrnId() {
    return this.get('trn_id') && String(this.get('trn_id')) !== "0";
  },

  // Check derived status of the online payment based on payment state
  checkOnlineDerivedNotChecked() {
    return this.isOnline() && !this.get('transaction_amount');
  },

  checkOnlineDerivedIsAccepted() {
    return this.isOnline() && this.hasValidTrnId() && this.get('trn_approved');
  },

  checkOnlineDerivedIsDeclined() {
    return this.isOnline() && this.hasValidTrnId() && this.get('trn_approved') === false;
  },

  checkOnlineDerivedIsCancelled() {
    return this.isOnline() && !this.hasValidTrnId() && !this.get("trn_approved") && !$.trim(this.get('card_type'));
  }

});
