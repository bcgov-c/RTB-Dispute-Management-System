import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ClaimInformationModel from './ClaimInformation_model';

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default Backbone.Collection.extend({
  model: ClaimInformationModel,

  _getTotalClaimsAmount(claimInfoModels) {
    let total = 0;
    (claimInfoModels || []).forEach(function(claimInfoModel) {
      const amount = claimInfoModel.getAmount();
      total += !amount ? 0 : amount;
    });
    return total;
  },

  // Only returns claims that have a limit
  getTotalLimitedClaimsAmount() {
    return this._getTotalClaimsAmount(this.filter(claimInfoModel => {
      const disputeClaim = claimInfoModel.get('disputeClaim');
      return !(disputeClaim && (disputeClaim.claimConfig || {}).noAmountLimit);
    }));
  },

  getTotalClaimsAmount() {
    return this._getTotalClaimsAmount(this.map(m => m));
  },

  hasMonetaryAmounts() {
    return this.any(function(model) { return model.get('useAmount'); });
  },

  isTotalOverLimit() {
    const total = this.getTotalLimitedClaimsAmount();
    return total > configChannel.request('get', 'CLAIM_TOTAL_LIMIT');
  },

  isValid() {
    return (typeof this.validate() === 'undefined');
  },

  validate() {
    this.validationError = null;

    if (this.isTotalOverLimit()) {
      this.validationError = `Specific amounts cannot exceed ${Formatter.toAmountDisplay(configChannel.request('get', 'CLAIM_TOTAL_LIMIT'), true)} total. See above errors.`;
      return this.validationError;
    }
  }

});
