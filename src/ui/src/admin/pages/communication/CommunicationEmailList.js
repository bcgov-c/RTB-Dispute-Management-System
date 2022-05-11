import Marionette from 'backbone.marionette';
import CommunicationEmailView from './CommunicationEmail'
import template from './CommunicationEmailList_template.tpl';

const EmptyEmailView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No messages have been added</div>`)
});

const filterUsersFn = function(model) {
  if (!this.typeFilter) return true;
  const type = String(this.typeFilter.get('value'));
  return (type !== 'all' ? String(model.get('message_type')) === type : true) ;
};
const CommunicationEmailListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CommunicationEmailView,
  emptyView: EmptyEmailView,

  initialize(options) {
    this.mergeOptions(options, ['typeFilter', 'emailFilter']);
    this.listenTo(this.typeFilter, 'change:value', this.render, this);
  },

  filter(model) {
    return (_.isFunction(this.emailFilter) ? this.emailFilter(model) : true) && filterUsersFn.bind(this)(model);
  }
});

export default Marionette.View.extend({
  template,
  className() { return `standard-list ${this.isPickup ? 'email-list-item-pickup':''}`; },

  regions: {
    emailListRegion: '.standard-list-items'
  },  

  initialize(options) {
    _.extend(this.options, {}, options);
    this.mergeOptions(options, ['typeFilter', 'isDraft', 'isPickup', 'emailFilter']);

    this.listenTo(this.typeFilter, 'change:value', this.render, this);
    this.listenTo(this.collection, 'update', () => this.hasVisibleItems() ? this.collection.trigger('render') : null);
  },

  hasVisibleItems() {
    return this.collection.any(model => (
      (_.isFunction(this.emailFilter) ? this.emailFilter(model) : true) && filterUsersFn.bind(this)(model)
    ));
  },

  onRender() {
    this.showChildView('emailListRegion', new CommunicationEmailListView(this.options));
  },

  templateContext() {
    const typeText = this.isDraft ? 'Draft Type' : this.isPickup ? 'Type' : 'Message Type';
    const subjectText = this.isPickup ? 'Message Title' : 'Subject';
    const recipientText = this.isPickup ? 'For Pickup By' : 'Recipient';
    const sendStatusText = this.isPickup ? 'Pickup Status' : 'Send Status';
    return {
      hasVisibleItems: this.hasVisibleItems(),
      typeText,
      subjectText,
      recipientText,
      sendStatusText,
      isPickup: this.isPickup,
    };
  }
});