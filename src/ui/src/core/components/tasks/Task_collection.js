
import Backbone from 'backbone';
import TaskModel from './Task_model';

export default Backbone.Collection.extend({
  model: TaskModel,

  DEFAULT_API_COUNT: 20,

  totalAvailable: null,
  lastUsedFetchIndex: null,
  lastUsedFetchCount: null,
  
  hasMoreAvailable() {
    // It has more available if the current length is less than the reported total,
    // and if we haven't searched for more records (request.count) than are reportedly available.
    return Number(this.totalAvailable) > 0
      && this.totalAvailable > this.length
      && this.lastUsedFetchCount <= this.totalAvailable  
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
