import Marionette from 'backbone.marionette';

import NoticeServiceListItem from './DANoticeServiceListItem';

const EmptyNoticeServiceItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">A dispute notice has not been generated yet.</div>`)
});

const NoticeServiceListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: NoticeServiceListItem,
  emptyView: EmptyNoticeServiceItemView,

  childViewOptions() {
    return { appModel: this.model };
  },   


  initialize(options) {
    _.extend(this.options, {}, options);   
  },  

});


export default Marionette.View.extend({
  template: _.template(`<div class="standard-list-items"></div>`),
  className: 'standard-list',

  regions: {
    noticeServiceList: '.standard-list-items'
  },

  initialize(options) {
    _.extend(this.options, {}, options);

  },

  onRender() {
    this.showChildView('noticeServiceList', new NoticeServiceListView(this.options));
  }
})