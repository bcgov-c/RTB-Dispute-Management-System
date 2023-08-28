import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';

const api_name = 'substitutedservice';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const noticeChannel = Radio.channel('notice');

export default CMModel.extend({
  idAttribute: 'sub_service_id',
  defaults: {
    sub_service_id: null,
    dispute_guid: null,
    service_by_participant_id: null,
    service_to_participant_id: null,
    request_doc_type: null,
    request_source: null,
    request_additional_info: null,
    request_doc_other_description: null,
    
    failed_method1_type: null,
    failed_method1_description: null,
    failed_method1_specifics: null,
    failed_method1_date: null,
    failed_method1_note: null,
    failed_method1_file_desc_id: null,
    
    failed_method2_type: null,
    failed_method2_description: null,
    failed_method2_specifics: null,
    failed_method2_date: null,
    failed_method2_note: null,
    failed_method2_file_desc_id: null,
    
    failed_method3_type: null,
    failed_method3_description: null,
    failed_method3_specifics: null,
    failed_method3_date: null,
    failed_method3_note: null,
    failed_method3_proof_file_desc_id: null,
    
    other_failed_method_details: null,
    is_respondent_avoiding: null,
    respondent_avoiding_details: null,
    requesting_time_extension: null,
    requesting_time_extension_date: null,
    requesting_service_directions: null,
    requested_method_description: null,
    requested_method_justification: null,
    request_method_file_desc_id: null,
    request_notes: null,
    request_status: null,
    sub_service_approved_by: null,
    sub_service_title: null,
    sub_service_instructions: null,
    sub_service_effective_date: null,
    sub_service_expiry_date: null,
    sub_service_doc_type: null,
    sub_service_doc_other_description: null,
    outcome_document_file_id: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'service_by_participant_id',
    'service_to_participant_id',
    'request_doc_type',
    'request_source',
    'request_doc_other_description',
    'failed_method1_type',
    'failed_method1_description',
    'failed_method1_specifics',
    'failed_method1_date',
    'failed_method1_note',
    'failed_method1_file_desc_id',
    'failed_method2_type',
    'failed_method2_description',
    'failed_method2_specifics',
    'failed_method2_date',
    'failed_method2_note',
    'failed_method2_file_desc_id',
    'failed_method3_type',
    'failed_method3_description',
    'failed_method3_specifics',
    'failed_method3_date',
    'failed_method3_note',
    'failed_method3_proof_file_desc_id',
    'other_failed_method_details',
    'is_respondent_avoiding',
    'respondent_avoiding_details',
    'requesting_time_extension',
    'requesting_time_extension_date',
    'requesting_service_directions',
    'requested_method_description',
    'requested_method_justification',
    'request_method_file_desc_id',
    'request_notes',
    'request_status',
    'sub_service_approved_by',
    'sub_service_title',
    'sub_service_instructions',
    'sub_service_effective_date',
    'sub_service_expiry_date',
    'sub_service_doc_type',
    'sub_service_doc_other_description',
    'outcome_document_file_id',
    'request_additional_info'
  ],

  getRequestStatusImgClass() {
    if (this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_APPROVED')) return 'sub-service-icon-approved';
    else if (this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_PENDING') ||
      this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_RECEIVED')) return 'sub-service-icon-not-set';
    else if (this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED')) return 'sub-service-icon-denied';
    else if (this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_WITHDRAWN')) return 'sub-service-icon-denied';
    else return '';
  },

  getSubServiceTypeText() {
    return this.get('request_status') ? `Substituted Service ${configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DISPLAY')[this.get('request_status')]}` : '-';
  },

  getDocTypeDisplay() {
    if (!this.get('request_doc_type')) return;

    const serviceQuadrant = noticeChannel.request('get:subservices:quadrant:by:documentId', this.get('request_doc_type'))
    if (!serviceQuadrant) return configChannel.request('get', 'SERVICE_DOC_TYPE_DISPLAY')[this.get('request_doc_type')];

    return serviceQuadrant.documentsName;
  },

  isSourceOffice() {
    return this.get('request_source') === configChannel.request('get', 'TASK_REQUEST_SOURCE_OFFICE');
  },

  isStatusDenied() {
    return this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED');
  },

  isStatusApproved() {
    return this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_APPROVED');
  },

  isStatusWithdrawn() {
    return this.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_WITHDRAWN'); 
  },

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  }

});
