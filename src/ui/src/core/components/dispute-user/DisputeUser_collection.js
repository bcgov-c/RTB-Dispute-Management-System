
import Backbone from 'backbone';
import DisputeUserModel from './DisputeUser_model';

export default Backbone.Collection.extend({
  model: DisputeUserModel,
});
