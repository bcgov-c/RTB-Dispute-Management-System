import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import ExternalParticipantModel from '../../../../evidence/components/external-api/ExternalParticipant_model';
import { ReceiptContainer } from '../../../../core/components/receipt-container/ReceiptContainer';
import ViewMixin from '../../../../core/utilities/ViewMixin';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');
const Formatter = Radio.channel('formatter').request('get');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const RECEIPT_TITLE = 'Application for Review Consideration Submission';

const NO_CODE = 0;
const YES_CODE = 1;
const STEP_3 = 3;
const STEP_4 = 4;

const STEP_THREE_DESCRIPTION_TEXT = `Please validate your information carefully before you submit to ensure it is factual, accurate and complete. 
If any of this information is not correct or any information is missing, use the back button and make the necessary changes.`;
const STEP_FOUR_DESCRIPTION_TEXT = `The following Application for Review Consideration was submitted to the Residential tenancy Branch. 
For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**). `;
const STEP_THREE_TITLE_TEXT = "Request a Review - Step 4";
const STEP_FOUR_TITLE_TEXT = "Review request submitted";
const STEP_FOUR_HELP_TEXT = "Your application will not be processed until the filing fee is received or a fee waiver has been approved."

const ReviewPageStepThreeAndFour = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['docRequestModel', 'disputeEvidenceModel', 'step', 'uploadModel']);
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.RECEIPT_FONT_SIZE_PX = this.model.getReceiptFontSizePx();
    this.receiptData = this.model.getReceiptData();
    this.dispute = disputeChannel.request('get');
    this.participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.affectedDocDisplay = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    this.createSubModels();

    if (this.isStepFour()) {
      emailsChannel.request('save:receipt', {
        participant_id: this.participant ? this.participant.id : null,
        receipt_body: renderToString(this.renderJsxReceipt()),
        receipt_title: RECEIPT_TITLE,
        receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
        receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_DA_REVIEW'),
      });
    }
  },

  createSubModels() {
    this.termsCheckbox = new CheckboxModel({
      html: `I have reviewed my Application for Review Consideration carefully and certify that it is factual, accurate and complete.`,
      checked: false,
      required: true
    });
  },

  validateAndShowErrors() {
    let isValid = true;

    const view = this.getChildView('termsCheckboxRegion');
    if (view) {
      isValid = view.validateAndShowErrors() && isValid;
    }

    return isValid;
  },

  getAssociatedDocuments() {
    const outcomeDocGroupId = this.receiptData.docRequestModel.get('outcome_doc_group_id');
    const outcomeDocGroups = documentsChannel.request('get:all').models;
    if (!outcomeDocGroupId) return
    let groupIndex = '';
    outcomeDocGroups.forEach((model, index) => { if(model.get('outcome_doc_group_id') === outcomeDocGroupId) groupIndex = index })
    
    return outcomeDocGroups[groupIndex].getGroupRequestTitleDisplay();
  },

  getDocumentsToCorrect() {
    const affectedDocuments = this.receiptData.docRequestModel.get('affected_documents');
    if (!affectedDocuments) return;
    
    return this.affectedDocDisplay[affectedDocuments];
  },

  isStepFour() {
    return this.step === STEP_4;
  },

  isStepThree() {
    return this.step === STEP_3;
  },

  onRender() {
    ViewMixin.prototype.initializeHelp(this, STEP_FOUR_HELP_TEXT);
    if (this.isStepFour()) {
      this.showChildView('receiptContainerRegion', new ReceiptContainer({
        displayHtml: this.renderJsxReceipt(),
        emailSubject: `File number ${this.dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
        containerTitle: RECEIPT_TITLE,
        emailUpdateParticipantId: this.participant.id,
        autoSendEmail: true,
        participantSaveModel: ExternalParticipantModel,
        messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_REVIEW')
      }));
    } else if (this.isStepThree()) {
      this.showChildView('termsCheckboxRegion', new CheckboxView({ model: this.termsCheckbox }));
    }
  },

  className: "dar-step-three",
  regions: {
    termsCheckboxRegion: '.dar-step-one__terms',
    receiptContainerRegion: '.receipt-container'
  },

  template() {
    const isStepThree = this.isStepThree();
    const descriptionText = isStepThree ? STEP_THREE_DESCRIPTION_TEXT : STEP_FOUR_DESCRIPTION_TEXT;
    const titleText = isStepThree ? STEP_THREE_TITLE_TEXT : STEP_FOUR_TITLE_TEXT;

    const renderJsxReceiptHeader = () => {

      return (
        <div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__evidence"></span>
          <span className="dac__page-header__title">{titleText}</span>
        </div>
      )
    };
    
    return (
      <>
        {isStepThree ? 
          <>
          <div className="dac__page-header-container">
            {renderJsxReceiptHeader()}
            <div className="dac__page-header__instructions">
              <p>
                {descriptionText}
              </p>
            </div>
          </div> 

            { this.renderJsxReceipt() }
            <div className="dar-step-one__terms"></div> 
          </> 
          : 
          <>
            { renderJsxReceiptHeader() }
            <div className="receipt-container"></div>
          </>
        }
      </>
    );
  },

  renderJsxReceipt() {
    const renderJsxCertifyHeader = () => {
      if (this.isStepFour()) return;
      return (
        <div className="dar-step-three__certifications">
          <span className="dar-step-three__certifications__header">Certifications:</span>
          <ul>
            <li>You understand and certify that this Application for Review Consideration includes one of the accepted grounds for review.</li>
          </ul>
        </div>
      )
    };

    return <>
        {this.renderJsxGeneralSubmissionInfo()}
        {renderJsxCertifyHeader()}

        <div style={{ marginTop: '40px' }}>
          {this.renderJsxStepData()}
        </div>
    </>;
  },

  renderJsxGeneralSubmissionInfo() {
    const isLandlord = !this.participant || this.participant.isLandlord();
    const isApplicant = this.participant && this.participant.isApplicant();
    const participantInitials = this.participant && this.participant.getInitialsDisplay() ? this.participant.getInitialsDisplay()  : '-';
    const { docRequestModel } = this.receiptData;

    return (
      <>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
          The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
        </p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>File number: </span>&nbsp; <b>{this.dispute.get('file_number')}</b></p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Access code: </span>&nbsp; <b>{this.dispute.get('accessCode')}</b></p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Added for: </span>&nbsp; { isApplicant ? 'Applicant' : 'Respondent'} { isLandlord ? 'Landlord' : 'Tenant' } - Initials { participantInitials }</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Submitted by: </span>&nbsp; {this.model.get('submitterName')}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Associated document(s): </span>&nbsp; {this.getAssociatedDocuments()}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Date document(s) received: </span>&nbsp; {Formatter.toDateDisplay(docRequestModel.get('date_documents_received'))}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Date of submission: </span>&nbsp; {Formatter.toDateDisplay(Moment())}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Document(s) for Review Consideration Application: </span>&nbsp; {this.getDocumentsToCorrect()}</p>
      </>
    );
  },

  renderJsxFileList(files) {
    if (!files) return;
    if (files.where({file_id: null}).length > 0 && this.isStepFour()) return <span style={{ fontSize: this.RECEIPT_FONT_SIZE_PX }}>-</span> //if no valid uploaded files, return -
    if (files.length < 1) return <span style={{ fontSize: this.RECEIPT_FONT_SIZE_PX }}>-</span>;
    const filesLength = files.length;
    return (
      files.map((file, index) => {
        if (this.isStepFour() & !file.id) return;
        return (
        <span key={index}>
          <img src={`${this.COMMON_IMAGE_ROOT}Icon_File_email.png`} className="er-file-icon" style={{ padding: '0px', position: 'relative', top: '0px' }}/>
          <span className="er-filename" style={{ wordBreak: 'break-all', overflowWrap: 'break-word', wordWrap: 'break-word' }}>{file.get('file_name')}</span>
          <span className="er-filesize" style={{ color: '#999999', paddingRight: '5px', fontSize: '15px' }}> ({Formatter.toFileSizeDisplay(file.get('file_size'))})</span>
          {filesLength === index+1 ? '' : <span className="dms__file__comma" style={{ fontSize: this.RECEIPT_FONT_SIZE_PX }}>,&nbsp;</span>}&nbsp;
        </span>
        );
      })
    );
  },

  renderJsxStepData() {
    const stepOneQuestionOneData = this.receiptData.stepOneQuestionOneData;
    const stepTwoQuestionOneData = this.receiptData.stepTwoQuestionOneData;
    const stepTwoQuestionTwoData = this.receiptData.stepTwoQuestionTwoData;
    const stepTwoQuestionThreeData = this.receiptData.stepTwoQuestionThreeData;

    const renderJsxStepOneQuestionOne = () => {
      if (stepOneQuestionOneData.isLate) {
        return (
          <>
            <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Reason:</span>{stepOneQuestionOneData.descriptionModel.getData()}</p>
            <span><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Proof time extension was waranted: </span>{this.renderJsxFileList(stepOneQuestionOneData.disputeEvidenceModel.get('files'))}</span>
          </>
        )
      }
    };

    const renderJsxStepTwoQuestionOne = () => {
      if (stepTwoQuestionOneData.questionModel.getData() === NO_CODE) return;
      return (
        <>
          <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Description:</span>{stepTwoQuestionOneData.descriptionModel.getData()}</p>
          <span ><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Proof you were unable to attend: </span>{this.renderJsxFileList(stepTwoQuestionOneData.disputeEvidenceModel.get('files'))}</span>
        </>
      )
    };

    const renderJsxStepTwoQuestionTwo = () => {
      if (stepTwoQuestionTwoData.questionModel.getData() === NO_CODE) return;
      return (
        <>
           <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Description:</span>{stepTwoQuestionTwoData.descriptionModel.getData()}</p>
          <span><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>New and relevant evidence: </span>{this.renderJsxFileList(stepTwoQuestionTwoData.disputeEvidenceModel.get('files'))}</span>
        </>
      )
    }

    const renderJsxStepTwoQuestionThree = () => {
      if (stepTwoQuestionThreeData.questionModel.getData() === NO_CODE) return;
      return (
        <>
          <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Description:</span>{stepTwoQuestionThreeData.descriptionModel.getData()}</p>
          <span><span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Proof of false information: </span>{this.renderJsxFileList(stepTwoQuestionThreeData.disputeEvidenceModel.get('files'))}</span>
        </>
      );
    }

    return (
      <>
          <p className="er-subheader" style={{borderBottom: '1px solid #e3e3e3', margin: '0 0px 10px 0px', padding: '5px 5px 2px 0px', color: '#8d8d8d' }}><span className="er-darktext" style={{ color: '#292929' }}>Late Filing? <b>&nbsp;{stepOneQuestionOneData.isLate ? 'Yes' : 'No'}</b> </span></p>
          {renderJsxStepOneQuestionOne()}
          <p className="er-subheader" style={{borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding: '5px 5px 2px 0px', color: '#8d8d8d' }}><span className="er-darktext" style={{ color: '#292929' }}>Unable to attend due to circumstances outside of your control? <b>&nbsp;{stepTwoQuestionOneData.questionModel.getData() === YES_CODE ? 'Yes' : 'No'}</b> </span></p>
          {renderJsxStepTwoQuestionOne()}
          <p className="er-subheader" style={{borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding: '5px 5px 2px 0px', color: '#8d8d8d' }}><span className="er-darktext" style={{ color: '#292929' }}>New relevant evidence not available at time of hearing? <b>&nbsp;{stepTwoQuestionTwoData.questionModel.getData() === YES_CODE ? 'Yes' : 'No'}</b> </span></p>
          {renderJsxStepTwoQuestionTwo()}
          <p className="er-subheader" style={{borderBottom: '1px solid #e3e3e3', margin: '25px 0px 10px 0px', padding: '5px 5px 2px 0px', color: '#8d8d8d' }}><span className="er-darktext" style={{ color: '#292929' }}>False information was submitted? <b>&nbsp;{stepTwoQuestionThreeData.questionModel.getData() === YES_CODE ? 'Yes' : 'No'}</b> </span></p>
          {renderJsxStepTwoQuestionThree()}
      </>
    );
  }
});

_.extend(ReviewPageStepThreeAndFour.prototype, ViewJSXMixin);
export { ReviewPageStepThreeAndFour }