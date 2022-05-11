/**
 * @class core.components.files.FileView
 * @memberof core.components.files
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../input/Input';
import template from './File_template.tpl';

const COLOR_GRAY_CLASS_NAME = 'info-gray';
const DUPLICATE_RENAME_ERROR_MESSAGE = 'Duplicate file name entered';

const error_state_text = {
  type_error: {
    label: `type not allowed - not added`,
    help: ''
  },

  video_size_error: {
    label: `video file over the limit - not added`,
    help: ''
  },

  file_size_error: {
    label: `file over the limit - not added`,
    help: '',
  },

  empty_size_error: {
    label: 'file size could not be determined - not added',
    help: ''
  },

  empty_size_upload_error: {
    label: 'file size could not be determined during upload - not added',
    help: ''
  },

  upload_error: {
    label: 'error uploading file - not added',
    help: ''
  },

  cancelled: {
    label: 'upload cancelled - not added',
    help: ''
  }
};

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'file-container clearfix',

  regions: {
    renameInputRegion: '.file-rename'
  },

  ui: {
    'progress.container': '.file-progress-bar-container',
    progressbar: '.file-progress-bar',
    displayName: '.file-rename-display-name',
    displayNameText: '.file-rename-display-name > span',
    displayNameIcon: '.file-rename-display-name > b',
    download: '.filename-download',
    remove: '.file-remove',
    delete: '.file-delete'
  },

  events: {
    'click @ui.remove': 'clickRemove',
    'click @ui.delete': 'clickDelete',
    'click @ui.download': 'clickDownload'
  },

  clickDownload() {
    this.model.download();
  },

  clickRemove() {
    this.removeFromCollection();
  },

  removeFromCollection() {
    if (this.model.collection) {
      this.model.collection.remove(this.model);
    }
  },

  clickDelete() {
    if (this.model.isNew()) {
      console.log(`[Warning] Trying to delete a file that has not yet been added.  No action needed`);
    } else {
      // Trigger an event so the containing object can also clean up the link file
      this.model.trigger('delete:file', this.model);
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['showDelete']);
    this.showDelete = typeof this.showDelete === 'undefined' ? true : this.showDelete;

    this.listenTo(this.model, 'change:error_state', this.render, this);
    this.listenTo(this.model, 'change:upload_status', this.render, this);
    this.listenTo(this.model, 'update:progress', this.updateProgressBar, this);
    this.listenTo(this.model.get('renameInputModel'), 'change', this.updateFileNameDisplay, this);
  },

  removeErrorStyles() {
    const renameView = this.getChildView('renameInputRegion');
    if (renameView && renameView.$el.is(':visible')) {
      renameView.removeErrorStyles();
    }
  },

  updateFileNameDisplay() {
    if (this.model.get('upload_status') !== 'ready' && !this.model.get('editable')) {
      return;
    }

    const hasBeenRenamed = this.hasBeenRenamed();
    if (hasBeenRenamed) {
      this.getUI('displayName').addClass(COLOR_GRAY_CLASS_NAME);
      this.getUI('displayNameIcon').removeClass('hidden');
    } else {
      this.getUI('displayName').removeClass(COLOR_GRAY_CLASS_NAME);
      this.getUI('displayNameIcon').addClass('hidden');
    }
    
    // Now replace the original name with what the user has typed
    this.getUI('displayNameText').text(this.model.getRenamedFilenameWithExtension());

    this.model.trigger('change:rename:value');
  },

  updateProgressBar(progress) {
    const progressbar_container_ele = this.getUI('progress.container');
    const progressbar_ele = this.getUI('progressbar');

    progressbar_container_ele.removeClass('processing-file-uploading-loader');
    if (progressbar_ele && progressbar_ele.length) {
      progressbar_ele.progressbar({ value: progress });
    }
  },

  validateAndShowErrors() {
    const renameView = this.getChildView('renameInputRegion');

    let is_valid = true;
    if (!renameView || !renameView.$el.is(':visible')) {
      return true;
    }

    is_valid = renameView.validateAndShowErrors();

    if (is_valid && this.model.collection) {
      const rename = this.model.getRenamedFilenameWithExtension();
      const nameMatchFn = (fileModel) => {
        if (fileModel === this.model) {
          return;
        }
        return _.contains([fileModel.get('file_name'), fileModel.getRenamedFilenameWithExtension()], rename);
      };

      if (this.model.collection.find(nameMatchFn)) {
        renameView.showErrorMessage(DUPLICATE_RENAME_ERROR_MESSAGE);
        is_valid = false;
      }
    }

    return is_valid;
  },

  canBeRenamed() {
    return (this.model.get('upload_status') === 'ready' && !this.model.get('display_mode')) || this.model.get('editable');
  },

  hasBeenRenamed() {
    return this.canBeRenamed() && this.model.getRenamedFilenameWithExtension() !== this.model.get('original_file_name');
  },

  showErrorMessage(errMsg) {
    const inputView = this.getChildView('renameInputRegion');
    inputView.showErrorMessage(errMsg);
  },

  onRender() {
    if (this.canBeRenamed()) {
      this.showChildView('renameInputRegion', new InputView({ model: this.model.get('renameInputModel') }));
    }
  },

  templateContext() {
    const error_state = this.model.get('error_state');
    const error_message = _.has(error_state_text, error_state) ? error_state_text[error_state].label : null;
    const error_help = _.has(error_state_text, error_state) ? error_state_text[error_state].help : null;
    const fileSize = Formatter.toFileSizeDisplay(this.model.get('file_size'));
    return {
      COLOR_GRAY_CLASS_NAME,
      error_message,
      error_help,
      fileSize,
      file_display_name: this.model.getRenamedFilenameWithExtension(),
      hasBeenRenamed: this.hasBeenRenamed(),
      showDelete: this.showDelete,
    };
  }
});
