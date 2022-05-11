import Backbone from 'backbone';
import InternalUserProfileModel from './InternalUserProfile_model';

export default Backbone.Collection.extend({
  model: InternalUserProfileModel
});
