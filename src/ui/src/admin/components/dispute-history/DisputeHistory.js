/**
 * The DisputeHistory manages the transitions between disputes, and manages the menu interactions
 * @namespace admin.components.dispute-history.DisputeHistory
 * @memberof admin.components.dispute-history
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');

const DisputeHistory = Marionette.Object.extend({
  /**
   * @class admin.components.dispute-history.DisputeHistoryClass
   * @augments Marionette.Object
   */
  channelName: 'disputeHistory',

  radioRequests: {
    'add': 'addDispute',
    'get': 'getDispute',
    'load': 'loadDispute',
    'check': 'isDisputeInHistory',
    'clear': 'clearDisputes',
    'clear:dispute': 'clearDispute'
  },

  _getOwnChannel() {
    return this.getChannel(this.channelName);
  },

  /** @constructor */
  initialize() {
    this.opened_disputes = [];
  },

  /**
   * Returns whether or not the dispute can be found in the history.
   * @returns {boolean} - Returns true if it is found, else return false.
   */
  isDisputeInHistory(dispute_guid) {
    return !!this.getDispute(dispute_guid);
  },

  /**
   * Removes one matching dispute (if any)
   */
  clearDispute(dispute_guid) {
    this.opened_disputes = this.opened_disputes.filter(dispute => dispute.get('dispute_guid') !== dispute_guid);
  },

  /**
   * Removes all saved disputes from the history.
   */
  clearDisputes() {
    this.opened_disputes = [];
    this._getOwnChannel().trigger('clear:complete');
  },


  /**
   * Adds an already-loaded DisputeModel to the history.  Also triggers a cache call on data managers.
   * @param {DisputeModel} dispute_model The DisputeModel to add to the history.
   */
  addDispute(dispute_model) {
    const dispute_guid = dispute_model.get('dispute_guid');
    const active_dispute_guid = disputeChannel.request('get:id');
    
    // If dispute is already in history, remove it and use the latest dispute model
    if (this.isDisputeInHistory(dispute_guid)) {
      this.opened_disputes = this.opened_disputes.filter(dispute => dispute.get('dispute_guid') !== dispute_guid);
    }

    this.opened_disputes.push(dispute_model);

    if (dispute_guid === active_dispute_guid) {
      // Always perform a cache update when we are loading to same area
      applicationChannel.request('cache:full', dispute_guid);
    }
    this._getOwnChannel().trigger('add:complete', dispute_model);
  },


  /**
   * Looks up a dispute from the history.
   * @param {string} dispute_guid The dispute_guid to be loaded / looked up in history.
   * @returns {DisputeModel|null} The matching DisputeModel if found.  Returns null if no match can be found.
   */
  getDispute(dispute_guid) {
    if (!dispute_guid) {
      console.log(`[Warning] No dispute guid provided to getDispute`, dispute_guid);
      return null;
    }

    return this.opened_disputes.find(dispute => dispute.get('dispute_guid') === dispute_guid);
  },

  /**
   * Loads a dispute from the history, using saved values claims, files, etc if they are found, otherwise performing a search for them.
   * If the given dispute_guid is not in the history yet, performs a full load for it and adds it to the data.
   * @param {string} dispute_guid The dispute_guid to be loaded / looked up in history.
   * @param {Object} [options] Optional options data
   * @returns {Promise} - The promise of the dispute load.  Resolves immediately if Dispute found in history.
   * Resolves with the loaded dispute model.
   */
  loadDispute(dispute_guid, options) {
    options = options || {};

    // If an active dispute exists but we're routing away, save it in the cache first
    const active_dispute_id = disputeChannel.request('get:id');
    if (active_dispute_id && active_dispute_id !== dispute_guid) {
      applicationChannel.request('cache:full');
    }

    const dispute_to_show = this.getDispute(dispute_guid),
      dfd = $.Deferred();

    if (!dispute_to_show || options.force_load) {
      this.listenToOnce(applicationChannel, 'dispute:loaded:full', function(dispute_model) {
        dfd.resolve(dispute_model);
      }, this);
      applicationChannel.request('load:dispute:full', dispute_guid);
    } else {
      // Only pull from the cache if we are using a different dispute
      if (active_dispute_id !== dispute_guid) {
        applicationChannel.request('cache:load:full', dispute_guid);
        disputeChannel.request('set:active', dispute_to_show);
      }
      dfd.resolve(dispute_to_show);
    }
    return dfd.promise();
  }

});

export default new DisputeHistory();
