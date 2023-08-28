import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DisputeClaimEvidenceCollectionView from './DisputeClaimEvidences';
import ContextContainer from '../context-container/ContextContainer';

const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const DisputeEvidenceContainer = Marionette.View.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['title', 'cssClass', 'showThumbnails', 'showArrows', 'showArbControls',
      'evidenceFilePreviewFn', 'unitCollection', 'fileDupTranslations', 'hideDups', 'showDetailedNames',
      'collapseHandler',
    ]);
    this.uploadedFiles = [].concat.apply([], this.collection.map(ev => ev.getUploadedFiles()));
    this.fileCountDisplay = `${this.uploadedFiles.length} file${this.uploadedFiles.length === 1 ? '' : 's'}`;
    this.totalFileSizeDisplay = Formatter.toFileSizeDisplay(this.uploadedFiles.reduce((memo, file) => memo + file.get('file_size'), 0));
  },

  triggerDownloadAll() {
    const onContinueFn = (modalView) => {
      modalView.close();
      filesChannel.request('download:files', this.uploadedFiles);
    };
    filesChannel.request('show:download:modal', onContinueFn, { title: 'Download All Evidence' });
  },

  resetModelValues() {
    // Pass; not an editable object, so no reset needed
  },

  className() {
    return `review-information-body ${this.getOption('cssClass') || ''}`
  },

  regions: {
    evidenceListRegion: '.review-claim-evidence',
  },

  onRender() {
    const dummyModel = new Backbone.Model();
    const wrappedView = new DisputeClaimEvidenceCollectionView({
      showArrows: this.showArrows,
      showArbControls: this.showArbControls,
      showThumbnails: this.showThumbnails,
      showDetailedNames: _.isBoolean(this.showDetailedNames) ? this.showDetailedNames : true,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
      collection: this.collection,
    });
    this.showChildView('evidenceListRegion', ContextContainer.withContextMenu({
      wrappedView,
      titleDisplay: this.title || 'Documents',
      menu_states: {
        default: this.uploadedFiles.length ? [{ name: `Download All (${this.fileCountDisplay}, ${this.totalFileSizeDisplay})`, event: 'download:all' }] : []
      },
      menu_model: dummyModel,
      menu_title: ' ',
      collapseHandler: this.collapseHandler,
    }));
    this.listenTo(wrappedView, 'menu:download:all', () => this.triggerDownloadAll());
  },

  template() {
    return <div className="">
      <div className="review-claim-evidence"></div>
    </div>;
  },

});

_.extend(DisputeEvidenceContainer.prototype, ViewJSXMixin);
export default DisputeEvidenceContainer;
