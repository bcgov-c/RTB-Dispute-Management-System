import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DisputeClaimCollection from '../../../../core/components/claim/DisputeClaim_collection';
import DisputeEvidenceCollection from '../../../../core/components/claim/DisputeEvidence_collection';

const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

// This file is a container model for file package and associated claims
export default Backbone.Model.extend({
  defaults: {
    filePackageModel: null,
    unitCollection: null,
    
    // Dispute Claims will be filtered into claims with files in package
    _fullDisputeClaims: null,
    claimsWithFilesInPackage: null
  },

  initialize() {
    this.parseDisputeClaims(this.get('_fullDisputeClaims'));

    const filePackageModel = this.get('filePackageModel');
    if (filePackageModel) {
      // Pass through this event from FilePackageModel to self
      const refreshFn = function() { this.trigger('refresh:evidence:page', ...arguments); };
      this.listenTo(filePackageModel, 'refresh:evidence:page', refreshFn, this);
      this.listenTo(filePackageModel.getServices(), 'subservice:save', refreshFn, this);
    }

    // Add listeners on save
    (this.getFilesInPackage() || []).forEach(fileModel => this.listenTo(fileModel, 'update', () => this.trigger('update')));
  },

  parseDisputeClaims(disputeClaimCollection) {
    const filePackageId = this.getFilePackageId();

    const claimsWithFileInPackage = [];
    disputeClaimCollection.each(function(claim) {
      const evidenceWithFilesInPackage = [];
      const disputeEvidences = claim.get('dispute_evidences');

      if (!disputeEvidences) {
        return;
      }

      claim.get('dispute_evidences').each(function(disputeEvidence) {
        const files = disputeEvidence.get('files');
        const filesInPackage = files.filter(function(file) {
          return file.get('file_package_id') === filePackageId
        });

        if (filesInPackage.length) {
          const clonedFiles = files.clone();
          clonedFiles.reset(filesInPackage, { silent: true });

          const clonedEvidence = disputeEvidence.clone();
          clonedEvidence.set('files', clonedFiles, { silent: true });

          evidenceWithFilesInPackage.push(clonedEvidence);
        }
      });

      if (evidenceWithFilesInPackage.length) {
        const clonedClaim = claim.clone();
        clonedClaim.set('dispute_evidences', new DisputeEvidenceCollection(evidenceWithFilesInPackage));
        claimsWithFileInPackage.push(clonedClaim);
      }
    });

    const claimsToSet = new DisputeClaimCollection();
    if (claimsWithFileInPackage.length) {
      claimsToSet.reset(claimsWithFileInPackage, { silent: true });
      
    }
    
    this.set('claimsWithFilesInPackage', claimsToSet);
  },

  toEvidenceListData() {
    return _.filter(this.get('claimsWithFilesInPackage').map(function(claim) {
      return {
        isRemoved: claim.isAmendRemoved(),
        title: claim.getClaimTitleWithCode(),
        data: _.filter(claim.get('dispute_evidences').map(function(disputeEvidence) {
          return {
            title: disputeEvidence.getTitle(),
            evidenceModel: disputeEvidence,
            files: disputeEvidence.get('files').filter(fileModel => fileModel.isUploaded()),
            isRemoved: claim.isAmendRemoved() || disputeEvidence.isParticipantRemoved()
          };
        }), data => data.files.length)
      };
    }), claimData => claimData.data.length);
  },

  getFilePackageId() {
    const filePackage = this.get('filePackageModel');
    return filePackage && !filePackage.isNew() ? filePackage.id : null;
  },

  isIntakePackage() {
    return this.get('filePackageModel').isIntake();
  },

  isDisputeAccessPackage() {
    return this.get('filePackageModel').isDisputeAccess();
  },

  isOfficePackage() {
    return this.get('filePackageModel').isOffice();
  },

  isLegacyPackage() {
    return this.get('filePackageModel').isLegacySP();
  },

  getPackageTypeDisplay() {
    return this.isIntakePackage() ? 'Intake' :
      this.isDisputeAccessPackage() ? 'Dispute Access' :
      this.isOfficePackage() ? 'Office' :
      this.isLegacyPackage() ? 'Legacy Service Portal'
      : '-';
  },

  getPackageSubmittedDate() {
    const filePackageModel = this.get('filePackageModel');
    const packageDate = filePackageModel.get('package_date');
    return packageDate ? packageDate : filePackageModel.get('created_date');
  },

  getFilesInPackage() {
    const filePackageId = this.getFilePackageId();
    const filesInPackage = [];
    this.get('claimsWithFilesInPackage').each(function(claim) {
      claim.get('dispute_evidences').each(function(disputeEvidence) {
        disputeEvidence.get('files').each(function(file) {
          if (file.get('file_package_id') === filePackageId) {
            filesInPackage.push(file);
          }
        });
      });
    });
    return filesInPackage;
  },

  getPackageCreatorParticipantModel() {
    const filePackage = this.get('filePackageModel');
    return filePackage.getPackageCreatorParticipantModel();
  },

  isPackageCreatorRemoved() {
    const filePackage = this.get('filePackageModel');
    return filePackage.isPackageCreatorRemoved();
  },

  isPackageCreatorAmendRemoved() {
    const filePackage = this.get('filePackageModel');
    return filePackage.isPackageCreatorAmendRemoved();
  },

  getPackageTitle() {
    const packageDate = this.getPackageSubmittedDate();
    const creatorModel = this.getPackageCreatorParticipantModel();
    const creatorName = creatorModel ? creatorModel.getDisplayName() : '<i>Unknown Submitter</i>';
    const arrowIconHtml = `<div class="file-package-title-arrow ${!creatorModel ? '' : (creatorModel.isApplicant() ? 'applicant-upload' : 'respondent-upload')}"></div>`;
    const filesInPackage = this.getFilesInPackage();
    const fileCountDisplay = `${filesInPackage.length} file${filesInPackage.length === 1 ? '' : 's'}`;
    const latestHearing = hearingChannel.request('get:latest');
    const latestHearingDate = latestHearing ? Moment(latestHearing.get('local_start_datetime')) : null;
    const offsetDays = packageDate && latestHearing ? latestHearingDate.diff(Moment(packageDate), 'days') : null;
    let date_offset_warning_threshold;
    if (creatorModel) {
      date_offset_warning_threshold = creatorModel.isApplicant() ? configChannel.request('get', 'APPLICANT_EVIDENCE_WARNING_DAY_OFFSET') :
        creatorModel.isRespondent() ? configChannel.request('get', 'RESPONDENT_EVIDENCE_WARNING_DAY_OFFSET') : null;
    }
    const beforeAfterText = offsetDays !== null && offsetDays >= 0 ? 'before' : 'after';
    const offsetToHearing = offsetDays !== null ? Math.abs(offsetDays) : null;
    const showOffsetWarning = offsetDays !== null && date_offset_warning_threshold ? offsetDays < date_offset_warning_threshold : false;
    const offsetDisplay = latestHearing && filesInPackage ? ` / <span class="${showOffsetWarning?'error-red':''}">${offsetToHearing} day${offsetToHearing===1?'':'s'} ${beforeAfterText} latest hearing</span>` : '';

    const matchingUnit = creatorModel && this.get('unitCollection') && this.get('unitCollection').find(unit => unit.hasParticipantId(creatorModel.get('participant_id')));
    const titleDisplay = `${arrowIconHtml}&nbsp;${this.getPackageTypeDisplay()}: ${Formatter.toDateDisplay(this.getPackageSubmittedDate())} - ${matchingUnit ? `<b>${matchingUnit.getUnitNumDisplay()}:</b> ` : ''}${creatorName} (${fileCountDisplay}${offsetDisplay})`;

    
    return titleDisplay;
  }
  
});
