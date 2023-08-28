import Backbone from 'backbone';
import React from 'react';
import Radio from 'backbone.radio';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import PageView from '../../../core/components/page/Page';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import Checkbox_model from '../../../core/components/checkbox/Checkbox_model';
import Checkbox from '../../../core/components/checkbox/Checkbox';
import MyScheduleRequestModal from '../my-schedule/MyScheduleRequestModal';
import ScheduleManagerRequestsTable from './schedule-requests/ScheduleManagerRequestsTable';
import { MyScheduleRequestPage } from '../my-schedule/MyScheduleRequestPage';
import { SchedulePeriodsPage } from './schedule-periods/SchedulePeriodsPage';
import WorkingScheduleView from './working-schedule/WorkingSchedule';
import { routeParse } from '../../routers/mainview_router';
import './schedule-manager.scss';
import HeaderImg from '../../static/Icon_Header_CommonFiles.png';
import BulkAddImg from '../../static/Icon_WS_BulkAdd.png';
import HearingGenerationImg from '../../static/Icon_WS_Generate.png'
import AddSMIcon from '../../static/Icon_AdminPage_AddSMReq.png';

const MANAGER_CODE_ALL = '0';
const TYPE_CODE_PERIODS = '1';
const TYPE_CODE_REQUESTS = '2';
const TYPE_CODE_SCHEDULE = '3';
const REQUEST_STATUS_DEFAULT_CODE = '-1';
const RADIO_CODE_FUTURE_PERIODS = 1;
const RADIO_CODE_ACTIVE_PERIODS = 2;
const RADIO_CODE_INACTIVE_PERIODS = 3;

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const userChannel = Radio.channel('users');
const schedulingChannel = Radio.channel('scheduling');
const menuChannel = Radio.channel('menu');
const modalChannel = Radio.channel('modals');

const ScheduleManagerPage = PageView.extend({
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['initialPeriodId', 'working', 'periods']);

    this.userList = userChannel.request('get:all:users');

    this.createSubModels();
    this.setupListeners();

    this.loadAllScheduleRequests().then(allScheduleRequests => {
      this.allScheduleRequests = allScheduleRequests;
      this.render();
    })
  },

  createSubModels() {
    const defaultScheduleRequestRoute = routeParse('schedule_manager_requests_item');
    const isRoutingToScheduleRequests = Backbone.history.getFragment() === defaultScheduleRequestRoute;

    const typeValue = this.working ? TYPE_CODE_SCHEDULE :
      this.periods ? TYPE_CODE_PERIODS :
      isRoutingToScheduleRequests ? TYPE_CODE_REQUESTS :
      this.model.get('_scheduleManagerPageData')?.viewType ? this.model.get('_scheduleManagerPageData')?.viewType : 
      TYPE_CODE_REQUESTS;

    this.viewTypeModel = new DropdownModel({
      labelText: '',
      optionData: [{ value: TYPE_CODE_PERIODS, text: 'Schedule Periods', },
        { value: TYPE_CODE_REQUESTS, text: 'Schedule Requests', },
        { value: TYPE_CODE_SCHEDULE, text: 'Working Schedule', }],
      defaultBlank: false,
      value: typeValue
    });

    this.createWorkingScheduleModels();
    this.createSchedulePeriodsModels();
    this.createScheduleRequestModels();
  },

  createWorkingScheduleModels() {
    const arbs = userChannel.request('get:arbs', { all: true });
    const activeManagerIds = arbs.map(u => u.getManagedById()).filter(id => id);
    const activeManagerUsers = arbs.filter(user => activeManagerIds.indexOf(user.id) !== -1);

    const dropdownOptions = _.sortBy(
      activeManagerUsers.map(arbitrator => ({
        text: `${Formatter.toUserLevelDisplay(arbitrator)}: ${!arbitrator.isActive()?'** ':''}${arbitrator.getDisplayName()}`, value: String(arbitrator.id), isActive: arbitrator.isActive()
      })),
      // Sort function
      (option) => ((option.isActive && option.text) || 'zzzz').toLowerCase()
    );

    this.managedByModel = new DropdownModel({
      labelText: '',
      optionData: [
        { value: MANAGER_CODE_ALL, text: 'Show all - no filter', },
        ...(dropdownOptions)
      ],
      defaultBlank: false,
      value: this.model.get('_scheduleManagerPageData')?.managedBy || MANAGER_CODE_ALL
    });

    this.inactiveModel = new Checkbox_model({
      html: 'Include inactive staff (**)',
      checked: !!this.model.get('showInactiveUsers')
    });
  },

  createSchedulePeriodsModels() {
    const cachedPeriodData = this.model.get('_scheduleManagerPageData');
    this.periodTypeFilter = new RadioModel({
      optionData: this._getPeriodTypeOptions(),
      value: cachedPeriodData?.periodType || RADIO_CODE_ACTIVE_PERIODS,
    });
  },

  createScheduleRequestModels() {
    const scheduleManagerData = this.model.get('_scheduleManagerPageData');

    this.requestStartingDateModel = new InputModel({
      inputType: 'date',
      value: scheduleManagerData?.requestStarting || null,
      allowFutureDate: true,
    });

    this.ownerDropdownModel = new DropdownModel({
      optionData: this._getOwnerList(),
      value: scheduleManagerData?.owner || null
    });
  
    this.requestStatusDropdownModel = new DropdownModel({
      optionData: this._getScheduleStatusFilterOptions(),
      value: scheduleManagerData?.requestStatus || REQUEST_STATUS_DEFAULT_CODE
    });

    this.requestTypesDropdownModel = new DropdownModel({
      optionData: this._getScheduleRequestTypes(),
      value: scheduleManagerData?.requestType || null
    });
    
    const managerOptions = this._getSubmitterManagerList();
    this.requestSubmitterManagerDropdownModel = new DropdownModel({
      optionData: managerOptions,
      value: scheduleManagerData?.requestSubmitter || MANAGER_CODE_ALL,
    });
  },

  _getPeriodTypeOptions() {
    const activeStatus = configChannel.request('get', "SCHED_PERIOD_STATUS_ACTIVE");
    const inactiveStatus = configChannel.request('get', "SCHED_PERIOD_STATUS_INACTIVE");
    const lockedGenStatus = configChannel.request('get', "SCHED_PERIOD_STATUS_LOCKED_GENERATION");
    const lockedPrepStatus = configChannel.request('get', "SCHED_PERIOD_STATUS_LOCKED_PREP");
    const lockedRebalanceStatus = configChannel.request('get', "SCHED_PERIOD_STATUS_LOCKED_REBALANCE");

    return [
      { value: RADIO_CODE_ACTIVE_PERIODS, text: 'All Future Periods', _filterOptions: { ContainsPeriodStatuses: [] } },
      { value: RADIO_CODE_FUTURE_PERIODS, text: 'Active (in use) Only', _filterOptions: { ContainsPeriodStatuses: [activeStatus] } },
      { value: RADIO_CODE_INACTIVE_PERIODS, text: 'Inactive (locked) Only', _filterOptions: { ContainsPeriodStatuses: [inactiveStatus, lockedGenStatus, lockedPrepStatus, lockedRebalanceStatus] } }
    ]
  },

  setupListeners() {
    this.listenTo(this.viewTypeModel, 'change:value', () => {
      loaderChannel.trigger('page:load');
      this.render();
    });

    this.listenTo(this.inactiveModel, 'change:checked', (model, checked) => {
      this.model.set('showInactiveUsers', !!checked);
      loaderChannel.trigger('page:load');
      this.render();
    });
    this.listenTo(this.managedByModel, 'change:value', () => {
      loaderChannel.trigger('page:load');
      this.render();
    });

    this.listenTo(this.requestStartingDateModel, 'change:value', this.filterScheduleRequestsAndLoad, this);
    this.listenTo(this.ownerDropdownModel, 'change:value', this.filterScheduleRequestsAndLoad, this);
    this.listenTo(this.requestStatusDropdownModel, 'change:value', this.filterScheduleRequestsAndLoad, this);
    this.listenTo(this.requestTypesDropdownModel, 'change:value', this.filterScheduleRequestsAndLoad, this);
    this.listenTo(this.requestSubmitterManagerDropdownModel, 'change:value', this.filterScheduleRequestsAndLoad, this);
    this.listenTo(this.periodTypeFilter, 'change:value', this.filterSchedulePeriodsAndLoad, this);

    this.listenTo(this.model, 'enable:bulk', () => this.getUI('bulkAddBtn').removeClass('hidden-item'));
    this.listenTo(this.model, 'disable:bulk', () => this.getUI('bulkAddBtn').addClass('hidden-item'));

    this.listenTo(this.model, 'update:period', (periodId) => {
      this.initialPeriodId = periodId;
      this._updateRouting('schedule_manager_working_param_item', this.initialPeriodId);
    });
  },

  _updateRouting(routingItemId, optionalParam=null) {
    const parsedRoute = routeParse(routingItemId, null, optionalParam);
    Backbone.history.navigate(parsedRoute, { trigger: false, replace: false });
  },

  getScheduleRequestFilters() {
    if (!this.isRequestsSelected()) return;

    const ownerFilterValue = this.ownerDropdownModel.getSelectedOption().requestOwners;
    const statusFilterValue = this.requestStatusDropdownModel.getSelectedOption().statusIn;
    const typeFilterValue = this.requestTypesDropdownModel.getSelectedOption().requestType;
    const submitterFilterValue = this.requestSubmitterManagerDropdownModel.getSelectedOption().requestSubmitters

    const options = {};
    _.extend(options, 
      this.requestStartingDateModel.getData() ? { RequestStartAfter: this.requestStartingDateModel.getData() } : null,
      ownerFilterValue ? { RequestOwners: ownerFilterValue } : null, //--> Used to filter the schedule request view to show specific owners, (1) all owners (2) list of users with user management rights
      statusFilterValue ? { StatusIn: statusFilterValue } : null,
      typeFilterValue ? { RequestType: typeFilterValue } : null,
      submitterFilterValue ? { requestSubmitters : submitterFilterValue } : null,
    )

    return options;
  },

  filterScheduleRequestsAndLoad() {
    const scheduleRequestView = this.getChildView('subViewRegion');
    const filterOptions = this.getScheduleRequestFilters();
    this.cacheScheduleRequestState();
    
    return scheduleRequestView.loadScheduleRequests(filterOptions);
  },

  cacheScheduleRequestState() {
    this.model.set('_scheduleManagerPageData', {
      ...this.model.get('_scheduleManagerPageData'),
      ...{
        requestStarting: this.requestStartingDateModel.getData(),
        owner: this.ownerDropdownModel.getData(),
        requestStatus: this.requestStatusDropdownModel.getData(),
        requestType: this.requestTypesDropdownModel.getData(),
        requestSubmitter: this.requestSubmitterManagerDropdownModel.getData(),
      }
    })
  },

  cachePeriodState() {
    this.model.set('_scheduleManagerPageData', {
      ...this.model.get('_scheduleManagerPageData'),
      ...{ periodType: this.periodTypeFilter.getData() }
    });
  },

  loadRequestCount() {
    return this.loadAllScheduleRequests().then(allScheduleRequests => {
      this.allScheduleRequests = allScheduleRequests;
      menuChannel.trigger('update:item:count', ['schedule_manager_item'], this.getActiveRequestCount());
    });
  },

  loadRequestCountAndUpdateText() {
    this.loadRequestCount().then(() => {
      const unprocessedActiveRequestCount = this.getActiveRequestCount();
      const unprocessedInactiveRequestCount = this.getPastActiveRequestsCount();
      this.getUI('requestCount').text(`There are ${unprocessedActiveRequestCount ? `${unprocessedActiveRequestCount} unprocessed active request(s)` : ''}${`${unprocessedActiveRequestCount && unprocessedInactiveRequestCount ? ', and ' : ''}`}
      ${unprocessedInactiveRequestCount ? `${unprocessedInactiveRequestCount} past unprocessed request(s)` : ''}`);
    });
  },

  loadAllScheduleRequests() {
    const fullCount = 999990;
    const scheduleRequestParams = { index: 0, count: fullCount, StatusIn: [configChannel.request('get', 'SCHED_REQ_STATUS_UNPROCESSED'), configChannel.request('get', 'SCHED_REQ_STATUS_APPROVED_NOT_IMPLEMENTED')] }
    return schedulingChannel.request('load:requests', scheduleRequestParams)
  },

  filterSchedulePeriodsAndLoad() {
    const schedulePeriodsView = this.getChildView('subViewRegion');
    const filterOptions = this.periodTypeFilter.getSelectedOption()._filterOptions;
    this.cachePeriodState();
    return schedulePeriodsView.loadSchedulePeriods(filterOptions);
  },

  addSchedulePeriod() {
    loaderChannel.trigger('page:load');
    schedulingChannel.request('create:period')
      .catch(generalErrorFactory.createHandler('SCHEDULE.PERIODS.CREATE'))
      .finally(() => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      });
  },

  clickAddRequest() {
    const scheduleRequestModal = new MyScheduleRequestModal({ isManagerRequest: true });
    modalChannel.request('add', scheduleRequestModal);

    this.listenTo(scheduleRequestModal, 'removed:modal', () => this.render());
  },

  isPeriodSelected() {
    return this.viewTypeModel.getData() === TYPE_CODE_PERIODS;
  },

  isRequestsSelected() {
    return this.viewTypeModel.getData() === TYPE_CODE_REQUESTS;
  },

  isScheduleSelected() {
    return this.viewTypeModel.getData() === TYPE_CODE_SCHEDULE;
  },

  getActiveRequestCount() {
    const unprocessedActiveRequestCount = this.allScheduleRequests?.getActiveRequestsCount();

    return unprocessedActiveRequestCount;
  },

  getPastActiveRequestsCount() {
    const unprocessedRequestCount = this.allScheduleRequests?.getPastActiveRequestsCount();

    return unprocessedRequestCount;
  },

  _getScheduleStatusFilterOptions() {
    const uiFilters = [
      { text: "All Statuses", value: '-2', statusIn: [] },
      { text: "All Requiring Action", value: '-1', statusIn: configChannel.request('get', 'SCHEDULE_REQUEST_ALL_ACTION_STATUSES') }, 
    ];
    const requestStatusDisplayConfig = configChannel.request('get', 'SCHEDULE_REQUEST_STATUS_DISPLAY');
    return [...uiFilters, ...Object.entries(requestStatusDisplayConfig).map( ([value, text]) => ({ value, text, statusIn: value }))];
  },

  _getScheduleRequestTypes() {
   const uiFilter = [
    { text: "All Request Types", value: '-1', requestType: [] }
   ];
   const requestTypesConfig = configChannel.request('get', 'SCHEDULE_REQUEST_TYPE_DISPLAY');
   return [...uiFilter, ...Object.entries(requestTypesConfig).map( ([value, text]) => ({ value: String(value), text, requestType: value }))];
  },

  _getOwnerList() {
    const uiFilter = [{ text: "All Owners", value: "-1", requestOwners: [] }]
    const userScheduleManagerList = this.userList.filter(user => user.get('schedule_manager')).map(obj => {
      return { text: obj.get('name'), value: String(obj.get('user_id')), requestOwners: obj.get('user_id') }
    })

    return [...uiFilter, ...userScheduleManagerList];
  },

  _getSubmitterManagerList() {
    const uiFilter = [
      { text: "All Managers", value: MANAGER_CODE_ALL, requestSubmitters: [] }
    ];

    const managedByUserList = this.userList.filter((user) => user.getRole().get('managed_by_id'));
    const managerList = managedByUserList.filter((value, index, self) => {
      return index === self.findIndex((t) => (
        t.getRole().get('managed_by_id') === value.getRole().get('managed_by_id')
      ))
    });

    const submitterManagerList = managerList.map((manager) => {
      const managedUserIds = managedByUserList.filter(user => user.getRole().get('managed_by_id') === manager.getRole().get('managed_by_id')).map(user => user.id);
      return { text: userChannel.request('get:user:name', manager.getRole().get('managed_by_id')), value: String(manager.getRole().get('managed_by_id')), requestSubmitters: managedUserIds }
    })

    return [...uiFilter, ...submitterManagerList];
  },

  addCalendarScrollFn() {
    this.$el.addCalendarScrollFn(...arguments);
  },

  onRender() {
    this.model.set('_scheduleManagerPageData', { ...this.model.get('_scheduleManagerPageData'), ...{ viewType: this.viewTypeModel.getData(), managedBy: this.managedByModel.getData() } } );
    
    this.showChildView('viewTypeRegion', new DropdownView({ model: this.viewTypeModel }));

    if (this.isPeriodSelected()) this.renderPeriodsView();
    else if (this.isRequestsSelected()) this.renderRequestsView();
    else if (this.isScheduleSelected()) this.renderWorkingScheduleView();
  },

  renderPeriodsView() {
    if (!this.allScheduleRequests) return;
    this._updateRouting('schedule_manager_periods_item');
    const filterOptions = this.periodTypeFilter.getSelectedOption()._filterOptions;
    this.showChildView('subViewRegion', new SchedulePeriodsPage({ initFilters: filterOptions }));
    // Redner reqest filters
    this.showChildView('periodTypeRegion', new RadioView({ model: this.periodTypeFilter }));
  },

  renderRequestsView() {
    if (!this.allScheduleRequests) return;
    this._updateRouting('schedule_manager_requests_item');
    const scheduleRequestsPage = new MyScheduleRequestPage({
      tableView: ScheduleManagerRequestsTable,
      getCurrentFilters: () => this.getScheduleRequestFilters(),
    });
    this.listenToOnce(scheduleRequestsPage.scheduleRequestCollection, 'update:view', () => {
      this.loadRequestCount().finally(() => this.render());
    });

    this.showChildView('subViewRegion', scheduleRequestsPage);

    // Render request filters
    this.showChildView('requestStartingDateRegion', new InputView({ model: this.requestStartingDateModel }));
    this.showChildView('requestOwnerRegion', new DropdownView({ model: this.ownerDropdownModel }));
    this.showChildView('requestStatusRegion', new DropdownView({ model: this.requestStatusDropdownModel }));
    this.showChildView('requestTypesRegion', new DropdownView({ model: this.requestTypesDropdownModel }));
    this.showChildView('requestSubmitterRegion', new DropdownView({ model: this.requestSubmitterManagerDropdownModel }));
  },

  renderWorkingScheduleView() {
    if (this.initialPeriodId) this._updateRouting('schedule_manager_working_param_item', this.initialPeriodId);
    else this._updateRouting('schedule_manager_working_item', this.initialPeriodId);

    const managedById = this.managedByModel.getData({ parse: true });
    const userFilterFn = (user) => {
      return (this.model.get('showInactiveUsers') || user.isActive())
        && (managedById ? user.getManagedById() === managedById : true);
    };
    
    this.showChildView('inactiveUserRegion', new Checkbox({ model: this.inactiveModel }));
    this.showChildView('managedByUserRegion', new DropdownView({ displayTitle: 'Manager', model: this.managedByModel }));
    const workingScheduleView = new WorkingScheduleView({
      model: this.model,
      initialPeriodId: this.initialPeriodId,
      userFilterFn,
      addCalendarScrollFn: this.addCalendarScrollFn,
    })
    this.showChildView('subViewRegion', workingScheduleView);
    this.listenTo(workingScheduleView.calendarModel, 'request:saved', () => this.loadRequestCountAndUpdateText());
  },

  className: `${PageView.prototype.className} sm-page`,

  regions: {
    viewTypeRegion: '.sm-page__view-type',
    subViewRegion: '.sm-page__sub-view',
    requestStartingDateRegion: '.sm-page__schedule-request__filters__filter--date',
    requestOwnerRegion: '.sm-page__schedule-request__filters__filter--owner',
    requestStatusRegion: '.sm-page__schedule-request__filters__filter--status',
    requestTypesRegion: '.sm-page__schedule-request__filters__filter--types',
    requestSubmitterRegion: '.sm-page__schedule-request__filters__filter--submitter',
    periodTypeRegion: '.sm-page__schedule-periods__type-filter',

    inactiveUserRegion: '.sm-page__working-sched__filters__inactive',
    managedByUserRegion: '.sm-page__working-sched__filters__managed-by',
  },

  ui: {
    bulkAddBtn: '.sm-page__working-sched__bulk-add-blocks',
    startingDate: '.sm-page__schedule-request__filters__filter--date',
    requestCount: '.sm-page__header__request-count__text'
  },

  clickRefresh() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  clickPrint() {
    //Only way to get the filters to display contents seems to be to render right before print. But there is no callback parameter for render()..
    this.render();
    setTimeout(() => window.print(), 1000)
  },

  template() {
    return (
      <>
        <div className="header-page-title-container sm-page__container">
          <div className="header-page-title header-page-title-with-img sm-page__header">
            <img src={HeaderImg}/>
            <span>Work Schedule</span>
          </div>

          {this.renderJsxUnprocessedCount()}

          <div className="subpage dispute-overview-header-right-container">
            <div className="dispute-overview-header-right">
              <div className="dispute-overview-refresh-item">
                <span className="dispute-overview-refresh-text">{Formatter.toLastModifiedTimeDisplay(Moment())}</span>
                <div className="dispute-overview-header-icon header-refresh-icon" onClick={() => this.clickRefresh()}></div>
                { this.isRequestsSelected() || this.isPeriodSelected() ? <div className="dispute-overview-header-icon header-print-icon" onClick={() => this.clickPrint()}></div> : null }
              </div>
            </div>
          </div>
        </div>


        {this.renderJsxTopBar()}
        <div className="sm-page__sub-view"></div>

      </>
    );
  },

  renderJsxUnprocessedCount() {
    const unprocessedActiveRequestCount = this.getActiveRequestCount();
    const unprocessedInactiveRequestCount = this.getPastActiveRequestsCount();
    if (!unprocessedActiveRequestCount && !unprocessedInactiveRequestCount) return;
    return (
      <div className="subpage-header-action-container sm-page__header__request-count">
        <span className="error-red sm-page__header__request-count__text">There are {unprocessedActiveRequestCount ? `${unprocessedActiveRequestCount} unprocessed active request(s)` : ''}{`${unprocessedActiveRequestCount && unprocessedInactiveRequestCount ? ', and ' : ''}`}
        {unprocessedInactiveRequestCount ? `${unprocessedInactiveRequestCount} past unprocessed request(s)` : ''}</span>
      </div>
    )
  },

  renderJsxTopBar() {
    let renderSubViewFilters = null;
    if (this.isRequestsSelected()) {
      const startinDate = this.requestStartingDateModel.getData();
      const owner = this.ownerDropdownModel.getData();
      const status = this.requestStatusDropdownModel.getData();
      const type = this.requestTypesDropdownModel.getData();
      const submitterManager = this.requestSubmitterManagerDropdownModel.getData();

      renderSubViewFilters =
      <>
        <div className="sm-page__schedule-request__filters__add" onClick={() => this.clickAddRequest()}>
          <img className="sm-page__schedule-request__filters__add__icon" src={AddSMIcon} alt=""/>
          &nbsp;<span className="sm-page__schedule-request__filters__add__text">Add</span>
        </div>
        <div className="sm-page__schedule-request__filters hidden-print">
          <span className="sm-page__schedule-request__filters__filter">
            <span className="sm-page__schedule-request__filters__filter__text--starting-after">Starting After&nbsp;</span><div className="sm-page__schedule-request__filters__filter--date"></div>
          </span>
          <span className="sm-page__schedule-request__filters__filter">
            <span className="sm-page__schedule-request__filters__filter__text">Filters&nbsp;</span><div className="sm-page__schedule-request__filters__filter--owner"></div>
          </span>
          <span className="sm-page__schedule-request__filters__filter">
            <div className="sm-page__schedule-request__filters__filter--status"></div>
          </span>
          <span className="sm-page__schedule-request__filters__filter">
            <div className="sm-page__schedule-request__filters__filter--types"></div>
          </span>
          <span className="sm-page__schedule-request__filters__filter">
            <div className="sm-page__schedule-request__filters__filter--submitter"></div>
          </span>
        </div>
        <div className="sm_page__schedule-request__print-container visible-print">
          { startinDate ? <div className="print-filter-text"><b>Starting After:</b> &nbsp;{Formatter.toDateDisplay(startinDate)}</div> : null }
          { owner ? <div className="print-filter-text"><b>Owner:</b> &nbsp;{this.ownerDropdownModel.getSelectedText()}</div> : null }
          { status ? <div className="print-filter-text"><b>Status:</b> &nbsp;{this.requestStatusDropdownModel.getSelectedText()}</div> : null }
          { type ? <div className="print-filter-text"><b>Type:</b> &nbsp;{this.requestTypesDropdownModel.getSelectedText()}</div> : null }
          { submitterManager ? <div className="print-filter-text"><b>Manager of Submitter:</b> &nbsp;{this.requestSubmitterManagerDropdownModel.getSelectedText()}</div> : null }
        </div>
      </>
    } else if (this.isPeriodSelected()) {
      renderSubViewFilters =
      <>
        <div className="sm-page__schedule-periods__type-filter hidden-print"></div>
        <div className="print-filter-text visible-print"><b>Period Filter:</b> {this.periodTypeFilter.getSelectedText()}</div>
        <div className="sm-page__schedule-periods__add-period schedule-add-hearing-btn" onClick={() => this.addSchedulePeriod()}>Add Period</div>
      </>
    } else if (this.isScheduleSelected()) {
      renderSubViewFilters =
      <>
        <div className="sm-page__working-sched__filters">
          <div className="sm-page__working-sched__filters__inactive"></div>
          <div className="sm-page__working-sched__filters__managed-by"></div>
        </div>
        <div className="sm-page__working-sched__bulk-add-blocks hidden-item">
          <div className="sm-page__working-sched__bulk-add-blocks__btn" onClick={() => this.model.trigger('show:bulk')}>
            <img src={BulkAddImg} /><span>Bulk Add Blocks</span>
          </div>
        </div>
        <div className="sm-page__working-sched__hearing-generation">
          <div className="sm-page__working-sched__hearing-generation__btn" onClick={() => this.model.trigger('show:hearingGeneration')}>
            <img src={HearingGenerationImg} /><span>Hearing Generation</span>
          </div>
        </div>
      </>
    }
    return (
      <div className="sm-page__top-bar">
        <div className="sm-page__view-type hidden-print"></div>
        <div className="print-filter-text visible-print"><b>Work Schedule View:</b> {this.viewTypeModel.getSelectedText()}</div> 
        {renderSubViewFilters}
      </div>
    )
  },
  
});

_.extend(ScheduleManagerPage.prototype, ViewJSXMixin);
export default ScheduleManagerPage;