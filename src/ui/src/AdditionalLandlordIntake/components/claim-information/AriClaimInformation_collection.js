import Backbone from 'backbone';
import AriClaimInformationModel from './AriClaimInformation_model';

export default Backbone.Collection.extend({
  model: AriClaimInformationModel,

  isValid() {
    return (typeof this.validate() === 'undefined');
  },

  validate() {
    this.validationError = null;
  }

});
