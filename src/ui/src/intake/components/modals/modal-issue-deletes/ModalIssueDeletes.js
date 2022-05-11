import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import template from './ModalIssueDeletes_template.tpl';

const configChannel = Radio.channel('config');

export default ModalBaseView.extend({
  template,
  id: 'issueDeletes-modal',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      continue: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.continue': 'clickSave',
    });
  },

  triggers: {
    'click @ui.continue': 'continue',
  },

  initialize(options) {
    this.mergeOptions(options, ['issues_to_delete']);
  },

  templateContext() {
    const issues_config = configChannel.request('get', 'issues_config'),
      singular = this.issues_to_delete && this.issues_to_delete.length === 1,
      issue_delete_text = `All information that is related to the item${singular? '':'s'} that you have deselected will be deleted. This action cannot be undone.  You have removed the following isssue${singular ? '':'s'}:`;

    return {
      singular,
      issue_delete_text,
      issues_to_delete: this.issues_to_delete ? _.map(this.issues_to_delete, function(issue) {
        const issue_config = issues_config[issue.get('claim_code')];
        return issue_config ? issue_config.issueTitle : '';
      }) : []
    };
  }
});
