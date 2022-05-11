import ParticipantModel from '../../../core/components/participant/Participant_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const api_name = 'externalupdate/participant';

export default ParticipantModel.extend({
  urlRoot() {
    if (this.isNew()) {
      alert("[Error] Can't POST a new party as an external user");
      return;
    }
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}`;
  }
});