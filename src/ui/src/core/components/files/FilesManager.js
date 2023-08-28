/**
 * @namespace core.components.files.FilesManager
 * @memberof core.components.files
 * @fileoverview - Manager that handles file related functionality. This includes handling of Files, LinkFiles, FileDescription, FilePackages, and file downloads
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import FileUploader from './file-upload/FileUploader';
import FileCollection from './File_collection';
import FileDescriptionCollection from './file-description/FileDescription_collection';
import FileDescriptionModel from './file-description/FileDescription_model';
import LinkFileCollection from './link-file/LinkFile_collection';
import FilePackageCollection from './file-package/FilePackage_collection';
import FilePackageModel from './file-package/FilePackage_model';
import LinkFileModel from './link-file/LinkFile_model';
import FileModel from './File_model';
import CommonFileModel from './CommonFile_model';
import CommonFileCollection from './CommonFile_collection';
import { ModalFileViewer } from '../file-viewer/ModalFileViewer';
import UtilityMixin from '../../../core/utilities/UtilityMixin';

const api_load_files = 'disputefiles';
const api_load_file_descriptions = 'disputefiledescriptions';
const api_load_link_files = 'disputelinkfiles';
const api_load_file_packages = 'disputefilepackages';
const api_save_file = 'file-upload';
const api_upload_pdf = 'file/PDFfromhtml';
const api_common_files = 'commonfiles';
const api_external_load_common_files = 'externalcommonfiles';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');
const modalChannel = Radio.channel('modals');
const disputeChannel = Radio.channel('dispute');
const claimsChannel = Radio.channel('claims');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

const default_index_count = {
  index: 0,
  count: 999999
};
const default_large_query_params = $.param(default_index_count);

/* Add global handling for duplicate files */
const filenameDupClass = 'dispute-filename-dup';
const filenameDupSelector = `.${filenameDupClass}`;
/**
 *  A global listener on <body> for the designated class to be clicked.
 */
$(document).ready(function() {
  $('body').off('click.dupfile', filenameDupSelector);
  $('body').on('click.dupfile', filenameDupSelector, function() {
    const ele = $(this);
    const activeDup = !ele.hasClass('active') ? ele.data('dupId') : null;
    
    // Clear all "active" styles
    $(filenameDupSelector).removeClass('active');
    
    if (activeDup) {
      $(`${filenameDupSelector}[data-dup-id=${activeDup}]`).addClass('active');
    }
  });
});
/* Add global handling for duplicate files */

const FilesManager = Marionette.Object.extend({
  /**
   * @class core.components.files.FilesManagerClass
   * @memberof core.components.files
   * @augments Marionette.Object
   */

 /** @constructor */
 initialize() {
   this.cached_data = {};
   // These will be re-initialized once loaded
   this.disputeFiles = new FileCollection();
   this.disputeFileDescriptions = new FileDescriptionCollection();
   this.disputeLinkFiles = new LinkFileCollection();
   this.disputeFilePackages = new FilePackageCollection();

   // Common files are not associated to a dispute, and so do not need to be cached
   this.commonFiles = new CommonFileCollection();
 },

  channelName: 'files',

  radioRequests: {
    'is:file:linked:to:removed': 'isFileAssociatedToRemovedClaim',

    'create:uploader': 'createFileUploader',
    'create:linkfile': 'createLinkFile',
    'create:filepackage:intake': 'createIntakeFilePackage',
    'create:filepackage:disputeaccess': 'createDisputeAccessFilePackage',
    'create:filepackage:office': 'createOfficeSubmissionFilePackage',
    'create:file:common': 'createCommonFilePromise',

    'add:file': 'addUploadedFile',
    'upload:pdf' : 'uploadPDF',
    'remove:file': 'removeUploadedFile',

    'add:filedescription': 'addFileDescription',

    load: 'loadFullDisputeFiles',
    'load:files': 'loadDisputeFiles',
    'load:filedescriptions': 'loadDisputeFileDescriptions',
    'load:linkfiles': 'loadDisputeLinkFiles',
    'load:filepackages': 'loadDisputeFilePackages',
    'load:disputeaccess': 'loadFromDisputeAccessResponse',
    'load:commonfiles': 'loadCommonFiles',
    'load:commonfiles:external': 'loadExternalCommonFiles',

    'get:fileupload:url': 'getFileUploadUrl',
    'get:commonfileupload:url': 'getCommonFileUrl',
    'get:commonfiles': 'getCommonFiles',
    'get:commonfile': 'getCommonFile',
    'get:base64commonfile:url': 'getBase64CommonFile',
    'get:duplicate:translations': 'getDuplicateFileModelTranslations',

    'get:file': 'getFile',
    'get:files': 'getDisputeFiles',
    'get:filedescription': 'getDisputeFileDescription',
    'get:filedescriptions': 'getDisputeFileDescriptions',
    'get:filedescriptions:claimless': 'getDisputeFileDescriptionsWithNoClaim',
    'get:filedescription:code': 'getFileDescriptionFromCode',
    'get:filedescription:from:file': 'getFileDescriptionFromFile',
    'get:filedescriptions:code': 'getAllFileDescriptionsFromCode',
    'get:filedescriptions:category': 'getFileDescriptionsFromCategory',
    'get:filedescriptions:from:file': 'getFileDescriptionsFromFile',
    'get:filedescriptions:claim': 'getDisputeFileDescriptionsForClaim',
    'get:filedescription:files': 'getFilesForFileDescription',
    'get:filepackage:intake': 'getIntakeFilePackage',
    'get:filepackages': 'getDisputeFilePackages',
    'get:filepackage': 'getFilePackage',
    'get:filedescriptions:deficient': 'getDeficientFileDescriptions',

    'update:filedescriptions:deficient': 'updateLoadedFileDescriptions',

    'delete:file': 'deleteFileAndLinkFiles',
    'delete:filedescription:full': 'deleteFilesAndLinksAndFileDescription',

    'download:files': 'downloadBulkFiles',
    'show:download:modal': 'showDownloadModal',
    'show:upload:error:modal': 'showUploadErrorModal',
    'show:preview:modal': 'showPreviewModal',
    'show:file:preview:modal': 'showFilePreviewModal',
    'click:filename:preview': 'clickPreviewableFilename',
    'download:html': 'downloadHtmlAsFile',
    'download:csv': 'downloadCsvFile',
    'download:file': 'downloadFile',

    'update:filepackage:service': 'fillFilePackageService',
    'has:duplicate:file': 'checkForDuplicateFiles',
    'has:category': 'checkForFileDescriptionCategory',

    'clear': 'clearCache',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  clearCache() {
    
  },


  /**
   * Saves current files data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this FilessManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached files data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.disputeFiles = cache_data.disputeFiles;
    this.disputeFileDescriptions = cache_data.disputeFileDescriptions;
    this.disputeLinkFiles = cache_data.disputeLinkFiles;
    this.disputeFilePackages = cache_data.disputeFilePackages;

    this.disputeDeficientDocuments = cache_data.disputeDeficientDocuments;
  },

  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      disputeFiles: this.disputeFiles,
      disputeFileDescriptions: this.disputeFileDescriptions,
      disputeLinkFiles: this.disputeLinkFiles,
      disputeFilePackages: this.disputeFilePackages,
      disputeDeficientDocuments: this.disputeDeficientDocuments
    };
  },


  // Creates a FileUploader object on the page
  createFileUploader(file_uploader_options) {
    return new FileUploader(file_uploader_options);
  },


  loadFullDisputeFiles(dispute_guid, options={}) {
    return $.whenAll(
      this.loadDisputeFiles(dispute_guid, options),
      this.loadDisputeFileDescriptions(dispute_guid, options),
      this.loadDisputeLinkFiles(dispute_guid, options),
      this.loadDisputeFilePackages(dispute_guid, options)
    );
  },

  loadDisputeFilePackages(dispute_guid, options={}) {
    const dfd = $.Deferred();
    
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_file_packages}/${dispute_guid}?${default_large_query_params}`
    }).done(response => {
      if (options.no_cache) {
        return dfd.resolve(new FilePackageCollection(response));
      } else {
        this.disputeFilePackages = new FilePackageCollection(response);
        // Filter out any removed participants
        this.disputeFilePackages.each(filePackage => {
          const services = filePackage.getServices();
          const servicesToRemove = services.filter(model => !participantsChannel.request('check:id', model.get('participant_id')));
          services.remove(servicesToRemove, { silent: true });
        });
        dfd.resolve(this.disputeFilePackages);
      }
    }).fail(dfd.reject);

    return dfd.promise();
  },

  loadDisputeFiles(dispute_guid, options={}) {
    const dfd = $.Deferred();
    const params = $.param(Object.assign(
      options.FileTypes ? { FileTypes: options.FileTypes } : {},
      default_index_count,
    ), true);
    
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_files}/${dispute_guid}?${params}`
    }).done(response => {
      response.files = response ? response.files : [];
      const fileCollection = new FileCollection(_.map(response.files, function(file_response) {
        return _.extend(file_response, { upload_status: 'uploaded' });
      }));
      if (!options.no_cache) this.disputeFiles = fileCollection;
      dfd.resolve(fileCollection);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadDisputeFileDescriptions(disputeGuid, options={}) {
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_file_descriptions}/${disputeGuid}?${default_large_query_params}`
    }).done(response => {
      response.file_descriptions = response ? response.file_descriptions : [];
      
      const deficientPredicateFn = (fileDescriptionData) => fileDescriptionData.is_deficient;
      if (!options?.no_cache) {
        this.disputeDeficientDocuments = new FileDescriptionCollection(_.filter(response.file_descriptions, deficientPredicateFn));
        this.disputeFileDescriptions = new FileDescriptionCollection(_.reject(response.file_descriptions, deficientPredicateFn));
        dfd.resolve(this.disputeFileDescriptions);
      } else {
        // If getting file descriptions for a separate dispute, don't filter deficient
        dfd.resolve(new FileDescriptionCollection(response.file_descriptions));
      }
    }).fail(dfd.reject);

    return dfd.promise();
  },

  loadDisputeLinkFiles(disputeGuid, options={}) {
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_load_link_files}/${disputeGuid}?${default_large_query_params}`
    }).done(response => {
      response.link_files = response ? response.link_files : [];
      
      const linkedFiles = new LinkFileCollection(response.link_files);
      if (!options?.no_cache) this.disputeLinkFiles = linkedFiles;
      
      dfd.resolve(linkedFiles);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadFromDisputeAccessResponse(response_data_claims, unlinked_file_descriptions) {
    response_data_claims = response_data_claims || [];
    unlinked_file_descriptions = unlinked_file_descriptions || [];

    const file_descriptions = [];
    const link_files = [];
    const files = [];
    const loggedInParticipantId = disputeChannel.request('get').get('tokenParticipantId');
    const activeParticipant = participantsChannel.request('get:participant', loggedInParticipantId);
    const isApplicantLoggedIn = !(activeParticipant && activeParticipant.isRespondent());

    // Define parsing functions for the data
    const loggedInUserHasAccessPermisionsForFileDescription = function(file_description) {
      // To allow for notice service, always add notice files if an applicant is logged-in
      const participantModelBy = participantsChannel.request('get:participant', file_description.description_by);

      const isFileDescriptionAddedByApplicant = participantModelBy && participantModelBy.isApplicant();

      // Add rule where applicant can see all notice file descriptions added
      const isFileDescriptionAccessibleToApplicant = isFileDescriptionAddedByApplicant || new FileDescriptionModel(file_description).isNotice();
      
      // If an applicant is logged in, return all evidence for applicants, or evidence with no description_by id
      return isApplicantLoggedIn ? isFileDescriptionAccessibleToApplicant :
        // If a respondent is logged in, only return evidence that their participantId has added
        file_description.description_by === loggedInParticipantId;
    };
    const parseFilesFn = function(file_description) {
      _.each(file_description.linked_files, function(file, index) {
        files.push(_.extend({
          file_id: index,
          upload_status: 'uploaded'
        }, file));
        link_files.push({
          file_id: index,
          file_description_id: file_description.file_description_id
        });
      });
    };


    const EVIDENCE_METHOD_UPLOAD_NOW = configChannel.request('get', 'EVIDENCE_METHOD_UPLOAD_NOW');
    _.each(response_data_claims, function(claim_data) {
      // Always use the first remedy (RTB is currently using a one-remedy design)
      const remedy_id = claim_data && !_.isEmpty(claim_data.remedies) ? claim_data.remedies[0].remedy_id : null;
      const filteredFileDescriptionsByUserAccess = _.filter(claim_data.file_description, loggedInUserHasAccessPermisionsForFileDescription);
      _.each(filteredFileDescriptionsByUserAccess, function(file_description) {
        file_descriptions.push(_.extend({
          remedy_id,
          file_method: file_description.linked_files && file_description.linked_files.length ? EVIDENCE_METHOD_UPLOAD_NOW : null
        }, _.omit(claim_data, 'file_description'), file_description));

        parseFilesFn(file_description);
      });
    });

    const filteredUnlinkedFileDescriptionsByUserAccess = _.filter(unlinked_file_descriptions, loggedInUserHasAccessPermisionsForFileDescription);
    _.each(filteredUnlinkedFileDescriptionsByUserAccess, function(file_description) {
      file_descriptions.push(_.extend({
        file_method: file_description.linked_files && file_description.linked_files.length ? EVIDENCE_METHOD_UPLOAD_NOW : null
      }, file_description));
      parseFilesFn(file_description);
    });

    this.disputeDeficientDocuments = new FileDescriptionCollection(file_descriptions.filter(fileDescription => fileDescription.is_deficient));
    this.disputeFileDescriptions = new FileDescriptionCollection(file_descriptions.filter(fileDescription => !fileDescription.is_deficient));
    this.disputeFiles = new FileCollection(files);
    this.disputeLinkFiles = new LinkFileCollection(link_files);
  },

  loadCommonFiles() {
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_common_files}`,
    }).done((commonFiles) => {
      this.commonFiles = new CommonFileCollection(commonFiles);
    });
  },

  loadExternalCommonFiles(fileTypes=[]) {
    const params = $.param({ FileTypes: fileTypes });
    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_external_load_common_files}?${params}`
      }).done(response => {
        this.commonFiles = new CommonFileCollection(response?.external_common_files);
        res(this.commonFiles);
      }).fail(rej);
    });
  },

  getDisputeFiles() {
    return this.disputeFiles;
  },

  getFile(file_id) {
    return this.disputeFiles.findWhere({ file_id });
  },

  getDisputeFileDescription(file_description_id) {
    // NOTE: Does not perform a search in deficient documents for the given file description id
    return this.disputeFileDescriptions.findWhere({ file_description_id });
  },

  getDisputeFileDescriptions() {
    return this.disputeFileDescriptions;
  },

  getDisputeFileDescriptionsWithNoClaim() {
    return this.disputeFileDescriptions.filter(function(fileDescription) {
      return !fileDescription.get('claim_id') && !fileDescription.get('remedy_id');
    });
  },

  getFileDescriptionFromCode(description_code) {
    return this.disputeFileDescriptions.findWhere({ description_code });
  },

  // Note: Gets ONE file description associated to a file model.  In R1, support only exists for 1-1 relationship with File<->FileDescription
  getFileDescriptionFromFile(fileModel, options={}) {
    const matchingLinkFile = fileModel && !fileModel.isNew() && this.disputeLinkFiles.findWhere({ file_id: fileModel.id });
    if (matchingLinkFile && matchingLinkFile.get('file_description_id')) {
      const matchingFileDescription = this.disputeFileDescriptions.get(matchingLinkFile.get('file_description_id')) || null;
      if (!matchingFileDescription && options.include_removed) {
        return this.disputeDeficientDocuments.get(matchingLinkFile.get('file_description_id')) || null;
      } else {
        return matchingFileDescription;
      }
    }
    return null;
  },

  
  getAllFileDescriptionsFromCode(description_code) {
    return this.disputeFileDescriptions.where({ description_code });
  },

  getFileDescriptionsFromCategory(description_category) {
    return this.disputeFileDescriptions.where({ description_category });
  },

  getFileDescriptionsFromFile(fileModel) {
    const matchingLinkFiles = this.disputeLinkFiles.where({ file_id: fileModel.id });
    return this.disputeFileDescriptions.filter(fileD => _.find(matchingLinkFiles, linkFile => linkFile.get('file_description_id') === fileD.id));
  },

  getDisputeFileDescriptionsForClaim(claim_id, remedy_id, dataContext={}) {
    const search_params = _.extend({ claim_id }, remedy_id ? { remedy_id } : {});
    return (dataContext?.fileDescriptions || this.disputeFileDescriptions).where(search_params);
  },

  getDeficientFileDescriptions() {
    return this.disputeDeficientDocuments;
  },

  getDisputeLinkFiles() {
    return this.disputeLinkFiles;
  },

  getDisputeFilePackages() {
    return this.disputeFilePackages;
  },

  getFilePackage(filePackageId) {
    return this.getDisputeFilePackages().findWhere({ file_package_id: filePackageId });
  },

  getFileUploadUrl() {
    return configChannel.request('get', 'API_ROOT_URL') + `${api_save_file}/${disputeChannel.request('get:id')}`;
  },

  getCommonFileUrl() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_common_files}`
  },

  getCommonFile(commonFileId) {
    return this.commonFiles.findWhere({ common_file_id: commonFileId });
  },

  getCommonFiles() {
    return this.commonFiles;
  },

  getDuplicateFileModelTranslations(fileModels) {
    const dupFilenames = {};
    _.each(fileModels, fileModel => {
      const fileKey = `${fileModel.get('original_file_name')}|${fileModel.get('file_size')}|${fileModel.get('file_mime_type')}`;
      if (_.has(dupFilenames, fileKey)) {
        dupFilenames[fileKey].push(fileModel.id);
      } else {
        dupFilenames[fileKey] = [fileModel.id];
      }
    });

    const fileDupTranslations = {};
    let dupsFound = 0;
    Object.keys(dupFilenames).forEach(key => {
      const dupFileIds = dupFilenames[key];
      if (dupFileIds.length < 2) { return; }

      const indexToUse = ++dupsFound;
      _.each(dupFileIds, (fileId, i) => fileDupTranslations[fileId] = { isFirst: i===0, text: `DUP${Formatter.toLeftPad(indexToUse)}` });
    });

    return fileDupTranslations;
  },


  getIntakeFilePackage() {
    return this.getDisputeFilePackages().findWhere({ package_type: configChannel.request('get', 'FILE_PACKAGE_TYPE_INTAKE') });
  },
  

  isFileAssociatedToRemovedClaim(fileModel) {
    if (!fileModel || fileModel.isNew()) {
      // Only check API saved file models
      return false;
    }
    return claimsChannel.request('get:removed').any(disputeClaim => {
      if (disputeClaim) {
        const claimId = disputeClaim.get('claim_id')
        const remedy = disputeClaim.getApplicantsRemedy();
        const remedyId = remedy && remedy.id;
        if (!claimId || !remedyId) {
          return false;
        }

        const fileDescriptions = this.getDisputeFileDescriptionsForClaim(claimId, remedyId);
        console.log(fileDescriptions);
        return fileDescriptions && fileDescriptions.length && _.any(fileDescriptions, fileDescription => {
          const matchingFiles = this.getFilesForFileDescription(fileDescription);
          return matchingFiles && matchingFiles.length && matchingFiles.any(file => file.id === fileModel.id);
        });
      }
      return false;
    });
  },

  // Checks the current state of the file descriptions and deficient file descriptions and moves models between lists if needed
  updateLoadedFileDescriptions() {
    const toMovetoDeficient = this.disputeFileDescriptions.filter(fileDescription => fileDescription.get('is_deficient'));
    const toMovetoRegular = this.disputeDeficientDocuments.filter(fileDescription => !fileDescription.get('is_deficient'));

    if (toMovetoDeficient.length) {
      UtilityMixin.util_moveModelsTo(toMovetoDeficient, this.disputeDeficientDocuments);
    }
    if (toMovetoRegular.length) {
      UtilityMixin.util_moveModelsTo(toMovetoRegular, this.disputeFileDescriptions);
    }
  },

  _createAndSaveFilePackage(filePackageData) {
    const dfd = $.Deferred();
    const filePackageModel = new FilePackageModel(_.extend({
      package_date: Moment().toISOString()
    }, filePackageData));
    
    filePackageModel.save().done(() => {
      this.getDisputeFilePackages().add(filePackageModel);
      dfd.resolve(filePackageModel);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  createIntakeFilePackage(filePackageData) {
    filePackageData = filePackageData || {};
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    return this._createAndSaveFilePackage(_.extend({
      package_type: configChannel.request('get', 'FILE_PACKAGE_TYPE_INTAKE'),
      created_by_id: primaryApplicant ? primaryApplicant.id : null
    }, filePackageData));
  },

  _createExternalFilePackage(filePackageData) {
    const dispute = disputeChannel.request('get');
    return this._createAndSaveFilePackage(_.extend({
      created_by_id: dispute.get('tokenParticipantId') ? dispute.get('tokenParticipantId') :
          ( dispute.get('accessCode') ? null : participantsChannel.request('get:primaryApplicant:id') ),
      created_by_access_code: dispute.get('accessCode')
    }, filePackageData));
  },

  createDisputeAccessFilePackage(filePackageData) {
    filePackageData = filePackageData || {};
    return this._createExternalFilePackage(_.extend({
      package_type: configChannel.request('get', 'FILE_PACKAGE_TYPE_EVIDENCE'),
    }, filePackageData));
  },

  createOfficeSubmissionFilePackage(filePackageData) {
    filePackageData = filePackageData || {};
    return this._createExternalFilePackage(_.extend({
      package_type: configChannel.request('get', 'FILE_PACKAGE_TYPE_OFFICE')
    }, filePackageData));
  },

  createLinkFile(file_model, file_description_model) {
    // Check first if a Link File exists:
    const dfd = $.Deferred();
    if (!file_model || file_model.isNew()) {
      console.log(`[Warning] No api saved file model provided`, file_model);
      dfd.resolve();
      return dfd.promise();
    }
    if (!file_description_model || file_description_model.isNew()) {
      console.log(`[Warning] No api saved file description model provided`, file_description_model);
      dfd.resolve();
      return dfd.promise();
    }

    const file_id = file_model.id;
    const file_description_id = file_description_model.id;

    const matchingLinkFile = this.disputeLinkFiles.findWhere({
      file_id,
      file_description_id
    });

    if (matchingLinkFile) {
      dfd.resolve(matchingLinkFile);
    } else {
      const newLinkFile = new LinkFileModel({
        file_id,
        file_description_id
      });

      newLinkFile.save().done(() => {
        this.disputeLinkFiles.add(newLinkFile);
        dfd.resolve(newLinkFile);
      }).fail(dfd.reject);
    }

    return dfd.promise();
  },


  createCommonFilePromise(common_file_attrs) {
    // Creates a FileUpload view and uploads a file in the background
    const common_file_model = new CommonFileModel(common_file_attrs);
    
    const uploader = this.createFileUploader({
        url: `${configChannel.request('get', 'API_ROOT_URL')}${api_common_files}`,
        singleFileUploads: true,
        files: new CommonFileCollection([common_file_model])
      });
    const dfd = $.Deferred();

    // NOTE: Must render the view, but don't need to attach it to DOM
    uploader.render().uploadAddedFiles().done(function() {
      dfd.resolve(common_file_model);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  addFileDescription(file_description) {
    const targetCollection = file_description.get('is_deficient') ? this.disputeDeficientDocuments : this.disputeFileDescriptions;

    // Adds an API file description to the list
    if (!targetCollection.findWhere({ file_description_id: file_description.get('file_description_id') })) {
      targetCollection.add(file_description);
    }
  },

  addUploadedFile(file_model) {
    if (!this.disputeFiles.findWhere({ file_id: file_model.get('file_id') })) {
      this.disputeFiles.add(new FileModel(file_model.toJSON()));
    }
  },

  removeUploadedFile(file_model) {
    if (this.disputeFiles.findWhere({ file_id: file_model.get('file_id') })) {
      this.disputeFiles.remove(file_model);
    }
  },

  getFilesForFileDescription(file_description_model, dataContext={}) {
    const matching_files = new FileCollection();
    if (!file_description_model || file_description_model.isNew()) {
      return matching_files;
    }

    const matching_link_files = (dataContext?.linkFiles || this.disputeLinkFiles).where({
      file_description_id: file_description_model ? file_description_model.get(file_description_model.idAttribute) : -1
    });

    _.each(matching_link_files, function(link_file_model) {
      const matching_file = (dataContext?.files || this.disputeFiles).findWhere({ file_id: link_file_model.get('file_id') });
      if (!matching_file) {
        console.log(`[Error] Couldn't find a real file ID for link file`, link_file_model);
        return;
      }
      // Add a copy of the file to the File collection for this dispute
      matching_files.add(new FileModel(matching_file.toJSON()));
    }, this);

    return matching_files;
  },

  deleteFileAndLinkFiles(file_model, deleteAttrs={}) {
    const dfd = $.Deferred();
    // If a file is being deleted, clean up all links to it
    const matchingLinkFiles = this.disputeLinkFiles.where({ file_id: file_model.get('file_id') });
    Promise.all([file_model.destroy(deleteAttrs), ..._.map(matchingLinkFiles, function(matchingLinkFile) { return matchingLinkFile.destroy(deleteAttrs); })])
      .then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  deleteFilesAndLinksAndFileDescription(dispute_evidence_model, options={}) {
    const dfd = $.Deferred();
    const files = options.files || this.getFilesForFileDescription(dispute_evidence_model);
    const all_deletes = [];
    files.each(function(file_model) {
      // Delete this file and any link files present to the file
      all_deletes.push( _.bind(this.deleteFileAndLinkFiles, this, file_model) );
    }, this);
    
    Promise.all(_.map(all_deletes, function(delete_xhr) { return delete_xhr(); }))
      .then(function() {
        if (options.intakeEvidenceRules && dispute_evidence_model && (
              dispute_evidence_model.isNonCustomIssueEvidence() ||
              dispute_evidence_model.isTenancyAgreement() ||
              dispute_evidence_model.isMonetaryOrderWorksheet()
            )
        ) {
          // If it's issue evidence or a TA/MOW, then just clear data and save
          dispute_evidence_model.clearData();
          dispute_evidence_model.save().done(dfd.resolve).fail(dfd.reject);
        } else {
          // Otherwise, delete file description
          dispute_evidence_model.destroy().done(dfd.resolve).fail(dfd.reject);
        }
      }, dfd.reject);
    return dfd.promise();
  },

  /**
   * From question: https://stackoverflow.com/questions/2339440/download-multiple-files-with-a-single-action#
   * Answer: https://stackoverflow.com/a/29606450
   * Download a list of files
   * @author speedplane
   */
  _browserDownloadAllFiles(files) {
    function download_next(i) {
      if (i >= files.length) {
        return;
      }
      var a = document.createElement('a');
      a.href = files[i].download;
      a.target = '_parent';
      // Use a.download if available, it prevents plugins from opening.
      if ('download' in a) {
        a.download = files[i].filename;
      }
      // Add a to the doc for click to work.
      (document.body || document.documentElement).appendChild(a);
      if (a.click) {
        a.click(); // The click method is supported by most browsers.
      } else {
        $(a).click(); // Backup using jquery
      }
      // Delete the temporary link.
      a.parentNode.removeChild(a);
      // Download the next file with a small timeout. The timeout is necessary
      // for IE, which will otherwise only download the first file.
      setTimeout(function() {
        download_next(i + 1);
      }, 500);
    }
    // Initiate the first download.
    download_next(0);
  },
  /* end snippet */

  downloadBulkFiles(fileModels) {
    const preparedFilesDataForDownload = _.filter(_.map(fileModels, 
      function(fileModel) {
        return {
          filename: fileModel.get('file_name'),
          download: fileModel.getDownloadURL()
        };
      }), function(fileData) {
        // Now filter any empty data
        return fileData && fileData.download && fileData.filename;
      });

    this._browserDownloadAllFiles(preparedFilesDataForDownload);
  },

  async downloadHtmlAsFile(html, filename, options={}) {
    const blob = new Blob([html], { type: 'text/html;charset=utf8' });
    return this.downloadFile(blob, filename, options);
  },

  /**
   * 
   * @param {String[][]} csvFileLines - File contents to save, line by line
   * @param {String} csvFilename - Filename to use for save, including the file extension 
   * @param {Boolean} options.forceDialog - Whether the save opens a "Save As" browser dialog 
   * @param {Boolean} options.noColumnQuotes - Controls whether double quotes are wrapped around each column in each csv file line
   * @param {String} options.separator - Character to use for the CSV column separator, defaults to comma ","
   */
  async downloadCsvFile(csvFileLines, csvFilename, options={}) {
    const separator = options?.separator || ',';
    const csvContent = csvFileLines.map(line => line.map(col => (
      !options?.noColumnQuotes ?
        // Surround column content in double quotes to support commas/spaces in the column
        // Escape any double quotes inside the string (with a doublequote according to RFC 4180
        `${col?.slice(0, 1) !== `"` ? `"` : ''}${col?.replace(/([^"])"/g, '$1""')}${col?.slice(-1) !== `"` ? `"` : ''}`
      : col
    )).join(separator)).join("\r\n");
    const csvFileContents = new Blob([csvContent], { type: 'text/csv;charset=utf8' });
    return this.downloadFile(csvFileContents, csvFilename, options);
  },

  async downloadFile(dataBlob, filename, options={}) {
    let isDownloadSuccess = false;
    if (options.forceDialog && window.showSaveFilePicker) {
      // NOTE: File type restrictions can be added to the save file picker - to be explored later
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          startIn: 'downloads',
        });
        const writableStream = await handle?.createWritable();
        await writableStream.write(dataBlob);
        await writableStream.close();
        isDownloadSuccess = true;
      } catch (err) {
        isDownloadSuccess = false;
      }
    } else {
      const link = document.createElement("a");
      link.setAttribute("href", (window.URL || window.webkitURL).createObjectURL(dataBlob));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      isDownloadSuccess = true;
    }
    return isDownloadSuccess;
  },

  showDownloadModal(onContinueFn, options) {
    options = options || {};
    modalChannel.request('show:standard', {
      title: options.title || 'Download All Files',
      bodyHtml: `<div class="row center-text">
        <div class="modal-withdraw-title">
          Before you begin:
        </div>

        <div class="modal-withdraw-body">
          <ul class="sublist">
            <li><span>All files will be downloaded to your default <b>Downloads</b> folder</span></li>
            <li><span style="color:red">EMPTY YOUR DOWNLOADS FOLDER BEFORE YOU BEGIN THIS PROCESS!</span></li>
            <li><span>To cancel the download process, use browser controls. This process is not controlled by the DMS</span></li>
            <li><span>Download time will depend on file quantity and size</span></li>
            <li><span><b>DO NOT</b> close your browser until the process is complete or the process will stop</span></li>
          </ul>
        </div>
      </div>`,
      primaryButtonText: 'Start Download',
      onContinueFn
    });
  },

  clickPreviewableFilename(ev, fileModel, options={}) {
    if (!fileModel) return;
    
    if (ev && (ev.ctrlKey || ev.metaKey)) fileModel.download();
    else this.showFilePreviewModal(fileModel, options);
  },

  /**
   * 
   * @param {FileModel} fileModel - The file to preview
   * @param {Boolean} options.fallback_download - If true, will perform a download if type check fails    
   */
  showFilePreviewModal(fileModel, options={}) {
    const VALID_PREVIEW_FILE_TYPES = options.preview_file_types ? options.preview_file_types : configChannel.request('get', 'VALID_PREVIEW_FILE_TYPES') || {};
    if (VALID_PREVIEW_FILE_TYPES[fileModel.getExtension()]) {
      const modalAddFileViewer = new ModalFileViewer({ fileModel, hidePdfControls: options.hidePdfControls, hideSplitView: options.hideSplitView });
      modalChannel.request('add', modalAddFileViewer, { duration: 0, duration2: 25 });
    } else if (options.fallback_download) {
      fileModel.download();
    }
  },

  showUploadErrorModal(uploadErrorFiles, onContinueFn) {
    onContinueFn = _.isFunction(onContinueFn) ? onContinueFn : () => {};
    
    if (!uploadErrorFiles || _.isEmpty(uploadErrorFiles)) {
      onContinueFn();
      return;
    }

    loaderChannel.trigger('page:load:complete');
    const modalView = modalChannel.request('show:standard', {
      title: 'File Upload Failed',
      bodyHtml: `<b>The following files failed to upload:</b>
        <ul style="word-break: break-all;">
          ${_.map(uploadErrorFiles, function(error_upload) {
            return `<li>${error_upload.get('file_name')}</li>`;
          }).join('')}
        </ul>
        The uploads started but these files were not sent. Please try to send the files again. If you see this message again, please make sure:
        <ul>
          <li>Your file(s) are stored in a local location on your computer or device and not on cloud storage, on a removable drive, in an email account, or in a website that may not allow the file to be actually uploaded.  You may need to move the file to a local location to fix this issue.</li>
          <li>Your file is ok. You should be able to open and view it on your computer or device.</li>
        </ul>`,
      hideCancelButton: true,
      primaryButtonText: 'Close',
      onContinueFn(modalView) {
        modalView.close();
      }
    });

    this.listenToOnce(modalView, 'removed:modal', () => onContinueFn());
  },

  fillFilePackageService(filePackageModel, options) {
    options = options || {};
    const creatorModel = filePackageModel.getPackageCreatorParticipantModel();

    if (!creatorModel) {
      console.log(`['Warning] Couldn't find creator for file package`, filePackageModel);
      return;
    }

    const isCreatorApplicant = creatorModel.isApplicant();
    const participants = participantsChannel.request(`get:${isCreatorApplicant ? 'respondents' : 'applicants'}`);
    const filePackageServices = filePackageModel.getServices();

    participants.each(function(participant) {
      const existingModel = filePackageServices.findWhere({ participant_id: participant.get('participant_id')});
      if (existingModel) {
        existingModel.set({
          participant_id: participant.get('participant_id')
        }, options);
      } else {
        filePackageServices.add(
          filePackageModel.createPackageService({
            participant_id: participant.get('participant_id'),
            is_served: null
          }), options);
      }
    });
  },

  // Checks for duplicate file using criteria of name and size
  checkForDuplicateFiles(fileObj) {
    const file_name = fileObj.name;
    const file_size = $.type(fileObj.size) === 'number' ? fileObj.size : 0;

    return this.disputeFiles.findWhere({ original_file_name: file_name, file_size });
  },

  checkForFileDescriptionCategory(category, exclude_codes) {
    let contains = false;

    this.disputeFileDescriptions.each(function(disputeFileDescription) {
      if (contains || (exclude_codes && _.contains(exclude_codes, disputeFileDescription.get('description_code')))) {
        return;
      }
      contains = disputeFileDescription.get('description_category') === category;
    });
    return contains;
  },

  uploadPDF(disputeGuid, pdfData) {
    if (!disputeGuid) {
      console.log(`[Error] Need a disputeGuid to post a PDF file.`);
      return;
    }

    const dfd = $.Deferred();
    const postData = _.extend({
      generation_template: (configChannel.request('get', 'GENERATION_TEMPLATES') || {}).DEFAULT,
      file_type: configChannel.request('get', 'FILE_TYPE_NOTICE')
    }, pdfData);

    apiChannel.request('call', {
      type: 'POST',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_upload_pdf}/${disputeGuid}`,
      data: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json'
      },
      contentType: "application/json",
      crossDomain: true,
      dataType: 'json'
    })
    .done(response => {
      const fileModel = new FileModel(response);
      this.addUploadedFile(fileModel);
      dfd.resolve(fileModel);
    })
    .fail(dfd.reject);
    
    return dfd.promise();
  }

});

const filesManagerInstance = new FilesManager();
export default filesManagerInstance;