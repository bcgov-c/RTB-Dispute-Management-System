import NoticeServiceModel from '../../../core/components/notice/NoticeService_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const api_name = 'externalupdate/noticeservice';

export default NoticeServiceModel.extend({
  urlRoot() {
    if (this.isNew()) {
      alert("[Error] Can't POST a new notice service as an external user");
      return;
    }
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}`;
  }
});