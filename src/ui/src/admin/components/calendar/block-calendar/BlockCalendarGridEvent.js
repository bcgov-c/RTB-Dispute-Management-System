import Marionette from 'backbone.marionette';
import HearingHoldIcon from '../../../static/Icon_HearingHold_LRG.png';
import template from '../CalendarGridEvent_template.tpl';

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

  initialize(options) {
    this.mergeOptions(options, ['calendarModel', 'gridCellWidth', 'isToday']);

    this.text = `Block type: ${this.model.get('block_type')}`;
    this.startHour = this._convertDateToDecimalHourStart(this.model.get('block_start'));
    this.endHour = this._convertDateToDecimalHourStart(this.model.get('block_end'));
    this.menuOptions = [];//this.isToday ? [] : this._createMenuOptions();
    this.linkMenuOptions = [];//this._createLinkMenuOptions();    
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

  onRender() {
    this.$('.today-calendar-grid-time-item').attr('style', `width: ${this.gridCellWidth}px`);
  },

  templateContext() {
    const isReserved = false;
    const hasDisputeGuid = false;
    return {
      text: this.text,
      hasDisputeGuid,
      startXPosition: this.calculateEventStartXPosition(),
      eventBarWidth: this.calculateEventWidth(),
      isToday: this.isToday,
      HearingHoldIcon,
      isReserved
    };
  }

});
