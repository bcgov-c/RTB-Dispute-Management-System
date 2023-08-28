/**
 * @namespace core.components.access.AccessManager
 * @memberof core.components.access
 * @fileoverview - Manager that contains checks for item menu access on Office and Dispute Access sites
*/

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ApplicantRequiredService from '../service/ApplicantRequiredService';

const invalidUploadDisputeProcesess = [2, 3, 5];
const invalidUploadStage0DisputeStatuses = [2, 3, 4];
const invalidUploadStage2DisputeStatuses = [95];
const invalidUploadStage4DisputeStatuses = [93];
const invalidUploadStage6DisputeStatuses = [61, 62, 63];
const invalidUploadStage10DisputeStatuses = [100, 101, 102, 103, 104, 105, 106];
const validOfficeDocRequestStage6Statuses = [60, 61];
const validOfficeDocRequestStage10Statuses = [95, 102, 103, 104, 105, 106];

const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const noticeChannel = Radio.channel('notice');
const documentsChannel = Radio.channel('documents');
const paymentsChannel = Radio.channel('payments');
const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');

// Holds business logic lookups for site / dispute accesses
const AccessManager = Marionette.Object.extend({
  channelName: 'access',

  radioRequests: {
    'external:open': 'canAccessExternalDispute',
    'external:evidence': 'canAccessExternalEvidenceUpload',
    'external:notice': 'canAccessExternalNoticeProofOfService',
    'external:contact': 'canAccessExternalUpdateContact',
    'external:amendment': 'canAccessExternalAmendment',
    'external:correction': 'canAccessExternalCorrection',
    'external:clarification': 'canAccessExternalClarification',
    'external:review': 'canAccessExternalReview',
    'external:review:payment': 'canAccessExternalReviewPayment',
    'external:subserv': 'canAccessExternalSubServ',
    'external:reinstatement': 'canAccessExternalReinstatement',

    'office:correction': 'canAccessOfficeCorrection',
    'office:clarification': 'canAccessOfficeClarification',
    'office:review': 'canAccessOfficeReview',
    'office:subservice': 'canAccessOfficeSubService',
    'office:amendment': 'canAccessOfficeAmendment',
    'office:pickup': 'canAccessOfficePickup',
    'office:recovery': 'canAccessOfficeACRecovery'
  },

  // External (DA) accesses
  canAccessExternalDispute() {
    const dispute = disputeChannel.request('get');
    if (!dispute || !dispute.get('accessCode')) return false;
    
    if (typeof dispute.get('disputeAccessOpen') !== 'undefined') return dispute.get('disputeAccessOpen');
    
    const isDisputeGeneralClosedStatus = [
      // Implemented in mid-tier for DA, not implemented in Office
      dispute.checkStageStatus(0, [0, 1, 5, 6, 90, 92, 94, 95, 99]),
      dispute.checkStageStatus(2, [90, 91, 94]),
      dispute.checkStageStatus(4, [90, 94, 95]),
      dispute.checkStageStatus(6, [90, 95]),
      dispute.checkStageStatus(8, [95]),
      dispute.checkStageStatus(10, [92, 95]),
    ];
    return !isDisputeGeneralClosedStatus.some(bool=>bool);
  },

  canAccessExternalEvidenceUpload() {
    const dispute = disputeChannel.request('get');
    if (!dispute) return false;
    
    const hearingStartDateMoment = Moment(dispute.get('hearingStartDate')).isValid() ? Moment(dispute.get('hearingStartDate')) : null;
    const isDisputeValidUploadProcessStatus = dispute && !(
        // Blacklist of sspo values for upload
        dispute.checkProcess(invalidUploadDisputeProcesess) ||
        dispute.checkStageStatus(0, invalidUploadStage0DisputeStatuses) ||
        dispute.checkStageStatus(2, invalidUploadStage2DisputeStatuses) ||
        dispute.checkStageStatus(4, invalidUploadStage4DisputeStatuses) ||
        dispute.checkStageStatus(6, invalidUploadStage6DisputeStatuses) ||
        dispute.checkStageStatus(10, invalidUploadStage10DisputeStatuses)
      );
    // If there is a past hearing, the dispute must be in status 8:81 for uploads
    const isDisputeValidUploadHearing = !hearingStartDateMoment || dispute.checkStageStatus(8, 81) || Moment(hearingStartDateMoment).isAfter(Moment(), 'minute');
    
    return this.canAccessExternalDispute() && dispute && (dispute.getOverride() || (isDisputeValidUploadHearing && isDisputeValidUploadProcessStatus));
  },

  canAccessExternalNoticeProofOfService() {
    const dispute = disputeChannel.request('get');
    if (!dispute || !this.canAccessExternalDispute()) return false;
    
    const applicants = participantsChannel.request('get:applicants');
    const isApplicant = applicants ? applicants.findWhere({ participant_id: dispute.get('tokenParticipantId') }) : false;
    const activeNotice = noticeChannel.request('get:active');
    const hasUnservedNoticeServices = activeNotice && isApplicant && activeNotice.getServices().length && activeNotice.getUnservedServices().length;
    if (!hasUnservedNoticeServices) return;

    const latestHearing = hearingChannel.request('get:latest');
    return dispute.checkProcess(1) ? dispute.checkStageStatus([4, 6], [41, 60]) && (!latestHearing || Moment(latestHearing.get('hearing_start_datetime')).isAfter(Moment()))
      : dispute.checkProcess(2) ? dispute.checkStageStatus(4, 41)
      : false;
  },

  canAccessExternalUpdateContact() {
    const dispute = disputeChannel.request('get');
    if (!dispute || dispute.isNew()) return false;
    const isDisputeMigrated = dispute && dispute.isMigrated();
    return !isDisputeMigrated && this.canAccessExternalDispute();
  },

  canAccessExternalAmendment() {
    return this.canAccessOfficeAmendment() && this.canAccessExternalDispute();
  },

  canAccessExternalCorrection() {
    const outcomeDocGroupModels = documentsChannel.request('get:all');
    return this.canAccessExternalDispute() && outcomeDocGroupModels.any(docGroup => docGroup.getDocFilesThatCanRequestCorrection().length);
  },

  canAccessExternalClarification() {
    const outcomeDocGroupModels = documentsChannel.request('get:all');
    return this.canAccessExternalDispute() && outcomeDocGroupModels.any(docGroup => docGroup.getDocFilesThatCanRequestClarification().length);
  },

  _canAccessExternalReview(reviewPayment=false) {
    const loggedInParticipant = disputeChannel.request('get').get('tokenParticipantId');
    const outcomeDocGroupModels = documentsChannel.request('get:all');
    const outcomeDocRequestCollection = documentsChannel.request('get:requests');

    const availableDocGroupsForReview = [];
    outcomeDocGroupModels.forEach(docGroup => {
      if (!docGroup.getDocFilesThatCanRequestReview().length) return;
      const requestsForGroup = outcomeDocRequestCollection.filter(req => req.get('outcome_doc_group_id') === docGroup.id);
      // Ensure the doc is still available for review - only one review can exist, unless the other review(s) are "past process" - those can be requested on again
      const hasCurrentUserReview = requestsForGroup.find(request => (
        !request.isPastProcess() &&
        request.isReview() &&
        request.get('submitter_id') === loggedInParticipant
      ));
      if (!hasCurrentUserReview) availableDocGroupsForReview.push(docGroup);
    });
    
    if (!availableDocGroupsForReview.length || !this.canAccessExternalDispute()) return;

    const reviewRequests = outcomeDocRequestCollection.filter(request => request.isReview() && request.get('submitter_id') === loggedInParticipant);
    const paidReviewFeesForUser = paymentsChannel.request('get:fees').filter(f => f.isPaid() && f.isReviewFee() && f.isActive() && f.get('payor_id') === loggedInParticipant);
    const numPaymentsStillAvailableForReviews = paidReviewFeesForUser.length - reviewRequests.length;
    const hasPaidAndPendingReviewRequest = numPaymentsStillAvailableForReviews > 0;
    const hasReviewableDocGroupsWithNoPayment = (availableDocGroupsForReview.length - numPaymentsStillAvailableForReviews) > 0;
    
    // Only one review can be worked on at a time - payment for additional reviews is only available when no active review requests
    if (reviewPayment) {
      return !hasPaidAndPendingReviewRequest && hasReviewableDocGroupsWithNoPayment;
    } else {
      return hasPaidAndPendingReviewRequest;
    }
  },

  canAccessExternalReviewPayment() {
    return this._canAccessExternalReview(true);
  },

  canAccessExternalReview() {
    return this._canAccessExternalReview();
  },

  canAccessExternalSubServ(participantId) {
    const isPaid = paymentsChannel.request('get:fee:intake') ? paymentsChannel.request('get:fee:intake').get('is_paid') : false;
    const respondent = participantsChannel.request('get:respondents');
    const hasServiceQuadrantValue = !!noticeChannel.request('get:subservices:quadrant:config', participantId);
    const dispute = disputeChannel.request('get');
    const isAdjournedApplicantStatus = dispute.checkStageStatus(4, 93);
    const isWaitingProofOfServiceStatus = dispute.checkStageStatus(4, 41);
    return this.canAccessExternalDispute() && hasServiceQuadrantValue && isPaid && respondent.length && !isAdjournedApplicantStatus && ((isWaitingProofOfServiceStatus && dispute.checkProcess(1)) || !isWaitingProofOfServiceStatus)
  },

  canAccessExternalReinstatement() {
    const dispute = disputeChannel.request('get');
    const notice = noticeChannel.request('get:active');
    return this.canAccessExternalDispute() && ApplicantRequiredService.externalLogin_hasUpcomingArsReinstatementDeadline(dispute, notice);
  },

  // Office
  canAccessOfficeCorrection() {
    const dispute = disputeChannel.request('get');
    if (!dispute || !dispute.get('accessCode')) return;
    return (
      dispute.checkStageStatus(6, validOfficeDocRequestStage6Statuses) ||
      dispute.checkStageStatus(10, validOfficeDocRequestStage10Statuses)
    ) || this.canAccessExternalCorrection();
  },

  canAccessOfficeClarification() {
    const dispute = disputeChannel.request('get');
    if (!dispute || !dispute.get('accessCode')) return;
    return (
      dispute.checkStageStatus(6, validOfficeDocRequestStage6Statuses) ||
      dispute.checkStageStatus(10, validOfficeDocRequestStage10Statuses)
    ) || this.canAccessExternalClarification();
  },

  canAccessOfficeReview() {
    const dispute = disputeChannel.request('get');
    if (!dispute || !dispute.get('accessCode')) return;
    return (
      dispute.checkStageStatus(6, validOfficeDocRequestStage6Statuses) ||
      dispute.checkStageStatus(10, validOfficeDocRequestStage10Statuses)
    ) || (this.canAccessExternalReviewPayment() || this.canAccessExternalReview());
  },

  canAccessOfficeSubService(participantId) {
    const dispute = disputeChannel.request('get');
    if (!dispute || !dispute.get('accessCode')) return;
    
    return this.canAccessExternalSubServ(participantId)
  },

  canAccessOfficeAmendment() {
    const activeNotice = noticeChannel.request('get:active');
    const dispute = disputeChannel.request('get');
    const applicants = participantsChannel.request('get:applicants');
    const isApplicant = applicants.length ? applicants.findWhere({ participant_id: dispute?.get('tokenParticipantId') }) : false;

    if (!dispute || !dispute.get('accessCode')) return;
    return !!activeNotice && !dispute.isUnitType() && !dispute.isCreatedRentIncrease() && (
      dispute.checkStageStatus(2, [20, 21, 22, 23, 24, 95]) ||
      dispute.checkStageStatus(4, [40, 41, 42, 43, 44, 45, 95]) ||
      dispute.checkStageStatus(6, [60, 95])
    ) && dispute.checkProcess([1, 5, 6, 7])
      && isApplicant;
  },

  canAccessOfficePickup() {
    const dispute = disputeChannel.request('get');
    if (!dispute || !dispute.get('accessCode')) return;
    const pickupList = emailsChannel.request('get:all');
    return !!pickupList.length && pickupList.findWhere({send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_READY_FOR_PICKUP') });
  },

  canAccessOfficeACRecovery() {
    const dispute = disputeChannel.request('get');
    if (!dispute) return;
    return !dispute.get('accessCode');
  }

});

const accessManagerInstance = new AccessManager();
export default accessManagerInstance;
