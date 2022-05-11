import Backbone from 'backbone';
import DisputeFeeModel from './DisputeFee_model';

export default Backbone.Collection.extend({
  model: DisputeFeeModel,

  fee_comparator: function(n) { return n.get('dispute_fee_id'); },

  initialize() {
    this.comparator = this.reverseSortBy(this.fee_comparator);
  },

  reverseSortBy(sortByFunction) {
    return function(left, right) {
      var l = sortByFunction(left);
      var r = sortByFunction(right);

      if (l === void 0) return -1;
      if (r === void 0) return 1;

      return l < r ? 1 : l > r ? -1 : 0;
    };
  },

  getFirstUnpaidActiveFee() {
    // Review fees are not included as "active" fees for normal payment flows
    return this.find(fee => !fee.isPaid() && fee.isActive() && !fee.isReviewFee());
  },

  getIntakeFee() {
    return this.find(fee => fee.isIntakeFee());
  }
});
