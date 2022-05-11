import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import doc_group_template from './PrimaryOutcomeDocGroup_template.tpl';

const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const LinkedDisputeOutcomeDocView = Marionette.View.extend({
  template: doc_group_template,

  className: 'primary-outcome-doc-group',

  events: {
    'click .primary-outcome-doc-group__primary-link': 'clickPrimaryLink',
    'click .primary-outcome-doc-group__file': 'clickFilename'
  },

  clickPrimaryLink() {
    Backbone.history.navigate(routeParse('document_item', this.model.get('dispute_guid')), { trigger: true });
  },

  clickFilename(ev) {
    const ele = $(ev.currentTarget);
    const fileId = ele.data('fileId');
    const fileModel = fileId && this.fileModelLookup[fileId];
    if (!fileModel) {
      alert("Error initiating file download. Please try again from the primary file.");
    } else {
      filesChannel.request('click:filename:preview', ev, fileModel, { fallback_download: true });
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['fileModelLookup']);
  },
  
  templateContext() {
    const docGroupOutcomeFiles = this.model.getOutcomeFiles().filter(doc => (
      !doc.isExternal() && !doc.isPublic()));
    return {
      Formatter,
      fileNumber: this.model.get('_fileNumber'),
      docGroupOutcomeFiles,
      fileModelLookup: this.fileModelLookup
    };
  }
});

const LinkedDisputesView = Marionette.CollectionView.extend({
  childView: LinkedDisputeOutcomeDocView,

  childViewOptions() {
    return { fileModelLookup: this.getOption('fileModelLookup') };
  }
});

export default Marionette.View.extend({
  template: _.template(`<div class="context-container">
    <div class="review-applicant-title section-header">
      <div class="context-menu-title-container">
        <span class="context-menu-title"><b></b>Primary File Document Set(s)</span>
      </div>
    </div>
    <div class="primary-outcome-doc-groups__linked-disputes review-information-body"></div>
  </div>`
  ),
  
  className: 'primary-outcome-doc-groups',

  regions: {
    linkedDisputesRegion: '.primary-outcome-doc-groups__linked-disputes'
  },

  initialize(options) {
    this.mergeOptions(options, ['collection', 'fileModelLookup']);
  },

  onRender() {
    this.showChildView('linkedDisputesRegion', new LinkedDisputesView({
      collection: this.collection,
      fileModelLookup: this.fileModelLookup
    }));
  },

  templateContext() {
    return {
      Formatter,
    };
  }
});
