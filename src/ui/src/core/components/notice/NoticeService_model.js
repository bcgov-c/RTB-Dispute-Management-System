import Radio from 'backbone.radio';
import FileDescriptionModel from '../../../core/components/files/file-description/FileDescription_model';
import ServiceModel from '../../../core/components/service/Service_model';

const api_name = 'noticeservice';

const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

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

  // NOTE: Creates but does not save the notice file description
  createNoticeServiceFileDescription() {
    const parentNotice = this.getParentNoticeModel();
    const nounToUse = parentNotice && parentNotice.isAmendmentNotice() ? 'Amendment' : 'Notice';
    
    return new FileDescriptionModel({
      title: `${nounToUse} Service Proof - Uploaded ${Formatter.toDateDisplay(Moment())}`,
      description: `Proof of ${nounToUse} Service Files`,
      description_by: participantsChannel.request('get:primaryApplicant:id'),
      description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_SERVICE_EVIDENCE')
    });
  },

  getParentNoticeModel() {
    return noticeChannel.request('get:by:id', this.get('notice_id'));
  }
});
