import Participant_model from "../../participant/Participant_model";
import Radio from "backbone.radio";

const configChannel = Radio.channel('config');

export default Participant_model.extend({

  hasDisplayNameInfoEntered() {
    return this.get('p_business_name')
      || (this.get('p_first_name') && this.get('p_last_name'))
      || (this.get('p_business_contact_first_name') && this.get('p_business_contact_last_name'));
  },

  // Override to provide CEU business data/lookups
  getDisplayName() {
    return this.get('p_business_name') ? this.get('p_business_name')
      : this.get('p_business_contact_first_name') ? `${this.get('p_business_contact_first_name')} ${this.get('p_business_contact_last_name')}`
      : `${this.get('p_first_name')} ${this.get('p_last_name')}`;
  },

  getContactName() {
    return this.get('p_business_name') || this.get('p_business_contact_first_name') ? `${this.get('p_business_contact_first_name')} ${this.get('p_business_contact_last_name')}`
      : `${this.get('p_first_name')} ${this.get('p_last_name')}`;
  },

  getTypeDisplay() {
    const CEU_PARTICIPANT_TYPE_DISPLAYS = configChannel.request('get', 'CEU_PARTICIPANT_TYPE_DISPLAYS') || {};
    return CEU_PARTICIPANT_TYPE_DISPLAYS[this.get('p_participant_type')];
  },

});
