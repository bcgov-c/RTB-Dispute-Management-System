import Backbone from 'backbone';
import Radio from 'backbone.radio';
import MenuCollection from '../../components/menu/Menu_collection';
import IntakeAriPageGeneral from './general-info/IntakeAriPageGeneral';
import IntakePageApplicants from './applicants/IntakeAriPageApplicants';
import IntakeAriPageApplicantOptions from './applicant-options/IntakeAriPageApplicantOptions';
import IntakeAriPageImprovementUnits from './units/IntakeAriPageImprovementUnits';
import IntakeAriPageInformation from './information/IntakeAriPageInformation';
import IntakeAriPageUnitCosts from './unit-costs/IntakeAriPageUnitCosts';
import IntakeAriPageRentIncrease from './rent-increase/IntakeAriPageRentIncrease';
import IntakeAriPageUnitTenants from './unit-tenants/IntakePageUnitTenantsBase';
import IntakeAriPageReview from './review/IntakeAriPageReview';
import IntakeAriPagePaymentOptions from './payment-options/IntakeAriPagePaymentOptions';
import IntakeAriPagePaymentReceipt from './payment-receipt/IntakeAriPagePaymentReceipt';
import IntakeBase from './IntakeBase';
import { ariRoutes, ARI_PAYMENT_STEP_NUMBER, ARI_PAYMENT_RECEIPT_STEP_NUMBER } from '../../routers/intake_ari_router';

const paymentsChannel = Radio.channel('payments');

export default IntakeBase.extend({
  createDisputeMenu() {
    const activePayment = paymentsChannel.request('get:payment:intake');
    const hasCompletedPayment = !!(activePayment && activePayment.isApproved());

    this.menuCollection = new MenuCollection([
      { step: 1, text: 'General' },
      { step: 2, text: 'Applicants' },
      { step: 3, text: 'Applicant Options' },
      { step: 4, text: 'Specified Units' },
      { step: 5, text: 'Capital Expenditures' },
      { step: 6, text: 'Associated Units' },
      { step: 7, text: 'Rent Increase Units' },
      { step: 8, text: 'Rent Increase Tenants' },
      { step: 9, text: 'Review and Submit' },
      { step: 10, text: 'Payment', unreachable: hasCompletedPayment },
      { step: 11, text: 'Submission Receipt', unreachable: hasCompletedPayment }
    ], {
      paymentStep: ARI_PAYMENT_STEP_NUMBER,
      paymentReceiptStep: ARI_PAYMENT_RECEIPT_STEP_NUMBER
    });
  },

  // Routing functions
  showIntakeAriGeneral() {
    this._showIntakeStep(IntakeAriPageGeneral, 1);
  },

  showIntakeAriApplicants() {
    this._showIntakeStep(IntakePageApplicants, 2);
  },

  showIntakeAriApplicantOptions() {
    this._showIntakeStep(IntakeAriPageApplicantOptions, 3);
  },

  showIntakeAriImprovmentUnits() {
    this._showIntakeStep(IntakeAriPageImprovementUnits, 4);
  },

  showIntakeAriInformation() {
    this._showIntakeStep(IntakeAriPageInformation, 5);
  },

  showIntakeAriUnitCosts() {
    this._showIntakeStep(IntakeAriPageUnitCosts, 6);
  },

  showIntakeAriRentIncrease() {
    this._showIntakeStep(IntakeAriPageRentIncrease, 7);
  },

  showIntakeAriUnitTenants() {
    this._showIntakeStep(IntakeAriPageUnitTenants, 8);
  },
  
  showIntakeAriReview() {
    this._showIntakeStep(IntakeAriPageReview, 9);
  },

  showIntakeAriPayment() {
    this._showIntakeStep(IntakeAriPagePaymentOptions, 10);
  },

  showIntakeAriPaymentReceipt() {
    this._showIntakeStep(IntakeAriPagePaymentReceipt, 11);
  },

  routeToPaymentPage(routeOptions) {
    Backbone.history.navigate(ariRoutes.payment_item, Object.assign({ replace: false, trigger: true }, routeOptions || {}));
  },

  routeToPaymentReceiptPage(routeOptions) {
    Backbone.history.navigate(ariRoutes.payment_receipt_item, Object.assign({ replace: false, trigger: true }, routeOptions || {}));
  }
});
