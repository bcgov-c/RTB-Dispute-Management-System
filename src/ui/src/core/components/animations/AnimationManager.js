
/**
 * AnimationManager manages creation of AnimationQueues, and items, and also manages the global animation queue.
 * @namespace core.components.animations.AnimationManager
 * @memberof core.components.animations
 */

import Marionette from 'backbone.marionette';

// Add our custom animation / jQuery functions here
import './CustomAnimations.js';


// Normal usage:
// animationChannel.request('queue', ele, jquery_fn_name, options)

/**
 * A class to hold metadata for an animation action to run.
 * @class core.components.animations.AnimationItem
 * @memberof core.components.animations.AnimationManager
 */
function AnimationItem(ele, fn_name, fn_options, fn_options2) {
  this.ele = ele;
  this.fn_name = fn_name;
  this.fn_options = fn_options;
  this.fn_options2 = fn_options2; // NOTE: Some jquery functions have two options, one for fn params, one for animation options
  this.started = false;
  this.done = false;
  this.getOption = function(optionName) {
    return _.has(this.fn_options, optionName) ? this.fn_options[optionName] : (_.has(this.fn_options2, optionName) ? this.fn_options2[optionName] : null);
  };
}

/**
 * Runs in a sequence the AnimationItems that have been added to it.
 * @class core.components.animations.AnimationQueue
 * @memberof core.components.animations.AnimationManager
 */
const AnimationQueue = Marionette.Object.extend({
  animation_queue: null,
  animation_running: false,
  _lock: false,

  initialize() {
    this.animation_queue = [];
    this.animation_running = false;
  },

  queueAnimation(ele, animationFnName, animationOptions, animationOptions2) {
    animationOptions = animationOptions || {};
    animationOptions2 = animationOptions2 || {};
    if (this._lock === true) {
      const self = this;
      setTimeout(function() {
        self.queueAnimation(ele, animationFnName, animationOptions, animationOptions2);
      }, 25);
      return;
    }

    this.animation_queue.push( new AnimationItem(ele, animationFnName, animationOptions, animationOptions2) );
    this.checkAndStartAnimation();
  },

  queueEvent(callbackFn) {
    const _ele = $('html'),
      _animationFnName = 'runCallback';
    this.animation_queue.push( new AnimationItem(_ele, _animationFnName, callbackFn) );
  },

  _stopAnimationsOnEle(ele) {
    ele.stop(true, true);
  },

  _cleanQueue() {
    this.animation_queue = _.reject(this.animation_queue, function(item) { return item.done; });
  },

  // Stops any animations in progress and clears animation queue
  clearQueue() {
    this._lock = true;
    // Mark all animations as done (so no "next animations" run), and then stop all animations in progress
    _.each(this.animation_queue, function(item) { item.done = true; });
    _.each(this.animation_queue, function(item) {
      item.ele.stop(true, true);
    });
    this._cleanQueue();
    this.animation_running = false;
    this._lock = false;
  },

  clearElement(ele) {
    // Also stops any animations on the element
    this.animation_queue = _.reject(this.animation_queue, function(item) {
      return ele.is(item.ele); });
    // Run last, because on "done", the next animation function will run
    this._stopAnimationsOnEle(ele);
  },

  checkAndStartAnimation() {
    if (!this.animation_running && this.animation_queue.length > 0) {
      this.animation_running = true;
      this._runNextAnimation();
    }
  },

  _runNextAnimation() {
    let queue_in_progress = false;
    // Starts first non-done animation
    _.each(this.animation_queue, function(animation_item) {
      if (animation_item.done || queue_in_progress) {
        return;
      }
      if (animation_item.started) {
        // If an animation in the queue is already started, just exit
        queue_in_progress = true;
        return;
      }
      queue_in_progress = true;
      this._runAnimationItem(animation_item);
    }, this);
    if (!this.queue_in_progress) {
      this.animation_running = false;
    }
  },

  _runAnimationItem(item) {
    const self = this;
    item.started = true;
    // Special handling for skipping animation when element is already shown/hidden
    if (item.getOption('skip_if_shown') && item.ele.is(':visible')) {
      //console.log(`[Info] Skipping "show" animation on shown element `, item.ele);
      this.animationOnFinish(item);
      return;
    }
    if (item.getOption('skip_if_hidden') && !item.ele.is(':visible')) {
      //console.log(`[Info] Skipping "hide" animation on hidden element `, item.ele);
      this.animationOnFinish(item);
      return;
    }

    // $.slideDown and $.slideUp have performance issues, so replace them with an animation function that is the same
    if (item.fn_name === 'slideDown') {
      item.fn_name = 'animate';
      item.fn_options2 = item.fn_options;
      item.fn_options = {
        height: "show",
        marginTop: "show",
        marginBottom: "show",
        paddingTop: "show",
        paddingBottom: "show"
      };
    } else if (item.fn_name === 'slideUp') {
      item.fn_name = 'animate';
      item.fn_options2 = item.fn_options;
      item.fn_options = {
        height: "hide",
        marginTop: "hide",
        marginBottom: "hide",
        paddingTop: "hide",
        paddingBottom: "hide"
      };
    }


    let animation_promise;
    try {
      animation_promise = item.ele[item.fn_name](item.fn_options, item.fn_options2).promise();
    } catch (e) {
      console.debug(`[Error] Unsupported animation ""${item.fn_name}" on element `, item.ele);
      console.debug(e);
      this.animationOnFinish(item);
      return;
    }

    if (animation_promise) {
      animation_promise.always(function() {
        self.animationOnFinish(item);
      });
    }
  },

  animationOnFinish(item) {
    item.started = false;
    item.done = true;
    this._cleanQueue();
    this._runNextAnimation();
  },

  runAnimation(ele, fn_name, fn_options) {
    // Immediately runs a given animation
    ele[fn_name](fn_options);
  }
});

const AnimationManager = Marionette.Object.extend({
  /**
   * @class core.components.animations.AnimationManagerClass
   * @augments Marionette.Object
   */

  channelName: 'animations',

  radioRequests: {
    createQueue: 'createNewQueue',
    queue: 'queueAnimation',
    queueEvent: 'queueEvent',
    run: 'runAnimation',
    clear: 'clearQueue',
    clearElement: 'clearElement'
  },

  created_queues: null,
  global_queue: null,

  initialize() {
    this.created_queues = [];
    this.global_queue = new AnimationQueue();
  },

  createNewQueue() {
    const new_queue = new AnimationQueue();
    this.created_queues.push(new_queue);
    return new_queue;
  },

  // Pass functions along to global queue
  queueAnimation() {
    this._runOnGlobalQueue('queueAnimation', arguments);
  },
  queueEvent() {
    this._runOnGlobalQueue('queueEvent', arguments);
  },
  runAnimation() {
    this._runOnGlobalQueue('runAnimation', arguments);
  },
  clearQueue() {
    this._runOnGlobalQueue('clearQueue', arguments);
  },
  clearElement() {
    this._runOnGlobalQueue('clearElement', arguments);
  },

  _runOnGlobalQueue(fn_name, args) {
    this.global_queue[fn_name](...args);
  }
});

export default new AnimationManager();
