/**
 * @fileoverview - Basic root View that renders a header and main site content
 */
import Marionette from 'backbone.marionette';

import template from './RootLayout_template.tpl';
import HeaderView from '../header/Header' //'../header/Header';

export default Marionette.View.extend({
  template,
  tagName: 'div',
  id: 'root',

  regions: {
    headerRegion: '#header',
    mainRegion: '#main-content'
  },

  onRender() {
    this.showChildView('headerRegion', new HeaderView());
  },

  renderHeader() {
    this.showChildView('headerRegion', new HeaderView());
  }
});
