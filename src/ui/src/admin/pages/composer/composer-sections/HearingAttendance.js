import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './HearingAttendance_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  hearingChannel = Radio.channel('hearings'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-hearing-attendance`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_HEARING_ATTENDANCE');
  },
  title: 'Section 2: Hearing Attendance',
  hasRefresh: true,

  _getParticipationDisplayFor(participation_models, landlordOrTenant) {
    const isDocPublic = this.model.isDocPublic();
    // Only show saved hearing participations who attended
    return _.map(_.filter(participation_models, function(p) { return !p.isNew() && p.didAttend(); }), function(p) {
      if (p.isOther()) {
        return isDocPublic ? 'Other Attendee' :
          `${p.get('other_participant_name')}${p.get('other_participant_title')? ` - ${p.get('other_participant_title')}`:''}`;
      } else {
        const participant_model = p.get('participant_model');
        return `${isDocPublic ? '' : `${participant_model.getContactName()} - `}${landlordOrTenant} (${participant_model.get('name_abbreviation')})`;
      }
    });
  },
  generateFn() {
    const dispute = disputeChannel.request('get');
    const dfd = $.Deferred();
    const self = this;
    
    this._getActiveHearingPromise(dispute).done(function(activeHearing) {
      if (!activeHearing) {
        dfd.resolve("No active hearing");
        return;
      }

      console.log(activeHearing);
  
      dfd.resolve(
        template({
          dispute,
          hearingDateDisplay: Formatter.toDateDisplay(activeHearing.get('local_start_datetime')),
          hearingTimeDisplay: Formatter.toTimeDisplay(activeHearing.get('local_start_datetime')),
          applicantParticipationsDisplay: self._getParticipationDisplayFor(
            activeHearing.getParticipations().getApplicantParticipations(), dispute.isLandlord()? 'Landlord':'Tenant'),
          respondentParticipationsDisplay: self._getParticipationDisplayFor(
            activeHearing.getParticipations().getRespondentParticipations(), dispute.isLandlord()? 'Tenant':'Landlord')
        })
      );
    }).fail(function() {
      console.log("[Error] Couldn't get active hearing for ", dispute);
      dfd.reject("<b><i>ERROR LOADING HEARING INFORMATION</i></b>");
    });

    return dfd.promise();
  },

  _getActiveHearingPromise(dispute) {
    const dfd = $.Deferred();
    hearingChannel.request('load', dispute.get('dispute_guid'))
    .done(function(hearingCollection) {
      dfd.resolve(hearingCollection.getActive());
    }).fail(function() {
      alert(`[Error] Unable to load hearing for cross app parent`);
      dfd.reject();
    });
    return dfd.promise();
  },

  links: [{
    text: 'Edit Hearing',
    actionFn() {
      Backbone.history.navigate(routeParse('hearing_item', disputeChannel.request('get:id')), { trigger: true });
    }
  }]
});