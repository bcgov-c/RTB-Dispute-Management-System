import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './UndeliveredDoc_template.tpl';

const configChannel = Radio.channel('config');
const statusChannel = Radio.channel('status');
const Formatter = Radio.channel('formatter').request('get');

const EmptyUndeliveredDocView = Marionette.View.extend({
  template: _.template(`<div class="standard-list-empty">No matching undelivered documents.</div>`)
});

const UndeliveredDocView = Marionette.View.extend({
  template,
  className: 'standard-list-item',

  initialize(options) {
    this.mergeOptions(options, ['DELIVERY_PRIORITY_LOW', 'DELIVERY_PRIORITY_NORMAL', 'DELIVERY_PRIORITY_HIGH']);
  },

  templateContext() {
    const highest_undelivered_priority = this.model.get('highest_undelivered_priority');
    const priorityIconClass = highest_undelivered_priority === this.DELIVERY_PRIORITY_HIGH ? 'task-priority-high-small' :
      highest_undelivered_priority === this.DELIVERY_PRIORITY_NORMAL ? 'task-priority-medium-small' :
      highest_undelivered_priority === this.DELIVERY_PRIORITY_LOW ? 'task-priority-low-small' :
      'task-priority-none-small';

    return {
      Formatter,
      statusColourClass: statusChannel.request('get:colourclass', this.model.get('dispute_stage'), this.model.get('dispute_status')) || '',
      priorityIconClass
    };
  }
});


export default Marionette.View.extend({
  template: _.template(`
    <div class="undelivered-docs-header standard-list-header <%= hasDocs ? '' : 'hidden' %>">
      <div class="undelivered-doc-dispute">Dispute</div>
      <div class="undelivered-doc-creation">Delivery Creation</div>
      <div class="undelivered-doc-process">Dispute Process</div>
      <div class="undelivered-doc-status">Dispute Status</div>
      <div class="undelivered-doc-total">Total Undelivered</div>
      <div class="undelivered-doc-priority">Highest Priority</div>
      <div class="undelivered-doc-email">Email</div>
      <div class="undelivered-doc-pickup">Pick-Up</div>
      <div class="undelivered-doc-mail">Mail</div>
      <div class="undelivered-doc-other">Other</div>
    </div>
    <div class="undelivered-doc-list"></div>`
  ),
  
  className: 'undelivered-docs-list-container',

  regions: {
    listRegion: '.undelivered-doc-list'
  },

  initialize(options) {
    this.mergeOptions(options, ['filter']);

    this.DELIVERY_PRIORITY_LOW = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_LOW');
    this.DELIVERY_PRIORITY_NORMAL = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_NORMAL');
    this.DELIVERY_PRIORITY_HIGH = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_HIGH');
  },

  onRender() {
    this.showChildView('listRegion', new Marionette.CollectionView({
      childView: UndeliveredDocView,
      emptyView: EmptyUndeliveredDocView,
      collection: this.collection,
      filter: this.filter,
      childViewOptions: () => ({
        DELIVERY_PRIORITY_LOW: this.DELIVERY_PRIORITY_LOW,
        DELIVERY_PRIORITY_NORMAL: this.DELIVERY_PRIORITY_NORMAL,
        DELIVERY_PRIORITY_HIGH: this.DELIVERY_PRIORITY_HIGH
      })
    }));
  },

  templateContext() {
    return {
      hasDocs: this.collection.filter(this.filter).length
    };
  }
});