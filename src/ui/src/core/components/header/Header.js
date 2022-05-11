import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import banner_template from './LoginBanner_template.tpl';
import template from './Header_template.tpl';

const menuChannel = Radio.channel('menu');
const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');

const Header = Marionette.View.extend({
  id: 'header',
  template,
  
  ui: {
    'mobile-list': '.mobile-menu-container',
    'problemButton': '.header-support-modal-icon',
    'logout': '.header-logout-link'
  },

  events: {
    'click @ui.mobile-list': 'clickMobileList',
    'click @ui.logout': 'clickLogout'
  },

  clickLogout() {
    Backbone.history.navigate('logout', { trigger: true });
  },

  initialize(options) {
    this.mergeOptions(options, ['headerText', 'showHeaderProblemButton', 'showLogout', 'hideHeaderInner']);
    this.disabledMobileMenu = true;
    this.showHeaderProblemButton = this.showHeaderProblemButton ? this.showHeaderProblemButton : false;
    this.headerText = this.headerText ? this.headerText : null;
    this.showLogout = this.showLogout ? this.showLogout : false;
    this.hideHeaderInner = this.hideHeaderInner ? this.hideHeaderInner : false;

    this.setupMobileMenuListeners();
  },

  setupMobileMenuListeners() {
    this.listenTo(menuChannel, 'disable:mobile', function() {
      this.disabledMobileMenu = true;
      this._setMobileMenuOpen(false);
      this.render();
    }, this);

    this.listenTo(menuChannel, 'enable:mobile', function() {
      this.disabledMobileMenu = false;
      this._setMobileMenuOpen(false);
      this.render();
    }, this);

    this.listenTo(menuChannel, 'click:mobile', function() {
      this.clickMobileList();
    }, this);
  },

  _setMobileMenuOpen(toOpen) {
    if (toOpen) {
      this.getUI('mobile-list').addClass('menu-open');
    } else {
      this.getUI('mobile-list').removeClass('menu-open');
    }
  },

  clickMobileList() {
    const is_menu_open = this.getUI('mobile-list').hasClass('menu-open');
    this._setMobileMenuOpen(!is_menu_open);
    menuChannel.trigger( is_menu_open ? 'hide:mobile' : 'show:mobile' );
  },

  templateContext() {
    const isDevOrTest = _.contains(['staging', 'development'], configChannel.request('get', 'RUN_MODE'));

    return {
      isDevOrTest,
      WEBPACK_HEADER_LOGO_PATH,
      isLoggedIn: sessionChannel.request('is:authorized'),
      userName: sessionChannel.request('name'),
      disabledMobileMenu: this.disabledMobileMenu,
      showHeaderProblemButton: this.showHeaderProblemButton,
      headerText: this.headerText,
      showLogout: this.showLogout,
      hideHeaderInner: this.hideHeaderInner
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

      initialize() {
        this.mergeOptions(renderedView.options, ['headerText', 'showHeaderProblemButton', 'showLogout']);
      },

      onRender() {
        this.getUI('subHeader').html(banner_template);
        this.showChildView('mainHeader', new Header({ headerText: this.headerText, showHeaderProblemButton: this.showHeaderProblemButton, showLogout: this.showLogout }));
        this.showChildView('subView', renderedView);
      }
    }))();
};

export { Header as HeaderView };