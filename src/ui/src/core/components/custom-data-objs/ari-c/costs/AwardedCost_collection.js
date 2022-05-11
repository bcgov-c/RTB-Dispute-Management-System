import Backbone from 'backbone';
import AwardedCostModel from './AwardedCost_model';

export default Backbone.Collection.extend({
  model: AwardedCostModel,

  getLatestId() {
    const sorted = _.sortBy(_.map(this.models, model => model.getCostId()));
    console.log(sorted);
    return sorted.length ? sorted[0] : 1;
  },

  addFromRemedies(remedyIds) {
    if (!_.isArray(remedyIds)) {
      remedyIds = [remedyIds]
    }

    let latestId = this.getLatestId();
    _.each(remedyIds, remedyId => {
      this.add({
        [AwardedCostModel._costId]: latestId++,
        'remedy-remedy_id': remedyId,
        'local-units': []
      });
    });
  },

});