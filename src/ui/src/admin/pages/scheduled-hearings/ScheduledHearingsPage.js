import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import ModalCreateHearingView from '../../components/hearing/modals/modal-create-hearing/ModalCreateHearing';
import ModalCreateHearingModel from '../../components/hearing/modals/modal-create-hearing/ModalCreateHearing_model';
import ModalImportHearingsView from './modals/ModalImportHearings';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import HearingImportModel from '../../components/hearing/hearing-import/HearingImport_model';
import DailyScheduleView from './DailySchedule';
import { PersonalSchedule as PersonalScheduleView } from '../../components/scheduling/personal-schedule/PersonalSchedule';
import MonthlyScheduleView from './MonthlySchedule';
import YearlyScheduleView from './YearlySchedule';
import HistoryScheduleView from './HistorySchedule';
import ModalBulkMoveHearings from '../../components/modals/modal-bulk-move-hearing/ModalBulkMoveHearing';
import ScheduleHoldHearings from './ScheduleHoldHearings';
import { routeParse } from '../../routers/mainview_router';
import template from './ScheduledHearingsPage_template.tpl';

const ROUTE_NAME = 'scheduled_hearings_item';

const DAILY_MENU_NAME = 'Schedule - Daily';
const PERSONAL_MENU_NAME = 'Schedule - Personal';
const MONTHLY_MENU_NAME = 'Schedule - Monthly';
const YEARLY_MENU_NAME = 'Schedule - Yearly';
const HISTORY_MENU_NAME = 'Schedule - History';

const DAILY_SCHEDULE_CODE = '1';
const PERSONAL_SCHEDULE_CODE = '2';
const MONTHLY_SCHEDULE_CODE = '3';
const YEARLY_SCHEDULE_CODE = '4';
const SCHEDULING_HISTORY_CODE = '5';
const ON_HOLD_HEARINGS_CODE = '6';

const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const menuChannel = Radio.channel('menu');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} scheduled-hearings`,

  ui: {
    printHeader: '.print-header',
    importBtn: '.schedule-import-btn',
    addHearingBtn: '.schedule-add-hearing-btn',
    refreshIcon: '.header-refresh-icon',
    print: '.header-print-icon',
    moveHearings: '.schedule-bulk-move-hearing'
  },

  regions: {
    scheduleTypeRegion: '.schedule-type-filter',
    scheduleSubViewRegion: '.schedule-page-sub-view',
    showInactiveRegion: '.schedule-inactive-filter',
    calendarArbitratorRegion: '.schedule-calendar-arbitrator'
  },

  events: {
    'click @ui.print': 'clickPrint',
    'click @ui.refreshIcon': 'clickRefresh',
    'click @ui.importBtn': 'clickImport',
    'click @ui.addHearingBtn': 'clickAddHearing',
    'click @ui.moveHearings': 'clickMoveHearings'
  },

  clickPrint() {
    const currentScheduleView = this.getRegion('scheduleSubViewRegion');

    if (this._isDailySelected() || this._isPersonalSelected()) {
      const printGridCellWith = 86;
      const options = { gridCellWidth: printGridCellWith };

      currentScheduleView?.currentView?.getUI('calendar')?.scrollLeft(0);
      currentScheduleView?.currentView?.getUI('todayCalendar')?.scrollLeft(0);
      currentScheduleView?.currentView?.getRegion('calendarTodayRegion')?.currentView?.renderCalendarEvents(options);
      currentScheduleView?.currentView?.getRegion('calendarRegion')?.currentView?.renderCalendarEvents(options); 
    }

    window.print();
  },

  clickRefresh() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  clickImport() {
    const hearingImportModel = new HearingImportModel();
    const modalImportHearings = new ModalImportHearingsView({ model: this.model, hearingImportModel });

    this.listenTo(modalImportHearings, 'removed:modal', () => {
      if (hearingImportModel.isSuccessState()) {
        this.renderSubSchedule();
      }
    });

    modalChannel.request('add', modalImportHearings);
  },

  clickAddHearing() {
    const modalCreateHearing = new ModalCreateHearingView({
      model: new ModalCreateHearingModel({
        initialDate: this._isDailySelected() ? (this.getChildView('scheduleSubViewRegion') || { getSelectedDate: () => {} }).getSelectedDate() : null,
        initialArbId: this._isPersonalSelected() ? this.arbitratorDropdownModel.getData({ parse: true }) : null
      })
    });
    this.listenTo(modalCreateHearing, 'save:complete', (model) => {
      this.initialDate = model.get('local_start_datetime') || model.get('hearing_start_datetime');
      this.renderSubSchedule();
    });
    modalChannel.request('add', modalCreateHearing);
  },

  clickMoveHearings() {
    const bulkMoveHearingsModal = new ModalBulkMoveHearings();
    modalChannel.request('add', bulkMoveHearingsModal);

    this.listenTo(bulkMoveHearingsModal, 'removed:modal', this.clickRefresh, this);
  },

  initialize(options) {
    // Detect which item should be selected based on the route
    // NOTE: initialHearingId and initialFileNumber are only used on the Scheduling History sub-page
    this.mergeOptions(options, ['initialDate', 'initialOwner', 'initialHearingId', 'initialFileNumber', 'daily', 'personal', 'monthly', 'yearly', 'history', 'onHold']);

    this.createSubModels();
    this.setupListeners();
  },

  _getAllArbOptions() {
    return _.sortBy(_.map(userChannel.request('get:arbs', { all: true }), function(arbitrator) {
      return { text: `${Formatter.toUserLevelDisplay(arbitrator)}: ${!arbitrator.isActive()?'** ':''}${arbitrator.getDisplayName()}`, value: String(arbitrator.id), isActive: arbitrator.isActive() };
    }), function(option) { return ((option.isActive && option.text) || 'zzzz').toLowerCase(); });
  },

  createSubModels() {

    const hasRoutingValue = this.daily ? DAILY_SCHEDULE_CODE :
      this.personal ? PERSONAL_SCHEDULE_CODE :
      this.monthly ? MONTHLY_SCHEDULE_CODE :
      this.yearly ? YEARLY_SCHEDULE_CODE :
      this.history ? SCHEDULING_HISTORY_CODE :
      this.onHold ? ON_HOLD_HEARINGS_CODE :
      null

    this.scheduleTypeModel = new DropdownModel({
      optionData: [{ value: DAILY_SCHEDULE_CODE, text: 'Daily' },
      { value: PERSONAL_SCHEDULE_CODE, text: 'Personal' },
      { value: MONTHLY_SCHEDULE_CODE, text: 'Monthly' },
      { value: YEARLY_SCHEDULE_CODE, text: 'Yearly' },
      { value: SCHEDULING_HISTORY_CODE, text: 'Scheduling History' },
      { value: ON_HOLD_HEARINGS_CODE, text: 'On Hold Hearings' }],
      value: hasRoutingValue ? hasRoutingValue : DAILY_SCHEDULE_CODE
    });

    this.inactiveModel = new CheckboxModel({
      html: 'Include inactive staff (**)',
      checked: !!this.model.get('showInactiveUsers')
    });

    const arbOptions = this._getAllArbOptions();
    const currentUserModel = sessionChannel.request('get:user');
    const currentUserId = currentUserModel.id;
    const arbOptionsContainInitialOwner = this.initialOwner && _.findWhere(arbOptions, { value: String(this.initialOwner) });
    const arbOptionsContainCurrentUser = _.findWhere(arbOptions, { value: String(currentUserId) });
    
    this.arbitratorDropdownModel = new DropdownModel({
      optionData: arbOptions,
      value: arbOptionsContainInitialOwner ? String(this.initialOwner) :
        arbOptionsContainCurrentUser ? String(currentUserId) :
        arbOptions.length ? arbOptions[0].value :
        null
    });

    // Now set the correct initial arb picklist values based on filter selection
    this.onChangeFilterCheckbox(this.inactiveModel, this.inactiveModel.get('checked'));
  },

  setupListeners() {
    this.listenTo(this.scheduleTypeModel, 'change:value', this.onChangeScheduleType, this);
    this.listenTo(this.arbitratorDropdownModel, 'change:value', () => this.render());
    this.listenTo(this.inactiveModel, 'change:checked', this.onChangeFilterCheckbox, this);
  },

  onChangeScheduleType() {
    // Always un-set the date when moving to a new view
    this.initialDate = null;
    this.render();
  },

  onChangeFilterCheckbox(checkboxModel, isChecked) {
    this.model.set({ showInactiveUsers: isChecked });
    if (this._isDailySelected()) {
      const subView = this.getChildView('scheduleSubViewRegion');
      if (subView && _.isFunction(subView.filterActiveUsers)) {
        subView.filterActiveUsers(isChecked);
      }
    }

    // Always update the dropdown when the filter is updated
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

  _isDailySelected() {
    return this.scheduleTypeModel.getData() === DAILY_SCHEDULE_CODE;
  },

  _isPersonalSelected() {
    return this.scheduleTypeModel.getData() === PERSONAL_SCHEDULE_CODE;
  },

  _isMonthlySelected() {
    return this.scheduleTypeModel.getData() === MONTHLY_SCHEDULE_CODE;
  },

  _isYearlySelected() {
    return this.scheduleTypeModel.getData() === YEARLY_SCHEDULE_CODE;
  },

  _isHistorySelected() {
    return this.scheduleTypeModel.getData() === SCHEDULING_HISTORY_CODE;
  },

  _onHoldHearings() {
    return this.scheduleTypeModel.getData() === ON_HOLD_HEARINGS_CODE;
  },

  onRender() {
    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `Schedule Page`
    }));
    this.showChildView('scheduleTypeRegion', new DropdownView({ model: this.scheduleTypeModel }));
    this.showChildView('calendarArbitratorRegion', new DropdownView({ model: this.arbitratorDropdownModel }));
    this.showChildView('showInactiveRegion', new CheckboxView({ model: this.inactiveModel }));

    this.renderSubSchedule();
  },

  addCalendarScrollFn() {
    this.$el.addCalendarScrollFn(...arguments);
  },

  renderSubSchedule() {
    $('.page-view').off('scroll.rtb_calendar');
    if (this._isDailySelected()) {
      this.renderDailySchedule();
    } else if (this._isPersonalSelected()) {
      this.renderPersonalSchedule();
    } else if (this._isMonthlySelected()) {
      this.renderMonthlySchedule();
    } else if (this._isYearlySelected()) {
      this.renderYearlySchedule();
    } else if (this._isHistorySelected()) {
      this.renderHistorySchedule();
    } else if (this._onHoldHearings()) {
      this.renderOnHoldHearings();
    }
  },

  _updateRouting(routingItemId, optionalParam=null) {
    const parsedRoute = routeParse(routingItemId, null, optionalParam);
    Backbone.history.navigate(parsedRoute, { trigger: false, replace: false });
  },

  renderDailySchedule() {
    this.showChildView('scheduleSubViewRegion', new DailyScheduleView({
      initialDate: this.initialDate,
      filterInactive: !this.inactiveModel.getData(),
      addCalendarScrollFn: this.addCalendarScrollFn,
      model: this.model
    }));
    menuChannel.trigger('update:menu:item', { item_id: ROUTE_NAME, title: DAILY_MENU_NAME });
  },

  renderPersonalSchedule() {
    const currentPickedUser = this.arbitratorDropdownModel.getData({ parse: true });
    this.showChildView('scheduleSubViewRegion', new PersonalScheduleView({
      currentPickedUser,
      addCalendarScrollFn: this.addCalendarScrollFn,
    }));
    menuChannel.trigger('update:menu:item', { item_id: ROUTE_NAME, title: PERSONAL_MENU_NAME });
  },

  renderMonthlySchedule() {
    this.showChildView('scheduleSubViewRegion', new MonthlyScheduleView({ initialDate: this.initialDate, model: this.model }));
    menuChannel.trigger('update:menu:item', { item_id: ROUTE_NAME, title: MONTHLY_MENU_NAME });
  },

  renderYearlySchedule() {
    this._updateRouting('scheduled_hearings_yearly_item');
    this.showChildView('scheduleSubViewRegion', new YearlyScheduleView({ model: this.model }));
    menuChannel.trigger('update:menu:item', { item_id: ROUTE_NAME, title: YEARLY_MENU_NAME });
  },

  renderHistorySchedule() {
    if (this.initialHearingId) {
      this._updateRouting('scheduled_hearings_history_param_item', this.initialHearingId);
    } else if (this.initialFileNumber) {
      this._updateRouting('scheduled_hearings_history_dispute_param_item', this.initialFileNumber);
    } else {
      this._updateRouting('scheduled_hearings_history_item');
    }
    this.showChildView('scheduleSubViewRegion', new HistoryScheduleView({ model: this.model, hearingId: this.initialHearingId, fileNumber: this.initialFileNumber }));
    menuChannel.trigger('update:menu:item', { item_id: ROUTE_NAME, title: HISTORY_MENU_NAME });
  },

  renderOnHoldHearings() {
    this._updateRouting('scheduled_hearings_on_hold_item');
    this.showChildView('scheduleSubViewRegion', new ScheduleHoldHearings());
  },

  templateContext() {
    return {
      isDaily: this._isDailySelected(),
      isPersonal: this._isPersonalSelected(),
      isYearly: this._isYearlySelected(),
      isHistory: this._isHistorySelected(),
      scheduleType: this.scheduleTypeModel.getSelectedText(),
      scheduleUser: this._isPersonalSelected() ? ` - ${this.arbitratorDropdownModel.getSelectedText()}` : ''
    };
  }

});
