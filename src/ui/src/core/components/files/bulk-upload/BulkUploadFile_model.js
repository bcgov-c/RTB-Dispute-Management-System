/**
 * Wrapper Backbone.Model for passing data to file upload component
 */

import Backbone from 'backbone';
import File_collection from '../File_collection';

export default Backbone.Model.extend({
  defaults: {
    title: null,

    // If provided, will associate any uploaded files with the file description
    fileDescriptionModel: null,

    // Existing uploaded or added Files
    files: null,

    // Represents an underlying data save model - not usually used by BulkUploadsFiles view, but can be used by a caller
    dataModel: null,
  },

  initialize() {
    if (!this.get('files')) {
      this.set('files', new File_collection());
    }
  },

});