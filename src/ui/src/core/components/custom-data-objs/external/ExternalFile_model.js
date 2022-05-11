import FileModel from '../../files/File_model';

export default FileModel.extend({
  idAttribute: 'external_file_id',
  defaults() {
    return Object.assign({}, FileModel.prototype.defaults, {
      external_file_id: null,
      external_file_guid: null,
      external_custom_data_object_id: null,
    });
  },
});
