import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import RadioView from '../../../../core/components/radio/Radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import QuestionModel from '../../../../core/components/question/Question_model';
import QuestionView from '../../../../core/components/question/Question';
import IntakePageFeeWaiver from './IntakePageFeeWaiver';
import template from './IntakePagePaymentOptions_template.tpl';

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const paymentsChannel = Radio.channel('payments');
const claimsChannel = Radio.channel('claims');
const loaderChannel = Radio.channel('loader');

const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,

  // Don't use the 'ui' hash for this because we have to search it dynamically
  RADIO_SEPARATOR_SELECTOR: '.intake-radio-separator',
 
  ui() {
    return _.extend({}, PageView.prototype.ui, {
      paymentContainer: '#p8-PaymentContainer',
      onlineWarning: '#p8-onlinePaymentWarning',
      feeWaiverDeclinedWarning: '#p8-feeWaiverDeclined',
      prev: '#p8-PaymentContainer button.step-previous',
      next: '#p8-PaymentContainer button.step-next'
    });
  },

  regions: {
    feeWaiverContainer: '#p8-FeeWaiverContainer',
    paymentMethod: '#p8-paymentMethod',
    paymentReimburse: '#p8-paymentReimburse'
  },

  getRoutingFragment() {
    return 'page/8';
  },

  cleanupPageInProgress() {
    
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.blockFeeWaiverRender = false;
    applicationChannel.trigger('progress:step', 8);
  },


  hasDeclinedFeeWaiver() {
    const disputeFee = paymentsChannel.request('get:fee:intake');
    return (disputeFee && disputeFee.hasDeclinedFeeWaiver());
  },

  canTryFeeWaiver() {
    // An applicant can only try fee waiver if they are a tenant and if they don't have a rejected fee waiver
    const dispute = disputeChannel.request('get');
    return dispute.isTenant() && !this.hasDeclinedFeeWaiver();
  },

  paymentMethodOptions() {
    const createPaymentMethodFn = function(method_options) {
        method_options = method_options || {};
        return _.extend({ name: 'payment-method-type' },
          method_options,
          method_options.configValue ?  { value: configChannel.request('get', method_options.configValue) } : {});
      },
      payment_methods = [
        createPaymentMethodFn({
          configValue: 'PAYMENT_METHOD_ONLINE',
          text: '<b>Pay Online</b> (recommended) by Visa, MasterCard, Visa Debit, MasterCard Debit, or American Express',
          separatorHtml: '<div class="intake-radio-separator">Other payment options</div>'
        }),
        createPaymentMethodFn({
          configValue: 'PAYMENT_METHOD_OFFICE',
          text: 'Make your payment at our <a class="static-external-link" href="javascript:;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Burnaby Office</a> or a <a class="static-external-link" href="javascript:;" url="http://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/technology-innovation-and-citizens-services/servicebc">Service BC office</a><br/><p class="intake-radio-subtext">Important! Payment must be made within 3 days or this application will be set to abandoned and you will need to file a new application.</p>'
        })
      ];

    if (this.canTryFeeWaiver()) {
      payment_methods.push(createPaymentMethodFn({
        configValue: 'PAYMENT_METHOD_FEE_WAIVER',
        text: 'I am unable to pay this fee due to low income and want to provide my financial and income information with a request to have this fee waived (<a class="static-external-link" href="javascript:;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/fees-and-fee-waivers#Waiver">learn more about fee waivers</a>)'
      }));
    }

    return payment_methods;
  },

  createPageItems() {
    const disputeFee = paymentsChannel.request('get:fee:intake'),
      activePayment = disputeFee ? disputeFee.getActivePayment() : null,
      onlinePayment = activePayment && activePayment.isOnline() ? activePayment : null,
      activePendingPayment = activePayment && activePayment.isPending() ? activePayment : null;

    const paymentMethodRadioModel = new RadioModel({
      optionData: this.paymentMethodOptions(),
      required: true,
      cssClass: 'payment-options',
      // If it was online payment but cancelled, select it still
      value: onlinePayment ? onlinePayment.get('transaction_method') :
          (activePendingPayment ? activePendingPayment.get('transaction_method') : null)
    });

    this.addPageItem('paymentMethod', new PageItemView({
      stepText: `How would you like to pay the <strong>$${disputeFee ? disputeFee.get('amount_due') : 100} filing fee</strong>?`,
      subView: new RadioView({ model: paymentMethodRadioModel }),
      helpName: 'Payment Information',
      helpHtml: 'Your Application for Dispute Resolution must be accompanied by an application filing fee or an Application to Waive Filing Fee.<br/>Applicants may request that the respondent be ordered to reimburse them for the application filing fee.<br/>Low income tenants may apply to the Residential Tenancy Branch to have the application filing fee waived.',
      stepComplete: paymentMethodRadioModel.isValid()
    }));

    const paymentReimburseQuestionModel = new QuestionModel({
      optionData: [{ name: 'payment-reimburse-no', value: 0, cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'payment-reimburse-yes', value: 1, cssClass: 'option-button yes-no', text: 'YES'}],
      required: true,
      // If any non-fee waiver payment already exists but no FF, then we know we have moved forward with no FF
      question_answer: this.hasFF() ? 1 : (disputeFee && disputeFee.getPayments().find(function(p) { return !p.isFeeWaiver(); }) ? 0 : null)
    });

    this.addPageItem('paymentReimburse', new PageItemView({
      stepText: 'Do you want to include a request for the respondent to pay you back for the cost of the filing fee?',
      subView: new QuestionView({ model: paymentReimburseQuestionModel }),
      helpName: 'Payment reimbursement?',
      helpHtml: 'An arbitrator will determine who should be responsible for the cost of the application at the hearing.',
      stepComplete: paymentReimburseQuestionModel.isValid()
    }));

    this.first_view_id = 'paymentMethod';
  },

  setupFlows() {
    const paymentMethodPageItem = this.getPageItem('paymentMethod');
    this.listenTo(paymentMethodPageItem, 'itemComplete', function(options) {
      if (!paymentMethodPageItem.stepComplete) {
        return;
      }

      const activePayment = paymentsChannel.request('get:payment:intake');
      if (activePayment && activePayment.isFeeWaiver() && activePayment.isDeclined() &&
          paymentMethodPageItem.getModel().getData() === null) {
        this.getUI('feeWaiverDeclinedWarning').fadeIn();
      } else {
        this.getUI('feeWaiverDeclinedWarning').fadeOut();
      }

      if (this.isFeeWaiverSelected()) {
        this.hidePageItem('paymentReimburse', options);
      } else {
        this.showPageItem('paymentReimburse', options);
      }

      if (this.isOnlineSelected()) {
        this.getUI('onlineWarning').fadeIn();
      } else {
        this.getUI('onlineWarning').fadeOut();
      }
    }, this);
  },

  isOnlineSelected() {
    return this.getPageItem('paymentMethod').getModel().getData() === configChannel.request('get', 'PAYMENT_METHOD_ONLINE');
  },

  isFeeWaiverSelected() {
    return this.getPageItem('paymentMethod').getModel().getData() === configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER');
  },

  onBeforeRender() {
    // Refresh the page items each load
    this.createPageItems();
    this.setupFlows();
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});

    const activePayment = paymentsChannel.request('get:payment:intake');
    if (!this.blockFeeWaiverRender && activePayment && activePayment.isPending() && activePayment.isFeeWaiverStep1Complete()) {
      this.transitionToFeeWaiverPage(activePayment);
    } else {
      loaderChannel.trigger('page:load:complete');
    }
  },

  templateContext() {
    const disputeFee = paymentsChannel.request('get:fee:intake');
    const activePayment = disputeFee ? disputeFee.getActivePayment() : null;
    const incompleteOnlinePayment = activePayment && activePayment.isOnline() && !activePayment.isApproved() ? activePayment : null;
    
    return {
      Formatter,
      incompleteOnlinePayment,
      isPaymentMethodUnselected: this.getPageItem('paymentMethod').getModel().getData() === null,
      hasDeclinedFeeWaiver: this.hasDeclinedFeeWaiver()
    };
  },

  hasFF() {
    return claimsChannel.request('get:by:code', configChannel.request('get', 'landlord_fee_recovery')) || 
      claimsChannel.request('get:by:code', configChannel.request('get', 'tenant_fee_recovery'));
  },

  createFeeRecoveryPromise() {
    const dispute = disputeChannel.request('get'),
      issue_config_key = dispute.isLandlord() ? 'landlord_fee_recovery' : 'tenant_fee_recovery',
      issue_config = configChannel.request('get:issue', configChannel.request('get', issue_config_key)),
      claim_data = _.extend({
        claim_title: issue_config.issueTitle,
        claim_code: issue_config.id,
      }),
      remedy_detail_data = _.extend({
        amount: issue_config.useAmount ? configChannel.request('get', 'PAYMENT_FEE_AMOUNT_INTAKE') : null
      }),
      claims = claimsChannel.request('get'),
      claimModel = claims.createClaimWithRemedy(claim_data);

    claimModel.updateApplicantRemedyDetail(remedy_detail_data);  
    claims.add(claimModel, {silent: true});
    return _.bind(claimModel.save, claimModel);
  },

  deleteFeeRecoveryPromise() {
    const landlord_recovery_model = claimsChannel.request('get:by:code', configChannel.request('get', 'landlord_fee_recovery')),
      tenant_recovery_model = claimsChannel.request('get:by:code', configChannel.request('get', 'tenant_fee_recovery')),
      _all_xhr = [];
    
    if (landlord_recovery_model) {
      _all_xhr.push( _.bind(claimsChannel.request, claimsChannel, 'delete:full', landlord_recovery_model) );
    }

    if (tenant_recovery_model) {
      _all_xhr.push( _.bind(claimsChannel.request, claimsChannel, 'delete:full', tenant_recovery_model) );
    }

    return () => {
      const dfd = $.Deferred();
      Promise.all(_.map(_all_xhr, function(_xhr) { return _xhr(); }))
        .then(dfd.resolve, dfd.reject);
      return dfd.promise();
    };
  },

  
  transitionToFeeWaiverPage() {
    loaderChannel.trigger('page:load:complete');
    const IntakePageFeeWaiverView = new IntakePageFeeWaiver();
    this.listenToOnce(IntakePageFeeWaiverView, 'return', function() {
      this.blockFeeWaiverRender = true;
      this.render();
      animationChannel.request('queue', IntakePageFeeWaiverView.$el, 'slideUp');
      animationChannel.request('queue', this.getUI('paymentContainer'), 'slideDown');
      animationChannel.request('queueEvent', _.bind(function() { this.blockFeeWaiverRender = true; }, this));
      animationChannel.request('queueEvent', _.bind(IntakePageFeeWaiverView.destroy, IntakePageFeeWaiverView));
    }, this);

    animationChannel.request('queue', this.getUI('paymentContainer'), 'slideUp');
    this.showChildView('feeWaiverContainer', IntakePageFeeWaiverView);
  },

  getPageApiUpdates() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const feeWaiverView = this.getChildView('feeWaiverContainer');
    // If we are checking for unsaved changes on fee waiver post-save, skip the unsaved changes check
    if (!this.blockFeeWaiverRender && activePayment && activePayment.isFeeWaiver() &&
      feeWaiverView && feeWaiverView.isRendered()) {
        return [];
    }
    return [...this.getPageApiUpdatesNoStatus(), ...this.getPageApiUpdatesStatusOnly()];
  },

  getPageApiUpdatesNoStatus() {
    const createPaymentFn = (request_str, options) => _.bind(paymentsChannel.request, paymentsChannel, request_str, options),
      payment_method_value = this.getPageItem('paymentMethod').getModel().getData(),
      activePayment = paymentsChannel.request('get:payment:intake'),
      last_transaction_method = activePayment ? activePayment.get('transaction_method') : null,
      all_xhr = [];
    
    if (payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_ONLINE')) {
      all_xhr.push(createPaymentFn('create:payment:online:intake'));
    } else if (payment_method_value !== last_transaction_method && payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_OFFICE')) {
      all_xhr.push(createPaymentFn('create:payment:office:intake', { transaction_amount: paymentsChannel.request('get:fee:intake')?.get('amount_due') }));
    } else if (payment_method_value !== last_transaction_method && payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER')) {
      all_xhr.push(createPaymentFn('create:payment:feeWaiver:intake'));
    }

    const paymentReimburse = this.getPageItem('paymentReimburse'),
      payment_reimburse_value = paymentReimburse.getModel().getData();

    // FF issues
    if (this.hasFF()) {
      if (!paymentReimburse.isActive() || payment_reimburse_value === 0) {
        all_xhr.push(this.deleteFeeRecoveryPromise());
      }
    } else if (paymentReimburse.isActive() && payment_reimburse_value === 1) {
      all_xhr.push(this.createFeeRecoveryPromise());
    }

    return all_xhr;
  },

  getPageApiUpdatesStatusOnly() {
    const dispute = disputeChannel.request('get'),
      status = dispute && dispute.getStatus(),
      updateDisputeStatusFn = (dispute_status)  => _.bind(dispute.saveStatus, dispute, {dispute_status}),
      payment_method_value = this.getPageItem('paymentMethod').getModel().getData(),
      all_xhr = [],
      STATUS_PAYMENT_REQUIRED = configChannel.request('get', 'STATUS_PAYMENT_REQUIRED'),
      STATUS_OFFICE_PAYMENT_REQUIRED = configChannel.request('get', 'STATUS_OFFICE_PAYMENT_REQUIRED');
  
    if (payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_ONLINE') && status !== STATUS_PAYMENT_REQUIRED) {
      all_xhr.push( updateDisputeStatusFn(STATUS_PAYMENT_REQUIRED) );
    } else if (payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_OFFICE') && status !== STATUS_OFFICE_PAYMENT_REQUIRED) {
      all_xhr.push( updateDisputeStatusFn(STATUS_OFFICE_PAYMENT_REQUIRED) );
    } else if (payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_FEE_WAIVER') && status !== STATUS_PAYMENT_REQUIRED) {
      all_xhr.push( updateDisputeStatusFn(STATUS_PAYMENT_REQUIRED) );
    }
    return all_xhr;
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const nextPageFn = () => {
      loaderChannel.trigger('page:load');
      Promise.all((this.getPageApiUpdatesNoStatus()||[]).map(xhr => xhr()))
        .then(() => Promise.all((this.getPageApiUpdatesStatusOnly()||[]).map(xhr => xhr())))
        .then(() => {
          // Loads complete, reset page data
          // All APIs complete, now check if online and go to beanstream
          const activePayment = paymentsChannel.request('get:payment:intake');
          if (!activePayment) {
            alert("Error, payment wasn't able to be created.  Refresh and try again");
            return;
          }
    
          if (activePayment.isOnline()) {
            console.log("Routing to ", activePayment.get('payment_url'));
            if (!sessionChannel.request('is:login:siteminder')) {
              sessionStorage.setItem('_dmsPaymentToken', sessionChannel.request('token'));
            }
            window.location = activePayment.get('payment_url');
          } else if (activePayment.isOffice()) {
            Backbone.history.navigate('#page/9', {trigger: true});
          } else if (activePayment.isFeeWaiver()) {
            this.transitionToFeeWaiverPage(activePayment);
          } else {
            alert("Error, payment wasn't able to be created.  Refresh and try again");
            return;
          }
        })
        .catch(this.createPageApiErrorHandler(this));
    };

    if (this.isOnlineSelected()) paymentsChannel.request('show:online:instructions:modal', nextPageFn);
    else nextPageFn();
    
  }
});
