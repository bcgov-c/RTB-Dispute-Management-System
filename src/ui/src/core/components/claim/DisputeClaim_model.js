/**
 * @fileoverview - This is the main abstraction for working with claims.  Wraps a single {@link core.components.claim.ClaimModel|ClaimModel}
 * but also has references to nested {@link core.components.claim.ClaimDetailModel|ClaimDetailModels},
 * {@link core.components.remedy.Remedy|Remedies} and {@link core.components.remedy.RemedyDetailModel|RemedyDetailModels}
 * @class core.components.claim.DisputeClaimModel
 * @memberof core.components.claim
 * @augments Backbone.Model
 */


import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ClaimModel from './Claim_model';
import RemedyCollection from '../remedy/Remedy_collection';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  idAttribute: 'claim_id',
  
  claim_group_id: null,
  claim: null,
  remedies: null,
  
  defaults: {
    // Shorthand fields from the associated claim object, but also available here for slightly easier access
    claim_id: null,  
    claim_code: null,

    // Add a title on the disputeClaim level in order to override any from config
    claim_title: null,

    // Used to hold DisputeEvidenceCollection.  Added externally (eg. by ClaimManager, etc)
    dispute_evidences: null
  },

  // Setup triggers / events on this in order to save/get different fields

  initialize(dispute_claim_data) {
    dispute_claim_data = dispute_claim_data || {};

    const remedies = dispute_claim_data.remedies || [];
    this.remedies = new RemedyCollection(remedies);

    this.HEARING_TOOLS_LANDLORD_MOVE_OUT_CLAIMS = configChannel.request('get', 'HEARING_TOOLS_LANDLORD_MOVE_OUT_CLAIMS');
  
    this.claim = new ClaimModel(_.omit(dispute_claim_data, ['remedies']));
    this.claim_group_id = dispute_claim_data.claim_group_id;
    this.claimConfig = this.getClaimConfig() || {};

    this.on('change:dispute_evidences', function(model, evidence_collection) {
      const updateFn = _.bind(function() {
        this.trigger('update', ...arguments);
      }, this);
      this.stopListening(evidence_collection, 'update', updateFn);
      this.listenTo(evidence_collection, 'update', updateFn, this);
    }, this);
  },

  _getPrimaryApplicant() {
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    if (!primaryApplicant) {
      console.log("[Error] No applicants created, something went wrong");
    }
    return primaryApplicant;
  },

  isNew() {
    return !this.claim || this.claim.isNew();
  },

  isSupportingEvidence() {
    return this.isNew() && !this.get('claim_code');
  },

  isFeeRecovery() {
    return this.claim.isFeeRecovery();
  },

  isDirectRequest() {
    return this.claim.isDirectRequest();
  },

  isTenantMoveOut() {
    return this.claim.isTenantMoveOut();
  },

  isLandlordDeposit() {
    return this.claim.isLandlordDeposit();
  },

  isOLRD() {
    return this.claim.isOLRD();
  },

  isCNOP() {
    return this.claim.isCNOP();
  },

  isCNR() {
    return this.claim.isCNR();
  },

  isCNMN() {
    return this.claim.isCNMN();
  },

  isCNC() {
    return this.claim.isCNC();
  },

  isCNL() {
    return this.claim.isCNL();
  },

  isOPR() {
    return this.claim.isOPR();
  },

  isOPC() {
    return this.claim.isOPC();
  },

  isOPL() {
    return this.claim.isOPL();
  },

  isRemoved() {
    return this.claim.isRemoved();
  },

  isDeleted() {
    return this.claim.isDeleted();
  },

  isAmendRemoved() {
    return this.claim.isAmendRemoved();
  },

  isAmended() {
    const emptyGetObj = { get() {}};
    return !this.isSupportingEvidence() && (
      this.claim.get('is_amended')
      || (this.getApplicantsClaimDetail() || emptyGetObj).get('is_amended') 
      || (this.getApplicantsRemedy() || emptyGetObj).get('is_amended')
      || (this.getApplicantsRemedyDetail() || emptyGetObj).get('is_amended')
    );
  },
  
  isRetainSecurityDeposit() {
    return this.claimConfig?.id && this.claimConfig?.id === configChannel.request('get', 'LL_RETAIN_SECURITY_DEPOSIT_CODE');
  },

  isAlwaysAwarded() {
    return !!(this.claimConfig || {}).alwaysAwarded;
  },

  isReverseAward() {
    return !!(this.claimConfig || {}).reverseAward;
  },

  isHiddenExternal() {
    return !!(this.claimConfig || {}).hiddenExternal;
  },

  isValidWithPastTenancy() {
    return _.contains(['both', 'past'], this.claimConfig.associatedToTenancyStatus);
  },

  isValidWithCurrentTenancy() {
    return _.contains(['both', 'current'], this.claimConfig.associatedToTenancyStatus);
  },

  isValidWithRTA() {
    return _.contains(['both', 'rta'], this.claimConfig.associatedToAct);
  },

  isValidWithMHPTA() {
    return _.contains(['both', 'mhpta'], this.claimConfig.associatedToAct);
  },

  isValidWithNoDeposit() {
    return !_.contains(['any', 'both', 'pet', 'security'], this.claimConfig.associatedToDeposit);
  },

  isValidWithNoSecurityDeposit() {
    return !_.contains(['both', 'security'], this.claimConfig.associatedToDeposit);
  },

  isValidWithNoPetDeposit() {
    return !_.contains(['both', 'pet'], this.claimConfig.associatedToDeposit);
  },

  isValidWithDirectRequest() {
    return this.isFeeRecovery() || this.isDirectRequest();
  },

  setDeleted() {
    if (this.claim) {
      this.claim.set('claim_status', configChannel.request('get', 'CLAIM_STATUS_DELETED'));
    }
  },

  setAmendedRemoved() {
    if (this.claim) {
      this.claim.set('claim_status', configChannel.request('get', 'CLAIM_STATUS_REMOVED'));
      this.setAmended();
    }
  },

  setAmended() {
    const subModels = [this.claim, this.getApplicantsClaimDetail(), this.getApplicantsRemedy(), this.getApplicantsRemedyDetail()];
    _.each(subModels, function(model) {
      model.set('is_amended', true);
    });
  },

  addApplicantsClaimDetail(claim_detail_data) {
    const primaryApplicant = this._getPrimaryApplicant();
    return this.claim.addDetail(_.extend(claim_detail_data, {
      claim_id: this.claim.get('claim_id'),
      description_by: primaryApplicant.get('participant_id')
    }));
  },

  getApplicantsClaimDetail() {
    //const primaryApplicant = this._getPrimaryApplicant();
    // For RTB, only one Remedy per Claim, so just return the first
    const claimDetails = this.claim.get('claimDetails');
    if (!claimDetails || claimDetails.length === 0) {
      console.log(`[Warning] No claim detail created in dispute claim model`, this);
    }
    // Primary applicant can now change mid-application, so just use the first one
    return claimDetails.at(0);
    //return this.claim.get('claimDetails').findWhere({ description_by: primaryApplicant.get('participant_id') });
  },

  addApplicantsRemedy(remedy_data) {
    // For RTB, only one Remedy per Claim, so just add a general one
    return this.addRemedy(remedy_data);
  },

  getClaimCode() {
    return this.claim ? this.claim.get('claim_code') : null;
  },

  getClaimCodeReadable() {
    return this.claimConfig.code || null;
  },

  getClaimTitleWithCode() {
    const claimCode = this.getClaimCodeReadable();
    return `${claimCode ? `${claimCode} - ` : ''}${this.getClaimTitle()}`;
  },

  getClaimConfig() {
    const claim_code = this.getClaimCode();
    return claim_code ? configChannel.request('get:issue', claim_code) : null;
  },

  getAssociatedEvidenceConfig() {
    return this.claimConfig.associatedEvidence || null;
  },

  // Return if the evidence exists in the config.  Also has the option of only returning optional evidence
  _hasEvidenceConfig(evidence_code_list, options) {
    options = options || {};
    const associated_evidence = this.getAssociatedEvidenceConfig();
    return _.any(associated_evidence, function(config_evidence) {
      return _.any(evidence_code_list, function(code) {
        return code === config_evidence.id && (options.optional_only ? !config_evidence.required : true);
      });
    });
  },

  hasConfigTenancyAgreementEvidence() {
    return this._hasEvidenceConfig([configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')]);
  },

  hasAllOptionalConfigTenancyAgreementEvidence() {
    return this._hasEvidenceConfig([configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')], { optional_only: true});
  },

  hasConfigMonetaryOrderWorksheetEvidence() {
    return this._hasEvidenceConfig([configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')]);
  },

  hasAllOptionalConfigMonetaryOrderWorksheetEvidence() {
    return this._hasEvidenceConfig([configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')], { optional_only: true});
  },

  getClaimTitle() {
    if (this.get('claim_title')) {
      return this.get('claim_title');
    }
    return this.claimConfig.issueTitle || null;
  },

  getConfigHelp() {
    return this.claimConfig.issueHelp || null;
  },

  getNoticeDeliveryDate() {
    const claimDetail = this.getApplicantsClaimDetail();
    return claimDetail ? claimDetail.get('notice_date') : null;
  },

  getNoticeDeliveryMethod() {
    const claimDetail = this.getApplicantsClaimDetail();
    return claimDetail ? claimDetail.get('notice_method') : null;
  },

  getDescription() {
    const claimDetail = this.getApplicantsClaimDetail();
    return claimDetail ? claimDetail.get('description') : null;
  },

  getAmount() {
    let totalAmount = 0;
    const remedies = this.getAllRemedies();
    remedies.forEach(remedy => {
      totalAmount += remedy.getAmount();
    });
    return totalAmount;
  },

  getAwardedAmount() {
    let totalAmount = 0;
    const remedies = this.getAllRemedies();
    remedies.forEach(remedy => {
      totalAmount += remedy.getAwardedAmount();
    });
    return totalAmount;
  },

  allOutcomesComplete() {
    return this.getAllRemedies().all(remedy => remedy.hasOutcome());
  },

  allOutcomesRemoved() {
    return this.getAllRemedies().all(remedy => remedy.isOutcomeRemoved());
  },
  
  hasOutcomeAmend() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeAmend());
  },

  hasOutcomeNotDecided() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeIncludedAndNotDecided());
  },
  
  hadStaffActivity() {
    const remedyModel = this.getApplicantsRemedy();
    return remedyModel && remedyModel.hadStaffActivity();
  },

  hasOutcomeSever() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeSever());
  },

  hasOutcomeDismissed() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeDismissed());
  },

  hasOutcomeDismissedWithLeave() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeDismissedWithLeave());
  },

  hasOutcomeDismissedWithoutLeave() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeDismissedWithoutLeave());
  },

  hasOutcomeNoJurisdiction() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeNoJurisdiction());
  },

  hasOutcomeAwarded() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeAwarded());
  },

  hasOutcomeSettled() {
    return this.getAllRemedies().any(remedy => remedy.isOutcomeSettled());
  },

  getFirstOutcomeDisplay(options={}) {
    const remedyModel = this.getApplicantsRemedy();
    return remedyModel && remedyModel.getOutcomeDisplay(this, options);
  },

  getFirstGrantedMoveOutOutcomeDateDisplay() {
    const remedyModel = this.getApplicantsRemedy();
    return remedyModel && remedyModel.getGrantedMoveOutOutcomeDateDisplay(this);
  },

  isMonetaryIssue() {
    return this.claimConfig.useAmount || null;
  },

  isMonetaryOutcomeIssue() {
    return this.isMonetaryIssue() || !!(this.claimConfig.useOutcomeAmount);
  },

  isLandlordMoveOutIssue() {
    return this.claimConfig.code && _.contains(this.HEARING_TOOLS_LANDLORD_MOVE_OUT_CLAIMS, this.claimConfig.code);
  },

  isExpenseIssue() {
    return this.claimConfig.isExpenseIssue;
  },

  // Returns the Remedy or RemedyDetail model that was most-recently changed
  getOutcomeLastModifiedModel() {
    const remedyModel = this.getApplicantsRemedy();
    const remedyDetailModel = this.getApplicantsRemedyDetail();
    let latestModel = null;
    if (remedyModel && remedyDetailModel) {
      latestModel = Moment(remedyModel.get('modified_date')).isAfter(Moment(remedyDetailModel.get('modified_date'))) ? remedyModel : remedyDetailModel;
    } else if (remedyModel) {
      latestModel = remedyModel;
    } else if (remedyDetailModel) {
      latestModel = remedyDetailModel;
    }
    return latestModel;
  },

  getAwardDetails() {
    const remedyModel = this.getApplicantsRemedy();
    if (!remedyModel) return;

    return remedyModel.get('award_details')
  },

  getUploadedFiles() {
    const disputeEvidences = this.get('dispute_evidences');
    return disputeEvidences ? _.flatten( disputeEvidences.map(function(disputeEvidence) { return disputeEvidence.getUploadedFiles(); }) ) : [];
  },

  getApplicantUploadedEvidence() {
    const disputeEvidences = this.get('dispute_evidences');
    return disputeEvidences ? disputeEvidences.filter(function(disputeEvidence) { return disputeEvidence.get('isApplicant') && disputeEvidence.hasUploadedFiles(); }) : [];
  },

  toEvidenceListData() {
    const isClaimRemoved = this.isAmendRemoved();
    return _.filter(this.get('dispute_evidences').map(function(disputeEvidence) {
      return {
        title: disputeEvidence.getTitle(),
        evidenceModel: disputeEvidence,
        files: disputeEvidence.get('files').filter(fileModel => fileModel.isUploaded()),
        isRemoved: isClaimRemoved || disputeEvidence.isParticipantRemoved()
      };
    }), data => data.files.length);
  },

  // Output a flat representation of the nested data
  getFlatData() {
    return {
      claim_title: this.getClaimTitle(),
      notice_method: this.getNoticeDeliveryMethod(),
      notice_date: this.getNoticeDeliveryDate(),
      claim_description: this.getDescription(),
      amount: this.getAmount()
    }
  },

  // Get a flat verison of the nested data, but only the values saved to the API
  getFlatApiSnapshotOfData() {
    const claim = this.claim,
      claimDetail = this.getApplicantsClaimDetail(),
      remedyDetail = this.getApplicantsRemedyDetail();

    return {
      claim_title: claim ? claim.getApiSnapshotOfData().claim_title : null,
      notice_method: claimDetail ? claimDetail.getApiSnapshotOfData().notice_method : null,
      notice_date: claimDetail ? claimDetail.getApiSnapshotOfData().notice_date : null,
      claim_description: claimDetail ? claimDetail.getApiSnapshotOfData().description : null,
      amount: remedyDetail ? remedyDetail.getApiSnapshotOfData().amount : 0
    };
  },


  getApplicantsRemedy() {
    // For RTB, only one Remedy per Claim, so just return the first
    if (!this.remedies || this.remedies.length === 0) {
      console.log(`[Warning] No remedy created in dispute claim model`, this);
    }
    return this.remedies.at(0);
  },

  getAllRemedies() {
    return this.remedies;
  },

  addApplicantsRemedyDetail(remedy_detail_data) {
    const primaryApplicantRemedy = this.getApplicantsRemedy(),
      primaryApplicant = this._getPrimaryApplicant();

    if (!primaryApplicantRemedy) {
      console.log(`[Warning] Can't find a primary remedy for the remedy detail`, remedy_detail_data);
      return;
    }
    return primaryApplicantRemedy.addDetail(_.extend(remedy_detail_data,
        { description_by: primaryApplicant.get('participant_id') }));
  },

  getApplicantsRemedyDetail() {
    const primaryApplicantRemedy = this.getApplicantsRemedy();
    if (primaryApplicantRemedy) {
      const remedyDetails = primaryApplicantRemedy.get('remedyDetails');
      if (!remedyDetails || remedyDetails.length === 0) {
        console.log(`[Warning] No remedy detail created in dispute claim model`, this);
      }
      return remedyDetails.at(0);
    }
  },


  updateApplicantClaimDetail(claim_detail_data) {
    let claimDetail = this.getApplicantsClaimDetail();
    if (!claimDetail) {
      claimDetail = this.addApplicantsClaimDetail(claim_detail_data);
    }
    claimDetail.set(claim_detail_data);
  },

  updateApplicantRemedy(remedy_data) {
    let remedy = this.getApplicantsRemedy();
    if (!remedy) {
      remedy = this.addApplicantsRemedy(remedy_data);
    }
    remedy.set(remedy_data);
  },

  updateApplicantRemedyDetail(remedy_detail_data) {
    let remedyDetail = this.getApplicantsRemedyDetail();
    if (!remedyDetail) {
      remedyDetail = this.addApplicantsRemedyDetail(remedy_detail_data);
    }
    if (remedy_detail_data.amount === null) {
      remedy_detail_data.amount = 0;
    }
    remedyDetail.set(remedy_detail_data);
  },

  addRemedy(remedy_data) {
    return this.remedies.push(_.extend(remedy_data, { claim_id: this.claim.get('claim_id') }));
  },

  // See if any of the sub-models need an API update
  needsApiUpdate(options) {
    return this.claim.needsApiUpdate() ||
      this.claim.get('claimDetails').any(function(claimDetail) {
        return claimDetail && claimDetail.needsApiUpdate(options);
      }) ||
      this.remedies.any(function(remedy) {
        return remedy && (remedy.needsApiUpdate(options) || 
          remedy.getRemedyDetails().any(function(remedyDetail) { return remedyDetail.needsApiUpdate(options); })
        );
      });
  },

  resetModel() {
    this.claim.resetModel();
    this.claim.get('claimDetails').each(function(claimDetail) {
      claimDetail.resetModel();
    });
    this.remedies.each(function(remedy) {
      remedy.getRemedyDetails().each(function(remedyDetail) { remedyDetail.resetModel(); });
      remedy.resetModel();
    });
  },


  _setClaimIdOnModels() {
    if (!this.claim || this.claim.isNew()) {
      console.log(`[Error] Can't set claim_id on claimDetails and remedies because claim has not been saved`);
      return;
    }
    const claim_id = this.claim.get('claim_id');
    if (!this.get('claim_id')) {
      this.set({ claim_id });
    }
    this.updateApplicantClaimDetail({ claim_id });
    this.updateApplicantRemedy({ claim_id });
    this.updateApplicantRemedyDetail({ claim_id });
  },

  _setRemedyIdOnModels() {
    const remedy = this.getApplicantsRemedy();
    if (!remedy || remedy.isNew()) {
      console.log(`[Error] Can't set remedy_id on remedyDetails because remedy has not been saved`);
      return;
    }
    const remedy_id = remedy.get('remedy_id');
    this.updateApplicantRemedyDetail({ remedy_id });
  },

  save() {
    const remedy = this.getApplicantsRemedy(),
      boundSaveClaim = _.bind(this._saveClaim, this),
      boundSaveRemedies = _.bind(this._saveRemedies, this),
      runPromiseList = function(promises) {
        const dfd = $.Deferred();
        Promise.all(_.map(_.filter(promises, function(_p) { return _p; }), function(p) { return p(); }))
          .then(dfd.resolve, dfd.reject);
        return dfd.promise();
      };

    // If claim is not saved to the API, we have to save it first to get the claim_id back
    // This claim_id will need to be used by ClaimDetails, Remedy and RemedyDetails saves
    if (this.claim.isNew()) {
      if (!remedy || remedy.isNew()) {
        const dfd = $.Deferred();
        boundSaveClaim()
          .done(_.bind(function() {
            boundSaveRemedies()
              .done(_.bind(function() {
                runPromiseList(_.flatten([this.getSaveRemedyDetailsXHRs(), this.getSaveClaimDetailXHRs()]))
                    .done(dfd.resolve).fail(dfd.reject);
              }, this))
              .fail(dfd.reject)
          }, this))
          .fail(dfd.reject)
        return dfd.promise();
      } else {
        return boundSaveClaim()
          .then(_.bind(function() {
            return runPromiseList(_.flatten([boundSaveRemedies, this.getSaveRemedyDetailsXHRs(), this.getSaveClaimDetailXHRs()]));
          },this));
      }
    } else {
      return runPromiseList(_.flatten([boundSaveClaim, boundSaveRemedies, this.getSaveRemedyDetailsXHRs(), this.getSaveClaimDetailXHRs()]));
    }
  },

  _saveClaim() {
    const claim_xhr = this.getSaveClaimXHR(),
      dfd = $.Deferred();
    if (claim_xhr) {
      claim_xhr()
        .done(_.bind(function() {
          this._setClaimIdOnModels();
          dfd.resolve();
        }, this))
        .fail(dfd.reject);
    } else {
      dfd.resolve();
    }
    return dfd.promise();
  },

  _saveRemedies() {
    const remedy_xhrs = _.filter(this.getSaveRemediesXHRs(), function(x) { return x; });
    const dfd = $.Deferred();
    if (remedy_xhrs && !_.isEmpty(remedy_xhrs)) {
      Promise.all(_.map(remedy_xhrs, function(x) { return x(); }))
        .then(() => {
          this._setRemedyIdOnModels();
          dfd.resolve();
        }, dfd.reject);
    } else {
      dfd.resolve();
    }
    return dfd.promise();
  },

  destroy() {
    // Note: Need to delete claimDetails and Remedies first, or this messsage:
    //  "Claim with claim_id = XYZ has child references. Remove them first"
    const dfd = $.Deferred();
    Promise.all(this.remedies.map(function(remedy) { return remedy.destroy(); }))
      .then(() => this.claim.destroy())
      .then(() => this.trigger('destroy', this))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  getSaveClaimXHR() {
    if (this.claim.needsApiUpdate()) {
      return _.bind(this.claim.save, this.claim, this.claim.getApiChangesOnly());
    }
  },

  getSaveClaimDetailXHRs() {
    const claimDetailsNeedingAPI = this.claim.get('claimDetails').filter(function(claimDetail) {
      return claimDetail && claimDetail.needsApiUpdate();
    });
    return _.map(claimDetailsNeedingAPI, function(claimDetail) { return _.bind(claimDetail.save, claimDetail, claimDetail.getApiChangesOnly()); });
  },

  getSaveRemediesXHRs() {
    const remediesNeedingAPI = this.remedies.filter(function(remedy) {
      return remedy && remedy.needsApiUpdate();
    });
    return _.map(remediesNeedingAPI, function(remedy) { return _.bind(remedy.save, remedy, remedy.getApiChangesOnly()); });
  },

  getSaveRemedyDetailsXHRs() {
    const remedyDetailsNeedingAPI = [];
    
    this.remedies.each(function(remedy) {
      remedy.getRemedyDetails().each(function(remedyDetail) {
        if (remedyDetail.needsApiUpdate()) {
          remedyDetailsNeedingAPI.push(remedyDetail);
        }
      });
    });

    return _.map(remedyDetailsNeedingAPI, function(remedyDetail) { return _.bind(remedyDetail.save, remedyDetail, remedyDetail.getApiChangesOnly()); });
  },

  getDestroyClaimXHR() {
    return _.bind(this.claim.destroy, this.claim);
  },

  validate() {
    const claimDetails = this.claim.get('claimDetails');
    let is_valid = true;

    if (this.claimConfig.useNoticeMethod) {
      is_valid = is_valid & claimDetails.any(function(claimDetail) {
        return claimDetail.get('notice_method');
      });
    }

    if (this.claimConfig.useNoticeDueDate) {
      is_valid = is_valid & claimDetails.any(function(claimDetail) {
        return claimDetail.get('notice_date');
      });
    }

    if (this.claimConfig.useTextDescription) {
      is_valid = is_valid & claimDetails.any(function(claimDetail) {
        return claimDetail.get('description');
      });
    }

    if (this.claimConfig.useAmount) {
      is_valid = is_valid & this.getAmount();
    }

    if (!is_valid) {
      return 'Please enter the missing information';
    }
  }

});
