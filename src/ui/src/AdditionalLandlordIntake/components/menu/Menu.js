import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import template from './Menu_template.tpl';

const menuOverlayId = 'menu-overlay';
const menuOverlayHTML = `<div id="${menuOverlayId}" class="hidden-item"></div>`;

const menuChannel = Radio.channel('menu');
const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');

const MenuItemView = Marionette.View.extend({
  template: _.template(`<%= text %>`),
  tagName: 'div',
  className() {
    const model_data = this.model.toJSON();
    return 'step ' + ([
        model_data.active ? 'active' : null,
        model_data.visited ? 'visited' : null,
        model_data.disabled ? 'disabled' : null,
        model_data.unreachable ? 'unreachable' : null
      ].join(' '));
  },

  triggers: {
    'click': 'menu:click'
  }

});

const MenuStepsView = Marionette.CollectionView.extend({
  childView: MenuItemView,
  tagName: 'div',
  className: 'menu-steps',

  onChildviewMenuClick(menuItemView) {
    const menuItemModel = menuItemView.model;
    if ( menuItemModel.get('active') || !menuItemModel.get('visited') || menuItemModel.get('disabled')) {
      return;
    }

    // Always hide the menu once clicked
    menuChannel.trigger('hide:mobile');
    Backbone.history.navigate('page/'+menuItemView.model.get('step'), {trigger: true});
  }

});

export default Marionette.View.extend({
  template: template,
  id: 'menu',
  tagName: 'div',
  className: 'menu-container',


  regions: {
    menuStepsRegion: {
      el: '.menu-steps',
      replaceElement: true
    }
  },

  ui: {
    'list': '.step.disputelist',
    'logout': '.step.logout'
  },

  events: {
    'click @ui.list': 'clickList',
    'click @ui.logout': 'clickLogout'
  },

  clickList() {
    Backbone.history.navigate('list', { trigger: true });
  },

  clickLogout() {
    Backbone.history.navigate('logout', { trigger: true });
  },

  initialize() {
    console.log(this);
    
    this.listenTo(menuChannel, 'show:mobile', this.showMobileMenu, this);
    this.listenTo(menuChannel, 'hide:mobile', this.hideMobileMenu, this);
    this.listenTo(menuChannel, 'disable:mobile', this.hideMobileMenu, this);
    menuChannel.reply('clear', this.resetMenu, this);
    menuChannel.reply('get:step', this.getStep, this);
  },

  resetMenu() {
    this.collection.each(function(menuStep) {
      menuStep.set({
        visited: false,
        disabled: false,
        unreachable: false,
        active: false
      });
    });
  },

  getStep(step_number) {
    if (!step_number) {
      return null;
    }
    return this.collection.findWhere({ step: step_number });
  },

  _showMenuOverlay() {
    $('body').append(menuOverlayHTML);
    $(`#${menuOverlayId}`).show();

    $(`#${menuOverlayId}`).off('click.rtb');
    $(`#${menuOverlayId}`).on('click.rtb', function() {
      menuChannel.trigger('click:mobile');
    });
  },

  _hideMenuOverlay() {
    $(`#${menuOverlayId}`).hide().remove();
  },

  showMobileMenu() {
    this._showMenuOverlay();
    this.$el.toggleClass('mobile-render');
  },

  hideMobileMenu() {
    this.$el.removeClass('mobile-render');
    this._hideMenuOverlay();
  },


  onRender() {
    this.setMenuStepsVisited();
    this.showChildView('menuStepsRegion', new MenuStepsView({ collection: this.collection }));
  },

  setMenuStepsVisited() {
    const dispute = disputeChannel.request('get');
    const progress = applicationChannel.request('get:progress');

    const paymentStep = this.collection.paymentStep;
    const paymentReceiptStep = this.collection.paymentReceiptStep;

    if (dispute && dispute.isPaymentState()) {
      this.collection.each(function(menuStep) {
        if (menuStep.get('step') < paymentStep) {
          menuStep.set({
            visited: true,
            disabled: true,
            unreachable: true,
            active: false
          });
        }
      });
    } else if (dispute && dispute.isReviewOnlyState()) {
      this.collection.each(function(menuStep) {
        if (menuStep.get('step') !== paymentReceiptStep) {
          menuStep.set({
            visited: true,
            disabled: true,
            unreachable: true,
            active: false
          });
        } else {
          menuStep.set({
            visited: true,
            disabled: false,
            unreachable: false
          });
        }
      });
    } else {
      this.collection.each(function(menuStep) {
        // Activate the last step completed and everything below it.
        // Also active the next step after the last completed step
        if (menuStep.get('step') <= progress + 1) {
          menuStep.set('visited', true);
        } else {
          menuStep.set({
            visited: false,
            disabled: false
          });
        }
      });
    }
  }
});
