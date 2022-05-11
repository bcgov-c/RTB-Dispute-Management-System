import Backbone from 'backbone';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../../utilities/UtilityMixin';
import DisputeEvidence_collection from '../../../claim/DisputeEvidence_collection';
import File_collection from '../../../files/File_collection';
import IntakeCeuDataParser from '../IntakeCeuDataParser';

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  idAttribute: 'c_contravention_guid',
  defaults: {
    c_contravention_guid: null,
    c_type: null,
    c_code: null,
    c_title: null,

    // Get fields from contravention info page
    c_estimated_dollar_value: null,
    c_largest_dollar_value: null,
    c_total_known_occurrences: null,
    c_latest_occurrence_date: null,
    c_latest_violation_date: null,
    c_latest_violation_duration: null,
    c_latest_notice_date: null,
    c_latest_decision_date: null,
    
    c_description: null,

    c_associated_complainants: null,
    c_associated_rental_units: null,
    
    c_included_dms_files: null,
    c_dms_file_guid: null,

    // Each contravention has repeatable witnesses and dms file numbers
    c_witnesses: null,
    //c_witness_type
    //c_witness_business_name
    //c_witness_business_contact_name
    //c_witness_first_name
    //c_witness_last_name
    //c_witness_phone
    //c_witness_email

    c_dms_file_numbers: null,
    //c_dms_file_number
    //c_dms_file_status
    //c_dms_file_closed_date

    c_evidence: [],
    // Evidence fields:
    /*
      e_evidence_guid
      e_is_other_evidence
      e_evidence_type
      e_evidence_title
      e_provision_option
      e_evidence_extfile_ids

      e_dms_evidence_id <-- CANT STORE FILES THIS WAY
    */

    // Will be auto-determined based on CEU intake state
    selectableTenants: null,
    selectableUnits: null,
  },

  initialize() {
    this.config = configChannel.request('get:issue:ceu', this.get('c_code')) || {};
    
    this.set({
      // Contraventions can only select tenants
      selectableTenants: IntakeCeuDataParser.isRespondentLandlord() ? IntakeCeuDataParser.getApplicantCollection() : [],
      selectableUnits: IntakeCeuDataParser.getUnitCollection()
    });
    this.createSubModels();
  },

  createSubModels() {
    this.witnessCollection = new Backbone.Collection(this.get('c_witnesses') || []);
    this.dmsFileNumberCollection = new Backbone.Collection(this.get('c_dms_file_numbers') || []);

    const pendingUploads = filesChannel.request('get:pending:ceu') || {};
    const getFileCollectionFor = (evidenceGuid) => {
      if (!evidenceGuid) return null;
      const matchingFileData = Object.values(pendingUploads).filter(fileData => evidenceGuid && ((fileData||{}).evidenceData||{}).e_evidence_guid === evidenceGuid);
      return matchingFileData.length ? new File_collection(matchingFileData.map(f => f.fileModel)) : null;
    };

    const configEvidence = (this.config.associatedEvidence || []).map(evidenceData => {
      const evidenceConfig = configChannel.request('get:evidence:ceu', evidenceData.id) || {};
      const addedEvidence = this.getSavedEvidenceId(evidenceData.id);
      return {
        claim_code: evidenceData.id,
        required: evidenceData.required,
        title: evidenceConfig.title,
        category: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
        // NOTE: Without helpHtml provided, DisputeModel auto-searches for evidence
        helpHtml: evidenceConfig.helpHtml || ' ',
        file_method: addedEvidence ? addedEvidence.e_provision_option : null,

        files: getFileCollectionFor((addedEvidence||{}).e_evidence_guid),
        e_evidence_guid: addedEvidence ? addedEvidence.e_evidence_guid : null,
        e_evidence_extfile_ids: addedEvidence ? addedEvidence.e_evidence_extfile_ids : null,
        _addedCeuEvidence: addedEvidence
      };
    });
    const otherSavedEvidence = this.getAllSavedEvidence().filter(e => e.e_is_other_evidence)
      .map(addedEvidence => {
        return {
          claim_code: addedEvidence.e_evidence_type,
          required: false,
          title: addedEvidence.e_evidence_title,
          file_method: addedEvidence.e_provision_option,
          evidence_id: configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE'),
          category: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
          // Note: Without helpHtml provided, DisputeModel auto-searches for evidence
          helpHtml: ' ',
          file_method: addedEvidence.e_provision_option,

          files: getFileCollectionFor(addedEvidence.e_evidence_guid),
          e_evidence_guid: addedEvidence.e_evidence_guid,
          e_evidence_extfile_ids: addedEvidence.e_evidence_extfile_ids,
          _addedCeuEvidence: addedEvidence
        }
      });


    this.evidenceCollection = new DisputeEvidence_collection([
      ...configEvidence,
      ...otherSavedEvidence
    ]);
  },

  addBlankWitness() {
    this.witnessCollection.add({
      c_witness_guid: UtilityMixin.util_generateUUIDv4()
    });
  },

  addBlankDmsFile() {
    this.dmsFileNumberCollection.add({
      c_dms_file_guid: UtilityMixin.util_generateUUIDv4()
    });
  },

  clearParticipantIds() {
    this.set('c_associated_complainants', null);
  },

  getParticipantIds() {
    return this.get('c_associated_complainants') || [];
  },

  addParticipantId(participantId) {
    const existingIds = this.getParticipantIds();
    this.set('c_associated_complainants', _.union(existingIds, [participantId]));
  },

  removeParticipantIds(participantIdsToRemove) {
    participantIdsToRemove = _.isArray(participantIdsToRemove) ? participantIdsToRemove : [participantIdsToRemove];
    const existingIds = this.getParticipantIds();
    this.set('c_associated_complainants', _.without(existingIds, participantIdsToRemove));
  },

  hasParticipantId(participantId) {
    return _.contains(this.getParticipantIds(), participantId);
  },

  getUnitIds() {
    return this.get('c_associated_rental_units') || [];
  },
  
  hasUnitId(unitId) {
    return _.contains(this.getUnitIds(), unitId);
  },

  getAllSavedEvidence() {
    return this.get('c_evidence') || [];
  },

  getSavedEvidenceId(evidenceId) {
    return this.getAllSavedEvidence().find(e => e.e_evidence_type === evidenceId);
  },

  getWitnessCollection() {
    return this.witnessCollection;
  },

  getDmsFileNumberCollection() {
    return this.dmsFileNumberCollection;
  },

  getEvidenceCollection() {
    return this.evidenceCollection;
  },

  saveInternalDataToModel(options={}) {
    const modelSaveData = {};

    // Convert evidenceCollection to saved evidence data, and add to current session
    const evidenceCollection = this.getEvidenceCollection();
    const allEvidenceData = [];
    evidenceCollection.forEach(evidence => {
      const evidenceData = IntakeCeuDataParser.convertDisputeEvidenceToData(evidence);
      if (options.returnOnly) {
        allEvidenceData.push(evidenceData);  
      } else {
        if (!evidence.get('e_evidence_guid')) evidence.set('e_evidence_guid', evidenceData.e_evidence_guid);
        evidence.get('files').forEach(fileModel => {
          if (fileModel.isReadyToUpload()) filesChannel.request('add:pending:ceu', evidenceData, fileModel)
        });
      }
    });

    Object.assign(modelSaveData, {
      c_witnesses: this.getWitnessCollection().map(w => w.toJSON()),
      c_dms_file_numbers: this.getDmsFileNumberCollection().map(fileNum => fileNum.toJSON()),
      c_evidence: allEvidenceData,
    });
    
    if (options.returnOnly) {
      return modelSaveData;
    } else {
      this.set(modelSaveData);
    }
  }
});