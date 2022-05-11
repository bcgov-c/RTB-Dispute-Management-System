import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Filesize from 'filesize';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import ViewMixin from '../../../core/utilities/ViewMixin';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import template from './CeuEvidence_template.tpl';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className() {
    return 'evidence-item-container clearfix ' + (this.model.isIssueCustom() ? 'other-evidence' : '');
  },

  ADD_TITLE_ERROR_LINK_CLASS: 'error-block-add-title-link',

  ui() {
    return {
      selectedActionLink: '.selected-action-link',
      changeActionLink: '.selected-action-change-link',
      editEvidenceLink: '.edit-evidence-link',
      deleteOtherEvidenceLink: '.other-evidence-delete-link',
      addTitleErrorLink: `.${this.ADD_TITLE_ERROR_LINK_CLASS}`,
      error: '.error-block'
    };
  },

  regions: {
    dropdownRegion: '.evidenceActionSelector'
  },

  events: {
    'click @ui.selectedActionLink': 'clickSelectedActionLink',
    'click @ui.changeActionLink': 'clickChangeActionLink',
    'click @ui.editEvidenceLink': 'showFileUploadModal',
    'click @ui.deleteOtherEvidenceLink': 'clickDeleteOtherEvidenceLink',
    'click @ui.addTitleErrorLink': 'clickAddTitleErrorLink'
  },

  uploaded_evidence_files: null,
  initialize() {
    this.checkAndSyncFiles();

    if (!this.model.get('mustUploadNow')) {
      const EVIDENCE_METHODS_DISPLAY = configChannel.request('get', 'CEU_EVIDENCE_METHODS_DISPLAY');
      this.model.get('selectedActionPicklist').set('optionData', [
        'EVIDENCE_METHOD_UPLOAD_NOW',
        'EVIDENCE_METHOD_UPLOAD_LATER',
        'EVIDENCE_METHOD_CANT_PROVIDE'
      ].map(code => {
        const value = configChannel.request('get', code);
        const text = EVIDENCE_METHODS_DISPLAY[value];
        return { value, text };
      }));
    }

    this.stopListening(this.model.get('selectedActionPicklist'), 'change:value', this.onChangeDropdown, this);
    this.listenTo(this.model.get('selectedActionPicklist'), 'change:value', this.onChangeDropdown, this);
    this.stopListening(this.model, 'show:upload', this.showFileUploadModal, this);
    this.listenTo(this.model, 'show:upload', this.showFileUploadModal, this);

    this.listenTo(this.model, 'open:help', () => this.$('.help-icon:visible').trigger('click.rtb-help'));
  },

  onChangeDropdown(model, value) {
    // Any time the dropdown value is changed, save the model
    // Only apply the changes when selected a real option from the dropdown
    this.model.saveInternalDataToModel();
    // If the file description hasn't been saved, save it
    if (value) {
      this.model.set(this.model.getApiChangesOnly());
      this.render();
    }
    if (String(value) === '100') {
      this.showFileUploadModal();
    }
  },

  checkAndSyncFiles() {
    if (this.uploaded_evidence_files) {
      // If uploaded evidence files has already been set, no need to sync
      return;
    }
    
    // Otherwise, sync the DisputeEvidenceModel's files.
    // If no files are present, create them from the FileManager and set them
    let model_file_collection = this.model.get('files');
    if (!model_file_collection) {
      model_file_collection = filesChannel.request('get:filedescription:files', this.model.get('file_description'));
      this.model.set('files', model_file_collection);
    }
    this.uploaded_evidence_files = model_file_collection;

    this.stopListening(this.uploaded_evidence_files);
    this.listenTo(this.uploaded_evidence_files, 'destroy', function() {
      this.model.trigger('update:evidence');
      this.render();
    }, this)
    this.listenTo(this.uploaded_evidence_files, 'change:upload_status', function() {
      this.model.trigger('update:evidence');
    }, this);
    this.listenTo(this.uploaded_evidence_files, 'reset', function() {
      this.model.trigger('update:evidence');
      this.render();
    }, this);
  },


  showFileUploadModal() {
    this.checkAndSyncFiles();

    const originalFileModels = [...this.uploaded_evidence_files.models];

    const modalAddFiles = new ModalAddFiles({
      model: this.model,
      files: this.uploaded_evidence_files,
      processing_options: {
        checkForDisputeDuplicates: false
      },
      filePackageId: null,
      noUploadOnSave: true,
      hideDescription: true,
      isDescriptionRequired: false,
    });
    
    let shouldResetFiles = true;
    this.stopListening(modalAddFiles);
    this.listenTo(modalAddFiles, 'save:complete', function() {
      shouldResetFiles = false;
      this.render();
      loaderChannel.trigger('page:load:complete');
    }, this);
    this.listenTo(modalAddFiles, 'delete:complete', function() {
      shouldResetFiles = false;
      // If we are deleting all, re-ID the evidence to fake it being new
      this.model.set('e_evidence_guid', UtilityMixin.util_generateUUIDv4());

      this.uploaded_evidence_files.reset([], { silent: true });
      this.model.get('selectedActionPicklist').set('value', null, { silent: true });
      this.render();
      loaderChannel.trigger('page:load:complete');
    }, this);

    this.listenTo(modalAddFiles, 'removed:modal', function() {
      if (shouldResetFiles) this.uploaded_evidence_files.reset(originalFileModels);
      
      // Filter out any invalid files
      this.uploaded_evidence_files.reset(this.uploaded_evidence_files.filter(f => f.isReadyToUpload()));
      try {
        modalAddFiles.destroy();
      } catch (err) {
        // JS error cleaning up modal, pass
      }
    });

    this._warningDisplaying = false;
    this.stopListening(modalAddFiles, 'upload:complete');
    this.listenTo(modalAddFiles, 'upload:complete', function() {
      if (this._warningDisplaying) {
        return;
      }
      this._warningDisplaying = true;
      filesChannel.request('show:upload:error:modal', this.uploaded_evidence_files.filter(f => f.isUploadError()), () => this._warningDisplaying = false);
    }, this);

    modalChannel.request('add', modalAddFiles);
  },

  clickSelectedActionLink() {
    const selected_action = this.model.get('selectedActionPicklist').get('value');
    if (selected_action === '100') {
      this.showFileUploadModal();
    } else if (selected_action === '101') {
      // We are in "upload later", button means "upload now"
      this.model.get('selectedActionPicklist').set('value', '100');
    } else {
      console.log(`[Warning] UI option clicked but not defined`)
    }
  },

  clickChangeActionLink() {
    this.model.get('selectedActionPicklist').set('value', null);
    this.render();
  },

  clickDeleteOtherEvidenceLink() {
    const deleteFn = _.bind(function() {
      loaderChannel.trigger('page:load');
      filesChannel.request('delete:filedescription:full', this.model, { intakeEvidenceRules: true })
      .always(function() {
        loaderChannel.trigger('page:load:complete');
      });
    }, this)

    if (this.uploaded_evidence_files && this.uploaded_evidence_files.length) {
      modalChannel.request('show:standard', {
        title: 'Delete User Evidence?',
        bodyHtml: `<p>Are you sure you want to completely remove this evidence and the following files associated to it?</p>`+
          `<ul><li>${this.uploaded_evidence_files.pluck('file_name').join('</li><li>')}</li></ul>`+
          `<p>This action cannot be undone.</p>`,
        primaryButtonText: 'Yes, delete all',
        onContinueFn: function(modalView) {
          modalView.close();
          deleteFn();
        }
      })
    } else {
      deleteFn();
    }
    
  },

  clickAddTitleErrorLink() {
    this.model.get('selectedActionPicklist').set('value', '100', this);
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      if (!childView) {
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        return;
      }

      if (!childView.$el) {
        return;
      }
      if (!childView.$el.is(':visible')) {
        return;
      }

      is_valid = childView.validateAndShowErrors() & is_valid;
    }, this);

    // Custom validation for when "Upload now" is chosen, but no files uploaded
    if (this.isUploadNowButNoFiles()) {
      is_valid = false;
      const validationError = 'Please upload evidence files or select to provide them later';
      this.showErrorMessage(validationError);
    } else if (this.model.isIssueCustom() && !this.model.get('file_description').get('title')) {
      // Custom validation for when "other evidence" but no files
      is_valid = false;
      const validationError = `Please <span class="${this.ADD_TITLE_ERROR_LINK_CLASS}">add a title</span> to this evidence you have added`;
      this.showErrorMessage(validationError);
    }

    return is_valid;
  },

  isUploadNowButNoFiles() {
    return String(this.model.get('file_description').get('file_method')) === '100' &&
        !this.uploaded_evidence_files.length;
  },

  onRender() {
    this.showChildView('dropdownRegion', new DropdownView({ model: this.model.get('selectedActionPicklist') }));
    ViewMixin.prototype.initializeHelp(this, this.model.get('helpHtml'));
  },

  removeErrorStyles() {
    this.getUI('error').html('');
  },

  // Displays an error message
  showErrorMessage(error_msg) {
    this.getUI('error').html(error_msg);
  },

  templateContext() {
    const evidenceMethodsDisplay = configChannel.request('get', 'CEU_EVIDENCE_METHODS_DISPLAY'),
      selected_action = this.model.get('selectedActionPicklist').get('value'),
      link_name = selected_action === '100' ? 'upload' : (selected_action === '101' ? 'upload now' : ''),
      file_method_class = this.isUploadNowButNoFiles() ? 'action-pending' : 'action-later',
      filesSize = Filesize(this.uploaded_evidence_files.reduce(function(memo, file_model) { return memo + file_model.get('file_size'); }, 0)),
      filesModifiedDate = this.uploaded_evidence_files.reduce(function(memo, file_model) {
        const date = Moment(file_model.get('ui_added_date'));
        if (!memo || date.isAfter(memo)) {
          return date;
        }
      }, null),
      file_description = this.model.get('file_description'),
      titleDisplay = file_description.get('title') ? file_description.get('title') : this.model.OTHER_EVIDENCE_DEFAULT_TITLE;

    return {
      selected_action,
      link_name,
      file_method_class,
      filesSize,
      titleDisplay,
      isIssueCustom: this.model.isIssueCustom(),
      filesModifiedDate: Formatter.toDateDisplay(filesModifiedDate),
      EVIDENCE_METHODS_DISPLAY: evidenceMethodsDisplay,
      files: this.uploaded_evidence_files && !this.uploaded_evidence_files.isEmpty() ? this.uploaded_evidence_files.models : null,
      helpHtml: this.model.get('helpHtml')
    };
  }
});
