/**
 * @fileoverview - Modal for selecting and uploading arb signature images. Supports file upload, and cropping using cropperjs npm package.
 */
import Radio from 'backbone.radio';
import ModalBaseView from '../../modals/ModalBase';
import Cropper from 'cropperjs';

import InputView from '../../input/Input';
import InputModel from '../../input/Input_model';
import TextareaView from '../../textarea/Textarea';
import TextareaModel from '../../textarea/Textarea_model';
import DropdownView from '../../dropdown/Dropdown';
import DropdownModel from '../../dropdown/Dropdown_model';

import './modal-add-signature.css';
import template from './ModalAddSignature_template.tpl';

const MIN_IMAGE_HEIGHT = 250;
const MIN_IMAGE_WIDTH = 400;
const SIZE_OFFSET = 10;
const CROPPER_ZOOM_AMOUNT = 0.1;
const CROPPER_MOVE_AMOUNT = 10;
const CROPPER_ROTATE_DEGREE = 90;
const MAX_CROPPER_ASPECT_RATIO = 5;
const MIN_CROPPER_ASPECT_RATIO = 1.5;
const SIGNATURE_FILE_TYPE = 4;
const CROPPER_ASPECT_RATIO_ERROR = `Warning: To ensure the signature file will fit into the available space in a decision or order, the aspect ration cannot be less than ${MIN_CROPPER_ASPECT_RATIO} to 1 or greater than ${MAX_CROPPER_ASPECT_RATIO} to 1`;
const CROPPER_MIN_SIZE_ERROR = `Warning: Signature files cannot be resized smaller than ${MIN_IMAGE_WIDTH}px wide by ${MIN_IMAGE_HEIGHT}px tall.  To crop a smaller area you must upload a higher resolution signature file`
const SIGNATURE_ALREADY_EXISTS_ERROR = 'A signature for this user already exists';
const signatureImageclassSelector = '.file-cropper-image';
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');

export default ModalBaseView.extend({ 
  template,
  id: 'addSignature_modal',
  ui: {
    save: '#addFilesSave',
    cancel: '#addFilesCancel',
    close: '#addFilesClose',
    closeBtn: '.close-x',
    fileDescription: '.file-description',
    signatureWrapper: '.signature-wrapper',
    signatureUser: '.signature-user',
    signatureCropButtons: '.signature-cropper-buttons',
    //cropper specific ui
    cropperInfo: '.signature-cropper-info',
    cropperError: '.signature-cropper-error',
    zoomIn: '#signature-cropper-zoom-in',
    zoomOut: '#signature-cropper-zoom-out',
    moveLeft: '#signature-cropper-move-left',
    moveRight: '#signature-cropper-move-right',
    moveUp: '#signature-cropper-move-up',
    moveDown: '#signature-cropper-move-down',
    rotateLeft: '#signature-cropper-rotate-left',
    rotateRight: '#signature-cropper-rotate-right'
  },

  regions: {
    filenameRegion: '.signature-file-name',
    fileDescriptionRegion: '@ui.fileDescription',
    fileUploadRegion: '.file-upload',
    documentFileTitleRegion: '.signature-document-title',
    associatedUserRegion: '@ui.signatureUser',
  },

  events: {
    'click @ui.save': 'save',
    'click @ui.close': 'close',
    'click @ui.closeBtn': 'close',
    'click @ui.cancel': 'cancel',
    //cropper specific events
    'click @ui.zoomIn': function() { this.cropperZoom('zoomIn') },
    'click @ui.zoomOut': function() { this.cropperZoom('zoomOut') },
    'click @ui.moveLeft': function() { this.cropperMove('left') },
    'click @ui.moveRight': function() { this.cropperMove('right') },
    'click @ui.moveUp': function() { this.cropperMove('up') },
    'click @ui.moveDown': function() { this.cropperMove('down') },
    'click @ui.rotateLeft': function() { this.cropperRotate('left') },
    'click @ui.rotateRight': function() { this.cropperRotate('right') },

  },

  cropperZoom(zoomType) {
    if (zoomType === 'zoomIn') this.cropper.zoom(CROPPER_ZOOM_AMOUNT);
    else if (zoomType === 'zoomOut') this.cropper.zoom(-CROPPER_ZOOM_AMOUNT);
  },

  cropperMove(moveType) {
    if (moveType === 'left') this.cropper.move(CROPPER_MOVE_AMOUNT, 0);
    else if (moveType === 'right') this.cropper.move(-CROPPER_MOVE_AMOUNT, 0);
    else if (moveType === 'up') this.cropper.move(0,CROPPER_MOVE_AMOUNT);
    else if (moveType === 'down') this.cropper.move(0,-CROPPER_MOVE_AMOUNT);
  },

  cropperRotate(rotateType) {
    if (rotateType === 'left') this.cropper.rotate(-CROPPER_ROTATE_DEGREE)
    else if (rotateType === 'right') this.cropper.rotate(CROPPER_ROTATE_DEGREE)
  },

  save() {
    const fileUploader = this.getChildView('fileUploadRegion');
    fileUploader.saveInternalDataToModel();

    if (!this.validateAndShowErrors()) {
      console.log('File was not valid');
      return false;
    }

    if (this.getUI('cropperError').text().length > 0) {
      return;
    }

    this.cropper.getCroppedCanvas({fillColor: '#fff'}).toBlob((blob) => {
      //get original_file_name without file extension and set to PNG
      const filename = `${fileUploader.files.at(0).getOriginalNameNoExtension()}.png`;
      const file = new File([blob], filename, {type: "image/png"});
            
      const fileData = _.extend({}, 
        this.descriptionModel.getPageApiDataAttrs(), 
        this.documentTitleModel.getPageApiDataAttrs(), 
        {
          file_type: SIGNATURE_FILE_TYPE,
          fileObj: file, 
          file_name: `${this.filenameModel.getData()}.png`, 
          file_size: file.size,
          original_file_name: filename,
        },
      );
      fileUploader.files.each(fileModel => fileModel.set(fileData));

      this._uploadAddedFiles();
    });
  },

  _uploadAddedFiles() {
    loaderChannel.trigger('page:load');
    const fileUploader = this.getChildView('fileUploadRegion');

    fileUploader.uploadAddedFiles().done(() => {
      const selectedUser = this.associatedUserModel.getSelectedOption()._userModel;
      const profile = selectedUser.getProfile();
      profile.set({ signature_file_id: fileUploader.files.at(0).get('common_file_id') });
      profile.save(profile.getApiChangesOnly());
      this.trigger('save:complete');
      this.close();
    }).always(() => loaderChannel.trigger('page:load:complete'))
  },

  close() {
    const fileUploader = this.getChildView('fileUploadRegion');
    if (fileUploader) {
      fileUploader.clearNonUploadedFiles();
    }

    modalChannel.request('remove', this);
  },

  cancel() {
    const fileUploader = this.getChildView('fileUploadRegion');
    if (fileUploader) {
      fileUploader.trigger('cancel:all');
    }
  },

  _getAllUserOptions() {
    const canUserAccessSignature = (user) => user.isArbitrator() || user.isInformationOfficerSupervisor() || user.isInformationOfficerLead();
    // Get users this way to automatically filter out system and queue users
    const signatureUsers = [...userChannel.request('get:arbs'), ...userChannel.request('get:ios')].filter(canUserAccessSignature);
    return _.sortBy(
      signatureUsers.map(user => ({ text: user.getDisplayName(), value: String(user.id), _userModel: user })),
      option => option.text.toLowerCase()
    );
  },

  validateAndShowErrors() {
    const regionsToValidate = ['filenameRegion', 'documentFileTitleRegion', 'associatedUserRegion'];
    const selectedUser = this.associatedUserModel.getSelectedOption() ? this.associatedUserModel.getSelectedOption()._userModel : null;
    
    let isValid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    if (!selectedUser) return isValid;

    if (selectedUser.getProfile().get('signature_file_id') && this.signatures.findWhere({ common_file_id: selectedUser.getProfile().get('signature_file_id') })) {
      const userView = this.getChildView('associatedUserRegion');
      userView.showErrorMessage(SIGNATURE_ALREADY_EXISTS_ERROR);
      isValid = false;
    }

    return isValid;
  },

  changeFile() {
    const fileUploader = this.getChildView('fileUploadRegion');
    //if adding a file when there is already a selected file
    if (fileUploader.files.models.length > 1) {
      fileUploader.files.reset([fileUploader.files.models[1]]);
    }

    const file = fileUploader.files.at(0).get('fileObj');
    const fileExtension = file.type ? `${file.type.replace('image/','')}` : '';
    this.fileType = file.type; 
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.uploadError = "Type not allowed - not added";
      fileUploader.clearNonUploadedFiles();
      this.render();
      return;
    }
    this.uploadError = "";
    const reader = new FileReader();
    //load image into file reader
    reader.addEventListener('load', (event) => {
      this.cropperImage = event.target.result;
      const image = new Image();
      //Check for small image size
      image.onload = () => {
      if (image.width < MIN_IMAGE_WIDTH || image.height < MIN_IMAGE_HEIGHT) {
        this.uploadError = "Image less than 400w x 250h - not added";
        fileUploader.clearNonUploadedFiles();
        this.render();
        return;
      }
    };
      image.src = event.target.result; 

      this.render();
      this.getUI('save').removeClass('hidden');
      this.getUI('signatureWrapper').removeClass('hidden');
      this.getUI('signatureUser').removeClass('hidden');
      this.getUI('signatureCropButtons').removeClass('hidden');
    });
    //convert image to base64
    reader.readAsDataURL(file);
  },
  
  setupFileUploaderListeners(fileUploader) {
    if (!fileUploader) {
      return;
    }

    this.stopListening(fileUploader, 'change:files', this.changeFile);
    this.listenTo(fileUploader, 'change:files', this.changeFile, this);

    this.stopListening(fileUploader, 'upload:complete');
    this.listenTo(fileUploader, 'upload:complete', function() {
      this.trigger('upload:complete');
    }, this);
  },

  setupListeners() {
    this.listenTo(this.associatedUserModel, 'change:value', function(model) {
      const displayName = model.getSelectedOption() ? `${model.getSelectedOption().text}_signature` : null;
      this.filenameModel.set({value: displayName});
      const filenameView = this.getChildView('filenameRegion').render();
      if (filenameView && filenameView.isRendered()) {
        filenameView.render();
      }
    });
  },

  createSubModels() {
    this.descriptionModel = new TextareaModel({
      labelText: 'Document Description',
      errorMessage: 'Description is required',
      cssClass: 'optional-input',
      max: 1000,
      countdown: true,
      required: false,
      value: null,
      apiMapping: 'file_description'
    });

    this.filenameModel = new InputModel({
      labelText: 'Filename',
      errorMessage: 'Filename required',
      disabled: true,
      maxLength: 100,
      minLength: 5,
      required: true,
      value: null,
      apiMapping: 'file_name',
    });

    this.documentTitleModel = new InputModel({
      labelText: 'Document Title',
      errorMessage: 'Enter the document title',
      maxLength: 40,
      minLength: 5,
      required: true,
      value: null,
      apiMapping: 'file_title'
    });

    this.associatedUserModel = new DropdownModel({
      defaultBlank: true,
      optionData: this._getAllUserOptions(),
      labelText: 'Associated User',
      errorMessage: 'Choose a user',
      clearWhenHidden: true,
      required: true,
      value: null,
    });
  },

  /**
   * @param {String[]} [allowedFileTypes] - Pass in a list of allowed file extensions
   * @param {FileCollection} files - file collection to add and save signature file to
   * @param {FileCollection} signatures - file collection of already added signatures. Used to check for duplicates
   */

  initialize(options) {
    this.mergeOptions(options, ['allowedFileTypes', 'files', 'signatures']);
    this.allowedFileTypes = this.allowedFileTypes || [];
    this.fileType = '';
    this.cropperImage = '';
    this.fileExtension = '.png';
    this.cropperInfo = '';
    this.createSubModels();
    this.setupListeners();
  },

  checkForCropError(height, width, aspectRatio) {
    if (this.uploadError || !this.isRendered()) {
      return;
    }
    
    if (aspectRatio > MAX_CROPPER_ASPECT_RATIO) {
      this.getUI('cropperError').text(CROPPER_ASPECT_RATIO_ERROR);
    }
    else if (aspectRatio < MIN_CROPPER_ASPECT_RATIO) {
      this.getUI('cropperError').text(CROPPER_ASPECT_RATIO_ERROR);
    }
    else if (width < MIN_IMAGE_WIDTH) { 
      this.getUI('cropperError').text(CROPPER_MIN_SIZE_ERROR);
      // width < MIN_IMAGE_WIDTH - SIZE_OFFSET ? this.cropper.setData({width: MIN_IMAGE_WIDTH}) : null;
    }
    else if (height < MIN_IMAGE_HEIGHT) {
      this.getUI('cropperError').text(CROPPER_MIN_SIZE_ERROR);
      // height < MIN_IMAGE_HEIGHT - SIZE_OFFSET ? this.cropper.setData({height: MIN_IMAGE_HEIGHT}) : null;
    }
    else this.getUI('cropperError').text('');
  },

  onRender() {
    const fileType = this.fileType;
    const fileUploader = filesChannel.request('create:uploader', {
      processing_options: this.processing_options ? this.processing_options : {},
      files: this.files,
      file_creation_fn: function() {
        return _.extend({}, this.defaultFileCreationFn(...arguments), {
          file_type: fileType
          },
        );
      }
    });

    const image = this.$(signatureImageclassSelector)[0];

    this.cropper = new Cropper(image, {
      guides:false, //disabled show the dashed lines above the crop box
      minCropBoxWidth:50,
      minCropBoxHeight:50,
      viewMode: 3,//no grid around the cropper

      crop: (event) => {
        if(!this.isRendered()) return;
        const width = Math.round(event.detail.width);
        const height = Math.round(event.detail.height);
        const aspectRatio = (width / height).toFixed(1);
        this.checkForCropError(height, width, aspectRatio);
        this.getUI('cropperInfo').text(`W: ${width}px, H: ${height}px - Ratio: ${aspectRatio}`);
      },
    });

    image.addEventListener('ready', function () {
      this.cropper.setData({ width: MIN_IMAGE_WIDTH + SIZE_OFFSET, height: MIN_IMAGE_HEIGHT + SIZE_OFFSET });
    });

    this.showChildView('fileUploadRegion', fileUploader);
    this.showChildView('filenameRegion', new InputView({ model: this.filenameModel}));
    this.showChildView('documentFileTitleRegion', new InputView({ model: this.documentTitleModel }));
    this.showChildView('fileDescriptionRegion', new TextareaView({ model: this.descriptionModel }));
    this.showChildView('associatedUserRegion', new DropdownView({ model: this.associatedUserModel }));

    this.setupFileUploaderListeners(fileUploader);
  },

  templateContext() {
    return {
      cropperImage: this.cropperImage,
      fileExtension: this.fileExtension,
      uploadError: this.uploadError,
    } 
  }
});