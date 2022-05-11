import Marionette from 'backbone.marionette';
import StandardDashboardDisputeList from './StandardDashboardDisputeList';
import DashboardSearchListItemWithAssign from './DashboardSearchListItemWithAssign';

const StandardDashboardDisputeListWithAssign = StandardDashboardDisputeList.extend({
  childView: DashboardSearchListItemWithAssign,
});

export default Marionette.View.extend({ 
  template: _.template(`
    <% if (!hideSearchHeader) { %><div class="search-header">Viewing <%= collectionLength %>/<%= totalAvailable %> dispute<%=collectionLength === 1?'':'s'%><%= filterTitle ? ' - '+filterTitle : '' %> - listed by status date, oldest first</div><% } %>
    <div class="dispute-list-items"></div>
  `),
  className: 'dispute-list',

  regions: {
    disputeListRegion: '.dispute-list-items'
  },

  initialize(options) {
    this.mergeOptions(options, ['collection', 'showUnassignedOnly', 'showReassignButtons', 'hideSearchHeader']);
  },

  onRender() {
    const classToUse = this.showUnassignedOnly || this.showReassignButtons ? StandardDashboardDisputeListWithAssign : StandardDashboardDisputeList;
    this.showChildView('disputeListRegion', new classToUse({ collection: this.collection }));
  },

  templateContext() {
    const totalAvailable = this.collection.totalAvailable;
    const collectionLength = this.collection.length;

    return {
      // DMS- BUG NOTE: Disable for now until design in place
      //filterTitle: this.options.filterTitle,
      filterTitle: null,
      totalAvailable,
      collectionLength,
      hideSearchHeader: this.hideSearchHeader
    };
  }

});
