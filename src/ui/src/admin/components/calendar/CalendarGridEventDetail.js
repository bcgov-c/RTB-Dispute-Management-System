import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { routeParse } from '../../routers/mainview_router';
import template from './CalendarGridEventDetail_template.tpl';

const menuChannel = Radio.channel('menu');

export default Marionette.View.extend({
  template,

  ui: {
    openTodayFiles: '.today-calendar-event-link'
  },

  events: {
    'click @ui.openTodayFiles': 'clickOpenTodayFiles',
  },

  clickOpenTodayFiles() {
    if (!this._hasDisputeHearings()) {
      console.log(`[Warning] No dispute hearings for 'Open Files' event`, this);
      return;
    }

    const primaryDisputeHearing = this.disputeHearings.getPrimary();
    let disputeHearingToNavigateTo = primaryDisputeHearing && !primaryDisputeHearing.isExternal() ? primaryDisputeHearing : null;

    _.each(this.disputeHearings.getSecondaries(), function(disputeHearing) {
      if (disputeHearing.isExternal()) {
        return;
      }
      if (!disputeHearingToNavigateTo) {
        disputeHearingToNavigateTo = disputeHearing;
      }
      menuChannel.trigger('add:dispute', disputeHearing.get('file_number'), disputeHearing.get('dispute_guid'));
    });
    
    if (disputeHearingToNavigateTo) {
      Backbone.history.navigate(routeParse('overview_item', disputeHearingToNavigateTo.get('dispute_guid')), { trigger: true });
    }
  },

  _hasDisputeHearings() {
    return !_.isEmpty(this.disputeHearings) && !this.disputeHearings.isEmpty();
  },

  initialize(options) {
    this.mergeOptions(options, ['disputeHearings', 'moderatorCode', 'webPortalLogin']);
  },

  templateContext() {
    return {
      moderatorCode: this.moderatorCode,
      webPortalLogin: this.webPortalLogin,
      hasDisputeHearings: this._hasDisputeHearings()
    };
  }
});
