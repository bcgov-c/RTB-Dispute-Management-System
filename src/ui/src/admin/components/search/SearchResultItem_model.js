import Backbone from 'backbone';
import Dispute_model from '../../../core/components/dispute/Dispute_model';

export default Backbone.Model.extend({
  defaults: {
    dispute_guid: null,
    file_number: null,
    dispute_type: null,
    dispute_sub_type: null,
    initial_payment_date: null,
    tenancy_address: null,
    tenancy_zip_postal: null,
    cross_app_file_number: null,
    shared_hearing_link_type: null,
    intake_payment_amount_paid: null,
    created_date: null,
    creation_method: null,
    notice_generated_date: null,
    submitted_date: null,
    modified_date: null,
    status: null,
    stage: null,
    hearing_start_date: null,
    dispute_urgency: null,
    intake_payment_payment_method: null,
    intake_payment_date_paid: null,
    intake_payment_is_paid: null,
    status_start_date: null,
    owner: null,
    process: null,
    total_applicants: null,
    total_respondents: null,
    claims: null
  },

  toDisputeModel() {
    return new Dispute_model({
      file_number: this.get('file_number'),
      dispute_guid: this.get('dispute_guid'),
      creation_method: this.get('creation_method'),
      submitted_date: this.get('submitted_date'),
      dispute_type: this.get('dispute_type'),
      dispute_sub_type: this.get('dispute_sub_type'),
      initial_payment_date: this.get('initial_payment_date'),
      tenancy_address: this.get('tenancy_address'),
      tenancy_zip_postal: this.get('tenancy_zip_postal'),
      cross_app_file_number: this.get('cross_app_file_number'),
      created_date: this.get('created_date'),
      modified_date: this.get('modified_date'),      
      status: {
        dispute_stage: this.get('stage'),
        dispute_status: this.get('status'),
        owner: this.get('owner'),
        process: this.get('process'),
      }
    });
  },

});
