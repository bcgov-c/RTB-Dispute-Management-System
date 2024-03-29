/**
 * @fileoverview - Manager that handles email related functionality. This includes Receipts, Pickups, Emails, EmailTemplates
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import EmailCollection from './Email_collection';
import EmailTemplateCollection from './EmailTemplate_collection';
import ReceiptModel from './Receipt_model';
import ReceiptCollection from './Receipt_collection';
import EmailTemplateFormatter from './EmailTemplateFormatter'
import Editor_model from '../editor/Editor_model';
import EditorView from '../editor/Editor';
import Email_model from './Email_model';

const STANDARD_RECEIPT_TITLE_PREFIX = 'Receipt: ';

const api_message_load_name = 'disputeemailmessages';
const api_external_message_load_name = 'externaldisputeemailmessages';
const api_template_load_name = 'emailtemplates';
const api_receipts_load_name = 'submissionreceipts';
const api_external_receipts_load_name = 'externalsubmissionreceipts';
const api_pickup_load_name = 'externalupdate/pickupmessage';
const api_pickup_set_status_name = 'externalupdate/setpickupmessagestatus';
const api_verify_contact = 'contactverification';
const api_send_email_verification_message = 'emailverificationmessage';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const noticeChannel = Radio.channel('notice');
const statusChannel = Radio.channel('status');
const emailsChannel = Radio.channel('emails');
const claimsChannel = Radio.channel('claims');


const EmailsManager = Marionette.Object.extend({
  channelName: 'emails',

  radioRequests: {
    load: 'loadEmailsPromise',
    'load:external': 'loadExternalEmails',
    'load:receipts': 'loadReceipts',
    'load:receipts:external': 'loadExternalReceipts',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',
    'load:pickups': 'loadPickups',
    'get:all': 'getAllEmails',
    'get:email:by:id': 'getEmailById',
    'load:templates': 'loadEmailTemplatesPromise',
    'get:templates': 'getEmailTemplates',
    'get:template:attachments': 'getEmailTemplateAttachments',
    'get:receipts': 'getReceipts',
    'save:receipt': 'createAndSaveReceipt',
    'get:pickup:by:id': 'getPickupById',
    'set:pickup:messageStatus': 'setPickupMessageStatus',
    'send:email:verification': 'sendEmailVerificationMessage',
    'verify:contact:email': 'verifyContactEmail',
    'get:email:templates:for:group': 'getActiveTemplatesForTemplateGroup',
    'create:custom': 'createAndPrepareEmailFromTemplate',

    refresh: 'loadEmailsPromise',
    clear: 'clearCacheData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  /**
   * Saves current emails data into internal memory.  Can be retreived with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this EmailsManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.emails = cache_data.emails;
    this.receipts = cache_data.receipts;

    // Note: Don't cache EmailTemplates, as they are not linked to disputes
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    // Note: Don't cache EmailTemplates, as they are not linked to disputes
    return {
      emails: this.emails,
      receipts: this.receipts,
    };
  },

  initialize() {
    this.cached_data = {};
    this.emails = new EmailCollection();
    this.emailTemplates = new EmailTemplateCollection();
    this.receipts = new ReceiptCollection();
  },

  /**
   * Clears the current data in memory.
   * Does not flush any cached data.
   */
  clearEmailData() {
    this.emails = new EmailCollection();
    this.receipts = new ReceiptCollection();
  },

  loadEmailsPromise(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:all emails`);
      return;
    }
    const dfd = $.Deferred();
    const defaultIndex = 0;
    const defaultCount = 999990;
    const params = $.param(_.extend({
      index: defaultIndex,
      count: defaultCount
    }));

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_message_load_name}/${dispute_guid}?${params}`
    }).done(response => {
      this.emails.reset(response.email_messages);
      dfd.resolve(this.emails);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadExternalEmails(disputeGuid, participantIds=[]) {
    const params = $.param({ 
      Participants: participantIds,
      index: 0,
      count: 999990
    }, true);
    
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_external_message_load_name}/${disputeGuid}?${params}`
      }).done((response={}) => {
        this.emails.reset(response?.email_messages);
        res(this.emails);
      }).fail(rej);
    });
  },

  loadFromDisputeAccessResponse(response_data_pickups) {
    const dispute = disputeChannel.request('get');
    const participantId = dispute && dispute.get('tokenParticipantId');
    // Only load pickups for the logged-in participant
    this.emails.reset((response_data_pickups || []).filter(emailData => emailData.participant_id === participantId));
  },

  loadPickups() {
    const promises = [];
    this.emails.models.forEach((pickup) => {
      if (pickup.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_READY_FOR_PICKUP')) {
        promises.push(emailsChannel.request('get:pickup:by:id', pickup.get('email_message_id')))
      }
    })

    return Promise.all(promises).then((pickupEmails) => {
      this.emails.reset(pickupEmails);
    });
  },

  loadReceipts(disputeGuid) {
    if (!disputeGuid) {
      console.log(`[Error] Need a dispute_guid for get:all emails`);
      return;
    }

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_receipts_load_name}/${disputeGuid}`
      }).done(response => {
        this.receipts.reset(response);
        res(response);
      }).fail(rej);
    });
  },

  loadExternalReceipts(disputeGuid, participantIds=[]) {
    const params = $.param({ Participants: participantIds, }, true);
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_external_receipts_load_name}/${disputeGuid}?${params}`
      }).done(response => {
        this.receipts.reset(response?.external_submission_receipts);
        res(this.receipts);
      }).fail(rej);
    });
  },

  getAllEmails() {
    return this.emails;
  },

  getEmailById(id) {
    return this.emails.findWhere({ email_id: id });
  },

  getReceipts() {
    return this.receipts;
  },

  getPickupById(messageId) {
    if (!messageId) {
      console.log(`[Error] Need a dispute_guid for get:all emails`);
      return;
    }

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_pickup_load_name}/${messageId}`
      }).done(response => {
        const pickupEmail = response;
        pickupEmail.email_id = messageId;
        res(pickupEmail);
      }).fail(rej);
    });
  },

  setPickupMessageStatus(emailMessageId) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'PATCH',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_pickup_set_status_name}/${emailMessageId}`
      }).done(response => {
        res(response);
      }).fail(rej);
    });
  },

  sendEmailVerificationMessage(participantId) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'POST',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_send_email_verification_message}/${participantId}`
      }).done(response => {
        res(response);
      }).fail(rej);
    });
  },
  
  verifyContactEmail(participantId, verificationCode) {
    const verificationType = configChannel.request('get', 'CONTACT_VERIFICATION_TYPE_EMAIL');
    const params = $.param(_.extend({
      verificationType,
      verificationCode
    }));
    
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'POST',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_verify_contact}/${participantId}?${params}`
      }).done(response => {
        res(response);
      }).fail(rej);
    });
  },

  loadEmailTemplatesPromise() {
    const dfd = $.Deferred();
    const EMAIL_TEMPLATE_STATUS_ACTIVE = configChannel.request('get', 'EMAIL_TEMPLATE_STATUS_ACTIVE');
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_template_load_name}`
    }).done(response => {
      this.emailTemplates.reset( (response.email_templates || []).filter(templateData => (
        templateData.template_status === EMAIL_TEMPLATE_STATUS_ACTIVE)) );
      dfd.resolve(this.emailTemplates);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  getEmailTemplates() {
    return this.emailTemplates;
  },

  getEmailTemplateAttachments(templateId) {
    const templateModel = this.getEmailTemplates().filter(t => t.get('assigned_template_id') === templateId)?.[0];
    return templateModel.getAttachmentCommonFileIds()?.map(commonFileId => ({
      attachment_type: configChannel.request('get', 'EMAIL_ATTACHMENT_TYPE_COMMONFILE'),
      common_file_id: commonFileId,
    }));
  },

  createAndSaveReceipt(receiptData={}, options={ standardize_title: true }) {
    if (receiptData.receipt_title && options.standardize_title &&
          receiptData.receipt_title.indexOf(STANDARD_RECEIPT_TITLE_PREFIX) !== 0) {
      receiptData.receipt_title = receiptData.receipt_title;
    }
    // In release 1.02.01, always fail silently. Receipts are not a surfaced feature
    return new Promise(res => {
      try {
        const defaultReceiptData = { receipt_date: Moment().toISOString() };
        const receiptModel = new ReceiptModel(Object.assign(defaultReceiptData, receiptData));
        return receiptModel.save().always(res);
      } catch (err) {
        res();
      }
    });
  },

  /**
   * Validate a single email template against current dispute state
   * Template is validated against local config, and the associated API template is also validated
   * Can pass options to ignore certain validation criteria in "ignoreCriteria"
   */
   validateTemplateSelection(templateId, options={}) {
    const EMAIL_TEMPLATES_CONFIG = configChannel.request('get', 'EMAIL_TEMPLATES_CONFIG');
    const validateLocalTemplateConfig = () => {
      const templateConfig = EMAIL_TEMPLATES_CONFIG[templateId];
      const dispute = disputeChannel.request('get');
      const claims = claimsChannel.request('get');
      const statusHistory = statusChannel.request('get:all');
      const latestHearing = hearingChannel.request('get:latest');
      if (!dispute || !templateConfig) return false;

      // "staffSelectable" is the highest priority rule.  If a doc is not staff selectable, it should never be returned in this list unless we are explicitly ignoring it
      if (!options?.ignoreCriteria?.staffSelectable && !templateConfig.staffSelectable) return false;

      if (options?.all) return true;

      if (!options?.ignoreCriteria?.creationMethods && templateConfig.creationMethods && !templateConfig.creationMethods.includes(dispute.get('creation_method'))) return false;
      if (!options?.ignoreCriteria?.stages && templateConfig.stages && !templateConfig.stages.includes(dispute.getStage())) return false;
      if (!options?.ignoreCriteria?.disputeUrgencies && templateConfig.disputeUrgencies && !templateConfig.disputeUrgencies.includes(dispute.get('dispute_urgency'))) return false;
      if (!options?.ignoreCriteria?.disputeTypes && templateConfig.disputeTypes && !templateConfig.disputeTypes.includes(dispute.get('dispute_type'))) return false;
      if (!options?.ignoreCriteria?.disputeSubTypes && templateConfig.disputeSubTypes && !templateConfig.disputeSubTypes.includes(dispute.get('dispute_sub_type'))) return false;    
      if (!options?.ignoreCriteria?.processes && templateConfig.processes && !templateConfig.processes.includes(dispute.getProcess())) return false;
      if (!options?.ignoreCriteria?.hasGeneratedNotice && templateConfig.hasGeneratedNotice && !noticeChannel.request('get:active')) return false;
      if (!options?.ignoreCriteria?.disallowedHistoryProcesses && templateConfig.disallowedHistoryProcesses && statusHistory.find(s => templateConfig.disallowedHistoryProcesses.includes(s.get('process')))) return false;
      if (!options?.ignoreCriteria?.includedHistoryProcesses && templateConfig.includedHistoryProcesses && !statusHistory.find(s => templateConfig.includedHistoryProcesses.includes(s.get('process')))) return false;
      if (!options?.ignoreCriteria?.noFutureHearing && templateConfig.noFutureHearing && latestHearing && latestHearing.isActive()) return false;
      if (!options?.ignoreCriteria?.docDeliveryPrimaryOnly && templateConfig.docDeliveryPrimaryOnly && (latestHearing && latestHearing?.getDisputeHearings()?.getPrimary()?.get('dispute_guid') !== dispute.id)) return false;
      
      if (!options?.ignoreCriteria?.allowedIssues && templateConfig.allowedIssues) {
        const atLeastOneValidClaim = claims.find(c => templateConfig.allowedIssues.includes(c.get('claim_code')));
        const anyInvalidClaims = claims.find(c => !templateConfig.allowedIssues.includes(c.get('claim_code')));
        if (!atLeastOneValidClaim || anyInvalidClaims) return false;
      }

      if (!options?.ignoreCriteria?.noFutureHearing && templateConfig.noFutureHearing && latestHearing?.isActive()) return false;
      if (!options?.ignoreCriteria?.futureHearingOnly && templateConfig.futureHearingOnly && latestHearing && !latestHearing.isActive()) return false;
      if (!options?.ignoreCriteria?.hearingLinkTypes && templateConfig.hearingLinkTypes) {
        if (!latestHearing) return false;
        if (!templateConfig.hearingLinkTypes.includes(latestHearing.getHearingLinkType())) return false;
      }
  
      return true;
    };

    const validateLoadedTemplate = () => {
      const loadedTemplates = this.getEmailTemplates();
      const matchingLoadedTemplate = loadedTemplates.findWhere({ assigned_template_id: templateId });
      return !!matchingLoadedTemplate;
    };

    return validateLocalTemplateConfig() && validateLoadedTemplate();
  },

  /**
   * Returns all templates that match current dispute state, and have valid templates from API
   */
  getActiveTemplatesForTemplateGroup(emailTemplateGroup, options={}) {
    const EMAIL_TEMPLATES_CONFIG = configChannel.request('get', 'EMAIL_TEMPLATES_CONFIG');
    const candidateTemplates = Object.values(EMAIL_TEMPLATES_CONFIG).filter(c => c.templateGroup === emailTemplateGroup);
    const allowedTemplates = candidateTemplates.filter(t => this.validateTemplateSelection(t.templateId, options));
    return allowedTemplates.map(t => t.templateId);
  },


  createAndPrepareEmailFromTemplate(assignedTemplateId, emailModelData={}, emailMergeFieldContextData={}) {
    const templateModel = this.getEmailTemplates().filter(t => t.get('assigned_template_id') === assignedTemplateId)?.[0];
    if (!templateModel) return null;

    const emailModel = new Email_model(Object.assign({
      is_active: false,
      assigned_template_id: assignedTemplateId,
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_CUSTOM'),
      send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT'),
      email_from: configChannel.request('get', 'EMAIL_FROM_DEFAULT'),
      recipient_group: templateModel.get('default_recipient_group'),
      subject: EmailTemplateFormatter.applyConversionsTo(templateModel.get('subject_line'), emailMergeFieldContextData),
    }, emailModelData));

    const emailContentModel = new Editor_model({
      required: true,
      withTable: true,
      isEmailable: true,
      disabled: true,
      value: null
    });

    const editorView = new EditorView({ model: emailContentModel }).render();
    EmailTemplateFormatter.load(EmailTemplateFormatter.getEmailContentFromHtml(templateModel.get('template_html')), emailMergeFieldContextData);

    let htmlToUse = '';
    try {
      htmlToUse = EmailTemplateFormatter.getMergedHtml();
    } catch (err) {
      htmlToUse = '';
    }
    emailContentModel.trigger('update:input', htmlToUse);
    const messageContent = editorView.prepareEmailForSend();
    const fullMessageHtml = templateModel.get('template_html');
    const tempEle = $('<div></div>');
    tempEle.append($(fullMessageHtml));
    const mainContent = tempEle.find(`.${EmailTemplateFormatter.EMAIL_CONTENT_CLASS}`);
    mainContent.html(messageContent);
    tempEle.find(`.${EmailTemplateFormatter.EMAIL_ONLY_CLASS}`).css('display' ,'block');
    let finalHtmlToSave = `<html className="en">${tempEle.html()}</html>`;
    finalHtmlToSave = EmailTemplateFormatter.applyConversionsTo(finalHtmlToSave, emailMergeFieldContextData);

    emailModel.set('html_body', finalHtmlToSave);
    return emailModel;
  },
  
});

_.extend(EmailsManager.prototype, UtilityMixin);

const emailsManagerInstance = new EmailsManager();

export default emailsManagerInstance;
