import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';
import ReportContent_model from './ReportContent_model';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'adhoc_dl_report_id',

  defaults: {
    adhoc_dl_report_id: null,
    title: null,
    parameter_config: null,
    description: null,
    html_data_dictionary: null,
    type: null,
    sub_type: null,
    query_for_name: null,
    query_for_report: null,
    is_active: null,
    created_date: null,
    user_group: null,
    excel_template_exists: false,
    excel_template_id: false,

    // Parsed json data from parameter_config
    jsonData: null,
  },

  API_SAVE_ATTRS: [],

  initialize() {
    CMModel.prototype.initialize.call(this, ...arguments);
    
    this.parseJsonParamConfig();
    this.on('change:parameter_config', () => {
      this.parseJsonParamConfig();
    });
  },

  parseJsonParamConfig(parameterConfig) {
    if (parameterConfig || this.get('parameter_config')) {
      try {
        this.set('jsonData', JSON.parse(parameterConfig || this.get('parameter_config')));
      } catch (e) {
        this.set('jsonData', null);
      }
    }
  },

  getResponseConfig() {
    return this.get('jsonData')?.responseConfig || {};
  },

  sync() {
    console.log(`[Warning] No REST apis defined for Report object, and should not be called`);
  },

  async load(parameters=[]) {
    const reportContent = new ReportContent_model({ reportModel: this, parameters });
    return reportContent.load();
  },

  download(downloadParams=[]) {
    const reportContent = new ReportContent_model({ reportModel: this, parameters: downloadParams });
    return reportContent.download();
  },

  isExcelReport() {
    return !!this.get('excel_template_exists') && !!this.get('excel_template_id');
  },
  
  _isTypeEqualTo(configCode) {
    return this.get('type') === configChannel.request('get', configCode) && this.get('type');
  },

  isTypeOperational() {
    return this._isTypeEqualTo('REPORT_TYPE_OPERATIONAL');
  },

  isTypeException() {
    return this._isTypeEqualTo('REPORT_TYPE_EXCEPTION');
  },

  isTypeOther() {
    return this._isTypeEqualTo('REPORT_TYPE_OTHER');
  },

});
