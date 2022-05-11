import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './IssuesSection_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  claimsChannel = Radio.channel('claims'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-issues`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_ISSUES');
  },
  title: 'Section 5: Issues',
  hasRefresh: true,

  generateFn() {
    const dispute_claims = claimsChannel.request('get');

    // Top section has all issues, including removed ones
    // Middle section is just removals
    // Bottom section is remaining issues

    return template({
      Formatter,
      dispute_claims,
      removedDisputeClaims: dispute_claims.filter(function(dispute_claim) { return dispute_claim.isOutcomeRemoved(); }),
      remainingDisputeClaims: dispute_claims.filter(function(dispute_claim) { return !dispute_claim.isOutcomeRemoved(); }),
      getRemovalTextFn(dispute_claim_model) {
        let removalText;
        if (dispute_claim_model.isOutcomeSever()) {
          removalText = 'Severed';
        } else if (dispute_claim_model.isOutcomeAmend()) {
          removalText = 'Dismissed through amendment by arbitrator';
        } else if (dispute_claim_model.isOutcomeDismissed()) {
          const remedyModel = dispute_claim_model.getApplicantsRemedy(),
            remedy_sub_status = String(remedyModel.get('remedy_sub_status'));
          if (remedy_sub_status === String(configChannel.request('get', 'REMEDY_SUB_STATUS_REAPPLY'))) {
            removalText = 'Dismissed with leave to re-apply';
          } else if (remedy_sub_status === String(configChannel.request('get', 'REMEDY_SUB_STATUS_NO_REAPPLY'))) {
            removalText = 'Dismissed without leave to re-apply';
          } else {
            removalText = 'Dismissed';
          }
        }
        return removalText;
      }
    });
  },

  links: [{
    text: 'Edit Dispute',
    actionFn() {
      Backbone.history.navigate(routeParse('overview_item', disputeChannel.request('get:id')), { trigger:true });
    }
  }]
});