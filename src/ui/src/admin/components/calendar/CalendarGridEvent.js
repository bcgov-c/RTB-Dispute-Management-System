import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import CalendarGridEventMenuView from './CalendarGridEventMenu';
import CalendarGridLinkMenuView from './CalendarGridLinkMenu';
import CalendarGridEventDetailView from './CalendarGridEventDetail';
import HearingHoldIcon from '../../static/Icon_HearingHold_LRG.png';
import { routeParse } from '../../routers/mainview_router';
import template from './CalendarGridEvent_template.tpl';

const LINK_MENU_EVENT = 'calendar:menu:link';
const CALENDAR_MENU_EVENT = 'calendar:menu';

export default Marionette.View.extend({
  template,

  regions: {
    menuRegion: '.calendar-grid-event-menu',
    linkMenuRegion: '.calendar-grid-link-menu',
    todayCalendarEventDetail: '.today-calendar-event-detail'
  },

  ui: {
    eventText: '.calendar-grid-event-text.clickable',
    openTodayFiles: '.today-calendar-event-link'
  },

  events: {
    'click @ui.eventText': 'clickEventText'
  },

  clickEventText() {
    if (!this.primaryDisputeHearing || this.primaryDisputeHearing.isExternal()) {
      // No click action when unassigned or external hearing
      return;
    }
    Backbone.history.navigate(routeParse('overview_item', this.primaryDisputeHearing.get('dispute_guid')), { trigger: true });
  },

  initialize(options) {
    this.mergeOptions(options, ['calendarModel', 'gridCellWidth', 'isToday', 'calendarItemMenuFn']);
    this.calendarItemMenuFn = _.isFunction(this.calendarItemMenuFn) ? this.calendarItemMenuFn : () => {};
    const secondaryDisputeHearings = this.model.getSecondaryDisputeHearings();
    const firstSecondaryDisputeHearing = secondaryDisputeHearings.length ? secondaryDisputeHearings[0] : null;

    this.disputeHearings = this.model.getDisputeHearings();
    this.primaryDisputeHearing = this.model.getPrimaryDisputeHearing();
    this.text = this.primaryDisputeHearing ? this.primaryDisputeHearing.getFileNumber() : (firstSecondaryDisputeHearing ? firstSecondaryDisputeHearing.getFileNumber() : null);
    this.startHour = this._convertDateToDecimalHourStart(this.model.get('local_start_datetime'));
    this.endHour = this._convertDateToDecimalHourStart(this.model.get('local_end_datetime'));
    this.linkMenuOptions = this._createLinkMenuOptions();
    this.calendarMenuOptions = this.calendarItemMenuFn(this.model)
    this.moderatorCode = this.model.get('moderator_code');
    this.webPortalLogin = this.model.getWebPortalLoginDisplay();

    this.setupListeners();
  },

  _convertDateToDecimalHourStart(dateString) {
    return Moment(dateString).hour() + Number(Moment(dateString).minute() / 60);
  },

  calculateEventStartXPosition() {
    const startOffsetInCellHour = this.startHour % 1;
    return this.gridCellWidth * startOffsetInCellHour;
  },

  calculateEventWidth() {
    return this.gridCellWidth * (this.endHour - this.startHour);
  },

  _createLinkMenuOptions() {
    const disputeHearings = this.model.getDisputeHearings();
    if (!this.model.isAssigned() || disputeHearings.length === 1) {
      return [];
    }

    const sortedDisputeHearings = disputeHearings.sortBy(function(model) { return model.isPrimary() ? '1' : String(model.getFileNumber()); });
    return _.map(sortedDisputeHearings, function(disputeHearing) {
      const fileNumber = disputeHearing.getFileNumber();
      const importanceText = disputeHearing.isPrimary() ? 'Primary' : 'Secondary';
      return {
        menuLabel: `${fileNumber} ${importanceText}`,
        event: LINK_MENU_EVENT,
        disputeHearing
      };
    });
  },

  setupListeners() {
    this.listenTo(this.calendarModel, 'update:menu:option', (hearingId, menuData) => {
      if (!this.isRendered()) return;
      const menuOptionId = menuData.menuOptionId;
      const menuOptionEle = $(`*[data-hearing-id=${hearingId}]`).find(`*[data-menu-option-id=${menuOptionId}]`);
      console.log(menuOptionEle);
      if (!menuOptionEle || !menuOptionEle.length) return;

      // Clear all classes and add back in the default class, then any extras
      menuOptionEle.removeClass().addClass('calendar-grid-event-menu-item');
      if (menuData.cssClass) menuOptionEle.addClass(menuData.cssClass);
      menuOptionEle.data('event', menuData.event);
      menuOptionEle.html(menuData.menuLabel);
    });
  },

  onRender() {
    this.$('.today-calendar-grid-time-item').attr('style', `width: ${this.gridCellWidth}px`);

    if (!this.calendarModel.get('hideMenu') && !_.isEmpty(this.calendarMenuOptions)) {
      this.showChildView('menuRegion', new CalendarGridEventMenuView({
        model: this.model,
        genericEventName: CALENDAR_MENU_EVENT,
        menuOptions: this.calendarMenuOptions
      }));
    }

    if (!_.isEmpty(this.linkMenuOptions)) {
      this.showChildView('linkMenuRegion', new CalendarGridLinkMenuView({ model: this.model, linkMenuOptions: this.linkMenuOptions }));
    }

    if (this.isToday) {
      this.showChildView('todayCalendarEventDetail', new CalendarGridEventDetailView({
        model: this.model,
        disputeHearings: this.disputeHearings,
        moderatorCode: this.moderatorCode,
        webPortalLogin: this.webPortalLogin
      }));
    }

    clearInterval(this.interval);
    if (!this.isToday && this.model.isActive()) {
      this.interval = setInterval(() => {
        if (!this.model.isActive()) {
          clearInterval(this.interval);
          this.calendarMenuOptions = this.calendarItemMenuFn(this.model)
          this.render();
        }
      }, 60000);
    }

    this.setupViewListeners();
  },

  onDestroy() {
    clearInterval(this.interval);
  },


  setupViewListeners() {
    const menuView = this.getChildView('menuRegion');
    const linkMenuRegion = this.getChildView('linkMenuRegion');

    if (menuView) {
      // Handle generic menu events on the main Calendar model, passing the HearingId of this event to those handlers
      this.stopListening(menuView, CALENDAR_MENU_EVENT);
      this.listenTo(menuView, CALENDAR_MENU_EVENT, function(eventName) {
        this.calendarModel.trigger(eventName, this.model.id);
      });
    }

    if (linkMenuRegion) {
      this.stopListening(linkMenuRegion, LINK_MENU_EVENT);
      this.listenTo(linkMenuRegion, LINK_MENU_EVENT, function(disputeHearing) {
        if (disputeHearing.isExternal()) {
          // No click navigate action when external hearing
          return;
        }
        Backbone.history.navigate(routeParse('overview_item', disputeHearing.get('dispute_guid')), { trigger: true });
      });
    }
  },


  templateContext() {
    const priority = this.model.get('hearing_priority');
    const isReserved = this.model.isReserved();

    return {
      text: this.text,
      hasDisputeGuid: !!(this.primaryDisputeHearing && this.primaryDisputeHearing.get('dispute_guid')),
      cssClass: (this.text ? `calendar-grid-event-bg${priority}--dark` : `calendar-grid-event-bg${priority}--light`)
        + (this.model.isFaceToFace() ? ' calendar-grid-event--f2f' : '')
        + (this.linkMenuOptions && this.linkMenuOptions.length ? ' calendar-grid-event--linked' : ''),
      startXPosition: this.calculateEventStartXPosition(),
      eventBarWidth: this.calculateEventWidth(),
      isToday: this.isToday,
      HearingHoldIcon,
      isReserved
    };
  }

});
