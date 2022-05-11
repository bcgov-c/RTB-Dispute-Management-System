import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import CheckmarkIcon from '../../static/DA_CheckIcon.png';
import XIcon from '../../static/DA_XIIcon.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './OfficePickupPage.scss';
import FileModel from '../../../core/components/files/File_model';
import CommonFileModel from '../../../core/components/files/CommonFile_model';

const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');

const EmptyAttachmentsView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.noop
});

const OfficeAttachmentsItem = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['index', 'collection', 'attachmentClickedList']);
    this.template = this.template.bind(this);
    this.fileAttachment = this.model.get('attachment_type') === configChannel.request('get', 'EMAIL_ATTACHMENT_TYPE_FILE') ? new FileModel(this.model.attributes) : new CommonFileModel(this.model.attributes);

    this.attachmentButtonClicked = this.attachmentClickedList[this.index];
  },

  clickAttachmentButton() {
    this.attachmentButtonClicked = true;
    this.collection.trigger('file:button:clicked', this.index);
    this.render();

    const options={ fallback_download: true, preview_file_types: { "pdf": true }, hidePdfControls: true, hideSplitView: true };
    filesChannel.request('show:file:preview:modal', this.fileAttachment, options );
  },

  template() {
    const index = this.index + 1;
    const COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    return (
      <div className="office-pickup__attachment">
        <button className="btn btn-lg btn-standard btn-continue" onClick={() => this.clickAttachmentButton()}>{this.fileAttachment.isPdf() ? 'View to Print' : 'Download to print'}</button>
        <div className="office-pickup__attachment__display">
          <img src={`${COMMON_IMAGE_ROOT}Icon_File_email.png`} class="er-file-icon" style={{ padding: '0px', position: 'relative', top: '0px' }}/>
          <span>
            <span className="office-pickup__attachment__display__file-text">FILE {index < 10 ? `0${index}` : index }:</span> 
            <span>&nbsp;{this.fileAttachment.get('file_name') ? this.fileAttachment.get('file_name') : ''}</span>
            <span className="office-pickup__attachment__display__file-size">&nbsp;({this.fileAttachment.get('file_size') ? Formatter.toFileSizeDisplay(this.fileAttachment.get('file_size')) : ''})</span>
          </span>
          <img className="office-pickup__attachment__display__icon" src={this.attachmentButtonClicked ? CheckmarkIcon : XIcon} />&nbsp;<span>{this.attachmentButtonClicked ? `File was ${this.fileAttachment.isPdf() ? 'viewed' : 'downloaded'}` : `File not ${this.fileAttachment.isPdf() ? 'viewed' : 'downloaded'}`}</span>
        </div>
      </div>
    );
  }
})

_.extend(OfficeAttachmentsItem.prototype, ViewJSXMixin);

const OfficePickupAttachmentsList = Marionette.CollectionView.extend({
  template: _.noop,
  childView: OfficeAttachmentsItem,
  emptyView: EmptyAttachmentsView,

  initialize(options) {
    this.mergeOptions(options, ['attachmentClickedList'])
  },

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index,
      attachmentClickedList: this.attachmentClickedList
    }
  }
});

const OfficePickupAttachments = Marionette.View.extend({
  regions: {
    attchmentList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);
  },

  onRender() {
    this.showChildView('attchmentList', new OfficePickupAttachmentsList(this.options))
  },

  template() {
    return (
      <>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(OfficePickupAttachments.prototype, ViewJSXMixin);
export default OfficePickupAttachments