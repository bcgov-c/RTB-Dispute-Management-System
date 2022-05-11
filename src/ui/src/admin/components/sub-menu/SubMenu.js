import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './SubMenu_template.tpl';

const Formatter = Radio.channel('formatter').request('get');
const animationChannel = Radio.channel('animations');

export default Marionette.View.extend({
  template,
  className: 'sub-menu-component hidden-item',

  DEFAULT_OPEN_DURATION: 400,
  DEFAULT_CLOSE_DURATION: 200,

  menu_options: null,
  display_name: null,
  initialize(options) {
    this.mergeOptions(options, ['menu_options', 'display_name']);
  },

  toggleOpen(options) {
    if (this.$el.is(':visible')) {
      this.close(options);
    } else {
      this.open(options);
    }
  },

  open(options) {
    options = options || {};
    if (this.$el.is(':visible')) {
      return;
    }
    if (options.no_animate) {
      this.$el.removeClass('hidden-item').slideDown({duration: 1});
      this.trigger('open:complete');
    } else {
      // Animate down
      //this.$el.css('height', 0);
      //this.$el.removeClass('hidden-item');
      animationChannel.request('queue', this.$el, 'slideDown', _.extend({ duration: this.DEFAULT_OPEN_DURATION }, options, {
        callback: function() { self.trigger('open:complete'); }
      }));
    }
  },

  close(options) {
    options = options || {};
    if (!this.$el.is(':visible')) {
      return;
    }
    const self = this;
    if (options.no_animate) {
      this.$el.addClass('hidden-item').slideUp({duration: 1});
      this.trigger('close:complete');
    } else {
      animationChannel.request('queue', this.$el, 'slideUp', _.extend({ duration: this.DEFAULT_CLOSE_DURATION }, options, {
        callback: function() { self.trigger('close:complete'); }
      }));
    }
  },

  updateMenu(new_menu_options) {
    this.menu_options = new_menu_options;
    this.render();
  },

  events: {
    'click .sub-menu-action-item': function(e) {
      const ele = $(e.currentTarget);
      if (ele.data('event')) {
        this.trigger(ele.data('event'));
      }
    }
  },

  templateContext() {
    return {
      Formatter,
      model: this.model,
      display_name: this.display_name,
      menu_options: this.menu_options
    };
  },

});
