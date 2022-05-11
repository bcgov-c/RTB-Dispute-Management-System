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

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const menuChannel = Radio.channel('menu');
const statusChannel = Radio.channel('status');
const Formatter = Radio.channel('formatter').request('get');
const auditChannel = Radio.channel('audits');
const disputeChannel = Radio.channel('dispute');

let UAT_TOGGLING = {};

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
    this.loadAuditLogs(this.auditLogFilterModel.getData());
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    this.statusEvents = statusChannel.request('get:all');
    this.processDetails = statusChannel.request('get:processDetails');  
    
    this.auditsPerLoad = 20;
    this.auditIndex = 1;
    this.createAuditLogSubModels();
    this.loadAuditLogs(this.auditLogFilterModel.getData());
    this.setupListeners();
    this.loadStatusEvents({ no_loader: true });

    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
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

  loadAuditLogs(callType, options) {
    options = options || {};
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }
    const self = this;
    this.auditLog_loaded = false;
    auditChannel.request('load', this.model.get('dispute_guid'), {
      callType: callType ? callType : null,
      count: (self.auditsPerLoad * self.auditIndex),
      showErrors: this.includeErrorsModel.getData() ? 1 : 0
      }).done(function(audit_collection) {
        loaderChannel.trigger('page:load:complete');
        self.auditLogs = audit_collection;
        self.auditLog_loaded = true;
        self.render();
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.AUDIT.LOAD', () => {
          self.auditLog_loaded = true;
          self.render();
        });
        handler(err);
      });
  },

  createAuditLogSubModels() {
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
     this.listenTo(this.auditLogFilterModel, 'change:value', this.handleAuditLogFilterChange, this);
     this.listenTo(this.model, 'save:status', this.loadStatusEvents, this);
     this.listenTo(this.includeErrorsModel, 'change:checked', this.handleAuditLogFilterChange, this);
  },

  handleAuditLogFilterChange(model, value) {
    this.resetDisplayedAuditLogs();
    this.loadAuditLogs(value);
  },

  resetDisplayedAuditLogs() {
    this.auditIndex = 1;
  },

  onRender() {
    if (!this.statusEvents_loaded || !this.auditLog_loaded) {
      return;
    }
    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File number ${this.model.get('file_number')}: History Page`
    }));
    this.showChildView('disputeFlags', new DisputeFlags());
    this.renderAuditLog();
    this.renderProcessGroups();
  },

  renderProcessGroups() {
    this.showChildView('processGroupsRegion', new ProcessGroupsView({
      model: this.model,
      statusCollection: this.statusEvents,
      processDetailsCollection: this.processDetails
    }));
    loaderChannel.trigger('page:load:complete');
  },

  renderAuditLog() {
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
      shouldDisplayViewMore: this.auditLogs && this.auditLogs.length >= this.auditsPerLoad * this.auditIndex,      
      enableQuickAccess: isQuickAccessEnabled(this.model),
      printAuditFilterText: this.auditLogFilterModel.getSelectedText(),
      printAuditIncludeErrorsSelected: this.includeErrorsModel.getData() 
    };
  },

});
