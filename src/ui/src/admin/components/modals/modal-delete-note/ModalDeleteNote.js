
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import Radio from 'backbone.radio';
import template from './ModalDeleteNote_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'deleteNote_modal',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      'continue': '#deleteNoteOK',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.continue': 'clickDelete',
    });
  },
  
  clickDelete() {
    loaderChannel.trigger('page:load');
    this.model.destroy()
      .done(() => {
        this.close();
        loaderChannel.trigger('page:load:complete');
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.NOTE.REMOVE', () => this.close);
        handler(err);
      });
  },

  templateContext() {
    const NOTE_LINK_DISPLAY = configChannel.request('get', 'NOTE_LINK_DISPLAY');
    const note_creator_role_display = userChannel.request('get:role:display', this.model.get('creator_group_role_id'));

    return {
      Formatter,
      linkToDisplay: NOTE_LINK_DISPLAY[this.model.get('note_linked_to')],
      noteCreatorRoleDisplay: note_creator_role_display ? note_creator_role_display : 'N/A'
    };
  }
});
