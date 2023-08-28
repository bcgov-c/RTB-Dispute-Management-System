import Marionette from 'backbone.marionette';
import NoteView from './Note';

export default Marionette.CollectionView.extend({
  template: _.noop,
  className: 'notes-list-container',
  childView: NoteView
});
