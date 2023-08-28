/**
 * @fileoverview - View that displays site header. Changes color based on environment it is being run in.
 */
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './Header_template.tpl';

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,

  ui: {
    logout: '.header-logout-link'
  },

  events: {
    'click @ui.logout': 'clickLogout'
  },

  clickLogout() {
    Backbone.history.navigate('logout', { trigger: true });
  },

  initialize() {
    this.disabledMobileMenu = true;
  },

  templateContext() {
    const isDevOrTest = _.contains(['staging', 'development'], configChannel.request('get', 'RUN_MODE'));
    return {
      isDevOrTest,
      WEBPACK_HEADER_LOGO_PATH,
      isLoggedIn: sessionChannel.request('is:authorized'),
      userName: sessionChannel.request('name'),
      disabledMobileMenu: this.disabledMobileMenu
    };
  }
});
