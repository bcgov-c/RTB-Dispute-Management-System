import Marionette from 'backbone.marionette';
import QuickStatusItemView from './QuickStatusItem';
import template from './QuickStatus_template.tpl';

export default Marionette.View.extend({
  template,
  className: 'quickstatus-list',
  
  regions: {
    quickStatuses: '.quickstatus-options'
  },
  
  onRender() {
    this.showChildView('quickStatuses', new Marionette.CollectionView({
      childView: QuickStatusItemView,
      collection: this.collection
    }));
  }
});