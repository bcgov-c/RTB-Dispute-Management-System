import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './AnalysisSection_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  filesChannel = Radio.channel('files'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-analysis`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_ANALYSIS');
  },
  title: 'Section 7: Analysis',
  hasRefresh: false,

  generateFn() {
    // TODO: Add generated content into edit...
    const dispute = disputeChannel.request('get'),
      dfd = $.Deferred(),
      self = this;

    return template({
      Formatter,
      dispute
    });
  }
});