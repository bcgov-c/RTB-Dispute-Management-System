import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './OfficeDisputeOverview_template.tpl';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const paymentsChannel = Radio.channel('payments');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'hidden-print',

  ui: {
    logoutLink: '.da-access-logout'
  },

  events: {
    'click @ui.logoutLink': 'clickLogoutLink'
  },

  clickLogoutLink() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  _getPaymentDisplay(fee) {
    if (!fee) {
      return;
    }
    const amountDue = fee.get('amount_due');
    const feeTypeDisplay = Formatter.toFeeTypeDisplay(fee.get('fee_type'));
    return `${feeTypeDisplay}, ${amountDue ? Formatter.toAmountDisplay(amountDue, true) : '-'}`;
  },

  templateContext() {
    const PAYMENT_METHOD_DISPLAY = configChannel.request('get', 'PAYMENT_METHOD_DISPLAY');
    const dispute = disputeChannel.request('get');
    const currentUser = sessionChannel.request('get:user');
    const disputeFees = paymentsChannel.request('get:fees');
    const firstUnpaidDisputeFee = disputeFees.getFirstUnpaidActiveFee();
    
    const paymentDueDisplay = this._getPaymentDisplay(firstUnpaidDisputeFee);
    const dueDateDisplay = firstUnpaidDisputeFee ? Formatter.toDateDisplay(firstUnpaidDisputeFee.get('due_date')) : null;
    
    return {
      Formatter,
      dispute,
      paymentDueDisplay,
      dueDateDisplay,
      userDisplay: currentUser && currentUser.getDisplayName(),
      paymentMethodDisplay: firstUnpaidDisputeFee && PAYMENT_METHOD_DISPLAY && _.has(PAYMENT_METHOD_DISPLAY, firstUnpaidDisputeFee.get('method_paid')) ? PAYMENT_METHOD_DISPLAY[firstUnpaidDisputeFee.get('method_paid')] : '-'
    };
  }
});
