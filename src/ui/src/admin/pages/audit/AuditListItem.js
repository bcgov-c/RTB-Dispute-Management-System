import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalViewAuditItem from '../../components/modals/modal-view-audit-item/ModalViewAuditItem';
import template from './AuditListItem_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');
const userChannel = Radio.channel('users');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const auditChannel = Radio.channel('audits');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item',

  ui: {
    'viewAuditItem': '.view-audit-log',
  },

  events: {
    'click @ui.viewAuditItem': 'clickViewAuditItem',
  },

  initialize(options) {
    this.mergeOptions(options, ['collection']);
  },

  clickViewAuditItem() {
    this.collection.setElement(this.model);

    auditChannel.request('get:audit', this.model.id)
      .done(auditData => {
        this.model.set(auditData);
        modalChannel.request('add', new ModalViewAuditItem({ model: this.model, collection: this.collection }));
      }).fail(
        generalErrorFactory.createHandler('ADMIN.AUDIT.ITEM.LOAD')
      )
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  templateContext() {
    let changeByDisplay = null;

    if (this.model.get('submitter_role') === 1) {
      changeByDisplay = userChannel.request('get:user:name', this.model.get('submitter_user_id'));
    } else if (this.model.get('submitter_role') === 2) {
      changeByDisplay = this.model.get('submitter_name');
    } else if (this.model.get('submitter_role') === 4) {
      changeByDisplay = participantsChannel.request('get:participant:name', this.model.get('submitter_participant_id'));
    }

    return {
      Formatter,
      changeByDisplay,
      userRoleDisplay: auditChannel.request('get:user:role:display', this.model.get('submitter_role')),
      apiNameDisplay: auditChannel.request('get:api:display', this.model.get('api_name')),
      httpRequestDisplay: auditChannel.request('get:http:display', this.model.get('api_call_type')),
      typeClass: 'audit-' + $.trim(this.model.get('api_call_type')).toLowerCase()
    };
  },

});