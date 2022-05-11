import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../routers/mainview_router';
import { CMS_STATUS_DISPLAYS } from '../../pages/cms/CMSArchivePage';
import template from './SearchResultCMS_template.tpl';

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  
  className: 'search-result-item',

  ui: {
    fileNumber: '.cms-archive-search-file-number-link',
    crossFileNumber: '.cms-archive-search-cross-app-number',
    referenceNumber: '.cms-archive-search-reference-number-link'
  },  

events: {
    'click @ui.fileNumber': 'clickSearchFileNumber',
    'click @ui.crossFileNumber': 'clickCrossAppNumber',
    'click @ui.referenceNumber': 'clickSearchFileNumber',
  },  

  clickSearchFileNumber() {
    Backbone.history.navigate(routeParse('cms_item', null, String(this.model.get('file_number'))), {trigger: true});
  },

  clickCrossAppNumber() {
    Backbone.history.navigate(routeParse('cms_item', null, String(this.model.get('cross_app_file_number'))), {trigger: true});
  },

  templateContext() {
    return {
      Formatter,
      statusMap: CMS_STATUS_DISPLAYS
    }
  }
});