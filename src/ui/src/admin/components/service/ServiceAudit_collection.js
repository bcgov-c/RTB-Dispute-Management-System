import Backbone from 'backbone';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import ServiceAudit_model from './ServiceAudit_model';

export default Backbone.Collection.extend({
  model: ServiceAudit_model,
  comparator: UtilityMixin.util_reverseSortBy((m) => m.id||Number.MIN_SAFE_INTEGER),
});
