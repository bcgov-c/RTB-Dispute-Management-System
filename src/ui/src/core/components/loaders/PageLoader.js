/**
 * PageLoader is a manger that controls certain repeatable "loader" objects.
 * Currently, only a global page loader is used but in the future, other types of loaders can be configured.
 * @namespace core.components.loaders.PageLoader
 * @memberof core.components
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const loaderChannel = Radio.channel('loader');

const overlayId = 'page-overlay',
  contentId = 'main-content';

const overlayHTML = `
<div id="${overlayId}">
  <img src="${require('../../static/loader_blue_lrg.gif')}" alt="Loading" />
</div>`;

const PageLoader = Marionette.Object.extend({
  /**
   * @class core.components.loaders.PageLoaderClass
   * @augments Marionette.Object
   */
  initialize() {
    loaderChannel.on('page:load', this.showPageLoader, this);
    loaderChannel.on('page:load:complete', this.hidePageLoader, this);
  },

  _lock_page_load: false,

  showPageLoader(options) {
    options = options || {};
    if (this._lock_page_load) {
      return;
    }
    this._lock_page_load = true;
    // Show an overlay on the whole page_view
    $('body').append(overlayHTML);
    $(`#${overlayId}`).show();

    // Only skip this step if disable_scroll: false was not explicitly provided
    if (options.disable_scroll !== false) {
      this.disableMainScroll();
    }
  },

  hidePageLoader() {
    $(`#${overlayId}`).hide().remove();
    this.enableMainScroll();
    this._lock_page_load = false;
  },

  disableMainScroll(ele) {
    $(`#${contentId}`).css({
      position: 'fixed'
    });
  },

  enableMainScroll() {
    $(`#${contentId}`).css({
      position: 'absolute'
    });
  },

});
export default new PageLoader();
