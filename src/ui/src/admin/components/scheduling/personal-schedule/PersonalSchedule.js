/**
 * @fileoverview - View that displays all hearings for a selected month and user
 */
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';

import { routeParse } from '../../../routers/mainview_router';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import CalendarGridModel from '../../calendar/CalendarGrid_model';
import TodayCalendarGridView from '../../calendar/TodayCalendarGrid';
import CalendarGridView from '../../calendar/CalendarGrid';

import prevIcon from '../../../static/Icon_Admin_Prev.png';
import nextIcon from '../../../static/Icon_Admin_Next.png'
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

import CalendarLegend from '../../../components/calendar-legend/CalendarLegend';

const CALENDAR_YEAR_SELECTOR_RANGE_FUTURE = 1;
const CALENDAR_YEAR_SELECTOR_RANGE_PAST = 2;

const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');

 /**
   * This component is a reusable table with filtering options
   * @param {UserModel} currentPickedUser - current user for which the calendar will load data
   * @param {Function} addCalendarScrollFn - add in custom calendar scroll function
  */

const PersonalSchedule = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['currentPickedUser', 'addCalendarScrollFn']);
    this.template = this.template.bind(this);
    this.createSubModels();
    this.setupListeners();
    this.updateCalendar();
  },

  className: 'schedule-page-subview personal-schedule',

  createSubModels() {
    const pickedCurrentYear = localStorage.getItem('calendarPickedYearCookie');
    const pickedCurrentMonth = localStorage.getItem('calendarPickedMonthCookie');

    this.calendarYearDropdownModel = new DropdownModel({
      optionData: this._getYearData(),
      value: _.isEmpty(pickedCurrentYear) ? String((new Date()).getFullYear()) : String(pickedCurrentYear),
      labelText: 'Year'
    });

    this.calendarMonthDropdownModel = new DropdownModel({
      optionData: _.map(_.range(0, 12), function(month_val) { return { text: Moment().month(month_val).format('MMMM'), value: String(month_val + 1) }; }),
      value: _.isEmpty(pickedCurrentMonth) ? String((new Date()).getMonth() + 1) : String(pickedCurrentMonth),
      labelText: 'Month'
    });

    const currentMonth = this.calendarMonthDropdownModel.getData({ parse: true });
    const currentYear = this.calendarYearDropdownModel.getData({ parse: true });
    this.calendarGridModel = new CalendarGridModel({
      initialHour: 7,
      finalHour: 21,
      headerLabel: 'Day',
      hideMenu: true,
      todayIndicator: true,
      currentPickedMonth: currentMonth,
      currentPickedYear: currentYear
    });
    this.todayCalendarGridModel = new CalendarGridModel({
      initialHour: 7,
      finalHour: 21,
      headerLabel: Moment(new Date()).format("dddd, MMM Do")
    });
  },

  _getYearData() {
    const current_year = (new Date()).getFullYear();
    const year_data = [];

    let i;
    for (i = current_year + CALENDAR_YEAR_SELECTOR_RANGE_FUTURE; i >= current_year - CALENDAR_YEAR_SELECTOR_RANGE_PAST; i--) {
      year_data.push({ text: `${i}`, value: String(i) })
    }

    return year_data;
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

  updateCalendar() {
    localStorage.setItem('calendarPickedYearCookie', this.calendarYearDropdownModel.getData({ parse: true }));
    localStorage.setItem('calendarPickedMonthCookie', this.calendarMonthDropdownModel.getData({ parse: true }));
    this.loadHearings({ no_loader: false });
  },

  setupListeners() {
    this.listenTo(this.calendarYearDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.calendarMonthDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.calendarGridModel, 'change', this.renderCalendar);
  },

  updateSelectedUser(user) {
    this.currentPickedUser = user;
  },

  loadHearings(options) {
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
    const todaySearchParams = {
      StartDate: Moment().format('YYYY-MM-DD'),
      EndDate: `${Moment().format('YYYY-MM-DD')}T23:59:59`
    };

    Promise.all([
      hearingChannel.request('get:by:owner', this.currentPickedUser, searchParams),
      hearingChannel.request('get:by:owner', this.currentPickedUser, todaySearchParams)
    ]).then(([hearings=[], todayHearings=[]]) => {
      this.calendarGridModel.set({ currentPickedMonth: currentMonth, currentPickedYear: currentYear });
      this.calendarGridModel.parseOwnerFromApi(hearings, startDateOfMonth);
      this.todayCalendarGridModel.parseMyTodayHearingFromApi(todayHearings);
      this.loaded = true;
      this.render();
    }, generalErrorFactory.createHandler('ADMIN.OWNER.HEARINGS.LOAD', () => this.render()))
    .finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.loaded = true;
    });
  },

  clickNext() {
    this.updateYearMonthDropDown();
  },

  clickPrevious() {
    this.updateYearMonthDropDown(false);
  },

  className: 'schedule-page-subview personal-schedule',
  
  regions: {
    calendarYearRegion: '.schedule-calendar-year',
    calendarMonthRegion: '.schedule-calendar-month',
    calendarRegion: '@ui.calendar',
    calendarTodayRegion: '@ui.todayCalendar',
    calendarLegendRegion: '.calendar-legend',
  },

  ui: {
    calendar: '.personal-schedule-calendar-container',
    todayCalendar: '.personal-schedule-today-calendar-container',
  },

  onRender() {
    if (this.currentPickedUser) {
      Backbone.history.navigate(routeParse('scheduled_hearings_personal_param_item', null, this.currentPickedUser), { trigger: false, replace: true });
    }

    this.showChildView('calendarLegendRegion', new CalendarLegend());
    this.renderDropdowns();

    if (!this.loaded) {
      return;
    }
    this.renderCalendars();
    loaderChannel.trigger('page:load:complete');
  },

  renderDropdowns() {
    this.showChildView('calendarYearRegion', new DropdownView({ model: this.calendarYearDropdownModel }));
    this.showChildView('calendarMonthRegion', new DropdownView({ model: this.calendarMonthDropdownModel }));
  },

  renderCalendars() {       
    this.showChildView('calendarTodayRegion', new TodayCalendarGridView({ model: this.todayCalendarGridModel }));
    this.showChildView('calendarRegion', new CalendarGridView({ model: this.calendarGridModel }));

    if (_.isFunction(this.addCalendarScrollFn) && !$('.page-view').hasClass('floatingHeaderMode')) {
      this.addCalendarScrollFn(
        '.schedule-calendar-year-month-dropdown-container',
      );
    } else {
      $('.page-view').trigger('scroll.rtb_calendar');
    }

    // Toggle correct horizontal scrolling:
    const el = this.getUI('calendar');
    el?.scrollLeft(125);
    
    localStorage.setItem('latestSchedulePageRoute', Backbone.history.getFragment());
  },

  template() {
    const printDate = `${this.calendarYearDropdownModel.getData()}, ${this.calendarMonthDropdownModel.getSelectedText()} `;
    return (
      <>
        <div className="personal-schedule-today-calendar-container"></div>

        <div className="schedule-calendar-year-month-dropdown-container">
          <div className="schedule-calendar-previous general-link" onClick={() => this.clickPrevious()}>
            <span>Prev</span>
            <img src={prevIcon} className="schedule-calendar-prev-image" alt="Move Previous" />
          </div>
          <div className="schedule-calendar-year hidden-print"></div>
          <div className="schedule-calendar-month hidden-print"></div>
          <div className="schedule-calendar-next general-link" onClick={() => this.clickNext()}>
            <img src={nextIcon} className="schedule-calendar-next-image" alt="Move Next" />
            <span>Next</span>
          </div>
          <span className="print-filter-text visible-print"><b>Date: </b>{printDate}</span>
          <div className="calendar-legend"></div>
        </div>

        <div className="personal-schedule-calendar-container"></div>
      </>
    );
  },
});

_.extend(PersonalSchedule.prototype, ViewJSXMixin);
export { PersonalSchedule }