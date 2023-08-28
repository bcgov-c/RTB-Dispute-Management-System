/**
 * @fileoverview - Hamburger menu associated to the ContextContainer
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './ContextMenu_template.tpl';

const Formatter = Radio.channel('formatter').request('get'),
  animationChannel = Radio.channel('animations');

/**
 * The defualt duration value for the "open" menu animation
 * @constant
 *
 * @type {number}
 */
const DEFAULT_OPEN_DURATION = 400;

/**
 * The defualt duration value for the "close" menu animation
 * @constant
 *
 * @type {number}
 */
const DEFAULT_CLOSE_DURATION = 200;

export default Marionette.View.extend({
  template,
  className: 'context-menu-component hidden-item',

  events: {
    'click .context-menu-action-item': function(e) {
      const ele = $(e.currentTarget);
      if (ele.data('event')) {
        this.trigger('menu:click', ele.data('event'));
      }
    },
    'click .context-menu-help': function() {
      if (_.isFunction(this.help_fn)) {
        this.help_fn();
      }
    }
  },

  /**
   * @type {array}
   */
  menu_options: null,

  /**
   * The display value of the menu.  Usually of the form "<resource_name> ID <resource_id>".
   * @type {string}
   */
  menu_title: null,

  initialize(options) {
    this.mergeOptions(options, ['help_fn', 'menu_options', 'menu_title', 'css_class', 'displayOnly',
      // Allow created/modified _date and _by to be passed in
      'createdDate', 'createdBy', 'modifiedDate', 'modifiedBy']);
  },

  isOpen() {
    return this.$el.is(':visible');
  },

  toggleOpen(options) {
    if (this.isOpen()) {
      this.close(options);
    } else {
      this.open(options);
    }
  },

  open(options) {
    options = options || {};
    if (this.isOpen() && !this.displayOnly) {
      return;
    }
    if (options.no_animate) {
      this.$el.removeClass('hidden-item').slideDown({duration: 1});
      this.trigger('open:complete');
    } else {
      // Animate down
      //this.$el.css('height', 0);
      //this.$el.removeClass('hidden-item');
      animationChannel.request('queue', this.$el, 'slideDown', _.extend({ duration: DEFAULT_OPEN_DURATION }, options, {
        callback: function() { self.trigger('open:complete'); }
      }));
    }
  },

  close(options) {
    options = options || {};
    if (!this.isOpen()) {
      return;
    }
    const self = this;
    if (options.no_animate) {
      this.$el.addClass('hidden-item').slideUp({duration: 1});
      this.trigger('close:complete');
    } else {
      animationChannel.request('queue', this.$el, 'slideUp', _.extend({ duration: DEFAULT_CLOSE_DURATION }, options, {
        callback: function() { self.trigger('close:complete'); }
      }));
    }
  },

  updateMenu(new_menu_options) {
    this.menu_options = new_menu_options;
    this.render();
  },

  onBeforeAttach() {
    if (this.displayOnly) {
      this.open({ no_animate: true });
    }
  },

  templateContext() {
    return {
      Formatter,
      css_class: this.css_class,
      model: this.model,
      menu_title: this.menu_title,
      menu_options: this.menu_options,
      help_fn: _.isFunction(this.help_fn) && this.help_fn,

      createdDate: this.createdDate || this.model?.get('created_date'),
      createdBy: this.createdBy || this.model?.get('created_by'),
      modifiedDate: this.modifiedDate || this?.model.get('modified_date'),
      modifiedBy: this.modifiedBy || this?.model.get('modified_by')
    };
  }
});
