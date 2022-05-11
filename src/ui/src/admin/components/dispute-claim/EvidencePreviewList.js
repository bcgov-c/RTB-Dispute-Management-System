import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './EvidencePreviewList_template.tpl';

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,

  ui: {
    file: '.evidencePreview-list-file-container'
  },

  events: {
    'click @ui.file': 'clickFile'
  },

  clickFile(ev) {
    ev.preventDefault();

    const ele = $(ev.currentTarget);
    const evidenceId = ele.data('evidenceId');
    const fileId = ele.data('fileId');
    
    if (this.highlightedFileId && fileId === this.highlightedFileId) {
      return;
    }

    const matchingEvidence = _.find(this.evidenceModels, evidenceModel => evidenceModel.getId() === evidenceId);
    const matchingFile = _.find(this.fileModels, fileModel => fileModel.id === fileId);

    if (!matchingFile) {
      console.log("no matching evidence or file found");
      return;
    }

    this.trigger('update:preview', matchingEvidence, matchingFile);
  },

  initialize(options) {
    this.mergeOptions(options, ['listData', 'highlightedFileId', 'evidenceModels', 'fileModels']);
  },

  templateContext() {
    return {
      Formatter,
      listData: this.listData,
      highlightedFileId: this.highlightedFileId
    };
  }
});