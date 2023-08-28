import Radio from 'backbone.radio';
import ServiceModel from '../../../core/components/service/Service_model';

const api_name = 'noticeservice';

const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');

export default ServiceModel.extend({
  idAttribute: 'notice_service_id',

  defaults() {
    return Object.assign({}, ServiceModel.prototype.defaults, {
      notice_service_id: null,
      notice_id: null
    });
	},

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}/${ this.isNew() ? this.get('notice_id') : '' }`;
  },

  getParentNoticeModel() {
    return noticeChannel.request('get:by:id', this.get('notice_id'));
  }
});
