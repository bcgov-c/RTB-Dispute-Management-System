import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../components/context-container/ContextContainer';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';
import DisputeFeeView from './DisputeFee';

const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

const EmptyDisputeFeesView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="dispute-fee-item">No dispute fees have been added</div>`)
});

const DisputeFeesView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerWithNotesView,
  emptyView: EmptyDisputeFeesView,

  buildChildView(child, ChildViewClass, childViewOptions){
    const options = _.extend({model: child}, childViewOptions);

    if (ChildViewClass === EmptyDisputeFeesView) {
      return new ChildViewClass(childViewOptions);
    }

    const getMenuConfigFn = () => {
      const default_menu = [{ name: 'Add Transaction', event: 'add:transaction' }, { name: 'Edit Fee', event: 'edit' }],
        hasPaymentTransactions = child.get('payment_transactions') && child.get('payment_transactions').length;

      if (hasPaymentTransactions && child.getActivePayment() && !child.getActivePayment().isApproved()) {
        default_menu.push({ name: 'Mark as Paid', event: 'mark:paid'});
        default_menu.unshift({ name: 'Edit Latest Transaction', event: 'edit:transaction' });
      }

      return {
        menu_states: {
          default: default_menu,
          edit: [{ name: 'Save', event: 'save' },
            { name: 'Cancel', event: 'cancel' }],
          'edit:transaction': [{ name: 'Save', event: 'save:transaction' },
            { name: 'Cancel', event: 'cancel:transaction' }],
        },
        menu_events: {
          'edit:transaction': {
            view_mode: 'view',
            next: 'edit:transaction',
            isEdit: true
          },

          edit: {
            view_mode: 'edit',
            next: 'edit',
            isEdit: true
          },
          cancel: {
            next: 'default',
            reset: true
          },
          'cancel:transaction': {
            next: 'default',
            reset: true
          }
        }
      };
    };
    const disputeModel = disputeChannel.request('get');
    const view = ContextContainer.withContextMenu(_.extend({
      wrappedView: new DisputeFeeView(options),
      titleDisplay: `Dispute Fee ${Formatter.toLeftPad(child.collection ? child.collection.length - childViewOptions.childIndex : '', '0', 2)}`,
      menu_title: `Dispute Fee ID ${child.id}`,
      disputeModel,
      collapseHandler: SessionCollapse.createHandler(disputeModel, 'Payment', 'fees', child.id),
      
      contextRender(contextContainerView) {
        _.extend(contextContainerView, getMenuConfigFn());
        contextContainerView.render();
      }
    }, getMenuConfigFn()));
    return view;
  },

  initialize() {
    this.listenTo(this.collection, 'update', this.render);
  },

  childViewOptions(model, index) {
    return {
      childIndex: index
    };
  }
});


export default Marionette.View.extend({
  template: _.template(`<div class="dispute-fee-list"></div>`),

  regions: {
    listRegion: '.dispute-fee-list'
  },

  initialize(options) {
    this.options = options;
  },

  onRender() {
    // save scroll position
    this.showChildView('listRegion', new DisputeFeesView(this.options));
  }

});
