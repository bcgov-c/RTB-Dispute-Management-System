import Marionette from 'backbone.marionette';

import HistoryItemView from './HistoryItem';
import template from './HistoryList_template.tpl';

const EmptyHistoryItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No dispute status changes have occurred.</div>`)
});

const HistoryItemsView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: HistoryItemView,
  emptyView: EmptyHistoryItemView,
});

export default Marionette.View.extend({
  template,
  className: 'standard-list',

  regions: {
    historyList: '.standard-list-items'
  },

  initialize(options) {
    this.options = options;
  },

  onRender() {
    this.showChildView('historyList', new HistoryItemsView(this.options));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.length
    };
  }
});