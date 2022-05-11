import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ScheduleRequestModel from '../../../components/scheduling/schedule-requests/ScheduleRequest_model';
import ModalScheduleRequest from '../../../components/scheduling/schedule-requests/ModalScheduleRequest';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import './ScheduleManagerRequestsTable.scss';

const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

const EmptyScheduleItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No schedule available.</div>`)
});

const ScheduleRequestItem = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  openScheduleRequestModal() {
    //get newest state of schedule request model before opening modal
    this.loadScheduleRequest()
      .then(scheduleRequestModel => { 
        this.model = new ScheduleRequestModel(scheduleRequestModel);
        const scheduleRequestModal = new ModalScheduleRequest({
          model: this.model,
        });
        modalChannel.request('add', scheduleRequestModal);
        this.listenTo(scheduleRequestModal, 'removed:modal', () => {
          loaderChannel.trigger('page:load');
          this.render();
          this.collection.trigger('update:view');
        });
      }).finally(() => loaderChannel.trigger('page:load:complete'))
  },

  loadScheduleRequest() {
    loaderChannel.trigger('page:load');
    return new Promise((resolve, reject) => {
      this.model.fetch()
        .then((res) => resolve(res))
        .catch(reject);
    });
  },

  template() {
    const createdDate = this.model.get('created_date') ? Formatter.toDateAndTimeDisplay(this.model.get('created_date')) : '-';
    const requestType = this.model.get('request_type') ? configChannel.request('get', 'SCHEDULE_REQUEST_TYPE_DISPLAY')[this.model.get('request_type')] : '-';
    const requestStatus = this.model.get('request_status') ? Formatter.toScheduleRequestStatusDisplay(this.model.get('request_status')) : '-';
    const requestOwner = this.model.get('request_owner') ?  userChannel.request('get:user:name', this.model.get('request_owner')) : '-';
    const requestSubmitter = this.model.get('request_submitter') ?  userChannel.request('get:user:name', this.model.get('request_submitter')) : '-';
    const requestStartDate = this.model.get('request_start') ? Formatter.toDateAndTimeDisplay(this.model.get('request_start')) : '-';
    const requestEndDate = this.model.get('request_end') ? Formatter.toDateAndTimeDisplay(this.model.get('request_end')) : '-';
    const duration = this.model.get('request_start') &&  this.model.get('request_end') ? Formatter.toDurationFromSecs(Moment(this.model.get('request_end')).diff(Moment(this.model.get('request_start')), 'seconds')) : '-';
    
    return (
      <div className="standard-list-item">
        <div className="schedule-manager-request__created-column">{createdDate}</div>
        <div className="schedule-manager-request__type-column">{requestType}</div>
        <div className="schedule-manager-request__submitter-column">{requestSubmitter}</div>
        <div className="schedule-manager-request__status-column">{requestStatus}</div>
        <div className="schedule-manager-request__owner-column">{requestOwner}</div>
        <div className="schedule-manager-request__start-column">{requestStartDate}</div>
        <div className="schedule-manager-request__end-column">{requestEndDate}</div>
        <div className="schedule-manager-request__duration-column">{duration}</div>
        <div className="schedule-manager-request__edit-column hidden-print">
          <a className="schedule-manager-request__edit-column__link" onClick={() => this.openScheduleRequestModal()}>view</a>
        </div>
      </div>
    )
  }
});

_.extend(ScheduleRequestItem.prototype, ViewJSXMixin);

const ScheduleListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ScheduleRequestItem,
  emptyView: EmptyScheduleItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index
    }
  }
});

const MyScheduleTable = Marionette.View.extend({
  regions: {
    myScheduleList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);
  },

  onRender() {
    this.showChildView('myScheduleList', new ScheduleListView(this.options))
  },

  template() {
    return (
      <>
        <div className="standard-list-header schedule-manager-request__table-header">
          <div className="schedule-manager-request__created-column schedule-manager-request__created-column__header">Request Created</div>
          <div className="schedule-manager-request__type-column schedule-manager-request__type-column__header">Request Type</div>
          <div className="schedule-manager-request__submitter-column">Requested By</div>
          <div className="schedule-manager-request__status-column">Request Status</div>
          <div className="schedule-manager-request__owner-column">Request Owner</div>
          <div className="schedule-manager-request__start-column">Request Start</div>
          <div className="schedule-manager-request__end-column">Request End</div>
          <div className="schedule-manager-request__duration-column">Duration</div>
          <div className="schedule-manager-request__edit-column"></div>
        </div>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(MyScheduleTable.prototype, ViewJSXMixin);
export default MyScheduleTable