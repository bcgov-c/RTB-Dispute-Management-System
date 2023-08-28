/**
 * @fileoverview - View for bypassing payments via the fee waiver process. Contains functionality for verifying fee waiver eligibility, and proof files upload.
 */
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import FeeWaiverEvidenceView from './FeeWaiverEvidence';
import InputView from '../../input/Input';
import DropdownView from '../../dropdown/Dropdown';
import CheckboxView from '../../checkbox/Checkbox';
import UploadViewMixin from '../../upload/UploadViewMixin';
import template from './FeeWaiver_template.tpl';

const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const paymentsChannel = Radio.channel('payments');
const Formatter = Radio.channel('formatter').request('get');

const FeeWaiverView = Marionette.View.extend({
  template,
  className: `office-fee-waiver-component office-upload-page`,

  regions: {
    payorNameRegion: '.office-payment-name',
    familyRegion: '.office-fee-waiver-family',
    incomeRegion: '.office-fee-waiver-income',
    cityRegion: '.office-fee-waiver-city',
    confirmRegion: '.office-fee-waiver-confirm',

    evidenceRegion: '.office-page-fee-waiver-evidence'
  },

  ui: {
    fileCounter: '.file-upload-counter',
    uploadingInstructions: '.da-uploading-instructions',
    uploadingFilesProgress: '.da-upload-overall-file-progress',
    step2Container: '.office-page-fee-waiver-step2',
    declinedMsg: '.office-page-error-block',
    error: '.error-block',
    cancel: '.btn-cancel',
    verify: '.btn-step1-validate',
    office: '.btn-step1-office',
    feeWaiverSubmit: '.btn-submit'
  },

  events: {
    'click @ui.cancel': 'mixin_upload_onCancel',
    'click @ui.verify': 'clickVerify',
    'click @ui.office': 'clickGoToOffice',
    'click @ui.feeWaiverSubmit': 'clickFeeWaiverSubmit'
  },

  onCancelButtonNoUpload() {
    this.model.trigger('cancel');
  },

  clickGoToOffice() {
    Backbone.history.navigate(`pay/${this.model.get('disputeFeeId')}`, { trigger: true, replace: true });
  },

  _onClickValidate() {
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
    return true;
  },

  clickVerify() {
    if (!this._onClickValidate()) {
      return;
    }
    
    loaderChannel.trigger('page:load');
    if (this._verifyLicoAmount()) {
      setTimeout(_.bind(function() {
        loaderChannel.trigger('page:load:complete'); 
        this.transitionToStep2();
        this.model.trigger('lico:approved');        
      }, this), 750);
    } else {
      this.model.trigger('lico:declined');
    }
  },

  clickFeeWaiverSubmit() {
    if (!this._onClickValidate()) {
      return;
    }
    this.model.trigger('upload:ready');
  },

  _verifyLicoAmount() {
    const income = Number(this.model.familyIncomeModel.getData());
    const familySize = Number(this.model.familyMemberCountModel.getData());
    const citySize = Number(this.model.citySizeDropdown.getData({ parse: true }));
    const licoAmount = paymentsChannel.request('get:lico', familySize, citySize);
    
    return income <= licoAmount;
  },

  
  /* Upload supporting functions */
  createFilePackageCreationPromise() {
    return $.Deferred().resolve().promise();
  },

  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = this.model.disputeFeeModel.get('payor_id');

    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const participantId = this.model.disputeFeeModel.get('payor_id');
    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        submitter_name: sessionChannel.request('name')
      });
    });
  },
  
  onUploadComplete() {
    this.isUpload = false;
    this.fileUploader = null;

    this.model.trigger('upload:complete', this.model.uploadModel.getPendingUploads());
  },
  /* End upload support functionality */

  

  disableStep1Inputs(options) {
    options = options || {};
    const inputsToDisable = [this.model.familyMemberCountModel, this.model.familyIncomeModel, this.model.citySizeDropdown,
        ...(options.all_inputs ? [this.model.payorModel] : []) ];
    _.each(inputsToDisable, function(model) {
      model.set('disabled', true, { silent: true });
    });
  },

  /**
   * 
   * @param {Boolean} [isUpload] - Controls whether the component is in upload state
   * @param {Boolean} [showPaymentDetails] - If true, displays the fee type and amount at the top
   * @param {Boolean} [showConfirm] - If true, shows a confirmation checkbox to the user which must be accepted to continue Step1
   * @param {Boolean} [hideUploadControls] - If true, does not show any component buuttons
   * @param {Boolean} [hideCancelButtonBeforeUploads] - If true, the component will not show a cancel button, only a Continue button.  The cancel button during proof uploads will always be shown regardless.
   * @param {Boolean} [hideButtonsWhenDeclined] - If true, the component's buttons will be hidden when a fee waiver is attempted but declined.
   * @param {String} [step1TitleText] - Text to display in the step 1 title header
   * @param {String} [step1DescriptionText] - Text to display directly underneath the step 1 title header
   * @param {String} [step2TitleText] - Text to display in the step 2 title header
   * @param {String} [step2DescriptionText] - Text to display directly underneath the step 2 title header
   * @param {String} [feeWaiverDeclinedText] - Text to display directly when the fee waier is declined
   */
  initialize(options) {
    this.mergeOptions(options, ['showPaymentDetails', 'showConfirm', 'hideUploadControls', 'step', 'isUpload', 'submitButtonText', 'hideCancelButtonBeforeUploads', 'hideButtonsWhenDeclined',
      'step1TitleText', 'step1DescriptionText', 'step2TitleText', 'step2DescriptionText', 'feeWaiverDeclinedText']);
    this.currentUser = sessionChannel.request('get:user');
    this.fileUploader = null;
    
    this.isDeclined = false;
    this.isCancel = false;

    // The upload mixin uses "uploadModel" on the view, so have to define that here
    this.uploadModel = this.model.uploadModel;

    if (!this.model.disputeFeeModel || this.model.disputeFeeModel.isPaid()) {
      console.log(`[Error] Loaded fee waiver page with no active unpaid dispute fee`);
      Backbone.history.navigate('main', { trigger: true, replace: true });
      return;
    }
    
    this.step1Group = [
      'payorNameRegion', 'familyRegion', 'incomeRegion', 'cityRegion', ...(this.showConfirm ? ['confirmRegion'] : [])
    ];
    this.step2Group = _.union([], this.step1Group, ['evidenceRegion']);

    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model.evidenceModel, 'update', function() {
      this.model.trigger('update:file:count');
      this.hideErrorMessage();
      this.mixin_upload_updateReadyToUploadCount();
    }, this);

    this.listenTo(this.model, 'transition:declined', this.transitionToDeclined, this);
    this.listenTo(this.model, 'upload:start', function() {
      const self = this;
      this.mixin_upload_transitionToUploadStep().always(function() {
        setTimeout(function() {
          if (self.isCancel) {
            return;
          }
          self.mixin_upload_startUploads();
        }, 1000);
      });
    }, this);
  },

  validateAndShowErrors() {
    const isStep1 = this.model.isStep1();
    const groupToValidate = isStep1 ? this.step1Group : this.step2Group;
    const feeWaiverEvidenceCollection = this.model.evidenceModel.get('evidenceCollection');
    
    let is_valid = true;
    _.each(groupToValidate, function(viewName) {
      const view = this.getChildView(viewName);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    if (this.model.isStep2()) {
      if (feeWaiverEvidenceCollection.all(function(disputeEvidenceModel) {
        return !disputeEvidenceModel.getReadyToUploadFiles().length
      })) {
        is_valid = false;
        this.showErrorMessage('Please add at least one fee waiver proof file');
      }
    }
    return is_valid;
  },

  transitionToStep2() {
    this.model.set('step', 2);
    this.disableStep1Inputs();
    this.render();

    setTimeout(_.bind(function() {
      animationChannel.request('queue', this.getUI('step2Container'), 'scrollPageTo');
    }, this), 200);
  },

  transitionToDeclined() {
    this.model.set('step', 1);
    this.isDeclined = true;
    this.disableStep1Inputs({ all_inputs: true });
    this.render();

    setTimeout(_.bind(function() {
      animationChannel.request('queue', this.getUI('declinedMsg'), 'scrollPageTo');
    }, this), 200);
  },

  showErrorMessage(error_msg) {
    this.getUI('error').html(error_msg);
  },

  hideErrorMessage() {
    this.getUI('error').html('');
  },

  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
    } else {
      this.showChildView('payorNameRegion', new InputView({ model: this.model.payorModel })); 
      this.showChildView('familyRegion', new InputView({ model: this.model.familyMemberCountModel }));
      this.showChildView('incomeRegion', new InputView({ model: this.model.familyIncomeModel }));
      this.showChildView('cityRegion', new DropdownView({ model: this.model.citySizeDropdown }));

      if (this.showConfirm) this.showChildView('confirmRegion', new CheckboxView({ model: this.model.confirmModel }));
    }
  
    if (this.model.isStep2()) {
      this.showChildView('evidenceRegion', new FeeWaiverEvidenceView({
        mode: this.isUpload ? 'upload' : null,
        model: this.model.evidenceModel,
        uploadModel: this.model.uploadModel
      }));
    }
  },

  templateContext() {
    const paymentAmountDisplay = this.model.disputeFeeModel ? Formatter.toAmountDisplay(this.model.disputeFeeModel.get('amount_due'), true) : null;
    return {
      hideUploadControls: this.hideUploadControls,
      showPaymentDetails: this.showPaymentDetails,
      paymentTypeDisplay: this.model.disputeFeeModel ? Formatter.toFeeTypeDisplay(this.model.disputeFeeModel.get('fee_type')) : null,
      paymentAmountDisplay,
      fileNumber: disputeChannel.request('get:filenumber'),
      isUpload: this.isUpload,
      isDeclined: this.isDeclined,
      isStep1: this.model.isStep1(),
      isStep2: this.model.isStep2(),

      submitButtonText: this.submitButtonText || 'Submit',
      hideCancelButtonBeforeUploads: this.hideCancelButtonBeforeUploads,
      hideButtonsWhenDeclined: this.hideButtonsWhenDeclined,
      
      feeWaiverDeclinedText: this.feeWaiverDeclinedText || `The income information provided does not meet the criteria for these fees to be waived.  The rejected fee waiver request has been stored on the dispute file.  This applicant is required to pay the full ${paymentAmountDisplay ? paymentAmountDisplay : '-' } fee to continue.`,
      step1TitleText: this.step1TitleText || 'Enter the income information for the applicants',
      step1DescriptionText: this.step1DescriptionText || `For an applicant to qualify to not pay a fee they must provide income information for all tenants on the Tenancy Agreement and their family members or dependents.  Proof of income is also required for all tenants and family members for all income sources.`,
      step2TitleText: this.step2TitleText || 'Provide proof of the above income',
      step2DescriptionText: this.step2DescriptionText || 'This fee waiver has been approved based on the applicant income information provided.  The applicant must now provide proof of income from all sources to substantiate the stated income.  At least one proof of income file must be provided to complete the payment process.'
    };
  }

});

_.extend(FeeWaiverView.prototype, UploadViewMixin);
export default FeeWaiverView;
