import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    dispute_guid: null,
    file_number: null,
    dispute_stage: null,
    dispute_status: null,
    process: null,
    owner: null,
    delivery_creation: null,
    highest_undelivered_priority: null,
    total_undelivered: null,
    undelivered_by_method: null,
    // "undelivered_by_method" is an object returning: {
    //   "email_not_delivered_count": null,
    //   "pickup_not_delivered_count": null,
    //   "mail_not_delivered_count": null,
    //   "custom_not_delivered_count": null
    // },

    // We will flatten and add these fields onto the main object
    email_not_delivered_count: null,
    pickup_not_delivered_count: null,
    mail_not_delivered_count: null,
    custom_not_delivered_count: null
  },

  initialize() {
    const undeliveredByMethod = this.get('undelivered_by_method');
    if (typeof undeliveredByMethod === 'object') {
      this.set(undeliveredByMethod);
    }
  },
});