import Marionette from 'backbone.marionette';
import AvailableHearingsListItem from './AvailableHearingsListItem';
import template from './AvailableHearingsList_template.tpl';

const EmptyAvailableHearingsList = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="addHearing-search-result">No available hearings</div>`)
});

export default Marionette.View.extend({
  template,

  regions: {
    listRegion: '.standard-list-items'
  },

  initialize(options) {
    this.mergeOptions(options, ['hearingModel']);
  },

  onRender() {
    const hearingModel = this.hearingModel;
    this.showChildView('listRegion', new Marionette.CollectionView({
      template: _.noop,
      className: 'addHearing-search-results-list',
      childView: AvailableHearingsListItem,
      emptyView: EmptyAvailableHearingsList,
      
      viewComparator: 'local_start_datetime',
      
      childViewOptions() {
        return { hearingModel };
      },
      filter(child) {
        return child.get('hearing_id') !== hearingModel.get('hearing_id');
      },
      collection: this.collection,

      onChildviewClearListView() {
        this.destroy();
      }
    }));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.length
    };
  }
})