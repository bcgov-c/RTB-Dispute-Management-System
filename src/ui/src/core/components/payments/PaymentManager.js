/**
 * @fileoverview - Manager that handles all forms of payments and payment configs
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import DisputeFeeCollection from './DisputeFee_collection';
import DisputeFeeModel from './DisputeFee_model';

const api_payments_load_name = 'disputefees';
const api_payment_bambora_check_name = 'checkbamboratransactions';

const EXTERNAL_REVIEW_PAYMENT_RECOVERY_HTML = `<p>Payment has already been made for this application for review considerations. Press continue to start your review request.</p>`;
const EXTERNAL_PAYMENT_RECOVERY_HTML = `<p>Payment has already been made for this application. Press continue to view your payment receipt. If the payment date is not correct, please contact the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a> to correct the payment date.</p>`;
const ADMIN_PAYMENT_RECOVERY_HTML = `<p>An application payment has been triggered by the DMS payment recovery check. A payment receipt will be sent to the payor if their email address is recorded in the system.</p>
<p>The payment date on the transaction will be set to today by this process. This may not be the actual date of the payment.  To find out the actual payment date you must contact the <a class="static-external-link" href="javascript:;" url="https://rtbsupport.cayzu.com/Tickets/Create">Help Desk</a> to look up the payment date in the external systems. The intake payment date on the Dispute View must also be manually corrected to the actual payment date as part of this process.</p>`;
const INTAKE_PAYMENT_INSTRUCTIONS_HTML = `<p>If you return to this site and do not see your payment receipt for this application, please logout and login again and click "Complete Payment" in your file list or contact the Residential Tenancy Branch.</p>`;
const DA_PAYMENT_INSTRUCTIONS_HTML = `<p>If you return to this site and do not see your payment receipt for this application, please logout and login again and select to make a payment in your list of options or contact the Residential Tenancy Branch.</p>`;

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const participantsChannel = Radio.channel('participants');

const PaymentManager = Marionette.Object.extend({
  channelName: 'payments',

  radioRequests: {
    'create:fee:intake': 'createIntakeFee',

    'create:payment:online:intake': 'createOnlinePaymentTransaction',
    'create:payment:office:intake': 'createOfficePaymentTransaction',
    'create:payment:feeWaiver:intake': 'createFeeWaiverPaymentTransaction',

    'get:fees': 'getAllDisputeFees',
    'get:fee:intake': 'getIntakeFee',
    'get:payment:evidence:config': 'getPaymentCategoryConfig',
    'get:payment:intake': 'getIntakeActivePayment',
    'get:payment:intake:by:id': 'getIntakePaymentByTransactionId',

    'check:transaction': 'checkPaymentTransactionPromise',
    'show:checktrans:modal': 'showCheckTransactionModal',
    'show:online:instructions:modal': 'showOnlinePaymentInstructionsModal',

    'get:lico': 'getLicoAmount',

    load: 'loadAllPayments',
    'load:promise': 'loadAllPaymentsPromise',
    'load:with:checks': 'loadAllPaymentsWithTransactionChecks',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',

    'add:fee': 'addFeeToList',

    // Sets the transaction site source for the current session.  Should be used with PaymentTransactions
    'set:transaction:site:source': 'setTransactionSiteSource',
    'get:transaction:site:source': 'getTransactionSiteSource',

    clear: 'clearPaymentData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  /**
   * Saves current dispute payment data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this PaymentManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached payment data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.disputeFees = cache_data.disputeFees;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      disputeFees: this.disputeFees
    };
  },

  initialize() {
    this.cached_data = {};
    this.disputeFees = new DisputeFeeCollection();
  },

  /**
   * Clears the current payments in memory.
   * Does not flush any cached data.
   */
  clearPaymentData() {
    this.disputeFees = new DisputeFeeCollection();
  },

  loadAllPaymentsPromise(dispute_guid) {
    const dfd = $.Deferred();

    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for loading all payment info tasks`);
      return dfd.reject().promise();
    }

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_payments_load_name}/${dispute_guid}`
    }).done(response => {
      dfd.resolve(new DisputeFeeCollection(response));
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadAllPayments(dispute_guid) {
    const dfd = $.Deferred();
    
    this.loadAllPaymentsPromise(dispute_guid).done(disputeFees => {
      this.disputeFees = disputeFees;
      dfd.resolve(this.disputeFees);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  // Get all payments and then validate each active transaction
  loadAllPaymentsWithTransactionChecks(dispute_guid) {
    const dfd = $.Deferred();
    
    this.loadAllPayments(dispute_guid).done(disputeFees => {
      const intakeFee = disputeFees.getIntakeFee();
      const isIntakeFeeUnpaid = intakeFee && intakeFee.isActive() && !intakeFee.isPaid();

      Promise.all(disputeFees.map(fee => {
        const latestPayment = fee.getActivePayment();
        return latestPayment && latestPayment.isOnline() && latestPayment.isPending() ?
          latestPayment.updateTransactionAfterBeanstream({ no_cancel: true }) :
          true;
      })).then(() => {
        this.loadAllPayments(dispute_guid).then(response => {
          const resolveFn = () => dfd.resolve(response);

          // If the intake fee went from unpaid to paid, then check and update the dispute
          const intakeFeeAfterUpdate = this.getIntakeFee();
          const activePayment = intakeFeeAfterUpdate && intakeFeeAfterUpdate.getActivePayment();
          const dispute = disputeChannel.request('get');
          if (isIntakeFeeUnpaid && intakeFeeAfterUpdate && intakeFeeAfterUpdate.isPaid()) {
              $.whenAll(
                dispute.checkAndUpdateInitialPayment(activePayment ? {
                  initial_payment_method: activePayment.get('transaction_method'),
                  initial_payment_by: activePayment.get('transaction_by')
                } : {}),
                dispute.checkStageStatus(0, [2, 3, 4]) ? 
                    dispute.saveStatus({ dispute_stage: 2, dispute_status: 20 }) : $.Deferred().resolve().promise()
              ).always(resolveFn);
          } else {
            resolveFn();
          }
        }, dfd.reject);
      }, dfd.reject);

    }).fail(dfd.reject);

    return dfd.promise();
  },

  

  loadFromDisputeAccessResponse(responseDataDisputeFees) {
    responseDataDisputeFees = responseDataDisputeFees || [];
    this.disputeFees = new DisputeFeeCollection(responseDataDisputeFees);
  },

  addFeeToList(fee) {
    this.disputeFees.add(fee);
  },

  getAllDisputeFees() {
    return this.disputeFees;
  },

  setTransactionSiteSource(transactionSiteSource) {
    this.transactionSiteSource = transactionSiteSource;
  },

  getTransactionSiteSource() {
    return this.transactionSiteSource;
  },

  createIntakeFee(feeData=null) {
    feeData = feeData || {};
    
    const existing_intake_fee = this.getIntakeFee();
    const payor_id = participantsChannel.request('get:primaryApplicant:id');
    const is_active = true;

    if (existing_intake_fee) {
      // An intake fee already exists - make sure it is active and use it
      // Apply any override attr save values
      existing_intake_fee.set({ is_active, payor_id });
      return existing_intake_fee.save({ attrs: _.extend(existing_intake_fee.getApiChangesOnly(), feeData) });
    }

    const dispute = disputeChannel.request('get');
    const createIntakeFeeFn = () => {
      const intake_fee_data = _.extend({
        fee_type: configChannel.request('get', dispute.isUnitType() ? 'PAYMENT_FEE_TYPE_INTAKE_UNIT_BASED' : 'PAYMENT_FEE_TYPE_INTAKE'),
        amount_due: configChannel.request('get', 'PAYMENT_FEE_AMOUNT_INTAKE'),
        fee_description: configChannel.request('get', 'PAYMENT_FEE_DESCRIPTION_INTAKE'),
        is_active,
        due_date: Moment().add(configChannel.request('get', 'PAYMENT_FEE_DUE_DATE_DAY_OFFSET_INTAKE'), 'days'),
        payor_id
      }, feeData);
      
      return new DisputeFeeModel(intake_fee_data);
    };

    const disputeFees = this.getAllDisputeFees();
    const disputeFee = createIntakeFeeFn();
    disputeFees.add(disputeFee);
    return disputeFee.save();
  },

  getIntakeFee() {
    // Only one intake fee should be allowed per dispute, so get it here
    return this.getAllDisputeFees().find(function(fee) { 
      return fee.isIntakeFee();
    });
  },

  _createIntakePaymentTransaction(payment_data) {
    const intake_fee = this.getIntakeFee();
    const transaction_by = participantsChannel.request('get:primaryApplicant:id');
    const payment_transaction_data = _.extend({
      payment_status: configChannel.request('get', 'PAYMENT_STATUS_PENDING'),
      transaction_by
    }, payment_data);
    const activePayment = intake_fee.getActivePayment();
    const dfd = $.Deferred();

    // If there's an existing pending payment, make sure to always cancel it once the new one is created
    intake_fee.createPayment(payment_transaction_data)
      .done(function() {
        if (!activePayment || !activePayment.isPending()) {
          dfd.resolve();
          return;
        }
        activePayment.save({ payment_status: configChannel.request('get', 'PAYMENT_STATUS_CANCELLED') })
          .done(function() {
            dfd.resolve();
          }).fail(function() {
            console.log("[Error] Failed to PATCH previous tranasction to cancelled");
            dfd.resolve();
          })
      })
      .fail(dfd.reject);

    return dfd.promise();
  },

  createOfficePaymentTransaction(paymentData={}) {
    return this._createIntakePaymentTransaction(Object.assign({}, paymentData, { transaction_method: configChannel.request('get', 'PAYMENT_METHOD_OFFICE') }));
  },

  createFeeWaiverPaymentTransaction() {
    return this._createIntakePaymentTransaction({ transaction_method: configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER') });
  },

  createOnlinePaymentTransaction() {
    return this._createIntakePaymentTransaction({
      transaction_method: configChannel.request('get', 'PAYMENT_METHOD_ONLINE'),
      payment_provider: configChannel.request('get', 'PAYMENT_PROVIDER_BEANSTREAM')
    });
  },

  getIntakeActivePayment() {
    const intake_fee = this.getIntakeFee();
    return intake_fee ? intake_fee.getActivePayment() : null;
  },

  getIntakePaymentByTransactionId(payment_transaction_id) {
    let intakeFee;
    if (!payment_transaction_id || !(payment_transaction_id = parseInt(payment_transaction_id)) || !(intakeFee = this.getIntakeFee())) {
      return null;
    }
    return intakeFee.getPayments().findWhere({ payment_transaction_id });
  },

  checkPaymentTransactionPromise(paymentTransactionModel) {
    const dfd = $.Deferred();
    const paymentTransactionId = paymentTransactionModel && paymentTransactionModel.id;

    if (!paymentTransactionId || !paymentTransactionModel.isOnline()) {
      console.log(`[Warning] Check bambora payment requires saved online payment transaction`, paymentTransactionModel);
      return dfd.resolve().promise();
    }

    apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_payment_bambora_check_name}/${paymentTransactionId}`
    })
    .done(dfd.resolve)
    .fail(err => {
      if (err && (
        (err.status === 400 && String(err.status).indexOf('is not an online payment')) ||
        err.status === 404
      )) {
        dfd.resolve();
      } else {
        dfd.reject(err);
      }
    });

    return dfd.promise();
  },

  _showModalWithOnCloseFunction(onCloseFn, title, bodyHtml) {
    onCloseFn = _.isFunction(onCloseFn) ? onCloseFn : () => {};

    const modalView = modalChannel.request('show:standard', {
      title,
      bodyHtml,
      hideCancelButton: true,
      primaryButtonText: 'Continue',
      onContinueFn(modalView) { modalView.close(); }
    });
    this.listenToOnce(modalView, 'removed:modal', () => onCloseFn());
  },

  showCheckTransactionModal(paymentTransactionModel) {
    const matchingDisputeFee = paymentTransactionModel && this.getAllDisputeFees().findWhere({ dispute_fee_id: paymentTransactionModel.get('dispute_fee_id') });
    const paymentRecoveryHtml = (window || global)._DMS_SITE_NAME === 'Admin' ? ADMIN_PAYMENT_RECOVERY_HTML : (
      matchingDisputeFee && matchingDisputeFee.isReviewFee() ? EXTERNAL_REVIEW_PAYMENT_RECOVERY_HTML : EXTERNAL_PAYMENT_RECOVERY_HTML);
    this._showModalWithOnCloseFunction(()=>{}, 'Payment Recovery', paymentRecoveryHtml);
  },

  showOnlinePaymentInstructionsModal(onCloseFn) {
    const siteName = (window || global)._DMS_SITE_NAME;
    const instructionsHtml = siteName === 'Intake' ? INTAKE_PAYMENT_INSTRUCTIONS_HTML :
      siteName === 'DisputeAccess' ? DA_PAYMENT_INSTRUCTIONS_HTML : '';
    this._showModalWithOnCloseFunction(onCloseFn, 'Your Application Payment',
      `<p>You will be taken to an external site to complete your application payment.  <b>You must return to this site to ensure your payment is complete. If payment is not complete, your application could be abandoned.</b></p>
      ${instructionsHtml}`
    );
  },

  getLicoAmount(familyMemberCount, citySizeId) {
    const LICO_TABLE = configChannel.request('get', 'LICO_TABLE');

    // The LICO table only supports so many rows to look up, define the limit of the LICO table as max family members
    const FEE_WAIVER_MAX_FAMILY_MEMBERS = configChannel.request('get', 'FEE_WAIVER_MAX_FAMILY_MEMBERS');

    citySizeId = Number(citySizeId);
    familyMemberCount = Number(familyMemberCount);
    familyMemberCount = (familyMemberCount > FEE_WAIVER_MAX_FAMILY_MEMBERS) ? FEE_WAIVER_MAX_FAMILY_MEMBERS : familyMemberCount;

    let lico_income = null;
    if (_.has(LICO_TABLE, citySizeId)) {
      if (_.has(LICO_TABLE[citySizeId], familyMemberCount)) {
        lico_income = LICO_TABLE[citySizeId][familyMemberCount];
      }
    }

    if (lico_income === null) {
      console.log(`[Error] Couldn't find a lookup in the LICO table for familySize=${familyMemberCount}, citySizeId=${citySizeId}`);
      return;
    }
    return lico_income;
  },

  getPaymentCategoryConfig() {
    return configChannel.request('get:evidence:category', configChannel.request('get', 'EVIDENCE_CATEGORY_PAYMENT'));
  },

});

_.extend(PaymentManager.prototype, UtilityMixin);

const paymentManagerInstance = new PaymentManager();

export default paymentManagerInstance;
