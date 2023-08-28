import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';
import OutcomeDocDeliveryModel from './OutcomeDocDelivery_model';
import OutcomeDocDeliveryCollection from './OutcomeDocDelivery_collection';
import OutcomeDocContentModel from './OutcomeDocContent_model';
import OutcomeDocContentCollection from './OutcomeDocContent_collection';

const api_name = 'outcomedocfile';
const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');

export default CMModel.extend({
  idAttribute: 'outcome_doc_file_id',
  defaults: {
    outcome_doc_file_id: null,
    outcome_doc_group_id: null,
    dispute_guid: null,
    file_type: null,
    file_status: null,
    file_sub_status: null,
    visible_to_public: null,
    file_title: null,
    file_acronym: null,
    file_description: null,
    internal_file_comment: null,
    file_source: null,
    file_id: null,
    materially_different: null,
    note_worthy: null,
    file_sub_type: null,
    outcome_doc_contents: null,
    outcome_doc_deliveries: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_POST_ONLY_ATTRS: [
    'dispute_guid',
    'file_type'
  ],

  API_SAVE_ATTRS: [
    'file_status',
    'file_sub_status',
    'visible_to_public',
    'file_title',
    'file_acronym',
    'file_description',
    'internal_file_comment',
    'file_source',
    'file_id',
    'materially_different',
    'note_worthy',
    'file_sub_type',
  ],

  nested_collections_data() {
    return {
      outcome_doc_contents: OutcomeDocContentCollection,
      outcome_doc_deliveries: OutcomeDocDeliveryCollection
    };
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('outcome_doc_group_id')}` : '');
  },

  initialize() {
    CMModel.prototype.initialize.call(this, arguments);

    this.setConfig();
    this.on('change:file_type', () => this.setConfig());
  },

  setConfig() {
    this.config = documentsChannel.request('config:file', this.get('file_type')) || {};
  },

  /* Methods related to OutcomeDocDeliveries associated to this OutcomeDocFile  */

  getDeliveries() {
    return this.get('outcome_doc_deliveries');
  },

  createDelivery(attrs, options) {
    attrs = attrs || {};
    options = options || {};
    const outcomeDocDeliveryModel = new OutcomeDocDeliveryModel(_.extend({
      // System defaults
      outcome_doc_file_id: this.get('outcome_doc_file_id'),
      dispute_guid: this.get('dispute_guid'),
      // Default business rules
      delivery_priority: configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_NOT_SET')
    }, attrs));

    if (options.add) {
      const deliveries = this.getDeliveries(),
        existing_delivery = attrs.participant_id ? deliveries.findWhere({ participant_id: attrs.participant_id }) : null;
      // If saving a participant, make sure one doesn't already exist
      if (existing_delivery) {
        existing_delivery.set(attrs, {silent: true});
      } else {
        deliveries.add(outcomeDocDeliveryModel, {merge: true});
      }
    }
    return outcomeDocDeliveryModel;
  },
  
  saveDeliveries() {
    const dfd = $.Deferred();
    Promise.all(this.getDeliveries().map(model => {
      model.set({
        // Ensure the system defaults are set for this model/collection
        outcome_doc_file_id: this.get('outcome_doc_file_id'),
        dispute_guid: this.get('dispute_guid')
      });
      return model.save(model.getApiChangesOnly());
    }))
    .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  saveAll() {
    const dfd = $.Deferred();
    this.save(this.getApiChangesOnly()).done(() => {
      this.saveDeliveries()
        .done(dfd.resolve)
        .fail(dfd.reject);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  destroy(options) {
    const dfd = $.Deferred();
    this.getDeliveries().deleteAll().done(() => {
      CMModel.prototype.destroy.call(this, options).done(dfd.resolve).fail(dfd.reject);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  getNonParticipantDeliveries() {
    return this.getDeliveries().filter(function(m) {
      return m.isNonParticipant();
    });
  },

  getParticipantDelivery(participant_id) {
    return this.getDeliveries().findWhere({ participant_id });
  },

  getSavedParticipantDelivery(participant_id) {
    return this.getDeliveries().find(function(delivery_model) {
      return !delivery_model.isNew() && delivery_model.get('participant_id') === participant_id;
    });
  },

  /* Methods related to OutcomeDocContent associated to this OutcomeDocFile  */
  getDocContents() {
    return this.get('outcome_doc_contents');
  },

  createDeliveries() {
    return documentsChannel.request('create:deliveries', this);
  },

  createDocContent(attrs, options) {
    attrs = attrs || {};
    options = options || {};
    const outcomeDocContentModel = new OutcomeDocContentModel(_.extend({
      // System defaults
      outcome_doc_file_id: this.get('outcome_doc_file_id'),
      
      // Default business rules
      content_status: configChannel.request('get', 'OUTCOME_DOC_CONTENT_STATUS_WORKING')
    }, attrs));

    if (options.add) {
      const doc_contents = this.getDocContents();
      doc_contents.add(outcomeDocContentModel, {merge: true});
    }
    return outcomeDocContentModel;
  },

  getDocContentType(content_type) {
    return this.getDocContents().findWhere({ content_type });
  },

  getFileTitleDisplay(withAcronym=true) {
    const isPublic = this.isPublic();
    return `${!isPublic && withAcronym ? `${this.get('file_acronym')} - `:''}${this.get('file_title')}${
      isPublic ? ` (${this.toAnonymousDocId()})` : ''}`;
  },

  /* Status for this OutcomeDocFile */

  isFileTypeInRangesForConfigCode(configCodeForRange) {
    // Range object is of format { start: 1, end: 10 }
    const ranges = configChannel.request('get', configCodeForRange) || [];
    const fileType = Number(this.get('file_type'));
    if (!fileType) return false;
    return ranges.filter(range => fileType >= range.start && fileType <= range.end).length;
  },

  isDecision() {
    return this.isFileTypeInRangesForConfigCode('outcome_doc_type_decision_ranges');
  },

  isMonetaryOrder() {
    return this.isFileTypeInRangesForConfigCode('outcome_doc_type_monetary_order_ranges');
  },

  isOrderOfPossession() {
    return this.isFileTypeInRangesForConfigCode('outcome_doc_type_order_of_possession_ranges');
  },

  isDirectRequest() {
    return this.config?.is_direct_request;
  },

  isCrossed() {
    return this.config?.is_crossed;
  },

  canBeAnonymized() {
    return this.config?.can_be_anonymized;
  },

  isPublicSearchable() {
    return this.config?.public_searchable;
  },

  isPublic() {
    return this.get('file_type') === configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION');
  },

  isExternal() {
    return this.get('file_type') === configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_EXTERNAL');
  },

  isOther() {
    return this.config?.code === configChannel.request('get', 'OUTCOME_DOC_OTHER_CODE');
  },

  hasPublicError() {
    return this.get('file_status') && this.get('file_status') === configChannel.request('get', 'OUTCOME_DOC_FILE_STATUS_PD_ERROR');
  },

  hasUploadedFile() {
    return !!this.get('file_id');
  },

  toAnonymousDocId() {
    return this.isPublic() && !this.isNew() ? `AnonDec-${this.id}` : '';
  },
  
});