import Backbone from 'backbone';
import AuditModel from './Audit_model';

export default Backbone.Collection.extend({
  model: AuditModel,

  audit_comparator: function(n) { return $.trim(n.get('submitted_date')).replace(/[a-zA-Z\:\_\-\.]/g, ''); },

  initialize() {
    this.comparator = this.reverseSortBy(this.audit_comparator);
    this.setElement(this.at(0));    
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

  getElement() {
    return this.currentElement;
  },

  setElement(model) {
    this.currentElement = model;
  },

  next() {
    this.setElement(this.at(this.indexOf(this.getElement()) + 1));
    if (!this.getElement()) {
      this.setElement(this.at(this.indexOf(this.getElement()) + 1));
    }
    return this;
  },

  prev() {
    this.setElement(this.at(this.indexOf(this.getElement()) - 1));
    return this;
  }

});
