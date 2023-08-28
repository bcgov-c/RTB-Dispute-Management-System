import CMModel from '../../model/CM_model';
import Radio from 'backbone.radio';
import DocRequestItemModel from './DocRequestItem_model';
import DocRequestItemCollection from './DocRequestItem_collection';

const apiName = 'outcomedocrequests/outcomedocrequest';

const filesChannel = Radio.channel('files');
const documentsChannel = Radio.channel('documents');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default CMModel.extend({
  idAttribute: 'outcome_doc_request_id',
  defaults: {
    outcome_doc_request_id: null,
	  dispute_guid: null,
	  request_type: null,
	  date_documents_received: null,
	  request_sub_type: null,
	  submitter_id: null,
	  affected_documents: null,
	  affected_documents_text: null,
	  outcome_doc_group_id: null,
	  file_description_id: null,
	  request_description: null,
	  request_status: null,
    request_sub_status: null,
	  other_status_description: null,
    request_processing_time: null,
    request_source: null,
    request_date: null,
    submitter_details : null,
    request_completion_date: null,

    outcome_document_req_items: null,
    
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },
  
  API_SAVE_ATTRS: [
    'request_type',
    'request_sub_type',
    'affected_documents',
    'affected_documents_text',
    'date_documents_received',
    'request_description',
    'submitter_id',
    'outcome_doc_group_id',
    'file_description_id',
    'request_status',
    'request_sub_status',
    'other_status_description',
    'request_processing_time',
    'request_source',
    'request_date',
    'submitter_details',
    'request_completion_date',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}${this.isNew() ? `/${disputeChannel.request('get:id')}` : ''}`;
  },

  nested_collections_data() {
    return {
      outcome_document_req_items: DocRequestItemCollection
    };
  },

  getRequestItems() {
    return this.get('outcome_document_req_items');
  },

  createRequestItem(attrs={}, options={}) {
    const requestItemModel = new DocRequestItemModel(_.extend({
      // System defaults
      outcome_doc_request_id: this.id,
      dispute_guid: this.get('dispute_guid'),
    }, attrs));

    if (options.add) {
      // Pass {merge: true} option so that no duplicates are created
      this.getRequestItems().add(requestItemModel, {merge: true});
    }
    return requestItemModel;
  },

  saveRequestItems() {
    const dfd = $.Deferred();
    Promise.all(this.getRequestItems().map(function(model) {
      return model.save(model.getApiChangesOnly());
    })).then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  save(attrs={}, options) {
    if (attrs && attrs.request_status === null) attrs.request_status = 0;
    return CMModel.prototype.save.call(this, attrs, options);
  },

  getAllUploadedFiles() {
    return _.flatten([this.getUploadedFiles(), this.getRequestItems().map(item => item.getUploadedFiles())]);
  },

  getUploadedFiles() {
    const fileDescription = filesChannel.request('get:filedescription', this.get('file_description_id'))
    return fileDescription ? fileDescription.getUploadedFiles() : [];
  },

  getOutcomeDocGroup() {
    return documentsChannel.request('get:group', this.get('outcome_doc_group_id'));
  },

  getAffectedDocumentIds() {
    const affectedDocumentsText = this.get('affected_documents_text') || '';
    const documentIds = affectedDocumentsText ? String(affectedDocumentsText).split(',') : [];
    return (documentIds.every(docId => docId && Number.isInteger(Number(docId)))) ? documentIds.map(docId => Number(docId)) : [];
  },

  getSourceDisplay() {
    const OUTCOME_DOC_REQUEST_SOURCE_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_REQUEST_SOURCE_DISPLAY') || {};
    return OUTCOME_DOC_REQUEST_SOURCE_DISPLAY[this.get('request_source')] || null;
  },

  isSourceOffice() {
    return this.get('request_source') === configChannel.request('get', 'TASK_REQUEST_SOURCE_OFFICE');
  },

  getTitleDisplay() {
    return this.isCorrection() ? 'Correction'
      : this.isClarification() ? 'Clarification'
      : this.isReview() ? 'Review Request'
      : `Other${this.get('request_type') ? ` (Type ${this.get('request_type')})` : ''}`
  },

  isPastProcess() {
    return this.get('request_sub_status') && this.get('request_sub_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_SUB_STATUS_PAST_PROCESS');
  },

  isCorrection() {
    return this.get('request_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CORRECTION');
  },

  isSimpleCorrection() {
    const reqItems = this.getRequestItems();
    return this.isCorrection() && reqItems.length && reqItems.all(reqItem => reqItem.isMathOrTypingError());
  },

  isComplexCorrection() {
    const reqItems = this.getRequestItems();
    return this.isCorrection() && reqItems.length && reqItems.any(reqItem => !reqItem.isMathOrTypingError());
  },

  isClarification() {
    return this.get('request_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CLARIFICATION');
  },

  isReview() {
    return this.get('request_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_REVIEW');
  },

  isStatusCompleted() {
    return this.get('request_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_COMPLETE');
  },

  isStatusWithdrawn() {
    return this.get('request_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_WITHDRAWN');
  },

  isStatusAbandoned() {
    return this.get('request_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_ABANDONED');
  },

  isStatusCancelledOrDeficient() {
    return this.get('request_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_CANCELLED_OR_DEFICIENT');
  },

  isStatusOther() {
    return this.get('request_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_OTHER');
  },

  isSubTypeOutside() {
    return this.get('request_sub_type') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_SUB_TYPE_OUTSIDE');
  },

});