import Backbone from 'backbone';
import Radio from 'backbone.radio';

const claimsChannel = Radio.channel('claims');

export default Backbone.Model.extend({
  /*
  Data fields=>
  "local-application_capital_costs": [
		{
			"local-capital_cost_id": 1,
			"remedy-remedy_id": 32478,
			"local-units": [1,2,3]
		}
  ],
  */

  getCostId() {
    return this.get('local-capital_cost_id');
  },

  getRemedyId() {
    return this.get('remedy-remedy_id');
  },

  getRemedyModel() {
    return claimsChannel.request('get:remedy', this.getRemedyId());
  },

  getUnitIds() {
    return this.get('local-units') || [];
  },

  addUnit(unitId) {
    if (!this.hasUnit(unitId)) {
      this.set('local-units', [...this.getUnitIds(), unitId]);
    }
  },

  removeUnit(unitId) {
    this.set('local-units', _.filter(this.getUnitIds(), _unitId => _unitId !== unitId));
  },

  hasUnit(unitId) {
    return _.contains(this.getUnitIds(), unitId);
  }
});