import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';

//import ComposerInstanceCollection from '../../../admin/components/composer/ComposerInstance_collection';
import OutcomeDocGroupCollection from './OutcomeDocGroup_collection';
import DocRequestCollection from './doc-requests/DocRequest_collection';

const api_load_all_groups = 'disputeoutcomedocgroups';
const api_load_all_requests = 'outcomedocrequests/outcomedocrequests';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');

const DocumentsManager = Marionette.Object.extend({
  channelName: 'documents',

  radioRequests: {
    'get:all': 'getAllOutcomeDocGroups',
    'get:group': 'getOutcomeDocGroup',
    'get:outcomedoc:from:file': 'getOutcomeDocFileFromFile',
    'get:participant:deliveries': 'getOutcomeDocDeliveryModelsForParticipant',
    'get:requests': 'getAllOutcomeDocRequests',
    'get:fileTypes:deliveredBy': 'getFileTypesFromDeliveredByCode',

    'config:all:groups': 'getConfigAllOutcomeDocGroups',
    'config:group': 'getConfigOutcomeDocGroup',

    'config:all:files': 'getConfigAllOutcomeDocFiles',
    'config:files': 'getConfigRulesOutcomeDocFiles',
    'config:file': 'getConfigOutcomeDocFile',

    'create:deliveries': 'createAssociatedDeliveriesForDocFile',

    'create:composer': 'createComposerInstance',
    'get:composer': 'getComposerInstance',
    'delete:composer': 'deleteComposerInstance',
    refresh: 'loadAllOutcomeDocGroups',

    'load': 'loadAllOutcomeDocGroups',
    'load:requests': 'loadOutcomeDocRequests',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',

    clear: 'clearInternalData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current amendment data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this AmendmentManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.allOutcomeDocGroups = cache_data.allOutcomeDocGroups;
    this.allDocRequests = cache_data.allDocRequests;
    //this.composerInstanceCollection = cache_data.composerInstanceCollection;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      allOutcomeDocGroups: this.allOutcomeDocGroups,
      allDocRequests: this.allDocRequests,
      //composerInstanceCollection: this.composerInstanceCollection
    };
  },

  initialize() {
    this.cached_data = {};
    this.allOutcomeDocGroups = new OutcomeDocGroupCollection();
    this.allDocRequests = new DocRequestCollection();
    //this.composerInstanceCollection = new ComposerInstanceCollection();

    this._configOutcomeDocGroups = {};
    this._configOutcomeDocFiles = {};
  },

  /**
   * Clears the current documents in memory.
   * Does not flush any cached data.
   */
  clearInternalData() {
    this.allOutcomeDocGroups = new OutcomeDocGroupCollection();
    this.allDocRequests = new DocRequestCollection();

    //this.composerInstanceCollection = new ComposerInstanceCollection();
  },

  loadAllOutcomeDocGroups(dispute_guid, options={}) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:all outcome doc groups`);
      return;
    }
    const defaultIndex = 0;
    const defaultCount = 999990;
    const dfd = $.Deferred();
    const params = $.param(_.extend({
      index: defaultIndex,
      count: defaultCount
    }));

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_all_groups}/${dispute_guid}?${params}`
    }).done(response => {
      const outcomeDocGroupCollection = new OutcomeDocGroupCollection(response);
      if (!options.no_cache) this.allOutcomeDocGroups = outcomeDocGroupCollection
      dfd.resolve(!options.no_cache ? this.allOutcomeDocGroups : outcomeDocGroupCollection);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadOutcomeDocRequests(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:requests outcome doc groups`);
      return;
    }
    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_all_requests}/${dispute_guid}`
    }).done(response => {
      this.allDocRequests.reset(response);
      dfd.resolve(this.allDocRequests);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadFromDisputeAccessResponse(response=[]) {
    const { outcome_doc_groups, outcome_doc_requests } = response;
    
    this.allDocRequests.reset(outcome_doc_requests || []);

    this.allOutcomeDocGroups = new OutcomeDocGroupCollection(null);
    (outcome_doc_groups || []).forEach(outcomeGroupData => {
      const groupModel = this.allOutcomeDocGroups.add({
        outcome_doc_group_id: outcomeGroupData.outcome_doc_group_id,
        doc_completed_date: outcomeGroupData.doc_completed_date,
        created_by: outcomeGroupData.associated_id,
        created_by_role_id: outcomeGroupData.associated_role_group_id,
      });

      (outcomeGroupData.outcome_doc_files || []).forEach(outcomeFileData => {
        // Only load/parse files which contain CCR-able doc files having an uploaded file
        const fileConfig = this.getConfigOutcomeDocFile(outcomeFileData.file_type);
        const canRequestCCR = fileConfig.can_request_correction || fileConfig.can_request_clarification || fileConfig.can_request_review;
        if (outcomeFileData.file_id && canRequestCCR) {
          groupModel.createOutcomeFile({
            outcome_doc_file_id: outcomeFileData.outcome_doc_file_id,
            file_title: outcomeFileData.file_title,
            file_acronym: outcomeFileData.file_acronym,
            file_type: outcomeFileData.file_type,
            file_id: outcomeFileData.file_id
          }, { add: true });
        }
      });
    });
    const emptyDocGroups = this.allOutcomeDocGroups.filter(group => !group.getOutcomeFiles().length);
    this.allOutcomeDocGroups.remove(emptyDocGroups, { silent: true });
  },

  getFileTypesFromDeliveredByCode(deliveredByCode) {
    const filesConfig = this.getConfigAllOutcomeDocFiles();
    return Object.keys(filesConfig)
      .filter(typeId => {
        const configData = filesConfig[typeId];
        return configData.delivered_by === deliveredByCode;
      });
  },
  
  getAllOutcomeDocRequests() {
    return this.allDocRequests;
  },


  getAllOutcomeDocGroups() {
    return this.allOutcomeDocGroups;
  },

  getOutcomeDocGroup(outcome_doc_group_id) {
    return this.allOutcomeDocGroups.findWhere({ outcome_doc_group_id });
  },

  getConfigAllOutcomeDocGroups() {
    if (_.isEmpty(this._configOutcomeDocGroups)) {
      this._configOutcomeDocGroups = configChannel.request('get', 'outcome_doc_groups') || {};
    }
    return this._configOutcomeDocGroups;
  },

  getConfigOutcomeDocGroup(outcome_doc_group_config_id) {
    const config = this.getConfigAllOutcomeDocGroups();
    return _.has(config, outcome_doc_group_config_id) ? config[outcome_doc_group_config_id] : {};
  },

  getConfigAllOutcomeDocFiles() {
    if (_.isEmpty(this._configOutcomeDocFiles)) {
      this._configOutcomeDocFiles = configChannel.request('get', 'outcome_docs') || {};
    }
    return this._configOutcomeDocFiles;
  },

  getConfigRulesOutcomeDocFiles(dispute, hearing) {
    const filesConfig = this.getConfigAllOutcomeDocFiles();
    const process = dispute?.getProcess();
    const linkType = hearing?.getHearingLinkType();
    const subType = dispute?.get('dispute_sub_type');
    const creationMethod = dispute?.get('creation_method');

    return Object.keys(filesConfig)
      // Remove any non-matching files from return
      .filter(fileId => {
        const configData = filesConfig[fileId];
        const matchingProcess = (configData.processes || []).includes(process);
        const matchingLinkType = (configData.link_types || []).includes(linkType);
        const matchingDisputeSubType = (configData.dispute_sub_types || []).includes(subType);
        const matchingCreationMethod = (configData.creation_methods || []).includes(creationMethod);
        return matchingProcess && matchingLinkType && matchingDisputeSubType && matchingCreationMethod;
      })
      // Turn back into an object and return
      .reduce((obj, key) => {
        obj[key] = filesConfig[key];
        return obj;
      }, {});
  },

  getConfigOutcomeDocFile(outcome_doc_file_config_id) {
    const config = this.getConfigAllOutcomeDocFiles();
    return _.has(config, outcome_doc_file_config_id) ? config[outcome_doc_file_config_id] : {};
  },

  createAssociatedDeliveriesForDocFile(outcome_doc_file_model) {
    const applicants = participantsChannel.request('get:applicants');
    const respondents = participantsChannel.request('get:respondents');

    _.union(applicants.models, respondents.models).forEach(participant => {
      if (!outcome_doc_file_model.getParticipantDelivery(participant)) {
        outcome_doc_file_model.createDelivery({
          participant_id: participant.get('participant_id')
        }, { add: true });
      }
    });
  },

  /* Performs a lookup on a DMS FileModel object to see which outcome doc file it is a part of */
  getOutcomeDocFileFromFile(fileModel) {
    if (!fileModel || !fileModel.id) return;

    let matchingDocFileModel;
    this.allOutcomeDocGroups.forEach(group => {
      if (matchingDocFileModel) return;
      matchingDocFileModel = group.getOutcomeFiles().find(outcomeFile => outcomeFile.get('file_id') === fileModel.id);
    });
    
    return matchingDocFileModel || null;
  },

  getOutcomeDocDeliveryModelsForParticipant(participantId) {
    const deliveries =[]
    this.allOutcomeDocGroups.forEach(group => {
      group.getOutcomeFiles().find(outcomeFile => {
        outcomeFile.getDeliveries().forEach(d => {
          if (d.get('participant_id') === participantId) deliveries.push(d);
        });
      });
    });
    return deliveries;
  },


  /* Document Composer Methods
  TO BE REMOVED?
  createComposerInstance(outcome_doc_file_model) {
    if (!outcome_doc_file_model) {
      console.log(`[Error] Missing required field "outcome_doc_file_model" for creating a ComposerInstance`);
      return;
    }
    const outcome_doc_group_model = this.allOutcomeDocGroups.findWhere({
      outcome_doc_group_id: outcome_doc_file_model.get('outcome_doc_group_id')
    });
    return this.composerInstanceCollection.create({
      outcome_doc_group_model,
      outcome_doc_file_model
    });
  },

  getComposerInstance(instanceId) {
    const composerInstance = this.composerInstanceCollection.get(instanceId);
    if (!composerInstance) {
      console.log(`[Warning] Couldn't find a composer instance for id ${instanceId}`);
      return;
    }
    return composerInstance;
  },

  deleteComposerInstance(composerInstance) {
    if (!composerInstance || !this.composerInstanceCollection.get(composerInstance)) {
      console.log(`[Warning] Couldn't find search`, composerInstance, this.composerInstanceCollection);
    }
    this.composerInstanceCollection.remove(composerInstance);
  }
  */

});

_.extend(DocumentsManager.prototype, UtilityMixin);
const DocumentsManagerInstance = new DocumentsManager();
export default DocumentsManagerInstance;
