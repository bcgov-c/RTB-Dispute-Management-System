import Backbone from 'backbone';
import NoticeModel from './Notice_model';

export default Backbone.Collection.extend({
  model: NoticeModel,

  comparator(notice) {
    const version_number = notice.get('notice_version');
    if (version_number === null) {
      return -1000;
    }
    return -notice.get('notice_version');
  },

  getDisputeAndOtherNotices() {
    return this.filter((noticeModel) => noticeModel.isDisputeNotice() || noticeModel.isOtherNotice());
  },

  hasSavedDisputeOrOtherNotice() {
    return _.any(this.getDisputeAndOtherNotices(), (noticeModel) => !noticeModel.isNew());
  },

  getCurrentNotice() {
    const filteredNotices = this.filter(noticeModel => noticeModel.isDisputeNotice() || noticeModel.isOtherNotice());
    return filteredNotices.length ? filteredNotices[0] : null;
  },
});
