import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import { routeParse } from '../../routers/mainview_router';
import SearchSectionView from './AdvancedSearch';
import template from './SearchInstance_template.tpl';

const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const searchChannel = Radio.channel('searches');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} advanced-search-page`,

  regions: {
    searchSection: '.search-type'
  },

  ui: {
    refreshIcon: '.header-refresh-icon',
    closeIcon: '.header-close-icon'
  },

  events: {
    'click @ui.closeIcon': 'clickClose'
  },

  clickClose() {
    menuChannel.trigger('close:active');
    searchChannel.request('delete:search', this.model);
    Backbone.history.navigate(routeParse('landing_item'), {trigger: true});
  },

  onRender() {
    loaderChannel.trigger('page:load:complete');
    this.showChildView('searchSection', new SearchSectionView({ model: this.model }));
  }

});
