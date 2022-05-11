/**
 * This is the main abstraction for working with evidence.  Wraps a single {@link core.components.files.file-description.FileDescriptionModel|FileDescriptionModel}
 * but also has references to containing files and links to associated issue configs.
 * @class core.components.claim.DisputeClaimEvidenceModel
 * @memberof core.components.claim
 * @augments Backbone.Model
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputModel from '../../../core/components/input/Input_model';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import FileDescriptionModel from '../../../core/components/files/file-description/FileDescription_model';

const configChannel = Radio.channel('config');
const participantChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');

export default Backbone.Model.extend({

  defaults: {
    claim_id: null,
    remedy_id: null,
    description_by: null,

    claim_code: null,
    evidence_id: null,

    // UI-only values:
    required: false,
    mustUploadNow: false,
    mustProvideNowOrLater: false,
    isHidden: false,
  },

  OTHER_EVIDENCE_DEFAULT_TITLE: '<i>Please add a title and files</i>',

  initialize(dispute_claim_data) {
    dispute_claim_data = dispute_claim_data || {};
    
    const existing_file_description = this.get('file_description');
    if (!existing_file_description) {
      this.set('file_description', new FileDescriptionModel({
        file_method: dispute_claim_data.file_method,
        claim_id: dispute_claim_data.claim_id,
        remedy_id: dispute_claim_data.remedy_id,
        description_by: dispute_claim_data.description_by,
        description_code: dispute_claim_data.evidence_id,
        description_category: dispute_claim_data.category,
        title: dispute_claim_data.title || dispute_claim_data.title === '' ? dispute_claim_data.title : this.OTHER_EVIDENCE_DEFAULT_TITLE,
      }));
    }

    if (!this.get('helpHtml')) {
      const evidence_config = configChannel.request('get:evidence', dispute_claim_data.evidence_id);
      if (evidence_config) {
        this.set('helpHtml', evidence_config.helpHtml);
      }
    }

    const file_description = this.get('file_description');
    if (!this.get('title')) {
      this.set('title', file_description.get('title'));
    }

    if (!file_description.get('title')) {
      file_description.set('title', this.get('title'));
    }

    this.listenTo(file_description, 'show:upload', function() {
      this.trigger('show:upload', ...arguments);
    }, this);

    // Add an "update" event that will bubble up on file or file_description change
    this.listenTo(file_description, 'change', function() {
      this.trigger('update:evidence');
    }, this);


    const filesUpdateFn = _.bind(function() {
      this.trigger('update:evidence');
    }, this);
    if (this.get('files')) {
      this.stopListening(this.get('files'), 'change', filesUpdateFn);
      this.listenTo(this.get('files'), 'change', filesUpdateFn);
    } else {
      this.on('change:files', function(model, files) {
        this.stopListening(files, 'change', filesUpdateFn);
        this.listenTo(files, 'change', filesUpdateFn);
      }, this);
    }

    if (dispute_claim_data.files && !this.get('files')) {
      this.set('files', dispute_claim_data.files);
    }

    this.createSubModels();
    this.loadDerivedData();
  },

  loadDerivedData(options) {
    options = options || {};

    if (!options.force_refresh && !this.get('files')) {
      this.set('files', filesChannel.request('get:filedescription:files', this.get('file_description')));
    }
    
    const description_by = this.get('file_description').get('description_by');
    this.set('participant_model', description_by ? participantChannel.request('get:participant', description_by) : null);

    const participant_model = this.get('participant_model');
    this.set({
      isApplicant: participant_model ? participant_model.isApplicant() : false,
      isRespondent: participant_model ? participant_model.isRespondent() : false
    });
  },

  createSubModels() {
    const isOtherIssueEvidence =  this.getDescriptionCode() === configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE');
    const evidenceMethodDisplays = configChannel.request('get', 'EVIDENCE_METHODS_DISPLAY');
    const evidenceSelectionOptions = this.get('mustUploadNow') ?
        [
          'EVIDENCE_METHOD_UPLOAD_NOW',
          ...(this.get('required') ? [] : ['EVIDENCE_METHOD_CANT_PROVIDE'])
        ] :
        (this.get('mustProvideNowOrLater') || isOtherIssueEvidence) ? // Other issue evidence is ALWAYS provide now or later
        [
          'EVIDENCE_METHOD_UPLOAD_NOW',
          'EVIDENCE_METHOD_UPLOAD_LATER',
          'EVIDENCE_METHOD_DROP_OFF',
        ] :
        [
          'EVIDENCE_METHOD_UPLOAD_NOW',
          'EVIDENCE_METHOD_UPLOAD_LATER',
          'EVIDENCE_METHOD_MAIL',
          'EVIDENCE_METHOD_DROP_OFF',
          'EVIDENCE_METHOD_CANT_PROVIDE'
        ];

    const selectedActionPicklistValues = _.map(evidenceSelectionOptions, function(configName) {
      const configValue = configChannel.request('get', configName);
      return { value: String(configValue), text: evidenceMethodDisplays[configValue] };
    });

    if (this.get('mustUploadNow') && this.get('required')) {
      selectedActionPicklistValues[0].text = 'I will upload it now (required)';
    }

    const file_description = this.get('file_description'),
      file_method = $.trim(file_description.get('file_method'));

    this.set('selectedActionPicklist', new DropdownModel({
      optionData: selectedActionPicklistValues,
      defaultBlank: true,
      labelText: file_description.get('title') ? file_description.get('title') : this.OTHER_EVIDENCE_DEFAULT_TITLE,
      helpHtml: this.get('helpHtml') || null,
      errorMessage: 'Please select an option',
      cssClass: this.get('required') ? '' : 'optional-input',
      required: true,
      value: file_method && _.contains(_.pluck(selectedActionPicklistValues, 'value'), file_method) ? file_method : null,
      apiMapping: 'file_method'
    }));


    this.set('typeModel', new DropdownModel({
      labelText: 'File type',
      disabled: false,
      required: false,
      defaultBlank: true,
      errorMessage: 'Please select a file type',
      value: null
    }));

    this.set('titleModel', new InputModel({
      labelText: 'Short evidence name',
      disabled: this.isCustom() ? false : true,
      maxLength: configChannel.request('get', 'FILE_TITLE_MAX_LENGTH'),
      required: true,
      errorMessage: 'Please enter a name for this evidence',
      value: file_description.get('title'),
      apiMapping: 'title'
    }));

    this.set('descriptionModel', new TextareaModel({
      labelText: 'Details and description',
      max: configChannel.request('get', 'EVIDENCE_DESCRIPTION_MAX'),
      countdown: true,
      required: true,
      errorMessage: 'Please enter a description of the evidence',
      value: file_description.get('description') ? file_description.get('description') : null,
      apiMapping: 'description'
    }));
  },

  _getItemsFromEvidenceConfig(items) {
    const EVIDENCE_CONFIG = configChannel.request('get', 'evidence_config');
    return _.map(items, function(evidence_id) {
      let match = null;
      if (_.has(EVIDENCE_CONFIG, evidence_id)) {
        match = EVIDENCE_CONFIG[evidence_id];
      } 
      if (!match) {
        console.log(`[Warning] Couldn't find a config for item ${evidence_id}`);
        return {};
      }
      return { value: evidence_id, text: match.title };
    });
  },


  getOtherUploadFileTypeOptions() {
    return this._getItemsFromEvidenceConfig(['10']);
  },

  getOfficeUploadFileTypeOptions() {
    return this._getItemsFromEvidenceConfig(['99', '9']);
  },


  resetFromFileDescription() {
    const file_description = this.get('file_description');

    this.get('selectedActionPicklist').set({
      labelText: file_description.get('title') ? file_description.get('title') : this.OTHER_EVIDENCE_DEFAULT_TITLE,
      value: file_description.get('file_method') ? String(file_description.get('file_method')) : null
    });

    this.get('typeModel').set({
      value: file_description.get('title')
    });

    this.get('titleModel').set({
      value: file_description.get('title')
    });

    this.get('descriptionModel').set({
      value: file_description.get('description')
    });
  },


  isNew() {
    return this.get('file_description').isNew();
  },

  save(attrs, options) {
    const dfd = $.Deferred();
    const fileDescription = this.get('file_description');
    fileDescription.save(attrs, options).done(response => {
      // Add the file description to any cached lists
      filesChannel.request('add:filedescription', fileDescription);
      // This is to parse the new UI values from the saved file description
      this.resetFromFileDescription();
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  destroy(options) {
    const dfd = $.Deferred();
    const onDestroyCompleteFn = _.bind(function(response) {
      if (this.collection) {
        this.collection.remove(this);
      }
      dfd.resolve(response);
    }, this);
    const destroyPromise = this.get('file_description').destroy(options);
    if (destroyPromise) {
      destroyPromise.done(onDestroyCompleteFn).fail(dfd.reject);
    } else {
      onDestroyCompleteFn();
    }
    return dfd.promise();
  },

  // Resets the picklist, title and description back to their original API values
  resetModel() {
    this.get('file_description').resetModel();
    this.resetFromFileDescription();
    this.resetFiles();
  },

  // Cleans up any files that were not uploaded
  resetFiles() {
    const files = this.get('files');
    if (files && files.length) {
      files.resetCollection();
    }
  },

  hasUploadedFiles() {
    return this.getUploadedFiles().length > 0;
  },

  getUploadedFiles() {
    return this.get('files').getUploaded();
  },

  getReadyToUploadFiles() {
    return this.get('files').getReadyToUpload();
  },

  // NOTE: This should be called and used to save information from internal data to the model
  saveInternalDataToModel() {
    const file_description_api_updates = _.extend({},
        this.get('selectedActionPicklist').getPageApiDataAttrs(),
        this.get('titleModel').getPageApiDataAttrs(),
        this.get('descriptionModel').getPageApiDataAttrs());

    this.get('file_description').set(file_description_api_updates);
  },

  needsApiUpdate() {
    return this.get('file_description').needsApiUpdate();
  },

  getApiChangesOnly() {
    return this.get('file_description').getApiChangesOnly();
  },

  hasDisputeAccessFiles() {
    return this.get('files').any(function(file_model) {
      return file_model.get('disputeAccessSessionId');
    });
  },

  getDisputeAccessFiles() {
    return this.get('files').filter(function(file_model) { return file_model.isDisputeAccess(); });
  },

  markAsDeficient(reason) {
    return this.get('file_description').markAsDeficient(reason);
  },

  isNonCustomIssueEvidence() {
    return this.get('file_description').isNonCustomIssueEvidence();
  },

  isParticipantRemoved() {
    return this.get('participant_model') && this.get('participant_model').isRemoved();
  },

  isParticipantDeleted() {
    return this.get('participant_model') && this.get('participant_model').isDeleted();
  },

  isEvidence() {
    return this.get('file_description').isEvidence();
  },

  isBulkEvidence() {
    return this.get('file_description').isBulkEvidence();
  },

  isIssueCustom() {
    return this.get('file_description').isIssueCustom();
  },

  isCustom() {
    return this.get('file_description').isCustom();
  },

  isNonIssueCustom() {
    return this.get('file_description').isNonIssueCustom();
  },

  isIssueEvidence() {
    return this.get('file_description').isIssueEvidence();
  },

  isTenancyAgreement() {
    return this.get('file_description').isTenancyAgreement();
  },

  isMonetaryOrderWorksheet() {
    return this.get('file_description').isMonetaryOrderWorksheet();
  },

  isLegacyServicePortal() {
    return this.get('file_description').isLegacyServicePortal();
  },

  isOtherUpload() {
    return this.get('file_description').isOtherUpload();
  },

  // Clears/nulls the file method and descriptions
  clearData() {
    this.get('file_description').set({
      file_method: 0,
      description: null
    });
  },

  getId() {
    return this.get('file_description').id;
  },

  getTitle() {
    return this.get('file_description').get('title');
  },
  
  getDescription() {
    return this.get('file_description').get('description');
  },

  getFileMethod() {
    return this.get('file_description').get('file_method');
  },

  getDescriptionCode() {
    return this.get('file_description').get('description_code');
  },

  getDescriptionCategory() {
    return this.get('file_description').get('description_category');
  }
});
