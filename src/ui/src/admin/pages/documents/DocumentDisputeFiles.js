import Marionette from 'backbone.marionette';
import DocumentDisputeFileView from './DocumentDisputeFile';

const DEFAULT_EMPTY_MSG = 'No dispute documents have been added.';

const EmptyDocumentDisputeFileView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class=""><%= emptyMessage|| DEFAULT_EMPTY_MSG %></div>`),
  templateContext() {
    return { DEFAULT_EMPTY_MSG, emptyMessage: this.getOption('emptyMessage') };
  }
});

const DocumentDisputeFilesListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: DocumentDisputeFileView,
  emptyView: EmptyDocumentDisputeFileView,
  
  childViewOptions() {
    return { showControls: this.showControls };
  },
  emptyViewOptions() {
    return { emptyMessage: this.emptyMessage };
  },

  /**
   * @param {Function} docFilter - optional filter
   * @param {String} emptyMessage - optional message when an empty list
   * @param {Boolean} showControls - whether to show edit/remove controls
   */
  initialize(options) {
    this.mergeOptions(options, ['docFilter', 'emptyMessage', 'showControls']);
  },

  // Docs are always filtered to not show empty filedescriptions with no uploaded files
  filter(model) {
    if (_.isEmpty(model.getUploadedFiles())) {
      return false;
    }
    return this.docFilter && typeof this.docFilter === 'function' ? this.docFilter(model) : true;
  },

  comparator(model) {
    return -model.get('file_description').get('created_date');
  }
});


export default Marionette.View.extend({
  template: _.template(`<div class="document-list-items"></div>`),

  regions: {
    disputeFileList: '.document-list-items'
  },

  initialize(options) {    
    _.extend(this.options, {}, options);
  },

  onRender() {
    this.showChildView('disputeFileList', new DocumentDisputeFilesListView(_.extend({},  this.options, { showArrows: false })));
  }
})