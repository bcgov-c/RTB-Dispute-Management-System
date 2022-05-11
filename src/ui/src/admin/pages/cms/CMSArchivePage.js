import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import { routeParse } from '../../routers/mainview_router';
import CMSArchiveRecordsView from './CMSArchiveRecords';
import CMSArchiveInformationView from './CMSArchiveInformation';
import template from './CMSArchivePage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const cmsChannel = Radio.channel('cms');

const CMS_STATUS_DISPLAYS = {
  0: 'New',
  16: 'Reopened for Clarification',
  5: 'Ready to Pay',
  8: 'Rescheduled',
  4: 'Needs Update',
  15: 'Review Consideration',
  6: 'Approved',
  3: 'DR Docs Pending',
  17: '--',
  20: '--',
  12: 'Review Hearing',
  13: 'Reopened for Correction',
  1: 'Submitted',
  9: 'Adjourned',
  2: 'Terminated',
  7: 'Scheduled',
  14: 'Abandoned',
  11: 'Cancelled',
  10: 'Closed',
};

export default PageView.extend({
  template,
  className:`${PageView.prototype.className} cms-archive-page`,

  regions: {
    archiveRegion: '#cms-archive-information',
    disputeRegion: '#cms-archive-dispute-information'
  },

  ui: {
    close: '.header-close-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon'
  },

  events: {
    'click @ui.close': 'clickClose',
    'click @ui.print': function() { },
    'click @ui.refresh': 'clickRefresh'
  },

  clickRefresh() {
    loaderChannel.trigger('page:load');
    cmsChannel.request('load:filenumber', this.model.get('file_number'))
      .done(() => {
        loaderChannel.trigger('page:load:complete');
        this.render();
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.CMS.LOAD', () => {
          menuChannel.trigger('close:active');
          Backbone.history.navigate(routeParse('landing_item'), { trigger: true });
        });
        handler(err);
      });
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('landing_item'), { trigger: true });
  },

  clickPrint() {
    window.print();
  },

  initialize() {
    this.cms_clone_number = 0;
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model, 'switch:record', function(index) {
      this.cms_clone_number = index;
      this.render();
    }, this);

    this.listenTo(this.model, 'update', this.render, this);
  },

  onRender() {

    this.showChildView('disputeRegion', new CMSArchiveRecordsView({
      model: new Backbone.Model(this.model.getCMSRecord(this.cms_clone_number)),
      archiveModel: this.model,
      CMS_STATUS_DISPLAYS,
    }));

    this.showChildView('archiveRegion', new CMSArchiveInformationView({
      model: this.model,
      CMS_STATUS_DISPLAYS,
      cloneNumber: this.cms_clone_number
    }));

    loaderChannel.trigger('page:load:complete');
  }
});

export { CMS_STATUS_DISPLAYS as CMS_STATUS_DISPLAYS };
