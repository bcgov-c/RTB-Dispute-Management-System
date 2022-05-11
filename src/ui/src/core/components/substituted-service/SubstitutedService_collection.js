import Backbone from 'backbone';
import SubstitutedServiceModel from './SubstitutedService_model';

export default Backbone.Collection.extend({
  model: SubstitutedServiceModel,

  comparator(model) {
    return -model.get('sub_service_id');
  }
});
