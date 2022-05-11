import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import template from './LogoutPage_template.tpl';

const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,
  className: 'dac__logout-page dac__floating-header-page',

  ui: {
    loginLink: '.dac__login-link'
  },

  events: {
    'click @ui.loginLink': 'clickLoginLink'
  },

  clickLoginLink() {
    loaderChannel.trigger('page:load');
    setTimeout(() => Backbone.history.navigate('login', { trigger: true }), 50);
  },

  onRender() {
    loaderChannel.trigger('page:load:complete');
  }
});
