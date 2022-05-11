import Backbone from 'backbone';
import UserModel from './User_model';

const SORT_BOTTOM_PREFIX = 'zzzzz';

export default Backbone.Collection.extend({
  model: UserModel,

  comparator(model) {
    if (model.isSystemArbitrator()) {
      // Always sort system arbitrator to the bottom of the list
      return SORT_BOTTOM_PREFIX;
    }
    return (model.getDisplayName() || '').toLowerCase() || `${SORT_BOTTOM_PREFIX}${model.id}`;
  }
});
