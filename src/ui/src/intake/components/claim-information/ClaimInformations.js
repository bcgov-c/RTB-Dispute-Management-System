
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import ClaimInformationView from './ClaimInformation';

import template from './ClaimInformations_template.tpl';

const Formatter = Radio.channel('formatter').request('get');

const ClaimInformationCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ClaimInformationView,
  filter(child) {
    return !child.get('disputeClaim').isHiddenExternal();
  }
});

export default Marionette.View.extend({
  template,

  ui: {
    error: '.claim-total-error',
    amountContainer: '.claim-total-amount-container',
    amountText: '.claim-total-number'
  },

  regions: {
    collectionRegion: '.claim-information-collection-view'
  },

  initialize(options) {
    this.options = options || {};

    this.listenTo(this.collection, 'amountChanged', this.updateTotalAmount, this);
    this.listenTo(this.collection, 'delete:complete', this.render, this);
  },

  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).removeClass('hidden-item');
  },

  validateAndShowErrors() {
    let is_valid = true;
    const collectionView = this.getChildView('collectionRegion');
    collectionView.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      is_valid = childView.validateAndShowErrors() & is_valid;
    });


    const is_own_collection_valid = this.collection.isValid();
    is_valid = is_own_collection_valid && is_valid;
    if (!is_own_collection_valid) {
      this.showErrorMessage(this.collection.validationError);
    }
    return is_valid;
  },


  updateTotalAmount() {
    const total = this.collection.getTotalClaimsAmount();
    this.hideClaimTotalError();
    this.updateClaimTotal(total);
  },

  hideClaimTotalError() {
    this.getUI('error').addClass('hidden-item');
  },

  showClaimTotalError() {
    this.getUI('error').removeClass('hidden-item');
  },

  updateClaimTotal(total) {
    this.getUI('amountText').text(Formatter.toAmountDisplay(total));
  },

  onRender() {
    this.showChildView('collectionRegion', new ClaimInformationCollectionView(this.options));
    this.updateTotalAmount();
  },

  templateContext() {
    return {
      hasMonetaryAmounts: this.collection.hasMonetaryAmounts()
    };
  }
});
