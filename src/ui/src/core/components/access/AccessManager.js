/**
 * @namespace core.components.access.AccessManager
 * @memberof core.components.access
*/

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const invalidUploadDisputeProcesess = [2, 3, 5];
const invalidUploadStage0DisputeStatuses = [2, 3, 4];
const invalidUploadStage2DisputeStatuses = [95];
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

// Holds business logic lookups for site / dispute accesses
const AccessManager = Marionette.Object.extend({
  channelName: 'access',

  radioRequests: {
    'external:open': 'canAccessExternalDispute',
    'external:evidence': 'canAccessExternalEvidenceUpload',
    'external:notice': 'canAccessExternalNoticeProofOfService',
    'external:contact': 'canAccessExternalUpdateContact',
    'external:correction': 'canAccessExternalCorrection',
    'external:clarification': 'canAccessExternalClarification',
    'external:review': 'canAccessExternalReview',
    'external:review:payment': 'canAccessExternalReviewPayment',
    'external:subserv': 'canAccessExternalSubServ',

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
      dispute.checkStageStatus(4, [90, 93, 94, 95]),
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
        dispute.checkStageStatus(6, invalidUploadStage6DisputeStatuses) ||
        dispute.checkStageStatus(10, invalidUploadStage10DisputeStatuses
    ));
    // If there is a past hearing, the dispute must be in status 8:81 for uploads
    const isDisputeValidUploadHearing = !hearingStartDateMoment || dispute.checkStageStatus(8, 81) || Moment(hearingStartDateMoment).isAfter(Moment(), 'minute');
    
    return this.canAccessExternalDispute() && dispute && (dispute.getOverride() || (isDisputeValidUploadHearing && isDisputeValidUploadProcessStatus));
  },

  canAccessExternalNoticeProofOfService() {
    const dispute = disputeChannel.request('get');
    if (!dispute) return false;
    const applicants = participantsChannel.request('get:applicants');
    const isApplicant = applicants ? applicants.findWhere({ participant_id: dispute.get('tokenParticipantId') }) : false;
    const activeNotice = noticeChannel.request('get:active');
    const hasUnservedNoticeServices = activeNotice && isApplicant && activeNotice.getServices().length && activeNotice.getUnservedServices().length;
    
    return this.canAccessExternalDispute() && dispute.checkStageStatus(4, 41) && dispute.checkProcess(2) && hasUnservedNoticeServices;
  },

  canAccessExternalUpdateContact() {
    const dispute = disputeChannel.request('get');
    if (!dispute || dispute.isNew()) return false;
    const isDisputeMigrated = dispute && dispute.isMigrated();
    return !isDisputeMigrated && this.canAccessExternalDispute();
  },

  canAccessExternalCorrection() {
    const outcomeDocGroupModels = documentsChannel.request('get:all');
    return this.canAccessExternalDispute() && outcomeDocGroupModels.any(docGroup => docGroup.getDocFilesThatCanRequestCorrection().length);
  },

  canAccessExternalClarification() {
    const outcomeDocGroupModels = documentsChannel.request('get:all');
    return this.canAccessExternalDispute() && outcomeDocGroupModels.any(docGroup => docGroup.getDocFilesThatCanRequestClarification().length);
  },

  _canAccessExternalReview(paymentRequired=false) {
    const paidReviewFees = paymentsChannel.request('get:fees').filter(f => f.isPaid() && f.isReviewFee() && f.isActive());
    const outcomeDocGroupModels = documentsChannel.request('get:all');
    const outcomeDocRequestCollection = documentsChannel.request('get:requests');
    const loggedInParticipant = disputeChannel.request('get').get('tokenParticipantId');
    const hasExistingReviewPayment = paidReviewFees.filter(f => f.get('payor_id') === loggedInParticipant).length > 0;

    return (paymentRequired ? hasExistingReviewPayment : !hasExistingReviewPayment) && this.canAccessExternalDispute() && outcomeDocGroupModels.any(docGroup => {
      const hasExistingReviewRequest =  outcomeDocRequestCollection.find(request => (
        request.isReview() && request.get('submitter_id') === loggedInParticipant
      ));
      return !hasExistingReviewRequest && docGroup.getDocFilesThatCanRequestReview().length
    });
  },

  canAccessExternalReviewPayment() {
    return this._canAccessExternalReview(false);
  },

  canAccessExternalReview() {
    return this._canAccessExternalReview(true);
  },

  canAccessExternalSubServ(participantId) {
    const isPaid = paymentsChannel.request('get:fee:intake') ? paymentsChannel.request('get:fee:intake').get('is_paid') : false;
    const respondent = participantsChannel.request('get:respondents');
    const hasServiceQuadrantValue = !!noticeChannel.request('get:subservices:quadrant:config', participantId);
    return this.canAccessExternalDispute() && hasServiceQuadrantValue && isPaid && respondent.length;
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
    if (!dispute || !dispute.get('accessCode')) return;
    return !!activeNotice && !dispute.isUnitType() && !dispute.isCreatedRentIncrease() && (
      dispute.checkStageStatus(2, [20, 21, 22, 23, 24, 95]) ||
      dispute.checkStageStatus(4, [40, 41, 42, 43, 44, 45, 95]) ||
      dispute.checkStageStatus(6, [60])
    ) && dispute.checkProcess([1, 5, 6, 7]);
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
