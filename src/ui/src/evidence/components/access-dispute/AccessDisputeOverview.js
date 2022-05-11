import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './AccessDisputeOverview_template.tpl';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'dac__dispute-overview-container',

  ui: {
    logoutLink: '.dac__logout-link'
  },

  events: {
    'click @ui.logoutLink': 'clickLogoutLink'
  },

  clickLogoutLink() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  initialize() {
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
  },

  templateContext() {
    const dispute = disputeChannel.request('get');
    const participant = dispute ? participantsChannel.request('get:participant', dispute.get('tokenParticipantId')) : null;
    const hearingStartDate = dispute && dispute.get('hearingStartDate');
    const hearingDateDisplay = hearingStartDate && Moment().isBefore(Moment(hearingStartDate), 'minute') ? Formatter.toDateAndTimeDisplay(dispute.get('hearingStartDate'), this.RTB_OFFICE_TIMEZONE_STRING) : 'Not scheduled' 
    
    return {
      Formatter,
      dispute,
      hearingDateDisplay,
      participantInitials: participant && participant.getInitialsDisplay() ? participant.getInitialsDisplay() : '-',
      isApplicant: participant && participant.isApplicant()
    };
  }
});
