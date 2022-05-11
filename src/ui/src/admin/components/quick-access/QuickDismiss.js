import Backbone from 'backbone';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const claimsChannel = Radio.channel('claims');
const hearingChannel = Radio.channel('hearings');
const noticeChannel = Radio.channel('notice');

export default Backbone.Model.extend({
  initialize() {
    this.disputeGuid = disputeChannel.request('get:id');
    this.remedyStatusDismissedWithLeave = configChannel.request('get', 'REMEDY_STATUS_DISMISSED_WITH_LEAVE');
    this.remedyStatusDismissedNoLeave = configChannel.request('get', 'REMEDY_STATUS_DISMISSED_NO_LEAVE');
    this.remedySubDismissedWithLeave = configChannel.request('get', 'REMEDY_SUB_STATUS_DISMISSED_WITH_LEAVE');
    this.remedySubDismissedNoLeave = configChannel.request('get', 'REMEDY_SUB_STATUS_DISMISSED_NO_LEAVE');
    this.hearingComplexitySimple = configChannel.request('get', 'COMPLEXITY_SIMPLE');
    this.hearingMethodAdjudication = configChannel.request('get', 'HEARING_METHOD_ADJUDICATION');
    
    this.filingFees = [
      String(configChannel.request('get', 'landlord_fee_recovery') || ''),
      String(configChannel.request('get', 'tenant_fee_recovery') || '')
    ];
  },

  /* Quick Dismiss Helper Actions */
  promiseSetIssueRemediesTo(remedyData={}, options={}) {
    return new Promise((res, rej) => {
      const claims = claimsChannel.request('get');
      const claimsToDismiss = claims.filter(claimModel => {
        const claimCode = String(claimModel.getClaimCode() || '');
        if (!claimCode) return false;
        
        if (options.include_claim_codes) return _.contains(options.include_claim_codes, claimCode);
        else if (options.exclude_claim_codes) return !_.contains(options.exclude_claim_codes, claimCode);
        else return true;
      });

      Promise.all(claimsToDismiss.map(claim => {
        const remedy = claim.getApplicantsRemedy();
        if (remedy) remedy.set(remedyData)
        return remedy.save(remedy.getApiChangesOnly());
      })).then(res, rej);
    });
  },
  
  promiseSetIssuesToDismissedWithLeave(options={}) {
    const remedyData = { remedy_status: this.remedyStatusDismissedWithLeave, remedy_sub_status: this.remedySubDismissedWithLeave };
    return this.promiseSetIssueRemediesTo(remedyData, options);
  },

  promiseSetIssuesToDismissedNoLeave(options={}) {
    const remedyData = { remedy_status: this.remedyStatusDismissedNoLeave, remedy_sub_status: this.remedySubDismissedNoLeave };
    return this.promiseSetIssueRemediesTo(remedyData, options);
  },

  promiseSetLatestHearing(hearingData) {
    return new Promise((res, rej) => {
      const latestHearing = hearingChannel.request('get:latest');
      if (!latestHearing) return res();

      return latestHearing.save(hearingData).done(res).fail(rej);
    });
  },

  promiseSetHearingParticipationNotAttended() {
    // Set hearing participation on latest hearing to Not Set
    return new Promise((res, rej) => {
      const latestHearing = hearingChannel.request('get:latest');
      if (!latestHearing) return res();

      latestHearing.getParticipations().forEach(participation => participation.set({ participation_status: 0 }));
      latestHearing.saveHearingParticipations().done(res).fail(rej);
    });
  },

  promiseSetNoticeNotServed() {
    // Set notice service on latest notice and all amendment notices to Not Set
    return new Promise((res, rej) => {
      const notices = noticeChannel.request('get:all');
      const activeNotice = notices.find(notice => notice.isDisputeNotice());
      const noticesToClearService = [];

      if (activeNotice) {
        noticesToClearService.push(activeNotice);
        const parentNoticeId = activeNotice.id;
        notices.forEach(notice => {
          if (notice.get('parent_notice_id') === parentNoticeId && notice.isAmendmentNotice()) noticesToClearService.push(notice);
        });
      }
      
      // Set notice services to un-served and save
      Promise.all(noticesToClearService.map(notice => {
        notice.getServices().forEach(service => service.set({ is_served: false }));
        return notice.saveService();
      })).then(res, rej);
    });
  },

  loadFullHearingsDataPromise() {
    return new Promise((res, rej) => hearingChannel.request('load', this.disputeGuid).done(res).fail(rej));
  },

  loadNoticesPromise() {
    return new Promise((res, rej) => noticeChannel.request('load', this.disputeGuid).done(res).fail(rej));
  },


  /* Quick Dismiss Actions */
  performDismissDoubleNoShow() {
    return Promise.all([
      this.promiseSetIssuesToDismissedWithLeave({ exclude_claim_codes: this.filingFees }),
      this.promiseSetIssuesToDismissedNoLeave({ include_claim_codes: this.filingFees }),
      this.loadFullHearingsDataPromise()
        .then(() => this.promiseSetHearingParticipationNotAttended())
        .then(() => this.promiseSetLatestHearing({
          hearing_duration: 10,
          hearing_method: this.hearingMethodAdjudication,
          hearing_complexity: this.hearingComplexitySimple,  
        }))
    ]);
  },

  performDismissApplicantNoShow() {
    return Promise.all([
      this.promiseSetIssuesToDismissedNoLeave(),
      this.loadFullHearingsDataPromise().then(() => this.promiseSetLatestHearing({        
        hearing_method: this.hearingMethodAdjudication,
      }))
    ]);
  },

  performDismissNoNoticeService() {
    return Promise.all([
      this.promiseSetIssuesToDismissedWithLeave({ exclude_claim_codes: this.filingFees }),
      this.promiseSetIssuesToDismissedNoLeave({ include_claim_codes: this.filingFees }),
      this.loadNoticesPromise().then(() => this.promiseSetNoticeNotServed()),
      this.loadFullHearingsDataPromise().then(() => this.promiseSetLatestHearing({
        hearing_method: this.hearingMethodAdjudication
      }))
    ]);
  },

  performDismissIssuesWithLeave() {
    return Promise.all([
      this.promiseSetIssuesToDismissedWithLeave({ exclude_claim_codes: this.filingFees }),
      this.promiseSetIssuesToDismissedNoLeave({ include_claim_codes: this.filingFees }),
      this.loadFullHearingsDataPromise().then(() => this.promiseSetLatestHearing({
        hearing_method: this.hearingMethodAdjudication
      }))
    ]);
  },

  performDismissIssuesNoLeave() {
    return Promise.all([
      this.promiseSetIssuesToDismissedNoLeave(),
      this.loadFullHearingsDataPromise().then(() => this.promiseSetLatestHearing({
        hearing_method: this.hearingMethodAdjudication
      }))
    ]);
  },

});