/**
 * @fileoverview - Basic View that displays a HTML Header, Footer, and main content. Contains basic hide/show functions.
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { HeaderView } from '../header/Header';
import FooterView from '../footer/Footer';
import template from './RootLayout_template.tpl';

const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  id: 'root',

  regions: {
    headerRegion: '#header',
    mainRegion: '#main-content',
    footerRegion: '#footer-region',
  },

  initialize(options) {
    this.mergeOptions(options, ['showHeader', 'showFooter', 'headerText', 'showHeaderProblemButton', 'showLogout']);
    this.showHeader = this.showHeader ? this.showHeader : false;
    this.showFooter = this.showFooter ? this.showFooter : false;
    this.headerText = this.headerText ? this.headerText : false;
    this.showHeaderProblemButton = this.showHeaderProblemButton ? this.showHeaderProblemButton : false;
    this.showLogout = this.showLogout ? this.showLogout : false;
  },

  onRender() {
    this.renderHeader();
    if (this.showFooter) this.showChildView('footerRegion', new FooterView());
  },

  renderHeader() {
    if (this.showHeader) this.showChildView('headerRegion',new HeaderView({ headerText: this.headerText, showHeaderProblemButton: this.showHeaderProblemButton, showLogout: this.showLogout }));
  },

  templateContext() {
    const isDevOrTest = _.contains(['staging', 'development'], configChannel.request('get', 'RUN_MODE'));
    return {
      isDevOrTest,
      WEBPACK_HEADER_LOGO_PATH,
    };
  }
});
