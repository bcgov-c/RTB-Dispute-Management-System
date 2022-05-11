import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import CalendarYearlyReportModel from '../../components/calendar/calendar-yearly-report/CalendarYearlyReport_model';
import CalendarYearlyReportView from '../../components/calendar/calendar-yearly-report/CalendarYearlyReport';
import ScheduleYearlyStatisticView from './ScheduleYearlyStatistic';
import ScheduleStatisticLegendView from './ScheduleStatisticLegend';
import template from './YearlySchedule_template.tpl';

const CALENDAR_YEAR_SELECTOR_RANGE_FUTURE = 1;
const CALENDAR_YEAR_SELECTOR_RANGE_PAST = 2;

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');

export default Marionette.View.extend({
  template,

  className: 'schedule-page-subview yearly-schedule',

  regions: {
    calendarYearRegion: '.schedule-calendar-year',
    calendarScheduleInfo: '.schedule-calendar-info',
    calendarScheduleLegend: '.schedule-calendar-legend-container',
    calendarRegion: '.yearly-schedule-calendar-container'
  },

  ui: {
    previousIcon: '.schedule-calendar-previous',
    nextIcon: '.schedule-calendar-year-next',
  },

  events: {
    'click @ui.nextIcon': 'clickNext',
    'click @ui.previousIcon': 'clickPrevious',
  },

  clickNext() {
    this.updateYearDropDown();
  },

  clickPrevious() {
    this.updateYearDropDown(false);
  },

  updateYearDropDown(isNext = true) {
    const yearDropdown = this.getChildView('calendarYearRegion');
    const currentYearValue = this.calendarYearDropdownModel.getData({ parse: true });
    const currentYear = (new Date()).getFullYear();
    let updatingYear;

    const lastItemInYearList = currentYear - CALENDAR_YEAR_SELECTOR_RANGE_PAST;
    const firstItemInYearList = currentYear + CALENDAR_YEAR_SELECTOR_RANGE_FUTURE;

    if (currentYearValue <= firstItemInYearList) {
      updatingYear = isNext ? Number(currentYearValue) + 1 : Number(currentYearValue) - 1;
      this.calendarYearDropdownModel.set({ value: updatingYear });
      if (yearDropdown) {
        yearDropdown.render();
      }
    }

    this.updateDateButtons(firstItemInYearList, lastItemInYearList, updatingYear);

  },

  updateDateButtons(firstItemInYearList, lastItemInYearList, updatingYear) {
    const isMovedOnFirstItemInYearList = Number(updatingYear) == firstItemInYearList;
    const isMovedOnLastItemInYearList = Number(updatingYear) == lastItemInYearList;

    if (isMovedOnFirstItemInYearList) {
      this.getUI('nextIcon').addClass('hide');
      this.getUI('previousIcon').removeClass('hide');
    } else if (isMovedOnLastItemInYearList) {
      this.getUI('previousIcon').addClass('hide');
      this.getUI('nextIcon').removeClass('hide');
    } else {
      this.getUI('nextIcon').removeClass('hide');
      this.getUI('previousIcon').removeClass('hide');
    }
  },

  _getYearData() {
    const current_year = (new Date()).getFullYear();
    const year_data = [];

    let i;
    for (i = current_year + CALENDAR_YEAR_SELECTOR_RANGE_FUTURE; i >= current_year - CALENDAR_YEAR_SELECTOR_RANGE_PAST; i--) {
      year_data.push({ text: `${i}`, value: i })
    }

    return year_data;
  },

  initialize() {
    this.createSubModels();
    this.setupListeners();
    this.loadHearings({ no_loader: false });
  },

  createSubModels() {
    this.calendarYearDropdownModel = new DropdownModel({
      optionData: this._getYearData(),
      value: (new Date()).getFullYear(),
      labelText: 'Year'
    });

    // Initialize the CalendarGrid model
    this.calendarYearlyReportModel = new CalendarYearlyReportModel();
  },

  updateCalendar() {
    const firstItemInYearList = this.calendarYearDropdownModel.get('optionData')[0].value;
    const lastItemInYearList = this.calendarYearDropdownModel.get('optionData')[this.calendarYearDropdownModel.get('optionData').length - 1].value;
    const updatingYear = this.calendarYearDropdownModel.getData();

    this.updateDateButtons(firstItemInYearList, lastItemInYearList, updatingYear);
    this.loadHearings({ no_loader: false });
  },

  setupListeners() {
    this.listenTo(this.calendarYearDropdownModel, 'change:value', () => {
      this.updateCalendar();
      this.render();
    });
    this.listenTo(this.calendarYearlyReportModel, 'change', this.renderStatistic);
    this.listenTo(this.calendarYearlyReportModel, 'change', this.renderLegends);
    this.listenTo(this.calendarYearlyReportModel, 'change', this.renderCalendar);
  },

  loadHearings(options) {
    options = options || {};

    const self = this;
    this.loaded = false;
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }

    const priorities = [
      configChannel.request('get', 'HEARING_PRIORITY_EMERGENCY'),
      configChannel.request('get', 'HEARING_PRIORITY_STANDARD'),
      configChannel.request('get', 'HEARING_PRIORITY_DEFERRED'),
      configChannel.request('get', 'HEARING_PRIORITY_DUTY')
    ];
    const currentYear = this.calendarYearDropdownModel.getData({ parse: true });
    hearingChannel.request('get:report:yearly', currentYear, { Priorities: priorities }).done(function(hearings) {
      hearings = hearings || {};
      self.loaded = true;
      self.calendarYearlyReportModel.parseYearlyFromApi(hearings || []);
      self.calendarYearlyReportModel.set({ currentYear: currentYear });

      self.renderStatistic();
      self.renderLegends();
      self.renderCalendar();
    }).always(function() {
      loaderChannel.trigger('page:load:complete');
      self.loaded = true;
    });

  },

  renderDropdowns() {
    this.showChildView('calendarYearRegion', new DropdownView({ model: this.calendarYearDropdownModel }));
  },

  renderStatistic() {
    this.showChildView('calendarScheduleInfo', new ScheduleYearlyStatisticView({ model: this.calendarYearlyReportModel }));
  },

  renderLegends() {
    this.showChildView('calendarScheduleLegend', new ScheduleStatisticLegendView({ model: this.calendarYearlyReportModel }));
  },

  renderCalendar() {
    this.showChildView('calendarRegion', new CalendarYearlyReportView({ model: this.calendarYearlyReportModel }));

    localStorage.setItem('latestSchedulePageRoute', Backbone.history.getFragment());
  },

  onRender() {
    this.renderDropdowns();

    if (!this.loaded) {
      return;
    }

    this.renderStatistic();
    this.renderLegends();
    this.renderCalendar();
    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      year: this.calendarYearDropdownModel.getData()
    }
  },

});
