import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';

const api_name = 'emailtemplate';
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'email_template_id',

  defaults: { 
    email_template_id: null,
    assigned_template_id: null,
    template_group: null,
    template_title: null,
    template_description: null,
    template_access_roles: null,
    default_recipient_group: null,
    subject_line: null,
    template_html: null,
    template_attachment_01: null,
    template_attachment_02: null,
    template_attachment_03: null,
    template_attachment_04: null,
    template_attachment_05: null,
    template_attachment_06: null,
    reply_email_address: null,
    template_status: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'assigned_template_id',
    'template_group',
    'template_title',
    'template_description',
    'template_access_roles',
    'default_recipient_group',
    'subject_line',
    'template_html',
    'template_attachment_01',
    'template_attachment_02',
    'template_attachment_03',
    'template_attachment_04',
    'template_attachment_05',
    'template_attachment_06',
    'reply_email_address',
    'template_status'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}`;
  },

  initialize() {
    this.config = (configChannel.request('get', 'EMAIL_TEMPLATES_CONFIG')||{})[this.get('assigned_template_id')] || {};
  },

  getAttachmentCommonFileIds() {
    const templateFileFields = [
      'template_attachment_01',
      'template_attachment_02',
      'template_attachment_03',
      'template_attachment_04',
      'template_attachment_05',
      'template_attachment_06',
    ];
    return templateFileFields.map(fieldName => this.get(fieldName)).filter(fileId => fileId);
  },

  isDefaultRecipientPrimary() {
    return this.get('default_recipient_group') === configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_PRIMARY');
  },
  
});
