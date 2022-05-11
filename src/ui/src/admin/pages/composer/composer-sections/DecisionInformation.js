import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './DecisionInformation_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  participantsChannel = Radio.channel('participants'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-decision-information`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_DECISION_INFO');
  },
  title: 'Section 1: Decision Information',
  hasRefresh: true,
  generateFn() {
    const dispute = disputeChannel.request('get'),
      applicants = participantsChannel.request('get:applicants'),
      respondents = participantsChannel.request('get:respondents'),
      isDocPublic = this.model.isDocPublic();
    
    console.log(this, this.model);
    let parentCrossAppDisplay, 
      childCrossAppDisplay;
      
    if (dispute.isCrossAppParent()) {
      parentCrossAppDisplay = `<b>${dispute.get('file_number')}</b> (${dispute.isLandlord()?'Landlord':'Tenant'})`;
      childCrossAppDisplay = `<b>${dispute.get('cross_app_file_number')}</b> (${dispute.isLandlord()?'Tenant':'Landlord'})`;
    } else if (dispute.isCrossAppChild()) {
      childCrossAppDisplay = `<b>${dispute.get('file_number')}</b> (${dispute.isLandlord()?'Landlord':'Tenant'})`;
      parentCrossAppDisplay = `<b>${dispute.get('cross_app_file_number')}</b> (${dispute.isLandlord()?'Tenant':'Landlord'})`;
    }

    return template({
      isDocPublic,
      dispute,
      fileNumberDisplay: dispute.isCrossApp() ? `${parentCrossAppDisplay}, ${childCrossAppDisplay}` : `<b>${dispute.get('file_number')}</b>`,
      decisionDateDisplay: Formatter.toDateDisplay(Moment()), // TODO: Add real date
      applicantsDisplay: applicants.map(function(participant, index) {
        return `${isDocPublic ? '' : `${participant.getDisplayName()} - `}Landlord ${index+1} (${participant.get('name_abbreviation')})`;
      }),
      respondentsDisplay: respondents.map(function(participant, index) {
        return `${isDocPublic ? '' : `${participant.getDisplayName()} - `}Tenant ${index+1} (${participant.get('name_abbreviation')})`;
      }),
      addressDisplay: dispute.getAddressString()
    });
  },
  links: [{
    text: 'Edit Dispute',
    actionFn() {
      Backbone.history.navigate(routeParse('overview_item', disputeChannel.request('get:id')), { trigger: true });
    }
  }]
});