import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import DisputeHearingCollection from './DisputeHearing_collection';
import DisputeHearingModel from './DisputeHearing_model';
import HearingParticipationCollection from './HearingParticipation_collection';
import HearingParticipationModel from './HearingParticipation_model';
import { generalErrorFactory } from '../api/ApiLayer';
import FileDescription_model from '../files/file-description/FileDescription_model';

const hearing_api_url = 'hearing';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const hearingChannel = Radio.channel('hearings');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export const HEARING_NOTICE_GENERATE_TYPES = {
  ADJOURNED: 1,
  RESCHEDULED: 2,
  FOLLOWUP: 3
};

export default CMModel.extend({
  idAttribute: 'hearing_id',

  defaults: {
    hearing_id: null,
    associated_disputes: null,
    hearing_participations: null,
    conference_bridge_id: null,
    hearing_complexity: null,
    hearing_details: null,
    hearing_duration: null,
    hearing_prep_time: null,
    hearing_start_datetime: null,
    hearing_end_datetime: null,
    local_start_datetime: null,
    local_end_datetime: null,
    hearing_location: null,
    hearing_method: null,
    hearing_note: null,
    hearing_owner: null,
    hearing_priority: null,
    hearing_type: null,
    hearing_sub_type: null,
    notification_delivery_date: null,
    notification_delivery_description: null,
    notification_file_description_id: null,
    other_staff_participants: null,
    special_instructions: null,
    staff_participant1: null,
    staff_participant2: null,
    staff_participant3: null,
    staff_participant4: null,
    staff_participant5: null,
    use_custom_schedule: false,
    use_special_instructions: false,
    hearing_reserved_until: null,
    hearing_reserved_file_number: null,
    hearing_reserved_dispute_guid: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'conference_bridge_id',
    'hearing_complexity',
    'hearing_details',
    'hearing_duration',
    'hearing_prep_time',
    'hearing_start_datetime',
    'hearing_end_datetime',
    'local_end_datetime',
    'local_start_datetime',
    'hearing_location',
    'hearing_method',
    'hearing_note',
    'hearing_owner',
    'hearing_priority',
    'hearing_type',
    'hearing_sub_type',
    'notification_delivery_date',
    'notification_delivery_description',
    'notification_file_description_id',
    'other_staff_participants',
    'special_instructions',
    'staff_participant1',
    'staff_participant2',
    'staff_participant3',
    'staff_participant4',
    'staff_participant5',
    'use_custom_schedule',
    'use_special_instructions'
  ],


  nested_collections_data() {
    return {
      hearing_participations: HearingParticipationCollection,
      associated_disputes: DisputeHearingCollection
    };
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${hearing_api_url}`;
  },

  getParticipations() {
    return this.get('hearing_participations');
  },

  getDisputeHearings() {
    return this.get('associated_disputes');
  },

  getHearingNoticeFileDescription() {
    return filesChannel.request('get:filedescription', this.get('notification_file_description_id'));
  },

  resetHearingParticipations() {
    const hearingParticipations = this.getParticipations();
    if (hearingParticipations) {
      hearingParticipations.resetCollection();
    }
  },

  saveHearingParticipations() {
    const dfd = $.Deferred();
    Promise.all(this.getParticipations().map(function(model) {
      return model.save(model.getApiChangesOnly());
    })).then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  createParticipation(attrs, options) {
    options = options || {};
    // Create DisputHearing with default values which can be overridden
    const participationModel = new HearingParticipationModel(_.extend({
        hearing_id: this.id,
        participant_model: null
      },
      attrs, // Pass along attributes
    ));
    
    if (!options.no_add) {
      this.getParticipations().add(participationModel);
    }
    return participationModel;
  },

  createDisputeHearing(attrs, options) {
    options = options || {};
    // Create DisputHearing with default values which can be overridden
    const disputeHearingModel = new DisputeHearingModel(_.extend({
        dispute_hearing_role: configChannel.request('get', 'DISPUTE_HEARING_ROLE_PRIMARY'),
        shared_hearing_link_type: configChannel.request('get', 'DISPUTE_HEARING_LINK_TYPE_SINGLE')
      },
      attrs, // Pass along attributes
      {
        // Always use this HearingModel's id
        hearing_id: this.get('hearing_id'),
    }, attrs));

    if (!options.no_add) {
      this.getDisputeHearings().add(disputeHearingModel, options);
    }
    return disputeHearingModel;
  },

  async createHearingNotice(attrs={}) {
    const hearingNotice = new FileDescription_model(Object.assign({
      title: `Hearing Notice`,
      description: `Hearing Notice`,
      description_by: participantsChannel.request('get:primaryApplicant:id'),
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_NOTICE')
    }, attrs));
    
    return hearingNotice.save().then(() => {
      filesChannel.request('add:filedescription', hearingNotice);
      return this.save({ notification_file_description_id: hearingNotice.id });
    }).catch(err => { throw new Error(err) });
  },

  deleteAllDisputeHearings() {
    const dfd = $.Deferred();
    Promise.all(this.getDisputeHearings().map(function(model) {
      return model.destroy();
    })).then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  saveDisputeHearings() {
    // If a dispute hearing is role=Primary, then it must be saved before the others
    const disputeHearings = this.getDisputeHearings();
    const primaryDisputeHearing = this.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = disputeHearings.getSecondaries();

    const dfd = $.Deferred();

    $.when(primaryDisputeHearing ? primaryDisputeHearing.save(primaryDisputeHearing.getApiChangesOnly()) : null).done(() => {
      const errorResponses = [];
      const promiseFns = _.map(secondaryDisputeHearings, model => {
        return function() {
          const _dfd = $.Deferred();
          model.save(model.getApiChangesOnly())
            .done(response => {
              _dfd.resolve(response);
            })
            .fail(err => {
              errorResponses.push(err);
              _dfd.reject();
            });
          return _dfd.promise();
        };
      });

      Promise.all(_.map(promiseFns, promiseFn => promiseFn()))
        .then(dfd.resolve, () => dfd.reject(errorResponses))
    }).fail(err => dfd.reject(err));
    
    return dfd.promise();
  },

  resetDisputeHearings() {
    const disputeHearings = this.getDisputeHearings();
    const toRemove = [];
    disputeHearings.each(function(disputeHearingModel) {
      if (disputeHearingModel.isNew()) {
        toRemove.push(disputeHearingModel);
      } else {
        disputeHearingModel.resetModel();
      }
    });
    disputeHearings.remove(toRemove);
  },

  updateDisputeHearingsLinkType(newLinkType) {
    this.getDisputeHearings().each(function(disputeHearingModel) {
      disputeHearingModel.set('shared_hearing_link_type', newLinkType, { silent: true });
    });
  },

  // Checks what is currently loaded in the model against a fetch of the dispute hearings
  updateAndCheckHearingState: async function() {
    const initiallyLoadedDisputeHearingClones = this.getDisputeHearings().map(disputeHearing => disputeHearing.clone());
    const initiallyReserved = !!this.isReserved();
    const stateAttrsToCheck = ['hearing_start_datetime', 'hearing_end_datetime', 'hearing_priority', 'hearing_owner', 'conference_bridge_id'];
    const initialHearingData = _.pick(this.toJSON(), stateAttrsToCheck) || {};
    return new Promise((resolve, reject) => {
      try {
        this.fetch({ silent: true })
          .then(() => {
            // If the reservation status of the hearing changed, consider it a state change
            if (initiallyReserved !== !!this.isReserved()) return resolve(false);
            if (stateAttrsToCheck.some(attr => initialHearingData[attr] !== this.get(attr))) return resolve(false);

            const latestDisputeHearings = this.getDisputeHearings();
            if (initiallyLoadedDisputeHearingClones.length !== latestDisputeHearings.length) return resolve(false);

            // If there are no DisputeHearings records to compare, then the state is the same
            if (initiallyLoadedDisputeHearingClones.length === 0) return resolve(true);

            const allApiDisputeHearingsExist = latestDisputeHearings.any(latestDisputeHearing => _.any(initiallyLoadedDisputeHearingClones, disputeHearingClone => disputeHearingClone && disputeHearingClone.id === latestDisputeHearing.id));
            const allInitialDisputeHearingsExist = _.all(initiallyLoadedDisputeHearingClones, initialDisputeHearing => {
              const latestDisputeHearing = latestDisputeHearings.get(initialDisputeHearing.id);
              return latestDisputeHearing
                && latestDisputeHearing.get('shared_hearing_link_type') === initialDisputeHearing.get('shared_hearing_link_type')
                && latestDisputeHearing.get('dispute_hearing_role') === initialDisputeHearing.get('dispute_hearing_role');
            });

            resolve(allInitialDisputeHearingsExist && allApiDisputeHearingsExist);
          },
            generalErrorFactory.createHandler('ADMIN.HEARING.LOAD', () => reject(new Error('API load error')), 'This operation will be cancelled, please try again.')
          )
        } catch (err) {
          console.log(`[Error] Unknown application error occurred during hearing state check: `, err);
          resolve(true);
        }
    });
  },

  // A wrapper function that can be used to check dispute hearing state
  withStateCheck: async function(validFn, invalidFn, errorFn) {
    loaderChannel.trigger('page:load');
    let stateIsValid;
    try {
      stateIsValid = await this.updateAndCheckHearingState();
    } catch (err) {
      errorFn();
      return;
    }

    if (stateIsValid) {
      validFn();
    } else {
      invalidFn();
    }
  },

  checkIsDisputePrimaryLink(disputeModel) {
    if (!disputeModel) {
      return;
    }
    const primaryDisputeHearing = this.getPrimaryDisputeHearing();
    if (!primaryDisputeHearing) return false;//check if undefined then return false
    return disputeModel.id && primaryDisputeHearing && primaryDisputeHearing.get('dispute_guid') === disputeModel.id;
  },

  checkIsDisputeSecondaryLink(disputeModel) {
    if (!disputeModel) {
      return;
    }
    const secondaryDisputeHearings = this.getSecondaryDisputeHearings();
    return disputeModel.id && secondaryDisputeHearings && _.any(secondaryDisputeHearings, model => model.get('dispute_guid') === disputeModel.id);
  },

  getPrimaryDisputeHearing() {
    return this.getDisputeHearings().getPrimary();
  },

  getSecondaryDisputeHearings() {
    return this.getDisputeHearings().getSecondaries();
  },

  _getFirstDisputeHearing() {
    const disputeHearings = this.getDisputeHearings();
    return disputeHearings.length ? disputeHearings.at(0) : null;
  },

  getHearingLinkType() {
    const firstDisputHearing = this._getFirstDisputeHearing();
    return firstDisputHearing && firstDisputHearing.get('shared_hearing_link_type');
  },

  isSingleApp() {
    const firstDisputHearing = this._getFirstDisputeHearing();
    return firstDisputHearing && firstDisputHearing.isSingleLink();
  },

  isCrossApp() {
    const firstDisputHearing = this._getFirstDisputeHearing();
    return firstDisputHearing && firstDisputHearing.isCrossLink();
  },

  isJoinerApp() {
    const firstDisputHearing = this._getFirstDisputeHearing();
    return firstDisputHearing && firstDisputHearing.isJoinerLink();
  },

  isCrossRepeatApp() {
    const firstDisputHearing = this._getFirstDisputeHearing();
    return firstDisputHearing && firstDisputHearing.isCrossRepeatLink();
  },

  isRepeatedApp() {
    const firstDisputHearing = this._getFirstDisputeHearing();
    return firstDisputHearing && firstDisputHearing.isRepeatedLink();
  },

  checkAndUpdateLinkType() {
    const disputeHearings = this.getDisputeHearings();
    let valueToUpdate;

    if (disputeHearings.length === 1) {
      valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_SINGLE';
    } else if (disputeHearings.length === 2) {
      if (disputeHearings.any(function(model) { return model.isJoinerLink(); })) {
        valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_JOINER';
      } else if (disputeHearings.any(function(model) { return model.isRepeatedLink(); })) {
        valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_REPEATED';
      } else {
        valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_CROSS';
      }
    } else if (disputeHearings.length > 2) {
      if (disputeHearings.any(function(model) { return model.isJoinerLink(); })) {
        valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_JOINER';
      } else if (disputeHearings.any(function(model) { return model.isRepeatedLink(); })) {
        valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_REPEATED';
      } else {
        valueToUpdate = 'DISPUTE_HEARING_LINK_TYPE_CROSS_REPEAT';
      }
    }

    if (!valueToUpdate) {
      return $.Deferred().resolve().promise();
    }
    this.updateDisputeHearingsLinkType(configChannel.request('get', valueToUpdate));
    return this.saveDisputeHearings();
  },

  getDisputeHearingLinkDisplay() {
    return this.isSingleApp() ? 'Single Application' :
      this.isCrossApp() ? 'Cross Application' :
      this.isJoinerApp() ? 'Joined Application' :
      this.isCrossRepeatApp() ? 'Cross-Repeat Application' :
      this.isRepeatedApp() ? 'Repeated Application' : null;
  },

  getDisputeHearingLinkShortDisplay() {
    return this.isSingleApp() ? 'Single' :
    this.isCrossApp() ? 'Cross' :
    this.isJoinerApp() ? 'Joined' :
    this.isCrossRepeatApp() ? 'Cross-Repeat' :
    this.isRepeatedApp() ? 'Repeated' : null;
  },

  getConferenceBridge() {
    return this.isConference() ? hearingChannel.request('get:conferencebridge', this.get('conference_bridge_id')) : null;
  },

  getModeratorCodeDisplay() {
    const conferenceBridgeModel = this.getConferenceBridge();
    return conferenceBridgeModel ? conferenceBridgeModel.get('moderator_code') : null;
  },

  getWebPortalLoginDisplay() {
    const conferenceBridgeModel = this.getConferenceBridge();
    return conferenceBridgeModel ? conferenceBridgeModel.get('web_portal_login') : null;
  },

  isFaceToFace() {
    return this.get('hearing_type') && this.get('hearing_type') === configChannel.request('get', 'HEARING_TYPE_FACE_TO_FACE');
  },

  isConference() {
    return !!this.get('conference_bridge_id') && !this.get('use_custom_schedule');
  },

  isAssigned() {
    return this.getDisputeHearings().length;
  },

  isPriorityDuty() {
    return this.get('hearing_priority') && this.get('hearing_priority') === configChannel.request('get', 'HEARING_PRIORITY_DUTY');
  },

  isPriorityStandard() {
    return this.get('hearing_priority') && this.get('hearing_priority') === configChannel.request('get', 'HEARING_PRIORITY_STANDARD');
  },

  isPriorityEmergency() {
    return this.get('hearing_priority') && this.get('hearing_priority') === configChannel.request('get', 'HEARING_PRIORITY_EMERGENCY');
  },

  isPriorityDeferred() {
    return this.get('hearing_priority') && this.get('hearing_priority') === configChannel.request('get', 'HEARING_PRIORITY_DEFERRED');
  },

  isReserved() {
    const hearingReservedUntil = this.get('hearing_reserved_until');
    return hearingReservedUntil && Moment(hearingReservedUntil).isAfter(Moment())
  },

  toHearingDisplay() {
    const start = this.get('local_start_datetime');
    const end = this.get('local_end_datetime');

    // NOTE: We assume that hearing start is on same calendar day as hearing end
    const time_string = `${Formatter.toDateAndTimeDisplay(start)} - ${Formatter.toTimeDisplay(end)}`;
    return `${time_string}, ${this.get('hearing_owner') ? userChannel.request('get:user:name', this.get('hearing_owner')) : 'Not assigned'}`;
  },

  getInstructions() {
    return this.get('use_special_instructions') ? this.get('special_instructions') : this.get('hearing_details');
  },

  isActive() {
    const hearing_end_datetime = this.get('hearing_end_datetime');
    return hearing_end_datetime && !Moment().isAfter(hearing_end_datetime, 'minutes');
  },

  _getDateXDaysBeforeStart(dayOffset) {
    if (!this.get('hearing_start_datetime')) {
      console.log(`[Warning] No local start datetime for the hearing`, this);
      return;
    }
    // For deadlines, always include today, so add one to the offset calculation to pick an earlier deadline
    return Moment(this.get('hearing_start_datetime')).subtract(Number(dayOffset)+1, 'days');
  },

  getApplicantEvidenceDeadline() {
    if (disputeChannel.request('get')?.isUrgent()) {
      const submittedDate = Moment(disputeChannel.request('get')?.get('submitted_date'));
      return submittedDate.isValid() ? submittedDate : null;
    } else {
      return this._getDateXDaysBeforeStart(configChannel.request('get', 'APPLICANT_EVIDENCE_WARNING_DAY_OFFSET'));
    }
  },

  getRespondentEvidenceDeadline() {
    const evidenceOffset = configChannel.request('get', disputeChannel.request('get')?.isUrgent() ? 'RESPONDENT_EVIDENCE_URGENT_WARNING_DAY_OFFSET' : 'RESPONDENT_EVIDENCE_WARNING_DAY_OFFSET');
    return this._getDateXDaysBeforeStart(evidenceOffset);
  }

});
