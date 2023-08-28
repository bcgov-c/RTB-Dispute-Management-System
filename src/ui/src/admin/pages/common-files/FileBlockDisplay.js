import Marionette from 'backbone.marionette';
import FileDisplayView from './FileDisplay';

const EmptyFileView = Marionette.View.extend({
  template: _.template(`<div class="standard-list-empty">No Files added</div>`)
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: FileDisplayView,
  emptyView: EmptyFileView,
  className: 'file-block',

  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'showEdit', 'showInfo', 'showDelete', 'showModelType', 'editModalTitle']);
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.collection, "page:refresh", () => {
      this.model.trigger('page:refresh');
    });
  },

  childViewOptions(child, index) {
    return {
      showThumbnails: this.showThumbnails,
      showModelType: this.showModelType,
      showEdit: this.showEdit,
      showInfo: this.showInfo,
      showDelete: this.showDelete,
      editModalTitle: this.editModalTitle,
      collection: this.collection,
      childIndex: index,
      collectionLength: _.isFunction(this.filter) ? this.collection.filter(this.filter).length : this.collection.length
    }
  },
});
