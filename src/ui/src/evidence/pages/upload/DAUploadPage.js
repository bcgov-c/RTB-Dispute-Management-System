import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import UploadIssueCollectionView from './UploadIssueCollection';
import UploadIssueView from './UploadIssue';
import DisputeEvidenceCollection from '../../../core/components/claim/DisputeEvidence_collection';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import UploadMixinModel from '../../../core/components/upload/UploadMixin_model';
import template from './DAUploadPage_template.tpl';

const PFR_SUMMARY_LANDLORD_HTML = `<p><span>Important:</span>&nbsp;You may submit one bulk evidence package for all units if you choose to do so. If submitting one evidence package for all units, upload the bulk submission to the first rental unit displayed under <i>Add something not listed above</i>, give a short evidence name of Bulk Evidence and indicate that this evidence package is for all units in the "Details and Description" field</p>`;
const PFR_SUMMARY_TENANT_HTML = `<p><span>Important:</span>&nbsp;If you are a party acting on behalf of all units and you are authorized to do so, you may submit one bulk evidence package. Upload the package to the first rental unit displayed. Once you have selected Add Evidence for that rental unit, indicate that this evidence package is for all units in the "Details and Description" field.</p>`;

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const animationChannel = Radio.channel('animations');
const Formatter = Radio.channel('formatter').request('get');

const DAUploadPage = PageView.extend({
  template,
  className: `${PageView.prototype.className} da-upload-page`,

  ui: {
    upload: '.dac__page-buttons > .btn-standard',
    error: '.error-block',
    cancelButton: '.dac__page-buttons > .btn-cancel',
    fileCounterContainer: '.all-file-upload-ready-count',
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress'
  },

  regions: {
    disputeRegion: '.dac__evidence__dispute-overview',
    uploadsRegion: '#evidence-uploads',
    otherUploadsRegion: '#other-uploads',
    officeUploadsRegion: '#office-uploads'
  },

  events: {
    'click @ui.upload': 'clickUploadAll',
    'click @ui.cancelButton': 'mixin_upload_onCancel'
  },

  onCancelButtonNoUpload() {
    Backbone.history.navigate('evidence', { trigger: true });
  },

  clickUploadAll() {
    console.log("---- PENDING UPLOADS! ----- ");
    console.log(this.uploadModel.getPendingUploads());

    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }
    
    this.mixin_upload_transitionToUploadStep().always(() => {
      this.renderButtonsForUpload();
      setTimeout(() => {
        if (this.isCancel) return;
        this.mixin_upload_startUploads();
      }, 1000);
    });
  },

  validateAndShowErrors() {    
    const pending_uploads = this.uploadModel.getPendingUploads();

    if (_.any(pending_uploads, function(dispute_evidence_model) {
      return dispute_evidence_model.isCustom() && !dispute_evidence_model.getReadyToUploadFiles().length
    })) {
      this.showErrorMessage('Please add at least one file to each custom item you have added');
      return false;
    }

    if (_.all(pending_uploads, function(dispute_evidence_model) {
      return !dispute_evidence_model.getReadyToUploadFiles().length
    })) {
      this.showErrorMessage('Please add at least one file to save');
      return false;
    }

    return true;
  },

  filesToUploadContainEvidence() {
    return _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.isEvidence();
    });
  },

  onUploadComplete() {
    this.fileUploader = null;
    const uploadErrorFiles = [];
    const routeToReceiptFn = () => {
      if (_.any(this.uploadModel.getPendingUploads(), e => e.get('files').filter(function(f) { return f.isDisputeAccess() && f.isUploaded(); }).length)) {
        this.model.set('routingReceiptMode', true);
        Backbone.history.navigate('evidence/receipt', { trigger: true });
      } else {
        // If no files were uploaded, go back to the menu
        Backbone.history.navigate('access', { trigger: true, replace: true });
      }
    };

    _.each(this.uploadModel.getPendingUploads(), disputeEvidenceModel => {
      // Put the added files in the model, because that's where receipt page currently pulls them from
      // NOTE: We may want a better way to transfer/pass uploaded files info between pages
      this.model.addPendingUpload(disputeEvidenceModel);

      // Collect all error files to display them all at once
      uploadErrorFiles.push( ...(disputeEvidenceModel.get('files').filter(f => f.isUploadError())) );
    });

    if (!_.isEmpty(uploadErrorFiles)) {
      filesChannel.request('show:upload:error:modal', uploadErrorFiles, () => {
        loaderChannel.trigger('page:load');
        routeToReceiptFn();
      });
    } else {
      setTimeout(routeToReceiptFn, 500);
    }
  },

  renderButtonsForUpload() {
    this.getUI('upload').hide();
    this.getUI('fileCounterContainer').hide();
  },


  showErrorMessage(error_msg) {
    this.getUI('error').html(error_msg);
  },

  hideErrorMessage() {
    this.getUI('error').html('');
  },

  // Only display MOW if logged-in user is applicant and the claims include MOW evidence
  _shouldDisplayMOW() {
    const loggedInParticipantId = disputeChannel.request('get').get('tokenParticipantId');
    const activeParticipant = participantsChannel.request('get:participant', loggedInParticipantId);
    return (activeParticipant && activeParticipant.isApplicant()) &&
      this.full_claims.any(function(claim) { return claim.hasConfigMonetaryOrderWorksheetEvidence(); })
  },


  /* Upload supporting functions */
  createFilePackageCreationPromise() {
    const uploadDate = Moment().toISOString();
    const fileDate = this.model.get('fileDate');
    return this.filesToUploadContainEvidence() ?
      filesChannel.request('create:filepackage:disputeaccess', {
        package_date: fileDate ? fileDate : uploadDate,
        package_description: `Uploaded on ${Formatter.toDateAndTimeDisplay(uploadDate)}`,
      })
      : $.Deferred().resolve().promise();
  },

  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = disputeChannel.request('get').get('tokenParticipantId');

    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const fileDate = this.model.get('fileDate');
    const submitterName = this.model.get('submitterName');
    const participantId = disputeChannel.request('get').get('tokenParticipantId');
    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        file_date: fileDate ? fileDate : null,
        submitter_name: submitterName ? submitterName : null
      });
    });
  },
  /* End upload support functionality */

  initialize() {
    // Upload support vars
    this.fileUploader = null;
    this.isCancel = false;
    this.isUpload = false;
    this.uploadModel = new UploadMixinModel();

    // Always clear any saved evidence when we land on the Evidence Upload page
    this.model.clearSavedEvidence();

    const dispute = disputeChannel.request('get');
    const loggedInParticipantId = dispute.get('tokenParticipantId');
    const activeParticipant = participantsChannel.request('get:participant', loggedInParticipantId);
    
    this.isRespondentLoggedIn = activeParticipant && activeParticipant.isRespondent();

    this.isCreatedPfr = dispute.isCreatedPfr();

    this.full_claims = claimsChannel.request('get:full');

    // Add the supporting claims into the issue claims
    this.other_upload_evidence = new DisputeEvidenceCollection([
      ...( this._shouldDisplayMOW() ?  [claimsChannel.request('create:supporting:mow')] : [] ),
      claimsChannel.request('create:supporting:ta'),
    ]);

    this.office_upload_evidence = new DisputeEvidenceCollection();

    if (this.isRespondentLoggedIn) {
      this.full_claims.each(function(claim) {
        const claimDisputeEvidences = claim.get('dispute_evidences');
        const evidenceToRemove = [];
        claim.get('dispute_evidences').each(function(disputeEvidence) {
          if (_.isEmpty(disputeEvidence.getUploadedFiles())) {
            evidenceToRemove.push(disputeEvidence);
          }
        });

        claimDisputeEvidences.remove(evidenceToRemove, { silent: true });
      });
    }

    this.setupListeners();
  },

  setupListeners() {
    const updateUploadCountAndHideErrors = () => {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.hideErrorMessage();
    };
    this.stopListening(this.full_claims, 'update:file:count update', updateUploadCountAndHideErrors);
    this.listenTo(this.full_claims, 'update:file:count update', updateUploadCountAndHideErrors, this);

    this.stopListening(this.other_upload_evidence, 'update:file:count update', updateUploadCountAndHideErrors);
    this.listenTo(this.other_upload_evidence, 'update:file:count update', updateUploadCountAndHideErrors, this);
    
    this.stopListening(this.office_upload_evidence, 'update:file:count update', updateUploadCountAndHideErrors);
    this.listenTo(this.office_upload_evidence, 'update:file:count update', updateUploadCountAndHideErrors, this);
  },

  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
    } else {
      this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
    }
    this.renderEvidence({ mode: this.isUpload ? 'upload' : null });
  },

  renderEvidence(options) {
    options = options || {};
    const showEvidenceWarningPromiseFn = this.model.showEvidenceWarningPromise.bind(this.model);

    this.showChildView('uploadsRegion', new UploadIssueCollectionView(_.extend({
      collection: this.full_claims,
      uploadModel: this.uploadModel,
      evidenceCategory: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
      evidenceCode: configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE'),
      showEvidenceWarningPromise: showEvidenceWarningPromiseFn,
    }, options)));


    if (!this.isCreatedPfr) {
      this.showChildView('otherUploadsRegion', new UploadIssueView(_.extend({
        issueTypeTitle: 'Other',
        issueTitle: 'Files that support the above claims or your application',
        evidenceCollection: this.other_upload_evidence,
        evidenceCode: configChannel.request('get', 'CUSTOM_NON_ISSUE_NON_EVIDENCE_CODE'),
        evidenceCategory: configChannel.request('get', 'EVIDENCE_CATEGORY_NON_ISSUE_EVIDENCE'),
        claimCollection: this.full_claims,
        uploadModel: this.uploadModel,
        showEvidenceWarningPromise: showEvidenceWarningPromiseFn,
      }, options)));
    }

    if (this.model.get('staffLogin')) {
      this.showChildView('officeUploadsRegion', new UploadIssueView(_.extend({
        isOfficeUse: true,
        issueTypeTitle: 'Office',
        issueTitle: 'Forms and bulk evidence files.  For office use only',
        deriveEvidenceCategory: true,
        modalAddFilesOptions: { useFileTypeDropdown: true, cssClass: 'modal-office-upload' },
        evidenceCollection: this.office_upload_evidence,
        claimCollection: this.full_claims,
        uploadModel: this.uploadModel,
        showEvidenceWarningPromise: showEvidenceWarningPromiseFn,
      }, options)));
    }
  },

  onDomRefresh() {
    this.other_upload_evidence.forEach(evidence => {
      if (evidence.isTenancyAgreement()) evidence.trigger('open:help');
    });
  },

  templateContext() {
    const dispute =  disputeChannel.request('get');
    const loggedInParticipantId = disputeChannel.request('get').get('tokenParticipantId');
    const participant = loggedInParticipantId && participantsChannel.request('get:participant', loggedInParticipantId);
    const isApplicant = participant && participant.isApplicant();

    return {
      dispute,
      summaryDisplay: dispute.isCreatedPfr() ? 
          (isApplicant ? PFR_SUMMARY_LANDLORD_HTML : PFR_SUMMARY_TENANT_HTML)
          : null,
      isUpload: this.isUpload,
      staffLogin: this.model.get('staffLogin')
    };
  }
});

_.extend(DAUploadPage.prototype, UploadViewMixin);
export default DAUploadPage;
