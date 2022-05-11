import Backbone from 'backbone';
import CMSArchiveModel from './CMSArchive_model';

export default Backbone.Collection.extend({
  model: CMSArchiveModel
}, {
  DEFAULT_API_COUNT: 20
});
