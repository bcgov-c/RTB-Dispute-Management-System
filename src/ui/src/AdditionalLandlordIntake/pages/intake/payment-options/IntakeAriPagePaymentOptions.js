import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import RadioView from '../../../../core/components/radio/Radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import template from './IntakeAriPagePaymentOptions_template.tpl';

const ARI_C_PAYMENT_HELP = `The filing fee for an application for additional rent increase is $300 plus $10 per unit subject to the rent increase to a maximum of $600.`;
const PFR_PAYMENT_HELP = `Your application must be accompanied by an application filing fee.`;

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const paymentsChannel = Radio.channel('payments');
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
      prev: '#p8-PaymentContainer button.step-previous',
      next: '#p8-PaymentContainer button.step-next'
    });
  },

  regions: {
    paymentMethod: '#p8-paymentMethod',
  },

  getCurrentStep() {
    return 10;
  },

  getRoutingFragment() {
    return `page/${this.getCurrentStep()}`;
  },

  getRoutingNextRoute() {
    return `page/${this.getCurrentStep()+1}`;
  },

  cleanupPageInProgress() {
    
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    applicationChannel.trigger('progress:step', this.getCurrentStep());
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

    return payment_methods;
  },

  createPageItems() {
    const dispute = disputeChannel.request('get'),
      disputeFee = paymentsChannel.request('get:fee:intake'),
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
      stepText: `How would you like to pay the <strong>$${disputeFee ? disputeFee.get('amount_due') : ''} filing fee</strong>?`,
      subView: new RadioView({ model: paymentMethodRadioModel }),
      helpName: 'Payment Information',
      helpHtml: dispute.isCreatedAriC() ? ARI_C_PAYMENT_HELP : PFR_PAYMENT_HELP,
      stepComplete: paymentMethodRadioModel.isValid()
    }));

    this.first_view_id = 'paymentMethod';
  },

  setupFlows() {
    const paymentMethodPageItem = this.getPageItem('paymentMethod');
    this.listenTo(paymentMethodPageItem, 'itemComplete', function() {
      if (!paymentMethodPageItem.stepComplete) {
        return;
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

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    const disputeFee = paymentsChannel.request('get:fee:intake');
    const activePayment = disputeFee ? disputeFee.getActivePayment() : null;
    const incompleteOnlinePayment = activePayment && activePayment.isOnline() && !activePayment.isApproved() ? activePayment : null;
    
    return {
      Formatter,
      incompleteOnlinePayment,
      isPaymentMethodUnselected: this.getPageItem('paymentMethod').getModel().getData() === null
    };
  },

  prevPage() {
    Backbone.history.navigate(this.getRoutingNextRoute(), { trigger: true });
  },

  getPageApiUpdates() {
    const dispute = disputeChannel.request('get'),
      status = dispute && dispute.getStatus(),
      updateDisputeStatusFn = (dispute_status)  => _.bind(dispute.saveStatus, dispute, {dispute_status}),
      createPaymentFn = (request_str, options) => _.bind(paymentsChannel.request, paymentsChannel, request_str, options),
      payment_method_value = this.getPageItem('paymentMethod').getModel().getData(),
      activePayment = paymentsChannel.request('get:payment:intake'),
      last_transaction_method = activePayment ? activePayment.get('transaction_method') : null,
      all_xhr = [],
      STATUS_PAYMENT_REQUIRED = configChannel.request('get', 'STATUS_PAYMENT_REQUIRED'),
      STATUS_OFFICE_PAYMENT_REQUIRED = configChannel.request('get', 'STATUS_OFFICE_PAYMENT_REQUIRED');
    
    if (payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_ONLINE')) {
      all_xhr.push(createPaymentFn('create:payment:online:intake'));

      if (status !== STATUS_PAYMENT_REQUIRED) {
        all_xhr.push( updateDisputeStatusFn(STATUS_PAYMENT_REQUIRED) );
      }
    } else if (payment_method_value !== last_transaction_method && payment_method_value === configChannel.request('get', 'PAYMENT_METHOD_OFFICE')) {
      all_xhr.push(createPaymentFn('create:payment:office:intake', { transaction_amount: paymentsChannel.request('get:fee:intake')?.get('amount_due') }));
      
      if (status !== STATUS_OFFICE_PAYMENT_REQUIRED) {
        all_xhr.push( updateDisputeStatusFn(STATUS_OFFICE_PAYMENT_REQUIRED) );
      }
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

    const onNextSuccessFn = () => Backbone.history.navigate(this.getRoutingNextRoute(), { trigger: true });
    const nextPageFn = () => {
      const all_xhr = this.getPageApiUpdates();
      loaderChannel.trigger('page:load');
      Promise.all(all_xhr.map(xhr => xhr())).then(() => {
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
          onNextSuccessFn();
        } else {
          alert("Error, payment wasn't able to be created.  Refresh and try again");
          return;
        }
      }, this.createPageApiErrorHandler(this));
    };

    if (this.isOnlineSelected()) paymentsChannel.request('show:online:instructions:modal', nextPageFn);
    else nextPageFn();
  }
});
