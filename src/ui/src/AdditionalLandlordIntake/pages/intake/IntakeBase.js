import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import MenuView from '../../components/menu/Menu';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import template from './Intake_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  id: "intake-content-container",

  regions: {
    menuRegion: {
      el: '#menu-region',
      replaceElement: true
    },
    intakeRegion: '#intake-content'
  },

  initialize(options) {
    if (!options || !options.parent) {
      console.debug('[Warning] IntakeView needs parent reference');
    }
    this.parent = options.parent;
    
    this.createDisputeMenu();
  },

  onRender() {
    menuChannel.trigger('enable:mobile');

    const menuView = new MenuView({ collection: this.menuCollection });
    this.showChildView('menuRegion', menuView);
    this.dispute = disputeChannel.request('get');

    // Initiailze headers for all future pages, once we have the intake-content loaded
    this.$el.initializeFloatingHeaders();
  },


  _showIntakeStep(intakeStepViewClass, step_number) {
    // Clear any running animations on the page, as we are switching
    animationChannel.request('clear');

    // Clear any loaders
    loaderChannel.trigger('page:load:complete');

    this.parent.showIntakeView();

    // Refresh the menu
    this.menuCollection.setActiveStep(step_number);

    this.getChildView('menuRegion').render();
    const newView = new intakeStepViewClass({
      dispute: this.dispute
    });
    this.showChildView('intakeRegion', newView);
  },

  loadIntakeAriPaymentReturnAndShowView() {
    // 1. Load dispute and payments
    // 2. Get updated payment from server and update the payment_status based on returned transaction fields
    // 3a) If approved or office payment, go to receipt
    // 3b) If not approved, go to payment page

    loaderChannel.trigger('page:load');

    const dispute_guid = UtilityMixin.util_getParameterByName('Dispute');
    const transaction_id = UtilityMixin.util_getParameterByName('TransactionId');

    if (!dispute_guid || !transaction_id) {
      this._paymentReturnError();
      return;
    }

    applicationChannel.request('load:dispute:full:promise',  dispute_guid)
      .done(disputeModel => {
        console.log(disputeModel);
        if (!disputeModel.isPaymentState()) {
          // Can't load into a dispute from a payment response when the dispute isn't finished
          console.log(`[Warning] Dispute is not in a waiting payment state.  Can't load into it from payment return`);
          this._paymentReturnError();
          return;
        }

        const activePayment = paymentsChannel.request('get:payment:intake');
        const paymentModel = paymentsChannel.request('get:payment:intake:by:id', transaction_id);
          
        if (!paymentModel) {
          this._paymentReturnError();
          return;
        }

        // The transaction passed back must be the latest transaction for the dispute fee. Otherwise, can't update it.
        if (activePayment && activePayment.id && paymentModel.id !== activePayment.id) {
          console.log(`[Warning] Payment return is for non-active payment`);
          this._paymentReturnError();
          return;
        }

        paymentModel.updateTransactionAfterBeanstream({ no_modal: true })
          .done(() => {
            if (paymentModel.isApproved() || paymentModel.isOffice()) {
              const dispute_changes = _.extend(
                {
                  initial_payment_date: Moment().toISOString(),
                  initial_payment_by: participantsChannel.request('get:primaryApplicant:id')  
                },
                paymentModel ? { initial_payment_method: paymentModel.get('transaction_method') } : null,
              );
              const dispute_status_changes = {
                dispute_stage: configChannel.request('get', 'STAGE_APPLICATION_SCREENING'),
                dispute_status: configChannel.request('get', 'STATUS_APPLICATION_RECEIVED')
              };

              $.whenAll(disputeModel.saveStatus(dispute_status_changes), disputeModel.save(dispute_changes))
                .done(() => {
                  this.routeToPaymentReceiptPage({ replace: true });
                }).fail(this._paymentReturnError);
            } else {
              this.routeToPaymentPage({ replace: true });
            }
          }).fail(this._paymentReturnError);
      }).fail(this._paymentReturnError);
  },

  _paymentReturnError(errorResponse) {
    if (!errorResponse) {
      alert('There was an unexpected error updating payment info.  You will be redirected to your list of disputes.');
      Backbone.history.navigate('#list', { replace: true, trigger: true });
      return;
    } else {
      const errorHandlerFn = generalErrorFactory.createHandler('INTAKE.PAYMENT.RETURN', () => {
        Backbone.history.navigate('#list', { replace: true, trigger: true });
      }, 'You will be redirected to your list of disputes.');
      errorHandlerFn(errorResponse);
    }
  },


  /* Intake router uses these functions to check page in progress */
  getPageApiUpdates() {
    const intakeView = this.getChildView('intakeRegion');

    if (!intakeView || !intakeView.$el.is(':visible')) {
      return [];
    } else {
      return intakeView.getPageApiUpdates();
    }
  },

  getCurrentViewRoutingFragment() {
    const intakeView = this.getChildView('intakeRegion');
    return intakeView && typeof intakeView.getRoutingFragment === 'function' ? intakeView.getRoutingFragment() : null;
  },

  cleanupPageInProgress() {
    const intakeView = this.getChildView('intakeRegion');
    return intakeView && typeof intakeView.cleanupPageInProgress === 'function' ? intakeView.cleanupPageInProgress() : null;
  },


  createDisputeMenu() {
    // Should be overriden by subclasses
  },

  routeToPaymentPage() {
    // To be overriden by subclasses
    //Backbone.history.navigate('#page/8', { replace: true, trigger: true });
  },

  routeToPaymentReceiptPage() {
    // To be overriden by subclasse
    //Backbone.history.navigate('#page/9', { replace: true, trigger: true });
  }
});
