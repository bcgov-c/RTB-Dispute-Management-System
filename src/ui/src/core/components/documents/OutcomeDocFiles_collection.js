import Backbone from 'backbone';
import Radio from 'backbone.radio';
import OutcomeDocFileModel from './OutcomeDocFile_model';

const configChannel = Radio.channel('config');

export default Backbone.Collection.extend({
  model: OutcomeDocFileModel,
  comparator(model) {
    let order = this.outcome_doc_group_sort_order.indexOf(model.get('file_acronym'));
    // Sort "other" to the bottom
    if (order === -1) order = Number.MAX_SAFE_INTEGER-(model.isOther() ? 0 : 1);
    return order;
  },

  initialize() {
    this.outcome_doc_group_sort_order = configChannel.request('get', 'outcome_doc_group_sort_order') || [];
  },

  deleteAll() {
    const dfd = $.Deferred();
    Promise.all(this.map(function(file) { return file.destroy(); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  }
});