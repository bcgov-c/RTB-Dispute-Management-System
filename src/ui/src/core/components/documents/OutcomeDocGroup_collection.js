import Backbone from 'backbone';
import OutcomeDocGroupModel from './OutcomeDocGroup_model';

export default Backbone.Collection.extend({
  model: OutcomeDocGroupModel,

  outcome_doc_group_comparator: function(n) { return $.trim(n.get('created_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); },

  initialize() {
    this.comparator = this.reverseSortBy(this.outcome_doc_group_comparator);
  },

  containsOutcomeDocCodes(fileCodes) {
    return this.some((outcomeDoc) => outcomeDoc.containsOutcomeDocCodes(fileCodes));
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
