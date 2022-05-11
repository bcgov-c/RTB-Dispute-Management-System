import Backbone from 'backbone';

import SearchInstanceModel from './SearchInstance_model';

export default Backbone.Collection.extend({
  model: SearchInstanceModel,
  comparator: 'created_date'
});
