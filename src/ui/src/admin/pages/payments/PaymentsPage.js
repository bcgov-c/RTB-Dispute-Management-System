import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DisputeFeesView from './DisputeFees';
import ModalAddDisputeFee from './ModalAddDisputeFee';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './PaymentsPage_template.tpl';

const disputeChannel = Radio.channel('dispute');
const paymentsChannel = Radio.channel('payments');
const menuChannel = Radio.channel('menu');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} payments-page`,

  regions: {
    disputeFlags: '.dispute-flags',
    disputeFeesRegion: '#dispute-fee-list'
  },

  ui: {
    printHeader: '.print-header',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    addFee: '.add-dispute-fee-btn-container',
  },

  events: {
    'click @ui.completenessCheck': 'completenessCheck',
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': 'clickPrint',
    'click @ui.addFee': 'clickAddFee',
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose'
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickPrint() {
    const dispute = disputeChannel.request('get');
    dispute.checkEditInProgressPromise()
      .then(() => window.print())
      .catch(() => dispute.showEditInProgressModalPromise());
  },

  clickRefresh() {
    const refreshPageFn = () => {
      this.model.triggerPageRefresh();
    };

    this.model.checkEditInProgressPromise().then(
      refreshPageFn,
      () => {
        this.model.showEditInProgressModalPromise(true).then(isAccepted => {
          if (isAccepted) {
            this.model.stopEditInProgress();
            refreshPageFn();
          }
        });
      });
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), {trigger: true});
  },

  clickAddFee() {
    const addFeeFn = () => {
      const modal = new ModalAddDisputeFee({
        model: this.disputeFees.add({}, { silent: true})
      });
  
      modal.once('save:complete', function() {
        modalChannel.request('remove', modal);
        this.loadPayments();
      }, this);
      modalChannel.request('add', modal);
    };

    this.model.checkEditInProgressPromise().then(
      addFeeFn,
      () => this.model.showEditInProgressModalPromise()
    );
  },

  loadPayments(options) {
    this.model.stopEditInProgress();

    options = options || {};
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }
    const dispute_guid = disputeChannel.request('get:id');
    this.payments_loaded = false;
    paymentsChannel.request('load:with:checks', dispute_guid).done(disputeFees => {
      this.disputeFees = disputeFees;
      this.payments_loaded = true;
      this.render();
    })
    .fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.PAYMENTS.LOAD.FULL');
      handler(err);
    });
  },

  initialize() {
    this.disputeFees = paymentsChannel.request('get:fees');
    this.loadPayments({ no_loader: true });
    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
  },

  onRender() {
    if (!this.payments_loaded) {
      return;
    }
    const dispute = disputeChannel.request('get');
    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${dispute.get('file_number')}: Payment Page`
    }));
    this.showChildView('disputeFlags', new DisputeFlags());
    this.showChildView('disputeFeesRegion', new DisputeFeesView({ collection: this.disputeFees }));
    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      Formatter,
      isLoaded: this.payments_loaded,
      lastRefreshTime: Moment(),
      enableQuickAccess: isQuickAccessEnabled(this.model),
    };
  }
});
