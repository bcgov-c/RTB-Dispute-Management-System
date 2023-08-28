/**
 * @fileoverview - Displays a collection of quick statuses
 */
import Marionette from 'backbone.marionette';
import QuickStatusItemView from './QuickStatusItem';
import template from './QuickStatus_template.tpl';

export default Marionette.View.extend({
  
  initialize(options) {
    this.mergeOptions(options, ['disputeModel']);
  },
  
  template,
  className: 'quickstatus-list',
  
  regions: {
    quickStatuses: '.quickstatus-options'
  },
  
  onRender() {
    this.showChildView('quickStatuses', new Marionette.CollectionView({
      childView: QuickStatusItemView,
      collection: this.collection,
      childViewOptions: {
        disputeModel: this.disputeModel
      }
    }));
  }
});