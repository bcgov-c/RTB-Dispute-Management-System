import CMModel from '../../../core/components/model/CM_model';

export default CMModel.extend({
  idAttribute: 'conference_bridge_id',
  defaults: {
    conference_bridge_id: null,
    bridge_type: null,
    bridge_status: null,
    dial_in_number1: null,
    dial_in_description1: null,
    dial_in_number2: null,
    dial_in_description2: null,
    dial_in_number3: null,
    dial_in_description3: null,
    preferred_start_time: null,
    preferred_end_time: null,
    preferred_owner: null,
    participant_code: null,
    moderator_code: null,
    special_instructions: null,
    web_portal_login: null,

    created_date: null,
    modified_date: null,
    created_by: null,
    creator_group_role_id: null,
    modified_by: null
  }
});
