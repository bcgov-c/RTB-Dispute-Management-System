import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import UploadViewMixin from '../../../core/components/upload/UploadViewMixin';
import PageView from '../../../core/components/page/Page';
import PageItem from '../../../core/components/page/PageItem';
import Question from '../../../core/components/question/Question';
import Question_model from '../../../core/components/question/Question_model';
import UploadMixinModel from '../../../core/components/upload/UploadMixin_model';
import UploadEvidenceView from '../upload/UploadEvidence';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import ExternalNoticeModel from '../../../office/components/external-api/ExternalNotice_model';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './AmendmentPage.scss';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const taskChannel = Radio.channel('tasks');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const QUESTION_YES_VALUE = 1;
const QUESTION_NO_VALUE = 0;
const LANDLORD_FORM_CODE = 74;
const TENANT_FORM_CODE = 75;

const RTB44TLink = 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb42t.pdf';
const RTB44LLink = 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb42l.pdf';

const QUESTION_ONE_ERROR_TEXT = `You must use the required form(s) or your request for amendment will not be processed. 
  Learn more about <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/amend-or-update-an-application'>amending an application</a>. 
  Please complete your request for amendment using the approved form(s).`;

const FORM_EVIDENCE_DESCRIPTION = 'This is the original amendment application form(s).';
const BULK_EVIDENCE_DESCRIPTION = 'This is the evidence provided with the original application.';
const BULK_EVIDENCE_TITLE = 'Bulk Evidence to Support Amended Issues';
const FORM_EVIDENCE_HELP = `Upload the main application form(s) and related forms (e.g. RTB-26 Schedule of parties form, Other Issues form, or RTB-13 Application for Substituted Service form).
<br/>DO NOT UPLOAD EVIDENCE FILES HERE - SEPARATE THEM FROM THE APPLICATION FORMS`;
const BULK_EVIDENCE_HELP = `Upload evidence, evidence worksheets (i.e. monetary order worksheets, direct request worksheets) and tenancy agreements here.
<br/>DO NOT UPLOAD APPLICATION FORMS HERE`;


const AmendmentPage = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.dispute = disputeChannel.request('get');
    this.participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.formCode = this.dispute.isLandlord() ? LANDLORD_FORM_CODE : TENANT_FORM_CODE;
    this.formConfig = configChannel.request('get:evidence', this.formCode);
    this.formText = this.participant.isLandlord() ? 'RTB-42L' : 'RTB-42T';
    
    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.questionOneAnswer = null;

    // Upload support vars
    this.fileUploader = null;
    this.isCancel = false;
    this.isUpload = false;

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.questionOneModel = new Question_model({
      optionData: [{ name: 'amendment__q1-no', value: 0, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: 'amendment__q1-yes', value: 1, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      question_answer: null
    });

    this.uploadModel = new UploadMixinModel();
    this.formEvidenceModel = new DisputeEvidenceModel({
      helpHtml: FORM_EVIDENCE_HELP,
      title: this.formConfig.title,
      evidence_id: this.formCode,
      category: this.formConfig.category,
      mustProvideNowOrLater: true,
      required: true,
    });
    this.formEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: FORM_EVIDENCE_DESCRIPTION
    });
    this.formEvidenceModel.saveInternalDataToModel();

    this.bulkEvidenceModel = new DisputeEvidenceModel({
      helpHtml: BULK_EVIDENCE_HELP,
      evidence_id: configChannel.request('get', 'EVIDENCE_CODE_BULK'),
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_BULK'),
      title: BULK_EVIDENCE_TITLE,
      mustProvideNowOrLater: true,
      required: true // NOTE: This check will be handled using page controls
    });
    this.bulkEvidenceModel.get('descriptionModel').set({
      countdown: false,
      showInputEntry: true,
      disabled: true,
      value: BULK_EVIDENCE_DESCRIPTION
    });
    this.bulkEvidenceModel.saveInternalDataToModel();

  },

  setupListeners() {
    this.listenTo(this.questionOneModel, 'page:itemComplete', () => {
      this.questionOneAnswer = this.questionOneModel.getData();
      this.render();
    });

    this.listenTo(this.uploadModel, 'file:added', () => {
      this.getUI('addFileError').addClass('hidden');
    });
  },

  submit() {
    const hasUploadedFiles = this.formEvidenceModel.get('files').length >= 1;
    if (!this.questionOneAnswer) return;
    if (!hasUploadedFiles) {
      this.getUI('addFileError').removeClass('hidden');
      return;
    }

    this.mixin_upload_transitionToUploadStep().always(() => {
      setTimeout(() => {
        if (this.isCancel) {
          return;
        }
        this.mixin_upload_startUploads();
      }, 1000);
    });
  },

  onCancelButtonNoUpload() {
    Backbone.history.navigate('#access', { trigger: true });
  },

  /* Start file upload support functions */
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

  getProcessingOptions() {
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

    return processingOptionsForDuplicates;
  },

  _filesToUploadContainEvidence() {
    return _.any(this.uploadModel.getPendingUploads(), function(disputeEvidence) {
      return disputeEvidence.isEvidence();
    });
  },

  getFileDate() {
    return Moment().toISOString();
  },
  
  createFilePackageCreationPromise() {
    const fileDate = this.getFileDate();
    const filePackagePromise = this._filesToUploadContainEvidence() ?
      filesChannel.request('create:filepackage:disputeaccess', {
        package_date: fileDate,
        package_description: `Uploaded on ${Formatter.toDateAndTimeDisplay(Moment())}`,
      })
      : $.Deferred().resolve().promise();

    return filePackagePromise;
  },

  /* End file upload support functions */

  createTask() {
    const TASK_DESCRIPTION_SEPARATION_CHARACTERS = ' -- ';
    const participantInitials = this.participant && this.participant.getInitialsDisplay() ? this.participant.getInitialsDisplay() : '-';
    const taskDescription = [
      `A manual amendment request was submitted through the dispute access site. Submitter name ${this.model.get('submitterName')}, Initials: ${participantInitials}`,
      `Access code: ${this.model.get('accessCode')}, Date Request Submitted: ${Formatter.toDateDisplay(Moment())}.`,
      'See the notice view for the amendment form',
      this.bulkEvidenceModel.getUploadedFiles().length ? `See the evidence list for ${BULK_EVIDENCE_TITLE}` : 'No bulk evidence was submitted',
    ].join(TASK_DESCRIPTION_SEPARATION_CHARACTERS);
    
    const taskData = {
      task_text: taskDescription,
      task_activity_type: configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_AMENDMENT'),
      dispute_guid: this.dispute.get('dispute_guid'),
    };

    const taskCreator = taskChannel.request('task:creator');
    return taskCreator.submitExternalTask(taskData).catch(generalErrorFactory.createHandler('OS.REQUEST.AMEND.TASK'));
  },

  createAmendmentNotice() {
    const amendmentNoticeModel = new ExternalNoticeModel({
      notice_file_description_id: this.formEvidenceModel.get('file_description').id,
      parent_notice_id: this.dispute.get('currentNoticeId'),
      notice_delivered_to: this.participant.id,
      notice_delivered_date: this.getFileDate(),
      notice_type: configChannel.request('get', 'NOTICE_TYPE_UPLOADED_AMENDMENT')
    });

    return amendmentNoticeModel.save()
      .catch(err => {
        return new Promise((resolve, reject) => generalErrorFactory.createHandler('OS.REQUEST.AMEND.NOTICE', reject)(err) );
      });
  },

  onUploadComplete() {
    loaderChannel.trigger('page:load');
    Promise.all([this.createAmendmentNotice(), this.createTask()])
    .then(([createdAmendment, createdTask]) => {
      this.model.setReceiptData({
        amendmentRequest: createdAmendment,
        formEvidenceModel: this.formEvidenceModel,
        bulkEvidenceModel: this.bulkEvidenceModel,
      });
      this.model.set('routingReceiptMode', true);
      Backbone.history.navigate('amendment/receipt', {trigger: true});
    })
    .catch(() => Backbone.history.navigate('#access', {trigger: true}))
    .finally(() => loaderChannel.trigger('page:load:complete'));
  },



  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
    } else {
      this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));
      this.renderQuestions();
    }
    
    // Always render evidence
    this.renderEvidenceUploads();
  },

  renderQuestions() {
    this.showChildView('questionOneRegion', new PageItem({
      stepText: `Did you complete and sign the required form(s) (${this.formText} and/or RTB-42O)?`,
      helpHtml: null,
      subView: new Question({ model: this.questionOneModel }),
      stepComplete: this.questionOneModel.getData(),
      forceVisible: true,
      staticWarning: `Request(s) for amendments that are incomplete or missing a signature will not be processed by the Residential Tenancy Branch.`,
    }));
  },

  renderEvidenceUploads() {
    if (!this.questionOneAnswer) return;

    this.showChildView('formEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.formEvidenceModel,
      showDelete: false,
      hideDescription: true,
      mode: this.isUpload ? 'upload' : null,
      fileType: configChannel.request('get', 'FILE_TYPE_NOTICE'),
      processing_options: Object.assign({ maxNumberOfFiles: this.NOTICE_FILES_MAX || 5 }, this.getProcessingOptions())
    }));

    this.showChildView('bulkEvidenceRegion', new UploadEvidenceView({
      uploadModel: this.uploadModel,
      // Use dispatcher for claimCollection to capture UI updates
      claimCollection: this.uploadModel,
      model: this.bulkEvidenceModel,
      showDelete: false,
      hideDescription: true,
      mode: this.isUpload ? 'upload' : null,
      processing_options: this.getProcessingOptions(),
    }));
  },

  className: `amendment ${PageView.prototype.className}`,

  regions: {
    disputeRegion: '.amendment__overview-container',
    questionOneRegion: '.amendment__question-one',
    formEvidenceRegion: '.amendment__form',
    bulkEvidenceRegion: '.amendment__bulk-evidence'
  },

  ui() {
    return Object.assign({}, PageView.prototype.ui, {
      fileCounter: '.file-upload-counter',
      uploadingFilesProgress: '.da-upload-overall-file-progress',
      addFileError: '.amendment__upload__error'
    });
  },

  template() {
    const isLandlord = this.participant.isLandlord();
    
    const renderQuestionOneWarning = () => {
      if (this.questionOneAnswer === QUESTION_NO_VALUE) {
        return <div className="error-block warning">
          <span dangerouslySetInnerHTML={{ __html: QUESTION_ONE_ERROR_TEXT }}></span>
        </div>;
      }
    }

    return (
      <div className={`da-upload-page-wrapper ${this.isUpload ? 'upload' : '' }`}>
        <div className="amendment__overview-container"></div>
        <div className={`dac__page-header-container ${this.isUpload ? 'hidden' : ''}`}>
          <div className="dac__page-header hidden-print">
            <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
            <span className="dac__page-header__title">Dispute Evidence Summary</span>
          </div>
        </div>

        <div className={`dac__page-header__instructions ${this.isUpload ? 'hidden' : ''}`}>
          <p>An application can be amended as long as all the respondents and the Residential Tenancy Branch <b>receive</b> copies of this Request to Amend an Application for Dispute Resolution and all supporting evidence <b>not less than 14 days</b> before the dispute resolution hearing.</p>
          <div className="amendment__form-text">
            <span>Download and complete <a className="static-external-link" href="javascript;" url={isLandlord ? RTB44LLink : RTB44TLink}>form {this.formText}</a> to:</span>
            <ul>
              <li>Add a related claim</li>
              <li>Alter claims in the original application</li>
            </ul>
          </div>
          <div className="amendment__form-text">
            <span>Download and complete <a className="static-external-link" href="javascript;" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb42o.pdf">form RTB-42O</a> to:</span>
            <ul>
              <li>Change an address</li>
              <li>Add or remove an applicant</li>
              <li>Remove a claim</li>
            </ul>
          </div>
        </div>

        <div className="amendment__question-one"></div>
        { renderQuestionOneWarning() } 

        { this.renderJsxUploads() }
        { this.renderJsxButtons() }
      </div>
    );
  },

  renderJsxUploads() {
    if (!this.questionOneAnswer) return;
    const renderUploadHeader = () => {
      return (
        <div className={`dac__page-header-container ${this.isUpload ? '' : 'hidden'}`}>
          <div className="dac__page-header">
            <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
            <span className="dac__page-header__title">Uploading please wait</span>
          </div>
          <div className="dac__page-header__instructions">
            File&nbsp;<b className="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b> {this.dispute.get('file_number')} </b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
          </div>
        </div>
      )
    };
    return <>
      { renderUploadHeader() }
      <div className="amendment__uploads">
        { !this.isUpload ? <div className="amendment__upload-title">Application Form(s)</div> : null }
        <div className="amendment__form"></div>
        <p className="amendment__upload__error error-block hidden">Please provide a copy of the document(s)</p>
        
        <div className="amendment__bulk-evidence__container">
          { !this.isUpload ? <div className="amendment__upload-title">Supporting Evidence</div> : null }
          <div className="amendment__bulk-evidence"></div>
        </div>
      </div>
    </>;
  },

  renderJsxButtons() {
    return <>
      <div className="file-upload-counter hidden"></div>
      <div className="dac__page-buttons amendment__buttons">
        <button className="btn btn-cancel btn-lg da-upload-cancel-button" onClick={(ev) => this.mixin_upload_onCancel(ev)}>{this.isUpload ? 'Cancel Remaining' : 'Cancel'}</button>
        <button className={`btn btn-standard btn-lg ${this.isUpload || !this.questionOneAnswer ? 'hidden' : ''}`} onClick={() => this.submit()}>Submit Amendment</button>
      </div>
    </>;
  },
});

_.extend(AmendmentPage.prototype, ViewJSXMixin, UploadViewMixin);
export default AmendmentPage;