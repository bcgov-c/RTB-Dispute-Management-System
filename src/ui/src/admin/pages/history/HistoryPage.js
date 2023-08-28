import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import ProcessGroupsView from './ProcessGroups';
import AuditList from '../audit/AuditList';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './HistoryPage_template.tpl';
import Audit_collection from '../../components/audit/Audit_collection';

const AUDIT_LOAD_COUNT = 20;
let UAT_TOGGLING = {};

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const menuChannel = Radio.channel('menu');
const statusChannel = Radio.channel('status');
const Formatter = Radio.channel('formatter').request('get');
const auditChannel = Radio.channel('audits');
const disputeChannel = Radio.channel('dispute');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} history-page`,

  regions: {
    disputeFlags: '.dispute-flags',
    processGroupsRegion: '.history-process-groups',
    auditFilterRegion: '.audit-filters',
    auditList: '.audit-list-items-section',
    includeErrorRegion: '.include-error-box',
  },

  ui: {
    printHeader: '.print-header',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    viewMore: '.show-more-disputes'
  },

  events: {
    'click @ui.completenessCheck': 'completenessCheck',
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': 'clickPrint',
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose',
    'click @ui.viewMore': 'clickViewMore'
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

  clickViewMore() {
    this.auditIndex++;
    this.loadAuditLogs();
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    this.statusEvents = statusChannel.request('get:all');
    this.processDetails = statusChannel.request('get:processDetails');  

    this.auditIndex = 0;
    this.auditLogs = new Audit_collection();
    this.createSubModels();
    this.setupListeners();
    
    this.loadStatusEvents({ no_loader: true });
    this.loadAuditLogs();
    
    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
  },


  createSubModels() {
    this.auditLogFilterModel = new RadioModel({
      optionData:
        [{value: 1, text: 'All Changes'},
        {value: 2, text: 'Additions Only'},
        {value: 3, text: 'Modifications Only'},
        {value: 4, text: 'Deletions Only'}],
      value: 1,
    });

    this.includeErrorsModel = new CheckboxModel({
      html: 'Include Errors',
      checked: false
    });
  },

  setupListeners() {
    const handleAuditLogFilterChange = () => {
      this.auditIndex = 0;
      this.auditLogs.reset([], { silent: true });
      this.loadAuditLogs();
    };

    this.listenTo(this.model, 'save:status', this.loadStatusEvents, this);
    this.listenTo(this.auditLogFilterModel, 'change:value', handleAuditLogFilterChange);
    this.listenTo(this.includeErrorsModel, 'change:checked', handleAuditLogFilterChange);
  },

  loadStatusEvents(options) {
    options = options || {};
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }
    const self = this;
    this.statusEvents_loaded = false;
    statusChannel.request('load', this.model.get('dispute_guid'))
      .done(function() {
        loaderChannel.trigger('page:load:complete');
        self.statusEvents_loaded = true;
        self.render();
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.HISTORY.LOAD', () => {
          self.statusEvents_loaded = true;
          self.render();
        });
        handler(err);
      });
  },

  loadAuditLogs(options={}) {
    if (!options?.no_loader) loaderChannel.trigger('page:load');

    const callType = this.auditLogFilterModel.getData();
    const showErrors = this.includeErrorsModel.getData() ? 1 : 0;
    this.auditLog_loaded = false;

    auditChannel.request('load', this.model.get('dispute_guid'), {
      callType: callType || null,
      count: AUDIT_LOAD_COUNT,
      index: this.auditIndex * AUDIT_LOAD_COUNT,
      showErrors
    }).done(auditResponse => {
        this.auditLogs.add(auditResponse, { merge: true, silent: true });
        this.auditLog_loaded = true;
        this.render();
        loaderChannel.trigger('page:load:complete');
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.AUDIT.LOAD', () => {
        this.auditLog_loaded = true;
        this.render();
      });
      handler(err);
    });
  },

  onRender() {
    if (!this.statusEvents_loaded || !this.auditLog_loaded) return;

    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File number ${this.model.get('file_number')}: History Page`
    }));
    this.showChildView('disputeFlags', new DisputeFlags());
    this.renderProcessGroups();
    this.renderAuditLogs();
  },

  renderProcessGroups() {
    this.showChildView('processGroupsRegion', new ProcessGroupsView({
      model: this.model,
      statusCollection: this.statusEvents,
      processDetailsCollection: this.processDetails
    }));
    loaderChannel.trigger('page:load:complete');
  },

  renderAuditLogs() {
    this.showChildView('auditFilterRegion', new RadioView({ model: this.auditLogFilterModel }));
    this.showChildView('includeErrorRegion', new CheckboxView({ model: this.includeErrorsModel }));
    this.showChildView('auditList', new AuditList({ collection: this.auditLogs }));
  },

  templateContext() {
    return {
      Formatter,
      isLoaded: this.statusEvents_loaded && this.auditLog_loaded,
      lastRefreshTime: Moment(),
      hasAuditLogs: (this.auditLogs || []).length,
      shouldDisplayViewMore: this.auditLogs && (this.auditLogs.length >= (AUDIT_LOAD_COUNT * (this.auditIndex+1))),
      enableQuickAccess: isQuickAccessEnabled(this.model),
      printAuditFilterText: this.auditLogFilterModel.getSelectedText(),
      printAuditIncludeErrorsSelected: this.includeErrorsModel.getData() 
    };
  },

});
