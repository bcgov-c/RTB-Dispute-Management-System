import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import PageView from '../../../core/components/page/Page';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import ModalCreateHearingModel from '../../components/hearing/modals/modal-create-hearing/ModalCreateHearing_model';
import ModalCreateHearingView from '../../components/hearing/modals/modal-create-hearing/ModalCreateHearing';
import MyScheduleRequestModal from './MyScheduleRequestModal';
import { PersonalSchedule as PersonalScheduleView } from '../../components/scheduling/personal-schedule/PersonalSchedule';
import { MyScheduleRequestPage } from './MyScheduleRequestPage';
import MyScheduleTable from './MyScheduleTable';
import AddHearingIcon from '../../static/Icon_AdminBar_HearingAdd.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { routeParse } from '../../routers/mainview_router';
import './MySchedulePage.scss';
import ModalBulkMoveHearings from '../../components/modals/modal-bulk-move-hearing/ModalBulkMoveHearing';

const SCHEDULE_PAGE_CODE = "0";
const SCHEDULE_REQUEST_PAGE_CODE = "1";

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

const MySchedulePage = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.currentUserModel = sessionChannel.request('get:user') || null;

    this.createSubModels();
    this.setupListeners();
  },

  clickRefresh() {
    const scheduleType = this.scheduleTypeDropdownModel.getData();
    if (scheduleType === SCHEDULE_PAGE_CODE) {
      const scheduleTableView = this.getChildView('scheduleTableRegion');
      scheduleTableView.loadHearings();
    } else if (scheduleType === SCHEDULE_REQUEST_PAGE_CODE) {
      this.filterScheduleRequestsAndLoad();
    }
  },

  clickShowMySchedule() {
    this.arbitratorDropdownModel.set({ value: String(this.currentUserModel.id) });
    
    // If no selection, then current user was inactive. Enable the active filter and proceed
    if (!this.arbitratorDropdownModel.getSelectedText()) {
      this.inactiveModel.set('checked', true);
      this.inactiveModel.trigger('render');
    } else {
      this.arbitratorDropdownModel.trigger('render');
    }
    
    const scheduleTableView = this.getChildView('scheduleTableRegion');
    scheduleTableView.loadHearings();
  },

  clickAddHearing() {
    const scheduleTableView = this.getChildView('scheduleTableRegion');
    const modalCreateHearing = new ModalCreateHearingView({
      model: new ModalCreateHearingModel({ initialArbId: this.arbitratorDropdownModel.getData({ parse: true }) || null })
    });
    this.listenTo(modalCreateHearing, 'save:complete', () => {
      scheduleTableView.loadHearings();
    });

    modalChannel.request('add', modalCreateHearing);
  },

  clickBulkMoveHearings() {
    const bulkMoveHearingsModal = new ModalBulkMoveHearings();
    modalChannel.request('add', bulkMoveHearingsModal);

    this.listenTo(bulkMoveHearingsModal, 'removed:modal', this.clickRefresh, this);
  },

  clickPrint() {
    this.render();
    setTimeout(() => window.print(), 1000)
  },

  createSubModels() {
    const cachedData = this.model.get('mySchedulePage');

    this.arbitratorDropdownModel = new DropdownModel({
      optionData: this._getAllArbOptions(),
      value: cachedData?.filter_selectedArb ? cachedData?.filter_selectedArb : 
        this.currentUserModel ? String(this.currentUserModel.id) : 
        null
    });

    this.inactiveModel = new CheckboxModel({
      html: 'Include inactive staff (**)',
      checked: false
    });


    this.scheduleTypeDropdownModel = new DropdownModel({
      optionData: [
        { value: SCHEDULE_PAGE_CODE, text: 'My Schedule' },
        { value: SCHEDULE_REQUEST_PAGE_CODE, text: 'My Schedule Requests' },
      ],
      value: cachedData?.filter_scheduleType || null,
    });

    this.requestStartingDateModel = new InputModel({
      inputType: 'date',
      value: cachedData?.filter_scheduleRequestAfter || null,
      allowFutureDate: true,
    });

    this.scheduleStatusFilterDropdownModel = new DropdownModel({
      optionData: this._getScheduleStatusFilterOptions(),
      value: cachedData?.filter_scheduleRequestFilter || null
    });

    // Now set the correct initial arb picklist values based on filter selection
    this.onChangeFilterCheckbox(this.inactiveModel, this.inactiveModel.get('checked'));
  },

  cachePageFilters() {
    this.model.set({
      mySchedulePage: {
        filter_scheduleType: this.scheduleTypeDropdownModel.getData(),
        filter_selectedArb: this.arbitratorDropdownModel.getData(),
        filter_scheduleRequestAfter: this.requestStartingDateModel.getData(),
        filter_scheduleRequestFilter: this.scheduleStatusFilterDropdownModel.getData()
      }
    });
  },

  updateCalendar() {
    const scheduleTableView = this.getChildView('scheduleTableRegion');
    scheduleTableView.updateSelectedUser(this.arbitratorDropdownModel.getData({ parse: true }))
    scheduleTableView.loadHearings();
  },

  setupListeners() {
    this.listenTo(this.arbitratorDropdownModel, 'change:value', (model, value) => {
      this.cachePageFilters();
      this.updateCalendar();
    });
    this.listenTo(this.inactiveModel, 'change:checked', this.onChangeFilterCheckbox, this);
    this.listenTo(this.scheduleTypeDropdownModel, 'change:value', () => {
      this.cachePageFilters();
      this.render();
    });
    this.listenTo(this.requestStartingDateModel, 'change:value', () => {
      this.cachePageFilters();
      this.filterScheduleRequestsAndLoad();
    });
    this.listenTo(this.scheduleStatusFilterDropdownModel, 'change:value', () => {
      this.cachePageFilters();
      this.filterScheduleRequestsAndLoad();
    });
  },

  getScheduleRequestFilters() {
    const statusFilterValue = this.scheduleStatusFilterDropdownModel.getSelectedOption().statusIn;
    const options = {};
    _.extend(options, 
      this.requestStartingDateModel.getData() ? { RequestStartAfter: this.requestStartingDateModel.getData() } : null,
      this.scheduleStatusFilterDropdownModel.getData() ? { StatusIn: statusFilterValue } : null,
      { RequestSubmitters: sessionChannel.request('get:user:id') }
    )

    return options
  },

  filterScheduleRequestsAndLoad() {
    const scheduleRequestView = this.getChildView('myScheduleRequestRegion');
    const filterOptions = this.getScheduleRequestFilters();
    scheduleRequestView.loadScheduleRequests(filterOptions);
  },

  _getAllArbOptions() {
    return _.sortBy(_.map(userChannel.request('get:arbs', { all: true }), function(arbitrator) {
      return { text: `${Formatter.toUserLevelDisplay(arbitrator)}: ${!arbitrator.isActive()?'** ':''}${arbitrator.getDisplayName()}`, value: String(arbitrator.id), isActive: arbitrator.isActive() };
    }), function(option) { return ((option.isActive && option.text) || 'zzzz').toLowerCase(); });
  },

  _getScheduleStatusFilterOptions() {
    const uiFilters = [
      { text: "All Statuses", value: '-2', statusIn: [] },
      { text: "All Requiring Action", value: '-1', statusIn: configChannel.request('get', 'SCHEDULE_REQUEST_ALL_ACTION_STATUSES') }, 
    ];
    const requestStatusDisplayConfig = configChannel.request('get', 'SCHEDULE_REQUEST_STATUS_DISPLAY');
    return [...uiFilters, ...Object.entries(requestStatusDisplayConfig).map( ([value, text]) => ({ value, text, statusIn: value }))];
  },

  onChangeFilterCheckbox(checkboxModel, isChecked) {
    const allArbOptions = this._getAllArbOptions();
    if (isChecked) {
      this.arbitratorDropdownModel.set('optionData', allArbOptions);
    } else {
      this.arbitratorDropdownModel.set('optionData', _.where(allArbOptions, { isActive: true }));
    }
    // If no selection, then current user was filtered. Change it to the first in the list
    if (!this.arbitratorDropdownModel.getSelectedText()) {
      const optionData = this.arbitratorDropdownModel.get('optionData');
      if (optionData.length) {
        this.arbitratorDropdownModel.set('value', String(optionData[0].value));
      }
    }
    this.arbitratorDropdownModel.trigger('render');
  },

  addCalendarScrollFn() {
    this.$el.addCalendarScrollFn(...arguments);
  },

  className: `${PageView.prototype.className} my-schedule-page`,

  regions: {
    scheduleTableRegion: '.schedule-table',
    myScheduleRequestRegion: '.my-schedule-request',
    scheduleTypeRegion: '.schedule-type',
    calendarArbitratorRegion: '.my-schedule-calendar-arbitrator',
    showInactiveRegion: '.my-schedule-inactive-filter',
    requestStartingDateRegion: '.request-starting-date',
    filterDropdownRegion: '.filter-region'
  },

  onRender() {
    this.showChildView('scheduleTypeRegion', new DropdownView({ model: this.scheduleTypeDropdownModel }));
    if (this.scheduleTypeDropdownModel.getData() === SCHEDULE_PAGE_CODE) {
      this.renderMySchedule();
    } else {
      this.renderMyScheduleRequest();
      Backbone.history.navigate(routeParse('scheduled_requests_item', null), { trigger: false });
    }
  },

  openRequestModal() {
    const scheduleRequestModal = new MyScheduleRequestModal();
    modalChannel.request('add', scheduleRequestModal);

    this.listenTo(scheduleRequestModal, 'removed:modal', () => {
      this.clickRefresh();
    })
  },

  renderMySchedule() {
    const currentPickedUser = this.arbitratorDropdownModel.getData({ parse: true });
    this.showChildView('scheduleTableRegion', new PersonalScheduleView({
      currentPickedUser,
      addCalendarScrollFn: this.addCalendarScrollFn,
      model: this.model
    }));

    this.showChildView('calendarArbitratorRegion', new DropdownView({ model: this.arbitratorDropdownModel }));
    this.showChildView('showInactiveRegion', new CheckboxView({ model: this.inactiveModel }));
  },

  renderMyScheduleRequest() {
    this.showChildView('requestStartingDateRegion', new InputView({ model: this.requestStartingDateModel }));
    this.showChildView('filterDropdownRegion', new DropdownView({ model: this.scheduleStatusFilterDropdownModel }));
    this.showChildView('myScheduleRequestRegion', new MyScheduleRequestPage({ tableView: MyScheduleTable, filterToCurrentUser: true, getCurrentFilters: () => this.getScheduleRequestFilters() }));
  },

  template() {
    const isCurrentUserSelected = this.currentUserModel && String(this.currentUserModel.id) === this.arbitratorDropdownModel.getData();
    const scheduleType = this.scheduleTypeDropdownModel.getData();
    const SHOW_SCHEDULE_MANAGEMENT = (configChannel.request('get', 'UAT_TOGGLING') || {}).SHOW_SCHEDULE_MANAGEMENT;
    return (
      <>
        <div className="header-page-title-container">

          <div className="header-page-title header-page-title-with-icon">{SHOW_SCHEDULE_MANAGEMENT ? 'My Schedule' : 'My Hearings'}</div>

          <div className="subpage dispute-overview-header-right-container">
            <div className="dispute-overview-header-right">
              <div className="dispute-overview-refresh-item">
                <span className="dispute-overview-refresh-text"></span>
                <div className="dispute-overview-header-icon header-refresh-icon" onClick={() => this.clickRefresh()}></div>
              </div>
              <div className="dispute-overview-header-icon header-print-icon" onClick={() => this.clickPrint()}></div>
            </div>
          </div>
        </div>

        <div className={`general-filters-row${scheduleType === SCHEDULE_REQUEST_PAGE_CODE ? '-schedule-request' : ''} general-filters-row--dark`}>
          <div className="my-schedule-calendar-myschedule hidden-print">
            <span className={`${isCurrentUserSelected || scheduleType === SCHEDULE_REQUEST_PAGE_CODE ? 'hidden' : ''} general-link`} onClick={() => this.clickShowMySchedule()}>Show My Schedule</span>
            <div className={`schedule-type ${!SHOW_SCHEDULE_MANAGEMENT?'hidden':''}`}></div>
          </div>
          {this.renderJsxFilters()}
        </div>

        {scheduleType === SCHEDULE_PAGE_CODE ? <div className="schedule-table"></div> : <div className="my-schedule-request"></div>}
      </>
    )
  },

  renderJsxFilters() {
    const scheduleType = this.scheduleTypeDropdownModel.getData();
    const showSchedulerButtons = () => {
      if (this.currentUserModel && this.currentUserModel.isScheduler()) {
        return (
          <>
            <div className="schedule-add-hearing-btn" onClick={() => this.clickAddHearing()}>Add Hearing</div>
            <div class="schedule-bulk-move-hearing schedule-bulk-move-hearings hidden-print" onClick={() => this.clickBulkMoveHearings()}>Bulk Move Hearings</div>
          </>
        )
      }
    }
    if (scheduleType === SCHEDULE_PAGE_CODE) {
      return (
        <>
          <div className="my-schedule-calendar-arbitrator"></div>
          <div className="my-schedule-inactive-filter"></div>
            { showSchedulerButtons() }
        </>
      );
    } else {
      return (
        <>
          <div className="my-schedule-filters hidden-print">
            <span className="my-schedule-filters-filter"><span className="my-schedule-filters-filter-text">Starting After</span><div className="request-starting-date"></div></span>
            <span className="my-schedule-filters-filter"><span className="my-schedule-filters-filter-text">Filters</span><div className="filter-region"></div></span>
            <div className="my-schedule-add hidden-print" onClick={() => this.openRequestModal()}>
              <img src={AddHearingIcon} alt=""/>
              <span>&nbsp;New Request</span>
            </div>
          </div>
          <div className="visible-print">
            { this.scheduleTypeDropdownModel.getData() ? <div className="print-filter-text"><b>Selected View:</b> &nbsp;{this.scheduleTypeDropdownModel.getSelectedText()}</div> : null }
            { this.requestStartingDateModel.getData() ? <div className="print-filter-text"><b>Starting After:</b> &nbsp;{Formatter.toDateDisplay(this.requestStartingDateModel.getData())}</div> : null }
            { this.scheduleStatusFilterDropdownModel.getData() ? <div className="print-filter-text"><b>Filters:</b> &nbsp;{this.scheduleStatusFilterDropdownModel.getSelectedText()}</div> : null }
          </div>
        </>
      );
    }
  }
});

_.extend(MySchedulePage.prototype, ViewJSXMixin);
export { MySchedulePage }