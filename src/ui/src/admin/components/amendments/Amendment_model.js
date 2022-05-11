import CMModel from '../../../core/components/model/CM_model';
import Radio from 'backbone.radio';

const api_name = 'amendment';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default CMModel.extend({
  idAttribute: 'amendment_id',
  defaults: {
    amendment_id: null,
    amendment_title: null,
    amendment_to: null,
    amendment_change_type: null,
    amendment_change_html: null,
    amendment_submitter_id: null,
    amendment_pending_data: null,
    amendment_status: null,
    amendment_description: null,
    amendment_file_id: null,
    amendment_source: null,
    notice_id: null,
    include_in_decision: 0,
    is_internally_initiated: false,

    created_date: null,
    modified_date: null,
    created_by: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'amendment_title',
    'amendment_to',
    'amendment_change_type',
    'amendment_change_html',
    'amendment_submitter_id',
    'amendment_pending_data',
    'amendment_status',
    'amendment_description',
    'amendment_file_id',
    'amendment_source',
    'notice_id',
    'include_in_decision',
    'is_internally_initiated'
  ],

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  hasAssociatedToNotice() {
    return !!this.get('notice_id');
  },

  isAssociatedToNoticeId(noticeId) {
    return noticeId && noticeId === this.get('notice_id');
  }

});
