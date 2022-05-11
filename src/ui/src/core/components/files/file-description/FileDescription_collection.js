/**
 * @class core.components.files.file-description.FileDescriptionCollection
 * @memberof core.components.files.file-description
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import FileDescriptionModel from './FileDescription_model';
export default Backbone.Collection.extend({
  model: FileDescriptionModel,

  file_description_comparator: function(n) { return $.trim(n.get('created_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); },

  initialize() {
    this.comparator = this.reverseSortBy(this.file_description_comparator);
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
