/**
 * @fileoverview - Modal that warns user that clicked link leads to external site. Opens external site when continue button is pressed.
 */
import ModalBaseView from '../ModalBase';
import template from './ModalExternalLink_template.tpl';
import AnalyticsUtil from '../../../utilities/AnalyticsUtil';

export default ModalBaseView.extend({
  template,
  id: 'external-modal',

  className: `${ModalBaseView.prototype.className} external-url-modal`,

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      'continue': '#externalContinue',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.continue': 'goToLink',
    });
  },

  goToLink() {
    AnalyticsUtil.trackUrlClickEvent(this.url);

    const winTab = window.open(this.url, '_blank');
      winTab.opener = null;
    this.close();
  },

  initialize(options) {
    this.mergeOptions(options, ['url']);
  },

  getBaseName(url_string) {
    var parser = document.createElement('a');
    parser.href = url_string;
    return parser.origin ? parser.origin : (parser.protocol + "//" + parser.hostname);
  },

  templateContext() {
    return {
      siteName: this.getBaseName(this.url)
    };
  }
});
