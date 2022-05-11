import Backbone from 'backbone';

/**
 * Local model only, nested data object in Unit custom data
 */
export default Backbone.Model.extend({
  defaults: {
    "local-permit_id": null,
    "local-permit_description": null,
    "local-issued_date": null,
    "local-issued_by": null
  },
  
});