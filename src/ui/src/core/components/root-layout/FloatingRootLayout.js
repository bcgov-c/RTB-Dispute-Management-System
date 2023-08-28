/**
 * @fileoverview - Alternative Root Layout View used in DA and OS. Displays a HTML Header, Footer, and main content. Contains basic hide/show functions.
 */
import Marionette from 'backbone.marionette';

import template from './FloatingRootLayout_template.tpl';

import { HeaderView } from '../header/Header';
import FooterView from '../../../core/components/footer/Footer';

export default Marionette.View.extend({
  template,
  tagName: 'div',
  id: 'root',

  className() {
    return `${this.getOption('mainContentClasses')} root-rendered`;
  },

  regions: {
    headerRegion: '#header-region',
    floatingMainRegion: '#floating-main-content',
    mainRegion: '#content',
    footerRegion: '#footer-region',
  },

  ui: {
    mainContent: '#main-content',
    floatingContent: '#floating-main-content'
  },


  initialize(options) {
    this.setOptions(options);
  },

  setOptions(options) {
    this.mergeOptions(options, ['mainContentClasses', 'headerText', 'hideFooter', 'hideHeader', 'showHeaderProblemButton', 'hideHeaderInner']);
    return this;
  },

  getMainContentRegion() {
    return this.getRegion('mainRegion');
  },

  getFloatingContentRegion() {
    return this.getRegion('floatingMainRegion');
  },

  hideMainContent() {
    this.getUI('mainContent').hide();
  },

  hideFloatingContent() {
    this.getUI('floatingContent').hide();
  },

  // Only main or floating is visible at a time
  showMainContent() {
    this.hideFloatingContent();
    this.getUI('mainContent').show();
  },

  showFloatingContent() {
    this.hideMainContent();
    this.getUI('floatingContent').show();
  },


  onRender() {
    if (!this.hideHeader) {
      this.showChildView('headerRegion', new HeaderView({ headerText: this.headerText, showHeaderProblemButton: this.showHeaderProblemButton, hideHeaderInner: this.hideHeaderInner }));
    }
    if (!this.hideFooter) {
      this.showChildView('footerRegion', new FooterView());
    }
  }
});
