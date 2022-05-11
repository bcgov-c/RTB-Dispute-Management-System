
import Backbone from 'backbone';
import UserRoleModel from './UserRole_model';

export default Backbone.Collection.extend({
  model: UserRoleModel,
  user_id: null,

  inititialize(options) {
    if (options && options.user_id) {
      this.user_id = options.user_id;
    }

    if (!this.user_id) {
      console.log(`[Warning] No user id passed to UserRoleCollection`);
    }
  },

  getActive() {
    if (this.length) {
      return this.at(0);
    }
    const added_model = new UserRoleModel({ user_id: this.user_id });
    this.add(added_model);
    return added_model;
  }
});
