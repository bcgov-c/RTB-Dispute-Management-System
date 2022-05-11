import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import SubstitutedServiceCollection from '../substituted-service/SubstitutedService_collection';
import NoticeCollection from './Notice_collection';
import NoticeModel from './Notice_model';
import { routeParse } from '../../../admin/routers/mainview_router';

const api_notice_load_name = 'disputenotices';
const api_substituted_services_load_name = 'disputesubstitutedservices';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const hearingChannel = Radio.channel('hearings');

const NoticeManager = Marionette.Object.extend({
  channelName: 'notice',

  radioRequests: {
    'get:active': 'getActiveNotice',
    'get:amendmentNotices:of': 'getAmendmentNoticesAssociatedTo',
    'get:all': 'getAllNotices',
    'get:by:id': 'getNoticeById',
    'check:is:original': 'isNoticeOriginalNotice',
    'get:original': 'getOriginalNotice',
    'get:subservices': 'getSubstitutedServices',
    'get:subservices:for:participant': 'getSubstitutedServicesForParticipant',
    'update:subservice:participants': 'updateSubserviceParticipantsStatePromise',
    'get:subservices:quadrant:config': 'getSubServiceQuadrantConfig',
    'get:subservices:quadrant:by:documentId': 'getSubServiceQuadrantByDocumentId',
    'update:dispute:notice': 'updateDisputeNoticePromise',

    'update:notice:service': 'fillNoticeService',
    'show:missingHearing:modal': 'showModalAddHearing',
    
    refresh: 'loadNotice',
    load: 'loadNotice',
    'load:subservices': 'loadSubstitutedServices',
    'load:dispute:notices': 'loadNoticesForDispute',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',

    clear: 'clearAllData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  /**
   * Saves current notice data into internal memory.  Can be retreived with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this NoticeManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached notice data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.notices = cache_data.notices;
    this.substitutedServices = cache_data.substitutedServices;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      notices: this.notices,
      substitutedServices: this.substitutedServices
    };
  },

  initialize() {
    this.cached_data = {};
    this.notices = new NoticeCollection();
    this.substitutedServices = new SubstitutedServiceCollection();
  },

  /**
   * Clears the current notices in memory.
   * Does not flush any cached data.
   */
  clearAllData() {
    this.substitutedServices = new SubstitutedServiceCollection();
    this.clearNoticeData();
  },

  clearNoticeData() {
    this.notices = new NoticeCollection();
  },

  loadFromDisputeAccessResponse(noticeServicesData, noticeAssociatedTo) {
    const dispute = disputeChannel.request('get');
    const activeNoticeId = dispute && dispute.get('currentNoticeId');
    if (!activeNoticeId) return;

    this.notices.add(new NoticeModel({
      notice_id: activeNoticeId,
      notice_service: _.filter(noticeServicesData, serviceData => (serviceData.notice_id === activeNoticeId &&
        (!serviceData.participant_id || participantsChannel.request('check:id', serviceData.participant_id))
      )),
      notice_associated_to: noticeAssociatedTo
    }));
  },

  _loadNoticePromise(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for load notices`);
      return $.Deferred().reject().promise();
    }
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_notice_load_name}/${dispute_guid}`
    });
  },

  loadNotice(dispute_guid) {
    const dfd = $.Deferred();
    this._loadNoticePromise(dispute_guid).done(response => {
      this.clearNoticeData();
      this.notices.reset(response);
      // Filter out any removed participants
      this.notices.each(notice => {
        const services = notice.getServices();
        const servicesToRemove = services.filter(model => !participantsChannel.request('check:id', model.get('participant_id')));
        services.remove(servicesToRemove, { silent: true });
      });
    
      dfd.resolve(this.notices);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadNoticesForDispute(dispute_guid) {
    const dfd = $.Deferred();
    this._loadNoticePromise(dispute_guid).done(function(response) {
      dfd.resolve(new NoticeCollection(response));
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadSubstitutedServices(dispute_guid) {
    const dfd = $.Deferred();
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for load notices`);
      return dfd.reject().promise();
    }

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_substituted_services_load_name}/${dispute_guid}`
    }).done(response => {
      this.substitutedServices.reset(response);
      dfd.resolve(this.substitutedServices);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  getAllNotices() {
    return this.notices;
  },

  getActiveNotice() {
    return this.getAllNotices().at(0);
  },

  getAmendmentNoticesAssociatedTo(noticeId) {
    return this.notices.filter(model => noticeId && noticeId === model.get('parent_notice_id') && model.isAmendmentNotice());
  },

  getNoticeById(noticeId) {
    return this.getAllNotices().findWhere({ notice_id: noticeId });
  },

  getSubstitutedServices() {
    return this.substitutedServices;
  },

  getSubstitutedServicesForParticipant(participantId) {
    return this.getSubstitutedServices().where({ service_to_participant_id: participantId });
  },

  getSubServiceQuadrantConfig(participantId) {
    const activeParticipant = participantsChannel.request('get:participant', participantId)
    if (!activeParticipant) return;
    
    const serviceQuadrants = configChannel.request('get', 'quadrants');
    const dispute = disputeChannel.request('get');
    const activeNotice = this.getActiveNotice();
    const noticeAssociatedToRespondent = activeNotice && activeNotice.isAssociatedToRespondent();
    const hearing = hearingChannel.request('get:latest');
    const isReviewProcess = dispute.getProcess() === configChannel.request('get', 'PROCESS_REVIEW_HEARING');
    const isRespondentLogin = isReviewProcess && noticeAssociatedToRespondent ? activeParticipant.isApplicant() : activeParticipant.isRespondent();
    let configValue = [];

    configValue = serviceQuadrants.find((quadrant) => {
      const isValidStage = quadrant.stage.includes(dispute.getStage());
      const isValidProcess = quadrant.processes.includes(dispute.getProcess());
      const hasValidHearingState = hearing ? (Moment(hearing.get('hearing_start_datetime')).isAfter(Moment()) === quadrant.futureHearingMustExist) : true;
      const isValidRole = (isRespondentLogin && quadrant.respondentAccess) || (!isRespondentLogin && quadrant.applicantAccess);
      return isValidStage && isValidProcess && hasValidHearingState && isValidRole;
    });

    return configValue;
  },

  getSubServiceQuadrantByDocumentId(documentId) {
    const serviceQuadrants = configChannel.request('get', 'quadrants');
    return serviceQuadrants.find((quadrant) => quadrant.documentId === documentId);
  },

  updateSubserviceParticipantsStatePromise(disputeGuid) {
    const dfd = $.Deferred();
    const activeParticipants = participantsChannel.request('get:all:participants', { include_removed: false });
    // Will perform a refresh of loaded participant and subservice data, and then update participants as needed
    $.whenAll(
      Promise.all(activeParticipants.map(p=> p.fetch())),
      this.loadSubstitutedServices(disputeGuid))
    .done(() => {
      const subServices = this.getSubstitutedServices();
      const participantsWithSubService = activeParticipants.filter(p => subServices.findWhere({ service_to_participant_id: p.id }));

      const allXhr = [];
      activeParticipants.forEach(participant => {
        participant.set('is_sub_service', participantsWithSubService.includes(participant));
        const changes = participant.getApiChangesOnly();
        if (!_.isEmpty(changes)) {
          allXhr.push( _.bind(participant.save, participant, changes) );
        }
      });

      // Now make the API saves on all parties that required it
      Promise.all(allXhr.map(xhr => xhr()))
        .then(dfd.resolve, dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  getOriginalNotice() {
    // Find the notice that was associated to the dispute
    const dispute = disputeChannel.request('get');
    const originalNoticeId = dispute && dispute.get('original_notice_id');
    return originalNoticeId ? this.getAllNotices().find(notice => notice.id === originalNoticeId) : null;
  },

  isNoticeOriginalNotice(noticeModel) {
    const originalNotice = this.getOriginalNotice();
    return originalNotice && originalNotice.id === noticeModel.id && noticeModel.id;
  },

  getFirstProvidedNotice() {
    const providedNotices = this.getAllNotices().filter(notice => !notice.isAmendmentNotice() && notice.isProvided());
    return providedNotices.length ? providedNotices.slice(-1)[0] : null;
  },

  updateDisputeNoticePromise() {
    /*
      On any notice event (add/remove/set provision data), find the notice associated to the dispute as the original notice
      If original notice exists, then update original_notice_date and original_notice_delivered to the current values.
      If no notice yet saved on dispute, then find first provided notice and set that on dispute as the original notice
      If no notice has been provided, remove dispute fields      
    */
    const dispute = disputeChannel.request('get');

    if (!dispute) {
      return $.Deferred().resolve().promise();
    }

    const originalNotice = this.getOriginalNotice();
    const firstProvidedNotice = this.getFirstProvidedNotice();

    // If no original notice, or if original notice is no longer provided, then update what is considered the original notice
    if (firstProvidedNotice && (!originalNotice || !originalNotice.isProvided())) {
      dispute.set({
        original_notice_id: firstProvidedNotice.id,
        original_notice_date: firstProvidedNotice.get('notice_delivered_date'),
        original_notice_delivered: true
      });
    } else if (originalNotice) {
      dispute.set({
        original_notice_date: originalNotice.get('notice_delivered_date'),
        original_notice_delivered: originalNotice.isProvided()
      });
    } else {
      dispute.set({
        // Cannot un-set the original notice, because it throws an API error
        // original_notice_id: null,
        original_notice_date: null,
        original_notice_delivered: null
      });
    }
    
    return dispute.save(dispute.getApiChangesOnly());
  },

  fillNoticeService(noticeModel) {
    const participantRequestString = `get:${noticeModel.isAssociatedToRespondent() ? 'applicants' : 'respondents'}`;
    const respondents = participantsChannel.request(participantRequestString);
    const notice_service_collection = noticeModel.getServices();

    respondents.each(function(respondent) {
      const existing_model = notice_service_collection.findWhere({ participant_id: respondent.get('participant_id')});
      if (existing_model) {
        existing_model.set({
          participant_id: respondent.get('participant_id')
        });
      } else {
        notice_service_collection.add(
          noticeModel.createNoticeService({
            participant_id: respondent.get('participant_id'),
            is_served: null
        }));
      }
    });
  },

  showModalAddHearing() {
    const dispute = disputeChannel.request('get');

    modalChannel.request('show:standard', {
      title: 'No hearing',
      bodyHtml: '<p>This dispute does not have an active hearing.  The notice for a participatory hearing cannot be generated without an active hearing.',
      primaryButtonText: 'Add Hearing',
      onContinueFn: _.bind(function(modalView) {
        modalView.close();
        Backbone.history.navigate(routeParse('hearing_item', dispute.get('dispute_guid')), { trigger: true });
      }, this)
    });
  }

});

_.extend(NoticeManager.prototype, UtilityMixin);

const noticeManagerInstance = new NoticeManager();

export default noticeManagerInstance;
