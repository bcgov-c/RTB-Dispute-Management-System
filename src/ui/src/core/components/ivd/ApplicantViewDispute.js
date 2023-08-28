import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');

export default {
  isAccessibleExternally(dispute) {
    const isDisputeClosed = dispute.checkStageStatus(2, [90, 91, 94]) || dispute.checkStageStatus(4, [90, 94]) || dispute.checkStageStatus(6, 90) || dispute.checkStageStatus(10, 103);
    const isMaxClosedDaysReached = isDisputeClosed && configChannel.request('get', 'IVD_HIDDEN_CLOSE_DAYS') && Moment().isAfter(Moment(dispute.get('status')?.status_start_date).add(configChannel.request('get', 'IVD_HIDDEN_CLOSE_DAYS'), 'days'));
    return configChannel.request('get', 'UAT_TOGGLING')?.SHOW_IVD && !dispute.checkStageStatus(0) && !isMaxClosedDaysReached
  },

  isIvdEnabled(dispute=null, viewingParticipant=null) {
    dispute = dispute || disputeChannel.request('get');
    viewingParticipant = viewingParticipant || participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    return viewingParticipant?.isApplicant() && dispute?.isCreatedIntake();
  }
}