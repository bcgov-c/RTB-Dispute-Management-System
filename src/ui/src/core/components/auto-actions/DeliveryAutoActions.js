/**
 * @fileoverview - Contains helper functions for automatic email delivery feature
 */


import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import ModalBaseView from '../modals/ModalBase';
import './NoticeAutoActions.scss';
import LoaderImg from '../../static/loader_blue_lrg.gif';
import SuccessAnimation from '../../static/DMS_BlueCompleteCheckAnim_sml.gif';

const INIT_DELAY = 1000;
const SUCCESS_DELAY = 2000;

const PROGRESS_LANGUAGE = {
  start: "Initializing",
  createEmail: 'Creating email',
  createAttachments: 'Attaching selected decisions and common files',
  sendEmail: 'Creating email delivery',
  setDeliveryStatus: 'Updating delivery status',
  cancel: 'Process Cancelled Before Completing',
  success: 'Process Completed Successfully',
  cleanup: 'Process encountered an error - cleaning up',

  delayedCleanupEmail: 'Cleanup: Deleting delivery email(s)',
  delayedCleanupDelivery: 'Cleanup: Resetting pending email delivery information',
};

const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const documentsChannel = Radio.channel('documents');
const emailsChannel = Radio.channel('emails');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');


// Utility methods for finding templates etc
const getAvailableDeliveryEmailTemplatesForDocs = (docDeliveries=[]) => {
  const EMAIL_TEMPLATE_GROUP_DELIVERY = configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_DELIVERY');
  const validDeliveryTemplateIds = emailsChannel.request('get:email:templates:for:group', EMAIL_TEMPLATE_GROUP_DELIVERY, { ignoreCriteria: { staffSelectable: true }});
  const deliveryTemplates = emailsChannel.request('get:templates').filter(t => validDeliveryTemplateIds.indexOf(t.get('assigned_template_id')) !== -1);
  const outcomeDocLookup = {};
  docDeliveries.forEach(d => {
    const outcomeDoc = documentsChannel.request('get:outcomedoc', d.get('outcome_doc_file_id'));
    outcomeDocLookup[d.cid] = outcomeDoc;
  });

  if (Object.keys(outcomeDocLookup).length !== docDeliveries.length) return;
  // Sort the results so that when multiple matches, the email with the most restrictive outcomeDoc set is used
  return deliveryTemplates.filter(t => {
    const allDocsAreInTemplate = t.config?.outcomeDocs && Object.values(outcomeDocLookup).every(doc => t.config?.outcomeDocs?.indexOf(doc.get('file_type')) !== -1);
    const docSubTypeMatches = !t.config?.outcomeDocSubTypes || Object.values(outcomeDocLookup).every(doc => t.config?.outcomeDocSubTypes?.indexOf(doc.get('file_sub_type')) !== -1);
    return allDocsAreInTemplate && docSubTypeMatches;
  }).sort((a, b) => (a.config?.outcomeDocs?.length || 0) - (b.config?.outcomeDocs?.length || 0))
};

const getAvailableDeliveryEmailTemplateForDocs = (docDeliveries=[]) => {
  // Send the first matching delivery email - note, doc sets should not match multiple emails
  const templates = getAvailableDeliveryEmailTemplatesForDocs(docDeliveries);
  return templates?.[0] || null;
};

const getUnsentPendingDeliveries = (emailDocDeliveries=[]) => {
  const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
  const paddingMinutes = 15;
  return emailDocDeliveries.filter(delivery => {
    const linkedEmail = delivery.getEmailModel();
    if (!delivery.get('is_delivered') || !linkedEmail) return;
    const emailSendDateWithDelay = Moment.tz(linkedEmail.get('preferred_send_date'), RTB_OFFICE_TIMEZONE_STRING).subtract(paddingMinutes, 'minutes');
    return linkedEmail.isSentPending() && Moment().isBefore(emailSendDateWithDelay, 'minutes');
  });
};

const checkAttachmentSize = (outcomeDocFiles=[]) => {
  const template = getAvailableDeliveryEmailTemplateForDocs(outcomeDocFiles);
  const outcomeDocFilesForEmail = outcomeDocFiles?.map(d => documentsChannel.request('get:outcomedoc', d.get('outcome_doc_file_id')));

  const templateModel = emailsChannel.request('get:templates').find(t => t.get('assigned_template_id') === template.get('assigned_template_id'));
  const attachmentsToCreate = [...templateModel.getAttachmentCommonFileIds().map(id => ({common_file_id: id })), ...outcomeDocFilesForEmail.map(outcomeDoc => ({file_id: outcomeDoc.get('file_id')}))];

  return attachmentsToCreate.map(attachment => {
    if (attachment.common_file_id) return filesChannel.request('get:commonfile', attachment.common_file_id)?.get('file_size');
    else if (attachment.file_id) return filesChannel.request('get:file', attachment.file_id)?.get('file_size');
  }).reduce((attachmentSizeSum, size) => attachmentSizeSum + size, 0);
};


// Progress modal
const ModalGenerateAndSendDeliveryEmail = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['emailDocDeliveries', 'autoSendEmailDate', 'isCleanup']);
    // this.model will be the OutcomeDocGroup model to create the deliveries from
    // If a future date time is passed in autoSendEmailDate, it will be used as the generated emails' preferred send date

    this.deliveryDate = Moment();
    this.progressInstructionsText = this.isCleanup ? `Cleaning up future deliveries. Do not close or refresh this browser window` :
      `Auto-generating decision delivery emails${this.autoSendEmailDate && this.autoSendEmailDate.isAfter(Moment()) ? ` for ${Formatter.toDateAndTimeDisplay(this.autoSendEmailDate)} tomorrow` : ' and sending'}`;
    this.isErrorState = false;
    this.isSuccessState = false;
    this.progressLog = [];
    this.resultsLog = [];

    this.addToProgressLog(PROGRESS_LANGUAGE.start, { noRender: true });
  },

  addToLog(logItem, logItems, options={}) {
    if (options?.index) logItem = `Email ${Formatter.toLeftPad(options.index)}: ${logItem}`;
    logItems.push(logItem);
  },

  addToProgressLog(processLogItem, options={}) {
    this.addToLog(processLogItem, this.progressLog, options);
    if (this.isRendered() && !options?.noRender) this.render();
  },

  addSuccessResult(msg, options={}) {
    this.addToLog(`${msg} - success`, this.resultsLog, options);
  },

  addErrorResult(msg, options={}) {
    this.addToLog(`${msg} - error`, this.resultsLog, options);
  },

  addNotStartedResult(msg, options={}) {
    this.addToLog(`${msg} - not started`, this.resultsLog, options);
  },

  addCancelledResult(msg, options={}) {
    this.addToLog(`${msg} - cancelled`, this.resultsLog, options);
  },  

  startAutoDeliveries() {

    //this.originalStatus = this.model.get('request_status');
    this.isSuccessState = false;
    this.isErrorState = false;

    this.addToLog(`Outcome Doc Group ID: ${this.model.id}`, this.resultsLog);
    this.addToLog(`Process started: ${Formatter.toDateAndTimeDisplay(Moment())}`, this.resultsLog);

    return this.emailDocDeliveries.reduce(
      (promise, docDeliveries, index) => {
        return promise.then(() => this.autoDeliverEmail(docDeliveries, index))
      }, Promise.resolve()
    ).then(() => {
      const onFinishFn = () => {
        this.model.trigger('autoAction:success');
        this.close();
      };  
      this.isSuccessState = true;
      this.addToProgressLog(PROGRESS_LANGUAGE.success);
      setTimeout(() => onFinishFn(), SUCCESS_DELAY);
    })
    .catch(err => {
      console.debug(err);
      this.addToProgressLog(PROGRESS_LANGUAGE.cleanup);
      this.isErrorState = true;
      this.render();
    });
  },

  autoDeliverEmail(docDeliveries=[], index) {
    const loggerOptions = { index: index+1 };
    const template = getAvailableDeliveryEmailTemplateForDocs(docDeliveries);
    
    // TODO: Validate template here as well? Or assume it has already been validated?

    const targetParticipant = participantsChannel.request('get:participant', docDeliveries?.[0]?.get('participant_id'));
    const outcomeDocFilesForEmail = docDeliveries?.map(d => documentsChannel.request('get:outcomedoc', d.get('outcome_doc_file_id')));

    let encounteredError;
    let emailModel;

    this.originalDeliveryData = docDeliveries.map(d => ({
      is_delivered: d.get('is_delivered'),
      delivery_date: d.get('delivery_date'),
      associated_email_id: d.get('associated_email_id'),
    }));
    // Create email from template - adding merge fields
    this.addToProgressLog(PROGRESS_LANGUAGE.createEmail, loggerOptions);
    return this.generateAndSaveTemplate(template, targetParticipant, outcomeDocFilesForEmail)
      .catch(err => {
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.createEmail, loggerOptions);
        this.addNotStartedResult(PROGRESS_LANGUAGE.createAttachments, loggerOptions);
        this.addNotStartedResult(PROGRESS_LANGUAGE.sendEmail, loggerOptions);
        this.addNotStartedResult(PROGRESS_LANGUAGE.setDeliveryStatus, loggerOptions);
        throw err;
      })
      .then(_emailModel => {
        emailModel = _emailModel;
        this.addSuccessResult(PROGRESS_LANGUAGE.createEmail, loggerOptions);
        this.addToProgressLog(PROGRESS_LANGUAGE.createAttachments, loggerOptions);
        return this.createAndSaveEmailAttachments(emailModel, outcomeDocFilesForEmail)
      })
      .catch(err => {
        if (encounteredError) throw err;
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.createAttachments, loggerOptions);
        this.addNotStartedResult(PROGRESS_LANGUAGE.sendEmail, loggerOptions);
        this.addNotStartedResult(PROGRESS_LANGUAGE.setDeliveryStatus, loggerOptions);
        throw err;
      })
      .then(() => {
        // Send email or setup to be sent later
        this.addToProgressLog(PROGRESS_LANGUAGE.sendEmail, loggerOptions);
        return emailModel.saveAsSent();
      })
      .catch(err => {
        if (encounteredError) throw err;
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.sendEmail, loggerOptions);
        this.addNotStartedResult(PROGRESS_LANGUAGE.setDeliveryStatus, loggerOptions);
        throw err;
      })
      .then(() => {
        this.addToProgressLog(PROGRESS_LANGUAGE.setDeliveryStatus, loggerOptions);
        // Update delivery
        docDeliveries.forEach(delivery => {
          delivery.set({
            is_delivered: true,
            delivery_date: this.autoSendEmailDate ? Moment(this.autoSendEmailDate).toISOString() : this.deliveryDate.toISOString(),
            associated_email_id: emailModel.id,
          });
        });
        return Promise.all(docDeliveries.map(d => d.save(d.getApiChangesOnly())));
      })
      .catch(err => {
        if (encounteredError) throw err;
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.setDeliveryStatus, loggerOptions);
        throw err;
      })
      .then(() => {
        // Save the added emails to the global list
        emailsChannel.request('get:all')?.add(emailModel, { merge: true, silent: true });
        this.addSuccessResult(PROGRESS_LANGUAGE.setDeliveryStatus, loggerOptions);
      });
      /*
      .catch(err => {
        // TODO: Cleanup for individual email/delivery failure?

        console.debug(err);
        this.addToProgressLog(PROGRESS_LANGUAGE.cleanup);
        this.isErrorState = true;
        this.render();
        const blocksToReset = this.blocksToCreate.filter(b => !b.isNew());
        this.resetCreatedBlocks()
          .then(() => {
            if (blocksToReset.length) this.addSuccessResult(PROGRESS_LANGUAGE.cleanupBlocks);
            else this.addNotStartedResult(PROGRESS_LANGUAGE.cleanupBlocks);
          }, () => {
            this.addErrorResult(PROGRESS_LANGUAGE.cleanupBlocks);
          })
          .finally(() => {
            this.isErrorState = true;
            this.render();
          });
      });
      */
  },
  
  generateAndSaveTemplate(templateModel, emailToParticipant, outcomeDocFilesForEmail=[]) {
    const dispute = disputeChannel.request('get');
    const sendInFuture = Moment(this.autoSendEmailDate).isValid() && Moment(this.autoSendEmailDate).isAfter(Moment());
    
    if (!templateModel || !emailToParticipant) return;

    const emailSaveData = Object.assign({
        participant_id: emailToParticipant.id,
        email_to: emailToParticipant.get('email'),
        dispute_guid: dispute.id,
      }, sendInFuture ? {
        preferred_send_date: Moment(this.autoSendEmailDate).toISOString()
      } : null
    );
    const emailMergeContextData = {
      outcomeDocFiles: outcomeDocFilesForEmail,
      recipientModel: emailToParticipant,
    }
    
    const emailModel = emailsChannel.request('create:custom',
      templateModel.get('assigned_template_id'),
      emailSaveData,
      emailMergeContextData
    );
    
    return new Promise((res, rej) => {
      emailModel.save()
        .then(() => res(emailModel))
        .catch(rej)
    });
  },

  createAndSaveEmailAttachments(emailModel, outcomeDocFiles=[]) {
    const templateId = emailModel.get('assigned_template_id')
    const attachmentsToCreate = [];
    outcomeDocFiles.forEach(outcomeDoc => {
      if (outcomeDoc.get('file_id')) {
        // Add the doc files
        attachmentsToCreate.push({
          attachment_type: configChannel.request('get', 'EMAIL_ATTACHMENT_TYPE_FILE'),
          file_id: outcomeDoc.get('file_id')
        })
      };
    })
    attachmentsToCreate.push(...emailsChannel.request('get:template:attachments', templateId));
    return Promise.all(attachmentsToCreate.map(attachment => emailModel.createAttachment(attachment)));
  },

  cleanupDeliveries(docDeliveries=[]) {
    let encounteredError = false;
    this.addToProgressLog(PROGRESS_LANGUAGE.delayedCleanupEmail);

    const emailsLookup = {};
    docDeliveries.forEach(d => {
      if (!emailsLookup[d.get('associated_email_id')]) emailsLookup[d.get('associated_email_id')] = d.getEmailModel();
    });
    const emailsToDelete = Object.values(emailsLookup);
    
    return Promise.all(emailsToDelete.map(email => email.destroy()))
      .catch(err => {
        encounteredError = err || true;
        this.addErrorResult(PROGRESS_LANGUAGE.delayedCleanupEmail);
        this.addNotStartedResult(PROGRESS_LANGUAGE.delayedCleanupDelivery);
      })
      .then(() => {
        if (encounteredError) throw encounteredError;
        this.addSuccessResult(PROGRESS_LANGUAGE.delayedCleanupEmail);
        this.addToProgressLog(PROGRESS_LANGUAGE.delayedCleanupDelivery);
        docDeliveries.forEach(d => d.set({
          is_delivered: false,
          delivery_date: null,
          associated_email_id: null,
        }));
        return Promise.all(docDeliveries.map(d => d.save(d.getApiChangesOnly())));
      })
      .catch(err => {
        if (encounteredError) throw encounteredError;
        encounteredError = err || true;
        this.addErrorResult(PROGRESS_LANGUAGE.delayedCleanupDelivery);
      })
      .then(() => {
        const onFinishFn = () => {
          this.model.trigger('autoAction:success');
          this.close();
        };  
        this.isSuccessState = true;
        this.addToProgressLog(PROGRESS_LANGUAGE.success);
        setTimeout(() => onFinishFn(), SUCCESS_DELAY);
      })
      .catch(err => {
        console.debug(err);
        this.isErrorState = true;
        this.render();
      });
  },

  errorClose() {
    this.model.trigger('autoAction:error');
    this.close();
  },

  id: 'noticeAutoAction_modal',
  
  onRender() {
    if (this.progressLog.length) return;
  },

  template() {
    const title = this.isErrorState ? 'Automated Document Delivery Error' : `Automated Document Delivery`;
    const contentRenderFn = this.isSuccessState ? this.renderJsxSuccessState :
      this.isErrorState ? this.renderJsxErrorState :
      this.renderJsxProgressMode;

    return <div className="modal-dialog">
      <div className="modal-content clearfix">
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
        </div>
        <div className="modal-body clearfix">
          {contentRenderFn.bind(this)()}
        </div>
      </div>
    </div>;
  },

  renderJsxProgressMode() {
    const latestEntry = this.progressLog.length && this.progressLog.slice(-1);
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__title">{this.progressInstructionsText}</div>
        <div className="noticeAutoAction_modal__loading-container__img-container">
          <img src={LoaderImg} alt="Loading" />
        </div>
        <div className="noticeAutoAction_modal__loading-container__info">{latestEntry}</div>
      </div>
    </>
  },

  renderJsxErrorState() {
    return <>
      <div className="autoAction_modal__error-state">
        <p>Errors were encountered during the creation of the automated delivery email(s). This can be caused when an internet connection is lost or by a system error. Where possible the system can try to "leave these for manual delivery" or to "retry the automated delivery" process.  If these options are available you will see buttons for them below.  If this error keeps occurring or you don't see any buttons below, provide these error details below to RTB support so that they can fix these deliveries for you.</p>
        <div className="autoAction_modal__error-results-container">
          <label className="general-modal-label">Error Details</label>
          <div className="autoAction_modal__error-results">
            {this.resultsLog.map((logItem, i) => (
              <div key={`err-${i}`} className="autoAction_modal__error-result">{logItem}</div>
            ))}
          </div>
        </div>

        <div className="modal-button-container">
          <button type="button" className="btn btn-lg btn-cancel" onClick={() => this.errorClose()}>Close</button>
        </div>

      </div>
    </>
  },

  renderJsxSuccessState() {
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__success">
          <img className="noticeAutoAction_modal__loading-container__success__img" src={`${SuccessAnimation}?t=${Math.random()}`} alt="Success" />
          Process Completed Successfully!
        </div>
      </div>
    </>
  },

});

_.extend(ModalGenerateAndSendDeliveryEmail.prototype, ViewJSXMixin);


export default {
  checkAttachmentSize,
  getAvailableDeliveryEmailTemplateForDocs,

  startDocDeliveryAutoEmail(emailDocDeliveries, autoSendEmailDate, outcomeDocGroup) {
    if (!emailDocDeliveries || !autoSendEmailDate || !outcomeDocGroup) return Promise.reject();

    return new Promise((res, rej) => {
      let saveSuccess;
      outcomeDocGroup.once('autoAction:success', () => {
        saveSuccess = true;
      });
      const modalView = new ModalGenerateAndSendDeliveryEmail({ model: outcomeDocGroup, emailDocDeliveries, autoSendEmailDate });
      modalChannel.listenToOnce(modalView, 'removed:modal', () => {
        if (saveSuccess) res();
        else rej();
      });
      modalChannel.request('add', modalView);
      loaderChannel.trigger('page:load:complete');
      setTimeout(() => modalView.startAutoDeliveries(), INIT_DELAY);
    });
  },

  getUnsentPendingDeliveries,

  startDocDeliveryCleanup(emailDocDeliveries, outcomeDocGroup) {
    if (!emailDocDeliveries || !outcomeDocGroup) return Promise.reject();
    
    // Ensure deliveries list is flattened
    const delayedSendDeliveries = getUnsentPendingDeliveries([].concat(...emailDocDeliveries));
    return new Promise((res, rej) => {
      if (!delayedSendDeliveries?.length) return res();
      let saveSuccess;
      outcomeDocGroup.once('autoAction:success', () => {
        saveSuccess = true;
      });
      const modalView = new ModalGenerateAndSendDeliveryEmail({ model: outcomeDocGroup, isCleanup: true });
      modalChannel.listenToOnce(modalView, 'removed:modal', () => {
        if (saveSuccess) res();
        else rej();
      });
      modalChannel.request('add', modalView);
      loaderChannel.trigger('page:load:complete');
      setTimeout(() => modalView.cleanupDeliveries(delayedSendDeliveries), INIT_DELAY);
    });
  },

};