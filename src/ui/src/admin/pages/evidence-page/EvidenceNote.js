import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './EvidenceNote_template.tpl';

const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item communication-note-item',
  templateContext() {
    const roleDisplay = userChannel.request('get:role:display', this.model.get('creator_group_role_id'));
    return {
      Formatter,
      noteCreatorRoleDisplay: roleDisplay ? roleDisplay : 'N/A'
    };
  }
});
