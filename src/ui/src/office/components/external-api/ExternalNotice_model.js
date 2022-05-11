import NoticeModel from '../../../core/components/notice/Notice_model';
import Radio from 'backbone.radio';

const api_name = 'externalupdate/notice';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');

export default NoticeModel.extend({
  urlRoot() {
    if (!this.isNew()) {
      alert("[Error] Can only POST a new notice as an external user");
      return;
    }
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${disputeChannel.request('get:id')}`;
  }
});