import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';

const api_name = 'adhocdlreport';

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

export default CMModel.extend({
  idAttribute: 'adhoc_dl_report_id',

  defaults: {
    adhoc_dl_report_id: null,
    title: null,
    description: null,
    html_data_dictionary: null,
    type: null,
    sub_type: null,
    query_for_name: null,
    query_for_report: null,
    is_active: null,
    created_date: null
  },

  API_SAVE_ATTRS: [],

  sync() {
    console.log(`[Warning] No REST apis defined for Report object, and should not be called`);
  },

  // Uses Blob, and HTML5 download in order to start a file download in the user's browser
  downloadHTML5() {
    const xhr = new XMLHttpRequest();
    const downloadUrl = `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${this.id}`;
    const downloadFilename = `${this.get('title')}_${Moment().format('YYYY_MMMDD')}_${sessionChannel.request('get:user').get('user_name')}.csv`;

    const xhrOnLoadFn = () => {
      const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') });
      const dataUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      
      $('<a />', {
         'href': dataUrl,
         'download': downloadFilename,
         'text': "click"
       }).hide().appendTo("body")[0].click();
    };

    xhr.responseType = 'arraybuffer';
    xhr.onload = xhrOnLoadFn;
    xhr.onerror = function(error_response) {
      console.log(`[Error] Download failed`, error_response);
    };

    xhr.open('GET', downloadUrl);
    xhr.setRequestHeader('Token', sessionChannel.request('token'));
    xhr.send();
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
  }
});
