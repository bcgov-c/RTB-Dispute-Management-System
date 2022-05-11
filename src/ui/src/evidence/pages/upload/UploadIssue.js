import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ViewMixin from '../../../core/utilities/ViewMixin';
import UploadEvidenceCollectionContainerView from './UploadEvidenceCollectionContainerView';
import template from './UploadIssue_template.tpl';

const REQUIRED_EVIDENCE_HELP = `You appear to be missing recommended evidence for this claim. Click on "Add Files" below to upload your evidence.`;

const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  className() {
    return `da-upload-issue clearfix ${this.getOption('mode') === 'upload' && !this.hasUploadableFiles() ? 'hidden' : ''}`;
  },

  regions: {
    evidenceRegion: '.dispute-evidence-collection'
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'uploadModel', 'isOfficeUse', 'deriveEvidenceCategory', 'evidenceCategory', 'evidenceCode', 'evidenceCollection', 'claimCollection',
      'issueTypeTitle', 'issueTitle', 'modalAddFilesOptions', 'showEvidenceWarningPromise', 'enableRequiredEvidenceWarning']);

    let isMissingRequired = false;
    const standaloneEvidenceCodes = [configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE'), configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')].filter(a=>a);
    const requiredEvidence = this.model?.getAssociatedEvidenceConfig()?.filter(ev => ev.required && !standaloneEvidenceCodes.includes(ev.id));
    const uploadedEvidence = this.evidenceCollection.filter(evidence => evidence.getUploadedFiles().length);
    
    if (this.model) {
      isMissingRequired = requiredEvidence?.length && requiredEvidence?.filter(ev => !uploadedEvidence.find(evidence => evidence.getDescriptionCode() === ev.id && ev.id)).length;
    } else {
      isMissingRequired = !uploadedEvidence.length;
    }

    this.showRequiredEvidenceWarning = this.enableRequiredEvidenceWarning && isMissingRequired;

    this.listenTo(this.uploadModel, 'open:help', () => this.$('.upload-issue__help-icon:visible').trigger('click.rtb-help'));
  },

  getEvidenceViews() {
    const evidencesView = this.getChildView('evidenceRegion');
    const addedEvidencesView = evidencesView.getChildView('addedEvidenceRegion');
    const missingEvidencesView = evidencesView.getChildView('missingEvidenceRegion');
    const evidence_views = [];

    addedEvidencesView.children.each(function(view) {
      evidence_views.push(view);
    });
    missingEvidencesView.children.each(function(view) {
      evidence_views.push(view);
    });
    return evidence_views;
  },

  validateAndShowErrors() {
    const evidenceViews = this.getEvidenceViews();
    let is_valid = true;
    _.each(evidenceViews, function(evidenceView) {
      is_valid = is_valid & evidenceView.validateAndShowErrors();
    });
    return is_valid;
  },

  isOtherIssueType() {
    return !this.model || !this.model.get('claim_id');
  },

  hasUploadableFiles() {
    const pending_uploads = this.getOption('uploadModel').getPendingUploads();
    return _.find(pending_uploads, function(dispute_evidence_model) {
      // If either the claim ids matches or this is an "other issue" type, then proceed to check files
      if (this.isOtherIssueType()) {
        return dispute_evidence_model.isOtherUpload() && dispute_evidence_model.getReadyToUploadFiles().length;
      }

      if (this.model.get('claim_id') === dispute_evidence_model.get('claim_id')) {
        return dispute_evidence_model.getReadyToUploadFiles().length;
      }
    }, this);
  },

  onRender() {
    this.showChildView('evidenceRegion', new UploadEvidenceCollectionContainerView({
      isNonIssue: this.issueTypeTitle === 'Other',
      isOfficeUse: this.isOfficeUse,
      showEvidenceWarningPromise: this.showEvidenceWarningPromise,
      uploadModel: this.uploadModel,
      mode: this.mode,
      modalAddFilesOptions: this.modalAddFilesOptions,
      evidenceCollection: this.evidenceCollection,
      deriveEvidenceCategory: this.deriveEvidenceCategory,
      evidenceCategory: this.evidenceCategory,
      evidenceCode: this.evidenceCode,
      claimCollection: this.claimCollection,
      associatedClaim: this.model,
    }));

    ViewMixin.prototype.initializeHelp(this, REQUIRED_EVIDENCE_HELP, ['.da-upload-evidence-item']);
  },

  templateContext() {
    const issueTitle = this.issueTitle ? this.issueTitle : this.model.getClaimTitle();
    return {
      evidenceCollection: this.evidenceCollection,
      issueTypeTitle: this.issueTypeTitle || 'Claim',
      issueTitle: issueTitle ? issueTitle : `Issue code ${this.model.get('claim_code')}`,
      showRequiredEvidenceWarning: this.showRequiredEvidenceWarning,
    };
  }
});
