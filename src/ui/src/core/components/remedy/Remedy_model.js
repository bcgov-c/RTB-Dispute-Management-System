/**
 * @class core.components.remedy.RemedyModel
 * @memberof core.components.remedy
 * @augments core.components.model.CMModel
 */

import Backbone from 'backbone';
import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import RemedyDetailModel from '../remedy/RemedyDetail_model';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

const api_name = 'issues/remedy';
export default CMModel.extend({
  idAttribute: 'remedy_id',
  defaults: {
    remedy_id: null,
    claim_id: null,
    is_amended: null,
    remedy_title: null,
    remedy_status: null,
    remedy_sub_status: null,
    remedy_type: null,
    remedy_source: null,
    remedy_status_reason_code: null,
    remedy_status_reason: null,
    award_details: null,
    awarded_amount: null,
    awarded_date: null,
    awarded_days_after_service: null,
    is_reviewed: null,
    prev_remedy_status: null,
    prev_remedy_sub_status: null,
    prev_awarded_amount: null,
    prev_awarded_date: null,
    prev_awarded_days_after_service: null,
    prev_award_details: null,
    prev_award_by: null,
    prev_award_date: null,
    prev_remedy_status_reason: null,
    prev_remedy_status_reason_code: null,

    remedyDetails: null,
    modified_date: null,
    modified_by: null,
    created_date: null,
    created_by: null,
  },

  API_PATCH_ONLY_ATTRS: [
    'is_reviewed',
    'prev_remedy_status',
    'prev_remedy_sub_status',
    'prev_awarded_amount',
    'prev_awarded_date',
    'prev_awarded_days_after_service',
    'prev_award_details',
    'prev_award_by',
    'prev_award_date',
    'prev_remedy_status_reason',
    'prev_remedy_status_reason_code',
  ],

  API_SAVE_ATTRS: [
    'is_amended',
    'remedy_title',
    'remedy_status',
    'remedy_sub_status',
    'remedy_type',
    'remedy_source',
    'remedy_status_reason_code',
    'remedy_status_reason',
    'award_details',
    'awarded_amount',
    'awarded_date',
    'awarded_days_after_service',
  ],

  nested_collections_data() {
    return {
      remedyDetails: Backbone.Collection.extend({
        model: RemedyDetailModel
      })
    };
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('claim_id')}` : '');
  },

  getRemedyDetails() {
    return this.get('remedyDetails');
  },

  addDetail(remedy_detail_data) {
    const remedyDetails = this.get('remedyDetails'),
      remedyDetailModel = new RemedyDetailModel(_.extend({}, remedy_detail_data, { remedy_id: this.get('remedy_id') }));

    if (remedyDetails === null) {
      this.set('remedyDetails', []);
    }
    remedyDetails.push(remedyDetailModel);
    return remedyDetailModel;
  },

  getFirstRemedyDetail() {
    const remedyDetails = this.getRemedyDetails();
    return remedyDetails.length ? remedyDetails.at(0) : null;
  },

  getFirstAssociatedDate() {
    const firstRemedyDetail = this.getFirstRemedyDetail();
    return firstRemedyDetail ? firstRemedyDetail.get('associated_date') : null;
  },

  getFirstDescription() {
    const firstRemedyDetail = this.getFirstRemedyDetail();
    return firstRemedyDetail ? firstRemedyDetail.get('description') : null;
  },

  getRemedyDetails() {
    return this.get('remedyDetails');
  },

  // Gets amount for all linked remedy details
  getAmount() {
    let totalAmount = 0;
    (this.getRemedyDetails() || []).forEach(remedyDetail => totalAmount += remedyDetail.get('amount') || 0);
    return totalAmount;
  },

  getAwardedAmount() {
    // An amount is only considered awarded if it is in a status
    // TODO: We should remove this status check, and be clearing awarded_amount on status changes that invalidate it instead.
    if (!this.isOutcomeAwarded() && !this.isOutcomeSettled()) return 0;
    return this.get('awarded_amount') || 0;
  },

  /**
   * Sets the current outcome fields into prev_* versions of those fields, to "park" a previous outcome.
   */
  saveAsReviewed(disputeClaimModel) {
    const attrs = this.toJSON();
    // An outcome can be modified via Remedy or RemedyDetail (description).
    // If RemedyDetail was the last-modified object, then we need to use it vs Remedy when parking award by/date
    const lastModifiedOutcomeModel = disputeClaimModel && disputeClaimModel.getOutcomeLastModifiedModel();
    if (!attrs.is_reviewed) {
      this.set({
        is_reviewed: true,
        prev_remedy_status: attrs.remedy_status,
        prev_remedy_sub_status: attrs.remedy_sub_status,
        prev_awarded_amount: attrs.awarded_amount,
        prev_awarded_date: attrs.awarded_date,
        prev_awarded_days_after_service: attrs.awarded_days_after_service,
        prev_award_details: attrs.award_details,
        prev_remedy_status_reason: attrs.remedy_status_reason,
        prev_remedy_status_reason_code: attrs.remedy_status_reason_code,
        prev_award_by: lastModifiedOutcomeModel ? lastModifiedOutcomeModel.get('modified_by') : attrs.modified_by,
        prev_award_date: lastModifiedOutcomeModel ? lastModifiedOutcomeModel.get('modified_date') : attrs.modified_date,
      });
    }
    return new Promise((res, rej) => this.save(this.getApiChangesOnly()).done(res).fail(rej));
  },

  isReviewed() {
    return !!this.get('is_reviewed');
  },

  hasOutcome() {
    return ![null, configChannel.request('get', 'REMEDY_STATUS_NOT_SET')].includes(this.get('remedy_status'));
  },

  _checkRemedyStatus(configCodes, options={}) {
    if (!configCodes) {
      console.log("[Info] Passed empty config value to remedy status check");
      return;
    }
    if (!Array.isArray(configCodes)) {
      configCodes = [configCodes];
    }
    
    const remedy_status = this.get(options.use_prev ? 'prev_remedy_status' : 'remedy_status') || null;
    return configCodes.map(code => configChannel.request('get', code)).includes(remedy_status);
  },

  isOutcomeRemoved(options={}) {
    return this._checkRemedyStatus([
      'REMEDY_STATUS_REMOVE_AMEND',
      'REMEDY_STATUS_REMOVE_SEVER',
      'REMEDY_STATUS_DISMISSED_WITH_LEAVE',
      'REMEDY_STATUS_DISMISSED_NO_LEAVE'
    ], options);
  },

  isOutcomeAwarded(options={}) {
    return this._checkRemedyStatus([
      'REMEDY_STATUS_POSSESSION_GRANTED_2DAY',
      'REMEDY_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE',
      'REMEDY_STATUS_POSSESSION_GRANTED_OTHER_DATE',
      'REMEDY_STATUS_MONETARY_GRANTED',
      'REMEDY_STATUS_OTHER_ISSUE_GRANTED'
    ], options);
  },

  isOutcomeAwarded2Day(options={}) {
    return this._checkRemedyStatus(['REMEDY_STATUS_POSSESSION_GRANTED_2DAY', 'REMEDY_STATUS_SETTLED_POSSESSION_2DAY'], options);
  },

  isOutcomeAwardedSpecificDate(options={}) {
    return this._checkRemedyStatus(['REMEDY_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE', 'REMEDY_STATUS_SETTLED_POSSESSION_SPECIFIC_DATE'], options);
  },

  isOutcomeAwardedOtherDate(options={}) {
    return this._checkRemedyStatus(['REMEDY_STATUS_POSSESSION_GRANTED_OTHER_DATE', 'REMEDY_STATUS_SETTLED_POSSESSION_OTHER_DATE'], options);
  },

  isOutcomeAwardedOther(options={}) {
    return this._checkRemedyStatus(['REMEDY_STATUS_OTHER_ISSUE_GRANTED'], options);
  },

  isOutcomeDismissed(options={}) {
    return this._checkRemedyStatus(['REMEDY_STATUS_DISMISSED_WITH_LEAVE', 'REMEDY_STATUS_DISMISSED_NO_LEAVE'], options);
  },

  isOutcomeDismissedWithLeave(options={}) {
    return this._checkRemedyStatus('REMEDY_STATUS_DISMISSED_WITH_LEAVE', options);
  },

  isOutcomeDismissedWithoutLeave(options={}) {
    return this._checkRemedyStatus('REMEDY_STATUS_DISMISSED_NO_LEAVE', options);
  },
  
  isOutcomeSettled(options={}) {
    return this._checkRemedyStatus([
      'REMEDY_STATUS_SETTLED',
      'REMEDY_STATUS_SETTLED_MONETARY',
      'REMEDY_STATUS_SETTLED_POSSESSION_2DAY',
      'REMEDY_STATUS_SETTLED_POSSESSION_SPECIFIC_DATE',
      'REMEDY_STATUS_SETTLED_POSSESSION_OTHER_DATE'
    ], options);
  },

  isOutcomeNoJurisdiction(options={}) {
    return this._checkRemedyStatus('REMEDY_STATUS_NO_JURISDICTION', options);
  },

  isOutcomeIncludedAndNotDecided(options={}) {
    return this._checkRemedyStatus('REMEDY_STATUS_NOT_DECIDED', options);
  },

  isOutcomeAmend(options={}) {
    return this._checkRemedyStatus('REMEDY_STATUS_REMOVE_AMEND', options);
  },

  isOutcomeSever(options={}) {
    return this._checkRemedyStatus('REMEDY_STATUS_REMOVE_SEVER', options);
  },
  

  getOutcomeDisplay(disputeClaimModel, options={}) {
    const isAmend = this.isOutcomeAmend(options);
    const isSever = this.isOutcomeSever(options);
    const isDismiss = this.isOutcomeDismissed(options);
    const isAwarded = this.isOutcomeAwarded(options);
    const isSettled = this.isOutcomeSettled(options);
    const isOutcomeNoJurisdiction = this.isOutcomeNoJurisdiction(options);
    const isOutcomeIncludedAndNotDecided = this.isOutcomeIncludedAndNotDecided(options);
    const isMonetaryOutcomeIssue = disputeClaimModel && disputeClaimModel.isMonetaryOutcomeIssue();
    const isLandlordMoveOutIssue = disputeClaimModel && disputeClaimModel.isLandlordMoveOutIssue();
    const isOutcomeDismissedWithLeave = this.isOutcomeDismissedWithLeave();
    const usePrev = options.use_prev;
    const statusReason = this.get(usePrev ? 'prev_remedy_status_reason_code' : 'remedy_status_reason_code');
    const statusReasonDisplay = statusReason && (configChannel.request('get', 'REMEDY_STATUS_REASONS_DISPLAY') || {})[statusReason];

    const awardDetailsDisplay = $.trim(this.get(usePrev ? 'prev_award_details' : 'award_details'));
    let outcomeDisplay;
    if (isAwarded || isSettled) {
      outcomeDisplay = isAwarded ? 'Granted' : 'Settled';
      const awardedAmount = this.get(usePrev ? 'prev_awarded_amount' : 'awarded_amount');
      if (isMonetaryOutcomeIssue && awardedAmount !== null) outcomeDisplay += ` - ${Formatter.toAmountDisplayWithNegative(awardedAmount)}`;
      if (isLandlordMoveOutIssue) outcomeDisplay += ` - ${this.getGrantedMoveOutOutcomeDateDisplay(disputeClaimModel, options)}`;
    } else if (isDismiss) {
      outcomeDisplay = `Dismissed - ${isOutcomeDismissedWithLeave ? 'With Leave To Re-Apply' : 'Without Leave To Re-Apply'}`;
    } else if (isOutcomeNoJurisdiction) {
      outcomeDisplay = 'No Jurisdiction';
    } else if (isSever) {
      outcomeDisplay = `Severed${statusReasonDisplay ? ` - ${statusReasonDisplay}` : ''}`;
    } else if (isAmend) {
      outcomeDisplay = `Amended${statusReasonDisplay ? ` - ${statusReasonDisplay}` : ''}`;
    } else if (isOutcomeIncludedAndNotDecided) {
      outcomeDisplay = `Not Decided`;
    }

    if (!$.trim(outcomeDisplay)) return null;
    return options.use_html ? `${isOutcomeIncludedAndNotDecided ? '<span class="dispute-claim-outcome-icon-not-decided"></span>' : ''}<span class="dispute-claim-outcome-text ${isOutcomeIncludedAndNotDecided ? 'dispute-claim-outcome-text-not-decided' : ''}">${outcomeDisplay}${awardDetailsDisplay ? `:</span>&nbsp;<span class="dispute-claim-outcome-display-description">${awardDetailsDisplay}</span>` : ''}`
      : `${outcomeDisplay}${awardDetailsDisplay ? `: ${this.get('award_details')}` : ''}`;
  },


  getGrantedMoveOutOutcomeDateDisplay(disputeClaimModel, options={}) {
    const isLandlordMoveOutIssue = disputeClaimModel && disputeClaimModel.isLandlordMoveOutIssue();
    const usePrev = options.use_prev;
    let returnString = '';
    if ((this.isOutcomeSettled(options) || this.isOutcomeAwarded(options)) && isLandlordMoveOutIssue) {
      if (this.isOutcomeAwarded2Day(options)) {
        returnString = `OP Dated ${this.get(usePrev ? 'prev_awarded_days_after_service' : 'awarded_days_after_service')} Day${this.get(usePrev ? 'prev_awarded_days_after_service' : 'awarded_days_after_service') !== 1?'s':''}`;
      } else if (this.isOutcomeAwardedSpecificDate(options)) {
        returnString = `OP Dated ${Formatter.toDateDisplay(this.get(usePrev ? 'prev_awarded_date' : 'awarded_date'))}`;
      } else if (this.isOutcomeAwardedOtherDate(options)) {
        returnString = `OP Dated Other`;
      }
    }
    return returnString;
  },

  getModifiedDisplay(options={}) {
    const usePrev = options.use_prev;
    const user = userChannel.request('get:user', this.get(usePrev ? 'prev_award_by' : 'modified_by')) || null;
    if (!user) return null;
    const modifiedBy = user ? user.getDisplayName() : null;
    return `${modifiedBy ? `${modifiedBy}: `:''}${Formatter.toDateAndTimeDisplay(this.get(usePrev ? 'prev_award_date' : 'modified_date')) || ''}`;
  },

  clearOutcome(options={}) {
    this.set({
      remedy_status: 0,
      remedy_sub_status: null,
      award_details: null,
      awarded_date: null,
      awarded_amount: null,
      awarded_days_after_service: null,
      remedy_status_reason: null,
      remedy_status_reason_code: null,
    }, options);
  },

  save(attrs, options) {
    options = options || {};
    const dfd = $.Deferred();
    CMModel.prototype.save.call(this, attrs, options)
      .done(() => {
        const remedyDetails = this.getRemedyDetails();
        if (remedyDetails) {
          remedyDetails.forEach(remedyDetail => {
            if (!remedyDetail.get('remedy_id')) {
              remedyDetail.set('remedy_id', this.id, { silent: true });
            }
          });
          if (options.full) {
            Promise.all(remedyDetails.map(remedyDetail => remedyDetail.save()))
              .then(() => dfd.resolve(this), dfd.reject);
          } else {
            dfd.resolve(this);
          }
        }
      })
      .fail(dfd.reject);

    return dfd.promise();
  },
  
  hadStaffActivity() {
    const user = userChannel.request('get:user', this.get('modified_by'));
    // If the model was changed since it was created, and if it was last changed by an internal staff
    return user && user.isSystemUser() && this.get('modified_date') !== this.get('created_date');
  },

  destroy(options) {
    const dfd = $.Deferred();

    const existingRemedyDetails = this.getRemedyDetails().filter(function(remedyDetail) { return !remedyDetail.isNew(); });

    const deleteError = function() {
      console.log(`[Error] Couldn't delete Remedy / RemedyDetail`);
      dfd.reject();
    };

    Promise.all(_.map(existingRemedyDetails, function(remedyDetail) { return remedyDetail.destroy(); }))
      .then(() => CMModel.prototype.destroy.call(this, options).done(dfd.resolve).fail(deleteError), deleteError);

    return dfd.promise();
  }
});
