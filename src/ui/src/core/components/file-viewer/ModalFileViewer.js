/**
 *  @fileoverview - Displays a stripped down version of the FilePreviewContent.js. Contains a file display window and file download button
 */
import React from 'react';
import ModalBaseView from '../modals/ModalBase';
import { FilePreviewContent } from './FilePreviewContent';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';

const ModalFileViewer = ModalBaseView.extend({
  /**
   * @param {FileModel} fileModel - file model of the file that is used to populate the file viewer
   * @param {Boolean} [hideSplitView] - hides split view button which opens up a second window with the currently loaded page
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['fileModel', 'hidePdfControls', 'hideSplitView']);
  },

  onRender() {
    this.showChildView('contentRegion', new FilePreviewContent({ fileModel: this.fileModel, evidenceViewerMode: false, hidePdfControls: this.hidePdfControls, hideSplitView: this.hideSplitView }));
  },

  id: 'fileViewer-modal',

  className: `${ModalBaseView.prototype.className} modal-fullsize`,
  regions: {
    contentRegion: '.file-viewer-content'
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">File Viewer - Beta Version</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">
            <div className="file-viewer-content"></div>
          </div>
        </div>
      </div>
    );
  }

});

_.extend(ModalFileViewer.prototype, ViewJSXMixin)

export { ModalFileViewer }
