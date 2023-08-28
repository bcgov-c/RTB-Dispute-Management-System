import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import UploadMixinModel from '../../../core/components/upload/UploadMixin_model';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import UploadEvidenceView from '../upload/UploadEvidence';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import DocRequestSelectView from '../../../core/components/documents/doc-requests/DocRequestSelect';
import DocRequestModel from '../../../core/components/documents/doc-requests/DocRequest_model';
import DocRequestItemModel from '../../../core/components/documents/doc-requests/DocRequestItem_model';
import FileDescription from '../../../core/components/files/file-description/FileDescription_model';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import PageItem from '../../../core/components/page/PageItem';
import { CcrRequestItem } from '../../components/ccrRequestItem/CcrRequestItem';
import { CorrectionRequestItems } from './CorrectionRequestItems';
import { showDocumentOptOutModal } from '../../components/optout-modal/OptoutModal';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './CorrectionClarificationPage.scss';

const DEFAULT_DA_CORR_CLAR_MAX_REQUESTS = 3;
const correctionDescriptionLabel = "Please provide a description for each correction that you are requesting";
const clarificationDescriptionLabel = "Please provide the information on the clarification you are seeking, a clear description, and why it is needed";

const correctionIntroText = <>
  <p>If the decision or an order contains typographic, grammatical, arithmetic, obvious errors or inadvertent omissions you may submit a Request for Correction.</p>
  <p>Please review&nbsp;<a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl25.pdf">Policy Guideline 25: Requests for Clarification or Correction of Orders and Decisions</a>&nbsp;or visit the&nbsp;<a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Residential Tenancy Branch website</a> for more information.</p>
  <p>If you requested and obtained a copy of the hearing recording from the Residential Tenancy Branch, do not submit it as part of your request for correction</p>
</>;
const clarificationIntroText = <>
  <p>The Residential Tenancy Branch can clarify a decision or order(s) if a party is unclear about or does not understand the decision, order or reasons. Clarification allows the Residential Tenancy Branch to explain, but not to change, the decision.</p>
  <p>Either party can submit a Request for Clarification to the Residential Tenancy Branch. Requests for Clarification should be received by the Residential Tenancy Branch within 15 days of the party receiving the decision or order(s) and must include a copy of the decision and/or order(s).</p>
  <p>Please review&nbsp;<a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl25.pdf">Policy Guideline 25: Requests for Clarification or Correction of Orders and Decisions</a> or visit the <a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Residential Tenancy Branch website</a>&nbsp;for more information.</p>
  <p>If you requested and obtained a copy of the hearing recording from the Residential Tenancy Branch, do not submit it as part of your request for clarification</p>
</>;

const correctionInfoText = <p>
  <b>Important: </b>The Request for Correction is not an opportunity to re-argue the dispute for the purpose of seeking a different outcome, or submit further evidence for any purpose other than to support a legitimate Request for Correction (misspelled name, incorrect address, math error, obvious errors or inadvertent omissions).
</p>;

const clarificationInfoText = <p>
  <b>Important: </b>The Request for Clarification is not an opportunity to re-argue the dispute for the purpose of seeking a different outcome, or submit further evidence for any purpose other than to support a legitimate Request for Clarification.
</p>;

const correctionTerms = `I understand that the Request for Correction process cannot be used to re-argue the dispute for the purpose of seeking a different outcome or submit any evidence for any other issue than the requested correction. I certify that I have only made a Request for Correction to correct items like a misspelled name, incorrect address, math error, obvious errors or inadvertent omissions.`;
const clarificationTerms = `I understand that the Request for Clarification process cannot be used to re-argue the dispute for the purpose of seeking a different outcome or submit any evidence for any issue other than the requested clarification. I certify that I have only made a Request for Clarification to seek a better understanding of the decision or order(s).`;

const correctionReceivedDateHelp = `A request for correction for obvious errors and inadvertent omissions must be received 15 days from the date the decision or order was received. There is no time limit for requesting corrections on items like a misspelled name, incorrect address or math error.`;
const clarificationReceivedDateHelp = `A request for clarification must be received 15 days from the date the decision or order was received.`;

const correctionDocHelp = 'Please ensure that the date matches the decision or order you would like to have corrected.';
const clarificationDocHelp = 'Please ensure that the date matches the decision or order you would like to have clarified.';

const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const taskChannel = Radio.channel('tasks');
const animationChannel = Radio.channel('animations');
const flagsChannel = Radio.channel('flags');

/**
 * @param {Backbone.Model} model - model from application.js containing information from /accesscodefileinfo. Used to populate AccessDisputeOverview
 */

const CorrectionClarificationView = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['isCorrection']);
    this.template = this.template.bind(this);
    
    this.dispute = disputeChannel.request('get');
    const participantId = this.dispute.get('tokenParticipantId');
    
    this.REQUEST_TYPE_TEXT = this.isCorrection ? 'correction' : 'clarification'
    this.ADD_FILES_TEXT = `Documents that require ${this.REQUEST_TYPE_TEXT}`;
    this.requestType = this.isCorrection ? configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CORRECTION') : configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CLARIFICATION')
    this.DA_CORR_CLAR_MAX_REQUESTS = configChannel.request('get', 'DA_CORR_CLAR_MAX_REQUESTS') || DEFAULT_DA_CORR_CLAR_MAX_REQUESTS;
    this.numSubmittedCC = (documentsChannel.request('get:requests')||[]).filter(doc => doc.get('submitter_id') === participantId && (doc.isCorrection() || doc.isClarification())).length;
    this.isRequestLimitExceeded = this.numSubmittedCC >= this.DA_CORR_CLAR_MAX_REQUESTS;
    
    this.setupModels();
    this.createSubModels();
    this.setupListeners();
    
    // Upload support vars
    this.fileUploader = null;
    this.isCancel = false;
    this.isUpload = false;
    this.evidenceRequired = true;
  },

  setupModels() {
    const participantId = this.dispute.get('tokenParticipantId');
    this.docRequestModel = new DocRequestModel({ request_type: this.requestType, dispute_guid: this.dispute.get('dispute_guid'), submitter_id: participantId });
    
    // Init doc request model itemlist with one item
    const docRequestItem = new DocRequestItemModel();
    this.docRequestModel.getRequestItems().add(docRequestItem);

    this.fileDescription = new FileDescription({
      title: this.ADD_FILES_TEXT,
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST'),
      description: " "
    });
    this.disputeEvidenceModel = new DisputeEvidenceModel({ file_description: this.fileDescription, required: true });
    this.uploadModel = new UploadMixinModel();
  },

  createSubModels() {
    this.dateReceivedModel = new InputModel({
      labelText: 'Date document received',
      inputType: 'date',
      errorMessage: 'Enter a date',
      required: true,
      showValidate: true,
      value: null,
    });
    
    this.termsCheckbox = new CheckboxModel({
      html: this.isCorrection ? correctionTerms : clarificationTerms,
      checked: false,
      required: true
    });
  },

  setupListeners() {
    this.listenTo(this.uploadModel, 'file:added', () => {
      this.getUI('addFileError').addClass('hidden');
    });

    this.listenTo(this.termsCheckbox, 'change:checked', (model, isChecked) => {
      if (isChecked) {
        this.termsCheckbox.set('disabled', true);
        this.render();
      }
    });
  },

  getProcessingOptions() {
    const processingOptionsForDuplicates = {
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been selected to be uploaded`,
      customFileValidationFn: ((fileObj) => {
        const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
        const fileComparisonFn = (fileModel) => {
          if (!fileModel) return false;
          return fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
        };
        const matchingFileObj = _.find(this.model.getPendingUploads(), disputeEvidenceModel => {
          const files = disputeEvidenceModel.get('files');
          return files && files.find(fileComparisonFn);
        });
        return !matchingFileObj;
      }).bind(this)
    };

    return processingOptionsForDuplicates;
  },

  openOptOutModal() {
    const onContinue = (_modalView) => {
      _modalView.close();
      this.evidenceRequired = false;
      this.getUI('addFileError').addClass('hidden');
    }

    showDocumentOptOutModal(onContinue);
  },

  /* File upload support functions */
  prepareFileDescriptionForUpload(fileDescription) {
    const participantId = disputeChannel.request('get').get('tokenParticipantId');

    // If we are creating a new DisputeEvidenceModel, make sure description_by is correct.
    // There's no need to update this if the FileDescription has already been saved to the API
    if (fileDescription.isNew() && !fileDescription.get('description_by') && participantId) {
      fileDescription.set('description_by', participantId);
    }
  },

  prepareFilesForUpload(files) {
    const fileDate = this.model.get('fileDate');
    const submitterName = this.model.get('submitterName');
    const participantId = disputeChannel.request('get').get('tokenParticipantId');
    // Prepare files for deployment by adding the participant ID and added date
    files.each(function(fileModel) {
      fileModel.set({
        added_by: participantId,
        file_date: fileDate ? fileDate : null,
        submitter_name: submitterName ? submitterName : null
      });
    });
  },

  createFilePackageCreationPromise() {
    // We do not want to create file package, but need to pass promise otherwise errors out
    return $.Deferred().resolve().promise();
  },

  createFlag() {
    const flagAttr = { flag_participant_id: this.dispute.get('tokenParticipantId'), related_object_id: this.docRequestModel.id }
    const flag = flagsChannel.request(this.isCorrection ? 'create:correction' : 'create:clarification', flagAttr);
    if (!flag) return;

    const createFlagPromise = new Promise((res, rej) => flag.save().then(res, rej));
    return createFlagPromise;
  },

  onUploadComplete() {
    this.prepareDocRequestData();
    const saveRequestPromise = () => new Promise((res, rej) => this.docRequestModel.save(this.docRequestModel.getApiChangesOnly()).then(res, generalErrorFactory.createHandler('OUTCOME.DOC.REQUEST.CREATE', rej)));
    const parallelTaskPromise = () => new Promise((res, rej) => this.createParallelTask().then(res).catch(generalErrorFactory.createHandler('ADMIN.TASK.SAVE', rej)));

    loaderChannel.trigger('page:load');
    saveRequestPromise()
      .then(res => {
        this.createFlag();
        const docRequestItems = this.docRequestModel.getRequestItems();
        docRequestItems.forEach((item) => { item.set({ outcome_doc_request_id: res.outcome_doc_request_id }); });
        return new Promise((res, rej) => this.docRequestModel.saveRequestItems().then(res, rej));
      })
      .then(parallelTaskPromise)
      .then(() => {
        loaderChannel.trigger('page:load:complete');
        this.model.setReceiptData({ docRequestModel: this.docRequestModel, disputeEvidenceModel: this.disputeEvidenceModel });
        this.model.set('routingReceiptMode', true);
      })
      .catch(() => {
        this.model.trigger('search:reset');
        loaderChannel.trigger('page:load:complete');
        Backbone.history.navigate('#access', {trigger: true});
      })
      .then(() => {
        Backbone.history.navigate(`${this.REQUEST_TYPE_TEXT}/receipt`, {trigger: true});
      });
  },
  /* End file upload support functions */

  prepareDocRequestData() {
    const fileDescriptionId = this.fileDescription.get('file_description_id');
    this.docRequestModel.set({
      date_documents_received: this.dateReceivedModel.getData(),
      file_description_id: fileDescriptionId,
      request_sub_type: configChannel.request('get', 'OUTCOME_DOC_REQUEST_SUB_TYPE_INSIDE'),
      request_source: configChannel.request('get', 'TASK_REQUEST_SOURCE_DA'),
      request_date: Moment().toISOString(),
      submitter_details: this.model.get('submitterName')
    });
  },

  createParallelTask() {
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    const participantInitials = participant && participant.getInitialsDisplay() ? participant.getInitialsDisplay() : '-';
    const dateReceived = Formatter.toDateDisplay(this.docRequestModel.get('date_documents_received'));
    const daysInBetween = Math.abs(Moment(this.docRequestModel.get('date_documents_received')).diff(Moment(), 'days'));

    const taskDescription = [
      `A ${this.REQUEST_TYPE_TEXT} request was submitted through the Dispute Access site. Submitter name ${this.model.get('submitterName')}, Initials: ${participantInitials}`,
      `Access code: ${this.model.get('accessCode')}, Date document(s) received: ${dateReceived}. Date Request Submitted: ${Formatter.toDateDisplay(Moment())}.`, 
      `See the outcome document request section of the documents view for more information. Days between received and submitted: ${daysInBetween}`,
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);

    const taskData = {
      task_text: taskDescription,
      dispute_guid: this.dispute.get('dispute_guid'),
      task_activity_type: this.isCorrection ? configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_CORRECTION') : configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_CLARIFICATION'),
      task_link_id: this.docRequestModel.id,
      task_linked_to: configChannel.request('get', 'TASK_LINK_DOC_REQUEST')
    };    
    const taskCreator = taskChannel.request(`task:creator`, {
      docGroupId: this.docRequestModel.get('outcome_doc_group_id') || null,
      docRequestModel: this.docRequestModel,
    });
    return taskCreator.submitExternalTask(taskData);
  },

  submit() {
    const valid = this.validateAndShowErrors();
    this.docRequestModel.getRequestItems().trigger('submit:clicked');

    const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (!valid || visible_error_eles.length >= 1) {
      animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      return;
    };
    
    const docSelectView = this.getChildView('outcomeDocsRegion');
    const { affected_documents, affected_documents_text, outcome_doc_group_id, request_sub_type  } = docSelectView.subView.getPageApiDataAttrs();
    this.docRequestModel.set({ affected_documents, affected_documents_text, outcome_doc_group_id, request_sub_type  });

    if (!this.uploadModel.hasReadyToUploadFiles()) {//if no files, skip upload
      this.onUploadComplete();
    } else {
      this.mixin_upload_transitionToUploadStep().always(() => {
        setTimeout(() => {
          if (this.isCancel) {
            return;
          }
          this.mixin_upload_startUploads();
        }, 1000);
      });
    }
  },

  onCancelButtonNoUpload() {
    Backbone.history.navigate('#access', { trigger: true });
  },

  validateAndShowErrors() {
    const regionsToValidate = ['outcomeDocsRegion', 'dateReceivedRegion', 'formEvidenceRegion', 'termsCheckboxRegion'];

    let isValid = true;
    
    if (this.disputeEvidenceModel.get('files').length < 1 && this.evidenceRequired) {
      isValid = false;
      this.getUI('addFileError').removeClass('hidden');
    }

    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && view.subView) isValid = view.subView.validateAndShowErrors() && isValid;
      else if (view) isValid = view.validateAndShowErrors() && isValid;
    });

    return isValid;
  },

  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();

    } else {
      this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
      if (this.isRequestLimitExceeded) return;

      this.showChildView('termsCheckboxRegion', new CheckboxView({ model: this.termsCheckbox }));

      this.showChildView('outcomeDocsRegion', new PageItem({
        stepText: `What is the date on the decision or order you are seeking ${this.REQUEST_TYPE_TEXT} for?`,
        helpHtml: this.isCorrection ? correctionDocHelp : clarificationDocHelp,
        subView: new DocRequestSelectView({
          docGroupCollection: documentsChannel.request('get:all'),
          getValidDocFilesFromGroupFn: docGroup => this.isCorrection ? docGroup.getDocFilesThatCanRequestCorrection() : docGroup.getDocFilesThatCanRequestClarification(),
          model: this.docRequestModel,
          singleAutoSelect: true,
        }),
        forceVisible: true,
      }));
      
      this.showChildView('dateReceivedRegion', new PageItem({
        stepText: `Provide the date you received the document(s) that require ${this.isCorrection ? `correction` : `clarification`}`,
        helpHtml: this.isCorrection ? correctionReceivedDateHelp : clarificationReceivedDateHelp,
        subView: new InputView({ model: this.dateReceivedModel }),
        forceVisible: true,
      }));
      
      if (this.isCorrection) {
        this.showChildView('addCcrItem', new CorrectionRequestItems({ collection: this.docRequestModel.getRequestItems() }));
      } else {
        const itemType = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_CLARIFICATION');
        this.showChildView('addCcrItem', new CcrRequestItem({
          model: this.model,
          docRequestItemModel: this.docRequestModel.getRequestItems().at(0),
          itemType,
          
          evidenceRequired: true,
          isUpload: this.isUpload,
          descriptionLabel: clarificationDescriptionLabel,
        }));
      }
    }
    
    const evidenceView = new UploadEvidenceView({
      uploadModel: this.uploadModel,
      model: this.disputeEvidenceModel,
      showDelete: false,
      mode: this.isUpload ? 'upload' : null,
      hideDescription: true,
      fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
      processing_options: this.getProcessingOptions(),
    });

    this.showChildView('formEvidenceRegion', new PageItem({
      stepText: `Please upload a copy of the decision and/or order(s) that require ${this.REQUEST_TYPE_TEXT}`,
      helpHtml: this.isCorrection ? `Please highlight applicable corrections on decision and/or order(s) that are being uploaded` :
          `Please highlight applicable sections on decision and/or order(s) that require clarification`,
      subView: evidenceView,
      forceVisible: true
    }));
  },

  className: 'page-view ccr',
  regions: {
    outcomeDocsRegion: '.ccr__outcome-docs',
    disputeRegion: '.ccr__overview-container',
    dateReceivedRegion: '.ccr__date-received',
    addCcrItem: '.ccr__list',
    formEvidenceRegion: '.ccr__add-file',
    termsCheckboxRegion: '.ccr__terms-checkbox',
  },

  ui: {
    disputeSelect: '.ccr__overview-container',
    fileCounter: '.file-upload-counter',
    uploadingFilesProgress: '.da-upload-overall-file-progress',
    addFileError: '.ccr__add-file__error',
  },

  template() {
    const remainingRequests = this.DA_CORR_CLAR_MAX_REQUESTS - this.numSubmittedCC;
    const requestLimitWarning = <div className="error-block warning ccr__cc-warning"><b>Warning: </b>Online correction and clarification requests are limited to a maximum of three (3) total requests.<b> You have {remainingRequests} allowed online request{remainingRequests===1?'':'s'} remaining</b>. {this.isCorrection?'Each correction request cannot contain more than six individual corrections. ':''}If you need to make additional requests after you have hit your online submission limit, you can <a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/forms/forms-listed-by-number">download the associated form</a> and submit a Request for Correction (RTB-6) or Request for Clarification form (RTB-38) through the <a className="static-external-link" href="javascript;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a> or to a <a className="static-external-link" href="javascript;" url="http://www.servicebc.gov.bc.ca/locations/">Service BC office</a></div>;
    const requestLimitExceeded = <div className="error-block warning ccr__cc-warning"><b>Warning: </b>Online correction and clarification requests are limited to a maximum of three (3) total requests.<b> You have 0 allowed online requests remaining</b>. If you need to make additional requests you must <a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/forms/forms-listed-by-number">download the associated form </a> and submit a Request for Correction (RTB-6) or Request for Clarification form (RTB-38) through the <a className="static-external-link" href="javascript;" url="http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>&nbsp;or to a&nbsp;<a className="static-external-link" href="javascript;" url="http://www.servicebc.gov.bc.ca/locations/">Service BC office</a>.</div>;
    return (
      <div className={`da-upload-page-wrapper ${this.isUpload ? 'upload' : '' }`}>
        <div className={`ccr__overview-container ${this.isUpload ? 'hidden' : ''}`}></div>
        <div className={`dac__page-header-container ${this.isUpload ? 'hidden' : ''}`}>
          <div className="dac__page-header">
            <span className="dac__page-header__icon dac__icons__menu__service"></span>
            <span className="dac__page-header__title">Request a {Formatter.capitalize(this.REQUEST_TYPE_TEXT)}</span>
          </div>
          <div className="dac__page-header__instructions">
            {this.isCorrection ? correctionIntroText : clarificationIntroText}
            {this.isRequestLimitExceeded ? requestLimitExceeded : <>
              {requestLimitWarning}
              {this.isCorrection ? correctionInfoText : clarificationInfoText}
              <div className={`ccr__terms-checkbox ${this.isUpload ? 'hidden' : ''}`}></div>
            </>}
          </div>
        </div>

        {this.isRequestLimitExceeded ? <>
          <div className="spacer-block-10"></div>
          <button className="btn btn-standard btn-lg" onClick={() => Backbone.history.navigate('#access', {trigger: true})}>Main Menu</button>
          <div className="spacer-block-10"></div>
        </> : null}
        <div className={!this.isRequestLimitExceeded && this.termsCheckbox.getData() ? '' : 'hidden'}>
          <div className={`dac__page-header-container ${this.isUpload ? '' : 'hidden'} `}>
            <div className="dac__page-header">
              <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
              <span className="dac__page-header__title">Uploading please wait</span>
            </div>
            <div className="dac__page-header__instructions">
              File&nbsp;<b className="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b> {this.dispute.get('file_number')} </b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
            </div>
          </div>

          <div className={`${this.isUpload ? 'hidden' : ''}`}>
            <div className="ccr__outcome-docs"></div>
            <div className="ccr__date-received"></div>

            <div className={`ccr__label ${this.isCorrection ? '' : 'hidden'}`}>
              <span className="step-description">{ correctionDescriptionLabel }</span>
            </div>
            <div className="ccr__list"></div>
            
          </div>

          <div className="ccr__add-file"></div>
          <p className="ccr__add-file__error error-block hidden">Please provide a copy of the document(s). If you cannot provide them, <span className="ccr__add-file__open-modal" onClick={() => this.openOptOutModal()}>click here</span></p>
          
          <div className="spacer-block-30"></div>
          <div className="all-file-upload-ready-count hidden">
            <b className="glyphicon glyphicon-download"></b>&nbsp;<span className="file-upload-counter">0</span>&nbsp;ready to submit
          </div>
          <div className="dac__page-buttons">
            { !this.isUpload ? <button className="btn btn-cancel btn-lg da-upload-cancel-button" onClick={(ev) => this.mixin_upload_onCancel(ev)}>Cancel</button> : null }
            <button className={`btn btn-standard btn-lg ${this.isUpload ? 'hidden' : ''}`} onClick={() => this.submit()}>Submit {Formatter.capitalize(this.REQUEST_TYPE_TEXT)}</button>
          </div>
          <div className="spacer-block-10"></div>
        </div>

      </div>
    );
  }
});

_.extend(CorrectionClarificationView.prototype, ViewJSXMixin, UploadViewMixin);
export { CorrectionClarificationView }
