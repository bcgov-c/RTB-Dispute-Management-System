import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeModel from '../../../core/components/dispute/Dispute_model';
import ParticipantModel from '../../../core/components/participant/Participant_model';
import AmendmentCollection from './Amendment_collection';
import AmendmentModel from './Amendment_model';
import ModalAmendmentsView from '../amendments/ModalAmendmentsView';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const api_load_name = 'disputeamendments';

const apiChannel = Radio.channel('api');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');

const AmendmentsManager = Marionette.Object.extend({
  channelName: 'amendments',

  radioRequests: {
    load: 'loadAmendmentsPromise',
    'get:all': 'getAllAmendments',

    'change:rentaladdress': 'createRentalAddressChange',
    'add:applicant': 'createApplicantAdd',
    'add:respondent': 'createRespondentAdd',
    'remove:applicant': 'createApplicantRemove',
    'remove:respondent': 'createRespondentRemove',
    'remove:party': 'createPartyRemove',

    'change:party:name': 'createPartyNameChange',
    'change:party:mailing': 'createPartyMailingChange',
    'change:party:address': 'createPartyAddressChange',
    'change:primaryApplicant:mailing': 'createPrimaryApplicantMailingChange',
    'change:primaryApplicant:address': 'createPrimaryApplicantAddressChange',
    'change:primaryApplicant:name': 'createPrimaryApplicantNameChange',
    'change:primaryApplicant': 'createPrimaryApplicantChanged',

    'add:claim': 'createClaimAdd',
    'change:claim': 'createClaimChange',
    'remove:claim': 'createClaimRemove',

    'show:modal:view': 'showModalAmendmentsView',

    refresh: 'loadAmendmentsPromise',
    clear: 'clearInternalData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current amendment data into internal memory.  Can be retrieved with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this AmendmentManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.allAmendments = cache_data.allAmendments;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      allAmendments: this.allAmendments
    };
  },

  initialize() {
    this.cached_data = {};
    this.allAmendments = new AmendmentCollection();
  },

  /**
   * Clears the current amendment in memory.
   * Does not flush any cached data.
   */
  clearInternalData() {
    this.allAmendments = new AmendmentCollection();
  },

  loadAmendmentsPromise(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:all amendments`);
      return;
    }
    const default_index = 0,
      default_count = 999990;

    const dfd = $.Deferred(),
      params = $.param(_.extend({
        index: default_index,
        count: default_count
      }));

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_name}/${dispute_guid}?${params}`
    }).done(response => {
      this.allAmendments.reset(response);
      dfd.resolve(this.allAmendments);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  getAllAmendments() {
    return this.allAmendments;
  },

  _getAmendmentConfig(amendment_config_id) {
    const amendments_config = configChannel.request('get', 'amendment_config'),
      amendment_config_item = amendment_config_id ? _.extend({}, amendments_config[amendment_config_id]) : amendments_config;
    return amendment_config_item;
  },

  _createAmendment(amendment_data) {
    const amendment_source = configChannel.request('get', 'AMENDMENT_SOURCE_MANUAL');
    const amendment_status = configChannel.request('get', 'AMENDMENT_STATUS_ACCEPTED');
    const include_in_decision = 0;
    const new_amendment = new AmendmentModel(_.extend({
      amendment_source,
      amendment_status,
      include_in_decision
    }, amendment_data));
    const dfd = $.Deferred();

    const flag = flagsChannel.request('create:amendment');
    if (!flag) return;

    const createFlagPromise = () => new Promise((res, rej) => flag.save().then(res, generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE', rej)));

    new_amendment.save().done(() => {
      this.allAmendments.add(new_amendment);
    }).done(() => {
      createFlagPromise().then(() => dfd.resolve());
    }).fail(dfd.reject);
    return dfd.promise();
  },

  _toParticipantAmendmentDisplay(participantModel) {
    return `${participantModel.getAmendmentTypeDisplay()} - ${participantModel.getDisplayName()}`;
  },


  // Amendment creation methods

  // NOTE: The basics for all the create* amendment methods is to pass a "dirty" CM/Backbone Model.
  // Then we will use the "get snapshot" style methods to see what is changed.


  /* DISPUTE AMENDMENTS */
  createRentalAddressChange(disputeModel, other_amendment_data) {
    const amendment_config = this._getAmendmentConfig('CHANGE_RENTAL_ADDRESS')

    const oldAddressDisputeModel = new DisputeModel(_.extend( disputeModel.toJSON(), disputeModel.getApiSnapshotOfData() ));
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        oldAddress: oldAddressDisputeModel.getAddressStringWithUnit(),
        newAddress: disputeModel.getAddressStringWithUnit()
      })
    }, amendment_config, other_amendment_data));
  },
  /******************/

  /* PARTY AMENDMENTS */
  createPartyNameChange(partyModel, amendment_data) {
    // Add config info into amendment_data
    amendment_data = _.extend(this._getAmendmentConfig('CHANGE_PARTY'), this._getAmendmentConfig('CHANGE_PARTY_NAME'), amendment_data);
    const oldPartyModel = new ParticipantModel(_.extend( partyModel.toJSON(), partyModel.getApiSnapshotOfData() ));
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_data.change_html_template)({
        oldValue: this._toParticipantAmendmentDisplay(oldPartyModel),
        newValue: this._toParticipantAmendmentDisplay(partyModel)
      })
    }, amendment_data));
  },

  createPartyAddressChange(partyModel, amendment_data) {
    // Add config info into amendment_data
    amendment_data = _.extend(this._getAmendmentConfig('CHANGE_PARTY'), this._getAmendmentConfig('CHANGE_PARTY_MAILING'), amendment_data);
    const oldPartyModel = new ParticipantModel(_.extend( partyModel.toJSON(), partyModel.getApiSnapshotOfData() ));
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_data.change_html_template)({
        oldValue: oldPartyModel.getAddressStringWithUnit(),
        newValue: partyModel.getAddressStringWithUnit(),
        applicantDisplay: partyModel.getDisplayName()
      })
    }, amendment_data));
  },

  createPartyMailingChange(partyModel, amendment_data) {
    // Add config info into amendment_data
    amendment_data = _.extend(this._getAmendmentConfig('CHANGE_PARTY'), this._getAmendmentConfig('CHANGE_PARTY_MAILING'), amendment_data);
    const oldPartyModel = new ParticipantModel(_.extend( partyModel.toJSON(), partyModel.getApiSnapshotOfData() ));
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_data.change_html_template)({
        oldValue: oldPartyModel.hasMailAddress() ? oldPartyModel.getMailingAddressString() : null,
        newValue: partyModel.getMailingAddressString(),
        applicantDisplay: partyModel.getDisplayName()
      })
    }, amendment_data));
  },

  createPrimaryApplicantAddressChange(partyModel, other_amendment_data) {
    return this.createPartyAddressChange(partyModel,
      _.extend(other_amendment_data, this._getAmendmentConfig('CHANGE_PRIMARY_MAILING')));
  },

  createPrimaryApplicantMailingChange(partyModel, other_amendment_data) {
    return this.createPartyMailingChange(partyModel,
        _.extend(other_amendment_data, this._getAmendmentConfig('CHANGE_PRIMARY_MAILING')));
  },

  createPrimaryApplicantNameChange(partyModel, other_amendment_data) {
    return this.createPartyNameChange(partyModel,
      _.extend(other_amendment_data, this._getAmendmentConfig('CHANGE_PRIMARY_NAME')));
  },

  createPrimaryApplicantChanged(previousPrimaryModel, primaryModel, other_amendment_data) {
    const amendment_config = this._getAmendmentConfig('CHANGE_PRIMARY');
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        oldValue: previousPrimaryModel ? this._toParticipantAmendmentDisplay(previousPrimaryModel) : null,
        newValue: this._toParticipantAmendmentDisplay(primaryModel)
      })
    }, amendment_config, other_amendment_data));
  },

  _createPartyAdd(amendment_data) {
    const amendment_config = this._getAmendmentConfig('ADD_PARTY');
    return this._createAmendment(_.extend(amendment_config, amendment_data));
  },

  createApplicantAdd(partyModel, other_amendment_data) {
    const amendment_config = _.extend(this._getAmendmentConfig('ADD_PARTY'), this._getAmendmentConfig('ADD_APPLICANT'));
    return this._createPartyAdd(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        applicantDisplay: 'Applicant',
        partyDisplay: this._toParticipantAmendmentDisplay(partyModel)
      })
    }, amendment_config, other_amendment_data));
  },

  createRespondentAdd(partyModel, other_amendment_data) {
    const amendment_config = _.extend(this._getAmendmentConfig('ADD_PARTY'), this._getAmendmentConfig('ADD_RESPONDENT'));
    return this._createPartyAdd(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        applicantDisplay: 'Respondent',
        partyDisplay: this._toParticipantAmendmentDisplay(partyModel)
      })
    }, amendment_config, other_amendment_data));
  },

  createPartyRemove(partyModel, other_amendment_data) {
    const amendment_config = this._getAmendmentConfig('REMOVE_PARTY');
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        partyDisplay: this._toParticipantAmendmentDisplay(partyModel),
        applicantDisplay: 'Participant'
      })
    }, amendment_config, other_amendment_data));
  },

  createApplicantRemove(partyModel, other_amendment_data) {
    const amendment_config = _.extend(this._getAmendmentConfig('REMOVE_PARTY'), this._getAmendmentConfig('REMOVE_APPLICANT'));
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        partyDisplay: this._toParticipantAmendmentDisplay(partyModel),
        applicantDisplay: 'Applicant'
      })
    }, amendment_config, other_amendment_data));
  },

  createRespondentRemove(partyModel, other_amendment_data) {
    const amendment_config = _.extend(this._getAmendmentConfig('REMOVE_PARTY'), this._getAmendmentConfig('REMOVE_RESPONDENT'));
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        partyDisplay: this._toParticipantAmendmentDisplay(partyModel),
        applicantDisplay: 'Respondent'
      })
    }, amendment_config, other_amendment_data));
  },

  /******************/


  /* CLAIM AMENDMENTS */
  createClaimAdd(disputeClaimModel, other_amendment_data) {
    const amendment_config = this._getAmendmentConfig('ADD_CLAIM'),
      current_data = disputeClaimModel.getFlatData();
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        issueDisplay: current_data.claim_title
      })
    }, other_amendment_data, amendment_config));
  },

  createClaimRemove(disputeClaimModel, other_amendment_data) {
    const amendment_config = this._getAmendmentConfig('REMOVE_CLAIM'),
      current_data = disputeClaimModel.getFlatData();
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(amendment_config.change_html_template)({
        issueDisplay: current_data.claim_title
      })
    }, other_amendment_data, amendment_config));
  },

  createClaimChange(disputeClaimModel, other_amendment_data) {
    const amendment_config = this._getAmendmentConfig('CHANGE_CLAIM'),
      old_data = disputeClaimModel.getFlatApiSnapshotOfData(),
      current_data = disputeClaimModel.getFlatData();

    let change_data = {};
    // It's only change data if old and current don't match, and if the old data wasn't empty
    _.each(current_data, function(val, key) {
      if (val !== old_data[key] && old_data[key]) {
        change_data[key] = val;
      }
    });

    if (_.isEmpty(change_data)) {
      console.log(`[Warning] Error parsing amendment change data.  Writing full amendment info instead`);
      change_data = current_data;
    }

    let change_html_template = '';
    if (_.has(change_data, 'claim_description')) {
      change_html_template += `<p><b>Issue Description changed</b> FROM: <span class="amend-from"><%= oldDescriptionDisplay %></span> TO: <span class="amend-to"><%= newDescriptionDisplay %></span></p>`;
    }

    if (_.has(change_data, 'notice_method')) {
      change_html_template += `<p><b>Issue Service method changed</b> FROM: <span class="amend-from"><%= oldNoticeMethodDisplay %></span> TO: <span class="amend-to"><%= newNoticeMethodDisplay %></span></p>`;
    }

    if (_.has(change_data, 'notice_date')) {
      change_html_template += `<p><b>Issue Service date changed</b> FROM: <span class="amend-from"><%= oldNoticeDateDisplay %></span> TO: <span class="amend-to"><%= newNoticeDateDisplay %></span></p>`;
    }

    if (_.has(change_data, 'amount')) {
      change_html_template += `<p><b>Issue Amount Requested changed</b> FROM: <span class="amend-from"><%= oldAmountDisplay %></span> TO: <span class="amend-to"><%= newAmountDisplay %></span></p>`;
    }

    console.log(old_data, change_data);
    return this._createAmendment(_.extend({
      amendment_change_html: _.template(change_html_template)({
        oldDescriptionDisplay: old_data.claim_description ? `"${old_data.claim_description}"` : '-',
        newDescriptionDisplay: change_data.claim_description ? `"${change_data.claim_description}"` : '-',

        oldNoticeMethodDisplay: old_data.notice_method ? Formatter.toNoticeMethodDisplay(old_data.notice_method) : '-',
        newNoticeMethodDisplay: change_data.notice_method ? Formatter.toNoticeMethodDisplay(change_data.notice_method) : '-',

        oldNoticeDateDisplay: old_data.notice_date ? Formatter.toDateDisplay(old_data.notice_date) : '-',
        newNoticeDateDisplay: change_data.notice_date ? Formatter.toDateDisplay(change_data.notice_date) : '-',

        oldAmountDisplay: old_data.amount ? Formatter.toAmountDisplay(old_data.amount) : '-',
        newAmountDisplay: change_data.amount ? Formatter.toAmountDisplay(change_data.amount) : '-',
      })
    }, other_amendment_data, amendment_config));

  },

  /******************/


  showModalAmendmentsView(amendmentType=null) {
    const disputeGuid = disputeChannel.request('get:id');
    loaderChannel.trigger('pag:load');
    this.loadAmendmentsPromise(disputeGuid).done(amendmentCollection => {
      modalChannel.request('add', new ModalAmendmentsView({ amendmentCollection, amendmentType }));
    });
  },

});

const amendmentsManagerInstance = new AmendmentsManager();
export default amendmentsManagerInstance;
