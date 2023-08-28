/**
 * @fileoverview - Manager that contains functionality for loading and displaying audit logs
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import AuditCollection from './Audit_collection';
import HearingAuditCollection from './HearingAudit_collection';

const api_load_name = 'audit/logitems';
const api_audit_item_load_name = 'audit/itemdata';
const api_schedulinghistory_load_name = 'audit/hearing';
const api_audit_service = 'audit/service';

const REQUEST_TO_READABLE_FORM = {
  "post": "Addition",
  "patch": "Modification",
  "delete": "Delete"
};
const ENDPOINT_NAME_REGEX_TO_CATEGORY_DISPLAY = {
  '/dispute/' : 'Dispute',
  '/externalupdate/newdispute.*' : 'Dispute',
  '/disputestatus​/.*' : 'Dispute',
  '/externalupdate/disputeinfo.*' : 'Dispute',
  '/issues/claim.*' : 'Issue',
  '/issues/remedy.*/' : 'Issue',
  '/parties/claimgroup.*' : 'Participant',
  '/parties/participant.*' : 'Participant',
  '/externalupdate/participant.*': 'Participant',
  '/substitutedservice.*': 'Participant Service',
  '/disputefee.*' : 'Payment',
  '/paytransaction.*' : 'Payment',
  '/externalupdate​/paymenttransaction​.*' : 'Payment',
  '/emailmessage.*' : 'Email',
  '/emailattachment.*' : 'Email',
  '/emailtemplates': 'Email Template',
  '/file/PDFfromhtml.*' : 'Generate PDF',
  '/file(-upload)?/.*' : 'File',
  '/fileinfo.*' : 'File',
  '/linkfile.*' : 'File',
  '/filedescription.*' : 'File Description',
  '/filepackage.*': 'Evidence Package',
  '/filepackageservice.*': 'Evidence Service',
  '/hearing/.*' : 'Hearing',
  '/disputehearing.*' : 'Hearing',
  '/hearingparticipation.*' : 'Hearing',
  '/dispute/intakequestions.*' : 'Intake Wizard',
  '/note/.*' : 'Note',
  '/notice/.*' : 'Notice',
  '/noticeservice.*' : 'Notice',
  '/task/.*' : 'Task',
  '/outcomedoc.*': 'Outcome Document',
  '/accesscoderecovery': 'AC Recovery',
  '/amendment': 'Amendment',
  '/disputeflag/': 'Dispute Flag',
  '/commonfiles': 'Common File'
};

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');

const AuditManager = Marionette.Object.extend({
  channelName: 'audits',

  radioRequests: {
    load: 'loadAuditsPromise',
    'load:schedulinghistory': 'loadSchedulingHistory',
    'load:audit:service': 'loadAuditService',

    'get:audit': 'loadAuditPromise',
    'get:api:display': 'getApiTypeDisplay',
    'get:http:display': 'getHTTPRequestTypeDisplay',
    'get:displayable:audits': 'getDisplayableAudits',
    'get:user:role:display': 'getUserRoleDisplay',
  },

  getApiTypeDisplay(endpointUrl) {
    const lowerCaseEndpointUrl = $.trim(endpointUrl).toLowerCase();
    let apiTypeDisplay = null;

    _.each(Object.keys(ENDPOINT_NAME_REGEX_TO_CATEGORY_DISPLAY), function(key) {
      if (apiTypeDisplay) {
        return;
      }
      const keyAsRegex = new RegExp(key, 'i');
      if (keyAsRegex.test(lowerCaseEndpointUrl)) {
        apiTypeDisplay = ENDPOINT_NAME_REGEX_TO_CATEGORY_DISPLAY[key];
        return;
      }
    });

    return apiTypeDisplay;
  },

  getHTTPRequestTypeDisplay(http_request) {
    const lower_case = $.trim(http_request).toLowerCase();
    return lower_case && _.has(REQUEST_TO_READABLE_FORM, lower_case) ? REQUEST_TO_READABLE_FORM[lower_case] : http_request;
  },

  loadAuditsPromise(dispute_guid, options={}) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for load audits`);
      return;
    }
    const default_index = 0;
    const default_count = 999990;
    const params = $.param(_.extend({
      index: default_index,
      count: default_count
    }, options));

    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_name}/${dispute_guid}?${params}`
    });
  },

  loadAuditPromise(audit_id) {
    if (!audit_id) {
      console.log(`[Error] Need an audit_id for load:audit audits`);
      return;
    }

    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_audit_item_load_name}/${audit_id}`
    }).done(function(response) {
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },



loadSchedulingHistory(searchParams) {
  const dfd = $.Deferred();
  const default_index = 0;
  const default_count = 999990;

  searchParams = $.param(_.extend({
    index: default_index,
    count: default_count
  }, searchParams));

  apiChannel.request('call', {
    type: 'GET',
    url: `${configChannel.request('get', 'API_ROOT_URL')}${api_schedulinghistory_load_name}?${searchParams}`
  }).done(response => {
    response = response || {};
    response.hearing_audit_logs = response.hearing_audit_logs || [];
    dfd.resolve(new HearingAuditCollection(response.hearing_audit_logs));
  }).fail(dfd.reject);
  return dfd.promise();
},

  getDisplayableAudits(audits_per_load, index) {
    return this.audit_collection ? new AuditCollection(this.audit_collection.first(audits_per_load * index)) : new AuditCollection();
  },

  getUserRoleDisplay(role) {
    if (!role) {
      console.log('[Error] - Invalid role supplied');
      return '-';
    }

     if (role === 1) {
      return 'Internal User';
    } else if (role === 2) {
      return 'External User';
    } else if (role === 4) {
      return 'Access Code User';
    } else if (role === 99) {
      return 'System';
    }
  },

  loadAuditService(searchParams) {
    if (!searchParams.disputeGuid) {
      console.log(`[Error] Need a dispute_guid for audit service load`);
      return $.Deferred().reject().promise();
    }

    const default_index = 0;
    const default_count = 999990;
  
    searchParams = $.param(_.extend({
      index: default_index,
      count: default_count
    }, searchParams));

    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_audit_service}?${searchParams}`
    });
  },

});

_.extend(AuditManager.prototype, UtilityMixin);

const auditManagerInstance = new AuditManager();

export default auditManagerInstance;
