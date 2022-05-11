import Backbone from 'backbone';
import PaymentTransactionModel from './PaymentTransaction_model';

export default Backbone.Collection.extend({
  model: PaymentTransactionModel,

  payment_comparator: function(n) { return n.get('payment_transaction_id'); },

  initialize() {
    this.comparator = this.reverseSortBy(this.payment_comparator);
  },

  reverseSortBy(sortByFunction) {
    return function(left, right) {
      var l = sortByFunction(left);
      var r = sortByFunction(right);

      if (l === void 0) return -1;
      if (r === void 0) return 1;

      return l < r ? 1 : l > r ? -1 : 0;
    };
  }
});
