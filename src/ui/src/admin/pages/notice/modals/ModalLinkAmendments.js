import Radio from 'backbone.radio';
import AmendmentCollection from '../../../components/amendments/Amendment_collection';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ModalLinkAmendmentItemsView from './ModalLinkAmendmentItems';
import template from './ModalLinkAmendments_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const amendmentsChannel = Radio.channel('amendments');
const noticeChannel = Radio.channel('notice');
const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'addNotice-modal',
  
  regions : {
    noticeAmendments: '.notice-amendment-available-amendments'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      noticeFilename: '.filename-download',
      linkAmendments: '.btn-primary'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.noticeFilename': 'clickNoticeFilename',
      'click @ui.linkAmendments': 'clickLinkAmendments'
    });
  },

  clickNoticeFilename(ev) {
    const ele = $(ev.currentTarget);
    const fileId = ele.data('fileId');
    const matchingNoticeFileModel = fileId && _.find(this.noticeFileModels, function(fileModel) { return fileModel.get('file_id') === Number(fileId); });
    if (matchingNoticeFileModel) filesChannel.request('click:filename:preview', ev, matchingNoticeFileModel, { fallback_download:true });
    else console.log(`[Warning] No matching file id found for ${fileId}`, ev, this.noticeFileModels);
  },

  clickLinkAmendments() {
    const noticeId = this.model.get('notice_id');
    
    loaderChannel.trigger('page:load');
    Promise.all(this.availableAmendments.map(function(amendmentModel) {
      amendmentModel.set('notice_id', amendmentModel.get('_includeChecked') ? noticeId : null);
      return _.bind(amendmentModel.save, amendmentModel)(amendmentModel.getApiChangesOnly(), { skip_conflict_check: true });
      // NOTE: Conflict check seems to throw errors,
    }))
    .then(() => {
      loaderChannel.trigger('page:load:complete');
      this.close();
      this.model.trigger('refresh:notice:page');
    }, err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.AMENDMENTS.SAVE', () => {
        this.close();
        this.model.trigger('refresh:notice:page');
      });
      handler(err);
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['noticeCreationTypeDisplay', 'noticeFileModels']);

    const noticeId = this.model.get('notice_id');
    this.availableAmendments = new AmendmentCollection(
      amendmentsChannel.request('get:all').filter(
        (amendmentModel) => !amendmentModel.hasAssociatedToNotice() || amendmentModel.isAssociatedToNoticeId(noticeId))
    );

    const parentNoticeId = this.model.get('parent_notice_id');
    this.parentNotice = noticeChannel.request('get:by:id', parentNoticeId);
  },

  onRender() {
    this.showChildView('noticeAmendments', new ModalLinkAmendmentItemsView({
      collection: this.availableAmendments,
      currentNoticeId: this.model.get('notice_id')
    }));
  },

  templateContext() {
    return {
      Formatter,
      parentNoticeTitle: this.parentNotice ? this.parentNotice.getTitleDisplay() : '-',
      hasAvailableAmendments: !!this.availableAmendments.length,
      noticeFileModels: this.noticeFileModels,
      noticeCreationTypeDisplay: this.noticeCreationTypeDisplay
    };
  }
});
