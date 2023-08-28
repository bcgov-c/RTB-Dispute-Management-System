/**
 * @namespace core.components.modals.ModalManager
 * @memberof core.components.modals
 * @fileoverview - Manager that handles display and removal of all system modals
*/

import Marionette from 'backbone.marionette';
import ModalBlankView from '../modals/modal-blank/ModalBlank';

// From core/static/bootstrap.css:
const MODAL_BACKDROP_Z_INDEX = 1040;
const MODAL_MANAGER_CLASS = 'modal-manager';

// Controls modals being added / removed to the UI so they stack properly
const ModalManagerView = Marionette.View.extend({
  /**
   * @class core.components.modals.ModalManagerView
   * @augments Marionette.View
   */
  template: _.noop,
  tagName: 'div',
  className: MODAL_MANAGER_CLASS,

  initialize() {
    // Overriding jQuery/boostrap functionality for modals to add modal stacking
    $(document).on({
      // Setup modal stack functionality using z-index
      'show.bs.modal': function () {
        const zIndex = MODAL_BACKDROP_Z_INDEX + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
      },
      // Ensure tall modals can scroll again when top modal(s) hide(s)
      'hidden.bs.modal': function() { $('.modal:visible').length && $(document.body).addClass('modal-open'); }

    // Attach functionality to document to handle dynamic modals, i.e. when a modal opens another modal (but only target modals)
    }, '.modal');
  },

  _addModal(modalView, options) {
    const modalLoadDelayMs = 50;
    options = options || {};
    this.$el.append(modalView.render().el);

    if (options.no_animate) {
      $(modalView.$el).modal('show');
      // Allow a minnimum of time for modal to been "shown" to run before triggering any show event 
      setTimeout(() => modalView && modalView.trigger('shown:modal'), modalLoadDelayMs);
    } else {
      // Set the initial style.  This will be expanded during the animation

      // If the width expand duration id 0, then show it right away
      if (options.duration !== 0) {
        modalView.$el.css({width: 0});
        modalView.$('.modal-header .modal-close-icon-lg').hide();
        modalView.$('.modal-header').css({
          'white-space': 'nowrap',
          'overflow-x': 'hidden'
        });
      }
      modalView.$('.modal-body').css({
        display: 'none'
      });
      const savedModalViewOverflow = modalView.$el.css('overflow');
      modalView.$el.css('overflow', 'hidden');
      $(modalView.$el).modal('show');

      // Add a small timeout to let the modal eles be populated
      setTimeout(function() {
        $(modalView.$el).animate({width: '100%'}, {duration: options.duration ? options.duration : 400, complete: function() {
          // Reset anything we hid
          modalView.$('.modal-header .modal-close-icon-lg').show();
          modalView.$('.modal-header').css({
            'white-space': 'initial',
            'overflow-x': 'initial'
          });
          modalView.$el.css('overflow', savedModalViewOverflow);
          modalView.$('.modal-body').animate({
            height: "show",
            marginTop: "show",
            marginBottom: "show",
            paddingTop: "show",
            paddingBottom: "show"
          }, {
            duration: options.duration2 ? options.duration2 : 100,
            complete: function() { modalView && modalView.trigger('shown:modal'); }
          });
        }});
      }, modalLoadDelayMs);
    }
  },

  _removeModalEle(modalEle, modalView) {
    if (!modalEle) {
      return;
    }
    modalEle.on('hidden.bs.modal', function() {
      modalEle.remove();
      if (modalView) {
        try {
          modalView.trigger('removed:modal');
          modalView.destroy();
        } catch (err) {
          //
        }
      }
    });
    modalEle.modal('hide');
  },

  _removeModal(modalView) {
    this._removeModalEle(modalView.$el, modalView);
  },
});

const modalManagerInstance = new ModalManagerView();

const ModalManagerRadio = Marionette.Object.extend({
  /**
   * @class core.components.modals.ModalManagerRadio
   * @augments Marionette.Object
   */
  channelName: 'modals',

  radioRequests: {
    'show:standard': 'createAndAddStandardModal',
    'show:custom': 'createAndAddCustomModal',
    'show:standard:promise': 'createAndAddStandardPromiseModal',
    'show:custom:promise': 'createAndAddCustomPromiseModal',
    'add': 'addModal',
    'remove': 'removeModal',
    'remove:all': 'removeAllModals',
    'render:root': 'renderRootManager',
    'hide:all': 'hideAllModals',
    'show:hidden': 'showHiddenModals'
  },

  initialize() {
    this._active_modals = {};
  },

  addModal(modalView, options) {
    // Clear any page focus, now that we have a modal appearing
    document.activeElement?.blur();

    modalManagerInstance._addModal(modalView, options);

    // Track active modals so we can force-remove them later
    this._active_modals[modalView.cid] = modalView;
  },

  removeModal(modalView) {
    modalManagerInstance._removeModal(modalView);

    // Check for active modals and remove
    if (_.has(this._active_modals, modalView.cid)) {
      delete this._active_modals[modalView.cid];
    }
  },

  removeAllModals() {
    // Delete all views from active view
    _.each(this._active_modals, function(modalView) {
      this.removeModal(modalView);
    }, this);

    setTimeout(function() {
      // NOTE: Just to be safe, also make sure to remove any Elements that didn't get caught above
      modalManagerInstance.$('.modal').each(function() {
        console.log(`[Warning] Modal should have been removed earlier.  Clearing ele now`, $(this));
        modalManagerInstance._removeModalEle($(this).remove());
      });
      $(document).find('.modal-backdrop').remove();
      $('body').removeClass('modal-open');
    }, 500);
  },

  renderRootManager() {
    if ($(`body .${MODAL_MANAGER_CLASS}`).length) return;
    $('body').append(modalManagerInstance.render().el);
  },

  hideAllModals() {
    modalManagerInstance.$('.modal').css({ visibility: 'hidden' });
  },

  showHiddenModals() {
    modalManagerInstance.$('.modal').css({ visibility: 'visible' });
  },

  // A utility function to create a "default" modal, with a few configurable options passed in
  createAndAddStandardModal(modal_options) {
    modal_options = modal_options || {};
    const modalView = new ModalBlankView(modal_options);

    this.addModal(modalView);
    return modalView;
  },

  /**
   * Used with new intake form - didn't want to break existing functionality by changing createAndAddStandardModal
   * @param modal_options
   */
  createAndAddStandardPromiseModal(modal_options) {
    return new Promise((resolve, reject) => {
      modal_options = modal_options || {};

      // Wrap these handlers so we can resolve and or reject based on button action
      if (typeof modal_options.onContinueFn === 'function') {
        const onContinueFn = modal_options.onContinueFn; // Copy the function
        modal_options.onContinueFn = (modalView) => {
          // Don't alter function scope, execute as is
          onContinueFn(modalView);

          if (modal_options.hasOwnProperty('resolveAsIfTrue')) {
            resolve(modal_options.resolveAsIfTrue);
          } else {
            resolve(true);
          }
        };
      }

      if (typeof modal_options.onCancelFn === 'function') {
        const onCancelFn = modal_options.onCancelFn; // Copy the function
        modal_options.onCancelFn = (modalView) => {
          // Don't alter function scope, execute as is
          onCancelFn(modalView);

          if (modal_options.hasOwnProperty('resolveAsIfFalse')) {
            resolve(modal_options.resolveAsIfFalse);
          } else {
            resolve(false);
          }
        };
      }

      const modalView = new ModalBlankView(modal_options);

      this.addModal(modalView);
    });
  },

  createAndAddCustomModal(modalClass, modal_options) {
    modal_options = modal_options || {};
    if (!modalClass) {
      console.log(`[Error] Didn't receive a custom modal class.  Not creating modal.`);
      return;
    }
    const modalView = new modalClass(modal_options);
    this.addModal(modalView);
    return modalView;
  },

  /**
   * Used with new intake form - didn't want to break existing functionality by changing createAndAddCustomModal
   * @param modalClass
   * @param modal_options
   * @returns {*}
   */
  createAndAddCustomPromiseModal(modalClass, modal_options) {
    return new Promise((resolve, reject) => {
      modal_options = modal_options || {};
      if (!modalClass) {
        console.log(`[Error] Didn't receive a custom modal class.  Not creating modal.`);
        return;
      }
      const modalView = new modalClass(modal_options);
      this.addModal(modalView);
    });

  }

});

// Start the listener
new ModalManagerRadio();
export default modalManagerInstance;
