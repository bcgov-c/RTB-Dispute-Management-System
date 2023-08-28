import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';

import OutcomeDocFileModel from './OutcomeDocFile_model';
import OutcomeDocFileCollection from './OutcomeDocFiles_collection';

const api_name = 'outcomedocgroup';

const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default CMModel.extend({
  idAttribute: 'outcome_doc_group_id',
  defaults: { 
    outcome_doc_group_id: null,
    dispute_guid: null, // Will be returned by the API
    doc_group_type: null,
    doc_group_sub_type: null,
    doc_completed_date: null,
    doc_preparation_time: null,
    doc_writing_time: null,
    doc_complexity: null,
    doc_status: null,
    doc_status_date: null,
    outcome_doc_files: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,

    // UI only attrs
    _isReadyForDeliveryChecked: false
  },

  API_SAVE_ATTRS: [
    'doc_group_type',
    'doc_group_sub_type',
    'doc_completed_date',
    'doc_status',
    'doc_status_date',
    'doc_writing_time',
    'doc_preparation_time',
    'doc_complexity'
  ],

  nested_collections_data() {
    return {
      outcome_doc_files: OutcomeDocFileCollection
    };
  },

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  getOutcomeFiles() {
    return this.get('outcome_doc_files');
  },

  //get

  /**
   * Creates a new OutcomeDocFileModel with some default attributes.
   * Any attributes passed in will be passed straight through to the Model constructor, overwriting
   * any defaults we try.
   * @param {Object} attrs - Attributes to be passed into the for the outcome document 
   * @param {Object} options - Optional configuration parameters for the method
   * @param {boolean} [options.add] - Optional argument. If true, adds the model to the collection
   * @returns {OutcomeDocFileModel} - The created model
   */
  createOutcomeFile(attrs, options) {
    attrs = attrs || {};
    options = options || {};
    const outcomeDocFileModel = new OutcomeDocFileModel(_.extend({
      // System defaults
      outcome_doc_group_id: this.get('outcome_doc_group_id'),
      dispute_guid: this.get('dispute_guid'),
      
      // Default business rules
      file_status: configChannel.request('get', 'OUTCOME_DOC_FILE_STATUS_ACTIVE'),
      file_sub_status: configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_STATUS_NOT_SET'),
      file_source: configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL'),
    }, attrs));

    if (options.add) {
      // Pass {merge: true} option so that no duplicates are created
      this.getOutcomeFiles().add(outcomeDocFileModel, {merge: true});
    }
    return outcomeDocFileModel;
  },

  createOutcomeFileFromConfig(outcome_doc_file_config, options={}) {
    return this.createOutcomeFile({
      file_type: outcome_doc_file_config.id,
      file_acronym: outcome_doc_file_config.code,
      file_title: outcome_doc_file_config.title,
      visible_to_public: false // NOTE: No public in R1:outcome_doc_file_config.visible_to_public
    }, options);
  },

  createOutcomeFilePublicFinal(outcomeFileData={}, options={}) {
    const docConfigId = configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION');
    const fileConfig = documentsChannel.request('config:file', docConfigId) || {};
    return this.createOutcomeFile(Object.assign({}, {
      file_type: docConfigId,
      file_acronym: fileConfig.code,
      file_title: fileConfig.title,
      file_source: configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL'),
      visible_to_public: false
    }, outcomeFileData), options);
  },

  // Fills each OutcomeDocFile with the OutcomeDocDelivery objects it needs, based on participants and public-ness
  createAssociatedOutcomeDeliveries() {
    _.each(this.getDeliverableOutcomeFiles(), function(outcome_file_model) {
      outcome_file_model.createDeliveries();
    });
  },

  getDeliverableOutcomeFiles() {
    return this.getOutcomeFiles().filter(outcome_file_model => (
      !outcome_file_model.isPublic() &&
      !outcome_file_model.isExternal()
    ));
  },

  getFirstSavedDeliveryForParticipant(participant_id) {
    let first_saved_valid_delivery;
    _.find(this.getDeliverableOutcomeFiles(), function(outcome_file_model) {
      const saved_delivery = outcome_file_model.getSavedParticipantDelivery(participant_id);
      if (saved_delivery) {
        first_saved_valid_delivery = saved_delivery;
      }
      return saved_delivery;
    });
    return first_saved_valid_delivery;
  },

  getHighestDeliveryPriority() {
    const allDeliveries = _.flatten(this.getDeliverableOutcomeFiles().map(docFile => docFile.getDeliveries().models));
    return allDeliveries.reduce((memo, delivery) => Math.max(memo, delivery.get('delivery_priority') || 0), 0);
  },

  getEarliestDeliverySendDate() {
    return this.getEarliestDate('delivery_date');  
  },

  getEarliestReadyForDeliveryDate() {
    return this.getEarliestDate('ready_for_delivery_date');
  },

  getEarliestDate(dateField) {
    const dates = [];
    this.getOutcomeFiles().forEach(docFile => docFile.getDeliveries().forEach(d => {
      const momentDate = Moment(d.get(dateField) || null);
      if (momentDate.isValid()) dates.push(momentDate);
    }));
    const earliestDate = dates.length ? Moment.min.apply(Moment, dates) : null;
    return earliestDate;
  },

  /**
   * Saves this collection of OutcomeDocFileModels.
   * @param {Object} options - Optional configuration parameters for the method
   * @param {boolean} [options.deliveries] - Optional argument. If true, saves deliveries as well
   * @returns {OutcomeDocFileModel} - The created model
   */
  saveOutcomeFiles(options) {
    options = options || {};
    const dfd = $.Deferred();
    Promise.all(this.getOutcomeFiles().map(model => {
      model.set({
        // Ensure the system defaults are set for this model/collection
        outcome_doc_group_id: this.get('outcome_doc_group_id'),
        dispute_guid: this.get('dispute_guid')
      });
      if (options.deliveries) {
        return model.saveAll(model.getApiChangesOnly());
      } else {
        return model.save(model.getApiChangesOnly());
      }
    }))
    .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  /**
   * Saves this model and this collection of OutcomeDocFileModels.
   * @param {Object} options - Optional configuration parameters for the method
   * @param {boolean} [options.deliveries] - Optional argument. If false, doesn't save deliveries
   * @returns {OutcomeDocFileModel} - The created model
   */
  saveAll(options) {
    options = _.extend({
      deliveries: true,
      files: true
    }, options);

    const dfd = $.Deferred();
    this.save(this.getApiChangesOnly())
      .done(() => {
        if (!options.files) {
          dfd.resolve();
        } else {
          this.saveOutcomeFiles(options)
            // Ensure there is enough time between the outcome doc group record save and the outcome doc file save (race condition in PostedDecision mid-tier?)
            .done(response => setTimeout(() => dfd.resolve(response), 25))
            .fail(dfd.reject);
        }
      })
      .fail(dfd.reject);
    return dfd.promise();
  },

  destroy(options) {
    const dfd = $.Deferred();
    this.getOutcomeFiles().deleteAll().done(() => {
      CMModel.prototype.destroy.call(this, options).done(dfd.resolve).fail(dfd.reject);
    }).fail(dfd.reject);
    return dfd.promise();
  },


  isActive() {
    return this.get('doc_status') === configChannel.request('get', 'OUTCOME_DOC_GROUP_STATUS_ACTIVE');
  },

  isCompleted() {
    return this.get('doc_status') === configChannel.request('get', 'OUTCOME_DOC_GROUP_STATUS_COMPLETED');
  },

  canBeDeleted() {
    return !this.getOutcomeFiles().any(f => f.hasUploadedFile() || f.getDeliveries().filter(d => !d.isNew()).length);
  },

  getOutcomeFileDCN() {
    const OUTCOME_DOC_DECISION_CODE = configChannel.request('get', 'OUTCOME_DOC_DECISION_CODE');
    return this.getOutcomeFiles().find(outcomeFile => outcomeFile.get('file_acronym') === OUTCOME_DOC_DECISION_CODE && OUTCOME_DOC_DECISION_CODE);
  },

  getOutcomeFilePublicFinal() {
    return this.getOutcomeFiles().find(outcomeFile => outcomeFile.isPublic());
  },

  getAnonymousDocId() {
    return this.getOutcomeFilePublicFinal()?.toAnonymousDocId();
  },

  getGroupRequestTitleDisplay(options={}) {
    const outcomeFiles = this.getOutcomeFiles();
    const hasDecision = outcomeFiles.any(outcomeFile => outcomeFile.isDecision());
    const hasMonetaryOrder = outcomeFiles.any(outcomeFile => outcomeFile.isMonetaryOrder());
    const hasOrderOfPossession = outcomeFiles.any(outcomeFile => outcomeFile.isOrderOfPossession());
    const title = hasDecision && (hasMonetaryOrder || hasOrderOfPossession) ? `Decision and Order(s)`
      : hasDecision ? `Decision`
      : `Other Documents`;
    const dateDisplay = this.get('doc_completed_date') ? Formatter.toFullDateDisplay(this.get('doc_completed_date')) : 'date not available';
    
    return `${title}${options.date !== false ? `: ${dateDisplay}` : ''}`
  },

  getDocFilesWithConfigFilter(configFieldToCheck) {
    return this.getOutcomeFiles().filter(docFile => docFile.hasUploadedFile() &&
        (documentsChannel.request('config:file', docFile.get('file_type')) || {})[configFieldToCheck]);
  },

  getDocFilesThatCanRequestCorrection() {
    return this.getDocFilesWithConfigFilter('can_request_correction');
  },

  getDocFilesThatCanRequestClarification() {
    return this.getDocFilesWithConfigFilter('can_request_clarification');
  },

  getDocFilesThatCanRequestReview() {
    return this.getDocFilesWithConfigFilter('can_request_review');
  },

  containsOutcomeDocCodes(fileCodes) {
    const outcomeDocFiles = this.getOutcomeFiles();
    if (!outcomeDocFiles) return false;
    
    return this.getOutcomeFiles().some((docFile) => {
      return fileCodes.includes(docFile.get('file_type'));
    });
  },

  isSubType(subType) {
    const outcomeFiles = this.getOutcomeFiles();
    return outcomeFiles.length && outcomeFiles.all(f => f.get('file_sub_type') === subType);
  },

  isSubTypeCorrection() {
    return this.isSubType(configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_CORR'));
  },

  isSubTypeReview() {
    return this.isSubType(configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_REVIEW'));
  },

  isSubTypeNewDoc() {
    return this.isSubType(configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_NEW'));
  },

  getGroupTitle() {
    const OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY');
    const code = this.isSubTypeCorrection() ? 'OUTCOME_DOC_FILE_SUB_TYPE_CORR'
        : this.isSubTypeReview() ? 'OUTCOME_DOC_FILE_SUB_TYPE_REVIEW'
        : 'OUTCOME_DOC_FILE_SUB_TYPE_NEW';

    return code ? OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[configChannel.request('get', code)] : null;
  }
});
