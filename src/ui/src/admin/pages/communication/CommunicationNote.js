import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalDeleteNote from '../../components/modals/modal-delete-note/ModalDeleteNote';
import NoteView from '../../components/note/Note';
import template from './CommunicationNote_template.tpl';

const disputeChannel = Radio.channel('dispute');
const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item communication-note-item',

  ui: {
    edit: '.comm-note-edit',
    delete: '.comm-note-delete',
  },

  regions: {
    noteEditRegion: '.comm-note-edit-region',
  },

  events: {
    'click @ui.edit' : 'clickEdit',
    'click @ui.delete': 'clickDelete'
  },

  clickEdit() {
    if (!this.getCanUserModifyNote()) return false;
    
    this.dispute.checkEditInProgressPromise().then(
      () => {
        this.dispute.startEditInProgress(this.model);
        this.model.set('mode', 'edit');
        this.render();
      },
      () => this.dispute.showEditInProgressModalPromise()
    );
  },

  clickDelete() {
    if (!this.getCanUserModifyNote()) return false;

    const modalDeleteNote = new ModalDeleteNote({ model: this.model });
    modalChannel.request('add', modalDeleteNote);
  },

  initialize() {
    this.model.set('deleteOnCancel', false);
    this.dispute = disputeChannel.request('get');
    this.NOTE_LINK_DISPLAY = configChannel.request('get', 'NOTE_LINK_DISPLAY');
    this.NOTE_CREATOR_ROLE_DISPLAY = userChannel.request('get:role:display', this.model.get('creator_group_role_id'));

    this.listenTo(this.model, 'hide:edit', () => {
      this.dispute.stopEditInProgress();
      this.model.resetModel();
      this.model.set('mode', 'view');
      this.render();
    });
  },

  getCanUserModifyNote() {
    const currentUser = sessionChannel.request('get:user');
    const isUserArb = currentUser.isArbitrator();
    const isNoteRoleArb = this.model.get('creator_group_role_id') === configChannel.request('get', 'USER_ROLE_GROUP_ARB');
    return !this.model.isDecision() && isNoteRoleArb && isUserArb;
  },

  onRender() {
    if (this.model.get('mode') === 'edit') {
      this.showChildView('noteEditRegion', new NoteView({
        model: this.model,
        displayRows: 3,
      }));
    }
  },

  templateContext() {
    return {
      Formatter,
      isDecisionNote: this.model.isDecision(),
      userCanModifyNote: this.getCanUserModifyNote(),
      linkToDisplay: this.model.getTypeDisplay(),
      noteCreatorRoleDisplay: this.NOTE_CREATOR_ROLE_DISPLAY ? this.NOTE_CREATOR_ROLE_DISPLAY : 'N/A',
    };
  }
});
