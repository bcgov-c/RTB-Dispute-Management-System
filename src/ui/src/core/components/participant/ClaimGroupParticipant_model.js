/**
 * @class core.components.participant.ClaimGroupParticipantModel
 * @memberof core.components.participant
 * @augments core.components.model.CMModel
 */

import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config'),
  claimGroupsChannel = Radio.channel('claimGroups');

const api_name = 'parties/claimgroupparticipant';
export default CMModel.extend({
  idAttribute: 'group_participant_id',

  defaults: {
    group_participant_id: null,
    claim_group_id: null,
    group_participant_role: null,
    participant_id: null,
    group_primary_contact_id: null,

    modified_date: null,
    modified_by: null,
    created_by: null,
    created_date: null
  },

  API_SAVE_ATTRS: [
    'participant_id',
    'group_participant_role',
    'group_primary_contact_id'
  ],

  url() {
    // NOTE: POSTing a ClaimGroupParticipant will associate it to the Main claim group by default
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/` + (this.isNew()? claimGroupsChannel.request('get:id') : this.id);
  },

  parse(response, options) {
    // NOTE: This needs to be overwritten in order to properly parse the "batch" response we have set up in the API
    const parsedResponse = _.isArray(response) && response.length === 1 ? response[0] : response;
    return CMModel.prototype.parse.call(this, parsedResponse, options);
  },

  save(attrs, options) {
    return CMModel.prototype.save.call(this, attrs, _.extend({}, options, { singleton_batch: true }));
  },

  fetch(options) {
    return CMModel.prototype.fetch.call(this, _.extend({}, options, { singleton_batch: true }));
  }

});
