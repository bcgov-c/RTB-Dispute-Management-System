/**
 * Tracks global timers.  These timers keep time on mobile devices as well
 * Manages the disputeChannel.  Exports a singleton instance of {@link core.components.timers.|TimerManagerClass}.
 * @namespace core.components.timers.TimerManager
 * @memberof core.components.timers
 */

import Marionette from 'backbone.marionette';

/**
 * Default poll value of 1000 milliseconds
 * @param {number} DEFAULT_POLL_RATE_MS
 */
const DEFAULT_POLL_RATE_MS = 1000;

/**
 * The "Timer" object.
 * @class core.components.timers.Timer
 */
function Timer(options) {
  options = options || {};

  /**
   * @param {string} options.name The name of the timer.  Used as a unique ID.
   * @param {function} options.expiration_fn This function will be called when the timer expires.
   * @param {number} options.timeout_ms The time interval in milliseconds, before the timer will be considered to have expired.
   * @memberof core.components.timers.Timer
   */
  this.name = options.name;
  this.expiration_fn = options.expiration_fn;
  this.timeout_ms = options.timeout_ms;

  /**
   * @param {number} [poll_rate] The time interval between checks of the Timer's timeout time.
   * If not provided, a default poll rate is used.
   * @memberof core.components.timers.Timer
   */
  this.poll_rate = options.poll_rate ? options.poll_rate : DEFAULT_POLL_RATE_MS;

  // Internal data
  this._poll_interval = null;
  this._last_active_timestamp = null;

  // The polling function checks that the action is done
  this._pollFn = function() {
    if (!this._last_active_timestamp) {
      // If we have no last tracked activity, we should stop the timer
      this._stop_polling();
    }
    const current_timestamp = new Date().getTime();
    // if not already in idle state, set idle and show warning when difference between current time and last activity exceeds timeout period.
    if (current_timestamp - this._last_active_timestamp > this.timeout_ms) {
      // Once we have expired, make sure to stop the interval from running
      this._stop_polling();
      this.expiration_fn();
    }
  };

  /**
   * Restarts the timer's last active time and resets the polling interval
   * @memberof core.components.timers.Timer
   */
  this.refresh = function() {
    // Set a new last active time
    this._last_active_timestamp = new Date().getTime();
  };

  this._stop_polling = function() {
    if (this._poll_interval) {
      clearInterval(this._poll_interval);
      this._poll_interval = null;
    }
  };

  /**
   * Begins the timer polling
   * @memberof core.components.timers.Timer
   */
  this.start = function() {
    this._stop_polling();
    this.refresh();
    // Run one poll right away before starting the interval
    this._pollFn();
    this._poll_interval = setInterval(_.bind(this._pollFn, this), this.poll_rate);
  };

  /**
   * Stops the timer from polling
   * @memberof core.components.timers.Timer
   */
  this.stop = function() {
    this._stop_polling();
  };
}


const TimerManager = Marionette.Object.extend({
  /**
   * @class core.components.timers.TimerManagerClass
   * @augments Marionette.Object
   */

  channelName: 'timers',

  radioRequests: {
    create: 'createAndStartNewTimer',
    'refresh:timer': 'refreshTimer',
    'stop:timer': 'stopTimer',
    'restart:timer': 'restartTimer',
    'create:promise': 'createPromiseTimer',
    'get:timer': 'getTimer'
  },

  initialize() {
    this._currentTimers = {};
  },

  getTimer(timer_name) {
    return _.has(this._currentTimers, timer_name) ? this._currentTimers[timer_name] : null;
  },

  /**
   * Creates and starts a new timer.
   * @param {String} timer_options.name The unique name for the timer.
   * @param {function} timer_options.expiration_fn This function will be called when the timer expires.
   * @param {number} timer_options.timeout_ms The time interval in milliseconds, before the timer will be considered to have expired.
   * @param {number} [timer_options.poll_rate] The time interval between checks of the Timer's timeout time.
   * @returns {core.components.timers.Timer} The created (and started) Timer object.
   */
  createAndStartNewTimer(timer_options) {
    timer_options = timer_options || {};

    if (!timer_options.name) {
      console.log(`[Error] Timer needs a name, none provided`, timer_options);
      return false;
    }

    const existingTimer = this.getTimer(timer_options.name);
    if (existingTimer) {
      // If timer already exists, should we fail here? Or start again, or?
      console.log(`[Warning] Timer already exists, not creating a new one`, timer_options);
      return existingTimer;
    }

    const timer = new Timer(timer_options);
    this._startTimer(timer);

    // Return the timer instance
    return timer;
  },


  /**
   * Creates and returns a Promise, and starts a Timer which resolves the promise when
   * its time expires.  This function can be used with a $.when() in order to give API calls
   * a minimum amount of time before they resolve.
   * @param {Number} milliseconds The time before expiration
   * @param {String} [name] Optional "name" for the timer.  Will otherwise be "promiseTimer:"
   * @returns {Promise} The created promise which will resolve when the timer expires.
   */
  createPromiseTimer(milliseconds, name) {
    const dfd = $.Deferred();
    this.createAndStartNewTimer({
      name: `promiseTimer:${name}`,
      timeout_ms: milliseconds,
      expiration_fn() {
        dfd.resolve();
      },
      poll_rate: 100, // Check every 100 milliseconds
    });
    return dfd.promise();
  },


  /**
   * Restarts a Timer object.  It will start the timer again fresh, even if it is has not yet expired.
   * @param {String} timer_name The name of the Timer to restart.
   */
  restartTimer(timer_name, options) {
    options = options || {};
    const timer = this.getTimer(timer_name);
    if (!timer) {
      if (!options.silent) {
        console.log(`[Warning] No timer found to restart for ${timer_name}`);
      }
      return;
    }
    this._startTimer(timer);
  },

  _startTimer(timer) {
    this._currentTimers[timer.name] = timer;
    timer.start();
  },

  // Refresh will just renew the "last active" date on the timer, it will not restart it if it has stopped
  refreshTimer(timer_name, new_timout_ms) {
    const timer = this.getTimer(timer_name);
    if (!timer) {
      console.log(`[Warning] No timer found to refresh for ${timer_name}`);
      return;
    }
    timer.refresh();
    if (new_timout_ms) {
      timer.timeout_ms = new_timout_ms;
    }
  },

  stopTimer(timer_name) {
    const timer = this.getTimer(timer_name);
    if (!timer) {
      console.log(`[Warning] No timer found to stop for ${timer_name}`);
      return;
    }
    timer.stop();
    delete this._currentTimers[timer_name];
  }

});

const timerManagerInstance = new TimerManager();

export default timerManagerInstance;
