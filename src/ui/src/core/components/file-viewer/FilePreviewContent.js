import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ScrollBooster from 'scrollbooster';
import React from 'react';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';

const RELATIVE_PDF_VIEWER_PATH = '../Common/pdfjs/web/viewer.html';
const PARENT_CONTENT_SELECTOR = '.preview-content';
const ACTUAL_SIZE_TEXT = 'Actual Size';
const FIT_SIZE_TEXT = 'Fit Window';
const PDF_VIEW_ONLY_TEXT = 'View Only';
const PDF_ADVANCED_TEXT = 'Selectable';

const Formatter = Radio.channel('formatter').request('get');

const FilePreviewContent = Marionette.View.extend({
  /**
   * 
   * @param {FileModel} fileModel - The file to preview
   * @param {Boolean} evidenceViewerMode - shows advanced controls
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['fileModel', 'evidenceViewerMode', 'hidePdfControls', 'hideSplitView']);

    // Set to PDF quick view by default
    this.pdfQuickView = true;

    // Fit to window
    this.imageActualView = false;
  },

  resetEle() {
    //remove inline styles that are applied in left/right rotate from ele
    const ele = this.getUI('image');
    ele.removeAttr("style");
  },

  getFileModel() {
    return this.fileModel;
  },

  setFileModel(newFileModel) {
    this.fileModel = newFileModel;
  },

  onRender() {
    this.initDraggableImage();
  },

  initDraggableImage() {
    const isImageActual = this.imageActualView || this.imageActualView  === undefined;
    const imgSelector = isImageActual ? '.preview-content-image-actual' : '.preview-content-image-fit';
    const viewport = document.querySelector('.preview-content');
    const image = document.querySelector(imgSelector);

    if (image) {
      const sb = new ScrollBooster({
        viewport,
        scrollMode: 'native',
        bounce: false
      });
      const centerViewport = () => {
        // set viewport position to the center of an image
        const offsetX = image.scrollWidth - viewport.offsetWidth;
        const offsetY = image.scrollHeight - viewport.offsetHeight;
        sb.setPosition({
          x: offsetX / 2,
          y: offsetY / 2
        });
      };

      image.removeEventListener('load', centerViewport);
      image.addEventListener('load', centerViewport);
    }
  },

  downloadFile() {
    if (!this.fileModel) {
      return;
    }

    this.fileModel.download();
  },

  className: "preview-content-wrapper",
  ui: {
    pdfToggleQuick: '.pdf-toggle-quick--disabled',
    pdfToggleAdvanced: '.pdf-toggle-advanced--disabled',
    
    imgActual: '.image-toggle-actual--disabled',
    imgFit: '.image-toggle-fit--disabled',
    imgRotateLeft: '.image-toggle-rotate-left',
    imgRotateRight: '.image-toggle-rotate-right',
    contentContainer: '.preview-content',

    audio: 'audio',
    video: 'video',
    image: 'img',
  },

  events: {
    'click @ui.imgActual': function(ev) {
      ev.preventDefault();
      this.imageActualView = true;
      this.resetEle();
      this.render();
    },

    'click @ui.imgFit': function(ev) {
      ev.preventDefault();
      this.imageActualView = false;
      this.resetEle();
      this.render();
    },

    'click @ui.imgRotateLeft': function() {
      this.imageRotate(-90);
      this.render();
    },

    'click @ui.imgRotateRight': function() {
      this.imageRotate(90);
      this.render();
    },

    'click @ui.pdfToggleQuick': function(ev) {
      ev.preventDefault();
      this.pdfQuickView = true;
      this.render();
    },
    'click @ui.pdfToggleAdvanced': function(ev) {
      ev.preventDefault();
      this.pdfQuickView = false;
      this.render();
    }
  },

  imageRotate(rotateDegrees) {
    const ele = this.getUI('image');
    if (!ele.length) return;
    
    const currentRotation = ele.data('deg') || 0;
    const newRotation = currentRotation + rotateDegrees;
    const aspectRatio = Number(ele[0].naturalWidth) / ele[0].naturalHeight;
    const isRotated = newRotation !== 0 && newRotation % 180 !== 0;
    const contentEle = ele.closest(PARENT_CONTENT_SELECTOR);
    const minHeight = this.imageActualView && isRotated ? aspectRatio*ele.height() : '';
    const maxWidth = !this.imageActualView && isRotated && contentEle ? contentEle.height() : '';
    // On fit window, always show height: auto, width: 100%;
    const height = this.imageActualView ? (isRotated ? ele[0].naturalWidth : ele[0].naturalHeight) : 'auto';
    const width = this.imageActualView ? (isRotated ? ele[0].naturalWidth : ele[0].naturalWidth) : '100%';

    ele.css('transform', `rotate(${newRotation}deg)`);
    ele.data('deg', newRotation);
    ele.css({ width, height, minHeight, maxWidth });
  },

  clickSplitView() {
    const currentRoute = window.location.href;
    localStorage.setItem('splitView', true);
    window.open(currentRoute, '_blank');
  },

  template() {
    const isAudio = this.fileModel.isAudio();
    const isImage = this.fileModel.isImage();
    const isViewableVideo = this.fileModel.isViewableVideo();
    const isPdf = this.fileModel.isPdf();
    return ( 
      <>
        <div className="preview-content-toggle-container">
          {this.renderJsxDownload()}
          {this.renderJsxImgControls(isImage, isPdf)}
        </div>
        <div className={`preview-content ${isAudio ? 'audio' : ''} ${isImage ? 'image' : ''} ${isViewableVideo ? 'video' : ''}`}>
          {this.renderJsxFilePreview(isAudio, isImage, isViewableVideo, isPdf)}
        </div>
      </>
    )
  },

  renderJsxDownload() {
    if (this.evidenceViewerMode) return;
    const fileName = this.fileModel.get('file_name');
    const fileSize = this.fileModel.get('file_size');
    const fileDate = this.fileModel.get('file_date') || this.fileModel.get('created_date');

    const renderSplitView = () => {
      if (this.hideSplitView) return;

      return (
        <div className="preview-content-split-view" onClick={() => this.clickSplitView()}>
          <span className="image-toggle-split" />
          <span className="preview-content-split-view-text">Open for Split View</span>
        </div>
      );
    }

    return (
      <div className="preview-content-download-container">
        <div className="dispute-issue-evidence-file-details">
          <span className="filename-download" onClick={() => this.downloadFile()}>{fileName}</span>
          <div className="file-metadata">
            <span>&nbsp;(</span>
            <span className="dispute-issue-evidence-filesize">{Formatter.toFileSizeDisplay(fileSize)}</span>
            <span className="">,&nbsp;</span>
            <span className="dispute-issue-evidence-filedate">{Formatter.toDateDisplay(fileDate)}</span>
            <span>)</span>
          </div>
          {renderSplitView()}
        </div>
      </div>
    )
  },

  renderJsxImgControls(isImage, isPdf) {
    const imageActualText = () => !this.evidenceViewerMode ? <span className="preview-content-toggle-text">{ACTUAL_SIZE_TEXT}</span> : null;
    const imageFitText = () => !this.evidenceViewerMode ? <span className="preview-content-toggle-text">{FIT_SIZE_TEXT}</span> : null;
    const pdfQuickViewText = () => !this.evidenceViewerMode ? <span className="preview-content-toggle-text">{PDF_VIEW_ONLY_TEXT}</span> : null;
    const pdfAdvancedViewText = () => !this.evidenceViewerMode ? <span className="preview-content-toggle-text">{PDF_ADVANCED_TEXT}</span> : null;
    const showSplitView = () => this.evidenceViewerMode && !this.hideSplitView ? <span className="image-toggle-split" onClick={() => this.clickSplitView()} /> : null

    if (isImage) {
      return (
        <div className="preview-toggle-container">
          {showSplitView()}
          <span className={`preview-content-toggle-item image-toggle-actual${this.imageActualView ? '' : '--disabled'}`}>{imageActualText()}</span>
          <span className={`preview-content-toggle-item image-toggle-fit${!this.imageActualView ? '' : '--disabled'}`}>{imageFitText()}</span>
          <span className="preview-content-toggle-item image-toggle-rotate-left">&nbsp;</span>
          <span className="preview-content-toggle-item image-toggle-rotate-right">&nbsp;</span>
        </div>
      );
    } else if (isPdf) {
        if (this.hidePdfControls) return;
        return (
          <div className="preview-toggle-container">
            {showSplitView()}
            <span className={`preview-content-toggle-item pdf-toggle-quick${this.pdfQuickView ? '' : '--disabled'}`}>{pdfQuickViewText()}</span>
            <span className={`preview-content-toggle-item pdf-toggle-advanced${!this.pdfQuickView ? '' : '--disabled'}`}>{pdfAdvancedViewText()}</span>
          </div>
      )
    }
  },

  renderJsxFilePreview(isAudio, isImage, isViewableVideo, isPdf) {
    const fileUrl = this.fileModel.getDisplayURL();
    const fileMimeType = this.fileModel.get('file_mime_type');
    const fileThumbnailUrl = this.fileModel.getThumbnailURL();
    
      if (isImage) {
        return <img className={`preview-content-image-${this.imageActualView ? 'actual' : 'fit'} `} id="preview-content-image" src={fileUrl} />;
      } else if (isPdf) { 
          if (this.pdfQuickView) {
            return <embed id="preview-content-pdf" src={fileUrl} type="application/pdf"></embed>;
          } else {
            return <embed id="preview-content-pdf" src={`${RELATIVE_PDF_VIEWER_PATH}?file=${encodeURIComponent(fileUrl)}`} type="application/pdf"></embed>;
          }
      } else if (isAudio) {
        return (
          <audio controls>
            <source src={fileUrl} type={fileMimeType} />
          </audio>
        );
      } else if (isViewableVideo) {
        return (
          <video poster={fileThumbnailUrl} playsinline controls>
            <source src={fileUrl} type="video/mp4" />
            <source src={fileUrl} type={fileMimeType} />
          </video>
        )
      } else {
        return (
          <div className="preview-content-fallback">
            <div>
              <img src={fileThumbnailUrl} />
            </div>
            <div>
              <i>Cannot be viewed online</i>
            </div>
            <div>
              <i>Use link to download</i>
            </div>
          </div>
        );
      }
  }
});

_.extend(FilePreviewContent.prototype, ViewJSXMixin)

export { FilePreviewContent }