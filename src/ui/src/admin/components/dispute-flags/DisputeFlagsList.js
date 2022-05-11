import Marionette from 'backbone.marionette';
import DisputeFlag from './DisputeFlag';

const EmptyView = Marionette.View.extend({
  template: _.template(``),
  className: 'standard-list-empty'
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  childView: DisputeFlag,
  emptyView: EmptyView,
});