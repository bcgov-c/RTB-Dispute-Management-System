import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './DisputeOutcomeExternalFile_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const modalChannel = Radio.channel('modals');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item outcome-external-file-container',
  
  ui: {
    filename: '.filename-download',
    deleteBtn: '.outcome-external-file-delete-btn'
  },

  events: {
    'click @ui.filename': 'clickFilename',
    'click @ui.deleteBtn': 'clickDelete'
  },

  clickFilename(ev) {
    filesChannel.request('click:filename:preview', ev, this.file_model, { fallback_download: true });
  },

  clickDelete() {
    const deleteFn = () => {
      loaderChannel.trigger('page:load');
      // Delete file, then delete doc
      this.file_model.destroy()
        .done(() => {
          this.model.destroy()
            .fail(
              generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.REMOVE')
            )
            .always(() => loaderChannel.trigger('page:load:complete'))

        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.FILE.REMOVE');
          handler(err);
        });
    };

    modalChannel.request('show:standard', {
      title: `Delete Working Document?`,
      bodyHtml: `<p>This action will permanently delete this working document from this dispute. This action cannot be undone. If you do not want to delete this document, press Cancel.</p>`,
      primaryButtonText: 'Delete Document',
      onContinueFn: (modal) => {
        modal.close();
        deleteFn();
      }
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['trimFileNamesTo']);
    this.file_model = filesChannel.request('get:file', this.model.get('file_id'));
    if (!this.file_model) {
      console.log(`[Warning] File id exists on outcome doc, but not returned in disputeFiles`);
    }
  },

  templateContext() {
    return {
      Formatter,
      trimFileNamesTo: this.trimFileNamesTo,
      file_model: this.file_model
    };
  }
});
