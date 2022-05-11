
import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';
import FileCollection from '../../../core/components/files/File_collection';

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');

export default CMModel.extend({
  defaults: {
    participant_id: null,
    is_served: null,
    service_method: null,
    service_date: null,
    service_comment: null,
    received_date: null,
    service_date_used: null,
    proof_file_description_id: null,

    modified_date: null,
    modified_by: null,
    created_date: null,
    created_by: null
	},

  API_SAVE_ATTRS: [
    'participant_id',
    'is_served',
    'service_method',
    'service_date',
    'service_date_used',
    'received_date',
    'service_comment',
    'proof_file_description_id'
  ],	

  isServed() {
    return this.get('is_served');
  },

  setToUnserved(attrs, options={}) {
    this.set(Object.assign({
      is_served: false,
      service_date: null, 
      service_method: null, 
      service_date_used: null, 
      received_date: null,
    }, options.preserve_files ? {} : { proof_file_description_id: null },
    attrs));
  },

  // Deletes all files and sets fields to null and not served
  saveAsUnserved(attrs) {
    this.setToUnserved(attrs);
    return this.save(this.getApiChangesOnly());
  },

  setToAcknowledgedServed() {
    // Set to unserved first to null out all fields, 
    this.setToUnserved({
      is_served: true,
      service_date_used: configChannel.request('get', 'SERVICE_DATE_USED_ACKNOWLEDGED_SERVED')
    }, { preserve_files: false });
  },

  isAcknowledgedServed() {
    return this.get('is_served') &&
      this.get('service_date_used') && 
      String(this.get('service_date_used')) === String(configChannel.request('get', 'SERVICE_DATE_USED_ACKNOWLEDGED_SERVED') || '');
  },

  isDeemedServed() {
    return this.get('is_served') &&
      this.get('service_date_used') && 
      String(this.get('service_date_used')) === String(configChannel.request('get', 'SERVICE_DATE_USED_DEEMED_SERVED') || '');
  },

  isServiceUnkown() {
    return this.get('is_served') === null || this.get('is_served') === undefined;
  },

  isServiceMethodOther() {
    const ALL_SERVICE_METHODS = configChannel.request('get', 'ALL_SERVICE_METHODS') || {};
    return this.get('service_method') === ALL_SERVICE_METHODS.OTHER;
  },

  hasSavedApiData(fieldsToCheck) {
    fieldsToCheck = fieldsToCheck || ['is_served'];
    
    const apiData = this.getApiSnapshotOfData();
    
    // Consider the service model as having saved data when it's saved to API with is_served = true
    // OR any files have been associated to it
    return (!this.isNew() && _.any(_.pick(apiData, fieldsToCheck))) || this.getServiceFileModels().length;
  },
  
  getServiceFileDescription() {
    return filesChannel.request('get:filedescription', this.get('proof_file_description_id'));
  },

  getServiceFileModels() {
    const fileModels = [];
    const fileDescription = this.getServiceFileDescription();
    if (!fileDescription) {
      return fileModels;
    }
    return filesChannel.request('get:filedescription:files', fileDescription).models;
  },

  // Always clear files on destroy
  destroy() {
    const dfd = $.Deferred();
    const self = this;
    (new FileCollection(this.getServiceFileModels())).deleteAll()
      .done(() =>  CMModel.prototype.destroy.call(self).done(dfd.resolve).fail(dfd.reject) )
      .fail(dfd.reject);
    return dfd.promise();
  }

});
