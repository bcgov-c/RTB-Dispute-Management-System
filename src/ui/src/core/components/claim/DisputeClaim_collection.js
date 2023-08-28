/**
 * @class core.components.claim.DisputeClaimCollection
 * @memberof core.components.claim
 * @augments Backbone.Collection
 */


import Backbone from 'backbone';
import Radio from 'backbone.radio';

import DisputeClaimModel from './DisputeClaim_model';


// TODO: Should make a better mapping of landlord/tenant issues, because the over/under 200 rule might not always work
const TENANT_LANDLORD_ISSUE_CODE_CUTOFF = 200;

const configChannel = Radio.channel('config');
const claimGroupsChannel = Radio.channel('claimGroups');
const claimsChannel = Radio.channel('claims');

export default Backbone.Collection.extend({
  model: DisputeClaimModel,

  claim_source: null,
  remedy_source: null,

  initialize(models, options) {
    options = options || {};
    this.on('destroy', function(model) {
      this.remove(model);
    });

    this.claim_source = options.claim_source;
    this.remedy_source = options.remedy_source;
    
    this.multi_unit_issue_codes = [
      "ARI_E_ISSUE_CODE",
      "ARI_C_ISSUE_CODE",
      "PFR_ISSUE_CODE",
    ].map(c => configChannel.request('get', c)).filter(a => a);
    this.op_issue_codes = [...(configChannel.request('get', 'tenant_cn_issue_codes')||[]), ...(configChannel.request('get', 'landlord_op_issue_codes')||[])];
    this.mn_issue_codes = configChannel.request('get', 'mn_issue_codes');
    this.other_issue_codes = configChannel.request('get', 'other_issue_codes');
  },

  comparator(model) {
    // Sort order:
    // Any multi-unit issues (ARI-C, PFR, ARI-E,)
    // Possession (OP, CN)
    // Monetary (MN) (no fee recovery issues)
    // Other (misc)
    // Fee Recovery (FFL, FFT)
    // NOTE: Each category also has a left-right sort for each issue. This is the order they appear in the "_codes" list
    const SORT_OFFSETS = {
      UNIT: 1000,
      POSSESSION: 2000,
      MONETARY: 3000,
      OTHER: 4000,
      FEE_RECOVERY: 5000,
      _FALLBACK: 6000,
    };
    const claimCode = model?.claim?.get('claim_code');
    if (this.multi_unit_issue_codes?.includes(claimCode)) return SORT_OFFSETS.UNIT+this.multi_unit_issue_codes?.indexOf(claimCode);
    else if (this.op_issue_codes?.includes(claimCode)) return SORT_OFFSETS.POSSESSION+this.op_issue_codes?.indexOf(claimCode);
    else if (this.mn_issue_codes?.includes(claimCode)) return SORT_OFFSETS.MONETARY+this.mn_issue_codes?.indexOf(claimCode);
    else if (this.other_issue_codes?.includes(claimCode)) return SORT_OFFSETS.OTHER+this.other_issue_codes?.indexOf(claimCode);
    else if (model.isFeeRecovery()) return SORT_OFFSETS.FEE_RECOVERY;
    else if (Number.isInteger(claimCode)) return SORT_OFFSETS.FEE_RECOVERY - 1; // If no matches, return the issue at the end, just before fee recovery
    else return SORT_OFFSETS._FALLBACK;
  },

  getTotalAmountClaimed() {
    let total = 0;
    this.each(function(disputeClaim) {
      total += disputeClaim.getAmount();
    });
    return total;
  },

  getTotalAmountGranted() {
    let total = 0;
    this.each(function(disputeClaim) {
      total += disputeClaim.getAmount();
    });
    return total;
  },

  hasDirectRequest() {
    return this.any(function(disputeClaim) { return disputeClaim.isDirectRequest(); });
  },

  hasTenantMoveOut() {
    return this.any(function(disputeClaim) { return disputeClaim.isTenantMoveOut(); });
  },

  hasLandlordDeposit() {
    return this.any(function(disputeClaim) { return disputeClaim.isLandlordDeposit(); });
  },

  getEmptyClaimData() {
    return _.extend({
      claim_group_id: claimGroupsChannel.request('get:id'),
      claim_status: configChannel.request('get', 'CLAIM_STATUS_NOT_VALIDATED')
    }, this.claim_source  ? { claim_source: this.claim_source } : {});
  },

  getEmptyRemedyData() {
    return _.extend({
      remedy_status: configChannel.request('get', 'REMEDY_STATUS_NOT_SET')
    }, this.remedy_source  ? { remedy_source: this.remedy_source } : {});
  },

  // Used in the Step5 build config, and in PageItemCreator
  toClaimCodeLookup() {
    const parsed_claims = {};
    _.each(this.pluck('claim_code'), function(claim_code) {
      if (!claim_code) {
        return;
      }
      if (claim_code >= TENANT_LANDLORD_ISSUE_CODE_CUTOFF && claim_code !== 226 && claim_code !== 227) {
        parsed_claims[claim_code] = 'tenant';
      } else {
        parsed_claims[claim_code] = 'landlord';
      }
    }, this);
    return parsed_claims;
  },

  createClaim(dispute_claim_data) {
    return new DisputeClaimModel(_.extend(dispute_claim_data, this.getEmptyClaimData()));
  },


  createClaimWithRemedy(dispute_claim_data={}, remedy_data={}) {
    const disputeClaimModel = this.createClaim(dispute_claim_data);
    disputeClaimModel.addRemedy(Object.assign({}, this.getEmptyRemedyData(), remedy_data));
    return disputeClaimModel;
  },

  // Returns the models that are needed to add or to remove for turning this collection into the list of claim codes given
  getClaimDeltas(claim_code_list) {
    if (!claim_code_list || _.isEmpty(claim_code_list)) {
      console.log(`[Warning] Trying to get claim deltas for an empty list`);
    }

    const models_to_destroy = [],
      models_to_add = [];

    _.each(claim_code_list, function(claim_code) {
      if (!this.findWhere({ claim_code: claim_code })) {
        models_to_add.push(this.createClaim({claim_code: claim_code}));
      }
    }, this);

    this.each(function(disputeClaim) {
      // Don't update the claim when it is a fee recovery or a special non-externally visible issue
      if (disputeClaim.isHiddenExternal()) {
        return;
      }
      if (!_.contains(claim_code_list, disputeClaim.get('claim_code'))) {
        models_to_destroy.push(disputeClaim);
      }
    });

    return {
      to_add: models_to_add,
      to_destroy: models_to_destroy
    };
  },

  // Returns the XHR changeset required for turning this collection into the list of claims given
  setClaimListTo(claim_code_list) {
    const claim_deltas = this.getClaimDeltas(claim_code_list);
    _.each(claim_deltas.to_add, function(claim_model) {
      this.add(claim_model);
    }, this);

    const claimsToDelete = claim_deltas.to_destroy;
    let claimsToAdd = [];
    this.each(function(disputeClaim) {
      if (_.contains(claim_code_list, disputeClaim.get('claim_code'))) {
        if (disputeClaim.isNew()) {
          claimsToAdd = _.union(claimsToAdd, [disputeClaim]);
        }
      }
    });
    return _.union(
      _.map(claimsToAdd, claim => () => claim.save()),
      _.map(claimsToDelete, claim => () => claimsChannel.request('delete:full', claim)),
    );
  },

  toEvidenceListData() {
    return _.filter(this.map(model => ({
      title: model.getClaimTitleWithCode(),
      data: model.toEvidenceListData(),
      isRemoved: model.isAmendRemoved()
    })), claimData => claimData.data.length);
  },


  removeAllRemovedClaimsAndEvidence(keepAmendRemoved=false, keepEmptyEvidence=false) {
    // Filter evidence and files associated to removed parties or packages
    this.each(function(claim) {
      const disputeEvidences = claim.get('dispute_evidences').clone();
      const disputeEvidencesToRemove = [];
      disputeEvidences.each(function(disputeEvidence) {
        const files = disputeEvidence.get('files').clone();
        const filesToBeRemoved = files.filter(file =>
          keepAmendRemoved ?
            (file.isFilePackageDeleted() || disputeEvidence.isParticipantDeleted()) :
            (file.isFilePackageRemoved() || disputeEvidence.isParticipantRemoved())
        );
        
        files.remove(filesToBeRemoved);
        disputeEvidence.set('files', files, { silent: true });

        if (filesToBeRemoved.length && files.length === 0) {
          disputeEvidencesToRemove.push(disputeEvidence);
        }
      });

      if (!keepEmptyEvidence) {
        disputeEvidences.remove(disputeEvidencesToRemove);
      }
      claim.set('dispute_evidences', disputeEvidences, { silent: true });
    });

    // Filter any removed claims
    if (!keepAmendRemoved) {
      this.remove(this.filter(c => c.isAmendRemoved()));
    }

    return this;
    //this.remove( this.filter(c => c.isAmendRemoved() || !c.get('dispute_evidences').length) );
  }

});
