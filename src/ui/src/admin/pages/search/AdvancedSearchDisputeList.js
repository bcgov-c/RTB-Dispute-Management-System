import Marionette from 'backbone.marionette';
import SearchResultView from '../../components/search/SearchResult'

const EmptySearchView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class=""></div>`)
});

const SearchResultListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: SearchResultView,
  emptyView: EmptySearchView
});

export default Marionette.View.extend({
  template: _.template(`<div class="search-header"><%= searchType %></div><div class="search-result-items"></div>`),
  className: 'search-results-list',

  regions: {
    listRegion: '.search-result-items'
  },

  initialize(options) {
    _.extend(this.options, {}, options);
  },

  onRender() {
    this.showChildView('listRegion', new SearchResultListView(this.options));
  }, 

  templateContext() {
    return {
      searchType: this.getOption('searchType')
    }; 
  }
});
