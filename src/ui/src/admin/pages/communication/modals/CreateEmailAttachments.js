import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import FileBlockDisplayView from '../../common-files/FileBlockDisplay';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const CreateEmailAttachments = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['files', 'showAddAttachment', 'maxFileSizeBytes', 'disabled']);

    this.listenTo(this.model, 'render:attachments', this.render, this);
  },

  onRender() {
    this.showChildView('filesRegion', new FileBlockDisplayView({
      childViewOptions(model) {

        const fileDescription = filesChannel.request('get:filedescription:from:file', model);
        return Object.assign(FileBlockDisplayView.prototype.childViewOptions.call(this, ...arguments), fileDescription ? {
          infoTitle: model.get('title'),
          infoDescription: model.get('description')
        } : {});
      },
      collection: this.files,
      showModelType: true,
      showInfo: true,
      showDelete: !this.disabled
    }));
  },

  regions: {
    filesRegion: '.modalEmail-attachment-files'
  },

  template() {
    return (
      <>
        <div className="modalEmail-attachments-header">
          <div className="">
            <span className="modalEmail-attachments-label">Attachments:</span>&nbsp;
            {this.renderJsxFileCounts()}
          </div>
          {this.renderJsxAddAttachment()}
        </div>
        <div className="modalEmail-attachment-files-container">
          <div className="modalEmail-attachment-files"></div>
        </div>
      </>
    );
  },

  renderJsxFileCounts() {
    const fileSizeOptions = { exponent: 2, spacer: '' };
    const disputeFilesCount = this.files.filter(file => file.get('file_id')).length;
    const commonFilesCount = this.files.filter(file => file.get('common_file_id')).length;
    const fileCountsText = `${disputeFilesCount} Dispute File${disputeFilesCount===1?'':'s'}, ${commonFilesCount} Common File${commonFilesCount===1?'':'s'}`
    const totalFileSize = this.files.reduce((memo, file) => (file.get('file_size') || 0) + memo, 0);
    const totalFileSizeDisplay = Formatter.toFileSizeDisplay(totalFileSize, fileSizeOptions).replace(/MB/, '');
    const maxFileSize = this.maxFileSizeBytes ? Formatter.toFileSizeDisplay(this.maxFileSizeBytes, fileSizeOptions) : null;
    return (
      <>
        <span className="modalEmail-attachments-file-count">{fileCountsText}</span>&nbsp;
        <span className="modalEmail-attachments-size">{`(${totalFileSizeDisplay}${ maxFileSize ? ` / ${maxFileSize}`:''})`}</span>
      </>
    );
  },

  renderJsxAddAttachment() {
    if (!this.showAddAttachment || this.disabled) return;
    return <div className="modalEmail-add-attachment" onClick={() => this.model.trigger('click:add:attachment')}>Add Attachment</div>;
  }
});

_.extend(CreateEmailAttachments.prototype, ViewJSXMixin);
export default CreateEmailAttachments;