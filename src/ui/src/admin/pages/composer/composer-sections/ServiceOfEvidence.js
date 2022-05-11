import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './ServiceOfEvidence_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-evidence`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_SERVICE_OF_EVIDENCE');
  },
  title: 'Section 4: Service of Evidence',
  hasRefresh: false,
  
  generateFn() {
    return template();
  },

  links: []
});