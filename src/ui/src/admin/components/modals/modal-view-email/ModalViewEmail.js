import Radio from 'backbone.radio';
import EmailModel from '../../../../core/components/email/Email_model';
import EmailView from '../../../../core/components/email/Email';
import InputModel from '../../../../core/components/input/Input_model';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import EmailPreviewView from '../../../../core/components/preview-email/PreviewEmail';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import FileBlockDisplay from '../../../pages/common-files/FileBlockDisplay';
import FileCollection from '../../../../core/components/files/File_collection';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import template from './ModalViewEmail_template.tpl';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const animationChannel = Radio.channel('animations');
const Formatter = Radio.channel('formatter').request('get');
const emailsChannel = Radio.channel('emails');

export default ModalBaseView.extend({
  template,
  className: `${ModalBaseView.prototype.className} modalEmail-modal modalEmail-view`,
  regions : {
    subjectInput: '.subject',
    emailToInput: '.emailTo',
    emailContent: '.content',

    pickupStatusRegion: '.comm-email-pickup-status',
    emailForwardDiv: '#comm-email-forward',
    emailPreview: '#email-notice-preview',
    emailResendDiv: '#comm-email-resend',

    attachmentFilesRegion: '.modal-view-email-attachment-files',

    printableIframe: '.email-print-frame'
  },
  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      continue: '#unableToEmailContinue',
      emailForward: '.comm-email-forward',
      emailResend: '.comm-email-resend',
      emailWidgets: '#comm-email-forward-resend',

      pickupStatusContainer: '.comm-email-pickup-status-container',
      pickupStatusEdit: '.comm-email-pickup-status-edit',
      pickupStatusText: '.comm-email-pickup-status-text',
      pickupStatusTextContent: '.comm-email-pickup-status-text > span',
      pickupCancel: '.comm-email-pickup-status-cancel',
      pickupSave: '.comm-email-pickup-status-ok',
      pickupPrint: '.comm-email-print',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.pickupStatusText': 'clickPickupStatus',
      'click @ui.pickupCancel': 'clickPickupCancel',
      'click @ui.pickupSave': 'clickPickupSave',
      'click @ui.pickupPrint': 'clickPickupPrint',
    });
  },

  triggers: {
    'click @ui.continue': 'continue',
  },

  close() {
    if (this.refreshOnClose) {
      this.emailModel.trigger('refresh:page');
    }
    ModalBaseView.prototype.close.call(this);
  },

  clickPickupPrint() {
    const emailPreviewView = this.getChildView('emailPreview');
    emailPreviewView ? emailPreviewView.print() : null;
  },

  clickPickupStatus() {
    this.pickupOpen = !this.pickupOpen;
    
    if (this.pickupOpen) {
      this.getUI('emailForward').addClass('hidden-item');
      this.getUI('emailResend').addClass('hidden-item');
      this.getUI('pickupPrint').addClass('hidden-item');
      this.getUI('pickupStatusEdit').removeClass('hidden');
      this.getUI('pickupStatusTextContent').addClass('hidden');
    } else {
      this.getUI('emailForward').removeClass('hidden-item');
      this.getUI('emailResend').removeClass('hidden-item');
      this.getUI('pickupPrint').removeClass('hidden-item');
      this.getUI('pickupStatusEdit').addClass('hidden');
      this.getUI('pickupStatusTextContent').removeClass('hidden');
      this.pickupStatusModel.set('value', String(this.emailModel.get('send_status'))).trigger('render');
    }
  },

  clickPickupCancel() {
    this.clickPickupStatus();
  },

  clickPickupSave() {
    loaderChannel.trigger('page:load');
    this.emailModel.save(this.pickupStatusModel.getPageApiDataAttrs()).done(res => {
      this.render();
    }).fail(err => generalErrorFactory.createHandler(err, 'ADMIN.EMAILS.SAVE',() => this.render()));
  },

  saveEmailCollectionAttachments(existingEmail, newEmail) {
    const attachmentsToCreate = existingEmail.getAttachments().map(attachmentModel => {
      const attachmentData = _.pick(attachmentModel.toJSON(), 'file_id', 'common_file_id', 'attachment_type');
      return newEmail.createAttachment(attachmentData);
    });
    return Promise.all(attachmentsToCreate);
  },

  _onSendEmail(emailView, sendOptions={}) {
    const existingEmail = this.emailModel;

    const newEmail = new EmailModel(Object.assign({
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_CUSTOM'),
      assigned_template_id: existingEmail.get('assigned_template_id'),
      email_from: existingEmail.get('email_from'),
      subject: existingEmail.get('subject'), 
      html_body: existingEmail.get('html_body'),
      body_type: existingEmail.get('body_type'), 
      text_body: existingEmail.get('text_body'),
      preferred_send_date: existingEmail.get('preferred_send_date'), 
      response_due_date: existingEmail.get('response_due_date'),    
      is_active: false,
      send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT'),
      // Only send to an email, never to a participant
      participant_id: null,
      send_method: configChannel.request('get', 'EMAIL_SEND_METHOD_EMAIL_ADDRESS'),
    }, sendOptions));

    emailView.toDisplayState('sending');
    newEmail.save()
      .then( this.saveEmailCollectionAttachments.bind(this, existingEmail, newEmail) )
      .then(() => {
        return newEmail.save({ is_active: true });
      })
      .then(() => {
        this.refreshOnClose = true;
        emailView.toDisplayState('send_success');
        animationChannel.request('queueEvent', _.bind(function() {
          setTimeout(() => this.close(), 3000);
        }, self));
      })
      .catch(err => {
        const handler = generalErrorFactory.createHandler('ADMIN.EMAIL.SEND', () => {
          emailView.toDisplayState('send_fail');
        });
        handler(err);
      });
  },

  initialize(options) {
    this.mergeOptions(options, ['emailModel']);

    this.refreshOnClose = false;
    this.participant = participantsChannel.request('get:participant', this.emailModel.get('participant_id'));
    this.attachmentFilesCollection = new FileCollection(
      this.emailModel.getAttachments().map(attachment => attachment.getFileModel()).filter(a => a)
    );
    
    this.createSubModels();
  },

  createSubModels() {
    const EMAIL_SEND_STATUS_DISPLAY = configChannel.request('get', 'EMAIL_SEND_STATUS_DISPLAY');
    const pickupOptionData = [
      'EMAIL_SEND_STATUS_READY_FOR_PICKUP',
      'EMAIL_SEND_STATUS_PICKED_UP',
      'EMAIL_SEND_STATUS_PICKUP_ABANDONED',
      'EMAIL_SEND_STATUS_PICKUP_CANCELLED',
    ].map(code => {
      const configVal = configChannel.request('get', code);
      return { text: EMAIL_SEND_STATUS_DISPLAY[configVal], value: String(configVal) };
    });
    
    this.pickupStatusModel = new DropdownModel({
      optionData: pickupOptionData,
      defaultBlank: false,
      value: this.emailModel.get('send_status') ? String(this.emailModel.get('send_status')) : null,
      apiMapping: 'send_status',
    });

    this.emailForwardModel = new InputModel({
      inputType: 'email',
      required: true,
      errorMessage: "Enter the forwarding email"
    });

    let resend_email = this.emailModel.get('email_to');
    if (this.participant && this.participant.get('email')) {
      resend_email = this.participant.get('email'); 
    }

    this.emailResendModel = new InputModel({
      inputType: 'email',
      required: true,
      errorMessage: "Enter the resend email",
      value: resend_email,
      disabled: true
    });
  },

  _getTemplateNameFromId() {
    return emailsChannel.request('get:templates').findWhere({ assigned_template_id: this.emailModel.get('assigned_template_id') });
  },

  setupForwardListeners(forwardRegion) {
    this.listenTo(forwardRegion.currentView, 'email:open:start', function() {
      this.getUI('pickupStatusContainer').addClass('hidden-item');
      this.getUI('emailResend').addClass('hidden-item');
      this.getUI('pickupPrint').addClass('hidden-item');
    }, this);
    
    this.listenTo(forwardRegion.currentView, 'email:close:complete', function() {
      this.getUI('pickupStatusContainer').removeClass('hidden-item');
      this.getUI('emailResend').removeClass('hidden-item');
      this.getUI('pickupPrint').removeClass('hidden-item');
    }, this);

    this.listenTo(forwardRegion.currentView, 'sendEmail', function(emailView) {
      this._onSendEmail(emailView, { email_to: this.emailForwardModel.getData() });
    }, this);
  },


  setupResendListeners(resendRegion) {
    this.listenTo(resendRegion.currentView, 'email:open:start', function() {
      this.getUI('emailForward').addClass('hidden');
      this.getUI('pickupStatusContainer').addClass('hidden-item');
      this.getUI('pickupPrint').addClass('hidden-item');
    }, this);

    this.listenTo(resendRegion.currentView, 'email:close:complete', function() {
      this.getUI('emailForward').removeClass('hidden');
      this.getUI('pickupStatusContainer').removeClass('hidden-item');
      this.getUI('pickupPrint').removeClass('hidden-item');
    }, this);
    
    this.listenTo(resendRegion.currentView, 'sendEmail', function(emailView) {
      this._onSendEmail(emailView, { email_to: this.emailResendModel.getData() });
    }, this);
  },

  onBeforeRender() {
    // Render always re-set template to default state
    this.pickupOpen = false;
    this.pickupStatusModel.set('value', this.emailModel.get('send_status') ? String(this.emailModel.get('send_status')) : null);
  },

  onRender() {
    this.showChildView('emailPreview', new EmailPreviewView({ emailModel: this.emailModel }));
    this.showChildView('attachmentFilesRegion', new FileBlockDisplay({ collection: this.attachmentFilesCollection }));
    this.showChildView('pickupStatusRegion', new DropdownView({ model: this.pickupStatusModel }));
    
    const forwardRegion = this.showChildView('emailForwardDiv', new EmailView({
      widgetMode: true,
      disableAnimations: false,
      labelText: 'Forward',
      iconClass: 'email-forward-icon',
      floatDir: 'right',
      model: this.emailForwardModel,
      eraseTextAfterClose: true,
    }));
    
    this.setupForwardListeners(forwardRegion);

    const resendRegion = this.showChildView('emailResendDiv', new EmailView({
      widgetMode: true,
      labelText: 'Resend',
      iconClass: 'email-resend-icon',
      floatDir: 'right',
      model: this.emailResendModel,
      eraseTextAfterClose: false
    }));
    this.setupResendListeners(resendRegion);

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    const EMAIL_TYPE_DISPLAY = configChannel.request('get', 'EMAIL_TYPE_DISPLAY');
    const templateName = this._getTemplateNameFromId();
    return {
      Formatter,
      showResend: !this.emailModel.isPickup() && this.emailResendModel.get('value'),
      emailModel: this.emailModel,
      participant: this.participant,
      statusToDisplay: this.emailModel.toStatusDisplay(),
      numEmailAttachments: this.emailModel.getAttachments().length,
      templateName: templateName ? `${this.emailModel.get('assigned_template_id')} - ${templateName.get('template_description')}` : '-',
      emailType: !this.emailModel.get('message_type') ? '-' : EMAIL_TYPE_DISPLAY[this.emailModel.get('message_type')],
    };
  }

});
