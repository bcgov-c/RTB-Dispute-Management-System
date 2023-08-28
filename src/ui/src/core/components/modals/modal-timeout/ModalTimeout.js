/**
 * @class core.components.modals.modal-timeout.ModalTimeoutView
 * @augments Marionette.View
 * @fileoverview - Modal that acts as a logout warning timer.
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import template from './ModalTimeout_template.tpl';

const configChannel = Radio.channel('config');
const timerChannel = Radio.channel('timers');

const countdown_timer_name = 'timeoutCountdown';

export default Marionette.View.extend({
  template,

  id: 'timeout_modal',
  className: "modal fade modal-rtb-default",

  attributes: {
    'data-backdrop': 'static',
    'data-keyboard': 'false'
  },

  ui: {
    'continue': '#timeoutLogIn',
    'cancel': '#timeoutLogOut'
  },

  events: {
    'click @ui.continue': 'clickLogin',
    'click @ui.cancel': 'clickLogout'
  },

  clickLogin() {
    this._clearOwnTimers();
    this.trigger('login');
  },

  clickLogout() {
    Radio.channel('modals').request('remove', this);
    this._clearOwnTimers();
    this.trigger('logout');
  },

  countdownInterval: null,

  countdownFn(last_render_time, countdown_ele) {
    const countdown_sec = (configChannel.request('get', 'TIMEOUT_WARNING_OFFSET_MS') / 1000);
    const countdown_int = parseInt((new Date().getTime() - last_render_time) / 1000);
    let countdown_text = '';
    if (countdown_int >= countdown_sec) {
      countdown_text = "Logging out now...";
    } else if (!_.isNaN(countdown_int)) {
      const seconds_left = countdown_sec - countdown_int;
      countdown_text = `${seconds_left} second${seconds_left === 1 ? '' : 's'}` ;
    }
    countdown_ele.text(countdown_text);
  },

  automaticLogout() {
    this._clearOwnTimers();
    this.trigger('logout');
  },

  _clearOwnTimers() {
    clearInterval(this.countdownInterval);
    timerChannel.request('stop:timer', countdown_timer_name);
  },

  onRender() {
    const last_render_time = new Date().getTime();
    const countdown_sec = (configChannel.request('get', 'TIMEOUT_WARNING_OFFSET_MS') / 1000);
    const countdown_ele = this.$('.timeout-countdown');

    // Run the countdown function once, and then put on 1 second interval
    timerChannel.request('stop:timer', countdown_timer_name);
    timerChannel.request('create', {
      name: countdown_timer_name,
      expiration_fn: _.bind(this.automaticLogout, this),
      timeout_ms: (countdown_sec + 1) * 1000
    });
    this.countdownFn(last_render_time, countdown_ele);
    this.countdownInterval = setInterval(_.bind(this.countdownFn, this, last_render_time, countdown_ele), 1000);
    this.delegateEvents();
  },

  templateContext() {
    const countdown_sec = (configChannel.request('get', 'TIMEOUT_WARNING_OFFSET_MS') / 1000);
    return {
      timeout_countdown_start: countdown_sec
    };
  }

});
