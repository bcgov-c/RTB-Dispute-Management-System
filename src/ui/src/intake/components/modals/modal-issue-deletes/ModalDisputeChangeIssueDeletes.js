import Radio from 'backbone.radio';
import ModalIssueDeletes from './ModalIssueDeletes';

const configChannel = Radio.channel('config');

export default ModalIssueDeletes.extend({
  templateContext() {
    const issues_config = configChannel.request('get', 'issues_config'),
      singular = this.issues_to_delete && this.issues_to_delete.length === 1,
      issue_delete_text = `You have changed the dispute and the following issue${singular? '':'s'} no longer appl${singular?'ies':'y'} and will be deleted.  This action cannot be undone.  The following issue${singular ? '':'s'} will be removed:`;

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
