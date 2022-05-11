import DisputeModel from '../../../core/components/dispute/Dispute_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const api_name = 'externalupdate/disputeinfo';

export default DisputeModel.extend({
  urlRoot() {
    if (!this.isNew()) {
    	return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}`;
    } else {
    	alert("[Error] Cannot create a new dispute using this API as an external user.");
    }
  },

  save(attrs, options) {
    options = _.extend({}, options, { skip_conflict_check: true });
    return DisputeModel.prototype.save.bind(this)(attrs, options);
  }
});