import Marionette from 'backbone.marionette';
import PaymentTranscationView from './PaymentTransaction';

const EmptyPaymentTranscationView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="payment-transaction-item">No payment transactions have been added</div>`)
});

export default Marionette.View.extend({
  template: _.template(`<div class="payment-transaction-list"></div>`),

  regions: {
    listRegion: '.payment-transaction-list'
  },

  onRender() {
    // save scroll position
    this.showChildView('listRegion', new Marionette.CollectionView({
      template: _.noop,
      childView: PaymentTranscationView,
      emptyView: EmptyPaymentTranscationView,
      filter(m) { return !m.isNew(); }, // Don't show models that aren't yet saved to API
      collection: this.collection
    }));
  }
});
