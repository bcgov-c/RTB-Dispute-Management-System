/**
 * @fileoverview - View that displays HTML Footer for DA and OS sites containing links 
 * @class core.components.footer.FooterView
 * @memberof core.components.footer
 * @augments Marionette.View
 */

import Marionette from 'backbone.marionette';
import WebLink from '../web-link/WebLink';

const links_data = [
  { url: 'http://www2.gov.bc.ca/gov/content/home/disclaimer', text: 'Disclaimer', extraClasses: ['footer-item', 'first'] },
  { url: 'http://www2.gov.bc.ca/gov/content/home/accessibility', text: 'Accessibility', extraClasses: ['footer-item' ]},
  { url: 'http://www2.gov.bc.ca/gov/content/home/copyright', text: 'Copyright', extraClasses: ['footer-item', 'first'] }
];
export default Marionette.View.extend({
  template: _.template(`<div class="footer-inner"></div>`),
  id: 'footer',
  ui: {
    inner: '.footer-inner',
  },

  onRender() {
    const linkContainer = this.getUI('inner').empty();
    _.each(links_data, function(link_data, index) {
      linkContainer.append(WebLink.format(link_data));
      if (index < links_data.length - 1) {
        linkContainer.append(`<span class="footer-item">|</span>`);
      }
    });
  }
});
