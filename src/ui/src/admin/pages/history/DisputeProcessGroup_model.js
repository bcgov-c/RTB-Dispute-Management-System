import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    processDetailsModel: null,
    statusCollection: null,
    disputeModel: null
  }
});