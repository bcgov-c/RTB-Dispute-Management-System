/**
 * @fileoverview - View that previews file contents and various display controlls
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import DropdownView from '../dropdown/Dropdown';
import DropdownModel from '../dropdown/Dropdown_model';
import CloseIcon from '../../static/Icon_MobilePreviewClose.png';
import mobileDownloadIcon from '../../static/Icon_MobilePreviewDownload.png';
import { fabric } from 'fabric';
import UtilityMixin from '../../utilities/UtilityMixin';

const RELATIVE_PDF_VIEWER_PATH = '../Common/pdfjs/web/viewer.html';
const PDF_VIEW_ONLY_TEXT = 'View Only';
const PDF_ADVANCED_TEXT = 'Selectable';

const ZOOM_LEVEL_FIT_CODE = '-1';
const ZOOM_LEVEL_PERCENTS = [25, 50, 100, 200, 400];
const MIN_ZOOM_SCALE = 0.5;
const MAX_ZOOM_SCALE = 3;
const ZOOM_SMOOTHNESS_SCALE = 0.0015;
const PAN_SMOOTHNESS_SCALE = 0.8;
const DEBOUNCE_LIMIT = 5;
const Formatter = Radio.channel('formatter').request('get');

const FilePreviewContent = Marionette.View.extend({
  /**
   * 
   * @param {FileModel} fileModel - The file to preview
   * @param {Boolean} [evidenceViewerMode] - shows advanced controls
   * @param {Boolean} [hideSplitView] - hides split view button which opens up a second window with the currently loaded page
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['fileModel', 'evidenceViewerMode', 'hidePdfControls', 'hideSplitView', 'isExternalFileView', 'close']);

    // Set to PDF quick view by default
    this.pdfQuickView = true;
    
    this.createSubModels();
    this.setupListeners();

    this.debounceCount = 0;
    this.canvas = null;
    // Store image data including src and any current user viewing toggles
    this.imageCache = {
      imgRendered: false,
      imgObj: null,
      rotation: null,
      zoom: this.zoomDropdownModel.getData(),
    };
  },

  createSubModels() {
    this.zoomDropdownModel = new DropdownModel({
      labelText: '',
      optionData: [
        // Fit is always the first option
        { value: ZOOM_LEVEL_FIT_CODE, text: 'Fit '},
        ...ZOOM_LEVEL_PERCENTS.map(percent => ({ value: String(percent), text: `${percent}%`}))
      ],
      value: ZOOM_LEVEL_FIT_CODE,
      defaultBlank: false,
    });
  },

  setupListeners() {
    this.listenTo(this.zoomDropdownModel, 'change:value', (model, value) => {
      this.imageCache.zoom = value;
      this.resetRenderedImage();
      this.render();
    });

    const resizeImage = () => {
      if (this.imageCache.imgRendered) {
        // Force redraw the canvas only
        this.imageCache.imgRendered = false;
        this.renderCanvas();
      }
    };
    $(window).off('resize', resizeImage);
    $(window).on('resize', resizeImage);
  },

  getFileModel() {
    return this.fileModel;
  },

  setFileModel(newFileModel) {
    this.fileModel = newFileModel;
  },

  resetRenderedImage() {
    const centerPoint = this.canvas.getCenterPoint();
    this.canvas.zoomToPoint({ x: centerPoint.x, y: centerPoint.y }, this.canvas.getZoom());
    this.canvas.centerObject(this.canvas.getObjects()?.[0]);
  },

  onBeforeRender() {
    this.imageCache.imgRendered = false;
    if (this.isRendered()) {
      this.listVerticalScrollPosition = this.getUI('contentContainer')?.scrollTop() || 0;
    }
  },

  onRender() {
    if (this.fileModel.isImage()) {
      if (!this.isExternalFileView) {
        this.showChildView('zoomDropdown', new DropdownView({ model: this.zoomDropdownModel }));
      }
      this.renderCanvas();
    }
  },

  async renderCanvas() {
    if (this.imageCache.imgRendered) return;
    
    let parent;
    try {
      parent = this.getUI('contentContainer');
      if (parent?.height() <= 0) {
        if (this.debounceCount < DEBOUNCE_LIMIT) return UtilityMixin.util_debounce(this.renderCanvas.bind(this), 200);
        this.debounceCount++;
      }
    } catch (err) {
      return;
    }

    this.canvas = this.canvas || new fabric.Canvas('preview-content-canvas', {
      allowTouchScrolling: true,
      selection: false,
    });
    this.canvas.setDimensions({ height: parent.height(), width: parent.width() });

    const getImage = () => new Promise(res => this.imageCache.imgObj ? fabric.Image.fromObject(this.imageCache.imgObj, res) : fabric.Image.fromURL(this.fileModel.getDisplayURL(), originalImg => {
      this.imageCache.imgObj = originalImg;
      return fabric.Image.fromObject(originalImg, res)
    }));

    const imgObj = await getImage();
    const isLandscape = imgObj.width > imgObj.height;
    const isTurned = [90, 270].includes(Math.abs(this.imageCache.rotation || 0));

    const imgConfig = {
      centeredRotation: true,
      centeredScaling: true,
      selectable: true,
      controls: true,
    };
    // Reset image dimensions to default
    imgObj.set(Object.assign({
      left: 0,
      top: 0,
      scaleX: 1,
      scaleY: 1,
      angle: this.imageCache.rotation || 0,
    }, imgConfig));

    let zoom = 1;
    if (!this.imageCache.zoom || this.imageCache.zoom === ZOOM_LEVEL_FIT_CODE) {
      const longestEdgeIsWidth = (
        (isLandscape) ||
        (!isLandscape && isTurned)
      );
      if (longestEdgeIsWidth && !isTurned) {
        imgObj.scaleToWidth(this.canvas.width);
        
        // Always correct for when the initial scaling goes off the page
        if (imgObj.getScaledHeight() > this.canvas.height) {
          imgObj.scaleToHeight(this.canvas.height);
        }
      } else {
        imgObj.scaleToHeight(this.canvas.height);
        
        // Always correct for when the initial scaling goes off the page
        if (imgObj.getScaledWidth() > this.canvas.width) {
          imgObj.scaleToWidth(this.canvas.width);
        }
      }

    } else if (Number.isInteger(Number(this.imageCache.zoom))) {
      zoom = parseFloat(this.imageCache.zoom / 100.0);
    }

    // Reset the canvas each render, apply all user settings
    this.canvas.clear();
    this.canvas.zoomToPoint({ x: this.canvas.getCenterPoint().x, y: this.canvas.getCenterPoint().y }, zoom);
    this.canvas.add(imgObj);
    this.canvas.centerObject(imgObj);
    this.canvas.renderAll();
    this.imageCache.imgRendered = true;
  },

  downloadFile() {
    if (!this.fileModel) return;
    this.fileModel.download();
  },

  className: "preview-content-wrapper",
  ui: {
    pdfToggleQuick: '.pdf-toggle-quick--disabled',
    pdfToggleAdvanced: '.pdf-toggle-advanced--disabled',
    
    imgRotateLeft: '.image-toggle-rotate-left',
    imgRotateRight: '.image-toggle-rotate-right',
    contentContainer: '.preview-content',

    audio: 'audio',
    video: 'video',
    image: 'img',
  },
  regions: {
    zoomDropdown: '.image-toggle-zoom-dropdown'
  },

  events: {
    'click @ui.imgRotateLeft': function() { this.imageRotate(-90); },

    'click @ui.imgRotateRight': function() { this.imageRotate(90); },

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
    // TODO: To look at for canvas
    let newRotation = this.imageCache.rotation + rotateDegrees;
    if (newRotation === 360 || newRotation === -360) newRotation = 0;
    this.imageCache.rotation = newRotation;
    this.resetRenderedImage();
    this.render();
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
        { !this.isExternalFileView ? <div className="preview-content-toggle-container">
          {this.renderJsxDownload()}
          {this.renderJsxImgControls(isImage, isPdf)}
        </div>
        :
        <div className="preview-content-external-container">
          <div className="preview-content-external-left-container" onClick={() => this.downloadFile()}>
            <img className="file-download" src={mobileDownloadIcon}></img>
            <span className="file-name-mobile">{this.fileModel.getTrimmedName(20)}</span>
          </div>
          <img className="preview-content-close-x close-x" src={CloseIcon} onClick={() => this.close}></img>
        </div>
        }
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
    const renderImageZoom = () => <>
      <span className="preview-content-toggle-item image-toggle-zoom-icon"></span>
      <span className="image-toggle-zoom-dropdown"></span>
    </>
    const renderPdfQuickView = () => !this.evidenceViewerMode ? <span className="preview-content-toggle-text">{PDF_VIEW_ONLY_TEXT}</span> : null;
    const renderPdfAdvancedView = () => !this.evidenceViewerMode ? <span className="preview-content-toggle-text">{PDF_ADVANCED_TEXT}</span> : null;
    const renderSplitView = () => this.evidenceViewerMode && !this.hideSplitView ? <span className="image-toggle-split" onClick={() => this.clickSplitView()} /> : null
    
    if (isImage) {
      return (
        <div className="preview-toggle-container">
          {renderSplitView()}
          {renderImageZoom()}
          <span className="preview-content-toggle-item image-toggle-rotate-left">&nbsp;</span>
          <span className="preview-content-toggle-item image-toggle-rotate-right">&nbsp;</span>
        </div>
      );
    } else if (isPdf) {
        if (this.hidePdfControls) return;
        return (
          <div className="preview-toggle-container">
            {renderSplitView()}
            <span className={`preview-content-toggle-item pdf-toggle-quick${this.pdfQuickView ? '' : '--disabled'}`}>{renderPdfQuickView()}</span>
            <span className={`preview-content-toggle-item pdf-toggle-advanced${!this.pdfQuickView ? '' : '--disabled'}`}>{renderPdfAdvancedView()}</span>
          </div>
      )
    }
  },

  renderJsxFilePreview(isAudio, isImage, isViewableVideo, isPdf) {
    const fileUrl = this.fileModel.getDisplayURL();
    const fileMimeType = this.fileModel.get('file_mime_type');
    const fileThumbnailUrl = this.fileModel.getThumbnailURL();
    
      if (isImage) {
        return this.renderJsxCanvasPreview(fileUrl);
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
  },

  renderJsxCanvasPreview() {
    return <>
      <canvas id="preview-content-canvas"></canvas>
    </>;
  }
});

_.extend(FilePreviewContent.prototype, ViewJSXMixin)

export { FilePreviewContent }