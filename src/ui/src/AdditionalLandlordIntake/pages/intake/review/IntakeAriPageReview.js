import Radio from 'backbone.radio';
import DisputeEvidenceCollection from '../../../../core/components/claim/DisputeEvidence_collection';
import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import IntakeAriPageReviewBase from './IntakeAriPageReviewBase';
import template from './IntakeAriPageReview_template.tpl';

const configChannel = Radio.channel('config');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');

export default IntakeAriPageReviewBase.extend({
  template,
  
  getCurrentStep() {
    return 9;
  },

  getSubmitProcess() {
    return configChannel.request('get', 'PROCESS_RENT_INCREASE');
  },

  filterUnitsForApplication(units) {
    return units && units.filter(unit => unit.hasSavedRentIncreaseData());
  },

  initializeReviewData() {
    this.capitalCosts = IntakeAriDataParser.toCostCollection();
    this.disputeClaim = claimsChannel.request('get:by:code', configChannel.request('get', 'ARI_C_ISSUE_CODE'));
    this.disputeClaim.set('dispute_evidences', new DisputeEvidenceCollection(
      _.map(filesChannel.request('get:filedescriptions:claim', (this.disputeClaim.claim || {}).id), fileDescription => ({
        file_description: fileDescription,
        files: filesChannel.request('get:filedescription:files', fileDescription)        
      })
    )), { silent: true });
  },

  templateContext() {
    return _.extend(IntakeAriPageReviewBase.prototype.templateContext.call(this), {
      totalAmount: this.disputeClaim && this.disputeClaim.getAmount(),
      capitalCosts: this.capitalCosts,
      evidenceCollection: this.disputeClaim.get('dispute_evidences'),
    });
  }

});