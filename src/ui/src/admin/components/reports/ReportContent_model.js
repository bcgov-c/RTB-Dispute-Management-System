import Radio from 'backbone.radio';
import Backbone from 'backbone';

const api_name = 'adhocdlreport';
const CONTENT_DISPOSITION_CONTENT = 1;

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const apiChannel = Radio.channel('api');

export default Backbone.Model.extend({
  defaults: {
    // Must be linked to a report
    reportModel: null,
    
    // Parameters to be used in the search
    parameters: null,

    // Latest result of downloading the report
    content: null,
  },

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${this.get('reportModel')?.id}`;
  },

  async load() {
    const contents = await apiChannel.request('call', {
      type: 'POST',
      url: this.url(),
      headers: {
        'Content-Type': 'application/json'
      },
      dataType: 'text',
      data: JSON.stringify({
        content_disposition: CONTENT_DISPOSITION_CONTENT,
        return_raw_data: true,
        parameters: this.get('parameters')?.length ? this.get('parameters') : []
      }),
    });
    return contents;
  },

  // Uses Blob, and HTML5 download in order to start a file download in the user's browser
  download() {
    const downloadAsExcel = this.get('reportModel')?.isExcelReport();
    const fileExtension = `.${downloadAsExcel ? 'xlsx' : 'csv'}`;
    const downloadFilename = `${[
      `${this.get('reportModel')?.get('title')}`,
      `${Moment().format('YYYY_MMMDD')}`,
      `${sessionChannel.request('get:user').get('user_name')}`,
    ].join('_')}${fileExtension}`;
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function(error_response) {
      console.log(`[Error] Download failed`, error_response);
    };
    const xhrOnLoadFn = () => {
      const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') });
      const dataUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      
      $('<a />', {
         'href': dataUrl,
         'download': downloadFilename,
         'text': "click"
       }).hide().appendTo("body")[0].click();
    };
    xhr.onload = xhrOnLoadFn;
    
    xhr.open('POST', this.url());
    xhr.setRequestHeader('Token', sessionChannel.request('token'));
    xhr.setRequestHeader('Content-Type', 'application/json');
    const body = JSON.stringify(Object.assign({
        content_disposition: CONTENT_DISPOSITION_CONTENT,
        return_raw_data: false,
        parameters: this.get('parameters')?.length ? this.get('parameters') : []
      }, downloadAsExcel ? { use_excel_template: true } : null
    ));
    xhr.send(body);
  },
});
