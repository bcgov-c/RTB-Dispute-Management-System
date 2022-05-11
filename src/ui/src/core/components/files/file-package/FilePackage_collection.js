import Backbone from 'backbone';
import FilePackageModel from './FilePackage_model';

export default Backbone.Collection.extend({
  model: FilePackageModel,

  initialize() {
    this.comparator = this.reverseSortBy( (model) => model.get('package_date') ? model.get('package_date') : model.get('created_date') );
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
