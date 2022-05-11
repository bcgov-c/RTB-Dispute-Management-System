import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import ReportDownloadSection from './ReportDownloadSection';
import ReportCollection from '../../components/reports/Report_collection';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import React from 'react';
import './operational-reports.css';
import HeaderImg from '../../static/Icon_Header_CommonFiles.png';

const TITLE_OPERATIONAL_REPORTS = 'Operational Reports';
const TITLE_EXCEPTION_REPORTS = 'Exception Reports'
const TITLE_OTHER_REPORTS = 'Other Reports';

const reportsChannel = Radio.channel('reports');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const OperationalReportsPage = PageView.extend({
  className: `${PageView.prototype.className} operational-reports-page`,

  regions: {
    operationalReportsRegion: '.operational-reports-page-operational-reports',
    exceptionReportsRegion: '.operational-reports-page-exception-reports',
    otherReportsRegion: '.operational-reports-page-other-reports',
  },

  ui: {
    refresh: '.header-refresh-icon'
  },

  events: {
    'click @ui.refresh': 'clickRefresh'
  },

  clickRefresh() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  loadReports(initialLoad = false) {
    if (!initialLoad) loaderChannel.trigger('page:load');
    this.isLoaded = false;
    
    reportsChannel.request('load')
      .done(reports => {
        this.reports.reset(reports.models || []);
        this.isLoaded = true;
        this.render();
      }).fail(generalErrorFactory.createHandler('ADMIN.ADHOC_REPORTS.LOAD', () => {
        loaderChannel.trigger('page:load:complete');
      }));
  },

  initialize() {
    this.template = this.template.bind(this);
    this.isLoaded = true;
    this.reports = new ReportCollection([]);
    this.loadReports({ initialLoad: true });
  },

  onRender() {
    if (!this.isLoaded) return;

    this.showChildView('operationalReportsRegion', new ReportDownloadSection({
      headerTitle: TITLE_OPERATIONAL_REPORTS, availableReports: this.reports.filter(r => r.isTypeOperational()) }));

    this.showChildView('exceptionReportsRegion', new ReportDownloadSection({
      headerTitle: TITLE_EXCEPTION_REPORTS, availableReports: this.reports.filter(r => r.isTypeException()) }));

    this.showChildView('otherReportsRegion', new ReportDownloadSection({
      headerTitle: TITLE_OTHER_REPORTS, availableReports: this.reports.filter(r => r.isTypeOther()) }));
    
    loaderChannel.trigger('page:load:complete');    
  },

  template() {
    return (
      <>
        <div className="header-page-title-container">
          <div className="header-page-title header-page-title-with-img">
            <img src={HeaderImg} />
            <span>Operational Reports</span>
          </div>

          <div className="subpage dispute-overview-header-right-container">
            <div className="dispute-overview-header-right">
              <div className="dispute-overview-refresh-item">
                <span className="dispute-overview-refresh-text">{Formatter.toLastModifiedTimeDisplay(Moment())}</span>
                <div className="dispute-overview-header-icon header-refresh-icon"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="operational-reports-page-operational-reports"></div>
        <div className="operational-reports-page-exception-reports"></div>
        <div className="operational-reports-page-other-reports"></div>
      </>
    );
  }
});

_.extend(OperationalReportsPage.prototype, ViewJSXMixin);
export default OperationalReportsPage;