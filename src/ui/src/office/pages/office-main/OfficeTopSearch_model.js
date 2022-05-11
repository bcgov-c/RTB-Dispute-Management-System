import Backbone from 'backbone';
import Radio from 'backbone.radio';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';

const FILE_TYPE_CODE_EXISTING = '1';
const FILE_TYPE_CODE_NEW = '2';
const FILE_IDENTIFIER_CODE_NUMBER = '1';
const FILE_IDENTIFIER_CODE_ACCESS = '2';

const configChannel = Radio.channel('config');

export default Backbone.Model.extend({

  defaults: {
    appModel: null,
    codeTypeErrorMsg: null,
    showFileNotFoundError: false,
    showParticipantRemovedError: false,
    reviewNotificationDisplayed: false,
    isAccessCodeLookupMode: false
  },

  initialize() {
    this.ACCESS_CODE_LENGTH = Radio.channel('config').request('get', 'ACCESS_CODE_LENGTH');
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.fileTypeModel = new DropdownModel({
      defaultBlank: true,
      optionData: [{ value: FILE_TYPE_CODE_EXISTING, text: 'Existing' }, { value: FILE_TYPE_CODE_NEW, text: 'New' }],
      labelText: 'File Type',
      errorMessage: 'Required',
      required: true,
      value: null,
    });

    const isFileTypeExistingSelected = this.isFileTypeExistingSelected();
    this.fileIdentifierModel = new DropdownModel({
      defaultBlank: true,
      optionData: [{ value: FILE_IDENTIFIER_CODE_NUMBER, text: 'File Number' }, { value: FILE_IDENTIFIER_CODE_ACCESS, text: 'Dispute Access Code' }],
      labelText: 'File Identifier',
      disabled: !isFileTypeExistingSelected,
      required: isFileTypeExistingSelected,
      value: null,
    });

    const isFileNumberIdentifierSelected = this._isFileNumberIdentifierSelected();
    this.fileNumberModel = new InputModel({
      labelText: 'File Number',
      errorMessage: 'Enter the File Number',
      inputType: 'dispute_number',
      maxLength: 9,
      disabled: !isFileTypeExistingSelected,
      required: isFileTypeExistingSelected && isFileNumberIdentifierSelected,
      value: null,
    });

    this.accessCodeModel = new InputModel({
      name: 'access-code',
      autocomplete: false,
      labelText: 'Dispute Access Code',
      errorMessage: 'Enter the Access Code',
      inputType: 'access_code',
      maxLength: this.ACCESS_CODE_LENGTH,
      subLabel: ' ',
      restrictedCharacters: InputModel.getRegex('whitespace__restricted_chars'),
      disabled: !isFileTypeExistingSelected,
      required: isFileTypeExistingSelected && !isFileNumberIdentifierSelected,
      value: null
    });

    this.codeTypeModel = new DropdownModel({
      optionData: [{ value: String(configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT')), text: 'Tenant', },
          { value: String(configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD')), text: 'Landlord', }],
      defaultBlank: true,
      labelText: 'Access Code For',
      required: isFileTypeExistingSelected && !isFileNumberIdentifierSelected,
      errorMessage: 'Enter the type',
      value: null,
    });
  },

  setToAccessCodeLookupState(fileIdentifierType, participantType, accessCode) {
    this.fileIdentifierModel.set({ value: fileIdentifierType });
    this.codeTypeModel.set({ value: String(participantType), disabled: true });
    this.accessCodeModel.set({ value: accessCode, disabled: true });
    this.set({ isAccessCodeLookupMode: true });
  },

  resetAccessCodeLookupState() {
    this.codeTypeModel.set({ value: null, disabled: false });
    this.accessCodeModel.set({ value: null, disabled: false });
    this.set({ isAccessCodeLookupMode: false });
  },

  setToFileNumberSearchState(fileNumber) {
    this.fileTypeModel.set({ value: FILE_TYPE_CODE_EXISTING });
    this.fileIdentifierModel.set({ value: FILE_IDENTIFIER_CODE_NUMBER, disabled: false });
    this.accessCodeModel.set({ disabled: false });
    this.fileNumberModel.set({value: fileNumber }, { silent: true });
  },

  isFileTypeNewSelected() {
    return this.fileTypeModel.getData() === FILE_TYPE_CODE_NEW;
  },

  isFileTypeExistingSelected() {
    return this.fileTypeModel.getData() === FILE_TYPE_CODE_EXISTING;
  },

  _isFileNumberIdentifierSelected() {
    return this.fileIdentifierModel.getData()  === FILE_IDENTIFIER_CODE_NUMBER;
  },

  _isAccessCodeIdentifierSelected() {
    return this.fileIdentifierModel.getData()  === FILE_IDENTIFIER_CODE_ACCESS;
  },

  _isAccessCodeLookupMode() {
    return this.get('isAccessCodeLookupMode');
  },

  setupListeners() {
    this.stopListening(this.fileTypeModel, 'change:value');
    this.listenTo(this.fileTypeModel, 'change:value', function(model, value) {
      const isExisting = (value === FILE_TYPE_CODE_EXISTING);
      const isNew = (value === FILE_TYPE_CODE_NEW);
      const inputDataToSet = _.extend({
        disabled: !isExisting,
        required: isExisting
      }, isNew ? { value: null } : {});

      this.fileIdentifierModel.set(inputDataToSet, { silent: true });
      this.fileNumberModel.set(inputDataToSet, { silent: true });
      this.accessCodeModel.set(inputDataToSet, { silent: true });
      this.codeTypeModel.set({ required: isExisting });

      if (isExisting) {
        // Trigger handler on the file identifier change
        this.fileIdentifierModel.set({ value: FILE_IDENTIFIER_CODE_ACCESS}, { silent: false });
      }

      this.trigger('refresh');
      if (isNew) {
        this.set({ isAccessCodeLookupMode: false });
        this.trigger('search');
      }
    }, this);

    this.stopListening(this.fileIdentifierModel, 'change:value');
    this.listenTo(this.fileIdentifierModel, 'change:value', function(model, value) {
      const isFileNumber = value === FILE_IDENTIFIER_CODE_NUMBER;
      const isAccessCode = value === FILE_IDENTIFIER_CODE_ACCESS;
      
      if (isFileNumber) this.set({ isAccessCodeLookupMode: false });

      this.fileNumberModel.set({
        required: isFileNumber,
        value: null
      }, { silent: true });

      this.accessCodeModel.set({
        required: isAccessCode,
        value: null,
        disabled: false
      }, { silent: true });
      
      this.codeTypeModel.set({
        required: isAccessCode,
        disabled: false,
        value: null
      }, { silent: true });
      
      this.trigger('refresh');
    }, this);
  },


  // Returns a Promise for the action that should be performed based on this component's state
  _getCurrentActionPromise() {
    const appModel = this.get('appModel');
    let disputeLoadPromise;
    if (this.isFileTypeNewSelected()) {
      disputeLoadPromise = _.bind(function() {
        appModel.initializeNewDispute();
        return $.Deferred().resolve().promise();
      }, this);
    } else {
      if (this._isFileNumberIdentifierSelected()) {
        disputeLoadPromise = _.bind(appModel.performFileNumberSearch, appModel, this.fileNumberModel.getData());
      } else {
        disputeLoadPromise = _.bind(appModel.performAccessCodeSearch, appModel, this.accessCodeModel.getData());
      }
    }

    return disputeLoadPromise;
  },

  runCurrentActionPromise() {
    // Get and invoke current promise
    return this._getCurrentActionPromise()();
  },

  clearWithDefaults(appModel) {
    const attrsToSet = Object.assign({}, this.defaults, appModel ? { appModel } : { appModel: this.get('appModel') });
    this.set(attrsToSet, { silent: true });

    this.createSubModels();
    this.setupListeners();
  }

});