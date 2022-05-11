/**
 * @class core.components.files.file-description.FileDescriptionModel
 * @memberof core.components.files.file-description
 * @augments core.components.model.CMModel
 */

import CMModel from '../../model/CM_model';
import Radio from 'backbone.radio';

const api_name = 'filedescription';

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const participantChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');

export default CMModel.extend({
  idAttribute: 'file_description_id',
  defaults: {
    file_description_id: null,

    title: null,
    claim_id: null,
    remedy_id: null,
    description: null,
    description_by: null,
    description_category: null,
    description_code: null,
    file_method: null,
    discussed: 0,
    decision_reference: 0,
    is_deficient: false,
    is_deficient_reason: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_POST_ONLY_ATTRS: [
    'claim_id',
    'remedy_id'
  ],

  API_SAVE_ATTRS: [
    'title',
    'description',
    'description_by',
    'description_category',
    'description_code',
    'file_method',
    'discussed',
    'decision_reference',
    'is_deficient',
    'is_deficient_reason'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${disputeChannel.request('get:id')}` : '');
  },

  isNotice() {
    return this.get('description_category') && this.get('description_category') === configChannel.request('get', 'EVIDENCE_CATEGORY_NOTICE');
  },

  isNonCustomIssueEvidence() {
    return this.isIssueEvidence() && !this.isIssueCustom();
  },

  isIssueCustom() {
    return this.isIssueEvidence() && this.get('description_code') === configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE');
  },

  isIssueEvidence() {
    return this.get('description_category') && this.get('description_category') === configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE');
  },

  isNonIssueEvidence() {
    return this.get('description_category') && this.get('description_category') === configChannel.request('get', 'EVIDENCE_CATEGORY_NON_ISSUE_EVIDENCE');
  },

  isEvidence() {
    return this.isIssueEvidence() || this.isNonIssueEvidence() || this.isTenancyAgreement() ||
        this.isMonetaryOrderWorksheet() || this.isBulkEvidence() ||
        (this.get('description_code') && this.get('description_code') === configChannel.request('get', 'SP_MIGRATED_NONISSE_EVIDENCE_CODE'));
  },

  isCustom() {
    return this.isIssueCustom() || this.isNonIssueCustom() || this.isNonIssueEvidence();
  },

  isNonIssueCustom() {
    return !this.isIssueEvidence() && this.get('description_code') === configChannel.request('get', 'CUSTOM_NON_ISSUE_NON_EVIDENCE_CODE');
  },

  isTenancyAgreement() {
    return this.get('description_code') && this.get('description_code') === configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE');
  },

  isMonetaryOrderWorksheet() {
    return this.get('description_code') && this.get('description_code') === configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE');
  },

  isBulkEvidence() {
    return this.get('description_category') && this.get('description_category') === configChannel.request('get', 'EVIDENCE_CATEGORY_BULK');
  },

  isLegacyServicePortal() {
    return this.get('description_category') && this.get('description_category') === configChannel.request('get', 'EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL');
  },

  isOtherUpload() {
    return !this.get('claim_id');
  },

  isFeeWaiverEvidence() {
    return this.get('description_category') === configChannel.request('get', 'EVIDENCE_CATEGORY_PAYMENT') &&
        $.trim(this.get('title')).toLowerCase().indexOf('fee waiver') !== -1;
  },

  getUploadedFiles() {
    return filesChannel.request('get:filedescription:files', this).filter(function(fileModel) {
      return fileModel.isUploaded();
    });
  },

  markAsDeficient(reason) {
    this.set(Object.assign({ is_deficient: true }, reason ? { is_deficient_reason: reason } : {}));
  },

  markNotDeficient() {
    this.set({ is_deficient: false, is_deficient_reason: null });
  },

  save(attrs, options) {
    options = options || {};
    
    // Make sure a valid description_by is always set, but allow nulls
    if (this.get('description_by') && !participantChannel.request('check:id', this.get('description_by'))) {
      this.set('description_by', sessionChannel.request('get:active:participant:id'), { silent: true });
    }

    if (this.get('description_by') === 0) {
      this.set('description_by', null, {silent: true});
    }

    if (this.get('remedy_id') === 0) {
      this.set('remedy_id', null, {silent: true});
    }

    const dfd = $.Deferred();
    CMModel.prototype.save.call(this, attrs, options).done(response => {
      // If "is_deficient" was updated, make sure to update the cached lists of file descriptions / deficient ones
      filesChannel.request('update:filedescriptions:deficient');
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  // Will fully delete the file description and all files in this model's FileCollection, including LinkFiles
  fullDelete() {
    const allDeletes = [];
    filesChannel.request('get:filedescription:files', this).each((fileModel) => {
      const deleteXhr = _.bind(filesChannel.request, filesChannel, 'delete:file', fileModel);
      allDeletes.push(deleteXhr);
    });

    const dfd = $.Deferred();
    $.whenAll( allDeletes.map(xhr => xhr()) ).done(() => {
      this.destroy().done(dfd.resolve).fail(dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
  }

});
