
import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';
import FileCollection from '../../../core/components/files/File_collection';
import FileDescription_model from '../files/file-description/FileDescription_model';

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const sessionChannel = Radio.channel('session');
const participantsChannel = Radio.channel('participants');

export default CMModel.extend({
  defaults: {
    participant_id: null,
    is_served: null,
    service_method: null,
    service_date: null,
    service_comment: null,
    service_description: null,
    received_date: null,
    served_by: null,
    service_date_used: null,
    proof_file_description_id: null,
    other_proof_file_description_id: null,
    validation_status: null,
    archive_received_date: null,
    archive_served_by: null,
    archive_service_comment: null,
    archive_service_description: null,
    archive_service_date: null,
    archive_service_date_used: null,
    archive_service_method: null,

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
    'served_by',
    'service_comment',
    'service_description',
    'proof_file_description_id',
    'other_proof_file_description_id',
    'validation_status',
    'archived_by',
    'archive_service_method',
    'archive_service_date',
    'archive_received_date',
    'archive_service_date_used',
    'archive_served_by',
    'archive_service_comment',
    'archive_service_description',
  ],	

  isServed() {
    return this.get('is_served');
  },

  isNotServed() {
    return this.get('is_served') === false;
  },

  setToUnserved(attrs) {
    this.set(Object.assign({
      is_served: false,
      service_date: null, 
      service_method: null, 
      service_date_used: null, 
      received_date: null,
    }, 
    attrs));
  },

  // Deletes all files and sets fields to null and not served
  saveAsUnserved(attrs) {
    this.setToUnserved(attrs);
    return this.save(this.getApiChangesOnly());
  },

  resetValues() {
    this.set({
      is_served: null,
      service_method: null,
      service_date: null,
      service_comment: null,
      service_description: null,
      received_date: null,
      service_date_used: null,
      proof_file_description_id: null,
      other_proof_file_description_id: null,
      validation_status: null,
      archived_by: null,
      archive_service_method: null,
      archive_service_date: null,
      archive_received_date: null,
      archive_service_date_used: null,
      archive_served_by: null,
      archive_service_comment: null,
      archive_service_description: null,
    })
  },

  setToConfirmed() {
    this.set({ validation_status: configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_CONFIRMED') });
  },

  setToArchived() {
    const currentUser = sessionChannel.request('get:user');
    this.set({
      archived_by: currentUser.id,
      archive_service_method: this.get('service_method'),
      archive_service_date: this.get('service_date'),
      archive_received_date: this.get('received_date'),
      archive_service_date_used: this.get('service_date_used'),
      archive_served_by: this.get('served_by'),
      archive_service_comment: this.get('service_comment'),
      archive_service_description: this.get('service_description'),
      proof_file_description_id: null,
      other_proof_file_description_id: null,
      is_served: null,
      service_method: null,
      service_date: null,
      received_date: null,
      service_date_used: null,
      service_description: null,
      served_by: null,
    });
  },

  setToRefuted() {
    this.setToArchived();
    this.set({ validation_status: configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_REFUTED') });
  },

  setToReplaced() {
    this.setToArchived();
  },

  isServiceConfirmed() {
    return this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_EXTERNAL_CONFIRMED') || this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_CONFIRMED');
  },

  isServiceRefuted() {
    return this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_EXTERNAL_REFUTED') || this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_REFUTED');
  },

  isExternallyValidated() {
    return this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_EXTERNAL_CONFIRMED') || this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_EXTERNAL_REFUTED')
  },

  isInternallyValidated() {
    return this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_REFUTED') || this.get('validation_status') === configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_CONFIRMED')
  },

  setToAcknowledgedServed() {
    // Set to unserved first to null out all fields, 
    this.setToUnserved({
      is_served: true,
      validation_status: configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_CONFIRMED'),
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

  isServiceUnknown() {
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
    return (!this.isNew() && _.any(_.pick(apiData, fieldsToCheck))) || this.getProofFileModels().length;
  },

  hasServiceByLegacyMethod() {
    return this.get('service_method') === configChannel.request('get', 'ALL_SERVICE_METHODS')?.MAIL_SLOT || this.get('service_method') === configChannel.request('get', 'ALL_SERVICE_METHODS')?.FAX;
  },
  
  getServiceFileDescription() {
    return filesChannel.request('get:filedescription', this.get('proof_file_description_id'));
  },

  getOtherServiceFileDescription() {
    return filesChannel.request('get:filedescription', this.get('other_proof_file_description_id'));
  },

  getProofFileModels() {
    const fileModels = [];
    const fileDescription = this.getServiceFileDescription();
    if (!fileDescription) {
      return fileModels;
    }
    return filesChannel.request('get:filedescription:files', fileDescription).models;
  },

  getOtherProofFileModels() {
    const fileModels = [];
    const fileDescription = this.getOtherServiceFileDescription();
    if (!fileDescription) {
      return fileModels;
    }
    return filesChannel.request('get:filedescription:files', fileDescription).models;
  },

  createServiceFileDescription(data={}) {
    return new FileDescription_model(Object.assign({
      title: `Recorded Method Service Proof`,
      description_by: participantsChannel.request('get:primaryApplicant:id'),
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_SERVICE_EVIDENCE')
    },
      data?.title ? { description: data.title } : {},
      data
    ));
  },
  
  createOtherServiceFileDescription() {
    return this.createServiceFileDescription({ title: `Additional Method(s) Service Proof` });
  },

  // Always clear files on destroy
  destroy() {
    const dfd = $.Deferred();
    const self = this;
    (new FileCollection(this.getProofFileModels())).deleteAll()
      .done(() =>  CMModel.prototype.destroy.call(self).done(dfd.resolve).fail(dfd.reject) )
      .fail(dfd.reject);
    return dfd.promise();
  }

});
