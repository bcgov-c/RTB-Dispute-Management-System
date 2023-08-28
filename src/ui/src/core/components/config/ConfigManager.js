/**
 * @fileoverview - This Manager loads external and internal config files into its memory, and then it is responsible for performing the config file lookups for the application.
 *  It is likely the most-used manager in the system, as almost all modules will need to look up system values.
 * @namespace core.components.config.ConfigManager
 * @memberof core.components.config
 */
import Marionette from 'backbone.marionette';
import INTERNAL_CONFIG from './internal_config';

const ISSUES_CONFIG_NAME = 'issues_config';
const EVIDENCE_CONFIG_NAME = 'evidence_config';

const ConfigManager = Marionette.Object.extend({
  /**
   * @class core.components.config.ConfigManagerClass
   * @augments Marionette.Object
   */

  initialize() {
    this.config_values = {};
  },

  channelName: 'config',

  radioRequests: {
    get: 'getConfigValue',
    'get:issues': 'getConfigIssues',
    'get:issue': 'getConfigIssueValue',
    'get:evidence': 'getConfigEvidenceValue',
    'get:evidence:category': 'getConfigEvidenceByCategory',
  },

  getConfigValue(key) {
    const config = this.config_values;
    return _.has(config, key) ? config[key] : null;
  },

  getConfigIssues() {
    return this.config_values[ISSUES_CONFIG_NAME];
  },

  getConfigEvidence() {
    return this.config_values[EVIDENCE_CONFIG_NAME];
  },

  getConfigIssueValue(claimCode) {
    const issues_config = this.config_values[ISSUES_CONFIG_NAME];

    if (!_.has(issues_config, claimCode)) {
      console.log(`[Error] No config item found for claim code ${claimCode}`);
    }
    return issues_config[claimCode];
  },

  getConfigEvidenceValue(evidenceId) {
    const evidence_config = this.getConfigEvidence();

    if (!_.has(evidence_config, evidenceId)) {
      console.log(`[Error] No config item found for evidence id ${evidenceId}`);
    }
    return evidence_config[evidenceId];
  },

  getConfigEvidenceByCategory(category) {
    const toReturn = {};
    if (!category) {
      console.log(`[Error] No category passed for get config evidence by category`, category);
      return toReturn;
    }
    const evidence_config = this.getConfigEvidence();
    Object.keys(evidence_config || {}).filter(key => evidence_config[key].category && String(evidence_config[key].category) === String(category) )
      .forEach(matchingKey => {
        toReturn[matchingKey] = evidence_config[matchingKey];
      });
    return toReturn;
  },

  loadInternalConfig() {
    // Hardcode some config values here that we don't want to get from external files
    _.extend(this.config_values, INTERNAL_CONFIG);
  },

  // NOTE: Add other file type conversions here when needed (.txt, etc)
  loadConfig(filePath) {
    filePath = filePath || '';
    
    let loadFn;
    let errorMsg;

    if (filePath.indexOf('.json') === -1) {
      errorMsg = '[Error] Only JSON config files are supported at this time.';
    } else {
      loadFn = _.bind(this.loadJSON, this);
    }

    return !loadFn ? $.Deferred().reject(errorMsg).promise() : loadFn(filePath);
  },

  loadJSON(filePath) {
    const dfd = $.Deferred();

    // Append a timestamp query param to json files so they are not cached, by default
    filePath += `${filePath.indexOf('?') === -1 ? '?' : '&'}t=${(new Date()).getTime()}`;
    $.getJSON(filePath).done(data => {
      _.extend(this.config_values, data);
      dfd.resolve();
    }).fail((xhr, errorMsg) => dfd.reject("Failed to load JSON file: " + filePath + '. '+ errorMsg));
    return dfd.promise();
  }

});

export default new ConfigManager();
