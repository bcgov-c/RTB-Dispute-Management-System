/**
 * @class core.components.claim.DisputeEvidenceCollection
 * @memberof core.components.claim
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import FileCollection from '../files/File_collection';

import DisputeEvidenceModel from './DisputeEvidence_model';

const configChannel = Radio.channel('config'),
  participantsChannel = Radio.channel('participants'),
  filesChannel = Radio.channel('files'),
  sessionChannel = Radio.channel('session');

export default Backbone.Collection.extend({
  model: DisputeEvidenceModel,

  claimId: null,
  remedyId: null,
  claimCode: null,

  comparator: 'description_category',

  // Will sync the claim collection here with any file descriptions required for a config item.
  // Will also fill any existing file descriptions from the API
  // options.skip_evidence_codes is a list of codes to ignore when filling / syncing this list
  // options.skip_remedy_id is a boolean to denote whether or not to add the remedy id into created DisputeEvidences.
  //   - By default, the first remedy id will be used, if skip_remedy_id != true
  syncModelDataWithDisputeClaim(disputeClaim, options) {
    if (!disputeClaim) {
      console.log(`[Error] No dispute claim provided, can't create adjoining dispute evidence`);
      return;
    }
    options = options || {}
    const skip_evidence_codes = options.skip_evidence_codes || null;
    const skip_remedy_id = options.skip_remedy_id || false;
      
    const claim_id = disputeClaim.claim.get('claim_id'),
      claim_code = disputeClaim.claim.get('claim_code'),
      claim_detail = disputeClaim.getApplicantsClaimDetail(),
      description_by = claim_detail ? claim_detail.get('description_by') : participantsChannel.request('get:primaryApplicant:id'),
      remedy = disputeClaim.getApplicantsRemedy(),
      remedy_id = remedy ? remedy.get('remedy_id') : null;

    this.claimId = claim_id;
    this.remedyId = remedy_id;
    this.claimCode = claim_code;


    const issue_config = disputeClaim.getClaimConfig();
    if (!issue_config) {
      console.log(`[Error] No config issue for `, disputeClaim);
      return;
    }

    const file_descriptions_for_claim = filesChannel.request('get:filedescriptions:claim', claim_id);

    const associatedEvidence = _.filter(issue_config.associatedEvidence, function(issue_evidence_config) {
      return _.isEmpty(skip_evidence_codes) || !_.contains(skip_evidence_codes, issue_evidence_config.id);
    });

    console.debug("associated ev", associatedEvidence);
    const self = this;
    _.each(associatedEvidence, function(issue_evidence_config) {
      const matchingModel = self.findWhere({ evidence_id: issue_evidence_config.id });
      if (matchingModel) {
        // If there is a matching evidence, update its requiredness and selection options
        matchingModel.set(_.extend({
            required: issue_evidence_config.required
          }, disputeClaim.isDirectRequest() ? { mustUploadNow: true } : {}));
      } else {
        const all_dispute_file_descriptions = filesChannel.request('get:filedescriptions'),
          matching_file_descriptions = all_dispute_file_descriptions.where({ claim_id: claim_id, description_code: issue_evidence_config.id }),
          evidence_config = configChannel.request('get:evidence', issue_evidence_config.id),
          matching_file_description = matching_file_descriptions && matching_file_descriptions.length ? matching_file_descriptions[0] : null;

        this.add(new DisputeEvidenceModel(_.extend({
          claim_id,
          description_by,
          evidence_id: issue_evidence_config.id,
          required: issue_evidence_config.required,
          title: evidence_config.title,
          category: evidence_config.category,
          file_description: matching_file_description,
          files: matching_file_description ? filesChannel.request('get:filedescription:files', matching_file_description) : null
        },
          skip_remedy_id ? {} : { remedy_id },
          disputeClaim.isDirectRequest() ? { mustUploadNow: true } : {}
        ), {silent: true}));

      }
    }, this);


    const EVIDENCE_CODE_OTHER_ISSUE = configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE');
    if (file_descriptions_for_claim) {
      // Now add any file descriptions not part of associated evidence
      _.each(file_descriptions_for_claim, function(file_description_model) {
        // If any file descriptions were already added as part of the associated evidence above, then continue
        if (this.find(model => model.get('file_description').id === file_description_model.id)) {
          return;
        }
        this.add(new DisputeEvidenceModel({
          claim_id: file_description_model.get('claim_id'),
          remedy_id: file_description_model.get('remedy_id'),
          description_by: file_description_model.get('description_by'),
          evidence_id: file_description_model.isIssueCustom() ? EVIDENCE_CODE_OTHER_ISSUE : file_description_model.get('description_code'),
          required: true,
          title: file_description_model.get('title'),
          category: file_description_model.get('description_category'),
          file_description: file_description_model
        }), {silent: true});
      }, this);
    }
  },

  reverseSortBy(sortByFunction) {
    return function(left, right) {
      var l = sortByFunction(left);
      var r = sortByFunction(right);

      if (l === void 0) return -1;
      if (r === void 0) return 1;

      return l < r ? 1 : l > r ? -1 : 0;
    };
  },

  createBlankEvidence(model_creation_params, options) {
    model_creation_params = model_creation_params || {};
    options = options || {};

    const disputeEvidenceModel = new DisputeEvidenceModel(_.extend({
      claim_id: this.claimId,
      description_by: sessionChannel.request('get:active:participant:id'),
      required: true,
      
      // Add an empty file collection, so this empty model can be used with "full:claim" responses
      files: new FileCollection()
    }, model_creation_params), options);

    if (!options.no_add) {
      this.add(disputeEvidenceModel);
    }
    return disputeEvidenceModel;
  },

  hasDisputeAccessFiles() {
    return this.any(function(dispute_evidence_model) {
      return dispute_evidence_model.hasDisputeAccessFiles();
    });
  },

  _getByConfigFileMethods(config_file_methods_list, options={}) {
    const matchingEvidence = this.filter(function(disputeEvidence) {
      return _.contains(_.map(config_file_methods_list, function(name) { return configChannel.request('get', name); }),
          disputeEvidence.get('file_description').get('file_method')) || 
          // Also include evidence where no selection was made, if option is passed in
          (options.include_empty ? !disputeEvidence.get('file_description').get('file_method') : false);
    });
    return options.ignore_hidden ? matchingEvidence.filter(e => !e.get('isHidden')) : matchingEvidence;
  },

  // Gets provided and missing FileDescription items
  getProvided(options={}) {
    return this._getByConfigFileMethods(['EVIDENCE_METHOD_UPLOAD_NOW'], options);
  },

  getProvideLater(options={}) {
    return this._getByConfigFileMethods(['EVIDENCE_METHOD_UPLOAD_LATER', 'EVIDENCE_METHOD_MAIL', 'EVIDENCE_METHOD_DROP_OFF'], options);
  },

  getCantProvide(options={}) {
    return this._getByConfigFileMethods(['EVIDENCE_METHOD_CANT_PROVIDE'], Object.assign({ include_empty: true }, options));
  },

  getMissing() {
    return this._getByConfigFileMethods(['EVIDENCE_METHOD_UPLOAD_LATER', 'EVIDENCE_METHOD_MAIL', 'EVIDENCE_METHOD_DROP_OFF', 'EVIDENCE_METHOD_CANT_PROVIDE'], { include_empty: true });
  },

  // Gets models which have a file description set to upload now, and also
  getFilesProvided(options) {
    options = options || {};
    return this.filter(function(disputeEvidence) {
      return (!options.no_custom || !disputeEvidence.isCustom()) && (options.required_only ? disputeEvidence.get('required') : true) &&
          (disputeEvidence.get('files') && disputeEvidence.get('files').filter(function(file) { return file.isUploaded(); }).length);
    });
  },

  getFilesMissing(options) {
    options = options || {};
    return this.filter(function(disputeEvidence) {
      return (!options.no_custom || !disputeEvidence.isCustom()) && (options.required_only ? disputeEvidence.get('required') : true) &&
          (!disputeEvidence.get('files') || !disputeEvidence.get('files').filter(function(file) { return file.isUploaded(); }).length);
    });
  },


  isValid() {
    return (typeof this.validate() === 'undefined');
  },

  validate() {
    this.validationError = null;

    const missing_evidence = this.filter(function(disputeEvidence) {
      const file_method = disputeEvidence.get('file_description').get('file_method');
      return !file_method || $.trim(file_method) === '' || file_method === '';
    });

    if (missing_evidence.length) {
      this.validationError = "Please enter an answer for all evidence";
      return this.validationError;
    }
  }

});
