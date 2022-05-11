import DisputeStatus from '../../../core/components/dispute/DisputeStatus_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const api_name = 'externalupdate/disputestatus';

export default DisputeStatus.extend({
  urlRoot() {
    if (this.isNew()) {
    	return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${this.get('file_number')}`;
    } else {
    	alert("[Error] Only POST is supported for external users modifying status.")
    }
  }
});