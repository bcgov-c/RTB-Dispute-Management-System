import Marionette from 'backbone.marionette';
import SearchResult from '../../components/search/SearchResult';

const EmptySearchView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class=""></div>`)
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: SearchResult,
  emptyView: EmptySearchView,

  childViewOptions() {
    return { collection: this.collection };
  }
});