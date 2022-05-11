import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import CalendarGridModel from '../../components/calendar/CalendarGrid_model';
import TodayCalendarGridView from '../../components/calendar/TodayCalendarGrid';
import CalendarGridView from '../../components/calendar/CalendarGrid';
import ModalCreateHearingModel from '../../components/hearing/modals/modal-create-hearing/ModalCreateHearing_model';
import ModalCreateHearingView from '../../components/hearing/modals/modal-create-hearing/ModalCreateHearing';
import { routeParse } from '../../routers/mainview_router';
import template from './MyHearings_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import CalendarLegend from '../../components/calendar-legend/CalendarLegend';

const CALENDAR_YEAR_SELECTOR_RANGE_FUTURE = 1;
const CALENDAR_YEAR_SELECTOR_RANGE_PAST = 2;

const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');
const hearingChannel = Radio.channel('hearings');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} my-hearings-page`,

  regions: {
    calendarArbitratorRegion: '.my-hearings-calendar-arbitrator',
    calendarYearRegion: '.my-hearings-calendar-year',
    calendarMonthRegion: '.my-hearings-calendar-month',
    calendarRegion: '@ui.calendar',
    calendarTodayRegion: '@ui.todayCalendar',
    showInactiveRegion: '.my-hearing-inactive-filter',
    calendarLegendRegion: '.calendar-legend',
  },

  ui: {
    calendar: '.my-hearings-calendar-container',
    todayCalendar: '.my-hearings-today-calendar-container',
    refreshIcon: '.header-refresh-icon',
    previousIcon: '.my-hearings-calendar-previous',
    nextIcon: '.my-hearings-calendar-next',
    addHearingBtn: '.schedule-add-hearing-btn',
    print: '.header-print-icon',
    showMyScheduleLink: '.my-hearings-calendar-myschedule > .general-link',
    todayOpenFileLink: '.today-calendar-event-link',
    calendarEventMenu: '.calendar-grid-event-menu'
  },

  events: {
    'click @ui.print': 'clickPrint',
    'click @ui.addHearingBtn': 'clickAddHearing',
    'click @ui.refreshIcon': 'clickRefresh',
    'click @ui.nextIcon': 'clickNext',
    'click @ui.previousIcon': 'clickPrevious',
    'click @ui.showMyScheduleLink': 'clickShowMySchedule',
    'click @ui.todayOpenFileLink': 'clickOpenFileLink'
  },

  clickPrint() {
    const printGridCellWith = 86;
    const options = { gridCellWidth: printGridCellWith };

    this.getUI('calendar').scrollLeft(0);
    this.getChildView('calendarRegion')?.currentView?.renderCalendarEvents(options);

    this.getUI('todayCalendar').scrollLeft(0);
    this.getChildView('calendarTodayRegion')?.currentView?.renderCalendarEvents(options);

    window.print();
  },

  clickNext() {
    this.updateYearMonthDropDown();
  },

  clickPrevious() {
    this.updateYearMonthDropDown(false);
  },

  clickRefresh() {
    this.loadMyHearings();
  },

  clickOpenFileLink(ev) {
    const eventDisputeGuid = $(ev.currentTarget).data('guid');

    if (eventDisputeGuid && eventDisputeGuid !== "00000000-0000-0000-0000-000000000000") {
      Backbone.history.navigate(routeParse('hearing_item', eventDisputeGuid), { trigger: true });
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
    
    this.loadMyHearings();
  },

  clickAddHearing() {
    const modalCreateHearing = new ModalCreateHearingView({
      model: new ModalCreateHearingModel({ initialArbId: this.arbitratorDropdownModel.getData({ parse: true }) || null })
    });
    this.listenTo(modalCreateHearing, 'save:complete', this.loadMyHearings, this);
    modalChannel.request('add', modalCreateHearing);
  },

  updateYearMonthDropDown(isNext = true) {
    const yearDropdown = this.getChildView('calendarYearRegion');
    const monthDropdown = this.getChildView('calendarMonthRegion');

    const currentYearValue = this.calendarYearDropdownModel.getData({ parse: true });
    const currentMonthValue = this.calendarMonthDropdownModel.getData({ parse: true });
    const currentYear = (new Date()).getFullYear();
    const comparedMonthValue = !isNext ? 1 : 12;

    let updatingYear;
    let updatingMonth = (!isNext) ? Number(currentMonthValue) - 1 : Number(currentMonthValue) + 1;

    if (currentMonthValue === comparedMonthValue) {
      const lastItemInYearList = currentYear - CALENDAR_YEAR_SELECTOR_RANGE_PAST;
      const firstItemInYearList = currentYear + CALENDAR_YEAR_SELECTOR_RANGE_FUTURE;
      const isMovedOverFirstItemInYearList = isNext && Number(currentYearValue) >= firstItemInYearList;
      const isMovedBelowLastItemInYearList = !isNext && Number(currentYearValue) <= lastItemInYearList;

      if (isMovedOverFirstItemInYearList || isMovedBelowLastItemInYearList) {
        return false;
      }

      if (currentYearValue <= firstItemInYearList) {
        updatingYear = isNext ? Number(currentYearValue) + 1 : Number(currentYearValue) - 1;
        this.calendarYearDropdownModel.set({ value: String(updatingYear) }, { silent: true });
        localStorage.setItem('calendarPickedYearCookie', updatingYear);
        if (yearDropdown) {
          yearDropdown.render();
        }
      }
      updatingMonth = !isNext ? 12 : 1;
    }

    // Force a triggered event here which causes the calendar to re-fetch
    this.calendarMonthDropdownModel.set('value', String(updatingMonth), { silent: true });
    this.calendarMonthDropdownModel.trigger('change:value', this.calendarMonthDropdownModel, String(updatingMonth));
    localStorage.setItem('calendarPickedMonthCookie', updatingMonth);
    if (monthDropdown) {
      monthDropdown.render();
    }
  },

  _getYearData() {
    const current_year = (new Date()).getFullYear(),
      year_data = [];

    let i;
    for (i = current_year + CALENDAR_YEAR_SELECTOR_RANGE_FUTURE; i >= current_year - CALENDAR_YEAR_SELECTOR_RANGE_PAST; i--) {
      year_data.push({ text: `${i}`, value: String(i) })
    }

    return year_data;
  },

  initialize() {
    this.currentUserModel = sessionChannel.request('get:user') || null;

    this.createSubModels();
    this.setupListeners();
    
    this.loadMyHearings({ no_loader: true });
    this.prepareCalendarData();
  },

  createSubModels() {
    this.arbitratorDropdownModel = new DropdownModel({
      optionData: this._getAllArbOptions(),
      value: this.currentUserModel ? String(this.currentUserModel.id) : null
    });

    this.calendarYearDropdownModel = new DropdownModel({
      optionData: this._getYearData(),
      value: String((new Date()).getFullYear()),
      labelText: 'Year'
    });

    this.calendarMonthDropdownModel = new DropdownModel({
      optionData: _.map(_.range(0, 12), function(month_val) { return { text: Moment().month(month_val).format('MMMM'), value: String(month_val + 1) }; }),
      value: String((new Date()).getMonth() + 1),
      labelText: 'Month'
    });

    const currentMonth = this.calendarMonthDropdownModel.getData({ parse: true });
    const currentYear = this.calendarYearDropdownModel.getData({ parse: true });
    this.calendarGridModel = new CalendarGridModel({
      initialHour: 7,
      finalHour: 21,
      headerLabel: 'Day',
      todayIndicator: true,
      currentPickedMonth: currentMonth,
      currentPickedYear: currentYear,
      hideMenu: true
    });

    this.todayCalendarGridModel = new CalendarGridModel({
      initialHour: 7,
      finalHour: 21,
      headerLabel: Moment(new Date()).format("dddd, MMM Do")
    });

    this.inactiveModel = new CheckboxModel({
      html: 'Include inactive staff (**)',
      checked: !!this.model.get('showInactiveUsers')
    });

    // Now set the correct initial arb picklist values based on filter selection
    this.onChangeFilterCheckbox(this.inactiveModel, this.inactiveModel.get('checked'));
  },

  updateCalendar() {
    this.prepareCalendarData();
    this.loadMyHearings();
  },

  setupListeners() {
    this.listenTo(this.calendarYearDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.calendarMonthDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.arbitratorDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.inactiveModel, 'change:checked', this.onChangeFilterCheckbox, this);
  },

  _getAllArbOptions() {
    return _.sortBy(_.map(userChannel.request('get:arbs', { all: true }), function(arbitrator) {
      return { text: `${!arbitrator.isActive()?'** ':''}${arbitrator.getDisplayName()}`, value: String(arbitrator.id), isActive: arbitrator.isActive() };
    }), function(option) { return ((option.isActive && option.text) || 'zzzz').toLowerCase(); });
  },

  onChangeFilterCheckbox(checkboxModel, isChecked) {
    this.model.set({ showInactiveUsers: isChecked });
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

  loadMyHearings(options) {
    options = options || {};

    this.loaded = false;

    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }

    const currentYear = this.calendarYearDropdownModel.getData({ parse: true });
    const currentMonth = this.calendarMonthDropdownModel.getData({ parse: true });
    const startDateOfMonth = Moment(`${currentYear}-${currentMonth}`).startOf('month');
    const searchParams = {
      StartDate: startDateOfMonth.format('YYYY-MM-DD'),
      EndDate: `${Moment(startDateOfMonth).endOf('month').format('YYYY-MM-DD')}T23:59:59`
    };
    const currentPickedUser = this.arbitratorDropdownModel.getData({ parse: true });

    hearingChannel.request('get:by:owner', currentPickedUser, searchParams)
      .done(hearings => {
        hearings = hearings || {};

        this.loaded = true;
        this.calendarGridModel.set({ currentPickedMonth: currentMonth, currentPickedYear: currentYear });
        this.calendarGridModel.parseOwnerFromApi(hearings || [], startDateOfMonth);
        this.todayCalendarGridModel.parseMyTodayHearingFromApi(hearings || []);
        this.renderCalendars();
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.OWNER.HEARINGS.LOAD', () => this.render())
      )
      .always(() => {
        loaderChannel.trigger('page:load:complete');
        this.loaded = true;
      });

  },

  prepareCalendarData() {
    const currentYearValue = this.calendarYearDropdownModel.getData({ parse: true });
    const currentMonthValue = this.calendarMonthDropdownModel.getData({ parse: true });
    localStorage.setItem('calendarPickedYearCookie', currentYearValue);
    localStorage.setItem('calendarPickedMonthCookie', currentMonthValue);
  },

  addCalendarScrollFn() {
    this.$el.addCalendarScrollFn(...arguments);
  },

  renderCalendars() {
    this.showChildView('calendarTodayRegion', new TodayCalendarGridView({ model: this.todayCalendarGridModel }));
    this.showChildView('calendarRegion', new CalendarGridView({ model: this.calendarGridModel }));

    if (_.isFunction(this.addCalendarScrollFn) && !$('.page-view').hasClass('floatingHeaderMode')) {
      this.addCalendarScrollFn(
        '.schedule-calendar-year-month-dropdown-container',
        '.calendar-container .calendar-header-container');
    } else {
      $('.page-view').trigger('scroll.rtb_calendar');
    }
  },

  onRender() {
    this.prepareCalendarData();
    this.showChildView('calendarYearRegion', new DropdownView({ model: this.calendarYearDropdownModel }));
    this.showChildView('calendarMonthRegion', new DropdownView({ model: this.calendarMonthDropdownModel }));
    this.showChildView('calendarArbitratorRegion', new DropdownView({ model: this.arbitratorDropdownModel }));
    this.showChildView('showInactiveRegion', new CheckboxView({ model: this.inactiveModel }));
    this.showChildView('calendarLegendRegion', new CalendarLegend());

    if (!this.loaded) {
      return;
    }

    this.renderCalendars();
  },

  templateContext() {
    return {
      isCurrentUserSelected: this.currentUserModel && String(this.currentUserModel.id) === this.arbitratorDropdownModel.getData(),
      showAddHearingButton: this.currentUserModel && this.currentUserModel.isScheduler()
    };
  },

});
