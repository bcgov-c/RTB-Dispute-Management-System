import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalEditHearingView from '../../components/hearing/modals/modal-edit-hearing/ModalEditHearing';
import HearingModel from '../../../core/components/hearing/Hearing_model';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const modalChannel = Radio.channel('modals');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const HistoryScheduleListItem = Marionette.View.extend({
  template: _.template(`
    <div class="history-schedule-change-date"><%= Formatter.toDateAndTimeDisplay(created_date) %></div>
    <div class="history-schedule-change-by"><%= changeByName %></div>
    <div class="history-schedule-change"><%= changeTypeDisplay %></div>
    <div class="history-schedule-hearing-id"><%= hearing_id || '-' %><%= hearing_id && !isHearingDeleted ? ' - <span class="general-link">'+(isHearingSearchType ? 'view' : 'hist')+'</span>' : '' %></div>
    <div class="history-schedule-priority history-schedule-priority<%= hearing_priority || '0' %>"><%= priorityDisplay %></div>
    <div class="history-schedule-owner"><%= ownerName %></div>
    <div class="history-schedule-hearing-start"><%= Formatter.toDateAndTimeDisplay(local_start_datetime, timezoneString) %></div>
    <div class="history-schedule-file-number"><%= file_number && dispute_guid ? '<a href="#'+disputeNavigationUrl+'">'+$.trim(file_number)+'</a>' : (file_number || '-') %></div>
    <div class="history-schedule-role"><%= roleDisplay %></div>
    <div class="history-schedule-link"><%= linkTypeDisplay %></div>
  `),

  className: 'history-schedule-list-item standard-list-item',

  ui: {
    viewHearing: '.history-schedule-hearing-id > span'
  },

  events: {
    'click @ui.viewHearing': 'clickViewHearing'
  },

  clickViewHearing() {
    const hearingId = this.model.get('hearing_id');
    if (this.isHearingSearchType) {
      this.showModalViewHearing(hearingId);
    } else {
      this.routeToHearingHistory(hearingId);
    }
  },

  routeToHearingHistory(hearingId) {
    Backbone.history.navigate(routeParse('scheduled_hearings_history_param_item', null, hearingId), { trigger: true });
  },

  showModalViewHearing(hearingId) {
    loaderChannel.trigger('page:load');
    const hearingModel = new HearingModel({ hearing_id: hearingId });
    hearingModel.fetch()
      .then(() => {
        loaderChannel.trigger('page:load:complete');
        modalChannel.request('add', new ModalEditHearingView({ viewOnly: true, model: hearingModel }));
      }, err => {
        err = err || {};
        loaderChannel.trigger('page:load:complete');
        
        if (err && err.status === 404) {
          modalChannel.request('show:standard', {
            title: 'Hearing Not Found',
            bodyHtml: `The hearing with ID ${hearingId} cannot not be found.  This is usually an indication that the hearing has been deleted.`,
            hideCancelButton: true,
            primaryButtonText: 'Close',
            onContinueFn(modalView) { modalView.close(); }
          });
        } else {  
          const handler = generalErrorFactory.createHandler('ADMIN.HEARING.LOAD');
          handler(err);
        }
      });
  },

  initialize(options) {
    this.mergeOptions(options, ['isHearingSearchType']);
  },

  templateContext() {
    const timezoneString = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const hearingId = this.model.get('hearing_id');
    return {
      Formatter,
      timezoneString,
      isHearingSearchType: this.isHearingSearchType,
      // Check this change and all changes returned to see if any hearings were deleted. If so, then hide the view button for all
      isHearingDeleted: this.model.collection ? this.model.collection.any(m => hearingId && hearingId === m.get('hearing_id') && m.isChangeTypeDelete())
        : this.model.isChangeTypeDelete(),
      changeByName: userChannel.request('get:user:name', this.model.get('created_by')),
      priorityDisplay: this.model.getPriorityDisplay(),
      ownerName: userChannel.request('get:user:name', this.model.get('hearing_owner')),
      disputeNavigationUrl: $.trim(routeParse('overview_item', this.model.get('dispute_guid'))),
      changeTypeDisplay: this.model.getChangeTypeDisplay(),
      roleDisplay: this.model.getRoleDisplay(),
      linkTypeDisplay: this.model.getSharedHearingLinkTypeDisplay(),
    };
  }
});

const EmptySearchView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No history results found</div>`)
});

const HistoryScheduleCollectionView = Marionette.CollectionView.extend({
  childView: HistoryScheduleListItem,
  emptyView: EmptySearchView,
  childViewOptions() {
    return {
      isHearingSearchType: this.searchType && this.searchType === this._SCHEDULING_SEARCH_TYPE_HEARING
    };
  },

  filter(model) {
    return !(this._SYSTEM_ARB_ID && model.get('hearing_owner') === this._SYSTEM_ARB_ID);
  },

  initialize(options) {
    this.mergeOptions(options, ['searchType']);
    this._SCHEDULING_SEARCH_TYPE_HEARING = configChannel.request('get', 'SCHEDULING_SEARCH_TYPE_HEARING');
    this._SYSTEM_ARB_ID = userChannel.request('get:system:arb:id');
  }
});

export default Marionette.View.extend({
  template: _.template(
    `<div class="history-schedule-list-header">
      <div class="history-schedule-change-date">Date of Action</div>
      <div class="history-schedule-change-by">Action By</div>
      <div class="history-schedule-change">Change</div>
      <div class="history-schedule-hearing-id">Hearing ID</div>
      <div class="history-schedule-priority">Priority</div>
      <div class="history-schedule-owner">Assigned To</div>
      <div class="history-schedule-hearing-start">Hearing Start</div>
      <div class="history-schedule-file-number">File Number</div>
      <div class="history-schedule-role">Role</div>
      <div class="history-schedule-link">Link Type</div>
    </div>
    <div class="history-schedule-list-items"></div>`
  ),

  className: 'history-schedule-list',

  regions: {
    listRegion: '.history-schedule-list-items'
  },

  initialize(options) {
    this.mergeOptions(options, ['collection', 'searchType']);
  },

  onRender() {
    this.showChildView('listRegion', new HistoryScheduleCollectionView({ searchType: this.searchType, collection: this.collection }));
  }

});
