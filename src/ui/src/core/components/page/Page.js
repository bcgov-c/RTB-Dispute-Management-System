/**
 * @fileoverview - Core View that is used as a base for other DMS pages to extend from. Provides styling and functions.
 */

import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageItemView from './PageItem';
import AddressModel from '../address/Address_model';
import QuestionModel from '../question/Question_model';
import InputModel from '../input/Input_model';
import IntakeParticipantCollection from '../participant/IntakeParticipant_collection';
import DoubleSelectorModel from '../double-selector/DoubleSelector_model';
import { generalErrorFactory } from '../../components/api/ApiLayer';

const animationChannel = Radio.channel('animations');
const disputeChannel = Radio.channel('dispute');

export default Marionette.View.extend({
  tagName: 'div',
  className: 'page-view',

  ui: {
    prev: 'button.step-previous',
    next: 'button.step-next'
  },

  triggers: {
  },

  events: {
    'click @ui.prev': 'previousPage',
    'click @ui.next': 'nextPage'
  },

  scrollDuration: 600,

  previousPage() {
    console.debug(`[Warning] previousPage should be overridden by subclassing page`);
  },

  nextPage() {
    console.debug(`[Warning] nextPage should be overridden by subclassing page`);
  },

  getPageApiUpdates() {
    console.debug(`[Warning] getPageApiUpdates should be overridden by subclassing page`);
  },

  cleanupPageInProgress() {
    // Cleanup generic page items
    _.each(this.page_items, function(page_item) {
      const model = page_item.getModel(),
        collection = page_item.getCollection();
      if (model && typeof model.needsApiUpdate === 'function' && model.needsApiUpdate()) {
        if (typeof model.resetModel === 'function') {
          model.resetModel();
        }
      }
      if (collection && typeof collection.needsApiUpdate === 'function' && collection.needsApiUpdate()) {
        if (typeof collection.resetCollection === 'function') {
          collection.resetCollection();
        }
      }
    });
  },

  createPageApiErrorHandler(childView, actionName) {

    return (errorResponse) => {
      errorResponse = errorResponse || {};
      if (errorResponse.status === 409 || errorResponse.status === 401) {
        // Do nothing, this will be caught by global handlers
      } else {
        const errorHandlerFn = generalErrorFactory.createHandler(actionName, () => {
          _.bind(childView.cleanupPageInProgress, childView)();
          setTimeout(() => Backbone.history.navigate('list', { trigger: true }), 25);
        }, 'You will be redirected to your list of disputes.');

        errorHandlerFn(errorResponse);
      }
    };
  },

  initialize() {
    this.page_items = {};
  },

  addPageItem(pageItemId, pageItem) {
    // Set the current ID into the pageItem
    pageItem.currentId = pageItemId;
    this.page_items[pageItemId] = pageItem;
  },

  getPageItem(pageItemId) {
    return this.page_items[pageItemId];
  },

  _getPageItemViewFromId(pageItemViewId) {
    if (!this.getRegion(pageItemViewId)) {
      console.debug(`Couldn't find a region with id`, pageItemViewId);
      return;
    }

    const page_item = this.page_items[pageItemViewId];
    if (!page_item) {
      console.debug(`Couldn't find a page item with id`, pageItemViewId);
      return;
    }
    return page_item;
  },

  showPageItem(initialItemViewId, options) {
    options = options || {};
    const page_item = this._getPageItemViewFromId(initialItemViewId);
    if (!page_item) {
      return;
    }

    // If the item wasn't visible but now is, then scroll (but only if it's off screen)
    const scroll = options.no_animate ? false : (!page_item.$el.is(':visible') && page_item.isContainerOffScreen());
    this.showChildView(initialItemViewId, page_item);
    page_item.triggerMethod('show', _.extend({}, options, { scroll_after: scroll, is_page_item: true }));
    if (scroll) {//} && this.isEleOffScreen(page_item.$el, { is_page_item: true })) {
      /*setTimeout(function() {
        self.scrollToPageEle(page_item.$el, { is_page_item: true });
      }, 25);
      */
    }

    if (page_item.stepComplete) {
      // Add "complete_on_show" option to show that the itemComplete trigger is from
      page_item.trigger('itemComplete', _.extend(options, {triggered_on_show: true}));
    }
  },

  hidePageItem(initialItemViewId, options) {
    options = options || {};
    const page_item = this._getPageItemViewFromId(initialItemViewId);
    if (!page_item) {
      return;
    }

    page_item.triggerMethod('hide', options);
    page_item.trigger('itemHidden', options);
  },

  hideAndCleanPageItem(pageItemId, options) {
    const pageItem = this.getPageItem(pageItemId);

    this.listenToOnce(pageItem, 'itemHidden', function() {
      const model = pageItem.getModel();
      if (model && typeof model.clearModelValue === "function") {
        model.clearModelValue(options);
      }
      pageItem.render();
    });
    this.hidePageItem(pageItemId, options);
  },

  showNextButton(options) {
    options = options || {};
    const next = this.getUI('next');
    const scroll = !next.is(':visible');
    next.removeClass('hidden-item').removeClass('step-next-disabled');
    if (scroll && !options.no_animate) {
      animationChannel.request('queue', next, 'scrollPageTo');
    }
  },

  hideNextButton() {
    const next = this.getUI('next');
    next.addClass('hidden-item');
  },

  buildPageItem(item_name, page_item_view_options, subView) {
    this.addPageItem(item_name, new PageItemView(_.extend({}, page_item_view_options, { subView: subView })));
  },

  /* Intake page validation functions */
  validatePage() {
    // Get active page items
    let page_valid = true;
    _.each(_.filter(this.page_items, function(item) { return item.isActive();}) , function(page_item) {
      if (typeof page_item.subView.validateAndShowErrors !== "function") {
        return;
      }

      const subModelToCheck = page_item.getModel() ? page_item.getModel() :
        (page_item.getCollection() ? page_item.getCollection() : null);

      if (!subModelToCheck) {
        console.log(`[Warning] No subModel found on page item`, page_item);
        console.log(`[Warning] Subviews /must/ have a valid model/collection`);
      }
      const page_item_is_valid = page_item.subView.validateAndShowErrors();
      page_valid = page_item_is_valid && page_valid;
    });

    return page_valid;
  },

  getAllPageXHR() {
    const dispute = disputeChannel.request('get');
    const all_xhr = [];
    const dispute_updates = {};

    // Get changes on the page
    _.each(this.page_items, function(page_item) {
      // Skip any pageItems that are hidden
      const item_is_hidden = !page_item.isActive(),
        model = page_item.getModel();

      if (item_is_hidden && model && !model.get('clearWhenHidden')) {
        return;
      }

      const collection = page_item.getCollection(),
        apiToUse = model ? model.get('apiToUse') : null;

      if (model) {
        if (apiToUse === 'question' && model instanceof QuestionModel && model.needsApiUpdate()) {
          all_xhr.push(_.bind(model.save, model, item_is_hidden ? { question_answer: null } : model.getPageApiDataAttrs()));
        } else if ( (model instanceof QuestionModel && apiToUse === 'dispute') ||
              (model instanceof AddressModel || model instanceof InputModel || model instanceof DoubleSelectorModel) ) {
          const dispute_updates_from_model = _.omit(model.getPageApiDataAttrs(), ['geozoneId', 'province']);
          _.each(dispute_updates_from_model, function(newValue, apiName) {
            let apiValue = dispute.get(apiName);

            // Clear value if true
            newValue = item_is_hidden ? null : newValue;

            // Compare as strings to avoid casting comparison issues
            if ((typeof newValue === "string" && typeof apiValue === "number") ||
                (typeof newValue === "number" && typeof apiValue === "string")) {
              newValue = String(newValue);
              apiValue = String(apiValue);
            }

            // If both are none, skip.  Do this here because Moment date comparison on null doesn't work
            if (apiValue === null && newValue === null) {
              return;
            }

            if (model instanceof InputModel && model.isDate()) {
              // Special handling for date comparison
              // NOTE: Is "minute" precision enough?  Or should it be to the second?
              if (!Moment(newValue).isSame(Moment(apiValue), 'minute')) {
                dispute_updates[apiName] = newValue;
              }

            } else if (apiValue !== newValue) {
              dispute_updates[apiName] = newValue;
            }
          });
        }
      } else if (collection && collection.constructor.ClassType === IntakeParticipantCollection.ClassType ) {
        // NOTE: Only patches to participants here
        // Add each participant to an xhr
        collection.each(function(intakeParticipant) {
          const participant = intakeParticipant.get('participantModel');
          if (participant.isNew()) {
            return;
          }

          // Save the UI attributes into the model and then check if it needs updates
          participant.set(intakeParticipant.getUIDataAttrs());

          if (participant.needsApiUpdate()) {
            all_xhr.push(_.bind(participant.save, participant, participant.getApiChangesOnly()));
          }
        });
      }
    });

    if (_.keys(dispute_updates).length > 0) {
      dispute.set(dispute_updates, { silent: true });
      all_xhr.push(_.bind(dispute.save, dispute, dispute.getApiChangesOnly() ));
    } else if (dispute.needsApiUpdate()) {
      // Also include any changes that are missing on the dispute in general
      all_xhr.push( _.bind(dispute.save, dispute, dispute.getApiChangesOnly()) );
    }
    return all_xhr;
  }


});
