import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import EditableComponentView from '../../../../core/components/editable-component/EditableComponent';
import DisputeOutcomeExternalFileView from './DisputeOutcomeExternalFile';
import FileCollection from '../../../../core/components/files/File_collection';
import ModalAddFiles from '../../../../core/components/modals/modal-add-files/ModalAddFiles';
import ModalGeneratedOutcomeDoc from '../../../components/decision-generator/ModalGeneratedOutcomeDoc';
import template from './DisputeOutcomeDocFile_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import ModalAddClaim from '../../../components/modals/modal-add-claim/ModalAddClaim';
import DisputeClaim_model from '../../../../core/components/claim/DisputeClaim_model';
import OutcomeDocFileUploadValidation from './OutcomeDocFileUploadValidation';

let UAT_TOGGLING = {};

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const filesChannel = Radio.channel('files');
const documentsChannel = Radio.channel('documents');
const claimsChannel = Radio.channel('claims');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');

export default Marionette.View.extend({
  template,
  className() {
    return `standard-list-item outcome-doc-file-container ${this.model.isOther() ? 'other-doc-file' : ''}`;
  },

  regions: {
    statusRegion: '.outcome-doc-file-status',
    commentRegion: '.outcome-doc-file-comment',
    sourceRegion: '.outcome-doc-file-source',
    visibleRegion: '.outcome-doc-file-visible',

    uploadsRegion: '.outcome-doc-file-uploads'
  },

  ui: {
    sourceActionBtn: '.outcome-doc-file-source-btn',
    deleteBtn: '.outcome-doc-file-delete-btn',
    uploadDeleteBtn: '.outcome-doc-file-uploads-delete-btn'
  },

  events: {
    'click @ui.sourceActionBtn': 'clickSourceActionBtn',
    'click @ui.uploadDeleteBtn': 'clickUploadDelete',
    'click @ui.deleteBtn': 'clickDelete'
  },

  _clickExternalSourceActionBtn() {
    const files = new FileCollection();
    const isPublic = this.model.isPublic();
    const hadUploadedFile = this.fileModel?.isUploaded();
    const validator = new OutcomeDocFileUploadValidation({ outcomeDocFile: this.model, outcomeGroupModel: this.outcomeGroupModel });
    const modal = new ModalAddFiles({
      title: 'Upload Final Document',
      fileType: isPublic ? configChannel.request('get', 'FILE_TYPE_ANONYMOUS_EXTERNAL') : configChannel.request('get', 'FILE_TYPE_INTERNAL'),
      isOnlyFiles: true,
      files,
      showDelete: false,
      autofillRename: true,
      extra_file_creation_fn: isPublic ? (fileData) => Object.assign(fileData, { editable: false, display_mode: true }) : null,
      processing_options: {
        maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
        errorModalTitle: 'Adding Outcome Document File',
        maxNumberOfFilesErrorMsg: `Only one final document can be uploaded.  If you have more than one PDF document for the same outcome document file, they must be combined into a single PDF document.`,
        maxNumberOfFiles: 1,
        checkForDisputeDuplicates: false,        
        allowedFileTypes: configChannel.request('get', 'VALID_OUTCOME_DOC_FILE_TYPES'),
        customFileValidationErrorMsg: validator.customFileValidationErrorMsg.bind(validator),
        customFileValidationFn: validator.customFileValidationFn.bind(validator),
      }
    });

    this.stopListening(modal);
    this.listenTo(modal, 'save:complete', () => {
      const uploadedFiles = files.getUploaded() || [];
      const uploadedFile = !_.isEmpty(uploadedFiles) ? uploadedFiles[0] : null;
      const fileId = uploadedFile && uploadedFile.id;
      const outcomeFileDCN = this.outcomeGroupModel?.getOutcomeFileDCN();
      const saveFn = (attrs={}) => {
        this.fileModel = uploadedFile;
        const saveAttrs = Object.assign({
          file_id: fileId
        }, isPublic && outcomeFileDCN ? {
          // Make sure current state of the UI-selection for note_worthy and materially_different is saved
          note_worthy: outcomeFileDCN.get('note_worthy'),
          materially_different: outcomeFileDCN.get('materially_different'),
        } : null, attrs);

        this.model.save(saveAttrs)
          .done(() => {
            this.reinitialize();
            this.render();
            this.switchToEditState();
            loaderChannel.trigger('page:load:complete');
          })
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.SAVE', () => {
              this.render();
              this.switchToEditState();
            });
            handler(err);
          });
      };

      loaderChannel.trigger('page:load');
      // If this was a public decision with a file already, then re-trigger a Posted Data collection event by
      // saving VisibleToPublic as false and then saving as true again. Delete and Create events will be created
      // If uploading the first file, also trigger a PATCH visible=true
      if (isPublic && (!hadUploadedFile || this.model.get('visible_to_public'))) {
        this.model.save({ visible_to_public: false, file_id: fileId })
          .done(() => saveFn({ visible_to_public: true }))
          .fail(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.SAVE'));
      } else {
        saveFn();
      }
    });
    modalChannel.request('add', modal);
  },

  _clickGeneratedActionBtn() {
    const isDoubleNoShow = (configChannel.request('get', 'file_types_double_no_show')||[]).includes(this.model.get('file_type'));
    const claims = claimsChannel.request('get:full').removeAllRemovedClaimsAndEvidence();
    const attendedOrUnknownHearingParticipations = [];
    const hearings = hearingChannel.request('get');
    const latestHearing = hearings?.getLatest();
    
    if (latestHearing) {
      latestHearing.getParticipations().forEach(p => {
        const isValid = p.get('participant_model') && !p.get('participant_model')?.isRemoved();
        const isAttendedOrUnknown = p.isAttendStatusUnknown() || p.didAttend();
        if (isValid && isAttendedOrUnknown) {
          attendedOrUnknownHearingParticipations.push(p);
        }
      });
    }

    if (this.model.isDirectRequest()) {
      if (this.model.isOrderOfPossession() || this.model.isMonetaryOrder()) {
        if (!this.dispute.isNonParticipatory() || latestHearing?.getDisputeHearings().length > 1 || this.dispute.isCreatedRentIncrease()) {
          return modalChannel.request('show:standard', {
            title: `Invalid Dispute Characteristics`,
            bodyHtml: `<p>
              This template can only be generated on disputes that are not linked to a shared hearing, are not ARI-C, ARI-E (rent increase) files, and that are currently assigned a non-participatory process.   Use manual creation and the upload option for these other disputes to add  your orders to DMS.
            </p>`,
            hideContinueButton: true,
            cancelButtonText: 'Close',
          });
        }
      } else if (!this.dispute.isNonParticipatory()) {
        return modalChannel.request('show:standard', {
          title: `Invalid Dispute Process`,
          bodyHtml: `<p>
            This template can only be generated on disputes that are currently assigned a non-participatory process.  Please update the DMS process for this dispute file if it is incorrect and run this process again.  If this is not a non-participatory dispute file, this template should not be used.
          </p>`,
          hideContinueButton: true,
          cancelButtonText: 'Close',
        });
      }
    }

    // TODO: Centralize what these lookups are - "participatory" decisions? "deprecated" issues list?
    if ([2, 3, 10, 11, 15, 1].includes(this.model.get('file_type')) &&
      claims.find(c => [137, 138, 139, 140, 201].includes(c.get('clam_code')))
    ) {
      return modalChannel.request('show:standard', {
        title: `Deprecated Issues Detected`,
        bodyHtml: `<p>
          This template can only be generated when the issues on the dispute file have associated decision generation content and rules.  This dispute has been detected to contain an older code that includes; OPR-DR-PP, OPU-DR-PP, OPR-PP, OPU-PP, MT. There are content generation content and rules for these older issues.  Use manual creation for decisions on this dispute file.
        </p>`,
        hideContinueButton: true,
        cancelButtonText: 'Close',
      });
    }

    if ([2, 20].includes(this.model.get('file_type')) &&
      (!latestHearing?.isSingleApp() || hearings?.any(h => !h.checkIsDisputePrimaryLink(this.dispute)))
    ) {
      return modalChannel.request('show:standard', {
        title: `Invalid Hearing State for Generation`,
        bodyHtml: `<p>
          The template cannot be generated on a decision where dispute was not the primary in a past hearing (and that attendance cannot be verified) or where it currently shares its latest hearing with another dispute file. You must use legacy decision generator to generate a decision on this dispute file.
        </p>`,
        hideContinueButton: true,
        cancelButtonText: 'Close',
      });
    }

    if ([20].includes(this.model.get('file_type')) &&
      claims.find(c => !c.hasOutcomeSettled() && !c.hasOutcomeAmend())
    ) {
      return modalChannel.request('show:standard', {
        title: `Invalid Issue State for Generation`,
        bodyHtml: `<p>
          The template can only be generated on a decision where all of the issue outcomes have been set to settled or amend removed.  You must use legacy decision generation if you want to continue with a settlement agreement for this dispute file.
        </p>`,
        hideContinueButton: true,
        cancelButtonText: 'Close',
      });
    }
    //Must have ALL issues that are decided have an outcome of amend removed or settled on the dispute file (ALL remedy status in 15,16,17,18,19 = settled OR  remedy status 25 = amend removed)

    if (isDoubleNoShow) {
      if (attendedOrUnknownHearingParticipations.length) {
        modalChannel.request('show:standard', {
          title: `Invalid Hearing Data`,
          bodyHtml: `<p>
            This template can only be generated once all parties have been indicated as Not Attending on the latest hearing for this dispute. Please update DMS to reflect no hearing attendance on the latest hearing and run this process again.
          </p>`,
          hideContinueButton: true,
          cancelButtonText: 'Close',
        });
        return;
      }
    }

    // Check for LRSD and hold deposit issues
    if (claims.find(c => c.isLandlordDeposit()) && !claims.find(c => c.isRetainSecurityDeposit())) {
      const preLoadedClaim = new DisputeClaim_model({ claim_code: configChannel.request('get', 'LL_RETAIN_SECURITY_DEPOSIT_CODE') });
      const modalAddClaim = new ModalAddClaim({ collection: claims, model: this.dispute, preLoadedClaim, is_post_notice: false, instructionsText: `This dispute file contains a monetary issue that includes a request to retain a security deposit and/or pet damage deposit. To generate this decision you must add an LRSD (Landlord Retain Security Deposit) issue to the dispute file.` });
      this.stopListening(modalAddClaim);
      this.listenToOnce(modalAddClaim, 'save:complete', claimModel => {
        modalChannel.request('remove', modalAddClaim);
        // Make sure added claim is added to all claims
        if (claimModel) claimsChannel.request('add:claim', claimModel);
        modalChannel.request('add', new ModalGeneratedOutcomeDoc({ model: this.model }));
      });
      modalChannel.request('add', modalAddClaim);
    } else if (!claims.find(c => c.isLandlordDeposit()) && claims.find(c => c.isRetainSecurityDeposit())) {
      modalChannel.request('show:standard', {
        title: 'Delete Issue?',
        bodyHtml: `<p>
          Warning - this dispute file does not contain any monetary issues that include a request to retain the security and/or pet damage deposit.
          There is an LRSD issue on this file that must be removed before this decision can be generated.
        </p>
        <p>Press Delete to remove the LRSD issue, or Cancel to return to the dispute file.
        </p>`,
        onContinueFn: (modalView) => {
          loaderChannel.trigger('page:load');
          modalView.close();
          const claim = claims.find(c => c.isRetainSecurityDeposit());
          if (claim) {
            // Delete the issue the same way that deletes happen on the DisputeView
            claim.setDeleted();
            claim.save().done(() => {
              claimsChannel.request('remove:claim', claim);
              modalChannel.request('add', new ModalGeneratedOutcomeDoc({ model: this.model }));
            }).fail(err => {
              loaderChannel.trigger('page:load');
              generalErrorFactory.createHandler('ADMIN.CLAIM.SAVE')(err)
            });
          } else {
            modalChannel.request('add', new ModalGeneratedOutcomeDoc({ model: this.model }));    
          }
        }
      });
    } else {
      modalChannel.request('add', new ModalGeneratedOutcomeDoc({ model: this.model }));
    }
  },

  clickSourceActionBtn() {
    if (this._isFileSourceExternal()) {
      this._clickExternalSourceActionBtn();
    } else if (this._isFileSourceGenerated() && this._canDecisionGeneratorBeRun()) {
      this.model.trigger('validate:docDate', this.model);
    }
  },

  clickUploadDelete() {
    if (!this._canAssociatedFileBeDeleted()) {
      alert('Cannot delete uploaded file, it may not be uploaded, or this outcome file may have associated deliveries', this.model, this);
      return;
    }

    const onDeleteFinishFn = () => {
      this.render();
      this.switchToEditState();
      loaderChannel.trigger('page:load:complete');
    };
    modalChannel.request('show:standard', {
      title: `Delete Final Document?`,
      bodyHtml: `<p>This action will permanently delete this final document from this dispute. This action cannot be undone. If you do not want to delete this outcome document and its deliveries, press Cancel.</p>`,
      primaryButtonText: 'Delete',
      onContinueFn: (modal) => {
        modal.close();
        loaderChannel.trigger('page:load');
        const docDelete = !this.model.isPublic() && !this._isLastOutcomeDoc();
        this.performOutcomeDocDelete({ docDelete })
          .finally(() => onDeleteFinishFn());
      }
    });
  },

  clickDelete() {
    if (!this._canModelBeDeleted()) {
      alert('Cannot delete last outcome doc file, or a doc file with an uploaded pdf file', this.model, this);
      return;
    }
    modalChannel.request('show:standard', {
      title: `Delete Outcome Document?`,
      bodyHtml: `<p>This action will permanently delete this outcome document and all its associated document deliveries from this dispute. This action cannot be undone. If you do not want to delete this outcome document and its deliveries, press Cancel.</p>`,
      primaryButtonText: 'Delete Outcome Document',
      onContinueFn: (modal) => {
        modal.close();
        loaderChannel.trigger('page:load');
        this.performOutcomeDocDelete({ docDelete: this.model.isPublic() ? false : true })
          .finally(() => loaderChannel.trigger('page:load:complete'));
      }
    });
  },

  performOutcomeDocDelete(attrs={ docDelete: true }) {
    const isPublic = this.model.isPublic();
    return new Promise((res, rej) => {
      this.deleteDocAndFile(this.model, attrs)
        .then(() => {
          this.fileModel = null;
          // If no files can be anonymized, then remove the public doc
          if (!isPublic && !this.outcomeGroupModel.getOutcomeFiles().find(f => f.canBeAnonymized())) {
            const finalDoc = this.outcomeGroupModel.getOutcomeFilePublicFinal();
            if (finalDoc) return this.deleteDocAndFile(finalDoc);
          }
        })
        .then(() => res())
        .catch(rej);
    });
  },

  deleteDocAndFile(outcomeDocFile, attrs={ docDelete: true }) {
    const deleteAttrs = outcomeDocFile.isPublic() ? { skip_conflict_check: true } : {};
    return new Promise((res, rej) => {
      const uploadedFile = filesChannel.request('get:file', outcomeDocFile.get('file_id'));
      (uploadedFile ? filesChannel.request('delete:file', uploadedFile, deleteAttrs) : $.Deferred().resolve().promise())
        .done(() => {
          (attrs?.docDelete ? outcomeDocFile.destroy() : outcomeDocFile.save({ file_id: null }))
            .done(res)
            .fail(err => {
              loaderChannel.trigger('page:load:complete');
              generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.REMOVE', rej)(err);
            });
        })
        .fail(err => {
          loaderChannel.trigger('page:load:complete');
          generalErrorFactory.createHandler('ADMIN.FILE.REMOVE', rej)(err);
        });
    });
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};

    this.hasDecisionTemplates = this.model.config && !_.isEmpty(this.model.config.templates_for_decision);
    this.outcomeGroupModel = documentsChannel.request('get:group', this.model.get('outcome_doc_group_id'));
    this.fileModel = filesChannel.request('get:file', this.model.get('file_id'));
    this.dispute = disputeChannel.request('get');

    this.createSubModels();
    this.setEditGroup();
    this.setupListeners();
  },

  reinitialize() {
    this.createSubModels();
    this.setupListeners();
  },

  _canDecisionGeneratorBeRun() {
    return UAT_TOGGLING.SHOW_DECISION_GENERATOR && this.hasDecisionTemplates;
  },

  _isLastOutcomeDoc() {
    return this.outcomeGroupModel?.getOutcomeFiles()?.filter(f=> !f.isPublic() && !f.isExternal()).length === 1;
  },

  _canAssociatedFileBeDeleted() {
    return this.fileModel?.isUploaded() && this.model.getDeliveries().all(delivery => delivery.isNew())
        && (this.model.isPublic() ? !this.model.get('visible_to_public') : true);
  },

  _canModelBeDeleted() {
    return !this._isLastOutcomeDoc() && !this.fileModel?.isUploaded() && !this.model.isPublic();
  },

  _isFileSourceExternal() {
    return this.creationMethodDropdownModel.getData({ parse: true }) === configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL');
  },

  _isFileSourceGenerated() {
    return this.creationMethodDropdownModel.getData({ parse: true }) === configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_GENERATED');
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

  _getFileCreationMethodOptions() {
    return [
      ...(this._canDecisionGeneratorBeRun() ? [{ value: String(configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_GENERATED')), text: 'Generate' }] : []),
      { value: String(configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL')), text: 'External' },
    ];
  },

  createSubModels() {
    this.statusDropdownModel = new DropdownModel({
      optionData: this._getFileStatusOptions(),
      labelText: 'Status',
      required: true,
      value: this.model.get('file_sub_status') ? String(this.model.get('file_sub_status')) : 0,
      apiMapping: 'file_sub_status',
    });

    this.commentInputModel = new InputModel({
      labelText: 'Comment',
      value: this.model.get('internal_file_comment'),
      maxLength: configChannel.request('get', 'OUTCOME_DOC_FILE_COMMENT_MAX_LENGTH'),
      required: false,
      apiMapping: 'internal_file_comment',
    });

    const fileSource = this.model.get('file_source');
    const creationMethodOptions = this._getFileCreationMethodOptions();
    this.creationMethodDropdownModel = new DropdownModel({
      optionData: creationMethodOptions,
      labelText: 'Method',
      defaultBlank: false,
      required: true,
      value: creationMethodOptions.length ? creationMethodOptions[0].value : 
      fileSource && _.find(creationMethodOptions, opt => String(opt.value) === String(fileSource)) ? String(fileSource) : null,
      apiMapping: 'file_source',
    });

    this.visibilityDropdownModel = new DropdownModel({
      optionData: [{ value: true, text: 'Yes' }, { value: false, text: 'No' }],
      labelText: 'Visible to Public',
      required: this.model.isPublic(),
      disabled: !this.model.hasUploadedFile(),
      value: this.model.get('visible_to_public'),
      apiMapping: 'visible_to_public',
    });
  },

  setEditGroup() {
    this.editGroup = ['commentRegion', 'sourceRegion', 'visibleRegion'];
  },

  setupListeners() {
    this.listenTo(this.creationMethodDropdownModel, 'change:value', this.refreshSourceButtonUI, this);
    this.stopListening(this.model, 'documentDate:valid');
    this.listenTo(this.model, 'documentDate:valid', () => this._clickGeneratedActionBtn());
  },

  switchToEditState() {
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
    
    //Visible to Public
  },

  resetModelValues() {
    this.model.resetModel();
  },

  saveInternalDataToModel() {
    this.model.set(_.extend({},
      this.statusDropdownModel.getPageApiDataAttrs(),
      this.commentInputModel.getPageApiDataAttrs(),
      this.creationMethodDropdownModel.getPageApiDataAttrs(),
      this.visibilityDropdownModel.getPageApiDataAttrs()
    ));
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  
  _getSourceButtonText() {
    let buttonText = 'Edit';
    if (this._isFileSourceGenerated()) {
      buttonText = 'Preview';
    } else if (this.model.hasUploadedFile()) {
      buttonText = 'Replace';
    } else if (this._isFileSourceExternal()) {
      buttonText = 'Upload';
    }

    return buttonText;
  },

  _checkDeliveredAndDisableUpload() {
    const isDelivered = this.model.getDeliveries().findWhere({is_delivered: true});
    const ele = this.getUI('sourceActionBtn');

    if(isDelivered) {
      ele.addClass('disabled').attr('disabled', 'disabled');
    } else {
      ele.removeClass('disabled').removeAttr('disabled', 'disabled');
    }
  },

  refreshSourceButtonUI() {
    const ele = this.getUI('sourceActionBtn');

    if (!this.creationMethodDropdownModel.getData()) {
      ele.addClass('hidden');
    } else {
      ele.removeClass('hidden');
  }

    ele.text(this._getSourceButtonText());

    this._checkDeliveredAndDisableUpload();
  },

  onBeforeRender() {
    this.visibilityDropdownModel.set('disabled', !this.model.hasUploadedFile());
  },

  onRender() {
    this.showChildView('commentRegion', new EditableComponentView({
      label: '',
      view_value: this.model.get('internal_file_comment') ? this.model.get('internal_file_comment') : '-',
      subView: new InputView({ model: this.commentInputModel })
    }));

    this.showChildView('sourceRegion', new EditableComponentView({
      label: '',
      view_value: this.creationMethodDropdownModel.getData() ? this.creationMethodDropdownModel.getSelectedText() : '-',
      subView: new DropdownView({ model: this.creationMethodDropdownModel })
    }));

    this.showChildView('visibleRegion', new EditableComponentView({
      label: '',
      view_value: this.model.get('visible_to_public') ? 'Yes' : 'No',
      subView: new DropdownView({ model: this.visibilityDropdownModel })
    }));

    if (this.model.get('file_id')) {
      this.showChildView('uploadsRegion', new DisputeOutcomeExternalFileView({ trimFileNamesTo: 16, model: this.model }));
    }

    this._checkDeliveredAndDisableUpload();
  },

  templateContext() {
    return {
      hasUploadedFile: this.fileModel && this.fileModel.isUploaded(),
      showDelete: this._canModelBeDeleted(),
      showSourceButton: this.creationMethodDropdownModel.getSelectedText() || false,
      showUploadDelete: this._canAssociatedFileBeDeleted(),
      sourceButtonText: this._getSourceButtonText(),
      titleDisplay: this.model.getFileTitleDisplay(),
    };
  }
});
