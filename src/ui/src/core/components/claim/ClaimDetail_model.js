/**
 * @class core.components.claim.ClaimDetailModel
 * @memberof core.components.claim
 * @augments core.components.model.CMModel
 */

import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config'),
  participantChannel = Radio.channel('participants'),
  sessionChannel = Radio.channel('session');

const api_name = 'issues/claimdetail';
export default CMModel.extend({
  idAttribute: 'claim_detail_id',
  defaults: {
    claim_detail_id: null,
    claim_id: null,
    is_amended: null,
    notice_date: null,
    notice_method: 0,
    description_by: null,
    description: null,
    when_aware: null,
    location: null,
    impact: null,
    modified_date: null
  },

  API_SAVE_ATTRS: [
    'is_amended',
    'notice_date',
    'notice_method',
    'description_by',
    'description',
    'when_aware',
    'location',
    'impact'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('claim_id')}` : '');
  },

  save(attrs, options) {
    options = options || {};
    
    // Make sure a valid description_by is always set
    if (!participantChannel.request('check:id', this.get('description_by'))) {
      this.set('description_by', sessionChannel.request('get:active:participant:id'), { silent: true });
    }
    return CMModel.prototype.save.call(this, attrs, options);
  }
});
