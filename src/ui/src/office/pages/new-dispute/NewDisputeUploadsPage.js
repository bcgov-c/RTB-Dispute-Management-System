import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import AddressModel from '../../../core/components/address/Address_model';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import UploadEvidenceView from '../../../evidence/pages/upload/UploadEvidence';
import UploadModel from '../../../core/components/upload/UploadMixin_model';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import ExternalDisputeInfoModel from '../../components/external-api/ExternalDisputeInfo_model';
import ExternalDisputeStatusModel from '../../components/external-api/ExternalDisputeStatus_model';
import template from './NewDisputeUploadsPage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const FORM_EVIDENCE_HELP = `Upload the main application form(s) and related forms (e.g. RTB-26 Schedule of parties form, Other Issues form, or RTB-13 Application for Substituted Service form).
<br/>DO NOT UPLOAD EVIDENCE FILES HERE - SEPARATE THEM FROM THE APPLICATION FORMS`;
const BULK_EVIDENCE_HELP = `Upload evidence, evidence worksheets (i.e. monetary order worksheets, direct request worksheets) and tenancy agreements here.
<br/>DO NOT UPLOAD APPLICATION FORMS HERE`;
const BULK_EVIDENCE_TITLE = 'Bulk Evidence to Support Application';
const NO_ADDRESS_MSG = `<i>Cannot be displayed on resumed applications for privacy purposes</i>`;
const FORM_EVIDENCE_MISSING_MSG = 'You must add the application form(s) to continue';
const BULK_EVIDENCE_MISSING_MSG = 'You must add the required evidence to continue';

const sessionChannel = Radio.channel('session');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const paymentsChannel = Radio.channel('payments');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

const NewDisputeUploadsPageView = PageView.extend({
  template,
  className: `${PageView.prototype.className} office-page-new-dispute-uploads office-upload-page`,

  regions: {
    dateReceivedRegion: '.office-new-dispute-date-received',
    formEvidenceRegion: '.office-page-new-dispute-form-evidence',
    bulkEvidenceRegion: '.office-page-new-dispute-bulk-evidence',
    applicationNoteRegion: '.office-application-note',
  },

  ui: {
    // Upload UI items
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',

    formError: '.office-form-evidence-error',
    bulkError: '.office-bulk-evidence-error',
    cancel: '.btn-cancel',
    upload: '.btn-continue'
  },

  events: {
    'click @ui.cancel': 'mixin_upload_onCancel',
    'click @ui.upload': 'clickUpload'
  },

  onCancelButtonNoUpload() {
    modalChannel.request('show:standard', {
      modalCssClasses: 'modal-office-new-dispute-upload-later',
      title: 'Application Not Complete',
      bodyHtml: `
        <p>If you do not provide the required uploads with this application the payment cannot be made and the file will not be considered submitted or received by the RTB. We highly recommend you upload all forms now and receive payment to complete this submission unless these tasks cannot be performed now.</p>
        <p>Are you sure you cannot complete this submission now?</p>
      `,
      cancelButtonText: 'No, complete now',
      primaryButtonText: 'Yes, complete later',

      onContinueFn: (modalView) => {
        modalView.close();

        this.model.set('_newDisputeSkipUploads', true);
        Backbone.history.navigate('new/receipt', { trigger: true });
      }
    });
  },

  clickUpload() {
    this.hideFormError();
    this.hideBulkError();
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    // Save any application note (if entered) into the file description
    const noteValue = this.applicationNoteModel.getData();
    if (noteValue) {
      this.formEvidenceModel.get('descriptionModel').set('value', `${this.OFFICE_FORM_EVIDENCE_DESCRIPTION} - APPLICATION NOTE: ${noteValue}`);
      this.formEvidenceModel.saveInternalDataToModel();
    }

    const self = this;
    this.mixin_upload_transitionToUploadStep().always(function() {
      setTimeout(function() {
        if (self.isCancel) {
          return;
        }
        self.mixin_upload_startUploads();
      }, 1000);
    });
  },


  initialize() {
    this.model.set('_newDisputeSkipUploads', false);

    this.dispute = disputeChannel.request('get');
    this.formCode = this.model.getFormCodeUsedFromLoadedDispute();
    this.formConfig = configChannel.request('get:evidence', this.formCode);
    this.fileUploader = null;
    this.isUpload = false;
    this.isCancel = false;

    this.OFFICE_FORM_EVIDENCE_DESCRIPTION = configChannel.request('get', 'OFFICE_FORM_EVIDENCE_DESCRIPTION');
    this.OS_APPLICATION_NOTE_MIN_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MIN_LENGTH');
    this.OS_APPLICATION_NOTE_MAX_LENGTH = configChannel.request('get', 'OS_APPLICATION_NOTE_MAX_LENGTH');

    if (!this.formCode || _.isEmpty(this.formConfig)) {
      alert("[Error] Invalid application form data configuration.  This process cannot continue.  Please contact RTB for support.");
      Backbone.history.navigate('main', { trigger: true });
      return;
    }
    
    this.isPrivateMode = !this.dispute.get('tenancy_address');
    this.currentUser = sessionChannel.request('get:user');
    
    this.createSubModels();
    this.setupListeners();
    
    this.step2Group = ['dateReceivedRegion', 'formEvidenceRegion', 'bulkEvidenceRegion', 'applicationNoteRegion'];
  },

  createSubModels() {
    this.dateReceivedModel = new InputModel({
      labelText: 'Date received',
      inputType: 'date',
      errorMessage: 'Enter the received date',
      required: true,
      minDate: Moment().subtract(configChannel.request('get', 'STAFF_BACKDATE_OFFSET') || 0, 'days'),
      value: Moment().format(InputModel.getDateFormat()),
      apiMapping: 'submitted_date'
    });

    this.uploadModel = new UploadModel();


    const primaryApplicantId = participantsChannel.request('get:primaryApplicant:id');
    const matchingFormFileDescription = filesChannel.request('get:filedescription:code', this.formCode);
    this.formEvidenceModel = new DisputeEvidenceModel({
      helpHtml: FORM_EVIDENCE_HELP,
      title: this.formConfig.title,
      evidence_id: this.formCode,
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_GENERAL'),
      description_by: !matchingFormFileDescription ? primaryApplicantId : null,
      mustProvideNowOrLater: true,
      required: true,
      file_description: matchingFormFileDescription ? matchingFormFileDescription : null
    });
    this.formEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: this.OFFICE_FORM_EVIDENCE_DESCRIPTION
    });
    this.formEvidenceModel.saveInternalDataToModel();

    this.bulkEvidenceModel = new DisputeEvidenceModel({
      helpHtml: BULK_EVIDENCE_HELP,
      evidence_id: configChannel.request('get', 'EVIDENCE_CODE_BULK'),
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_BULK'),
      title: BULK_EVIDENCE_TITLE,
      description_by: primaryApplicantId,
      mustProvideNowOrLater: true,
      required: true // NOTE: This check will be handled using page controls
    });
    this.bulkEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: configChannel.request('get', 'OFFICE_BULK_EVIDENCE_DESCRIPTION')
    });
    this.bulkEvidenceModel.saveInternalDataToModel();

    this.applicationNoteModel = new InputModel({
      labelText: 'Application Note',
      minLength: this.OS_APPLICATION_NOTE_MIN_LENGTH,
      maxLength: this.OS_APPLICATION_NOTE_MAX_LENGTH,
      required: false,
      apiMapping: 'application_note'
    });
  },

  setupListeners() {
    this.listenTo(this.formEvidenceModel, 'update:evidence', this.hideFormError, this);
    this.listenTo(this.bulkEvidenceModel, 'update:evidence', this.hideBulkError, this);
    this.listenTo(this.formEvidenceModel, 'update:evidence', this.mixin_upload_updateReadyToUploadCount, this);
    this.listenTo(this.bulkEvidenceModel, 'update:evidence', this.mixin_upload_updateReadyToUploadCount, this);
    this.listenTo(this.uploadModel, 'update:file:count', this.mixin_upload_updateReadyToUploadCount, this);
  },
  
  
  /* Upload supporting functions */
  filesToUploadContainEvidence() {
    return _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.isEvidence();
    });
  },

  createFilePackageCreationPromise() {
    const fileDate = this.dateReceivedModel.getData();
    const filePackagePromise = this.filesToUploadContainEvidence() ?
      filesChannel.request('create:filepackage:office', {
        package_date: fileDate,
        package_description: `Uploaded on ${Formatter.toDateAndTimeDisplay(Moment())}`,
      })
      : $.Deferred().resolve().promise();

    return filePackagePromise;
  },

  _getParticipantIdForUploads() {
    return this.dispute.get('tokenParticipantId') || participantsChannel.request('get:primaryApplicant:id');
  },

  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = this._getParticipantIdForUploads();
    
    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const participantId = this._getParticipantIdForUploads();
    const fileDate = this.dateReceivedModel.getData();

    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        file_date: fileDate ? fileDate : null,
        submitter_name: sessionChannel.request('name')
      });
    });
  },

  routingGoToPaymentsOrReceipt() {
    const intakeFee = paymentsChannel.request('get:fee:intake');
    if (intakeFee && intakeFee.isPaid()) {
      Backbone.history.navigate('new/receipt', { trigger: true });
    } else {
      Backbone.history.navigate('new/3', { trigger: true, replace: true });
    }
  },


  onUploadComplete() {
    this.isUpload = false;
    this.fileUploader = null;
    
    const routeToNextStepFn = _.bind(function() {
      this.routingGoToPaymentsOrReceipt();
    }, this);
    const routeToNoUploadsReceiptFn = _.bind(function() {
      Backbone.history.navigate('new/receipt', { trigger: true });
    }, this);

    const anyFilesUploaded = _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.getUploadedFiles().length;
    });

    loaderChannel.trigger('page:load');
    if (anyFilesUploaded) {
      $.whenAll(this._saveDisputePaymentStatus(), this._saveDisputeSubmittedDate())
        .done(() => this._checkAndShowFileUploadErrors(routeToNextStepFn))
        .fail(() => {
          // Error messaging is handled in saveDisputePaymentStatus and saveDisputeSubmittedDate
          this._checkAndShowFileUploadErrors( routeToNextStepFn );
        }).always(() => loaderChannel.trigger('page:load:complete'));
    } else {
      this._checkAndShowFileUploadErrors(routeToNoUploadsReceiptFn);
    }
  },

  _checkAndShowFileUploadErrors(routingFn) {
    const upload_error_files = [];
    _.each(this.uploadModel.getPendingUploads(), function(e) {
      upload_error_files.push( ...(e.get('files').filter(function(f) { return f.isUploadError(); })) );
    });

    if (!_.isEmpty(upload_error_files)) {
      filesChannel.request('show:upload:error:modal', upload_error_files, () => {
        loaderChannel.trigger('page:load');
        routingFn();
      });
    } else {
      setTimeout(routingFn, 500);
    }
  },
  /* End upload support functionality */

  _saveDisputeSubmittedDate() {
    // Always update the submitted date
    return (new ExternalDisputeInfoModel( this.dispute.toJSON() )).save( this.dateReceivedModel.getPageApiDataAttrs() )
      .catch(err => new Promise((resolve, reject) => generalErrorFactory.createHandler('OS.DISPUTE.SAVE', reject, `There was an issue updating the dispute's status after uploads.`)(err) ));
  },

  _saveDisputePaymentStatus() {
    const intakeFee = paymentsChannel.request('get:fee:intake');
    const intakeFeePaid = intakeFee && intakeFee.isPaid();
    
    const statusSaveModel = new ExternalDisputeStatusModel({
      file_number: this.dispute.get('file_number'),
      // Set to Application Received if fee is paid, otherwise set to Ready for Payment
      dispute_stage: intakeFeePaid ? 2 : 0,
      dispute_status: intakeFeePaid ? 20 : 2
    });

    const canUpdateStatus = this.dispute.checkStageStatus(0, 5) || (this.dispute.checkStageStatus(0, 6) && intakeFeePaid)

    const statusUpdatePromise = canUpdateStatus ? _.bind(statusSaveModel.save, statusSaveModel) : () => $.Deferred().resolve().promise();
    const dfd = $.Deferred();
        
    statusUpdatePromise().done(response => {
      if (!_.isEmpty(response)) {
        this.dispute.set(_.extend({ status: response }, response));
      }
      dfd.resolve();
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('OS.STATUS.SAVE', () => dfd.reject(), `There was an issue updating the dispute's status after the payment was recorded.`);
      handler(err);
    });

    return dfd.promise();
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.step2Group, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);
    
    if (!this.formEvidenceModel.getReadyToUploadFiles().length) {
      this.showFormError();
      is_valid = false;
    }

    if (this.dispute.isNonParticipatory() && !this.bulkEvidenceModel.getReadyToUploadFiles().length) {
      this.showBulkError();
      is_valid = false;
    }

    return is_valid;
  },

  showFormError() {
    this.getUI('formError').html(FORM_EVIDENCE_MISSING_MSG).show();
  },

  hideFormError() {
    this.getUI('formError').html('').hide();
  },

  showBulkError() {
    this.getUI('bulkError').html(BULK_EVIDENCE_MISSING_MSG).show();
  },

  hideBulkError() {
    this.getUI('bulkError').html('').hide();
  },

  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
    } else {
      this.showChildView('dateReceivedRegion', new InputView({ model: this.dateReceivedModel }));
    }

    const processingOptionsForDuplicates = {
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been selected to be uploaded`,
      customFileValidationFn: ((fileObj) => {
        const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
        const fileComparisonFn = (fileModel) => {
          if (!fileModel) return false;
          return fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
        };
        const matchingFileObj = _.find(this.uploadModel.getPendingUploads(), disputeEvidenceModel => {
          const files = disputeEvidenceModel.get('files');
          return files && files.find(fileComparisonFn);
        });
        return !matchingFileObj;
      }).bind(this)
    };

    this.showChildView('formEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.formEvidenceModel,
      showDelete: false,
      hideDescription: true,
      mode: this.isUpload ? 'upload' : null,
      fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
      processing_options: processingOptionsForDuplicates
    }));

    this.showChildView('bulkEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.bulkEvidenceModel,
      showDelete: false,
      hideDescription: true,
      mode: this.isUpload ? 'upload' : null,
      processing_options: processingOptionsForDuplicates
    }));

    this.showChildView('applicationNoteRegion', new InputView({ model: this.applicationNoteModel }));
  },

  templateContext() {
    const rentalAddressApiMappings = {
      street: 'tenancy_address',
      city: 'tenancy_city',
      country: 'tenancy_country',
      postalCode: 'tenancy_zip_postal',
      geozoneId: 'tenancy_geozone_id',
      unitType: 'tenancy_unit_type',
      unitText: 'tenancy_unit_text'
    };
    this.addressEditModel = new AddressModel({
      json: _.mapObject(rentalAddressApiMappings, function(val, key) { return this.dispute.get(val); }, this),
    });

    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    return {
      isUpload: this.isUpload,
      isPrivateMode: this.isPrivateMode,
      Formatter,
      dispute: this.dispute,
      fileNumber: this.dispute.get('file_number'),
      addressDisplay: !this.isPrivateMode ? this.addressEditModel.getAddressString() : NO_ADDRESS_MSG,
      isBusiness: primaryApplicant.isBusiness(),
      primaryApplicant: participantsChannel.request('get:primaryApplicant'),
    };
  }
});

_.extend(NewDisputeUploadsPageView.prototype, UploadViewMixin);
export default NewDisputeUploadsPageView;
