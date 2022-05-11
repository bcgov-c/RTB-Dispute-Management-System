import Marionette from 'backbone.marionette';
import SearchResultCMSView from '../../components/cms/SearchResultCMS';
import AdvancedSearchDisputeList from '../search/AdvancedSearchDisputeList';

const EmptySearchView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class=""></div>`)
});

const SearchResultCMSListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: SearchResultCMSView,
  emptyView: EmptySearchView
});

export default AdvancedSearchDisputeList.extend({
  onRender() {
    this.showChildView('listRegion', new SearchResultCMSListView(this.options));
  },
});