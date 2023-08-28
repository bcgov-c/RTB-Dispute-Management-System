import React from 'react';
import ReactDOM from 'react-dom';
import ModalBaseView from '../modals/ModalBase';
import { FilePreviewContent } from './FilePreviewContent';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import iconRight from '../../static/Icon_MobilePreviewNext.png';
import iconLeft from '../../static/Icon_MobilePreviewPrevious.png';
import downloadIcon from '../../static/Icon_DesktopPreviewDownload.png';
import './ModalExternalFileViewer.scss';

const ModalExternalFileViewer = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['fileModel', 'fileCarouselArray', 'hidePdfControls', 'hideSplitView']);
    this.index = this.fileCarouselArray.findIndex(file => file.id === this.fileModel.id) || 0;
  },

  downloadFile() {
    this.fileModel.download();
  },

  renderNextFile(num) {
    const newIndex = this.index + num
    if (newIndex >= 0 && newIndex < this.fileCarouselArray?.length) {
      this.index = newIndex;
    } else {
      return;
    }

    this.fileModel = this.fileCarouselArray[this.index];
    this.render();
  },

  onRender() {
    this.showChildView('contentRegion', new FilePreviewContent({ fileModel: this.fileModel, evidenceViewerMode: false, hidePdfControls: true, hideSplitView: true, isExternalFileView: true, close: this.close }));
  },

  id: 'externalFileViewer-modal',

  className: `${ModalBaseView.prototype.className} modal-fullsize`,
  regions: {
    contentRegion: '.file-viewer-content'
  },

  template() {
    const leftIconInactive = this.index <= 0;
    const rightIconInactive = this.index >= this.fileCarouselArray?.length-1;
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">{this.fileModel.getTrimmedName(30)} <span className="download-wrapper" onClick={() => this.downloadFile()}><img className="file-download" src={downloadIcon} ></img><span>&nbsp;Download</span></span></h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">
            <div className="file-controls">
              <img className={leftIconInactive ? 'file-controls-inactive' : 'file-controls-active'} src={iconLeft} onClick={() => this.renderNextFile(-1)} />
              <img className={rightIconInactive ? 'file-controls-inactive' : 'file-controls-active'} src={iconRight} onClick={() => this.renderNextFile(1)} />
            </div>
            <div className="file-viewer-content"></div>
          </div>
        </div> 
      </div>
    );
  }
});

_.extend(ModalExternalFileViewer.prototype, ViewJSXMixin)

export { ModalExternalFileViewer }