import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './DisputeClaimEvidence_template.tpl';
import LoaderImg from '../../../core/static/loader.svg';

const FILE_PARENT_SELECTOR = '.dispute-issue-evidence-file';

const claimsChannel = Radio.channel('claims');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const sessionChannel = Radio.channel('session');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');
const userChannel = Radio.channel('users');

const FILE_EXTENSION_WHITE_LIST = ['png', 'jpg', 'jpeg', 'pdf'];
const modalChannel = Radio.channel('modals');

export default Marionette.View.extend({
  template,
  className: 'dispute-issue-evidence-item clearfix',

  ui: {
    filename: '.filename-download',
    referenced: '.dispute-issue-evidence-file-referenced',
    considered: '.dispute-issue-evidence-file-considered',
    filePreview: '.file-card-viewable-icon',
    notesIcon: '.file-card-note-icon',
    image: '.file-card-image',
    evidenceFileNotes: '.dispute-issue-evidence-file-notes',
    loaderImg: '.file-card-image > img:not(.hidden)',
    mainImg: '.file-card-image > img.hidden',
  },

  events: {
    'click @ui.download': 'clickFile',
    'click @ui.filename': 'clickFilePreview',
    'click @ui.referenced': 'clickReferenced',
    'click @ui.considered': 'clickConsidered',
    'click @ui.filePreview': 'clickEvidenceFileViewer',
    'click @ui.notesIcon' : 'clickEvidenceFileViewerAsNotes',
    'click @ui.image': 'clickFilePreview',
    'click @ui.evidenceFileNotes': 'clickEvidenceFileViewer',
  },

  _getFileModelFromFileEle(ele) {
    const parentEle = ele.closest(FILE_PARENT_SELECTOR);
    const fileId = parentEle.data('fileId');
    const fileModel = this.model.get('files').findWhere({ file_id: fileId });

    if (!fileModel) {
      console.log(`[Error] Couldn't find file model from file ele`, ele, fileId, fileModel, this);
    }
    return fileModel;
  },

  clickEvidenceFileViewer(ev, modalOptions={}) {
    if (!this.enableEvidenceFileViewer) return;

    const disputeModel = disputeChannel.request('get');
    const showEvidenceFilePreviewFn = () => {
      const fileModel = this._getFileModelFromFileEle($(ev.currentTarget));
      if (!fileModel) return;
      if (_.isFunction(this.evidenceFilePreviewFn)) this.evidenceFilePreviewFn(fileModel, this.model, modalOptions);
      else console.log("No evidence file preview function provided");
    };
    
    if (!disputeModel) {
      showEvidenceFilePreviewFn();
      return;
    }

    disputeModel.checkEditInProgressPromise().then(
      () => showEvidenceFilePreviewFn(),
      () => disputeModel.showEditInProgressModalPromise()
    );
  },

  clickEvidenceFileViewerAsNotes(ev) {
    return this.clickEvidenceFileViewer(ev, { openToNotes: true });
  },

  clickFile(ev) {
    const fileModel = this._getFileModelFromFileEle($(ev.currentTarget));
    if (!fileModel) {
      return;
    }

    if (FILE_EXTENSION_WHITE_LIST.includes(fileModel.getExtension())) {
      this.openFileViewerModal(fileModel);
    } else {
      fileModel.download();
    }
  },
  
  clickFilePreview(ev) {
    const fileModel = this._getFileModelFromFileEle($(ev.currentTarget));
    if (!fileModel) return;
    if (this.enableFilePreview) filesChannel.request('click:filename:preview', ev, fileModel, { fallback_download:true });
    else fileModel.download();
  },

  clickReferenced(ev) {
    if (!this._hasArbPermissions) {
      return;
    }
    
    const ele = $(ev.currentTarget);
    const isReferenced = !ele.closest('.dispute-issue-evidence-file.not-file-referenced').length;
    const fileModel = this._getFileModelFromFileEle(ele);
    if (!fileModel) return;

    if (_.isFunction(this.clickReferencedFn)) {
      this.clickReferencedFn(fileModel, !isReferenced);
      return;
    }

    if (isReferenced && fileModel.getDecisionNotes().length) {
      modalChannel.request('show:standard', {
        title: 'Delete Associated Decision Note(s)?',
        bodyHtml: `<p>This reference has at least one associated note. By clearing the reference, the note will be deleted. Do you wish to continue?</p>`,
        primaryButtonText: 'Continue',
        onContinueFn(modalView) {
          modalView.close();
          loaderChannel.trigger('page:load');
          fileModel.save({ file_referenced: !isReferenced }).done(() => {
            Promise.all(fileModel.getDecisionNotes().map(noteModel => noteModel.destroy()))
              .catch(generalErrorFactory.createHandler('ADMIN.NOTE.REMOVE', () => loaderChannel.trigger('page:load:complete')))
          }).always(() => {
            this.render();
            loaderChannel.trigger('page:load:complete');
          });
        }
      });
    } else {
      loaderChannel.trigger('page:load');
      fileModel.save({ file_referenced: !isReferenced }).always(() => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      });
    }
  },

  clickConsidered(ev) {
    if (!this._hasArbPermissions) return;
    const ele = $(ev.currentTarget);
    const isConsidered = !ele.closest('.dispute-issue-evidence-file.not-file-considered').length;
    const fileModel = this._getFileModelFromFileEle(ele);
    if (!fileModel) return;

    if (_.isFunction(this.clickConsideredFn)) {
      this.clickConsideredFn(fileModel, !isConsidered);
      return;
    }

    loaderChannel.trigger('page:load');
    fileModel.save({ file_considered: !isConsidered }).always(() => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    });
  },

  openFileViewerModal(fileModel) {
    filesChannel.request('show:preview:modal', fileModel);
  },

  initialize(options) {
    this.mergeOptions(options, ['showArrows', 'showArbControls', 'showDetailedNames', 'showSubmitterInfo', 'showThumbnails',
      'evidenceFilePreviewFn', 'clickReferencedFn', 'clickConsideredFn', 'enableEvidenceFileViewer', 'enableFilePreview', 'unitCollection',
      'fileDupTranslations', 'hideDups']);

    // Enable evidence file viewer and file previewer by default
    if (!_.isBoolean(this.enableEvidenceFileViewer)) this.enableEvidenceFileViewer = true;
    if (!_.isBoolean(this.enableFilePreview)) this.enableFilePreview = true;

    this._hasArbPermissions = (sessionChannel.request('get:user') || {isArbitrator() {}}).isArbitrator();
  },

  onRender() {
    // Manually apply the event listener for img.onLoad
    // Must be done manually vs in `events` because `events` only handles events that bubble up
    this.listenToOnce(this.getUI('mainImg'), 'load', () => {
      try {
        this.getUI('loaderImg').addClass('hidden');
        this.getUI('mainImg').removeClass('hidden');
      } catch (err) {
        // Pass
      }
    });
  },

  templateContext() {
    const files = this.model.get('files');
    const participant_model = this.model.get('participant_model');
    const last_added_model = files.length ? files.max(function(f) { return Moment(f.get('file_date')).unix(); }) : null;
    const last_added_date = last_added_model ? last_added_model.get('file_date') : null;
    const latestHearing = hearingChannel.request('get:latest');
    const latestHearingDate = latestHearing ? Moment(latestHearing.get('local_start_datetime')) : null;
    const offset_days = last_added_date && latestHearing ? latestHearingDate.diff(Moment(last_added_date), 'days') : null;

    let date_offset_warning_threshold;
    if (participant_model) {
      date_offset_warning_threshold = participant_model.isApplicant() ? configChannel.request('get', 'APPLICANT_EVIDENCE_WARNING_DAY_OFFSET') :
        participant_model.isRespondent() ? configChannel.request('get', 'RESPONDENT_EVIDENCE_WARNING_DAY_OFFSET') : null;
    }

    const _submitterLookup = {};
    let fileSubmitterId = null;
    files.each(file => {
      if (!file.isUploaded()) return;
      const addedBy = file.get('added_by');
      if (addedBy) {
        _submitterLookup[addedBy] = true;
        if (!fileSubmitterId) {
          fileSubmitterId = addedBy;
        }
      }
    });

    const isDocument = !participant_model || !participant_model.getContactName();
    const parentClaim = claimsChannel.request('get:claim', this.model.get('claim_id'));
    const claimIsRemoved = parentClaim && parentClaim.isAmendRemoved();

    const hasFilesUploadedByMultipleParticipants = Object.keys(_submitterLookup).length > 1;
    const submitterModel = fileSubmitterId && !hasFilesUploadedByMultipleParticipants ? participantsChannel.request('get:participant', fileSubmitterId) : null;
    const matchingUnit = fileSubmitterId && this.unitCollection && this.unitCollection.find(unit => unit.hasParticipantId(fileSubmitterId));
    const singleSubmitterDisplay = !submitterModel ? null :
      (`${matchingUnit ? `${matchingUnit.getUnitNumDisplay()}: ` : ''}${submitterModel.getContactName()}`);
    const fileDescription = this.model.get('file_description')

    return _.extend({
      Formatter,
      LoaderImg,
      enableEvidenceFileViewer: this.enableEvidenceFileViewer && _.isFunction(this.evidenceFilePreviewFn),
      showThumbnails: this.showThumbnails,
      showArrows: this.showArrows,
      showArbControls: this.showArbControls,
      clickableArbControls: this._hasArbPermissions,
      showSubmitterInfo: this.showSubmitterInfo,
      showDetailedNames: this.showDetailedNames,

      participantDisplayName: hasFilesUploadedByMultipleParticipants ? '<i>Multiple Submitters</i>' :
        ((!isDocument && singleSubmitterDisplay) || (!isDocument && participant_model.getContactName()) ||
        userChannel.request('get:user:name', this.model.get('file_description')?.get('created_by')) || 'Added as Document' ),
      isEvidenceRemoved: this.model.isParticipantRemoved() || claimIsRemoved,
      beforeAfterText: offset_days !== null && offset_days >= 0 ? 'before' : 'after',
      offsetToHearing: offset_days !== null ? Math.abs(offset_days) : null,
      showOffsetWarning: offset_days !== null && date_offset_warning_threshold ? offset_days < date_offset_warning_threshold : false,
      fileIsPastThresholdFn(fileModel) {
        const fileDate = fileModel.get('file_date');
        return date_offset_warning_threshold && latestHearingDate && fileDate ? latestHearingDate.diff(Moment(fileDate), 'days') < date_offset_warning_threshold : false;
      },
      noFilesReferenced: !files.any(function(file) { return file.isReferenced(); }),
      noFilesConsidered: !files.any(function(file) { return file.isConsidered(); }),

      file_description_id: null,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
      isDeficient: fileDescription && fileDescription.get('is_deficient')
      
    },
    // Expose the file description attributes directly on the template
    this.model.get('file_description').toJSON());
  }
});