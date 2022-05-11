/**
 * @class core.components.files.FileCollection
 * @memberof core.components.files
 * @augments Backbone.Collection
 */

import Backbone from 'backbone';
import FileModel from './File_model';

export default Backbone.Collection.extend({
  model: FileModel,

  getFileObjectPseudoId(fileObj) {
    return fileObj.name + fileObj.size;
  },

  isFileModelEqualToFileObject(file_obj_id, file_model) {
    return file_obj_id === file_model.get('file_name')+file_model.get('file_size') ||
        file_obj_id === file_model.get('original_file_name')+file_model.get('file_size');
  },

  hasFile(fileObj) {
    const file_obj_id = this.getFileObjectPseudoId(fileObj);
    return this.any(_.bind(this.isFileModelEqualToFileObject, this, file_obj_id));
  },

  // Returns one matching from the file object passed in
  getByFileObject(fileObj) {
    const file_obj_id = this.getFileObjectPseudoId(fileObj),
      matching_files = this.filter(_.bind(this.isFileModelEqualToFileObject, this, file_obj_id));
    return matching_files.length ? matching_files[0] : null;
  },

  hasUploaded() {
    return this.getUploaded().length > 0;
  },

  getUploaded() {
    return this.filter(function(file_model) {
      return file_model.isUploaded();
    });
  },

  getUploadedIntake() {
    return this.filter(fileModel => {
      if (!fileModel.isUploaded()) { return false; }
  
      const filePackage = fileModel.getFilePackage();
      return filePackage && filePackage.isIntake();
    });
  },

  resetCollection() {
    // Clears the file except for uploaded files
    this.reset(this.getUploaded());
    this.each(function(file_model) {
      file_model.set('disputeAccessSessionId', null);
    });
  },

  getReadyToUpload() {
    return this.filter(function(file_model) {
      return file_model.isReadyToUpload();
    });
  },

  deleteAll() {
    const dfd = $.Deferred();
    Promise.all(this.map(function(file) { return file.destroy(); }))
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },
});
