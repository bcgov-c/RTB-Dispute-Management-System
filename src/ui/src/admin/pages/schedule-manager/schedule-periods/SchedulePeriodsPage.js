import Radio from 'backbone.radio';
import React from 'react';
import Marionette from 'backbone.marionette';
import SchedulePeriodsTable from './SchedulePeriodsTable';
import SchedulePeriodCollection from '../../../components/scheduling/schedule-periods/SchedulePeriod_collection';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const schedulingChannel = Radio.channel('scheduling');
const loaderChannel = Radio.channel('loader');

const STARTING_ITEM_LOAD_COUNT = 20;

const SchedulePeriodsPage = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['initFilters']);
    this.schedulePeriodsCollection = new SchedulePeriodCollection();
    this.defaultFilters = {
      index: 0, 
      count: STARTING_ITEM_LOAD_COUNT,
      AfterPeriodEndingDate: Moment().toISOString()
    };

    this.loadSchedulePeriods({...this.initFilters, ...this.defaultFilters});
  },

  loadMorePeriods(searchParams) {
    const options = {
      index: 0,
      count: this.schedulePeriodsCollection.lastUsedFetchCount + this.schedulePeriodsCollection.length,
    };

    this.loadSchedulePeriods({...options, ...searchParams})
  },

  loadSchedulePeriods(searchParams) {
    searchParams = {...this.defaultFilters, ...searchParams};

    loaderChannel.trigger('page:load');
    return schedulingChannel.request('load:periods', searchParams).then((res) => {
      this.parseScheduleRequestResponseFromApi(searchParams, res);
      console.log('schedule periods: ', res);
      this.render();
    })
    .catch(generalErrorFactory.createHandler('SCHEDULE.PERIODS.LOAD'))
    .finally(() => loaderChannel.trigger('page:load:complete'))
  },

  parseScheduleRequestResponseFromApi(searchParams, response={}) {
    if (searchParams.index) this.schedulePeriodsCollection.lastUsedFetchIndex = searchParams.index;
    if (searchParams.count) this.schedulePeriodsCollection.lastUsedFetchCount = searchParams.count;
    this.schedulePeriodsCollection.totalAvailable = response.totalAvailable;
    this.schedulePeriodsCollection.reset(response.models, { silent: true });
  },

  onRender() {
    this.showChildView('schedulePeriodsTable', new SchedulePeriodsTable({ collection: this.schedulePeriodsCollection }));
  },

  regions: {
    schedulePeriodsTable: '.schedule-manager-periods__table'
  },

  template() {
    const hasMoreRequests = this.schedulePeriodsCollection.lastUsedFetchCount < this.schedulePeriodsCollection.totalAvailable;;
    return (
      <div>
        <div className="schedule-manager-periods__table"></div>
        <div className="">
          {hasMoreRequests ? 
          <div className="schedule-request__show-more" onClick={() => this.loadMorePeriods()}>Show more</div>
          :
          <div className="all-disputes hidden-print">All results displayed</div>
          }
        </div>
    </div>
    );
  }
});

_.extend(SchedulePeriodsPage.prototype, ViewJSXMixin);
export { SchedulePeriodsPage }