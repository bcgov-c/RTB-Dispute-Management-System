
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import ModalBaseView from '../modals/ModalBase';
import Checkbox_collection from '../checkbox/Checkbox_collection';
import Checkboxes from '../checkbox/Checkboxes';
import Notice_model from '../notice/Notice_model';
import NoticePreview from '../../../admin/components/notice/NoticePreview';
import EmailTemplateFormatter from '../email/EmailTemplateFormatter';
import Email_model from '../email/Email_model';
import Editor_model from '../editor/Editor_model';
import EditorView from '../editor/Editor';
import './NoticeAutoActions.scss';
import LoaderImg from '../../static/loader_blue_lrg.gif';
import SuccessAnimation from '../../static/DMS_BlueCompleteCheckAnim_sml.gif';

const SUCCESS_DELAY = 3500;
const PROGRESS_LANGUAGE = {
  generateNotice: 'Generating Notice',
  createEmail: 'Creating Email',
  createAttachments: 'Attaching Notice to Email',
  sendEmail: 'Sending Email',
  provideNotice: 'Marking Notice Provided by email to primary applicant',
  setDisputeStatus: 'Setting Dispute Status',
  success: 'Process Completed Successfully',
};

const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const hearingsChannel = Radio.channel('hearings');
const sessionChannel = Radio.channel('session');
const noticeChannel = Radio.channel('notice');
const modalChannel = Radio.channel('modals');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const ModalGenerateAndSendNotice = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['templateId']);
    this.templateModel = emailsChannel.request('get:templates').findWhere({ assigned_template_id: this.templateId });
    this.isErrorState = false;
    this.isSuccessState = false;
    this.progressLog = [];

    this.checkboxes = new Checkbox_collection([
      { html: `I confirm there are no critical errors that need to be addressed through needs update` },
      { html: `I confirm there are no recommended amendments required on this file` },
    ], { minSelectsRequired: 2 });
  },

  addToProgressLog(processLogItem) {
    this.progressLog.push(processLogItem);
    this.render();
  },

  clickGenerate() {
    if (!this.getChildView('checkboxesRegion').validateAndShowErrors()) return;

    this.generateNotice()
      .then(noticeFile => this.generateAndSendNodrpEmail(noticeFile))
      .then(() => {
        const [stage, status] = (this.templateId === 100 ? [6, 60] : [4, 41]);
        return this.performNodrpEmailFinalization(stage, status);
      })
      .then(() => {
        this.isSuccessState = true;
        this.addToProgressLog(PROGRESS_LANGUAGE.success);
        setTimeout(() => {  
          this.close();
        }, SUCCESS_DELAY);
      })
      .catch(() => {
        this.isErrorState = true;
        this.render();
      })
  },

  generateNotice() {
    const futureHearing = hearingsChannel.request('get:active');
    const noticeTitle = `Dispute Notice`;

    // Prepare notice data
    const notice = new Notice_model(Object.assign({
      notice_title: noticeTitle,
      notice_type: configChannel.request('get', 'NOTICE_TYPE_GENERATED'),
      notice_associated_to: configChannel.request('get', 'NOTICE_ASSOCIATED_TO_APPLICANT'),
      hearing_type: disputeChannel.request('get')?.getProcess(),
    }, futureHearing ? {
      hearing_id: futureHearing.id
    } : null));

    const noticeFileDescription = notice.createNoticeFileDescription();

    const previewView = new NoticePreview({ model: this.model });
    const noticeHtml = previewView.render().$el.html();
    let _pdfFileModel;

    this.addToProgressLog(PROGRESS_LANGUAGE.generateNotice);
    return new Promise((res, rej) => {
      noticeFileDescription.save()
        .then(() => {
          notice.set({ notice_file_description_id: noticeFileDescription.id });
          return notice.save();
        })
        .then(() => {
          const pdfData = {
            file_title: noticeTitle,
            html_for_pdf: noticeHtml,
            version_number: notice.get('notice_version')
          };
          return new Promise((_res, _rej) => filesChannel.request('upload:pdf', disputeChannel.request('get:id'), pdfData).done(_res).fail(_rej));
        })
        .then(pdfFileModel => {
          if (!pdfFileModel) return rej();
          _pdfFileModel = pdfFileModel;
          return Promise.all([filesChannel.request('create:linkfile', pdfFileModel, noticeFileDescription)]);
        })
        .then(() => {
          const allNotices = noticeChannel.request('get:all');
          allNotices.add(notice);
          res(_pdfFileModel);
        })
        .catch(rej);
    });
  },

  generateAndSendNodrpEmail(noticeFileModelToAttach) {
    const dispute = disputeChannel.request('get');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const templateModel = emailsChannel.request('get:templates').filter(t => t.get('assigned_template_id') === this.templateId)?.[0];
    
    if (!templateModel || !primaryApplicant) return;

    const emailModel = new Email_model({
      assigned_template_id: this.templateId,
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_CUSTOM'),
      send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT'),
      is_active: false,
      dispute_guid: dispute.id,
      email_from: configChannel.request('get', 'EMAIL_FROM_DEFAULT'),
      email_to: primaryApplicant.get('email'),
      participant_id: primaryApplicant.id,
      recipient_group: templateModel.get('default_recipient_group'),
      subject: EmailTemplateFormatter.applyConversionsTo(templateModel.get('subject_line')),
    });

    const prepareEmailForSend = () => {
      const emailContentModel = new Editor_model({
        required: true,
        withTable: true,
        isEmailable: true,
        disabled: true,
        value: null
      });
  
      const editorView = new EditorView({ model: emailContentModel }).render();
      EmailTemplateFormatter.load(EmailTemplateFormatter.getEmailContentFromHtml(templateModel.get('template_html')));
      let htmlToUse = '';
      try {
        htmlToUse = EmailTemplateFormatter.getMergedHtml();
      } catch (err) {
        htmlToUse = '';
      }
      emailContentModel.trigger('update:input', htmlToUse);
      const messageContent = editorView.prepareEmailForSend();
      const fullMessageHtml = templateModel.get('template_html');
      
      const tempEle = $('<div></div>');
      tempEle.append($(fullMessageHtml));
      const mainContent = tempEle.find(`.${EmailTemplateFormatter.EMAIL_CONTENT_CLASS}`);
      mainContent.html(messageContent);
      tempEle.find(`.${EmailTemplateFormatter.EMAIL_ONLY_CLASS}`).css('display' ,'block');
      let finalHtmlToSave = `<html className="en">${tempEle.html()}</html>`;
      finalHtmlToSave = EmailTemplateFormatter.applyConversionsTo(finalHtmlToSave);
      
      emailModel.set('html_body', finalHtmlToSave);

      return emailModel;
    };

    // Email attachments
    const createEmailAttachmentsPromise = () => {
      const attachmentsToCreate = [];
      // Add all common file attachments
      templateModel.getAttachmentCommonFileIds()?.forEach(commonFileId => {
        attachmentsToCreate.push({
          attachment_type: configChannel.request('get', 'EMAIL_ATTACHMENT_TYPE_COMMONFILE'),
          common_file_id: commonFileId,
        })
      });
      // Add the generated notice
      attachmentsToCreate.push({
        attachment_type: configChannel.request('get', 'EMAIL_ATTACHMENT_TYPE_FILE'),
        file_id: noticeFileModelToAttach.id
      })
      return Promise.all(attachmentsToCreate.map(attachment => emailModel.createAttachment(attachment)));
    };

    return new Promise((res, rej) => {
      this.addToProgressLog(PROGRESS_LANGUAGE.createEmail);
      prepareEmailForSend(); 
      emailModel.save()
        .then(() => {
          this.addToProgressLog(PROGRESS_LANGUAGE.createAttachments);
          return createEmailAttachmentsPromise();
        })
        .then(() => {
          this.addToProgressLog(PROGRESS_LANGUAGE.sendEmail);
          emailModel.set('is_active', true);
          return emailModel.save(emailModel.getApiChangesOnly());
        })
        .then(() => res())
        .catch(rej)
    });
  },


  performNodrpEmailFinalization(stage, status) {
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const createdNotice = noticeChannel.request('get:active');
    this.addToProgressLog(PROGRESS_LANGUAGE.provideNotice);
    return new Promise((res, rej) => {
      createdNotice.set({
        notice_delivered_to: primaryApplicant.id,
        notice_delivery_method: configChannel.request('get', 'NOTICE_DELIVERY_TYPE_EMAIL'),
        notice_delivered_date: Moment().toISOString()
      });  
      createdNotice.save(createdNotice.getApiChangesOnly())
        .then(() => {
          this.addToProgressLog(PROGRESS_LANGUAGE.setDisputeStatus);
          // Always unassign the dispute after auto-action
          disputeChannel.request('get')?.saveStatus({
            dispute_stage: stage,
            dispute_status: status,
            owner: 0
          }).then(res);
        })
        .catch(rej);
    });
  },


  id: 'noticeAutoAction_modal',
  regions: {
    checkboxesRegion: '.noticeAutoAction_modal__checkboxes'
  },

  onRender() {
    if (this.progressLog.length) return;
    this.showChildView('checkboxesRegion', new Checkboxes({ collection: this.checkboxes }));
  },

  template() {
    const isGenerating = this.progressLog.length;
    const title = isGenerating  ? 'Auto-generating and sending notice' : `Auto-generate and send notice?`;
    const contentRenderFn = this.isSuccessState ? this.renderJsxSuccessState :
      this.isErrorState ? this.renderJsxErrorState :
      isGenerating ? this.renderJsxProgressMode :
      this.renderJsxView;

    return <div className="modal-dialog">
      <div className="modal-content clearfix">
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
          {!isGenerating ? <div className="modal-close-icon-lg close-x"></div> : null}
        </div>
        <div className="modal-body clearfix">
          {contentRenderFn.bind(this)()}
        </div>
      </div>
    </div>;
  },

  renderJsxView() {
    return <>
      <p>This dispute meets the criteria for the automated generation and sending of the notice of dispute resolution proceeding. Once started this action cannot be stopped.</p>    
      {this.renderJsxTemplateInfo()}
      <div className="noticeAutoAction_modal__checkboxes"></div>
      <div className="modal-blank-buttons pull-right">
        <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button">
          <span className="">Exit and process manually</span>
        </button>
        <button type="button" className="btn btn-lg btn-primary btn-continue continue-button" onClick={() => this.clickGenerate()}>
          <span className="">Auto-generate and send</span>
        </button>
      </div>
    </>;
  },

  renderJsxTemplateInfo() {
    const hasOneFutureHearing = [100].includes(this.templateId);
    const hasNoNotices = [100, 102, 103].includes(this.templateId);
    const EMAIL_TEMPLATE_GROUP_SELECTION_DISPLAY = configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_SELECTION_DISPLAY');
    const groupTitle = EMAIL_TEMPLATE_GROUP_SELECTION_DISPLAY[this.templateModel.get('template_group')];

    return <div className="noticeAutoAction_modal__template-info">
      <div className="">
        <span className="general-modal-label">Associated email template:</span>&nbsp;<span className="general-modal-value">{groupTitle} - {this.templateModel.get('template_title')}</span>
      </div>

      <div className="">
        <span className="general-modal-label">Status is Assessing Application and assigned to logged in IO:</span>&nbsp;<span className="general-modal-value">True, {sessionChannel.request('name')}</span>
      </div>

      {hasOneFutureHearing ? <div className="">
        <span className="general-modal-label">One hearing is booked and is in the future:</span>&nbsp;<span className="">True, {Formatter.toDateAndTimeDisplay(hearingsChannel.request('get:active')?.get('hearing_start_datetime'))}</span>
      </div> : null}

      {hasNoNotices ? <div className="">
        <span className="general-modal-label">Notice has not already been generated:</span>&nbsp;<span className="">True</span>
      </div> : null}

      <div className="">
        <span className="general-modal-label">Process and file type are allowed:</span>&nbsp;<span className="">True</span>
      </div>

      <div className="">
        <span className="general-modal-label">Primary applicant has email delivery preference:</span>&nbsp;<span className="">True, {participantsChannel.request('get:primaryApplicant')?.get('email')}</span>
      </div>
    </div>
  },

  renderJsxProgressMode() {
    const latestEntry = this.progressLog.length && this.progressLog.slice(-1);
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__title">Auto-generating and sending notice... do not close or refresh this browser window</div>
        <div className="noticeAutoAction_modal__loading-container__img-container">
          <img src={LoaderImg} alt="Loading" />
        </div>
        <div className="noticeAutoAction_modal__loading-container__info">{latestEntry}</div>
      </div>
    </>
  },

  renderJsxErrorState() {
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__title">Something has gone wrong - please manually check all the steps for sending this notice and finish the incomplete steps manually</div>
        <button className="btn btn-lg btn-primary" onClick={() => this.close()}>Ok</button>
      </div>
    </>
  },

  renderJsxSuccessState() {
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__success">
          <img className="noticeAutoAction_modal__loading-container__success__img" src={`${SuccessAnimation}?t=${Math.random()}`} alt="Success" />
          Automated Process Completed Successfully!
        </div>
      </div>
    </>
  },

});

_.extend(ModalGenerateAndSendNotice.prototype, ViewJSXMixin);

export default {
  getAutoActionEmailTemplateId() {
    const dispute = disputeChannel.request('get');
    const hearings = hearingsChannel.request('get');
    const notices = noticeChannel.request('get:all');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const isPrimaryApplicantEmailValid = primaryApplicant && primaryApplicant.get('email') && primaryApplicant.hasDeliveryByEmail();
    const isValidNodrpDisputeSspo = dispute && dispute.isCreatedIntake() && dispute.checkStageStatus(2, 21) && dispute.getOwner() === sessionChannel.request('get:user:id');
    const getTemplatesOptions = { ignoreCriteria: { hasGeneratedNotice: true } };
    const validNodrpTemplateIds = emailsChannel.request('get:email:templates:for:group', configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_NODRP'), getTemplatesOptions) || [];

    const canAutoSendTemplate100 = validNodrpTemplateIds.includes(100)
      && isValidNodrpDisputeSspo
      && isPrimaryApplicantEmailValid
      && (notices.length === 0)
      && (hearings.length === 1 && hearings.at(0).isActive());

    const canAutoSendTemplate102 = !canAutoSendTemplate100
      && validNodrpTemplateIds.includes(102)
      && isValidNodrpDisputeSspo
      && isPrimaryApplicantEmailValid
      && (notices.length === 0);
      
    const canAutoSendTemplate103 = !canAutoSendTemplate100 && !canAutoSendTemplate102
      && validNodrpTemplateIds.includes(103)
      && isValidNodrpDisputeSspo
      && isPrimaryApplicantEmailValid
      && (notices.length === 0);

    return canAutoSendTemplate100 ? 100
      : canAutoSendTemplate102 ? 102
      : canAutoSendTemplate103 ? 103
      : null;
  },

  // Returns a Promise that resolves to True when the generate completes, resolves False if generate is cancelled, and rejects if there is an error in generation
  startAutoSendTemplate(templateId) {
    const isValid = templateId && this.getAutoActionEmailTemplateId() === templateId;
    return new Promise((res, rej) => {
      if (!isValid) return rej();
      const sendNoticeModal = new ModalGenerateAndSendNotice({ templateId });
      sendNoticeModal.once('removed:modal', () => {
        const generateCompleted = sendNoticeModal.isSuccessState || sendNoticeModal.isErrorState;
        res(generateCompleted);
      });
      modalChannel.request('add', sendNoticeModal);
    });
  },
};
