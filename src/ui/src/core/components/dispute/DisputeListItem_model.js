import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DisputeFlag_collection from '../dispute-flags/DisputeFlag_collection';
import Notice_model from '../notice/Notice_model';
import ApplicantRequiredService from '../service/ApplicantRequiredService';
import DisputeModel from './Dispute_model';
import ApplicantViewDispute from '../ivd/ApplicantViewDispute';

const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  // Use the dispute_guid as id attribute in order to let Backbone merge models
  idAttribute: 'dispute_guid',

  defaults: {
    created_date: null,
    creation_method: null,
    cross_app_dispute_guid: null,
    cross_app_file_number: null,
    dispute_guid: null,
    dispute_sub_type: null,
    dispute_type: null,
    file_number: null,
    modified_by: null,
    modified_date: null,
    status: {
      dispute_status_id: null,
      dispute_status: null,
      dispute_stage: null,
      status_note: null,
      status_set_by: null,
      status_start_date: null,
      evidence_override: null,
      process: null
    },
    hearing: {
      hearing_start_date: null,
      shared_hearing_link_type: null
    },
    submitted_by: null,
    submitted_date: null,
    initial_payment_by: null,
    initial_payment_date: null,
    initial_payment_method: null,
    tenancy_address: null,
    tenancy_city: null,
    tenancy_country: null,
    tenancy_end_date: null,
    tenancy_ended: null,
    tenancy_geozone_id: null,
    tenancy_zip_postal: null,
    primary_applicant_access_code: null,
    unpaid_intake_fee: null,
    linked_dispute_flags: null,


    // Put display values here with default everything off
    showButtonReview: false,
    showDetailsLink: false,
    showAccessCode: false,
    showHearingDetails: false,
    showButtonDelete: false,
    showButtonWithdraw: false,
    showButtonCompletePayment: false,
    textButtonCompletePayment: null,
    showButtonCompleteApplication: false,
    showButtonUpdateApplication: false,
    showReviewRequest: false,
    showArsDeadlineWarning: false,
    showArsReinstatementDeadlineWarning: false,
  },

  initialize() {
    // Can't withdraw a dispute when the application is a tenant having certain notice issue codes
    this.tenant_cn_issue_codes = configChannel.request('get', 'tenant_cn_issue_codes');

    // Get a version of this data as a dispute so we can query it more easily
    this.dispute = new DisputeModel(this.toJSON());

    this.notice = new Notice_model({
      notice_id: this.get('latest_notice_id'),
      notice_delivered_date: this.get('latest_notice_delivery_date'),
      has_service_deadline: this.get('latest_notice_has_service_deadline'),
      service_deadline_date: this.get('latest_notice_service_deadline_date'),
      second_service_deadline_date: this.get('latest_notice_second_service_deadline_date'),
    });
    
    this.DELETE_STATUS = configChannel.request('get', 'STATUS_DELETED');
    this.DISPUTE_ACCESS_URL = configChannel.request('get', 'DISPUTE_ACCESS_URL');
    this.DISPUTE_HEARING_LINK_TYPE_SINGLE = configChannel.request('get', 'DISPUTE_HEARING_LINK_TYPE_SINGLE');
    
    this.set({ notice: this.notice });
    this.set(this.getDisplayRules());
  },

  updateStatus(statusObj, options) {
    options = options || {};
    this.set('status', statusObj, options);
    if (this.dispute) {
      this.dispute.set('status', statusObj, options);
    }
    this.set(this.getDisplayRules(), options);
  },

  isTenantApplication() {
    return this.dispute.isTenant();
  },

  isInDeletedStatus() {
    return this.dispute.checkStageStatus(0, 99);
  },

  isMigrated() {
    return this.dispute.isMigrated();
  },

  isCreatedAriC() {
    return this.dispute.isCreatedAriC();
  },

  isCreatedPfr() {
    return this.dispute.isCreatedPfr();
  },

  isUnitType() {
    return this.dispute.isUnitType();
  },

  isUnpaidWhenShouldBePaid() {
    return this.dispute && !this.get('unpaid_intake_fee') &&
      this.dispute.checkProcess([1, 2]) &&
      this.dispute.checkStageStatus(0, [2, 3, 4]);
  },

  hasFutureHearing() {
    const hearingData = this.get('hearing');
    return hearingData && Moment(hearingData.hearing_start_datetime).isAfter(Moment(), 'minute');
  },

  hasMultiLinkedHearing() {
    const hearingData = this.get('hearing');
    return hearingData && hearingData.shared_hearing_link_type && hearingData.shared_hearing_link_type !== this.DISPUTE_HEARING_LINK_TYPE_SINGLE;
  },

  hasHearingWithdrawRestriction() {
    if (![6, 8].includes(this.dispute.getStage())) return false;

    const hearingData = this.get('hearing');
    const startDate = hearingData && Moment(hearingData.hearing_start_datetime);
    const approachTime = Moment(startDate).isValid() ? startDate.subtract(configChannel.request('get', 'HEARING_WITHDRAW_BLOCK_TIME_MINUTES'), 'minutes') : null;
    return approachTime ? Moment().isAfter(approachTime, 'minutes') : false;
  },

  getDisplayRules() {
    // Create a dispute object from the dispute list so we can use DisputeModel's internal methods to check stage/status/process etc
    const canCompletePayment = this.dispute && this.dispute.get('unpaid_intake_fee') && this.dispute.checkStageStatus(0, [2, 3, 4]);
    const isCreatedAriC = this.isCreatedAriC();
    const processCanWithdraw = this.dispute.checkProcess(isCreatedAriC ? [7] : [1, 2, 5]);
    const activeAdjournedFlags = new DisputeFlag_collection(this.get('linked_dispute_flags') || []).filter(flag => flag.isAdjourned() && flag.isActive());
    const activeReviewFlags = new DisputeFlag_collection(this.get('linked_dispute_flags')).some((flag) => flag.isActive() && flag.isReview())
    
    const displayRules = {
      showButtonWithdraw: this.dispute && !this.hasMultiLinkedHearing() && processCanWithdraw && !activeAdjournedFlags.length && (
        this.dispute.checkStageStatus(0, [2, 3, 4, 5]) ||
        this.dispute.checkStageStatus(2, [20, 21, 22, 23, 24, 95]) ||
        this.dispute.checkStageStatus(4, [40, 41, 42, 43, 44, 45, 93, 95]) ||
        this.dispute.checkStageStatus(6, 60) ||
        this.dispute.checkStageStatus(8, 80)
      ),

      showButtonDelete: this.dispute && this.dispute.checkStageStatus(0, [0, 2, 3, 4]),

      showButtonCompleteApplication: this.dispute && this.dispute.checkStageStatus(0, 0),
      showButtonUpdateApplication: this.dispute && this.dispute.checkStageStatus(0, 1),
      showButtonCompletePayment: canCompletePayment,
      textButtonCompletePayment: canCompletePayment && this.dispute.checkStageStatus(0, 3) ? 'Complete Fee Waiver' : null,
      showAccessCode: !!this.get('primary_applicant_access_code'),
      showReviewRequest: activeReviewFlags,

      showArsDeadlineWarning: ApplicantRequiredService.hasUpcomingArsDeadline(this.dispute, this.notice),
      showArsReinstatementDeadlineWarning: ApplicantRequiredService.hasUpcomingArsReinstatementDeadline(this.dispute, this.notice),
      
      showDetailsLink: ApplicantViewDispute.isAccessibleExternally(this.dispute),

      showHearingDetails: this.dispute && this.hasFutureHearing() && (
        this.dispute.checkStageStatus(4, [40, 41, 42, 43, 44, 45, 95]) ||
        this.dispute.checkStageStatus(6, [60, 61, 95]) || 
        this.dispute.checkStageStatus(8, [80, 81])
      )
    };
    
    return displayRules;
  }
});
