import Backbone from 'backbone';

import StatusModel from './Status_model';

export default Backbone.Collection.extend({
  model: StatusModel,

  status_comparator: function(n) { return $.trim(n.get('status_start_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); },

  initialize() {
    this.comparator = this.reverseSortBy(this.status_comparator);
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
