import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import NoteCollection from './Note_collection';

const api_load_name = 'disputenotes';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

const NotesManager = Marionette.Object.extend({
  channelName: 'notes',

  radioRequests: {
    load: 'loadNotesPromise',
    'get:all': 'getAllNotes',
    'get:dispute': 'getDisputeNotes',
    'get:participant': 'getParticipantNotes',
    'get:claim': 'getClaimNotes',
    'get:hearing': 'getHearingNotes',
    'get:notice': 'getNoticeNotes',
    'get:evidence': 'getEvidenceNotes',
    'get:file:evidence': 'getEvidenceFileNotes',
    'get:file:decision': 'getDecisionFileNotes',
    'get:disputeinfo': 'getDisputeInfoNotes',
    'add:saved:note': 'addSavedNote',
    refresh: 'loadNotesPromise',
    'get:draft': 'getDraftDisputeNote',
    'save:draft': 'saveDraftDisputeNote',
    'clear:drafts': 'clearDraftNotes',

    clear: 'clearInternalNotesData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor',
  },

  /**
   * Saves current notes data into internal memory.  Can be retreived with loadCachedData().
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
   * Loads any saved cached values for a dispute_guid into this NotesManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached participant data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.allNotes = cache_data.allNotes;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      allNotes: this.allNotes
    };
  },

  initialize() {
    this.cached_data = {};
    this.allNotes = new NoteCollection();
    this.sessionDisputeNotes = {};
  },

  /**
   * Clears the current notes in memory.
   * Does not flush any cached data.
   */
  clearInternalNotesData() {
    this.allNotes = new NoteCollection();
  },

  loadNotesPromise(dispute_guid, linkTo) {
    const dfd = $.Deferred();

    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:all notes`);
      return dfd.reject().promise();
    }
    const default_index = 0;
    const default_count = 999990;

    const params = $.param(_.extend({
      index: default_index,
      count: default_count
    }, linkTo ? { note_linked_to: linkTo } : {} ));

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_name}/${dispute_guid}?${params}`
    }).done(response => {
      this.allNotes.reset(response);
      dfd.resolve(this.allNotes);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  getAllNotes() {
    return this.allNotes;
  },

  addSavedNote(note_model) {
    this.getAllNotes().add(note_model, {merge: true, silent: true});
  },

  _filterNotes(filter_options) {
    filter_options = filter_options || {};

    const filteredNotes = this.allNotes.where(filter_options); 
    const filteredNoteCollection = new NoteCollection(_.map(filteredNotes, function(p) { return p.toJSON(); }));
    this.listenTo(filteredNoteCollection, 'update', function(collection) {
      // When this new collection is updated, make sure the master note collection is also updated
      this.allNotes.add(collection.filter(function(m) { return !m.isNew(); }), {merge: true});
    }, this);
    this.listenTo(filteredNoteCollection, 'destroy', function(model) {
      if (!model || !model.id) {
        console.log(`[Warning] Unable to remove a destroyed note model from master collection`);
        return;
      }

      // When a model is API destroyed, make sure the master note collection is also updated
      this.allNotes.remove( model );
    }, this);

    return filteredNoteCollection;
  },

  _filterWithEmptyLinkCheck(note_link_id, filter_options) {
    if (!note_link_id) {
      console.log(`[Warning] no link provided to notes call`, filter_options);
      return new NoteCollection();
    }
    return this._filterNotes(_.extend({ note_link_id }, filter_options));
  },

  getDisputeNotes() {
    return this._filterNotes({ note_linked_to: configChannel.request('get', 'NOTE_LINK_DISPUTE') });
  },

  getParticipantNotes(participant_id) {
    return this._filterWithEmptyLinkCheck(participant_id,
          { note_linked_to: configChannel.request('get', 'NOTE_LINK_PARTICIPANT') });
  },

  getClaimNotes(claim_id) {
    return this._filterWithEmptyLinkCheck(claim_id,
      { note_linked_to: configChannel.request('get', 'NOTE_LINK_CLAIM') });
  },

  getHearingNotes(hearing_id) {
    return this._filterWithEmptyLinkCheck(hearing_id,
      { note_linked_to: configChannel.request('get', 'NOTE_LINK_HEARING') });
  },

  getNoticeNotes(notice_id) {
    return this._filterWithEmptyLinkCheck(notice_id,
      { note_linked_to: configChannel.request('get', 'NOTE_LINK_NOTICE') });
  },

  getEvidenceNotes() {
    return this._filterNotes({ note_linked_to: configChannel.request('get', 'NOTE_LINK_EVIDENCE') });
  },

  getEvidenceFileNotes(file_id) {
    return this._filterWithEmptyLinkCheck(file_id, { note_linked_to: configChannel.request('get', 'NOTE_LINK_EVIDENCE_FILE') });
  },

  getDecisionFileNotes(file_id) {
    return this._filterWithEmptyLinkCheck(file_id, { note_linked_to: configChannel.request('get', 'NOTE_LINK_DECISION_FILE') });
  },

  getDisputeInfoNotes() {
    return this._filterNotes({ note_linked_to: configChannel.request('get', 'NOTE_LINK_DISPUTE_INFO') });
  },

  getDraftDisputeNote(disputeGuid) {
    if (!disputeGuid) return;
    return this.sessionDisputeNotes[disputeGuid];
  },

  saveDraftDisputeNote(disputeGuid, noteContent='') {
    if (!disputeGuid) return;
    this.sessionDisputeNotes[disputeGuid] = noteContent;
  },

  clearDraftNotes() {
    this.sessionDisputeNotes = {};
  },

});

_.extend(NotesManager.prototype, UtilityMixin);

const notesManagerInstance = new NotesManager();

export default notesManagerInstance;
