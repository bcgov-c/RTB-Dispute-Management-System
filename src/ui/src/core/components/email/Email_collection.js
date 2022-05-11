import Backbone from 'backbone';
import EmailModel from './Email_model';

export default Backbone.Collection.extend({
  model: EmailModel,

  email_comparator: function(n) { return $.trim(n.get('created_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); },

  initialize() {
    this.comparator = this.reverseSortBy(this.email_comparator);
  },

  saveAll() {
    const dfd = $.Deferred();
    Promise.all(this.map(function(model) {
      return model.save( model.getApiChangesOnly() );
    })).then(dfd.resolve, dfd.reject);
    return dfd.promise();
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
