import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import CalendarGridModel from '../../components/calendar/CalendarGrid_model';
import CalendarGridView from '../../components/calendar/CalendarGrid';
import HearingModel from '../../../core/components/hearing/Hearing_model';
import ModalEditHearingLinkView from '../../components/hearing/modals/modal-edit-hearing-link/ModalEditHearingLink';
import ModalDeleteHearingView from '../../components/hearing/modals/modal-hearing-deletes/ModalDeleteHearing';
import ModalRemoveHearingDisputesView from '../../components/hearing/modals/modal-hearing-deletes/ModalRemoveHearingDisputes';
import ModalHearingReassignView from '../../components/hearing/modals/modal-reassign-hearing/ModalHearingReassign';
import ModalHearingRescheduleView from '../../components/hearing/modals/modal-reschedule-hearing/ModalHearingReschedule';
import ModalAssignHearingView from '../../components/hearing/modals/modal-assign-hearing/ModalAssignHearing';
import ModalLinkingHistoryView from '../../components/hearing/modals/modal-linking-history/ModalLinkingHistory';
import ModalEditHearingView from '../../components/hearing/modals/modal-edit-hearing/ModalEditHearing';
import { routeParse } from '../../routers/mainview_router';
import template from './DailySchedule_template.tpl';
import CalendarLegend from '../../components/calendar-legend/CalendarLegend';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const MENU_OPTION_CLASS_ADJOURNED_CHECK = 'calendar-grid-event-menu-item--adjourned-check';
const MENU_OPTION_CLASS_ADJOURNED_CHECK_COMPLETE = 'calendar-grid-event-menu-item--adjourned-check-complete';
const MENU_OPTION_ID_ADJOURNED = 'menuAdjournId';
const MENU_OPTION_CLASS_ADJOURNED = 'calendar-grid-event-menu-item--adjourned';

const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'schedule-page-subview daily-schedule',

  regions: {
    calendarRegion: '@ui.calendar',
    calendarDateRegion: '.daily-schedule-calendar-date',
    calendarLegendRegion: '.calendar-legend',
  },

  ui: {
    calendar: '.daily-schedule-calendar-container',
    previousIcon: '.daily-schedule-calendar-previous',
    nextIcon: '.daily-schedule-calendar-next'
  },

  events: {
    'click @ui.nextIcon': 'clickNext',
    'click @ui.previousIcon': 'clickPrevious'
  },

  clickNext() {
    const newDateValue = Moment(this.calendarDateInputModel.getData({ parse: true })).add(1, 'day');
    this.calendarDateInputModel.set('value', newDateValue.format(InputModel.getLongDateFormat()) );
  },

  clickPrevious() {
    const newDateValue = Moment(this.calendarDateInputModel.getData({ parse: true })).subtract(1, 'day');
    this.calendarDateInputModel.set('value', newDateValue.format(InputModel.getLongDateFormat()) );
  },

  initialize(options) {
    this.mergeOptions(options, ['initialDate', 'filterInactive', 'addCalendarScrollFn']);

    if (!this.initialDate || !Moment(this.initialDate).isValid()) {
      this.initialDate = null;
    }
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.calendarGridModel = new CalendarGridModel({
      initialHour: 7,
      finalHour: 21,
      headerLabel: 'Staff Name'
    });

    this.calendarDateInputModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      labelText: 'Date',
      required: false,
      allowFutureDate: true,
      customLink: 'Today',
      customLinkFn() { this.trigger('update:input', Moment().format(InputModel.getLongDateFormat())) },
      value: (this.initialDate ? Moment(this.initialDate) : Moment()).format(InputModel.getLongDateFormat())
    });
  },

  setupListeners() {
    this.listenTo(this.calendarDateInputModel, 'change:value', (model, value) => {
      this.onCalendarDateChange(model, value);
      this.render();
    });
    
    this.listenTo(this.calendarGridModel, 'calendar:menu:link', _.bind(this.loadHearingAndShowModal, this, ModalEditHearingLinkView), this);
    this.listenTo(this.calendarGridModel, 'calendar:menu:remove', _.bind(this.loadHearingAndShowModal, this, ModalRemoveHearingDisputesView), this);
    this.listenTo(this.calendarGridModel, 'calendar:menu:delete', _.bind(this.loadHearingAndShowModal, this, ModalDeleteHearingView), this);
    this.listenTo(this.calendarGridModel, 'calendar:menu:assign', _.bind(this.loadHearingAndShowModal, this, ModalAssignHearingView), this);

    this.listenTo(this.calendarGridModel, 'calendar:menu:reschedule', (hearingId) => {
      this.loadHearingAndShowModal(ModalHearingRescheduleView, hearingId);
    });
    this.listenTo(this.calendarGridModel, 'calendar:menu:reassign', _.bind(this.loadHearingAndShowModal, this, ModalHearingReassignView), this);

    this.listenTo(this.calendarGridModel, 'calendar:menu:edit', _.bind(this.loadHearingAndShowModal, this, ModalEditHearingView), this);
    this.listenTo(this.calendarGridModel, 'calendar:menu:linkhistory', _.bind(this.loadHearingAndShowModal, this, ModalLinkingHistoryView), this);

    this.listenTo(this.calendarGridModel, 'calendar:menu:hearinghistory', (hearingId) => {
      Backbone.history.navigate(routeParse('scheduled_hearings_history_param_item', null, hearingId), { trigger: true });
    });
    this.listenTo(this.calendarGridModel, 'calendar:menu:reservation', this.reserveHearing, this);
    this.listenTo(this.calendarGridModel, 'calendar:menu:cancelreservation', this.cancelHearingReservation, this);
    this.listenTo(this.calendarGridModel, 'calendar:menu:checkadjourned', this.checkAdjourned, this);
  },

  getCalendarHearingModelFromId(hearingId) {
    const hearingLookups = this.calendarGridModel.get('hearingLookups') || {};
    return hearingLookups[hearingId];
  },

  reserveHearing(hearingId) {
    loaderChannel.trigger('page:load');
    this._loadHearingForHearingActionModal(hearingId)
      .then(() => new Promise((res, rej) => hearingChannel.request('reserve:hearing', hearingId).then(
          res, generalErrorFactory.createHandler('HEARING.RESERVATION', rej))))
    .finally(() => {
      this.render();
      loaderChannel.trigger('page:load:complete')
    });
  },

  cancelHearingReservation(hearingId) {
    this._loadHearingForHearingActionModal(hearingId).then(() => new Promise((res, rej) => hearingChannel.request('cancel:reserved', hearingId).then(
          res, generalErrorFactory.createHandler('HEARING.CANCEL.RESERVATION', rej))))
    .finally(() => {
      this.render();
      loaderChannel.trigger('page:load:complete')
    });
  },

  getCalendarItemMenuOptions(hearingModel) {
    if (!hearingModel) return [];
    
    const isHearingDatePassed = !hearingModel.isActive();
    const isReserved = hearingModel.isReserved();
    const menuOptionsWithLinkedHearing = [
      ...( isHearingDatePassed ? [] : [{ menuLabel: "Remove dispute(s)", event: "calendar:menu:remove" }] ),
      ...( isHearingDatePassed ? [] : [{ menuLabel: "Reassign (exchange)", event: "calendar:menu:reassign" }] ),
      ...( isHearingDatePassed ? [] : [{ menuLabel: "Reschedule", event: "calendar:menu:reschedule" }] ),
      ...( isHearingDatePassed ? [] : [{ menuLabel: "Edit linking", event: "calendar:menu:link" }] ),
      { menuLabel: "Edit hearing", event: "calendar:menu:edit" },
      { menuLabel: "View linking history", event: "calendar:menu:linkhistory" },
      { menuLabel: "View hearing history", event: "calendar:menu:hearinghistory" },
      { menuOptionId: MENU_OPTION_ID_ADJOURNED, menuLabel: "Check Adjourned", event: "calendar:menu:checkadjourned", cssClass: MENU_OPTION_CLASS_ADJOURNED }
    ];
    const menuOptionsWithoutLinkedHearing = [
      ...(!isReserved|| isHearingDatePassed ? [] : [{ menuLabel: "Cancel hold", event: "calendar:menu:cancelreservation" }]),
      ...(isHearingDatePassed || isReserved ? [] : [{ menuLabel: "Delete hearing", event: "calendar:menu:delete" }] ),
      ...(isReserved || isHearingDatePassed ? [] : [{ menuLabel: "Put on hold", event: "calendar:menu:reservation"}]),
      ...(isHearingDatePassed || isReserved ? [] : [{ menuLabel: "Book (assign)", event: "calendar:menu:assign" }] ),
      { menuLabel: "Edit hearing", event: "calendar:menu:edit" },
      { menuLabel: "View linking history", event: "calendar:menu:linkhistory" },
      { menuLabel: "View hearing history", event: "calendar:menu:hearinghistory" },
    ];
    return hearingModel.isAssigned() ? menuOptionsWithLinkedHearing : menuOptionsWithoutLinkedHearing;
  },

  checkAdjourned(hearingId) {
    if (this.dynamicMenuLoadInProgress) return;
    this.dynamicMenuLoadInProgress = true;
    let isAnyAdjourned = false;
    const adjournedCheckMenuOption = {
      menuOptionId: MENU_OPTION_ID_ADJOURNED,
      menuLabel: `<i>Checking...</i>`,
      event: 'calendar:menu:checkadjourned',
      cssClass: MENU_OPTION_CLASS_ADJOURNED_CHECK,
    };
    const getAdjournedCheckCompleteMenuOption = () => ({
      menuOptionId: MENU_OPTION_ID_ADJOURNED,
      menuLabel: `<i>${isAnyAdjourned ? 'Adjourned' : 'Not Adjourned'}</i><br/><span><i>Last check: ${Moment().format('h:mmA')}</i></span>`,
      event: 'calendar:menu:checkadjourned',
      cssClass: MENU_OPTION_CLASS_ADJOURNED_CHECK_COMPLETE,
    });

    this.calendarGridModel.trigger('update:menu:option', hearingId, adjournedCheckMenuOption);
    const hearingModel = new HearingModel({ hearing_id: hearingId });
    hearingModel.fetch().then(() => {
      return hearingChannel.request('check:adjourned', hearingModel)
    })
    .then(isAdjourned => {
      isAnyAdjourned = isAdjourned;
    }).always(() => {
      this.dynamicMenuLoadInProgress = false;
      this.calendarGridModel.trigger('update:menu:option', hearingId, getAdjournedCheckCompleteMenuOption());
    })
  },

  onCalendarDateChange(model, value) {
    if (!model.isValid() || !$.trim(model.getData())) {
      return;
    }

    model.set('value', Moment(value).format(InputModel.getLongDateFormat()));
    
    this.updatePageRouteAndTodayLink();
    model.trigger('render');
    this.loadHearings();
  },

  loadHearingAndShowModal(modalViewClass, hearingId) {
    this._loadHearingForHearingActionModal(hearingId)
      .then(hearingModel => this._showHearingActionModal(hearingModel, modalViewClass),
        // If state error, re-render page to show the updated hearings after fetch check
        () => this.render()
      ).finally(() => loaderChannel.trigger('page:load:complete'));
  },

  _loadHearingForHearingActionModal(hearingId, options={}) {
    // Perform a data load for updated info each time a hearing action is selected
    if (!options.no_loader) loaderChannel.trigger('page:load');
    
    let hearingModel = this.getCalendarHearingModelFromId(hearingId);
    let missingInitialState = false;
    if (!hearingModel) {
      missingInitialState = true;
      hearingModel = new HearingModel({ hearing_id: hearingId });
    }
    this.stopListening(hearingModel, 'hearings:refresh', this.loadHearings);
    this.listenTo(hearingModel, 'hearings:refresh', this.loadHearings, this);
    
    return new Promise((resolve, reject) => (missingInitialState ?
        hearingModel.fetch().then(() => resolve(hearingModel)) :
        hearingModel.withStateCheck(
          () => resolve(hearingModel),
          () => hearingChannel.request('show:invalid:modal').finally(reject),
          reject
        )
      ).catch(reject)
    );
  },

  _showHearingActionModal(hearingModel, modalViewClass) {
    // Setup listeners on the hearing and dispute for a re-load of underlying page
    const modal = new modalViewClass({ model: hearingModel });
    this.listenTo(modal, 'save:complete', this.loadHearings, this);
    modalChannel.request('add', modal);
  },

  updateDateTo(momentDate) {
    this.calendarDateInputModel.set('value', Moment(momentDate).format(InputModel.getLongDateFormat()));
  },

  getSelectedDate() {
    return this.calendarDateInputModel.getData({ parse: true });
  },

  filterActiveUsers(showAll) {
    this.filterInactive = !showAll;
    this.renderCalendarView();
  },

  loadHearings(options={}) {
    this.loaded = false;
    if (!options.no_loader) {
      loaderChannel.trigger('page:load');
    }

    if (!this.calendarDateInputModel.isValid()) {
      return;
    }

    const dateToLoad = this.calendarDateInputModel.getData({ parse: true });
    hearingChannel.request('get:by:day', dateToLoad).done((response={}) => {
      this.loaded = true;
      this.calendarGridModel.parseDailyFromApi(response);
      this.renderCalendarView();
    }).always(function() {
      loaderChannel.trigger('page:load:complete');
    });
  },

  updatePageRouteAndTodayLink() {
    const selectedDate = this.calendarDateInputModel.getData({ format: 'date' });
    if (selectedDate) {
      Backbone.history.navigate(routeParse('scheduled_hearings_daily_param_item', null, selectedDate), { trigger: false, replace: true });
    }

    // Don't show the "Today" link when it IS today
    this.calendarDateInputModel.set('customLink', Moment(new Date(this.calendarDateInputModel.getData())).isSame(Moment(), 'day') ? ' ' : 'Today', { silent: true });
  },

  onRender() {
    this.updatePageRouteAndTodayLink();

    this.showChildView('calendarLegendRegion', new CalendarLegend());
    this.showChildView('calendarDateRegion', new InputView({ model: this.calendarDateInputModel}))
    this.loadHearings();
    if (!this.loaded) {
      return;
    }
    this.renderCalendarView();
    
    loaderChannel.trigger('page:load:complete');
  },

  renderCalendarView() {
    if (!this.getRegion('calendarRegion')) return;
    this.showChildView('calendarRegion', new CalendarGridView({ model: this.calendarGridModel, calendarOptionsFn: this.getCalendarItemMenuOptions }));
    
    const calendarGridView = this.getChildView('calendarRegion');
    if (!calendarGridView) {
      return;
    }
    if (this.filterInactive) {
      calendarGridView.switchToFilteredEvents();
    } else {
      calendarGridView.switchToNormalEvents();
    }

    if (_.isFunction(this.addCalendarScrollFn) && !$('.page-view').hasClass('floatingHeaderMode')) {
      this.addCalendarScrollFn(
        '.schedule-calendar-year-month-dropdown-container',
      );
    } else {
      $('.page-view').trigger('scroll.rtb_calendar');
    }

    // Trigger a click on calendar body to get rid of any floating date selection
    calendarGridView.$el.trigger('mousedown');

    // Toggle correct horizontal scrolling:
    const el = this.getUI('calendar');
    el?.scrollLeft(125);
    
    localStorage.setItem('latestSchedulePageRoute', Backbone.history.getFragment());
  },

  templateContext() {
    return {
      isLoaded: this.loaded,
      printDate: this.calendarDateInputModel.getData() ? Formatter.toDateDisplay(this.calendarDateInputModel.getData()) : ''
    };
  }
});
