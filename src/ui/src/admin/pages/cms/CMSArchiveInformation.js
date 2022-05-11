import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import ModalAddCMSNote from './ModalAddCMSNote';
import ModalUpdateDMSFileNumber from './ModalUpdateDMSFileNumber';
import template from './CMSArchiveInformation_template.tpl';

const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className:`cms-archive-info-page`,

  ui: {
    archiveRecord: '.cms-archive-record-switch',
    addNote: '.cms-archive-add-note',
    editLink: '.cms-archive-add-edit-link',
    scrollToAudit: '.jump-to-audit',
    scrollToDispute: '.jump-to-dispute',
    scrollToApplicants: '.jump-to-applicants',
    scrollToAgents: '.jump-to-agents',
    scrollToRespondents: '.jump-to-respondents',
    scrollToHearing: '.jump-to-hearing',
    scrollToOutcome: '.jump-to-outcome',
    dmsFileLink: '.cms-archive-dms-file-link.general-link'
  },

  events() {
    return {
      'click @ui.archiveRecord': 'clickArchiveRecord',
      'click @ui.addNote': 'clickAddNote',
      'click @ui.editLink': 'clickEditFileNumber',
      'click @ui.dmsFileLink': 'clickDmsFileLink',
      'click @ui.scrollToDispute': this._scrollToEventFn('#cms-archive-dispute'),
      'click @ui.scrollToApplicants': this._scrollToEventFn('#cms-archive-applicants'),
      'click @ui.scrollToAgents': this._scrollToEventFn('#cms-archive-agents'),
      'click @ui.scrollToRespondents': this._scrollToEventFn('#cms-archive-respondents'),
      'click @ui.scrollToHearing': this._scrollToEventFn('#cms-archive-hearing'),
      'click @ui.scrollToOutcome': this._scrollToEventFn('#cms-archive-outcome'),
      'click @ui.scrollToAudit': this._scrollToEventFn('#cms-archive-audit')
    };
  },

  _scrollToEventFn(ele) {
    return () => $(ele).scrollPageTo({ force_scroll: true, duration: 5 });
  },

  clickDmsFileLink() {
    Backbone.history.navigate(`dispute/${this.model.get('dms_file_guid')}`, {trigger: true});
  },

  clickEditFileNumber() {
    modalChannel.request('add', new ModalUpdateDMSFileNumber({ model: this.model }));
  },

  clickAddNote() {
    modalChannel.request('add', new ModalAddCMSNote({ model: this.model }));
  },

  clickArchiveRecord(e) {
    this.model.trigger('switch:record', Number($(e.currentTarget).attr("id")));
  },

  initialize(options) {
    this.mergeOptions(options, ['CMS_STATUS_DISPLAYS', 'cloneNumber']);
  },

  templateContext() {
    return {
      Formatter,
      Moment,
      CMS_STATUS_DISPLAYS: this.CMS_STATUS_DISPLAYS,
      cloneNumber: this.cloneNumber,
      notes: this.model.get('cms_archive_notes')
    };
  }

});
