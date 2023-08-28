import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import CommunicationNoteSectionView from './CommunicationNoteSection';
import CommunicationEmailSectionView from './CommunicationEmailSection';
import CommunicationReceiptSectionView from './CommunicationReceipts';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './CommunicationsPage_template.tpl';

const hearingChannel = Radio.channel('hearings');
const noticeChannel = Radio.channel('notice');
const documentsChannel = Radio.channel('documents');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const notesChannel = Radio.channel('notes');
const emailsChannel = Radio.channel('emails');
const filesChannel = Radio.channel('files');
const statusChannel = Radio.channel('status');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className:`${PageView.prototype.className} communication-page`,

  regions: {
    disputeFlags: '.dispute-flags',
    notesRegion: '#comm-notes',
    draftSection: '#comm-drafts',
    emailRegion: '#comm-emails',
    pickupRegion: '#comm-pickups',
    receiptRegion: '#comm-receipts'
  },

  ui: {
    printHeader: '.print-header',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
  },

  events: {
    'click @ui.completenessCheck': 'completenessCheck',
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': function() { window.print(); },
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose'
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickRefresh() {
    this.model.triggerPageRefresh();
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), { trigger: true });
  },


  initialize() {
    this.loadPageData();
    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
  },

  loadPageData() {
    this.communications_loaded = false;
    const dispute_guid = this.model.id;
    $.whenAll(
      notesChannel.request('load', dispute_guid),
      emailsChannel.request('load', dispute_guid),
      emailsChannel.request('load:templates'),
      emailsChannel.request('load:receipts', dispute_guid),
      filesChannel.request('load:commonfiles'),
      documentsChannel.request('load', dispute_guid),
      noticeChannel.request('load', dispute_guid),
      hearingChannel.request('load', dispute_guid),
      statusChannel.request('load:status', dispute_guid)
    ).done(() => {
      this.communications_loaded = true;
      this.render();
    })
    .fail(
      generalErrorFactory.createHandler('ADMIN.COMMUNICATIONS.LOAD', () => {
        this.communications_loaded = true;
        this.render();
      })
    );
  },

  onRender() {
    if (!this.communications_loaded) {
      return;
    }
    const notes = notesChannel.request('get:all');
    const emails = emailsChannel.request('get:all');
    const receipts = emailsChannel.request('get:receipts');
    this.stopListening(emails);
    this.listenTo(emails, 'refresh:page', this.clickRefresh, this);

    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${this.model.get('file_number')}: Communications Page`
    }));

    this.showChildView('disputeFlags', new DisputeFlags());
    this.showChildView('notesRegion', new CommunicationNoteSectionView({ model: this.model, collection: notes }));
    this.showChildView('draftSection', new CommunicationEmailSectionView({
      sectionTitle: 'Draft Messages (not sent)',
      disableTypeFilter: true,
      showAddEmail: false,
      isDraft: true,
      model: this.model,
      collection: emails,
      emailFilter(model) { return model.isUnsentDraft(); }
    }));
    this.showChildView('emailRegion', new CommunicationEmailSectionView({
       model: this.model,
       collection: emails,
       emailFilter(model) { return !model.isUnsentDraft() && !model.isPickup(); }
    }));
    this.showChildView('pickupRegion', new CommunicationEmailSectionView({
      sectionTitle: 'Pickups',
      disableTypeFilter: true,
      isPickup: true,
      model: this.model,
      collection: emails,
      emailFilter(model) { return !model.isUnsentDraft() && model.isPickup(); }
   }));

    this.showChildView('receiptRegion', new CommunicationReceiptSectionView({ model: this.model, collection: receipts }))

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      isLoaded: this.communications_loaded,
      Formatter,
      lastRefreshTime: Moment(),
      enableQuickAccess: isQuickAccessEnabled(this.model),
    };
  }

});
