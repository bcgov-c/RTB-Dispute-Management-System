import Backbone from 'backbone';
import ReportModel from './Report_model';

export default Backbone.Collection.extend({
  model: ReportModel,
  comparator: 'title',
});
