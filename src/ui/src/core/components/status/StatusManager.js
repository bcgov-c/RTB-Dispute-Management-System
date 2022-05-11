import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import StatusCollection from './Status_collection';
import DisputeModel from '../dispute/Dispute_model';
import ProcessDetailCollection from '../process-detail/ProcessDetail_collection';
import { generalErrorFactory } from '../api/ApiLayer';
import { routeParse } from '../../../admin/routers/mainview_router';

const api_status_load_name = 'dispute/disputestatuses';
const api_process_detail_load_name = 'dispute/disputeprocessdetails';
const api_post_status = 'dispute/status';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const hearingChannel = Radio.channel('hearings');
const flagsChannel = Radio.channel('flags');
const loaderChannel = Radio.channel('loader');

const StatusManager = Marionette.Object.extend({
  channelName: 'status',

  radioRequests: {
    'get:all': 'getAllStatuses',
    'get:stages': 'getAllStages',
    'get:stage': 'getStageConfig',
    'get:status': 'getStatusConfig',
    'get:processes': 'getAllProcesses',
    'get:stage:display': 'getStageDisplay',
    'get:status:display': 'getStatusDisplay',
    'get:rules:stagestatus': 'getStageStatusRulesFor',
    'get:rules:quickstatus': 'getQuickstatusRulesFor',
    'get:colourclass': 'getStageStatusColourClass',
    'get:role:type:status:config': 'getRoleTypeStatusConfig',
    'create:status': 'updateStatus',
    'update:dispute:status': 'updateDisputeStatus',
    'get:processDetail': 'getProcessDetail',
    'get:processDetails': 'getAllProcessDetails',

    'get:processOutcomes:config': 'getProcessOutcomesConfig',

    'check:sspo:changed': 'applyAdminStatusChangedCheck',
    'check:sspo:status': 'applyAdminStatusCheck',
    'apply:sspo:flags': 'applyFlagUpdatesForStatusChange',

    refresh: 'loadStatusData',
    load: 'loadStatusData',
    'load:status': 'loadStatusPromise',
    'load:processDetails': 'loadProcessDetails',
    
    clear: 'clearStatusData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  /**
   * Saves current status data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this StatusManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached status data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.statusList = cache_data.statusList;
    this.processDetails = cache_data.processDetails;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      statusList: this.statusList,
      processDetails: this.processDetails
    };
  },

  initialize() {
    this.cached_data = {};
    this.statusList = new StatusCollection();
    this.processDetails = new ProcessDetailCollection();
  },

  /**
   * Clears the current status list in memory.
   * Does not flush any cached data.
   */
  clearStatusData() {
    this.statusList = new StatusCollection();
    this.processDetails = new ProcessDetailCollection();
  },

  loadStatusData(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for status and process retrieval`);
      return;
    }

    const dfd = $.Deferred();
    $.whenAll( this.loadStatusPromise(dispute_guid), this.loadProcessDetails(dispute_guid) )
      .done( () => dfd.resolve({ statuses: self.statusList, processDetails: self.processDetails }) )
      .fail( dfd.reject );
    
    return dfd.promise();
  },

  loadStatusPromise(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:all statuses`);
      return;
    }

    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_status_load_name}/${dispute_guid}`
    }).done(response => {
      this.statusList.reset(response);
      dfd.resolve(this.statusList);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  getAllStatuses() {
    return this.statusList;
  },

  _getStageConfig() {
    return configChannel.request('get', 'stage_config');
  },

  getAllStages() {
    return _.keys(this._getStageConfig());
  },

  getStageConfig(stage) {
    const stageConfig = this._getStageConfig();
    return _.has(stageConfig, stage) ? stageConfig[stage] : null;
  },

  getStatusConfig(status) {
    const statusConfig = configChannel.request('get', 'status_config');
    return _.has(statusConfig, status) ? statusConfig[status] : null;
  },

  getProcessConfigData() {
    return configChannel.request('get', 'process_config');
  },

  getProcessOutcomesConfig() {
    return (this.getProcessConfigData() || {}).process_outcomes;
  },

  getStageDisplay(stage) {
    const config = this.getStageConfig(stage);
    return config && config.title ? config.title : null;
  },

  getStatusDisplay(status) {
    const config = this.getStatusConfig(status);
    return config && config.title ? config.title : null;
  },

  getAllProcesses() {
    return ['PROCESS_ORAL_HEARING',
      'PROCESS_WRITTEN_OR_DR',
      'PROCESS_REVIEW_REQUEST',
      'PROCESS_REVIEW_HEARING',
      'PROCESS_JOINER_REQUEST',
      'PROCESS_JOINER_HEARING',
      'PROCESS_RENT_INCREASE'
    ].map(configCode => configChannel.request('get', configCode));
  },

  _getAssignStageStatusRules() {
    const rules = configChannel.request('get', 'assignment_rules');
    return rules;
  },

  _getAllStageStatusRules() {
    const rules = configChannel.request('get', 'status_stage_rules');
    return rules;
  },

  _getUserTypeListFromTypeCode(user_type_code) {
    const type_groups = configChannel.request('get', 'user_type_groups');
    return _.has(type_groups, user_type_code) ? type_groups[user_type_code] : [];
  },

  _getUserSubTypeListFromSubTypeCode(user_sub_type_code) {
    const subtype_groups = configChannel.request('get', 'user_subtype_groups');
    return _.has(subtype_groups, user_sub_type_code) ? subtype_groups[user_sub_type_code] : [];
  },

  getStageStatusRulesFor(stage, status) {
    const all_rules = this._getAllStageStatusRules(),
      lookup_string = `${stage}:${status}`;
    if (!_.has(all_rules, lookup_string)) {
      console.log(`[Warning] Couldn't find a rule for "${lookup_string}" in `, all_rules);
      return {};
    }

    const rules = _.extend({}, all_rules[lookup_string]);
    if (rules.ownerTypes) {
      rules.ownerTypes = this._getUserTypeListFromTypeCode(rules.ownerTypes)
    }
    if (rules.ownerSubTypes) {
      rules.ownerSubTypes = this._getUserSubTypeListFromSubTypeCode(rules.ownerSubTypes)
    }
    return rules;
  },

  isOwnerOptional(stage, status) {
    return this.getStageStatusRulesFor(stage, status).ownerOptional;
  },

  getQuickstatusRulesFor(disputeModel) {
    const quickstatusConfigs = configChannel.request('get', 'quickstatus_config') || [];
    const validQuickStatuses = quickstatusConfigs.filter(statusConfig => {
      return statusConfig.stage === disputeModel.getStage()
        && statusConfig.status === disputeModel.getStatus()
        && (statusConfig.creation_methods || []).includes(disputeModel.get('creation_method'))
        && (statusConfig.processes || []).includes(disputeModel.getProcess());
    });

    const configsToReturn = []
    validQuickStatuses.forEach(validStatusConfig => {
      configsToReturn.push(Object.assign({}, validStatusConfig,
        validStatusConfig.ownerTypes ? { ownerTypes: this._getUserTypeListFromTypeCode(validStatusConfig.ownerTypes) } : {}
      ));
    });
    configsToReturn.sort((a, b) => {
      if (!a.order || !b.order) return;
      return a.order - b.order;
    });
    return configsToReturn;
  },

  getStageStatusColourClass(stage, status) {
    const colour_class_config = configChannel.request('get', 'colour_class_map');
    const lookup_string = `${stage}:${status}`;
    return _.has(colour_class_config, lookup_string) ? $.trim(colour_class_config[lookup_string]) : '';
  },

  updateDisputeStatus(dispute_guid, status_attrs) {
    return new DisputeModel({ dispute_guid }).saveStatus(status_attrs);
  },

  updateStatus(dispute_guid, options) {

    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid to post a dispute status.`);
      return;
    }

    const post_data = _.extend({}, options),
      dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_post_status}/${dispute_guid}`,
      data: JSON.stringify(post_data),
      headers: {
        'Content-Type': 'application/json'
      },
      contentType: "application/json",
      crossDomain: true,
      dataType: 'json'
    }).done(function(response) {
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  applyAdminStatusChangedCheck(disputeModel) {
    const hasSspoChangesFn = (disputeA, disputeB) => (
      ['getOwner', 'getStage', 'getStatus', 'getProcess'].reduce((memo, fn) => memo || disputeA[fn]() !== disputeB[fn](), false));
    
    return new Promise((resolve, reject) => {
      const disputeForCheck = new DisputeModel({ dispute_guid: disputeModel.get('dispute_guid') });
      disputeForCheck.fetch()
        .done(() => {
          if (disputeForCheck && hasSspoChangesFn(disputeModel, disputeForCheck)) {
            loaderChannel.trigger('page:load:complete');
            const modalView = modalChannel.request('show:standard', {
              title: 'Status Updated',
              bodyHtml: `<p>The status of this dispute has been changed from the values you are viewing. Press Continue to be returned to the dispute file.  The dispute file will be refreshed to display the updated values.</p>`,
              primaryButtonText: 'Continue',
              hideCancelButton: true,
              onContinueFn: _modalView => _modalView.close()
            });
            this.listenTo(modalView, 'removed:modal', () => reject());
          } else {
            resolve();
          }
        }).fail(reject);
    });
  },

  applyAdminStatusCheck(disputeModel, newStatus, newEvidenceOverride=false) {
    return new Promise((resolve, reject) => {
      // Only warn users if the status is one of the defined warning statuses
      const STATUS_WARN_INCOMPLETE = configChannel.request('get', 'STATUS_WARN_INCOMPLETE') || [];
      if (!(_.isArray(STATUS_WARN_INCOMPLETE) && STATUS_WARN_INCOMPLETE.length)) {
        console.log("[Warning] Status warnings are not configured properly.");
        resolve();
        return;
      }

      const statusHasNotChanged = disputeModel.getStatus() === newStatus;
      
      // Only run the check when the status has been changed to one of the incomplete changes
      if (statusHasNotChanged || (!_.contains(STATUS_WARN_INCOMPLETE, newStatus))) {
        resolve();
        return;
      }

      disputeChannel.request('incomplete:dispute:check', disputeModel)
        .done(response => {
          response = response || {};

         // missingProcessOutcomes and undeliveredDocs counts are not displayed, don't include in total
          const totalIncompleteItemsCount = response.totalIncompleteItems - response.missingProcessOutcomes - response.undeliveredDocuments;
          // Don't show a warning when no incomplete pending items
          if (!totalIncompleteItemsCount || totalIncompleteItemsCount<0) return resolve();
          loaderChannel.trigger('page:load:complete');

          const newArbItemsCount = response.missingDocumentWritingTime + response.missingHearingDetails + response.incompleteDocumentRequests;
          const lineFormatter = (linkText, routeName, value) => {
            // Don't show completed areas line(i.e. 0 incomplete items)
            if (!value) return '';
            const text = value ? `<a href="#${routeParse(routeName, disputeModel.id)}">${linkText}</a>` : linkText;
            return `<li>${text}: <b>${value}</b></li>`;
          };
          const modalView = modalChannel.request('show:standard', {
            title: 'Incomplete Items Warning',
            bodyHtml: `<p>This file contains items that are not complete that should be completed before this file is closed:</p>
            <p>
              <b>Total incomplete items: ${(totalIncompleteItemsCount - newArbItemsCount) || '-'}</b>
              <ul>
                ${lineFormatter('Future hearings still assigned', 'hearing_item', response.futureHearings)}
                ${lineFormatter('Incomplete tasks', 'task_item', response.incompleteTasks)}
                ${lineFormatter('Incomplete outcome documents', 'document_item', response.incompleteOutcomeDocuments)}
                ${lineFormatter('Missing issue outcomes', 'overview_item', response.missingIssueOutcomes)}
                ${disputeModel.isNonParticipatory() ? '' : lineFormatter('Missing hearing participation', 'hearing_item', response.missingHearingParticipations)}
                ${lineFormatter('Missing notice service', 'notice_item', response.missingNoticeService)}
              </ul>
              ${newArbItemsCount ? `
                <b>New Arb Outcomes (July 1, 2021): ${newArbItemsCount || '-'}</b>
                <ul>
                  ${lineFormatter('Missing outcome document writing times', 'document_item', response.missingDocumentWritingTime)}
                  ${lineFormatter('Missing hearing durations and info', 'hearing_item', response.missingHearingDetails)}
                  ${lineFormatter('Missing outcome document request statuses', 'document_item', response.incompleteDocumentRequests)}
                </ul>
              ` : ''}
            </p>
            ${newEvidenceOverride ? `<p style="margin: 20px 0;" class="error-block warning">WARNING: "Enable All Uploads" is on.  This means that evidence can be submitted through the Dispute Access site on a closed file.</p>` : '' }
            <p>Are you sure you want to close this file without completing these items?  This action will be recorded as a status set by your user account.</p>
            <p>To continue without completing these items, press "Close Anyway", to leave the file open press "Cancel"</p>
            `,
            modalCssClasses: 'modal-status-change-warning',
            cancelButtonText: 'Cancel',
            primaryButtonText: 'Close Anyway',
            onContinueFn: ((_modalView) => {
              _modalView.close();
              resolve();
            }).bind(this)
          });
          
          modalView.$('a').off('click.rtb');
          modalView.$('a').on('click.rtb', () => {
            disputeModel.trigger('incomplete:items:nav');
            modalView.close();
          });
          this.listenTo(modalView, 'removed:modal', reject);
        }).fail(err => {
          const handler = generalErrorFactory.createHandler('ADMIN.DIPSUTE.INCOMPLETE.CHECK', () => reject());
          handler(err);
        });
    });
  },

  applyFlagUpdatesForStatusChange(disputeStatusChanges={}, disputeModel) {
    const STATUS_ADJOURNED = configChannel.request('get', 'STATUS_ADJOURNED');
    const STATUS_CLOSED = configChannel.request('get', 'STATUS_CLOSED');
    const PROCESS_REVIEW_HEARING = configChannel.request('get', 'PROCESS_REVIEW_HEARING');
    let primaryHearingDisputeGuid;
    const latestHearing = hearingChannel.request('get:latest');
    const primaryDisputeHearing = latestHearing && latestHearing.getPrimaryDisputeHearing();
    const flagList = flagsChannel.request('get');
    const hasReviewHearingFlag = flagList.some(flag => flag.isReviewHearing() && flag.isActive() && !flag.isLinked());
    if (primaryDisputeHearing) primaryHearingDisputeGuid = primaryDisputeHearing.get('dispute_guid');
    
    const shouldCreateAdjourmentFlag = disputeStatusChanges.dispute_status === STATUS_ADJOURNED && (primaryHearingDisputeGuid && disputeModel ? disputeModel.id === primaryHearingDisputeGuid : true);
    const shouldCloseAssociatedFlags = disputeStatusChanges.dispute_status === STATUS_CLOSED;
    const shouldClosePrelimFlags = disputeStatusChanges.dispute_status === STATUS_ADJOURNED;
    const shouldCreateReviewHearingFlag = disputeStatusChanges.process === PROCESS_REVIEW_HEARING && !hasReviewHearingFlag;

    return new Promise((res, rej) => {
      const flagSavePromises = [];
      if (shouldCreateAdjourmentFlag) {
        flagSavePromises.push(() => flagsChannel.request('create:adjournment').save());
      }
      if (shouldCloseAssociatedFlags) {
        flagSavePromises.push(() => flagsChannel.request('close:adjournments'), () => flagsChannel.request('close:subservice:approved'));
      }
      if (shouldClosePrelimFlags) {
        flagSavePromises.push(() => flagsChannel.request('close:prelim'));
      }

      if (shouldCreateReviewHearingFlag) {
        flagSavePromises.push(() => flagsChannel.request('create:review:hearing').save());
      }

      if (!flagSavePromises) return res();

      Promise.all(flagSavePromises.map(p=>p())).then(res, generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE', rej));
    });
  },


  getProcessDetail(process) {
    return this.processDetails.findWhere({ associated_process: Number(process) });
  },

  getAllProcessDetails() {
    return this.processDetails;
  },

  loadProcessDetails(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid to load process details`);
      return;
    }
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_process_detail_load_name}/${dispute_guid}`
    }).done(response => {
      this.processDetails.reset(response);
      dfd.resolve(this.processDetails);
    }).fail(dfd.reject);
    return dfd.promise();
  },


  getRoleTypeStatusConfig(role_type, check_owner_blank = false, initialStagesData = null) {
    initialStagesData = initialStagesData || [];
    
    const status_rules = this._getAllStageStatusRules();
    let stage_status_list = initialStagesData;
    let role_type_regex;

    if (role_type === configChannel.request('get', 'USER_ROLE_GROUP_IO')) {
      role_type_regex = /\b(io|io_admin|admin)\b/;
    } else if (role_type === configChannel.request('get', 'USER_ROLE_GROUP_ARB')) {
      role_type_regex = /\b(arb)\b/;
    }

    Object.keys(status_rules).forEach(function(key) {
      if (role_type_regex.test(status_rules[key]['ownerSubTypes'])) {
        if (check_owner_blank && !status_rules[key]['ownerOptional']) {
          return;
        }

        const stage = Number(key.substring(0, key.indexOf(":")));
        const status = Number(key.substring(key.indexOf(":") +1, key.length));
        let status_list = stage_status_list.find(function(stage_status) {
          if (Number(stage_status.stage) === stage) {
            return true;
          }
        });

        if (!status_list) {
          status_list = [];
        } else {
          status_list = status_list.status_process;
        }
        stage_status_list = stage_status_list.filter(function(stage_status) {
          return Number(stage_status.stage) !== stage
        });

        status_list.push({ status: status, process: null } );
        stage_status_list.push({
          stage : stage,
          status_process: status_list
        });
      }
    });

    return _.sortBy(stage_status_list, stageObj => stageObj.stage);
  }

});

_.extend(StatusManager.prototype, UtilityMixin);

const statusManagerInstance = new StatusManager();

export default statusManagerInstance;
