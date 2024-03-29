
import CMModel from '../../../core/components/model/CM_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const notesChannel = Radio.channel('notes');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const noticeChannel = Radio.channel('notice');
const hearingChannel = Radio.channel('hearings');

const api_name = 'note';
export default CMModel.extend({
  idAttribute: 'note_id',
  defaults: {
    note_id: null,
    note_type: 0, // Deprecated field for RTB, but always required
    note_linked_to: null,
    note_link_id: null,
    note: null,

    created_date: null,
    modified_date: null,
    created_by: null,
    creator_group_role_id: null,
    modified_by: null,

    // UI-only attributes
    mode: 'view',
    deleteOnCancel: true,
    editDisabled: false
  },

  API_SAVE_ATTRS: [
    'note_type',
    'note_linked_to',
    'note_link_id',
    'note'
  ],

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  save(attrs, options) {
    options = options || {};
    
    const dfd = $.Deferred(),
      self = this;
    CMModel.prototype.save.call(this, attrs, options).done(function(response) {
      notesChannel.request('add:saved:note', self);
      dfd.resolve(response);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  isDecision() {
    return this.get('note_linked_to') && String(this.get('note_linked_to')) === String(configChannel.request('get', 'NOTE_LINK_DECISION_FILE'));
  },

  getLinkedModel() {
    if (this.get('note_linked_to') === configChannel.request('get', 'NOTE_LINK_PARTICIPANT')) {
      return participantsChannel.request('check:id', this.get('note_link_id'));
    } else if (this.get('note_linked_to') === configChannel.request('get', 'NOTE_LINK_CLAIM')) {
      return claimsChannel.request('get:claim', this.get('note_link_id'), { no_removed: true });
    } else if (this.get('note_linked_to') === configChannel.request('get', 'NOTE_LINK_NOTICE')) {
      return noticeChannel.request('get:by:id', this.get('note_link_id'));
    } else if (this.get('note_linked_to') === configChannel.request('get', 'NOTE_LINK_HEARING')) {
      return hearingChannel.request('get:hearing', this.get('note_link_id'));
    }
    return null;
  },

  getTypeDisplay() {
    const NOTE_LINK_DISPLAY = configChannel.request('get', 'NOTE_LINK_DISPLAY') || {};
    const linkCanBeRemoved = [
      configChannel.request('get', 'NOTE_LINK_PARTICIPANT'),
      configChannel.request('get', 'NOTE_LINK_CLAIM'),
      configChannel.request('get', 'NOTE_LINK_NOTICE'),
      configChannel.request('get', 'NOTE_LINK_HEARING')
    ].includes(this.get('note_linked_to'));

    return `${linkCanBeRemoved && this.get('note_link_id') && !this.getLinkedModel() ? 'Removed ' : ''
      }${NOTE_LINK_DISPLAY[this.get('note_linked_to')]}`;

  },

});
