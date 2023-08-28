import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../../components/context-container/ContextContainer';
import SessionCollapse from '../../../components/session-settings/SessionCollapseHandler';
import DisputeFilePackageView from './DisputeFilePackage';

const disputeChannel = Radio.channel('dispute');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const EmptyFilePackageView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="dispute-file-package">There are currently no evidence packages on this dispute file</div>`)
});

const FilePackagesView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerView,
  emptyView: EmptyFilePackageView,

  buildChildView(child, ChildViewClass, childViewOptions) {
    const options = _.extend({model: child}, childViewOptions);

    if (ChildViewClass === EmptyFilePackageView) {
      return new ChildViewClass(childViewOptions);
    }

    const filesInPackage = child.getFilesInPackage();
    const participantModel = child.getPackageCreatorParticipantModel();
    
    const fileCountDisplay = `${filesInPackage.length} file${filesInPackage.length === 1 ? '' : 's'}`;
    const totalFileSizeDisplay = Formatter.toFileSizeDisplay(_.reduce(filesInPackage, function(memo, file) { return memo + file.get('file_size'); }, 0));

    const noFilesReferenced = !_.any(filesInPackage, function(file) { return file.isReferenced(); });
    const noFilesConsidered = !_.any(filesInPackage, function(file) { return file.isConsidered(); });
    const allFilesNotConsideredOrNotReferenced = !_.any(filesInPackage, function(file) { return !file.isReferenced() || !file.isConsidered(); });

    const disputeModel = disputeChannel.request('get');
    const self = this;
    // Create the child view instance
    const view = ContextContainer.withContextMenu({
      cssClass: `${noFilesReferenced ? 'not-file-referenced' : ''}
        ${noFilesConsidered ? 'not-file-considered' : ''}
        ${allFilesNotConsideredOrNotReferenced ? 'not-file-considered-or-referenced' : ''}
        ${participantModel && participantModel.isRemoved() && !child.isIntakePackage() ? 'claim-removed' : ''}`,
      wrappedView: new DisputeFilePackageView(options),
      titleDisplay: child.getPackageTitle(),
      menu_title: `Evidence Package ID ${child.getFilePackageId()}`,
      menu_states: {
        default: filesInPackage.length ? [{ name: `Download All (${fileCountDisplay}, ${totalFileSizeDisplay})`, event: 'download:all' }] : []
      },
      contextRender() {
        self.render();
      },
      disputeModel,
      collapseHandler: SessionCollapse.createHandler(disputeModel, 'Evidence', 'packages', child?.get('filePackageModel')?.id),
    });
    return view;
  },

  initialize(options) {
    this.mergeOptions(options, ['showArrows', 'showArbControls', 'showThumbnails', 'showRemoved', 'showDetailedNames',
        'showSubmitterInfo', 'evidenceFilePreviewFn', 'unitCollection', 'filterFn', 'fileDupTranslations', 'hideDups']);

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


    this.listenTo(this.collection, 'update', this.render);
  },

  childViewOptions(model, index) {
    return {
      childIndex: index+1,
      showThumbnails: this.showThumbnails,
      showRemoved: this.showRemoved,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
    };
  },

  defaultFilterFn(model) {
    // Always show the intake package, but otherwise hide packages with no files
    return model.isIntakePackage() || _.any(model.getFilesInPackage(), file => file.isUploaded());
  },

  filter(model) {
    const participantModel = model.getPackageCreatorParticipantModel();
    return this.defaultFilterFn(model) && (participantModel && (this.showRemoved || !participantModel.isRemoved()));
  }
});


export default Marionette.View.extend({
  template: _.template(`<div class="file-packages-list"></div>`),

  regions: {
    filePackagesListRegion: '.file-packages-list'
  },

  initialize(options) {
    this.options = options;
  },

  onRender() {
    this.showChildView('filePackagesListRegion', new FilePackagesView(this.options));
  },

  renderHearingToolsRegions() {
    const filePackagesListView = this.getChildView('filePackagesListRegion');
    if (filePackagesListView && filePackagesListView.children) {
      filePackagesListView.children.each(function(filePackageView) {
        if (!filePackageView.wrappedView) {
          return;
        }
        const view = filePackageView.wrappedView;
        const filePackageModel = view.model.get('filePackageModel');
        // Reset service fields on each notice
        filePackageModel.resetPackageService();
        filesChannel.request('update:filepackage:service', filePackageModel);
        view.renderHearingToolsRegions();
      });
    }
  }
});
