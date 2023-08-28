/**
 * @fileoverview - Container View for the left site menu. Navigation to opened disputes and dashboard pages is provided.
 */
import Marionette from 'backbone.marionette';
import MenuItemSearchView from './MenuItemSearch';
import MenuItemView from './MenuItem';

export default Marionette.View.extend({
  template: _.template(`  
    <div class="menu-search menu-block"></div>
    <div class="menu-items menu-block"></div>
  `),
  
  id: 'menu',
  tagName: 'div',
  className: 'menu-container',

  regions: {
    searchRegion: '.menu-search',
    menuItems: '.menu-items'
  },

  initialize() {
    this.ACTIVE_SELECTOR = '.active';

    // If "active-ness" changes on the menu, re-render itself
    this.listenTo(this.model.get('menuItems'), 'change:active', this.render, this);
    this.listenTo(this.model.get('menuItems'), 'refresh:menu', this.render, this);
    
    this.listenTo(this.model, 'scroll:to:active', this.scrollToActive, this);
  },

  scrollToActive() {
    const active_item = this.model.getActive();
    if (!active_item) {
      console.log(`[Warning] No active menu item found, skipping scroll`);
      return;
    }
    
    const activeEle = this.$(this.ACTIVE_SELECTOR);
    console.log('menu ele', this.$el);
    console.log('active ele', activeEle);
    if (!activeEle || !activeEle.isOffScreen({ scrollableContainerSelector: this.$el })) {
      return;
    }

    this.$el.animate({
      scrollTop: activeEle.offset().top - 105,
      duration: 50
    });
  },

  onRender() {
    this.showChildView('searchRegion', new MenuItemSearchView({ model: this.model.get('searchModel') }));
    this.showChildView('menuItems', new Marionette.CollectionView({
      childView: MenuItemView,
      collection: this.model.get('menuItems')
    }));
  }
});
