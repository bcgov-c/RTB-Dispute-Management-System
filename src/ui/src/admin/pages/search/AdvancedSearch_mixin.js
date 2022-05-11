import Marionette from 'backbone.marionette';

export default Marionette.View.extend({
  // This should be overriden by mixed-in class
  searchByRequest() {
    console.log(`[Warning] Missing searchByRequest function for AdvancedSearch`);
  },

  addEnterListener(regionObject, actionFn) {
    if (regionObject && regionObject.currentView) {
      this.stopListening(regionObject.currentView, 'input:enter');
      this.listenTo(regionObject.currentView, 'input:enter', actionFn, this);
    }
  },

  addRemoveErrorStylesListener(regionObject, linkedRegionsToClear) {
    if (!_.isArray(linkedRegionsToClear)) {
      linkedRegionsToClear = linkedRegionsToClear ? [linkedRegionsToClear] : [];
    }

    if (regionObject && regionObject.currentView && regionObject.currentView.model) {
      this.stopListening(regionObject.currentView, 'change:value');
      this.listenTo(regionObject.currentView.model, 'change:value', function() {
        _.each(linkedRegionsToClear, function(linkedRegion) {
          if (linkedRegion && linkedRegion.currentView && _.isFunction(linkedRegion.currentView.removeErrorStyles)) {
            linkedRegion.currentView.removeErrorStyles();
          }
        });
      }, this);
    }
  }
});