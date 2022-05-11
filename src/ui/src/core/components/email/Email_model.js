import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';
import EmailAttachmentCollection from './EmailAttachment_collection';
import EmailAttachmentModel from './EmailAttachment_model';

const api_name = 'emailmessage';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default CMModel.extend({
  idAttribute: 'email_id',

  defaults: {
    email_id: null,
    dispute_guid: null,
    subject: null,
    email_to: null,
    content: null,
    created_date: null,
    message_type: null,
    message_sub_type: null,
    recipient_group: null,
    email_from: null,
    html_body: null,
    text_body: null,
    participant_id: null,
    send_status: null,
    email_attachments: null,
    sent_date: null,
    preferred_send_date: null,
    is_active: null,
    response_due_date: null,
    retries: null,
    assigned_template_id: null,
    body_type: 1, // Default to body type "HTML only"
    send_method: 2,
  },

  API_SAVE_ATTRS: [
    'message_type',
    'message_sub_type',
    'assigned_template_id',
    'email_to',
    'email_from',
    'recipient_group',
    'subject',
    'html_body',
    'body_type',
    'is_active',
    'text_body',
    'preferred_send_date',
    'response_due_date',
    'send_method',
    'send_status',
    'participant_id'
  ],

  nested_collections_data() {
    return {
      email_attachments: EmailAttachmentCollection
    };
  },

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  isUnsentPending() {
    return this.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT') && this.get('is_active');
  },

  isUnsentDraft() {
    return this.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT') && !this.get('is_active');
  },

  isSent() {
    return this.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_SENT');
  },

  isSentPending() {
    return this.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_PENDING');
  },

  isSentError() {
    return this.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_ERROR');
  },

  isSendStatusPickedUp() {
    return this.get('send_status') === configChannel.request('get', 'EMAIL_SEND_STATUS_ERROR');
  },

  isPickup() {
    return [configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP'),
      configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP_WITH_EMAIL')].includes(this.get('message_type'));
  },

  isPickupConfirmation() {
    return this.get('message_type') === configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP_CONFIRMATION');
  },

  toStatusDisplay() {
    const EMAIL_SEND_STATUS_DISPLAY = configChannel.request('get', 'EMAIL_SEND_STATUS_DISPLAY') || {};
    const sentDate = this.get('sent_date');
    return this.isSent() ? `Sent${sentDate ? `: ${Formatter.toDateAndTimeDisplay(sentDate)}` : ''}` :
      this.isSentPending() ? `Delay: ${Formatter.toDateAndTimeDisplay(this.get('preferred_send_date'))}` :
      this.isUnsentPending() ? `Pending send` :
      this.isSentError() ? `Error - not sent, view to resend` :
      this.isSendStatusPickedUp() ? `Picked up${sentDate ? `: ${Formatter.toDateAndTimeDisplay(sentDate)}` : ''}` :
      (EMAIL_SEND_STATUS_DISPLAY[this.get('send_status')] || `Saved - view to send`);
  },

  getAttachments() {
    if (!this.get('email_attachments')) {
      this.set('email_attachments', new EmailAttachmentCollection());
    }
    return this.get('email_attachments');
  },

  createAttachment(emailAttachmentData) {
    const attachmentCollection = this.getAttachments();
    const newAttachmentModel = new EmailAttachmentModel(Object.assign({ email_id: this.id }, emailAttachmentData));
    return new Promise((res, rej) => {
      newAttachmentModel.save()
        .done(() => {
          attachmentCollection.add(newAttachmentModel);
          res();
        }).fail(rej);
    });
  }
});
