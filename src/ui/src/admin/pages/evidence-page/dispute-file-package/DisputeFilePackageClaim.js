import Marionette from 'backbone.marionette';
import DisputeClaimEvidencesView from '../../../components/dispute-claim/DisputeClaimEvidences';

export default Marionette.View.extend({
  template: _.template(`<div class="dispute-file-package-claim clearfix
    <%= noFilesReferenced ? 'not-file-referenced' : '' %>
    <%= noFilesConsidered ? 'not-file-considered' : '' %>
    <%= allFilesNotConsideredOrNotReferenced ? 'not-file-considered-or-referenced' : '' %>
    <%= isRemoved ? 'claim-removed' : '' %>"
    
  >
    <div class="dispute-file-package-claim-title"><%= claimTitle %></div>
    <div class="dispute-file-package-claim-evidences clearfix"></div>
  </div>`),

  regions: {
    evidenceDisplayRegion: '.dispute-file-package-claim-evidences'
  },

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'showRemoved', 'showDetailedNames', 'showSubmitterInfo', 'evidenceFilePreviewFn', 'fileDupTranslations', 'hideDups']);
  },

  onRender() {
    this.showChildView('evidenceDisplayRegion', new DisputeClaimEvidencesView({
      showThumbnails: this.showThumbnails,
      hideDups: this.hideDups,
      showRemoved: this.showRemoved,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      showArrows: false,
      showArbControls: true,
      showDetailedNames: _.isBoolean(this.showDetailedNames) ? this.showDetailedNames : true,
      showSubmitterInfo: this.showSubmitterInfo,
      fileDupTranslations: this.fileDupTranslations,
      collection: this.model.get('dispute_evidences')
    }));
  },

  templateContext() {
    let noFilesReferenced = true;
    let noFilesConsidered = true;
    let allFilesNotConsideredOrNotReferenced = true;

    this.model.get('dispute_evidences').each(function(disputeEvidence) {
      disputeEvidence.get('files').each(function(file) {
        const isReferenced = file.isReferenced();
        const isConsidered = file.isConsidered();
        if (isConsidered) {
          noFilesConsidered = false;
        }
        if (isReferenced) {
          noFilesReferenced = false;
        }
        if (isConsidered || isReferenced) {
          allFilesNotConsideredOrNotReferenced = false;
        }
      });
    });

    return {
      claimTitle: this.model.getClaimTitleWithCode(),
      noFilesReferenced,
      noFilesConsidered,
      allFilesNotConsideredOrNotReferenced,
      isRemoved: this.model.isRemoved()
    };
  }
});
