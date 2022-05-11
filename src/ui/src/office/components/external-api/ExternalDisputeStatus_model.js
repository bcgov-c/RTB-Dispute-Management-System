import DisputeStatusModel from '../../../core/components/dispute/DisputeStatus_model';
import Radio from 'backbone.radio';

const api_name = 'externalupdate/disputestatus';
const configChannel = Radio.channel('config');

export default DisputeStatusModel.extend({
  urlRoot() {
    if (this.isNew()) {
    	return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${this.get('file_number')}`;
    } else {
    	alert("[Error] Can't do anything besides a POST on status as an external user.")
    }
  }
});