/**
 * @fileoverview - Manager that handles hearings related functionality. This includes hearings, hearing participations and hearing staff, hearing conference bridges, dispute linking history, and .ics file download.
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import HearingModel from './Hearing_model';
import DisputeHearingCollection from './DisputeHearing_collection';
import HearingCollection from './Hearing_collection';
import ConferenceBridgeCollection from '../conference-bridge/ConferenceBridge_collection';
import Formatter from '../formatter/Formatter';

const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const flagsChannel = Radio.channel('flags');
const filesChannel = Radio.channel('files');

const api_load_name = 'disputehearings';
const api_external_load_name = 'externaldisputehearings';
const api_available_hearings_name = 'availablehearings';
const api_available_staff_name = 'availablestaff';
const api_available_conferencebridges_name = 'availableconferencebridges';
const api_report_yearly_name = 'yearlyhearingsummary';
const api_report_monthly_name = 'monthlyhearingsummary';
const api_hearings_day_name = 'dailyhearingdetail';
const api_hearings_owner_name = 'ownerhearingdetail';
const api_conferencebridge_load_name = 'conferencebridges';
const api_linkinghistory_load_name = 'disputehearinghistory';
const api_reassign_name = 'hearing/reassign';
const api_reschedule_name = 'hearing/reschedule';
const api_hold_hearing = 'hearings/holdhearing';
const api_cancel_reserved_hearing = 'hearings/cancelreservedhearing';
const api_on_hold_hearings_name = 'hearings/onholdhearings';
const api_hearing_cross = 'hearings/linkpasthearings';

const HearingsManager = Marionette.Object.extend({
  channelName: 'hearings',

  radioRequests: {
    'create:dispute:hearing': 'createDisputeHearing',
    'get:available': 'getAvailableHearings',
    'get:available:staff': 'getAvailableStaff',
    'get:available:conferencebridges': 'getAvailableConferenceBridges',

    'get:report:yearly': 'getHearingReportYearly',
    'get:report:monthly': 'getHearingReportMonthly',
    'get:by:day': 'getHearingsByDay',
    'get:by:owner': 'getHearingsByOwner',

    'get:conferencebridge': 'getConferenceBridge',
    'get:conferencebridges': 'getAllConferenceBridges',
    'load:conferencebridges': 'loadAllConferenceBridges',
    'load:linkinghistory:dispute': 'loadDisputeLinkingHistory',
    'load:linkinghistory:hearing': 'loadHearingLinkingHistory',
    'load:onholdhearings': 'loadOnHoldHearings',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',
    'load:external': 'loadExternalDisputeHearings',
    load: 'loadHearingsPromise',

    'show:invalid:modal': 'showInvalidHearingStateModal',
    'check:scheduling:error': 'checkForHearingSchedulingError',
    'check:hearing:unassigned': 'checkHearingIsUnassigned',

    'reassign': 'reassignHearings',
    'reschedule': 'rescheduleHearings',
    'cancel:reserved': 'cancelReservedHearing',
    'reserve:hearing': 'reserveHearing',
    'check:adjourned': 'checkAdjourned',
    'cross:past:hearings': 'crossPastHearings',

    'get:active': 'getActiveHearing',
    'get:latest': 'getLatestHearing',
    'get:hearing': 'getHearingById',
    get: 'getHearings',
    
    'has:hearings' : 'hasHearings',
    'generate:ics': 'generateAndDownloadHearingCalendarFile',
    'cancel:ics': 'generateAndDownloadCancelHearingCalendarFile',

    'update:participations': 'fillHearingParticipationForHearing',
    'update:participations:save': 'fillHearingParticipationForHearingAndSave',

    clear: 'clearData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  clearData() {
    this.initializeDisputeModels();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached hearings data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.hearings = cache_data.hearings;
  },

  _toCacheData() {
    return {
      hearings: this.hearings,
    };
  },

  initialize() {
    this.cached_data = {};
    this.initializeDisputeModels();
    this.conferenceBridges = new ConferenceBridgeCollection();
  },

  initializeDisputeModels() {
    // These represent hearings for one dispute
    this.hearings = new HearingCollection();
  },

  getHearings() {
    return this.hearings;
  },

  getHearingById(hearing_id) {
    return this.getHearings().findWhere({ hearing_id: hearing_id });
  },

  getActiveHearing() {
    // There should only be 1 active hearing at any given point
    return this.getHearings().getActive();
  },

  getLatestHearing() {
    return this.getHearings().getLatest();
  },

  hasHearings() {
    return this.getHearings().length;
  },

  getConferenceBridge(bridgeId) {
    return this.getAllConferenceBridges().findWhere({ conference_bridge_id: bridgeId });
  },

  getAllConferenceBridges() {
    return this.conferenceBridges;
  },

  _loadLinkingHistory(request_params) {
    request_params = $.param(request_params || {}, true); // Pass true to perform the traditional encoding of arrays
    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_linkinghistory_load_name}?${request_params}`
    }).done(response => {
      dfd.resolve( new DisputeHearingCollection(response) );
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadHearingLinkingHistory(hearingModel) {
    const HearingId = hearingModel ? hearingModel.get('hearing_id') : null;

    if (!HearingId) {
      console.log(`[Error] Tried to retrieve Hearing linking history but received invalid hearing`, hearingModel);
      return $.Deferred().reject().promise();
    }

    return this._loadLinkingHistory({
      HearingId,
      SearchType: configChannel.request('get', 'HEARING_LINKING_SEARCH_TYPE_HEARING'),
      index: 0,
      count: 999990
    });
  },

  loadDisputeLinkingHistory(hearingModel) {
    const primaryDisputeHearing = hearingModel.getPrimaryDisputeHearing();
    const DisputeGuid = primaryDisputeHearing ? primaryDisputeHearing.get('dispute_guid') : null;

    if (!primaryDisputeHearing || !DisputeGuid) {
      console.log(`[Error] Tried to retrieve Dispute linking history from a hearing with no internal primary DisputeHearing`, hearingModel);
      return $.Deferred().reject().promise();
    }

    return this._loadLinkingHistory({
      DisputeGuid,
      SearchType: configChannel.request('get', 'HEARING_LINKING_SEARCH_TYPE_DISPUTE'),
      index: 0,
      count: 999990
    });
  },

  loadFromDisputeAccessResponse(response={}) {
    const { hearing_id, hearing_start_datetime, dispute_hearing_id, dispute_hearing_role, shared_hearing_link_type, dispute_guid } = response;
    if (hearing_id < 1 || !hearing_id) return;

    const hearingModel = new HearingModel({ hearing_id, hearing_start_datetime });
    hearingModel.createDisputeHearing({ dispute_hearing_id, dispute_hearing_role, shared_hearing_link_type, dispute_guid });

    this.hearings = new HearingCollection(hearingModel);
  },

  loadOnHoldHearings(searchParams={}) {

    const defaultParams = {
      count: 20,
      index: 0,
    };

    const params = { ...defaultParams, ...searchParams };

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_on_hold_hearings_name}?${$.param(params, true)}`
      }).done((response={}) => {
        this.onHoldHearings = response;
        res(response);
      }).fail(rej);
    });
  },

  crossPastHearings(disputeA, disputeB) {
    if (!disputeA || !disputeB) {
      return new Promise((res, rej) => rej());
    }

    const params = $.param(_.extend({
      staticDisputeGuid: disputeA,
      movedDisputeGuid: disputeB
    }));

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'POST',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_hearing_cross}?${params}`
      }).done(response => {
        res(response);
      }).fail(rej);
    });
  },

  loadAllConferenceBridges() {
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_conferencebridge_load_name}`
    }).done(response => {
      this.conferenceBridges = new ConferenceBridgeCollection(response);
      dfd.resolve(this.conferenceBridges);
    }).fail(err => {
      const error_msg = `[Error] Couldn't load conference bridges`;
      console.log(error_msg);
      dfd.reject(err);
    });
    return dfd.promise();
  },

  loadExternalDisputeHearings(disputeGuid) {
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_external_load_name}/${disputeGuid}`
      }).done(response => {
        const hearings = new HearingCollection(response);
        this.hearings = hearings;
        res(this.hearings);
      }).fail(rej);
    });
  },

  loadHearingsPromise(dispute_guid, options={}) {
    if (!dispute_guid) {
      const error_msg = `[Error] Invalid or no dispute to load hearings for ${dispute_guid}`;
      console.log(error_msg);
      return $.Deferred().reject(error_msg).promise();
    }

    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_name}/${dispute_guid}`
    }).done(response => {
      const hearings = new HearingCollection(response);
      if (options.no_cache) {
        return dfd.resolve(hearings);
      } else {
        this.hearings = hearings;
        // Do an update for all the hearing info
        // NOTE: After filling in the hearing info, make sure to save any changes back to API
        Promise.all(this.hearings.map(hearingModel => this.fillHearingParticipationForHearingAndSave(hearingModel)))
         .finally(dfd.resolve(this.hearings));
      }
    }).fail(err => {
      console.log(`[Error] Couldn't load dispute hearings for ${dispute_guid}`);
      dfd.reject(err);
    });
    return dfd.promise();
  },
  
  fillHearingParticipationForHearingAndSave(hearingModel) {
    const dfd = $.Deferred();
    const toRemove = this.fillHearingParticipationForHearing(hearingModel) || [];

    $.whenAll(
      Promise.all(toRemove.map(model => model.destroy())),
      hearingModel.saveHearingParticipations()
    ).done(dfd.resolve).fail(dfd.reject);

    return dfd.promise();
  },
  
  fillHearingParticipationForHearing(hearingModel, targetDispute) {
    targetDispute = targetDispute || disputeChannel.request('get');

    const hearingParticipations = hearingModel.getParticipations();
    const primaryDisputeId = (hearingModel.getPrimaryDisputeHearing() || {get:()=>null}).get('dispute_guid');
    const secondaryDisputeHearings = hearingModel.getSecondaryDisputeHearings();
    
    const isCurrentDisputePrimary = hearingModel.checkIsDisputePrimaryLink(targetDispute);
    const isCurrentDisputeSecondary = hearingModel.checkIsDisputeSecondaryLink(targetDispute);
    const isLandlordDispute = targetDispute && targetDispute.isLandlord();

    // Only delete hearing records if the hearing is still in the future. Otherwise, leave all records for history
    const isCleanupAllowed = hearingModel.isActive();

    const setDerivedValuesOnParticipation = () => {
      hearingParticipations.each(participation => {
        if (!participation.get('participant_model') && participation.get('participant_id')) {
          participation.set('participant_model', participantsChannel.request('get:participant', participation.get('participant_id')), { silent: true });
        }
        if (!participation.get('landlordOrTenant')) {
          const landlordOrTenant = participation.get('participant_model') ?
            (participation.get('participant_model').isTenant() ? 'Tenant' : 'Landlord') : '';
          participation.set('landlordOrTenant', landlordOrTenant);
        }
      });
    };
   
    const participationsToAdd = [];
    let invalidParticipations = [];

    if (isCleanupAllowed) {
      // Perform a general cleanup based on rules - remove any participation records thatshould not be kept
      // Note: Never remove "other" participants using this method, only the delete buttons on the dispute hearing page
      if (hearingModel.isSingleApp() || hearingModel.isCrossApp() || hearingModel.isRepeatedApp()) {
        // If single link, remove any participations that are not part of the current dispute
        invalidParticipations = hearingParticipations.filter(model => (
          !model.isOther() &&
          model.get('dispute_guid') !== primaryDisputeId
        ));
      } else if (hearingModel.isJoinerApp() || hearingModel.isCrossRepeatApp()) {
        invalidParticipations = hearingParticipations.filter(model => (
          !model.isOther() &&
          model.get('dispute_guid') !== primaryDisputeId &&
          !_.any(secondaryDisputeHearings, disputeHearing => disputeHearing.get('dispute_guid') === model.get('dispute_guid'))
        ));
      }
    }

    // Now auto-add participation records based on rules.
    // NOTE: Don't add in participation records for participants from other disputes here yet.
    // Instead, when that dispute is loaded, this function will run and then applicants/respondents will be available
    const parseHearingParticipationFromParticipantsFn = function(landlordTenantType, participant) {
      const matchingExistingModel = hearingParticipations.findWhere({ participant_id: participant.get('participant_id') });
      if (matchingExistingModel) {
        matchingExistingModel.set({
          landlordOrTenant: landlordTenantType,
          participant_model: participant,
          dispute_guid: targetDispute.id,
        }, { silent: true });
      } else { // No HearingParticipation existed, so add one
        participationsToAdd.push({
          hearing_id: hearingModel.id,
          dispute_guid: targetDispute.id,
          participant_id: participant.id,
          participant_model: participant,
          landlordOrTenant: landlordTenantType
        });
      }
    };

    const applicants = participantsChannel.request('get:applicants');
    const respondents = participantsChannel.request('get:respondents');

    if (isCurrentDisputePrimary) {
      applicants.each(_.bind(parseHearingParticipationFromParticipantsFn, this, isLandlordDispute ? 'Landlord' : 'Tenant'));
      respondents.each(_.bind(parseHearingParticipationFromParticipantsFn, this, isLandlordDispute ? 'Tenant' : 'Landlord'));
    } else if (isCurrentDisputeSecondary && (hearingModel.isJoinerApp() || hearingModel.isCrossRepeatApp())) {
      // If on joiner/cross-repeat secondary, just add the applicants
      applicants.each(_.bind(parseHearingParticipationFromParticipantsFn, this, isLandlordDispute ? 'Landlord' : 'Tenant'));
    }
 
    console.log('Participations to remove: ', invalidParticipations);
    console.log('Participations to add: ', participationsToAdd);

    hearingParticipations.remove(invalidParticipations, { silent: true });
    hearingParticipations.add(participationsToAdd, { merge: true, silent: true });


    // Always run this to ensure participant_models have been applied, even to removed participants
    setDerivedValuesOnParticipation();

    // Return any hearing participation records that should be deleted. This allows the caller to delete if desired.
    return invalidParticipations;
  },

  _callTwoHearingEndpoint(firstHearingId, secondHearingId, apiField) {
    if (!firstHearingId || !secondHearingId) {
      return $.Deferred().reject().promise();
    }
    const endpointData = {
      first_hearing_id: firstHearingId,
      second_hearing_id: secondHearingId,
    };
    return apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${apiField}`,
      data: JSON.stringify(endpointData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },


  reassignHearings(firstHearingId, secondHearingId) {
    return this._callTwoHearingEndpoint(firstHearingId, secondHearingId, api_reassign_name);
  },

  rescheduleHearings(firstHearingId, secondHearingId) {
    return this._callTwoHearingEndpoint(firstHearingId, secondHearingId, api_reschedule_name);
  },

  cancelReservedHearing(hearingId) {
    if (!hearingId) {
      return $.Deferred().reject().promise();
    }

    return apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_cancel_reserved_hearing}/${hearingId}`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  reserveHearing(hearingId, request_params) {
    if (!hearingId) {
      return $.Deferred().reject().promise();
    }

    request_params = request_params || {};
    const params = $.param(request_params, true);

    return apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_hold_hearing}/${hearingId}?${params}`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  checkAdjourned(hearingModel) {    
    const disputeHearings = hearingModel.getDisputeHearings();
    if (!disputeHearings || disputeHearings.isEmpty()) return Promise.resolve();
    // Because linked disputes share the same flags we can just get the first one
    const firstDisputeHearing = disputeHearings.at(0);
    return flagsChannel.request('load', firstDisputeHearing.get('dispute_guid')).then(flags => {
      return flags.some(flag => flag.isAdjourned());
    });
  },

  showInvalidHearingStateModal() {
    return new Promise(res => {
      const modalView = modalChannel.request('show:standard', {
        title: `Hearing Data Conflict`,
        bodyHtml: `<p>Warning - Someone has changed important data for this hearing.  The system will now re-load the new information so that you can make your changes based on it. Your changes have not been saved.</p>`,
        primaryButtonText: 'OK',
        hideCancelButton: true,
        onContinueFn: _modalView => _modalView.close()
      });
    
      this.listenTo(modalView, 'removed:modal', () => res());
      loaderChannel.trigger('page:load:complete');
    });
  },

  checkForHearingSchedulingError(errorResponses) {
    if (!errorResponses) {
      return false;
    }

    if (!_.isArray(errorResponses)) {
      errorResponses = [errorResponses];
    }

    const hearingSchedulingErrorCodes = [
      "Dispute GUID provided is already associated to an future dispute",
      "The hearing owner is already booked during the time provided"
    ];

    return _.any(errorResponses, errorResponse => {
      errorResponse = errorResponse || {}
      return _.any(hearingSchedulingErrorCodes, errorCode => $.trim(errorResponse.responseText).match(errorCode));
    });
  },
  

  checkHearingIsUnassigned(hearingModel, showErrorModel=true) {
    const dfd = $.Deferred();
    hearingModel.fetch().done(() => {
      const isAssigned = hearingModel.isAssigned();
      // Resolve true if hearing is unassigned, or false if assigned and we aren't showing a warning
      if (!isAssigned || !showErrorModel) {
        dfd.resolve(!isAssigned);
        return;
      }

      loaderChannel.trigger('page:load:complete');
      const modalView = modalChannel.request('show:standard', {
        title: 'Hearing Unavailable',
        bodyHtml: 'This hearing has already been assigned to a dispute and is no longer available. This can happen when another user selects the hearing before you do in the system',
        hideCancelButton: true,
        primaryButtonText: 'Close',
        onContinueFn(modalView) {
          modalView.close();
        }
      });

      this.listenTo(modalView, 'removed:modal', () => dfd.resolve(false));

    }).fail(dfd.reject);

    return dfd.promise();
  },

  getAvailableHearings(search_params) {
    search_params = search_params || {};
    const params = $.param(search_params, true); // Pass true to perform the traditional encoding of arrays
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_available_hearings_name}?${params}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get available hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });

    return dfd.promise();
  },

  getAvailableStaff(search_params) {
    search_params = search_params || {};
    const params = $.param(search_params, true); // Pass true to perform the traditional encoding of arrays
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_available_staff_name}?${params}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get available hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });

    return dfd.promise();
  },

  getAvailableConferenceBridges(search_params) {
    search_params = search_params || {};
    const params = $.param(search_params, true); // Pass true to perform the traditional encoding of arrays
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_available_conferencebridges_name}?${params}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get available hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });

    return dfd.promise();
  },


  createDisputeHearing(hearing_id, attrs) {
    const hearingModel = new HearingModel({ hearing_id });
    // Creates a dispute hearing for the active dispute and saves to API
    return hearingModel.createDisputeHearing(attrs).save();
  },

  generateAndDownloadCalendarFile(method, eventDataLines=[]) {
    const fileContents = [
      `BEGIN:VCALENDAR`,
      `VERSION:2.0`,
      `PRODID:-//DMS//EN`,
      `CALSCALE:GREGORIAN`,
      `METHOD:${method}`,
      ...eventDataLines,
      `END:VCALENDAR`
    ];
    const blob = new Blob([fileContents.join("\r\n")], { type: 'text/calendar;charset=utf8' });
    filesChannel.request('download:file', blob, 'event.ics');
  },

  getHearingEventLines(hearingModel, eventDataLines=[]) {
    const nowDisplay = Formatter.toIcsDateDisplay(Moment());
    // NOTE: If the VEVENT SUMMARY contains telephone-like numbers, the first one such number will be pulled
    // by some mail clients and put as the telephone number for the event
    return [
      `BEGIN:VEVENT`,
      `UID:RTB_Hearing_${hearingModel.id}`,
      `LAST-MODIFIED:${nowDisplay}`,
      `DTSTAMP:${nowDisplay}`,
      `DTSTART:${Formatter.toIcsDateDisplay(hearingModel.get('hearing_start_datetime'))}`,
      `DTEND:${Formatter.toIcsDateDisplay(hearingModel.get('hearing_end_datetime'))}`,
      `LOCATION:${Formatter.toHearingTypeDisplay(hearingModel.get('hearing_type'))}`,
      `ORGANIZER;CN=BC Residential Tenancy Branch:MAILTO:${configChannel.request('get', 'EMAIL_FROM_DEFAULT')}`,
      ...eventDataLines,
      `END:VEVENT`,
    ];
  },

  generateAndDownloadHearingCalendarFile(hearingModel, calendarHearingTitle, calendarHearingDescription) {
    const eventDataLines = [
      `SEQUENCE:0`,
      `SUMMARY:${calendarHearingTitle}`,
      `DESCRIPTION:${calendarHearingDescription}`,
      `TRANSP:OPAQUE`,
    ];
    return this.generateAndDownloadCalendarFile('PUBLISH', this.getHearingEventLines(hearingModel, eventDataLines));
  },

  generateAndDownloadCancelHearingCalendarFile(hearingModel) {
    const eventDataLines = [
      // NOTE: SEQUENCE must be higher than previous edits - assume creation was seq0, so this one can be seq1
      `SEQUENCE:1`,
      `STATUS:CANCELLED`,
    ];
    return this.generateAndDownloadCalendarFile('CANCEL', this.getHearingEventLines(hearingModel, eventDataLines));
  },

  // Hearing reporting APIs
  getHearingReportYearly(year, search_params) {
    search_params = search_params || {};

    const params = $.param(search_params, true);
    const dfd = $.Deferred();

    if (!search_params.Priorities) {
      alert("[Error] 'Priorities' paramter is required to generate yearly hearing report");
      return dfd.resolve().promise();
    }

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_report_yearly_name}/${year}?${params}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get yearly hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });

    return dfd.promise();
  },

  getHearingReportMonthly(year, month, search_params) {

    search_params = search_params || {};
    const params = $.param(search_params, true);
    const dfd = $.Deferred();

    if (!search_params.Priorities) {
      alert("[Error] 'Priorities' paramter is required to generate monthly hearing report");
      return dfd.resolve().promise();
    }

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_report_monthly_name}/${month}/${year}?${params}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get monthly hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });
    return dfd.promise();
  },

  getHearingsByDay(dateString) {
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_hearings_day_name}/${Moment(dateString).format('YYYY-MM-DD')}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get daily hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });
    return dfd.promise();
  },

  // Returns hearings having LocalStartDateTime between StartDate/EndDate in request
  getHearingsByOwner(ownerId, search_params) {
    search_params = search_params || {};
    const params = $.param(search_params);
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_hearings_owner_name}/${ownerId}?${params}`
    }).done(response => {
      dfd.resolve(response);
    }).fail(err => {
      const error_msg = `[Error] Couldn't get owner detail hearings`;
      console.log(error_msg);
      dfd.reject(err);
    });
    return dfd.promise();
  },

  /* End New Hearing APIs */


});

const hearingsManagerInstance = new HearingsManager();


export default hearingsManagerInstance;
