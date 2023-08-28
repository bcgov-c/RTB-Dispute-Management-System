/**
 * @fileoverview - Basic View that contains core modal logic from which other modal files can extend from 
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const FULLSIZE_CLASS = 'modal-fullsize';

const modalChannel = Radio.channel('modals');

/* Re-usable Modal view */
export default Marionette.View.extend({
  /* Required attributes:
  template
  */

  className: 'modal fade modal-rtb-default',

  attributes: {
    'data-backdrop': 'static',
    'data-keyboard': 'false'
  },

  ui: {
    cancel: '.btn-cancel',
    close: '.close-x'
  },

  events: {
    'click @ui.close': 'close',
    'click @ui.cancel': 'close',
  },

  close() {
    modalChannel.request('remove', this);
  },

  fullSize() {
    this.$el.addClass(FULLSIZE_CLASS);
  },

  unFullSize() {
    this.$el.removeClass(FULLSIZE_CLASS);
  }
});
