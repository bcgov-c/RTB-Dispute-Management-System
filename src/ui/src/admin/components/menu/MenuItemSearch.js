import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const searchChannel = Radio.channel('searches');
const menuChannel = Radio.channel('menu');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template: _.template(`
    <div class="menu-search-input" <%= hideSearch ? 'style="visibility:hidden!important;"' : '' %> ></div>
    <div class="<%= hideSearch ? 'hidden' : '' %> menu-search-icon"></div>
    <div class="menu-advanced-search-icon"></div>`
  ),
  
  regions: {
    searchInputRegion: '.menu-search-input',
  },
  ui: {
    'search-icon': '.menu-search-icon',
    'advanced-search-icon': '.menu-advanced-search-icon',
  },

  events: {
    'click @ui.search-icon': 'clickSearch',
    'click @ui.advanced-search-icon': 'clickAdvancedSearch'
  },

  clickSearch() {
    const searchInputView = this.getChildView('searchInputRegion');
    if (searchInputView.validateAndShowErrors()) {
      loaderChannel.trigger('page:load');

      searchChannel.request('search:dispute:direct', this.model.get('value'))
        .done(disputeGuid => {
          if (!disputeGuid) {
            loaderChannel.trigger('page:load:complete');
            searchInputView.showErrorMessage('No matching dispute');
            return;
          }

          // If we're already on the overview page for the dispute, do a reload instead of history navigation
          const currentFragment = Backbone.history.fragment;
          const nextFragment = routeParse('overview_item', disputeGuid);
          if (currentFragment=== nextFragment) {
            Backbone.history.loadUrl(Backbone.history.fragment);
          } else {
            Backbone.history.navigate(routeParse('overview_item', disputeGuid), { trigger: true });
          }
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
        });
    }
  },

  clickAdvancedSearch() {
    const search_instance = searchChannel.request('create:search');
    const menu_search_item = search_instance ? search_instance.getMenuItem() : null;

    if (!menu_search_item) {
      return;
    }
    
    menuChannel.trigger('add:group:item', menu_search_item);
    Backbone.history.navigate(menu_search_item.navigation_link, {trigger: true});
  },

  onRender() {
    const searchInputView = new InputView({ model: this.model.set({ value: null }) });
    this.listenTo(searchInputView, 'input:enter', this.clickSearch, this);
    this.showChildView('searchInputRegion', searchInputView);
  },

  templateContext() {
    return {
      hideSearch: false
    };
  }
});
