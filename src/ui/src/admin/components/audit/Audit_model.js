import Backbone from 'backbone';

export default Backbone.Model.extend({
  idAttribute: 'audit_log_id',
  defaults: { 
    dispute_guid: null,
    audit_log_id: null,
    api_call_type: null,
    api_name: null,
    submitted_date: null,
    submitter_role: null,
    submitter_user_id: null,
    submitter_participant_id: null,
    submitter_name: null,
    api_response: null,
    api_error_response: null,
    api_call_data: null,
    associated_record_id: null
  }  
});
