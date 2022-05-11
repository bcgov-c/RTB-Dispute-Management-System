
/**
 * Required functions to be defined:
 * - onUploadComplete: will be called when uploads finished, or when cancel occurrs
 * - onCancelButtonNoUpload: will be called when cancel button pressed but not during uploads
 * - prepareFileDescriptionForUpload(fileDescriptionModel)
 * - prepareFilesForUpload(fileCollection)
 * - createFilePackageCreationPromise(): returns a promise which creates any required files packages
 

 * Required variables in scope:
 * - this.uploadModel: a Backbone.Model having methods for get and set pending uploads.  See UploadMixin_model.js for an implementation.
 * - this.fileUploader: a FileUploader.js object.  Will be created during upload if not already created
 * - this.isCancel: whether or not cancel button has been pressed during uploads
 * - this.isUpload: whether or not upload is occurring
 * Optional variables in scope:
 * - this.fileUploaderOptions: an Object that will be passed to the created FileUploader
 
* Required "ui" Marionette.View attributes:
 * - fileCounter: updates the "X files ready to upload" counter on page
 * - uploadingFilesProgress: the progress text displayed during upload
 
  
  
 * Dev notes:
 * - Pass option/param { mode: 'upload' } to UploadIssueCollectionView to hide evidence with no files to upload
 * - Use top level wrapper class for upload area: .da-upload-page-wrapper
 * -- and then add class 'upload' to it for upload
*/

import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const filesChannel = Radio.channel('files');

export default {

  mixin_upload_onCancel(ev) {
    this.isCancel = true;
    if (this.isUpload) {
      if (ev) {
        ev.preventDefault();
        $(ev.currentTarget).attr('disabled', 'disabled').addClass('disabled');
      }
      
      if (this.fileUploader) {
        this.fileUploader.trigger('cancel:all');
      }
      this.onUploadComplete();
    } else {
      this.onCancelButtonNoUpload(); 
    }
  },

  mixin_upload_startUploads() {
    const pendingUploads = this.uploadModel.getPendingUploads();
    
    // Add a session ID so we can easily detect which uploads are DA files
    this.mixin_upload_setUploadSessionId(pendingUploads);
    this.mixin_upload_updateReadyToUploadCount({ force: true });

    const filePackagePromise = this.createFilePackageCreationPromise();
    // Create an evidence package first, if any evidence
    filePackagePromise.done(filePackage => {
      $.whenAll(UtilityMixin.util_clearQueue(_.map(pendingUploads, dispute_evidence_model => {
        // If a file package existed, update all files to be that file package
        dispute_evidence_model.get('files').each(function(file_model) {
          file_model.set(_.extend(
            dispute_evidence_model.isEvidence() ? { file_package_id: filePackage.id } : {}
          ));
        });
        return _.bind(this.mixin_upload_createEvidenceAndSaveFiles, this, dispute_evidence_model);
      })))
      .always(() => this.onUploadComplete());
    }).fail(
      generalErrorFactory.createHandler('FILEPACKAGE.CREATE', () => this.onUploadComplete())
    );
  },

  mixin_upload_setUploadSessionId(pending_uploads) {
    _.each(pending_uploads, function(dispute_evidence_model) {
      const upload_session_id = (new Date()).getTime();
      _.each(dispute_evidence_model.getReadyToUploadFiles(), function(file_model) {
        file_model.set('disputeAccessSessionId', upload_session_id);
      }, this);
    });
  },

  mixin_upload_updateUploadProgress() {
    const pending_uploads = this.uploadModel.getPendingUploads();
    const total_da_upload_count = this.getUI('fileCounter').text();
   
    let uploaded_da_files_count = _.reduce(pending_uploads, function(memo, disputeEvidence) {
      return memo + _.filter(disputeEvidence.getUploadedFiles(), function(e) { return e.isDisputeAccess(); }).length;
    }, 0);

    uploaded_da_files_count = $.trim(uploaded_da_files_count) === $.trim(total_da_upload_count) ? total_da_upload_count : uploaded_da_files_count + 1;

    console.log('----- mixin_upload_updateUploadProgress -----');
    console.log('pending_uploads', pending_uploads);
    console.log('total_da_upload_count', total_da_upload_count);
    console.log('uploaded_da_files_count', uploaded_da_files_count);

    this.getUI('uploadingFilesProgress').text(`${uploaded_da_files_count} / ${total_da_upload_count}`);
  },

  mixin_upload_updateReadyToUploadCount(options) {
    options = options || {};
    if (this.isUpload && !options.force) {
      return;
    }
    const pending_uploads = this.uploadModel.getPendingUploads();
    this.getUI('fileCounter').text(_.reduce(pending_uploads, function(memo, disputeEvidence) {
      return memo + disputeEvidence.getReadyToUploadFiles().length;
    }, 0));
  },


  mixin_upload_createEvidenceAndSaveFiles(dispute_evidence_model) {
    const dfd = $.Deferred();
    const fileDescription = dispute_evidence_model.get('file_description');
    const files = dispute_evidence_model.get('files');
    const self = this;

    this.prepareFileDescriptionForUpload(fileDescription);
    this.prepareFilesForUpload(files);

    const uploadFilesFn = function() {
      self.fileUploader = filesChannel.request('create:uploader', Object.assign({
        files,
        file_description: dispute_evidence_model.get('_skipFileDescriptionCreation') ? null : fileDescription,
        checkForDisputeDuplicates: false
      }, self.fileUploaderOptions || {})).render();
      self.listenTo(self.fileUploader, 'upload:file:complete', self.mixin_upload_updateUploadProgress, self);
      self.fileUploader.uploadAddedFiles().done(dfd.resolve).fail(dfd.reject);
    };

    if (dispute_evidence_model.isNew() && !dispute_evidence_model.get('_skipFileDescriptionCreation')) {
      dispute_evidence_model.save(dispute_evidence_model.getApiChangesOnly())
        .done(() => uploadFilesFn())
        .fail(
          generalErrorFactory.createHandler('OS.EVIDENCE.CREATE', () => {
            console.log(`[Error] Couldn't create a FileDescription`, dispute_evidence_model);
            dfd.reject();
          })
        );
    } else {
      uploadFilesFn();
    }
    return dfd.promise();
  },


  mixin_upload_transitionToUploadStep() {
    this.isUpload = true;
    this.uploadModel.toUpload();
    this.render();
    //this.renderButtonsForUpload();
    const dfd = $.Deferred()
    $.scrollPageToTop();
    return dfd.resolve().promise();
  },

  
}
