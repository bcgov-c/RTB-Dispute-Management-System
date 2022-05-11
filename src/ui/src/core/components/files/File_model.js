/**
 * @class core.components.files.FileModel
 * @memberof core.components.files
 * @augments core.components.model.CMModel
 */

import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import InputModel from '../input/Input_model';
import UtilityMixin from '../../utilities/UtilityMixin';

const apiPostName = 'file';
const apiDeleteName = 'file';
const apiPatchName = 'fileinfo';

const notesChannel = Radio.channel('notes');
const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const sessionChannel = Radio.channel('session');

export default CMModel.extend({
  idAttribute: 'file_id',
  defaults: {
    file_id: null,
    file_guid: null,
    dispute_guid: null,
    file_type: null,
    file_mime_type: null,
    file_name: null,
    original_file_name: null,
    file_size: null,
    file_title: null,
    file_status: null,
    file_url: null,
    file_package_id: null,
    added_by: null,
    file_considered: null,
    file_referenced: null,
    submitter_name: null,
    file_date: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,

    // File Upload metadata
    fileObj: null,
    upload_status: null,
    upload_progress: null,
    error_message: null,
    error_state: null,
    uploadGuid: null,
    editable: null,

    // UI-only attributes
    renameInputModel: null,
    autofillRename: false,
    display_mode: false,
    enable_rename: false,

    // Site-specific metadata
    disputeAccessSessionId: null
  },

  API_SAVE_ATTRS: [
    'file_type',
    'file_name',
    'file_title',
    'file_status',
    'file_package_id',
    'added_by',
    'file_considered',
    'file_referenced',
    'file_date'
  ],

  urlRoot() {
    const disputeGuid = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${ this.isNew() ? `${apiPostName}/${disputeGuid}` : this.get('_deleteInProgress') ? apiDeleteName : apiPatchName }`;
  },

  save(attrs, options) {
    const dfd = $.Deferred();
    CMModel.prototype.save.call(this, attrs, options).done(response => {
      // Make sure the global list of files has been updated as well
      const matchingFileModel = filesChannel.request('get:file', this.id);
      if (matchingFileModel) {
        matchingFileModel.set(this.attributes, { silent: true });
      }
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  initialize() {
    const renameInputModel = new InputModel({
      errorMessage: 'Descriptive file name required',
      required: true,
      maxLength: configChannel.request('get', 'DESCRIPTIVE_FILE_LENGTH_MAX'),
      minLength: configChannel.request('get', 'DESCRIPTIVE_FILE_LENGTH_MIN'),
      labelText: 'Descriptive file name',
      restrictedCharacters: InputModel.getRegex('filename__restricted_chars'),
      replacementCharacters: {
          '\\s': '_',
          '\\.': '_',
      },
      customLink: 'Use original name',
      customLinkFn: () => this.renameFileToOriginalName(),
      value: null,
    });
    if (this.get('autofillRename')) {
      renameInputModel.set({ value: renameInputModel.applyCharacterRestrictions(this.getOriginalNameNoExtension() || '') },
          { silent: true });
    }
    this.set('renameInputModel', renameInputModel);
  },

  renameFileToOriginalName() {
    this.get('renameInputModel').trigger('update:input', this.getOriginalNameNoExtension());
  },

  _getNameNoExtension(fieldName) {
    const name = this.get(fieldName);
    return name && name.indexOf('.') !== -1 ? name.split('.').slice(0, -1).join('.') : $.trim(name);
  },

  getOriginalNameNoExtension() {
    return this._getNameNoExtension('original_file_name');
  },

  getNameNoExtension() {
    return this._getNameNoExtension('file_name');
  },

  getTrimmedName(charactersToTrimAt) {
    if ($.trim(this.getNameNoExtension()).length <= charactersToTrimAt-3) {
      return $.trim(this.get('file_name'));
    } else {
      return `${$.trim(this.getNameNoExtension()).slice(0, charactersToTrimAt)}...${this.getExtension()}`
    }
  },

  _getExtensionFromFileString(fileString) {
    return fileString && fileString.indexOf('.') !== -1 ? fileString.split('.').slice(-1).join('') : '';
  },

  getOriginalExtension() {
    const original_name = this.get('original_file_name');
    return this._getExtensionFromFileString(original_name);
  },

  getExtension() {
    return this._getExtensionFromFileString(this.get('file_name'));
  },

  generateUploadGuid() {
    const existingUploadGuid = this.get('uploadGuid');
    if (existingUploadGuid) {
      return existingUploadGuid;
    }

    const uploadGuid = UtilityMixin.util_generateUUIDv4();
    this.set('uploadGuid', uploadGuid, { silent: true });
    return uploadGuid;
  },

  saveInternalDataToModel() {
    // Saves the rename file name
    const rename_value = this.get('renameInputModel').get('value'),
      extension = this.getOriginalExtension(),
      new_filename = rename_value + (extension ? `.${extension}` : '');

    if (new_filename !== this.get('file_name')) {
      this.set('file_name', new_filename);
    }
  },

  // Gets name based on the original name and the value in the rename input model.  If no rename provided, uses the original name
  getRenamedFilenameWithExtension() {
    const user_provided_name = this.get('renameInputModel').getData();
    const original_name = this.get('original_file_name');
    const original_name_no_extension = this.getOriginalNameNoExtension();
    const extension = this.getOriginalExtension();

    // Either no rename provided, or rename is the same as the original filename (minus the extension)
    if ($.trim(user_provided_name) === '' || user_provided_name === original_name_no_extension) {
      return original_name;
    }
    return `${user_provided_name}${extension ? `.${extension}` : ''}`;
  },

  destroy(options) {
    // If destroying the file, also broadcast a global destroy event for the file manager
    const dfd = $.Deferred();
    const self = this;
    self.set('_deleteInProgress', true);
    CMModel.prototype.destroy.call(this, options).done(function(response) {
      filesChannel.request('remove:file', self);
      dfd.resolve(response);
    }).fail(dfd.reject).always(function() {
      self.set('_deleteInProgress', false);
    });
    return dfd.promise();
  },

  /**
   * Creates the base64-encoded token + file_id string used for authentication at file url.
   * @returns {String} The base64 string for accessing file url.
   */
  _getEncodedTokenForFileURL() {
    const token = sessionChannel.request('token'),
      encoded_token = btoa(`${token}:${this.id}`);

    return token ? encodeURIComponent(encoded_token) : null;
  },

  // Returns the file_url with the encoded token, optionally with the download directive.
  _getFileURL(triggerDownload) {
    const splitParts = this.get('file_url').split('/');
    const filenamePart = splitParts.pop();
    const urlPart = splitParts.join('/');
    const encodedToken = this._getEncodedTokenForFileURL();
    const fileUrlWithToken = `${encodeURI(urlPart)}/${encodeURIComponent(filenamePart)}${encodedToken ? `?token=${encodedToken}` : ''}`;
    return fileUrlWithToken + (!triggerDownload ? '&isInline=true' : '');
  },

  /**
   * Creates a download URL with correct encoding url.
   * @returns {String} The url string with correct parameters to trigger a browser download when activated.
   */
  getDownloadURL() {
    if (!this.get('file_url')) return "";
    //   // Nothing to download since it was not yet saved on the server
    //   return;
    // }
    return this._getFileURL(true);
  },

  /**
   * Creates a display URL with correct encoding url.
   * @returns {String} The url string with correct paramters to display the file on the page.
   */
  getDisplayURL() {
    return this._getFileURL(false);
  },

  /**
   * Creates a display URL with correct encoding url.
   * @returns {String} The url string with correct paramters to display the file on the page.
   */
  getThumbnailURL() {
    return `${this._getFileURL(false)}&thumb=true`;
  },


  download() {
    const download_url = this.getDownloadURL();
    // NOTE: Uses jquery to trigger a browser download using iframes
    /*
    $('#downloadFrame').remove();
    $('body').append('<a id="downloadFrame" style="display:none" href="'+download_url+'" ></a>');
    $('#downloadFrame').click();
    */
    $('#downloadFrame').remove();
    $('body').append('<iframe id="downloadFrame" style="display:none"></iframe>');

    $('#downloadFrame').attr({
      target: '_blank',
      href: download_url
    });

    $('#downloadFrame').remove();
    $('body').append('<iframe id="downloadFrame" style="display:none"></iframe>');
    $('#downloadFrame').attr('src', download_url);
  },


  // Uses Blob, and HTML5 download in order to start a file download in the user's browser
  // Deprecated / unused
  downloadHTML5() {
    // Create

    const xhr = new XMLHttpRequest(),
      file_url = this.get('file_url'),
      file_size = this.get('file_size'),
      self = this;

    if (!file_url) {
      console.log(`[Error] Couldn't retrieve the file url for `, this);
      alert(`[Error] Download unavailable`);
      return;
    }

    this.set({
      upload_status: 'downloading'
    });

    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') });
      const data_url = (window.URL || window.webkitURL).createObjectURL(blob);
      
      $('<a />', {
         'href': data_url,
         'download': self.get('file_name'),
         'text': "click"
       }).hide().appendTo("body")[0].click();
       self.set({
         upload_status: 'downloaded',
         error_state: null
       });
       setTimeout(function() {
         self.set({
           upload_status: 'uploaded',
           error_state: null
         });
       }, 500);
    };
    xhr.onerror = function(error_response) {
      console.log(`[Error] Couldn't retrieve the file to download.`, self, error_response, xhr);
      alert(`[Error] Download failed`);
      self.set({
        error_state: 'download_error',
        error_message: 'download error'
      });
    };
    xhr.onprogress = function(evt) {
      if (evt.lengthComputable) {  // evt.loaded the bytes the browser received
        // evt.total the total bytes set by the header
        // jQuery UI progress bar to show the progress on screen
        const percentComplete = parseInt((evt.loaded / file_size) * 100, 10);
        self.trigger('update:progress', percentComplete);
      }
    };

    xhr.open('GET', file_url);
    xhr.setRequestHeader('Token', sessionChannel.request('token'));
    xhr.send();
  },

  isReadyToUpload() {
    return this.get('upload_status') === 'ready';
  },

  isUploaded() {
    return this.get('upload_status') === 'uploaded';
  },

  isCancelled() {
    return this.get('upload_status') === 'cancelled';
  },

  isReferenced() {
    return this.get('file_referenced');
  },

  isConsidered() {
    return this.get('file_considered');
  },

  isAccepted() {
    return this.get('file_status') === configChannel.request('get', 'FILE_STATUS_ACCEPTED');
  },

  isUploadError() {
    return _.contains(['empty_size_upload_error', 'upload_error'], this.get('error_state'));
  },

  isDisputeAccess() {
    return this.get('disputeAccessSessionId');
  },

  isPdf() {
    return this.get('file_mime_type') === 'application/pdf';
  },

  isImage() {
    return $.trim(this.get('file_mime_type')).includes('image');
  },

  isVideo() {
    return $.trim(this.get('file_mime_type')).includes('video');
  },

  isViewableVideo() {
    return this.isVideo() && !$.trim(this.get('file_mime_type')).includes('/avi');
  },

  isAudio() {
    return $.trim(this.get('file_mime_type')).includes('audio');
  },

  isViewable() {
    return _.any([this.isPdf, this.isImage, this.isAudio, this.isViewableVideo], fn => _.isFunction(fn) && fn.bind(this)());
  },

  getFilePackage() {
    return filesChannel.request('get:filepackage', this.get('file_package_id'));
  },

  isFilePackageDeleted() {
    const filePackage = this.getFilePackage();
    return filePackage && filePackage.isPackageCreatorDeleted();
  },

  isFilePackageRemoved() {
    const filePackage = this.getFilePackage();
    return filePackage && filePackage.isPackageCreatorRemoved();
  },

  wasRenamed() {
    const original_file_name = this.get('original_file_name');
    return original_file_name && original_file_name !== this.get('file_name');
  },

  _getNotes(notesChannelRequest) {
    const notes = notesChannel.request(notesChannelRequest, this.id);
    return notes;
  },

  // If options.force_refresh is true, will cause a re-render
  getEvidenceNotes(options) {
    options = options || {};
    if (options.force_refresh || !this.evidenceNotes) {
      this.evidenceNotes = this._getNotes('get:file:evidence');
    }
    return this.evidenceNotes;
  },

  getDecisionNotes(options) {
    options = options || {};
    if (options.force_refresh || !this.decisionNotes) {
      this.decisionNotes = this._getNotes('get:file:decision');
    }

    return this.decisionNotes;
  },

});
