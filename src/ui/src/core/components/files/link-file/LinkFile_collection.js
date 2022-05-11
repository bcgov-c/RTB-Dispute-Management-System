/**
 * @class core.components.files.link-file.LinkFileCollection
 * @memberof core.components.files.link-file
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import LinkFileModel from './LinkFile_model';
export default Backbone.Collection.extend({
  model: LinkFileModel
});
