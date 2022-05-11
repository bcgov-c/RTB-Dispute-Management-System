import Backbone from 'backbone';
import DisputeListItemModel from './DisputeListItem_model';

export default Backbone.Collection.extend({
  model: DisputeListItemModel,

  totalAvailable: null,
  lastUsedFetchIndex: null,
  lastUsedFetchCount: null,
});
