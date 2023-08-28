/**
 * @class core.components.files.file-package.FilePackageModel
 * @memberof core.components.files.file-package
 * @augments core.components.model.CMModel
 */

import CMModel from '../../model/CM_model';
import Radio from 'backbone.radio';
import FilePackageServiceModel from './FilePackageService_model';
import FilePackageServiceCollection from './FilePackageService_collection';

const api_name = 'filepackage';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantChannel = Radio.channel('participants');

export default CMModel.extend({
  idAttribute: 'file_package_id',
  defaults: {
    file_package_id: null,
    created_by_id: null,
    created_by_access_code: null,
    package_title: null,
    package_description: null,
    package_date: null,
    package_type: null,

    file_package_service: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },
  
  API_SAVE_ATTRS: [
    'created_by_id',
    'created_by_access_code',
    'package_title',
    'package_description',
    'package_date',
    'package_type'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${disputeChannel.request('get:id')}` : '');
  },

  nested_collections_data() {
    return {
      file_package_service: FilePackageServiceCollection
    };
  },

  getServices() {
    return this.get('file_package_service');
  },
  
  saveService() {
    const dfd = $.Deferred();
    Promise.all(this.getServices().map(function(model) {
      return model.save(model.getApiChangesOnly());
    })).then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  createPackageService(attrs) {
    return new FilePackageServiceModel(_.extend(attrs, {
      file_package_id: this.get('file_package_id')
    }, attrs));
  },

  resetPackageService() {
    const services = this.getServices();
    const toRemove = [];
    services.each(function(serviceModel) {
      if (serviceModel.isNew()) {
        toRemove.push(serviceModel);
      } else {
        serviceModel.resetModel();
      }
    });
    services.remove(toRemove);
  },

  isIntake() {
    return this.get('package_type') === configChannel.request('get', 'FILE_PACKAGE_TYPE_INTAKE');
  },

  isDisputeAccess() {
    return this.get('package_type') === configChannel.request('get', 'FILE_PACKAGE_TYPE_EVIDENCE');
  },

  isOffice() {
    return this.get('package_type') === configChannel.request('get', 'FILE_PACKAGE_TYPE_OFFICE');
  },

  isLegacySP() {
    return this.get('package_type') === configChannel.request('get', 'FILE_PACKAGE_TYPE_LEGACY_SP');
  },

  isCreatedByAccessCode() {
    return !!this.get('created_by_access_code');
  },

  getPackageCreatorParticipantModel() {
    let requestString = 'get:participant';
    let requestModelAttr = 'created_by_id';
    
    if (this.isCreatedByAccessCode()) {
      requestString = 'get:participant:by:accesscode';
      requestModelAttr = 'created_by_access_code';
    }
    return participantChannel.request(requestString, this.get(requestModelAttr));
  },

  isAssociatedToRespondent() {
    const participantModel = this.getPackageCreatorParticipantModel();
    return participantModel?.isRespondent();
  },

  isPackageCreatorDeleted() {
    const model = this.getPackageCreatorParticipantModel();
    return model && model.isDeleted();
  },

  isPackageCreatorRemoved() {
    const model = this.getPackageCreatorParticipantModel();
    return model && model.isRemoved();
  },

  isPackageCreatorAmendRemoved() {
    const model = this.getPackageCreatorParticipantModel();
    return model && model.isAmendRemoved();
  },

});
