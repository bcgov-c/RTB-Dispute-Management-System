import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './DisputeAmendment_template.tpl';
import UnlinkedIcon from '../../static/Icon_Admin_UnlinkedAmend.png';

const userChannel = Radio.channel('users');
const participantChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

  export default Marionette.View.extend({
  template,
  className: 'amendment-list-item',

  initialize(options) {
    this.mergeOptions(options, ['enableUnlinkedIcon']);
  },

  templateContext() {
    return {
      Formatter,
      submitter: participantChannel.request('get:participant', this.model.get('amendment_submitter_id')),
      createdByDisplay: userChannel.request('get:user:name', this.model.get('created_by')),
      enableUnlinkedIcon: this.enableUnlinkedIcon,
      UnlinkedIcon,
    };
  }
});