import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import template from './ScheduleStatisticLegend_template.tpl';

const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,

  initialize() {
    const self = this;
    const events = this.model.get('events');

    if (!_.isEmpty(events)) {
      _.each(events, function(event) {
        if (!_.isEmpty(event.month_details)) {
          self.eventDetails = event.month_details;
        }
        if (!_.isEmpty(event.year_details)) {
          self.eventDetails = event.year_details;
        }
      });
    }
  },

  templateContext() {
    return {
      eventDetails: this.eventDetails,
      priorityText: [
        configChannel.request('get', 'HEARING_PRIORITY_EMERGENCY_TEXT'),
        configChannel.request('get', 'HEARING_PRIORITY_STANDARD_TEXT'),
        configChannel.request('get', 'HEARING_PRIORITY_DEFERRED_TEXT'),
        configChannel.request('get', 'HEARING_PRIORITY_DUTY_TEXT')
      ]
    };
  }

});
