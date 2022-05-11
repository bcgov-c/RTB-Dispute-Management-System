import PaymentTransactionModel from '../../../core/components/payments/PaymentTransaction_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const api_name = 'externalupdate/paymenttransaction';

export default PaymentTransactionModel.extend({
  urlRoot() {
    if (!this.isNew()) {
      alert("[Error] Can only POST new transactions as an external user");
      return;
    }

    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${this.get('dispute_fee_id')}`;
  }
});