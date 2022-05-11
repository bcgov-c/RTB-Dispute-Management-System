import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ScheduleRequestModel from '../../components/scheduling/schedule-requests/ScheduleRequest_model';
import MyScheduleRequestModal from './MyScheduleRequestModal';
import GarbageCanIcon from '../../static/Icon_AdminPage_Delete.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

const EmptyMyScheduleItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No schedule available.</div>`)
});

const MyScheduleItem = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  getViewMode() {
    const requestStatus = this.model.get('request_status');
    const isAfterStartDate = Moment(this.model.get('request_start')).isAfter(Moment())
    const unprocessed = configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED');
    const returned = configChannel.request('get', 'SCHED_REQ_STATUS_RETURNED_FOR_CLARIFICATION');

    if (isAfterStartDate && (requestStatus === unprocessed || requestStatus === returned)) {
      return 'edit';
    } else {
      return 'view';
    }
  },

  openScheduleRequestModal() {//get newest state of schedule request model before opening modal
    this.loadScheduleRequest()
    .then(scheduleRequestModel => { 
      this.model = new ScheduleRequestModel(scheduleRequestModel);
      const viewMode = this.getViewMode();
      const scheduleRequestModal = new MyScheduleRequestModal({
        model: this.model,
        viewMode
      });
      modalChannel.request('add', scheduleRequestModal);
      this.listenTo(scheduleRequestModal, 'removed:modal', this.render, this);
     })
    .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  deleteRequest() {
    modalChannel.request('show:standard', {
      title: 'Delete Schedule Request',
      bodyHtml: `<p>
        Are you sure you want to delete this schedule request?
      </p>`,
      primaryButtonText: 'Delete Request',
      onContinueFn: (modalView) => {
        loaderChannel.trigger('page:load');
        const deleteRequestPromise = new Promise((res, rej) => this.model.destroy().done(res).fail(generalErrorFactory.createHandler('SCHEDULE.REQUEST.DELETE', rej)))
        deleteRequestPromise.then(() => {
          this.collection.trigger('deleted:request', this.model);
        }).finally(() => {
          loaderChannel.trigger('page:load:complete')
          modalView.close();
        });
      }
    });
  },

  loadScheduleRequest() {
    loaderChannel.trigger('page:load');
    return new Promise((res, rej) => this.model.fetch().done(res).fail(generalErrorFactory.createHandler('SCHEDULE.REQUEST.LOAD', rej)))
  },

  template() {
    const createdDate = this.model.get('created_date') ? Formatter.toDateAndTimeDisplay(this.model.get('created_date')) : '-';
    const requestType = this.model.get('request_type') ? configChannel.request('get', 'SCHEDULE_REQUEST_TYPE_DISPLAY')[this.model.get('request_type')] : '-';
    const requestStatus = this.model.get('request_status') ? Formatter.toScheduleRequestStatusDisplay(this.model.get('request_status')) : '-';
    const requestOwner = this.model.get('request_owner') ?  userChannel.request('get:user:name', this.model.get('request_owner')) : '-';
    const requestStartDate = this.model.get('request_start') ? Formatter.toDateAndTimeDisplay(this.model.get('request_start')) : '-';
    const requestEndDate = this.model.get('request_end') ? Formatter.toDateAndTimeDisplay(this.model.get('request_end')) : '-';
    const duration = this.model.get('request_start') &&  this.model.get('request_end') ? Formatter.toDurationFromSecs(Moment(this.model.get('request_end')).diff(Moment(this.model.get('request_start')), 'seconds')) : '-';
    const viewMode = this.getViewMode();

    return (
      <div className="standard-list-item">
        <div className="schedule-request__created-column">{createdDate}</div>
        <div className="schedule-request__type-column">{requestType}</div>
        <div className="schedule-request__status-column">{requestStatus}</div>
        <div className="schedule-request__owner-column">{requestOwner}</div>
        <div className="schedule-request__start-column">{requestStartDate}</div>
        <div className="schedule-request__end-column">{requestEndDate}</div>
        <div className="schedule-request__duration-column">{duration}</div>
        <div className="schedule-request__edit-column">
          <a className="schedule-request__edit-column__link" onClick={() => this.openScheduleRequestModal()}>{viewMode}</a>
          { viewMode === 'edit' ? <img className="schedule-request__delete" onClick={() => this.deleteRequest()}src={GarbageCanIcon}/> : null }
        </div>
      </div>
    )
  }
});

_.extend(MyScheduleItem.prototype, ViewJSXMixin);

const ScheduleListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: MyScheduleItem,
  emptyView: EmptyMyScheduleItemView,

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
    this.listenTo(this.collection, 'deleted:request', (model) => {
      this.collection.remove(model)
      this.render();
    });
  },

  onRender() {
    this.showChildView('myScheduleList', new ScheduleListView(this.options))
  },

  template() {
    return (
      <>
        <div className="standard-list-header schedule-request__table-header">
          <div className="schedule-request__created-column">Request Created</div>
          <div className="schedule-request__type-column">Request Type</div>
          <div className="schedule-request__status-column">Request Status</div>
          <div className="schedule-request__owner-column">Request Owner</div>
          <div className="schedule-request__start-column">Request Start</div>
          <div className="schedule-request__end-column">Request End</div>
          <div className="schedule-request__duration-column">Duration</div>
          <div className="schedule-request__edit-column"></div>
        </div>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(MyScheduleTable.prototype, ViewJSXMixin);
export default MyScheduleTable