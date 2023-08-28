import React from 'react';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import HearingModel from '../../../core/components/hearing/Hearing_model';
import ModalEditHearingView from '../../components/hearing/modals/modal-edit-hearing/ModalEditHearing';
import HearingCollection from '../../../core/components/hearing/Hearing_collection';
import { routeParse } from '../../routers/mainview_router';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './ScheduleHoldHearings.scss';

const Formatter = Radio.channel('formatter').request('get');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');

const DEFAULT_LOADER_COUNT = 20;

const EmptyMyScheduleItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No schedule available.</div>`)
});

const MyScheduleItem = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  clickHearingId() {
    const hearingId = this.model.get('hearing_id');
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

  clickFileNumber() {
    Backbone.history.navigate(routeParse('overview_item', this.model.get('hearing_reserved_dispute_guid')), { trigger: true });
  },

  getCountdownTime() {
    const reservedUntil = this.model.get('hearing_reserved_until');
    const currentDate = Moment();

    const dateDifference = Moment(reservedUntil).diff(currentDate, 'seconds');
    const isLate = dateDifference < 0 ? true : false;
    const options = { no_minutes: true };
    
    const timeDifference = Formatter.toDurationFromSecs(Math.abs(dateDifference), options);

    return isLate ? `Late -${timeDifference}` :  `${timeDifference}`;
  },

  template() {
    const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const hearingId = this.model.get('hearing_id') ? this.model.get('hearing_id') : '-';
    const priority = this.model.get('hearing_priority') ? Formatter.toUrgencyDisplay(this.model.get('hearing_priority'), { urgencyColor: true } ) : '-';
    const assignedTo = this.model.get('hearing_owner') ? Formatter.toUserDisplay(this.model.get('hearing_owner')) : '-';
    const hearingStart = this.model.get('hearing_start_datetime') ? Formatter.toDateAndTimeDisplay(Moment.tz(this.model.get('hearing_start_datetime'), RTB_OFFICE_TIMEZONE_STRING)) : '-';
    const fileNumber = this.model.get('hearing_reserved_file_number') ? this.model.get('hearing_reserved_file_number') : '-';
    const holdUntil = this.model.get('hearing_reserved_until') ? Formatter.toDateAndTimeDisplay(Moment.tz(this.model.get('hearing_reserved_until'), RTB_OFFICE_TIMEZONE_STRING)) : '-';
    const countdownTime = this.model.get('hearing_reserved_until') ? ` - ${this.getCountdownTime()}` : nulll;
    return (
      <div className="standard-list-item">
        <div className="schedule-hold-hearings__hearing-id">{hearingId} - <span className="general-link" onClick={() => this.clickHearingId()}>view</span></div>
        <div className="schedule-hold-hearings__priority" dangerouslySetInnerHTML={{ __html: priority }}></div>
        <div className="schedule-hold-hearings__assigned-to">{assignedTo}</div>
        <div className="schedule-hold-hearings__hearing-start">{hearingStart}</div>
        <div className="schedule-hold-hearings__file-number"><span className={`${this.model.get('hearing_reserved_file_number') ? 'general-link' : '' }`} onClick={() => this.clickFileNumber()}>{fileNumber}</span></div>
        <div className="schedule-hold-hearings__hold-until">{holdUntil}{countdownTime}</div>
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

const ScheduleHoldHearingsTable = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
  },

  onRender() {
    this.showChildView('holdHearingsList', new ScheduleListView(this.options))
  },

  regions: {
    holdHearingsList: '.standard-list-items'
  },

  template() {
    return (
      <div className="schedule-hold-hearings">
        <div className="standard-list-header schedule-hold-hearings__table-header">
          <div className="schedule-hold-hearings__hearing-id">Hearing ID</div>
          <div className="schedule-hold-hearings__priority">Priority</div>
          <div className="schedule-hold-hearings__assigned-to">Assigned To</div>
          <div className="schedule-hold-hearings__hearing-start">Hearing Start</div>
          <div className="schedule-hold-hearings__file-number">File Number</div>
          <div className="schedule-hold-hearings__hold-until">On Hold Until</div>
        </div>
        <div className="standard-list-items"></div>
      </div>
    );
  },
});

_.extend(ScheduleHoldHearingsTable.prototype, ViewJSXMixin);

const ScheduleHoldHearings = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.count = DEFAULT_LOADER_COUNT
    this.holdHearingsCollection = new HearingCollection();
    this.totalRecordAmount = 0;

    this.requiredFilters = {
      index: 0, 
      count: this.count,
      minHearingStartTime: Moment.tz(Moment(), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING')),
    };

    this.loadOnHoldHearings(this.requiredFilters);
  },

  loadOnHoldHearings(searchParams) {
    loaderChannel.trigger('page:load');
    return hearingChannel.request('load:onholdhearings', searchParams).then((res) => {
      this.holdHearingsCollection = new HearingCollection(res?.available_hearings);
      this.holdHearingsCollection.comparator = 'local_start_datetime';
      this.holdHearingsCollection.sort();
      this.totalRecordAmount = res?.total_available_records;
      this.render();
    }).finally(() => loaderChannel.trigger('page:load:complete'));
  },

  showMore() {
    this.count = this.count + DEFAULT_LOADER_COUNT;
    this.requiredFilters.count = this.count;
    this.loadOnHoldHearings(this.requiredFilters);
  },

  regions: {
    scheduleHoldHearingsTable: '.schedule-hold-hearings-table',
  },

  onRender() {
    this.showChildView('scheduleHoldHearingsTable', new ScheduleHoldHearingsTable({ collection: this.holdHearingsCollection, }));
  },

  template() {
    return <>
      <div className="schedule-hold-hearings-table"></div>
      { this.renderJsxShowMore() }
    </>
    
  },

  renderJsxShowMore() {
    if (this.count < this.totalRecordAmount) return <div className="show-more-disputes hidden-print" onClick={() => this.showMore()}>Show more</div>;
    
    return <div className="all-disputes hidden-print">All results displayed</div>;
  }
});

_.extend(ScheduleHoldHearings.prototype, ViewJSXMixin);
export default ScheduleHoldHearings;