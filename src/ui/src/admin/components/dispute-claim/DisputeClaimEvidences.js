import Marionette from 'backbone.marionette';
import DisputeClaimEvidenceView from './DisputeClaimEvidence';

const EmptyClaimEvidenceView = Marionette.View.extend({
  template: _.template(`<div class="standard-list-empty">No evidence added</div>`)
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: DisputeClaimEvidenceView,
  emptyView: EmptyClaimEvidenceView,

  className: 'dispute-issue-evidence-items',

  initialize(options) {
    this.mergeOptions(options, ['showArrows', 'showArbControls', 'showThumbnails', 'showRemoved', 'showDetailedNames',
        'showSubmitterInfo', 'evidenceFilePreviewFn', 'unitCollection', 'fileDupTranslations', 'hideDups']);

    // Default some options to true
    if (!_.isBoolean(this.showArrows)) {
      this.showArrows = true;
    }
    if (!_.isBoolean(this.showSubmitterInfo)) {
      this.showSubmitterInfo = true;
    }

    if (!_.isBoolean(this.showThumbnails)) {
      this.showThumbnails = false;
    }

    if (!_.isBoolean(this.showRemoved)) {
      this.showRemoved = false;
    }

  },

  childViewOptions() {
    return {
      showThumbnails: this.showThumbnails,
      hideDups: this.hideDups,
      showRemoved: this.showRemoved,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      showArrows: this.showArrows,
      showArbControls: this.showArbControls,
      showDetailedNames: this.showDetailedNames,
      showSubmitterInfo: this.showSubmitterInfo,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations
    };
  }
});
