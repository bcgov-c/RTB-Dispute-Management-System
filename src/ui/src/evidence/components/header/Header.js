import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './Header_template.tpl';
import banner_template from './LoginBanner_template.tpl';

const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');

const HeaderView = Marionette.View.extend({
  template,
  id: 'header',

  ui: {
    logout: '.header-logout-link',
    problemButton: '.header-support-modal-icon'
  },

  events: {
    'click @ui.logout': 'clickLogout'
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  initialize() {
    this.disabledMobileMenu = true;
    this.disableProblemButton = !sessionChannel.request('is:authorized');

    this.listenTo(sessionChannel, 'login:complete', function() {
      this.disableProblemButton = false;
      this.render();
    }, this);
  },

  templateContext() {
    const isDevOrTest = _.contains(['staging', 'development'], configChannel.request('get', 'RUN_MODE'));
    return {
      isDevOrTest,
      WEBPACK_HEADER_LOGO_PATH,
      isLoggedIn: sessionChannel.request('is:authorized'),
      userName: sessionChannel.request('name'),
      disabledMobileMenu: this.disabledMobileMenu,
      disableProblemButton: this.disableProblemButton
    };
  }
});


export const withSiteHeaders = (renderedView) => {
  return new (Marionette.View.extend({
    template: _.template(`<div id="floating-header"></div><div id="floating-sub-header"></div><div id="with-site-header-view"></div>`),
      regions: {
        mainHeader: '#floating-header',
        subView: '#with-site-header-view',
      },
      ui: {
        subHeader: '#floating-sub-header'
      },
      onRender() {
        this.getUI('subHeader').html(banner_template);
        this.showChildView('mainHeader', new HeaderView());
        this.showChildView('subView', renderedView);
      }
    }))();
};

export { HeaderView };