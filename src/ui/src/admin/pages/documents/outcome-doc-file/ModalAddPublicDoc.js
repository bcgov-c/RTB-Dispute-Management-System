import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import FilesView from '../../../../core/components/files/Files';
import template from './ModalAddPublicDoc_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const filesErrorClassSelector = '.add-files-error-block';
const NO_FILES_ERROR_MSG = `Add a valid file to continue`;

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const documentsChannel = Radio.channel('documents');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'addOutcomePublicDoc_modal',

  className: 'modal modal-rtb-default',

  regions: {
    uploadRegion: '.addOutcomePublicDoc-upload',
    filesRegion: '.addOutcomePublicDoc-files',
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      save: '#addOutcomeDocFile_save',
    });
  },

  events() {
    return Object.assign({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave'
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    loaderChannel.trigger('page:load');

    const docConfigId = configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION');
    const fileConfig = documentsChannel.request('config:file', docConfigId) || {};

    this.fileUploader.uploadAddedFiles()
      .done(() => {
        loaderChannel.trigger('page:load');
        const uploadedFiles = this.fileUploader.files.getUploaded() || [];
        if (!uploadedFiles || !uploadedFiles.length) {
          generalErrorFactory.createHandler('ADMIN.FILES.UPLOAD', () => this.trigger('save:complete'))();
          return;
        }
        const outcomeFileDCN = this.model.getOutcomeFileDCN();
        const createdOutcomeFile = this.model.createOutcomeFile(
          _.extend({
              file_type: docConfigId,
              file_acronym: fileConfig.code,
              file_title: fileConfig.title,
              file_id: uploadedFiles[0].id,
              file_source: configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL'),
              visible_to_public: true
            },
            outcomeFileDCN ? { note_worthy: outcomeFileDCN.get('note_worthy'), materially_different: outcomeFileDCN.get('materially_different') } : {},
        
          ), { add: true });

        createdOutcomeFile.saveAll()
          .done(() => this.trigger('save:complete'))
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.SAVE.ALL', () => {
              this.trigger('save:complete');
            });
            handler(err);
          });
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.FILES.UPLOAD');
        handler(err);
      });

  },

  validateAndShowErrors() {
    this.hideFilesError();

    let isValid = true;

    if (!this.fileUploader.files.getReadyToUpload().length) {
      this.$(filesErrorClassSelector).html(NO_FILES_ERROR_MSG);
      isValid = false;
    }

    return isValid;
  },


  initialize(options) {
    if (!(options || {}).model) {
      console.log(`[Error] Need the outcome document group model to add public document to`);
      return;
    }

    this.dispute = disputeChannel.request('get');
    
    this.OUTCOME_DOC_FILE_TITLE_MAX_LENGTH = configChannel.request('get', 'OUTCOME_DOC_FILE_TITLE_MAX_LENGTH') || 45;
    this.OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH = configChannel.request('get', 'OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH') || 4;

    this.fileUploader = filesChannel.request('create:uploader', {
      processing_options: {
        maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
        maxNumberOfFiles: 1,
        checkForDisputeDuplicates: false,
        allowedFileTypes: configChannel.request('get', 'VALID_OUTCOME_DOC_FILE_TYPES')
      },
      file_creation_fn: function() {
        return _.extend(this.defaultFileCreationFn(...arguments), {
          file_type: configChannel.request('get', 'FILE_TYPE_ANONYMOUS_EXTERNAL')
        });
      }
    });
    
    this.setupListeners();
  },

  _getFileStatusOptions() {
    const display_config = configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_STATUS_DISPLAY') || {};

    return ['OUTCOME_DOC_FILE_SUB_STATUS_NOT_SET',
        'OUTCOME_DOC_FILE_SUB_STATUS_NOT_STARTED',
        'OUTCOME_DOC_FILE_SUB_STATUS_IN_PROGRESS',
        'OUTCOME_DOC_FILE_SUB_STATUS_REVIEW',
        'OUTCOME_DOC_FILE_SUB_STATUS_COMPLETED']
      .map(configCode => {
        const value = configChannel.request('get', configCode);
        return { value: String(value), text: display_config[value] };
      });
  },

  setupListeners() {
    this.listenTo(this.fileUploader.files, 'update', this.hideFilesError, this);
  },

  hideFilesError() {
    this.$(filesErrorClassSelector).html('');
  },

  onBeforeRender() {
    if (this.fileUploader && this.fileUploader.isRendered()) {
      this.detachChildView('uploadRegion');
    }
  },

  onRender() {
    this.showChildView('uploadRegion', this.fileUploader);
    this.showChildView('filesRegion', new FilesView({ collection: this.fileUploader.files }));
  },

  templateContext() {
    return {
      Formatter
    };
  }
});