import Backbone from 'backbone';
import EmailAttachmentModel from './EmailAttachment_model';

export default Backbone.Collection.extend({
  model: EmailAttachmentModel,
});
