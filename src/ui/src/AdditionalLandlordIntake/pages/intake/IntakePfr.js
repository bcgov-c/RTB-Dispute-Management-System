import Backbone from 'backbone';
import Radio from 'backbone.radio';
import MenuCollection from '../../components/menu/Menu_collection';
import IntakePfrPageGeneral from './general-info/IntakePfrPageGeneral';
import IntakePageApplicants from './applicants/IntakePageApplicants';
import IntakeAriPageApplicantOptions from './applicant-options/IntakeAriPageApplicantOptions';
import IntakePfrPageRenovationUnits from './renovation/IntakePfrPageRenovationUnits';
import IntakePfrPageUnitTenants from './unit-tenants/IntakePfrPageUnitTenants';
import IntakePfrPageReview from './review/IntakePfrPageReview';
import IntakePfrPagePaymentOptions from './payment-options/IntakePfrPagePaymentOptions';
import IntakePfrPagePaymentReceipt from './payment-receipt/IntakePfrPagePaymentReceipt';
import IntakeBase from './IntakeBase';
import { pfrRoutes, PFR_PAYMENT_STEP_NUMBER, PFR_PAYMENT_RECEIPT_STEP_NUMBER } from '../../routers/intake_ari_router';


const paymentsChannel = Radio.channel('payments');

export default IntakeBase.extend({
  createDisputeMenu() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const hasCompletedPayment = !!(activePayment && activePayment.isApproved());

    this.menuCollection = new MenuCollection([
      { step: 1, text: 'General' },
      { step: 2, text: 'Applicants' },
      { step: 3, text: 'Applicant Options' },
      { step: 4, text: 'Renovation Units' },
      { step: 5, text: 'Unit Tenants' },
      { step: 6, text: 'Review and Submit' },
      { step: 7, text: 'Payment', unreachable: hasCompletedPayment },
      { step: 8, text: 'Payment Receipt', unreachable: hasCompletedPayment }
    ], {
      paymentStep: PFR_PAYMENT_STEP_NUMBER,
      paymentReceiptStep: PFR_PAYMENT_RECEIPT_STEP_NUMBER
    });
  },

  // Routing functions
  showIntakePfrGeneral() {
    this._showIntakeStep(IntakePfrPageGeneral, 1);
  },

  showIntakeAriApplicants() {
    this._showIntakeStep(IntakePageApplicants, 2);
  },

  showIntakeAriApplicantOptions() {
    this._showIntakeStep(IntakeAriPageApplicantOptions, 3);
  },

  showIntakePfrRenovationUnits() {
    this._showIntakeStep(IntakePfrPageRenovationUnits, 4);
  },

  showIntakePfrUnitTenants() {
    this._showIntakeStep(IntakePfrPageUnitTenants, 5);
  },
  
  showIntakePfrReview() {
    this._showIntakeStep(IntakePfrPageReview, 6);
  },

  showIntakePfrPayment() {
    this._showIntakeStep(IntakePfrPagePaymentOptions, 7);
  },

  showIntakePfrPaymentReceipt() {
    this._showIntakeStep(IntakePfrPagePaymentReceipt, 8);
  },

  routeToPaymentPage(routeOptions) {
    Backbone.history.navigate(pfrRoutes.payment_item, Object.assign({ replace: false, trigger: true }, routeOptions || {}));
  },

  routeToPaymentReceiptPage(routeOptions) {
    Backbone.history.navigate(pfrRoutes.payment_receipt_item, Object.assign({ replace: false, trigger: true }, routeOptions || {}));
  }
});
