import Radio from 'backbone.radio';
import ViewMixin from '../../utilities/ViewMixin';
import { ParentViewMixin } from '../../utilities/ParentViewMixin';
import template from './PageItem_template.tpl';

const animationChannel = Radio.channel('animations');

const PageItemView = ViewMixin.extend({
  template: template,
  tagName: 'div',
  defaultClass: 'page-item-container clearfix',
  className() {
    const extraCssClasses = this.getOption('extraCssClasses');
    return `${this.defaultClass} ${extraCssClasses ? extraCssClasses : ''} ${!this.getOption('forceVisible') ? 'hidden-item' : ''}`;
  },

  showHideDuration: 200,
  fastShowHideDuration: 100,

  regions: {
    itemRegion: '.page-item-child-view'
  },

  initialize(options) {
    this.mergeOptions(options, ['forceVisible', 'stepComplete', 'subView', 'helpHtml', 'stepText', 'staticError', 'staticWarning', 'currentId']);
    this.subview_listeners = [{
      event: 'itemComplete',
      func() {
        this.stepComplete = true;
        this.trigger('itemComplete');
        if (this.getModel()) this.getModel().trigger('page:itemComplete');
        else if (this.getCollection()) this.getCollection().trigger('page:itemComplete');
      }
    }];
    this._applySubViewListeners();

    this.listenTo(this, 'itemComplete', (eventOptions) => {
      if (this.getModel()) this.getModel().trigger('page:itemComplete', eventOptions);
      else if (this.getCollection()) this.getCollection().trigger('page:itemComplete', eventOptions);
    });
  },

  _applySubViewListeners() {
    this.stopListening(this.subView);
    _.each(this.subview_listeners, function(listener_data) {
      this.listenTo(this.subView, listener_data.event, listener_data.func, listener_data.context ? listener_data.context : this);
    }, this);
  },

  // This is the preferred way to add listeners to the underlying subview and its model
  // This way, the listener doesn't have to worry about the view being swapped out from underneath in a viewstate refresh
  /*
  {
    event: '<event_name',
    func: <listening function>
  }
  */
  addSubViewListener(listener_data) {
    if (!listener_data || _.isEmpty(listener_data) || !_.isFunction(listener_data.func) || !listener_data.event) {
      console.log(`[Error] Invalid subview listener data`, listener_data, this);
    }
    this.subview_listeners.push(listener_data);
    this._applySubViewListeners();
  },

  // Returns true if the PageItem is "active", ie. visible on the page
  isActive() {
    return this.subView && this.subView.$el.is(':visible');
  },

  isContainerOffScreen() {
    return this.$el.parent('div').isOffScreen({ is_page_item_container: true });
  },

  onShow(options) {
    options = options || {};
    if (options && options.no_animate) {
      this.$el.removeClass('hidden-item').slideDown({duration: 1});
    } else {
      const self = this;
      // If element is offscreen, do a very quick scroll
      // BUG NOTE : The PageItem element itself isn't in the page flow, so we have to use the container div to check if it's off screen
      const duration = this.isContainerOffScreen() ? self.fastShowHideDuration : self.showHideDuration;
      animationChannel.request('queue', self.$el, 'slideDown', _.extend({
        // If element is already shown, don't run an animation
        skip_if_shown: true,
        duration: duration}, options));
      if (options && options.scroll_after) {
        animationChannel.request('queue', self.$el, 'scrollPageTo', options);
      }
    }
  },

  onHide(options) {
    if (options && options.no_animate) {
      this.$el.addClass('hidden-item').slideUp({duration: 1});
    } else {
      animationChannel.request('queue', this.$el, 'slideUp', _.extend({
        // If element is already hidden, don't run an animation
        skip_if_hidden: true,
        duration: this.showHideDuration }, options));
    }
  },

  onBeforeRender() {
    if (this.subView && this.subView.isRendered()) {
      this.detachChildView('itemRegion');
    }
  },

  onRender() {
    this.subView.render();
    this._applySubViewListeners();
    
    this.showChildView('itemRegion', this.subView);
    this.initializeHelp(this, this.helpHtml);
  },

  // Offered for convenience, calls the sub-view's validateAndShowErrors
  validateAndShowErrors() {
    return this.subView && typeof this.subView.validateAndShowErrors === "function" ? this.callMethodOnSubView('validateAndShowErrors', arguments) : false;
  },

  showErrorMessage(errorMessage) {
    return this.subView && typeof this.subView.showErrorMessage === "function" ? this.callMethodOnSubView('showErrorMessage', arguments) : false;
  },

  getModel() {
    if (this.subView && this.subView.model) {
      return this.subView.model;
    }
  },

  getCollection() {
    if (this.subView && this.subView.collection) {
      return this.subView.collection;
    }
  },

  callMethodOnSubView(methodName, methodArgs) {
    return this.callMethodOnChild('itemRegion', methodName, methodArgs);
  },

  serializeData() {
    return {
      stepText: this.stepText,
      helpHtml: this.helpHtml,
      staticError: this.staticError,
      staticWarning: this.staticWarning
    };
  }
});

_.extend(PageItemView.prototype, ParentViewMixin);
export default PageItemView;
