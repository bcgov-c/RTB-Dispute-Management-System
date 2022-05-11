import Marionette from 'backbone.marionette';

import DisputeClaimEvidenceCollectionView from './DisputeClaimEvidences';
import template from './DisputeStandaloneEvidence_template.tpl';

export default Marionette.View.extend({
  template,
  className: 'clearfix',

  regions: {
    evidenceRegion: '.review-claim-evidence'
  },

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails']);
  },

  onRender() {    
    this.showChildView('evidenceRegion', new DisputeClaimEvidenceCollectionView({
      collection: this.getOption('supportingEvidenceCollection'),
      showThumbnails: this.showThumbnails
    }));
  },

  templateContext: {
    headerHtml: 'Other supporting information'
  }

});