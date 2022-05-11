import Marionette from 'backbone.marionette';

import DisputeOutcomeExternalFileView from './DisputeOutcomeExternalFile';

const EmptyDisputeOutcomeExternalFileView = Marionette.View.extend({
  template: _.template(`No external working files`),
  className: 'standard-list-empty'
});

export default Marionette.CollectionView.extend({
  template: _.noop,
  emptyView: EmptyDisputeOutcomeExternalFileView,
  childView: DisputeOutcomeExternalFileView,

  filter(model) {
    // Only show the external with a file uploaded
    return model.isExternal() && model.get('file_id');
  }
});
