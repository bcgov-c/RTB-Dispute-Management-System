import Backbone from 'backbone';
import EmailTemplateModel from './EmailTemplate_model';

export default Backbone.Collection.extend({
  model: EmailTemplateModel,
  comparator: 'assigned_template_id',
});
