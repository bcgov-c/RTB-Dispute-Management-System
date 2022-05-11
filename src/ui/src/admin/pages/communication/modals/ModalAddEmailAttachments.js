import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import CreateEmailAttachmentsView from './CreateEmailAttachments';
import { FileAttachmentCollectionView } from './FileAttachmentCheckbox';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import Checkbox_model from '../../../../core/components/checkbox/Checkbox_model';
import Checkbox from '../../../../core/components/checkbox/Checkbox';

const COMMON_FILES_DROPDOWN_CODE = '1';
const DISPUTE_FILES_DROPDOWN_CODE = '2';

const noticeChannel = Radio.channel('notice');
const claimsChannel = Radio.channel('claims');
const documentsChannel = Radio.channel('documents');
const participantChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const ModalAddEmailAttachments = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['files', 'maxFileSizeBytes', 'linkedNoticeFileModels']);
    this.fileListScroll = 0;

    this.noticeFileModels = [
      ..._.flatten(noticeChannel.request('get:all').map(notice => notice.getNoticeFileModels())),
      ...(this.linkedNoticeFileModels && this.linkedNoticeFileModels.length ? this.linkedNoticeFileModels : [])
    ];

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.fileAttachmentCollection = null;

    this.fileSourceModel = new DropdownModel({
      optionData: [{ value: COMMON_FILES_DROPDOWN_CODE, text: 'Common File' },
        { value: DISPUTE_FILES_DROPDOWN_CODE, text: 'Dispute File' }
      ],
      labelText: 'File Source',
      defaultBlank: false,
      value: DISPUTE_FILES_DROPDOWN_CODE
    });

    const optionData = this._getFileTypeOptions();
    this.fileTypeModel = new DropdownModel({
      optionData,
      labelText: 'File Type',
      defaultBlank: false,
      value: optionData.length ? optionData[0].value: null
    });

    const hasRemoved = this.getRemovedAndDeficientFiles(this.files).length;
    this.removedFilterModel = new Checkbox_model({
      html: `Include Removed and Marked Deficient`,
      checked: !!hasRemoved,
    });

    this.linkedNoticesCheckbox = new Checkbox_model({
      html: `Include linked file notices`,
      checked: true,
      disabled: true,
    });
  },

  setupListeners() {
    this.listenTo(this.fileSourceModel, 'change:value', () => {
      const optionData = this._getFileTypeOptions();
      this.fileTypeModel.set({
        optionData,
        value: optionData.length ? optionData[0].value : null
      }, { silent: true });
      this.fileListScroll = 0;
      this.render();
    });

    this.listenTo(this.fileTypeModel, 'change:value', () => {
      this.fileListScroll = 0;
      this.render();
    });

    this.listenTo(this.removedFilterModel, 'change:checked', () => {
      this.fileListScroll = 0;
      this.render();
    });

    this.listenTo(this.files, 'add remove', () => this.render());
    
    this.listenTo(this.files, 'click:delete', fileModel => {
      this.files.remove(fileModel, { silent: true });
      this.render();
    });

    this.stopListening(this.files, 'error:size');
    this.listenTo(this.files, 'error:size', this.showFileErrorMessage, this);
  },

  _getFileTypeOptions() {    
    return (this.isCommonFilesSelected() ? [
      { configCode: 'COMMONFILE_TYPE_HELP_FILE', text: 'RTB File' },
      { configCode: 'COMMONFILE_TYPE_RTB_FORM', text: 'RTB Form' }
    ] : [
      { configCode: 'FILE_TYPE_NOTICE', text: 'Notices' },
      { configCode: 'FILE_TYPE_USER_EXTERNAL_EVIDENCE', text: 'Participant Evidence' },
      { configCode: 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE', text: 'Participant Non-Evidence' },
      { configCode: 'FILE_TYPE_INTERNAL', text: 'Outcome Documents' },
    ]).map(option => {
      option.value = String(configChannel.request('get', option.configCode) || '');
      delete option.configCode
      return option;
    });
  },

  createAttachmentsFromFiles(fileModels) {
    fileModels = _.sortBy(fileModels, fileModel => fileModel.get('file_name'));
    const fileAttachmentCollection = [];
    const isPartyNonEvidenceMode = this.isPartyNonEvidenceMode();
    
    const parseFilesAndFileDescriptionFn = (matchingModels=[], actionFn=()=>{}) => {
      const fileDescriptionsToAdd = {};
      const fileDescriptionLookups = {};
      matchingModels.forEach(fileModel => {
        const fileDescription = filesChannel.request('get:filedescription:from:file', fileModel);
        if (!fileDescription || fileDescription.get('is_deficient')) return;
        if (!_.has(fileDescriptionsToAdd, fileDescription.id)) fileDescriptionsToAdd[fileDescription.id] = [];
        fileDescriptionsToAdd[fileDescription.id].push(fileModel);
        fileDescriptionLookups[fileDescription.id] = fileDescription;
      });

      Object.keys(fileDescriptionsToAdd).forEach(fileDescriptionId => {
        const fileDescription = fileDescriptionLookups[fileDescriptionId];
        const files = fileDescriptionsToAdd[fileDescriptionId];
        if (fileDescription) {
          actionFn(fileDescription, files);
        }
      });
    };

    if (this.isPartyEvidenceMode() || isPartyNonEvidenceMode) {
      const applicants = participantChannel.request('get:applicants');
      const respondents = participantChannel.request('get:respondents');
      
      const parseFilesForParticipantFn = (p) => {
        const arrowIconHtml = `<div class="file-package-title-arrow ${p.isApplicant() ? 'applicant-upload' : (p.isRespondent() ? 'respondent-upload' : '')}"></div>`;
        const matchingModels = _.filter(fileModels, fileModel => fileModel.get('added_by') === p.id);
        
        if (matchingModels.length && !isPartyNonEvidenceMode) {
          fileAttachmentCollection.push({ isTitle: true, isSubTitle: false, titleHtml: `${arrowIconHtml}${p.getDisplayName()}` });
        }

        parseFilesAndFileDescriptionFn(matchingModels, (fileDescription, files) => {
          fileAttachmentCollection.push({
            isTitle: !!isPartyNonEvidenceMode,
            isSubTitle: !isPartyNonEvidenceMode,
            titleHtml: `${isPartyNonEvidenceMode? `${arrowIconHtml}${p.getDisplayName()}: ` :''}${fileDescription.get('title')}`
          });
          fileAttachmentCollection.push(...files.map(fileModel => ({ isTitle: false, isSubTitle: false, fileModel })));
        });
      }
      applicants.forEach(parseFilesForParticipantFn);
      respondents.forEach(parseFilesForParticipantFn);

    } else if (this.isPartyNonEvidenceMode()) {

      const applicants = participantChannel.request('get:applicants');
      const respondents = participantChannel.request('get:respondents');
      const parseFilesForParticipantFn = (p) => {      
        const matchingModels = _.filter(fileModels, fileModel => fileModel.get('added_by') === p.id);

        parseFilesAndFileDescriptionFn(matchingModels, (fileDescription, files) => {
          fileAttachmentCollection.push({ isTitle: true, isSubTitle: false, titleHtml: `${p.getDisplayName()}: ${fileDescription.get('title')}` });
          fileAttachmentCollection.push(...files.map(fileModel => ({ isTitle: false, isSubTitle: false, fileModel })));
        });
      };
      applicants.forEach(parseFilesForParticipantFn);
      respondents.forEach(parseFilesForParticipantFn);
      
    } else if (this.isOutcomeDocMode()) {
      
      const outcomeDocFileLookups = {};
      const outcomeDocGroups = [];
      fileModels.forEach(fileModel => {
        const outcomeDocFile = documentsChannel.request('get:outcomedoc:from:file', fileModel);
        if (!outcomeDocFile) return;
        const outcomeDocGroup = documentsChannel.request('get:group', outcomeDocFile.get('outcome_doc_group_id'));
        if (!outcomeDocGroup) return;
        if (outcomeDocGroups.indexOf(outcomeDocGroup) === -1) outcomeDocGroups.push(outcomeDocGroup);
        if (!_.has(outcomeDocFileLookups, outcomeDocGroup.id)) outcomeDocFileLookups[outcomeDocGroup.id] = [];
        outcomeDocFileLookups[outcomeDocGroup.id].push({ docFile: outcomeDocFile, fileModel });
      });

      outcomeDocGroups.forEach(outcomeDocGroup => {
        const index = outcomeDocGroup && outcomeDocGroup.collection && outcomeDocGroup.collection.indexOf(outcomeDocGroup);
        const indexDisplay = index !== -1 ? Formatter.toLeftPad(outcomeDocGroup.collection.length - index) : null;
        fileAttachmentCollection.push({ isTitle: true, isSubTitle: false, titleHtml: `Outcome Doc Set ${indexDisplay?Formatter.toLeftPad(indexDisplay):''} (${outcomeDocGroup.isActive() ? 'Active' : 'Inactive'})` });
        (outcomeDocFileLookups[outcomeDocGroup.id] || []).forEach(outcomeDocFileObj => {
          const fileModel = outcomeDocFileObj.fileModel;
          const outcomeDocFile = outcomeDocFileObj.docFile;
          fileAttachmentCollection.push({ isTitle: false, isSubTitle: true, titleHtml: outcomeDocFile.get('file_title') });
          fileAttachmentCollection.push({ isTitle: false, isSubTitle: false, fileModel });
        });
      });

    } else {
      fileAttachmentCollection.push(...fileModels.map(fileModel => ({ isTitle: false, isSubTitle: false, fileModel })));
    }

    return fileAttachmentCollection;
  },

  isCommonFilesSelected() {
    return this.fileSourceModel.getData() === COMMON_FILES_DROPDOWN_CODE;
  },

  isPartyEvidenceMode() {
    return !this.isCommonFilesSelected() && this.fileTypeModel.getData({ parse: true }) === configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_EVIDENCE');
  },

  isPartyNonEvidenceMode() {
    return !this.isCommonFilesSelected() && this.fileTypeModel.getData({ parse: true }) === configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE');
  },
  
  isOutcomeDocMode() {
    return !this.isCommonFilesSelected() && this.fileTypeModel.getData({ parse: true }) === configChannel.request('get', 'FILE_TYPE_INTERNAL');
  },

  isRemovedFilterEnabled() {
    return !this.isCommonFilesSelected() && this.removedFilterModel.getData();
  },

  isNoticeSelected() {
    return !this.isCommonFilesSelected() && Number(this.fileTypeModel.getData()) === configChannel.request('get', 'FILE_TYPE_NOTICE');
  },

  showFileErrorMessage(fileModel) {
    this.getUI('fileError').text(`Attachments cannot exceed ${Formatter.toFileSizeDisplay(this.maxFileSizeBytes)} - ${fileModel.get('file_name')} not added`);
  },

  getFilesMatchingMainFilters() {
    const fileType  = Number(this.fileTypeModel.getData());
    const isCommonFilesSelected = this.isCommonFilesSelected();
    const collection = this.isNoticeSelected() ? this.noticeFileModels
      : isCommonFilesSelected ? filesChannel.request('get:commonfiles').models
      : filesChannel.request('get:files').models;
    
    return collection.filter(f => f.get('file_type') === fileType).sort((f1, f2) => (f1.get('file_name') || '').localeCompare(f2.get('file_name') || ''));
  },

  getFilesMatchingFiltersWithRemovedToggle() {
    const allFiles = this.getFilesMatchingMainFilters();
    const removed = this.getRemovedAndDeficientFiles(allFiles);
    
    return !this.isRemovedFilterEnabled() ? allFiles.filter(file => !removed.find(_file => file.id === _file.id)) : allFiles;
  },

  getRemovedAndDeficientFiles(allFiles) {
    const removedOrDeficientFiles = [];
    (allFiles || this.getFilesMatchingMainFilters()).forEach(fileModel => {
      const fileDescription = filesChannel.request('get:filedescription:from:file', fileModel, { include_removed: true });
      const matchingClaim = claimsChannel.request('get:from:file', fileModel, { include_removed: true });
      const isFileDescriptionDeficient = fileDescription && fileDescription.get('is_deficient');
      const isClaimRemoved = matchingClaim && matchingClaim.isRemoved();
      if (isFileDescriptionDeficient || isClaimRemoved) removedOrDeficientFiles.push(fileModel);
    });
    return removedOrDeficientFiles;
  },

  clickSelectAll() {
    const getCheckedFilesize = () => this.files.reduce((memo, file) => memo + file.get('file_size'), 0);
    let checkedFilesize = getCheckedFilesize();
    let maxSizeExceeded = false;
    this.fileAttachmentCollection.forEach(attachment => {
      if (!attachment.fileModel) return;
      if (maxSizeExceeded) return;
      if (this.maxFileSizeBytes && (checkedFilesize + attachment.fileModel.get('file_size')) > this.maxFileSizeBytes) {
        maxSizeExceeded = true;
        return;
      }
      this.files.add(attachment.fileModel, { merge: true, silent: true });
      checkedFilesize = getCheckedFilesize();
    });
    this.render();

    // Show an error after rendering
    if (maxSizeExceeded) {
      this.getUI('fileError').text(`Attachments cannot exceed ${Formatter.toFileSizeDisplay(this.maxFileSizeBytes)} - Some files not added`);
    }
  },

  clickDeselectAll() {
    this.fileAttachmentCollection.forEach(attachment => {
      if (!attachment.fileModel) return;
      this.files.remove(attachment.fileModel, { silent: true });
    });
    this.render();
  },

  onBeforeRender() {
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);

    const files = this.getFilesMatchingFiltersWithRemovedToggle();
    this.fileAttachmentCollection = this.createAttachmentsFromFiles(files);
  },

  onRender() {
    this.showChildView('attachmentsRegion', new CreateEmailAttachmentsView({ maxFileSizeBytes: this.maxFileSizeBytes, files: this.files, model: this.model }));
    this.showChildView('fileSourceRegion', new DropdownView({ model: this.fileSourceModel }));
    this.showChildView('fileTypeRegion', new DropdownView({ model: this.fileTypeModel }));

    if (!this.isCommonFilesSelected() && this.getRemovedAndDeficientFiles().length) {
      this.showChildView('removedFilterRegion', new Checkbox({ model: this.removedFilterModel }));
    }

    this.showChildView('linkedNoticesRegion', new Checkbox({ model: this.linkedNoticesCheckbox }));

    this.showChildView('fileListRegion', new FileAttachmentCollectionView({
      childViewOptions: { maxFileSizeBytes: this.maxFileSizeBytes, checkedFiles: this.files },
      collection: new Backbone.Collection(this.fileAttachmentCollection)
    }));
    
    const self = this;
    this.getUI('fileList').scrollTop(this.fileListScroll || 0);
    this.getUI('fileList').off('scroll.rtb');
    this.getUI('fileList').on('scroll.rtb', function() { self.fileListScroll = $(this).scrollTop() });

    setTimeout(() => loaderChannel.trigger('page:load:complete'), 15);
  },

  id: 'modalAddEmailAttachment',
  regions: {
    attachmentsRegion: '.email-attachment-list',
    fileSourceRegion: '.email-attachment-file-source',
    fileTypeRegion: '.email-attachment-file-type',
    removedFilterRegion: '.email-attachment-removed-filter',
    linkedNoticesRegion: '.email-attachment-linked-notices',
    fileListRegion: '@ui.fileList'
  },
  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      fileList: '.email-attachment-file-list',
      fileError: '.email-attachment-file-error'
    });
  },

  template() {
    const showLinkedNotices = this.linkedNoticeFileModels && this.isNoticeSelected();
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Add Email Attachment</h4>
          </div>
          <div className="modal-body">
            <div className="">
              <div className="email-attachment-list"></div>
            </div>
            <div className="email-attachment-file-filters">
              <div className="email-attachment-file-source"></div>
              <div className="email-attachment-file-type"></div>
              <div className={`email-attachment-linked-notices ${showLinkedNotices?'':'hidden'}`}></div>
              <div className="email-attachment-removed-filter"></div>
            </div>
            <div className="">
              <div className="email-attachment-file-list"></div>
              <p className="error-block email-attachment-file-error"></p>
            </div>
            <div className="modal-button-container">
              <div className="email-attachment-quick-actions">
                <span className="email-attachment-select-all general-link" onClick={() => this.clickSelectAll()}>Select All</span>
                <span className="email-attachment-quick-actions-separator"></span>
                <span className="email-attachment-deselect-all general-link" onClick={() => this.clickDeselectAll()}>Deselect All</span>
              </div>

              <div className="email-attachment-files-added-info">{this.renderJsxFileAddedInfo()}</div>
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={this.close.bind(this)}>Return to Email</button>
            </div>

          </div>
        </div>
      </div>
    );
  },

  renderJsxFileAddedInfo() {
    const totalFileSize = this.files.reduce((memo, file) => (file.get('file_size') || 0) + memo, 0);
    return `${this.files.length} File${this.files.length===1?'':'s'} Selected - ${Formatter.toFileSizeDisplay(totalFileSize)}`;
  }
  
});

_.extend(ModalAddEmailAttachments.prototype, ViewJSXMixin);
export default ModalAddEmailAttachments;
