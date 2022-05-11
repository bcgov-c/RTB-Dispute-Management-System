import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import ReportCollection from './Report_collection';

const api_get_reports = 'adhocdlreport';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');

const ReportsManager = Marionette.Object.extend({
  channelName: 'reports',

  radioRequests: {
    load: 'loadReports',
    'get': 'getAllReports',
    'get:report': 'getReportById' 
  },

  initialize() {
    this.cached_data = {};
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
