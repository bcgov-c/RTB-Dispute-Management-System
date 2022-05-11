import Backbone from 'backbone';
import DisputeClaimCollection from '../../../core/components/claim/DisputeClaim_collection';
import DisputeEvidenceCollection from '../../../core/components/claim/DisputeEvidence_collection';

export default Backbone.Model.extend({
  defaults: {
    participantModel: null,
    matchingUnit: null,
    
    // Dispute Claims will be filtered into claims with files from party
    _fullDisputeClaims: null,
    claimsWithFilesFromParty: null
  },

  
  initialize() {
    this.parseDisputeClaims(this.get('_fullDisputeClaims'));
  },

  parseDisputeClaims(disputeClaimCollection) {
    const participantId = this.get('participantModel').get('participant_id');

    const claimsWithFileFromParty = [];
    disputeClaimCollection.each(function(claim) {
      const evidenceWithFilesFromParty = [];
      const disputeEvidences = claim.get('dispute_evidences');

      if (!disputeEvidences) {
        return;
      }

      claim.get('dispute_evidences').each(function(disputeEvidence) {
        const files = disputeEvidence.get('files');
        const filesFromParty = files.filter(function(file) { return file.get('added_by') === participantId });

        if (filesFromParty.length) {
          const clonedFiles = files.clone();
          clonedFiles.reset(filesFromParty, { silent: true });

          const clonedEvidence = disputeEvidence.clone();
          clonedEvidence.set('files', clonedFiles, { silent: true });

          evidenceWithFilesFromParty.push(clonedEvidence);
        }
      });

      if (evidenceWithFilesFromParty.length) {
        const clonedClaim = claim.clone();
        clonedClaim.set('dispute_evidences', new DisputeEvidenceCollection(evidenceWithFilesFromParty));
        claimsWithFileFromParty.push(clonedClaim);
      }
    });

    const claimsToSet = new DisputeClaimCollection();
    if (claimsWithFileFromParty.length) {
      claimsToSet.reset(claimsWithFileFromParty, { silent: true }); 
    }
    
    this.set('claimsWithFilesFromParty', claimsToSet);
  },

  getFilesForParty() {
    const participantId = this.get('participantModel').get('participant_id');
    const filesForParty = [];
    this.get('claimsWithFilesFromParty').each(function(claim) {
      claim.get('dispute_evidences').each(function(disputeEvidence) {
        disputeEvidence.get('files').each(function(file) {
          if (file.get('added_by') === participantId) {
            filesForParty.push(file);
          }
        });
      });
    });
    return filesForParty;
  },

  isApplicant() {
    return this.get('participantModel').isApplicant();
  },

  isRespondent() {
    return this.get('participantModel').isRespondent();
  },

  isRemoved() {
    return this.get('participantModel').isRemoved();
  },

  getContactName() {
    return this.get('participantModel').getContactName();
  },

  getDisputeClaims() {
    return this.get('claimsWithFilesFromParty');
  },

  toEvidenceListData() {
    const isParticipantRemoved = this.isRemoved();
    return _.filter(this.get('claimsWithFilesFromParty').map(function(claim) {
      const isClaimRemoved = claim.isAmendRemoved();
      const evidenceData = _.filter(claim.get('dispute_evidences').map(function(disputeEvidence) {
        return {
          title: disputeEvidence.getTitle(),
          evidenceModel: disputeEvidence,
          files: disputeEvidence.get('files').filter(fileModel => fileModel.isUploaded()),
          isRemoved: isClaimRemoved || disputeEvidence.isParticipantRemoved(),
        };
      }), data => data.files.length);

      return {
        isRemoved: isClaimRemoved || isParticipantRemoved,
        title: claim.getClaimTitleWithCode(),
        data: evidenceData
      };
    }), claimData => claimData.data.length);
  }

});