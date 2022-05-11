/**
 * @class core.components.claim.ClaimModel
 * @memberof core.components.claim
 * @augments core.components.model.CMModel
 */
import Backbone from 'backbone';
import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import ClaimDetailModel from './ClaimDetail_model';

const configChannel = Radio.channel('config');

const api_name = 'issues/claim';
export default CMModel.extend({
  idAttribute: 'claim_id',
  defaults: {
    claim_id: null,
    is_amended: null,
    claim_title: null,
    claim_type: null,
    claim_code: null,
    claim_group_id: null,
    claim_status: null,
    claim_status_reason: null,
    claim_source: null,
    claimDetails: null,
    modified_date: null,
  },

  API_SAVE_ATTRS: [
    'is_amended',
    'claim_title',
    'claim_type',
    'claim_code',
    'claim_status',
    'claim_source'
  ],

  nested_collections_data() {
    return {
      claimDetails: Backbone.Collection.extend({
        model: ClaimDetailModel
      })
    };
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('claim_group_id')}` : '');
  },

  _isClaimCodeIn(claim_code_list) {
    return this.get('claim_code') && _.contains(claim_code_list, this.get('claim_code'));
  },

  isDirectRequest() {
    return this._isClaimCodeIn(configChannel.request('get', 'direct_request_issue_codes'));
  },

  isTenantMoveOut() {
    return this._isClaimCodeIn(configChannel.request('get', 'tenant_cn_issue_codes'));
  },

  isLandlordDeposit() {
    return this._isClaimCodeIn(configChannel.request('get', 'landlord_deposit_issue_codes'));
  },

  isOLRD() {
    return this.get('claim_code') === configChannel.request('get', 'TT_DEPOSIT_AWARD_LANDLORD_APP_ISSUE_CODE');
  },

  isOPR() {
    return this.get('claim_code') && (configChannel.request('get', 'opr_issue_codes') || []).indexOf(this.get('claim_code')) !== -1;
  },

  isOPC() {
    return this.get('claim_code') === configChannel.request('get', 'OPC_ISSUE_CODE');
  },

  isOPL() {
    return this.get('claim_code') && (configChannel.request('get', 'opl_issue_codes') || []).indexOf(this.get('claim_code')) !== -1;
  },

  isCNOP() {
    return this.get('claim_code') === configChannel.request('get', 'LL_POSSESSION_TENANT_APP_ISSUE_CODE');
  },

  isCNR() {
    return this.get('claim_code') && (configChannel.request('get', 'cnr_issue_codes') || []).indexOf(this.get('claim_code')) !== -1;
  },

  isCNC() {
    return this.get('claim_code') && (configChannel.request('get', 'cnc_issue_codes') || []).indexOf(this.get('claim_code')) !== -1;
  },

  isCNL() {
    return this.get('claim_code') && (configChannel.request('get', 'cnl_issue_codes') || []).indexOf(this.get('claim_code')) !== -1;
  },

  isCNMN() {
    return this.get('claim_code') === configChannel.request('get', 'LL_UNPAID_RENT_AWARD_TENANT_APP_ISSUE_CODE');
  },

  isFeeRecovery() {
    return this._isClaimCodeIn([
      configChannel.request('get', 'landlord_fee_recovery'),
      configChannel.request('get', 'tenant_fee_recovery')
    ]);
  },

  isRemoved() {
    return this.get('claim_status') === configChannel.request('get', 'CLAIM_STATUS_DELETED') || this.isAmendRemoved();
  },

  isAmendRemoved() {
    return this.get('claim_status') === configChannel.request('get', 'CLAIM_STATUS_REMOVED');
  },

  isAmendRemoved() {
    return this.get('claim_status') === configChannel.request('get', 'CLAIM_STATUS_REMOVED');
  },

  addDetail(claim_detail_data) {
    const claimDetails = this.get('claimDetails'),
      claimDetailModel = new ClaimDetailModel(_.extend({}, claim_detail_data, { claim_id: this.get('claim_id') }));

    if (claimDetails === null) {
      this.set('claimDetails', []);
    }
    claimDetails.push(claimDetailModel);
    return claimDetailModel;
  },

  destroy(options) {
    const dfd = $.Deferred();
    const existingClaimDetails = this.get('claimDetails').filter(function(claimDetails) { return !claimDetails.isNew(); });
    const deleteError = function() {
      console.log(`[Error] Couldn't delete Claim / ClaimDetail`);
      dfd.reject();
    };

    Promise.all(_.map(existingClaimDetails, function(claimDetail) { return claimDetail.destroy(); }))
      .then(() => CMModel.prototype.destroy.call(this, options).done(dfd.resolve).fail(deleteError), deleteError);

    return dfd.promise();
  }
});
