import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import FileDisplayView from '../../common-files/FileDisplay';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const filesChannel = Radio.channel('files');

const FileAttachmentCheckboxView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['checkedFiles', 'maxFileSizeBytes']);
    
    if (this.model.get('isTitle') || this.model.get('isSubTitle')) return;

    this.fileModel = this.model.get('fileModel');
    this.fileDescription = filesChannel.request('get:filedescription:from:file', this.fileModel);

    const isChecked = this.checkedFiles && this.checkedFiles.find(file => (
      (file.get('file_id') && file.get('file_id') === this.fileModel.get('file_id'))
      ||
      (file.get('common_file_id') && file.get('common_file_id') === this.fileModel.get('common_file_id'))
    ));
    this._checkboxModel = new CheckboxModel({ checked: isChecked, html: '' });

    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this._checkboxModel, 'change:checked', function(model, checked) {
      if (checked) {
        const checkedFilesize = this.checkedFiles.reduce((memo, file) => memo + file.get('file_size'), 0);
        if (this.maxFileSizeBytes && (checkedFilesize + this.fileModel.get('file_size')) > this.maxFileSizeBytes) {
          model.set('checked', false, { silent: true });
          model.trigger('render');
          this.checkedFiles.trigger('error:size', this.fileModel);
          return;
        }
        this.checkedFiles.add(this.fileModel, { merge: true });
      } else {
        this.checkedFiles.remove(this.fileModel);
      }
    }, this);
  },

  onRender() {
    if (this.model.get('isTitle') || this.model.get('isSubTitle')) return;
    
    this.showChildView('_checkboxRegion', new CheckboxView({ model: this._checkboxModel }));
    this.showChildView('_fileRegion', new FileDisplayView(Object.assign({
      model: this.fileModel,
      showModelType: true,
      showInfo: true,
    }, this.fileDescription ? {
      infoTitle: this.fileDescription.get('title'),
      infoDescription: this.fileDescription.get('description')
    } : {})));
  },

  /* Template Functions */
  className: 'email-attachment-checkbox',
  regions: {
    _checkboxRegion: '.attachment-checkbox',
    _fileRegion: '.attachment-file-display',
  },

  template() {
    const { isTitle, isSubTitle, titleHtml } = this.model.toJSON();
    if (isTitle) return <div className="attachment-title" dangerouslySetInnerHTML={{__html: titleHtml || '' }}></div>;
    else if (isSubTitle) return <div className="attachment-subtitle" dangerouslySetInnerHTML={{__html: titleHtml || '' }}></div>;
    else return (
      <>
        <div className="attachment-checkbox"></div>
        <div className="attachment-file-display"></div>
      </>
    );
  }
});

const FileAttachmentCollectionView = Marionette.CollectionView.extend({
  viewComparator: model => (model.get('file_name') || '').toLowerCase(),
  childView: FileAttachmentCheckboxView,
});

_.extend(FileAttachmentCheckboxView.prototype, ViewJSXMixin);
export { FileAttachmentCollectionView, FileAttachmentCheckboxView };
