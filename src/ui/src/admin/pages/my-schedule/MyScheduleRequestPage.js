import Radio from 'backbone.radio';
import React from 'react';
import PageView from '../../../core/components/page/Page';
import ScheduleRequestCollection from '../../components/scheduling/schedule-requests/ScheduleRequest_collection'
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './MyScheduleRequestPage.scss';

const schedulingChannel = Radio.channel('scheduling');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');

const STARTING_ITEM_LOAD_COUNT = 20;
const MyScheduleRequestPage = PageView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['tableView', 'filterToCurrentUser', 'getCurrentFilters']);
    this.scheduleRequestCollection = new ScheduleRequestCollection();
    this.requiredFilters = {
      index: 0, 
      count: STARTING_ITEM_LOAD_COUNT,
      RequestSubmitters: this.filterToCurrentUser ? sessionChannel.request('get:user:id') : [],
    };

    this.loadScheduleRequests({...this.getCurrentFilters(), ...this.requiredFilters})
    .then(() => this.loadPeriods());
  },

  loadPeriods() {
    const requestLoadParams = {
      index: 0,
      count: 999999,
    }
    loaderChannel.trigger('page:load');
    schedulingChannel.request('load:periods', requestLoadParams).finally(() => loaderChannel.trigger('page:load:complete'));
  },

  loadMoreRequests(searchParams=this.getCurrentFilters()) {
    this.requiredFilters = {
      index: 0,
      count: this.scheduleRequestCollection.lastUsedFetchCount + this.scheduleRequestCollection.length,
      RequestSubmitters: this.filterToCurrentUser ? sessionChannel.request('get:user:id') : []
    };

    this.loadScheduleRequests({...this.requiredFilters, ...searchParams})
  },

  loadScheduleRequests(searchParams) {
    searchParams = {...searchParams, ...this.requiredFilters};
    loaderChannel.trigger('page:load');
    const options = { no_cache: true }
    return schedulingChannel.request('load:requests', searchParams, options).then((res) => {
      this.parseScheduleRequestResponseFromApi(searchParams, res);
      this.render();
    })
    .catch(generalErrorFactory.createHandler('SCHEDULE.REQUEST.LOAD'))
    .finally(() => loaderChannel.trigger('page:load:complete'))
  },

  parseScheduleRequestResponseFromApi(searchParams, response={}) {
    if (searchParams.index) this.scheduleRequestCollection.lastUsedFetchIndex = searchParams.index;
    if (searchParams.count) this.scheduleRequestCollection.lastUsedFetchCount = searchParams.count;
    this.scheduleRequestCollection.totalAvailable = response.totalAvailable;
    this.scheduleRequestCollection.reset(response.models, { silent: true });
  },

  className: 'schedule-request',
  regions: {
    myScheduleRequestTable: '.schedule-request__table'
  },


  onRender() {
    this.showChildView('myScheduleRequestTable', new this.tableView({ collection: this.scheduleRequestCollection }));
  },

  template() {
    const hasMoreRequests = this.scheduleRequestCollection.lastUsedFetchCount < this.scheduleRequestCollection.totalAvailable;

    return (
      <div>
        <div className="schedule-request__table"></div>
        <div className="hidden-print">
          {hasMoreRequests ? 
          <div className="schedule-request__show-more" onClick={() => this.loadMoreRequests()}>Show more</div>
          :
          <div className="all-disputes hidden-print">All results displayed</div>
          }
        </div>
      </div>
    );
  },
});

_.extend(MyScheduleRequestPage.prototype, ViewJSXMixin);
export { MyScheduleRequestPage }