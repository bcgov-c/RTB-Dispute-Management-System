/**
 * Used to provide extra lookup functionality to the configChannel during CEU operation
 */
import Marionette from 'backbone.marionette';

const ISSUES_CONFIG_NAME = 'ceu_issues_config';
const EVIDENCE_CONFIG_NAME = 'ceu_evidence_config';
 
 const CeuConfigHelper = Marionette.Object.extend({ 
  channelName: 'config',

  radioRequests: {
    'get:issue:ceu': 'getConfigIssueValue',
    'get:evidence:ceu': 'getConfigEvidenceValue',
  },

  getConfigIssueValue(claimCode) {
    const issues_config = this.getChannel().request('get', ISSUES_CONFIG_NAME);
    if (!_.has(issues_config, claimCode)) {
      console.log(`[Error] No config item found for claim code ${claimCode}`);
    }
    return issues_config[claimCode];
  },

  getConfigEvidenceValue(evidenceId) {
    const evidence_config = this.getChannel().request('get', EVIDENCE_CONFIG_NAME);
    if (!_.has(evidence_config, evidenceId)) {
      console.log(`[Error] No config item found for evidence id ${evidenceId}`);
    }
    return evidence_config[evidenceId];
  }
});

export default new CeuConfigHelper();
