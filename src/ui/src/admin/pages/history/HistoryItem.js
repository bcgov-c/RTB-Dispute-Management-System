import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './HistoryItem_template.tpl';

const statusChannel = Radio.channel('status');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item',

  templateContext() {
    return {
      Formatter,
      colourClass: statusChannel.request('get:colourclass', this.model.get('dispute_stage'), this.model.get('dispute_status'))
    };
  }
});
