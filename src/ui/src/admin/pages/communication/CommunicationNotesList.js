import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CommunicationNoteView from './CommunicationNote';
import template from './CommunicationNotesList_template.tpl';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');

const EmptyNoteListView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No notes have been added</div>`)
});

const filterUsersFn = function(model) {
  const types = (this.typeFilter.getSelectedOption() || {}).typeFilters;
  const role = String(this.creatorFilter.get('value'));

  let doesTypeMatch = Array.isArray(types) && types.indexOf(model.get('note_linked_to')) !== -1;
  // Add a special handling for evidence to also include decision notes
  if (Array.isArray(types) && types.length && types[0] === configChannel.request('get', 'NOTE_LINK_EVIDENCE')) {
    doesTypeMatch = doesTypeMatch || (
      model.get('note_linked_to') && model.get('note_linked_to') === configChannel.request('get', 'NOTE_LINK_DECISION_FILE')
    );
  }
  return doesTypeMatch && (role !== 'all' ? String(model.get('creator_group_role_id')) === role : true);
};
const CommunicationNotesListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CommunicationNoteView,
  emptyView: EmptyNoteListView,

  initialize(options) {
    this.mergeOptions(options, ['typeFilter', 'creatorFilter']);
  },

  filter: filterUsersFn
});

export default Marionette.View.extend({
  template,
  className: 'standard-list',

  regions: {
    notesList: '.standard-list-items'
  },

  initialize(options) {
    _.extend(this.options, {}, options);
    this.mergeOptions(options, ['typeFilter', 'creatorFilter']);

    const dispute = disputeChannel.request('get');
    const handleFilterChangeWithEditCheck = (model, value) => {
      const prevValue = model.previous('value');
      const performChangeFn = () => {
        model.set('value', value, { silent: true });
        model.trigger('render');
        this.render();
      };
      dispute.checkEditInProgressPromise().then(
        performChangeFn,
        () => {
          model.set('value', prevValue, { silent: true });
          model.trigger('render');
          dispute.showEditInProgressModalPromise(true).then(isAccepted => {
            if (isAccepted) {
              dispute.stopEditInProgress();
              const noteInProgress = this.collection.find(note => !note.isNew() && note.get('mode') === 'edit');
              if (noteInProgress) {
                noteInProgress.resetModel();
                noteInProgress.set('mode', 'view');
              }
              performChangeFn();
            }
          });
      });
    };
    this.listenTo(this.typeFilter, 'change:value', handleFilterChangeWithEditCheck);
    this.listenTo(this.creatorFilter, 'change:value', handleFilterChangeWithEditCheck);
  },

  onRender() {
    this.showChildView('notesList', new CommunicationNotesListView(this.options));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.any(filterUsersFn, this)
    };
  }
});
