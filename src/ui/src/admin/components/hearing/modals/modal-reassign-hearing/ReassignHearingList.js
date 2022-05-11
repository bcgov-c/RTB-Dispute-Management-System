import Marionette from 'backbone.marionette';
import ReassignHearingListItemView from './ReassignHearingListItem';
import template from './ReassignHearingList_template.tpl';

const EmptyHearingResultsListItem = Marionette.View.extend({
  template: _.template(`<div class="">No matching hearings are available for reassignment</div>`),
  className: 'standard-list-empty'
});

export default Marionette.View.extend({
  template,
  className: 'reassignHearing-search-results',

  regions: {
    listRegion: '.standard-list-items'
  },

  initialize(options) {
    this.mergeOptions(options, ['filterFn', 'hearingModel', 'allAvailableHearings']);
  },

  onRender() {
    const hearingModel = this.hearingModel;
    const allAvailableHearings = this.allAvailableHearings;

    this.showChildView('listRegion', new Marionette.CollectionView({
      template: _.noop,
      childView: ReassignHearingListItemView,
      emptyView: EmptyHearingResultsListItem,
      filter: this.filterFn,
      allAvailableHearings: this.allAvailableHearings,

      viewComparator: 'local_start_datetime',

      childViewOptions() {
        return { hearingModel, allAvailableHearings };
      },
      collection: this.collection
    }));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.any(this.filterFn, this)
    };
  }
});