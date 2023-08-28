/**
 * @class core.components.files.CommonFileCollection
 * @memberof core.components.files
 * @augments Backbone.Collection
 */

import FileCollection from './File_collection';
import CommonFileModel from './CommonFile_model';

export default FileCollection.extend({
  model: CommonFileModel,
  comparator: 'modified_date'
});
