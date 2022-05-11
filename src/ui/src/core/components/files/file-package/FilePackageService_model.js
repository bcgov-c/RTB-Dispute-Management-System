import Radio from 'backbone.radio';
import FileDescriptionModel from '../../files/file-description/FileDescription_model';
import ServiceModel from '../../service/Service_model';

const api_name = 'filepackageservice';

const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

export default ServiceModel.extend({
  idAttribute: 'file_package_service_id',

  defaults() {
    return Object.assign({}, ServiceModel.prototype.defaults, {
      file_package_service_id: null,
      file_package_id: null,
      other_participant_name: null,
      other_participant_role: null,
      other_participant_title: null,
      served_by: null
    });
  },
  
  API_POST_ONLY_ATTRS: [
    'file_package_id',
    'participant_id'
  ],
  
  API_SAVE_ATTRS: [
    ...(ServiceModel.prototype.API_SAVE_ATTRS || []),
    'other_participant_name',
    'other_participant_role',
    'other_participant_title',
    'served_by'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${ this.isNew() ? this.get('file_package_id') : '' }`;
  },

  createPackageServiceFileDescription() {
    return new FileDescriptionModel({
      title: `Evidence Service Proof - Uploaded ${Formatter.toDateDisplay(Moment())}`,
      description: `Proof of Evidence Service Files`,
      description_by: participantsChannel.request('get:primaryApplicant:id'),
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_SERVICE_EVIDENCE')
    });
  }

});
