/**
 * @class core.components.dispute.ClaimGroupModel
 * @memberof core.components.dispute
 * @augments Backbone.Model
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config'),
  disputeChannel = Radio.channel('dispute');

const api_name = 'parties/claimgroup';
export default Backbone.Model.extend({
  idAttribute: 'claim_group_id',
  defaults: {
    claim_group_id: null,
    created_date: null,
    dispute_guid: null,
    modified_date: null
  },

  url() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${disputeChannel.request('get').get('dispute_guid')}` : '');
  },

  methodIsCreate(method) {
    return method === 'create';
  },

  sync(method, model, options) {
    if (!this.methodIsCreate(method)) {
      console.log(`[Warning] ClaimGroup can only be created.  No support for method "${method}"`);
      return;
    } else {
      return Backbone.Model.prototype.sync(method, model, options);
    }
  }
});
