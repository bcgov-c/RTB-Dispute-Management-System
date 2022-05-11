import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../components/context-container/ContextContainer';
import DisputeFilePackageClaimView from './dispute-file-package/DisputeFilePackageClaim';

const disputeChannel = Radio.channel('dispute');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const EmptyEvidencePartyView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="dispute-file-package">There is currently no evidence on this dispute file</div>`)
});

const WrappedEvidencePartyView = Marionette.View.extend({
  template: _.template('<div class="evidence-page-party-claim-evidence"></div>'),
  regions: {
    claimEvidenceRegion: '.evidence-page-party-claim-evidence',
  },

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'evidenceFilePreviewFn', 'fileDupTranslations', 'hideDups']);
  },

  onMenuDownloadAll() {
    const onContinueFn = (modalView) => {
      modalView.close();
      filesChannel.request('download:files', this.model.getFilesForParty().filter(f => f.isUploaded()));
    };

    filesChannel.request('show:download:modal', onContinueFn, { title: 'Download All Evidence' });
  },

  onRender() {
    this.showChildView('claimEvidenceRegion', new Marionette.CollectionView({
      childView: DisputeFilePackageClaimView,
      collection: this.model.getDisputeClaims(),
      childViewOptions: {
        showThumbnails: this.showThumbnails,
        evidenceFilePreviewFn: this.evidenceFilePreviewFn,
        showArrows: true,
        showArbControls: true,
        showDetailedNames: false,
        showSubmitterInfo: false,
        fileDupTranslations: this.fileDupTranslations,
        hideDups: this.hideDups,
      }
    }));
  }
});

const EvidencePartyView = Marionette.View.extend({
  template: _.template(`<div class="
    <%= noFilesReferenced ? 'not-file-referenced' : '' %>
    <%= noFilesConsidered ? 'not-file-considered' : '' %>
    <%= allFilesNotConsideredOrNotReferenced ? 'not-file-considered-or-referenced' : '' %>
    <%= isRemoved ? 'claim-removed' : '' %>"
  >
    <div class="evidence-page-party-with-menu"></div>
  </div>`),

  className: 'evidence-page-party',

  regions: {
    partyWithMenu: '.evidence-page-party-with-menu'
  },

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'evidenceFilePreviewFn', 'fileDupTranslations', 'hideDups']);

    this.matchingUnit = this.model.get('matchingUnit');
    const arrowIconHtml = `<div class="file-package-title-arrow ${this.model.isApplicant() ? 'applicant-upload' : (this.model.isRespondent() ? 'respondent-upload' : '')}"></div>`;
    this._partyTitleDisplay = `${arrowIconHtml}&nbsp;${this.matchingUnit ? `<b>${this.matchingUnit.getUnitNumDisplay()}: </b>` : ''}${this.model.getContactName()}`;
    
    const filesForParty = this.model.getFilesForParty();
    this._hasUploadedFiles = filesForParty.filter(f => f.isUploaded()).length;
    this._fileCountDisplay = `${filesForParty.length} file${filesForParty.length === 1 ? '' : 's'}`;
    this._totalFileSizeDisplay = Formatter.toFileSizeDisplay(_.reduce(filesForParty, function(memo, file) { return memo + file.get('file_size'); }, 0));
    
    this.setupListeners();
  },

  setupListeners() {
    this.model.getDisputeClaims().each(function(claim) {
      claim.get('dispute_evidences').each(function(disputeEvidence) {
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
    }, this);
  },

  onRender() {
    this.showChildView('partyWithMenu', ContextContainer.withContextMenu({
      wrappedView: new WrappedEvidencePartyView({
        model: this.model,
        showThumbnails: this.showThumbnails,
        evidenceFilePreviewFn: this.evidenceFilePreviewFn,
        fileDupTranslations: this.fileDupTranslations,
        hideDups: this.hideDups,
      }),
      titleDisplay: this._partyTitleDisplay,
      menu_title: `Participant ID ${this.model.get('participantModel').id}`,
      menu_model: this.model.get('participantModel'),
      menu_states: {
        default: this._hasUploadedFiles ? [{ name: `Download All (${this._fileCountDisplay}, ${this._totalFileSizeDisplay})`, event: 'download:all' }] : []
      },
      menu_events: [],
      disputeModel: disputeChannel.request('get')
    }));
  },

  templateContext() {
    const claims = this.model.getDisputeClaims();
    const participantModel = this.model.get('participantModel');
    return {
      noFilesReferenced: !claims.any(function(claim) { return claim.get('dispute_evidences').any(function(disputeEvidence) { return disputeEvidence.get('files').any(function(file) { return file.isReferenced(); }); }); }),
      noFilesConsidered: !claims.any(function(claim) { return claim.get('dispute_evidences').any(function(disputeEvidence) { return disputeEvidence.get('files').any(function(file) { return file.isConsidered(); }); }); }),
      allFilesNotConsideredOrNotReferenced: claims.all(function(claim) { return claim.get('dispute_evidences').all(function(disputeEvidence) { return disputeEvidence.get('files').all(function(file) { return !file.isReferenced() || !file.isConsidered(); }); }); }),
      isRemoved: participantModel && participantModel.isRemoved()
    };
  }
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: EvidencePartyView,
  emptyView: EmptyEvidencePartyView,

  filter(model) {
    return model.getDisputeClaims().any(function(disputeClaim) {
      return disputeClaim.get('dispute_evidences').any(function(disputeEvidence) {
        return disputeEvidence.get('files').hasUploaded();
      });
    });
  },

  childViewOptions() {
    return {
      showThumbnails: this.showThumbnails,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
    };
  },

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'evidenceFilePreviewFn', 'fileDupTranslations', 'hideDups'])
  }
  
});