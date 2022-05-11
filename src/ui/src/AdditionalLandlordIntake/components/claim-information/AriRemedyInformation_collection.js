import Backbone from 'backbone';
import AriRemedyInformationModel from './AriRemedyInformation_model';

export default Backbone.Collection.extend({
  model: AriRemedyInformationModel,

  getTotalAmount() {
    let total = 0;
    this.each(function(remedyInfoModel) {
      const amount = remedyInfoModel.getAmount();
      total += !amount ? 0 : amount;
    });
    return total;
  },

  isValid() {
    return (typeof this.validate() === 'undefined');
  },

  validate() {
    this.validationError = null;
  }

});
