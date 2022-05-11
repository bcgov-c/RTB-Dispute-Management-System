import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import template from './LogoutPage_template.tpl';

const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,
  className: 'da-logout-content',

  ui: {
    loginLink: '.da-access-login'
  },

  events: {
    'click @ui.loginLink': 'clickLoginLink'
  },

  clickLoginLink() {
    loaderChannel.trigger('page:load');
    setTimeout(_.bind(Backbone.history.navigate, Backbone.history, 'login', { trigger: true }), 50);
  },

  onRender() {
    loaderChannel.trigger('page:load:complete');
  }
});
