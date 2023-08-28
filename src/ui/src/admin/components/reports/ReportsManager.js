/**
 * @fileoverview - Manager that handles loading and retrieval of report data
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import ReportCollection from './Report_collection';
import { GraphModelFactory } from '../graph/GraphModelFactory';
import { Graph_model as GraphModel } from '../graph/Graph_model';

const api_get_reports = 'adhocdlreport';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');

const ReportsManager = Marionette.Object.extend({
  channelName: 'reports',

  radioRequests: {
    load: 'loadReports',
    'load:from:config': 'loadGraphsFromReportsConfig',
    'get': 'getAllReports',
    'get:report': 'getReportById' 
  },

  initialize() {
    this.reports = new ReportCollection();
  },

  loadReports() {
    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_get_reports}`
    }).done(response => {
      this.reports.reset(response);
      dfd.resolve(this.reports);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  async loadGraphsFromReportsConfig(reportsConfig=[], loadedReports=[], reportLoadOptions={}) {
    if (!reportsConfig?.length || !loadedReports?.length) return;

    const loadFromReportConfig = async function(reportConfigData={}) {
      if (!loadedReports?.length) return;
      const report = loadedReports?.find({ title: reportConfigData?.reportTitle });
      if (!report) return;
      const graphData = {...{
          reportModel: report,
          title: reportConfigData?.title,
          helpHtml: report.get('description'),
        },
        ...(reportConfigData || {})
      };
      const reportContents = await report?.load(reportLoadOptions);
      const graphModel = GraphModelFactory.createGraph(graphData);
      graphModel.set('reportContents', reportContents);
      return graphModel;
    }

    // NOTE: Save report position in initial config list, as this matters for UI displays
    const loadedGraphsLookup = {};
    const promises = reportsConfig.map((reportConfig, index) => async () => {
      const graphModel = await loadFromReportConfig(reportConfig);
      if (graphModel) loadedGraphsLookup[index] = graphModel;
    });
    await Promise.allSettled(promises.map(p => p()));
    return _.sortBy(Object.keys(loadedGraphsLookup)).map(index => loadedGraphsLookup[index]);
  },

  getAllReports() {
    return this.reports;
  },

  getReportById(reportId) {
    return this.reports.find(r => r.id === reportId && reportId);
  }
});

_.extend(ReportsManager.prototype, UtilityMixin);

const reportsManagerInstance = new ReportsManager();

export default reportsManagerInstance;
