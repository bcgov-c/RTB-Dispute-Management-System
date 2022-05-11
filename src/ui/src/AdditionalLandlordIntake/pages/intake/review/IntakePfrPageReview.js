import Radio from 'backbone.radio';
import IntakeAriPageReviewBase from './IntakeAriPageReviewBase';
import template from './IntakePfrPageReview_template.tpl';

const configChannel = Radio.channel('config');
const claimsChannel = Radio.channel('claims');

export default IntakeAriPageReviewBase.extend({
  template,

  getCurrentStep() {
    return 6;
  },

  getSubmitProcess() {
    return configChannel.request('get', 'PROCESS_ORAL_HEARING');
  },

  getCustomObjectType() {
    return configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR');
  },

  getClaimCode() {
    return configChannel.request('get', 'PFR_ISSUE_CODE');
  },

  initializeReviewData() {
    this.units.forEach(unit => {
      const claim = this.getClaimForUnitFn(unit);
      if (!claim) return;
      const evidenceIdToHide = configChannel.request('get', unit.getPermits().length ?
        'NO_PERMITS_REQUIRED_EVIDENCE_CODE' : 'PERMITS_REQUIRED_EVIDENCE_CODE');
      const matchingEvidence = claim.get('dispute_evidences').find(ev => ev.get('evidence_id') === evidenceIdToHide);
      if (matchingEvidence) matchingEvidence.set('isHidden', true);
    });

    // PFR uses the intake fee amount - no unit calculation
    this.calculatedFeeAmount = configChannel.request('get', 'PAYMENT_FEE_AMOUNT_INTAKE');
  },

  filterUnitsForApplication(units) {
    return units;
  },

  getClaimForUnitFn(unitModel) {
    return claimsChannel.request('get:claim', unitModel.get('issue_id'));
  },

  templateContext() {
    return _.extend(IntakeAriPageReviewBase.prototype.templateContext.call(this), {
      getClaimForUnitFn: unitModel => this.getClaimForUnitFn(unitModel)
    });
  },
  
});