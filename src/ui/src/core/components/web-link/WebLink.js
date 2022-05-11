/**
 * @fileoverview Setups up a global handler for dealing with external links being clicked.
 * @namespace intake.components.WebLink
 * @memberof intake.components
 */

import Radio from 'backbone.radio';
import ModalExternalLink from '../modals/modal-external-link/ModalExternalLink';
import template from './WebLink_template.tpl';

const modalChannel = Radio.channel('modals');

/** @const */
const WEB_LINK_CLASS = 'static-external-link';
/** @const */
const WEB_LINK_SELECTOR = `.${WEB_LINK_CLASS}`;
const CLEAR_MODALS_SELECTOR = `.static-clear-modals`;

/**
 *  A global listener on <body> for the designated class to be clicked.
 *  If click is detected, open external link modal.
 */
$(document).ready(function() {
  $('body').off('click.rtbexternal', WEB_LINK_SELECTOR);
  $('body').on('click.rtbexternal', WEB_LINK_SELECTOR, function(ev) {
    ev.preventDefault();
    const modalExternalLink = new ModalExternalLink({ url: $(this).attr('url') });
    modalChannel.request('add', modalExternalLink);
  });
  $('body').off('click.rtbclearmodals', CLEAR_MODALS_SELECTOR);
  $('body').on('click.rtbclearmodals', CLEAR_MODALS_SELECTOR, function() {
    modalChannel.request('remove:all');
    return true;
  });
});

export default {

  /**
   * Returns a formatted link from url and text data.
   *
   * @param {String} webLinkData.url The url to use for the link.
   * @param {String} webLinkData.text The hyperlinked text.
   * @param {Array|String} [webLinkData.extraClasses] An optional list of classes to add to the link template
   * that is returned.  Can be an array of classes, or a string of classes.
   *
   * @returns {String} The html link created for the given parameters.
   */
  format(webLinkData) {
    if (!webLinkData || !$.trim(webLinkData.url) || !$.trim(webLinkData.text)) {
      console.log(`[Error] Tried to format invalid weblink data:`, webLinkData);
      return false;
    }

    return template({
      web_link_class: WEB_LINK_CLASS,
      url: webLinkData.url,
      text: webLinkData.text,
      extraClasses: webLinkData.extraClasses ? (_.isArray(webLinkData.extraClasses) ? webLinkData.extraClasses.join(' ') : webLinkData.extraClasses) : ''
    });
  }
};
