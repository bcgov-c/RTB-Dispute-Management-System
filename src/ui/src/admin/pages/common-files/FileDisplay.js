import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import FileCollection from '../../../core/components/files/File_collection';
import ModalAddFileBaseView from '../../../core/components/modals/modal-add-file-base/ModalAddFileBase';
import template from './FileDisplay_template.tpl';

const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  className: 'file-display',
  ui: {
    delete: '.file-display-delete',
    info: '.file-display-info',
    edit: '.file-display-edit',
    filename: '.filename-download',
    thumbnail: '.file-display-image-container'
  },
  events: {
    'click @ui.delete': 'clickDelete',
    'click @ui.edit': 'clickEdit',
    'click @ui.filename': 'clickFilePreview',
    'click @ui.info': 'clickInfo',
    'click @ui.thumbnail': 'clickFilePreview'
  },

  clickFilePreview(ev) {
    if (this.enableFilePreview) filesChannel.request('click:filename:preview', ev, this.model, { fallback_download: true });
    else this.model.download();
  },

  clickDelete() {
    this.model.trigger('click:delete', this.model);
  },

  clickEdit() {
    const file = this.collection.models.filter((file) => {
      return file.get('common_file_id') === this.model.get('common_file_id');
    });
    
    const modalAddFile = new ModalAddFileBaseView({
      title: this.editModalTitle,
      editMode: true,
      inUseFiles: this.collection.models,
      files: new FileCollection(file),
      saveButtonText: 'Update Common File',
      mobileSaveButtonText: null,
      showDelete: false,
      model: this.model,
      fileType: this.model.get('file_type'),
      processing_options: {
        maxNumberOfFiles: 1,
        allowedFileTypes: configChannel.request('get', 'VALID_PDF_ONLY_FILE_TYPES')
      }
     });
    modalChannel.request('add', modalAddFile);

    this.listenTo(modalAddFile, 'save:complete', () => {
      this.collection.trigger('page:refresh');
      loaderChannel.trigger('page:load:complete');
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['collection', 'showThumbnails', 'editModalTitle', 'infoTitle', 'infoDescription', 'showDelete', 'showEdit', 'showInfo', 'showModelType', 'enableFilePreview', 'childIndex']);

    if (!_.isBoolean(this.enableFilePreview)) this.enableFilePreview = true;
  },

  onRender() {
    this.getUI('info').popover();
  },

  templateContext() {
    return {
      showThumbnails: this.showThumbnails,
      Formatter,
      file: this.model,
      modelTypeIconUrl: this.showModelType && require(`../../static/${this.model.get('common_file_id') ? 'Icon_Admin_Attach_Common.png' : 'Icon_Admin_Attach_Dispute.png'}`),
      showModelType: this.showModelType,
      showDelete: this.showDelete,
      showEdit: this.showEdit,
      showInfo: this.showInfo,
      noControls: !this.showModelType && !this.showDelete && !this.showEdit && !this.showInfo,
      showComma: _.isNumber(this.childIndex) && ((this.collection||[]).length - 1) !== this.childIndex,
      infoTitle: this.infoTitle || this.model.get('file_title') || 'No Title Provided',
      infoDescription: this.infoDescription || this.model.get('file_description' ) || '',
    };
  }
})