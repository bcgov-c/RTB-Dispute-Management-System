import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { routeParse } from '../../routers/mainview_router';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import CalendarMonthlyReportModel from '../../components/calendar/calendar-monthly-report/CalendarMonthlyReport_model';
import CalendarMonthlyReportView from '../../components/calendar/calendar-monthly-report/CalendarMonthlyReport';
import ScheduleMonthlyStatisticView from './ScheduleMonthlyStatistic';
import ScheduleStatisticLegendView from './ScheduleStatisticLegend';
import template from './MonthlySchedule_template.tpl';

const CALENDAR_YEAR_SELECTOR_RANGE_FUTURE = 1;
const CALENDAR_YEAR_SELECTOR_RANGE_PAST = 2;
const CALENDAR_MONTH_ROW = 5;

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,

  className: 'schedule-page-subview monthly-schedule',

  regions: {
    calendarYearRegion: '.schedule-calendar-year',
    calendarMonthRegion: '.schedule-calendar-month',
    calendarScheduleInfo: '.schedule-calendar-info',
    calendarScheduleLegend: '.schedule-calendar-legend-container',
    calendarRegion: '.monthly-schedule-calendar-container'
  },

  ui: {
    previousIcon: '.schedule-calendar-previous',
    nextIcon: '.schedule-calendar-next',
  },

  events: {
    'click @ui.nextIcon': 'clickNext',
    'click @ui.previousIcon': 'clickPrevious',
  },

  clickNext() {
    this.updateYearMonthDropDown();
  },

  clickPrevious() {
    this.updateYearMonthDropDown(false);
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
        this.calendarYearDropdownModel.set({ value: String(updatingYear) });
        if (yearDropdown) {
          yearDropdown.render();
        }
      }
      updatingMonth = !isNext ? 12 : 1;
    }

    this.calendarMonthDropdownModel.set({ value: String(updatingMonth) });
    if (monthDropdown) {
      monthDropdown.render();
    }
  },

  _getYearData() {
    const current_year = (new Date()).getFullYear();
    const year_data = [];
    let i;
    for (i = current_year + CALENDAR_YEAR_SELECTOR_RANGE_FUTURE; i >= current_year - CALENDAR_YEAR_SELECTOR_RANGE_PAST; i--) {
      year_data.push({ text: `${i}`, value: `${i}` })
    }

    return year_data;
  },

  initialize(options) {
    this.mergeOptions(options, ['initialDate']);
    this.createSubModels();
    this.setupListeners();
    this.loadHearings({ no_loader: false });
    this.prepareCalendarData();
  },

  createSubModels() {
    const initialYear = this.initialDate ? Moment(this.initialDate, 'YYYY-MM').format('YYYY') : null;
    const initialMonth = this.initialDate ? Moment(this.initialDate, 'YYYY-MM').format('M') : null;

    this.calendarYearDropdownModel = new DropdownModel({
      optionData: this._getYearData(),
      value: initialYear ? String(initialYear) : String((new Date()).getFullYear()),
      labelText: 'Year'
    });

    this.calendarMonthDropdownModel = new DropdownModel({
      optionData: _.map(_.range(0, 12), function(month_val) { return { text: Moment().month(month_val).format('MMMM'), value: String(month_val + 1) }; }),
      value: initialMonth ? String(initialMonth) : String((new Date()).getMonth() + 1),
      labelText: 'Month'
    });

    this.calendarMonthlyReportModel = new CalendarMonthlyReportModel({
      numberOfMonthRow: CALENDAR_MONTH_ROW
    });
  },

  updateCalendar() {
    this.prepareCalendarData();
    this.loadHearings({ no_loader: false });
  },

  setupListeners() {
    this.listenTo(this.calendarYearDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.calendarMonthDropdownModel, 'change:value', this.updateCalendar, this);
    this.listenTo(this.calendarMonthlyReportModel, 'change', this.renderStatistic);
    this.listenTo(this.calendarMonthlyReportModel, 'change', this.renderLegends);
    this.listenTo(this.calendarMonthlyReportModel, 'change', this.renderCalendar);
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
    const currentMonth = this.calendarMonthDropdownModel.getData({ parse: true });
    hearingChannel.request('get:report:monthly', currentYear, currentMonth, { Priorities: priorities }).done(function(hearings) {
      hearings = hearings || {};
      self.loaded = true;
      self.calendarMonthlyReportModel.parseMonthlyFromApi(hearings || []);
      self.render();
    }).always(function() {
      loaderChannel.trigger('page:load:complete');
      self.loaded = true;
    });
  },

  prepareCalendarData() {
    const currentYearValue = this.calendarYearDropdownModel.getData({ parse: true });
    const currentMonthValue = this.calendarMonthDropdownModel.getData({ parse: true });
    const calendarData = this.calendarMonthlyReportModel.generateCalendarData(currentYearValue, currentMonthValue);
    this.calendarMonthlyReportModel.set({ calendarData, currentMonth: currentMonthValue, currentYear: currentYearValue });
  },

  renderDropdowns() {
    this.prepareCalendarData();
    this.showChildView('calendarYearRegion', new DropdownView({ model: this.calendarYearDropdownModel }));
    this.showChildView('calendarMonthRegion', new DropdownView({ model: this.calendarMonthDropdownModel }));
  },

  renderStatistic() {
    this.showChildView('calendarScheduleInfo', new ScheduleMonthlyStatisticView({ model: this.calendarMonthlyReportModel }));
  },

  renderLegends() {
    this.showChildView('calendarScheduleLegend', new ScheduleStatisticLegendView({ model: this.calendarMonthlyReportModel }));
  },

  renderCalendar() {
    this.showChildView('calendarRegion', new CalendarMonthlyReportView({ model: this.calendarMonthlyReportModel }));

    localStorage.setItem('latestSchedulePageRoute', Backbone.history.getFragment());
  },

  onRender() {
    const selectedYear = this.calendarYearDropdownModel.getData();
    const selectedMonth = Formatter.toLeftPad(this.calendarMonthDropdownModel.getData());

    if (selectedYear && selectedMonth) {
      Backbone.history.navigate(routeParse('scheduled_hearings_monthly_param_item', null, `${selectedYear}-${selectedMonth}`), { trigger: false, replace: true });
    }

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
      year: this.calendarYearDropdownModel.getData(),
      month: this.calendarMonthDropdownModel.getSelectedText()
    }
  },

});
