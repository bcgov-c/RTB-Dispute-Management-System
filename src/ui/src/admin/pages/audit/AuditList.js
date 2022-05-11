import Marionette from 'backbone.marionette';
import AuditListItemView from './AuditListItem';
import template from './AuditList_template.tpl';

const EmptyAuditItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No post-intake changes recorded</div>`)
});

const AuditListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: AuditListItemView,
  emptyView: EmptyAuditItemView,

  childViewOptions() {
    return { collection: this.collection }
  }
});

export default Marionette.View.extend({
  template,

  regions: {
    auditList: '.audit-list-items'
  },

  initialize(options) {
    _.extend(this.options, {}, options);
  },

  onRender() {
    this.showChildView('auditList', new AuditListView(this.options));
  },

  templateContext() {
    return {
      hasVisibleItems: this.collection.length
    };
  }
});