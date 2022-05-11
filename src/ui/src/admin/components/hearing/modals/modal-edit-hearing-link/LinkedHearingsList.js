import Marionette from 'backbone.marionette';
import LinkedHearingsListItem from './LinkedHearingsListItem';
import template from './LinkedHearingsList_template.tpl';

const EmptyAvailableHearingsList = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="editHearingLink-result">No linked applications</div>`)
});

const LinkedHearingsList = Marionette.CollectionView.extend({
  template: _.noop,
  className: 'editHearingLink-results-list',
  childView: LinkedHearingsListItem,
  emptyView: EmptyAvailableHearingsList,
  viewComparator(child) {
    return child.isPrimary() ? "1" : String(child.getFileNumber());
  }
});

export default Marionette.View.extend({
  template,

  className: 'addHearing-search-results',

  regions: {
    listRegion: '.standard-list-items'
  },

  onRender() {
    this.showChildView('listRegion', new LinkedHearingsList({ parent: this.getOption('parent'), collection: this.collection }));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.length
    };
  }
})