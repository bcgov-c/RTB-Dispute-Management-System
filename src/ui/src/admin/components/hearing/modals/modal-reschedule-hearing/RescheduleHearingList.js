import Marionette from 'backbone.marionette';
import RescheduleHearingsListItemView from './RescheduleHearingListItem';
import template from '../modal-add-hearing/AvailableHearingsList_template.tpl';

const EmptyAvailableHearingsListItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="addHearing-search-result">No available hearings</div>`)
});

const AvailableHearingsList = Marionette.CollectionView.extend({
  template: _.noop,
  className: 'addHearing-search-results-list',
  childView: RescheduleHearingsListItemView,
  emptyView: EmptyAvailableHearingsListItemView
});

export default Marionette.View.extend({
  template,

  regions: {
    listRegion: '.standard-list-items'
  },

  initialize(options) {
    this.mergeOptions(options, ['hearingModel', 'parentModalView']);
  },

  onRender() {
    const hearingModel = this.hearingModel;
    const parentModalView = this.parentModalView;
    this.showChildView('listRegion', new AvailableHearingsList({
      collection: this.collection,
      childViewOptions() {
        return { hearingModel, parentModalView };
      },
      viewComparator: 'local_start_datetime'
    }));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.length
    };
  }
});