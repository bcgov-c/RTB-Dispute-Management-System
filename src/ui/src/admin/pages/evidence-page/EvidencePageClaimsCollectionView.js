import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../components/context-container/ContextContainer';
import DisputeClaimView from '../../components/dispute-claim/DisputeClaim';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

const EvidencePageClaimView = Marionette.View.extend({
  template: _.template(`<div class="
      <%= noFilesReferenced ? 'not-file-referenced' : '' %>
      <%= noFilesConsidered ? 'not-file-considered' : '' %>
      <%= isRemoved ? 'claim-removed' : '' %>"
    >
      <div class="evidence-page-claim-with-menu">
    </div>`),

  className: 'evidence-page-claim',

  regions: {
    claimWithMenu: '.evidence-page-claim-with-menu'
  },

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'evidenceFilePreviewFn', 'unitCollection', 'fileDupTranslations']);

    const uploadedFiles = this.model.getUploadedFiles();
    this._hasUploadedFiles = uploadedFiles.length;
    this._fileCountDisplay = `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'}`;
    this._totalFileSizeDisplay = Formatter.toFileSizeDisplay(_.reduce(uploadedFiles, function(memo, file) { return memo + file.get('file_size'); }, 0));

    this.model.get('dispute_evidences').each(function(disputeEvidence) {
      const files = disputeEvidence.get('files');
      this.stopListening(files, 'change:file_referenced');
      this.listenTo(files, 'change:file_referenced', (fileModel) => {
        this.render();
        this.model.trigger('change:file_referenced', fileModel);
      });
      this.stopListening(files, 'change:file_considered');
      this.listenTo(files, 'change:file_considered', (fileModel) => {
        this.render();
        this.model.trigger('change:file_considered', fileModel);
      });
    }, this);
  },

  onRender() {
    const isSupportingEvidence = this.model.isSupportingEvidence();
    const disputeModel = disputeChannel.request('get');
    this.showChildView('claimWithMenu', ContextContainer.withContextMenu({
      wrappedView: new DisputeClaimView({
        model: this.model,
        showArrows: true,
        showArbControls: true,
        hideIssueContent: true,
        showThumbnails: this.showThumbnails,
        evidenceFilePreviewFn: this.evidenceFilePreviewFn,
        unitCollection: this.unitCollection,
        fileDupTranslations: this.fileDupTranslations,
        hideDups: this.hideDups,
      }),
      titleDisplay: this.model.getClaimTitleWithCode(),
      menu_title: isSupportingEvidence ? ' ' : `Issue ID ${this.model.claim.get('claim_id')}`,
      menu_model: this.model,
      menu_states: {
        default: this._hasUploadedFiles ? [{ name: `Download All (${this._fileCountDisplay}, ${this._totalFileSizeDisplay})`, event: 'download:all' }] : []
      },
      cssClass: this.model.isSupportingEvidence() ? 'dispute-claim-supporting' : null,
      disputeModel,
      collapseHandler: SessionCollapse.createHandler(disputeModel, 'Evidence', 'claims', isSupportingEvidence ? 'supporting' : this.model.id),
    }));
  },

  templateContext() {
    const disputeEvidences = this.model.get('dispute_evidences');
    return {
      noFilesReferenced: !disputeEvidences.any(function(disputeEvidence) { return disputeEvidence.get('files').any(function(file) { return file.isReferenced(); }); }),
      noFilesConsidered: !disputeEvidences.any(function(disputeEvidence) { return disputeEvidence.get('files').any(function(file) { return file.isConsidered(); }); }),
      isRemoved: this.model.isRemoved()
    };
  }
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: EvidencePageClaimView,

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'evidenceFilePreviewFn', 'fileDupTranslations', 'hideDups', 'unitCollection']);
  },

  filter(model) {
    // If it is the "supporting evidence" claim, make sure to only show if evidence exists
    //const disputeEvidences = model.get('dispute_evidences');
    //return model.isNew() ? disputeEvidences && disputeEvidences.length : true;
    return model.isNew() ? model.get('dispute_evidences').any(disputeEvidence => disputeEvidence.get('files').hasUploaded()) : true;
  },

  childViewOptions() {
    return {
      showThumbnails: this.showThumbnails,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
    };
  },

  viewComparator(child) {
    const claimId = child.get('claim_id');
    const matchingUnit = this.unitCollection && this.unitCollection.find(unit => unit.get('issue_id') === claimId);
    return this.unitCollection ?
      (matchingUnit ? matchingUnit.get('unit_id') : Number.MAX_SAFE_INTEGER)
      : claimId;
  },

});
