import CostModel from './Cost_model';

const costIdFieldAttr = 'local-awarded_cost_id';

export default CostModel.extend({
  /*
  Data fields=>
  "local-awarded_capital_costs": [
		{
			"local-awarded_cost_id": 1,
			"remedy-remedy_id": 32478,
			"local-units": [1,2]
		}
  */
  getCostId() {
    return this.get(costIdFieldAttr);
  }
}, {
  _costId: costIdFieldAttr
});