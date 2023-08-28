import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalViewEmail from './modals/ModalViewCommunicationEmail';
import ModalCreateEmail from './modals/ModalCreateEmail';
import template from './CommunicationEmail_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,

  className: 'standard-list-item email-list-item',
  
  ui: {
    'deleteEmail': '.comm-delete-email-btn',
    'viewEmail': '.view-email-link'
  },

  events: {
    'click @ui.deleteEmail': 'clickDeleteEmail',
    'click @ui.viewEmail': 'clickViewEmail',
  },

  clickDeleteEmail() {
    modalChannel.request('show:standard', {
      title: 'Delete Draft Email?',
      bodyHtml: '<p>Are you sure you want to delete this draft email message? This action is permanent and cannot be undone.</p>',
      primaryButtonText: 'Yes, Delete',
      onContinueFn: (modalView) => {
        modalView.close();
        loaderChannel.trigger('page:load');
        this.model.destroy()
        .fail(generalErrorFactory.createHandler('ADMIN.EMAIL.REMOVE'))
        .always(() => loaderChannel.trigger('page:load:complete'))
      }
    });
  },

  clickViewEmail(e) {
    e.preventDefault();
    loaderChannel.trigger('page:load');
    this.model.fetch()
      .done(() => {
        loaderChannel.trigger('page:load:complete');
        
        const modalViewToAdd = this.model.isUnsentDraft() ? new ModalCreateEmail({
          model: this.model,
          draftEmailModel: this.model
        }) : new ModalViewEmail({ emailModel: this.model });
        modalChannel.request('add', modalViewToAdd);
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.EMAIL.LOAD');
        handler(err);
      });
  },

  initialize() {
    this.listenTo(this.model, 'sync', () => this.isRendered() && this.render());
  },

  templateContext() {
    const EMAIL_TYPE_DISPLAY = configChannel.request('get', 'EMAIL_TYPE_DISPLAY');
    const isUnsentDraft = this.model.isUnsentDraft();
    const participant = participantsChannel.request('get:participant', this.model.get('participant_id'));
    const participantDisplay = participant ? `${participant.isTenant() ? 'Tenant: ' : 'Landlord: '}${participant.getDisplayName()}` : '';
    return {
      Formatter,
      messageTypeToDisplay: EMAIL_TYPE_DISPLAY?.[this.model.get('message_type')] || '-',
      statusToDisplay: this.model.toStatusDisplay(),
      isSentError: this.model.isSentError(),
      isUnsentDraft,
      isPickup: this.model.isPickup(),
      showDelete: !!isUnsentDraft,
      recipientDisplay: `${participantDisplay}${!this.model.isPickup() && this.model.get('email_to') ? `${participantDisplay?' - ':''}${this.model.get('email_to')}` : ''}`
    };
  }
});
