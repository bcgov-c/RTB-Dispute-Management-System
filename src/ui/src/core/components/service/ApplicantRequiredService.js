/**
 * @fileoverview - Contains helper functions for ARS feature
 */
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import Dispute_model from '../dispute/Dispute_model';
import Notice_model from '../notice/Notice_model';

const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');

const ARS_DEADLINE_DAYS = 5;
const IssueCodes = {
  CN: [203, 204, 205, 206, 207, 208, 224, 230, 231, 232, 233, 234, 235, 236],
  ET: [113, 213, 218],
};

export default {
  getServiceDeadlines(date=Moment()) {
    date = Moment.tz(date, configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING'));
    date.set({ hour: 23, minute: 59, seconds: 0, milliseconds: 0 });
    const service_deadline_date = UtilityMixin.util_getFirstBusinessDay(date.add(ARS_DEADLINE_DAYS, 'days'));
    return {
      service_deadline_date,
      second_service_deadline_date: UtilityMixin.util_getFirstBusinessDay(Moment(service_deadline_date).add(ARS_DEADLINE_DAYS, 'days')),
    };
  },

  isNoticeAvailableForARS(notice, notices=[]) {
    const firstParticipatoryGeneratedNotice = notices.length ? notices.filter(n => ((n.isGenerated() && n.isDisputeNotice()) || n.isOtherNotice()) && n.isParticipatoryNotice()).slice(-1)?.[0] : null;
    return !firstParticipatoryGeneratedNotice || notice?.id === firstParticipatoryGeneratedNotice?.id;
  },

  isAvailableForARS(dispute, issues=[], latestHearing=null, ignoreProcess=false) {
    const nonArsIssues = [...IssueCodes.CN, ...IssueCodes.ET];
    const hasNonArsIssues = issues.some(issue => nonArsIssues.includes(issue?.get('claim_code')));
    
    return (
      !hasNonArsIssues &&
      (dispute.checkProcess(1) || ignoreProcess) &&
      (dispute.isCreatedIntake() || dispute.isCreatedExternal()) &&
      (!latestHearing || latestHearing.isSingleApp())
    );
  },

  canGenerateNoticeARS(dispute, issues=[], latestHearing=null, notice, notices=[]) {
    const SHOW_ARS_AFTER_SUBMISSION_DATE = configChannel.request('get', 'UAT_TOGGLING')?.SHOW_ARS_AFTER_SUBMISSION_DATE;
    if (!SHOW_ARS_AFTER_SUBMISSION_DATE || !Moment(SHOW_ARS_AFTER_SUBMISSION_DATE).isValid() || !dispute?.get('submitted_date') || !Moment(dispute?.get('submitted_date')).isValid()) {
      return false;
    }
    
    return this.isNoticeAvailableForARS(notice, notices) &&
        this.isAvailableForARS(dispute, issues, latestHearing) &&
        Moment(dispute.get('submitted_date')).isSameOrAfter(Moment(SHOW_ARS_AFTER_SUBMISSION_DATE), 'minutes');
  },

  hasUpcomingArsDeadline(dispute, notice) {
    if (!(dispute instanceof Dispute_model && notice instanceof Notice_model)) return false;

    const hasFutureServiceDeadlineDate = notice.get('service_deadline_date') ? Moment(notice.get('service_deadline_date')).isAfter(Moment()) : false;
    return (
      (notice.get('has_service_deadline') && hasFutureServiceDeadlineDate) && 
      dispute.checkStageStatus(4, 41) &&
      (dispute.checkProcess(1) || !dispute.getProcess()) &&
      (dispute.isCreatedIntake() || dispute.isCreatedExternal())
    );
  },

  hasUpcomingArsReinstatementDeadline(dispute, notice) {
    if (!(dispute instanceof Dispute_model && notice instanceof Notice_model)) return false;

    const hasFutureSecondServiceDeadlineDate = notice.get('second_service_deadline_date') ? Moment(notice.get('second_service_deadline_date')).isAfter(Moment()) : false;
    return (
      (notice.get('has_service_deadline') && hasFutureSecondServiceDeadlineDate) && 
      dispute.checkStageStatus(4, 93) &&
      (dispute.checkProcess(1) || !dispute.getProcess()) &&
      (dispute.isCreatedIntake() || dispute.isCreatedExternal())
    );
  },


  onlineIntake_isAvailableForARS(dispute, issues=[], latestHearing=null) {
    const ignoreProcess = true;
    return !issues.any(issue => issue.isDirectRequest()) && this.isAvailableForARS(dispute, issues, latestHearing, ignoreProcess);
  },

  externalLogin_hasUpcomingArsDeadline(dispute, notice) {
    const participant = participantsChannel.request('get:participant', dispute?.get('tokenParticipantId'));
    return participant?.isApplicant() && this.hasUpcomingArsDeadline(dispute, notice);
  },

  externalLogin_hasUpcomingArsReinstatementDeadline(dispute, notice) {
    const participant = participantsChannel.request('get:participant', dispute?.get('tokenParticipantId'));
    return participant?.isApplicant() && this.hasUpcomingArsReinstatementDeadline(dispute, notice);
  },

};